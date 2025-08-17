document.addEventListener('DOMContentLoaded', function() {
  // 获取DOM元素
  const textInput = document.getElementById('textInput');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const wordMode = document.getElementById('wordMode');
  const loadingIndicator = document.getElementById('loadingIndicator');
  const resultContainer = document.getElementById('resultContainer');
  const saveSettingsBtn = document.getElementById('saveSettings');

  // 加载配置
  loadConfig();

  // 绑定事件监听器
  analyzeBtn.addEventListener('click', analyze);
  textInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') analyze();
  });
  saveSettingsBtn.addEventListener('click', saveConfig);

  // 提示模板
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

  function sentencePrompt(sentence) {
    return `请严格按照JSON格式提供对英语句子"${sentence}"的详细解析。

要求：
1. 必须返回符合JSON规范的数据
2. 不要包含任何额外的解释性文字
3. 所有字符串必须使用双引号而不是单引号
4. 使用中文进行解释分析

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

  // 加载配置
  function loadConfig() {
    const config = JSON.parse(localStorage.getItem('aiConfig') || '{}');
    document.getElementById('apiEndpoint').value = config.apiEndpoint || 'https://api.openai.com/v1';
    document.getElementById('apiKey').value = config.apiKey || '';
    document.getElementById('model').value = config.model || 'gpt-4o';
    document.getElementById('temperature').value = config.temperature ?? 0.7;
    document.getElementById('maxTokens').value = config.maxTokens ?? 1000;
  }

  // 保存配置
  function saveConfig() {
    const config = {
      apiEndpoint: document.getElementById('apiEndpoint').value,
      apiKey: document.getElementById('apiKey').value,
      model: document.getElementById('model').value,
      temperature: parseFloat(document.getElementById('temperature').value),
      maxTokens: parseInt(document.getElementById('maxTokens').value)
    };

    localStorage.setItem('aiConfig', JSON.stringify(config));
    showToast('配置已保存', 'success');

    // 关闭模态框
    const modal = bootstrap.Modal.getInstance(document.getElementById('settingsModal'));
    modal.hide();
  }

  // 执行分析
  async function analyze() {
    const text = textInput.value.trim();
    if (!text) {
      showToast('请输入要分析的内容', 'warning');
      return;
    }

    const mode = wordMode.checked ? 'word' : 'sentence';
    const config = JSON.parse(localStorage.getItem('aiConfig') || '{}');
    const { apiEndpoint, apiKey, model, temperature, maxTokens } = config;

    if (!apiKey) {
      showToast('请先在设置中配置API密钥', 'warning');
      return;
    }

    const prompt = mode === 'word' ? wordPrompt(text) : sentencePrompt(text);

    // 显示加载指示器
    loadingIndicator.classList.remove('d-none');
    resultContainer.classList.add('d-none');

    try {
      const response = await fetch(`${apiEndpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: mode === 'word'
                ? '你是一个专业的英语教师助手，擅长解析英语单词。请始终以JSON格式返回响应。'
                : '你是一个专业的英语教师助手，擅长解析英语句子。请始终以JSON格式返回响应，不要包含任何额外的文字说明。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature,
          max_tokens: maxTokens
        })
      });

      if (!response.ok) throw new Error('分析请求失败');

      const data = await response.json();
      if (!data?.choices?.[0]?.message?.content) {
        throw new Error('API返回的数据格式不完整');
      }

      let content = data.choices[0].message.content.trim();
      try {
        const jsonStart = content.indexOf('{');
        const jsonEnd = content.lastIndexOf('}');
        if (jsonStart === -1 || jsonEnd === -1) {
          throw new Error('返回内容中未找到有效的JSON结构');
        }

        content = content.slice(jsonStart, jsonEnd + 1);
        content = content.replace(/```json\s*|```\s*/g, '');
        const result = JSON.parse(content);

        if (mode === 'word') {
          renderWordResult(result);
        } else {
          renderSentenceResult(result);
        }

        resultContainer.classList.remove('d-none');
        resultContainer.scrollIntoView({ behavior: 'smooth' });
      } catch (parseError) {
        showToast('解析结果失败: ' + parseError.message, 'error');
      }
    } catch (error) {
      showToast('分析失败: ' + error.message, 'error');
    } finally {
      loadingIndicator.classList.add('d-none');
    }
  }

  // 渲染单词分析结果
  function renderWordResult(result) {
    const html = `
      <div class="word-card animate__animated animate__fadeIn">
        <div class="card-header">
          ${result.word}
        </div>
        <div class="phonetics">
          <span><strong>英式发音:</strong> ${result.phonetics.uk}</span>
          <span><strong>美式发音:</strong> ${result.phonetics.us}</span>
        </div>
        <div class="card-body">
          <h5 class="card-title">
            <i class="bi bi-book"></i> 词义
          </h5>
          <ul class="definition-list">
            ${result.definitions.map(def => `
              <li class="definition-item">
                <span class="part-of-speech">${def.partOfSpeech}</span>
                ${def.meanings.map(meaning => `<div class="meaning">${meaning}</div>`).join('')}
              </li>
            `).join('')}
          </ul>
          
          <h5 class="card-title">
            <i class="bi bi-link-45deg"></i> 常见用法
          </h5>
          <div class="usages">
            <ul>
              ${result.usages.map(usage => `<li>${usage}</li>`).join('')}
            </ul>
          </div>
          
          <h5 class="card-title">
            <i class="bi bi-chat-quote"></i> 例句
          </h5>
          ${result.examples.map((example, index) => `
            <div class="example">
              <div class="english">${index + 1}. ${example.english}</div>
              <div class="translation">${example.chinese}</div>
            </div>
          `).join('')}
          
          <div class="etymology">
            <h5 class="card-title mb-3">
              <i class="bi bi-tree"></i> 词源
            </h5>
            <p>${result.etymology}</p>
          </div>
          
          <div class="tips">
            <h5 class="card-title mb-3">
              <i class="bi bi-lightbulb"></i> 记忆技巧
            </h5>
            <p>${result.tips}</p>
          </div>
        </div>
      </div>
    `;
    
    resultContainer.innerHTML = html;
  }

  // 渲染句子分析结果
  function renderSentenceResult(result) {
    const html = `
      <div class="sentence-analysis animate__animated animate__fadeIn">
        <div class="original-sentence">
          ${result.sentence}
        </div>
        <div class="translation">
          ${result.translation}
        </div>
        <div class="structure">
          <h5 class="section-title">句子结构</h5>
          <div class="structure-type"><strong>类型：</strong> ${result.structure.type}</div>
          <div class="structure-explanation mt-2">${result.structure.explanation}</div>
        </div>
        
        <div class="components p-3">
          <h5 class="section-title">句子成分</h5>
          ${result.components.map(comp => `
            <div class="component">
              <div class="role">${comp.role}</div>
              <div class="text"><strong>${comp.text}</strong></div>
              <div class="explanation">${comp.explanation}</div>
            </div>
          `).join('')}
        </div>
        
        <div class="key-phrases p-3">
          <h5 class="section-title">关键词汇与短语</h5>
          ${result.keyPhrases.map(phrase => `
            <div class="key-phrase">
              <div class="phrase">${phrase.phrase}</div>
              <div class="meaning"><strong>含义：</strong> ${phrase.meaning}</div>
              <div class="usage"><strong>用法：</strong> ${phrase.usage}</div>
            </div>
          `).join('')}
        </div>
        
        <div class="grammar-points p-3">
          <h5 class="section-title">语法分析</h5>
          ${result.grammar.map(point => `
            <div class="grammar-point">
              <div class="aspect">${point.aspect}</div>
              <div class="explanation">${point.explanation}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    resultContainer.innerHTML = html;
  }

  // 显示提示消息
  function showToast(message, type = 'info') {
    const toastContainer = document.createElement('div');
    toastContainer.className = `toast-container position-fixed bottom-0 end-0 p-3`;
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="关闭"></button>
      </div>
    `;
    
    toastContainer.appendChild(toast);
    document.body.appendChild(toastContainer);
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => {
      document.body.removeChild(toastContainer);
    });
  }
}); 