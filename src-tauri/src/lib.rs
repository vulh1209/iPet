use tauri::Manager;

#[tauri::command]
fn set_window_position(app: tauri::AppHandle, x: i32, y: i32) {
    if let Some(window) = app.get_webview_window("main") {
        // Dùng Logical position vì JS screenX/Y trả về logical pixels
        let _ = window.set_position(tauri::Position::Logical(
            tauri::LogicalPosition { x: x as f64, y: y as f64 }
        ));
    }
}

#[tauri::command]
fn get_screen_size(app: tauri::AppHandle) -> (u32, u32) {
    if let Some(window) = app.get_webview_window("main") {
        if let Ok(Some(monitor)) = window.current_monitor() {
            let size = monitor.size();
            return (size.width, size.height);
        }
    }
    (1920, 1080) // default fallback
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![set_window_position, get_screen_size])
        .setup(|app| {
            // Set activation policy to Accessory so app doesn't appear in dock
            #[cfg(target_os = "macos")]
            {
                app.set_activation_policy(tauri::ActivationPolicy::Accessory);
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
