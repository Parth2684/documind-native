use tauri::{AppHandle, Manager};

use crate::AppState;

#[tauri::command]
pub async fn check_vault(app: AppHandle) -> Result<bool, String> {
    let state = app.state::<AppState>();
    let db = state.db.clone();
    let exists = sqlx::query!(
        r#"
            SELECT * FROM vault
            WHERE id = 1
        "#
    )
    .fetch_optional(&db)
    .await
    .map_err(|err| {
        let stmt = String::from("error receiveing response from database if the vault exists");
        eprintln!("{}: {}", stmt, err);
        stmt
    })?;

    match exists {
        None => Ok(false),
        Some(exist) => {
            if exist.present {
                Ok(true)
            } else {
                Ok(false)
            }
        }
    }
}
