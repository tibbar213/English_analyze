const express = require('express');
const path = require('path');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 8080;

// 静态资源
app.use(express.static(path.join(__dirname, 'public')));

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务已启动，访问 http://localhost:${PORT}`);
});