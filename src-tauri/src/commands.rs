use tauri::command;
use crate::db;
use crate::models::Account;

#[command]
pub async fn get_accounts() -> Result<Vec<Account>, String> {
    // Use the global pool to fetch accounts
    db::fetch_accounts(db::get_pool())
        .await
        .map_err(|e| e.to_string())
}