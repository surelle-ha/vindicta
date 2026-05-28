fn main() {
    let env_path = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join(".env");
    // Re-run whenever .env changes so option_env! picks up the new value.
    println!("cargo:rerun-if-changed={}", env_path.display());

    if let Ok(content) = std::fs::read_to_string(&env_path) {
        for line in content.lines() {
            let line = line.trim();
            if line.is_empty() || line.starts_with('#') {
                continue;
            }
            if let Some((key, val)) = line.split_once('=') {
                // Always emit — overrides whatever was compiled in before.
                println!("cargo:rustc-env={}={}", key.trim(), val.trim());
            }
        }
    }

    tauri_build::build()
}
