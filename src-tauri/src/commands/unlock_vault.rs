use iota_stronghold::{KeyProvider, SnapshotPath, Stronghold};
use tauri::{AppHandle, Manager};
use zeroize::Zeroizing;

use crate::AppState;



#[tauri::command]
pub fn unlock_vault(password: String, app: AppHandle) -> Result<(), String> {
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
        stronghold
            .commit_with_keyprovider(&snapshot, &key_provider)
            .map_err(|err| {
                let error = format!("Error Creating Vault: {:?}", err);
                eprintln!("{}", error);
                error
            })?;
        stronghold.create_client(b"documind")
            .map_err(|err| {
                eprintln!("error creating stronghold client: {}", err);
                String::from("Error creating stronghold client")
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