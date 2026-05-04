# 🚶 Departing Employee IT Checklist

**Tag:** Offboarding

Securely offboard a departing employee from Microsoft 365 and company systems.

> ⚠️ Complete these steps on or before the employee's last day.

---

## Step 1 — Block Sign-In (PowerShell)

> Run in PowerShell as Admin

```powershell
# Connect to Microsoft Graph
Connect-MgGraph -Scopes "User.ReadWrite.All"

# Block sign-in for the departing user
Update-MgUser -UserId "user@domain.com" -AccountEnabled:$false
```

---

## Step 2 — Revoke All Active Sessions (PowerShell)

```powershell
# Revoke all refresh tokens / active sessions immediately
Revoke-MgUserSignInSession -UserId "user@domain.com"
```

---

## Step 3 — Reset Password (PowerShell)

```powershell
# Set a new random password to lock out the user
$newPassword = @{
    Password = "TempP@ss" + (Get-Random -Maximum 9999)
    ForceChangePasswordNextSignIn = $false
}
Update-MgUser -UserId "user@domain.com" -PasswordProfile $newPassword
```

---

## Step 4 — Remove from Distribution Groups (PowerShell)

```powershell
# Connect to Exchange Online
connect-exchangeonline -ShowBanner:$false

# Remove from All Users group
Remove-DistributionGroupMember `
    -Identity "#All Users" `
    -Member "user@domain.com" `
    -Confirm:$false

# Check all groups the user belongs to and remove as needed
Get-DistributionGroup | Where-Object {
    (Get-DistributionGroupMember $_.Identity | Select-Object -ExpandProperty PrimarySmtpAddress) -contains "user@domain.com"
} | ForEach-Object {
    Remove-DistributionGroupMember -Identity $_.Identity -Member "user@domain.com" -Confirm:$false
}
```

---

## Step 5 — Convert Mailbox to Shared (PowerShell)

```powershell
# Convert mailbox to shared so email is retained without a license
Set-Mailbox -Identity "user@domain.com" -Type Shared
```

---

## Step 6 — Remove License (PowerShell)

```powershell
# Connect to Microsoft Graph
Connect-MgGraph -Scopes "User.ReadWrite.All","Directory.ReadWrite.All"

# Get the user and their assigned licenses
$user = Get-MgUser -Filter "userPrincipalName eq 'user@domain.com'"
$licenses = (Get-MgUserLicenseDetail -UserId $user.Id).SkuId

# Remove all licenses
Set-MgUserLicense -UserId $user.Id `
    -AddLicenses @() `
    -RemoveLicenses $licenses
```

---

## Step 7 — Set Out-of-Office Auto-Reply (PowerShell)

```powershell
# Set automatic reply so senders know the person has left
Set-MailboxAutoReplyConfiguration `
    -Identity "user@domain.com" `
    -AutoReplyState Enabled `
    -InternalMessage "This employee is no longer with the company. Please contact manager@domain.com." `
    -ExternalMessage "This employee is no longer with the company. Please contact manager@domain.com."
```

---

## Step 8 — Grant Mailbox Access to Manager (PowerShell)

```powershell
# Give the manager full access to the former employee's mailbox
Add-MailboxPermission `
    -Identity "user@domain.com" `
    -User "manager@domain.com" `
    -AccessRights FullAccess `
    -InheritanceType All
```

---

## Step 9 — Remove from Azure AD / Security Groups (Admin Center)

| # | What to do | How to do it |
|---|------------|--------------|
| 1 | Open M365 Admin > Groups | Remove user from any security or M365 groups |
| 2 | Remove from Microsoft Teams | Open Teams Admin > Users > find user > remove from teams |
| 3 | Remove from shared drives | Check SharePoint/OneDrive and revoke access |

---

## Step 10 — Final Checks

| # | Check | Expected Result |
|---|-------|-----------------|
| 1 | Sign-in blocked | User cannot log in |
| 2 | Sessions revoked | All devices signed out |
| 3 | Mailbox converted to shared | No license consumed |
| 4 | Auto-reply active | Senders receive OOO message |
| 5 | License removed | Freed up in M365 Admin |
| 6 | Removed from all groups | Verified in Exchange Admin |
| 7 | Manager has mailbox access | Verified in Exchange Admin |
| 8 | Email forwarding set | Points to manager's address |
| 9 | Equipment returned or wiped | All devices accounted for |

---

## Step 11 — Forward Email to Manager (PowerShell)

```powershell
# Connect to Exchange Online
connect-exchangeonline -ShowBanner:$false

# Forward all incoming email to manager
Set-Mailbox -Identity "user@domain.com" `
    -ForwardingSmtpAddress "manager@domain.com" `
    -DeliverToMailboxAndForward $false
```

> **Note:** Set `-DeliverToMailboxAndForward $true` if you want a copy kept in the original mailbox as well.

---

## Step 12 — Equipment Return Checklist

| # | Item | Action | Notes |
|---|------|--------|-------|
| 1 | Laptop / Desktop | Collected and wiped | Remote wipe via Intune if not returned |
| 2 | Phone / Mobile device | Collected and factory reset | Remote wipe via Intune if not returned |
| 3 | Chargers & cables | Collected | Check for laptop charger, phone charger |
| 4 | Key fobs / badge | Collected and deactivated | Notify building security |
| 5 | Headset / peripherals | Collected | Log in asset tracker |
| 6 | Company credit card | Collected and cancelled | Notify finance/accounting |
| 7 | Parking pass | Collected | Return to office manager |

### Remote Wipe via Intune (PowerShell)

```powershell
# Install Microsoft Graph if needed
# Install-Module Microsoft.Graph -Force

Connect-MgGraph -Scopes "DeviceManagementManagedDevices.ReadWrite.All"

# Find the device by user
$devices = Get-MgUserManagedDevice -UserId "user@domain.com"

# Wipe each device
foreach ($device in $devices) {
    Write-Host "Wiping device: $($device.DeviceName)"
    Clear-MgDeviceManagementManagedDevice -ManagedDeviceId $device.Id
}
```

> ⚠️ **This wipe is irreversible.** Confirm the device has been recovered or is unrecoverable before running.

---
[Back to SOP Index](./README.md)