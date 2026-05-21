use std::{collections::{HashMap, VecDeque}, fs::{self, File}, io::Read, path::PathBuf, str::FromStr};

use base64::{Engine, engine::general_purpose::STANDARD};
use pdf2image::{PDF, RenderOptionsBuilder, image};
use tauri::{AppHandle, Emitter, Manager};
use serde::{self, Deserialize, Serialize};
use uuid::Uuid;
use crate::{AppState, commands::helpers::{file_type::{FileType, get_file_type}, prompt::get_prompt_config}};

#[derive(Deserialize)]
pub enum Category {
    Base,
    Notes,
    Story,
    Music,
    Comic,
    Coding,
    Presentation
}

#[derive(Serialize)]
struct Input {
    r#type: String,
    data: String,
    mime_type: String
}


#[derive(Serialize, Deserialize, Clone)]
pub enum Model {
    #[serde(rename="gemini-3.5-flash")]
    ThreeFiveFlash,
    #[serde(rename="gemini-3-flash-preview")]
    ThreeFlashPreview,
    #[serde(rename="gemini-3.1-flash-lite")]
    ThreeOneFlashLite,
    #[serde(rename="gemini-2.5-flash")]
    TwoFiveFlash,
    #[serde(rename="gemini-2.5-flash-lite")]
    TwoFiveFlashLite
}

#[derive(Serialize)]
struct Prompt {
    model: Model,
    system_instructions: String,
    input: Vec<Input>
}


#[derive(Deserialize)]
struct Text {
    text: String
}

#[derive(Deserialize)]
struct Content {
    parts: [Text; 1]
}

#[derive(Deserialize)]
struct Candidate {
    content: Content
}

#[derive(Deserialize)]
struct GeminiResponse {
    candidates: [Candidate; 1]
}

#[tauri::command]
pub async fn ocr(app: AppHandle, hash: String, file_paths: HashMap<u8, String>, category: Category, model: Model) -> Result<String, String> {
    
    let state = app.state::<AppState>();
    let key = {
        let stronghold_lock = state.stronghold.lock().map_err(|err| {
            let stmt = String::from("Error getting Stronghold");
            eprintln!("{}: {}", stmt, err);
            stmt
        })?;
    
        let stronghold = stronghold_lock.as_ref().ok_or(
            String::from("No Stronghold found")
        )?;
    
        let client = stronghold.get_client(b"documind")
            .map_err(|err| {
                let stmt = String::from("Error getting client");
                eprintln!("{}: {}", stmt, err);
                stmt
            })?;
    
        let key = client.store().get(&hash.as_bytes().to_vec())
            .map_err(|err| {
                eprintln!("Error getting key from stronghold: {}", err);
                String::from("Error getting key from stronghold")
            })?;
    
        match key {
            None => {
                return Err(String::from(
                    "Key Not found in the Vault, Please try to add it again"
                ));
            }
    
            Some(key) => {
                String::from_utf8(key)
                    .map_err(|err| {
                        let stmt = String::from(
                            "Error getting key from vec from stronghold"
                        );
    
                        eprintln!("{}: {}", stmt, err);
    
                        stmt
                    })?
            }
        }
    };

    let mut webp_queue: VecDeque<PathBuf> = VecDeque::new();
    file_paths.iter().for_each(|file_path| {
        let path = PathBuf::from_str(file_path.1);
        match path {
            Err(err) => {
                eprintln!("Error getting file: {}", err);
                app.emit("error_ocr", format!("file not accessible: {}", file_path.1)).ok();
            }
            Ok(path) => {
                match get_file_type(&path) {
                    Err(err) => {
                        eprintln!("Error getting file type: {}", err);
                        app.emit("error_ocr", format!("error gettong file typr: {:?}", path.to_owned())).ok();
                    }
                    Ok(file_type) => {
                        match file_type {
                            FileType::Image =>{
                                match image::open(&path) {
                                    Err(err) => {
                                        eprintln!("Error opening image: {}", err);
                                        return;
                                    }
                                    Ok(img) => {
                                        let name = match path.file_name() {
                                            None => Uuid::new_v4().to_string(),
                                            Some(name) => name.to_string_lossy().to_string()
                                        };
                                        let webp_path = &state.pdf_images_dir.join(name);
                                        match img.save_with_format(&webp_path, image::ImageFormat::WebP) {
                                            Err(err) => {
                                                eprintln!("Error saving image in webp: {}", err);
                                                app.emit("error_ocr", format!("Error getting pdf from: {:?}", file_path.1.to_owned())).ok();
                                                return;
                                            }
                                            Ok(_) => webp_queue.push_back(webp_path.to_owned()),
                                        };
                                    }
                                };
                            } ,
                            FileType::PDF => {
                                let pdf = match PDF::from_file(&path) {
                                    Err(err) => {
                                        eprintln!("error getting pdf from file: {}", err);
                                        app.emit("error_ocr", format!("Error getting pdf from: {:?}", file_path.1.to_owned())).ok();
                                        return;
                                    }
                                    Ok(pdf) => pdf
                                };

                                let pdf_name = match path.file_name() {
                                    Some(name)   => name.to_string_lossy().to_string(),
                                    None => Uuid::new_v4().to_string()
                                };

                                let pages = match pdf.render(pdf2image::Pages::Range(0..=pdf.page_count()), RenderOptionsBuilder::default().build().expect("Error getting default renfer options")) {
                                    Err(err) => {
                                        eprintln!("Error getting images from the pdf: {}", err);
                                        app.emit("error_ocr", format!("Error parsing images from pdf: {}", err.to_string())).ok();
                                        return;
                                    }
                                    Ok(pages) => pages
                                };

                                let pdf_dir = &state.pdf_images_dir.join(pdf_name);
                                fs::create_dir_all(pdf_dir).ok();
                                for page in pages {
                                    let file_name = match &path.file_name() {
                                        None => Uuid::new_v4().to_string(),
                                        Some(name) => name.to_string_lossy().to_string()
                                    };
                                    let img_dir = pdf_dir.join(file_name);
                                    match page.save_with_format(&img_dir, pdf2image::image::ImageFormat::WebP) {
                                        Err(err) => {
                                            eprintln!("Error saving image: {}", err);
                                            continue;
                                        }
                                        Ok(_) => webp_queue.push_back(img_dir),
                                    };
                                }

                            },
                        };
                    }
                }
            }
        }
    });

    let mut ocr_text = String::from("");
    let system_instructions = get_prompt_config(category);

    if webp_queue.is_empty() {
        return Err(String::from("Nothing Found for ocr"));
    }

    'requester: loop {
        let input_vec: Vec<Input> = (0..5)
            .filter_map(|_| {
                match webp_queue.pop_front() {
                    None => return None,
                    Some(path) => {
                        match File::open(path) {
                            Err(err) => {
                                eprintln!("Error opeining file: {}", err);
                                return None;
                            }
                            Ok(mut file) => {
                                let mut buffer = Vec::new();
                                match file.read_to_end(&mut buffer) {
                                    Err(err) => {
                                        eprintln!("Error reading file to buffer: {}", err);
                                        return None;
                                    }
                                    Ok(_) => {
                                        return Some(Input { r#type: String::from("image"), data: STANDARD.encode(buffer), mime_type: String::from("image/webp") });
                                    }
                                };
                            }
                        }
                    }
                }
            }).collect();

            let client = reqwest::Client::new();
            let res = client
                .post("https://generativelanguage.googleapis.com/v1beta/interactions")
                .header("x-goog-api-key", &key)
                .header("Content-Type", "application/json")
                .header("Api-Revision", "2026-05-20")
                .json(&Prompt {
                    model: model.clone(),
                    system_instructions: system_instructions.clone(),
                    input: input_vec
                })
                .send()
                .await;

            match res {
                Err(err) => {
                    let stmt = format!("Error getting response from gemini: {}", err);
                    eprintln!("{}", &stmt);
                    app.emit("error_ocr", stmt).ok();
                    continue;
                }
                Ok(response) => {
                    match response.json::<GeminiResponse>().await {
                        Ok(data) => {
                            ocr_text.push_str(&data.candidates[0].content.parts[0].text);
                        }
                        Err(err) => {
                            eprintln!("Error from Gemini: {}", err);
                            app.emit("error_ocr", format!("err from gemini: {}", err)).ok();
                        }
                    }
                }
            }
            
            if webp_queue.is_empty() {
                break 'requester
            }
        
    };

    if ocr_text.trim().is_empty() {
        return Err(String::from("Error OCR Found Empty"));
    }
    
    let id = Uuid::new_v4().to_string();
    let db = state.db.clone();
    let ocr_clone = ocr_text.clone();
    sqlx::query!(r#"
        INSERT INTO ocr_text (id, text)
        VALUES ($1, $2)
    "#,
    id,
    ocr_clone
    )
    .execute(&db)
    .await.ok();

    Ok(ocr_text)
}
            
