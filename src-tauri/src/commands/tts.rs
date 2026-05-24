use std::{time::Instant};

use tauri::{AppHandle, Manager};
use tts_rs::{SynthesisEngine, engines::kokoro::{KokoroEngine, KokoroInferenceParams}};
use uuid::Uuid;

use crate::AppState;



#[tauri::command]
pub async fn tts(app: AppHandle, text: String, voice: String, speed: f32, text_id: Option<String>) -> Result<String, String> {
    let start = Instant::now();
    let resources_dir = app
        .path()
        .resource_dir()
        .expect("Error Parsinf Resources Directory");
    if !resources_dir.exists() {
        panic!("Resource Directory was not found. Please re-install the application")
    }
    
    let tts_model_path = resources_dir
        .join("models");
    
    if !tts_model_path.exists() {
        panic!("TTS Model Does Not Exists, Please re-install the application");
    }

    let voices_path = resources_dir.join("models").join("voices-v1.0.bin");
    if !voices_path.exists() {
        panic!("Voices Bin not found. Please re install the app");
    }

    let state = app.state::<AppState>();
    let (local_data_dir, tts_dir, db) = {
        (state.local_data_dir.clone(), state.tts_dir.clone(), state.db.clone())
    };

    // let text = sqlx::query!(r#"
    //     SELECT id, text from ocr_text
    //     WHERE id = $1
    //     "#,
    //     text_id)
    // .fetch_one(&db)
    // .await
    // .map_err(|err| {
    //     let stmt = String::from("Error finding text from db");
    //     eprintln!("{}: {}", stmt, err);
    //     stmt
    // })?;
    
    let mut engine = KokoroEngine::new();

    engine.load_model(&tts_model_path)
        .map_err(|err| {
            eprintln!("error loding engine: {}", err);
            String::from("Error loading TTS Model")
        })?;
    let wav_path = &tts_dir.join(format!("{}.wav", Uuid::new_v4()));
    engine.synthesize_to_file(&text, wav_path, Some(KokoroInferenceParams { voice, speed, style_index: None }))
        .map_err(|err| {
            let stmt = String::from("Error making a audio file");
            eprintln!("{}: {}", stmt, err);
            stmt
        })?;
    engine.unload_model();
    let elapsed = start.elapsed().as_secs_f32();
    let id = Uuid::new_v4().to_string();
    let wav_path = wav_path.to_string_lossy().to_string();
    sqlx::query!(r#"
        INSERT INTO tts (id, path, ocr_id, time)
        VALUES ($1, $2, $3, $4)
    "#, 
    id,
    wav_path,
    text_id,
    elapsed
    )
    .execute(&db)
    .await.ok();
    
    Ok(wav_path)
}