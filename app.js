require('dotenv').config();
const express = require('express');
const path = require('path');
const routes = require('./server/routes');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 路由
app.use('/api', routes);

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 AI英语分析服务已启动`);
  console.log(`📍 访问地址: http://localhost:${PORT}`);
  console.log(`🎨 UI风格: 现代青绿色配色`);
  console.log(`📝 输出格式: Markdown`);
});
