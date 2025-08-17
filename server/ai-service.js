const axios = require('axios');
const { wordPrompt, sentencePrompt } = require('./prompt-templates');

class AIService {
  constructor() {
    // 使用环境变量配置，如果未设置则使用默认值
    this.apiEndpoint = process.env.AI_API_ENDPOINT || 'https://api.openai.com/v1';
    this.apiKey = process.env.AI_API_KEY || 'YOUR_API_KEY_HERE';
    this.model = process.env.AI_MODEL || 'gpt-4-turbo-preview';
    this.temperature = parseFloat(process.env.AI_TEMPERATURE) || 0.7;
    this.maxTokens = parseInt(process.env.AI_MAX_TOKENS) || 2000;

    // 验证必要的配置
    if (!this.apiKey || this.apiKey === 'YOUR_API_KEY_HERE') {
      console.warn('⚠️  警告: 未配置有效的API密钥，请在.env文件中设置AI_API_KEY');
    }

    console.log(`🔧 AI配置: ${this.model} @ ${this.apiEndpoint}`);
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
                ? "你是一个专业的英语教师助手，擅长解析英语单词。请严格按照用户提供的HTML模板格式返回响应，不要添加任何额外的HTML标签或修改结构，只替换占位符内容。"
                : "你是一个专业的英语教师助手，擅长解析英语句子。请严格按照用户提供的JSON格式返回响应，确保返回的是有效的JSON格式，不要添加任何额外的字段或修改结构。"
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

      if (mode === 'word') {
        // 单词模式：清理HTML代码块标记
        content = content.replace(/```html\s*|```\s*/g, '');
      } else {
        // 句子模式：清理JSON代码块标记并解析JSON
        content = content.replace(/```json\s*|```\s*/g, '');
        try {
          // 验证JSON格式
          const jsonData = JSON.parse(content);
          content = JSON.stringify(jsonData); // 重新格式化
        } catch (error) {
          console.error('JSON解析错误:', error);
          throw new Error('AI返回的JSON格式不正确');
        }
      }

      // 返回内容
      return {
        success: true,
        content: content,
        mode: mode,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data.error?.message || '未知API错误';
        console.error('API错误详情:', error.response.data);

        // 针对不同错误状态码提供更友好的提示
        if (status === 503) {
          throw new Error('AI服务暂时不可用，请稍后重试');
        } else if (status === 401) {
          throw new Error('API密钥无效，请检查配置');
        } else if (status === 429) {
          throw new Error('请求过于频繁，请稍后重试');
        } else if (status === 500) {
          throw new Error('AI服务内部错误，请稍后重试');
        } else {
          throw new Error(`API调用失败: ${message}`);
        }
      } else if (error.request) {
        console.error('网络请求错误:', error.message);
        throw new Error('网络连接失败，请检查网络设置');
      }
      throw error;
    }
  }
}

module.exports = new AIService();
