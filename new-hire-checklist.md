# 👤 New Hire IT Checklist

**Tag:** New Hire

Complete IT setup for a new employee in Microsoft 365.

---

## Step 1 — Create the M365 Account

| # | What to do | How to do it |
|---|------------|--------------|
| 1 | Go to Microsoft 365 Admin Center | https://admin.microsoft.com > Users > Active Users > Add a user |
| 2 | Fill in name, username, and temp password | Set username as firstname.lastname@domain.com |
| 3 | Assign a license | Check the appropriate M365 license (Business Standard, E3, etc.) |
| 4 | Finish and save | Click Add and close |

---

## Step 2 — Add to Distribution Groups (PowerShell)

> Run in PowerShell as Admin

```powershell
# Connect to Exchange Online
connect-exchangeonline -ShowBanner:$false

# Add to All Users distribution group
Add-DistributionGroupMember `
    -Identity "#All Users" `
    -Member user@domain.com
```

---

## Step 3 — Assign Additional Licenses (PowerShell)

> Run in PowerShell as Admin

```powershell
# Connect to Microsoft Graph
Connect-MgGraph -Scopes "User.ReadWrite.All","Directory.ReadWrite.All"

# Find the user's object ID
$user = Get-MgUser -Filter "userPrincipalName eq 'user@domain.com'"

# Find the license SKU ID (example: Microsoft 365 Business Standard)
$sku = Get-MgSubscribedSku | Where-Object { $_.SkuPartNumber -eq 'O365_BUSINESS_PREMIUM' }

# Assign the license
Set-MgUserLicense -UserId $user.Id `
    -AddLicenses @{SkuId = $sku.SkuId} `
    -RemoveLicenses @()
```

---

## Step 4 — Add to Security Groups / Teams (Admin Center)

| # | What to do | How to do it |
|---|------------|--------------|
| 1 | Open Azure AD or M365 Admin > Groups | Find the relevant department group |
| 2 | Add the new user as a member | Click the group > Members > Add members |
| 3 | Add to Microsoft Teams | Open Teams > find the team > Add member |

---

## Step 5 — Configure Device

| # | What to do | How to do it |
|---|------------|--------------|
| 1 | Enroll in Intune / MDM | Open Company Portal on the device and sign in with work account |
| 2 | Install required apps | Use WinGet bootstrap or Software Center |
| 3 | Map network drives | Use the Drive Management SOP |
| 4 | Set up 8x8 phone | Use the 8x8 Phone System SOP |
| 5 | Verify Teams and Outlook work | Sign in and send a test message / email |

---

## Step 6 — Confirm Setup

| # | Check | Expected Result |
|---|-------|-----------------|
| 1 | Can sign into M365 | Yes |
| 2 | Email receives messages | Yes |
| 3 | Added to All Users group | Verify in Exchange Admin |
| 4 | License assigned | Visible in M365 Admin |
| 5 | Device enrolled in MDM | Visible in Intune |


## Step 7 — Change UPN if Needed (PowerShell)

> Use this if the user's username/email needs to be corrected after initial setup.

```powershell
# Connect to Microsoft Graph
Connect-MgGraph -Scopes "User.ReadWrite.All"

# Change the UPN (login/email address)
Update-MgUser `
    -UserId "oldname@domain.com" `
    -UserPrincipalName "newname@domain.com"

# Verify the change
$user = Get-MgUser -UserId "newname@domain.com" `
    -Property "DisplayName,UserPrincipalName,Mail,AccountEnabled"

$user | Select-Object DisplayName, UserPrincipalName, Mail, AccountEnabled
```

> **Note:** The user must sign out of all devices and sign back in with the new UPN after this change.

---
---
[Back to SOP Index](./README.md)