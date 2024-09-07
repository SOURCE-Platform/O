#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::Manager;
use std::sync::Mutex;
use serde::{Serialize, Deserialize};
use reqwest::Client;
use dotenv::dotenv;
// Remove the unused import
// use std::fmt;

#[derive(Serialize, Deserialize, Clone, Debug)]
struct Settings {
    screen: SettingItem,
    session_info: SettingItem,
    background_processes: SettingItem,
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
            screen: SettingItem {
                enabled: false,
                description: "Records screen activity and learns what you do based on your screen activity.".to_string(),
            },
            session_info: SettingItem {
                enabled: false,
                description: "Captures what apps and sites you have open in any session. Learns how your sessions evolve over time.".to_string(),
            },
            background_processes: SettingItem {
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
async fn get_device_settings(device_name: String, state: tauri::State<'_, State>) -> Result<Settings, String> {
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
                                    "screen" => merged_settings.screen = new_setting,
                                    "session_info" => merged_settings.session_info = new_setting,
                                    "background_processes" => merged_settings.background_processes = new_setting,
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

fn main() {
    dotenv().ok(); // This line loads the .env file
    let initial_settings = Settings::default();

    tauri::Builder::default()
        .manage(State(Mutex::new(initial_settings)))
        .invoke_handler(tauri::generate_handler![get_device_settings, save_device_settings])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}