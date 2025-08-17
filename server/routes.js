const express = require('express');
const aiService = require('./ai-service');
const router = express.Router();

// 分析文本接口
router.post('/analyze', async (req, res) => {
  try {
    const { text, mode } = req.body;

    // 输入验证
    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: '请输入要分析的文本'
      });
    }

    if (!mode || !['word', 'sentence'].includes(mode)) {
      return res.status(400).json({
        success: false,
        error: '请选择正确的分析模式（word 或 sentence）'
      });
    }

    // 调用AI服务
    const result = await aiService.analyzeText(text.trim(), mode);

    res.json(result);

  } catch (error) {
    console.error('分析错误:', error);
    res.status(500).json({
      success: false,
      error: error.message || '分析过程中发生错误'
    });
  }
});

// 健康检查接口
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'AI英语分析服务运行正常',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

module.exports = router;
