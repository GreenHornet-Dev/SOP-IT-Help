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
    #clippy-messages{flex:1;overflow-y:auto;padding:12px;max-height:400px;min-height:200px;scrollbar-width:thin;}
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
        if (p.includes('training'))             return 'training';
        if (p.includes('services'))             return 'services';
        if (p.includes('shop'))                 return 'shop';
        return 'default';
    }

    const PAGE_CHIPS = {
        'sop-portal':   ['🖨️ Printer Fix','🔑 Password Reset','🔄 Windows Update','🛒 Shop Gear','⌨️ Shortcuts'],
        'sop-printer':  ['🖨️ Clear Queue','🔌 Update Driver','➕ Add Printer','📋 All SOPs'],
        'sop-okta':     ['🔐 Okta password change','📧 Fix Office 365 token','🔄 Fix OneDrive sync','🧹 Clear credentials','📋 All SOPs'],
        'sop-email':    ['📧 Email Fix','📅 Out of Office','🔑 Password Reset','📋 All SOPs'],
        'sop-helpdesk': ['🔑 Password Reset','🔓 Unlock Account','🖥️ Remote Desktop','🔄 Windows Update'],
        'sop-updates':  ['🔄 Windows Update','🖥️ Dell Command Update','🧹 Clear Update Cache','📋 All SOPs'],
        'sop-teams':    ['💬 Teams Fix','📞 Teams Audio','🔄 Windows Update','📋 All SOPs'],
        'sop-office':   ['⌨️ Office Shortcuts','🔧 Repair Office','🔄 Update Office','📋 All SOPs'],
        'sop-zoom':     ['📹 Zoom Fix','🎤 Audio Fix','🔄 Windows Update','📋 All SOPs'],
        'sop-drive':    ['💾 Map Network Drive','🧹 Disk Cleanup','📋 All SOPs'],
        'sop-newhire':  ['🔑 Password Setup','🖨️ Add Printer','💬 Install Teams','📋 All SOPs'],
        'sop-offboard': ['🔑 Disable Account','🖨️ Remove Printers','📋 All SOPs'],
        'sop-automate':   ['⚡ Create Flow','🧪 Test Flow','📋 All SOPs'],
        'sop-lansweeper': ['🔍 Find Asset','📊 Run Report','🛡️ CrowdStrike','🖥️ LogMeIn','📋 All SOPs'],
        'sop-logmein':    ['🖥️ Start Session','🔑 Password Reset','🔍 Lansweeper','🛡️ CrowdStrike','📋 All SOPs'],
        'sop-crowdstrike':['🛡️ Respond to Detection','🔒 Contain Host','🖥️ RTR Session','🔍 Lansweeper','📋 All SOPs'],
        'sop-winget':   ['📋 Copy All Apps','🌐 Install Chrome','💬 Install Teams','📝 Install Notepad++','📋 All SOPs'],
        'training':     ['📋 Browse SOPs','🖨️ Printer Fix','🔑 Password Reset','🛒 Shop Gear'],
        'services':     ['💰 Get a Quote','🛒 Shop Laptops','🖥️ Shop Monitors','📞 Services'],
        'shop':         ['🛒 Shop Laptops','🖥️ Shop Monitors','🖨️ Shop Printers','💰 View Quote'],
        'default':      ['🖨️ Printer Fix','🔑 Password Reset','🔄 Windows Update','⌨️ Shortcuts','📋 SOPs'],
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
            if (!hasGreeted) {
                const ctx = getPageContext();
                botMsg(PAGE_GREETINGS[ctx] || PAGE_GREETINGS['default']);
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

  /* == Handle Query == */
  function handleQuery(q) {
    const lower = q.toLowerCase();

    // Site navigation
    const NAV_PAGES = [
      { keys: ['home','main page','cds home'], label: 'Home', url: 'https://greenhornet-dev.github.io/cds-green/index.html' },
      { keys: ['about','about us','who are'], label: 'About', url: 'https://greenhornet-dev.github.io/cds-green/about.html' },
      { keys: ['training','learn','courses'], label: 'Training', url: 'https://greenhornet-dev.github.io/cds-green/training.html' },
      { keys: ['services','support','tech support'], label: 'Services', url: 'https://greenhornet-dev.github.io/cds-green/services.html' },
      { keys: ['sop portal','sop list','all sops'], label: 'SOP Portal', url: './sop-portal.html' },
      { keys: ['winget one-liners','winget page','app installs','install all','winget table'], label: 'Winget One-Liners', url: './winget-one-liners.html' },
      { keys: ['dev','developer','dev page'], label: 'Dev', url: 'https://greenhornet-dev.github.io/cds-green/dev.html' },
    ];
    const navMatch = NAV_PAGES.find(p => p.keys.some(k => lower.includes(k)));
    if (navMatch) {
      addHTML(`<div id="clippy-result-hover">
        <div style="font-weight:700;color:#00ff64;margin-bottom:8px;">🔗 ${navMatch.label}</div>
        <a href="${navMatch.url}" style="background:#00ff64;color:#000;padding:5px 12px;border-radius:6px;font-weight:600;font-size:12px;text-decoration:none;">Open ${navMatch.label} →</a>
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
