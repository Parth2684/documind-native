use std::collections::HashMap;

use chrono::{Local, NaiveDateTime, TimeZone, Utc};
use serde::Serialize;
use tauri::{AppHandle, Manager};

use crate::AppState;

#[derive(Serialize)]
pub struct Text {
    id: String,
    text: String,
    created_at: NaiveDateTime,
}

#[derive(Serialize)]
pub struct Audio {
    id: String,
    path: String,
    created_at: NaiveDateTime,
    time: f64,
    ocr_id: String,
}

#[derive(Serialize)]
pub struct History {
    text: Text,
    audio: Vec<Audio>,
}

fn utc_to_local(time: &NaiveDateTime) -> NaiveDateTime {
    Utc.from_utc_datetime(time)
        .with_timezone(&Local)
        .naive_local()
}

#[tauri::command]
pub async fn history(app: AppHandle) -> Result<HashMap<String, History>, String> {
    let db = { app.state::<AppState>().db.clone() };

    let tts_ocr = sqlx::query!(
        r#"
        SELECT
            o.id,
            o.text,
            o.created_at,

            t.id as tts_id,
            t.created_at as tts_created_at,
            t.time,
            t.ocr_id,
            t.path

        FROM ocr_text o
        LEFT JOIN tts t ON t.ocr_id = o.id
        ORDER BY MAX(o.created_at, COALESCE(t.created_at, o.created_at)) DESC
    "#
    )
    .fetch_all(&db)
    .await;

    let tts_ocr = tts_ocr.map_err(|err| {
        let stmt = String::from("Error getting tts with ocr relation");
        eprintln!("{}: {}", stmt, err);
        stmt
    })?;

    let mut his: HashMap<String, History> = HashMap::new();
    tts_ocr.into_iter().for_each(|h| {
        let exists = his.get(&h.id);
        if let Some(_) = exists {
            if let (Some(tts_id), Some(path), Some(tts_created_at), Some(time), Some(ocr_id)) =
                (h.tts_id, h.path, h.tts_created_at, h.time, h.ocr_id)
            {
                let entry = his.get_mut(&h.id).unwrap();
                entry.audio.push(Audio {
                    id: tts_id,
                    path: path,
                    created_at: utc_to_local(&tts_created_at),
                    time: time,
                    ocr_id: ocr_id,
                });
            }
        } else {
            if let (Some(tts_id), Some(path), Some(tts_created_at), Some(time), Some(ocr_id)) =
                (h.tts_id, h.path, h.tts_created_at, h.time, h.ocr_id)
            {
                his.insert(
                    h.id.clone(),
                    History {
                        text: Text {
                            id: h.id,
                            text: h.text,
                            created_at: utc_to_local(&h.created_at),
                        },
                        audio: vec![Audio {
                            id: tts_id,
                            path: path,
                            created_at: utc_to_local(&tts_created_at),
                            ocr_id: ocr_id,
                            time: time,
                        }],
                    },
                );
            } else {
                his.insert(
                    h.id.clone(),
                    History {
                        text: Text {
                            id: h.id,
                            text: h.text,
                            created_at: utc_to_local(&h.created_at),
                        },
                        audio: vec![],
                    },
                );
            }
        }
    });

    Ok(his)
}
