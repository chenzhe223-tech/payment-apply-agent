import { useState } from 'react';
import { APP_CONFIG } from '../config';
import { WorkflowGuide } from '../views/WorkflowGuide';
import { MasterData } from '../views/MasterData';
import { ApplicationWorkbench } from '../views/ApplicationWorkbench';

type Tab = 'apply' | 'flow' | 'master';

const TABS: { key: Tab; label: string; desc: string }[] = [
  { key: 'apply', label: '填报工作台', desc: '按财务中台字段逐项填写，实时校验' },
  { key: 'flow', label: '流程指引', desc: '六步主干流程与高频差错' },
  { key: 'master', label: '主数据速查', desc: '项目号 / 渠道 / 费用小类 / 分摊规则' },
];

export function WorkbenchPage({ onSendToAgent }: { onSendToAgent?: (text: string) => void }) {
  const [tab, setTab] = useState<Tab>('apply');
  const current = TABS.find((t) => t.key === tab)!;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1280px] mx-auto px-6 py-5">
        {/* 页头 */}
        <div className="mb-5">
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <h1 className="text-[22px] font-semibold" style={{ color: 'var(--ink-100)' }}>
              西南欧营销费用 · 付款填报助手
            </h1>
            <span className="rok-pill rok-pill--gold">v{APP_CONFIG.version}</span>
          </div>
          <p className="text-[13px]" style={{ color: 'var(--ink-400)' }}>
            覆盖范围：{APP_CONFIG.scope} · 口径来源：
            <a
              href={APP_CONFIG.source.url}
              target="_blank"
              rel="noreferrer"
              className="underline ml-1"
              style={{ color: 'var(--gold-400)' }}
            >
              {APP_CONFIG.source.title}
            </a>
          </p>
        </div>

        {/* 页签 */}
        <div className="rok-seg mb-5">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`rok-seg__item ${tab === t.key ? 'is-active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <p className="text-[12.5px] mb-4" style={{ color: 'var(--ink-500)' }}>
          {current.desc}
        </p>

        {tab === 'apply' && <ApplicationWorkbench onSendToAgent={onSendToAgent} />}
        {tab === 'flow' && <WorkflowGuide />}
        {tab === 'master' && <MasterData />}
      </div>
    </div>
  );
}

export default WorkbenchPage;
