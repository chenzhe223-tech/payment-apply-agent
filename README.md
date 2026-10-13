# 付款填报助手 · 西南欧营销费用

一个辅助 **西南欧营销费用付款填报** 的 Agent 应用。基于飞书文档
《【西南欧】营销费用申请流程》(https://dreametech.feishu.cn/docx/Ukundyzwho2r8NxBsMKc50v6nVb)
构建，把文档里的流程、审核点、主数据沉淀成可操作的填报工作台，并提供 Agent 对话复核入口。

界面遵循 **RAGNARÖK（诸神黄昏）** 设计语言：深海底色 × 落日赭金，低饱和辅助色。

---

## 四个入口

| 入口 | 作用 | 对应实现 |
|---|---|---|
| **填报工作台** | 六段式表单（供应商 / 抬头 / 费用 / 付款 / 发票 / 预提），边填边校验，实时算出合规分与问题清单 | `src/views/ApplicationWorkbench.tsx` |
| **流程指引** | 六阶段流程图（预算 → SRM → 合同 → 预提 → 报账 → 付款），每阶段目标/时点/要点/风险等级 | `src/views/WorkflowGuide.tsx` |
| **主数据速查** | 项目号、渠道号、费用小类映射、分摊规则、字段取值，一键复制 | `src/views/MasterData.tsx` |
| **Agent 对话** | 流程问答、填报复核；工作台可把填报摘要一键推给 Agent | `server/index.ts` + 模板聊天前端 |

---

## 快速开始

```bash
npm install          # 安装依赖
npm run dev          # 同时启动前端 + 后端(3000)
```

分开启动：

```bash
npx tsx server/index.ts        # 后端 http://localhost:3000
npx vite --port 5273           # 前端 http://localhost:5273
```

生产构建：

```bash
npx vite build                 # 产物输出到 dist/
```

### 关于大模型调用

Agent 对话依赖 CodeBuddy 凭据。启动后若 `/api/check-login` 返回
`{"isLoggedIn":false, ...}`，说明当前机器没有可用凭据，对话会走不通。
两种解决方式（任选其一）：

1. **命令行登录**：在终端执行 `codebuddy login`，按提示完成授权；
2. **环境变量**：在项目根目录建 `.env`，写入

   ```
   CODEBUDDY_API_KEY=你的密钥
   ```

> 填报工作台、流程指引、主数据速查 **不依赖** 大模型，离线即可完整体验。

---

## 校验规则引擎

`src/domain/validator.ts` 把文档中的审核点翻译成可执行规则，分三档：

| 档位 | 含义 | 扣分 |
|---|---|---|
| **P0 阻断** | 违反即不可提交（如付款用途选错、分摊渠道为空、预提口径不一致） | −12 |
| **P1 警告** | 高风险，需人工确认 | −4 |
| **P2 提示** | 建议优化 | −1 |

合规分 = `max(0, 100 − P0×12 − P1×4 − P2×1)`。

覆盖的校验块（A–J）：

- 虚拟供应商判定（含税金额 > €5,000 且无标准合同 → 必须走虚拟供应商）
- 核算主体 / 付款公司一致性
- 币种一致性（跨币种需说明）
- **充值标志**（勾选后不会计入费用 —— P0）
- 摊销期合理性
- 成本中心必须为 `sales` 类型
- 项目号不得为 `ALL` 或留空
- 分摊渠道完整性、分摊系数 > 0
- 金额勾稽（不含税 × (1+税率) = 含税；付款金额 = 本次报账金额）
- **付款用途必须为「采购款（费用）」**
- 发票金额/类型须与报账模块一致
- 附件必传
- **预提铁律**：预提金额 = 项目总金额 ÷ 受益期；受益期、供应商、费用类型、分摊渠道（到渠道、到项目）报账时必须与预提完全一致

---

## 主数据

全部条目逐条摘自源文档，**未虚构任何业务规则**。

| 数据集 | 条数 | 位置 |
|---|---|---|
| 项目号 | 37 | `PROJECT_CODES` |
| 渠道号 | 46（含分组） | `CHANNEL_CODES` |
| 费用小类 ↔ 中台映射 | 11 | `EXPENSE_MAPPINGS` |
| 流程阶段 | 6 | `FLOW_STAGES` |
| 审核点 | 4 组 | `HEADER_AUDIT` / `EXPENSE_AUDIT` / `PAYMENT_AUDIT` / `ACCRUAL_AUDIT` |
| 高频差错 | 11 | `TOP_MISTAKES` |

---

## 设计规范（RAGNARÖK）

八条硬规则全部落地，`src/index.css` 是唯一样式真源。

| # | 规则 | 落地位置 |
|---|---|---|
| 1 | 赭金是唯一强调色，面积 ≤10% | 仅用于当前项/关键项/待操作项；并排元素只给一个金色 |
| 2 | 禁用粉、玫红、纯红、亮紫、荧光绿、糖果渐变 | 全量替换为 `--danger`(暖陶 `#D98A6A`) 等语义色 |
| 3 | 背景必须为分层双径向渐变，禁止纯色铺底 | `body` 上两层 `radial-gradient` + `--sea-800` |
| 4 | 正文色 ≥ `--ink-200` | 全站文本色阶 |
| 5 | 金底必须配深色文字 `#20140a` | `--on-gold`，禁止金底白字 |
| 6 | 圆角仅限 5 档 8/14/20/28/999 | `--r-sm/md/lg/xl/pill` |
| 7 | 动效仅 140/260/420ms + `cubic-bezier(.22,.61,.36,1)`，必须有减动效块 | `--dur-*`、`--ease-out`、`@media (prefers-reduced-motion)` |
| 8 | 辉光只给金色元素；按钮 `min-height:46px`；焦点环 `#F2B96B` | `.rok-btn-primary`、`:focus-visible` |

### 核心令牌

```
深海背景   --sea-900 #030b14  --sea-800 #06131f  --sea-700 #0c2b3e
落日赭金   --gold-500 #E8A24A  --gold-400 #F2B96B  --gold-600 #C9812F
辅助低饱和 --mist-400 #6FB3A8  --violet-400 #8E86B8  --slate-400 #8FA6B8
文字墨阶   --ink-100 #F2F6F9 → --ink-500 #5C7186
语义色     --ok #6FB3A8  --warn #E2B34C  --danger #D98A6A
```

---

## 技术栈

- **前端**：React 18 + Vite 5 + TypeScript 5 + TDesign React + Tailwind
- **后端**：Express + SSE + CodeBuddy Agent SDK
- **存储**：SQLite (`data/chat.db`)

模板由 `codebuddy-chat-web` 插件的 `init-cbc-sdk-web` 技能脚手架生成，业务代码在其上二次开发。

---

## 目录结构

```
src/
├── domain/
│   ├── southwestEurope.ts   # 主数据 + 流程 + 审核点（逐条摘自文档）
│   └── validator.ts         # 校验规则引擎（P0/P1/P2 + 合规分）
├── views/
│   ├── ApplicationWorkbench.tsx  # 填报工作台（核心）
│   ├── WorkflowGuide.tsx         # 流程指引（含内联 SVG 流程图）
│   └── MasterData.tsx            # 主数据速查
├── pages/
│   └── WorkbenchPage.tsx     # 工作台外壳 + 三 Tab 切换
├── components/               # 模板组件（已按 RAGNARÖK 改造）
├── hooks/useAgents.ts        # Agent 配置 + 领域系统提示词
├── config.ts                 # 品牌 / 范围 / 数据源
└── index.css                 # 设计令牌唯一样式真源
server/
└── index.ts                  # Express + SSE + Agent SDK（含同一份领域提示词）
```

---

## 已验证

| 项 | 结果 |
|---|---|
| `vite build` | ✅ 成功（3.83 MB / gzip 1.05 MB） |
| 后端 `/api/health` | ✅ `{"status":"ok"}` |
| 后端 `/api/models` | ✅ 返回 10 个可用模型，默认 `auto` |
| 前端页面 | ✅ HTTP 200 |
| 禁用色扫描 | ✅ 无残留（蓝/青/紫/纯红/橙已全部替换为令牌） |
| 八条硬规则 | ✅ 逐条核验通过 |
| 大模型对话 | ⚠️ 需本机 CodeBuddy 凭据（见上文） |
