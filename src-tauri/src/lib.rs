use std::{fs, path::PathBuf, sync::Mutex};

use iota_stronghold::Stronghold;

use sqlx::{
    Pool, Sqlite, migrate::{Migrator}, sqlite::{SqliteConnectOptions, SqlitePoolOptions}
};
use tauri::Manager;

mod commands;

use commands::{check_vault::check_vault, unlock_vault::unlock_vault, insert_key::insert_keys, ocr::ocr, tts::tts};

struct AppState {
    db: Pool<Sqlite>,
    local_data_dir: PathBuf,
    stronghold: Mutex<Option<Stronghold>>,
    pdf_images_dir: PathBuf,
    tts_dir: PathBuf
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub async fn run() {
    static MIGRATOR: Migrator = sqlx::migrate!("./migrations");

    let local_data_dir = dirs::data_local_dir()
        .expect("Error getting Local Data Directory")
        .join("com.parth.documind");
    if !local_data_dir.exists() {
        fs::create_dir_all(&local_data_dir).expect("Error creating local data directory");
    }

    let db_path = &local_data_dir.join("data.db");

    let connect_options = SqliteConnectOptions::new()
        .create_if_missing(true)
        .filename(db_path);

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .min_connections(1)
        .connect_with(connect_options)
        .await
        .expect("Error connecting to database");

    MIGRATOR.run(&pool).await.expect("Error Migrating Database");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let local_data_dir = app
                .path()
                .app_local_data_dir()
                .expect("Local Data Dir Not accessible");
            if !local_data_dir.exists() {
                fs::create_dir_all(&local_data_dir).expect("Error Creating App Local Data Folder");
            }

            let pdf_images_dir = app.path().app_cache_dir().expect("Cache dir is not accessible").join("pdfs");
            if !pdf_images_dir.exists() {
                fs::create_dir_all(&pdf_images_dir).expect("Error creating cache dir");
            }

            let tts_dir = match app.path().audio_dir() {
                Err(err) => {
                    eprintln!("Error acessing audio dir: {}", err);
                    panic!("Erorr acessing audio dir");
                }
                Ok(dir) => {
                    let tts_dir = dir.join("Documind");
                    if !tts_dir.exists() {
                        match fs::create_dir_all(&dir) {
                            Err(err) => {
                                eprintln!("Error creating audio dir: {}", err);
                                panic!("Error creating audio dir")
                            }
                            Ok(_) => dir
                        }
                    }else {
                        tts_dir
                    }
                }
            };
            
            
            app.manage(AppState { 
                db: pool,
                local_data_dir,
                stronghold: Mutex::new(None),
                pdf_images_dir,
                tts_dir
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![check_vault, unlock_vault, insert_keys, ocr, tts])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
