# Atelier Zero 质量验证

## 通过项

- ESLint：通过。
- TypeScript：通过。
- Vitest：3 个文件、8 项测试通过。
- Next.js 静态构建：19 个路由全部生成。
- Playwright：桌面与移动共 8 项测试通过。
- Canvas：抽样像素非空。
- PNG：下载文件大于 100KB。
- URL：可恢复作品、模板、画幅、缩放与焦点。
- API 失败：保留精选作品和当前海报。
- 真实 API：`Monet` 返回 12 个公共领域有图作品，无请求失败。
- Factory Growth v2：Schema、变现规则与所有证据路径通过。

## 发布前仍需

- 创建独立 GitHub 仓库并推送 `main`。
- 建立 Vercel 项目、设置真实 `NEXT_PUBLIC_SITE_URL` 并部署。
- 部署后验证 canonical、robots、sitemap、manifest、OG 图和未知路由状态。
- 建立首个生产回退标签。
