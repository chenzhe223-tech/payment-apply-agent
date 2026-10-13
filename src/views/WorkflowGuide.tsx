import { useMemo, useState } from 'react';
import {
  CheckCircleFilledIcon,
  CloseCircleFilledIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from 'tdesign-icons-react';
import {
  FLOW_STAGES,
  TOP_MISTAKES,
  VIRTUAL_VENDOR_THRESHOLD_EUR,
} from '../domain/southwestEurope';

/* ============================================================
 * 流程图（SVG）：深海画布 + 金色路径
 * 未走 = --hairline 虚线；节点填 sea-700 + 金描边
 * ========================================================== */

export function FlowDiagram({ activeKey }: { activeKey?: string }) {
  const stages = FLOW_STAGES;
  const rowHeight = 92;
  const height = stages.length * rowHeight + 24;
  const COL_X = 168;
  const activeIndex = activeKey ? stages.findIndex((s) => s.key === activeKey) : -1;

  return (
    <div
      className="rounded-[20px] p-5 overflow-x-auto"
      style={{ background: '#071b28', border: '1px solid var(--hairline)' }}
    >
      <svg
        viewBox={`0 0 620 ${height}`}
        width="100%"
        style={{ minWidth: 560, height: 'auto', display: 'block' }}
        role="img"
        aria-label="西南欧营销费用申请流程图"
      >
        <defs>
          <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#071b28" />
            <stop offset="100%" stopColor="#05131e" />
          </linearGradient>
          <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="3.6" floodColor="#E8A24A" floodOpacity="0.45" />
          </filter>
        </defs>

        <rect x="0" y="0" width="620" height={height} fill="url(#seaGrad)" />

        {/* 主干路径 */}
        {stages.slice(0, -1).map((_, i) => {
          const y1 = 46 + i * rowHeight;
          const y2 = 46 + (i + 1) * rowHeight;
          const reached = activeIndex < 0 || i < activeIndex;
          const isFuture = activeIndex >= 0 && i >= activeIndex;
          return (
            <line
              key={`l-${i}`}
              x1={COL_X}
              y1={y1 + 15}
              x2={COL_X}
              y2={y2 - 15}
              stroke={isFuture ? 'rgba(143,166,184,.18)' : '#E8A24A'}
              strokeWidth={2.2}
              strokeDasharray={isFuture ? '5 6' : '0'}
              filter={isFuture ? undefined : 'url(#goldGlow)'}
            />
          );
        })}

        {stages.map((stage, i) => {
          const cy = 46 + i * rowHeight;
          const isActive = activeIndex === i;
          const isPast = activeIndex > i;
          return (
            <g key={stage.key}>
              {/* 节点 */}
              <circle
                cx={COL_X}
                cy={cy}
                r={15}
                fill={isPast ? '#C9812F' : isActive ? '#123a52' : '#08202f'}
                stroke={isActive || isPast ? '#E8A24A' : 'rgba(143,166,184,.32)'}
                strokeWidth={isActive ? 2.2 : 1.4}
                filter={isActive ? 'url(#goldGlow)' : undefined}
              />
              <text
                x={COL_X}
                y={cy + 4.5}
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill={isPast ? '#20140a' : isActive ? '#F2B96B' : '#7E94A6'}
              >
                {stage.seq}
              </text>

              {/* 右侧文字 */}
              <text
                x={COL_X + 30}
                y={cy - 4}
                fontSize="13.5"
                fontWeight="600"
                fill={isActive || isPast ? '#F2F6F9' : '#AFC1D0'}
              >
                {stage.name}
              </text>
              <text x={COL_X + 30} y={cy + 15} fontSize="11.5" fill="#7E94A6">
                {stage.system} · {stage.mandatory ? '必经' : '按情况触发'}
              </text>

              {/* 左侧标记 */}
              {isActive && (
                <g>
                  <rect
                    x={COL_X - 150}
                    y={cy - 13}
                    width={112}
                    height={26}
                    rx={13}
                    fill="rgba(232,162,74,.16)"
                    stroke="rgba(232,162,74,.4)"
                  />
                  <text
                    x={COL_X - 94}
                    y={cy + 4}
                    textAnchor="middle"
                    fontSize="11.5"
                    fontWeight="600"
                    fill="#F2B96B"
                  >
                    当前查看
                  </text>
                </g>
              )}
              {isPast && (
                <text x={COL_X - 102} y={cy + 4} fontSize="11.5" fill="#6FB3A8">
                  已了解
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ============================================================
 * 流程指引主体
 * ========================================================== */

export function WorkflowGuide() {
  const [activeKey, setActiveKey] = useState<string>(FLOW_STAGES[0].key);
  const [openMistake, setOpenMistake] = useState<number | null>(0);

  const active = useMemo(
    () => FLOW_STAGES.find((s) => s.key === activeKey) ?? FLOW_STAGES[0],
    [activeKey],
  );

  const riskPill = {
    normal: 'rok-pill rok-pill--muted',
    warn: 'rok-pill rok-pill--warn',
    danger: 'rok-pill rok-pill--gold',
  }[active.riskLevel];

  const riskText = {
    normal: '常规',
    warn: '易错',
    danger: '高风险',
  }[active.riskLevel];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.05fr] gap-5">
        <FlowDiagram activeKey={activeKey} />

        <div className="space-y-4">
          {/* 阶段选择 */}
          <div className="flex flex-wrap gap-2">
            {FLOW_STAGES.map((s) => {
              const on = s.key === activeKey;
              return (
                <button
                  key={s.key}
                  onClick={() => setActiveKey(s.key)}
                  className="px-3 py-1.5 rounded-[999px] text-xs font-medium transition-all"
                  style={{
                    background: on ? 'rgba(232,162,74,.16)' : 'var(--surface-elev)',
                    border: `1px solid ${on ? 'rgba(232,162,74,.42)' : 'var(--hairline)'}`,
                    color: on ? 'var(--gold-400)' : 'var(--ink-400)',
                  }}
                >
                  {s.seq}. {s.name.replace(/（.*?）/, '')}
                </button>
              );
            })}
          </div>

          {/* 阶段详情 */}
          <div className="rok-card p-5 rok-anim-in" key={active.key}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="rok-mono"
                    style={{ color: 'var(--gold-500)', fontSize: 12 }}
                  >
                    STEP {active.seq}
                  </span>
                  <span className={riskPill}>{riskText}</span>
                  <span className="rok-pill rok-pill--muted">{active.system}</span>
                </div>
                <h3
                  className="text-[17px] font-semibold"
                  style={{ color: 'var(--ink-100)' }}
                >
                  {active.name}
                </h3>
              </div>
            </div>

            <div className="rok-field">
              <span className="rok-field__label">目的</span>
              <span className="rok-field__value">{active.goal}</span>
            </div>
            <div className="rok-field">
              <span className="rok-field__label">时点</span>
              <span className="rok-field__value">{active.timing}</span>
            </div>
            <div className="rok-field">
              <span className="rok-field__label">是否必经</span>
              <span className="rok-field__value">
                {active.mandatory ? '必经流程' : '按业务实际情况触发'}
              </span>
            </div>

            <div className="mt-4">
              <div
                className="text-[12px] font-semibold mb-2.5 tracking-wide"
                style={{ color: 'var(--ink-400)' }}
              >
                操作要点
              </div>
              <ul className="space-y-2">
                {active.keyPoints.map((p, i) => (
                  <li key={i} className="flex gap-2.5 text-[13px]" style={{ color: 'var(--ink-200)' }}>
                    <span style={{ color: 'var(--gold-500)', flexShrink: 0, marginTop: 1 }}>·</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 虚拟供应商判定速查 */}
      <div className="rok-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-[15px] font-semibold" style={{ color: 'var(--ink-100)' }}>
            虚拟供应商判定速查
          </h3>
          <span className="rok-pill rok-pill--gold">不含标准合同</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className="p-4 rounded-[14px]"
            style={{ background: 'rgba(232,162,74,.08)', border: '1px solid rgba(232,162,74,.28)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircleFilledIcon style={{ color: 'var(--gold-400)' }} />
              <span className="text-[13.5px] font-semibold" style={{ color: 'var(--gold-400)' }}>
                可用虚拟供应商
              </span>
            </div>
            <p className="text-[13px]" style={{ color: 'var(--ink-200)' }}>
              单笔金额 &lt; €{VIRTUAL_VENDOR_THRESHOLD_EUR.toLocaleString('en-US')} 且无标准合同、仅有报价单。
            </p>
            <p className="text-[12.5px] mt-2" style={{ color: 'var(--ink-400)' }}>
              目前仅针对 PR &amp; KOL &amp; 零星采购。发票报账时以报价单作为附件。
            </p>
          </div>
          <div
            className="p-4 rounded-[14px]"
            style={{ background: 'var(--surface-elev)', border: '1px solid var(--hairline)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <CloseCircleFilledIcon style={{ color: 'var(--ink-400)' }} />
              <span className="text-[13.5px] font-semibold" style={{ color: 'var(--ink-200)' }}>
                必须走标准流程
              </span>
            </div>
            <p className="text-[13px]" style={{ color: 'var(--ink-200)' }}>
              金额 ≥ €{VIRTUAL_VENDOR_THRESHOLD_EUR.toLocaleString('en-US')}，或存在标准合同。
            </p>
            <p className="text-[12.5px] mt-2" style={{ color: 'var(--ink-400)' }}>
              需在 SRM 建立供应商信息并申请合同；银行账户由主数据自动带出。
            </p>
          </div>
        </div>
      </div>

      {/* 高频差错 */}
      <div className="rok-card p-5">
        <h3 className="text-[15px] font-semibold mb-3" style={{ color: 'var(--ink-100)' }}>
          高频差错 TOP {TOP_MISTAKES.length}
        </h3>
        <div className="space-y-1.5">
          {TOP_MISTAKES.map((m, i) => {
            const open = openMistake === i;
            return (
              <div
                key={i}
                className="rounded-[14px] overflow-hidden transition-all"
                style={{
                  background: open ? 'rgba(232,162,74,.07)' : 'var(--surface-elev)',
                  border: `1px solid ${open ? 'rgba(232,162,74,.28)' : 'var(--hairline)'}`,
                }}
              >
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-left"
                  onClick={() => setOpenMistake(open ? null : i)}
                >
                  <span
                    className="rok-mono shrink-0"
                    style={{ color: open ? 'var(--gold-400)' : 'var(--ink-500)', fontSize: 12, minWidth: 20 }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className="flex-1 text-[13.5px] font-medium"
                    style={{ color: open ? 'var(--ink-100)' : 'var(--ink-200)' }}
                  >
                    {m.title}
                  </span>
                  {open ? (
                    <ChevronUpIcon size={14} style={{ color: 'var(--ink-400)' }} />
                  ) : (
                    <ChevronDownIcon size={14} style={{ color: 'var(--ink-500)' }} />
                  )}
                </button>
                {open && (
                  <div
                    className="px-4 pb-3.5 text-[13px] leading-relaxed"
                    style={{ color: 'var(--ink-300)', paddingLeft: 47 }}
                  >
                    {m.detail}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
