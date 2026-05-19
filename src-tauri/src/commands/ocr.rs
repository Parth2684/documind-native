use std::{collections::HashMap, path::PathBuf, str::FromStr};

use iota_stronghold::Location;
use pdf2image::{PDF, RenderOptionsBuilder};
use tauri::{AppHandle, Emitter, Manager};
use serde::{Deserialize, Serialize};
use crate::{AppState, commands::helpers::file_type::{FileType, get_file_type}};

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
struct Message {
    text: String
}
#[derive(Serialize)]
struct SystemInstruction {
    parts: [Message; 1]
}

#[derive(Serialize)]
struct Content {
    role: String,
    parts: [Message; 1]
}


#[derive(Serialize)]
struct Prompt {
    system_instruction: SystemInstruction,
    contents: Content
}

pub async fn ocr(app: AppHandle, hash: String, file_paths: HashMap<u8, String>, category: Category) -> Result<String, String> {
    let state = app.state::<AppState>();
    let stronghold_lock = state.stronghold.lock().map_err(|err| {
        let stmt = String::from("Error getting Stringhold");
        eprintln!("{}: {}", stmt, err);
        stmt
    })?;
    let db = state.db.clone();

    let stronghold = stronghold_lock.as_ref();
    match stronghold {
        None => {
            return Err(format!("No Stronghold found"));
        }
        Some(hold) => {
            let client = hold.get_client(b"documind")
                .map_err(|err| {
                    let stmt = String::from("Error getting client");
                    eprintln!("{}: {}", stmt, err);
                    stmt
                })?;

            // let location = Location::generic("gemini_keys", hash);

            let key = client.store().get(&hash.as_bytes().to_vec())
                .map_err(|err| {
                    eprintln!("eerror getting key from stronghold: {}", err);
                    String::from("Error getting key from stronghold")
                })?;
            match key {
                None => {
                    sqlx::query!(r#"
                        DELETE FROM gemini_keys
                        WHERE hash = $1
                    "#, hash)
                    .execute(&db)
                    .await.ok();
                    return Err(String::from("Key Not found in the Vault, Please try to add it again"))
                }
                Some(key) => {
                    let key = String::from_utf8(key)
                        .map_err(|err| {
                            let stmt = String::from("Error getting key from vec from stronghold");
                            eprintln!("{}: {}", stmt, err);
                           stmt
                        })?;

                    let mut images: HashMap<u8, PathBuf> = HashMap::new();
                    let mut pdfs: HashMap<u8, PathBuf> =  HashMap::new();
                    file_paths.iter().for_each(|file_path| {
                        let path = PathBuf::from_str(file_path.1);
                        match path {
                            Err(err) => {
                                eprintln!("Error getting file: {}", err);
                                app.emit("error_file_not_found", file_path.to_owned()).ok();
                            }
                            Ok(path) => {
                                match get_file_type(&path) {
                                    Err(err) => {
                                        eprintln!("Error getting file type: {}", err);
                                        app.emit("error_file_type", path.to_owned()).ok();
                                    }
                                    Ok(file_type) => {
                                        match file_type {
                                            FileType::Image => images.insert(file_path.0.to_owned(), path.to_owned()),
                                            FileType::PDF => pdfs.insert(file_path.0.to_owned(), path.to_owned()),
                                        };
                                    }
                                }
                            }
                        }
                    });
                    
                    if !pdfs.is_empty() {
                        pdfs.iter().for_each(|pdf| {
                            let pdf = match PDF::from_file(pdf.1) {
                                Err(err) => {
                                    eprintln!("error getting pdf from file: {}", err);
                                    app.emit("error_getting_pdf", format!("Error getting pdf from: {:?}", pdf.1.to_owned())).ok();
                                    return;
                                }
                                Ok(pdf) => pdf
                            };

                            let number_of_pages = pdf.page_count();
                            let pages = match pdf.render(pdf2image::Pages::Range(0..=pdf.page_count()), RenderOptionsBuilder::default().build().expect("Error getting default renfer options")) {
                                Err(err) => {
                                    eprintln!("Error getting images from the pdf: {}", err);
                                    app.emit("pdf_error", format!("Error parsing images from pdf: {}", pdf.1.to_owned())).ok();
                                    return;
                                }
                                Ok(pages) => pages
                            };

                            for page in pages {
                                
                            }
                            
                        });
                    }
                    
                    Ok("".into())

                }
            }
        }
    }

}
