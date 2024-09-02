#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::Manager;
use std::sync::Mutex;

#[derive(Default)]
struct Settings {
    // Define your settings fields here
}

struct State(Mutex<Settings>);

fn main() {
    let initial_settings = Settings::default();

    tauri::Builder::default()
        .manage(State(Mutex::new(initial_settings)))
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            window.set_decorations(false).unwrap();
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}