const express = require('express');
const path = require('path');
const config = require('config');
const routes = require('./server/routes');

// 创建Express应用
const app = express();
const PORT = config.get('server.port') || 8080;

// 中间件
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 路由
app.use('/api', routes);

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务已启动，访问 http://localhost:${PORT}`);
}); 