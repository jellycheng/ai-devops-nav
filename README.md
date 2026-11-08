# AI DevOps Nav

面向 **AI 辅助开发与运维** 的静态网址导航：卡片展示、搜索与分组筛选，支持 `#group_code` 分享当前分组。

## 在线访问

`https://jellycheng.github.io/ai-devops-nav/`

## 本地预览

需通过本地 HTTP 服务打开（避免 `file://` 下脚本限制）：

```bash
# 仓库根目录
python3 -m http.server 8080
```

浏览器打开 <http://localhost:8080/> 。

## 目录结构

```text
index.html      # 入口页
assets/         # nav.css、nav.js
data/sites.js   # 导航数据（window.NAV_SITES）
```

## 更新数据

站点列表数据可在 `data/sites.js`中修改。

## License

MIT — 见 [LICENSE](LICENSE)。
