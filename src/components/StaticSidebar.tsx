import {
  FileEdit,
  GitBranch,
  Database,
  CircleHelp,
  X,
  type LucideIcon,
} from 'lucide-react';
import { APP_CONFIG } from '../config';

type View = 'apply' | 'flow' | 'master' | 'help';

const NAV: { key: View; label: string; desc: string; icon: LucideIcon }[] = [
  { key: 'apply', label: '填报工作台', desc: '表单填写 · 实时校验', icon: FileEdit },
  { key: 'flow', label: '流程指引', desc: '六步主干 · 高频差错', icon: GitBranch },
  { key: 'master', label: '主数据速查', desc: '项目号 / 渠道 / 映射', icon: Database },
  { key: 'help', label: '使用说明', desc: '校验规则 · 部署信息', icon: CircleHelp },
];

export function StaticSidebar({
  view,
  sidebarOpen,
  onNavigate,
  onClose,
}: {
  view: View;
  sidebarOpen: boolean;
  onNavigate: (v: View) => void;
  onClose: () => void;
}) {
  return (
    <>
      {/* 移动端遮罩 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: 'rgba(3,11,20,.6)', backdropFilter: 'blur(2px)' }}
          onClick={onClose}
        />
      )}

      <aside
        className={[
          'z-40 flex flex-col shrink-0 transition-transform',
          'fixed md:static inset-y-0 left-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
        style={{
          width: 244,
          background: 'rgba(6,19,31,.72)',
          backdropFilter: 'blur(14px)',
          borderRight: '1px solid var(--hairline)',
        }}
      >
        {/* 品牌 */}
        <div className="px-4 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid var(--hairline)' }}>
          <div
            className="flex items-center justify-center rounded-[14px] shrink-0"
            style={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, var(--gold-400), var(--gold-600))',
              color: 'var(--on-gold)',
              boxShadow: 'var(--glow-gold)',
            }}
          >
            <span className="text-[17px] font-bold">付</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13.5px] font-semibold truncate" style={{ color: 'var(--ink-100)' }}>
              {APP_CONFIG.name}
            </div>
            <div className="text-[11px] truncate" style={{ color: 'var(--ink-500)' }}>
              西南欧 · 营销费用
            </div>
          </div>
          <button className="md:hidden" onClick={onClose} style={{ color: 'var(--ink-400)' }} aria-label="关闭菜单">
            <X size={17} />
          </button>
        </div>

        {/* 导航 */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {NAV.map((n) => {
            const active = view === n.key;
            const Icon = n.icon;
            return (
              <button
                key={n.key}
                onClick={() => onNavigate(n.key)}
                className="w-full flex items-center gap-3 text-left rounded-[14px] px-3 py-2.5 transition-colors"
                style={{
                  background: active ? 'rgba(232,162,74,.12)' : 'transparent',
                  border: `1px solid ${active ? 'rgba(232,162,74,.28)' : 'transparent'}`,
                  transitionDuration: 'var(--dur-fast)',
                }}
              >
                <Icon size={16} color={active ? '#F2B96B' : '#7E94A6'} />
                <div className="min-w-0 flex-1">
                  <div
                    className="text-[13px] font-medium truncate"
                    style={{ color: active ? 'var(--gold-400)' : 'var(--ink-200)' }}
                  >
                    {n.label}
                  </div>
                  <div className="text-[11px] truncate" style={{ color: 'var(--ink-500)' }}>
                    {n.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* 底部 */}
        <div className="px-4 py-3" style={{ borderTop: '1px solid var(--hairline)' }}>
          <div className="text-[11px] leading-relaxed" style={{ color: 'var(--ink-500)' }}>
            静态版 · 无需登录
            <br />
            数据仅存于本机浏览器
          </div>
        </div>
      </aside>
    </>
  );
}

export default StaticSidebar;
