#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::Manager;
use std::sync::Mutex;
use serde::{Serialize, Deserialize};
use reqwest::Client;
use dotenv::dotenv;
use std::fmt;

#[derive(Default, Serialize, Deserialize, Clone, Debug)]
struct Settings {
    #[serde(rename = "Screen")]
    screen: SettingItem,
    #[serde(rename = "SessionInfo")]
    session_info: SettingItem,
    #[serde(rename = "BackgroundProcesses")]
    background_processes: SettingItem,
    #[serde(rename = "Keyboard")]
    keyboard: SettingItem,
    #[serde(rename = "Mouse")]
    mouse: SettingItem,
    #[serde(rename = "Camera")]
    camera: SettingItem,
    #[serde(rename = "Mic")]
    mic: SettingItem,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
struct DatabaseSettings {
    id: i32,
    device_name: String,
    settings: Settings,
    created_at: String,
}

#[derive(Default, Serialize, Deserialize, Clone, Debug)]
struct SettingItem {
    enabled: bool,
    description: String,
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

        let settings: Result<Vec<DatabaseSettings>, _> = serde_json::from_str(&body);
        match settings {
            Ok(settings_vec) => {
                if let Some(device_settings) = settings_vec.last() {
                    Ok(device_settings.settings.clone())
                } else {
                    println!("No settings found, creating default settings");
                    let default_settings = Settings::default();
                    save_device_settings(device_name.clone(), default_settings.clone(), state).await?;
                    Ok(default_settings)
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
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            window.set_decorations(false).unwrap();
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}