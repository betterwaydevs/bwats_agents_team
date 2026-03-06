process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { chromium } = require('../dashboard/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const envFile = fs.readFileSync(path.join(__dirname, '../../bwats_xano/.env'), 'utf8');
const getEnv = (key) => {
  const match = envFile.match(new RegExp(`^${key}='?([^'\\n]+)'?$`, 'm'));
  return match ? match[1].trim() : '';
};

const email = getEnv('TEST_USER_EMAIL');
const password = getEnv('TEST_USER_PASSWORD');
const outDir = path.join(__dirname, '../features/reports/INT2');
fs.mkdirSync(outDir, { recursive: true });

console.log('Using email:', email, 'password length:', password.length);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  // Login via the form
  await page.goto('http://localhost:8080/login');
  await page.waitForTimeout(2000);

  // Debug: list all inputs
  const inputs = await page.locator('input').all();
  for (const input of inputs) {
    const type = await input.getAttribute('type');
    const placeholder = await input.getAttribute('placeholder');
    console.log('Input found:', type, placeholder);
  }

  // Fill login
  await page.locator('input').first().fill(email);
  await page.locator('input').nth(1).fill(password);
  await page.waitForTimeout(500);

  // Screenshot login form filled
  await page.screenshot({ path: path.join(outDir, 'int2-login-filled.png') });

  // Click sign in
  await page.locator('button:has-text("Sign in")').click();
  await page.waitForTimeout(5000);
  console.log('After login URL:', page.url());

  // If still on login, check for errors
  if (page.url().includes('login')) {
    await page.screenshot({ path: path.join(outDir, 'int2-login-error.png') });
    console.log('Login failed - still on login page');
    // Try with API token directly in the page context
    const resp = await fetch('https://xano.atlanticsoft.co/api:Ks58d17q/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Data-Source': 'development' },
      body: JSON.stringify({ email, password })
    });
    const data = await resp.json();
    if (data.authToken) {
      console.log('Got token via API, injecting...');
      await page.evaluate((token) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('token', token);
      }, data.authToken);
      await page.goto('http://localhost:8080/templates');
      await page.waitForTimeout(3000);
      console.log('After token inject URL:', page.url());
    }
  }

  // Navigate to templates
  if (!page.url().includes('templates')) {
    await page.goto('http://localhost:8080/templates');
    await page.waitForTimeout(3000);
  }

  console.log('Final URL:', page.url());
  await page.screenshot({ path: path.join(outDir, 'int2-templates-list.png'), fullPage: false });
  console.log('Screenshot 1: templates list');

  // Try clicking create button
  const allButtons = await page.locator('button').allTextContents();
  console.log('Buttons found:', allButtons.filter(t => t.trim()));

  for (const btn of await page.locator('button').all()) {
    const text = (await btn.textContent() || '').trim();
    if (/new template|create/i.test(text)) {
      await btn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(outDir, 'int2-create-template-dialog.png'), fullPage: false });
      console.log('Screenshot 2: create dialog');
      break;
    }
  }

  await browser.close();
  console.log('Done');
})().catch(e => console.error(e));
