# Atelier Zero 设计系统

## Design Read

Atelier Zero 是面向结果的公共领域艺术海报工作台。视觉质量不是装饰变量，而是用户下载、分享和未来付费的核心价值。界面必须让作品成为主角，同时提供比通用模板工具更明确的版权来源与排版判断。

## Tokens

```css
--paper: #f2f0e8;
--paper-bright: #fbfaf6;
--ink: #161616;
--muted: #69675f;
--line: #cbc8bd;
--cobalt: #2454d6;
--vermilion: #d64a32;
--signal: #c8d63a;
--radius-sm: 2px;
--radius-md: 4px;
```

纸白只作为工具基底，不能让页面读成米色主题；钴蓝用于选择和链接，朱红用于导出/重要状态，黄绿色只用于小型版权与可用性信号。

## Typography

- 品牌与控件：`Arial`, `Helvetica`, sans-serif，常规字距 0。
- 海报标题：`Georgia`, `Times New Roman`, serif。
- 数据与编号：`Consolas`, `SFMono-Regular`, monospace。
- 正文最小 16px；紧凑工具标签可为 12-13px，但不得承担长说明。

## Composition

- 桌面三轨工作台：搜索/结果、海报舞台、样式/导出。
- 面板用 1px 边界定义，不浮成卡片。
- 海报始终有明确 aspect-ratio 和最大尺寸，异步图片、状态文案和按钮不会改变轨道宽度。
- 首屏不放功能介绍；版权来源、隐私和指南放在页面底部或独立路由。

## Motion

- 120-180ms 颜色、边框和轻微透明度过渡。
- 作品切换使用 180ms crossfade，不缩放画布。
- `prefers-reduced-motion` 下移除所有非必要动画。

## Interaction

- 图标按钮使用 Lucide 并带 `aria-label`/title。
- 模板和画幅使用 segmented control。
- 缩放与焦点使用 range 控件，数值不会改变面板宽度。
- 分享优先文件分享；不支持时复制可恢复链接。
