# 月光宝盒 (Mooncase)

> 纯客户端的中文在线工具箱 — 所有处理在浏览器本地完成，数据不上传服务器。

## 工具列表

### 文本处理（11 个）
文本差异对比 · 全半角转换 · 字符统计 · 文本去重 · 单词提取 · 文本替换与提取 · 字符文字计数器 · 大小写转换器 · 繁简中文转换器 · 英文大小写转化器 · 汉字转拼音

### 文档 PDF（6 个）
Markdown 转 Word · Markdown 文件预览器 · 图片转 PDF · PDF 合并 · PDF 拆分 · PDF 压缩 · Word/PDF 预览

### 图片处理（8 个）
图片格式转换 · 图片压缩 · 图片裁剪 · GIF 制作 · 动态头像生成器 · 图片取色器 · OCR 文字识别 · AI 图片超分辨率

### 音视频（5 个）
音频格式转换 · 特殊格式转换 · 视频格式转换 · 视频转 GIF · 视频转 MP3 · 视频压缩

### 开发调试（12 个）
代码美化 · HTML/CSS/JS 在线运行 · 正则测试 · 代码高亮工具 · ER 实体关系图 · Mermaid 流程图 · UUID 生成器 · JWT 解码器 · HTTP 请求测试器 · 时间戳转换 · Cron 表达式解析 · Linux 命令生成器

### 数据格式（2 个）
JSON 格式化 · 数据格式转换（CSV/JSON/XML）

### 编码解码（8 个）
Base64 编码 · URL 编码 · Unicode 编解码器 · BaseX 编解码器（Base32/58/62） · 摩斯密码转换器 · 图片 Base64 互换 · 图片转 Base64 · SVG 转 Base64

### 二维码（2 个）
二维码生成 · 二维码扫描

### 内容生成（2 个）
占位文生成 · ASCII 文字图片生成器

### 密码安全（6 个）
密码生成器 · 哈希生成（MD5/SHA） · HMAC 签名 · 对称加密（AES-256） · 凯撒密码 · 栅栏密码

### 网络诊断（8 个）
IP 地址查询 · 在线 Ping · 在线 TCPing · 网站测速 · 路由追踪 · DNS 查询 · FindPing · 本地网络

## 技术栈

- **框架**: 原生 TypeScript + Vite（无前端框架）
- **路由**: 基于 hash 的自研懒加载路由
- **样式**: CSS 自定义属性（Design Tokens），支持暗色/亮色模式
- **WASM 依赖**:
  - [FFmpeg WASM](https://github.com/nicedoc/ffmpeg.wasm) — 视频/音频/图片处理，支持多线程与自动降级
  - [Tesseract.js](https://github.com/naptha/tesseract.js) — OCR 文字识别
- **核心库**: pdf-lib（PDF 操作）、Mermaid（流程图）、jsQR（二维码识别）、OpenCC（繁简转换）

## 本地开发

```bash
npm install
npm run dev       # 自动复制 WASM 文件，启动带 COOP/COEP 头的开发服务器
```

## 构建

```bash
npm run build     # 类型检查 + Vite 生产构建
npm run preview   # 预览生产构建
```

## 项目结构

```
src/
├── core/          # 路由、注册表、图标、搜索、主题、存储、Toast
├── pages/         # 分类页、首页
│   └── tools/     # 每个工具独立文件，lazy-loaded
└── styles/        # CSS tokens、布局、基础样式
```

## License

MIT
