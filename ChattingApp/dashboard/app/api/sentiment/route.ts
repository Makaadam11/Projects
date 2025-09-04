import { NextRequest } from 'next/server';
import { spawn, ChildProcess } from 'child_process';
import path from 'node:path';
import fs from 'node:fs';

export const runtime = 'nodejs';

let proc: ChildProcess | null = null;
let readyPromise: Promise<void> | null = null;

const PORT = process.env.MINI_API_PORT || '5003';
const DEFAULT_BASE = `http://127.0.0.1:${PORT}`;

function findPythonCmd(projectRoot: string): { cmd: string; args: string[] } {
  // 1) env overrides
  const envPyW = process.env.PYTHONW;
  if (envPyW && fs.existsSync(envPyW)) return { cmd: envPyW, args: [] };
  const envPy = process.env.PYTHON;
  if (envPy && fs.existsSync(envPy)) return { cmd: envPy, args: [] };

  // 2) venv candidates (prefer pythonw.exe on Windows)
  const candidates = [
    path.join(projectRoot, 'venv2', 'Scripts', 'pythonw.exe'),
    path.join(projectRoot, '.venv', 'Scripts', 'pythonw.exe'),
    path.join(projectRoot, 'venv', 'Scripts', 'pythonw.exe'),
    path.join(projectRoot, 'env', 'Scripts', 'pythonw.exe'),
    path.join(projectRoot, 'venv2', 'Scripts', 'python.exe'),
    path.join(projectRoot, '.venv', 'Scripts', 'python.exe'),
    path.join(projectRoot, 'venv', 'Scripts', 'python.exe'),
    path.join(projectRoot, 'env', 'Scripts', 'python.exe'),
    // posix
    path.join(projectRoot, 'venv2', 'bin', 'python'),
    path.join(projectRoot, '.venv', 'bin', 'python'),
    path.join(projectRoot, 'venv', 'bin', 'python'),
    path.join(projectRoot, 'env', 'bin', 'python'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return { cmd: p, args: [] };
  }

  // 3) fallbacks (bez shell)
  if (process.platform === 'win32') return { cmd: 'pythonw.exe', args: [] };
  return { cmd: 'python3', args: [] };
}

async function ping(url: string, attempts = 40, delayMs = 250) {
  for (let i = 0; i < attempts; i++) {
    try {
      const r = await fetch(url, { cache: 'no-store' });
      if (r.ok) return true;
    } catch {}
    await new Promise(r => setTimeout(r, delayMs));
  }
  return false;
}

function startMiniApi(baseUrl: string) {
  if (proc && !proc.killed) return;

  const projectRoot = path.resolve(process.cwd(), '..'); // C:\Projects\ChattingApp
  const { cmd, args } = findPythonCmd(projectRoot);

  // uruchom jako moduł, bez shell, ukryte okno
  proc = spawn(cmd, [...args, '-m', 'app.mini_sentiment_api.api'], {
    cwd: projectRoot,
    detached: true,
    stdio: 'ignore',
    env: {
      ...process.env,
      PYTHONPATH: projectRoot,
      MINI_API_PORT: new URL(baseUrl).port || PORT,
    },
  });
  if (proc && proc.pid) proc.unref();
}

function ensureMiniApi(baseUrl: string) {
  if (readyPromise) return readyPromise;

  readyPromise = (async () => {
    // jeśli już działa – tylko health
    const healthy = await ping(`${baseUrl}/health`, 8, 250);
    if (healthy) return;

    // start i czekaj aż wstanie
    startMiniApi(baseUrl);
    await ping(`${baseUrl}/health`, 40, 250);
  })();

  return readyPromise;
}

async function postScores(baseUrl: string, words: string[]) {
  const res = await fetch(`${baseUrl}/api/sentiment/score_words`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ words }),
  });
  if (!res.ok) throw new Error(`mini-api status ${res.status}`);
  return res.json();
}

export async function POST(req: NextRequest) {
  const { words = [], base } = await req.json();
  const baseUrl = base || process.env.NEXT_PUBLIC_FLASK_BASE || DEFAULT_BASE;

  // Najpierw upewnij się, że API działa (start + health), potem dopiero POST
  await ensureMiniApi(baseUrl);

  let data: any = { scores: {} };
  if (Array.isArray(words) && words.length) {
    try {
      data = await postScores(baseUrl, words);
    } catch {
      // jedna próba restartu
      readyPromise = null;
      await ensureMiniApi(baseUrl);
      data = await postScores(baseUrl, words).catch(() => ({ scores: {} }));
    }
  }
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
}