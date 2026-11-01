// MC 站截图：node shot.js <round> [sweep|boot]  （round 仅允许字母数字）
const puppeteer = require('puppeteer-core');
const launch = require('./browser');
const fs = require('fs');
const path = require('path');
const URL = 'http://127.0.0.1:8330/';
const OUT = path.join(__dirname, 'shots');
const roundArg = process.argv[2] || '';
if (!/^[a-z0-9]+$/i.test(roundArg)) { console.error('round 必须为字母数字'); process.exit(1); }
const round = roundArg;
const mode = process.argv[3] || 'sweep';
(async () => {
  const b = await launch(puppeteer);
  const logs = [];
  async function newPage(opts) {
    const p = await b.newPage();
    p.on('pageerror', e => logs.push(`[PAGEERROR] ${e.message}`));
    p.on('console', m => { if (m.type() === 'error') logs.push(`[console.error] ${m.text()}`); });
    await p.setViewport(opts);
    await p.goto(URL, { waitUntil: 'networkidle0', timeout: 30000 });
    await p.evaluate(() => sessionStorage.setItem('mc_booted', '1'));
    await p.reload({ waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, opts.waitMs || 900));
    return p;
  }
  if (mode === 'sweep' || mode === 'top') {
    const p = await newPage({ width: 1600, height: 900 });
    await p.screenshot({ path: path.join(OUT, `mc${round}-desktop-top.png`) });
    await p.evaluate(async () => {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise(r => setTimeout(r, 900));
      window.scrollTo(0, 0);
      await new Promise(r => setTimeout(r, 500));
    });
    await p.screenshot({ path: path.join(OUT, `mc${round}-desktop-full.png`), fullPage: true });
    await p.close();
  }
  if (mode === 'sweep' || mode === 'mobile') {
    const p = await newPage({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await p.screenshot({ path: path.join(OUT, `mc${round}-mobile-full.png`), fullPage: true });
    await p.close();
  }
  if (mode === 'boot') {
    const p = await b.newPage();
    await p.setViewport({ width: 1600, height: 900 });
    await p.goto(URL, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));
    await p.screenshot({ path: path.join(OUT, `mc${round}-boot.png`) });
    await p.close();
  }
  await b.close();
  fs.writeFileSync(path.join(OUT, `mc${round}-console.json`), JSON.stringify(logs, null, 2));
  console.log('DONE mc' + round, mode, '| errors:', logs.length ? logs.join(' | ') : '(clean)');
})().catch(e => { console.error('FATAL', e.message.slice(0, 150)); process.exit(1); });
