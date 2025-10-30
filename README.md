# 威胁情报仪表板

一个基于 Next.js、shadcn/ui 和 Tailwind CSS 构建的现代化威胁情报聊天机器人界面。

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **UI 组件**: shadcn/ui
- **样式**: Tailwind CSS
- **图标**: Lucide React

## 功能特性

- 💬 现代化的聊天机器人界面
- 🎨 美观的 UI 设计，支持深色模式
- 📱 完全响应式布局
- ⚡ 快速、流畅的用户体验
- 🔄 实时消息滚动
- ⌨️ 支持键盘快捷键（Enter 发送）

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 运行开发服务器

```bash
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 3. 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
threat-intel-dashboard/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # 根布局
│   ├── page.tsx             # 主页面
│   └── globals.css          # 全局样式
├── components/              # React 组件
│   ├── ui/                  # shadcn/ui 组件
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── scroll-area.tsx
│   │   └── avatar.tsx
│   └── chat-interface.tsx   # 聊天界面组件
├── lib/                     # 工具函数
│   └── utils.ts
└── public/                  # 静态资源
```

## 开发说明

### 后端集成

目前聊天机器人使用模拟响应。要集成真实的后端模型：

1. 在 `components/chat-interface.tsx` 中找到 `handleSend` 函数
2. 将模拟的 `setTimeout` 替换为真实的 API 调用
3. 根据需要调整消息格式和错误处理

示例：

```typescript
const handleSend = async () => {
  // ... 现有代码 ...
  
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage.content }),
    })
    
    const data = await response.json()
    
    const assistantMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: data.response,
      timestamp: new Date(),
    }
    
    setMessages((prev) => [...prev, assistantMessage])
  } catch (error) {
    console.error('Error:', error)
  } finally {
    setIsLoading(false)
  }
}
```

### 自定义样式

- 全局样式: 编辑 `app/globals.css`
- 主题颜色: 修改 `tailwind.config.ts`
- 组件样式: 使用 Tailwind CSS 类名

## 许可证

MIT
