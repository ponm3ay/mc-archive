// QA 共享浏览器启动器（MC 站）：chrome-headless-shell → chrome → Edge(隔离 profile, 永不 kill)
module.exports = async function launch(puppeteer) {
  const pp = puppeteer;
  const fs = require('fs');
  const os = require('os');
  const path = require('path');
  const CACHE = path.join(os.homedir(), '.cache', 'puppeteer');
  const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
  const PROFILE = path.join(__dirname, '.chrome-data');
  function findCachedBin(root, exeName) {
    if (!fs.existsSync(root)) return null;
    const stack = [root];
    while (stack.length) {
      const dir = stack.pop();
      let entries;
      try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { continue; }
      for (const ent of entries) {
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) stack.push(full);
        else if (ent.name === exeName) return full;
      }
    }
    return null;
  }
  const candidates = [
    findCachedBin(path.join(CACHE, 'chrome-headless-shell'), 'chrome-headless-shell.exe'),
    findCachedBin(path.join(CACHE, 'chrome'), 'chrome.exe')
  ].filter(Boolean);
  const opts = {
    headless: true,
    args: ['--disable-gpu', '--no-first-run', '--hide-scrollbars', '--force-color-profile=srgb', '--disable-features=Translate']
  };
  if (candidates.length) opts.executablePath = candidates[0];
  else if (fs.existsSync(EDGE)) { opts.executablePath = EDGE; opts.userDataDir = PROFILE; }
  return pp.launch(opts);
};
