import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { StaticApp } from './StaticApp';
import { APP_CONFIG } from './config';
import 'tdesign-react/esm/style/index.js';
import './index.css';

// 设置页面标题
document.title = APP_CONFIG.name;

/**
 * 计算路由 basename。
 *
 * 构建时 Vite 会把 base 注入到 import.meta.env.BASE_URL，
 * 例如项目仓库部署为 '/payment-apply-agent/'，用户主页仓库为 '/'。
 * BrowserRouter 需要这段前缀，否则深链接与跳转会丢掉仓库路径。
 */
const BASE_URL = import.meta.env.BASE_URL || '/';
const basename = BASE_URL.replace(/\/+$/, '') || '/';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <StaticApp />
    </BrowserRouter>
  </React.StrictMode>,
);
