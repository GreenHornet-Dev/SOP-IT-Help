/*================================================================
  Clippy - CDS Training Site Chatbot v4
  Features: sopData, WINGET_APPS, PRODUCT CATALOG, sop-topics.json
            NEW: quick-action chips, page-aware context,
                 follow-up suggestions, Ctrl+K shortcut
================================================================*/

(function () {

    const FLAGS = '--scope Machine --silent --accept-source-agreements --accept-package-agreements';

    /* == CSS == */
    const style = document.createElement('style');
    style.textContent = `
    #clippy-btn{position:fixed;bottom:28px;right:28px;z-index:9999;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#00ff64,#00c84a);border:none;cursor:pointer;box-shadow:0 4px 18px rgba(0,255,100,.4);font-size:26px;display:flex;align-items:center;justify-content:center;transition:transform .2s,box-shadow .2s;}
    #clippy-btn:hover{transform:scale(1.1);box-shadow:0 6px 24px rgba(0,255,100,.6);}
    #clippy-badge{position:fixed;bottom:69px;right:25px;background:#ff4444;color:#fff;border-radius:12px;padding:3px 8px;font-size:12px;font-weight:600;pointer-events:none;}
    #clippy-window{position:fixed;bottom:90px;right:20px;width:420px;max-height:550px;background:#0d0d1a;border-radius:12px;box-shadow:0 8px 32px rgba(0,255,100,.3);display:flex;flex-direction:column;gap:10px;opacity:0;transform:translateY(20px);pointer-events:none;transition:opacity .3s,transform .3s;z-index:9998;}
    #clippy-window.open{opacity:1;transform:translateY(0);pointer-events:auto;}
    #clippy-header{background:linear-gradient(135deg,#00ff64,#00c84a);color:#000;padding:12px;border-radius:12px 12px 0 0;display:flex;justify-content:space-between;align-items:center;font-weight:600;}
    #clippy-close{background:none;border:none;font-size:24px;cursor:pointer;color:#000;transition:transform .2s;}
    #clippy-close:hover{transform:rotate(90deg);}
    #clippy-messages{flex:1;overflow-y:auto;padding:12px;max-height:400px;min-height:200px;scrollbar-width:thin;background-image:linear-gradient(rgba(13,13,26,0.8),rgba(13,13,26,0.8)),url("https://greenhornet-dev.github.io/cds-green/Green-Hornet-Warrior.jpg");background-color:#0d0d1a;background-blend-mode:normal,screen;background-repeat:no-repeat;background-position:center center;background-size:auto 150px;}
    #clippy-msg-bot{background:#1a1a2e;border-radius:8px;padding:12px;margin-bottom:10px;border-left:4px solid #00ff64;font-size:14px;}
    #clippy-msg-user{background:#222;border-radius:8px;padding:10px;margin-bottom:8px;text-align:right;border-left:4px solid #666;}
    #clippy-result-hover{background:#0f0f1a;border-radius:8px;padding:10px;margin:8px 0;border-left:4px solid #00ff64;}
    #clippy-result-hover-line{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;}
    #clippy-result-hover-name{font-family:monospace;font-size:12px;color:#00ff64;flex:1;margin-right:10px;}
    #clippy-result-hover-copy-btn{background:#00ff64;color:#000;border:none;padding:6px 12px;border-radius:6px;font-weight:600;cursor:pointer;transition:background .2s;}
    #clippy-result-hover-copy-btn:hover{background:#00c84a;}
    #clippy-result-title{font-weight:700;color:#00ff64;}
    #clippy-result-text{color:#bbb;margin-top:4px;font-size:13px;}
    #clippy-cmd-box{font-family:monospace;background:#0d0d1a;padding:8px;border-left:4px solid #00ff64;margin-top:6px;}
    #clippy-cmd-text{font-family:monospace;background:#0d0d1a;color:#00ff64;font-size:12px;margin:8px 0;padding:8px;border-radius:4px;user-select:all;cursor:pointer;transition:background .15s;}
    #clippy-cmd-text:hover{background:#1a1a2e;}
    #clippy-copy-btn{background:#00ff64;color:#000;border:none;padding:6px 12px;margin-top:8px;border-radius:6px;font-weight:600;cursor:pointer;font-size:12px;transition:background .2s;}
    #clippy-copy-btn:hover{background:#00c84a;}
    #clippy-copy-btn:active{background:#00a039;}
    #clippy-chips{display:flex;flex-wrap:wrap;gap:6px;padding:6px 12px 4px;}
    .clippy-chip{background:transparent;border:1px solid #00ff64;color:#00ff64;padding:4px 10px;border-radius:14px;font-size:11px;cursor:pointer;transition:all .15s;white-space:nowrap;font-family:inherit;}
    .clippy-chip:hover{background:#00ff64;color:#000;}
    .clippy-code-copy{background:transparent;border:1px solid #333;color:#888;padding:1px 5px;border-radius:4px;font-size:10px;cursor:pointer;margin-left:4px;transition:all .15s;vertical-align:middle;}
    .clippy-code-copy:hover{border-color:#00ff64;color:#00ff64;}
    #clippy-input-row{display:flex;gap:8px;padding:0 10px 10px;}
    #clippy-input{flex:1;padding:10px;background:#1a1a2e;border:1px solid #333;border-radius:8px;color:#fff;font-size:14px;outline:none;}
    #clippy-input:focus{border-color:#00ff64;background:#0f0f1a;}
    #clippy-send{background:#00ff64;color:#000;border:none;width:40px;height:40px;border-radius:8px;font-size:18px;cursor:pointer;font-weight:600;transition:all .2s;}
    #clippy-send:hover{background:#00c84a;transform:scale(1.1);}
    .product-item{background:#0f0f1a;border-left:4px solid #00ff64;padding:10px;margin:6px 0;border-radius:6px;display:flex;justify-content:space-between;align-items:center;}
    .product-name{color:#00ff64;font-weight:600;}
    .product-price{color:#fff;font-size:14px;margin-left:10px;}
    .product-add-btn{background:#00ff64;color:#000;border:none;padding:5px 10px;border-radius:4px;cursor:pointer;font-size:11px;font-weight:600;transition:background .2s;}
    .product-add-btn:hover{background:#00c84a;}
    .quote-item{background:#1a1a2e;padding:8px;border-radius:4px;margin:4px 0;display:flex;justify-content:space-between;}
    .quote-remove{background:#ff4444;color:#fff;border:none;padding:3px 8px;border-radius:3px;cursor:pointer;font-size:10px;}
    `;
    document.head.appendChild(style);

    /* == HTML == */
    document.body.insertAdjacentHTML('beforeend', `
    <div id="clippy-btn" title="Ask Clippy" onclick="clippyToggle()">📎<div id="clippy-badge"></div></div>
    <div id="clippy-window">
      <div id="clippy-header">
        <span>📎 Clippy — IT Assistant & Shop</span>
        <button id="clippy-close" onclick="clippyToggle()">×</button>
      </div>
      <div id="clippy-messages"></div>
      <div id="clippy-chips"></div>
      <div id="clippy-input-row">
        <input id="clippy-input" type="text" placeholder="SOPs, tips, winget install, shop items..." onkeydown="if(event.key==='Enter')clippySend()"/>
        <button id="clippy-send" onclick="clippySend()">↑</button>
      </div>
    </div>
    `);

    /* == State == */
    let isOpen = false;
    let hasGreeted = false;
    let quoteList = [];
    let sopTopics = [];
    let poState = null;
    let poData = {};

    /* == Load SOP Topics == */
    fetch('./sop-topics.json')
        .then(r => r.json())
        .then(data => { sopTopics = data; })
        .catch(() => {});

    /* == PRODUCT CATALOG == */
    const PRODUCT_CATALOG = [
        { name: "Dell Latitude 5420 Laptop", category: "Laptops", price: 1299, sku: "LAT-5420" },
        { name: "Dell OptiPlex 7090 Desktop", category: "Desktops", price: 1099, sku: "OPT-7090" },
        { name: "HP EliteBook 840 G8", category: "Laptops", price: 1399, sku: "ELT-840" },
        { name: "Lenovo ThinkPad X1 Carbon", category: "Laptops", price: 1599, sku: "X1-CARB" },
        { name: "Dell UltraSharp 27\" Monitor U2723DE", category: "Monitors", price: 549, sku: "U27-23" },
        { name: "LG 34\" Ultrawide Monitor 34WP65C", category: "Monitors", price: 399, sku: "LG-34WP" },
        { name: "Logitech MX Master 3S Mouse", category: "Peripherals", price: 99, sku: "MX-M3S" },
        { name: "Logitech MX Keys Keyboard", category: "Peripherals", price: 119, sku: "MX-KEY" },
        { name: "HP LaserJet Pro M404dn Printer", category: "Printers", price: 279, sku: "HP-M404" },
        { name: "Canon imageCLASS MF445dw Printer", category: "Printers", price: 329, sku: "CAN-445" },
        { name: "Cisco Catalyst 2960-X Switch 24-Port", category: "Networking", price: 1899, sku: "C29-24" },
        { name: "Ubiquiti UniFi Dream Machine Pro", category: "Networking", price: 379, sku: "UDM-PRO" },
        { name: "Synology DS920+ 4-Bay NAS", category: "Storage", price: 549, sku: "SYN-920" },
        { name: "WD Red Plus 4TB NAS HDD", category: "Storage", price: 109, sku: "WD-4TB" },
        { name: "Samsung 980 Pro 1TB NVMe SSD", category: "Storage", price: 129, sku: "SAM-980" },
        { name: "Microsoft Surface Pro 9", category: "Laptops", price: 1299, sku: "SUR-P9" },
        { name: "Apple MacBook Pro 14\" M3", category: "Laptops", price: 1999, sku: "MBP-14" },
        { name: "Lenovo ThinkCentre M90q Tiny", category: "Desktops", price: 899, sku: "M90Q" },
        { name: "APC Back-UPS Pro 1500VA", category: "Power", price: 229, sku: "APC-1500" },
        { name: "CyberPower CP1500PFCLCD UPS", category: "Power", price: 219, sku: "CP-1500" },
        { name: "Yealink T54W IP Phone", category: "VoIP", price: 189, sku: "YEA-T54" },
        { name: "Poly VVX 450 Business Phone", category: "VoIP", price: 249, sku: "POLY-450" },
        { name: "Jabra Evolve2 65 Headset", category: "Audio", price: 179, sku: "JAB-E265" },
        { name: "Logitech Rally Bar Video System", category: "Video", price: 2999, sku: "RALLY" },
        { name: "TP-Link Omada EAP660 HD Access Point", category: "Networking", price: 199, sku: "EAP-660" }
    ];

    /* == WINGET APPS — synced with winget-one-liners.html == */
    const WINGET_APPS = [
      // Core Apps
      {label:'Google Chrome',              cmd:'winget install -e --id Google.Chrome --scope Machine --silent',                       apps:['chrome','google chrome','browser','google']},
      {label:'Mozilla Firefox',            cmd:'winget install -e --id Mozilla.Firefox --scope Machine --silent',                     apps:['firefox','mozilla','firefox browser']},
      {label:'Adobe Acrobat Reader 64-bit',cmd:'winget install -e --id Adobe.Acrobat.Reader.64-bit --scope Machine --silent',         apps:['adobe reader','pdf reader','acrobat','adobe acrobat']},
      {label:'Zoom',                       cmd:'winget install -e --id Zoom.Zoom --scope Machine --silent',                           apps:['zoom','video conference','zoom meeting']},
      {label:'Microsoft Teams',            cmd:'winget install -e --id Microsoft.Teams --scope Machine --silent',                     apps:['teams','microsoft teams']},
      {label:'8x8 Work',                   cmd:'winget install -e --id 8x8.Work --scope Machine --silent',                            apps:['8x8','8x8 work','eight by eight']},
      {label:'7-Zip',                      cmd:'winget install -e --id 7zip.7zip --scope Machine --silent',                           apps:['7zip','archive','zip','7-zip']},
      {label:'WinSCP',                     cmd:'winget install -e --id WinSCP.WinSCP --scope Machine --silent',                       apps:['winscp','sftp','ftp client']},
      {label:'Notepad++',                  cmd:'winget install -e --id Notepad++.Notepad++ --scope Machine --silent',                 apps:['notepad++','notepad plus','notepadpp']},
      {label:'VS Code',                    cmd:'winget install -e --id Microsoft.VisualStudioCode --scope Machine --silent',          apps:['vscode','visual studio code','code editor','vs code']},
      {label:'VLC Media Player',           cmd:'winget install -e --id VideoLAN.VLC --scope Machine --silent',                        apps:['vlc','media player','video player','vlc media']},
      {label:'IrfanView',                  cmd:'winget install -e --id IrfanSkiljan.IrfanView --scope Machine --silent',              apps:['irfanview','image viewer','irfan']},
      {label:'PuTTY',                      cmd:'winget install -e --id PuTTY.PuTTY --scope Machine --silent',                         apps:['putty','ssh client']},
      {label:'CrystalDiskInfo',            cmd:'winget install -e --id CrystalDewWorld.CrystalDiskInfo --scope Machine --silent',     apps:['crystaldiskinfo','disk info','disk health','crystal disk']},
      {label:'Malwarebytes',               cmd:'winget install -e --id Malwarebytes.Malwarebytes --scope Machine --silent',           apps:['malwarebytes','malware','malwarebyte']},
      {label:'.NET 8 Desktop Runtime',     cmd:'winget install -e --id Microsoft.DotNet.DesktopRuntime.8 --scope Machine --silent',   apps:['.net 8 runtime','dotnet runtime','desktop runtime','.net 8']},
      {label:'Dell Command Update',        cmd:'winget install -e --id Dell.CommandUpdate --scope Machine --silent',                  apps:['dell command update','dcu','dell update','dell command']},
      // Help Desk Utilities
      {label:'PowerShell 7',               cmd:'winget install -e --id Microsoft.PowerShell --scope Machine --silent',               apps:['powershell','pwsh','powershell 7','ps7']},
      {label:'Git',                        cmd:'winget install -e --id Git.Git --scope Machine --silent',                             apps:['git','git scm']},
      {label:'mRemoteNG',                  cmd:'winget install -e --id mRemoteNG.mRemoteNG --scope Machine --silent',                 apps:['mremoteng','rdp manager','remote desktop manager','mremote']},
      {label:'Tailscale',                  cmd:'winget install -e --id Tailscale.Tailscale --scope Machine --silent',                 apps:['tailscale','mesh vpn','tailscale vpn']},
      {label:'Rufus',                      cmd:'winget install -e --id Rufus.Rufus --scope Machine --silent',                         apps:['rufus','bootable usb','boot usb','usb tool']},
      {label:'Greenshot',                  cmd:'winget install -e --id Greenshot.Greenshot --scope Machine --silent',                 apps:['greenshot','screenshot greenshot']},
      {label:'HWiNFO64',                   cmd:'winget install -e --id REALiX.HWiNFO --scope Machine --silent',                      apps:['hwinfo','hwinfo64','hardware info','hardware monitor']},
      {label:'TreeSize Free',              cmd:'winget install -e --id JAMSoftware.TreeSize.Free --scope Machine --silent',           apps:['treesize','tree size','disk space','treesize free']},
      {label:'Process Monitor',            cmd:'winget install -e --id Microsoft.Sysinternals.ProcessMonitor --scope Machine --silent',apps:['process monitor','procmon','sysinternals process']},
      // Additional
      {label:'Microsoft Edge',             cmd:'winget install -e --id Microsoft.Edge --scope Machine --silent',                      apps:['edge','microsoft edge']},
      {label:'Slack',                      cmd:'winget install -e --id Slack.Slack --scope Machine --silent',                         apps:['slack','slack chat']},
      {label:'Python 3',                   cmd:'winget install -e --id Python.Python.3.11 --scope Machine --silent',                  apps:['python','python3']},
      {label:'Node.js',                    cmd:'winget install -e --id OpenJS.NodeJS --scope Machine --silent',                       apps:['nodejs','node','npm']},
      {label:'.NET SDK 8',                 cmd:'winget install -e --id Microsoft.DotNet.SDK.8 --scope Machine --silent',              apps:['dotnet sdk','.net sdk','dotnet 8 sdk']},
      {label:'Docker Desktop',             cmd:'winget install -e --id Docker.DockerDesktop --scope Machine --silent',                apps:['docker','docker desktop','containers']},
      {label:'OBS Studio',                 cmd:'winget install -e --id OBSProject.OBSStudio --scope Machine --silent',                apps:['obs','obs studio','screen recorder']},
      {label:'Microsoft PowerToys',        cmd:'winget install -e --id Microsoft.PowerToys --scope Machine --silent',                 apps:['powertoys','power toys','windows utilities']},
      {label:'Winget — Upgrade All Apps',  cmd:'winget upgrade --all --scope Machine --silent',                                       apps:['upgrade all','winget upgrade all','update all apps']},
      // RSAT — Windows Features (Add-WindowsCapability)
      {label:'RSAT — Install All',         cmd:'Get-WindowsCapability -Name RSAT* -Online | Add-WindowsCapability -Online',           apps:['rsat','remote server admin','install all rsat','rsat tools']},
      {label:'RSAT: Active Directory',     cmd:'Add-WindowsCapability -Online -Name "Rsat.ActiveDirectory.DS-LDS.Tools~~~~0.0.1.0"', apps:['rsat active directory','rsat ad','ad tools rsat']},
      {label:'RSAT: Group Policy (GPMC)',  cmd:'Add-WindowsCapability -Online -Name "Rsat.GroupPolicy.Management.Tools~~~~0.0.1.0"',  apps:['rsat gpmc','rsat group policy','gpmc rsat']},
      {label:'RSAT: DNS',                  cmd:'Add-WindowsCapability -Online -Name "Rsat.Dns.Tools~~~~0.0.1.0"',                    apps:['rsat dns','dns tools rsat']},
      {label:'RSAT: DHCP',                 cmd:'Add-WindowsCapability -Online -Name "Rsat.DHCP.Tools~~~~0.0.1.0"',                   apps:['rsat dhcp','dhcp tools rsat']},
    ];

    /* == Toggle Window == */
    /* == Page Context == */
    function getPageContext() {
        const p = window.location.pathname.toLowerCase();
        if (p.includes('sop-portal'))           return 'sop-portal';
        if (p.includes('printer'))              return 'sop-printer';
        if (p.includes('okta'))                 return 'sop-okta';
        if (p.includes('email'))                return 'sop-email';
        if (p.includes('help-desk'))            return 'sop-helpdesk';
        if (p.includes('windows-update'))       return 'sop-updates';
        if (p.includes('microsoft-teams'))      return 'sop-teams';
        if (p.includes('office-apps'))          return 'sop-office';
        if (p.includes('zoom'))                 return 'sop-zoom';
        if (p.includes('drive-management'))     return 'sop-drive';
        if (p.includes('new-hire'))             return 'sop-newhire';
        if (p.includes('departing'))            return 'sop-offboard';
        if (p.includes('power-automate'))       return 'sop-automate';
        if (p.includes('lansweeper'))           return 'sop-lansweeper';
        if (p.includes('logmein'))              return 'sop-logmein';
        if (p.includes('crowdstrike'))          return 'sop-crowdstrike';
        if (p.includes('winget-one-liners'))    return 'sop-winget';
        if (p.includes('copilot-studio'))       return 'sop-copilot-studio';
        if (p.includes('work-tools-query'))     return 'sop-worktools';
        if (p.includes('python-vs-java'))       return 'sop-python';
        if (p.includes('vscode-dev-sop'))       return 'sop-vscode';
        if (p.includes('training'))             return 'training';
        if (p.includes('services'))             return 'services';
        if (p.includes('shop'))                 return 'shop';
        return 'default';
    }

    const PAGE_CHIPS = {
        'sop-portal':   ['🖨️ Printer Fix','🔑 Password Reset','🔄 Windows Update','📚 Browse Topics','⌨️ Shortcuts'],
        'sop-printer':  ['🖨️ Clear Queue','🔌 Update Driver','➕ Add Printer','📋 All SOPs'],
        'sop-okta':     ['🔐 Okta Login','🔐 Change Password','📧 Fix Office 365 token','🔄 Fix OneDrive sync','📋 All SOPs'],
        'sop-email':    ['📧 Email Fix','📅 Out of Office','🔑 Password Reset','📋 All SOPs'],
        'sop-helpdesk': ['🎫 My Tickets','🔑 Password Reset','🔓 Unlock Account','🖥️ Remote Desktop','⚙️ Work Config'],
        'sop-updates':  ['🔄 Windows Update','🖥️ Dell Command Update','🧹 Clear Update Cache','📋 All SOPs'],
        'sop-teams':    ['💬 Teams Fix','📞 Teams Audio','🔄 Windows Update','📋 All SOPs'],
        'sop-office':   ['⌨️ Office Shortcuts','🔧 Repair Office','🔄 Update Office','📋 All SOPs'],
        'sop-zoom':     ['📹 Zoom Fix','🎤 Audio Fix','🔄 Windows Update','📋 All SOPs'],
        'sop-drive':    ['💾 Map Network Drive','🧹 Disk Cleanup','📋 All SOPs'],
        'sop-newhire':  ['🔑 Password Setup','🖨️ Add Printer','💬 Install Teams','📋 All SOPs'],
        'sop-offboard': ['🔑 Disable Account','🖨️ Remove Printers','📋 All SOPs'],
        'sop-automate':   ['⚡ My Flows','🎫 My Tickets','🧪 Test Flow','⚙️ Work Config','📋 All SOPs'],
        'sop-lansweeper': ['🔍 Find Asset','🎫 My Tickets','⚡ My Flows','⚙️ Work Config','📋 All SOPs'],
        'sop-logmein':    ['🖥️ Start Session','🔑 Password Reset','🔍 Lansweeper','🛡️ CrowdStrike','📋 All SOPs'],
        'sop-crowdstrike':['🛡️ Respond to Detection','🔒 Contain Host','🖥️ RTR Session','🔍 Lansweeper','📋 All SOPs'],
        'sop-winget':   ['📋 Copy All Apps','🌐 Install Chrome','💬 Install Teams','📝 Install Notepad++','📋 All SOPs'],
        'sop-copilot-studio': ['🔑 Renew Azure Secret','📂 Fix SharePoint Knowledge','⚡ Fix Broken Flow','📋 Expiry Schedule','📋 All SOPs'],
        'sop-worktools': ['🗄️ SQL Queries','⬡ GraphQL','🎫 JQL Presets','🔗 Portal Queries','⚙️ Work Config'],
        'sop-python':   ['🐍 Python vs Java','📦 Key Libraries','🚀 Getting Started','🗺️ Learning Path','📋 All SOPs'],
        'sop-vscode':   ['🔌 Extensions','📡 API Calls','🗂️ Parsing','⚡ Power Automate','🏷️ SharePoint Labels'],
        'training':     ['📋 Browse SOPs','🖨️ Printer Fix','🔑 Password Reset','🛒 Shop Gear'],
        'services':     ['💰 Get a Quote','🛒 Shop Laptops','🖥️ Shop Monitors','📞 Services'],
        'shop':         ['🛒 Shop Laptops','🖥️ Shop Monitors','🖨️ Shop Printers','💰 View Quote'],
        'default':      ['🎫 My Tickets','🖨️ Printer Fix','🔑 Password Reset','📚 Browse Topics','⚙️ Work Config'],
    };

    const PAGE_GREETINGS = {
        'sop-portal':   "📋 SOP Portal — search any procedure or ask an IT question.",
        'sop-printer':  "🖨️ Printer page — ask me about stuck queues, drivers, or adding printers.",
        'sop-email':    "📧 Email page — ask about Outlook setup, out-of-office, or sync issues.",
        'sop-helpdesk': "🎟️ Help Desk page — password resets, unlocks, remote support, performance fixes.",
        'sop-updates':  "🔄 Windows Updates page — ask about forcing updates, clearing cache, or Dell Command Update.",
        'sop-office':   "💼 Office Apps page — ask about shortcuts, repairs, or activation.",
        'training':     "📚 Training hub — search SOPs, find guides, or ask any IT question.",
        'services':     "💼 Services page — ask about pricing, request support, or build a quote.",
        'shop':         "🛒 Shop — search products to build a quote. Try 'shop laptops' or 'shop monitors'.",
        'sop-winget':   "🪶 Winget One-Liners — click COPY on any row, or COPY ALL at the bottom for the full PowerShell install script.",
        'sop-copilot-studio': "🤖 Copilot Studio Teams Bot — ask about renewing the Azure secret, fixing broken knowledge sources, or why publishing to Teams fails.",
        'sop-worktools': "⚡ Work Tools Query Hub — type <b>sql</b>, <b>graphql</b>, or <b>jql</b> to open query libraries. Type <b>work config</b> to set up your credentials (stored locally, never in the repo).",
        'sop-python':   "🐍 Python vs Java — ask about libraries, getting started, or how Python connects to Jira, Lansweeper, or Claude.",
        'sop-vscode':   "💻 VS Code Dev SOP — extensions, API calls, JSON/CSV parsing, Power Automate integration, and SharePoint sensitivity labels for HR &amp; Finance.",
        'default':      "👋 Hi! I'm Clippy. Ask about SOPs, IT fixes, shortcuts, winget installs, or shop for gear.",
    };

    function showChips() {
        const ctx = getPageContext();
        const chips = PAGE_CHIPS[ctx] || PAGE_CHIPS['default'];
        const el = document.getElementById('clippy-chips');
        el.innerHTML = chips.map(c =>
            `<button class="clippy-chip" onclick="clippyChip('${c.replace(/'/g,"\\'")}')"> ${c}</button>`
        ).join('');
    }

    window.clippyChip = function(label) {
        const query = label.replace(/^[\p{Emoji}\s]+/u, '').trim();
        document.getElementById('clippy-input').value = query;
        clippySend();
    };

    function showFollowUps(related) {
        if (!related || !related.length) return;
        const el = document.getElementById('clippy-chips');
        el.innerHTML = '<span style="font-size:10px;color:#888;padding:2px 4px;">Related:</span>' +
            related.map(r => `<button class="clippy-chip" onclick="clippyChip('${r.replace(/'/g,"\\'")}')"> ${r}</button>`).join('');
    }

    window.clippyToggle = function () {
        isOpen = !isOpen;
        const win = document.getElementById('clippy-window');
        win.classList.toggle('open', isOpen);
        if (isOpen) {
            updateWorkModeUI();
            if (!hasGreeted) {
                const ctx = getPageContext();
                let greeting = PAGE_GREETINGS[ctx] || PAGE_GREETINGS['default'];
                if (isWorkMode() && ctx === 'default') {
                    greeting = "⚡ <b>Work mode active.</b> Try: <b>my tickets</b>, <b>find HOSTNAME</b>, <b>my flows</b>, <b>sql</b>, <b>graphql</b>, or <b>jql</b>.";
                }
                botMsg(greeting);
                hasGreeted = true;
            }
            showChips();
            document.getElementById('clippy-input').focus();
        }
    };

    /* == Keyboard shortcut: Ctrl+K or / == */
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && !e.target.matches('input,textarea,select'))) {
            e.preventDefault();
            clippyToggle();
        }
    });

    /* == Send Message == */
    window.clippySend = function () {
        const input = document.getElementById('clippy-input');
        const q = input.value.trim();
        if (!q) return;
        userMsg(q);
        input.value = '';
        handleQuery(q);
    };

    /* == PowerShell & Silent-Install One-Liners == */
    const PS_CMDS = [
      { label:'Clear Print Queue',          keys:['clear queue','clear print','spooler','stuck print','print queue ps'],  cmd:'Stop-Service Spooler -Force; Remove-Item -Path "C:\\Windows\\System32\\spool\\PRINTERS\\*" -Force -ErrorAction SilentlyContinue; Start-Service Spooler' },
      { label:'Restart Print Spooler',      keys:['restart spooler','spooler restart','start spooler'],                   cmd:'Restart-Service Spooler -Force' },
      { label:'List Installed Printers',    keys:['list printers','get printers','show printers'],                       cmd:'Get-Printer | Select-Object Name, PortName, PrinterStatus, Default' },
      { label:'Add Network Printer',        keys:['add network printer','add printer ps','connect printer'],              cmd:'Add-Printer -ConnectionName "\\\\printserver\\PrinterName"' },
      { label:'Remove Printer',             keys:['remove printer','delete printer','uninstall printer'],                 cmd:'Remove-Printer -Name "PrinterName"' },
      { label:'Unlock AD Account',          keys:['unlock account','unlock user','unlock ad'],                            cmd:'Unlock-ADAccount -Identity "username"' },
      { label:'Reset AD Password',          keys:['reset password ps','reset ad password','set password'],               cmd:'Set-ADAccountPassword -Identity "username" -NewPassword (ConvertTo-SecureString "TempP@ss1!" -AsPlainText -Force) -Reset' },
      { label:'Find Locked Accounts',       keys:['find locked','locked accounts','all locked','search locked'],          cmd:'Search-ADAccount -LockedOut | Select-Object Name, SamAccountName, LockedOut' },
      { label:'Check Account Status',       keys:['check account','account status','user status','ad status'],            cmd:'Get-ADUser "username" -Properties LockedOut,Enabled,LastLogonDate | Select-Object Name,Enabled,LockedOut,LastLogonDate' },
      { label:'Clear User Temp Files',      keys:['clear temp','temp files','delete temp','clean temp'],                  cmd:'Remove-Item -Path $env:TEMP\\* -Recurse -Force -ErrorAction SilentlyContinue' },
      { label:'Check Top CPU Processes',    keys:['top cpu','cpu usage','high cpu','cpu processes'],                      cmd:'Get-Process | Sort-Object CPU -Descending | Select-Object -First 10 Name, CPU, WorkingSet' },
      { label:'Map Network Drive',          keys:['map drive','net use','map network'],                                   cmd:'net use Z: \\\\server\\sharename /persistent:yes' },
      { label:'List Mapped Drives',         keys:['list drives','mapped drives','show drives','get drives'],              cmd:'Get-SmbMapping | Select-Object LocalPath, RemotePath, Status' },
      { label:'Check Drive Space',          keys:['drive space','disk space','check space','free space ps'],              cmd:'Get-PSDrive | Where-Object {$_.Provider -like "*FileSystem*"} | Select-Object Name, @{N="UsedGB";E={[math]::Round($_.Used/1GB,1)}}, @{N="FreeGB";E={[math]::Round($_.Free/1GB,1)}}' },
      { label:'Force Windows Update',       keys:['force update','windows update ps','run updates ps','wu ps'],           cmd:'UsoClient ScanInstallWait' },
      { label:'Clear Windows Update Cache', keys:['clear wu cache','wu cache','clear update cache'],                     cmd:'Stop-Service wuauserv -Force; Remove-Item -Path "C:\\Windows\\SoftwareDistribution\\Download\\*" -Recurse -Force -ErrorAction SilentlyContinue; Start-Service wuauserv' },
      { label:'List Recent Updates',        keys:['recent updates','installed updates','hotfix','update history'],        cmd:'Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 10 HotFixID, InstalledOn, Description' },
      { label:'Kill Teams',                 keys:['kill teams','restart teams','close teams','teams not responding'],     cmd:'Stop-Process -Name Teams -Force -ErrorAction SilentlyContinue' },
      { label:'Clear Teams Cache',          keys:['teams cache','clear teams cache','teams slow','teams reset'],          cmd:'Stop-Process -Name Teams -Force -ErrorAction SilentlyContinue; Remove-Item -Path "$env:APPDATA\\Microsoft\\Teams\\Cache\\*" -Recurse -Force -ErrorAction SilentlyContinue' },
      { label:'Kill Outlook',               keys:['kill outlook','restart outlook','outlook not responding'],             cmd:'Stop-Process -Name OUTLOOK -Force -ErrorAction SilentlyContinue' },
      { label:'Kill Chrome',                keys:['kill chrome','restart chrome','chrome not responding'],                cmd:'Stop-Process -Name chrome -Force -ErrorAction SilentlyContinue' },
      { label:'Kill Edge',                  keys:['kill edge','restart edge','edge not responding'],                     cmd:'Stop-Process -Name msedge -Force -ErrorAction SilentlyContinue' },
      { label:'Clear Edge Cache',           keys:['clear edge cache','edge cache'],                                      cmd:'Remove-Item -Path "$env:LOCALAPPDATA\\Microsoft\\Edge\\User Data\\Default\\Cache\\*" -Recurse -Force -ErrorAction SilentlyContinue' },
      { label:'Clear Chrome Cache',         keys:['clear chrome cache','chrome cache'],                                  cmd:'Remove-Item -Path "$env:LOCALAPPDATA\\Google\\Chrome\\User Data\\Default\\Cache\\*" -Recurse -Force -ErrorAction SilentlyContinue' },
      { label:'Repair Office',              keys:['repair office','office repair','fix office','office broken'],          cmd:'& "C:\\Program Files\\Common Files\\Microsoft Shared\\ClickToRun\\OfficeC2RClient.exe" scenario=Repair platform=x64 culture=en-us RepairType=FullRepair DisplayLevel=Full' },
      { label:'Update Office',              keys:['update office','office update'],                                      cmd:'& "C:\\Program Files\\Common Files\\Microsoft Shared\\ClickToRun\\OfficeC2RClient.exe" /update user' },
      { label:'Open RDP',                   keys:['open rdp','launch rdp','start rdp','mstsc'],                          cmd:'Start-Process mstsc' },
      { label:'Winget Upgrade All',         keys:['upgrade all','winget upgrade all','update all apps'],                 cmd:'winget upgrade --all --silent --accept-source-agreements --accept-package-agreements' },
      { label:'Install Dell Command Update',keys:['install dcu','winget dell','install dell command'],                   cmd:'winget install Dell.CommandUpdate --silent --accept-source-agreements --accept-package-agreements' },
      { label:'Install Chrome',             keys:['install chrome','winget chrome'],                                     cmd:'winget install Google.Chrome --silent --accept-source-agreements --accept-package-agreements' },
      { label:'Install Teams',              keys:['install teams','winget teams'],                                       cmd:'winget install Microsoft.Teams --silent --accept-source-agreements --accept-package-agreements' },
      { label:'Install Zoom',               keys:['install zoom','winget zoom'],                                         cmd:'winget install Zoom.Zoom --silent --accept-source-agreements --accept-package-agreements' },
      { label:'Install 7-Zip',              keys:['install 7zip','winget 7zip','install zip'],                           cmd:'winget install 7zip.7zip --silent --accept-source-agreements --accept-package-agreements' },
      { label:'Install Adobe Reader',       keys:['install adobe','winget adobe','install pdf','install acrobat'],       cmd:'winget install Adobe.Acrobat.Reader.64-bit --silent --accept-source-agreements --accept-package-agreements' },
      { label:'Install VS Code',            keys:['install vscode','winget vscode'],                                     cmd:'winget install Microsoft.VisualStudioCode --silent --accept-source-agreements --accept-package-agreements' },
      { label:'Check Falcon Sensor Service', keys:['falcon service','crowdstrike service','csfalcon','falcon sensor status'], cmd:'Get-Service -Name CSFalconService | Select-Object Name, Status, StartType' },
      { label:'Restart Falcon Sensor',      keys:['restart falcon','restart crowdstrike','falcon restart','crowdstrike restart'], cmd:'Restart-Service CSFalconService -Force' },
      { label:'Check LogMeIn Agent',        keys:['logmein service','logmein agent','resolve service','lmi service'],     cmd:'Get-Service -Name "LogMeIn" | Select-Object Name, Status, StartType' },
      { label:'Restart LogMeIn Agent',      keys:['restart logmein','restart resolve','lmi restart'],                    cmd:'Restart-Service "LogMeIn" -Force' },
    ];

    function searchOneLiners(query) {
      const lower = query.toLowerCase();
      const matches = PS_CMDS.filter(p => p.keys.some(k => lower.includes(k)));
      if (matches.length === 0) {
        botMsg("🔍 No one-liners found. Try 'clear queue', 'kill teams', 'map drive', 'install chrome', etc.");
        return;
      }
      botMsg('⚡ ' + matches.length + ' one-liner(s):');
      matches.forEach(m => {
        const safe = m.cmd.replace(/"/g, '&quot;');
        addHTML(`<div id="clippy-result-hover">
          <div style="font-weight:700;color:#00ff64;font-size:12px;margin-bottom:6px;">${m.label}</div>
          <div id="clippy-result-hover-line">
            <div id="clippy-result-hover-name">${m.cmd}</div>
            <button id="clippy-result-hover-copy-btn" data-cmd="${safe}" onclick="navigator.clipboard.writeText(this.dataset.cmd);this.textContent='Copied!';setTimeout(()=>this.textContent='Copy',1500)">Copy</button>
          </div>
        </div>`);
      });
    }

    /* == Site Knowledge Base == */
  const SITE_KNOWLEDGE = [
    {
      keys: ['get winget','download winget','install winget','winget missing','winget not found','what is winget','winget setup','no winget'],
      icon: '🪶', title: 'Get Winget (Windows Package Manager)',
      related: ['winget one-liners','Windows Update','Help Desk Steps'],
      steps: [
        '<b>Windows 10 (1709+) and Windows 11:</b> winget is pre-installed via <b>App Installer</b>.',
        '<b>Check if you have it:</b> Open PowerShell → type <code>winget --version</code>',
        '<b>If missing, install App Installer from Microsoft Store:</b>',
        '&nbsp;&nbsp;Open Microsoft Store → search <b>App Installer</b> → Install (it\'s free, by Microsoft).',
        '<b>Or install via PowerShell (requires NuGet):</b>',
        '<code>Add-AppxPackage -RegisterByFamilyName -MainPackage Microsoft.DesktopAppInstaller_8wekyb3d8bbwe</code>',
        '<b>Or download the latest .msixbundle from GitHub:</b>',
        '&nbsp;&nbsp;github.com/microsoft/winget-cli/releases → download <code>Microsoft.DesktopAppInstaller_*.msixbundle</code>',
        'After installing, restart PowerShell and run <code>winget --version</code> to confirm.',
        'Need commands? See the <a href="./winget-one-liners.html" style="color:#00ff64">Winget One-Liners page →</a>'
      ]
    },
    {
      keys: ['winget one-liners','winget list','install all apps','bulk install','silent install','app list','core apps','winget table','all winget'],
      icon: '🪶', title: 'Winget One-Liners',
      related: ['Windows Update','Help Desk Steps','shortcuts'],
      steps: [
        'Open the <a href="./winget-one-liners.html" style="color:#00ff64">Winget One-Liners page</a> for the full reference table.',
        '<b>Two copy options:</b>',
        '&nbsp;&nbsp;• <b>COPY (per row)</b> — copies that single silent-install command to your clipboard.',
        '&nbsp;&nbsp;• <b>COPY ALL (bottom bar)</b> — copies a full PowerShell script that installs all 17 core apps at once.',
        'Commands use: <code>winget install -e --id &lt;ID&gt; --scope Machine --silent</code>',
        'Run PowerShell <b>as Administrator</b> for <code>--scope Machine</code> to work.',
        'Apps include: Chrome, Firefox, Teams, Zoom, VS Code, 7-Zip, Adobe Reader, Notepad++, VLC, WinSCP, PuTTY, IrfanView, CrystalDiskInfo, Malwarebytes, .NET 8, Dell Command Update, 8x8 Work.',
        'Help desk: PowerShell 7, Git, mRemoteNG, Tailscale, Rufus, Greenshot, HWiNFO64, TreeSize Free, Process Monitor.',
        'Windows Features: RSAT (AD, GPMC, DNS, DHCP) via <code>Add-WindowsCapability</code>.'
      ]
    },
    {
      keys: ['check updates','third party updates','app updates','update apps','winget upgrade','upgrade apps','update third party','check third party','update installed apps','upgrade all apps','outdated apps','apps out of date'],
      icon: '🔄', title: 'Check & Update Third-Party Apps (Winget)',
      related: ['Winget One-Liners','Windows Update','Help Desk Steps'],
      steps: [
        'Use <b>winget upgrade</b> to find and install updates for installed third-party apps.',
        '<b>List all available updates:</b>',
        '<code>winget upgrade</code>',
        '<b>Upgrade a specific app by ID:</b>',
        '<code>winget upgrade -e --id Google.Chrome</code>',
        '<b>Upgrade ALL apps silently (run as Admin):</b>',
        '<code>winget upgrade --all --scope Machine --silent</code>',
        '<b>Include apps where version is unknown:</b>',
        '<code>winget upgrade --all --include-unknown --scope Machine --silent</code>',
        '<b>Tip:</b> Run PowerShell as Administrator. Some updates require a restart after.',
        'See the <a href="./winget-one-liners.html" style="color:#00ff64">Winget One-Liners page →</a> for the full install list.'
      ]
    },
    {
      keys: ['rsat','remote server administration','active directory tools','gpmc','group policy management','dns tools','dhcp tools','ad tools','rsat tools'],
      icon: '🏢', title: 'RSAT — Remote Server Administration Tools',
      related: ['Help Desk Steps','Windows Update','winget one-liners'],
      steps: [
        'RSAT is installed via <b>Windows Optional Features</b>, not winget.',
        '<b>Install ALL RSAT tools (Admin PowerShell):</b>',
        '<code>Get-WindowsCapability -Name RSAT* -Online | Add-WindowsCapability -Online</code>',
        '<b>Install specific tools:</b>',
        '&nbsp;&nbsp;• Active Directory: <code>Add-WindowsCapability -Online -Name "Rsat.ActiveDirectory.DS-LDS.Tools~~~~0.0.1.0"</code>',
        '&nbsp;&nbsp;• Group Policy (GPMC): <code>Add-WindowsCapability -Online -Name "Rsat.GroupPolicy.Management.Tools~~~~0.0.1.0"</code>',
        '&nbsp;&nbsp;• DNS: <code>Add-WindowsCapability -Online -Name "Rsat.Dns.Tools~~~~0.0.1.0"</code>',
        '&nbsp;&nbsp;• DHCP: <code>Add-WindowsCapability -Online -Name "Rsat.DHCP.Tools~~~~0.0.1.0"</code>',
        '<b>Via Settings:</b> Settings → Apps → Optional Features → Add a feature → search RSAT.',
        '<b>Requires:</b> Windows 10/11 Pro or Enterprise (not Home). Needs internet to download.',
        'All RSAT commands are on the <a href="./winget-one-liners.html" style="color:#00ff64">Winget One-Liners page →</a>'
      ]
    },
    {
      keys: ['tailscale','vpn','mesh vpn','tailscale install','zero trust vpn','wireguard vpn'],
      icon: '🔒', title: 'Tailscale — Mesh VPN',
      related: ['Help Desk Steps','Remote Desktop','winget one-liners'],
      steps: [
        '<b>Install Tailscale (Admin PowerShell):</b>',
        '<code>winget install -e --id Tailscale.Tailscale --scope Machine --silent</code>',
        'After install, open Tailscale from the system tray → sign in with your org account.',
        '<b>Connect to a remote device:</b> Once both devices are on the same Tailscale network (tailnet), use the Tailscale IP (100.x.x.x) in RDP, SSH, or browser.',
        '<b>Check device IP:</b> Tailscale tray → click device name, or run <code>tailscale ip</code> in terminal.',
        '<b>Admin console:</b> login.tailscale.com → view all devices, manage ACLs.',
        '<b>Key commands:</b> <code>tailscale up</code> / <code>tailscale down</code> / <code>tailscale status</code>',
        'Also on the <a href="./winget-one-liners.html" style="color:#00ff64">Winget One-Liners page →</a>'
      ]
    },
    {
      keys: ['lansweeper','asset management','asset inventory','device lookup','asset scan','inventory scan','lansweepre','lsagent'],
      icon: '🔍', title: 'Lansweeper — Asset Management',
      related: ['Remote Desktop','CrowdStrike Falcon','Help Desk Steps'],
      steps: [
        'Access Lansweeper at <code>app.lansweeper.com</code> or your self-hosted URL.',
        '<b>Find a device:</b> Sites → select site → Assets → search by name, IP, or MAC.',
        '<b>Check software:</b> Click device → Software tab.',
        '<b>Check last seen / online status:</b> Asset detail → Summary tab.',
        '<b>Run a report:</b> Reporting → New Report → select template or custom SQL.',
        '<b>Deploy software or script:</b> Deployment → New Deployment → select assets.',
        '<b>GraphQL API — find asset by name:</b>',
        '<code>{ site { assetResources(filters:[{operator:LIKE,path:"name",value:"PC-NAME"}]) { items { name ipAddress operatingSystem } } } }</code>',
        '<b>See the <a href="./lansweeper.html" style="color:#00ff64">Lansweeper SOP</a> for full API and agent setup.</b>'
      ]
    },
    {
      keys: ['logmein','resolve','remote support','logmein resolve','remote help','connect to user','logmein connect','remote session','lmi'],
      icon: '🖥️', title: 'LogMeIn Resolve — Remote Support',
      related: ['Remote Desktop','Help Desk Steps','Password Reset'],
      steps: [
        'Go to <code>resolve.logmeininc.com</code> → sign in.',
        '<b>Start session:</b> Click Start Session → enter user email or send the support link.',
        '<b>User side:</b> User clicks link → downloads small agent → clicks Allow.',
        '<b>Always get verbal permission</b> before connecting. Sessions are logged.',
        '<b>Session tools:</b> chat, file transfer, remote reboot, run commands.',
        '<b>Unattended access:</b> Deploy the Resolve agent via GPO or Lansweeper for 24/7 access.',
        '<b>Slow session?</b> Session toolbar → Settings → reduce quality.',
        '<b>Check agent service:</b> <code>Get-Service -Name "LogMeIn" | Select-Object Name,Status</code>'
      ]
    },
    {
      keys: ['crowdstrike','falcon','edr','endpoint detection','crowdstrike falcon','detection','quarantine','rtr','real time response','falcon sensor','crowdstike','crowdstrick','falcon console'],
      icon: '🛡️', title: 'CrowdStrike Falcon — Endpoint Security',
      related: ['Lansweeper','Help Desk Steps','Windows Update'],
      steps: [
        'Access Falcon at <code>falcon.crowdstrike.com</code>.',
        '<b>Find a device:</b> Endpoint Security → Endpoint List → search by hostname.',
        '<b>Respond to detection:</b> Endpoint Security → Detections → click alert → review process tree.',
        '<b>Quarantine file:</b> Detection detail → Actions → Quarantine File.',
        '<b>Block hash:</b> IOC Management → Add IOC → SHA256 → Block.',
        '<b>Contain host (network isolate):</b> Device → Actions → Network Contain.',
        '<b>RTR session:</b> Device → Actions → Real Time Response → run <code>ps</code>, <code>kill PID</code>, <code>netstat</code>.',
        '<b>Check sensor service:</b> <code>Get-Service CSFalconService | Select-Object Name,Status</code>',
        '<b>Restart sensor:</b> <code>Restart-Service CSFalconService -Force</code>'
      ]
    },
    {
      keys: ['windows update','update windows','wu','check for updates','run updates','windows updates','windwos update','widnows update'],
      icon: '🔄', title: 'Windows Updates',
      related: ['Dell Command Update','Clear Update Cache','Slow Computer'],
      steps: [
        'Press <b>Win + I</b> to open Settings.',
        'Click <b>Windows Update</b> (Win 10: Update & Security).',
        'Click <b>Check for updates</b>.',
        'Click <b>Download and install</b> for any pending updates.',
        'Restart when prompted to apply updates.',
        '<b>Force check via Run (Win+R):</b> <code>UsoClient ScanInstallWait</code>',
        '<b>Or PowerShell (admin):</b> <code>wuauclt /detectnow /updatenow</code>'
      ]
    },
    {
      keys: ['dell command update','dcu','dell update','dell driver update','dell command','dell drivers'],
      icon: '🖥️', title: 'Dell Command Update',
      related: ['Windows Update','BIOS Update','Winget Install'],
      steps: [
        'Open <b>Dell Command Update</b> from Start Menu or System Tray.',
        'Click <b>Check</b> to scan for available driver & BIOS updates.',
        'Review the list — select updates to install or click <b>Install All</b>.',
        'Let it download and install. Do NOT close lid or power off.',
        'Restart if prompted (especially for BIOS updates).',
        '<b>Silent install:</b> <code>winget install Dell.CommandUpdate</code>',
        '<b>Silent run via CMD (admin):</b> <code>dcu-cli.exe /applyUpdates -reboot=enable</code>'
      ],
      cmd: 'winget install Dell.CommandUpdate'
    },
    {
      keys: ['browser','chrome','edge','firefox','web browser','browser not working','browser slow','clear cache','browser fix','browsr','brwoser'],
      icon: '🌐', title: 'Web Browser Fix',
      related: ['Clear Cache','Winget Install Chrome','Winget Install Edge'],
      steps: [
        'Right-click browser icon → <b>Run as administrator</b> if it won\'t open.',
        'Clear cache: <b>Ctrl+Shift+Delete</b> → check All time → Clear data.',
        'Disable extensions: Menu → Extensions → disable all → test.',
        'Reset browser: Settings → Advanced → Reset settings.',
        'Reinstall if still broken — use winget below.',
        '<b>Kill stuck browser (PowerShell admin):</b>',
        '<code>Stop-Process -Name chrome -Force</code> or <code>Stop-Process -Name msedge -Force</code>'
      ]
    },
    {
      keys: ['outlook','email','mail','email not working','email setup','outlook fix','email sync','out of office','oof','auto reply','outloook','oulook'],
      icon: '📧', title: 'Email / Outlook Fix',
      related: ['Password Reset','Calendar Sync','Teams Fix'],
      steps: [
        'Check internet connection first.',
        'Open Outlook → <b>File → Account Settings → Account Settings</b>.',
        'Select your account → click <b>Repair</b>.',
        'If repair fails: Remove account → Add it back.',
        'For sync issues: <b>Send/Receive → Send/Receive All Folders (F9)</b>.',
        '<b>Out of Office:</b> File → Automatic Replies → turn on, set dates and message.',
        '<b>Clear Outlook cache:</b> Close Outlook, delete <code>%localappdata%\\Microsoft\\Outlook\\*.ost</code>.',
        '<b>Outlook safe mode:</b> Win+R → <code>outlook.exe /safe</code>'
      ]
    },
    {
      keys: ['printer','print','printing','printer not working','printer offline','add printer','print queue','printer driver','driver install','install driver','hp driver','canon driver','clear queue','prnter','prinetr','pritner'],
      icon: '🖨️', title: 'Printer & Driver Help',
      related: ['Update Driver','Clear Queue','Add Network Printer'],
      steps: [
        '<b>🖨️ Basic Printer Fix:</b>',
        'Check printer is powered on and connected (USB or network).',
        'Open <b>Settings → Bluetooth & devices → Printers & scanners</b>.',
        'Click printer → <b>Open print queue</b> → cancel stuck jobs.',
        '<b>Restart Print Spooler (PowerShell admin):</b>',
        '<code>Stop-Service Spooler -Force; Remove-Item "C:\\Windows\\System32\\spool\\PRINTERS\\*" -Force; Start-Service Spooler</code>',
        '<b>🔧 Update Driver:</b> Device Manager → Printers → right-click → Update driver → Search automatically.',
        '<b>Manufacturer sites:</b> HP: <code>support.hp.com</code> | Canon: <code>usa.canon.com/support</code> | Brother: <code>support.brother.com</code>',
        '<b>Add network printer:</b> <code>Add-Printer -ConnectionName "\\\\printserver\\PrinterName"</code>'
      ],
      cmd: 'Stop-Service Spooler -Force; Remove-Item "C:\\Windows\\System32\\spool\\PRINTERS\\*" -Force -ErrorAction SilentlyContinue; Start-Service Spooler'
    },
    {
      keys: ['network drive','map drive','shared drive','drive not connected','reconnect drive','file share','unc path','map a drive','netowrk drive'],
      icon: '💾', title: 'Network Drive Mapping',
      related: ['Disk Cleanup','File Share','VPN'],
      steps: [
        'Open <b>File Explorer (Win+E)</b> → right-click <b>This PC</b> → <b>Map network drive</b>.',
        'Choose a drive letter (e.g. Z:).',
        'Enter the network path: <code>\\\\server\\sharename</code>.',
        'Check <b>Reconnect at sign-in</b> → click Finish.',
        'If prompted: enter your domain credentials.',
        '<b>Via CMD:</b> <code>net use Z: \\\\server\\share /persistent:yes</code>',
        '<b>List mapped drives:</b> <code>Get-SmbMapping</code>'
      ]
    },
    {
      keys: ['password reset','reset password','locked out','account locked','forgot password','change password','unlock account','passowrd','pasword','pssword'],
      icon: '🔑', title: 'Password Reset / Account Unlock',
      related: ['Okta','Remote Desktop','Check Account Status'],
      steps: [
        '<b>Self-service:</b> Go to Okta login → click <b>Forgot Password</b> → follow email link.',
        '<b>Admin — Okta Console:</b> Directory → People → find user → click <b>Unlock</b>.',
        '<b>Admin — Active Directory (PowerShell):</b>',
        '<code>Unlock-ADAccount -Identity "username"</code>',
        '<code>Set-ADAccountPassword -Identity "user" -Reset -NewPassword (ConvertTo-SecureString "TempP@ss1!" -AsPlainText -Force)</code>',
        '<b>Check account status:</b> <code>Get-ADUser "username" -Properties LockedOut,Enabled | Select Name,Enabled,LockedOut</code>',
        '<b>Find all locked accounts:</b> <code>Search-ADAccount -LockedOut | Select Name,SamAccountName</code>'
      ]
    },
    {
      keys: ['okta','okta password change','okta token','okta sync','fix office 365 token','fix office token','fix onedrive sync','onedrive okta','okta re-auth','okta troubleshoot','sync 365','365 after okta','office apps not working okta','clear credentials','credential manager okta','office keeps signing out','onedrive crash okta'],
      icon: '🔐', title: 'Okta — Password Change & 365 App Token Fix',
      related: ['Password Reset','Help Desk Steps','Windows Update'],
      steps: [
        '<b>After an Okta password change, these commonly break:</b> Office apps (Word/Excel/Outlook), OneDrive sync, Teams sign-in.',
        '<b>Step 1 — Re-auth via Okta dashboard first:</b>',
        '&nbsp;&nbsp;→ Go to <code>yourcompany.okta.com</code> → sign in with new password.',
        '&nbsp;&nbsp;→ Settings → Security → Sessions → <b>Sign out all devices</b>.',
        '&nbsp;&nbsp;→ Sign back in → launch Office 365, Teams, OneDrive from Okta app tiles.',
        '<b>Step 2 — Fix Office 365 token (Word/Excel/Outlook):</b>',
        '&nbsp;&nbsp;→ Any Office app → File → Account → <b>Sign Out</b> → close all Office apps.',
        '&nbsp;&nbsp;→ Kill remaining processes (Admin PowerShell):',
        '<code>Get-Process -Name WINWORD,EXCEL,OUTLOOK,TEAMS -ErrorAction SilentlyContinue | Stop-Process -Force</code>',
        '&nbsp;&nbsp;→ Clear Office token cache:',
        '<code>Remove-Item "$env:LOCALAPPDATA\\Microsoft\\Office\\16.0\\Licensing" -Recurse -Force -ErrorAction SilentlyContinue</code>',
        '<code>Remove-Item "$env:LOCALAPPDATA\\Microsoft\\identitycache" -Recurse -Force -ErrorAction SilentlyContinue</code>',
        '<b>Step 3 — Fix OneDrive sync crash (Admin PowerShell):</b>',
        '<code>Stop-Process -Name OneDrive -Force -ErrorAction SilentlyContinue</code>',
        '<code>Remove-Item "$env:LOCALAPPDATA\\Microsoft\\OneDrive\\settings" -Recurse -Force -ErrorAction SilentlyContinue</code>',
        '<code>Start-Process "$env:LOCALAPPDATA\\Microsoft\\OneDrive\\OneDrive.exe"</code>',
        '&nbsp;&nbsp;→ If still crashing: <code>& "$env:LOCALAPPDATA\\Microsoft\\OneDrive\\OneDrive.exe" /reset</code>',
        '<b>Step 4 — Clear Windows Credential Manager:</b>',
        '&nbsp;&nbsp;→ Control Panel → Credential Manager → Windows Credentials.',
        '&nbsp;&nbsp;→ Remove entries containing: <code>MicrosoftOffice</code>, <code>OneDrive</code>, <code>Okta</code>, <code>live.com</code>.',
        '<code>cmdkey /list</code>  ← use to find and then <code>cmdkey /delete:TARGET</code> to remove.',
        '<b>Verify:</b> OneDrive shows green checkmark, Office opens without sign-in prompt, CPU back to normal.',
        '<b>Full SOP:</b> <a href="./okta.html" style="color:#00ff64">Okta Token Sync SOP →</a>'
      ]
    },
    {
      keys: ['reset outlook','reset teams','reset teams cache','teams cache','teams hanging','outlook hanging','outlook stuck','word stuck','excel stuck','reset word','reset excel','reset 365 app','per app reset','office app reset','teams not signing in','outlook not signing in','new teams cache','teams 2.0 reset'],
      icon: '🔄', title: '365 App Reset Commands (Per App)',
      related: ['Okta','Help Desk Steps'],
      steps: [
        '<b>Outlook — stop &amp; clear auth cache:</b>',
        '<code>Stop-Process -Name OUTLOOK -Force -ErrorAction SilentlyContinue</code>',
        '<code>Remove-Item "$env:LOCALAPPDATA\\Microsoft\\Office\\16.0\\Licensing" -Recurse -Force -ErrorAction SilentlyContinue</code>',
        '<code>Remove-Item "$env:LOCALAPPDATA\\Microsoft\\identitycache" -Recurse -Force -ErrorAction SilentlyContinue</code>',
        '&nbsp;&nbsp;→ Still looping? Run: <code>Start-Process outlook.exe -ArgumentList "/resetnavpane"</code>',
        '<b>Teams Classic — stop &amp; clear cache:</b>',
        '<code>Stop-Process -Name Teams -Force -ErrorAction SilentlyContinue</code>',
        '<code>$t="$env:APPDATA\\Microsoft\\Teams"; "Cache","blob_storage","databases","GPUCache","IndexedDB","Local Storage","tmp" | ForEach-Object { Remove-Item "$t\\$_" -Recurse -Force -ErrorAction SilentlyContinue }</code>',
        '<b>Teams New (2.0) — stop &amp; clear cache:</b>',
        '<code>Stop-Process -Name ms-teams -Force -ErrorAction SilentlyContinue</code>',
        '<code>Remove-Item "$env:LOCALAPPDATA\\Packages\\MSTeams_8wekyb3d8bbwe\\LocalCache\\Microsoft\\MSTeams" -Recurse -Force -ErrorAction SilentlyContinue</code>',
        '<b>Word / Excel — stop &amp; clear token cache:</b>',
        '<code>Stop-Process -Name WINWORD,EXCEL -Force -ErrorAction SilentlyContinue</code>',
        '<code>Remove-Item "$env:LOCALAPPDATA\\Microsoft\\Office\\16.0\\Licensing" -Recurse -Force -ErrorAction SilentlyContinue</code>',
        '<code>Remove-Item "$env:LOCALAPPDATA\\Microsoft\\identitycache" -Recurse -Force -ErrorAction SilentlyContinue</code>',
        '<b>OneDrive reset:</b>',
        '<code>Stop-Process -Name OneDrive -Force -ErrorAction SilentlyContinue</code>',
        '<code>& "$env:LOCALAPPDATA\\Microsoft\\OneDrive\\OneDrive.exe" /reset</code>',
        '<b>Full SOP:</b> <a href="./okta.html#3-step-2--fix-office-apps-token-word-excel-outlook-teams" style="color:#00ff64">Okta SOP — Per-App Resets →</a>'
      ]
    },
    {
      keys: ['remote desktop','rdp','remote into','remote access','logmein','connect remotely','remote control','remot desktop','rdpp'],
      icon: '🖥️', title: 'Remote Desktop / RDP',
      related: ['Password Reset','Help Desk','LogMeIn'],
      steps: [
        'Press <b>Win+R</b> → type <code>mstsc</code> → Enter.',
        'Enter the computer name or IP address.',
        'Click <b>Connect</b> → enter credentials.',
        'To enable RDP on target: Settings → System → Remote Desktop → Enable.',
        '<b>Quick connect:</b> <code>mstsc /v:COMPUTERNAME</code>',
        '<b>Always get verbal permission</b> before connecting to a user\'s machine.'
      ]
    },
    {
      keys: ['help desk','help desk task','common task','ticket','troubleshoot','first steps','basic fix','slow computer','computer slow','slow pc'],
      icon: '🎯', title: 'Common Help Desk Steps',
      related: ['Password Reset','Remote Desktop','Disk Cleanup'],
      steps: [
        '1. Get user name, location, and device name.',
        '2. <b>Restart first</b> — fixes 80% of issues.',
        '3. Remote in via LogMeIn / RDP to investigate.',
        '4. Check Event Viewer: <code>eventvwr.msc</code>.',
        '5. Check top CPU/RAM processes: <code>Get-Process | Sort-Object CPU -Descending | Select -First 10 Name,CPU</code>',
        '6. Clear temp files: <code>Remove-Item -Path $env:TEMP\\* -Recurse -Force -ErrorAction SilentlyContinue</code>',
        '7. Document steps in the ticket. Escalate after 2 failed attempts.',
        '8. Confirm with user before closing.'
      ]
    },
    {
      keys: ['disk cleanup','storage','low disk','free space','clean up','temp files','disk space','disk full','diks cleanup'],
      icon: '🗂️', title: 'Disk Cleanup',
      related: ['Windows Update','Slow Computer','Network Drive'],
      steps: [
        'Run <b>Disk Cleanup</b>: Win+S → search Disk Cleanup → select C: drive.',
        'Check all boxes including <b>Temporary files</b> → OK.',
        'For deeper clean: click <b>Clean up system files</b>.',
        '<b>Clear user temp (PowerShell):</b> <code>Remove-Item -Path $env:TEMP\\* -Recurse -Force</code>',
        '<b>Run cleanmgr silent:</b> <code>cleanmgr /sagerun:1</code>',
        '<b>Check drive space:</b> <code>Get-PSDrive C | Select-Object Used,Free</code>'
      ]
    },
    {
      keys: ['shortcuts','keyboard shortcuts','hotkeys','shortcut keys','office shortcuts','excel shortcuts','word shortcuts','teams shortcuts','windows shortcuts','shrotcuts','shotcuts'],
      icon: '⌨️', title: 'Common Keyboard Shortcuts',
      related: ['Office Apps','Teams Fix','Windows Update'],
      steps: [
        '<b>🪟 Windows:</b>',
        '<code>Win+L</code> Lock screen &nbsp;|&nbsp; <code>Win+D</code> Show Desktop &nbsp;|&nbsp; <code>Win+E</code> File Explorer',
        '<code>Win+R</code> Run dialog &nbsp;|&nbsp; <code>Win+I</code> Settings &nbsp;|&nbsp; <code>Win+Tab</code> Task View',
        '<code>Ctrl+Shift+Esc</code> Task Manager &nbsp;|&nbsp; <code>Alt+Tab</code> Switch apps',
        '<b>📝 Universal Office (Word, Excel, Outlook, Teams):</b>',
        '<code>Ctrl+Z</code> Undo &nbsp;|&nbsp; <code>Ctrl+Y</code> Redo &nbsp;|&nbsp; <code>Ctrl+S</code> Save',
        '<code>Ctrl+C</code> Copy &nbsp;|&nbsp; <code>Ctrl+V</code> Paste &nbsp;|&nbsp; <code>Ctrl+X</code> Cut',
        '<code>Ctrl+F</code> Find &nbsp;|&nbsp; <code>Ctrl+H</code> Find & Replace &nbsp;|&nbsp; <code>Ctrl+P</code> Print',
        '<code>Ctrl+B</code> Bold &nbsp;|&nbsp; <code>Ctrl+I</code> Italic &nbsp;|&nbsp; <code>Ctrl+U</code> Underline',
        '<b>📊 Excel:</b>',
        '<code>F2</code> Edit cell &nbsp;|&nbsp; <code>F4</code> Repeat / Absolute ref &nbsp;|&nbsp; <code>Ctrl+T</code> Create table',
        '<code>Ctrl+Shift+L</code> Toggle filter &nbsp;|&nbsp; <code>Ctrl+;</code> Insert date &nbsp;|&nbsp; <code>Alt+Enter</code> New line in cell',
        '<code>Ctrl+Shift+$</code> Currency format &nbsp;|&nbsp; <code>Ctrl+Shift+%</code> Percent format',
        '<b>📄 Word:</b>',
        '<code>Ctrl+Enter</code> Page break &nbsp;|&nbsp; <code>F7</code> Spell check &nbsp;|&nbsp; <code>Ctrl+K</code> Insert link',
        '<b>💬 Teams:</b>',
        '<code>Ctrl+Shift+M</code> Mute/unmute &nbsp;|&nbsp; <code>Ctrl+Shift+O</code> Camera on/off',
        '<code>Ctrl+E</code> Search &nbsp;|&nbsp; <code>Ctrl+N</code> New chat &nbsp;|&nbsp; <code>Ctrl+Shift+A</code> Activity'
      ]
    },
    {
      keys: ['att','att activation','att wireless','activate phone','phone activation','att portal','business portal','att business','wireless activation','sim activation','att sim','new line','activate new line','att line'],
      icon: '📱', title: 'AT&T Wireless Phone Activation',
      related: ['MDM Enroll','Voicemail Setup','Company Portal'],
      steps: [
        '<b style="color:#00e5cc">🏢 PART 1 — IT Admin Steps</b>',
        'Go to <code>businessdirect.att.com</code> → sign in.',
        'My Wireless → <b>Manage Devices & Features</b> → find the line → <b>Activate</b>.',
        'Enter IMEI (Settings → About Phone) and SIM ICCID.',
        'Verify plan & features → <b>Submit</b>. Allow 5–15 min.',
        '<b style="color:#00e5cc">👤 PART 2 — End User Steps</b>',
        'Insert SIM → power cycle phone (full off, 30 sec, back on).',
        'Confirm AT&T signal → make test call → set up voicemail (<code>*86</code>).',
        'Enroll in MDM via Company Portal app if required.',
        '<b>⚠️ No signal after 30 min?</b> Call AT&T Business: <code>1-800-331-0500</code>'
      ]
    }
  ];

  /* == PURCHASE ORDER WIZARD == */
  function poGenNum() {
    return 'PO-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-4);
  }

  function startPOWizard() {
    poData = {
      poNumber: poGenNum(),
      date: new Date().toLocaleDateString('en-US', {year:'numeric',month:'long',day:'numeric'}),
      vendor:'', contact:'', items:[], currentItem:{}, shipping:''
    };
    poState = 'vendor';
    addHTML(`<div id="clippy-msg-bot">
      <div style="color:#00ff64;font-weight:700;margin-bottom:8px;">📋 Purchase Order Wizard</div>
      <div style="background:#0a1f12;border-left:3px solid #00ff64;padding:8px;border-radius:4px;font-size:12px;color:#aaa;margin-bottom:10px;">
        PO # <b style="color:#00ff64;">${poData.poNumber}</b> &nbsp;·&nbsp; ${poData.date}
      </div>
      <div style="color:#fff;font-size:13px;">📦 <b>Vendor name?</b></div>
      <div style="color:#666;font-size:11px;margin-top:4px;">Type <b>cancel</b> at any time to exit.</div>
    </div>`);
  }

  function handlePOWizard(input) {
    const val = input.trim();
    if (/^(cancel|exit|quit)$/i.test(val)) {
      poState = null; poData = {};
      botMsg('❌ PO wizard cancelled.');
      showChips(); return;
    }
    switch (poState) {
      case 'vendor':
        poData.vendor = val;
        poState = 'contact';
        botMsg('✅ Vendor: <b>' + val + '</b><br><br>📧 Vendor email or phone? <span style="color:#888;font-size:11px;">(type "skip" to omit)</span>');
        break;
      case 'contact':
        poData.contact = /^skip$/i.test(val) ? '' : val;
        poState = 'item_name';
        botMsg('📦 <b>Item #1</b> — Description and SKU?<br><span style="color:#888;font-size:11px;">Example: Samsung 980 Pro 1TB SSD, SAM-980<br>(comma-separated, SKU optional)</span>');
        break;
      case 'item_name': {
        const parts = val.split(',');
        poData.currentItem = { name: parts[0].trim(), sku: (parts[1]||'').trim() };
        poState = 'item_qty';
        botMsg('🔢 Quantity for <b>' + poData.currentItem.name + '</b>?');
        break;
      }
      case 'item_qty':
        poData.currentItem.qty = parseInt(val) || 1;
        poState = 'item_price';
        botMsg('💲 Unit price? <span style="color:#888;font-size:11px;">(e.g. 129.99)</span>');
        break;
      case 'item_price': {
        poData.currentItem.price = parseFloat(val.replace(/[$,]/g,'')) || 0;
        poData.currentItem.total = poData.currentItem.qty * poData.currentItem.price;
        poData.items.push({...poData.currentItem});
        poData.currentItem = {};
        const sub = poData.items.reduce((s,i)=>s+i.total,0);
        poState = 'more_items';
        botMsg('✅ Added. Running subtotal: <b style="color:#00ff64;">$' + sub.toFixed(2) + '</b><br><br>Add another item?');
        document.getElementById('clippy-chips').innerHTML = ['yes','no','cancel'].map(c=>`<button class="clippy-chip" onclick="clippyChip('${c}')">${c}</button>`).join('');
        break;
      }
      case 'more_items':
        if (/^y/i.test(val)) {
          poState = 'item_name';
          botMsg('📦 <b>Item #' + (poData.items.length+1) + '</b> — Description and SKU?');
        } else {
          poState = 'shipping';
          botMsg('🚚 Shipping address or notes? <span style="color:#888;font-size:11px;">(or type "skip")</span>');
        }
        break;
      case 'shipping':
        poData.shipping = /^skip$/i.test(val) ? '' : val;
        poState = 'confirm';
        showPOSummary();
        break;
      case 'confirm':
        if (/^(yes|confirm|ok|send|y)/i.test(val)) emailPO();
        else { poState=null; poData={}; botMsg('❌ Cancelled.'); showChips(); }
        break;
    }
  }

  function showPOSummary() {
    const sub = poData.items.reduce((s,i)=>s+i.total,0);
    const tax = sub*0.08; const total = sub+tax;
    const rows = poData.items.map(item=>`
      <div style="display:grid;grid-template-columns:1fr auto auto auto;gap:6px;padding:5px 0;border-bottom:1px solid #0f2a1a;font-size:12px;align-items:center;">
        <div><b style="color:#fff;">${item.name}</b>${item.sku?`<span style="color:#444;font-size:10px;margin-left:5px;">${item.sku}</span>`:''}</div>
        <div style="color:#888;">×${item.qty}</div>
        <div style="color:#888;">$${item.price.toFixed(2)}</div>
        <div style="color:#00ff64;font-weight:700;">$${item.total.toFixed(2)}</div>
      </div>`).join('');
    addHTML(`<div id="clippy-msg-bot">
      <div style="color:#00ff64;font-weight:700;margin-bottom:8px;">📋 PO Summary — ${poData.poNumber}</div>
      <div style="font-size:12px;color:#aaa;margin-bottom:8px;">
        <b style="color:#fff;">${poData.vendor}</b>${poData.contact?'<br>'+poData.contact:''}
        ${poData.shipping?'<br>📦 '+poData.shipping:''}
      </div>
      ${rows}
      <div style="margin-top:8px;font-size:12px;text-align:right;color:#aaa;line-height:1.8;">
        Subtotal: <b>$${sub.toFixed(2)}</b><br>
        Tax (8%): <b>$${tax.toFixed(2)}</b><br>
        <span style="font-size:15px;color:#00ff64;font-weight:900;">TOTAL: $${total.toFixed(2)}</span>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;">
        <button style="background:#00ff64;color:#000;border:none;padding:6px 12px;border-radius:8px;font-weight:700;cursor:pointer;font-size:12px;" onclick="emailPO()">📧 Email PO</button>
        <button class="clippy-chip" onclick="printPO()">🖨️ Print / PDF</button>
        <button class="clippy-chip" onclick="downloadPOCSV()">📊 CSV</button>
        <button class="clippy-chip" onclick="poState=null;poData={};botMsg('Cancelled.');showChips()">✕ Cancel</button>
      </div>
    </div>`);
  }

  window.emailPO = function() {
    const sub = poData.items.reduce((s,i)=>s+i.total,0);
    const tax = sub*0.08; const total = sub+tax;
    const itemLines = poData.items.map(item=>
      item.name+(item.sku?' ['+item.sku+']':'')+'\n  Qty: '+item.qty+'  x  $'+item.price.toFixed(2)+'  =  $'+item.total.toFixed(2)
    ).join('\n\n');
    const body=['PURCHASE ORDER','==============',
      'PO Number: '+poData.poNumber,'Date:      '+poData.date,'From:      Custom Design Systems LLC','',
      'VENDOR:',poData.vendor,poData.contact||'','',
      'LINE ITEMS:','-----------',itemLines,'','-----------',
      'Subtotal:  $'+sub.toFixed(2),'Tax (8%):  $'+tax.toFixed(2),'TOTAL:     $'+total.toFixed(2),'',
      poData.shipping?'SHIPPING:\n'+poData.shipping+'\n':'',
      'TERMS: Net 30  |  Check / ACH / Venmo / PayPal','','— Custom Design Systems LLC','jahonen8383@gmail.com'
    ].join('\n');
    const to = poData.contact&&poData.contact.includes('@')?encodeURIComponent(poData.contact):'';
    window.open('mailto:'+to+'?subject='+encodeURIComponent('Purchase Order '+poData.poNumber+' — '+poData.vendor)+'&body='+encodeURIComponent(body));
    poState=null; botMsg('📧 Email client opened with your PO!'); showChips();
  };

  window.printPO = function() {
    const sub = poData.items.reduce((s,i)=>s+i.total,0);
    const tax = sub*0.08; const total = sub+tax;
    const itemRows = poData.items.map(item=>`<tr><td>${item.name}</td><td style="text-align:center">${item.sku||'—'}</td><td style="text-align:center">${item.qty}</td><td style="text-align:right">$${item.price.toFixed(2)}</td><td style="text-align:right;font-weight:700">$${item.total.toFixed(2)}</td></tr>`).join('');
    const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>PO ${poData.poNumber}</title><style>
      *{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:12px;color:#222;padding:32px}
      .hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;border-bottom:3px solid #00c84a;padding-bottom:16px}
      .co{font-size:22px;font-weight:900;color:#00843a}.cosub{font-size:11px;color:#666;margin-top:4px}
      .pom{text-align:right}.pon{font-size:18px;font-weight:900}.pod{font-size:11px;color:#666;margin-top:4px}
      .slbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#888;margin-bottom:6px;margin-top:20px}
      table{width:100%;border-collapse:collapse;margin-top:12px}th{background:#f0f0f0;padding:8px 10px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#555;border-bottom:2px solid #ddd;text-align:left}td{padding:8px 10px;border-bottom:1px solid #eee}
      .tot td{border:none;padding:3px 10px;text-align:right}.grand td{font-size:16px;font-weight:900;color:#00843a}
      .footer{margin-top:36px;padding-top:14px;border-top:1px solid #ddd;font-size:11px;color:#888}
      @media print{.noprint{display:none}}
    </style></head><body>
    <div class="hdr">
      <div><div class="co">Custom Design Systems LLC</div><div class="cosub">Remote Tech Support · Custom Builds · Repair<br>jahonen8383@gmail.com</div></div>
      <div class="pom"><div class="pon">PURCHASE ORDER</div><div class="pon" style="font-size:14px;color:#00843a">${poData.poNumber}</div><div class="pod">${poData.date}</div></div>
    </div>
    <div class="slbl">Vendor</div><b>${poData.vendor}</b>${poData.contact?'<br>'+poData.contact:''}
    ${poData.shipping?'<div class="slbl">Ship To / Notes</div>'+poData.shipping:''}
    <table><thead><tr><th>Description</th><th style="text-align:center">SKU</th><th style="text-align:center">Qty</th><th style="text-align:right">Unit Price</th><th style="text-align:right">Total</th></tr></thead><tbody>${itemRows}</tbody></table>
    <table class="tot" style="margin-top:10px"><tr><td>Subtotal</td><td>$${sub.toFixed(2)}</td></tr><tr><td>Tax (8%)</td><td>$${tax.toFixed(2)}</td></tr></table>
    <table class="tot grand"><tr><td>TOTAL</td><td>$${total.toFixed(2)}</td></tr></table>
    <div class="footer">TERMS: Net 30 · Check / ACH / Venmo / PayPal · Custom Design Systems LLC</div>
    <br><button class="noprint" onclick="window.print()" style="padding:10px 24px;background:#00c84a;color:#fff;border:none;border-radius:6px;font-size:14px;font-weight:700;cursor:pointer;margin-top:16px;">🖨️ Print / Save as PDF</button>
    <script>window.onload=function(){window.print();}<\/script></body></html>`;
    const win=window.open('','_blank'); win.document.write(html); win.document.close();
    poState=null; botMsg('🖨️ Print window opened — use <b>Save as PDF</b> in the dialog.'); showChips();
  };

  window.downloadPOCSV = function() {
    const sub = poData.items.reduce((s,i)=>s+i.total,0);
    const tax=sub*0.08; const total=sub+tax;
    const rows=[['PO Number','Date','Vendor','Contact','Item','SKU','Qty','Unit Price','Total'],
      ...poData.items.map(item=>[poData.poNumber,poData.date,poData.vendor,poData.contact,item.name,item.sku||'',item.qty,item.price.toFixed(2),item.total.toFixed(2)]),
      ['','','','','','','','Subtotal',sub.toFixed(2)],
      ['','','','','','','','Tax (8%)',tax.toFixed(2)],
      ['','','','','','','','TOTAL',total.toFixed(2)]
    ];
    const csv=rows.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\n');
    const a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
    a.download=poData.poNumber+'.csv'; a.click();
    botMsg('📊 Downloaded: <b>'+poData.poNumber+'.csv</b>');
  };

  /* == Copilot Studio Knowledge == */
  SITE_KNOWLEDGE.push(
    {
      keys: ['copilot studio','pva','power virtual agent','teams bot','bot not working','bot stopped','agent cant be reached','agent can\'t be reached','bot publish','publish teams','copilot bot'],
      icon: '🤖', title: 'Copilot Studio Teams Bot',
      related: ['Renew Azure Secret','Fix SharePoint Knowledge','Fix Broken Flow'],
      steps: [
        'Full SOP: <a href="./copilot-studio-teams-bot.html" style="color:#00ff64">Copilot Studio Teams Bot Architecture & Maintenance →</a>',
        '<b>Bot works in Dev/Test but not in Teams?</b> → Expired Azure AD client secret. See <a href="./copilot-studio-teams-bot.html#renew-client-secret" style="color:#00ff64">Renew Azure Secret</a>.',
        '<b>Can\'t publish to Teams (but Demo site works)?</b> → Teams channel registration broke. <a href="./copilot-studio-teams-bot.html#troubleshoot-publish" style="color:#00ff64">Troubleshoot Publish →</a>',
        '<b>Generative answers failing?</b> → Check SharePoint knowledge sources. <a href="./copilot-studio-teams-bot.html#fix-sharepoint-knowledge" style="color:#00ff64">Fix Knowledge Sources →</a>',
        '<b>Specific topics failing with "action failed"?</b> → Power Automate flow suspended. <a href="./copilot-studio-teams-bot.html#fix-flows" style="color:#00ff64">Fix Flows →</a>',
      ]
    },
    {
      keys: ['renew azure secret','client secret','app registration secret','azure secret expired','azure ad secret','renew bot secret','secret expired','bot secret'],
      icon: '🔑', title: 'Renew Azure AD Client Secret (Teams Bot)',
      related: ['Copilot Studio Bot','Fix Broken Flow','Teams Bot Architecture'],
      steps: [
        '<b>Go to:</b> portal.azure.com → Microsoft Entra ID → App Registrations → find your bot app.',
        'Click <b>Certificates & secrets</b> → Client secrets — check the Expires column for a red/past date.',
        'Click <b>+ New client secret</b> → set 24 months → Add. <b>Copy the Value immediately</b> (shown once only).',
        'Go to <b>Azure Bot Service → Configuration</b> → paste new secret into Microsoft App Password → Save.',
        'In Azure Bot Service → <b>Channels → Microsoft Teams</b> → Delete the channel, then re-add it.',
        'Back in <b>Copilot Studio → Publish</b> → re-publish the bot. Allow 5–10 min for Teams to update.',
        'Full walkthrough: <a href="./copilot-studio-teams-bot.html#renew-client-secret" style="color:#00ff64">Renew Client Secret SOP →</a>'
      ]
    },
    {
      keys: ['sharepoint knowledge','knowledge source','knowledge broken','generative answers','bot no answer','bot wrong answer','bot knowledge','fix knowledge','copilot knowledge'],
      icon: '📂', title: 'Fix Broken SharePoint Knowledge Source',
      related: ['Copilot Studio Bot','Renew Azure Secret'],
      steps: [
        'In <b>Copilot Studio → your bot → Knowledge</b> — check each source for a red ✗ or "Failed" status.',
        'Confirm the SharePoint site is still accessible and the bot\'s connector still has <b>Read</b> permission.',
        'To fix: <b>Delete</b> the broken source, then <b>+ Add knowledge</b> → SharePoint → re-paste the URL.',
        'Re-indexing can take up to 24 hours — test generative answers again after waiting.',
        'If DLP policy is blocking: Power Platform Admin Center → Policies → confirm SharePoint connector is in the <b>Business</b> group.',
        'Full steps: <a href="./copilot-studio-teams-bot.html#fix-sharepoint-knowledge" style="color:#00ff64">Fix Knowledge Source SOP →</a>'
      ]
    },
    {
      keys: ['suspended flow','broken flow','bot action failed','flow not working','power automate bot','fix flow','copilot flow','bot flow','action failed'],
      icon: '⚡', title: 'Fix Suspended Power Automate Flow (Bot)',
      related: ['Copilot Studio Bot','Renew Azure Secret'],
      steps: [
        'Go to <b>make.powerautomate.com → My Flows</b> — look for flows with a <b>Suspended</b> badge.',
        'Open the suspended flow → <b>Edit</b> → find the step with a red border (broken connection).',
        'Click the connection → <b>Sign in again</b> with valid credentials → Save.',
        'If the original owner\'s account is gone: Connections → <b>+ New connection</b> → use a shared service account.',
        '<b>Test the flow</b> manually in the editor before testing in the bot.',
        'Full steps: <a href="./copilot-studio-teams-bot.html#fix-flows" style="color:#00ff64">Fix Flows SOP →</a>'
      ]
    }
  );

  /* == Password Change Knowledge == */
  SITE_KNOWLEDGE.push(
    {
      keys: ['password change','change password','reset password','okta password','password sync','update password','new password','forgot password','password expired','sync password','password okta','ctrl alt del password','network password','domain password','ad password','active directory password','password not syncing','apps not updated password'],
      icon: '🔐', title: 'Change Password — Okta or Network (Ctrl+Alt+Del)',
      related: ['Okta Dashboard','VPN Connect','Account Lockout'],
      steps: [
        '<b>Method 1 — Okta Dashboard (any location):</b>',
        'Go to your Okta Dashboard (<a href="https://newsbank.okta.com" style="color:#00ff64" target="_blank">newsbank.okta.com</a>) and sign in.',
        'Click your <b>name/avatar (top-right) → Settings → Change Password</b> (under Security).',
        'Enter your current password, then your new password twice → <b>Save</b>.',
        'Okta propagates the new password to all connected apps automatically within a few minutes.',
        'If an app still asks for the old password: sign out of that app and sign back in, or click the app tile in Okta to re-authenticate.',
        '<b>Method 2 — Ctrl+Alt+Del on the corporate network (domain-joined PC):</b>',
        'Must be physically on the office network <b>or connected via VPN</b> before starting.',
        'Press <b>Ctrl + Alt + Del</b> → click <b>"Change a password"</b>.',
        'Enter your old password, then your new password twice → press the arrow or Enter.',
        'This updates your <b>Active Directory</b> password. The Okta AD Agent will sync the change automatically — allow up to 10 minutes.',
        '<b>Tip:</b> If both methods fail or account is locked, contact IT to unlock in Azure AD / Okta Admin.',
      ]
    }
  );

  /* == Handle Query == */
  function handleQuery(q) {
    const lower = q.toLowerCase();

    // PO wizard — intercept mid-wizard input first
    if (poState) { handlePOWizard(q); return; }
    // PO trigger
    if (/\b(purchase.?order|generate.?po|create.?po|new.?po|make.?po|po.?wizard|build.?po)\b/i.test(lower) || lower==='po') {
      startPOWizard(); return;
    }

    // Site navigation
    const NAV_PAGES = [
      { keys: ['home','main page','cds home'], label: 'Home', url: 'https://greenhornet-dev.github.io/cds-green/index.html' },
      { keys: ['about','about us','who are'], label: 'About', url: 'https://greenhornet-dev.github.io/cds-green/about.html' },
      { keys: ['training','learn','courses'], label: 'Training', url: 'https://greenhornet-dev.github.io/cds-green/training.html' },
      { keys: ['services','support','tech support'], label: 'Services', url: 'https://greenhornet-dev.github.io/cds-green/services.html' },
      { keys: ['sop portal','sop list','all sops'], label: 'SOP Portal', url: './sop-portal.html' },
      { keys: ['winget one-liners','winget page','app installs','install all','winget table'], label: 'Winget One-Liners', url: './winget-one-liners.html' },
      { keys: ['dev','developer','dev page'], label: 'Dev', url: 'https://greenhornet-dev.github.io/cds-green/dev.html' },
      // External portals
      { keys: ['adp','time card','timecard','adp timecard','workforcenow','adp portal','clock in','punch in'], label: 'ADP Time Card', url: 'https://workforcenow.adp.com/theme/index.html#/Myself/MyselfTabTimecardsAttendanceSchCategoryTLMWebMyTimecard' },
      { keys: ['okta','okta dashboard','okta portal','okta login','newsbank okta','sign in okta','change password'], label: 'Okta Dashboard', url: 'https://newsbank.okta.com', note: '⚠️ Work network / VPN required — blocked externally.' },
      { keys: ['logmein','gotoresolve','goto resolve','remote support portal','logmein portal'], label: 'LogMeIn Resolve', url: 'https://portal.console.gotoresolve.com' },
      { keys: ['lansweeper portal','lansweeper site','lansweeper login','open lansweeper'], label: 'Lansweeper', url: 'https://app.lansweeper.com' },
      { keys: ['power automate','make.powerautomate','flow portal','my flows'], label: 'Power Automate', url: 'https://make.powerautomate.com' },
      { keys: ['microsoft 365','m365 portal','office portal','o365 portal'], label: 'Microsoft 365', url: 'https://m365.cloud.microsoft/' },
      { keys: ['work tools sop','query sop','query hub','query center','work query','work tools page'], label: 'Work Tools Query Hub', url: './work-tools-query.html' },
    ];
    const navMatch = NAV_PAGES.find(p => p.keys.some(k => lower.includes(k)));
    if (navMatch) {
      const noteHtml = navMatch.note ? `<div style="font-size:11px;color:#f90;margin-top:6px;">${navMatch.note}</div>` : '';
      addHTML(`<div id="clippy-result-hover">
        <div style="font-weight:700;color:#00ff64;margin-bottom:8px;">🔗 ${navMatch.label}</div>
        <a href="${navMatch.url}" target="_blank" style="background:#00ff64;color:#000;padding:5px 12px;border-radius:6px;font-weight:600;font-size:12px;text-decoration:none;">Open ${navMatch.label} →</a>
        ${noteHtml}
      </div>`);
      return;
    }

    // Shop / Product search — require a product keyword alongside "shop"
    const shopTrigger = lower.includes('product') || lower.includes('price') ||
      (lower.includes('shop') && lower.replace('shop','').trim().length > 0) ||
      lower.includes('quote') || lower.includes('item');
    if (shopTrigger) {
      searchProducts(lower);
      return;
    }
    // View quote
    if (lower.includes('view quote') || lower.includes('show quote') || lower.includes('my quote')) {
      showQuote();
      return;
    }
    // Clear quote
    if (lower.includes('clear quote')) {
      quoteList = [];
      botMsg('\uD83D\uDDD1\uFE0F Quote cleared!');
      return;
    }
    // One-liner / command lookup
    if (lower.includes('command') || lower.includes('powershell') || lower.includes(' ps ') ||
        lower.includes('one liner') || lower.includes('oneliner') || lower.includes('script') ||
        PS_CMDS.some(p => p.keys.some(k => lower.includes(k)))) {
      searchOneLiners(lower);
      return;
    }

    // Work mode toggle
    if (lower === 'work mode on' || lower === 'enable work mode' || lower === 'work mode activate') {
      setWorkModeFlag(true);
      botMsg('⚡ Work mode enabled. Try: <b>my tickets</b>, <b>find HOSTNAME</b>, <b>sql</b>, <b>graphql</b>, <b>jql</b>.'); return;
    }
    if (lower === 'work mode off' || lower === 'disable work mode' || lower === 'work mode deactivate') {
      setWorkModeFlag(false);
      botMsg('Work mode disabled. Type <b>work mode on</b> to re-enable.'); return;
    }
    // Work config
    if (lower.includes('work config') || lower.includes('configure work') || lower === 'work tools' || lower === 'config') {
      showWorkConfig(); return;
    }
    // Jira ticket key \u2014 e.g. IT-123, HELP-45
    const jiraKeyMatch = q.match(/\b([A-Za-z]{2,10}-\d{1,6})\b/);
    if (jiraKeyMatch) { fetchJiraTicket(jiraKeyMatch[1]); return; }
    // Jira: my tickets
    if (lower === 'my tickets' || lower === 'jira' || lower.includes('my jira') || lower.includes('open tickets') || lower.includes('assigned tickets')) {
      fetchMyTickets(); return;
    }
    // Jira: search
    if ((lower.startsWith('jira ') || lower.startsWith('ticket ') || lower.includes('jira search')) && lower.length > 6) {
      searchJiraTickets(lower.replace(/^(jira search|jira|ticket)\s+/i, '')); return;
    }
    // Lansweeper: find asset
    const lsMatch = lower.match(/^(?:find asset|find|ls|lansweeper find)\s+(.+)/);
    if (lsMatch && lsMatch[1].length > 1) { lsSearch(lsMatch[1]); return; }
    // Power Automate: flows
    if (lower === 'my flows' || lower === 'flows' || lower.includes('run flow') || lower.includes('pa flows') || lower.includes('automate flows')) {
      showPAFlows(); return;
    }
    // SQL query library
    if (lower === 'sql' || lower.includes('sql queries') || lower.includes('sql browser') || lower.startsWith('sql ')) {
      const sqlFilter = lower.replace(/^sql\s*/,'').trim();
      showSQLBrowser(sqlFilter || null); return;
    }
    // GraphQL runner
    if (lower === 'graphql' || lower === 'gql' || lower.includes('graphql runner') || lower.includes('gql query') || lower.startsWith('gql ') || lower.startsWith('graphql ')) {
      showGQLRunner(); return;
    }
    // JQL preset browser
    if (lower === 'jql' || lower.includes('jql presets') || lower.includes('jira filter') || lower.startsWith('jql ')) {
      const jqlFilter = lower.replace(/^jql\s*/,'').trim();
      showJQLPresets(jqlFilter || null); return;
    }
    // Portal queries — Lansweeper portal report builder
    if (lower.includes('portal query') || lower.includes('portal queries') || lower.includes('portle query') || lower.includes('query portal') || lower === 'portal') {
      showPortalQueries(); return;
    }

    // Browse Topics \u2014 show all topic categories from sop-topics.json
    if (lower.includes('browse topics') || lower.includes('all topics') || lower === 'topics' || lower === 'browse') {
      showTopicBrowser();
      return;
    }
    // Topic filter \u2014 from browse UI chip click (e.g. "topic:Password")
    if (lower.startsWith('topic:')) {
      showTopicEntries(q.slice(6).trim());
      return;
    }

    // SITE_KNOWLEDGE \u2014 checked before winget so KB answers take priority
    function kbMatch(keys) {
      return keys.some(kw => {
        if (lower.includes(kw)) return true;
        const qWords = lower.split(/\s+/);
        const kWords = kw.split(/\s+/);
        return qWords.some(qw => qw.length > 3 && kWords.some(kw2 =>
          kw2.startsWith(qw.slice(0, -1)) || qw.startsWith(kw2.slice(0, -1))
        ));
      });
    }
    const kb = SITE_KNOWLEDGE.find(k => kbMatch(k.keys));
    if (kb) {
      botMsg('\uD83D\uDCCB <b>' + kb.icon + ' ' + kb.title + '</b>');
      let stepsHtml = '<div style="margin-top:6px;">';
      kb.steps.forEach(step => {
        stepsHtml += '<div style="padding:4px 0;border-bottom:1px solid #0f2;opacity:0.85;font-size:12px;">' + addCopyBtns(step) + '</div>';
      });
      stepsHtml += '</div>';
      if (kb.cmd) {
        const safeCmd = kb.cmd.replace(/"/g, '&quot;');
        stepsHtml += '<div id="clippy-cmd-box"><div id="clippy-cmd-text">' + kb.cmd + '</div><button id="clippy-copy-btn" data-cmd="' + safeCmd + '" onclick="navigator.clipboard.writeText(this.dataset.cmd);this.textContent=\'Copied!\';setTimeout(()=>this.textContent=\'Copy\',1500)">Copy</button></div>';
      }
      addHTML(stepsHtml);
      if (kb.related) showFollowUps(kb.related);
      return;
    }

    // List ALL winget apps \u2014 must come before the regular winget search
    if (/\b(list|show|all|what|available)\b/.test(lower) && /\b(winget|apps?)\b/.test(lower) ||
        lower === 'list winget' || lower === 'winget list' || lower === 'all apps') {
      listAllWinget();
      return;
    }

    // Winget search \u2014 fires on 'winget', 'install', or any known app keyword
    const wingetAppHit = WINGET_APPS.some(w => w.apps.some(a => lower.includes(a)));
    if (lower.includes('winget') || (lower.includes('install') && !lower.includes('how')) || wingetAppHit) {
      searchWinget(lower);
      return;
    }

    // SOP search (sopData from training.html)
    if (typeof window.sopData !== 'undefined') {
      const sopMatches = window.sopData.filter(s =>
        s.title.toLowerCase().includes(lower) ||
        s.category.toLowerCase().includes(lower) ||
        (s.keywords && s.keywords.some(kw => lower.includes(kw)))
      );
      if (sopMatches.length > 0) {
        sopMatches.forEach(s => {
          botMsg('\uD83D\uDCCB <b>' + s.icon + ' ' + s.title + '</b>');
          let stepsHtml = '<div style="margin-top:6px;">';
          s.steps.forEach(step => {
            stepsHtml += '<div style="padding:4px 0;border-bottom:1px solid #0f2;opacity:0.85;font-size:12px;">' + step + '</div>';
          });
          stepsHtml += '</div>';
          addHTML(stepsHtml);
        });
        return;
      }
    }

    // SOP topics search (sop-topics.json)
    if (sopTopics.length > 0) {
      const sopMatches = sopTopics.filter(s => {
        const haystack = ((s.title || '') + ' ' + (s.description || '') + ' ' + (Array.isArray(s.tags) ? s.tags.join(' ') : (s.tag || ''))).toLowerCase();
        return lower.split(/\s+/).some(word => word.length > 2 && haystack.includes(word));
      });
      if (sopMatches.length > 0) {
        botMsg('\uD83D\uDCCB Found ' + sopMatches.length + ' SOP(s):');
        sopMatches.slice(0, 6).forEach(s => {
          const url = s.url || ('./' + s.file);
          const icon = s.icon || '\uD83D\uDCC4';
          addHTML(`<div id="clippy-result-hover">
            <div style="font-weight:700;color:#00ff64;margin-bottom:4px;">${icon} ${s.title}</div>
            <div style="color:#bbb;font-size:12px;margin-bottom:8px;">${s.description || ''}</div>
            <a href="${url}" style="background:#00ff64;color:#000;padding:5px 12px;border-radius:6px;font-weight:600;font-size:12px;text-decoration:none;">View SOP \u2192</a>
          </div>`);
        });
        return;
      }
    }

    // Default
    botMsg('\uD83E\uDD14 Try: "windows update", "dell command update", "printer fix", "winget install chrome", "shop laptop", or any SOP topic!');
  }

    /* == Topic Browser == */
    function showTopicBrowser() {
      if (!sopTopics.length) { botMsg('📋 SOP index still loading — try again in a moment.'); return; }
      const tags = [...new Set(sopTopics.map(t => t.tag))].sort();
      const tagBtns = tags.map(tag => {
        const count = sopTopics.filter(t => t.tag === tag).length;
        return `<button class="clippy-chip" onclick="clippyChip('topic:${tag}')" style="margin:3px;">${tag} <span style="opacity:0.6;font-size:10px">(${count})</span></button>`;
      }).join('');
      addHTML(`<div id="clippy-result-hover">
        <div style="font-weight:700;color:#00ff64;margin-bottom:6px;">📚 Browse by Topic</div>
        <div style="font-size:11px;color:#888;margin-bottom:8px;">Tap a category to see all SOPs in that topic:</div>
        <div style="display:flex;flex-wrap:wrap;gap:2px;">${tagBtns}</div>
      </div>`);
    }

    function showTopicEntries(tag) {
      const entries = sopTopics.filter(t => t.tag.toLowerCase() === tag.toLowerCase());
      if (!entries.length) { botMsg('No entries found for: ' + tag); return; }
      const links = entries.map(e =>
        `<div style="padding:3px 0;"><a href="${e.url}" target="_blank" style="color:#00ff64;font-size:12px;text-decoration:none;">→ ${e.title}</a></div>`
      ).join('');
      addHTML(`<div id="clippy-result-hover">
        <div style="font-weight:700;color:#00ff64;margin-bottom:6px;">📂 ${tag} <span style="font-size:11px;opacity:0.6;">(${entries.length})</span></div>
        ${links}
        <div style="margin-top:10px;">
          <button class="clippy-chip" onclick="clippyChip('browse topics')" style="font-size:10px;">← All Topics</button>
        </div>
      </div>`);
    }

    /* == Search Products == */
    function searchProducts(query) {
        const matches = PRODUCT_CATALOG.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query) ||
            p.sku.toLowerCase().includes(query)
        );

        if (matches.length === 0) {
            botMsg("🔍 No products found. Try 'shop laptop', 'shop monitor', 'shop printer', etc.");
            return;
        }

        botMsg(`🛒 Found ${matches.length} product(s):`);
        matches.forEach(p => {
            const html = `
                <div class="product-item">
                    <div>
                        <div class="product-name">${p.name}</div>
                        <div style="color:#888;font-size:11px;">SKU: ${p.sku} | Category: ${p.category}</div>
                    </div>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <span class="product-price">$${p.price}</span>
                        <button class="product-add-btn" onclick="addToQuote('${p.sku}')">+ Quote</button>
                    </div>
                </div>
            `;
            addHTML(html);
        });
    }

    /* == Add to Quote == */
    window.addToQuote = function(sku) {
        const product = PRODUCT_CATALOG.find(p => p.sku === sku);
        if (!product) return;
        
        quoteList.push(product);
        botMsg(`✅ Added "${product.name}" to your quote!`);
        updateBadge();
    };

    /* == Show Quote == */
    function showQuote() {
        if (quoteList.length === 0) {
            botMsg("📄 Your quote is empty. Search for products and add them!");
            return;
        }

        let total = 0;
        let html = '<div id="clippy-msg-bot"><strong>📄 Your Quote:</strong><br><br>';
        
        quoteList.forEach((item, index) => {
            total += item.price;
            html += `
                <div class="quote-item">
                    <div>
                        <div style="color:#00ff64;font-size:12px;font-weight:600;">${item.name}</div>
                        <div style="color:#888;font-size:10px;">SKU: ${item.sku}</div>
                    </div>
                    <div style="display:flex;align-items:center;gap:8px;">
                        <span style="color:#fff;">$${item.price}</span>
                        <button class="quote-remove" onclick="removeFromQuote(${index})">✕</button>
                    </div>
                </div>
            `;
        });

        html += `<br><div style="border-top:1px solid #333;padding-top:10px;margin-top:10px;"><strong style="color:#00ff64;">Total: $${total}</strong></div>`;
        html += `<button id="clippy-copy-btn" onclick="copyQuote()">📋 Copy Quote</button>`;
        html += '</div>';
        
        addHTML(html);
    }

    /* == Remove from Quote == */
    window.removeFromQuote = function(index) {
        const item = quoteList[index];
        quoteList.splice(index, 1);
        botMsg(`🗑️ Removed "${item.name}" from quote.`);
        updateBadge();
        showQuote();
    };

    /* == Copy Quote == */
    window.copyQuote = function() {
        let text = "IT EQUIPMENT QUOTE\n" + "=".repeat(50) + "\n\n";
        let total = 0;
        
        quoteList.forEach(item => {
            total += item.price;
            text += `${item.name} (${item.sku})\n`;
            text += `  Category: ${item.category}\n`;
            text += `  Price: $${item.price}\n\n`;
        });
        
        text += "=".repeat(50) + "\n";
        text += `TOTAL: $${total}\n`;
        text += "=".repeat(50);

        navigator.clipboard.writeText(text).then(() => {
            botMsg("✅ Quote copied to clipboard!");
        });
    };

    /* == Update Badge == */
    function updateBadge() {
        const badge = document.getElementById('clippy-badge');
        if (quoteList.length > 0) {
            badge.textContent = quoteList.length;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }

    /* == Work Mode — auto-detect from hostname, flag, or saved credentials == */
    function isWorkMode() {
        if (window.location.hostname.includes('newsbank')) return true;
        if (localStorage.getItem('clippy_work_mode') === '1') return true;
        try {
            const cfg = JSON.parse(localStorage.getItem('clippy_work_v1') || '{}');
            if (cfg.jiraUrl || cfg.lsUrl) return true;
        } catch {}
        return false;
    }

    function setWorkModeFlag(on) {
        if (on) { localStorage.setItem('clippy_work_mode', '1'); }
        else { localStorage.removeItem('clippy_work_mode'); }
        updateWorkModeUI();
    }

    function updateWorkModeUI() {
        const hdr = document.querySelector('#clippy-header span');
        if (!hdr) return;
        if (isWorkMode()) {
            hdr.innerHTML = '📎 Clippy <span style="background:#1a3a1a;border:1px solid #00ff64;color:#00ff64;font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px;margin-left:6px;">⚡ WORK</span>';
        } else {
            hdr.textContent = '📎 Clippy — IT Assistant & Shop';
        }
    }

    /* == Search Winget == */
    function searchWinget(query) {
        const matches = WINGET_APPS.filter(w =>
            w.apps.some(a => query.includes(a))
        );

        if (matches.length === 0) {
            botMsg("🔍 No winget apps found. Try 'chrome', 'teams', 'rsat', 'tailscale', etc. Or see the <a href='./winget-one-liners.html' style='color:#00ff64'>full list →</a>");
            return;
        }

        matches.forEach(w => {
            const safeCmd = w.cmd.replace(/"/g, '&quot;');
            let html = `<div id="clippy-result-hover">`;
            if (w.label) html += `<div style="font-weight:700;color:#00ff64;font-size:12px;margin-bottom:6px;">🪶 ${w.label}</div>`;
            html += `<div id="clippy-result-hover-line">
                <div id="clippy-result-hover-name">${w.cmd}</div>
                <button id="clippy-result-hover-copy-btn" data-cmd="${safeCmd}" onclick="navigator.clipboard.writeText(this.dataset.cmd);this.textContent='Copied!';setTimeout(()=>this.textContent='Copy',1500)">Copy</button>
            </div></div>`;
            addHTML(html);
        });
        if (matches.length > 0) {
            addHTML(`<div style="font-size:11px;color:#888;margin-top:4px;">📋 <a href="./winget-one-liners.html" style="color:#555">See all apps & Copy All script →</a></div>`);
        }
    }

    function listAllWinget() {
        const sections = [
          { name: '📦 Core Apps',              start: 0,  end: 17 },
          { name: '🛠️ Help Desk Utilities',    start: 17, end: 26 },
          { name: '⚙️ Additional',             start: 26, end: 35 },
          { name: '🖥️ RSAT — Windows Features', start: 35, end: WINGET_APPS.length },
        ];
        let html = `<div style="font-weight:700;color:#00ff64;margin-bottom:6px;">📋 All ${WINGET_APPS.length} Available Apps</div>`;
        html += `<div style="max-height:300px;overflow-y:auto;border:1px solid #1a1a1a;border-radius:6px;padding:6px 8px;">`;
        sections.forEach(sec => {
          const apps = WINGET_APPS.slice(sec.start, sec.end);
          html += `<div style="font-size:10px;font-weight:700;color:#444;text-transform:uppercase;letter-spacing:0.1em;margin:8px 0 3px;">${sec.name} (${apps.length})</div>`;
          apps.forEach(w => {
            const safeCmd = w.cmd.replace(/"/g, '&quot;');
            html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 2px;border-bottom:1px solid #111;">
              <span style="font-size:12px;color:#bbb;">${w.label}</span>
              <button style="font-size:10px;background:transparent;border:1px solid #333;color:#777;padding:1px 7px;border-radius:3px;cursor:pointer;flex-shrink:0;margin-left:8px;" data-cmd="${safeCmd}" onclick="navigator.clipboard.writeText(this.dataset.cmd);this.textContent='✓';setTimeout(()=>this.textContent='Copy',1500)">Copy</button>
            </div>`;
          });
        });
        html += `</div>`;
        html += `<div style="font-size:11px;color:#555;margin-top:5px;">📄 <a href="./winget-one-liners.html" style="color:#444">Full page with Copy All script →</a></div>`;
        addHTML(html);
    }

    /* ================================================================
       WORK TOOLS — Jira · Lansweeper · Power Automate
       Config stored in localStorage (never in repo)
    ================================================================ */

    const WORK_CFG_KEY  = 'clippy_work_v1';
    const PA_FLOWS_KEY  = 'clippy_pa_flows_v1';
    function getWorkCfg()  { try { return JSON.parse(localStorage.getItem(WORK_CFG_KEY)  || '{}'); } catch { return {}; } }
    function saveWorkCfg(c){ localStorage.setItem(WORK_CFG_KEY, JSON.stringify(c)); }
    function getPAFlows()  { try { return JSON.parse(localStorage.getItem(PA_FLOWS_KEY) || '[]'); } catch { return []; } }

    /* — Jira helpers — */
    function jiraBase() { const c = getWorkCfg(); return (c.jiraUrl || '').replace(/\/$/, ''); }
    function jiraAuth() { const c = getWorkCfg(); return c.jiraEmail && c.jiraToken ? 'Basic ' + btoa(c.jiraEmail + ':' + c.jiraToken) : null; }

    async function jiraFetch(path, opts = {}) {
      const auth = jiraAuth();
      if (!auth || !jiraBase()) { botMsg('⚙️ Jira not configured — type <b>work config</b> to set it up.'); return null; }
      try {
        const r = await fetch(jiraBase() + '/rest/api/3' + path, {
          ...opts,
          headers: { 'Authorization': auth, 'Content-Type': 'application/json', ...(opts.headers || {}) }
        });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return await r.json();
      } catch (e) {
        botMsg('⚠️ Jira: ' + e.message + ' — verify you are on work network or VPN.');
        return null;
      }
    }

    async function fetchMyTickets() {
      botMsg('🎫 Fetching your open tickets...');
      const data = await jiraFetch('/search?jql=' + encodeURIComponent('assignee = currentUser() AND resolution = Unresolved ORDER BY updated DESC') + '&maxResults=8&fields=summary,status,priority,issuetype');
      if (!data) return;
      if (!data.issues || !data.issues.length) { botMsg('✅ No open tickets assigned to you.'); return; }
      let html = `<div id="clippy-result-hover"><div style="font-weight:700;color:#00ff64;margin-bottom:6px;">🎫 Your Open Tickets (${data.total})</div>`;
      data.issues.forEach(i => {
        const s = i.fields.status.name;
        const sc = s === 'In Progress' ? '#00ff64' : s === 'Done' ? '#555' : '#f90';
        html += `<div style="padding:5px 0;border-bottom:1px solid #1a1a1a;">
          <a href="${jiraBase()}/browse/${i.key}" target="_blank" style="color:#00ff64;font-weight:700;font-size:12px;">${i.key}</a>
          <span style="color:#bbb;font-size:11px;margin-left:6px;">${i.fields.summary}</span>
          <span style="color:${sc};font-size:10px;margin-left:6px;">[${s}]</span>
        </div>`;
      });
      html += `<div style="margin-top:6px;font-size:11px;color:#555;"><a href="${jiraBase()}/issues/?jql=assignee%3DcurrentUser()%20AND%20resolution%3DUnresolved" target="_blank" style="color:#444;">View all ${data.total} in Jira →</a></div></div>`;
      addHTML(html);
    }

    async function fetchJiraTicket(key) {
      botMsg('🎫 Loading ' + key.toUpperCase() + '...');
      const data = await jiraFetch('/issue/' + key.toUpperCase() + '?fields=summary,status,priority,assignee,description');
      if (!data) return;
      const desc = (data.fields.description?.content?.[0]?.content || []).map(c => c.text || '').join(' ').substring(0, 200);
      addHTML(`<div id="clippy-result-hover">
        <div style="font-weight:700;color:#00ff64;margin-bottom:4px;">🎫 ${data.key}</div>
        <div style="font-size:12px;color:#fff;margin-bottom:4px;">${data.fields.summary}</div>
        <div style="font-size:11px;color:#888;margin-bottom:6px;">
          Status: <b style="color:#f90">${data.fields.status.name}</b> &nbsp;|&nbsp;
          Priority: ${data.fields.priority?.name || 'N/A'} &nbsp;|&nbsp;
          Assignee: ${data.fields.assignee?.displayName || 'Unassigned'}
        </div>
        ${desc ? `<div style="font-size:11px;color:#999;margin-bottom:8px;">${desc}…</div>` : ''}
        <a href="${jiraBase()}/browse/${data.key}" target="_blank" style="background:#00ff64;color:#000;padding:4px 10px;border-radius:6px;font-weight:700;font-size:11px;text-decoration:none;">Open in Jira →</a>
      </div>`);
    }

    async function searchJiraTickets(text) {
      botMsg('🔍 Searching Jira for: ' + text);
      const jql = `text ~ "${text}" AND resolution = Unresolved ORDER BY updated DESC`;
      const data = await jiraFetch('/search?jql=' + encodeURIComponent(jql) + '&maxResults=6&fields=summary,status');
      if (!data) return;
      if (!data.issues.length) { botMsg('No Jira tickets matched: ' + text); return; }
      let html = `<div id="clippy-result-hover"><div style="font-weight:700;color:#00ff64;margin-bottom:6px;">🔍 Jira: "${text}" (${data.total})</div>`;
      data.issues.forEach(i => {
        html += `<div style="padding:4px 0;border-bottom:1px solid #111;">
          <a href="${jiraBase()}/browse/${i.key}" target="_blank" style="color:#00ff64;font-size:12px;font-weight:700;">${i.key}</a>
          <span style="font-size:11px;color:#bbb;margin-left:6px;">${i.fields.summary}</span>
        </div>`;
      });
      html += `</div>`;
      addHTML(html);
    }

    /* — Lansweeper (Clippy) — */
    async function lsSearch(assetName) {
      const cfg = getWorkCfg();
      if (!cfg.lsUrl || !cfg.lsPat) { botMsg('⚙️ Lansweeper not configured — type <b>work config</b>'); return; }
      botMsg('🔍 Searching Lansweeper for: ' + assetName);
      const siteFilter = cfg.lsSiteId ? `site:{name:{eq:"${cfg.lsSiteId}"}}` : '';
      const gql = `{Site(where:{${siteFilter}}){site{assetBasicInfo(where:{assetBasicInfo:{name:{like:"%${assetName}%"}}},limit:5){name lastSeen ipAddress userName operatingSystem}}}}`;
      try {
        const r = await fetch(cfg.lsUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.lsPat },
          body: JSON.stringify({ query: gql })
        });
        const data = await r.json();
        const assets = data?.data?.Site?.[0]?.site?.assetBasicInfo || [];
        if (!assets.length) { botMsg('No Lansweeper assets found for: ' + assetName); return; }
        let html = `<div id="clippy-result-hover"><div style="font-weight:700;color:#00ff64;margin-bottom:6px;">🖥️ Lansweeper: ${assetName}</div>`;
        assets.forEach(a => {
          html += `<div style="padding:5px 0;border-bottom:1px solid #111;">
            <b style="color:#00ff64;font-size:12px;">${a.name}</b>
            <span style="font-size:11px;color:#888;"> — IP: ${a.ipAddress || 'N/A'} | User: ${a.userName || 'None'} | OS: ${(a.operatingSystem || '').split(' ')[0]}</span>
            <span style="font-size:10px;color:#555;"> | Seen: ${a.lastSeen ? a.lastSeen.substring(0,10) : 'N/A'}</span>
          </div>`;
        });
        html += `</div>`;
        addHTML(html);
      } catch (e) {
        botMsg('⚠️ Lansweeper: ' + e.message + ' — check VPN / CORS proxy config.');
      }
    }

    /* — Power Automate flows — */
    function showPAFlows() {
      const flows = getPAFlows();
      if (!flows.length) {
        botMsg('⚡ No flows saved yet. Type <b>work config</b> → Add Flow to register a webhook.');
        return;
      }
      let html = `<div id="clippy-result-hover"><div style="font-weight:700;color:#00ff64;margin-bottom:6px;">⚡ Power Automate Flows (${flows.length})</div>`;
      flows.forEach((f, i) => {
        html += `<div style="padding:5px 0;border-bottom:1px solid #111;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:12px;color:#bbb;">${f.name}</span>
          <div style="display:flex;gap:5px;">
            <button class="clippy-chip" onclick="runPAFlow(${i})" style="font-size:10px;padding:2px 8px;">▶ Run</button>
            <button class="clippy-chip" onclick="deletePAFlow(${i})" style="font-size:10px;padding:2px 8px;border-color:#f44;color:#f44;">✕</button>
          </div>
        </div>`;
      });
      html += `<div style="margin-top:8px;"><button class="clippy-chip" onclick="clippyChip('work config')" style="font-size:10px;">+ Add Flow</button></div></div>`;
      addHTML(html);
    }

    window.runPAFlow = async function(idx) {
      const flows = getPAFlows();
      const f = flows[idx];
      if (!f) return;
      botMsg(`⚡ Triggering: <b>${f.name}</b>…`);
      try {
        const r = await fetch(f.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ source: 'Clippy', triggeredAt: new Date().toISOString() })
        });
        botMsg(r.ok ? `✅ Flow triggered: <b>${f.name}</b>` : `⚠️ Flow returned HTTP ${r.status} — check the webhook URL.`);
      } catch (e) {
        botMsg('⚠️ Could not reach flow webhook — check VPN.');
      }
    };

    window.deletePAFlow = function(idx) {
      const flows = getPAFlows();
      const name = flows[idx].name;
      flows.splice(idx, 1);
      localStorage.setItem(PA_FLOWS_KEY, JSON.stringify(flows));
      botMsg(`🗑️ Removed flow: ${name}`);
    };

    /* — Work Config UI — */
    function showWorkConfig() {
      const c = getWorkCfg();
      const flows = getPAFlows();
      addHTML(`<div id="clippy-result-hover" style="font-size:12px;">
        <div style="font-weight:700;color:#00ff64;margin-bottom:6px;">⚙️ Work Tools Config</div>
        <div style="font-size:10px;color:#555;margin-bottom:8px;">Saved to this browser only — never leaves your device.</div>

        <div style="font-size:11px;font-weight:700;color:#00ff64;margin:6px 0 3px;">🎫 Jira</div>
        <input id="wt-jira-url"   placeholder="https://newsbank.atlassian.net" value="${c.jiraUrl||''}"   style="width:100%;background:#0d0d1a;border:1px solid #333;color:#fff;padding:5px 7px;border-radius:4px;margin:2px 0;font-size:11px;box-sizing:border-box;">
        <input id="wt-jira-email" placeholder="you@newsbank.com" value="${c.jiraEmail||''}" style="width:100%;background:#0d0d1a;border:1px solid #333;color:#fff;padding:5px 7px;border-radius:4px;margin:2px 0;font-size:11px;box-sizing:border-box;">
        <input id="wt-jira-token" type="password" placeholder="Jira API token (Atlassian account settings)" value="${c.jiraToken||''}" style="width:100%;background:#0d0d1a;border:1px solid #333;color:#fff;padding:5px 7px;border-radius:4px;margin:2px 0;font-size:11px;box-sizing:border-box;">

        <div style="font-size:11px;font-weight:700;color:#00ff64;margin:8px 0 3px;">🔍 Lansweeper</div>
        <input id="wt-ls-url"  placeholder="GraphQL endpoint URL" value="${c.lsUrl||''}"    style="width:100%;background:#0d0d1a;border:1px solid #333;color:#fff;padding:5px 7px;border-radius:4px;margin:2px 0;font-size:11px;box-sizing:border-box;">
        <input id="wt-ls-pat"  type="password" placeholder="Personal Access Token (PAT)" value="${c.lsPat||''}" style="width:100%;background:#0d0d1a;border:1px solid #333;color:#fff;padding:5px 7px;border-radius:4px;margin:2px 0;font-size:11px;box-sizing:border-box;">
        <input id="wt-ls-site" placeholder="Site name (optional filter)" value="${c.lsSiteId||''}" style="width:100%;background:#0d0d1a;border:1px solid #333;color:#fff;padding:5px 7px;border-radius:4px;margin:2px 0;font-size:11px;box-sizing:border-box;">

        <div style="font-size:11px;font-weight:700;color:#00ff64;margin:8px 0 3px;">⚡ Add Power Automate Flow (${flows.length} saved)</div>
        <input id="wt-pa-name" placeholder="Flow label (e.g. HR Equipment Return)" style="width:100%;background:#0d0d1a;border:1px solid #333;color:#fff;padding:5px 7px;border-radius:4px;margin:2px 0;font-size:11px;box-sizing:border-box;">
        <input id="wt-pa-url"  placeholder="HTTP trigger webhook URL" style="width:100%;background:#0d0d1a;border:1px solid #333;color:#fff;padding:5px 7px;border-radius:4px;margin:2px 0;font-size:11px;box-sizing:border-box;">

        <div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap;">
          <button class="clippy-chip" onclick="saveWorkCfgUI()">💾 Save Jira & LS</button>
          <button class="clippy-chip" onclick="addPAFlow()" style="border-color:#f90;color:#f90;">+ Save Flow</button>
          <button class="clippy-chip" onclick="clippyChip('my flows')" style="border-color:#555;color:#555;">View Flows</button>
        </div>
      </div>`);
    }

    window.saveWorkCfgUI = function() {
      saveWorkCfg({
        jiraUrl:   (document.getElementById('wt-jira-url')?.value   || '').trim(),
        jiraEmail: (document.getElementById('wt-jira-email')?.value || '').trim(),
        jiraToken: (document.getElementById('wt-jira-token')?.value || '').trim(),
        lsUrl:     (document.getElementById('wt-ls-url')?.value     || '').trim(),
        lsPat:     (document.getElementById('wt-ls-pat')?.value     || '').trim(),
        lsSiteId:  (document.getElementById('wt-ls-site')?.value    || '').trim(),
      });
      botMsg('✅ Jira & Lansweeper config saved.');
    };

    window.addPAFlow = function() {
      const name = (document.getElementById('wt-pa-name')?.value || '').trim();
      const url  = (document.getElementById('wt-pa-url')?.value  || '').trim();
      if (!name || !url) { botMsg('⚠️ Enter both a flow name and webhook URL.'); return; }
      const flows = getPAFlows();
      flows.push({ name, url });
      localStorage.setItem(PA_FLOWS_KEY, JSON.stringify(flows));
      botMsg(`✅ Flow saved: <b>${name}</b> (${flows.length} total)`);
    };

    /* ================================================================
       SQL · GraphQL · JQL — Query Libraries
    ================================================================ */

    const SQL_PRESETS = [
      { tag:'assets',    label:'All Assets — Summary',
        sql:`SELECT a.Name, a.Domain, a.IPAddress, ac.Username, ac.Department, a.LastActiveScan\nFROM tblAssets a\nJOIN tblAssetCustom ac ON a.AssetID = ac.AssetID\nORDER BY a.LastActiveScan DESC` },
      { tag:'offline',   label:'Assets Not Seen 30+ Days',
        sql:`SELECT a.Name, a.IPAddress, ac.Username, ac.Department, a.LastActiveScan\nFROM tblAssets a\nJOIN tblAssetCustom ac ON a.AssetID = ac.AssetID\nWHERE a.LastActiveScan < DATEADD(day,-30,GETDATE())\nORDER BY a.LastActiveScan ASC` },
      { tag:'department',label:'Assets by Department',
        sql:`SELECT ac.Department, COUNT(*) AS AssetCount\nFROM tblAssets a\nJOIN tblAssetCustom ac ON a.AssetID = ac.AssetID\nGROUP BY ac.Department\nORDER BY AssetCount DESC` },
      { tag:'software',  label:'Software Inventory — Find App',
        sql:`SELECT a.Name, ac.Username, s.SoftwareName, s.SoftwareVersion\nFROM tblAssets a\nJOIN tblAssetCustom ac ON a.AssetID = ac.AssetID\nJOIN tblSoftware s ON a.AssetID = s.AssetID\nWHERE s.SoftwareName LIKE '%Microsoft Teams%'\nORDER BY a.Name` },
      { tag:'os',        label:'OS Version Count',
        sql:`SELECT a.OSName AS OperatingSystem, COUNT(*) AS Count\nFROM tblAssets a\nGROUP BY a.OSName\nORDER BY Count DESC` },
      { tag:'user',      label:'Assets by User / Username',
        sql:`SELECT a.Name, a.IPAddress, ac.Username, ac.Department, a.LastActiveScan\nFROM tblAssets a\nJOIN tblAssetCustom ac ON a.AssetID = ac.AssetID\nWHERE ac.Username LIKE '%jahonen%'\nORDER BY a.LastActiveScan DESC` },
      { tag:'serial',    label:'Find Asset by Serial Number',
        sql:`SELECT a.Name, a.IPAddress, ac.Username, ac.SerialNumber, a.LastActiveScan\nFROM tblAssets a\nJOIN tblAssetCustom ac ON a.AssetID = ac.AssetID\nWHERE ac.SerialNumber = 'ABC123'\nORDER BY a.Name` },
      { tag:'logon',     label:'Recent Logon Events',
        sql:`SELECT TOP 50 a.Name, ul.Username, ul.Logon, ul.Logoff\nFROM tblAssets a\nJOIN tblUserlogon ul ON a.AssetID = ul.AssetID\nORDER BY ul.Logon DESC` },
      { tag:'service',   label:'Services — Find Running / Stopped',
        sql:`SELECT a.Name, s.Caption, s.State, s.StartMode\nFROM tblAssets a\nJOIN tblNtServices s ON a.AssetID = s.AssetID\nWHERE s.Caption LIKE '%Lansweeper%'\nORDER BY a.Name` },
      { tag:'patch',     label:'Windows Update / Patch Status',
        sql:`SELECT a.Name, ac.Username, wu.Title, wu.InstalledOn\nFROM tblAssets a\nJOIN tblAssetCustom ac ON a.AssetID = ac.AssetID\nJOIN tblWindowsUpdates wu ON a.AssetID = wu.AssetID\nWHERE wu.InstalledOn IS NULL\nORDER BY a.Name` },
    ];

    const GQL_PRESETS = [
      { tag:'asset',     label:'Find Asset by Name',
        gql:`{\n  Site {\n    site {\n      assetBasicInfo(\n        where: { assetBasicInfo: { name: { like: "%HOSTNAME%" } } }\n        limit: 10\n      ) { name ipAddress userName lastSeen operatingSystem }\n    }\n  }\n}` },
      { tag:'department',label:'Assets in Department',
        gql:`{\n  Site {\n    site {\n      assetBasicInfo(\n        where: { assetCustom: { department: { eq: "IT" } } }\n        limit: 50\n      ) { name ipAddress userName department lastSeen }\n    }\n  }\n}` },
      { tag:'serial',    label:'Find by Serial Number',
        gql:`{\n  Site {\n    site {\n      assetBasicInfo(\n        where: { assetBasicInfo: { serialNumber: { eq: "SERIAL" } } }\n      ) { name ipAddress userName operatingSystem lastSeen }\n    }\n  }\n}` },
      { tag:'software',  label:'Software on Asset',
        gql:`{\n  Site {\n    site {\n      software(\n        where: { assetBasicInfo: { name: { eq: "HOSTNAME" } } }\n        limit: 50\n      ) { softwareName softwareVersion publisher }\n    }\n  }\n}` },
      { tag:'user',      label:'Assets for a User',
        gql:`{\n  Site {\n    site {\n      assetBasicInfo(\n        where: { assetBasicInfo: { userName: { like: "%username%" } } }\n      ) { name ipAddress userName lastSeen operatingSystem }\n    }\n  }\n}` },
      { tag:'offline',   label:'Assets Not Seen 30+ Days',
        gql:`{\n  Site {\n    site {\n      assetBasicInfo(\n        where: { assetBasicInfo: { lastSeen: { lt: "DATEOFFSET" } } }\n        limit: 50\n        sort: { assetBasicInfo: { lastSeen: { order: ASC } } }\n      ) { name ipAddress userName lastSeen department }\n    }\n  }\n}` },
    ];

    const JQL_PRESETS = [
      { tag:'mine',      label:'My Open Tickets',
        jql:`assignee = currentUser() AND resolution = Unresolved ORDER BY updated DESC` },
      { tag:'sprint',    label:'Current Sprint — IT Project',
        jql:`project = IT AND sprint in openSprints() ORDER BY priority DESC` },
      { tag:'critical',  label:'Critical / High Priority Unresolved',
        jql:`priority in (Critical, High) AND resolution = Unresolved ORDER BY created ASC` },
      { tag:'today',     label:'Updated Today',
        jql:`updated >= startOfDay() ORDER BY updated DESC` },
      { tag:'overdue',   label:'Overdue (Past Due Date)',
        jql:`duedate < now() AND resolution = Unresolved ORDER BY duedate ASC` },
      { tag:'created',   label:'Created by Me This Week',
        jql:`reporter = currentUser() AND created >= startOfWeek() ORDER BY created DESC` },
      { tag:'unassigned',label:'Unassigned Open Tickets',
        jql:`assignee is EMPTY AND resolution = Unresolved ORDER BY created ASC` },
      { tag:'comment',   label:'Tickets Waiting on Me',
        jql:`assignee = currentUser() AND status = "Waiting for Support" ORDER BY updated ASC` },
    ];

    /* — SQL Browser — */
    function showSQLBrowser(filter) {
      const cfg = getWorkCfg();
      const results = filter
        ? SQL_PRESETS.filter(s => s.tag.includes(filter) || s.label.toLowerCase().includes(filter))
        : SQL_PRESETS;
      if (!results.length) { botMsg('No SQL presets matched: ' + filter); return; }
      let html = `<div id="clippy-result-hover">
        <div style="font-weight:700;color:#00ff64;margin-bottom:6px;">🗄️ SQL Queries${filter ? ': ' + filter : ''}</div>
        ${!cfg.sqlUrl ? '<div style="font-size:10px;color:#f90;margin-bottom:6px;">⚠️ No SQL endpoint — copy queries for SSMS. Add <b>sqlUrl</b> in work config to execute live.</div>' : ''}`;
      results.forEach((s, i) => {
        const safe = s.sql.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,'\\n');
        html += `<div style="margin-bottom:8px;border-bottom:1px solid #111;padding-bottom:6px;">
          <div style="font-size:11px;font-weight:700;color:#bbb;margin-bottom:3px;">${s.label}</div>
          <pre style="font-size:10px;color:#00ff64;background:#0a0a14;padding:6px;border-radius:4px;overflow-x:auto;margin:0;white-space:pre-wrap;">${s.sql}</pre>
          <div style="display:flex;gap:5px;margin-top:4px;">
            <button class="clippy-chip" style="font-size:10px;" onclick="navigator.clipboard.writeText('${safe}'.replace(/\\n/g,'\\n'));this.textContent='✅ Copied';setTimeout(()=>this.textContent='📋 Copy',1500)">📋 Copy</button>
            ${cfg.sqlUrl ? `<button class="clippy-chip" style="font-size:10px;border-color:#0f2;color:#0f2;" onclick="runSQL(${i})">▶ Run</button>` : ''}
          </div>
        </div>`;
      });
      if (!filter) {
        const tags = [...new Set(SQL_PRESETS.map(s => s.tag))];
        html += `<div style="margin-top:4px;font-size:10px;color:#555;">Filter: ` + tags.map(t => `<button class="clippy-chip" onclick="clippyChip('sql ${t}')" style="font-size:9px;padding:1px 6px;">${t}</button>`).join(' ') + `</div>`;
      }
      html += `</div>`;
      addHTML(html);
    }

    window.runSQL = async function(idx) {
      const cfg = getWorkCfg();
      if (!cfg.sqlUrl) { botMsg('⚙️ No SQL endpoint — add sqlUrl in work config.'); return; }
      const s = SQL_PRESETS[idx];
      botMsg(`🗄️ Running: ${s.label}…`);
      try {
        const r = await fetch(cfg.sqlUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(cfg.sqlToken ? { 'Authorization': 'Bearer ' + cfg.sqlToken } : {}) },
          body: JSON.stringify({ query: s.sql })
        });
        const data = await r.json();
        const rows = Array.isArray(data) ? data : (data.results || data.rows || []);
        if (!rows.length) { botMsg('Query returned no rows.'); return; }
        const cols = Object.keys(rows[0]);
        let html = `<div id="clippy-result-hover"><div style="font-weight:700;color:#00ff64;margin-bottom:6px;">🗄️ ${s.label} (${rows.length} rows)</div>
          <div style="overflow-x:auto;font-size:10px;"><table style="border-collapse:collapse;width:100%;">
          <tr>${cols.map(c => `<th style="text-align:left;padding:3px 6px;border-bottom:1px solid #00ff64;color:#00ff64;">${c}</th>`).join('')}</tr>
          ${rows.slice(0,15).map(row => `<tr>${cols.map(c => `<td style="padding:3px 6px;border-bottom:1px solid #111;color:#bbb;">${row[c] ?? ''}</td>`).join('')}</tr>`).join('')}
          </table></div>
          ${rows.length > 15 ? `<div style="font-size:10px;color:#555;margin-top:4px;">${rows.length - 15} more rows — copy query for SSMS to see all.</div>` : ''}
        </div>`;
        addHTML(html);
      } catch(e) {
        botMsg('⚠️ SQL endpoint error: ' + e.message);
      }
    };

    /* — GraphQL Runner — */
    function showGQLRunner(presetIdx) {
      const cfg = getWorkCfg();
      const preset = presetIdx !== undefined ? GQL_PRESETS[presetIdx] : null;
      const presetBtns = GQL_PRESETS.map((p, i) =>
        `<button class="clippy-chip" onclick="showGQLPreset(${i})" style="font-size:9px;margin:2px;">${p.label}</button>`
      ).join('');
      addHTML(`<div id="clippy-result-hover">
        <div style="font-weight:700;color:#00ff64;margin-bottom:6px;">⬡ GraphQL Runner</div>
        <div style="margin-bottom:6px;font-size:10px;color:#888;">Presets:</div>
        <div style="display:flex;flex-wrap:wrap;gap:2px;margin-bottom:8px;">${presetBtns}</div>
        <input id="gql-endpoint" placeholder="GraphQL endpoint URL" value="${cfg.lsUrl||''}" style="width:100%;background:#0d0d1a;border:1px solid #333;color:#fff;padding:5px 7px;border-radius:4px;margin:2px 0;font-size:11px;box-sizing:border-box;">
        <input id="gql-token" type="password" placeholder="Bearer token / PAT" value="${cfg.lsPat||''}" style="width:100%;background:#0d0d1a;border:1px solid #333;color:#fff;padding:5px 7px;border-radius:4px;margin:2px 0;font-size:11px;box-sizing:border-box;">
        <textarea id="gql-query" placeholder="Enter GraphQL query..." style="width:100%;background:#0a0a14;border:1px solid #333;color:#00ff64;padding:6px;border-radius:4px;margin:4px 0;font-size:11px;font-family:monospace;height:100px;box-sizing:border-box;">${preset ? preset.gql : ''}</textarea>
        <textarea id="gql-vars" placeholder='Variables (JSON, optional) {"key":"value"}' style="width:100%;background:#0a0a14;border:1px solid #333;color:#888;padding:6px;border-radius:4px;margin:2px 0;font-size:11px;font-family:monospace;height:40px;box-sizing:border-box;"></textarea>
        <div style="display:flex;gap:6px;margin-top:8px;">
          <button class="clippy-chip" onclick="runGQL()" style="border-color:#00ff64;color:#00ff64;">▶ Run Query</button>
          <button class="clippy-chip" onclick="copyGQL()" style="font-size:10px;">📋 Copy</button>
        </div>
      </div>`);
    }

    window.showGQLPreset = function(idx) {
      const ta = document.getElementById('gql-query');
      if (ta) ta.value = GQL_PRESETS[idx].gql;
    };

    window.copyGQL = function() {
      const q = document.getElementById('gql-query')?.value || '';
      navigator.clipboard.writeText(q).then(() => botMsg('📋 Query copied.'));
    };

    window.runGQL = async function() {
      const url   = document.getElementById('gql-endpoint')?.value.trim();
      const token = document.getElementById('gql-token')?.value.trim();
      const query = document.getElementById('gql-query')?.value.trim();
      const varsRaw = document.getElementById('gql-vars')?.value.trim();
      if (!url || !query) { botMsg('⚠️ Enter endpoint URL and query.'); return; }
      let variables = {};
      if (varsRaw) { try { variables = JSON.parse(varsRaw); } catch { botMsg('⚠️ Variables JSON is invalid.'); return; } }
      botMsg('⬡ Running GraphQL query…');
      try {
        const r = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': 'Bearer ' + token } : {}) },
          body: JSON.stringify({ query, variables })
        });
        const data = await r.json();
        if (data.errors) { botMsg('⚠️ GraphQL errors: ' + data.errors.map(e => e.message).join(', ')); return; }
        const pretty = JSON.stringify(data.data, null, 2);
        addHTML(`<div id="clippy-result-hover">
          <div style="font-weight:700;color:#00ff64;margin-bottom:6px;">⬡ GraphQL Result</div>
          <pre style="font-size:10px;color:#bbb;background:#0a0a14;padding:8px;border-radius:4px;overflow:auto;max-height:200px;margin:0;">${pretty.replace(/</g,'&lt;')}</pre>
          <button class="clippy-chip" style="margin-top:6px;font-size:10px;" onclick="navigator.clipboard.writeText(${JSON.stringify(pretty)});this.textContent='✅ Copied';setTimeout(()=>this.textContent='📋 Copy JSON',1500)">📋 Copy JSON</button>
        </div>`);
      } catch(e) {
        botMsg('⚠️ GraphQL error: ' + e.message + ' — check endpoint, token, and VPN.');
      }
    };

    /* — JQL Preset Browser — */
    function showJQLPresets(filter) {
      const results = filter
        ? JQL_PRESETS.filter(j => j.tag.includes(filter) || j.label.toLowerCase().includes(filter))
        : JQL_PRESETS;
      const base = jiraBase();
      let html = `<div id="clippy-result-hover">
        <div style="font-weight:700;color:#00ff64;margin-bottom:6px;">🎫 JQL Presets</div>`;
      results.forEach(j => {
        const safe = j.jql.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
        const jiraLink = base ? `<a href="${base}/issues/?jql=${encodeURIComponent(j.jql)}" target="_blank" class="clippy-chip" style="font-size:10px;text-decoration:none;">↗ Open in Jira</a>` : '';
        html += `<div style="margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #111;">
          <div style="font-size:11px;font-weight:700;color:#bbb;margin-bottom:3px;">${j.label}</div>
          <pre style="font-size:10px;color:#f90;background:#0a0a14;padding:5px;border-radius:4px;margin:0;white-space:pre-wrap;">${j.jql}</pre>
          <div style="display:flex;gap:5px;margin-top:4px;align-items:center;">
            <button class="clippy-chip" style="font-size:10px;" onclick="navigator.clipboard.writeText('${safe}');this.textContent='✅ Copied';setTimeout(()=>this.textContent='📋 Copy',1500)">📋 Copy</button>
            ${jiraLink}
          </div>
        </div>`;
      });
      html += `</div>`;
      addHTML(html);
    }

    /* — Portal Query Library — Lansweeper portal-level report links + common queries — */
    function showPortalQueries() {
      const cfg = getWorkCfg();
      const lsBase = cfg.lsUrl ? cfg.lsUrl.replace('/api/v2/graphql','').replace('/graphql','') : 'https://app.lansweeper.com';
      const portals = [
        { icon:'🖥️', label:'All Assets Report',     desc:'Full asset inventory list',          url: lsBase + '/report' },
        { icon:'📊', label:'Report Builder',          desc:'Create custom SQL/template reports',  url: lsBase + '/report/new' },
        { icon:'📡', label:'Network Discovery',       desc:'Scan ranges and credential sets',     url: lsBase + '/scanning-targets' },
        { icon:'🧩', label:'Software Inventory',      desc:'Apps installed across all assets',    url: lsBase + '/software' },
        { icon:'🔐', label:'Windows Updates View',    desc:'Patch compliance dashboard',          url: lsBase + '/updates' },
        { icon:'📋', label:'Active Issues',           desc:'Failed scans, offline agents',        url: lsBase + '/issues' },
        { icon:'🔗', label:'Integrations',            desc:'API keys, connectors, webhooks',      url: lsBase + '/settings/integrations' },
      ];
      const queries = [
        { icon:'🔍', label:'Find asset by hostname',  call: () => { botMsg('Type: <b>find HOSTNAME</b> to search Lansweeper via GraphQL'); } },
        { icon:'🗄️', label:'SQL query library',       call: () => showSQLBrowser(null) },
        { icon:'⬡',  label:'GraphQL runner',          call: () => showGQLRunner() },
        { icon:'🎫', label:'JQL preset browser',       call: () => showJQLPresets(null) },
      ];
      let html = `<div id="clippy-result-hover">
        <div style="font-weight:700;color:#00ff64;margin-bottom:6px;">🔗 Portal Query Center</div>
        <div style="font-size:10px;color:#888;margin-bottom:8px;">Lansweeper portal links + query tools</div>
        <div style="font-size:11px;font-weight:700;color:#bbb;margin:4px 0;">📡 Portal Links</div>`;
      portals.forEach(p => {
        html += `<div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid #111;">
          <span style="font-size:14px;">${p.icon}</span>
          <div style="flex:1;">
            <a href="${p.url}" target="_blank" style="color:#00ff64;font-size:11px;font-weight:700;text-decoration:none;">${p.label}</a>
            <div style="font-size:10px;color:#555;">${p.desc}</div>
          </div>
        </div>`;
      });
      html += `<div style="font-size:11px;font-weight:700;color:#bbb;margin:8px 0 4px;">⚡ Query Tools</div>`;
      queries.forEach((q, i) => {
        html += `<button class="clippy-chip" style="margin:2px;font-size:10px;" onclick="window.__pq${i}&&window.__pq${i}()">${q.icon} ${q.label}</button>`;
        window[`__pq${i}`] = q.call;
      });
      html += `</div>`;
      addHTML(html);
    }

    /* == Inline copy buttons on <code> blocks == */
    function addCopyBtns(html) {
        return html.replace(/<code>([^<]+)<\/code>/g, function(_, cmd) {
            const safe = cmd.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
            return '<code>' + cmd + '</code>'
                + '<button class="clippy-code-copy" onclick="navigator.clipboard.writeText(\'' + safe + '\');this.textContent=\'✅\';setTimeout(()=>this.textContent=\'⧉\',1500)">⧉</button>';
        });
    }

    /* == Copy to Clipboard == */
    window.copyToClipboard = function (text) {
        navigator.clipboard.writeText(text).then(() => {
            botMsg("✅ Copied to clipboard!");
        });
    };

    /* == Message Functions == */
    function userMsg(text) {
        addHTML(`<div id="clippy-msg-user">${text}</div>`);
    }

    function botMsg(text) {
        addHTML(`<div id="clippy-msg-bot">${text}</div>`);
    }

    function addHTML(html) {
        const msgs = document.getElementById('clippy-messages');
        msgs.insertAdjacentHTML('beforeend', html);
        msgs.scrollTop = msgs.scrollHeight;
    }

})();

document.addEventListener('DOMContentLoaded', function() {
    console.log('Clippy v3 loaded with shop functionality!');
});
