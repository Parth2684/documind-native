use blake3::hash;
use chrono::Local;
use iota_stronghold::{Location, SnapshotPath, procedures::WriteVault};
use tauri::{AppHandle, Manager};
use zeroize::Zeroizing;

use crate::AppState;



#[tauri::command]
pub async fn insert_keys(app: AppHandle, name: String, key: String) -> Result<(), String> {
    let hash = hash(key.as_bytes()).to_string();
    let state = app.state::<AppState>();
    let db = state.db.clone();

    let (hash_exists, name_exists) = tokio::join!(
        sqlx::query!(r#"
            SELECT * FROM gemini_keys
            WHERE hash = $1
        "#, hash)
        .fetch_optional(&db),
        sqlx::query!(r#"
            SELECT * FROM gemini_keys 
            WHERE name = $1
        "#, name)
        .fetch_optional(&db)
    );
    match (hash_exists, name_exists) {
        (Ok(None), Ok(None)) => {
            let mut tx = db.begin().await.map_err(|_| {
                String::from("Error getting transaction from db")
            })?;
            sqlx::query!(r#"
                INSERT INTO gemini_keys (hash, name)
                VALUES ($1, $2)
            "#, hash, name)
            .execute(&mut *tx)
            .await
            .map_err(|err| {
                let stmt = String::from("Error Inserting key into db");
                eprintln!("{}: {}", stmt, err);
                stmt
            })?;

            {
                let mut stronghold_lock = state.stronghold.lock().map_err(|_| {
                    String::from("Could not access stronghold")
                })?;
                let stronghold = stronghold_lock.as_mut().ok_or(String::from("Stronghold not initialized"))?;
    
                let client = stronghold.get_client(b"documind")
                    .map_err(|err| {
                        eprintln!("Error getting stronghold client: {}", err);
                        String::from("Error getting stronghold client")
                    })?;
    
                let location = Location::generic("gemini_keys", name);
    
                client.execute_procedure(WriteVault {
                    data: Zeroizing::new(key.as_bytes().to_vec()),
                    location
                })
                .map_err(|err| {
                    eprintln!("Error storing data in vault: {}", err);
                    String::from("Error Storing data in vault")
                })?;
    
                let local_data_dir = state.local_data_dir.clone();
                let vault_path = local_data_dir.join("vault.hold");
                let snapshot = SnapshotPath::from_path(&vault_path);
    
    
                stronghold.commit(&snapshot)
                    .map_err(|err| {
                        let stmt = String::from("Error Commiting to snapshot");
                        eprintln!("{}: {}", stmt, err);
                        stmt
                    })?;
            }
            tx.commit().await.map_err(|err| {
                let stmt = String::from("Error commiting key metadata to db");
                eprintln!("{}: {}", stmt, err);
                stmt
            })?;
        }
        (Ok(Some(_)), Ok(None)) => {
            return Err(String::from("gemini key exists with different name"))
        }
        (Ok(None), Ok(Some(_))) => {
            return Err(String::from("Different key with same name exists"))
        }
        (Ok(Some(_)), Ok(Some(_))) => {
            return Err(String::from("the key exists"))
        }
        (_, _) => {
            return Err(String::from("Error connecting with db"))
        }
    }
    Ok(())
}