# ⚡ Power Automate

**Tag:** Automation

Set up automatic tasks so you don't have to do them manually.

## Steps

| # | What to do | How to do it |
|---|------------|--------------|
| 1 | Open Power Automate | Go to flow.microsoft.com and sign in with your Microsoft 365 account. |
| 2 | Create a simple flow | Click Create > Automated cloud flow. Choose a trigger like When an email arrives. |
| 3 | Use a template | Click Templates and search for what you need. Click a template and follow the setup steps. |
| 4 | Test your flow | Click Test in the top right. Choose Manually and click Test. Trigger the action to see if it works. |
| 5 | Fix a broken flow | Go to My flows, click the flow, and check the run history. Click a failed run to see which step failed. |
| 6 | Share a flow | Click the three dots next to your flow > Share. Enter your teammate's email. |

---

## Flow: HR Equipment Return — All Clear Notification

> **Purpose:** When IT confirms all equipment has been returned and wiped during offboarding, this Power Automate flow automatically sends HR an "All Clear" email so they can close out the departing employee's record.

### Trigger
Manually trigger a flow (Power Automate > My Flows > New Flow > Instant cloud flow)

### Flow Steps

| Step | Action | Details |
|------|--------|---------|
| 1 | **Trigger** | Manually trigger a flow — input fields: `Employee Name`, `Employee Email`, `Manager Email`, `Return Date` |
| 2 | **Condition** | Check that all items are confirmed (you can use a Yes/No input or a SharePoint list lookup) |
| 3 | **Send an email (V2)** | To: HR email (e.g. `hr@domain.com`) — Subject: `Equipment Return Confirmed – [Employee Name]` |
| 4 | **Email Body** | Include employee name, return date, list of returned items, and IT sign-off |
| 5 | **Post a Teams message** *(optional)* | Notify the IT channel that offboarding equipment step is complete |
| 6 | **Update SharePoint list** *(optional)* | Mark the offboarding record row as `Equipment Returned = Yes` |

### Sample Email Body (paste into the Send Email body field)

```
Hi HR Team,

This is an automated notification from IT.

Employee: [Employee Name]
Departure Date: [Return Date]

All company equipment has been confirmed returned and processed:
- Laptop / Desktop: Collected and wiped
- Mobile device: Collected and factory reset
- Key fob / Badge: Deactivated
- Chargers and peripherals: Collected

IT has completed all equipment offboarding steps. You are clear to finalize the employee separation record.

Regards,
IT Department
```

### Notes

- Run this flow **after** completing Step 12 (Equipment Return Checklist) in the [Departing Employee Checklist](./departing-employee-checklist.md).
- If using a SharePoint list for offboarding tracking, connect the "Update item" action to mark `EquipmentReturned = Yes` and `ITSignOff = [your name]`.
- HR receives one clean confirmation email — no back-and-forth needed.


---
[Back to SOP Index](./README.md)