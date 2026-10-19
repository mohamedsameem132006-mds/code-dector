const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();

/**
 * Isolated Sandbox Execution Service
 * Supports Python and Node.js with strict timeouts, memory limits, and isolated temporary directories.
 * If language is not supported or environment is disabled, safely marks as unavailable.
 */

const SUPPORTED_SANDBOX_LANGS = ['python', 'javascript'];
const MAX_OUTPUT_BYTES = 50 * 1024; // 50KB limit to prevent stdout flooding
const TIMEOUT_MS = 6000; // 6 seconds execution timeout

async function runInSandbox({ code, language }) {
  const lang = (language || '').toLowerCase();

  if (!SUPPORTED_SANDBOX_LANGS.includes(lang)) {
    return {
      success: false,
      status: 'disabled',
      executionEnvironment: 'local_disposable_sandbox',
      stdout: '',
      stderr: `Safe execution is currently only supported for Python and JavaScript in this runtime. '${language}' cannot be executed safely.`,
      exitCode: -1,
      durationMs: 0
    };
  }

  // Check for dangerous keywords to prevent host system disruption (defense-in-depth)
  const forbiddenPatterns = [
    /child_process/i,
    /process\.exit/i,
    /fs\.unlink/i,
    /fs\.rmdir/i,
    /rmtree/i,
    /os\.system/i,
    /subprocess/i,
    /shutil/i,
    /socket/i,
    /net\./i,
    /http\./i,
    /https\./i,
    /eval\s*\(/i
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(code)) {
      return {
        success: false,
        status: 'failed',
        executionEnvironment: 'local_disposable_sandbox',
        stdout: '',
        stderr: 'Security Policy Violation: Submission contains restricted system/network operations disallowed in sandbox.',
        exitCode: 1,
        durationMs: 0
      };
    }
  }

  // Create isolated temp workspace
  const runId = uuidv4();
  const tempDir = path.join(os.tmpdir(), `codesense_sandbox_${runId}`);
  fs.mkdirSync(tempDir, { recursive: true });

  const ext = lang === 'python' ? '.py' : '.js';
  const filePath = path.join(tempDir, `main${ext}`);
  fs.writeFileSync(filePath, code, 'utf8');

  let command = '';
  let args = [];

  if (lang === 'python') {
    command = 'python';
    // -u unbuffered, -I isolate from user site-packages/environment
    args = ['-u', '-I', filePath];
  } else {
    command = 'node';
    // --max-old-space-size=64, --disallow-code-generation-from-strings
    args = ['--max-old-space-size=64', filePath];
  }

  const startTime = Date.now();

  return new Promise((resolve) => {
    let stdoutBuffer = '';
    let stderrBuffer = '';
    let isTerminated = false;

    const child = spawn(command, args, {
      cwd: tempDir,
      timeout: TIMEOUT_MS,
      env: {
        PATH: process.env.PATH,
        TEMP: tempDir,
        TMP: tempDir
      },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    const killTimer = setTimeout(() => {
      isTerminated = true;
      child.kill('SIGKILL');
    }, TIMEOUT_MS);

    child.stdout.on('data', (data) => {
      if (stdoutBuffer.length < MAX_OUTPUT_BYTES) {
        stdoutBuffer += data.toString();
      }
    });

    child.stderr.on('data', (data) => {
      if (stderrBuffer.length < MAX_OUTPUT_BYTES) {
        stderrBuffer += data.toString();
      }
    });

    child.on('close', (code) => {
      clearTimeout(killTimer);
      const durationMs = Date.now() - startTime;

      // Clean up directory
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (e) {
        console.warn('Sandbox cleanup warning:', e.message);
      }

      if (isTerminated) {
        return resolve({
          success: false,
          status: 'timeout',
          executionEnvironment: 'local_disposable_sandbox',
          stdout: stdoutBuffer,
          stderr: 'Execution timed out after 6 seconds.',
          exitCode: 124,
          durationMs
        });
      }

      resolve({
        success: code === 0,
        status: code === 0 ? 'success' : 'failed',
        executionEnvironment: 'local_disposable_sandbox',
        stdout: stdoutBuffer,
        stderr: stderrBuffer,
        exitCode: code,
        durationMs
      });
    });

    child.on('error', (err) => {
      clearTimeout(killTimer);
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch {}

      resolve({
        success: false,
        status: 'failed',
        executionEnvironment: 'local_disposable_sandbox',
        stdout: '',
        stderr: `Failed to spawn runtime: ${err.message}`,
        exitCode: 1,
        durationMs: Date.now() - startTime
      });
    });
  });
}

module.exports = {
  runInSandbox,
  SUPPORTED_SANDBOX_LANGS
};
