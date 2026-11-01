// 构建脚本（鸣潮站）：bun build.js；node 回退
// 产物：mc.min.css / app.min.js / admin.min.js + index.html 内联关键 CSS（标记归零 + 断言幂等）
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const hasBun = typeof Bun !== 'undefined' && typeof Bun.build === 'function';

async function bunMinify(file) {
  const ext = file.endsWith('.css') ? 'css' : 'js';
  const result = await Bun.build({ entrypoints: [file], minify: true, target: 'browser' });
  if (!result.success) throw new Error('Bun.build failed: ' + result.logs.map(String).join('\n'));
  const out = path.join(path.dirname(file), path.basename(file).replace(/\.js$|\.css$/, '') + '.min.' + ext);
  await Bun.write(out, await result.outputs[0].text());
}
function naiveCss(file, out) {
  const s = fs.readFileSync(file, 'utf8');
  fs.writeFileSync(out, s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{}:;,>])\s*/g, '$1'));
}

async function main() {
  const css = path.join(ROOT, 'assets/css/mc.css');
  const cssMin = path.join(ROOT, 'assets/css/mc.min.css');
  if (hasBun) await bunMinify(css); else naiveCss(css, cssMin);

  const src = fs.readFileSync(css, 'utf8');
  const m = src.match(/\/\*CRIT-START\*\/([\s\S]*?)\/\*CRIT-END\*\//);
  if (!m) throw new Error('CRIT markers missing');
  const critTmp = path.join(ROOT, 'assets/css/.crit.tmp.css');
  fs.writeFileSync(critTmp, m[1]);
  const critMinTmp = path.join(ROOT, 'assets/css/.crit.tmp.min.css');
  if (hasBun) await bunMinify(critTmp); else naiveCss(critTmp, critMinTmp);
  const critical = fs.readFileSync(critMinTmp, 'utf8');
  fs.unlinkSync(critTmp); fs.unlinkSync(critMinTmp);

  if (hasBun) {
    await bunMinify(path.join(ROOT, 'assets/js/app.js'));
    await bunMinify(path.join(ROOT, 'assets/js/admin.js'));
  } else {
    fs.copyFileSync(path.join(ROOT, 'assets/js/app.js'), path.join(ROOT, 'assets/js/app.min.js'));
    fs.copyFileSync(path.join(ROOT, 'assets/js/admin.js'), path.join(ROOT, 'assets/js/admin.min.js'));
  }

  const htmlPath = path.join(ROOT, 'index.html');
  let html = fs.readFileSync(htmlPath, 'utf8');
  // 归零（宽松）
  html = html.replace(/<style id="mc-critical">[\s\S]*?<\/style>/g, '');
  html = html.replace(/<noscript><link rel="stylesheet" href="assets\/css\/mc\.min\.css"><\/noscript>/g, '');
  html = html.replace(/<link rel="stylesheet" href="assets\/css\/mc\.min\.css"[^>]*>/g, '');
  html = html.replace(/<script src="assets\/js\/app(\.min)?\.js"[^>]*><\/script>/g, '');
  html = html.replace(/<script src="assets\/js\/admin(\.min)?\.js"[^>]*><\/script>/g, '');
  html = html.replace(/<noscript><\/noscript>/g, '');
  html = html.replace(/\n{3,}/g, '\n\n');
  // 注入
  const anchor = '<link rel="stylesheet" href="assets/fonts/fonts.css">';
  if (!html.includes(anchor)) throw new Error('fonts.css 锚点缺失');
  const inject = anchor + '\n' +
    '<style id="mc-critical">' + critical + '</style>\n' +
    '<link rel="stylesheet" href="assets/css/mc.min.css" media="print" onload="this.media=\'all\'">\n' +
    '<noscript><link rel="stylesheet" href="assets/css/mc.min.css"></noscript>';
  html = html.replace(anchor, inject);
  const scriptAnchor = '<script src="assets/js/content.js"></script>';
  const scriptInject = scriptAnchor + '\n' +
    '<script src="assets/js/app.min.js" defer></script>\n' +
    '<script src="assets/js/admin.min.js" defer></script>';
  html = html.replace(scriptAnchor, scriptInject);
  const n = (html.match(/id="mc-critical"/g) || []).length;
  if (n !== 1) throw new Error('critical 副本数异常: ' + n);
  fs.writeFileSync(htmlPath, html);
  console.log('build OK (bun=' + hasBun + ') critical=' + (critical.length / 1024).toFixed(1) + 'K');
}
main().catch(e => { console.error('BUILD FAIL:', e.message); process.exit(1); });
