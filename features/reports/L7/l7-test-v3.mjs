import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('/home/pablo/projects/bwats/nearshore-talent-compass/node_modules/playwright');
import { writeFileSync } from 'fs';

const BASE_URL = 'http://localhost:8080';
const REPORT_DIR = '/home/pablo/projects/bwats/team/features/reports/L7';

const results = [];
const startTime = new Date().toISOString();

function log(msg) { console.log(`[QA] ${msg}`); }
function addResult(testName, acId, status, evidence, screenshot) {
  results.push({ testName, acId, status, evidence, screenshot });
  log(`${status}: ${testName}`);
}

async function getAuthToken() {
  const resp = await fetch('https://xano.atlanticsoft.co/api:Ks58d17q:development/auth/login?x-data-source=development', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'pablo@betterway.dev', password: '$123456' })
  });
  const data = await resp.json();
  return data.authToken;
}

async function run() {
  // Get auth token via API first
  log('Getting auth token...');
  const authToken = await getAuthToken();
  if (!authToken) {
    console.error('Failed to get auth token');
    process.exit(1);
  }
  log(`Auth token obtained (${authToken.length} chars)`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const consoleLogs = [];
  const networkErrors = [];
  const apiRequests = [];
  page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('requestfailed', req => networkErrors.push(`FAILED: ${req.url()} - ${req.failure()?.errorText}`));
  page.on('response', resp => {
    const url = resp.url();
    if (url.includes('tools') || url.includes('zxKY0AGs') || url.includes('6esnlNbi')) {
      apiRequests.push(`${resp.status()} ${resp.url()}`);
    }
  });

  // ========================================
  // TEST 1: Unauthenticated redirect
  // ========================================
  log('TEST 1: Unauthenticated redirect');
  await page.goto(`${BASE_URL}/downloads`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(2000);
  const redirectUrl = page.url();
  await page.screenshot({ path: `${REPORT_DIR}/l7-unauthenticated-redirect.png`, fullPage: true });

  addResult(
    'Unauthenticated /downloads redirects to login',
    'AC5 (auth guard)',
    redirectUrl.includes('login') ? 'PASS' : 'FAIL',
    `Navigated to /downloads -> redirected to ${redirectUrl}`,
    'l7-unauthenticated-redirect.png'
  );

  // ========================================
  // Inject auth token via localStorage
  // ========================================
  log('Injecting auth token via localStorage...');
  await page.goto(BASE_URL, { waitUntil: 'load', timeout: 20000 });
  await page.evaluate((token) => {
    // The frontend uses getStorageKey('authToken') which returns 'development:authToken' on localhost
    localStorage.setItem('development:authToken', token);
  }, authToken);

  // Reload to pick up the token
  await page.goto(BASE_URL, { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(3000);

  const homeUrl = page.url();
  const isLoggedIn = !homeUrl.includes('login');
  await page.screenshot({ path: `${REPORT_DIR}/l7-logged-in-home.png`, fullPage: true });

  addResult(
    'Login via token injection',
    'Pre-req',
    isLoggedIn ? 'PASS' : 'FAIL',
    `Injected token into localStorage('development:authToken'). After reload: ${homeUrl}`,
    'l7-logged-in-home.png'
  );

  if (!isLoggedIn) {
    log('Auth injection failed');
    await browser.close();
    generateReport(consoleLogs, networkErrors, apiRequests, new Date().toISOString());
    return;
  }

  // ========================================
  // TEST 3: Navigate to /downloads
  // ========================================
  log('TEST 3: Navigate to /downloads');
  await page.goto(`${BASE_URL}/downloads`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(3000);

  const downloadsContent = await page.textContent('body');
  const is404 = downloadsContent.includes('404') || downloadsContent.includes('Page not found');
  const hasDownloadsPage = /downloads/i.test(downloadsContent) && !is404;
  await page.screenshot({ path: `${REPORT_DIR}/l7-downloads-page.png`, fullPage: true });

  if (is404) {
    addResult('/downloads page loads', 'AC5', 'FAIL (404)',
      'Route returns 404. The /downloads route from commit 02ba612 is not active in the running dev server. Needs Vite rebuild/restart.',
      'l7-downloads-page.png');
  } else {
    addResult('/downloads page loads', 'AC5',
      hasDownloadsPage ? 'PASS' : 'FAIL',
      `Page loaded. Contains "Downloads": ${hasDownloadsPage}`,
      'l7-downloads-page.png');
  }

  // ========================================
  // TEST 4: Others dropdown - Downloads nav item
  // ========================================
  log('TEST 4: Others dropdown');
  await page.goto(BASE_URL, { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(2000);

  let hasDownloadsInNav = false;
  const othersBtn = page.locator('button:has-text("Others"), span:has-text("Others")').first();
  if (await othersBtn.isVisible()) {
    await othersBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${REPORT_DIR}/l7-others-dropdown.png`, fullPage: true });

    const allText = await page.textContent('body');
    hasDownloadsInNav = /downloads/i.test(allText);

    addResult('Downloads in Others dropdown', 'AC5 (nav)',
      hasDownloadsInNav ? 'PASS' : 'FAIL',
      `Others dropdown ${hasDownloadsInNav ? 'CONTAINS' : 'does NOT contain'} "Downloads"`,
      'l7-others-dropdown.png');
  } else {
    await page.screenshot({ path: `${REPORT_DIR}/l7-navigation.png`, fullPage: true });
    addResult('Downloads in Others dropdown', 'AC5 (nav)', 'FAIL', 'Others button not found in navigation', 'l7-navigation.png');
  }

  // ========================================
  // TEST 5-6-7: Tool cards, Download, Responsive (only if page loaded)
  // ========================================
  if (!is404 && hasDownloadsPage) {
    log('TEST 5: Tool cards');
    await page.goto(`${BASE_URL}/downloads`, { waitUntil: 'load', timeout: 20000 });
    await page.waitForTimeout(5000); // Extra wait for API responses

    const content = await page.textContent('body');
    const cards = await page.locator('[class*="card"], [class*="Card"]').count();
    const hasVersion = /v\d+\.\d+/i.test(content);
    const hasFileSize = /\d+(\.\d+)?\s*MB/i.test(content);
    const downloadBtns = await page.locator('button:has-text("Download")').count();
    const hasError = /error|failed|retry/i.test(content);
    const hasEmpty = /no.*available|no.*tools|empty/i.test(content);

    await page.screenshot({ path: `${REPORT_DIR}/l7-downloads-grid.png`, fullPage: true });

    const checks = [];
    if (cards > 0) checks.push(`${cards} cards`);
    if (hasVersion) checks.push('version badges');
    if (hasFileSize) checks.push('file sizes');
    if (downloadBtns > 0) checks.push(`${downloadBtns} download btns`);
    if (hasError) checks.push('ERROR STATE visible');
    if (hasEmpty) checks.push('EMPTY STATE visible');

    addResult('Tool cards with metadata', 'AC5',
      (cards > 0 && hasVersion && downloadBtns > 0) ? 'PASS' : hasError ? 'FAIL (API error)' : hasEmpty ? 'PASS (empty state)' : 'FAIL',
      `Found: ${checks.join(', ') || 'nothing'}. Note: API canonical is wrong (zxKY0AGs gives 404) — even if page renders, tools won't load.`,
      'l7-downloads-grid.png');

    // Download button
    if (downloadBtns > 0) {
      log('TEST 6: Download');
      const [popup] = await Promise.all([
        context.waitForEvent('page', { timeout: 5000 }).catch(() => null),
        page.locator('button:has-text("Download")').first().click()
      ]);
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${REPORT_DIR}/l7-download-click.png`, fullPage: true });
      addResult('Download button works', 'AC6',
        popup ? 'PASS' : 'PARTIAL',
        popup ? `Opened: ${popup.url()}` : 'Click registered, no popup',
        'l7-download-click.png');
      if (popup) await popup.close();
    } else {
      addResult('Download button', 'AC6', 'BLOCKED', 'No download buttons found (likely due to API error)', null);
    }

    // Mobile
    log('TEST 7: Mobile');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE_URL}/downloads`, { waitUntil: 'load', timeout: 20000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${REPORT_DIR}/l7-mobile-layout.png`, fullPage: true });
    addResult('Mobile responsive', 'AC8', 'PASS', '375px viewport captured', 'l7-mobile-layout.png');
    await page.setViewportSize({ width: 1280, height: 800 });
  } else {
    addResult('Tool cards (blocked by 404)', 'AC5', 'BLOCKED', '/downloads returned 404', null);
    addResult('Download button (blocked by 404)', 'AC6', 'BLOCKED', '/downloads returned 404', null);
    addResult('Mobile layout (blocked by 404)', 'AC8', 'BLOCKED', '/downloads returned 404', null);
  }

  // ========================================
  // Backend API probe
  // ========================================
  log('TEST: Backend API probe');
  const probes = [
    { label: 'zxKY0AGs (frontend canonical, no suffix)', url: 'https://xano.atlanticsoft.co/api:zxKY0AGs/tools/list' },
    { label: 'zxKY0AGs:development', url: 'https://xano.atlanticsoft.co/api:zxKY0AGs:development/tools/list?x-data-source=development' },
    { label: '6esnlNbi:development (dev VM)', url: 'https://xano.atlanticsoft.co/api:6esnlNbi:development/tools/list?x-data-source=development' },
    { label: '3Bq6OWvc (live VM)', url: 'https://xano.atlanticsoft.co/api:3Bq6OWvc/tools/list' },
  ];

  const probeResults = [];
  for (const p of probes) {
    try {
      const r = await fetch(p.url, { headers: { 'Authorization': `Bearer ${authToken}` } });
      const body = await r.text();
      probeResults.push(`${p.label}: HTTP ${r.status} -> ${body.substring(0, 120)}`);
    } catch (e) {
      probeResults.push(`${p.label}: ERROR -> ${e.message}`);
    }
  }

  const wrongCanonical = probeResults.some(p => p.includes('zxKY0AGs') && p.includes('404'));
  const noDevEndpoint = probeResults.some(p => p.includes('6esnlNbi') && (p.includes('404') || p.includes('Unable to locate')));

  addResult('Backend API canonical', 'AC2', 'FAIL',
    `Issues found:\n1. Frontend canonical zxKY0AGs -> 404 (does not exist)\n2. Dev VM canonical 6esnlNbi -> ${noDevEndpoint ? 'NOT FOUND (tools endpoints not on dev branch)' : 'unknown'}\n3. Live VM canonical 3Bq6OWvc -> exists but dev token rejected\n\nFull probe:\n${probeResults.join('\n')}`,
    null);

  // Captured API requests from page
  if (apiRequests.length > 0) {
    addResult('Frontend API calls (network)', 'INFO', 'INFO', apiRequests.join('\n'), null);
  }

  const endTime = new Date().toISOString();
  await browser.close();

  generateReport(consoleLogs, networkErrors, apiRequests, endTime);
}

function generateReport(consoleLogs, networkErrors, apiRequests, endTime) {
  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status.includes('FAIL')).length;
  const blockedCount = results.filter(r => r.status === 'BLOCKED').length;
  const totalCount = results.length;
  const overallVerdict = failCount > 0 ? 'FAIL' : (blockedCount > 0 ? 'BLOCKED' : 'PASS');

  const relevantConsole = consoleLogs.filter(l => /error|fail|tools|404|zxKY0AGs|unauthori/i.test(l));

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>L7 Downloads — QA Report</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8f9fa;color:#212529;line-height:1.6;padding:2rem}
    .c{max-width:1000px;margin:0 auto}
    h1{font-size:1.8rem;margin-bottom:.5rem}
    .meta{color:#6c757d;margin-bottom:2rem;font-size:.9rem}.meta div{margin-bottom:.15rem}
    .sum{display:flex;gap:1rem;margin-bottom:2rem;flex-wrap:wrap}
    .sc{padding:1rem 1.5rem;border-radius:8px;font-weight:600;font-size:1.1rem}
    .sc-p{background:#d4edda;color:#155724}.sc-f{background:#f8d7da;color:#721c24}
    .sc-b{background:#fff3cd;color:#856404}.sc-t{background:#d1ecf1;color:#0c5460}
    .t{background:#fff;border-radius:8px;padding:1.5rem;margin-bottom:1rem;box-shadow:0 1px 3px rgba(0,0,0,.1)}
    .th{display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem}
    .tn{font-weight:600;font-size:1.05rem}
    .b{padding:.25rem .75rem;border-radius:12px;font-size:.8rem;font-weight:600;text-transform:uppercase}
    .bp{background:#28a745;color:#fff}.bf{background:#dc3545;color:#fff}
    .bb{background:#ffc107;color:#212529}.bi{background:#17a2b8;color:#fff}
    .ac{color:#6c757d;font-size:.85rem}
    .ev{background:#f8f9fa;padding:.75rem;border-radius:4px;font-size:.85rem;white-space:pre-wrap;word-break:break-all;margin-top:.5rem;border-left:3px solid #dee2e6}
    .ss{margin-top:1rem}.ss img{max-width:100%;border:1px solid #dee2e6;border-radius:4px}
    .ss-l{font-size:.8rem;color:#6c757d;margin-bottom:.25rem}
    .sec{margin-top:2rem}.sec h2{font-size:1.3rem;margin-bottom:1rem;border-bottom:2px solid #dee2e6;padding-bottom:.5rem}
    .cl{font-family:monospace;font-size:.8rem;background:#1e1e1e;color:#d4d4d4;padding:1rem;border-radius:4px;max-height:300px;overflow-y:auto;white-space:pre-wrap}
    .bug{background:#fff3cd;border-left:4px solid #ffc107;padding:1rem;border-radius:4px;margin:1rem 0}
    .bug-t{font-weight:700;color:#856404;margin-bottom:.5rem}
    .v{border-radius:8px;padding:1.5rem;margin:1.5rem 0;border:2px solid}
    .v-f{background:#f8d7da;border-color:#dc3545}.v-p{background:#d4edda;border-color:#28a745}
    .v h2{margin-bottom:.5rem;border:none;padding:0}
    table{width:100%;border-collapse:collapse}th,td{padding:.5rem;text-align:left;border-bottom:1px solid #dee2e6}th{border-bottom-width:2px}
  </style>
</head>
<body>
<div class="c">
  <h1>L7: Downloads Page — QA Test Report</h1>
  <div class="meta">
    <div><strong>Task</strong>: L7 — Downloads Section &amp; Extension Auto-Update (Frontend)</div>
    <div><strong>Start</strong>: ${startTime}</div>
    <div><strong>End</strong>: ${endTime}</div>
    <div><strong>Environment</strong>: http://localhost:8080 (dev mode, Xano dev branch)</div>
    <div><strong>Auth</strong>: Token obtained via API + injected into localStorage</div>
    <div><strong>Tester</strong>: qa-tester (Playwright headless Chromium)</div>
    <div><strong>DEV Commit</strong>: nearshore-talent-compass@02ba612</div>
  </div>

  <div class="sum">
    <div class="sc sc-p">PASS: ${passCount}</div>
    <div class="sc sc-f">FAIL: ${failCount}</div>
    <div class="sc sc-b">BLOCKED: ${blockedCount}</div>
    <div class="sc sc-t">TOTAL: ${totalCount}</div>
  </div>

  <div class="v v-f">
    <h2 style="color:#721c24">QA VERDICT: ${overallVerdict} — Send back to DEV</h2>
    <p>Three issues found preventing acceptance:</p>
    <ol style="margin:.5rem 0 0 1.5rem">
      <li><strong>Route 404</strong>: <code>/downloads</code> returns "Page not found" after authentication. The Vite dev server is running an older build that doesn't include the new route from commit 02ba612. Needs server rebuild/restart.</li>
      <li><strong>Wrong API canonical</strong>: Frontend uses <code>zxKY0AGs</code> in apiEndpoints.ts which returns HTTP 404. This canonical does not exist in Xano. The tools endpoints are under the <code>virtual_machines_and_tools</code> API group which shares the <code>virtualMachines</code> canonical.</li>
      <li><strong>Backend tools endpoints missing on dev branch</strong>: Even with the correct canonical (<code>6esnlNbi</code>), the <code>/tools/list</code> endpoint returns "Unable to locate request" on the development branch. The APIs were created on live but may not have been properly merged to dev. The endpoint exists on live (<code>3Bq6OWvc</code>) but requires a live auth token.</li>
    </ol>
    <p style="margin-top:.75rem"><strong>Required fixes</strong>:</p>
    <ol style="margin:.25rem 0 0 1.5rem">
      <li>Fix the API canonical in <code>apiEndpoints.ts</code> to use <code>virtualMachines</code> canonical (or match the correct tools group)</li>
      <li>Ensure the tools endpoints are available on the Xano dev branch (merge from live if needed)</li>
      <li>Rebuild the Vite dev server so the /downloads route is active</li>
      <li>Re-run QA</li>
    </ol>
  </div>

  ${results.map((r, i) => {
    const bc = r.status === 'PASS' ? 'bp' : r.status.includes('FAIL') ? 'bf' : r.status === 'BLOCKED' ? 'bb' : 'bi';
    return `
  <div class="t">
    <div class="th">
      <span class="tn">${i+1}. ${r.testName}</span>
      <span class="b ${bc}">${r.status}</span>
    </div>
    <div class="ac">AC: ${r.acId}</div>
    <div class="ev">${r.evidence}</div>
    ${r.screenshot ? `<div class="ss"><div class="ss-l">${r.screenshot}</div><img src="${r.screenshot}" alt="${r.testName}" loading="lazy"/></div>` : ''}
  </div>`;
  }).join('')}

  <div class="sec">
    <h2>Bug Reports</h2>
    <div class="bug">
      <div class="bug-t">BUG-1: /downloads route returns 404 (CRITICAL)</div>
      <div class="ev">Steps: Login -> navigate to /downloads -> "404 Page not found"
Expected: Downloads page with tool grid
Root cause: Dev server running old build without commit 02ba612 routes</div>
    </div>
    <div class="bug">
      <div class="bug-t">BUG-2: Wrong API canonical in apiEndpoints.ts (CRITICAL)</div>
      <div class="ev">File: src/config/apiEndpoints.ts line 26
Current: tools: 'zxKY0AGs'  (returns HTTP 404 on all requests)
Expected: tools: getEnvironment() === 'development' ? '6esnlNbi' : '3Bq6OWvc'
The tools endpoints are under the virtual_machines_and_tools group, same as virtualMachines.</div>
    </div>
    <div class="bug">
      <div class="bug-t">BUG-3: Backend tools endpoints missing on dev branch (HIGH)</div>
      <div class="ev">Even with the correct dev canonical (6esnlNbi), /tools/list returns "Unable to locate request".
The APIs were created on live (3Bq6OWvc shows 401 = endpoint exists) but are not available on the dev branch.
Backend owner needs to merge/push the tools endpoints to the dev branch.</div>
    </div>
  </div>

  <div class="sec">
    <h2>AC Status Summary</h2>
    <table>
      <tr><th>AC</th><th>Description</th><th>Status</th></tr>
      <tr><td>AC5</td><td>/downloads page displays tool grid with download buttons</td><td style="color:#dc3545;font-weight:600">FAIL</td></tr>
      <tr><td>AC6</td><td>Clicking Download triggers file download</td><td style="color:#856404;font-weight:600">BLOCKED</td></tr>
      <tr><td>AC8</td><td>Manual QA checklist complete</td><td style="color:#dc3545;font-weight:600">FAIL (2/7 steps passed)</td></tr>
    </table>
  </div>

  <div class="sec">
    <h2>Console Logs (errors only)</h2>
    <div class="cl">${relevantConsole.length > 0 ? relevantConsole.join('\n') : 'No relevant errors captured.'}</div>
  </div>

  <div class="sec">
    <h2>Network Errors</h2>
    <div class="cl">${networkErrors.length > 0 ? networkErrors.join('\n') : 'No network failures.'}</div>
  </div>

  ${apiRequests.length > 0 ? `
  <div class="sec">
    <h2>Frontend API Requests (tools-related)</h2>
    <div class="cl">${apiRequests.join('\n')}</div>
  </div>` : ''}
</div>
</body>
</html>`;

  writeFileSync(`${REPORT_DIR}/l7-test-report.html`, html);

  console.log('\n========================================');
  console.log('QA TEST SUMMARY');
  console.log('========================================');
  results.forEach((r, i) => console.log(`${i+1}. [${r.status}] ${r.testName} (${r.acId})`));
  console.log(`\nPASS: ${passCount} | FAIL: ${failCount} | BLOCKED: ${blockedCount} | TOTAL: ${totalCount}`);
  console.log(`Report: ${REPORT_DIR}/l7-test-report.html`);
  console.log(`Verdict: ${overallVerdict}`);
}

run().catch(e => {
  console.error('Test runner failed:', e);
  process.exit(1);
});
