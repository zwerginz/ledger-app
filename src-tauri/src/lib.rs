use tauri_plugin_sql::{Migration, MigrationKind};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_accounts() -> Vec<String> {
    // Example stubbed data
    vec![
        "Checking Account".to_string(),
        "Savings Account".to_string(),
        "Credit Card".to_string(),
    ]
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {

    let migrations = vec![
        Migration {
            version: 1,
            description: "create users table",
            sql: "CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT
            )",
            kind: MigrationKind::Up,
        }
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default()
            .add_migrations("sqlite:test.db", migrations)
            .build()
        )
        .invoke_handler(tauri::generate_handler![greet, get_accounts])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
