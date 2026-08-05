#!/usr/bin/env node
'use strict';

// Ops Desk (Windows) — a tiny local server that serves the exact same
// ops-desk.html the browser/hosted version uses, on a fixed port, then
// opens the default browser to it.
//
// Fixed port matters: the browser's localStorage is scoped per-origin
// (scheme + host + port). Keeping the port constant across runs means
// data entered today is still there next time this .exe is launched.

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 47821;
const HOST = '127.0.0.1';
const HTML_PATH = path.join(__dirname, 'ops-desk.html');
const URL = `http://${HOST}:${PORT}`;

function openBrowser(url) {
  const cmd =
    process.platform === 'win32' ? `start "" "${url}"` :
    process.platform === 'darwin' ? `open "${url}"` :
    `xdg-open "${url}"`;
  exec(cmd, (err) => {
    if (err) {
      console.log('Could not open a browser automatically. Open this address by hand:');
      console.log(url);
    }
  });
}

const server = http.createServer((req, res) => {
  fs.readFile(HTML_PATH, (err, html) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Ops Desk could not load its page: ' + err.message);
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log('Ops Desk is already running — opening it in your browser.');
    openBrowser(URL);
    setTimeout(() => process.exit(0), 500);
  } else {
    console.error('Ops Desk could not start:', err.message);
    console.log('Press Enter to close this window.');
    process.stdin.resume();
    process.stdin.on('data', () => process.exit(1));
  }
});

server.listen(PORT, HOST, () => {
  console.log('Ops Desk is running at ' + URL);
  console.log('Leave this window open while you use it. Closing it stops Ops Desk.');
  console.log('Your data stays on this PC (browser local storage) — nothing is sent anywhere.');
  openBrowser(URL);
});
