# 迭代记录 — DRIFTER ARCHIVE（鸣潮黑金版）

## Round M1-M2（第六期：鸣潮黑金版全新主站）
**需求**: 按 mc.kurogames.com 风格出新版主站；新网址；不覆盖旧成品（ponm3ay.github.io 保持不变）。
**研究**: mc 官网 SPA 壳 + CSS 令牌（#181818/#222 深黑底、Inter 系、自定 jit/advent 字体）→ 本站令牌：底 #121212-#1d1d20 / 字 #f5f2ea / 金 #e8c57c→#c9a063 / 青 #7ee0d2。
**实现**: 鸣潮式布局——居中大标 hero（金渐变 168px 标题 + WUTHERING 幽灵字 + 光晕网格）/新闻三卡（编号水印+语言标签）/行式全档案/时间线/**底部超大导航块**（GITHUB/MAIL/ARK Site/ADMIN 四块）；漂泊者叙事；管理后台全功能移植（直发 GitHub 独立令牌）；访客/管理员双视图。
**验证**: 盲审 0/0/0（修复：faint 对比 4.3→4.7、行式/标题点击区、渐变底审计误报）· 交互 7/7（burger/lightbox/令牌双路径/持久化/发布错误路径/重置）· 线上 live 实拍 ✓。
**R58 修复**: Lightbox 详查面板样式补全（黑金盒子/水印/条纹——首版遗漏 mc-case 样式导致裸 HTML，已修）。
**部署**: 新仓库 `ponm3ay/mc-archive` → https://ponm3ay.github.io/mc-archive/ （新网址，旧站未覆盖）。
管理令牌（独立）：MC-QFDM-F5GH-CBGW-CPVM-Z28S（仅存 SHA-256 于 content.js）
