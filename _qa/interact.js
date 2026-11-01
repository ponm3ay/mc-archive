// MC 站交互回归：node interact.js <round> <token>
const puppeteer = require('puppeteer-core');
const launch = require('./browser');
const URL = 'http://127.0.0.1:8330/';
const TOKEN = process.argv[3] || '';
const roundArg = process.argv[2] || '';
if (!/^[a-z0-9]+$/i.test(roundArg)) { console.error('round 必须为字母数字'); process.exit(1); }
(async () => {
  const b = await launch(puppeteer);
  const p = await b.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.setViewport({ width: 1600, height: 900 });
  await p.goto(URL, { waitUntil: 'networkidle0', timeout: 30000 });
  await p.evaluate(() => { sessionStorage.clear(); localStorage.clear(); });
  await p.evaluate(() => sessionStorage.setItem('mc_booted', '1'));
  await p.reload({ waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 900));
  const step = async (name, fn) => {
    try { await fn(); console.log('OK  ', name); }
    catch (e) { console.log('FAIL', name, '—', e.message.split('\n')[0]); }
  };

  await step('burger menu open/close', async () => {
    await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await p.evaluate(() => document.getElementById('navBurger').click());
    await new Promise(r => setTimeout(r, 400));
    if (!(await p.$eval('#navLinks', el => el.classList.contains('is-open')))) throw new Error('未展开');
    await p.evaluate(() => document.querySelector('#navLinks a[href="#works"]').click());
    await new Promise(r => setTimeout(r, 700));
    if (await p.$eval('#navLinks', el => el.classList.contains('is-open'))) throw new Error('未收起');
    await p.setViewport({ width: 1600, height: 900 });
  });

  await step('news card opens lightbox', async () => {
    await p.evaluate(() => { document.getElementById('works').scrollIntoView(); document.querySelector('.news-card .news-desc').click(); });
    await new Promise(r => setTimeout(r, 700));
    if (await p.$eval('#mcCase', el => el.hidden)) throw new Error('lightbox 未打开');
    const title = await p.$eval('#mcCase .mc-title', el => el.textContent);
    await p.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 300));
    if (await p.$eval('#mcCase', el => !el.hidden)) throw new Error('esc 未关闭');
    console.log('     ↳ lightbox:', title);
  });

  await step('admin wrong token rejected', async () => {
    await p.evaluate(() => document.getElementById('megaAdmin').click());
    await p.type('#tokenInput', 'MC-WRONG');
    await p.click('.admin-go');
    await new Promise(r => setTimeout(r, 500));
    if (await p.$eval('#tokenErr', el => el.hidden)) throw new Error('错误令牌未被拒');
    await p.evaluate(() => document.getElementById('tokenInput').setValue?.('') || null);
  });

  await step('correct token unlocks editor', async () => {
    await p.evaluate(() => { document.getElementById('tokenInput').value = ''; });
    await p.type('#tokenInput', TOKEN);
    await p.click('.admin-go');
    await p.waitForSelector('#adminStepEdit:not([hidden])', { timeout: 3000 });
  });

  await step('edit and save persists', async () => {
    const cur = await p.$eval('input[data-path="identity.name"]', el => el.value);
    await p.$eval('input[data-path="identity.name"]', (el, v) => { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); }, cur + 'X');
    await p.click('#adminSave');
    await new Promise(r => setTimeout(r, 500));
    const stored = await p.evaluate(() => JSON.parse(localStorage.getItem('mc_content_v1') || '{}').identity?.name);
    if (!stored || !stored.endsWith('X')) throw new Error('未持久化: ' + stored);
  });

  await step('publish wrong token error path', async () => {
    await p.evaluate(() => localStorage.setItem('mc_gh_token', 'github_pat_INVALID'));
    await p.click('#adminPublish');
    await p.waitForFunction(() => document.getElementById('pubStatus').textContent.includes('提交失败'), { timeout: 20000 });
    await p.evaluate(() => localStorage.removeItem('mc_gh_token'));
    await p.keyboard.press('Escape');
  });

  await step('reset restores default', async () => {
    await p.evaluate(() => document.getElementById('megaAdmin').click());
    await p.waitForSelector('#adminStepEdit:not([hidden])', { timeout: 3000 });
    await p.evaluate(() => { window.confirm = () => true; });
    await p.click('#adminReset');
    await new Promise(r => setTimeout(r, 500));
    if (await p.evaluate(() => !!localStorage.getItem('mc_content_v1'))) throw new Error('未清除');
    await p.keyboard.press('Escape');
  });

  console.log('JSERR:', errs.length ? errs.join(' | ') : '(clean)');
  await p.close(); await b.close();
  console.log('MC INTERACT DONE');
  process.exit(0);
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
