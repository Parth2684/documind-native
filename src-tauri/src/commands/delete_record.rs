use std::{fs, path::PathBuf};

use sqlx::{Pool, Sqlite};
use tauri::{AppHandle, Manager};

use crate::AppState;

async fn delete_ocr(ocr_id: &str, db: &Pool<Sqlite>) -> Result<(), String> {
    sqlx::query!(
        r#"
        DELETE FROM ocr_text 
        WHERE id = $1
    "#,
        ocr_id
    )
    .execute(db)
    .await
    .map_err(|err| {
        let stmt = String::from("Error deleting ocr record");
        eprintln!("{}: {}", stmt, err);
        stmt
    })?;
    Ok(())
}

async fn delete_tts(tts_id: &str, db: &Pool<Sqlite>) -> Result<(), String> {
    sqlx::query!(
        r#"
        DELETE FROM tts 
        WHERE id = $1
    "#,
        tts_id
    )
    .execute(db)
    .await
    .map_err(|err| {
        let stmt = String::from("Error deleting tts record");
        eprintln!("{}: {}", stmt, err);
        stmt
    })?;
    Ok(())
}

#[tauri::command]
pub async fn delete_record(
    app: AppHandle,
    ocr_id: Option<String>,
    tts_id: Option<String>,
    delete_from_fs: Option<String>,
) -> Result<(), String> {
    let db = { app.state::<AppState>().db.clone() };
    match ocr_id {
        None => (),
        Some(id) => delete_ocr(&id, &db).await?,
    }
    match tts_id {
        None => (),
        Some(id) => {
            delete_tts(&id, &db).await?;
        }
    }

    match delete_from_fs {
        None => (),
        Some(path) => {
            let path = PathBuf::from(path);
            if !path.exists() {
                return Err(String::from("File does not exist"));
            }
            fs::remove_file(path).map_err(|err| {
                let stmt = String::from("Error deleting file from file system");
                eprintln!("{}: {}", stmt, err);
                stmt
            })?;
        }
    }
    Ok(())
}
