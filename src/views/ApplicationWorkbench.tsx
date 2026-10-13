import { useCallback, useMemo, useState } from 'react';
import { Input, Select, Switch, Textarea, Tooltip } from 'tdesign-react';
import {
  AddIcon,
  DeleteIcon,
  CheckCircleFilledIcon,
  ErrorCircleFilledIcon,
  InfoCircleFilledIcon,
  CopyIcon,
  RefreshIcon,
} from 'tdesign-icons-react';
import {
  CHANNEL_CODES,
  EXPENSE_MAPPINGS,
  INVOICE_TYPES,
  PAYMENT_METHODS,
  PAYMENT_PURPOSES,
  PAYMENT_TERMS,
  PROJECT_CODES,
  TAX_RATE_TYPES,
  VIRTUAL_VENDOR_THRESHOLD_EUR,
} from '../domain/southwestEurope';
import {
  type ApplicationForm,
  validate,
  type Issue,
} from '../domain/validator';

const round2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;
const fmt = (n: number, cur = 'EUR') =>
  `${cur === 'EUR' ? '€' : cur + ' '}${round2(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const initialForm = (): ApplicationForm => ({
  vendor: {
    companyEntity: '',
    currency: 'EUR',
    vendorMode: 'standard',
    amountExclTax: 0,
    taxRate: 0,
    amountInclTax: 0,
    netVendorAccount: '',
  },
  header: {
    accountingEntity: '',
    currency: 'EUR',
    amortization: false,
    amortizeStart: '',
    amortizeEnd: '',
    isRecharge: false,
    rechargeWarningAck: false,
  },
  expense: {
    bizType: '',
    subCategory: '',
    invoiceType: '',
    taxRateType: '',
    period: '',
    costCenter: '',
    costCenterType: '',
    projectCodes: [],
    channels: [],
    allocatedBySku: false,
    allocationSum: 0,
  },
  payment: {
    payAmount: 0,
    bankAccount: '',
    paymentPurpose: '采购款（费用）',
    payMethod: '电汇',
    planPayDate: '',
    paymentTerms: '',
    deferredPayment: false,
    linkedAccruals: [],
  },
  invoice: {
    invoiceAmountInclTax: 0,
    invoiceType: '',
    hasAttachment: false,
  },
  accrual: {
    enabled: false,
    accrualPeriods: [],
    benefitPeriods: 0,
    totalProjectAmount: 0,
    monthlyAccrualAmount: 0,
    varianceFromPreAccrual: '',
    linkedPreviousAccruals: [],
    isFinalInvoice: false,
  },
  otherPayerSameEntity: true,
});

type SectionKey = 'vendor' | 'header' | 'expense' | 'payment' | 'invoice' | 'accrual';

const SECTIONS: { key: SectionKey; label: string; hint: string }[] = [
  { key: 'vendor', label: '供应商与金额', hint: '供应商模式 / 币种 / 金额勾稽' },
  { key: 'header', label: '表头模块', hint: '核算主体 / 摊销 / 充值标志' },
  { key: 'expense', label: '报账信息', hint: '费用小类 / 成本中心 / 分摊' },
  { key: 'payment', label: '付款信息', hint: '付款用途 / 账户 / 关联预提' },
  { key: 'invoice', label: '发票信息', hint: '金额与类型必须与报账一致' },
  { key: 'accrual', label: '预提与核销', hint: '受益期 / 预提金额 / 尾票核销' },
];

/* ============================================================
 * 小组件
 * ========================================================== */

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[12.5px] mb-1.5" style={{ color: 'var(--ink-400)' }}>
      {children}
      {required && <span style={{ color: 'var(--gold-500)' }}> *</span>}
    </label>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <Label required={required}>{label}</Label>
        {hint && (
          <Tooltip content={hint} placement="top">
            <span style={{ color: 'var(--ink-500)', cursor: 'help', marginBottom: 6 }}>
              <InfoCircleFilledIcon size={12} />
            </span>
          </Tooltip>
        )}
      </div>
      {children}
    </div>
  );
}

function Card({
  title,
  subtitle,
  active,
  children,
}: {
  title: string;
  subtitle?: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`rok-card p-5 ${active ? 'rok-card--active' : ''}`}>
      <div className="mb-4">
        <h3 className="text-[14.5px] font-semibold" style={{ color: 'var(--ink-100)' }}>
          {title}
        </h3>
        {subtitle && (
          <p className="text-[12.5px] mt-1" style={{ color: 'var(--ink-500)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

/* 多选：pill 选择器 */
function PillMultiSelect({
  options,
  value,
  onChange,
  searchPlaceholder,
}: {
  options: { value: string; label: string; sub?: string }[];
  value: string[];
  onChange: (v: string[]) => void;
  searchPlaceholder?: string;
}) {
  const [kw, setKw] = useState('');
  const list = useMemo(() => {
    const k = kw.trim().toLowerCase();
    if (!k) return options.slice(0, 200);
    return options
      .filter(
        (o) =>
          o.value.toLowerCase().includes(k) ||
          o.label.toLowerCase().includes(k) ||
          (o.sub || '').toLowerCase().includes(k),
      )
      .slice(0, 200);
  }, [options, kw]);

  const toggle = (v: string) => {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  };

  return (
    <div>
      <Input
        value={kw}
        onChange={(v) => setKw(v as string)}
        placeholder={searchPlaceholder || '搜索后点击选择'}
        size="small"
        clearable
      />
      <div
        className="mt-2 flex flex-wrap gap-1.5 max-h-[176px] overflow-y-auto p-2 rounded-[14px]"
        style={{ background: 'rgba(4,16,26,.4)', border: '1px solid var(--hairline)' }}
      >
        {list.map((o) => {
          const on = value.includes(o.value);
          return (
            <button
              key={o.value}
              onClick={() => toggle(o.value)}
              title={o.sub}
              className="px-2.5 py-1 rounded-[8px] text-[12px] transition-all text-left"
              style={{
                background: on ? 'rgba(232,162,74,.16)' : 'var(--surface-elev)',
                border: `1px solid ${on ? 'rgba(232,162,74,.42)' : 'var(--hairline)'}`,
                color: on ? 'var(--gold-400)' : 'var(--ink-300)',
              }}
            >
              {o.label}
            </button>
          );
        })}
        {list.length === 0 && (
          <span className="text-[12.5px] px-2 py-1" style={{ color: 'var(--ink-500)' }}>
            无匹配项
          </span>
        )}
      </div>
      {value.length > 0 && (
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span className="text-[12px]" style={{ color: 'var(--ink-500)' }}>
            已选 {value.length}:
          </span>
          {value.slice(0, 8).map((v) => (
            <span key={v} className="rok-pill rok-pill--gold">
              {v}
              <button onClick={() => toggle(v)} style={{ color: 'inherit', lineHeight: 1 }}>
                ×
              </button>
            </span>
          ))}
          {value.length > 8 && (
            <span className="text-[12px]" style={{ color: 'var(--ink-500)' }}>
              +{value.length - 8}
            </span>
          )}
          <button
            className="text-[12px] underline"
            style={{ color: 'var(--ink-400)' }}
            onClick={() => onChange([])}
          >
            清空
          </button>
        </div>
      )}
    </div>
  );
}

/* 标签输入：预提期间 / 关联预提 */
function TagInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const t = draft.trim();
    if (!t) return;
    if (!value.includes(t)) onChange([...value, t]);
    setDraft('');
  };
  return (
    <div>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(v) => setDraft(v as string)}
          onEnter={add}
          placeholder={placeholder}
          size="small"
        />
        <button
          className="px-3 rounded-[14px] text-[12.5px] shrink-0"
          style={{
            background: 'var(--surface-elev)',
            border: '1px solid var(--hairline)',
            color: 'var(--ink-200)',
          }}
          onClick={add}
        >
          添加
        </button>
      </div>
      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {value.map((v) => (
            <span key={v} className="rok-pill rok-pill--muted">
              {v}
              <button
                onClick={() => onChange(value.filter((x) => x !== v))}
                style={{ color: 'inherit', lineHeight: 1 }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* Skeleton / Empty */
function Nothing({ text }: { text: string }) {
  return (
    <div className="py-8 text-center text-[13px]" style={{ color: 'var(--ink-500)' }}>
      {text}
    </div>
  );
}

/* ============================================================
 * 校验面板
 * ========================================================== */

function IssueRow({ issue }: { issue: Issue }) {
  const conf = {
    P0: { icon: ErrorCircleFilledIcon, color: 'var(--danger)', label: 'P0 · 阻断', pill: 'rok-pill rok-pill--danger' },
    P1: { icon: InfoCircleFilledIcon, color: 'var(--warn)', label: 'P1 · 需确认', pill: 'rok-pill rok-pill--warn' },
    P2: { icon: InfoCircleFilledIcon, color: 'var(--ink-400)', label: 'P2 · 提示', pill: 'rok-pill rok-pill--muted' },
  }[issue.severity];
  const Icon = conf.icon;
  return (
    <div
      className="flex gap-2.5 px-3.5 py-2.5 rounded-[14px]"
      style={{ background: 'var(--surface-elev)', border: '1px solid var(--hairline)' }}
    >
      <Icon size={15} style={{ color: conf.color, flexShrink: 0, marginTop: 1 }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className={conf.pill}>{conf.label}</span>
          <span className="text-[12.5px] font-medium" style={{ color: 'var(--ink-200)' }}>
            {issue.field}
          </span>
        </div>
        <div className="text-[12.5px] leading-relaxed" style={{ color: 'var(--ink-300)' }}>
          {issue.message}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 * 主表单
 * ========================================================== */

/** 无后端环境下的兜底：把填报摘要导出为 .txt 文件 */
function downloadSummary(text: string) {
  try {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `西南欧营销费用_填报摘要_${stamp}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch {
    /* 忽略：极端环境不支持 Blob 下载时，用户仍可用「复制」 */
  }
}

export function ApplicationWorkbench({
  onSendToAgent,
}: {
  onSendToAgent?: (text: string) => void;
}) {
  const [form, setForm] = useState<ApplicationForm>(initialForm);
  const [section, setSection] = useState<SectionKey>('vendor');

  const set = useCallback(
    <K extends keyof ApplicationForm>(key: K, patch: Partial<ApplicationForm[K]>) => {
      setForm((prev) => {
        const merged = { ...(prev[key] as object), ...(patch as object) } as ApplicationForm[K];
        return { ...prev, [key]: merged };
      });
    },
    [],
  );

  const result = useMemo(() => validate(form), [form]);

  /* 自动勾稽：金额 */
  const expectedIncl = round2(form.vendor.amountExclTax * (1 + (form.vendor.taxRate || 0) / 100));
  const autoAmountIncl = form.vendor.amountExclTax > 0 ? expectedIncl : 0;

  /* 自动预提金额 */
  const autoMonthly =
    form.accrual.totalProjectAmount > 0 && form.accrual.benefitPeriods > 0
      ? round2(form.accrual.totalProjectAmount / form.accrual.benefitPeriods)
      : 0;

  /* 供应商模式建议 */
  const suggestedVirtual = form.vendor.amountInclTax > 0 && form.vendor.amountInclTax < VIRTUAL_VENDOR_THRESHOLD_EUR;

  const reset = () => setForm(initialForm());

  const fillDemo = () => {
    setForm({
      vendor: {
        companyEntity: '追觅国际（香港）有限公司',
        currency: 'EUR',
        vendorMode: 'standard',
        amountExclTax: 6500,
        taxRate: 0,
        amountInclTax: 6500,
        netVendorAccount: 'DE89 3704 0044 0532 0130 00',
      },
      header: {
        accountingEntity: '追觅国际（香港）有限公司',
        currency: 'EUR',
        amortization: true,
        amortizeStart: '2025-08',
        amortizeEnd: '2025-10',
        isRecharge: false,
        rechargeWarningAck: false,
      },
      expense: {
        bizType: '站外推广',
        subCategory: 'KOL投入',
        invoiceType: '形式发票',
        taxRateType: '0% 进项税',
        period: '2025-10',
        costCenter: '1500075001 - 销售-西南欧',
        costCenterType: 'sales',
        projectCodes: ['RO001'],
        channels: ['Z16'],
        allocatedBySku: false,
        allocationSum: 100,
      },
      payment: {
        payAmount: 6500,
        bankAccount: 'DE89 3704 0044 0532 0130 00',
        paymentPurpose: '采购款（费用）',
        payMethod: '电汇',
        planPayDate: '2025-10-20',
        paymentTerms: '立即支付',
        deferredPayment: false,
        linkedAccruals: ['YY2025080123', 'YY2025090124'],
      },
      invoice: {
        invoiceAmountInclTax: 6500,
        invoiceType: '形式发票',
        hasAttachment: true,
      },
      accrual: {
        enabled: true,
        accrualPeriods: ['2025-08', '2025-09'],
        benefitPeriods: 3,
        totalProjectAmount: 19500,
        monthlyAccrualAmount: 6500,
        varianceFromPreAccrual: '一致',
        linkedPreviousAccruals: ['YY2025080123', 'YY2025090124'],
        isFinalInvoice: true,
      },
      otherPayerSameEntity: true,
    });
  };

  /* 生成提交摘要 */
  const summary = useMemo(() => {
    const lines: string[] = [];
    lines.push('【西南欧营销费用报账 · 填报摘要】');
    lines.push('');
    lines.push('■ 供应商与金额');
    lines.push(`· 付款公司：${form.vendor.companyEntity || '—'}`);
    lines.push(`· 币种：${form.vendor.currency}`);
    lines.push(`· 供应商模式：${form.vendor.vendorMode === 'virtual' ? '虚拟供应商 + 虚拟合同' : '标准供应商（SRM + 合同）'}`);
    lines.push(`· 不含税金额：${fmt(form.vendor.amountExclTax, form.vendor.currency)}`);
    lines.push(`· 税率：${form.vendor.taxRate}%（${form.expense.taxRateType || '—'}）`);
    lines.push(`· 含税金额：${fmt(form.vendor.amountInclTax, form.vendor.currency)}`);
    lines.push('');
    lines.push('■ 表头模块');
    lines.push(`· 核算主体：${form.header.accountingEntity || '—'}`);
    lines.push(`· 摊销标志：${form.header.amortization ? `是（${form.header.amortizeStart || '—'} ~ ${form.header.amortizeEnd || '—'}）` : '否'}`);
    lines.push(`· 是否充值：${form.header.isRecharge ? '是' : '否'}`);
    lines.push('');
    lines.push('■ 报账信息');
    lines.push(`· 业务类型 / 费用小类：${form.expense.bizType || '—'} / ${form.expense.subCategory || '—'}`);
    const mid = EXPENSE_MAPPINGS.find((m) => m.subCategory === form.expense.subCategory);
    lines.push(`· 中台费用类型：${mid?.midPlatform || '—'}`);
    lines.push(`· 发票种类 / 税率类型：${form.expense.invoiceType || '—'} / ${form.expense.taxRateType || '—'}`);
    lines.push(`· 期间：${form.expense.period || '—'}`);
    lines.push(`· 成本中心：${form.expense.costCenter || '—'}`);
    lines.push(`· 项目号：${form.expense.projectCodes.join('、') || '—'}`);
    lines.push(`· 渠道：${form.expense.channels.join('、') || '—'}`);
    lines.push(`· 分摊系数合计：${form.expense.allocationSum}`);
    lines.push('');
    lines.push('■ 付款信息');
    lines.push(`· 付款金额：${fmt(form.payment.payAmount, form.vendor.currency)}`);
    lines.push(`· 银行账户：${form.payment.bankAccount || '—'}`);
    lines.push(`· 付款用途：${form.payment.paymentPurpose || '—'}`);
    lines.push(`· 付款方式 / 计划付款日期：${form.payment.payMethod || '—'} / ${form.payment.planPayDate || '—'}`);
    lines.push(`· 付款条件：${form.payment.paymentTerms || '—'}`);
    lines.push(`· 延后支付：${form.payment.deferredPayment ? '是' : '否'}`);
    lines.push(`· 关联预提：${form.payment.linkedAccruals.join('、') || '—'}`);
    lines.push('');
    lines.push('■ 发票信息');
    lines.push(`· 发票含税金额：${fmt(form.invoice.invoiceAmountInclTax, form.vendor.currency)}`);
    lines.push(`· 发票类型：${form.invoice.invoiceType || '—'}`);
    lines.push(`· 附件：${form.invoice.hasAttachment ? '已上传审批文件与发票' : '未上传'}`);
    lines.push('');
    lines.push('■ 预提与核销');
    if (form.accrual.enabled) {
      lines.push(`· 受益期：${form.accrual.benefitPeriods} 期`);
      lines.push(`· 项目总金额：${fmt(form.accrual.totalProjectAmount, form.vendor.currency)}`);
      lines.push(`· 月度预提金额：${fmt(form.accrual.monthlyAccrualAmount, form.vendor.currency)}`);
      lines.push(`· 已提交预提期间：${form.accrual.accrualPeriods.join('、') || '—'}`);
      lines.push(`· 与预提口径：${form.accrual.varianceFromPreAccrual || '—'}`);
      lines.push(`· 是否尾票：${form.accrual.isFinalInvoice ? '是（需核销之前所有月预提）' : '否'}`);
    } else {
      lines.push('· 本次不涉及预提');
    }
    lines.push('');
    lines.push('■ 填报自检');
    lines.push(`· 合规分：${result.score} / 100`);
    lines.push(`· P0 阻断：${result.blockings.length} 项`);
    lines.push(`· P1 待确认：${result.warnings.length} 项`);
    lines.push(`· P2 提示：${result.hints.length} 项`);
    if (result.blockings.length) {
      lines.push('');
      lines.push('■ P0 阻断明细');
      result.blockings.forEach((b, i) => lines.push(`${i + 1}. [${b.field}] ${b.message}`));
    }
    if (result.warnings.length) {
      lines.push('');
      lines.push('■ P1 待确认明细');
      result.warnings.forEach((w, i) => lines.push(`${i + 1}. [${w.field}] ${w.message}`));
    }
    lines.push('');
    lines.push('请按上述内容逐项复核，并给出需要修正的字段清单。');
    return lines.join('\n');
  }, [form, result]);

  const copySummary = () => {
    navigator.clipboard?.writeText(summary);
  };

  return (
    <div className="space-y-4">
      {/* 顶部操作条 */}
      <div className="rok-card px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="rok-pill rok-pill--gold">填报工作台</span>
          <span className="text-[12.5px]" style={{ color: 'var(--ink-400)' }}>
            所有字段按财务中台实际页面组织，填完即出校验结果
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="rok-btn-ghost" style={{ minHeight: 34, padding: '0 14px', fontSize: 12.5 }} onClick={fillDemo}>
            填充示例
          </button>
          <button
            className="rok-btn-ghost"
            style={{ minHeight: 34, padding: '0 14px', fontSize: 12.5 }}
            onClick={reset}
          >
            <RefreshIcon size={13} /> 重置
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_1fr] gap-4 items-start">
        {/* 左：表单 */}
        <div className="space-y-4">
          {/* 分区导航 */}
          <div className="rok-seg flex-wrap">
            {SECTIONS.map((s) => {
              const n = result.issues.filter((i) => belongsTo(i, s.key)).length;
              return (
                <button
                  key={s.key}
                  className={`rok-seg__item ${section === s.key ? 'is-active' : ''}`}
                  onClick={() => setSection(s.key)}
                >
                  {s.label}
                  {n > 0 && (
                    <span
                      className="ml-1.5 rok-mono"
                      style={{ color: n > 0 ? 'var(--gold-500)' : 'inherit', fontSize: 11 }}
                    >
                      {n}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* 供应商与金额 */}
          {section === 'vendor' && (
            <Card title="供应商与金额" subtitle="单笔 < €5,000 且无标准合同时可用虚拟供应商" active>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="付款公司（核算主体）" required hint="需与合同主体保持一致">
                  <Input
                    value={form.vendor.companyEntity}
                    onChange={(v) => set('vendor', { companyEntity: v as string })}
                    placeholder="如：追觅国际（香港）有限公司"
                  />
                </Field>
                <Field label="币种" required hint="需与形式发票、合同币种一致">
                  <Select
                    value={form.vendor.currency}
                    onChange={(v) => set('vendor', { currency: v as string })}
                    options={['EUR', 'CNY', 'USD', 'CHF', 'GBP'].map((c) => ({ label: c, value: c }))}
                  />
                </Field>

                <Field
                  label="供应商模式"
                  required
                  hint="虚拟供应商：单笔 < €5,000 且无标准合同、仅有报价单，目前仅限 PR & KOL & 零星采购"
                >
                  <div className="rok-seg">
                    {(
                      [
                        { v: 'standard', l: '标准供应商' },
                        { v: 'virtual', l: '虚拟供应商' },
                      ] as const
                    ).map((o) => (
                      <button
                        key={o.v}
                        className={`rok-seg__item ${form.vendor.vendorMode === o.v ? 'is-active' : ''}`}
                        onClick={() => set('vendor', { vendorMode: o.v })}
                      >
                        {o.l}
                      </button>
                    ))}
                  </div>
                  {suggestedVirtual && form.vendor.vendorMode === 'standard' && (
                    <p className="text-[12px] mt-2" style={{ color: 'var(--gold-400)' }}>
                      金额低于 €{VIRTUAL_VENDOR_THRESHOLD_EUR}，若无标准合同可考虑虚拟供应商
                    </p>
                  )}
                </Field>
                <Field label="付款方式">
                  <Select
                    value={form.payment.payMethod}
                    onChange={(v) => set('payment', { payMethod: v as string })}
                    options={PAYMENT_METHODS.map((m) => ({ label: m, value: m }))}
                  />
                </Field>

                <Field label="不含税金额" required>
                  <Input
                    type="number"
                    value={String(form.vendor.amountExclTax || '')}
                    onChange={(v) => {
                      const n = Number(v) || 0;
                      const incl = round2(n * (1 + (form.vendor.taxRate || 0) / 100));
                      set('vendor', { amountExclTax: n, amountInclTax: incl });
                      set('payment', { payAmount: incl });
                      set('invoice', { invoiceAmountInclTax: incl });
                    }}
                    placeholder="0.00"
                  />
                </Field>
                <Field label="税率 %" hint="形式发票为 0%">
                  <Input
                    type="number"
                    value={String(form.vendor.taxRate ?? '')}
                    onChange={(v) => {
                      const r = Number(v) || 0;
                      const incl = round2(form.vendor.amountExclTax * (1 + r / 100));
                      set('vendor', { taxRate: r, amountInclTax: incl });
                      set('payment', { payAmount: incl });
                      set('invoice', { invoiceAmountInclTax: incl });
                    }}
                    placeholder="0"
                  />
                </Field>

                <Field label="含税金额（= 不含税 × (1+税率)）" required hint="需与合同、PI 币别金额一致">
                  <Input
                    type="number"
                    value={String(form.vendor.amountInclTax || '')}
                    onChange={(v) => {
                      const n = Number(v) || 0;
                      set('vendor', { amountInclTax: n });
                      set('payment', { payAmount: n });
                      set('invoice', { invoiceAmountInclTax: n });
                    }}
                    placeholder="0.00"
                  />
                  {autoAmountIncl > 0 && (
                    <p className="text-[12px] mt-1.5" style={{ color: 'var(--mist-400)' }}>
                      自动勾稽：€{round2(form.vendor.amountExclTax).toLocaleString('en-US')} × (1+
                      {form.vendor.taxRate}%) = €{autoAmountIncl.toLocaleString('en-US')}
                    </p>
                  )}
                </Field>
                <Field label="收款方银行账户" hint="虚拟供应商按 Invoice 手工填写；标准供应商由 SRM 自动带出">
                  <Input
                    value={form.vendor.netVendorAccount || form.payment.bankAccount}
                    onChange={(v) => {
                      set('vendor', { netVendorAccount: v as string });
                      set('payment', { bankAccount: v as string });
                    }}
                    placeholder="IBAN / 账户号"
                  />
                </Field>
              </div>
            </Card>
          )}

          {/* 表头模块 */}
          {section === 'header' && (
            <Card title="表头模块" subtitle="核算主体 · 币种 · 摊销期间 · 充值标志" active>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="核算主体" required hint="需与合同主体保持一致">
                  <Input
                    value={form.header.accountingEntity}
                    onChange={(v) => set('header', { accountingEntity: v as string })}
                    placeholder="如：追觅国际（香港）有限公司"
                  />
                </Field>
                <Field label="报账币种" required hint="检查与形式发票、合同币种一致性">
                  <Select
                    value={form.header.currency}
                    onChange={(v) => set('header', { currency: v as string })}
                    options={['EUR', 'CNY', 'USD', 'CHF', 'GBP'].map((c) => ({ label: c, value: c }))}
                  />
                </Field>
                <Field label="摊销开始期间">
                  <Input
                    value={form.header.amortizeStart}
                    onChange={(v) => set('header', { amortizeStart: v as string })}
                    placeholder="YYYY-MM"
                    disabled={!form.header.amortization}
                  />
                </Field>
                <Field label="摊销结束期间" hint="与实际受益期间一致；旗舰店建设费用可摊销 1 年">
                  <Input
                    value={form.header.amortizeEnd}
                    onChange={(v) => set('header', { amortizeEnd: v as string })}
                    placeholder="YYYY-MM"
                    disabled={!form.header.amortization}
                  />
                </Field>
              </div>

              <div className="mt-5 space-y-3">
                <div
                  className="flex items-center justify-between px-4 py-3 rounded-[14px]"
                  style={{ background: 'var(--surface-elev)', border: '1px solid var(--hairline)' }}
                >
                  <div>
                    <div className="text-[13px]" style={{ color: 'var(--ink-200)' }}>
                      摊销标志
                    </div>
                    <div className="text-[12px] mt-0.5" style={{ color: 'var(--ink-500)' }}>
                      按实际受益期间摊销，租金按合同期间
                    </div>
                  </div>
                  <Switch
                    value={form.header.amortization}
                    onChange={(v) => set('header', { amortization: v as boolean })}
                  />
                </div>

                <div
                  className="flex items-center justify-between px-4 py-3 rounded-[14px]"
                  style={{
                    background: form.header.isRecharge ? 'rgba(217,138,106,.1)' : 'var(--surface-elev)',
                    border: `1px solid ${form.header.isRecharge ? 'rgba(217,138,106,.36)' : 'var(--hairline)'}`,
                  }}
                >
                  <div>
                    <div className="text-[13px]" style={{ color: form.header.isRecharge ? 'var(--danger)' : 'var(--ink-200)' }}>
                      是否充值
                    </div>
                    <div className="text-[12px] mt-0.5" style={{ color: 'var(--ink-500)' }}>
                      勾选后不会计入费用！一般业务不涉及充值
                    </div>
                  </div>
                  <Switch
                    value={form.header.isRecharge}
                    onChange={(v) => set('header', { isRecharge: v as boolean })}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* 报账信息 */}
          {section === 'expense' && (
            <Card title="报账信息" subtitle="费用小类 · 金额 · 成本中心 · 分摊" active>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="业务类型" required>
                  <Select
                    value={form.expense.bizType}
                    onChange={(v) => set('expense', { bizType: v as string, subCategory: '' })}
                    placeholder="请选择"
                    options={Array.from(new Set(EXPENSE_MAPPINGS.map((m) => m.bizType))).map((b) => ({
                      label: b,
                      value: b,
                    }))}
                  />
                </Field>
                <Field label="费用小类" required hint="检查费用小类与业务实质一致性">
                  <Select
                    value={form.expense.subCategory}
                    onChange={(v) => set('expense', { subCategory: v as string })}
                    placeholder={form.expense.bizType ? '请选择' : '请先选择业务类型'}
                    disabled={!form.expense.bizType}
                    options={EXPENSE_MAPPINGS.filter((m) => m.bizType === form.expense.bizType).map((m) => ({
                      label: m.subCategory,
                      value: m.subCategory,
                    }))}
                  />
                  {form.expense.subCategory && (
                    <p className="text-[12px] mt-1.5" style={{ color: 'var(--mist-400)' }}>
                      中台相对应：
                      <span className="rok-mono ml-1">
                        {EXPENSE_MAPPINGS.find((m) => m.subCategory === form.expense.subCategory)?.midPlatform}
                      </span>
                    </p>
                  )}
                </Field>

                <Field label="发票种类" required>
                  <Select
                    value={form.expense.invoiceType}
                    onChange={(v) => {
                      const t = v as string;
                      set('expense', { invoiceType: t });
                      if (!form.invoice.invoiceType) set('invoice', { invoiceType: t });
                      if (t === '形式发票') set('expense', { taxRateType: '0% 进项税' });
                    }}
                    options={INVOICE_TYPES.map((t) => ({ label: t, value: t }))}
                  />
                </Field>
                <Field label="税率类型" required hint="形式发票为 0%，其他根据发票确认">
                  <Select
                    value={form.expense.taxRateType}
                    onChange={(v) => set('expense', { taxRateType: v as string })}
                    options={TAX_RATE_TYPES.map((t) => ({ label: t, value: t }))}
                  />
                </Field>

                <Field label="期间" hint="构成「摘要」，按实际期间填写">
                  <Input
                    value={form.expense.period}
                    onChange={(v) => set('expense', { period: v as string })}
                    placeholder="YYYY-MM"
                  />
                </Field>
                <Field label="成本中心" required hint="根据费用承担部门带出；营销费用必须是销售类成本中心">
                  <Input
                    value={form.expense.costCenter}
                    onChange={(v) => set('expense', { costCenter: v as string })}
                    placeholder="如：1500075001 - 销售-西南欧"
                  />
                </Field>
                <Field label="成本中心类型" required hint="营销费用类报账必须是销售类成本中心">
                  <Select
                    value={form.expense.costCenterType}
                    onChange={(v) => set('expense', { costCenterType: v as any })}
                    placeholder="请选择"
                    options={[
                      { label: '销售类', value: 'sales' },
                      { label: '管理类', value: 'management' },
                      { label: '其他', value: 'other' },
                    ]}
                  />
                </Field>
                <Field label="是否分摊至 SKU" hint="能明确到具体 SKU 的就分摊至 SKU，不能明确的可选 BU 全产品">
                  <div className="rok-seg">
                    {[
                      { v: false, l: '按 BU / 产品线' },
                      { v: true, l: '分摊至 SKU' },
                    ].map((o) => (
                      <button
                        key={String(o.v)}
                        className={`rok-seg__item ${form.expense.allocatedBySku === o.v ? 'is-active' : ''}`}
                        onClick={() => set('expense', { allocatedBySku: o.v })}
                      >
                        {o.l}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>

              <div className="mt-5 space-y-4">
                <Field
                  label={`项目号（已选 ${form.expense.projectCodes.length}）`}
                  required
                  hint="所有费用都必须按 BU 和产品线分摊，不允许选择「全产品线」"
                >
                  <PillMultiSelect
                    options={PROJECT_CODES.map((p) => ({
                      value: p.code,
                      label: `${p.code} · ${p.desc.replace(/-公共费用|-公共项目.*/, '')}`,
                      sub: p.desc,
                    }))}
                    value={form.expense.projectCodes}
                    onChange={(v) => set('expense', { projectCodes: v })}
                    searchPlaceholder="搜索项目号 / 产品（如 RO001、扫地机）"
                  />
                </Field>

                <Field
                  label={`渠道（已选 ${form.expense.channels.length}）`}
                  required
                  hint="所有费用必须根据渠道明确分摊到各业务组"
                >
                  <PillMultiSelect
                    options={CHANNEL_CODES.map((c) => ({
                      value: c.code,
                      label: `${c.code} · ${c.text.split('-').slice(-2).join('-')}`,
                      sub: c.text + ' ' + c.note,
                    }))}
                    value={form.expense.channels}
                    onChange={(v) => set('expense', { channels: v })}
                    searchPlaceholder="搜索渠道代码 / 名称（如 Z80、法国零售）"
                  />
                </Field>

                <Field label="分摊系数合计" required hint="手工分摊时校验系数总和，分摊指标可随意填写">
                  <Input
                    type="number"
                    value={String(form.expense.allocationSum || '')}
                    onChange={(v) => set('expense', { allocationSum: Number(v) || 0 })}
                    placeholder="如 100"
                  />
                </Field>
              </div>
            </Card>
          )}

          {/* 付款信息 */}
          {section === 'payment' && (
            <Card title="付款信息" subtitle="付款用途统一「采购款（费用）」· 关联预提必填" active>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="付款金额" required hint="等于本次报账金额">
                  <Input
                    type="number"
                    value={String(form.payment.payAmount || '')}
                    onChange={(v) => set('payment', { payAmount: Number(v) || 0 })}
                    placeholder="0.00"
                  />
                </Field>
                <Field label="付款用途" required hint="所有营销费用统一选择「采购款（费用）」">
                  <Select
                    value={form.payment.paymentPurpose}
                    onChange={(v) => set('payment', { paymentPurpose: v as string })}
                    options={PAYMENT_PURPOSES.map((p) => ({ label: p, value: p }))}
                  />
                </Field>
                <Field label="银行账户" required hint="SRM 已建档供应商自动带出；虚拟供应商按 Invoice 填写">
                  <Input
                    value={form.payment.bankAccount}
                    onChange={(v) => set('payment', { bankAccount: v as string })}
                    placeholder="IBAN / 账户号"
                  />
                </Field>
                <Field label="计划付款日期">
                  <Input
                    value={form.payment.planPayDate}
                    onChange={(v) => set('payment', { planPayDate: v as string })}
                    placeholder="YYYY-MM-DD"
                  />
                </Field>
                <Field label="付款方式">
                  <Select
                    value={form.payment.payMethod}
                    onChange={(v) => set('payment', { payMethod: v as string })}
                    options={PAYMENT_METHODS.map((m) => ({ label: m, value: m }))}
                  />
                </Field>
                <Field label="付款条件" hint="根据 SAP 中供应商主数据带出，不影响支付">
                  <Select
                    value={form.payment.paymentTerms}
                    onChange={(v) => set('payment', { paymentTerms: v as string })}
                    options={PAYMENT_TERMS.map((t) => ({ label: t, value: t }))}
                    placeholder="请选择或留空由主数据带出"
                    clearable
                  />
                </Field>
              </div>

              <div className="mt-5 space-y-4">
                <div
                  className="flex items-center justify-between px-4 py-3 rounded-[14px]"
                  style={{ background: 'var(--surface-elev)', border: '1px solid var(--hairline)' }}
                >
                  <div>
                    <div className="text-[13px]" style={{ color: 'var(--ink-200)' }}>
                      延后支付
                    </div>
                    <div className="text-[12px] mt-0.5" style={{ color: 'var(--ink-500)' }}>
                      本次仅报账、不付款；后续通过合同里程碑付款时选择
                    </div>
                  </div>
                  <Switch
                    value={form.payment.deferredPayment}
                    onChange={(v) => set('payment', { deferredPayment: v as boolean })}
                  />
                </div>

                <Field label="关联预提单号" required hint="报账时必须关联该项目之前提交的所有月预提，可修改金额做部分冲销">
                  <TagInput
                    value={form.payment.linkedAccruals}
                    onChange={(v) => set('payment', { linkedAccruals: v })}
                    placeholder="输入预提单号后回车或点添加"
                  />
                </Field>
              </div>
            </Card>
          )}

          {/* 发票信息 */}
          {section === 'invoice' && (
            <Card title="发票信息模块" subtitle="金额、类型必须与报账模块一致，否则系统报错" active>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="发票含税金额" required hint="一定要和报账模块金额保持一致，否则系统将报错">
                  <Input
                    type="number"
                    value={String(form.invoice.invoiceAmountInclTax || '')}
                    onChange={(v) => set('invoice', { invoiceAmountInclTax: Number(v) || 0 })}
                    placeholder="0.00"
                  />
                  {round2(form.invoice.invoiceAmountInclTax) !== round2(form.vendor.amountInclTax) && (
                    <p className="text-[12px] mt-1.5" style={{ color: 'var(--danger)' }}>
                      与报账金额 €{round2(form.vendor.amountInclTax).toLocaleString('en-US')} 不一致
                    </p>
                  )}
                </Field>
                <Field label="发票类型" required hint="一定要和报账模块发票类型、附件发票类型保持一致">
                  <Select
                    value={form.invoice.invoiceType}
                    onChange={(v) => set('invoice', { invoiceType: v as string })}
                    options={INVOICE_TYPES.map((t) => ({ label: t, value: t }))}
                    placeholder="请选择"
                  />
                </Field>
              </div>

              <div className="mt-5">
                <div
                  className="flex items-center justify-between px-4 py-3 rounded-[14px]"
                  style={{ background: 'var(--surface-elev)', border: '1px solid var(--hairline)' }}
                >
                  <div>
                    <div className="text-[13px]" style={{ color: 'var(--ink-200)' }}>
                      已上传审批交付文件与发票附件
                    </div>
                    <div className="text-[12px] mt-0.5" style={{ color: 'var(--ink-500)' }}>
                      虚拟供应商场景需以报价单作为附件上传
                    </div>
                  </div>
                  <Switch
                    value={form.invoice.hasAttachment}
                    onChange={(v) => set('invoice', { hasAttachment: v as boolean })}
                  />
                </div>
              </div>

              <div className="mt-5">
                <Field label="备注 / 用途描述" hint="说明本次费用背景与交付物">
                  <Textarea placeholder="选填" autosize={{ minRows: 3, maxRows: 6 }} />
                </Field>
              </div>
            </Card>
          )}

          {/* 预提与核销 */}
          {section === 'accrual' && (
            <Card title="预提与核销" subtitle="跨期受益费用需逐月预提，尾票报账时统一核销" active>
              <div
                className="flex items-center justify-between px-4 py-3 rounded-[14px] mb-5"
                style={{ background: 'var(--surface-elev)', border: '1px solid var(--hairline)' }}
              >
                <div>
                  <div className="text-[13px]" style={{ color: 'var(--ink-200)' }}>
                    本次涉及费用预提
                  </div>
                  <div className="text-[12px] mt-0.5" style={{ color: 'var(--ink-500)' }}>
                    业务实际发生时间早于实际入账时间时启用
                  </div>
                </div>
                <Switch
                  value={form.accrual.enabled}
                  onChange={(v) => set('accrual', { enabled: v as boolean })}
                />
              </div>

              {form.accrual.enabled ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="受益期（期数）" required hint="报账时受益期必须与预提时一致">
                    <Input
                      type="number"
                      value={String(form.accrual.benefitPeriods || '')}
                      onChange={(v) => {
                        const n = Number(v) || 0;
                        const m =
                          n > 0 && form.accrual.totalProjectAmount > 0
                            ? round2(form.accrual.totalProjectAmount / n)
                            : 0;
                        set('accrual', { benefitPeriods: n, monthlyAccrualAmount: m });
                      }}
                      placeholder="如 3"
                    />
                  </Field>
                  <Field label="项目总金额" required>
                    <Input
                      type="number"
                      value={String(form.accrual.totalProjectAmount || '')}
                      onChange={(v) => {
                        const n = Number(v) || 0;
                        const m =
                          form.accrual.benefitPeriods > 0 ? round2(n / form.accrual.benefitPeriods) : 0;
                        set('accrual', { totalProjectAmount: n, monthlyAccrualAmount: m });
                      }}
                      placeholder="0.00"
                    />
                  </Field>
                  <Field
                    label="月度预提金额"
                    required
                    hint="预提金额 = 项目总金额 ÷ 受益期"
                  >
                    <Input
                      type="number"
                      value={String(form.accrual.monthlyAccrualAmount || '')}
                      onChange={(v) => set('accrual', { monthlyAccrualAmount: Number(v) || 0 })}
                      placeholder="0.00"
                    />
                    {autoMonthly > 0 && (
                      <p className="text-[12px] mt-1.5" style={{ color: 'var(--mist-400)' }}>
                        自动计算：€
                        {round2(form.accrual.totalProjectAmount).toLocaleString('en-US')} ÷{' '}
                        {form.accrual.benefitPeriods} = €{autoMonthly.toLocaleString('en-US')}
                      </p>
                    )}
                  </Field>
                  <Field label="与预提的口径比对" required hint="受益期 / 供应商 / 费用类型 / 分摊渠道四项必须一致">
                    <Select
                      value={form.accrual.varianceFromPreAccrual}
                      onChange={(v) => set('accrual', { varianceFromPreAccrual: v as string })}
                      placeholder="请选择"
                      options={[
                        { label: '一致', value: '一致' },
                        { label: '受益期不一致', value: '受益期不一致' },
                        { label: '供应商不一致', value: '供应商不一致' },
                        { label: '费用类型不一致', value: '费用类型不一致' },
                        { label: '分摊渠道不一致', value: '分摊渠道不一致' },
                      ]}
                    />
                  </Field>

                  <div className="md:col-span-2">
                    <Field label="已提交的预提期间" hint="没到报账月前，每个月都需提交，可复制上一期单据">
                      <TagInput
                        value={form.accrual.accrualPeriods}
                        onChange={(v) => set('accrual', { accrualPeriods: v })}
                        placeholder="如 2025-08"
                      />
                    </Field>
                  </div>

                  <div className="md:col-span-2">
                    <Field
                      label="本次需核销的往期预提单"
                      required
                      hint="同项目多张票时，最后一张票报账时再核销之前所有月预提"
                    >
                      <TagInput
                        value={form.accrual.linkedPreviousAccruals}
                        onChange={(v) => set('accrual', { linkedPreviousAccruals: v })}
                        placeholder="输入预提单号"
                      />
                    </Field>
                  </div>

                  <div className="md:col-span-2">
                    <div
                      className="flex items-center justify-between px-4 py-3 rounded-[14px]"
                      style={{ background: 'var(--surface-elev)', border: '1px solid var(--hairline)' }}
                    >
                      <div>
                        <div className="text-[13px]" style={{ color: 'var(--ink-200)' }}>
                          本单为尾票
                        </div>
                        <div className="text-[12px] mt-0.5" style={{ color: 'var(--ink-500)' }}>
                          尾票报账时核销之前所有月预提
                        </div>
                      </div>
                      <Switch
                        value={form.accrual.isFinalInvoice}
                        onChange={(v) => set('accrual', { isFinalInvoice: v as boolean })}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <Nothing text="本次不涉及预提。若受益期跨月，请开启并逐月提交预提流程。" />
              )}
            </Card>
          )}
        </div>

        {/* 右：校验与摘要 */}
        <div className="space-y-4 xl:sticky xl:top-4">
          {/* 合规分 */}
          <div className={`rok-card p-5 ${result.blockings.length === 0 ? 'rok-card--active' : ''}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-semibold" style={{ color: 'var(--ink-100)' }}>
                填报自检
              </span>
              <span
                className="rok-mono text-[26px] font-semibold leading-none"
                style={{ color: result.blockings.length === 0 ? 'var(--gold-400)' : 'var(--ink-100)' }}
              >
                {result.score}
                <span className="text-[13px] ml-1" style={{ color: 'var(--ink-500)' }}>
                  /100
                </span>
              </span>
            </div>

            <div
              className="h-[6px] rounded-[999px] overflow-hidden mb-4"
              style={{ background: 'rgba(143,166,184,.14)' }}
            >
              <div
                className="h-full rounded-[999px] transition-all"
                style={{
                  width: `${result.score}%`,
                  background:
                    result.blockings.length === 0
                      ? 'linear-gradient(90deg, var(--gold-400), var(--gold-600))'
                      : 'linear-gradient(90deg, var(--danger), var(--warn))',
                  transitionDuration: 'var(--dur-slow)',
                }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { l: 'P0 阻断', n: result.blockings.length, c: 'var(--danger)', cls: 'rok-pill--danger' },
                { l: 'P1 待确认', n: result.warnings.length, c: 'var(--warn)', cls: 'rok-pill--warn' },
                { l: 'P2 提示', n: result.hints.length, c: 'var(--ink-400)', cls: 'rok-pill--muted' },
              ].map((x) => (
                <div
                  key={x.l}
                  className="px-3 py-2.5 rounded-[14px] text-center"
                  style={{ background: 'var(--surface-elev)', border: '1px solid var(--hairline)' }}
                >
                  <div className="rok-mono text-[18px] font-semibold" style={{ color: x.c }}>
                    {x.n}
                  </div>
                  <div className="text-[11.5px] mt-0.5" style={{ color: 'var(--ink-500)' }}>
                    {x.l}
                  </div>
                </div>
              ))}
            </div>

            {result.blockings.length === 0 && (
              <div
                className="mt-4 flex items-center gap-2 px-3.5 py-2.5 rounded-[14px]"
                style={{ background: 'rgba(232,162,74,.08)', border: '1px solid rgba(232,162,74,.28)' }}
              >
                <CheckCircleFilledIcon style={{ color: 'var(--gold-400)' }} size={15} />
                <span className="text-[12.5px]" style={{ color: 'var(--gold-400)' }}>
                  无 P0 阻断项，可提交
                </span>
              </div>
            )}
          </div>

          {/* 问题列表 */}
          <div className="rok-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-semibold" style={{ color: 'var(--ink-100)' }}>
                校验明细
              </span>
              <span className="text-[12px]" style={{ color: 'var(--ink-500)' }}>
                共 {result.issues.length} 条
              </span>
            </div>
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {result.issues.length === 0 ? (
                <Nothing text="暂无问题，填报项齐备" />
              ) : (
                [...result.blockings, ...result.warnings, ...result.hints].map((it, i) => (
                  <IssueRow key={i} issue={it} />
                ))
              )}
            </div>
          </div>

          {/* 摘要 */}
          <div className="rok-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-semibold" style={{ color: 'var(--ink-100)' }}>
                提交摘要
              </span>
              <div className="flex items-center gap-2">
                <button
                  className="rok-btn-ghost"
                  style={{ minHeight: 32, padding: '0 12px', fontSize: 12 }}
                  onClick={copySummary}
                >
                  <CopyIcon size={13} /> 复制
                </button>
              </div>
            </div>
            <pre
              className="rok-mono text-[12px] whitespace-pre-wrap break-words max-h-[260px] overflow-y-auto p-3 rounded-[14px] leading-relaxed"
              style={{
                background: 'rgba(4,16,26,.5)',
                border: '1px solid var(--hairline)',
                color: 'var(--ink-300)',
              }}
            >
              {summary}
            </pre>
            <div className="flex gap-2 mt-3">
              <button
                className="rok-btn-primary flex-1"
                onClick={() => {
                  if (onSendToAgent) {
                    onSendToAgent(summary);
                  } else {
                    downloadSummary(summary);
                  }
                }}
              >
                {onSendToAgent ? '交给 Agent 复核' : '导出摘要文件'}
              </button>
            </div>
            <p className="text-[11.5px] mt-2" style={{ color: 'var(--ink-500)' }}>
              {onSendToAgent
                ? '摘要为一键复制文本；如需模型逐项复核，请切换到「Agent 对话」。'
                : '导出为 .txt 摘要文件，可粘贴到财务中台或邮件中；也可直接点「复制」。'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 分区归属判定 */
function belongsTo(issue: Issue, section: SectionKey): boolean {
  const f = issue.field;
  if (section === 'vendor') return ['付款公司', '供应商模式', '币种', '银行账户', '金额勾稽'].includes(f);
  if (section === 'header') return ['核算主体', '是否充值', '摊销期间'].includes(f);
  if (section === 'expense')
    return ['业务类型', '费用小类', '发票种类', '税率类型', '成本中心', '项目号分摊', '渠道分摊', '分摊系数'].includes(f);
  if (section === 'payment') return ['付款金额', '付款用途', '付款方式', '计划付款日期', '付款条件', '付款信息', '关联预提'].includes(f);
  if (section === 'invoice') return ['发票金额', '发票类型', '附件'].includes(f);
  if (section === 'accrual') return ['受益期', '预提金额', '预提口径', '预提次数', '关联预提', '预提'].includes(f);
  return false;
}
