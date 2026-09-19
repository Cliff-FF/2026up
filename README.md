# 顺月

仅在 `apps/shunyue` 内维护，独立安装、构建与部署。

## 运行

Node.js 24+。`npm ci` 后复制 `.env.example` 为 `.env.local`，填写与 FFCLIFF 主站相同的公开 Supabase URL 和 anon key，以及原注册付款页地址。

- `npm run dev`：Vite + 本地会员验证 API。
- `npm run lint`：TypeScript 检查。
- `npm test`：会员验证与详情访问边界测试。
- `npm run build && npm start`：本地生产构建与 Node 服务；可设置 `PORT`。

Vercel 部署直接使用 `vercel.json` 与 `api/month-detail.mjs`，不需要运行 `npm start`。不能仅发布 dist 或使用 vite preview，因为月度详情需要 `/api/month-detail` 服务端验证。生产运行时也必须配置 Supabase 环境变量。月度付费文案只存在于服务端文件中，不进入浏览器包。

## Vercel 部署

在 Vercel 导入 GitHub 仓库：如果导入的是整个 workspace，将 Root Directory 设置为 `apps/shunyue`；如果导入的是顺月独立仓库，保持默认。Build Command 为 `npm run build`，Output Directory 为 `dist`，Install Command 为 `npm ci`。

在 Project Settings → Environment Variables 中为 Production、Preview、Development 配置 `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY` 与 `VITE_FFCLIFF_PRO_URL`，然后重新 Deploy。不要配置 Supabase service-role key。

## 结果与会员流程

12 个月总览、生辰表、性格解读和城市灵感免费。年度行动卡可导出 PNG，不含生辰输入。报告暂存在当前标签页的 sessionStorage，刷新可恢复，重新测算会清除。

点击月份 → 验证已登录账户 → 非会员展示 FFCLIFF Pro ¥99/年入口 → 在新标签页打开原注册付款页面。因主站与顺月跨域、主站未提供 SSO 回传，返回后需在顺月使用同一账户登录一次。顺月在弹窗可见时每 15 秒及窗口重新聚焦时查询服务端；主站人工审核通过后自动打开所选月份。拒绝、未开通、失效登录及验证失败均不返回付费文案。

## 已知主站接口限制

主站目前用人工付款审核，不是支付网关即时回调；其 memberships 表只有 status，没有 expires_at。顺月严格使用现有服务端 `status = active` 权限，不自行创建付款成功状态。界面按照产品要求展示 ¥99/年，但年度到期、跨站无感登录与自动支付回调需要主站/共享后端增加能力，本次未修改其他仓库。

原生辰计算为近似节气与城市经度换算。月序为 2026 年 1–12 月；每月按节气起始日命名，非公历整月。详情是对应十神的传统解读与行动建议，不是事件概率预测。

## 内容与推荐

- 12 张月份卡及导出海报标注流月天干对应的十神。
- 性格总结使用实际问卷中的社交、行动、判断选择，不再按生日种子随机挑长文；年度主题使用日主与 2026 丙火的十神关系。
- 问卷最后增加 3 道旅居偏好题，结果页可重新选择。`src/lib/cities.ts` 收录 24 个国内、24 个国外城市或旅居目的地（乌布、苍古明确标注为巴厘岛目的地）。按环境兴趣、生活节奏、相处方式分别加权 8/4/2，同分按稳定目录顺序排列；不使用随机数或伪造契合度。
- 初始推荐国内外各 3 个，每次展开各增加 3 个，直至看完全部目录。理由来自真实匹配的标签，列出当地特征与住前考虑事项。不计算实时房租、签证、网速或空气质量；节奏和社交标签是编辑建议，不是测量数据。
- 新报告缓存使用 `shunyue-report-v3`。旧报告需重新测一次，避免旧长文及固定城市缓存混入新版。

目的地资料参考：[日本国家旅游局](https://www.japan.travel/en/destinations/)、[京都旅游](https://kyoto.travel/en/destinations)、[越南旅游](https://vietnam.travel/node/6)、[岘港](https://www.vietnam.travel/places-to-go/central-vietnam/da-nang)、[印度尼西亚旅游·乌布](https://www.indonesia.travel/gb/en/destination/bali-nusa-tenggara/bali/ubud)、[马来西亚旅游](https://www.malaysia.travel/travel-ideas)、[葡萄牙旅游](https://www.visitportugal.com/en)、[成都城市门户](https://www.gochengdu.cn/en/en)。城市特征为人工整理，偏好匹配规则为顺月自己的产品规则。
