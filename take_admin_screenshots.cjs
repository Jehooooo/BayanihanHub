const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const outputDir = path.join(__dirname, 'admin-screenshots');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9222;

const adminUser = {
  id: "user-5",
  userId: 5,
  email: "admin@bayanihanhub.com",
  username: "admin",
  fullName: "Admin User",
  phone: "09170000000",
  address: "Municipal Hall",
  barangay: "Poblacion",
  municipality: "San Fernando",
  province: "La Union",
  avatar: "",
  role: "admin",
  isVerified: true,
  account_status: "APPROVED",
  verificationStatus: "APPROVED",
  facial_verification_status: "PASSED",
  id_verification_status: "VERIFIED",
  isTrusted: true,
  isSuspended: false
};

const pagesToCapture = [
  { name: '01_Admin_Dashboard.png', url: 'http://localhost:5173/admin' },
  { name: '02_Identity_Approvals.png', url: 'http://localhost:5173/admin/approvals' },
  { name: '03_Manage_Users.png', url: 'http://localhost:5173/admin/users' },
  { name: '04_Manage_Posts.png', url: 'http://localhost:5173/admin/posts' },
  { name: '05_Manage_Requests.png', url: 'http://localhost:5173/admin/requests' },
  { name: '06_Manage_Reports.png', url: 'http://localhost:5173/admin/reports' },
  { name: '07_Manage_Categories.png', url: 'http://localhost:5173/admin/categories' }
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
  }

  async connect() {
    if (this.ws.readyState === WebSocket.OPEN) return;
    return new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.ws.close();
  }
}

async function run() {
  console.log('Launching headless Chrome...');
  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--window-size=1440,960',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-extensions',
    '--hide-scrollbars',
    'about:blank'
  ]);

  await sleep(2000);

  try {
    const list = await getJson(`http://localhost:${port}/json/list`);
    const pageTarget = list.find(t => t.type === 'page') || list[0];
    if (!pageTarget) throw new Error('No page target found in Chrome');

    console.log('Connecting to Chrome CDP WebSocket:', pageTarget.webSocketDebuggerUrl);
    const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('DOM.enable');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 960,
      deviceScaleFactor: 1,
      mobile: false
    });

    console.log('Navigating to login page to set auth in localStorage...');
    await client.send('Page.navigate', { url: 'http://localhost:5173/login' });
    await sleep(2000);

    const authPayload = JSON.stringify({
      state: {
        user: adminUser,
        isAuthenticated: true
      },
      version: 0
    });

    console.log('Injecting admin auth into localStorage...');
    await client.send('Runtime.evaluate', {
      expression: `localStorage.setItem('bayanihan-auth', ${JSON.stringify(authPayload)});`
    });

    // 1. Capture Dashboard with Beta Notice Modal
    console.log('Navigating to http://localhost:5173/admin ...');
    await client.send('Page.navigate', { url: 'http://localhost:5173/admin' });
    await sleep(2500);

    console.log('Capturing 01_Beta_Notice_Modal.png ...');
    let shot = await client.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(path.join(outputDir, '01_Beta_Notice_Modal.png'), Buffer.from(shot.data, 'base64'));

    // Dismiss the modal
    console.log('Dismissing BetaNoticeModal...');
    await client.send('Runtime.evaluate', {
      expression: `(() => {
        const dialog = document.querySelector('div[role="dialog"]');
        if (dialog) {
          const btn = Array.from(dialog.querySelectorAll('button')).find(b => b.textContent.includes('Okay')) || dialog.querySelector('button');
          if (btn) btn.click();
          else dialog.remove();
        }
      })()`
    });
    await sleep(1000);

    console.log('Capturing 01_Admin_Dashboard.png (clean)...');
    shot = await client.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(path.join(outputDir, '01_Admin_Dashboard.png'), Buffer.from(shot.data, 'base64'));

    // 2. Identity Approvals & Photo Approvals
    console.log('Navigating to http://localhost:5173/admin/approvals ...');
    await client.send('Page.navigate', { url: 'http://localhost:5173/admin/approvals' });
    await sleep(2500);

    console.log('Capturing 02_Identity_Approvals.png ...');
    shot = await client.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(path.join(outputDir, '02_Identity_Approvals.png'), Buffer.from(shot.data, 'base64'));

    console.log('Switching to Photo Approvals tab...');
    await client.send('Runtime.evaluate', {
      expression: `(() => {
        const photoTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Photo Approvals'));
        if (photoTab) photoTab.click();
      })()`
    });
    await sleep(1000);

    console.log('Capturing 02b_Photo_Approvals.png ...');
    shot = await client.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(path.join(outputDir, '02b_Photo_Approvals.png'), Buffer.from(shot.data, 'base64'));

    // 3. Other pages
    const remainingPages = [
      { name: '03_Manage_Users.png', url: 'http://localhost:5173/admin/users' },
      { name: '04_Manage_Posts.png', url: 'http://localhost:5173/admin/posts' },
      { name: '05_Manage_Requests.png', url: 'http://localhost:5173/admin/requests' },
      { name: '06_Manage_Reports.png', url: 'http://localhost:5173/admin/reports' },
      { name: '07_Manage_Categories.png', url: 'http://localhost:5173/admin/categories' }
    ];

    for (const p of remainingPages) {
      console.log(`Navigating to ${p.url}...`);
      await client.send('Page.navigate', { url: p.url });
      await sleep(2500);

      console.log(`Capturing screenshot for ${p.name}...`);
      shot = await client.send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: false
      });
      fs.writeFileSync(path.join(outputDir, p.name), Buffer.from(shot.data, 'base64'));
      console.log(`Saved screenshot: ${p.name}`);
    }

    client.close();
    console.log('All screenshots captured successfully!');
  } finally {
    chromeProcess.kill();
  }
}

run().catch(err => {
  console.error('Error taking screenshots:', err);
  process.exit(1);
});
