/*================================================================
  Clippy - CDS Training Site Chatbot v3
  Features: sopData, tinData, WINGET_APPS (also copy)
            NEW: PRODUCT CATALOG for quote prep
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

    /* == WINGET APPS (existing) == */
    const WINGET_APPS = [
        {cmd:"winget install Microsoft.PowerShell",apps:["powershell","pwsh"]},
        {cmd:"winget install Microsoft.VisualStudioCode",apps:["vscode","visual studio code","code editor"]},
        {cmd:"winget install Git.Git",apps:["git","github desktop"]},
        {cmd:"winget install Google.Chrome",apps:["chrome","google chrome","browser"]},
        {cmd:"winget install Mozilla.Firefox",apps:["firefox","mozilla"]},
        {cmd:"winget install Microsoft.Edge",apps:["edge","microsoft edge"]},
        {cmd:"winget install 7zip.7zip",apps:["7zip","archive","zip"]},
        {cmd:"winget install Notepad++.Notepad++",apps:["notepad++","notepad plus"]},
        {cmd:"winget install Adobe.Acrobat.Reader.64-bit",apps:["adobe reader","pdf reader","acrobat"]},
        {cmd:"winget install VideoLAN.VLC",apps:["vlc","media player","video player"]},
        {cmd:"winget install Microsoft.Teams",apps:["teams","microsoft teams"]},
        {cmd:"winget install Zoom.Zoom",apps:["zoom","video conference"]},
        {cmd:"winget install Slack.Slack",apps:["slack","chat"]},
        {cmd:"winget install PuTTY.PuTTY",apps:["putty","ssh client"]},
        {cmd:"winget install WinSCP.WinSCP",apps:["winscp","sftp","ftp"]},
        {cmd:"winget install Python.Python.3.11",apps:["python","python3"]},
        {cmd:"winget install OpenJS.NodeJS",apps:["nodejs","node","npm"]},
        {cmd:"winget install Microsoft.DotNet.SDK.8",apps:["dotnet",".net","sdk"]},
        {cmd:"winget install Docker.DockerDesktop",apps:["docker","docker desktop","containers"]},
        {cmd:"winget install OBSProject.OBSStudio",apps:["obs","obs studio","screen recorder"]},
        {cmd:"winget install Microsoft.PowerToys",apps:["powertoys","power toys","windows utilities"]}
    ];

    /* == Toggle Window == */
    window.clippyToggle = function () {
        isOpen = !isOpen;
        const win = document.getElementById('clippy-window');
        win.classList.toggle('open', isOpen);
        if (isOpen) {
            if (!hasGreeted) {
                botMsg("👋 Hi! I'm Clippy, your IT assistant. Ask me about SOPs, tips, winget commands, or search the shop for items to build quotes!");
                hasGreeted = true;
            }
            document.getElementById('clippy-input').focus();
        }
    };

    /* == Send Message == */
    window.clippySend = function () {
        const input = document.getElementById('clippy-input');
        const q = input.value.trim();
        if (!q) return;
        userMsg(q);
        input.value = '';
        handleQuery(q);
    };

    /* == Site Knowledge Base == */
  const SITE_KNOWLEDGE = [
    {
      keys: ['windows update','update windows','wu','check for updates','run updates','windows updates'],
      icon: '🔄', title: 'Windows Updates',
      steps: [
        'Press <b>Win + I</b> to open Settings.',
        'Click <b>Windows Update</b> (Win 10: Update & Security).',
        'Click <b>Check for updates</b>.',
        'Click <b>Download and install</b> for any pending updates.',
        'Restart when prompted to apply updates.',
        '<b>Tip:</b> Run <code>wuauclt /detectnow</code> in Run (Win+R) to force a check.'
      ]
    },
    {
      keys: ['dell command update','dcu','dell update','dell driver update','dell command'],
      icon: '🖥️', title: 'Dell Command Update',
      steps: [
        'Open <b>Dell Command Update</b> from Start Menu or System Tray.',
        'Click <b>Check</b> to scan for available driver & BIOS updates.',
        'Review the list — select updates to install or click <b>Install All</b>.',
        'Let it download and install. Do NOT close lid or power off.',
        'Restart if prompted (especially for BIOS updates).',
        '<b>Silent install winget:</b>',
        '<code>winget install Dell.CommandUpdate</code>',
        '<b>Silent run via CMD:</b>',
        '<code>dcu-cli.exe /applyUpdates -reboot=enable</code>'
      ],
      cmd: 'winget install Dell.CommandUpdate'
    },
    {
      keys: ['browser','chrome','edge','firefox','web browser','browser not working','browser slow','clear cache','browser fix'],
      icon: '🌐', title: 'Web Browser Fix',
      steps: [
        'Right-click browser icon → <b>Run as administrator</b> if it won\'t open.',
        'Clear cache: <b>Ctrl+Shift+Delete</b> → check All time → Clear data.',
        'Disable extensions: Menu → Extensions → disable all → test.',
        'Reset browser: Settings → Advanced → Reset settings.',
        'Reinstall if still broken — use winget below.'
      ]
    },
    {
      keys: ['outlook','email','mail','email not working','email setup','outlook fix','email sync'],
      icon: '📧', title: 'Email / Outlook Fix',
      steps: [
        'Check internet connection first.',
        'Open Outlook → <b>File → Account Settings → Account Settings</b>.',
        'Select your account → click <b>Repair</b>.',
        'If repair fails: Remove account → Add it back.',
        'For sync issues: <b>Send/Receive → Send/Receive All Folders (F9)</b>.',
        '<b>Clear Outlook cache:</b> Close Outlook, delete files in <code>%localappdata%\\Microsoft\\Outlook</code>.'
      ]
    },
    {
          keys: ['printer','print','printing','printer not working','printer offline','add printer','print queue','printer driver','driver install','install driver','hp driver','canon driver','epson driver','brother driver','lexmark driver','driver download','driver missing','driver update','update driver','printer driver missing'],
      icon: '🖨️', title: 'Printer & Driver Help',
      steps: [
        '<b>🖨️ Basic Printer Fix:</b>',
        'Check printer is powered on and connected (USB or network).',
        'Open <b>Settings → Bluetooth & devices → Printers & scanners</b>.',
        'Click printer → <b>Open print queue</b> → cancel stuck jobs.',
        'Restart Print Spooler: Win+R → <code>services.msc</code> → Print Spooler → Restart.',
        '<b>🔧 Printer Driver Install / Update:</b>',
        '<b>Option 1 — Windows Update:</b> Settings → Windows Update → Advanced → Optional Updates → check Driver Updates.',
        '<b>Option 2 — Device Manager:</b> Right-click Start → Device Manager → find Printer → right-click → <b>Update driver</b> → Search automatically.',
        '<b>Option 3 — Manufacturer Site:</b> Go to manufacturer support page and download driver for your OS.',
        '<b>HP:</b> <code>support.hp.com</code> | <b>Canon:</b> <code>usa.canon.com/support</code> | <b>Epson:</b> <code>epson.com/support</code> | <b>Brother:</b> <code>support.brother.com</code>',
        '<b>Option 4 — Remove & Reinstall:</b> Settings → Printers → select printer → Remove → then re-add via <b>Add a printer or scanner</b>.',
        '<b>Option 5 — winget (HP Smart / universal):</b>',
        '<code>winget install HP.HPSmart</code>',
        '<b>Force driver cleanup via CMD (run as admin):</b>',
        '<code>printui.exe /s /t2</code>  (opens Print Server Properties → Drivers tab to remove old drivers)'
      ],
      cmd: 'printui.exe /s /t2'
    },
    {
      keys: ['network drive','map drive','shared drive','drive not connected','reconnect drive','file share','unc path'],
      icon: '💾', title: 'Network Drive Mapping',
      steps: [
        'Open <b>File Explorer (Win+E)</b> → right-click <b>This PC</b> → <b>Map network drive</b>.',
        'Choose a drive letter (e.g. Z:).',
        'Enter the network path: <code>\\\\server\\sharename</code>.',
        'Check <b>Reconnect at sign-in</b> → click Finish.',
        'If prompted: enter your domain credentials.',
        '<b>Via CMD:</b> <code>net use Z: \\\\server\\share /persistent:yes</code>'
      ]
    },
    {
      keys: ['password reset','reset password','locked out','account locked','forgot password','change password'],
      icon: '🔑', title: 'Password Reset / Account Unlock',
      steps: [
        'In Active Directory: Open <b>AD Users & Computers</b>.',
        'Find the user → right-click → <b>Reset Password</b>.',
        'Set temp password → check <b>User must change password at next logon</b>.',
        'To unlock: right-click user → <b>Unlock Account</b>.',
        '<b>Via PowerShell:</b>',
        '<code>Unlock-ADAccount -Identity username</code>',
        '<code>Set-ADAccountPassword -Identity user -Reset -NewPassword (ConvertTo-SecureString \'TempPass1!\' -AsPlainText -Force)</code>'
      ]
    },
    {
      keys: ['remote desktop','rdp','remote into','remote access','logmein','connect remotely','remote control'],
      icon: '🖥️', title: 'Remote Desktop / RDP',
      steps: [
        'Press <b>Win+R</b> → type <code>mstsc</code> → Enter.',
        'Enter the computer name or IP address.',
        'Click <b>Connect</b> → enter credentials.',
        'To enable RDP on target: Settings → System → Remote Desktop → Enable.',
        '<b>Quick connect via CMD:</b>',
        '<code>mstsc /v:COMPUTERNAME</code>'
      ]
    },
    {
      keys: ['help desk','help desk task','common task','ticket','troubleshoot','first steps','basic fix'],
      icon: '🎯', title: 'Common Help Desk Steps',
      steps: [
        '1. Get user name, location, and device name.',
        '2. <b>Restart first</b> — fixes 80% of issues.',
        '3. Remote in via LogMeIn / RDP to investigate.',
        '4. Check Event Viewer for errors: <code>eventvwr.msc</code>.',
        '5. Document steps taken in the ticket.',
        '6. Escalate if unresolved after 2 attempts.',
        '7. Ask user if anything else needs attention before closing.'
      ]
    },
    {
      keys: ['disk cleanup','storage','low disk','free space','clean up','temp files','disk space'],
      icon: '🗂️', title: 'Disk Cleanup',
      steps: [
        'Run <b>Disk Cleanup</b>: Win+S → search Disk Cleanup → select C: drive.',
        'Check all boxes including <b>Temporary files</b> → OK.',
        'For deeper clean: click <b>Clean up system files</b>.',
        '<b>Via PowerShell (force clean temps):</b>',
        '<code>Remove-Item -Path $env:TEMP\\* -Recurse -Force</code>',
        '<code>cleanmgr /sagerun:1</code>'
      ]
    },
    // ── AT&T WIRELESS ACTIVATION SOP ──
    {
      keys: ['att','att activation','att wireless','activate phone','phone activation','att portal','business portal','att business','wireless activation','sim activation','att sim','new line','activate new line','att line'],
      icon: '📱', title: 'AT&T Wireless Phone Activation',
      steps: [
        '<b style="color:#00e5cc">🏢 PART 1 — IT / Business Portal (Admin Steps)</b>',
        '<b>Step 1 — Log into AT&T Business Portal:</b>',
        'Go to <code>businessdirect.att.com</code> → sign in with your business credentials.',
        '<b>Step 2 — Navigate to Manage Devices:</b>',
        'From the dashboard: <b>My Wireless → Manage Devices & Features</b>.',
        '<b>Step 3 — Select the Line to Activate:</b>',
        'Find the account/line → click the phone number or device row → select <b>Activate</b>.',
        '<b>Step 4 — Enter Device Info (if new device):</b>',
        'Enter the <b>IMEI</b> (found on box or Settings → About Phone) and <b>SIM ICCID</b> (on SIM card or packaging).',
        '<b>Step 5 — Confirm Plan & Features:</b>',
        'Verify data plan, hotspot, and any add-ons → click <b>Submit / Confirm Activation</b>.',
        '<b>Step 6 — Note the confirmation number</b> and allow <b>5–15 minutes</b> for activation to complete.',
        '<b style="color:#00e5cc">👤 PART 2 — End User Experience (User Steps)</b>',
        '<b>Step 1 — Insert SIM card</b> into the device (if physical SIM) or confirm eSIM was pushed.',
        '<b>Step 2 — Power cycle the phone</b> — turn fully off, wait 30 seconds, power back on.',
        '<b>Step 3 — Check for carrier signal:</b>',
        'Look for <b>AT&T</b> or signal bars in top-right corner. May take up to 15 minutes.',
        '<b>Step 4 — Test the line:</b>',
        'Make a test call, send a text, and verify mobile data is working.',
        '<b>Step 5 — Set up voicemail:</b>',
        'Hold <b>1</b> on the keypad or dial <code>*86</code> → follow prompts to set greeting & PIN.',
        '<b>Step 6 — Corporate Email / MDM (if applicable):</b>',
        'Open <b>Company Portal</b> app or contact IT to enroll the device in MDM.',
        '<b style="color:#aaa">⚠️ If no signal after 30 min:</b> Contact AT&T Business Support at <code>1-800-331-0500</code> with the IMEI and order confirmation number.'
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
    // Winget search
    if (lower.includes('winget') || (lower.includes('install') && !lower.includes('how'))) {
      searchWinget(lower);
      return;
    }

    // SITE_KNOWLEDGE inline answer
    const kb = SITE_KNOWLEDGE.find(k => k.keys.some(kw => lower.includes(kw)));
    if (kb) {
      botMsg('\uD83D\uDCCB <b>' + kb.icon + ' ' + kb.title + '</b>');
      let stepsHtml = '<div style="margin-top:6px;">';
      kb.steps.forEach((step, i) => {
        stepsHtml += '<div style="padding:4px 0;border-bottom:1px solid #0f2;opacity:0.85;font-size:12px;">' + step + '</div>';
      });
      stepsHtml += '</div>';
      if (kb.cmd) {
                const safeCmd = kb.cmd.replace(/"/g, '&quot;');
        stepsHtml += '<div id="clippy-cmd-box"><div id="clippy-cmd-text">' + kb.cmd + '</div><button id="clippy-copy-btn" data-cmd="' + safeCmd + '" onclick="navigator.clipboard.writeText(this.dataset.cmd);this.textContent=\'Copied!\';setTimeout(()=>this.textContent=\'Copy\',1500)">Copy</button></div>';
      }
      addHTML(stepsHtml);
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
            botMsg("🔍 No winget apps found. Try 'chrome', 'vscode', 'teams', etc.");
            return;
        }

        matches.forEach(w => {
            const fullCmd = `${w.cmd} ${FLAGS}`;
            let html = `<div id="clippy-result-hover">
                <div id="clippy-result-hover-line">
                    <div id="clippy-result-hover-name">${w.cmd}</div>
                    <button id="clippy-result-hover-copy-btn" onclick="copyToClipboard('${fullCmd.replace(/'/g, "\\'")}')">Copy</button>
                </div>
            </div>`;
            addHTML(html);
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
