# HXVP Studio — v2 (独立重制版)

> ⚠️ **这是一个独立的本地重制项目,不会影响原线上版本**
> 原版站点 https://hxvp-studio-frontend.onrender.com/production 由原仓库
> [`nbzxy1993/HXVP-Studio`](https://github.com/nbzxy1993/HXVP-Studio) 自动部署,**与本目录无任何关联**。
>
> 本目录已做以下隔离:
> - 已删除 git `origin` 远程(不会误推回原仓库)
> - `render.yaml` → `render.yaml.legacy`(禁用 Render Blueprint 自动部署)
> - `backend/` → `backend.legacy/`(仅供参考,不参与构建)
> - 当前阶段 **不带后端**,先纯静态前端迭代

---

## 当前阶段:纯静态前端

技术栈保留:React 19 + Vite + Tailwind CSS v4 + React Router v7 + TanStack Query。

API 层(`src/api/client.js`)在没有 `VITE_API_BASE_URL` 时会请求 `/api`,但本阶段没有后端,
请求会失败 —— 这是预期行为,后续会逐页改成 mock 数据或新接口。

### 本地启动

```bash
cd frontend
npm install
npm run dev
```

打开 http://localhost:5173 即可。

### 构建静态产物

```bash
cd frontend
npm run build
# 产物在 frontend/dist/
```

---

## 原版相关资料(只读参考)

- `backend.legacy/` —— 原 Django 后端代码
- `render.yaml.legacy` —— 原 Render Blueprint
- `docker-compose.yml` —— 原 Docker 配置
- `doc_ref/` —— 设计参考文档
- `production/` —— 设计素材(需求 Excel、截图、word 资料)
- `test-accounts.txt` —— 原演示账号(v2 暂未使用)

## 四个角色门户(沿用结构)

- Production `/production/` —— 工作室管理后台
- Client `/client/` —— 客户端项目查看
- Talent `/talent/` —— 模特/演员预约管理
- Crew `/crew/` —— 制作组档期管理
