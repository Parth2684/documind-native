use serde::Serialize;
use sqlx::prelude::FromRow;
use tauri::{AppHandle, Manager};

use crate::AppState;

#[derive(FromRow, Serialize)]
pub struct Key {
    hash: String,
    name: String,
}

#[tauri::command]
pub async fn get_meta(app: AppHandle) -> Result<Vec<Key>, String> {
    let db = app.state::<AppState>().db.clone();
    let key = sqlx::query_as!(
        Key,
        r#"
        SELECT name, hash FROM gemini_keys
    "#
    )
    .fetch_all(&db)
    .await
    .map_err(|err| {
        eprintln!("Error retreiving gemini keys from database: {}", err);
        String::from("Error getting your keys")
    })?;

    Ok(key)
}
