# QF10: Local Codex Prospect Parser — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace OpenAI API calls in prospect parsing with local `codex exec` (gpt-5.3-codex), running as both an HTTP server (triggered by extension opening a tab) and a local cron job (replaces Xano scheduled task #575/576).

**Architecture:** Python Flask server on `pablo-home-linux:8585`. Two entry points: HTTP `GET /parse?prospect_id=X` (extension tab trigger) and CLI `--cron` flag (single prospect per cron tick). Both share the same parse core: fetch HTML from Xano → clean → `codex exec` → save parsed JSON back to Xano. Two new Xano APIs handle the Xano-side data flow.

**Tech Stack:** Python 3, Flask, requests, subprocess (codex exec), python-dotenv, systemd, cron

---

## Prerequisites

- Xano credentials in `/home/pablo/projects/bwats/bwats_xano/.env` (`XANO_TOKEN`, `N8N_WEBHOOK_TOKEN`)
- `codex` CLI at `/home/pablo/.nvm/versions/node/v24.13.0/bin/codex`, model `gpt-5.3-codex`
- Xano live base URL: `https://xano.atlanticsoft.co`
- Project directory: `/home/pablo/projects/bwats/prospect_parser/`

---

## Task 1: Two New Xano API Endpoints

**Purpose:** Give the local parser a clean interface to get work and submit results — without touching any existing Xano logic.

**Files:**
- Work in: `../bwats_xano/` (bwats_xano project, follow its CLAUDE.md)
- New API: `GET /prospects/get_for_parsing` — returns one pending prospect with HTML, locks it as "parsing". Accepts optional `?prospect_id=X` to fetch a specific one.
- New API: `POST /prospects/save_parsed` — accepts `{prospect_id, parsed_json}`, runs the existing normalization + ES + DB patch + agent routing (same as current `parse_unparsed_prospect` steps d–h)

**Step 1: Create `GET /prospects/get_for_parsing` in Xano**

Use the Xano Metadata MCP (from `bwats_xano/` working dir). The endpoint logic:

```xanoscript
input {
  int prospect_id?   // optional — if provided, fetch that specific one; else oldest pending
  text auth_token
}

// Validate auth
precondition ($input.auth_token == $env.N8N_WEBHOOK_TOKEN) { error = "unauthorized" }

// Fetch prospect
if prospect_id provided:
  db.get parsed_prospect where id = $input.prospect_id
else:
  db.query parsed_prospect
    where linkedin_profile != "" AND parse_status IN ("", "pending", null)
    sort = {id: "asc"}
    return = single

// Lock it
db.patch parsed_prospect { id: $prospect.id, data: {parse_status: "parsing"} }

// Return id + linked_html + linkedin_profile + linked_recruit_profile_id + elastic_search_document_id
```

**Step 2: Create `POST /prospects/save_parsed` in Xano**

This endpoint replicates steps d–h of `parse_unparsed_prospect` but receives parsed JSON instead of calling OpenAI:

```xanoscript
input {
  int prospect_id
  text parsed_json    // JSON string of the parsed result
  text auth_token
}

// Validate auth
// Parse JSON string → object
// Run same normalization lambda as parse_unparsed_prospect (lines 183-339 of the function)
// ES create/update (same as steps e in parse_unparsed_prospect)
// DB patch (same as step f)
// Set parse_status = "parsed"
// Fire skill normalization (try/catch, silent)
// Fire agent routing (post_process, fire-and-forget)
// Return { success, prospect_id, parse_status, es_doc_id }
```

**Step 3: Test both endpoints with curl**

```bash
# Get oldest pending
curl -s "https://xano.atlanticsoft.co/api:zE_czJ22/prospects/get_for_parsing?auth_token=TOKEN" | python3 -m json.tool

# Get specific prospect
curl -s "https://xano.atlanticsoft.co/api:zE_czJ22/prospects/get_for_parsing?prospect_id=123&auth_token=TOKEN"

# Save parsed (use empty JSON for smoke test)
curl -s -X POST "https://xano.atlanticsoft.co/api:zE_czJ22/prospects/save_parsed" \
  -H "Content-Type: application/json" \
  -d '{"prospect_id":123,"parsed_json":"{}","auth_token":"TOKEN"}'
```

Expected: Both return 200, `get_for_parsing` returns prospect object with `linked_html` field.

**Step 4: Commit in bwats_xano repo**
```bash
cd ../bwats_xano && git add -A && git commit -m "QF10: add get_for_parsing + save_parsed APIs for local Codex parser"
```

---

## Task 2: Disable Xano Scheduled Task

**Purpose:** Stop the Xano task (#575 dev / #576 v1) from competing with the local cron job.

**Step 1:** In Xano UI or via MCP, set task #576 (v1) to `disabled` or change interval to 0.

**Step 2:** Verify no more auto-polling by checking `parse_status` stays at "pending" for a fresh prospect for > 2 minutes.

**Note:** Keep task #575 (dev) running for now — only disable v1 production task.

---

## Task 3: Project Setup

**Files:**
- Create: `/home/pablo/projects/bwats/prospect_parser/` (new directory)
- Create: `prospect_parser/parser.py`
- Create: `prospect_parser/.env`
- Create: `prospect_parser/requirements.txt`
- Create: `prospect_parser/README.md`

**Step 1: Create project directory and files**

```bash
mkdir -p /home/pablo/projects/bwats/prospect_parser
cd /home/pablo/projects/bwats/prospect_parser
```

**Step 2: Create `requirements.txt`**

```
flask==3.0.3
requests==2.32.3
python-dotenv==1.0.1
```

**Step 3: Create `.env`**

```bash
# Xano
XANO_BASE_URL=https://xano.atlanticsoft.co
XANO_API_GROUP=zE_czJ22
N8N_WEBHOOK_TOKEN=<copy from bwats_xano/.env>

# Codex
CODEX_BIN=/home/pablo/.nvm/versions/node/v24.13.0/bin/codex
CODEX_MODEL=gpt-5.3-codex

# Server
PORT=8585
```

**Step 4: Install dependencies**

```bash
pip3 install -r requirements.txt
```

Expected: All packages install cleanly.

**Step 5: Initialize git repo**

```bash
git init
echo ".env" >> .gitignore
echo "__pycache__/" >> .gitignore
echo "*.pyc" >> .gitignore
git add requirements.txt .gitignore README.md
git commit -m "QF10: init prospect parser project"
```

---

## Task 4: HTML Cleaner

**Purpose:** Replicate the Xano HTML cleaning logic (strip scripts/styles, base64, comments, whitespace — limit 240KB) in Python.

**Files:**
- Create: `prospect_parser/html_cleaner.py`
- Test: `prospect_parser/test_html_cleaner.py`

**Step 1: Write failing tests**

```python
# test_html_cleaner.py
from html_cleaner import clean_html

def test_strips_script_tags():
    html = '<div>Hello</div><script>alert("xss")</script>'
    result = clean_html(html)
    assert '<script>' not in result
    assert 'Hello' in result

def test_strips_style_tags():
    html = '<div>Hi</div><style>.red{color:red}</style>'
    result = clean_html(html)
    assert '<style>' not in result

def test_strips_html_comments():
    html = '<!-- secret -->visible'
    result = clean_html(html)
    assert 'secret' not in result
    assert 'visible' in result

def test_strips_base64():
    html = '<img src="data:image/png;base64,ABC123==" />'
    result = clean_html(html)
    assert 'base64' not in result

def test_truncates_at_240kb():
    big = '<p>' + 'x' * 300000 + '</p>'
    result = clean_html(big)
    assert len(result) <= 242000  # some buffer for text extraction

def test_empty_input():
    assert clean_html('') == ''
    assert clean_html(None) == ''
```

**Step 2: Run tests — verify they fail**

```bash
cd /home/pablo/projects/bwats/prospect_parser
python3 -m pytest test_html_cleaner.py -v
```

Expected: `ModuleNotFoundError: No module named 'html_cleaner'`

**Step 3: Implement `html_cleaner.py`**

```python
import re

SAFE_BYTES = 240_000

def clean_html(html: str) -> str:
    if not html:
        return ''

    # Strip scripts and styles
    s = re.sub(r'<script[\s\S]*?</script>', '', html, flags=re.IGNORECASE)
    s = re.sub(r'<style[\s\S]*?</style>', '', s, flags=re.IGNORECASE)

    # Strip HTML comments
    s = re.sub(r'<!--[\s\S]*?-->', '', s)

    # Strip base64 data URLs
    s = re.sub(r'data:[^;]+;base64,[A-Za-z0-9+/=]+', '', s)

    # Collapse whitespace
    s = re.sub(r'\s+', ' ', s)
    s = re.sub(r'>\s+<', '><', s)
    s = s.strip()

    if len(s.encode('utf-8')) > SAFE_BYTES:
        # Convert to plain text
        s = re.sub(r'</(p|div|li|h[1-6]|br|tr)>', '\n', s, flags=re.IGNORECASE)
        s = re.sub(r'<br\s*/?>', '\n', s, flags=re.IGNORECASE)
        s = re.sub(r'</?[^>]+>', '', s)
        s = s.replace('&nbsp;', ' ').replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
        s = re.sub(r'[ \t]+', ' ', s)
        s = re.sub(r'\s*\n+\s*', '\n', s).strip()

        encoded = s.encode('utf-8')
        if len(encoded) > SAFE_BYTES:
            # Truncate at clean boundary
            truncated = encoded[:SAFE_BYTES].decode('utf-8', errors='ignore')
            last_period = truncated.rfind('. ')
            last_newline = truncated.rfind('\n')
            cutoff = max(last_period, last_newline)
            if cutoff > SAFE_BYTES - 200:
                s = truncated[:cutoff + 1]
            else:
                s = truncated

    return s
```

**Step 4: Run tests — verify they pass**

```bash
python3 -m pytest test_html_cleaner.py -v
```

Expected: All 6 tests PASS.

**Step 5: Commit**

```bash
git add html_cleaner.py test_html_cleaner.py
git commit -m "QF10: HTML cleaner — replicate Xano cleaning logic in Python"
```

---

## Task 5: Codex Executor

**Purpose:** Call `codex exec` with the parsing prompt + HTML, capture the JSON output.

**Files:**
- Create: `prospect_parser/codex_runner.py`
- Create: `prospect_parser/parser_prompt.txt` (the prompt template)
- Test: `prospect_parser/test_codex_runner.py`

**Step 1: Extract the prompt to a file**

Copy the prompt template from Xano's `get_open_api_parser_prompt` function (the large block starting with `CURRENT_DATE = {{TODAY}}`). Save as `parser_prompt.txt` with `{{TODAY}}` placeholder intact.

```bash
# Verify the file exists and has the prompt
wc -l /home/pablo/projects/bwats/prospect_parser/parser_prompt.txt
```

Expected: > 100 lines.

**Step 2: Write failing tests**

```python
# test_codex_runner.py
import json
from unittest.mock import patch, MagicMock
from codex_runner import run_codex_parse, build_full_prompt

def test_build_full_prompt_includes_today():
    prompt = build_full_prompt('<div>test profile</div>')
    import datetime
    today = datetime.date.today().strftime('%Y-%m-%d')
    assert today in prompt
    assert 'test profile' in prompt
    assert 'keep all skills in english' in prompt

def test_build_full_prompt_replaces_placeholder():
    prompt = build_full_prompt('html')
    assert '{{TODAY}}' not in prompt

def test_run_codex_parse_returns_dict(tmp_path):
    # Mock subprocess to return a fake JSON response
    fake_json = json.dumps({
        "public_name": "Jane Doe",
        "first_name": "Jane",
        "last_name": "Doe",
        "skills": [{"skill": "Python", "months_experience": 24, "last_used": "2026-03"}]
    })
    with patch('codex_runner.subprocess.run') as mock_run:
        # Simulate codex writing output to the -o file
        def fake_run(args, **kwargs):
            # Find the -o output file arg
            if '-o' in args:
                out_file = args[args.index('-o') + 1]
                with open(out_file, 'w') as f:
                    f.write(fake_json)
            return MagicMock(returncode=0)
        mock_run.side_effect = fake_run

        result = run_codex_parse('<div>Jane Doe - Python Developer</div>')
        assert result['first_name'] == 'Jane'
        assert result['skills'][0]['skill'] == 'Python'

def test_run_codex_parse_extracts_json_from_text():
    # Sometimes codex wraps JSON in markdown code blocks
    fake_output = '```json\n{"public_name": "Bob"}\n```'
    with patch('codex_runner.subprocess.run') as mock_run:
        def fake_run(args, **kwargs):
            if '-o' in args:
                out_file = args[args.index('-o') + 1]
                with open(out_file, 'w') as f:
                    f.write(fake_output)
            return MagicMock(returncode=0)
        mock_run.side_effect = fake_run

        result = run_codex_parse('<div>Bob</div>')
        assert result['public_name'] == 'Bob'
```

**Step 3: Run tests — verify they fail**

```bash
python3 -m pytest test_codex_runner.py -v
```

Expected: `ModuleNotFoundError: No module named 'codex_runner'`

**Step 4: Implement `codex_runner.py`**

```python
import subprocess
import json
import re
import os
import datetime
import tempfile
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

CODEX_BIN = os.getenv('CODEX_BIN', 'codex')
CODEX_MODEL = os.getenv('CODEX_MODEL', 'gpt-5.3-codex')
PROMPT_FILE = Path(__file__).parent / 'parser_prompt.txt'


def build_full_prompt(cleaned_html: str) -> str:
    today = datetime.date.today().strftime('%Y-%m-%d')
    template = PROMPT_FILE.read_text()
    prompt = template.replace('{{TODAY}}', today).replace('{{CURRENT_DATE}}', today)
    prompt = f"{prompt}\n\nparse this candidate\nCURRENT_DATE = {today}\n{cleaned_html}\n\nkeep all skills in english"
    return prompt


def _extract_json(text: str) -> dict:
    """Extract JSON object from text, handling markdown code blocks."""
    text = text.strip()

    # Strip markdown code fences
    text = re.sub(r'^```(?:json)?\s*', '', text)
    text = re.sub(r'\s*```$', '', text)
    text = text.strip()

    # Find the JSON object boundaries
    start = text.find('{')
    end = text.rfind('}')
    if start == -1 or end == -1:
        raise ValueError(f"No JSON object found in codex output: {text[:200]}")

    return json.loads(text[start:end + 1])


def run_codex_parse(cleaned_html: str) -> dict:
    """Run codex exec with the parsing prompt, return parsed JSON dict."""
    prompt = build_full_prompt(cleaned_html)

    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as prompt_file:
        prompt_file.write(prompt)
        prompt_path = prompt_file.name

    with tempfile.NamedTemporaryFile(mode='r', suffix='.txt', delete=False) as out_file:
        out_path = out_file.name

    try:
        result = subprocess.run(
            [CODEX_BIN, 'exec',
             '-c', f'model="{CODEX_MODEL}"',
             '--ephemeral',
             '-o', out_path,
             f'@{prompt_path}'],
            capture_output=True,
            text=True,
            timeout=120
        )

        if result.returncode != 0:
            raise RuntimeError(f"codex exec failed (rc={result.returncode}): {result.stderr[:500]}")

        output = Path(out_path).read_text().strip()
        if not output:
            raise ValueError("codex exec returned empty output")

        return _extract_json(output)

    finally:
        os.unlink(prompt_path)
        try:
            os.unlink(out_path)
        except FileNotFoundError:
            pass
```

**Step 5: Run tests — verify they pass**

```bash
python3 -m pytest test_codex_runner.py -v
```

Expected: All 4 tests PASS.

**Step 6: Commit**

```bash
git add codex_runner.py parser_prompt.txt test_codex_runner.py
git commit -m "QF10: codex runner — subprocess codex exec with prompt template"
```

---

## Task 6: Xano Client

**Purpose:** Talk to Xano — get pending prospect, submit parsed result.

**Files:**
- Create: `prospect_parser/xano_client.py`
- Test: `prospect_parser/test_xano_client.py`

**Step 1: Write failing tests**

```python
# test_xano_client.py
import json
from unittest.mock import patch, MagicMock
from xano_client import XanoClient

def make_client():
    return XanoClient(
        base_url='https://xano.atlanticsoft.co',
        api_group='zE_czJ22',
        auth_token='test-token'
    )

def test_get_pending_prospect_calls_correct_url():
    client = make_client()
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        'id': 42,
        'linked_html': '<div>profile</div>',
        'linkedin_profile': 'https://linkedin.com/in/test'
    }

    with patch('xano_client.requests.get', return_value=mock_response) as mock_get:
        result = client.get_pending_prospect()
        assert result['id'] == 42
        call_url = mock_get.call_args[0][0]
        assert 'get_for_parsing' in call_url

def test_get_pending_prospect_by_id():
    client = make_client()
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {'id': 99, 'linked_html': '<div>x</div>'}

    with patch('xano_client.requests.get', return_value=mock_response) as mock_get:
        result = client.get_pending_prospect(prospect_id=99)
        assert result['id'] == 99
        call_url = mock_get.call_args[0][0]
        assert 'prospect_id=99' in call_url

def test_get_pending_prospect_returns_none_on_404():
    client = make_client()
    mock_response = MagicMock()
    mock_response.status_code = 404

    with patch('xano_client.requests.get', return_value=mock_response):
        result = client.get_pending_prospect()
        assert result is None

def test_save_parsed_result_posts_correct_payload():
    client = make_client()
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {'success': True}

    parsed = {'public_name': 'Jane', 'skills': []}

    with patch('xano_client.requests.post', return_value=mock_response) as mock_post:
        client.save_parsed_result(prospect_id=42, parsed_json=parsed)
        payload = mock_post.call_args[1]['json']
        assert payload['prospect_id'] == 42
        assert 'parsed_json' in payload
        assert json.loads(payload['parsed_json'])['public_name'] == 'Jane'
```

**Step 2: Run tests — verify they fail**

```bash
python3 -m pytest test_xano_client.py -v
```

Expected: `ModuleNotFoundError: No module named 'xano_client'`

**Step 3: Implement `xano_client.py`**

```python
import json
import requests
import os
from dotenv import load_dotenv

load_dotenv()


class XanoClient:
    def __init__(self, base_url=None, api_group=None, auth_token=None):
        self.base_url = base_url or os.getenv('XANO_BASE_URL', 'https://xano.atlanticsoft.co')
        self.api_group = api_group or os.getenv('XANO_API_GROUP', 'zE_czJ22')
        self.auth_token = auth_token or os.getenv('N8N_WEBHOOK_TOKEN', '')

    def _url(self, path: str) -> str:
        return f"{self.base_url}/api:{self.api_group}/{path}"

    def get_pending_prospect(self, prospect_id: int = None) -> dict | None:
        """Fetch one pending prospect. Returns None if none found."""
        params = {'auth_token': self.auth_token}
        if prospect_id:
            params['prospect_id'] = prospect_id

        resp = requests.get(self._url('prospects/get_for_parsing'), params=params, timeout=30)
        if resp.status_code == 404:
            return None
        resp.raise_for_status()
        data = resp.json()
        return data if data else None

    def save_parsed_result(self, prospect_id: int, parsed_json: dict) -> dict:
        """Submit parsed JSON to Xano for storage."""
        payload = {
            'prospect_id': prospect_id,
            'parsed_json': json.dumps(parsed_json),
            'auth_token': self.auth_token
        }
        resp = requests.post(self._url('prospects/save_parsed'), json=payload, timeout=60)
        resp.raise_for_status()
        return resp.json()

    def mark_failed(self, prospect_id: int) -> None:
        """Mark a prospect as 'conflict' if parsing fails."""
        payload = {
            'prospect_id': prospect_id,
            'status': 'conflict',
            'auth_token': self.auth_token
        }
        requests.post(self._url('prospects/mark_parse_status'), json=payload, timeout=10)
```

**Step 4: Run tests — verify they pass**

```bash
python3 -m pytest test_xano_client.py -v
```

Expected: All 4 tests PASS.

**Step 5: Commit**

```bash
git add xano_client.py test_xano_client.py
git commit -m "QF10: Xano client — get_pending_prospect + save_parsed_result"
```

---

## Task 7: Parser Core

**Purpose:** Orchestrate the full parse cycle: get prospect → clean HTML → run Codex → save result.

**Files:**
- Create: `prospect_parser/parse_core.py`
- Test: `prospect_parser/test_parse_core.py`

**Step 1: Write failing tests**

```python
# test_parse_core.py
from unittest.mock import patch, MagicMock
from parse_core import parse_prospect, ParseResult

FAKE_PROSPECT = {
    'id': 42,
    'linked_html': '<div>Jane Doe - Python Developer<script>bad()</script></div>',
    'linkedin_profile': 'https://linkedin.com/in/jane'
}

FAKE_PARSED = {
    'public_name': 'Jane',
    'first_name': 'Jane',
    'last_name': 'Doe',
    'skills': [{'skill': 'Python', 'months_experience': 24, 'last_used': '2026-03'}]
}

def test_parse_prospect_success():
    with patch('parse_core.XanoClient') as MockClient, \
         patch('parse_core.run_codex_parse', return_value=FAKE_PARSED):
        mock_xano = MockClient.return_value
        mock_xano.get_pending_prospect.return_value = FAKE_PROSPECT
        mock_xano.save_parsed_result.return_value = {'success': True}

        result = parse_prospect()
        assert result == ParseResult.PARSED
        mock_xano.save_parsed_result.assert_called_once_with(42, FAKE_PARSED)

def test_parse_prospect_no_pending():
    with patch('parse_core.XanoClient') as MockClient:
        mock_xano = MockClient.return_value
        mock_xano.get_pending_prospect.return_value = None

        result = parse_prospect()
        assert result == ParseResult.NONE_FOUND

def test_parse_prospect_marks_conflict_on_error():
    with patch('parse_core.XanoClient') as MockClient, \
         patch('parse_core.run_codex_parse', side_effect=RuntimeError('codex failed')):
        mock_xano = MockClient.return_value
        mock_xano.get_pending_prospect.return_value = FAKE_PROSPECT

        result = parse_prospect()
        assert result == ParseResult.FAILED
        mock_xano.mark_failed.assert_called_once_with(42)

def test_parse_prospect_by_id():
    with patch('parse_core.XanoClient') as MockClient, \
         patch('parse_core.run_codex_parse', return_value=FAKE_PARSED):
        mock_xano = MockClient.return_value
        mock_xano.get_pending_prospect.return_value = FAKE_PROSPECT

        result = parse_prospect(prospect_id=42)
        mock_xano.get_pending_prospect.assert_called_once_with(prospect_id=42)
        assert result == ParseResult.PARSED
```

**Step 2: Run tests — verify they fail**

```bash
python3 -m pytest test_parse_core.py -v
```

Expected: `ModuleNotFoundError: No module named 'parse_core'`

**Step 3: Implement `parse_core.py`**

```python
import logging
from enum import Enum
from html_cleaner import clean_html
from codex_runner import run_codex_parse
from xano_client import XanoClient

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
log = logging.getLogger(__name__)


class ParseResult(Enum):
    PARSED = 'parsed'
    NONE_FOUND = 'none_found'
    FAILED = 'failed'


def parse_prospect(prospect_id: int = None) -> ParseResult:
    xano = XanoClient()

    prospect = xano.get_pending_prospect(prospect_id=prospect_id)
    if not prospect:
        log.info('No pending prospects found')
        return ParseResult.NONE_FOUND

    pid = prospect['id']
    log.info(f'Parsing prospect {pid} ({prospect.get("linkedin_profile", "")})')

    try:
        html = prospect.get('linked_html') or ''
        cleaned = clean_html(html)
        if not cleaned:
            raise ValueError(f'No HTML content for prospect {pid}')

        parsed = run_codex_parse(cleaned)

        # Preserve linkedin_profile from DB record (don't overwrite)
        if prospect.get('linkedin_profile'):
            parsed.setdefault('linkedin_profile', prospect['linkedin_profile'])

        xano.save_parsed_result(prospect_id=pid, parsed_json=parsed)
        log.info(f'Prospect {pid} parsed successfully')
        return ParseResult.PARSED

    except Exception as e:
        log.error(f'Failed to parse prospect {pid}: {e}')
        xano.mark_failed(pid)
        return ParseResult.FAILED
```

**Step 4: Run tests — verify they pass**

```bash
python3 -m pytest test_parse_core.py -v
```

Expected: All 4 tests PASS.

**Step 5: Commit**

```bash
git add parse_core.py test_parse_core.py
git commit -m "QF10: parse core — orchestrate fetch → clean → codex → save"
```

---

## Task 8: HTTP Server (Flask)

**Purpose:** `GET /parse?prospect_id=X` endpoint the extension opens as a tab.

**Files:**
- Create: `prospect_parser/server.py`
- Test: `prospect_parser/test_server.py`

**Step 1: Write failing tests**

```python
# test_server.py
import pytest
from unittest.mock import patch
from parse_core import ParseResult
import server as srv

@pytest.fixture
def client():
    srv.app.config['TESTING'] = True
    with srv.app.test_client() as c:
        yield c

def test_health_check(client):
    resp = client.get('/health')
    assert resp.status_code == 200
    assert resp.get_json()['status'] == 'ok'

def test_parse_with_prospect_id(client):
    with patch('server.parse_prospect', return_value=ParseResult.PARSED) as mock_parse:
        resp = client.get('/parse?prospect_id=42')
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['result'] == 'parsed'
        mock_parse.assert_called_once_with(prospect_id=42)

def test_parse_oldest_pending(client):
    with patch('server.parse_prospect', return_value=ParseResult.PARSED) as mock_parse:
        resp = client.get('/parse')
        assert resp.status_code == 200
        mock_parse.assert_called_once_with(prospect_id=None)

def test_parse_none_found(client):
    with patch('server.parse_prospect', return_value=ParseResult.NONE_FOUND):
        resp = client.get('/parse')
        assert resp.status_code == 200
        assert resp.get_json()['result'] == 'none_found'

def test_parse_failed(client):
    with patch('server.parse_prospect', return_value=ParseResult.FAILED):
        resp = client.get('/parse?prospect_id=99')
        assert resp.status_code == 200
        assert resp.get_json()['result'] == 'failed'
```

**Step 2: Run tests — verify they fail**

```bash
python3 -m pytest test_server.py -v
```

**Step 3: Implement `server.py`**

```python
import os
from flask import Flask, request, jsonify
from parse_core import parse_prospect, ParseResult
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)


@app.route('/health')
def health():
    return jsonify({'status': 'ok'})


@app.route('/parse')
def parse():
    prospect_id_str = request.args.get('prospect_id')
    prospect_id = int(prospect_id_str) if prospect_id_str else None

    result = parse_prospect(prospect_id=prospect_id)
    return jsonify({'result': result.value, 'prospect_id': prospect_id})


if __name__ == '__main__':
    port = int(os.getenv('PORT', 8585))
    app.run(host='0.0.0.0', port=port)
```

**Step 4: Run tests — verify they pass**

```bash
python3 -m pytest test_server.py -v
```

Expected: All 5 tests PASS.

**Step 5: Smoke test server manually**

```bash
python3 server.py &
sleep 2
curl http://localhost:8585/health
# Expected: {"status":"ok"}
kill %1
```

**Step 6: Commit**

```bash
git add server.py test_server.py
git commit -m "QF10: Flask HTTP server — GET /parse endpoint for extension tab trigger"
```

---

## Task 9: Cron Mode

**Purpose:** `python3 parser.py --cron` processes one pending prospect and exits. Called by system cron every minute.

**Files:**
- Create: `prospect_parser/parser.py` (main entrypoint)
- Test: `prospect_parser/test_parser_cli.py`

**Step 1: Write failing tests**

```python
# test_parser_cli.py
import sys
from unittest.mock import patch
from parse_core import ParseResult
import parser as cli_parser

def test_cron_mode_parses_one_prospect():
    with patch('parser.parse_prospect', return_value=ParseResult.PARSED) as mock_parse:
        with patch.object(sys, 'argv', ['parser.py', '--cron']):
            exit_code = cli_parser.main()
            assert exit_code == 0
            mock_parse.assert_called_once_with(prospect_id=None)

def test_cron_mode_exits_0_when_none_found():
    with patch('parser.parse_prospect', return_value=ParseResult.NONE_FOUND):
        with patch.object(sys, 'argv', ['parser.py', '--cron']):
            exit_code = cli_parser.main()
            assert exit_code == 0

def test_cron_mode_exits_1_on_failure():
    with patch('parser.parse_prospect', return_value=ParseResult.FAILED):
        with patch.object(sys, 'argv', ['parser.py', '--cron']):
            exit_code = cli_parser.main()
            assert exit_code == 1
```

**Step 2: Run tests — verify they fail**

```bash
python3 -m pytest test_parser_cli.py -v
```

**Step 3: Implement `parser.py`**

```python
#!/usr/bin/env python3
"""
Main entrypoint.
  --cron     : process one pending prospect and exit (called by system cron)
  (no args)  : start HTTP server
"""
import sys
import logging
from parse_core import parse_prospect, ParseResult

log = logging.getLogger(__name__)


def main() -> int:
    args = sys.argv[1:]

    if '--cron' in args:
        result = parse_prospect()
        if result == ParseResult.FAILED:
            return 1
        return 0

    # Default: start HTTP server
    from server import app
    import os
    from dotenv import load_dotenv
    load_dotenv()
    port = int(os.getenv('PORT', 8585))
    app.run(host='0.0.0.0', port=port)
    return 0


if __name__ == '__main__':
    sys.exit(main())
```

**Step 4: Run tests — verify they pass**

```bash
python3 -m pytest test_parser_cli.py -v
```

Expected: All 3 tests PASS.

**Step 5: Run full test suite**

```bash
python3 -m pytest -v
```

Expected: All tests across all modules PASS.

**Step 6: Commit**

```bash
git add parser.py test_parser_cli.py
git commit -m "QF10: CLI entrypoint — --cron mode + server mode"
```

---

## Task 10: systemd Service (HTTP Server)

**Purpose:** Keep the Flask HTTP server running 24/7 on `pablo-home-linux`.

**Files:**
- Create: `prospect_parser/bwats-parser.service`

**Step 1: Create systemd unit file**

```ini
[Unit]
Description=BWATS Prospect Parser Server
After=network.target

[Service]
Type=simple
User=pablo
WorkingDirectory=/home/pablo/projects/bwats/prospect_parser
ExecStart=/usr/bin/python3 /home/pablo/projects/bwats/prospect_parser/parser.py
Restart=always
RestartSec=10
EnvironmentFile=/home/pablo/projects/bwats/prospect_parser/.env

[Install]
WantedBy=default.target
```

**Step 2: Install and start the service**

```bash
cp bwats-parser.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable bwats-parser
systemctl --user start bwats-parser
systemctl --user status bwats-parser
```

Expected: `Active: active (running)`

**Step 3: Verify it's reachable**

```bash
curl http://localhost:8585/health
```

Expected: `{"status":"ok"}`

**Step 4: Commit**

```bash
git add bwats-parser.service
git commit -m "QF10: systemd service for HTTP parser server"
```

---

## Task 11: Cron Entry

**Purpose:** Run `parser.py --cron` every minute via system cron.

**Step 1: Add cron entry**

```bash
crontab -e
```

Add this line:
```
* * * * * /usr/bin/python3 /home/pablo/projects/bwats/prospect_parser/parser.py --cron >> /home/pablo/projects/bwats/prospect_parser/cron.log 2>&1
```

**Step 2: Verify cron is running**

Wait 2 minutes, then:
```bash
tail -20 /home/pablo/projects/bwats/prospect_parser/cron.log
```

Expected: Log lines showing `No pending prospects found` or `Parsing prospect X`.

**Step 3: Add cron.log to .gitignore**

```bash
echo "cron.log" >> .gitignore
git add .gitignore
git commit -m "QF10: add cron job + log to gitignore"
```

---

## Task 12: End-to-End Test

**Purpose:** Verify the full flow works on live — extension adds prospect → server parses it.

**Step 1: Create a test prospect via Xano API (set parse_status to pending)**

```bash
# Directly set a known prospect back to pending for testing
curl -s -X PATCH "https://xano.atlanticsoft.co/api:zE_czJ22/parsed_prospect/TEST_ID" \
  -H "Authorization: Bearer LIVE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"parse_status": "pending"}'
```

**Step 2: Trigger HTTP mode**

```bash
curl "http://localhost:8585/parse?prospect_id=TEST_ID"
```

Expected:
```json
{"result": "parsed", "prospect_id": TEST_ID}
```

**Step 3: Verify result in Xano**

```bash
curl "https://xano.atlanticsoft.co/api:zE_czJ22/prospects/get_for_parsing?prospect_id=TEST_ID&auth_token=TOKEN"
```

Expected: `parse_status` = "parsed", `first_name` populated, `skills` array populated.

**Step 4: Test cron mode**

```bash
# Reset a prospect to pending
# Then run cron manually
python3 parser.py --cron
```

Expected: Logs show prospect parsed, `parse_status` = "parsed" in Xano.

**Step 5: Check parse quality**

Compare parsed output vs. previous OpenAI output for same prospect. Verify:
- Name extracted
- Skills populated (non-empty array)
- Work history present
- `parse_status` = "parsed"
- ES document updated

**Step 6: Final commit**

```bash
git add -A
git commit -m "QF10: end-to-end verified — local codex parser live"
```

---

## Backlog Update

Update `features/BACKLOG.md`:
- Change QF10 status from `pending` → `in-progress` when starting
- Change to `dev-complete` when Tasks 1–12 are done

Update `features/progress/QF10-local-codex-parser.md` with findings as you go.
