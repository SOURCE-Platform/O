#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::sync::Mutex;
use serde::{Serialize, Deserialize};
use reqwest::Client;
use dotenv::dotenv;
use std::path::Path;
use std::fs;
use chrono::{DateTime, Utc};

#[derive(Serialize, Deserialize, Clone, Debug)]
struct Settings {
    files_and_folders: SettingItem,
    screen: SettingItem,
    session: SettingItem,
    processes: SettingItem,
    keyboard: SettingItem,
    mouse: SettingItem,
    camera: SettingItem,
    mic: SettingItem,
}

#[derive(Default, Serialize, Deserialize, Clone, Debug)]
struct SettingItem {
    enabled: bool,
    description: String,
}

impl Default for Settings {
    fn default() -> Self {
        Settings {
            files_and_folders: SettingItem {
                enabled: false,
                description: "Records screen activity and learns what you do based on your screen activity.".to_string(),
            },
            screen: SettingItem {
                enabled: false,
                description: "Records screen activity and learns what you do based on your screen activity.".to_string(),
            },
            session: SettingItem {
                enabled: false,
                description: "Captures what apps and sites you have open in any session. Learns how your sessions evolve over time.".to_string(),
            },
            processes: SettingItem {
                enabled: false,
                description: "Captures what background processes are running to determine what functionality you rely on while you compute.".to_string(),
            },
            keyboard: SettingItem {
                enabled: false,
                description: "Learns your typing patterns and keyboard shortcuts to better learn how you communicate and what functionality you rely on.".to_string(),
            },
            mouse: SettingItem {
                enabled: false,
                description: "Captures your mouse movements and clicks to learn how you interact with your computer.".to_string(),
            },
            camera: SettingItem {
                enabled: false,
                description: "Sees how you react while using your devices to determine what events trigger what emotions and behaviors.".to_string(),
            },
            mic: SettingItem {
                enabled: false,
                description: "Listens to you while you're on calls and comments you might have while using your device in order to better understand you.".to_string(),
            },
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
struct DatabaseSettings {
    id: i32,
    device_name: String,
    settings: Settings,
    created_at: String,
}

struct State(Mutex<Settings>);

#[tauri::command]
async fn get_device_settings(device_name: String, _state: tauri::State<'_, State>) -> Result<Settings, String> {
    println!("Fetching settings for device: {}", device_name);
    let client = Client::new();
    let supabase_url = std::env::var("SUPABASE_URL").expect("SUPABASE_URL must be set");
    let supabase_key = std::env::var("SUPABASE_KEY").expect("SUPABASE_KEY must be set");

    let response = client.get(format!("{}/rest/v1/device_settings?device_name=eq.{}", supabase_url, device_name))
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", supabase_key))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if response.status().is_success() {
        let body = response.text().await.map_err(|e| e.to_string())?;
        println!("Raw response: {}", body);

        let settings: Result<Vec<serde_json::Value>, _> = serde_json::from_str(&body);
        match settings {
            Ok(settings_vec) => {
                if let Some(device_settings) = settings_vec.last() {
                    let mut merged_settings = Settings::default();
                    if let Some(settings_obj) = device_settings.get("settings").and_then(|s| s.as_object()) {
                        for (key, value) in settings_obj {
                            if let Some(setting_item) = value.as_object() {
                                let enabled = setting_item.get("enabled").and_then(|e| e.as_bool()).unwrap_or(false);
                                let description = setting_item.get("description").and_then(|d| d.as_str()).unwrap_or("").to_string();
                                let new_setting = SettingItem { enabled, description };
                                match key.as_str() {
                                    "files_and_folders" => merged_settings.files_and_folders = new_setting,
                                    "screen" => merged_settings.screen = new_setting,
                                    "session" => merged_settings.session = new_setting,
                                    "processes" => merged_settings.processes = new_setting,
                                    "keyboard" => merged_settings.keyboard = new_setting,
                                    "mouse" => merged_settings.mouse = new_setting,
                                    "camera" => merged_settings.camera = new_setting,
                                    "mic" => merged_settings.mic = new_setting,
                                    _ => println!("Unknown setting: {}", key),
                                }
                            }
                        }
                    }
                    Ok(merged_settings)
                } else {
                    println!("No settings found, creating default settings");
                    Ok(Settings::default())
                }
            },
            Err(e) => {
                println!("Error parsing settings: {}", e);
                Err(format!("Error parsing settings: {}", e))
            }
        }
    } else {
        Err(format!("Failed to fetch settings: {}", response.status()))
    }
}

#[tauri::command]
async fn save_device_settings(device_name: String, settings: Settings, _state: tauri::State<'_, State>) -> Result<(), String> {
    println!("Saving settings for device: {}", device_name);
    println!("Settings to save: {:?}", settings);

    let client = Client::new();
    let supabase_url = std::env::var("SUPABASE_URL").expect("SUPABASE_URL must be set");
    let supabase_key = std::env::var("SUPABASE_KEY").expect("SUPABASE_KEY must be set");

    let response = client.post(format!("{}/rest/v1/device_settings", supabase_url))
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", supabase_key))
        .header("Prefer", "resolution=merge-duplicates")
        .json(&serde_json::json!({
            "device_name": device_name,
            "settings": settings
        }))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    println!("Save response status: {}", response.status());

    if response.status().is_success() {
        println!("Settings saved successfully");
        Ok(())
    } else {
        let error = format!("Failed to save settings: {}", response.status());
        println!("{}", error);
        Err(error)
    }
}

#[derive(Deserialize, Debug)]
struct ItemInput {
    name: String,
    path: String,
    #[serde(rename = "type")]
    item_type: String,
    size: u64,
    #[serde(rename = "lastModified")]
    last_modified: u64,
    contents: Option<Vec<u8>>,
    #[serde(rename = "isDirectory")]
    is_directory: bool,
    children: Option<Vec<ItemInput>>,
}

#[derive(Serialize, Debug)]
struct ItemDetails {
    id: String,
    name: String,
    path: String,
    created: String,
    modified: String,
    accessed: String,
    size: String,
    item_type: String,
    extension: String,
    is_directory: bool,
    children: Option<Vec<ItemDetails>>,
}

#[tauri::command]
fn analyze_files_and_folders(items: Vec<ItemInput>) -> Result<Vec<ItemDetails>, String> {
    items.into_iter().map(analyze_item).collect()
}

fn analyze_item(item: ItemInput) -> Result<ItemDetails, String> {
    let ItemInput { name, path, item_type, size, last_modified, contents: _, is_directory, children } = item;
    
    let id = path.clone();
    let created = format_time(std::time::UNIX_EPOCH + std::time::Duration::from_millis(last_modified));
    let modified = created.clone();
    let accessed = created.clone();
    let size = format_size(size);
    let (item_type, extension) = get_item_type_and_extension(&name, &item_type);

    let analyzed_children = if is_directory {
        children.map(|c| c.into_iter().map(analyze_item).collect::<Result<Vec<_>, _>>()).transpose()?
    } else {
        None
    };

    Ok(ItemDetails {
        id,
        name,
        path,
        created,
        modified,
        accessed,
        size,
        item_type,
        extension,
        is_directory,
        children: analyzed_children,
    })
}

// Update this function to handle directories
fn get_item_type_and_extension(name: &str, mime_type: &str) -> (String, String) {
    if mime_type == "directory" {
        return ("Directory".to_string(), "".to_string());
    }

    let extension = Path::new(name)
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();

    let item_type = if mime_type.starts_with("audio/") {
        "Audio"
    } else if mime_type.starts_with("video/") {
        "Video"
    } else if mime_type.starts_with("text/") || mime_type == "application/pdf" {
        "Text"
    } else if mime_type == "application/x-msdownload" || mime_type == "application/x-executable" {
        "Executable"
    } else if mime_type.starts_with("image/") {
        "Image"
    } else {
        "Other"
    };

    (item_type.to_string(), extension)
}

fn format_time(time: std::time::SystemTime) -> String {
    let datetime: DateTime<Utc> = time.into();
    datetime.to_rfc3339()
}

fn format_size(size: u64) -> String {
    const KB: u64 = 1024;
    const MB: u64 = KB * 1024;
    const GB: u64 = MB * 1024;

    if size >= GB {
        format!("{:.2} GB", size as f64 / GB as f64)
    } else if size >= MB {
        format!("{:.2} MB", size as f64 / MB as f64)
    } else if size >= KB {
        format!("{:.2} KB", size as f64 / KB as f64)
    } else {
        format!("{} bytes", size)
    }
}

fn main() {
    dotenv().ok(); // This line loads the .env file
    let initial_settings = Settings::default();

    tauri::Builder::default()
        .manage(State(Mutex::new(initial_settings)))
        .invoke_handler(tauri::generate_handler![
            get_device_settings,
            save_device_settings,
            analyze_files_and_folders
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}