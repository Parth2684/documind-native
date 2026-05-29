use std::collections::HashSet;

use chrono::{Local, NaiveDateTime, TimeZone, Utc};
use serde::Serialize;
use tauri::{AppHandle, Manager};

use crate::AppState;

#[derive(Serialize)]
struct Text {
    id: String,
    text: String,
    created_at: Option<NaiveDateTime> ,
}

#[derive(Serialize)]
struct Audio {
    id: String,
    path: String,
    created_at: Option<NaiveDateTime> ,
    time: f64,
    ocr_id: Option<String>
}

#[derive(Serialize)]
struct History {
    created_at: NaiveDateTime,
    text: Option<Text>,
    audio: Option<Audio>,
}

pub async fn history(app: AppHandle) -> Result<(), String> {
    let db = { app.state::<AppState>().db.clone() };

    let (tts_ocr, tts, ocr) = tokio::join!(sqlx::query!(r#"
        SELECT t.id as tts_id, t.created_at as tts_created_at, t.time, t.ocr_id, t.path, o.id, o.text, o.created_at
        FROM tts t
        INNER JOIN ocr_text o ON o.id = t.ocr_id 
    "#).fetch_all(&db)
    ,
    sqlx::query!(r#"
        SELECT * FROM tts
        WHERE ocr_id IS null
    "#).fetch_all(&db)
    ,
    sqlx::query!(r#"
        SELECT o.id, o.text, o.created_at
        FROM ocr_text o
        LEFT JOIN tts t ON t.ocr_id = o.id
        WHERE t.id is NULL
    "#).fetch_all(&db)
    );
    
    let tts_ocr = tts_ocr 
        .map_err(|err| {
            let stmt = String::from("Error getting tts with ocr relation");
            eprintln!("{}: {}", stmt, err);
            stmt
        })?;

    let tts = tts 
        .map_err(|err| {
            let stmt = String::from("Error getting tts with no ocr relation");
            eprintln!("{}: {}", stmt, err);
            stmt
        })?;

    let ocr = ocr
        .map_err(|err| {
            let stmt = String::from("Error getting ocr with no relation");
            eprintln!("{}: {}", stmt, err);
            stmt
        })?;
    
    Ok(())
}
