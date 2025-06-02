use sqlx::{sqlite::SqlitePoolOptions, Pool, Sqlite};
use std::sync::OnceLock;
use std::path::PathBuf;
use crate::models::Account;

// Global connection pool
static DB_POOL: OnceLock<Pool<Sqlite>> = OnceLock::new();

/// Initializes the database and returns the connection pool
pub async fn init_db() -> Result<Pool<Sqlite>, sqlx::Error> {
    // Determine the database path
    let app_dir = get_app_dir().expect("Failed to get app data directory");
    
    std::fs::create_dir_all(&app_dir).expect("Failed to create app directory");
    let db_path = app_dir.join("ledger-app.db");
    
    // Create connection options with optimized settings
    let conn_opts = sqlx::sqlite::SqliteConnectOptions::new()
        .filename(&db_path)
        .create_if_missing(true)
        .busy_timeout(std::time::Duration::from_secs(5))
        .journal_mode(sqlx::sqlite::SqliteJournalMode::Wal)
        .synchronous(sqlx::sqlite::SqliteSynchronous::Normal);
    
    // Create the pool with optimized settings
    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect_with(conn_opts)
        .await?;
    
    // Run migrations
    run_migrations(&pool).await?;
    
    // Store in global for reuse
    let _ = DB_POOL.set(pool.clone());
    
    Ok(pool)
}

fn get_app_dir() -> Option<PathBuf> {
    // In a real app, use the actual app identifier from your config
    // For development, we'll use a simple path
    let home = dirs::home_dir()?;
    Some(home.join(".ledger-app"))
}

pub fn get_pool() -> &'static Pool<Sqlite> {
    DB_POOL.get().expect("Database not initialized")
}

async fn run_migrations(pool: &Pool<Sqlite>) -> Result<(), sqlx::Error> {
    sqlx::query(include_str!("./migrations/1_create_accounts_table.sql"))
        .execute(pool)
        .await?;
    
    Ok(())
}

/// Fetches all accounts from the database.
pub async fn fetch_accounts(pool: &Pool<Sqlite>) -> Result<Vec<Account>, sqlx::Error> {
    let accounts = sqlx::query_as!(
        Account, // Specify the struct you want to map to
        r#"
        SELECT
            id,
            name,
            account_type,
            balance,
            currency,
            description,
            created_at as "created_at: _", -- Use AS to help sqlx infer DateTime<Utc>
            updated_at as "updated_at: _"  -- Use AS to help sqlx infer DateTime<Utc>
        FROM accounts
        "#
    )
    .fetch_all(pool)
    .await?;

    Ok(accounts)
}