import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * 纯静态构建配置 —— 供 GitHub Pages 部署使用。
 *
 * 与 vite.config.ts（全栈开发用）的区别：
 *   · 入口为 index.static.html，只打包前端，不含 Express / Agent SDK
 *   · base 由环境变量 DEPLOY_BASE 控制：
 *       - 用户主页仓库 (xxx.github.io)          → '/'
 *       - 项目仓库     (xxx.github.io/repo/)    → '/repo/'
 *   · 关闭 sourcemap、分离 vendor chunk，减小首屏体积
 */
export default defineConfig({
  base: process.env.DEPLOY_BASE || '/',
  plugins: [react()],
  build: {
    outDir: 'dist-static',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        index: 'index.static.html',
      },
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          tdesign: ['tdesign-react', 'tdesign-icons-react'],
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
});
