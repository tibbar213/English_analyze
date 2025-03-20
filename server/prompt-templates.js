/**
 * 单词分析提示模板
 */
function wordPrompt(word) {
  return `请以JSON格式提供英语单词"${word}"的详细分析，包括以下内容：
1. 单词拼写和音标（英式和美式）
2. 所有词性及对应的中文释义
3. 常见用法和搭配
4. 3个包含该单词的例句（英文+中文翻译）
5. 词源和记忆技巧（必须使用中文解释）

格式要求：
{
  "word": "单词",
  "phonetics": {
    "uk": "英式音标",
    "us": "美式音标"
  },
  "definitions": [
    {
      "partOfSpeech": "词性",
      "meanings": ["中文释义1", "中文释义2"]
    }
  ],
  "usages": ["常见搭配1", "常见搭配2"],
  "examples": [
    {
      "english": "英文例句1",
      "chinese": "中文翻译1"
    }
  ],
  "etymology": "词源简介（请使用中文）",
  "tips": "记忆技巧（请使用中文）"
}

请确保JSON格式正确可被直接解析，并且词源和记忆技巧部分必须使用中文解释，不要使用英文。`;
}

/**
 * 句子分析提示模板
 */
function sentencePrompt(sentence) {
  return `请严格按照JSON格式提供对英语句子"${sentence}"的详细解析。

要求：
1. 必须返回符合JSON规范的数据
2. 不要包含任何额外的解释性文字
3. 所有字符串必须使用双引号而不是单引号

格式要求：
{
  "sentence": "${sentence}",
  "translation": "整体中文翻译",
  "structure": {
    "type": "句子类型",
    "explanation": "结构解释"
  },
  "components": [
    {
      "text": "句子片段",
      "role": "句法角色",
      "explanation": "解释"
    }
  ],
  "keyPhrases": [
    {
      "phrase": "短语或词汇",
      "meaning": "含义",
      "usage": "用法说明"
    }
  ],
  "grammar": [
    {
      "aspect": "语法点",
      "explanation": "详细解释"
    }
  ]
}`;
}

module.exports = {
  wordPrompt,
  sentencePrompt
}; 