use chrono::{Local, NaiveDateTime, TimeZone, Utc};
use serde::Serialize;
use tauri::{AppHandle, Manager};

use crate::AppState;

#[derive(Serialize)]
pub struct Text {
    id: String,
    text: String,
    created_at: Option<NaiveDateTime> ,
}

#[derive(Serialize)]
pub struct Audio {
    id: String,
    path: String,
    created_at: Option<NaiveDateTime> ,
    time: f64,
    ocr_id: Option<String>
}

#[derive(Serialize)]
pub struct History {
    created_at: NaiveDateTime,
    text: Option<Text>,
    audio: Option<Audio>,
}

fn utc_to_local(time: &NaiveDateTime) -> NaiveDateTime {
    Utc.from_utc_datetime(time).with_timezone(&Local).naive_local()
}

#[tauri::command]
pub async fn history(app: AppHandle) -> Result<Vec<History>, String> {
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

    let mut history: Vec<History> = Vec::new();
    tts_ocr.into_iter().for_each(|to| {
        let created_at = utc_to_local(&to.tts_created_at.unwrap());
        history.push(History { created_at, text: Some(Text {
            id: to.id,
            text: to.text,
            created_at: Some(utc_to_local(&to.created_at.unwrap()))
        }), audio: Some(Audio {
            id: to.tts_id,
            path: to.path,
            created_at: Some(created_at),
            time: to.time,
            ocr_id: to.ocr_id
        }) });
    });

    tts.into_iter().for_each(|t| {
        let created_at = utc_to_local(&t.created_at.unwrap());
        history.push(History { created_at, text: None, audio: Some(Audio {
            id: t.id,
            path: t.path,
            created_at: Some(created_at),
            time: t.time,
            ocr_id: None
        }) });
    });

    ocr.into_iter().for_each(|o| {
        let created_at = utc_to_local(&o.created_at.unwrap());
        history.push(History { created_at, text: Some(Text {
            id: o.id,
            created_at: Some(created_at),
            text: o.text
        }), audio: None });
    });

    history.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    Ok(history)
}
