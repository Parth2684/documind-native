use std::{fs, path::PathBuf, sync::Mutex};

use iota_stronghold::{KeyProvider, Stronghold};

use sqlx::{
    migrate::Migrator,
    sqlite::{SqliteConnectOptions, SqlitePoolOptions},
    Pool, Sqlite,
};
use tauri::Manager;

mod commands;

use commands::{
    check_vault::check_vault, gemini_key::get_meta, insert_key::insert_keys, ocr::ocr, tts::tts,
    unlock_vault::unlock_vault, delete_key::delete_key, history::history, delete_record::delete_record
};
use tts_rs::{engines::kokoro::KokoroEngine, SynthesisEngine};

struct AppState {
    db: Pool<Sqlite>,
    local_data_dir: PathBuf,
    stronghold: Mutex<Option<Stronghold>>,
    pdf_images_dir: PathBuf,
    tts_dir: PathBuf,
    tts_engine: Mutex<KokoroEngine>,
    key_provider: Mutex<Option<KeyProvider>>
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
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let local_data_dir = app
                .path()
                .app_local_data_dir()
                .expect("Local Data Dir Not accessible");
            if !local_data_dir.exists() {
                fs::create_dir_all(&local_data_dir).expect("Error Creating App Local Data Folder");
            }

            let pdf_images_dir = app
                .path()
                .app_cache_dir()
                .expect("Cache dir is not accessible")
                .join("pdfs");
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
                        match fs::create_dir_all(&tts_dir) {
                            Err(err) => {
                                eprintln!("Error creating audio dir: {}", err);
                                panic!("Error creating audio dir")
                            }
                            Ok(_) => tts_dir,
                        }
                    } else {
                        tts_dir
                    }
                }
            };
            let resources_dir = app
                .path()
                .resource_dir()
                .expect("Error Parsinf Resources Directory");
            if !resources_dir.exists() {
                panic!("Resource Directory was not found. Please re-install the application")
            }

            let voices_path = resources_dir.join("models").join("voices-v1.0.bin");
            if !voices_path.exists() {
                panic!("Voices Bin not found. Please re install the app");
            }

            let tts_model_path = resources_dir.join("models");

            if !tts_model_path.exists() {
                panic!("TTS Model Does Not Exists, Please re-install the application");
            }

            let mut engine = KokoroEngine::new();

            if let Err(err) = engine.load_model(&tts_model_path) {
                eprintln!("Error loading engine of the model: {}", err);
                panic!("Error loading engine of the model")
            }

            app.manage(AppState {
                db: pool,
                local_data_dir,
                stronghold: Mutex::new(None),
                pdf_images_dir,
                tts_dir,
                tts_engine: Mutex::new(engine),
                key_provider: Mutex::new(None)
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            check_vault,
            unlock_vault,
            insert_keys,
            ocr,
            tts,
            get_meta,
            delete_key,
            history,
            delete_record
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
