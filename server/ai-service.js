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

      const response = await axios.post(
        `${this.apiEndpoint}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: "system",
              content: mode === 'word' 
                ? "你是一个专业的英语教师助手，擅长解析英语单词。请始终以JSON格式返回响应。"
                : "你是一个专业的英语教师助手，擅长解析英语句子。请始终以JSON格式返回响应，不要包含任何额外的文字说明。"
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: this.temperature,
          max_tokens: this.maxTokens
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('API返回的数据格式不完整');
      }

      let content = response.data.choices[0].message.content.trim();
      
      // 清理可能的非JSON内容
      try {
        // 尝试找到JSON的开始和结束位置
        const jsonStart = content.indexOf('{');
        const jsonEnd = content.lastIndexOf('}');
        
        if (jsonStart === -1 || jsonEnd === -1) {
          throw new Error('返回内容中未找到有效的JSON结构');
        }
        
        // 提取JSON部分
        content = content.slice(jsonStart, jsonEnd + 1);
        
        // 清理可能的markdown代码块标记
        content = content.replace(/```json\s*|```\s*/g, '');
        
        // 尝试解析JSON
        const result = JSON.parse(content);
        
        // 验证必要的字段
        if (mode === 'sentence') {
          if (!result.sentence || !result.translation || !result.structure) {
            throw new Error('返回的JSON缺少必要字段');
          }
        }
        
        return result;
      } catch (parseError) {
        console.error('原始返回内容:', content);
        console.error('JSON解析错误:', parseError);
        throw new Error(`AI返回的数据格式无效: ${parseError.message}`);
      }

    } catch (error) {
      if (error.response) {
        const message = error.response.data.error?.message || '未知API错误';
        console.error('API错误详情:', error.response.data);
        throw new Error(`API调用失败: ${message}`);
      } else if (error.request) {
        console.error('网络请求错误:', error.message);
        throw new Error('网络连接失败，请检查网络设置');
      }
      throw error;
    }
  }
}

module.exports = new AIService(); 