'use strict';

// FastCopy clipboard helper.
// - Watches the Windows clipboard (text + images) through one long-running PowerShell process.
// - Keeps the most recent items in MEMORY ONLY (nothing is written to disk).
// - Serves the FastCopy pages and a small JSON API on 127.0.0.1 so the page can list the items.

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const readline = require('node:readline');
const { spawn } = require('node:child_process');

const HOST = '127.0.0.1';
const PORT = Number(process.env.FASTCOPY_PORT || 3210);
const MAX_ITEMS = 50;
const MAX_TEXT_CHARS = 100000;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_TOTAL_IMAGE_BYTES = 150 * 1024 * 1024;
const ROOT_DIR = path.resolve(__dirname, '..');

// Only these files can be downloaded from the root folder.
const STATIC_FILES = {
  '/FastCopy.html': 'text/html; charset=utf-8',
  '/Clipboard.html': 'text/html; charset=utf-8',
  '/IDGenerator.html': 'text/html; charset=utf-8',
  '/BRNGenerator.html': 'text/html; charset=utf-8',
  '/nav.js': 'text/javascript; charset=utf-8'
};

let items = []; // newest first: { id, type, text?, buffer?, hash, createdAt }
let paused = false;
let watcher = null;
let firstSnapshot = true;
let stopping = false;

// ---------- Clipboard watcher (PowerShell) ----------

// The script prints one line each time the clipboard changes:
//   TEXT:<base64 utf8>  |  IMAGE:<base64 png>  |  NONE
// It uses the Windows clipboard sequence number, so it is cheap while idle.
const PS_SCRIPT = `
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
Add-Type -TypeDefinition 'using System.Runtime.InteropServices; public static class FcClip { [DllImport("user32.dll")] public static extern uint GetClipboardSequenceNumber(); }'
$last = [uint32]0
while ($true) {
  $n = [FcClip]::GetClipboardSequenceNumber()
  if ($n -ne $last) {
    $last = $n
    $out = 'NONE'
    for ($k = 0; $k -lt 5; $k++) {
      try {
        if ([Windows.Forms.Clipboard]::ContainsText()) {
          $t = [Windows.Forms.Clipboard]::GetText()
          $out = 'TEXT:' + [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($t))
        } elseif ([Windows.Forms.Clipboard]::ContainsImage()) {
          $img = [Windows.Forms.Clipboard]::GetImage()
          $ms = New-Object IO.MemoryStream
          $img.Save($ms, [Drawing.Imaging.ImageFormat]::Png)
          $out = 'IMAGE:' + [Convert]::ToBase64String($ms.ToArray())
          $img.Dispose()
          $ms.Dispose()
        }
        break
      } catch {
        Start-Sleep -Milliseconds 100
      }
    }
    [Console]::Out.WriteLine($out)
    [Console]::Out.Flush()
  }
  Start-Sleep -Milliseconds 300
}
`;

function startWatcher() {
  const encoded = Buffer.from(PS_SCRIPT, 'utf16le').toString('base64');
  watcher = spawn('powershell.exe',
    ['-NoProfile', '-NonInteractive', '-Sta', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', encoded],
    { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  firstSnapshot = true;

  readline.createInterface({ input: watcher.stdout, crlfDelay: Infinity }).on('line', handleLine);
  watcher.stderr.on('data', (d) => console.error('[clipboard]', String(d).trim()));
  watcher.on('exit', (code) => {
    watcher = null;
    if (stopping) return;
    console.error(`Clipboard watcher stopped (code ${code}). Restarting in 2s...`);
    setTimeout(startWatcher, 2000);
  });
}

function handleLine(line) {
  // The first line is whatever was on the clipboard before we started: use it as a baseline only.
  if (firstSnapshot) { firstSnapshot = false; return; }
  if (paused) return;
  try {
    if (line.startsWith('TEXT:')) {
      const text = Buffer.from(line.slice(5), 'base64').toString('utf8')
        .replace(/\r\n/g, '\n').replace(/\0/g, '').slice(0, MAX_TEXT_CHARS);
      if (!text.trim()) return;
      addItem({ type: 'text', text, hash: sha(text) });
    } else if (line.startsWith('IMAGE:')) {
      const buffer = Buffer.from(line.slice(6), 'base64');
      if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) return;
      addItem({ type: 'image', buffer, hash: sha(buffer) });
    }
  } catch (error) {
    console.error('Could not process clipboard data:', error.message);
  }
}

function sha(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function addItem(item) {
  // Same content copied again: move it to the top instead of duplicating it.
  items = items.filter((x) => !(x.type === item.type && x.hash === item.hash));
  items.unshift({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...item });
  items = items.slice(0, MAX_ITEMS);
  let total = 0;
  items.forEach((x) => { if (x.buffer) total += x.buffer.length; });
  for (let i = items.length - 1; i > 0 && total > MAX_TOTAL_IMAGE_BYTES; i--) {
    if (items[i].buffer) { total -= items[i].buffer.length; items.splice(i, 1); }
  }
}

// ---------- HTTP server ----------

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(body);
}

function publicItem(x) {
  return x.type === 'image'
    ? { id: x.id, type: 'image', size: x.buffer.length, createdAt: x.createdAt }
    : { id: x.id, type: 'text', text: x.text, createdAt: x.createdAt };
}

function hostAllowed(req) {
  return [`127.0.0.1:${PORT}`, `localhost:${PORT}`].includes(req.headers.host || '');
}

// Blocks other websites from sending changing requests (pause, delete) to this helper.
function originAllowed(req) {
  const origin = req.headers.origin;
  return !origin || origin === `http://127.0.0.1:${PORT}` || origin === `http://localhost:${PORT}`;
}

const server = http.createServer((req, res) => {
  try {
    if (!hostAllowed(req)) return sendJson(res, 403, { error: 'Invalid host' });
    const url = new URL(req.url, `http://${HOST}:${PORT}`);
    const route = url.pathname;

    if (req.method !== 'GET' && !originAllowed(req)) return sendJson(res, 403, { error: 'Invalid origin' });

    if (req.method === 'GET' && route === '/') {
      res.writeHead(302, { Location: '/FastCopy.html' });
      return res.end();
    }
    if (req.method === 'GET' && STATIC_FILES[route]) {
      return fs.readFile(path.join(ROOT_DIR, route.slice(1)), (error, data) => {
        if (error) return sendJson(res, 404, { error: 'Not found' });
        res.writeHead(200, { 'Content-Type': STATIC_FILES[route], 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
        res.end(data);
      });
    }

    if (req.method === 'GET' && route === '/api/items') {
      return sendJson(res, 200, { paused, items: items.map(publicItem) });
    }
    if (req.method === 'GET' && route.startsWith('/api/images/')) {
      const id = route.slice('/api/images/'.length).replace(/\.png$/i, '');
      const item = items.find((x) => x.id === id && x.type === 'image');
      if (!item) return sendJson(res, 404, { error: 'Image not found' });
      res.writeHead(200, { 'Content-Type': 'image/png', 'Content-Length': item.buffer.length, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      return res.end(item.buffer);
    }
    if (req.method === 'POST' && route === '/api/pause') { paused = true; return sendJson(res, 200, { paused }); }
    if (req.method === 'POST' && route === '/api/resume') { paused = false; return sendJson(res, 200, { paused }); }
    if (req.method === 'DELETE' && route === '/api/items') { items = []; return sendJson(res, 200, { ok: true }); }
    if (req.method === 'DELETE' && route.startsWith('/api/items/')) {
      const id = decodeURIComponent(route.slice('/api/items/'.length));
      items = items.filter((x) => x.id !== id);
      return sendJson(res, 200, { ok: true });
    }

    sendJson(res, 404, { error: 'Not found' });
  } catch (error) {
    sendJson(res, 500, { error: error.message || 'Unexpected error' });
  }
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Is the helper already running?`);
  } else {
    console.error('Server error:', error.message);
  }
  process.exit(1);
});

function shutdown() {
  stopping = true;
  if (watcher) watcher.kill();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('exit', () => { if (watcher) watcher.kill(); });

server.listen(PORT, HOST, () => {
  console.log(`FastCopy helper is running at http://${HOST}:${PORT}/FastCopy.html`);
  console.log('Clipboard history is kept in memory only. Keep this window open. Press Ctrl+C to stop.');
  startWatcher();
});
