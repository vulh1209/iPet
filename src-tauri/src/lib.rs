use tauri::{
    Manager,
    menu::{Menu, MenuItem},
    tray::{TrayIconBuilder, TrayIconEvent, MouseButton, MouseButtonState},
    image::Image,
};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

// Settings types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PersonalityConfig {
    pub preset: String, // "bubbles" | "sage" | "drowsy" | "custom"
    pub custom_traits: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MicrophoneConfig {
    pub enabled: bool,
    pub silence_timeout: u32, // milliseconds
    pub language: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub gemini_api_key: String,
    pub personality: PersonalityConfig,
    pub microphone: MicrophoneConfig,
    pub conversation_retention_days: u32,
    #[serde(default = "default_show_energy_bar")]
    pub show_energy_bar: bool,
    #[serde(default = "default_show_happiness_bar")]
    pub show_happiness_bar: bool,
}

fn default_show_energy_bar() -> bool {
    true
}

fn default_show_happiness_bar() -> bool {
    true
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            gemini_api_key: String::new(),
            personality: PersonalityConfig {
                preset: "bubbles".to_string(),
                custom_traits: None,
            },
            microphone: MicrophoneConfig {
                enabled: true,
                silence_timeout: 2000,
                language: "vi-VN".to_string(),
            },
            conversation_retention_days: 30,
            show_energy_bar: true,
            show_happiness_bar: true,
        }
    }
}

// Mood system types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MoodStats {
    pub happiness: f32,
    pub energy: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MoodTimestamps {
    #[serde(rename = "lastInteraction")]
    pub last_interaction: u64,
    #[serde(rename = "lastSleepEnd")]
    pub last_sleep_end: u64,
    #[serde(rename = "appLastClosed")]
    pub app_last_closed: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SleepState {
    #[serde(rename = "isSleeping")]
    pub is_sleeping: bool,
    #[serde(rename = "sleepStartTime")]
    pub sleep_start_time: Option<u64>,
    #[serde(rename = "scheduledWakeTime")]
    pub scheduled_wake_time: Option<u64>,
    #[serde(rename = "nextSleepTime")]
    pub next_sleep_time: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InteractionCounts {
    #[serde(rename = "todayDate")]
    pub today_date: String,
    pub treats: u32,
    #[serde(rename = "morningGreeting")]
    pub morning_greeting: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PetMoodState {
    pub version: u8,
    pub stats: MoodStats,
    pub timestamps: MoodTimestamps,
    pub sleep: SleepState,
    #[serde(rename = "interactionCounts")]
    pub interaction_counts: InteractionCounts,
}

// Get settings directory path (~/.ipet/)
fn get_settings_dir() -> PathBuf {
    let home = dirs::home_dir().unwrap_or_else(|| PathBuf::from("."));
    home.join(".ipet")
}

// Get settings file path (~/.ipet/settings.json)
fn get_settings_path() -> PathBuf {
    get_settings_dir().join("settings.json")
}

// Get mood file path (~/.ipet/mood.json)
fn get_mood_path() -> PathBuf {
    get_settings_dir().join("mood.json")
}

#[tauri::command]
fn load_settings() -> Result<AppSettings, String> {
    let path = get_settings_path();

    if !path.exists() {
        // Return default settings if file doesn't exist
        return Ok(AppSettings::default());
    }

    let content = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read settings: {}", e))?;

    let settings: AppSettings = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse settings: {}", e))?;

    Ok(settings)
}

#[tauri::command]
fn save_settings(settings: AppSettings) -> Result<(), String> {
    let dir = get_settings_dir();
    let path = get_settings_path();

    // Create directory if it doesn't exist
    if !dir.exists() {
        fs::create_dir_all(&dir)
            .map_err(|e| format!("Failed to create settings directory: {}", e))?;
    }

    let content = serde_json::to_string_pretty(&settings)
        .map_err(|e| format!("Failed to serialize settings: {}", e))?;

    fs::write(&path, content)
        .map_err(|e| format!("Failed to write settings: {}", e))?;

    Ok(())
}

#[tauri::command]
fn load_mood() -> Result<Option<PetMoodState>, String> {
    let path = get_mood_path();

    if !path.exists() {
        // Return None if file doesn't exist - frontend will create default
        return Ok(None);
    }

    let content = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read mood: {}", e))?;

    let mood: PetMoodState = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse mood: {}", e))?;

    Ok(Some(mood))
}

#[tauri::command]
fn save_mood(mood: PetMoodState) -> Result<(), String> {
    let dir = get_settings_dir();
    let path = get_mood_path();

    // Create directory if it doesn't exist
    if !dir.exists() {
        fs::create_dir_all(&dir)
            .map_err(|e| format!("Failed to create directory: {}", e))?;
    }

    let content = serde_json::to_string_pretty(&mood)
        .map_err(|e| format!("Failed to serialize mood: {}", e))?;

    fs::write(&path, content)
        .map_err(|e| format!("Failed to write mood: {}", e))?;

    Ok(())
}

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
fn set_window_size(app: tauri::AppHandle, width: u32, height: u32) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.set_size(tauri::Size::Logical(
            tauri::LogicalSize { width: width as f64, height: height as f64 }
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

#[tauri::command]
fn open_settings_window(app: tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("settings") {
        let _ = window.show();
        let _ = window.set_focus();
    }
}

#[tauri::command]
fn close_settings_window(app: tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("settings") {
        let _ = window.hide();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_macos_permissions::init())
        .invoke_handler(tauri::generate_handler![
            set_window_position,
            set_window_size,
            get_screen_size,
            load_settings,
            save_settings,
            load_mood,
            save_mood,
            open_settings_window,
            close_settings_window
        ])
        .setup(|app| {
            // Set activation policy to Accessory so app doesn't appear in dock
            #[cfg(target_os = "macos")]
            {
                app.set_activation_policy(tauri::ActivationPolicy::Accessory);
            }

            // Create system tray menu
            let settings_item = MenuItem::with_id(app, "settings", "Settings", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&settings_item, &quit_item])?;

            // Load tray icon
            let icon = Image::from_path("icons/tray-icon-32.png").unwrap_or_else(|_| {
                // Fallback: create a simple icon if file not found
                Image::from_bytes(include_bytes!("../icons/tray-icon-32.png")).expect("Failed to load tray icon")
            });

            // Build system tray
            let _tray = TrayIconBuilder::new()
                .icon(icon)
                .menu(&menu)
                .tooltip("iPet")
                .on_menu_event(|app, event| {
                    match event.id.as_ref() {
                        "settings" => {
                            if let Some(window) = app.get_webview_window("settings") {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                        "quit" => {
                            app.exit(0);
                        }
                        _ => {}
                    }
                })
                .on_tray_icon_event(|tray, event| {
                    // Double-click on tray icon opens settings
                    if let TrayIconEvent::Click { button: MouseButton::Left, button_state: MouseButtonState::Up, .. } = event {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("settings") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
