# Okta — Token Sync Issues After Password Change

> **Purpose:** Step-by-step resolution for Okta token sync failures after a password change, including re-authenticating Office 365 apps, fixing OneDrive sync crashes, and restoring performance via the Okta dashboard.

---

## Table of Contents

1. [What Happens After an Okta Password Change](#1-what-happens-after-an-okta-password-change)
2. [Step 1 — Re-Authenticate via Okta Dashboard](#2-step-1--re-authenticate-via-okta-dashboard)
3. [Step 2 — Fix Office Apps Token (Word, Excel, Outlook, Teams)](#3-step-2--fix-office-apps-token-word-excel-outlook-teams)
4. [Step 3 — Fix OneDrive Sync Crash & Performance](#4-step-3--fix-onedrive-sync-crash--performance)
5. [Step 4 — Clear Stale Credentials from Windows Credential Manager](#5-step-4--clear-stale-credentials-from-windows-credential-manager)
6. [Step 5 — Verify Everything is Working](#6-step-5--verify-everything-is-working)
7. [Quick Reference — One-Liners](#7-quick-reference--one-liners)

---

## 1. What Happens After an Okta Password Change

When a user changes their Okta password, the following can break:

| Symptom | Root Cause |
|---------|------------|
| Office apps (Word, Excel, Outlook) keep prompting for sign-in | Cached OAuth token is expired/invalid |
| OneDrive stops syncing, freezes, or crashes Explorer | OneDrive holds a stale Okta token and loops trying to refresh it |
| High CPU/memory usage after password change | OneDrive sync process is stuck in a retry loop |
| Teams shows "You\'re signed out" or goes offline | Teams token tied to Okta SSO is invalidated |
| Browser apps still work but desktop apps don\'t | Browser picks up new Okta session cookie; desktop apps use cached tokens |

> **Root cause:** Office desktop apps and OneDrive cache OAuth tokens independently of the browser. After an Okta password change, these cached tokens become invalid but the apps keep retrying silently — causing CPU spikes, crashes, and sync failures.

---

## 2. Step 1 — Re-Authenticate via Okta Dashboard

> **Do this first.** The Okta dashboard is the authoritative source for passing a fresh token to connected apps.

| Step | Action |
|------|--------|
| 1 | Open a browser and go to your Okta org URL (e.g., `https://yourcompany.okta.com`) |
| 2 | Sign in with the **new password** |
| 3 | Once logged in, click your **name/avatar > Settings** |
| 4 | Scroll to **Security > Sessions** and click **Sign out all devices** to clear all stale sessions |
| 5 | Sign back in to the Okta dashboard with new credentials |
| 6 | Launch **Office 365** from the Okta dashboard (via the app tile) — this passes a fresh SAML/OIDC token to the app |
| 7 | Repeat for **OneDrive**, **Teams**, and any other tiles |

> **Why this works:** Launching apps from the Okta dashboard initiates a new SSO assertion, passing a fresh token directly to the app rather than relying on the stale cached token.

---

## 3. Step 2 — Fix Office Apps Token (Word, Excel, Outlook, Teams)

### Windows — Sign Out and Back In

| Step | Action |
|------|--------|
| 1 | Open any Office app (Word, Excel, Outlook) |
| 2 | Go to **File > Account** |
| 3 | Click **Sign Out** under the user\'s name |
| 4 | Close **all** Office apps completely (check Task Manager — kill any remaining Office processes) |
| 5 | Reopen the Office app |
| 6 | Sign in with the **new Okta-linked Microsoft credentials** |
| 7 | If prompted with MFA, complete it |

### Kill All Office Processes (PowerShell)

```powershell
Get-Process -Name WINWORD, EXCEL, OUTLOOK, TEAMS, ONENOTE, MSACCESS -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Clear Office Token Cache (PowerShell — Run as Admin)

```powershell
# Clears cached Office identity tokens
Remove-Item -Path "$env:LOCALAPPDATA\Microsoft\Office\16.0\Licensing" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:LOCALAPPDATA\Microsoft\identitycache" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:APPDATA\Microsoft\Protect" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "Office token cache cleared. Reopen Office apps and sign in."
```

> **After running:** Reopen Office apps and sign in fresh via Okta dashboard tile or with Microsoft credentials linked to Okta.

---

## 4. Step 3 — Fix OneDrive Sync Crash & Performance

> OneDrive is the most common performance offender after an Okta password change. It loops trying to refresh a stale token and can consume 30-80% CPU.

### Step-by-Step Fix

| Step | Action |
|------|--------|
| 1 | Right-click the **OneDrive cloud icon** in the system tray |
| 2 | Click **Settings > Account > Unlink this PC** |
| 3 | Confirm — this stops the sync loop immediately |
| 4 | Open **Task Manager** and end any remaining `OneDrive.exe` processes |
| 5 | Clear the OneDrive token cache (see PowerShell below) |
| 6 | Reopen OneDrive from Start menu |
| 7 | Sign in with the new credentials when prompted |
| 8 | Allow OneDrive to re-sync (files are not deleted — they remain in the cloud) |

### Stop OneDrive + Clear Token Cache (PowerShell — Run as Admin)

```powershell
# Stop OneDrive
Stop-Process -Name OneDrive -Force -ErrorAction SilentlyContinue

# Clear OneDrive token/auth cache
Remove-Item -Path "$env:LOCALAPPDATA\Microsoft\OneDrive\settings" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:LOCALAPPDATA\Microsoft\OneDrive\logs" -Recurse -Force -ErrorAction SilentlyContinue

# Restart OneDrive
Start-Process "$env:LOCALAPPDATA\Microsoft\OneDrive\OneDrive.exe"
Write-Host "OneDrive restarted. Sign in with new credentials."
```

### If OneDrive is Still Crashing or Looping

```powershell
# Full OneDrive reset (keeps files, resets app state)
& "$env:LOCALAPPDATA\Microsoft\OneDrive\OneDrive.exe" /reset
Start-Sleep -Seconds 10
Start-Process "$env:LOCALAPPDATA\Microsoft\OneDrive\OneDrive.exe"
Write-Host "OneDrive reset complete. Sign in with new credentials."
```

> **Note:** `/reset` does not delete cloud files. It resets the local sync engine state and clears all cached tokens.

---

## 5. Step 4 — Clear Stale Credentials from Windows Credential Manager

> Windows Credential Manager stores cached passwords and tokens. After an Okta password change, old entries cause repeated auth failures.

### Manual Steps

| Step | Action |
|------|--------|
| 1 | Open **Control Panel > Credential Manager** |
| 2 | Click **Windows Credentials** |
| 3 | Look for entries containing: `MicrosoftOffice`, `OneDrive`, `Okta`, `MicrosoftAccount`, `live.com` |
| 4 | Click each one and select **Remove** |
| 5 | Reboot or restart the affected apps |

### PowerShell — Remove Microsoft/Okta Credential Entries

```powershell
# List all Microsoft/Okta credentials stored in Credential Manager
cmdkey /list | Where-Object { $_ -match "Microsoft|Okta|OneDrive|live" }

# Remove specific entries (repeat for each target)
# cmdkey /delete:"target-name-here"

# Remove all MicrosoftOffice16 cached credentials
$creds = cmdkey /list | Select-String "MicrosoftOffice16"
foreach ($c in $creds) {
    $target = ($c -split "Target: ")[1].Trim()
    cmdkey /delete:$target
}
Write-Host "Stale Office credentials removed."
```

---

## 6. Step 5 — Verify Everything is Working

| Check | Expected Result |
|-------|-----------------|
| Office app opens without sign-in prompt | Token accepted — auth is working |
| OneDrive cloud icon shows green checkmark | Sync is active and healthy |
| CPU usage back to normal (< 10% idle) | OneDrive sync loop resolved |
| Teams shows online status | Teams token refreshed |
| Okta dashboard shows active session | SSO session is live |

### Quick CPU/OneDrive Check (PowerShell)

```powershell
Get-Process OneDrive | Select-Object Name, CPU, WorkingSet | Format-Table -AutoSize
```

> If CPU is still high after completing all steps, reboot the machine. A reboot clears all in-memory token caches and forces a clean re-auth.

---

## 7. Quick Reference — One-Liners

| Task | Command |
|------|---------|
| Kill all Office processes | `Get-Process WINWORD,EXCEL,OUTLOOK,TEAMS -ErrorAction SilentlyContinue \| Stop-Process -Force` |
| Stop OneDrive | `Stop-Process -Name OneDrive -Force` |
| Reset OneDrive | `& "$env:LOCALAPPDATA\Microsoft\OneDrive\OneDrive.exe" /reset` |
| Restart OneDrive | `Start-Process "$env:LOCALAPPDATA\Microsoft\OneDrive\OneDrive.exe"` |
| Check OneDrive CPU | `Get-Process OneDrive \| Select-Object Name, CPU, WorkingSet` |
| List credential entries | `cmdkey /list` |

---

> **Summary:** After an Okta password change — always start at the Okta dashboard, launch Office apps from the app tile to pass a fresh token, unlink and re-link OneDrive, and clear stale credentials from Windows Credential Manager. A reboot after completing all steps ensures a clean slate.

[Back to SOP Index](./README.md)
