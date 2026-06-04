# 月光宝盒 (Mooncase)

高效、安全、免安装的在线工具箱。所有功能在浏览器本地运行，数据不上传服务器。

## 功能分类

### 文本工具
文本差异对比 / 全半角转换 / 字符统计 / 文本去重 / 单词提取 / 文本替换与提取 / 字符文字计数器 / 大小写转换器 / 繁简中文转换器 / 英文大小写转化器 / 汉字转拼音

### 图片工具
图片压缩 / 图片裁剪 / GIF 制作 / 动态头像生成器 / 图片取色器 / OCR 文字识别 / AI 图片超分辨率 / 二维码扫描

### 代码工具
JSON 格式化 / 代码美化 / HTML/CSS/JS 在线运行 / 正则测试 / Markdown 文件预览器 / 代码高亮工具 / ER 实体关系图 / Mermaid 流程图

### 编码解码
Base64 编码 / URL 编码 / Unicode 编解码器 / BaseX 编解码器 / 摩斯密码转换器 / JWT 解码器 / 图片 Base64 互换 / 图片转 Base64 / SVG 转 Base64

### 格式转换
Markdown 转 Word / 图片格式转换 / 图片转 PDF / 数据格式转换 / 音频格式转换 / 视频格式转换 / 视频转 GIF / 视频转 MP3 / 视频压缩

### 生成器
UUID 生成器 / 占位文生成 / 二维码生成 / ASCII 文字图片生成器

### 安全工具
密码生成器 / 哈希生成 / HMAC 签名 / 对称加密 (AES-256) / 凯撒密码 / 栅栏密码

### 网络工具
IP 地址查询 / 在线 Ping / 在线 TCPing / 网站测速 / 路由追踪 / DNS 查询 / FindPing / 本地网络 / HTTP 请求测试器

## 技术栈

- TypeScript + Vite
- 纯前端运行，无需后端服务
- FFmpeg WASM（多线程支持，自动降级单线程）
- ONNX Runtime Web（AI 图片超分辨率）
- Tesseract.js（OCR 文字识别）

## 本地开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## License

MIT
