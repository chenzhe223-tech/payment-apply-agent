import { Button, Tooltip, Tag } from 'tdesign-react';
import {
  RefreshIcon,
  SunnyIcon,
  MoonIcon,
  MenuFoldIcon,
  MenuUnfoldIcon,
  ChatIcon,
} from 'tdesign-icons-react';
import { Bot } from 'lucide-react';
import { APP_CONFIG } from '../config';
import { Model, Session, Agent, Theme } from '../types';
import { ICON_MAP } from '../utils/iconMap';

type TopView = 'chat' | 'workbench' | 'settings';

interface HeaderProps {
  view: TopView;
  sidebarOpen: boolean;
  theme: Theme;
  currentSession: Session | undefined;
  currentAgent: Agent | undefined;
  models: Model[];
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  onRefreshModels: () => void;
}

export function Header({
  view,
  sidebarOpen,
  theme,
  currentSession,
  currentAgent,
  models,
  onToggleSidebar,
  onToggleTheme,
  onRefreshModels,
}: HeaderProps) {
  const formatModelName = (modelId: string) => {
    const model = models.find((m) => m.modelId === modelId);
    const name = model?.name || modelId;
    return (
      name
        .replace(/^(Claude|GPT|Gemini|Kimi|DeepSeek|Qwen|GLM)\s*/i, '')
        .replace(/-/g, ' ')
        .trim() || name
    );
  };

  const title =
    view === 'settings'
      ? '设置'
      : view === 'workbench'
      ? '填报工作台'
      : currentSession?.title || 'Agent 对话';

  return (
    <header
      className="h-14 flex justify-between items-center px-4 flex-shrink-0"
      style={{ borderBottom: '1px solid var(--hairline)' }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="text"
          shape="circle"
          icon={sidebarOpen ? <MenuFoldIcon /> : <MenuUnfoldIcon />}
          onClick={onToggleSidebar}
        />
        {view === 'chat' && currentAgent && (
          <div
            className="w-7 h-7 rounded-[10px] flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(232,162,74,.28), rgba(201,129,47,.28))',
              border: '1px solid rgba(232,162,74,.35)',
            }}
          >
            {(() => {
              const Icon = ICON_MAP[currentAgent.icon || 'Bot'] || Bot;
              return <Icon size={14} color="#F2B96B" />;
            })()}
          </div>
        )}
        {view === 'workbench' && (
          <span style={{ color: 'var(--gold-400)' }}>
            <ChatIcon size={16} />
          </span>
        )}
        <h1
          className="text-[15px] font-semibold truncate"
          style={{ color: 'var(--ink-100)' }}
        >
          {title}
        </h1>
        {view === 'chat' && currentSession && (
          <Tag size="small" variant="outline">
            {formatModelName(currentSession.model)}
          </Tag>
        )}
        {view === 'workbench' && (
          <Tag size="small" variant="outline">
            {APP_CONFIG.scope.split('（')[0]}
          </Tag>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Tooltip content={theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}>
          <Button
            variant="outline"
            shape="circle"
            icon={theme === 'light' ? <MoonIcon /> : <SunnyIcon />}
            onClick={onToggleTheme}
          />
        </Tooltip>
        {view === 'chat' && (
          <Tooltip content="刷新模型列表">
            <Button
              variant="outline"
              shape="circle"
              icon={<RefreshIcon />}
              onClick={onRefreshModels}
            />
          </Tooltip>
        )}
      </div>
    </header>
  );
}
