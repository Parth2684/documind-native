use iota_stronghold::{KeyProvider, SnapshotPath, Stronghold};
use tauri::{AppHandle, Manager};
use zeroize::Zeroizing;

use crate::AppState;



#[tauri::command]
pub async fn unlock_vault(password: String, app: AppHandle) -> Result<(), String> {
    let state = app.state::<AppState>();
    let local_data_dir = state.local_data_dir.clone();

    let vault_path = local_data_dir.join("vault.hold");

    let stronghold = Stronghold::default();

    let key_provider = KeyProvider::try_from(
            Zeroizing::new(password.as_bytes().to_vec())
    ).map_err(|err| {
        let stmt = String::from("Error converting password to key provider");
        eprintln!("{}: {}", stmt, err);
        stmt
    })?;

    let snapshot = SnapshotPath::from_path(&vault_path);

    if vault_path.exists() {
        stronghold
            .load_snapshot(&key_provider, &snapshot)
            .map_err(|err| {
                let error = format!("Error Connecting to Vault: {:?}", err);
                eprintln!("{}", error);
                error
            })?;
    }else {
        
        let db = state.db.clone();
        let mut tx = db.begin().await.map_err(|_| {
            String::from("Error getting transaction from db")
        })?;

        sqlx::query!(r#"
            INSERT INTO vault (id, present)
            VALUES (1, 1)
        "#)
        .execute(&mut *tx)
        .await.map_err(|err| {
            let stmt = String::from("Error adding vault presense to db");
            eprintln!("{}: {}", stmt, err);
            stmt
        })?;
        stronghold.create_client(b"documind")
            .map_err(|err| {
                eprintln!("error creating stronghold client: {}", err);
                String::from("Error creating stronghold client")
            })?;
        stronghold
            .commit_with_keyprovider(&snapshot, &key_provider)
            .map_err(|err| {
                let error = format!("Error Creating Vault: {:?}", err);
                eprintln!("{}", error);
                error
            })?;

        tx.commit().await.map_err(|err| {
            let stmt = String::from("Error commiting vault to db");
            eprintln!("{}: {}", stmt, err);
            stmt
        })?;
    }
    let mut hold = state
        .stronghold
        .lock()
        .map_err(|err| {
            let stmt = String::from("Error loading stronghold in memory");
            eprintln!("{}: {}", stmt, err);
            stmt
        })?;
    
    *hold = Some(stronghold);
    
    Ok(())
}