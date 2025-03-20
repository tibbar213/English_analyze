const axios = require('axios');
const config = require('config');
const { wordPrompt, sentencePrompt } = require('./prompt-templates');

class AIService {
  constructor() {
    this.apiEndpoint = config.get('ai.apiEndpoint');
    this.apiKey = config.get('ai.apiKey');
    this.model = config.get('ai.model');
    this.temperature = config.get('ai.temperature');
    this.maxTokens = config.get('ai.maxTokens');
  }

  async analyzeText(text, mode) {
    try {
      const prompt = mode === 'word' ? wordPrompt(text) : sentencePrompt(text);
      
      // 检查配置
      if (!this.apiKey || this.apiKey === 'YOUR_API_KEY_HERE') {
        throw new Error('请先配置有效的API密钥');
      }

      // 构建请求体
      const requestBody = {
        model: this.model,
        messages: [
          {
            role: "system",
            content: "你是一个专业的英语教师助手，擅长解析英语单词和句子。请始终以JSON格式返回响应。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: this.temperature,
        max_tokens: this.maxTokens
      };

      // 发送请求
      const response = await axios.post(
        `${this.apiEndpoint}/chat/completions`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      // 检查响应
      if (!response.data || !response.data.choices || !response.data.choices[0]) {
        throw new Error('API返回的数据格式不完整');
      }

      const content = response.data.choices[0].message.content;
      
      // 尝试解析JSON
      try {
        // 清理可能的前后缀文本，只保留JSON部分
        const jsonStr = content.trim().replace(/```json\n?|\n?```/g, '');
        const result = JSON.parse(jsonStr);
        return result;
      } catch (parseError) {
        console.error('JSON解析失败，原始内容:', content);
        throw new Error('AI返回的数据格式不是有效的JSON');
      }

    } catch (error) {
      if (error.response) {
        // API错误响应
        const message = error.response.data.error?.message || '未知API错误';
        console.error('API错误:', error.response.status, message);
        throw new Error(`API调用失败: ${message}`);
      } else if (error.request) {
        // 网络错误
        console.error('网络错误:', error.message);
        throw new Error('网络连接失败，请检查网络设置');
      }
      // 其他错误
      console.error('AI服务错误:', error);
      throw error;
    }
  }
}

module.exports = new AIService(); 