/**
 * 西南欧 营销费用申请 · 领域知识库
 *
 * 数据来源：飞书《【西南欧】营销费用申请流程》
 *   https://dreametech.feishu.cn/docx/Ukundyzwho2r8NxBsMKc50v6nVb
 *   内嵌表格：常用项目号 / 常用渠道 / 报账信息映射表
 *
 * 用途：
 *   1. 供前端「流程指引」「主数据速查」「校验器」使用
 *   2. 供后端拼装 Agent systemPrompt，使模型口径与财务中台一致
 *
 * 注意：本文件只做"口径搬运"，不新增业务规则。所有条目均可回溯到原始文档。
 */

/* ============================================================
 * 一、流程主干
 * ========================================================== */

export interface FlowStage {
  key: string;
  seq: string;
  name: string;
  system: string;
  mandatory: boolean;
  goal: string;
  timing: string;
  keyPoints: string[];
  riskLevel: 'normal' | 'warn' | 'danger';
}

export const FLOW_STAGES: FlowStage[] = [
  {
    key: 'budget',
    seq: '0',
    name: '线下邮件申请（项目维度预算）',
    system: '邮件 / 审批规则',
    mandatory: true,
    goal: '以项目维度先申请预算，明确时效、审批人、申请方式',
    timing: '业务开展之前',
    keyPoints: [
      '追觅品牌走《【追觅品牌】营销费用审批规则》',
      'MOVA 品牌走《【MOVA品牌】营销费用审批规则》',
      '两个品牌的审批规则不同，不可混用口径',
    ],
    riskLevel: 'normal',
  },
  {
    key: 'srm',
    seq: '2',
    name: '供应商管理注册（SRM 系统）',
    system: 'SRM',
    mandatory: true,
    goal: '建立供应商主数据，为后续合同与付款提供账户信息',
    timing: '合同申请之前',
    keyPoints: [
      '非虚拟供应商：必须在 SRM 建立供应商信息，并申请合同',
      '虚拟供应商：单笔金额 < €5,000 且无标准合同、仅有报价单时，可用对应公司主体下的虚拟供应商 + 虚拟合同',
      '虚拟供应商适用场景目前仅限 PR & KOL & 零星采购',
      '使用虚拟供应商时，发票报账流程中以报价单作为附件上传',
      '新建供应商时务必写清服务商背景、引入用途',
      'SRM 中维护的银行账户会自动带出到付款信息；虚拟供应商需按 Invoice 手工填写账户',
    ],
    riskLevel: 'normal',
  },
  {
    key: 'contract',
    seq: '3',
    name: '合同申请（OA）',
    system: 'OA',
    mandatory: true,
    goal: '锁定交易金额与付款计划',
    timing: '业务开展之前',
    keyPoints: [
      '营销类合同必须关联「营销服务申请」流程',
      '非框架协议：合同内明确交易金额，并在流程下方填写付款计划',
      '财务中台报账金额需 ≤ 合同流程填写金额',
      '框架协议：未约定具体金额',
    ],
    riskLevel: 'warn',
  },
  {
    key: 'prepay',
    seq: '4',
    name: '预付申请（财务中台）',
    system: '财务中台',
    mandatory: false,
    goal: '付款时尚未取得发票时走此流程',
    timing: '合同生效后、取得发票前',
    keyPoints: [
      '预付定义：付款时没有发票。先有发票再付款则不属于预付',
      '仅预付流程不涉及费用计入',
      '预付款流程结束后收到发票，一定要走发票报账流程并关联核销预付款',
    ],
    riskLevel: 'warn',
  },
  {
    key: 'accrual',
    seq: '5',
    name: '费用预提流程（财务中台）',
    system: '财务中台',
    mandatory: false,
    goal: '业务实际发生时间早于实际入账时间时，逐月计提费用',
    timing: '业务发生且受益后，至尾票「发票报账单」到达出纳支付节点之前，每月提交',
    keyPoints: [
      '当月需预提金额 = 项目总金额 ÷ 受益期',
      '受益期、供应商、费用类型、分摊渠道必须与后续报账保持一致',
      '未到报账月前每月都需提交，可直接复制上一期预提单据',
      '同项目多张票时，最后一张票报账时再核销之前所有月预提',
      '不同主体、不同供应商的不同活动，必须分不同单据提交',
      '同项目的预提与报账可以是不同的人提交',
      '如确定项目作废/中断且不会产生费用，需联系财务冲销预提单',
    ],
    riskLevel: 'warn',
  },
  {
    key: 'reimburse',
    seq: '6',
    name: '发票报账流程（财务中台）',
    system: '财务中台',
    mandatory: true,
    goal: '完成付款并把费用计入账面',
    timing: '取得发票后；此流程结束后才会计入费用',
    keyPoints: [
      '路径：报账事务 → 应付报账 → 发票报账流程',
      '核算主体需与合同主体保持一致',
      '金额（含税）需与合同 / PI 的币别、金额一致',
      '发票模块的金额、发票类型必须与报账模块一致，否则系统报错',
      '成本中心根据「费用承担部门」带出；营销费用类报账必须是销售类成本中心，且成本中心公司主体需与报账主体一致',
      '所有费用都需按 BU 和产品线分摊，不允许选择"全产品线"',
      '所有费用还必须按渠道明确分摊到各业务组；能明确到 SKU 的就分摊至 SKU',
      '如需每月重复同一报账，可直接复制上期发票报账流程',
    ],
    riskLevel: 'danger',
  },
];

/* ============================================================
 * 二、报账信息 · 字段校对清单（来自文档「详细页面审核点」）
 * ========================================================== */

export interface AuditCheck {
  field: string;
  requirement: string;
  severity: 'P0' | 'P1' | 'P2';
}

export const HEADER_AUDIT: AuditCheck[] = [
  { field: '核算主体', requirement: '需与合同主体保持一致', severity: 'P0' },
  { field: '币种', requirement: '与形式发票、合同币种保持一致', severity: 'P0' },
  { field: '摊销标志 / 开始 / 结束期间', requirement: '与实际受益期间一致；如有预提，需与预提期间一致', severity: 'P1' },
  { field: '是否充值', requirement: '点开充值标志后不会计入费用；一般业务不涉及充值，特殊情况联系区域财务 BP', severity: 'P0' },
];

export const EXPENSE_AUDIT: AuditCheck[] = [
  { field: '费用小类', requirement: '与业务实质一致；如有预提，与预提费用类型一致', severity: 'P0' },
  { field: '金额（含税）', requirement: '与合同、PI 的币别和金额保持一致', severity: 'P0' },
  { field: '发票种类', requirement: '与发票模块中的发票类型、附件发票类型保持一致', severity: 'P0' },
  { field: '税率类型', requirement: '形式发票为 0%（发票中会注明税率情况）；其他按发票确认', severity: 'P1' },
  { field: '期间', requirement: '构成"摘要"，按实际期间填写', severity: 'P2' },
  { field: '成本中心', requirement: '由费用承担部门带出，需检查；营销费用类必须是销售类成本中心，且公司主体与报账主体一致', severity: 'P0' },
  { field: '项目号', requirement: '符合实际；如有预提，与预提一致', severity: 'P0' },
  { field: '渠道', requirement: '符合实际；如有预提，与预提一致；多渠道受益用分摊实现', severity: 'P1' },
];

export const PAYMENT_AUDIT: AuditCheck[] = [
  { field: '付款金额', requirement: '等于本次报账金额', severity: 'P0' },
  { field: '银行账户', requirement: 'SRM 已创建供应商的自动带出；虚拟供应商按 Invoice 手工填写', severity: 'P0' },
  { field: '付款方式', requirement: '按实际填写（如电汇）', severity: 'P2' },
  { field: '计划付款日期', requirement: '按实际填写', severity: 'P1' },
  { field: '付款用途', requirement: '所有营销费用统一选择「采购款（费用）」', severity: 'P0' },
  { field: '付款条件', requirement: '根据 SAP 中供应商主数据带出，不影响支付', severity: 'P1' },
  { field: '延后支付', requirement: '本次仅报账、不付款时选择；后续通过合同里程碑付款', severity: 'P1' },
  { field: '第三方链接', requirement: '需链接支付时填写', severity: 'P2' },
  { field: '关联预提', requirement: '报账时必须关联该项目之前提交的所有月预提，可修改金额做部分冲销', severity: 'P0' },
];

export const ACCRUAL_AUDIT: AuditCheck[] = [
  { field: '受益期', requirement: '报账时一定要和预提时一致', severity: 'P0' },
  { field: '供应商', requirement: '报账时一定要和预提时一致', severity: 'P0' },
  { field: '费用类型', requirement: '报账时一定要和预提时一致', severity: 'P0' },
  { field: '分摊渠道 / 项目号', requirement: '报账时一定要和预提时一致（到渠道、项目）', severity: 'P0' },
  { field: '预提金额', requirement: '预提金额 = 项目总金额 ÷ 受益期', severity: 'P0' },
  { field: '提交频次', requirement: '没到报账月前，每个月都需提交', severity: 'P0' },
  { field: '单据拆分', requirement: '不同主体、不同供应商的不同活动，分不同单据提交', severity: 'P0' },
  { field: '尾票核销', requirement: '同项目多张票，最后一张票报账时再核销之前所有月预提', severity: 'P0' },
];

/* ============================================================
 * 三、主数据：常用项目号（BU 全产品）
 * ========================================================== */

export interface ProjectCode {
  brand: '追觅' | 'MOVA' | '';
  code: string;
  desc: string;
}

/** 原始表存在重复行与重码，此处按文档原样保留（去掉了纯重复行） */
export const PROJECT_CODES: ProjectCode[] = [
  { brand: '追觅', code: 'RO001', desc: '追觅-扫地机-公共费用' },
  { brand: '', code: 'WO001', desc: '追觅-洗地机-公共费用' },
  { brand: '', code: 'VO001', desc: '追觅-吸尘器-公共费用' },
  { brand: '', code: 'PO004', desc: '追觅-吹风机-公共费用' },
  { brand: '', code: 'PO007', desc: '追觅-美容仪-公共费用' },
  { brand: '', code: 'XS001', desc: '追觅-空气炸锅-公共费用' },
  { brand: '', code: 'KF001', desc: 'KF001+追觅-咖啡机-公共项目' },
  { brand: '', code: 'SM001', desc: '追觅-厨师机-公共费用' },
  { brand: '', code: 'AO001', desc: '追觅-创新机器人-公共费用' },
  { brand: '', code: 'BO001', desc: '追觅-送餐机-公共费用' },
  { brand: '', code: 'DO001', desc: '追觅-洗衣机-公共费用' },
  { brand: '', code: 'GO001', desc: '追觅-割草机-公共费用' },
  { brand: '', code: 'XA001', desc: '追觅-洗碗机-公共费用' },
  { brand: '', code: 'XA003', desc: 'XA003+追觅-大厨电-公共费用' },
  { brand: '', code: 'GO006', desc: '追觅-泳池机器人-公共费用' },
  { brand: '', code: 'GO008', desc: '追觅-擦窗机器人-公共费用' },
  { brand: '', code: 'DS240001', desc: '追觅-智能电视-公共费用 / DS240001+电视-公共项目号' },
  { brand: '', code: 'NO002', desc: '追觅-口腔健康-公共费用' },
  { brand: '', code: 'PT001', desc: '追觅-剃须刀-公共费用' },
  { brand: '', code: 'CO001', desc: '追觅-冰箱-公共费用' },
  { brand: '', code: 'UO001', desc: '追觅-生活电器-公共费用' },
  { brand: '', code: 'EO001', desc: 'EO001+追觅-空调-公共费用' },
  { brand: '', code: 'XP001', desc: '追觅-净水-公共费用' },
  { brand: 'MOVA', code: 'RO003', desc: 'MOVA-扫地机-公共费用' },
  { brand: '', code: 'WO003', desc: 'MOVA-洗地机-公共费用' },
  { brand: '', code: 'VO003', desc: 'MOVA-吸尘器-公共费用' },
  { brand: '', code: 'XR002', desc: 'XR002+Mova-家用咖啡机-公共费用' },
  { brand: '', code: 'XU001', desc: 'XU001+Mova-商用咖啡机-公共费用' },
  { brand: '', code: 'QO002', desc: 'MOVA-宠物用品-公共费用' },
  { brand: '', code: 'PO003', desc: 'MOVA-个护-公共费用' },
  { brand: '', code: 'GO005', desc: 'MOVA-割草机-公共费用' },
  { brand: '', code: 'GO007', desc: 'MOVA-泳池机器人-公共费用' },
  { brand: '', code: 'GO009', desc: 'MOVA-擦窗机器人-公共费用' },
  { brand: '', code: 'XQ002', desc: 'MOVA-空气炸锅-公共费用 / MOVA-厨电(新)-公共费用' },
  { brand: '', code: 'LDL001-A', desc: 'LDL001 消费级3D打印-公共费用' },
  { brand: '', code: 'G0010', desc: '园林工具-公共费用' },
  { brand: '', code: 'GE2521', desc: '电动工具项目-公共费用（MOVA）' },
];

/* ============================================================
 * 四、主数据：常用渠道（西南欧）
 * ========================================================== */

export interface ChannelCode {
  code: string;
  text: string;
  note: string;
  /** 分组：分销-平台 / 自营-平台 / 分销-国家零售 / 兜底 */
  group: string;
}

export const CHANNEL_CODES: ChannelCode[] = [
  { code: 'Z80', text: '国际区-西南欧-分销-比利时-亚马逊', note: 'Acc 代理对应的比利时亚马逊', group: '分销 · 亚马逊（Acc 代理）' },
  { code: 'Z74', text: '国际区-西南欧-分销-德国-亚马逊', note: 'Acc 代理对应的德国亚马逊', group: '分销 · 亚马逊（Acc 代理）' },
  { code: 'Z75', text: '国际区-西南欧-分销-法国-亚马逊', note: 'Acc 代理对应的法国亚马逊', group: '分销 · 亚马逊（Acc 代理）' },
  { code: 'Z79', text: '国际区-西南欧-分销-荷兰-亚马逊', note: 'Acc 代理对应的荷兰亚马逊', group: '分销 · 亚马逊（Acc 代理）' },
  { code: 'Z77', text: '国际区-西南欧-分销-西班牙-亚马逊', note: 'Acc 代理对应的西班牙亚马逊', group: '分销 · 亚马逊（Acc 代理）' },
  { code: 'Z76', text: '国际区-西南欧-分销-意大利-亚马逊', note: 'Acc 代理对应的意大利亚马逊', group: '分销 · 亚马逊（Acc 代理）' },
  { code: 'Z78', text: '国际区-西南欧-分销-英国-亚马逊', note: 'Acc 代理对应的英国亚马逊', group: '分销 · 亚马逊（Acc 代理）' },
  { code: '861', text: '国际区-西南欧-自营-法国-CDISCOUNT', note: 'Cdiscount-法国', group: '自营 · 第三方平台' },
  { code: '862', text: '国际区-西南欧-自营-法国-DARTY', note: 'Darty（香港）', group: '自营 · 第三方平台' },
  { code: '858', text: '国际区-西南欧-自营-德国-EBAY', note: 'eBay-德国', group: '自营 · 第三方平台' },
  { code: '871', text: '国际区-西南欧-自营-意大利-EBAY', note: 'eBay-意大利', group: '自营 · 第三方平台' },
  { code: '863', text: '国际区-西南欧-自营-法国-EBAY', note: 'eBay-法国', group: '自营 · 第三方平台' },
  { code: '869', text: '国际区-西南欧-自营-西班牙-EBAY', note: 'eBay-西班牙', group: '自营 · 第三方平台' },
  { code: '874', text: '国际区-西南欧-自营-英国-EBAY', note: 'eBay-英国', group: '自营 · 第三方平台' },
  { code: '864', text: '国际区-西南欧-自营-法国-FNAC', note: 'Fnac-法国', group: '自营 · 第三方平台' },
  { code: '920', text: '国际区-西南欧-自营-西班牙-FNAC', note: 'FNAC 西班牙', group: '自营 · 第三方平台' },
  { code: '902', text: '国际区-西南欧-自营-德国-Kaufland', note: 'Kaufland.de', group: '自营 · 第三方平台' },
  { code: '933', text: '国际区-西南欧-自营-德国-Manomano', note: 'MANOMANO-德国', group: '自营 · 第三方平台' },
  { code: '924', text: '国际区-西南欧-自营-法国-Manomano', note: '法国-Manomano', group: '自营 · 第三方平台' },
  { code: 'Z13', text: '国际区-西南欧-自营-法国-RDC', note: '法国 Rue de commerce（RDC）', group: '自营 · 第三方平台' },
  { code: '935', text: '国际区-西南欧-自营-比利时-独立站', note: '独立站（比利时）', group: '自营 · 独立站' },
  { code: '859', text: '国际区-西南欧-自营-德国-独立站', note: '独立站（德国）', group: '自营 · 独立站' },
  { code: '865', text: '国际区-西南欧-自营-法国-独立站', note: '独立站（法国）', group: '自营 · 独立站' },
  { code: '936', text: '国际区-西南欧-自营-荷兰-独立站', note: '独立站（荷兰）', group: '自营 · 独立站' },
  { code: '811', text: '国际区-西南欧-自营-西班牙-独立站', note: '独立站（西班牙）', group: '自营 · 独立站' },
  { code: '872', text: '国际区-西南欧-自营-意大利-独立站', note: '独立站（意大利）', group: '自营 · 独立站' },
  { code: '917', text: '国际区-西南欧-自营-法国-乐天', note: '法国-乐天（Rakuten）', group: '自营 · 第三方平台' },
  { code: '867', text: '国际区-西南欧-自营-泛欧-速卖通', note: '速卖通自营店-欧洲', group: '自营 · 第三方平台' },
  { code: '860', text: '国际区-西南欧-自营-德国-亚马逊', note: '亚马逊（香港）-德国站', group: '自营 · 亚马逊（香港）' },
  { code: '866', text: '国际区-西南欧-自营-法国-亚马逊', note: '亚马逊（香港）-法国站', group: '自营 · 亚马逊（香港）' },
  { code: '930', text: '国际区-西南欧-自营-荷兰-亚马逊', note: '亚马逊（香港）-荷兰站', group: '自营 · 亚马逊（香港）' },
  { code: '870', text: '国际区-西南欧-自营-西班牙-亚马逊', note: '亚马逊（香港）-西班牙站', group: '自营 · 亚马逊（香港）' },
  { code: '873', text: '国际区-西南欧-自营-意大利-亚马逊', note: '亚马逊（香港）-意大利站', group: '自营 · 亚马逊（香港）' },
  { code: '875', text: '国际区-西南欧-自营-英国-亚马逊', note: '亚马逊（香港）-英国站', group: '自营 · 亚马逊（香港）' },
  { code: '868', text: '国际区-西南欧-自营-泛欧-亚马逊', note: '以上自营亚马逊的总称，目前不适用', group: '自营 · 亚马逊（香港）' },
  { code: '890', text: '国际区-西南欧-分销-英国-英国', note: '英国零售', group: '分销 · 国家零售' },
  { code: '856', text: '国际区-西南欧-分销-意大利-意大利', note: '意大利零售，如 Accessoryline-Retail', group: '分销 · 国家零售' },
  { code: 'Z17', text: '国际区-西南欧-分销-希腊-希腊', note: '希腊零售', group: '分销 · 国家零售' },
  { code: '854', text: '国际区-西南欧-分销-西班牙-西班牙', note: '西班牙零售', group: '分销 · 国家零售' },
  { code: 'Z16', text: '国际区-西南欧-分销-瑞士-瑞士', note: '瑞士零售', group: '分销 · 国家零售' },
  { code: '889', text: '国际区-西南欧-分销-荷兰-荷兰', note: '荷兰零售', group: '分销 · 国家零售' },
  { code: '852', text: '国际区-西南欧-分销-泛欧-泛欧', note: '只在特殊节点使用，仅 ACC 在特殊场景下使用', group: '分销 · 国家零售' },
  { code: '851', text: '国际区-西南欧-分销-法国-法国', note: '法国零售', group: '分销 · 国家零售' },
  { code: '850', text: '国际区-西南欧-分销-德国-德国', note: '德国零售', group: '分销 · 国家零售' },
  { code: 'Z18', text: '国际区-西南欧-分销-爱尔兰-爱尔兰', note: '爱尔兰零售', group: '分销 · 国家零售' },
  { code: '857', text: '国际区-西南欧-西南欧-西南欧-西南欧', note: '只在所有渠道和平台受益下使用（兜底）', group: '兜底' },
];

/* ============================================================
 * 五、主数据：业务类型 ↔ 费用小类 ↔ 中台费用类型 映射
 * ========================================================== */

export interface ExpenseMapping {
  bizType: string;
  subCategory: string;
  midPlatform: string;
  note: string;
}

export const EXPENSE_MAPPINGS: ExpenseMapping[] = [
  { bizType: '站内推广', subCategory: '站内推广', midPlatform: '站内推广-站内广告', note: 'Amazon 广告费用' },
  { bizType: '站外推广', subCategory: '社交媒体', midPlatform: '站外推广-社交媒体', note: 'Freelancer' },
  { bizType: '站外推广', subCategory: 'KOL投入', midPlatform: '站外推广-KOL合作费', note: 'KOL' },
  { bizType: '站外推广', subCategory: '广告投放', midPlatform: '站外推广-广告投放', note: 'Google & FB 等广告投放组' },
  { bizType: '站外推广', subCategory: 'Deal费用', midPlatform: '站外推广-Deal费用', note: 'Deal' },
  { bizType: '站外推广', subCategory: 'PR', midPlatform: '站外推广-PR合作费', note: 'PR agency 和文章合作' },
  { bizType: '站外推广', subCategory: '素材制作', midPlatform: '站外推广-素材制作', note: '素材制作' },
  { bizType: '站外推广', subCategory: '线下投入', midPlatform: '站外推广-线下投入（海外）', note: '各国家 CMKT 投入' },
  { bizType: '品牌费用', subCategory: '展会', midPlatform: '品牌费用-品牌营销-品牌展会专项', note: 'IFA、CMS 等展会费用' },
  { bizType: '品牌费用', subCategory: '线下门店', midPlatform: '门店费用-海外线下门店', note: '旗舰店门店费用 / 专区专柜 / 素材费用' },
  { bizType: '品牌费用', subCategory: '品牌其他', midPlatform: '品牌费用-品牌费用其他', note: '其他品牌类费用，例如国米合作' },
];

/* ============================================================
 * 六、分摊规则
 * ========================================================== */

export const ALLOCATION_RULES = {
  hard: [
    '所有费用都需要按 BU 和产品线进行分摊，不允许选择"全产品线"',
    '所有费用也必须根据渠道明确分摊到各业务组',
    '能明确到具体 SKU 的就分摊至 SKU，不能明确的可以选择 BU 全产品',
  ],
  period: [
    '按实际费用带来的受益期间填写摊销',
    '旗舰店建设费用可摊销 1 年',
    '租金等按照合同期间进行摊销',
  ],
  methods: [
    { name: '模板分摊', desc: '使用「项目」维度模板导入；报账信息行 → 导入 → 下载模板 → 填黄色必输项 → 上传 → 数据验证 → 数据导入' },
    { name: '手工分摊', desc: '选择维度（渠道 / 项目 / 品牌 / 成本中心）→ 分摊指标可随意填写 → 选择分摊因子组合并启用 → 校验系数总和' },
  ],
};

/* ============================================================
 * 七、供应商模式判定
 * ========================================================== */

export const VIRTUAL_VENDOR_THRESHOLD_EUR = 5000;

export type VendorMode = 'virtual' | 'standard';

export interface VendorDecision {
  mode: VendorMode;
  label: string;
  reasons: string[];
  requiredActions: string[];
}

export function decideVendorMode(amountEur: number, hasStandardContract: boolean): VendorDecision {
  const amountOk = amountEur > 0 && amountEur < VIRTUAL_VENDOR_THRESHOLD_EUR;
  const isVirtual = amountOk && !hasStandardContract;

  if (isVirtual) {
    return {
      mode: 'virtual',
      label: '虚拟供应商 + 虚拟合同',
      reasons: [
        `单笔金额 €${amountEur.toLocaleString('en-US', { minimumFractionDigits: 2 })} < €5,000`,
        '无标准合同，仅有报价单',
      ],
      requiredActions: [
        '使用对应公司主体下的虚拟供应商与虚拟合同',
        '发票报账流程中以报价单作为附件上传（无需走完整 SRM 建档）',
        '付款信息中的银行账户按 Invoice 手工填写',
        '适用范围目前仅限 PR & KOL & 零星采购；如有额外需求请联系区域财务 BP',
      ],
    };
  }

  return {
    mode: 'standard',
    label: '标准供应商（SRM 建档 + 合同申请）',
    reasons: [
      hasStandardContract
        ? '存在标准合同，不适用虚拟供应商'
        : `单笔金额 €${amountEur.toLocaleString('en-US', { minimumFractionDigits: 2 })} 未低于 €5,000 门槛`,
    ],
    requiredActions: [
      '在 SRM 系统建立供应商信息（写清服务商背景、引入用途）',
      '在 OA 申请合同（营销类合同必须关联营销服务申请）',
      '银行账户由 SRM 主数据自动带出',
    ],
  };
}

/* ============================================================
 * 八、高频差错（文档 3.5 重点检查 + 正文强调）
 * ========================================================== */

export const TOP_MISTAKES: { title: string; detail: string }[] = [
  { title: '预提与报账口径不一致', detail: '受益期、供应商、费用类型、分摊渠道四项在报账时必须与预提完全一致。' },
  { title: '预提金额算错', detail: '预提金额 = 项目总金额 ÷ 受益期，不是按发票金额平均。' },
  { title: '漏提交月度预提', detail: '没到报账月前，每个月都需提交，可复制上一期单据。' },
  { title: '报账时忘记关联预提', detail: '报账时必须关联该项目之前提交的所有月预提，未关联则不会计入费用。' },
  { title: '尾票提前核销', detail: '同项目多张票，最后一张票报账时再核销之前所有月预提。' },
  { title: '预付后未做核销报账', detail: '预付流程不涉及费用计入；收到发票后必须走发票报账并关联核销预付款，且实际待支付金额为 0。' },
  { title: '误开充值标志', detail: '点开充值标志后不会计入费用，一般业务不涉及充值。' },
  { title: '发票与报账金额/类型不符', detail: '发票模块的金额、发票类型必须与报账模块一致，否则系统直接报错。' },
  { title: '成本中心选错', detail: '营销费用必须是销售类成本中心，且成本中心公司主体需与报账主体一致。' },
  { title: '选择"全产品线"分摊', detail: '现在不允许选择全产品线，必须按 BU + 产品线 + 渠道明确分摊。' },
  { title: '不同活动合并成一张单据', detail: '不同主体、不同供应商的不同活动，需要分不同单据提交。' },
];

/* ============================================================
 * 九、下拉候选项（供表单使用）
 * ========================================================== */

export const PAYMENT_PURPOSES = ['采购款（费用）', '采购款（通用）'];

export const INVOICE_TYPES = ['形式发票', '增值税普通发票', '增值税专用发票', '商业发票', '其他'];

export const TAX_RATE_TYPES = ['0% 进项税', '6% 进项税', '9% 进项税', '13% 进项税', '无进项税'];

export const CURRENCIES = ['EUR', 'CNY', 'USD', 'CHF', 'GBP'];

export const PAYMENT_METHODS = ['电汇', '支票', '现金', '其他'];

export const PAYMENT_TERMS = ['立即支付', '月结30天', '月结60天', '按合同里程碑'];

/* ============================================================
 * 十、辅助函数
 * ========================================================== */

export function searchProjectCodes(keyword: string): ProjectCode[] {
  const kw = keyword.trim().toLowerCase();
  if (!kw) return PROJECT_CODES;
  return PROJECT_CODES.filter(
    (p) => p.code.toLowerCase().includes(kw) || p.desc.toLowerCase().includes(kw),
  );
}

export function searchChannels(keyword: string): ChannelCode[] {
  const kw = keyword.trim().toLowerCase();
  if (!kw) return CHANNEL_CODES;
  return CHANNEL_CODES.filter(
    (c) =>
      c.code.toLowerCase().includes(kw) ||
      c.text.toLowerCase().includes(kw) ||
      c.note.toLowerCase().includes(kw),
  );
}

export function findExpenseMapping(subCategory: string): ExpenseMapping | undefined {
  return EXPENSE_MAPPINGS.find((m) => m.subCategory === subCategory);
}

export const DEFAULT_BRAND: 'DREAME' | 'MOVA' = 'DREAME';
