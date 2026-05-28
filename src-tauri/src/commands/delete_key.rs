use tauri::{AppHandle, Manager};
use crate::AppState;



#[tauri::command]
pub async fn delete_key (app: AppHandle, hash: String) -> Result<(), String> {
    let state = app.state::<AppState>();
    let db = state.db.clone();
    let mut tx = db.begin().await
        .map_err(|err| {
            let stmt = String::from("Error getting tx while deleteing key");
            eprintln!("{}: {}",stmt, err);
            stmt
        })?;
    
    sqlx::query!(r#"
        DELETE FROM gemini_keys
        WHERE hash = $1
    "#, hash)
    .execute(&mut *tx)
    .await
    .map_err(|err| {
        let stmt = String::from("Error deleteing in database");
        eprintln!("{}: {}", stmt, err);
        stmt
    })?;
    
    {
        let mut stronghold_lock = state.stronghold.lock()
            .map_err(|err| {
                let stmt = String::from("Error getting lock on stronghold");
                eprintln!("{}: {}", stmt, err);
                stmt
            })?;
        let stronghold = stronghold_lock.as_mut()
            .ok_or(String::from("Stronghold not initialized"))?;
        let client = stronghold.get_client(b"documind").map_err(|err| {
            eprintln!("Error getting stronghold client: {}", err);
            String::from("Error getting stronghold client")
        })?;

        client.store().delete(&hash.as_bytes().to_vec())
            .map_err(|err| {
                let stmt = String::from("Error deleting key from stronghold");
                eprintln!("{}: {}", stmt, err);
                stmt
            })?;
    }

    tx.commit()
        .await.map_err(|err| {
            let stmt = String::from("Error commiting transaction delete key");
            eprintln!("{}: {}", stmt, err);
            stmt
        })?;
    Ok(())
}