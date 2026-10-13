import { Menu, Sun, Moon, ExternalLink } from 'lucide-react';
import { APP_CONFIG } from '../config';

type View = 'apply' | 'flow' | 'master' | 'help';

const TITLES: Record<View, string> = {
  apply: '填报工作台',
  flow: '流程指引',
  master: '主数据速查',
  help: '使用说明',
};

export function StaticHeader({
  view,
  theme,
  onToggleSidebar,
  onToggleTheme,
  onNavigate,
}: {
  view: View;
  theme: string;
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  onNavigate: (v: View) => void;
}) {
  return (
    <header
      className="flex items-center gap-3 px-4 md:px-5 shrink-0"
      style={{
        height: 56,
        background: 'rgba(6,19,31,.6)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--hairline)',
      }}
    >
      <button
        className="md:hidden"
        onClick={onToggleSidebar}
        style={{ color: 'var(--ink-300)' }}
        aria-label="打开菜单"
      >
        <Menu size={19} />
      </button>

      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <span
          className="flex items-center justify-center rounded-[8px] shrink-0"
          style={{ width: 26, height: 26, background: 'rgba(232,162,74,.14)' }}
        >
          <span className="text-[12px] font-bold" style={{ color: 'var(--gold-400)' }}>
            付
          </span>
        </span>
        <span className="text-[14.5px] font-medium truncate" style={{ color: 'var(--ink-100)' }}>
          {TITLES[view]}
        </span>
      </div>

      <a
        href={APP_CONFIG.source.url}
        target="_blank"
        rel="noreferrer"
        className="hidden sm:flex items-center gap-1.5 text-[12.5px] px-3 py-1.5 rounded-[999px] transition-colors"
        style={{
          color: 'var(--gold-400)',
          border: '1px solid rgba(232,162,74,.28)',
          background: 'rgba(232,162,74,.08)',
          transitionDuration: 'var(--dur-fast)',
        }}
        title="查看口径来源文档"
      >
        <ExternalLink size={12} />
        口径来源
      </a>

      <button
        onClick={onToggleTheme}
        className="flex items-center justify-center rounded-[999px]"
        style={{
          width: 32,
          height: 32,
          color: 'var(--ink-300)',
          border: '1px solid var(--hairline)',
        }}
        title="切换主题"
        aria-label="切换主题"
      >
        {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
      </button>
    </header>
  );
}

export default StaticHeader;
