use tauri::{
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
};

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct WslDistro {
    name: String,
    state: String,
    version: String,
    default: bool,
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct WslInfo {
    installed: bool,
    version: String,
    default_distro: String,
    distributions: Vec<WslDistro>,
    error: Option<String>,
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct PentestToolStatus {
    tool_id: String,
    installed: bool,
    command: String,
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct PentestRunResult {
    action: String,
    command: String,
    output: String,
}

#[tauri::command]
async fn fetch_rss_source(url: String) -> Result<String, String> {
    let url = url.trim();
    if !(url.starts_with("https://") || url.starts_with("http://")) {
        return Err("RSS source must be an http:// or https:// URL.".to_string());
    }
    if url.len() > 1000 || url.chars().any(|c| c.is_control()) {
        return Err("RSS source URL is not valid.".to_string());
    }

    let client = reqwest::Client::builder()
        .user_agent("Vindicta/0.1 Security News Reader")
        .redirect(reqwest::redirect::Policy::limited(5))
        .build()
        .map_err(|error| error.to_string())?;

    let response = client
        .get(url)
        .send()
        .await
        .map_err(|error| error.to_string())?;

    let status = response.status();
    if !status.is_success() {
        return Err(format!("RSS source returned HTTP {}", status.as_u16()));
    }

    response.text().await.map_err(|error| error.to_string())
}

const PENTEST_USER: &str = "pentest";
const ACADEMY_USER: &str = "academy";

#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x08000000;

fn hidden_command(program: &str) -> std::process::Command {
    let mut command = std::process::Command::new(program);
    #[cfg(target_os = "windows")]
    {
        command.creation_flags(CREATE_NO_WINDOW);
    }
    command
}

#[tauri::command]
fn auto_start_enabled() -> Result<bool, String> {
    #[cfg(target_os = "windows")]
    {
        let output = hidden_command("reg")
            .args([
                "query",
                r"HKCU\Software\Microsoft\Windows\CurrentVersion\Run",
                "/v",
                "Vindicta",
            ])
            .output()
            .map_err(|error| error.to_string())?;

        Ok(output.status.success())
    }

    #[cfg(not(target_os = "windows"))]
    {
        Ok(false)
    }
}

#[tauri::command]
fn set_auto_start(enabled: bool) -> Result<bool, String> {
    #[cfg(target_os = "windows")]
    {
        if enabled {
            let exe = std::env::current_exe().map_err(|error| error.to_string())?;
            let exe = exe
                .to_str()
                .ok_or_else(|| "Could not resolve Vindicta executable path.".to_string())?;
            let quoted = format!("\"{}\"", exe);
            let status = hidden_command("reg")
                .args([
                    "add",
                    r"HKCU\Software\Microsoft\Windows\CurrentVersion\Run",
                    "/v",
                    "Vindicta",
                    "/t",
                    "REG_SZ",
                    "/d",
                    &quoted,
                    "/f",
                ])
                .status()
                .map_err(|error| error.to_string())?;
            if !status.success() {
                return Err("Windows rejected the startup registry update.".to_string());
            }
        } else {
            let _ = hidden_command("reg")
                .args([
                    "delete",
                    r"HKCU\Software\Microsoft\Windows\CurrentVersion\Run",
                    "/v",
                    "Vindicta",
                    "/f",
                ])
                .status()
                .map_err(|error| error.to_string())?;
        }

        Ok(enabled)
    }

    #[cfg(not(target_os = "windows"))]
    {
        let _ = enabled;
        Err("Auto-start management is only implemented for Windows builds.".to_string())
    }
}

#[tauri::command]
fn wsl_info() -> WslInfo {
    let version_output = hidden_command("wsl").arg("--version").output();
    let version_output = match version_output {
        Ok(output) => output,
        Err(error) => {
            return WslInfo {
                installed: false,
                version: String::new(),
                default_distro: String::new(),
                distributions: vec![],
                error: Some(error.to_string()),
            };
        }
    };

    let version = String::from_utf8_lossy(&version_output.stdout)
        .lines()
        .next()
        .unwrap_or("")
        .trim()
        .to_string();

    let list_output = hidden_command("wsl")
        .args(["--list", "--verbose"])
        .output();

    let mut distributions = vec![];
    let mut default_distro = String::new();

    if let Ok(output) = list_output {
        let text = String::from_utf8_lossy(&output.stdout).replace('\0', "");
        for line in text.lines().skip(1) {
            let trimmed = line.trim();
            if trimmed.is_empty() {
                continue;
            }
            let default = trimmed.starts_with('*');
            let clean = trimmed.trim_start_matches('*').trim();
            let parts: Vec<&str> = clean.split_whitespace().collect();
            if parts.is_empty() {
                continue;
            }
            let name = parts[0].to_string();
            if default {
                default_distro = name.clone();
            }
            distributions.push(WslDistro {
                name,
                state: parts.get(1).unwrap_or(&"").to_string(),
                version: parts.get(2).unwrap_or(&"").to_string(),
                default,
            });
        }
    }

    WslInfo {
        installed: version_output.status.success(),
        version,
        default_distro,
        distributions,
        error: if version_output.status.success() {
            None
        } else {
            Some(
                String::from_utf8_lossy(&version_output.stderr)
                    .trim()
                    .to_string(),
            )
        },
    }
}

#[tauri::command]
fn wsl_unregister_distribution(name: String) -> Result<(), String> {
    if name.trim().is_empty() {
        return Err("Choose a WSL distribution to purge.".to_string());
    }

    let status = hidden_command("wsl")
        .args(["--unregister", name.trim()])
        .status()
        .map_err(|error| error.to_string())?;

    if status.success() {
        Ok(())
    } else {
        Err(format!("Could not unregister WSL distribution '{}'.", name))
    }
}

#[tauri::command]
async fn wsl_start_distribution(name: String) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || wsl_start_distribution_blocking(&name))
        .await
        .map_err(|error| error.to_string())?
}

fn wsl_start_distribution_blocking(name: &str) -> Result<(), String> {
    let script = "nohup sh -c 'while true; do sleep 3600; done' >/dev/null 2>&1 &";
    run_wsl_shell(name, Some("root"), script).map(|_| ())
}

#[tauri::command]
async fn wsl_ensure_pentest_backend(distro: String) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || wsl_ensure_pentest_backend_blocking(&distro))
        .await
        .map_err(|error| error.to_string())?
}

fn wsl_ensure_pentest_backend_blocking(distro: &str) -> Result<String, String> {
    wsl_start_distribution_blocking(distro)?;
    let script = format!(
        r#"set -eu
if ! id -u {user} >/dev/null 2>&1; then
  useradd -m -s /bin/bash {user}
fi
install -d -o {user} -g {user} /home/{user}/vindicta /home/{user}/vindicta/tools /home/{user}/vindicta/workspace /home/{user}/.local/bin
touch /home/{user}/vindicta/.managed-by-vindicta
chown -R {user}:{user} /home/{user}/vindicta /home/{user}/.local
printf 'Pentest backend ready: /home/{user}/vindicta\n'
"#,
        user = PENTEST_USER
    );
    run_wsl_shell(distro, Some("root"), &script)
}

#[tauri::command]
async fn wsl_pentest_tool_status(
    distro: String,
    tool_ids: Vec<String>,
) -> Result<Vec<PentestToolStatus>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        wsl_pentest_tool_status_blocking(&distro, tool_ids)
    })
    .await
    .map_err(|error| error.to_string())?
}

fn wsl_pentest_tool_status_blocking(
    distro: &str,
    tool_ids: Vec<String>,
) -> Result<Vec<PentestToolStatus>, String> {
    let mut statuses = Vec::new();
    for tool_id in tool_ids {
        let Some((command, _package)) = pentest_tool_mapping(&tool_id) else {
            continue;
        };
        let script = format!("command -v {} >/dev/null 2>&1", shell_quote(command));
        let installed = run_wsl_shell(&distro, Some(PENTEST_USER), &script).is_ok();
        statuses.push(PentestToolStatus {
            tool_id,
            installed,
            command: command.to_string(),
        });
    }
    Ok(statuses)
}

#[tauri::command]
async fn wsl_install_pentest_tool(distro: String, tool_id: String) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || {
        wsl_install_pentest_tool_blocking(&distro, &tool_id)
    })
    .await
    .map_err(|error| error.to_string())?
}

fn wsl_install_pentest_tool_blocking(distro: &str, tool_id: &str) -> Result<String, String> {
    wsl_ensure_pentest_backend_blocking(distro)?;
    let Some((_command, package)) = pentest_tool_mapping(&tool_id) else {
        return Err(format!(
            "{} is not available through the WSL package installer yet.",
            tool_id
        ));
    };
    if package.is_empty() {
        return Err(format!(
            "{} requires a vendor installer and cannot be installed automatically yet.",
            tool_id
        ));
    }

    let script = format!(
        r#"set -eu
if ! command -v apt-get >/dev/null 2>&1; then
  printf 'This WSL distribution does not expose apt-get. Install %s manually for the pentest account.\n' {package}
  exit 12
fi
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y {package}
install -d -o {user} -g {user} /home/{user}/vindicta/tools
printf '%s installed for the Vindicta pentest backend.\n' {package}
"#,
        package = shell_quote(package),
        user = PENTEST_USER
    );
    run_wsl_shell(distro, Some("root"), &script)
}

#[tauri::command]
async fn wsl_run_pentest_action(
    distro: String,
    action: String,
    target: String,
) -> Result<PentestRunResult, String> {
    tauri::async_runtime::spawn_blocking(move || {
        wsl_run_pentest_action_blocking(&distro, &action, &target)
    })
    .await
    .map_err(|error| error.to_string())?
}

fn wsl_run_pentest_action_blocking(
    distro: &str,
    action: &str,
    target: &str,
) -> Result<PentestRunResult, String> {
    wsl_ensure_pentest_backend_blocking(distro)?;
    let (label, command, script) = pentest_action_script(action, target)?;
    let output = run_wsl_shell(distro, Some(PENTEST_USER), &script)?;
    Ok(PentestRunResult {
        action: label,
        command,
        output,
    })
}

/// Set up the dedicated academy WSL account and workspace directory.
#[tauri::command]
async fn wsl_ensure_academy_backend(distro: String) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || wsl_ensure_academy_backend_blocking(&distro))
        .await
        .map_err(|error| error.to_string())?
}

fn wsl_ensure_academy_backend_blocking(distro: &str) -> Result<String, String> {
    wsl_start_distribution_blocking(distro)?;
    let script = format!(
        r#"set -eu
if ! id -u {user} >/dev/null 2>&1; then
  useradd -m -s /bin/bash {user}
fi
install -d -o {user} -g {user} /home/{user}/vindicta /home/{user}/vindicta/workspace /home/{user}/.local/bin
touch /home/{user}/vindicta/.managed-by-vindicta
chown -R {user}:{user} /home/{user}/vindicta /home/{user}/.local
printf 'Academy backend ready: /home/{user}/vindicta\n'
"#,
        user = ACADEMY_USER
    );
    run_wsl_shell(distro, Some("root"), &script)
}

/// Run a shell command as the academy user (30 s timeout, max 200 lines of output).
#[tauri::command]
async fn wsl_run_academy_command(distro: String, command: String) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || wsl_run_academy_command_blocking(&distro, &command))
        .await
        .map_err(|error| error.to_string())?
}

fn wsl_run_academy_command_blocking(distro: &str, command: &str) -> Result<String, String> {
    // Block obviously destructive patterns
    let lower = command.to_lowercase();
    const BLOCKED: &[&str] = &[
        "rm -rf /", "mkfs", "dd if=", ":(){ :|:& };:", "chmod 000 /", "chown root /",
        "shutdown", "reboot", "halt", "poweroff", "init 0", "init 6",
    ];
    for b in BLOCKED {
        if lower.contains(b) {
            return Err(format!("Command blocked for safety: matches '{}'", b));
        }
    }
    if command.len() > 2000 {
        return Err("Command is too long.".to_string());
    }
    let safe_cmd = command.replace('\'', r#"'\''"#);
    let script = format!(
        "set -u\ncd ~/vindicta/workspace 2>/dev/null || cd ~\ntimeout 30s sh -c '{}' 2>&1 | head -300",
        safe_cmd
    );
    run_wsl_shell(distro, Some(ACADEMY_USER), &script)
}

/// Remove only the Vindicta-managed user accounts (pentest, academy) and their
/// home directories from a distribution — does NOT unregister the whole distro.
#[tauri::command]
async fn wsl_purge_vindicta_profiles(distro: String) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || wsl_purge_vindicta_profiles_blocking(&distro))
        .await
        .map_err(|error| error.to_string())?
}

fn wsl_purge_vindicta_profiles_blocking(distro: &str) -> Result<String, String> {
    if distro.trim().is_empty() {
        return Err("Select a WSL distribution first.".to_string());
    }
    // Vindicta manages two accounts inside WSL: 'pentest' and 'academy'
    const VINDICTA_USERS: &[&str] = &["pentest", "academy"];
    let users_list = VINDICTA_USERS.join(" ");
    let script = format!(
        r#"set -eu
REMOVED=""
for USER in {users}; do
  if id -u "$USER" >/dev/null 2>&1; then
    userdel -r "$USER" 2>&1 || true
    rm -rf "/home/$USER" 2>/dev/null || true
    REMOVED="$REMOVED $USER"
    printf 'Removed Vindicta account: %s\n' "$USER"
  else
    printf 'Account not found (skipped): %s\n' "$USER"
  fi
done
rm -rf /home/.vindicta-managed 2>/dev/null || true
if [ -z "$REMOVED" ]; then
  printf 'No Vindicta-managed accounts were found in this distribution.\n'
else
  printf 'Vindicta profiles purged:%s\n' "$REMOVED"
fi
"#,
        users = users_list
    );
    run_wsl_shell(distro, Some("root"), &script)
}

fn run_wsl_shell(distro: &str, user: Option<&str>, script: &str) -> Result<String, String> {
    let distro = distro.trim();
    let mut command = hidden_command("wsl");
    if !distro.is_empty() {
        command.args(["-d", distro]);
    }
    if let Some(user) = user {
        command.args(["-u", user]);
    }
    let output = command
        .args(["--exec", "sh", "-lc", script])
        .output()
        .map_err(|error| error.to_string())?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
        let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
        Err(if stderr.is_empty() { stdout } else { stderr })
    }
}

fn pentest_tool_mapping(tool_id: &str) -> Option<(&'static str, &'static str)> {
    match tool_id {
        "nmap" => Some(("nmap", "nmap")),
        "mitmproxy" => Some(("mitmproxy", "mitmproxy")),
        "sqlmap" => Some(("sqlmap", "sqlmap")),
        "gobuster" => Some(("gobuster", "gobuster")),
        "metasploit" => Some(("msfconsole", "metasploit-framework")),
        "hydra" => Some(("hydra", "hydra")),
        "aircrack" => Some(("aircrack-ng", "aircrack-ng")),
        "snort" => Some(("snort", "snort")),
        "suricata" => Some(("suricata", "suricata")),
        "openvas" => Some(("gvm-check-setup", "gvm")),
        "logwatch" => Some(("logwatch", "logwatch")),
        "fail2ban" => Some(("fail2ban-client", "fail2ban")),
        "nessus" => Some(("nessuscli", "")),
        _ => None,
    }
}

fn pentest_action_script(action: &str, target: &str) -> Result<(String, String, String), String> {
    match action {
        "recon_quick" => {
            let host = normalize_host_target(target)?;
            let command = format!(
                "nmap -T3 -F -Pn --max-retries 2 --host-timeout 45s --reason {}",
                host
            );
            Ok((
                "Quick Recon".to_string(),
                command.clone(),
                format!(
                    "set -u\ncommand -v nmap >/dev/null 2>&1 || {{ echo 'nmap is not installed in the pentest account.'; exit 127; }}\ncd ~/vindicta/workspace\nif ! timeout 70s {} 2>&1; then code=$?; echo \"[vindicta] command finished with exit code $code\"; fi",
                    command
                ),
            ))
        }
        "service_scan" => {
            let host = normalize_host_target(target)?;
            let command = format!(
                "nmap -sV --version-light -T3 -Pn --max-retries 2 --host-timeout 60s --top-ports 80 {}",
                host
            );
            Ok((
                "Service Scan".to_string(),
                command.clone(),
                format!(
                    "set -u\ncommand -v nmap >/dev/null 2>&1 || {{ echo 'nmap is not installed in the pentest account.'; exit 127; }}\ncd ~/vindicta/workspace\nif ! timeout 90s {} 2>&1; then code=$?; echo \"[vindicta] command finished with exit code $code\"; fi",
                    command
                ),
            ))
        }
        "web_headers" => {
            let url = normalize_url_target(target)?;
            let command = format!("curl -k -I --max-time 20 {}", shell_quote(&url));
            Ok((
                "HTTP Headers".to_string(),
                command.clone(),
                format!(
                    "set -u\ncommand -v curl >/dev/null 2>&1 || {{ echo 'curl is not installed in the pentest account.'; exit 127; }}\ncd ~/vindicta/workspace\nif ! {} 2>&1; then code=$?; echo \"[vindicta] command finished with exit code $code\"; fi",
                    command
                ),
            ))
        }
        "web_directories" => {
            let url = normalize_url_target(target)?;
            let quoted_url = shell_quote(&url);
            let command = format!("gobuster dir -q -t 12 -u {} -w <wordlist>", quoted_url);
            Ok((
                "Directory Enumeration".to_string(),
                command.clone(),
                format!(
                    r#"set -u
command -v gobuster >/dev/null 2>&1 || {{ echo 'gobuster is not installed in the pentest account.'; exit 127; }}
cd ~/vindicta/workspace
WORDLIST="/usr/share/wordlists/dirb/common.txt"
if [ ! -f "$WORDLIST" ]; then
  WORDLIST="/tmp/vindicta-common.txt"
  printf "admin\napi\nassets\nbackup\nconfig\ndashboard\ndebug\ndocs\nlogin\nportal\nserver-status\nuploads\n" > "$WORDLIST"
fi
if ! timeout 80s gobuster dir -q -t 8 -u {url} -w "$WORDLIST" --timeout 12s 2>&1; then
  code=$?
  echo "[vindicta] command finished with exit code $code"
fi
"#,
                    url = quoted_url
                ),
            ))
        }
        "sqlmap_check" => {
            let url = normalize_url_target(target)?;
            let command = format!(
                "sqlmap -u {} --batch --smart --level=1 --risk=1",
                shell_quote(&url)
            );
            Ok((
                "SQL Injection Check".to_string(),
                command.clone(),
                format!(
                    "set -u\ncommand -v sqlmap >/dev/null 2>&1 || {{ echo 'sqlmap is not installed in the pentest account.'; exit 127; }}\ncd ~/vindicta/workspace\nif ! timeout 120s {} 2>&1; then code=$?; echo \"[vindicta] command finished with exit code $code\"; fi",
                    command
                ),
            ))
        }
        "local_posture" => {
            let command =
                "hostname; whoami; uname -a; ss -tulpen 2>/dev/null | head -80".to_string();
            Ok((
                "Local Posture".to_string(),
                command.clone(),
                format!("set -eu\ncd ~/vindicta/workspace\n{}", command),
            ))
        }
        "dns_recon" => {
            let host = normalize_host_target(target)?;
            // Unquote for display since shell_quote wraps in single-quotes
            let host_display = host.trim_matches('\'').to_string();
            let command = format!("dig +noall +answer ANY {h}; host {h} 2>&1; dig +short MX {h}; dig +short TXT {h}", h = host_display);
            Ok((
                "DNS Reconnaissance".to_string(),
                command.clone(),
                format!(
                    r#"set -u
cd ~/vindicta/workspace
HOST={host}
echo "=== A / AAAA records ==="
dig +noall +answer A "$HOST" || true
dig +noall +answer AAAA "$HOST" || true
echo "=== MX records ==="
dig +short MX "$HOST" || true
echo "=== TXT / SPF ==="
dig +short TXT "$HOST" || true
echo "=== NS records ==="
dig +short NS "$HOST" || true
echo "=== Zone transfer attempt (axfr) ==="
dig AXFR "$HOST" 2>&1 | head -30 || true
echo "=== Reverse lookup ==="
host "$HOST" 2>&1 || true
"#,
                    host = host
                ),
            ))
        }
        "ssl_check" => {
            let host_raw = normalize_host_target(target)?;
            let host = host_raw.trim_matches('\'').to_string();
            let command = format!("openssl s_client -connect {}:443 -showcerts </dev/null 2>&1", host);
            Ok((
                "SSL/TLS Certificate Check".to_string(),
                command.clone(),
                format!(
                    r#"set -u
HOST={host}
PORT=443
echo "=== Certificate chain ==="
echo | timeout 15s openssl s_client -connect "$HOST:$PORT" -showcerts 2>&1 | head -80 || echo "(openssl not available or connection timed out)"
echo ""
echo "=== Certificate expiry & subject ==="
echo | timeout 15s openssl s_client -connect "$HOST:$PORT" 2>/dev/null | openssl x509 -noout -subject -issuer -dates -fingerprint 2>&1 || echo "(could not parse certificate)"
echo ""
echo "=== Supported protocol check (TLS 1.0 — try to connect) ==="
timeout 8s openssl s_client -connect "$HOST:$PORT" -tls1 </dev/null 2>&1 | grep -E "Protocol|Cipher|CONNECTED|FAILED" || echo "TLS 1.0: no response"
timeout 8s openssl s_client -connect "$HOST:$PORT" -tls1_2 </dev/null 2>&1 | grep -E "Protocol|Cipher|CONNECTED|FAILED" || echo "TLS 1.2: no response"
timeout 8s openssl s_client -connect "$HOST:$PORT" -tls1_3 </dev/null 2>&1 | grep -E "Protocol|Cipher|CONNECTED|FAILED" || echo "TLS 1.3: no response"
"#,
                    host = host_raw
                ),
            ))
        }
        _ => Err("Choose a supported pentest action.".to_string()),
    }
}

fn normalize_host_target(target: &str) -> Result<String, String> {
    let value = target.trim();
    if value.is_empty() {
        return Err("Enter an authorized target first.".to_string());
    }
    let without_scheme = value
        .strip_prefix("http://")
        .or_else(|| value.strip_prefix("https://"))
        .unwrap_or(value);
    let host = without_scheme
        .split('/')
        .next()
        .unwrap_or("")
        .trim()
        .trim_end_matches('.');
    validate_target_token(host)?;
    Ok(shell_quote(host))
}

fn normalize_url_target(target: &str) -> Result<String, String> {
    let value = target.trim();
    let value = if value.starts_with("http://") || value.starts_with("https://") {
        value.to_string()
    } else {
        let host = value.split('/').next().unwrap_or("").trim();
        validate_target_token(host)?;
        format!("https://{}", value)
    };
    if value.len() > 500 || value.chars().any(|c| c.is_control()) {
        return Err("Target URL is not valid.".to_string());
    }
    if value.chars().any(|c| "`$<>|;&\\".contains(c)) {
        return Err("Target URL contains unsupported shell characters.".to_string());
    }
    Ok(value.to_string())
}

fn validate_target_token(value: &str) -> Result<(), String> {
    if value.is_empty() || value.len() > 255 {
        return Err("Target host is not valid.".to_string());
    }
    if value
        .chars()
        .any(|c| c.is_whitespace() || c.is_control() || "`$<>|;&\\".contains(c))
    {
        return Err("Target host contains unsupported characters.".to_string());
    }
    Ok(())
}

fn shell_quote(value: &str) -> String {
    format!("'{}'", value.replace('\'', r#"'\''"#))
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            auto_start_enabled,
            set_auto_start,
            wsl_info,
            wsl_unregister_distribution,
            wsl_purge_vindicta_profiles,
            wsl_ensure_academy_backend,
            wsl_run_academy_command,
            wsl_start_distribution,
            wsl_ensure_pentest_backend,
            wsl_pentest_tool_status,
            wsl_install_pentest_tool,
            wsl_run_pentest_action,
            fetch_rss_source,
        ])
        .setup(|app| {
            // Build system tray icon — shows the main window on left-click
            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .tooltip("Vindicta — click to open")
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running vindicta");
}
