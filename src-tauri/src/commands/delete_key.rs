use crate::AppState;
use iota_stronghold::SnapshotPath;
use tauri::{AppHandle, Manager};

#[tauri::command]
pub async fn delete_key(app: AppHandle, hash: String) -> Result<(), String> {
    let state = app.state::<AppState>();
    let db = state.db.clone();
    let mut tx = db.begin().await.map_err(|err| {
        let stmt = String::from("Error getting tx while deleteing key");
        eprintln!("{}: {}", stmt, err);
        stmt
    })?;

    sqlx::query!(
        r#"
        DELETE FROM gemini_keys
        WHERE hash = $1
    "#,
        hash
    )
    .execute(&mut *tx)
    .await
    .map_err(|err| {
        let stmt = String::from("Error deleteing in database");
        eprintln!("{}: {}", stmt, err);
        stmt
    })?;

    {
        let mut stronghold_lock = state.stronghold.lock().map_err(|err| {
            let stmt = String::from("Error getting lock on stronghold");
            eprintln!("{}: {}", stmt, err);
            stmt
        })?;
        let stronghold = stronghold_lock
            .as_mut()
            .ok_or(String::from("Stronghold not initialized"))?;
        let mut client = state.client.lock().map_err(|err| {
            let stmt = String::from("Error getting lock on client");
            eprintln!("{}: {}", stmt, err);
            stmt
        })?;

        let client = client
            .as_mut()
            .ok_or(String::from("Client not initialized"))?;
        client
            .store()
            .delete(&hash.as_bytes().to_vec())
            .map_err(|err| {
                let stmt = String::from("Error deleting key from stronghold");
                eprintln!("{}: {}", stmt, err);
                stmt
            })?;
        let local_data_dir = state.local_data_dir.clone();
        let vault_path = local_data_dir.join("vault.hold");
        let snapshot = SnapshotPath::from_path(&vault_path);

        let key = state.key_provider.lock().map_err(|err| {
            let stmt = String::from("Error reading keyprovider");
            eprintln!("{}: {}", stmt, err);
            stmt
        })?;
        let key_provider = key.as_ref().unwrap();

        stronghold
            .commit_with_keyprovider(&snapshot, &key_provider)
            .map_err(|err| {
                let stmt = String::from("Error Commiting to snapshot");
                eprintln!("{}: {}", stmt, err);
                stmt
            })?;
    }

    tx.commit().await.map_err(|err| {
        let stmt = String::from("Error commiting transaction delete key");
        eprintln!("{}: {}", stmt, err);
        stmt
    })?;
    Ok(())
}
