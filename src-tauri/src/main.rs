use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayEvent, Manager, WindowBuilder, WindowUrl};
use std::sync::Mutex;
use serde::{Serialize, Deserialize};
use tauri::api::dialog::FileDialogBuilder;

#[derive(Serialize, Deserialize, Clone)]
struct Settings {
    recording_location: String,
    frame_rate: u32,
}

struct State(Mutex<Settings>);

#[tauri::command]
fn update_settings(state: tauri::State<State>, recording_location: Option<String>, frame_rate: Option<u32>) -> Result<(), String> {
    let mut settings = state.0.lock().unwrap();
    if let Some(location) = recording_location {
        settings.recording_location = location;
    }
    if let Some(rate) = frame_rate {
        settings.frame_rate = rate;
    }
    println!("Saving settings: location={}, frame_rate={}", settings.recording_location, settings.frame_rate);
    Ok(())
}

#[tauri::command]
fn get_settings(state: tauri::State<State>) -> Result<Settings, String> {
    let settings = state.0.lock().unwrap();
    Ok(settings.clone())
}

#[tauri::command]
async fn open_folder_dialog(app_handle: tauri::AppHandle) -> Result<String, String> {
    let folder = FileDialogBuilder::new().pick_folder();
    match folder {
        Some(path) => Ok(path.to_string_lossy().into_owned()),
        None => Err("No folder selected".into()),
    }
}

fn main() {
    let initial_settings = Settings {
        recording_location: std::env::temp_dir().to_string_lossy().into_owned(),
        frame_rate: 30,
    };

    let system_tray = SystemTray::new().with_menu(
        SystemTrayMenu::new()
            .add_item(CustomMenuItem::new("settings".to_string(), "Settings"))
            .add_item(CustomMenuItem::new("quit".to_string(), "Quit"))
    );

    tauri::Builder::default()
        .manage(State(Mutex::new(initial_settings)))
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::MenuItemClick { id, .. } => {
                match id.as_str() {
                    "quit" => {
                        std::process::exit(0);
                    }
                    "settings" => {
                        let window = app.get_window("settings");
                        if let Some(window) = window {
                            window.show().unwrap();
                            window.set_focus().unwrap();
                        } else {
                            let _settings_window = WindowBuilder::new(
                                app,
                                "settings",
                                WindowUrl::default()
                            )
                            .title("Screen Recorder Settings")
                            .inner_size(400.0, 300.0)
                            .resizable(false)
                            .build()
                            .expect("Failed to create settings window");
                        }
                    }
                    _ => {}
                }
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![update_settings, get_settings, open_folder_dialog])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn capture_screen() {
    let display = Display::primary().expect("Couldn't find primary display.");
    let mut capturer = Capturer::new(display).expect("Couldn't begin capture.");
    let (w, h) = (capturer.width(), capturer.height());

    loop {
        match capturer.frame() {
            Ok(frame) => {
                // Process and save frame
            },
            Err(error) => {
                if error.kind() == WouldBlock {
                    // Wait for the next frame
                    thread::sleep(Duration::from_millis(1));
                    continue;
                } else {
                    panic!("Error: {}", error);
                }
            }
        }
    }
}

fn resize_frame(frame: ImageBuffer<Rgb<u8>, Vec<u8>>, new_width: u32, new_height: u32) -> ImageBuffer<Rgb<u8>, Vec<u8>> {
    image::imageops::resize(&frame, new_width, new_height, image::imageops::FilterType::Lanczos3)
}

use ffmpeg_next as ffmpeg;

fn save_video_chunk(frames: Vec<ImageBuffer<Rgb<u8>, Vec<u8>>>, output_path: &str) {
    // Initialize ffmpeg context and write frames
}