- 正在完成的是一个名为 TorrentHub 的 private tracker网站，该工程为前端部分。
- 前端使用 next.js 开发，样式库是tailwindcss，组件库目前使用 heroUI
- 缩进都是4个空格，前端也是4个空格！！
- 如果有觉得API设计的不合理，可以立马告知我!
- 后端的 API 参考：@dev_use/openapi

## TODO：

这个报错是 Next.js 的一项安全机制导致的。为了防止滥用，它要求所有外部图片的域名必须在 next.config.ts 文件中明确配置后，才能被 <Image> 组件加载。
目前：允许所有域名（最灵活，但安全性最低）
