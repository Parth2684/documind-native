use std::time::Instant;

use tauri::{AppHandle, Manager};
use tts_rs::{engines::kokoro::KokoroInferenceParams, SynthesisEngine};
use uuid::Uuid;

use crate::AppState;

#[tauri::command]
pub async fn tts(
    app: AppHandle,
    text: String,
    voice: String,
    speed: f32,
) -> Result<String, String> {
    let start = Instant::now();

    let state = app.state::<AppState>();
    let (tts_dir, db) = { (state.tts_dir.clone(), state.db.clone()) };

    let wav_path = &tts_dir.join(format!("{}.wav", Uuid::new_v4()));
    {
        let mut engine = match state.tts_engine.lock() {
            Err(err) => {
                let stmt = String::from("Error getting lock on the mutex of tts engine");
                eprintln!("{}: {}", stmt, err);
                return Err(stmt);
            }
            Ok(eng) => eng,
        };
        let voice_clone = voice.clone();
        engine
            .synthesize_to_file(
                &text,
                wav_path,
                Some(KokoroInferenceParams {
                    voice: voice_clone,
                    speed,
                    style_index: None,
                }),
            )
            .map_err(|err| {
                let stmt = String::from("Error making a audio file");
                eprintln!("{}: {}", stmt, err);
                stmt
            })?;
    }

    let id = Uuid::new_v4().to_string();
    let ocr_id = sqlx::query!(
        r#"
        INSERT INTO ocr_text (id, text)
        VALUES ($1, $2)
        ON CONFLICT (text) 
        DO UPDATE SET text = excluded.text
        RETURNING id
    "#,
        id,
        text
    )
    .fetch_one(&db)
    .await
    .map_err(|err| {
        let stmt = String::from("Error getting a text entry");
        eprintln!("{}: {}", stmt, err);
        stmt
    })?;
    let elapsed = start.elapsed().as_secs_f32();
    let id = Uuid::new_v4().to_string();
    let wav_path = wav_path.to_string_lossy().to_string();
    sqlx::query!(
        r#"
        INSERT INTO tts (id, path, ocr_id, time, voice, speed)
        VALUES ($1, $2, $3, $4, $5, $6)
    "#,
        id,
        wav_path,
        ocr_id.id,
        elapsed,
        voice,
        speed
    )
    .execute(&db)
    .await
    .ok();

    Ok(wav_path)
}
