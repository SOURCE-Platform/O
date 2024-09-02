use tauri::{
    CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayEvent,
    WindowBuilder, WindowUrl, Manager,
};
use std::sync::{Mutex, Arc};
use std::sync::atomic::{AtomicBool, Ordering};
use serde::{Serialize, Deserialize};
use tauri::api::dialog::FileDialogBuilder;
use scrap::{Capturer, Display};
use std::time::{Duration, Instant};
use std::thread;
use std::io::ErrorKind::WouldBlock;
use image::{ImageBuffer, Rgb};
use std::fs;
use std::path::PathBuf;

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
async fn open_folder_dialog() -> Result<String, String> {
    let (tx, rx) = std::sync::mpsc::channel();
    
    FileDialogBuilder::new().pick_folder(move |path| {
        tx.send(path).unwrap();
    });

    match rx.recv().unwrap() {
        Some(path) => Ok(path.to_string_lossy().into_owned()),
        None => Err("No folder selected".into()),
    }
}

fn capture_screen(duration: Duration, frame_rate: u32, output_path: &str, stop_signal: Arc<AtomicBool>) -> Result<(), String> {
    let display = Display::primary().expect("Couldn't find primary display.");
    let mut capturer = Capturer::new(display).expect("Couldn't begin capture.");
    let (width, height) = (capturer.width(), capturer.height());

    let start_time = Instant::now();
    let frame_duration = Duration::from_secs_f64(1.0 / frame_rate as f64);
    let mut last_capture = Instant::now();
    let mut frame_count = 0;

    fs::create_dir_all(output_path).map_err(|e| format!("Failed to create output directory: {}", e))?;

    while start_time.elapsed() < duration && !stop_signal.load(Ordering::Relaxed) {
        if last_capture.elapsed() >= frame_duration {
            match capturer.frame() {
                Ok(buffer) => {
                    let image: ImageBuffer<Rgb<u8>, Vec<u8>> = ImageBuffer::from_raw(
                        width as u32,
                        height as u32,
                        buffer.to_vec()
                    ).ok_or("Failed to create ImageBuffer")?;
                    let file_name = format!("frame_{:05}.png", frame_count);
                    let file_path = PathBuf::from(output_path).join(file_name);
                    image.save(file_path).map_err(|e| format!("Failed to save image: {}", e))?;
                    frame_count += 1;
                    last_capture = Instant::now();
                },
                Err(error) => {
                    if error.kind() == WouldBlock {
                        thread::sleep(Duration::from_millis(1));
                        continue;
                    } else {
                        return Err(format!("Error: {}", error));
                    }
                }
            }
        }
    }

    Ok(())
}

fn main() {
    let initial_settings = Settings {
        recording_location: std::env::temp_dir().to_string_lossy().into_owned(),
        frame_rate: 30,
    };

    let recording = Arc::new(AtomicBool::new(false));
    let stop_signal = Arc::new(AtomicBool::new(false));

    let system_tray = SystemTray::new().with_menu(
        SystemTrayMenu::new()
            .add_item(CustomMenuItem::new("settings".to_string(), "Settings"))
            .add_item(CustomMenuItem::new("start_recording".to_string(), "Start Recording"))
            .add_item(CustomMenuItem::new("stop_recording".to_string(), "Stop Recording"))
            .add_item(CustomMenuItem::new("quit".to_string(), "Quit"))
    );

    tauri::Builder::default()
        .manage(State(Mutex::new(initial_settings)))
        .system_tray(system_tray)
        .on_system_tray_event(move |app_handle, event| {
            let recording_handle = recording.clone();
            let stop_signal_handle = stop_signal.clone();
            match event {
                SystemTrayEvent::MenuItemClick { id, .. } => {
                    match id.as_str() {
                        "quit" => {
                            std::process::exit(0);
                        }
                        "settings" => {
                            let window = app_handle.get_window("settings");
                            if let Some(window) = window {
                                window.show().unwrap();
                                window.set_focus().unwrap();
                            } else {
                                let _settings_window = WindowBuilder::new(
                                    app_handle,
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
                        "start_recording" => {
                            if !recording_handle.load(Ordering::Relaxed) {
                                recording_handle.store(true, Ordering::Relaxed);
                                stop_signal_handle.store(false, Ordering::Relaxed);
                                let state = app_handle.state::<State>();
                                let settings = state.0.lock().unwrap().clone();
                                let stop_signal = stop_signal_handle.clone();
                                thread::spawn(move || {
                                    let _ = capture_screen(
                                        Duration::from_secs(3600), // 1 hour max
                                        settings.frame_rate,
                                        &settings.recording_location,
                                        stop_signal,
                                    );
                                    recording_handle.store(false, Ordering::Relaxed);
                                });
                            }
                        }
                        "stop_recording" => {
                            if recording_handle.load(Ordering::Relaxed) {
                                stop_signal_handle.store(true, Ordering::Relaxed);
                            }
                        }
                        _ => {}
                    }
                }
                _ => {}
            }
        })
        .invoke_handler(tauri::generate_handler![update_settings, get_settings, open_folder_dialog])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}