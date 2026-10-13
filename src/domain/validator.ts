/**
 * 西南欧营销费用申请 · 校验器
 *
 * 输入：前端表单收集到的字段
 * 输出：按 P0 / P1 / P2 分级的提示 + 阻止提交的 blocking 列表
 *
 * 设计原则：只校验文档中明确写出的规则，不臆造业务判断。
 */

import { ACCRUAL_AUDIT, EXPENSE_AUDIT, HEADER_AUDIT, PAYMENT_AUDIT, VIRTUAL_VENDOR_THRESHOLD_EUR } from './southwestEurope';

export type Severity = 'P0' | 'P1' | 'P2';

export interface Issue {
  severity: Severity;
  field: string;
  message: string;
}

export interface VendorForm {
  companyEntity: string;
  currency: string;
  vendorMode: 'virtual' | 'standard';
  amountExclTax: number;
  taxRate: number;
  amountInclTax: number;
  netVendorAccount: string;
}

export interface HeaderForm {
  accountingEntity: string;
  currency: string;
  amortization: boolean;
  amortizeStart: string;
  amortizeEnd: string;
  isRecharge: boolean;
  rechargeWarningAck: boolean;
}

export interface ExpenseForm {
  bizType: string;
  subCategory: string;
  invoiceType: string;
  taxRateType: string;
  period: string;
  costCenter: string;
  costCenterType: 'sales' | 'management' | 'other' | '';
  projectCodes: string[];
  channels: string[];
  allocatedBySku: boolean;
  allocationSum: number;
}

export interface PaymentForm {
  payAmount: number;
  bankAccount: string;
  paymentPurpose: string;
  payMethod: string;
  planPayDate: string;
  paymentTerms: string;
  deferredPayment: boolean;
  linkedAccruals: string[];
}

export interface InvoiceForm {
  invoiceAmountInclTax: number;
  invoiceType: string;
  hasAttachment: boolean;
}

export interface AccrualForm {
  enabled: boolean;
  accrualPeriods: string[];
  benefitPeriods: number;
  totalProjectAmount: number;
  monthlyAccrualAmount: number;
  varianceFromPreAccrual: string;
  linkedPreviousAccruals: string[];
  isFinalInvoice: boolean;
}

export interface ApplicationForm {
  vendor: VendorForm;
  header: HeaderForm;
  expense: ExpenseForm;
  payment: PaymentForm;
  invoice: InvoiceForm;
  accrual: AccrualForm;
  otherPayerSameEntity: boolean;
}

export interface ValidationResult {
  issues: Issue[];
  blockings: Issue[];
  warnings: Issue[];
  hints: Issue[];
  score: number;
}

const round2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;

export function validate(form: ApplicationForm): ValidationResult {
  const issues: Issue[] = [];
  const push = (severity: Severity, field: string, message: string) =>
    issues.push({ severity, field, message });

  const { vendor, header, expense, payment, invoice, accrual } = form;

  /* ---------- A. 供应商 / 主体 / 币种 ---------- */

  if (!vendor.companyEntity.trim()) {
    push('P0', '付款公司', '未填写付款公司（核算主体），无法与合同主体比对。');
  }

  const virtual = vendor.amountInclTax > 0 && vendor.amountInclTax < VIRTUAL_VENDOR_THRESHOLD_EUR;
  if (virtual && vendor.vendorMode === 'standard') {
    push('P1', '供应商模式', `单笔金额低于 €${VIRTUAL_VENDOR_THRESHOLD_EUR}，且若无标准合同可走虚拟供应商，请确认是否仍需 SRM 建档。`);
  }
  if (!virtual && vendor.vendorMode === 'virtual') {
    push('P0', '供应商模式', `金额未低于 €${VIRTUAL_VENDOR_THRESHOLD_EUR}，不符合虚拟供应商定义，必须走 SRM 建档 + 合同申请。`);
  }
  if (vendor.vendorMode === 'virtual' && !vendor.netVendorAccount.trim()) {
    push('P0', '银行账户', '虚拟供应商需按 Invoice 上的账户信息手工填写银行账户。');
  }

  if (!header.accountingEntity.trim()) {
    push('P0', '核算主体', '核算主体为空，需与合同主体保持一致。');
  } else if (vendor.companyEntity === header.accountingEntity) {
    // 结构上一致，无需提示
  } else if (!header.accountingEntity || !vendor.companyEntity) {
    // 缺一项时不重复报错
  } else {
    push('P1', '核算主体', `核算主体（${header.accountingEntity}）与付款公司（${vendor.companyEntity}）不一致，请确认是否属于同一合同主体。`);
  }

  if (vendor.currency !== header.currency) {
    push('P0', '币种', `付款币种（${vendor.currency}）与报账币种（${header.currency}）不一致，需与形式发票、合同币种统一。`);
  }

  /* ---------- B. 表头审核点 ---------- */

  if (header.isRecharge) {
    push('P0', '是否充值', '已勾选「充值」标志 —— 充值不会计入费用。一般业务不涉及充值，请确认，特殊情况联系区域财务 BP。');
  }

  if (header.amortization) {
    if (!header.amortizeStart || !header.amortizeEnd) {
      push('P1', '摊销期间', '已开启摊销标志，但未填写开始 / 结束期间。');
    } else if (header.amortizeStart > header.amortizeEnd) {
      push('P0', '摊销期间', '摊销开始期间晚于结束期间，期间填写有误。');
    }
  }

  /* ---------- C. 报账信息 ---------- */

  if (!expense.bizType) push('P0', '业务类型', '未选择业务类型。');
  if (!expense.subCategory) push('P0', '费用小类', '未选择费用小类。');

  if (!expense.invoiceType) push('P0', '发票种类', '未选择发票种类。');
  if (!expense.taxRateType) push('P1', '税率类型', '未选择税率类型。形式发票为 0%，其他按发票确认。');

  if (expense.invoiceType === '形式发票' && expense.taxRateType && !expense.taxRateType.startsWith('0%')) {
    push('P1', '税率类型', '发票种类为「形式发票」时税率类型应为 0%，请核对。');
  }

  if (!expense.costCenter.trim()) {
    push('P0', '成本中心', '成本中心为空。营销费用类报账必须是销售类成本中心，且公司主体需与报账主体一致。');
  } else if (expense.costCenterType && expense.costCenterType !== 'sales') {
    push('P0', '成本中心', '营销费用类报账必须使用销售类成本中心，当前选择的成本中心类型非销售类。');
  }

  /* ---------- D. 分摊 ---------- */

  if (expense.projectCodes.length === 0) {
    push('P0', '项目号分摊', '未选择项目号。所有费用都必须按 BU 和产品线分摊，不允许选择"全产品线"。');
  }
  if (expense.projectCodes.length === 1 && expense.projectCodes[0] === 'ALL') {
    push('P0', '项目号分摊', '选择了「全产品线」，当前已被禁止。请明确到具体 BU / 产品线，能明确到 SKU 的分摊至 SKU。');
  }
  if (expense.channels.length === 0) {
    push('P0', '渠道分摊', '未选择渠道。所有费用必须根据渠道明确分摊到各业务组。');
  }
  if (expense.channels.length === 1 && expense.channels[0] === '857') {
    push('P1', '渠道分摊', '渠道选择了「西南欧全渠道」兜底项，仅在所有渠道和平台共同受益时使用，请确认。');
  }
  if (expense.allocationSum <= 0) {
    push('P0', '分摊系数', '分摊系数之和为 0，无法完成分摊计算。');
  }

  /* ---------- E. 金额勾稽 ---------- */

  const expectedIncl = round2(vendor.amountExclTax * (1 + (vendor.taxRate || 0) / 100));
  if (vendor.amountExclTax > 0 && Math.abs(expectedIncl - round2(vendor.amountInclTax)) > 0.02) {
    push('P1', '金额勾稽', `不含税 €${round2(vendor.amountExclTax)} × (1+${vendor.taxRate}%) = €${expectedIncl}，与填写的含税金额 €${round2(vendor.amountInclTax)} 不符。`);
  }
  if (round2(payment.payAmount) !== round2(vendor.amountInclTax)) {
    push('P0', '付款金额', `付款金额 €${round2(payment.payAmount)} 与报账含税金额 €${round2(vendor.amountInclTax)} 不一致。付款金额应等于本次报账金额。`);
  }

  /* ---------- F. 付款信息 ---------- */

  if (!payment.bankAccount.trim()) {
    push('P0', '银行账户', '银行账户为空。SRM 已建档供应商应自动带出，虚拟供应商按 Invoice 填写。');
  }
  if (!payment.paymentPurpose) {
    push('P0', '付款用途', '未选择付款用途。所有营销费用统一选择「采购款（费用）」。');
  } else if (payment.paymentPurpose !== '采购款（费用）') {
    push('P0', '付款用途', `付款用途当前为「${payment.paymentPurpose}」，营销费用应统一选择「采购款（费用）」。`);
  }
  if (!payment.payMethod) push('P2', '付款方式', '未填写付款方式。');
  if (!payment.planPayDate) push('P1', '计划付款日期', '未填写计划付款日期。');
  if (!payment.paymentTerms) push('P1', '付款条件', '付款条件通常由 SAP 供应商主数据带出，请核对。');
  if (payment.deferredPayment && payment.linkedAccruals.length > 0) {
    push('P1', '付款信息', '同时勾选了「延后支付」并关联了预提，请确认本次是否只报账不付款。');
  }

  /* ---------- G. 发票信息 ---------- */

  if (round2(invoice.invoiceAmountInclTax) !== round2(vendor.amountInclTax)) {
    push('P0', '发票金额', `发票模块含税金额 €${round2(invoice.invoiceAmountInclTax)} 与报账模块 €${round2(vendor.amountInclTax)} 不一致，系统会直接报错。`);
  }
  if (invoice.invoiceType !== expense.invoiceType) {
    push('P0', '发票类型', `发票模块类型「${invoice.invoiceType}」与报账模块「${expense.invoiceType}」不一致，系统会直接报错。`);
  }

  /* ---------- H. 附件 ---------- */

  if (!invoice.hasAttachment) {
    push('P0', '附件', '未上传审批所需交付文件与发票附件。虚拟供应商场景需以报价单作为附件。');
  }

  /* ---------- I. 预提一致性 ---------- */

  if (accrual.enabled) {
    if (accrual.benefitPeriods <= 0) {
      push('P0', '受益期', '受益期必须大于 0。');
    } else {
      const expectedMonthly = round2(accrual.totalProjectAmount / accrual.benefitPeriods);
      if (accrual.totalProjectAmount > 0 && Math.abs(expectedMonthly - round2(accrual.monthlyAccrualAmount)) > 0.02) {
        push('P0', '预提金额', `预提金额 = 项目总金额 ÷ 受益期 = €${expectedMonthly}，与填写值 €${round2(accrual.monthlyAccrualAmount)} 不符。`);
      }
    }

    if (!accrual.varianceFromPreAccrual) {
      push('P0', '预提口径', '未确认受益期 / 供应商 / 费用类型 / 分摊渠道与预提时是否一致。报账时这四项必须与预提完全一致。');
    } else if (accrual.varianceFromPreAccrual !== '一致') {
      push('P0', '预提口径', `报账口径与预提存在差异（${accrual.varianceFromPreAccrual}），必须改回与预提一致。`);
    }

    const expectedPeriodCount = accrual.benefitPeriods || 0;
    if (expectedPeriodCount && accrual.accrualPeriods.length < expectedPeriodCount && !accrual.isFinalInvoice) {
      push('P1', '预提次数', `受益期 ${expectedPeriodCount} 期，当前仅登记 ${accrual.accrualPeriods.length} 期预提。未到报账月前每月都需提交。`);
    }

    if (accrual.isFinalInvoice && accrual.linkedPreviousAccruals.length === 0) {
      push('P0', '关联预提', '本单标记为尾票，但未关联之前提交的项目月预提。尾票报账时需核销之前所有月预提。');
    }
    if (!accrual.isFinalInvoice && accrual.linkedPreviousAccruals.length > 0) {
      push('P1', '关联预提', '非尾票却关联了往期预提，同项目多张票应在最后一张票报账时再核销。');
    }
  } else {
    if (accrual.benefitPeriods > 1) {
      push('P1', '预提', `受益期为 ${accrual.benefitPeriods} 期，属于跨期费用，请确认是否需要逐月提交费用预提流程。`);
    }
  }

  /* ---------- J. 预付款 ---------- */

  if (form.otherPayerSameEntity && payment.deferredPayment === false && payment.payAmount === 0) {
    push('P1', '付款金额', '付款金额为 0，如为预付款核销请确认实际待支付金额确实为 0。');
  }

  /* ---------- 汇总 ---------- */

  const blockings = issues.filter((i) => i.severity === 'P0');
  const warnings = issues.filter((i) => i.severity === 'P1');
  const hints = issues.filter((i) => i.severity === 'P2');

  const score = Math.max(0, 100 - blockings.length * 12 - warnings.length * 4 - hints.length * 1);

  return { issues, blockings, warnings, hints, score };
}

/** 返回供 UI 展示的静态审核清单 */
export function auditChecklist() {
  return {
    header: HEADER_AUDIT,
    expense: EXPENSE_AUDIT,
    payment: PAYMENT_AUDIT,
    accrual: ACCRUAL_AUDIT,
  };
}
