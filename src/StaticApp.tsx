import { useState, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

import { useTheme } from './hooks/useTheme';
import { APP_CONFIG } from './config';

import { StaticSidebar } from './components/StaticSidebar';
import { StaticHeader } from './components/StaticHeader';
import { WorkflowGuide } from './views/WorkflowGuide';
import { MasterData } from './views/MasterData';
import { ApplicationWorkbench } from './views/ApplicationWorkbench';
import { GuidePage } from './views/GuidePage';

type View = 'apply' | 'flow' | 'master' | 'help';

export function StaticApp() {
  return (
    <Routes>
      <Route path="*" element={<StaticShell />} />
    </Routes>
  );
}

function StaticShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const path = location.pathname.replace(/\/+$/, '') || '/';
  const view: View =
    path === '/flow' ? 'flow' : path === '/master' ? 'master' : path === '/help' ? 'help' : 'apply';

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const go = useCallback(
    (v: View) => {
      const target = v === 'apply' ? '/' : `/${v}`;
      navigate(target);
      setSidebarOpen(false);
      window.scrollTo({ top: 0 });
    },
    [navigate],
  );

  return (
    <div className="flex h-screen w-screen" style={{ backgroundColor: 'transparent' }}>
      <StaticSidebar
        view={view}
        sidebarOpen={sidebarOpen}
        onNavigate={go}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col min-w-0" style={{ backgroundColor: 'transparent' }}>
        <StaticHeader
          view={view}
          theme={theme}
          onToggleSidebar={() => setSidebarOpen((s) => !s)}
          onToggleTheme={toggleTheme}
          onNavigate={go}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1280px] mx-auto px-5 md:px-7 py-5 md:py-7">
            {view === 'apply' && <ApplyView />}
            {view === 'flow' && <SectionView title="流程指引" desc="六步主干流程、每阶段要点与高频差错" Comp={WorkflowGuide} />}
            {view === 'master' && <SectionView title="主数据速查" desc="项目号 / 渠道 / 费用小类 / 分摊规则，点击即复制" Comp={MasterData} />}
            {view === 'help' && <GuidePage onNavigate={go} />}
          </div>
        </div>
      </main>
    </div>
  );
}

/** 填报工作台首屏 —— 直接进入表单，不做页签中转 */
function ApplyView() {
  return (
    <div>
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

      <ApplicationWorkbench />
    </div>
  );
}

function SectionView({
  title,
  desc,
  Comp,
}: {
  title: string;
  desc: string;
  Comp: () => JSX.Element;
}) {
  return (
    <div>
      <div className="mb-5">
        <h1 className="text-[22px] font-semibold mb-2" style={{ color: 'var(--ink-100)' }}>
          {title}
        </h1>
        <p className="text-[13px]" style={{ color: 'var(--ink-400)' }}>
          {desc}
        </p>
      </div>
      <Comp />
    </div>
  );
}

export default StaticApp;
