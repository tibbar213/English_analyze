const express = require('express');
const aiService = require('./ai-service');
const config = require('config');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// 获取系统配置
router.get('/config', (req, res) => {
  try {
    const aiConfig = {
      apiEndpoint: config.get('ai.apiEndpoint'),
      model: config.get('ai.model'),
      temperature: config.get('ai.temperature'),
      maxTokens: config.get('ai.maxTokens')
    };
    res.json(aiConfig);
  } catch (error) {
    res.status(500).json({ error: '无法获取配置信息' });
  }
});

// 更新系统配置
router.post('/config', (req, res) => {
  try {
    const newConfig = {
      server: { port: config.get('server.port') },
      ai: {
        apiEndpoint: req.body.apiEndpoint,
        apiKey: req.body.apiKey,
        model: req.body.model,
        temperature: parseFloat(req.body.temperature),
        maxTokens: parseInt(req.body.maxTokens)
      }
    };
    
    // 确保配置目录存在
    const configDir = path.join(__dirname, '../config');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(configDir, 'default.json'),
      JSON.stringify(newConfig, null, 2)
    );
    
    res.json({ success: true, message: '配置已更新' });
  } catch (error) {
    console.error('保存配置失败:', error);
    res.status(500).json({ error: '更新配置失败：' + error.message });
  }
});

// 分析文本
router.post('/analyze', async (req, res) => {
  try {
    const { text, mode } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: '请提供文本内容' });
    }
    
    if (!['word', 'sentence'].includes(mode)) {
      return res.status(400).json({ error: '无效的分析模式' });
    }
    
    const result = await aiService.analyzeText(text, mode);
    res.json({ result }); // 直接返回解析后的结果
  } catch (error) {
    console.error('分析失败:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 