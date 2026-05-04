# Lansweeper — Agent, API & Power Automate SOP

> **Purpose:** Guide for IT staff on deploying the Lansweeper agent, using the GraphQL Data API, integrating with Power Automate, and building custom asset reports and tables.

---

## Table of Contents

1. [Lansweeper Agent Deployment](#1-lansweeper-agent-deployment)
2. [API Setup — Authentication & Credentials](#2-api-setup--authentication--credentials)
3. [GraphQL API — Key Queries](#3-graphql-api--key-queries)
4. [Power Automate Integration via HTTP Connector](#4-power-automate-integration-via-http-connector)
5. [Custom Tables & Asset Reporting](#5-custom-tables--asset-reporting)
6. [Useful Links & References](#6-useful-links--references)

---

## 1. Lansweeper Agent Deployment

### What the Agent Does
The Lansweeper LsAgent scans Windows, macOS, and Linux devices that may not be reachable via network scanning (off-site, VPN, or behind firewalls). It reports asset data directly to your Lansweeper Cloud site.

### Deployment Steps

| Step | Action |
|------|--------|
| 1 | Log in to your Lansweeper Site at [app.lansweeper.com](https://app.lansweeper.com) |
| 2 | Go to **Settings > Agent > Download Agent** |
| 3 | Select the OS type (Windows MSI recommended for domain deployment) |
| 4 | Note your **Site Token** — required during install |
| 5 | Deploy via GPO, Intune, or LogMeIn Resolve package |
| 6 | Verify device appears in **Assets** within 15-30 minutes |

### Silent Install (Windows — PowerShell / Intune)

```powershell
# Replace <SiteToken> with your actual token from Lansweeper Settings > Agent
msiexec /i LsAgent.msi /quiet SITE_TOKEN="<SiteToken>"
```

### Verify Agent is Running

```powershell
Get-Service -Name LsAgent | Select-Object Name, Status, StartType
```

> **Tip:** If the device does not appear in Lansweeper after 30 minutes, check that the agent service is running and that outbound HTTPS (port 443) is not blocked.

---

## 2. API Setup — Authentication & Credentials

> **Base Endpoint:** `https://api.lansweeper.com/api/v2/graphql`
> All requests use **HTTP POST** with a JSON body.

### Create an API Client (Personal Access Token)

| Step | Action |
|------|--------|
| 1 | In your Lansweeper Site, go to **Settings (bottom-left) > Developer Tools > API Clients** |
| 2 | Click **Add New API Client** |
| 3 | Select **Personal Access Token (PAT)** |
| 4 | Give it a name (e.g., `PowerAutomate-Integration`) |
| 5 | Copy the **Access Token** — you will not see it again |
| 6 | Store it securely in Azure Key Vault or Power Automate environment variable |

### Required Permissions (Role)

Go to **Configuration > Account Management > Roles & Permissions** and ensure the API client role has:
- View API clients
- Allow API clients to access this site

### Request Headers for All API Calls

```
Content-Type: application/json
Authorization: Bearer <your_access_token>
```

---

## 3. GraphQL API — Key Queries

### Get Authorized Sites (required before asset queries)

```graphql
query {
  authorizedSites {
    sites {
      id
      name
    }
  }
}
```

### Get All Assets for a Site

```graphql
query GetAssets($siteId: String!) {
  site(id: $siteId) {
    assetResources {
      items {
        assetBasicInfo {
          name
          domain
          ipAddress
          mac
          type
          firstSeen
          lastSeen
        }
        assetCustom {
          serialNumber
          manufacturer
          model
        }
        operatingSystem {
          caption
          version
        }
      }
    }
  }
}
```

### Variables block
```json
{
  "siteId": "<your-site-id>"
}
```

### Get Installed Software for an Asset

```graphql
query GetSoftware($siteId: String!, $assetId: String!) {
  site(id: $siteId) {
    asset(id: $assetId) {
      software {
        name
        version
        publisher
        installDate
      }
    }
  }
}
```

### Get Custom Fields for Assets

```graphql
query GetCustomFields($siteId: String!) {
  site(id: $siteId) {
    assetResources {
      items {
        assetBasicInfo { name }
        assetCustom {
          fields {
            name
            value
          }
        }
      }
    }
  }
}
```

---

## 4. Power Automate Integration via HTTP Connector

> Use the **HTTP** action (premium connector) in Power Automate to query the Lansweeper GraphQL API.

### Flow: Query Lansweeper Assets on Schedule

| Step | Action | Detail |
|------|--------|--------|
| 1 | **Trigger** | Recurrence — Daily or on-demand |
| 2 | **Initialize Variable** | Name: `SiteId` / Value: your Lansweeper Site ID |
| 3 | **HTTP Action** | Method: `POST` / URI: `https://api.lansweeper.com/api/v2/graphql` |
| 4 | **Headers** | `Content-Type: application/json` / `Authorization: Bearer <token>` |
| 5 | **Body** | GraphQL query JSON (see below) |
| 6 | **Parse JSON** | Use the response schema to parse asset data |
| 7 | **Apply to Each** | Loop through asset items |
| 8 | **Action** | Update SharePoint list, send Teams alert, or write to Excel |

### HTTP Action Body (paste into Body field)

```json
{
  "query": "query GetAssets($siteId: String!) { site(id: $siteId) { assetResources { items { assetBasicInfo { name ipAddress mac type lastSeen } assetCustom { serialNumber model } operatingSystem { caption } } } } }",
  "variables": {
    "siteId": "@{variables('SiteId')}"
  }
}
```

### Store the Token Securely

Do **not** hardcode the API token in the HTTP action. Instead:
- Store it as a **Power Automate Environment Variable** (type: Secret)
- Or retrieve it from **Azure Key Vault** using the Key Vault connector
- Reference it in the Authorization header as `Bearer @{variables('LansweeperToken')}`

### Recommended Flow Use Cases

| Use Case | Trigger | Output |
|----------|---------|--------|
| Daily asset inventory snapshot | Recurrence | SharePoint list update |
| New device alert | Recurrence + condition on `firstSeen` date | Teams notification |
| Offboarding asset verification | Manually triggered | HR confirmation email via PA |
| Software compliance check | Recurrence | Flag devices missing required apps |

---

## 5. Custom Tables & Asset Reporting

### Creating Custom Fields in Lansweeper

| Step | Action |
|------|--------|
| 1 | Go to **Configuration > Asset Pages > Custom Fields** |
| 2 | Click **Add Field** — choose type: Text, Number, Date, or Dropdown |
| 3 | Name it clearly (prefix with dept, e.g., `IT_AssetTag`, `HR_AssignedUser`) |
| 4 | Fields appear on individual asset pages and in reports |
| 5 | In the GraphQL API, custom fields are under `assetCustom.fields` |

### Building Custom Reports

| Step | Action |
|------|--------|
| 1 | Go to **Reports > Create New Report** |
| 2 | Select asset type (Windows, Network, All assets, etc.) |
| 3 | Add columns — custom fields are available under the **Custom** category |
| 4 | Filter by OS, last seen date, asset type, IP range, or custom field value |
| 5 | Save and optionally **Expose to API** (for Power BI or PA use) |
| 6 | Pin report to Dashboard as a **Table widget** for at-a-glance view |

### Expose Report to API (for Power BI / Power Automate)

1. Open your saved report
2. Click **Report Settings > Expose to API**
3. Use the report ID in your GraphQL query under `authorizedReports`
4. Query it via PA HTTP connector on a schedule to feed Power BI or SharePoint

### Custom Dashboard Widgets

| Widget Type | Best For |
|-------------|----------|
| **Table** | Show report results at a glance (e.g., assets not seen in 30 days) |
| **Report Overview** | Alert-style list of reports needing attention |
| **Count** | Total assets, Windows vs Mac, online vs offline |
| **Chart** | OS distribution, asset type breakdown |

---

## 6. Useful Links & References

| Resource | URL |
|----------|-----|
| Lansweeper Developer Portal | https://developer.lansweeper.com |
| GraphQL API Quickstart | https://developer.lansweeper.com/docs/data-api/get-started/quickstart/ |
| GraphQL Endpoint | https://api.lansweeper.com/api/v2/graphql |
| API Types Reference | https://developer.lansweeper.com/docs/data-api/reference/types/ |
| Lansweeper App (login) | https://app.lansweeper.com |
| Custom Fields Guide | https://www.lansweeper.com/blog/pro-tips/consolidating-your-custom-fields/ |
| Importing Data via API | https://www.lansweeper.com/blog/pro-tips/importing-data-with-the-lansweeper-api/ |

---

[Back to SOP Index](./README.md)
