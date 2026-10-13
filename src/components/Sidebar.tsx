import { Button, Tooltip } from 'tdesign-react';
import { AddIcon, DeleteIcon, SettingIcon, EditIcon } from 'tdesign-icons-react';
import { Bot } from 'lucide-react';
import { APP_CONFIG } from '../config';
import { Session, Agent } from '../types';
import { ICON_MAP } from '../utils/iconMap';

interface SidebarProps {
  sessions: Session[];
  currentSessionId: string | null;
  isSettingsPage: boolean;
  isWorkbenchPage: boolean;
  sidebarOpen: boolean;
  agents: Agent[];
  getAgent: (id: string) => Agent | undefined;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onOpenSettings: () => void;
  onOpenWorkbench: () => void;
  onOpenChat: () => void;
}

export function Sidebar({
  sessions,
  currentSessionId,
  isSettingsPage,
  isWorkbenchPage,
  sidebarOpen,
  agents,
  getAgent,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onOpenSettings,
  onOpenWorkbench,
  onOpenChat,
}: SidebarProps) {
  const isChatActive = !isSettingsPage && !isWorkbenchPage;

  return (
    <aside
      className="flex flex-col flex-shrink-0 transition-all duration-300 overflow-hidden"
      style={{
        width: sidebarOpen ? 264 : 0,
        backgroundColor: 'rgba(8,32,47,.72)',
        borderRight: '1px solid var(--hairline)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Logo */}
      <div className="h-14 px-4 flex items-center flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-[10px] flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--gold-400), var(--gold-600))',
              boxShadow: 'var(--glow-gold)',
            }}
          >
            <span className="text-[15px] font-bold" style={{ color: 'var(--on-gold)' }}>
              {APP_CONFIG.nameInitial}
            </span>
          </div>
          <div className="min-w-0">
            <div
              className="text-[15px] font-semibold leading-tight truncate"
              style={{ color: 'var(--ink-100)' }}
            >
              {APP_CONFIG.name}
            </div>
            <div className="text-[11px] leading-tight" style={{ color: 'var(--ink-500)' }}>
              西南欧 · 营销费用
            </div>
          </div>
        </div>
      </div>

      {/* 主导航 */}
      <div className="px-3 pb-1 space-y-1">
        <NavItem
          label="填报工作台"
          hint="表单填写 + 实时校验"
          active={isWorkbenchPage}
          onClick={onOpenWorkbench}
          icon={<EditIcon />}
        />
      </div>

      {/* 新对话 */}
      <div className="px-3 pt-2">
        <Button
          icon={<AddIcon />}
          onClick={onNewChat}
          block
          variant={isChatActive && !currentSessionId ? 'outline' : 'text'}
        >
          新对话
        </Button>
      </div>

      <div
        className="px-4 pt-3 pb-1.5 text-[11px] tracking-wide flex-shrink-0"
        style={{ color: 'var(--ink-500)' }}
      >
        对话记录
      </div>

      {/* 会话列表 */}
      <div className="flex-1 overflow-y-auto p-2 pt-0 space-y-0.5">
        {sessions.length === 0 && (
          <div className="px-3 py-6 text-[12.5px] text-center" style={{ color: 'var(--ink-500)' }}>
            暂无对话记录
          </div>
        )}
        {sessions.map((session) => {
          const sessionAgent = session.agentId ? getAgent(session.agentId) : getAgent('default');
          const AgentIcon = ICON_MAP[sessionAgent?.icon || 'Bot'] || Bot;
          const active = session.id === currentSessionId && isChatActive;
          return (
            <div
              key={session.id}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-[12px] cursor-pointer transition-all group"
              style={{
                backgroundColor: active ? 'rgba(232,162,74,.12)' : 'transparent',
                border: `1px solid ${active ? 'rgba(232,162,74,.3)' : 'transparent'}`,
                color: active ? 'var(--gold-400)' : 'var(--ink-300)',
              }}
              onClick={() => onSelectSession(session.id)}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = 'var(--surface-elev)';
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div
                className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center"
                style={{ backgroundColor: active ? 'rgba(232,162,74,.22)' : 'var(--surface-elev)' }}
              >
                <span style={{ color: active ? 'var(--gold-400)' : 'var(--ink-400)', display: 'flex' }}>
                  <AgentIcon size={12} color={active ? '#F2B96B' : '#7E94A6'} />
                </span>
              </div>
              <span className="flex-1 truncate text-[13px]">{session.title}</span>
              <Tooltip content="删除会话">
                <Button
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  variant="text"
                  shape="circle"
                  size="medium"
                  icon={<DeleteIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                />
              </Tooltip>
            </div>
          );
        })}
      </div>

      {/* 底部 */}
      <div className="p-3 flex-shrink-0 space-y-1" style={{ borderTop: '1px solid var(--hairline)' }}>
        <NavItem label="设置" active={isSettingsPage} onClick={onOpenSettings} icon={<SettingIcon />} />
      </div>
    </aside>
  );
}

function NavItem({
  label,
  hint,
  active,
  onClick,
  icon,
}: {
  label: string;
  hint?: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[12px] transition-all text-left"
      style={{
        backgroundColor: active ? 'rgba(232,162,74,.12)' : 'transparent',
        border: `1px solid ${active ? 'rgba(232,162,74,.3)' : 'transparent'}`,
        color: active ? 'var(--gold-400)' : 'var(--ink-300)',
      }}
    >
      <span style={{ color: active ? 'var(--gold-400)' : 'var(--ink-400)' }}>{icon}</span>
      <span className="flex-1">
        <span className="block text-[13px] font-medium">{label}</span>
        {hint && (
          <span className="block text-[11px] mt-0.5" style={{ color: 'var(--ink-500)' }}>
            {hint}
          </span>
        )}
      </span>
    </button>
  );
}
