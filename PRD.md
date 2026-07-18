# Atelier Zero P0 PRD

## 目标

交付一个可静态部署的 Next.js Web 产品：用户搜索公共领域馆藏作品，选择有限构图与画幅，得到可下载、可分享的 PNG 海报。

## 开发任务

- [ ] 实现 AIC 响应校验、CC0 门禁、节流和失败降级。
- [ ] 实现海报状态、URL 编解码、Canvas 预览与三种尺寸导出。
- [ ] 实现搜索列表、三种模板、三种画幅、缩放与焦点控制。
- [ ] 实现下载、Web Share/复制降级和匿名转化事件。
- [ ] 实现 metadata、robots、sitemap、manifest、JSON-LD、OG 图和少量静态长尾页。
- [ ] 完成单测、Playwright、设计审查、Factory P0 与 Growth 审计。

## 完成标准

- [ ] `.factory` 合同无占位符并通过 Schema。
- [ ] `npm run check`、`npm test`、`npm run build` 全部通过。
- [ ] 1440×900、768×1024、390×844 的首屏与完成态无重叠、溢出或空白画布。
- [ ] 非公共领域作品无法进入预览或导出。
- [ ] 分享链接可恢复，下载 PNG 尺寸和像素正确。
- [ ] 未提交密钥、环境文件、用户数据或临时调试文件。
