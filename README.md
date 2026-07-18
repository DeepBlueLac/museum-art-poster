# Atelier Zero

Atelier Zero 是一个开放馆藏名画海报生成器。用户搜索作品、艺术家或主题，选择有限的专业构图与画幅，然后下载或分享一张带来源说明的 PNG 海报。

## 当前能力

- 直连 Art Institute of Chicago API 与 IIIF，无需 API Key。
- 只允许 `is_public_domain=true` 且存在 `image_id` 的作品进入预览和导出。
- Exhibition、Full Bleed、Archive 三种构图。
- 4:5、1:1、9:16 三种画幅，支持有限缩放和焦点调整。
- Canvas 同源预览与 1600px / 1080×1920 PNG 导出。
- Web Share 文件分享、系统分享、复制可恢复链接降级。
- 6 个精选作品页、3 个真实任务指南、robots、sitemap、manifest、JSON-LD 与 1200×630 产品截图。
- Vercel Analytics 记录匿名任务事件，不记录搜索词。

## 本地运行

```bash
npm install
npm run dev
```

默认访问 `http://localhost:3000`。正式站点地址通过以下变量覆盖：

```text
NEXT_PUBLIC_SITE_URL=https://your-production-domain.example
```

项目没有私有 API Key。`.env*` 默认被 Git 忽略，只有 `.env.example` 可提交。

## 验证

```bash
npm run check
npm test
npm run build
npm run test:e2e
```

Factory 增长合同审计：

```powershell
& '..\..\DBL-Tool-Factory\skill\dbl-tool-factory\scripts\audit-product.ps1' `
  -Path (Get-Location) `
  -Growth
```

当前自动化覆盖公共领域门禁、分享状态编解码、裁切边界、Canvas 非空像素、PNG 文件大小、URL 恢复、API 失败降级、移动端溢出与 44px 触控目标。

## 数据与版权边界

- 作品搜索和元数据来自 [Art Institute of Chicago API](https://api.artic.edu/docs/)。
- 图像来自 API 返回的 IIIF 服务地址。
- 仅显示和导出馆方 API 明确标记为公共领域的作品。
- 每张导出图保留作品、艺术家、日期和馆藏来源信息；详情见 [docs/DATA-SOURCES.md](docs/DATA-SOURCES.md)。

## 明确不做

- 不上传用户图片，不做 AI 滤镜或通用图层编辑器。
- 不做账户、云同步、团队权限、打印履约或真实支付。
- 不批量生成数万条只有标题和图片的 SEO 页面。
- 首版不展示广告，也不使用付费买量。

产品、设计、增长和验收边界分别记录在 `.factory/`、[DESIGN.md](DESIGN.md)、[docs/DISTRIBUTION.md](docs/DISTRIBUTION.md) 与 [docs/ACCEPTANCE.md](docs/ACCEPTANCE.md)。
