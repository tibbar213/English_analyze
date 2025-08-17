/**
 * 单词分析提示模板 - HTML输出格式
 */
function wordPrompt(word) {
  return `请以HTML格式提供英语单词"${word}"的详细分析，使用以下精确的HTML模板结构：

<div class="word-card">
  <div class="card-header">
    ${word}
  </div>
  <div class="phonetics">
    <span><strong>英式发音:</strong> [英式音标]</span>
    <span><strong>美式发音:</strong> [美式音标]</span>
  </div>
  <div class="card-body">
    <h5 class="card-title">
      <i class="bi bi-book"></i> 词义
    </h5>
    <ul class="definition-list">
      <li class="definition-item">
        <span class="part-of-speech">[词性1]</span>
        <div class="meaning">[中文释义1]</div>
        <div class="meaning">[中文释义2]</div>
      </li>
      <li class="definition-item">
        <span class="part-of-speech">[词性2]</span>
        <div class="meaning">[中文释义1]</div>
      </li>
    </ul>

    <h5 class="card-title">
      <i class="bi bi-link-45deg"></i> 常见用法
    </h5>
    <div class="usages">
      <ul>
        <li>[常见搭配1]</li>
        <li>[常见搭配2]</li>
        <li>[常见搭配3]</li>
      </ul>
    </div>

    <h5 class="card-title">
      <i class="bi bi-chat-quote"></i> 例句
    </h5>
    <div class="example">
      <div class="english">1. [英文例句1]</div>
      <div class="translation">[中文翻译1]</div>
    </div>
    <div class="example">
      <div class="english">2. [英文例句2]</div>
      <div class="translation">[中文翻译2]</div>
    </div>
    <div class="example">
      <div class="english">3. [英文例句3]</div>
      <div class="translation">[中文翻译3]</div>
    </div>

    <div class="etymology">
      <h5 class="card-title mb-3">
        <i class="bi bi-tree"></i> 词源
      </h5>
      <p>[词源简介，使用中文]</p>
    </div>

    <div class="tips">
      <h5 class="card-title mb-3">
        <i class="bi bi-lightbulb"></i> 记忆技巧
      </h5>
      <p>[记忆方法，使用中文]</p>
    </div>
  </div>
</div>

要求：
1. 严格按照上述HTML模板结构输出
2. 替换所有方括号内的占位符为实际内容
3. 保持HTML标签和类名完全一致
4. 所有解释使用中文
5. 不要添加任何额外的HTML标签或修改结构`;
}

/**
 * 句子分析提示模板 - JSON输出格式（参考exampleproject）
 */
function sentencePrompt(sentence) {
  return `请以JSON格式提供对英语句子"${sentence}"的详细解析。

请严格按照以下JSON结构返回：

{
  "sentence": "${sentence}",
  "translation": "[整体中文翻译]",
  "structure": {
    "type": "[句子类型，如：简单句/复合句/复杂句]",
    "explanation": "[详细的结构解释]"
  },
  "components": [
    {
      "role": "主语",
      "text": "[主语部分]",
      "explanation": "[主语说明]"
    },
    {
      "role": "谓语",
      "text": "[谓语部分]",
      "explanation": "[谓语说明]"
    },
    {
      "role": "宾语",
      "text": "[宾语部分]",
      "explanation": "[宾语说明]"
    },
    {
      "role": "状语",
      "text": "[状语部分]",
      "explanation": "[状语说明]"
    }
  ],
  "keyPhrases": [
    {
      "phrase": "[重点短语1]",
      "meaning": "[中文含义]",
      "usage": "[用法说明]"
    },
    {
      "phrase": "[重点短语2]",
      "meaning": "[中文含义]",
      "usage": "[用法说明]"
    },
    {
      "phrase": "[重点短语3]",
      "meaning": "[中文含义]",
      "usage": "[用法说明]"
    }
  ],
  "grammar": [
    {
      "aspect": "[语法点1名称]",
      "explanation": "[详细解释]"
    },
    {
      "aspect": "[语法点2名称]",
      "explanation": "[详细解释]"
    }
  ]
}

要求：
1. 严格按照上述JSON结构输出
2. 替换所有方括号内的占位符为实际内容
3. 确保JSON格式正确，可以被解析
4. 所有解释使用中文
5. 分析所有主要句子成分（如果某个成分不存在，可以省略）
6. 提供至少3个关键短语分析
7. 提供至少2个语法要点分析
8. 不要添加任何额外的字段或修改结构`;
}

module.exports = {
  wordPrompt,
  sentencePrompt
};
