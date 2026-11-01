/* ============================================================
   PONM3AY // DRIFTER ARCHIVE — content.js
   数据层（鸣潮黑金版）。覆盖顺序：本文件默认 < content.json < localStorage
   管理员令牌仅存 SHA-256 摘要，明文不落库。
   ============================================================ */
window.MC_TOKEN_SHA256 = '2dafac5ef6aa422335781043e93b462f88499f685368bee28bc25fa228573bd6';

window.MC_DEFAULT_CONTENT = {
  meta: { siteTitle: 'PONM3AY // DRIFTER ARCHIVE', updated: '2026.11' },
  identity: {
    codename: 'PONM3AY',
    name: 'gugu',
    role: 'AI TOOLS / AUTOMATION / CV',
    mission: '把重复劳动拆成模块，交给脚本与 agent。',
    bio: '白天拆需求、写插件；晚上把日常动作自动化成脚本，然后 DeepSleep~zzz。专注 LLM agent 插件生态（DSH）、桌面自动化工具链与 CV 训练流水线 —— safeyolo、dsh-plugins、autoclaw-proxy 的维护者。',
    avatarUrl: ''
  },
  stats: { repos: '08', stars: '05', followers: '00', since: '2022.10' },
  attrs: [
    { name: 'BUILD SPEED', label: '建造速度', val: 88 },
    { name: 'DEBUG DEPTH', label: '调试深度', val: 84 },
    { name: 'UI TASTE', label: '界面审美', val: 76 },
    { name: 'AUTOMATION', label: '自动化', val: 90 }
  ],
  chips: ['漂泊者 · 独立开发者', '共鸣 · AGENT / TOOLS', '状态 · OPEN FOR WORK'],
  modules: [
    'Python', 'JavaScript', 'Node.js', 'PowerShell',
    'YOLO / CV', 'LLM Agents', 'DSH 插件开发', 'Windows 自动化',
    'Git / CI', 'OpenAI 兼容 API'
  ],
  operations: [
    {
      no: 'OP-01', title: 'safeyolo', lang: 'PYTHON',
      date: '2025.07',
      desc: '基于 Ultralytics YOLO 的安全帽 / 反光衣穿戴检测训练工具：标注格式转换、数据集划分、训练与指标记录、评估与推理一体化 CLI，覆盖从原始标注到模型部署的完整流程。',
      tags: ['Python', 'YOLO', 'Computer Vision'],
      status: 'PUBLISHED', st: 'gold', meta: '★ 5 · MIT',
      link: 'https://github.com/ponm3ay/safeyolo'
    },
    {
      no: 'OP-02', title: 'dsh-plugins', lang: 'JAVASCRIPT',
      date: '2026.10',
      desc: 'DeepSeek Harness（DSH）插件集：按任务给不同模型派活的「辅助模型」槽位、跨会话长期记忆、子代理用量显示、界面背景与供应商染色。不改本体源码，每个插件可独立装卸。',
      tags: ['JavaScript', 'DSH', 'Plugin'],
      status: 'ACTIVE', st: 'cyan',
      meta: '5 PLUGINS IN ONE',
      link: 'https://github.com/ponm3ay/dsh-plugins'
    },
    {
      no: 'OP-03', title: 'autoclaw-proxy', lang: 'NODE.JS',
      date: '2026.10',
      desc: '把 AutoClaw（澳龙）桌面客户端的 GLM 模型额度封装成本地 OpenAI 兼容 API 端点：支持 SSE 流式与 tool_calls，凭据经 DPAPI 热提取自动续期，零依赖纯 Node.js 标准库，克隆即跑。',
      tags: ['Node.js', 'OpenAI API', 'Proxy'],
      status: 'ACTIVE', st: 'cyan',
      meta: 'ZERO-DEP',
      link: 'https://github.com/ponm3ay/autoclaw-proxy'
    },
    {
      no: 'OP-04', title: 'dsh-bilibili-afygbot', lang: 'NODE.JS',
      date: '2026.10',
      desc: '把 B 站刷到的鸣潮凹分（椰果）视频沉淀成结构化、可联邦、可被 agent 调用的数据：append-only jsonl 记录 + 只读 HTTP 接口，记录 id 全局唯一，多机数据可按 id 去重联邦。',
      tags: ['Node.js', 'Data Layer', 'Bilibili'],
      status: 'FIELD TEST', st: 'red',
      meta: 'EARLY PREVIEW',
      link: 'https://github.com/ponm3ay/dsh-bilibili-afygbot'
    },
    {
      no: 'OP-05', title: 'trae-cn-patcher', lang: 'POWERSHELL',
      date: '2026.10',
      desc: 'Trae CN IDE 微插件：一键屏蔽「工作区位于安装文件夹」顶部告警横幅，并同步完整性校验避免「安装损坏」提示。apply / status / restore 三段式操作，零依赖。',
      tags: ['PowerShell', 'IDE Patch'],
      status: 'STABLE', st: 'gold',
      meta: 'ZERO-DEP',
      link: 'https://github.com/ponm3ay/trae-cn-patcher'
    },
    {
      no: 'OP-06', title: 'traework-auto-checkin', lang: 'NODE.JS',
      date: '2026.10',
      desc: 'TRAE / TraeWork CN 每日自动签到：自动领取每日签到积分。零依赖 Node.js + Windows 计划任务，打开 IDE 即自动完成签到，无需人工干预。',
      tags: ['Node.js', 'Task Scheduler'],
      status: 'AUTOMATED', st: 'cyan',
      meta: 'DAILY RUN',
      link: 'https://github.com/ponm3ay/traework-auto-checkin'
    },
    {
      no: 'OP-07', title: 'dsh-aux-models', lang: 'JAVASCRIPT',
      date: '2026.10',
      desc: 'DSH 设置页「辅助模型」面板：按任务选择辅助模型（服务商/模型/超时），选型落盘一份机器可读的槽位表供其它插件与脚本读取。',
      tags: ['JavaScript', 'DSH'],
      status: 'STABLE', st: 'gold',
      meta: 'DSH ECOSYSTEM',
      link: 'https://github.com/ponm3ay/dsh-aux-models'
    },
    {
      no: 'OP-08', title: 'dsh-provider-accent', lang: 'JAVASCRIPT',
      date: '2026.10',
      desc: 'DSH model picker 供应商标题高亮：高对比与每供应商强调色，切换模型时一眼看清当前供应商。',
      tags: ['JavaScript', 'DSH'],
      status: 'STABLE', st: 'gold',
      meta: 'DSH ECOSYSTEM',
      link: 'https://github.com/ponm3ay/dsh-provider-accent'
    }
  ],
  log: [
    { date: '2026.10', title: 'dsh 插件矩阵成型', status: 'ACTIVE', st: 'cyan', text: 'dsh-plugins / dsh-aux-models / dsh-provider-accent 连续发版：模型派活、跨会话长期记忆、子代理用量显示链路稳定运行。' },
    { date: '2026.10', title: 'autoclaw-proxy 开放', status: 'PUBLISHED', st: 'gold', text: 'GLM 额度反代封装为 OpenAI 兼容端点：SSE 流式 + tool_calls 全通过，凭据自愈机制上线。' },
    { date: '2025.07', title: 'safeyolo 开源', status: '★ 5', st: 'gold', text: 'YOLO 安全帽 / 反光衣检测训练工具开源：标注 → 训练 → 部署全流程覆盖，CI 全绿。' },
    { date: '2022.10', title: '账号建立', status: 'ARCHIVED', st: 'dim', text: 'GitHub 账号 ponm3ay 注册。漂泊者进入 supra，开始积累作战记录。' }
  ],
  connect: {
    mail: 'sevenmaples@163.com',
    github: 'github.com/ponm3ay',
    responseNote: 'RESPONSE · 24-48H · [待编辑：可写上你的响应习惯]'
  },
  footer: { text: '© 2026 PONM3AY · DRIFTER ARCHIVE' }
};
