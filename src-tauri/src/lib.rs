use ort::{ep::{CPU, CUDA, CoreML, DirectML, NNAPI, ROCm, XNNPACK}, session::Session};
use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}


struct AppState {
    tts_session: Session
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let resources_dir = app.path().resource_dir().expect("Error Parsinf Resources Directory");
            if !resources_dir.exists() {
                panic!("Resource Directory was not found. Please re-install the application")
            }
            let tts_model_path = resources_dir.join("models").join("kokoro-v1.0.fp16-gpu.onnx");
            if !tts_model_path.exists() {
                panic!("TTS Model Does Not Exists, Please re-install the application");
            }
            
            let tts_session = Session::builder().expect("error building session")
                .with_execution_providers([CUDA::default().build(), ROCm::default().build(), DirectML::default().build(), NNAPI::default().with_disable_cpu(true).build(), XNNPACK::default().build(), CoreML::default().build(), CPU::default().build()])
                .expect("Error getting execution providers")
                .commit_from_file(tts_model_path)
                .expect("Error loading TTS Model from model path");

            app.manage(AppState{
                tts_session
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
