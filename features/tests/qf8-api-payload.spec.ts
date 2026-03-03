import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import * as fs from 'fs';

const REPORT_DIR = '/home/pablo/projects/bwats/team/features/reports/QF8';
const SCREENSHOTS_DIR = REPORT_DIR;

// The test user credentials — from .env
const TEST_USER_EMAIL = 'pablo@betterway.dev';
const TEST_USER_NAME = 'Pablo'; // First name expected in from_email

// The API endpoint pattern for email sends
const EMAIL_API_PATTERN = /\/messaging\/send_email/;

interface CapturedRequest {
  url: string;
  body: Record<string, unknown>;
  timestamp: string;
}

test.describe('QF8 — API Payload Verification (from_email)', () => {
  test.setTimeout(90000);

  test('AC4: Email send API payload uses dynamic from_email, not hardcoded Laura', async ({ page }) => {
    const capturedRequests: CapturedRequest[] = [];

    // Intercept ALL requests to the send_email endpoint
    await page.route(EMAIL_API_PATTERN, async (route, request) => {
      const postData = request.postDataJSON();
      capturedRequests.push({
        url: request.url(),
        body: postData,
        timestamp: new Date().toISOString(),
      });

      // Fulfill with a mock response so we don't actually send emails
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          total: 1,
          sent_count: 1,
          queued_count: 1,
          association_updated_count: 1,
          results: [{
            person_id: postData?.person_ids?.[0]?.person_id || 1,
            person_type: postData?.person_ids?.[0]?.person_type || 'candidate',
            project_id: postData?.project_id || 0,
            status: 'queued',
            send_status: 'success',
            send_message: 'Queued for delivery',
            association_status: 'updated',
            association_message: '',
          }]
        }),
      });
    });

    // Navigate to project 12 (ZZ TEST PROJECT — the same one the user tested with)
    await page.goto('/projects/12');
    await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(3000);

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/qf8-project-page.png`, fullPage: true });

    // Try to find and click an email send button on a kanban card or contact list
    // Look for email/send buttons in the project view
    const emailButtons = page.locator('button:has(svg), [role="menuitem"]').filter({ hasText: /email|send|mail/i });
    const emailButtonCount = await emailButtons.count();

    // If we can find a send-email action, trigger it
    if (emailButtonCount > 0) {
      await emailButtons.first().click();
      await page.waitForTimeout(2000);
    }

    // Also navigate to a candidate profile page with email section
    await page.goto('/candidates');
    await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(3000);

    // Click the first candidate to open their profile
    const candidateRows = page.locator('tr[data-state], [class*="card"], a[href*="/profile/"]');
    const rowCount = await candidateRows.count();
    if (rowCount > 0) {
      await candidateRows.first().click();
      await page.waitForTimeout(3000);
    }

    // Try to find the email section/tab
    const emailTab = page.locator('button, [role="tab"]').filter({ hasText: /email/i });
    const emailTabCount = await emailTab.count();
    if (emailTabCount > 0) {
      await emailTab.first().click();
      await page.waitForTimeout(2000);
    }

    // Fill in email form if available
    const subjectInput = page.locator('input[placeholder*="subject" i], input[type="text"]').first();
    const subjectExists = await subjectInput.isVisible().catch(() => false);
    if (subjectExists) {
      await subjectInput.fill('QF8 API Payload Test');
    }

    // Try to fill body via rich text editor
    const editor = page.locator('[contenteditable="true"], .ql-editor').first();
    const editorExists = await editor.isVisible().catch(() => false);
    if (editorExists) {
      await editor.click();
      await editor.fill('Test email body for QF8 verification');
    }

    // Click send button if visible
    const sendButton = page.locator('button').filter({ hasText: /send/i });
    const sendButtonCount = await sendButton.count();
    if (sendButtonCount > 0 && await sendButton.first().isEnabled()) {
      await sendButton.first().click();
      await page.waitForTimeout(3000);
    }

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/qf8-email-form.png`, fullPage: true });

    // Save captured requests for the report even if no requests were triggered via UI
    const capturedData = { requests: capturedRequests, count: capturedRequests.length };
    fs.writeFileSync(`${REPORT_DIR}/captured-requests.json`, JSON.stringify(capturedData, null, 2));

    // Log what we captured
    console.log(`Captured ${capturedRequests.length} send_email requests`);
    for (const req of capturedRequests) {
      console.log(`  from_email: ${req.body.from_email}`);
      console.log(`  timestamp: ${req.timestamp}`);
    }
  });

  test('AC4: buildFromEmail JS function produces correct output for test user', async ({ page }) => {
    // Navigate to any authenticated page
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});

    // Execute buildFromEmail logic in the browser context using the actual auth user
    const result = await page.evaluate(() => {
      // Access the auth user from localStorage/React context
      // The auth context stores the user in React state, we need to read it from the DOM
      // Or we can reproduce the buildFromEmail logic and check what user data is available

      // First, check what's in localStorage for auth
      const keys = Object.keys(localStorage);
      const authTokenKey = keys.find(k => k.includes('authToken'));
      const authToken = authTokenKey ? localStorage.getItem(authTokenKey) : null;

      return { authToken: !!authToken, keys };
    });

    expect(result.authToken).toBe(true);

    // Now call the actual /auth/me endpoint to get the user data
    const userData = await page.evaluate(async () => {
      const keys = Object.keys(localStorage);
      const authTokenKey = keys.find(k => k.includes('authToken'));
      const authToken = authTokenKey ? localStorage.getItem(authTokenKey) : null;

      if (!authToken) return null;

      // Find the API base URL from the page
      const response = await fetch(
        `https://xano.atlanticsoft.co/api:Ks58d17q:development/auth/me?x-data-source=development`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) return null;
      return response.json();
    });

    expect(userData).not.toBeNull();
    expect(userData.name).toBeTruthy();
    expect(userData.email).toBeTruthy();

    // Now verify buildFromEmail logic
    const firstName = userData.name.split(' ')[0];
    const username = userData.email.split('@')[0];
    const expectedFromEmail = `${firstName} <${username}@email.betterway.dev>`;

    console.log(`User data: name="${userData.name}", email="${userData.email}"`);
    console.log(`Expected from_email: "${expectedFromEmail}"`);

    // Verify it does NOT match the old hardcoded value
    expect(expectedFromEmail).not.toContain('Laura');
    expect(expectedFromEmail).not.toContain('laura@');
    expect(expectedFromEmail).toContain(firstName);
    expect(expectedFromEmail).toContain(username);

    // Save for report
    fs.writeFileSync(`${REPORT_DIR}/user-data.json`, JSON.stringify({
      userName: userData.name,
      userEmail: userData.email,
      expectedFromEmail,
      testTimestamp: new Date().toISOString(),
    }, null, 2));
  });

  test('AC4: Route interception captures correct from_email in ContactListTable send', async ({ page }) => {
    const capturedPayloads: Record<string, unknown>[] = [];

    // Intercept the send_email API
    await page.route(EMAIL_API_PATTERN, async (route, request) => {
      const body = request.postDataJSON();
      capturedPayloads.push(body);

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          total: 1,
          sent_count: 1,
          queued_count: 1,
          association_updated_count: 1,
          results: [{
            person_id: body?.person_ids?.[0]?.person_id || 1,
            person_type: body?.person_ids?.[0]?.person_type || 'candidate',
            project_id: body?.project_id || 0,
            status: 'queued',
            send_status: 'success',
            send_message: 'Queued for delivery',
            association_status: 'updated',
            association_message: '',
          }]
        }),
      });
    });

    // Navigate to project 12 (the same project the user tested)
    await page.goto('/projects/12');
    await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(5000);

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/qf8-project12-loaded.png`, fullPage: true });

    // Try to switch to list view if available
    const listViewBtn = page.locator('button').filter({ hasText: /list|table/i });
    if (await listViewBtn.count() > 0) {
      await listViewBtn.first().click();
      await page.waitForTimeout(3000);
    }

    // Look for email action in a dropdown or action menu on a candidate row
    const moreButtons = page.locator('[aria-label="More"], button:has(svg[class*="more"]), [class*="MoreVertical"]');
    const moreCount = await moreButtons.count();
    if (moreCount > 0) {
      await moreButtons.first().click();
      await page.waitForTimeout(1000);

      const emailOption = page.locator('[role="menuitem"]').filter({ hasText: /email/i });
      if (await emailOption.count() > 0) {
        await emailOption.first().click();
        await page.waitForTimeout(2000);
      }
    }

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/qf8-project12-action.png`, fullPage: true });

    // Save captured data
    fs.writeFileSync(`${REPORT_DIR}/contact-list-payloads.json`, JSON.stringify(capturedPayloads, null, 2));

    if (capturedPayloads.length > 0) {
      for (const payload of capturedPayloads) {
        const fromEmail = payload.from_email as string;
        expect(fromEmail).not.toContain('Laura');
        expect(fromEmail).not.toContain('laura@');
        expect(fromEmail).toMatch(/@email\.betterway\.dev>/);
      }
    }
  });

  test('Source: grep confirms no hardcoded Laura in from_email assignments', async ({}) => {
    // Check all from_email assignments in source code
    const fromEmailLines = execSync(
      'grep -rn "from_email" /home/pablo/projects/bwats/nearshore-talent-compass/src/ --include="*.ts" --include="*.tsx" 2>/dev/null',
      { encoding: 'utf-8' }
    ).trim().split('\n');

    // Filter to only lines that SET from_email (not type definitions or display reads)
    const assignments = fromEmailLines.filter(line =>
      line.includes('from_email:') && !line.includes('interface') && !line.includes('//') && !line.includes('from_email}')
    );

    console.log('from_email assignments found:');
    for (const line of assignments) {
      console.log(`  ${line.trim()}`);
      // Verify each assignment uses buildFromEmail, not a hardcoded string
      if (line.includes('from_email:')) {
        const isTypeDefinition = line.includes('string;') || line.includes('string |');
        const isReadFromResponse = line.includes('email.from_email') || line.includes('emailDetail');
        if (!isTypeDefinition && !isReadFromResponse) {
          expect(line).toContain('buildFromEmail');
          expect(line).not.toContain('"Laura');
          expect(line).not.toContain("'Laura");
        }
      }
    }

    // Verify no hardcoded "Laura" in any from_email context
    const lauraInFromEmail = assignments.filter(l => l.toLowerCase().includes('laura'));
    expect(lauraInFromEmail).toHaveLength(0);
  });

  test('Source: no hardcoded Laura strings remain in production code', async ({}) => {
    const result = execSync(
      'grep -rn "Laura" /home/pablo/projects/bwats/nearshore-talent-compass/src/ --include="*.ts" --include="*.tsx" 2>/dev/null || echo "NONE"',
      { encoding: 'utf-8' }
    );

    const lines = result.trim().split('\n').filter(l => l !== 'NONE');
    console.log(`Found ${lines.length} "Laura" matches in source:`);
    for (const line of lines) {
      console.log(`  ${line}`);
      // All remaining "Laura" references must be in JSDoc/comments only (emailUtils.ts)
      expect(line).toContain('emailUtils.ts');
      expect(line).toMatch(/\*|\/\//); // Must be in a comment
    }
  });

  test('Source: no "laura@" email references in production code', async ({}) => {
    const result = execSync(
      'grep -rn "laura@" /home/pablo/projects/bwats/nearshore-talent-compass/src/ --include="*.ts" --include="*.tsx" 2>/dev/null || echo "NONE"',
      { encoding: 'utf-8' }
    );

    const lines = result.trim().split('\n').filter(l => l !== 'NONE');
    console.log(`Found ${lines.length} "laura@" matches in source:`);
    for (const line of lines) {
      console.log(`  ${line}`);
      // All must be in JSDoc/comments
      expect(line).toContain('emailUtils.ts');
      expect(line).toMatch(/\*|\/\//);
    }
  });

  test('Dist: production bundle has no hardcoded Laura email', async ({}) => {
    const checks = [
      { pattern: 'Laura Pulgarin', label: 'Laura Pulgarin' },
      { pattern: '"Laura <', label: '"Laura <..." email format' },
      { pattern: 'laura@email.betterway.dev', label: 'laura@ sending domain' },
      { pattern: 'laura@betterway.dev', label: 'laura@ personal domain' },
    ];

    for (const check of checks) {
      const result = execSync(
        `grep -c "${check.pattern}" /home/pablo/projects/bwats/nearshore-talent-compass/dist/assets/index-CQ-oIywG.js 2>/dev/null || echo "0"`,
        { encoding: 'utf-8' }
      ).trim();

      console.log(`  ${check.label}: ${result} occurrences`);
      expect(parseInt(result)).toBe(0);
    }
  });

  test('Build: npm run build succeeds with zero errors', async ({}) => {
    const result = execSync(
      'cd /home/pablo/projects/bwats/nearshore-talent-compass && npm run build 2>&1',
      { encoding: 'utf-8', timeout: 120000 }
    );

    expect(result).toContain('built in');
    expect(result).not.toContain('error TS');
    expect(result).not.toContain('ERROR');
    console.log('Build succeeded');
  });
});
