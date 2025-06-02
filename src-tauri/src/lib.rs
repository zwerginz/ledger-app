mod commands;
mod db;
mod models;

use commands::*;
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // Initialize the database in a background task
            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = db::init_db().await {
                    eprintln!("Database initialization error: {}", e);
                    app_handle.exit(1);
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_accounts,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}