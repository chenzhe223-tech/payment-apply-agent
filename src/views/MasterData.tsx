import { useMemo, useState } from 'react';
import { Input, Select, Tooltip } from 'tdesign-react';
import { SearchIcon, CopyIcon } from 'tdesign-icons-react';
import {
  EXPENSE_MAPPINGS,
  PROJECT_CODES,
  CHANNEL_CODES,
  ALLOCATION_RULES,
  PAYMENT_PURPOSES,
  INVOICE_TYPES,
  TAX_RATE_TYPES,
  CURRENCIES,
  PAYMENT_METHODS,
} from '../domain/southwestEurope';

type Tab = 'mapping' | 'project' | 'channel' | 'allocation' | 'options';

const TABS: { key: Tab; label: string }[] = [
  { key: 'mapping', label: '业务类型 ↔ 费用小类' },
  { key: 'project', label: '常用项目号' },
  { key: 'channel', label: '常用渠道' },
  { key: 'allocation', label: '分摊规则' },
  { key: 'options', label: '字段取值速查' },
];

function Copyable({ text, mono = true }: { text: string; mono?: boolean }) {
  const [done, setDone] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(text).then(
      () => {
        setDone(true);
        setTimeout(() => setDone(false), 1200);
      },
      () => {},
    );
  };
  return (
    <span className="inline-flex items-center gap-1.5 group">
      <span className={mono ? 'rok-mono' : ''} style={{ color: 'var(--ink-200)' }}>
        {text}
      </span>
      <button
        onClick={copy}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        title="复制"
        style={{ color: done ? 'var(--mist-400)' : 'var(--ink-500)' }}
      >
        <CopyIcon size={13} />
      </button>
    </span>
  );
}

/* ============================================================
 * 主数据速查
 * ========================================================== */

export function MasterData() {
  const [tab, setTab] = useState<Tab>('mapping');
  const [kw, setKw] = useState('');
  const [brand, setBrand] = useState<'ALL' | '追觅' | 'MOVA'>('ALL');

  const projects = useMemo(() => {
    const k = kw.trim().toLowerCase();
    return PROJECT_CODES.filter((p) => {
      const kwOk = !k || p.code.toLowerCase().includes(k) || p.desc.toLowerCase().includes(k);
      const brandOk = brand === 'ALL' || p.brand === brand;
      return kwOk && brandOk;
    });
  }, [kw, brand]);

  const channels = useMemo(() => {
    const k = kw.trim().toLowerCase();
    return CHANNEL_CODES.filter(
      (c) =>
        !k ||
        c.code.toLowerCase().includes(k) ||
        c.text.toLowerCase().includes(k) ||
        c.note.toLowerCase().includes(k),
    );
  }, [kw]);

  const channelGroups = useMemo(() => {
    const map = new Map<string, typeof CHANNEL_CODES>();
    channels.forEach((c) => {
      if (!map.has(c.group)) map.set(c.group, []);
      map.get(c.group)!.push(c);
    });
    return Array.from(map.entries());
  }, [channels]);

  const mappings = useMemo(() => {
    const k = kw.trim().toLowerCase();
    if (!k) return EXPENSE_MAPPINGS;
    return EXPENSE_MAPPINGS.filter(
      (m) =>
        m.bizType.toLowerCase().includes(k) ||
        m.subCategory.toLowerCase().includes(k) ||
        m.midPlatform.toLowerCase().includes(k) ||
        m.note.toLowerCase().includes(k),
    );
  }, [kw]);

  return (
    <div className="space-y-4">
      {/* 页签 */}
      <div className="rok-seg flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`rok-seg__item ${tab === t.key ? 'is-active' : ''}`}
            onClick={() => {
              setTab(t.key);
              setKw('');
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 检索栏 */}
      {(tab === 'project' || tab === 'channel' || tab === 'mapping') && (
        <div className="flex items-center gap-3 flex-wrap">
          <div style={{ width: 320 }}>
            <Input
              value={kw}
              onChange={(v) => setKw(v as string)}
              placeholder={
                tab === 'project'
                  ? '搜索项目号或产品（如 RO001 / 扫地机）'
                  : tab === 'channel'
                  ? '搜索渠道代码或名称（如 Z80 / 法国零售）'
                  : '搜索业务类型 / 费用小类 / 中台类型'
              }
              prefixIcon={<SearchIcon />}
              clearable
            />
          </div>
          {tab === 'project' && (
            <div className="rok-seg">
              {(['ALL', '追觅', 'MOVA'] as const).map((b) => (
                <button
                  key={b}
                  className={`rok-seg__item ${brand === b ? 'is-active' : ''}`}
                  onClick={() => setBrand(b)}
                >
                  {b === 'ALL' ? '全部品牌' : b}
                </button>
              ))}
            </div>
          )}
          <span className="text-[12.5px]" style={{ color: 'var(--ink-500)' }}>
            共 {tab === 'project' ? projects.length : tab === 'channel' ? channels.length : mappings.length} 条
          </span>
        </div>
      )}

      {/* 内容 */}
      {tab === 'mapping' && (
        <div className="rok-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="rok-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 96 }}>业务类型</th>
                  <th style={{ minWidth: 110 }}>费用小类</th>
                  <th style={{ minWidth: 220 }}>中台相对应</th>
                  <th style={{ minWidth: 200 }}>备注</th>
                </tr>
              </thead>
              <tbody>
                {mappings.map((m, i) => (
                  <tr key={i}>
                    <td>{m.bizType}</td>
                    <td style={{ color: 'var(--gold-400)' }}>{m.subCategory}</td>
                    <td>
                      <Copyable text={m.midPlatform} mono={false} />
                    </td>
                    <td style={{ color: 'var(--ink-300)' }}>{m.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'project' && (
        <div className="rok-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="rok-table">
              <thead>
                <tr>
                  <th style={{ width: 90 }}>品牌</th>
                  <th style={{ width: 140 }}>项目号</th>
                  <th>项目描述</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p, i) => (
                  <tr key={`${p.code}-${i}`}>
                    <td>
                      {p.brand ? (
                        <span className="rok-pill rok-pill--gold">{p.brand}</span>
                      ) : (
                        <span style={{ color: 'var(--ink-500)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <Copyable text={p.code} />
                    </td>
                    <td>{p.desc}</td>
                  </tr>
                ))}
                {projects.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-10" style={{ color: 'var(--ink-500)' }}>
                      没有匹配的项目号
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'channel' && (
        <div className="space-y-4">
          {channelGroups.map(([group, list]) => (
            <div key={group} className="rok-card overflow-hidden">
              <div
                className="px-4 py-2.5 flex items-center gap-2"
                style={{ borderBottom: '1px solid var(--hairline)' }}
              >
                <span className="text-[13px] font-semibold" style={{ color: 'var(--ink-100)' }}>
                  {group}
                </span>
                <span className="rok-pill rok-pill--muted">{list.length}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="rok-table">
                  <thead>
                    <tr>
                      <th style={{ width: 90 }}>渠道</th>
                      <th style={{ minWidth: 300 }}>渠道文本</th>
                      <th style={{ minWidth: 220 }}>渠道说明</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((c) => (
                      <tr key={c.code}>
                        <td>
                          <Copyable text={c.code} />
                        </td>
                        <td>{c.text}</td>
                        <td style={{ color: 'var(--ink-300)' }}>{c.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          {channelGroups.length === 0 && (
            <div className="rok-card p-10 text-center" style={{ color: 'var(--ink-500)' }}>
              没有匹配的渠道
            </div>
          )}
        </div>
      )}

      {tab === 'allocation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rok-card p-5" style={{ borderColor: 'rgba(232,162,74,.3)' }}>
            <h3 className="text-[14.5px] font-semibold mb-3" style={{ color: 'var(--gold-400)' }}>
              硬性要求
            </h3>
            <ul className="space-y-2.5">
              {ALLOCATION_RULES.hard.map((r, i) => (
                <li key={i} className="flex gap-2.5 text-[13px]" style={{ color: 'var(--ink-200)' }}>
                  <span style={{ color: 'var(--gold-500)', flexShrink: 0 }}>·</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rok-card p-5">
            <h3 className="text-[14.5px] font-semibold mb-3" style={{ color: 'var(--ink-100)' }}>
              摊销期间
            </h3>
            <ul className="space-y-2.5">
              {ALLOCATION_RULES.period.map((r, i) => (
                <li key={i} className="flex gap-2.5 text-[13px]" style={{ color: 'var(--ink-200)' }}>
                  <span style={{ color: 'var(--mist-400)', flexShrink: 0 }}>·</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {ALLOCATION_RULES.methods.map((m) => (
            <div key={m.name} className="rok-card p-5">
              <h3 className="text-[14.5px] font-semibold mb-2.5" style={{ color: 'var(--ink-100)' }}>
                {m.name}
              </h3>
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--ink-300)' }}>
                {m.desc}
              </p>
            </div>
          ))}
        </div>
      )}

      {tab === 'options' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[
            { title: '付款用途', note: '所有营销费用统一选择「采购款（费用）」', items: PAYMENT_PURPOSES, highlight: true },
            { title: '发票种类', note: '需与发票模块类型、附件发票类型一致', items: INVOICE_TYPES },
            { title: '税率类型', note: '形式发票为 0%，其他按发票确认', items: TAX_RATE_TYPES },
            { title: '币种', note: '需与形式发票、合同币种一致', items: CURRENCIES },
            { title: '付款方式', note: '按实际填写', items: PAYMENT_METHODS },
          ].map((g) => (
            <div key={g.title} className="rok-card p-5">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-[14px] font-semibold" style={{ color: 'var(--ink-100)' }}>
                  {g.title}
                </h3>
                {g.highlight && <span className="rok-pill rok-pill--gold">统一口径</span>}
              </div>
              <p className="text-[12.5px] mb-3" style={{ color: 'var(--ink-500)' }}>
                {g.note}
              </p>
              <div className="flex flex-wrap gap-2">
                {g.items.map((it) => (
                  <Tooltip key={it} content="点击复制">
                    <button
                      className="px-2.5 py-1 rounded-[8px] text-[12.5px] transition-all"
                      style={{
                        background: 'var(--surface-elev)',
                        border: '1px solid var(--hairline)',
                        color: 'var(--ink-200)',
                      }}
                      onClick={() => navigator.clipboard?.writeText(it)}
                    >
                      {it}
                    </button>
                  </Tooltip>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
