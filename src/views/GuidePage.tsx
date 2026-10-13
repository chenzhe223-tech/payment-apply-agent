import { APP_CONFIG } from '../config';
import { FLOW_STAGES, TOP_MISTAKES } from '../domain/southwestEurope';

type View = 'apply' | 'flow' | 'master' | 'help';

const RULE_TIERS = [
  {
    tier: 'P0',
    label: '阻断',
    deduct: '−12',
    tone: 'danger',
    desc: '违反即不可提交，必须先修正',
    examples: [
      '付款用途未选择「采购款（费用）」',
      '勾选了「充值标志」——该笔不会计入费用',
      '分摊渠道为空，或项目号填了 ALL',
      '预提口径（受益期 / 供应商 / 费用类型 / 分摊渠道）与报账不一致',
      '付款金额 ≠ 本次报账含税金额',
    ],
  },
  {
    tier: 'P1',
    label: '警告',
    deduct: '−4',
    tone: 'warn',
    desc: '高风险，需人工确认后再提交',
    examples: [
      '含税金额 > €5,000 且无标准合同，但未走虚拟供应商',
      '核算主体与付款公司不一致',
      '摊销期与受益期不匹配',
      '发票金额 / 类型与报账模块不一致',
    ],
  },
  {
    tier: 'P2',
    label: '提示',
    deduct: '−1',
    tone: 'gold',
    desc: '建议优化，不影响提交',
    examples: ['未填写备注', '附件说明过于简略', '收款方银行信息未补齐'],
  },
];

export function GuidePage({ onNavigate }: { onNavigate: (v: View) => void }) {
  return (
    <div className="space-y-5">
      {/* 这是什么 */}
      <section className="rok-card p-5">
        <h2 className="text-[16px] font-semibold mb-3" style={{ color: 'var(--ink-100)' }}>
          这个工具做什么
        </h2>
        <p className="text-[13px] leading-[1.85] mb-3" style={{ color: 'var(--ink-300)' }}>
          把《{APP_CONFIG.source.title}》里的流程、审核点和主数据，固化成一份「边填边校验」的在线表单。
          填完后自动出合规分与问题清单，用来在提交财务中台之前先自查一遍，减少退单返工。
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { t: '填报工作台', d: '六段式表单（供应商 / 表头 / 报账 / 付款 / 发票 / 预提），实时校验', v: 'apply' as View },
            { t: '流程指引', d: '六步主干流程、每阶段要点与风险等级、高频差错清单', v: 'flow' as View },
            { t: '主数据速查', d: '项目号、渠道号、费用小类映射、分摊规则，点击即复制', v: 'master' as View },
          ].map((c) => (
            <button
              key={c.t}
              onClick={() => onNavigate(c.v)}
              className="text-left rounded-[14px] p-3.5 transition-colors"
              style={{
                background: 'var(--surface-elev)',
                border: '1px solid var(--hairline)',
                transitionDuration: 'var(--dur-fast)',
              }}
            >
              <div className="text-[13.5px] font-medium mb-1.5" style={{ color: 'var(--gold-400)' }}>
                {c.t} →
              </div>
              <div className="text-[12px] leading-relaxed" style={{ color: 'var(--ink-400)' }}>
                {c.d}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 校验规则 */}
      <section className="rok-card p-5">
        <h2 className="text-[16px] font-semibold mb-1.5" style={{ color: 'var(--ink-100)' }}>
          校验规则
        </h2>
        <p className="text-[12.5px] mb-4" style={{ color: 'var(--ink-400)' }}>
          合规分 = <span className="rok-mono">max(0, 100 − P0×12 − P1×4 − P2×1)</span>
        </p>
        <div className="space-y-3">
          {RULE_TIERS.map((t) => (
            <div
              key={t.tier}
              className="rounded-[14px] p-3.5"
              style={{ background: 'var(--surface-elev)', border: '1px solid var(--hairline)' }}
            >
              <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                <span className={`rok-pill rok-pill--${t.tone}`}>
                  {t.tier} · {t.label}
                </span>
                <span className="text-[12px]" style={{ color: 'var(--ink-400)' }}>
                  {t.desc}
                </span>
                <span className="text-[12px] ml-auto rok-mono" style={{ color: 'var(--ink-500)' }}>
                  {t.deduct} / 条
                </span>
              </div>
              <ul className="space-y-1">
                {t.examples.map((e, i) => (
                  <li key={i} className="text-[12.5px] leading-relaxed flex gap-2" style={{ color: 'var(--ink-300)' }}>
                    <span style={{ color: 'var(--ink-500)' }}>·</span>
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 预提铁律 */}
      <section
        className="rounded-[20px] p-5"
        style={{ background: 'rgba(232,162,74,.07)', border: '1px solid rgba(232,162,74,.24)' }}
      >
        <h2 className="text-[16px] font-semibold mb-3" style={{ color: 'var(--gold-400)' }}>
          预提铁律（最容易出错的地方）
        </h2>
        <div className="space-y-2">
          <div className="text-[13px] leading-relaxed" style={{ color: 'var(--ink-200)' }}>
            · 预提金额 = 项目总金额 ÷ 受益期
          </div>
          <div className="text-[13px] leading-relaxed" style={{ color: 'var(--ink-200)' }}>
            · 报账时，以下四项必须与预提<strong style={{ color: 'var(--gold-400)' }}>完全一致</strong>：
            受益期 · 供应商 · 费用类型 · 分摊渠道（要分摊到渠道、到项目）
          </div>
          <div className="text-[13px] leading-relaxed" style={{ color: 'var(--ink-200)' }}>
            · 涉及尾票时，需在预提模块关联对应的预提单号
          </div>
        </div>
      </section>

      {/* 六阶段速览 */}
      <section className="rok-card p-5">
        <h2 className="text-[16px] font-semibold mb-4" style={{ color: 'var(--ink-100)' }}>
          六步主干流程
        </h2>
        <div className="space-y-2.5">
          {FLOW_STAGES.map((s) => (
            <div key={s.key} className="flex gap-3.5 items-start">
              <span
                className="rok-mono shrink-0 flex items-center justify-center rounded-[8px] text-[12px] font-semibold"
                style={{
                  width: 26,
                  height: 26,
                  background: s.riskLevel === 'danger' ? 'rgba(217,138,106,.16)' : 'rgba(232,162,74,.12)',
                  color: s.riskLevel === 'danger' ? 'var(--danger)' : 'var(--gold-400)',
                }}
              >
                {s.seq}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-[13.5px] font-medium" style={{ color: 'var(--ink-100)' }}>
                    {s.name}
                  </span>
                  <span className="rok-pill rok-pill--muted">{s.system}</span>
                  {s.mandatory && <span className="rok-pill rok-pill--gold">必做</span>}
                  {s.riskLevel === 'danger' && <span className="rok-pill rok-pill--danger">高风险</span>}
                  {s.riskLevel === 'warn' && <span className="rok-pill rok-pill--warn">注意</span>}
                </div>
                <div className="text-[12.5px] leading-relaxed" style={{ color: 'var(--ink-400)' }}>
                  {s.goal}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 高频差错 */}
      <section className="rok-card p-5">
        <h2 className="text-[16px] font-semibold mb-3.5" style={{ color: 'var(--ink-100)' }}>
          高频差错 Top {TOP_MISTAKES.length}
        </h2>
        <div className="grid gap-2 md:grid-cols-2">
          {TOP_MISTAKES.map((m, i) => (
            <div
              key={i}
              className="flex gap-2.5 rounded-[14px] p-3"
              style={{ background: 'var(--surface-elev)', border: '1px solid var(--hairline)' }}
            >
              <span className="rok-mono text-[11.5px] shrink-0 pt-0.5" style={{ color: 'var(--ink-500)' }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <div className="text-[12.5px] font-medium mb-0.5" style={{ color: 'var(--ink-200)' }}>
                  {m.title}
                </div>
                <div className="text-[12px] leading-relaxed" style={{ color: 'var(--ink-400)' }}>
                  {m.detail}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 部署信息 */}
      <section className="rok-card p-5">
        <h2 className="text-[16px] font-semibold mb-3" style={{ color: 'var(--ink-100)' }}>
          关于本部署
        </h2>
        <div className="space-y-2.5 text-[12.5px] leading-relaxed" style={{ color: 'var(--ink-400)' }}>
          <p>
            <span style={{ color: 'var(--ink-300)' }}>运行方式：</span>
            纯静态站点，托管在 GitHub Pages。所有校验规则与主数据都打包在前端，打开即用，无需登录、无需后端。
          </p>
          <p>
            <span style={{ color: 'var(--ink-300)' }}>数据安全：</span>
            你填的任何内容都只存在于本机浏览器内存中，不会上传到任何服务器。刷新页面即清空。
          </p>
          <p>
            <span style={{ color: 'var(--ink-300)' }}>导出：</span>
            工作台右侧的「提交摘要」可一键复制，或导出为 .txt 文件，粘贴到财务中台 / 邮件里使用。
          </p>
          <p>
            <span style={{ color: 'var(--ink-300)' }}>口径版本：</span>
            v{APP_CONFIG.version}，口径来源为
            <a
              href={APP_CONFIG.source.url}
              target="_blank"
              rel="noreferrer"
              className="underline mx-1"
              style={{ color: 'var(--gold-400)' }}
            >
              {APP_CONFIG.source.title}
            </a>
            。如原文档更新，本工具需同步修订。
          </p>
        </div>
      </section>
    </div>
  );
}

export default GuidePage;
