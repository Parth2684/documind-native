use iota_stronghold::Location;
use tauri::{AppHandle, Manager};

use crate::AppState;




pub async fn ocr(app: AppHandle, hash: String, file_path: String) -> Result<String, String> {
    let state = app.state::<AppState>();
    let stronghold_lock = state.stronghold.lock().map_err(|err| {
        let stmt = String::from("Error getting Stringhold");
        eprintln!("{}: {}", stmt, err);
        stmt
    })?;
    let db = state.db.clone();
    
    let stronghold = stronghold_lock.as_ref();
    match stronghold {
        None => {
            return Err(format!("No Stronghold found"));
        }
        Some(hold) => {
            let client = hold.get_client(b"documind")
                .map_err(|err| {
                    let stmt = String::from("Error getting client");
                    eprintln!("{}: {}", stmt, err);
                    stmt
                })?;

            // let location = Location::generic("gemini_keys", hash);

            let key = client.store().get(&hash.as_bytes().to_vec())
                .map_err(|err| {
                    eprintln!("eerror getting key from stronghold: {}", err);
                    String::from("Error getting key from stronghold")
                })?;
            match key {
                None => {
                    sqlx::query!(r#"
                        DELETE FROM gemini_keys
                        WHERE hash = $1
                    "#, hash)
                    .execute(&db)
                    .await.ok();
                    return Err(String::from("Key Not found in the Vault, Please try to add it again"))
                }
                Some(key) => {
                    let key = String::from_utf8(key)
                        .map_err(|err| {
                            let stmt = String::from("Error getting key from vec from stronghold");
                            eprintln!("{}: {}", stmt, err);
                           stmt
                        })?;
                }
            }
        }
    }
    
    Ok("".into())
}