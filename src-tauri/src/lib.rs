use std::fs;

use ort::{
    ep::{CoreML, DirectML, ROCm, CPU, CUDA, NNAPI, XNNPACK},
    session::Session,
};
use sqlx::{
    migrate::{MigrateDatabase, Migrator},
    sqlite::{SqliteConnectOptions, SqlitePoolOptions},
    Sqlite,
};
use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

struct AppState {
    tts_session: Session,
}

struct Migration {
    version: u8,
    sql: &'static str,
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
        .plugin(tauri_plugin_stronghold::Builder::new(|pass| todo!()).build())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let local_data_dir = app
                .path()
                .app_local_data_dir()
                .expect("Local Data Dir Not accessible");
            if !local_data_dir.exists() {
                fs::create_dir_all(&local_data_dir).expect("Error Creating App Local Data Folder");
            }

            let resources_dir = app
                .path()
                .resource_dir()
                .expect("Error Parsinf Resources Directory");
            if !resources_dir.exists() {
                panic!("Resource Directory was not found. Please re-install the application")
            }
            let tts_model_path = resources_dir
                .join("models")
                .join("kokoro-v1.0.fp16-gpu.onnx");
            if !tts_model_path.exists() {
                panic!("TTS Model Does Not Exists, Please re-install the application");
            }

            let tts_session = Session::builder()
                .expect("error building session")
                .with_execution_providers([
                    CUDA::default().build(),
                    ROCm::default().build(),
                    DirectML::default().build(),
                    NNAPI::default().with_disable_cpu(true).build(),
                    XNNPACK::default().build(),
                    CoreML::default().build(),
                    CPU::default().build(),
                ])
                .expect("Error getting execution providers")
                .commit_from_file(tts_model_path)
                .expect("Error loading TTS Model from model path");

            app.manage(AppState { tts_session });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
