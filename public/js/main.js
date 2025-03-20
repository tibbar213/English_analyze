document.addEventListener('DOMContentLoaded', function() {
  // 获取DOM元素
  const textInput = document.getElementById('textInput');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const wordMode = document.getElementById('wordMode');
  const loadingIndicator = document.getElementById('loadingIndicator');
  const resultContainer = document.getElementById('resultContainer');
  const settingsForm = document.getElementById('settingsForm');
  const saveSettingsBtn = document.getElementById('saveSettings');

  // 加载配置
  loadConfig();

  // 绑定事件监听器
  analyzeBtn.addEventListener('click', analyze);
  textInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') analyze();
  });
  saveSettingsBtn.addEventListener('click', saveConfig);

  // 加载配置
  async function loadConfig() {
    try {
      const response = await fetch('/api/config');
      if (!response.ok) throw new Error('获取配置失败');
      
      const config = await response.json();
      
      // 填充表单
      document.getElementById('apiEndpoint').value = config.apiEndpoint || '';
      document.getElementById('model').value = config.model || '';
      document.getElementById('temperature').value = config.temperature || 0.7;
      document.getElementById('maxTokens').value = config.maxTokens || 1000;
    } catch (error) {
      showToast('加载配置失败: ' + error.message, 'error');
    }
  }

  // 保存配置
  async function saveConfig() {
    try {
      const config = {
        apiEndpoint: document.getElementById('apiEndpoint').value,
        apiKey: document.getElementById('apiKey').value,
        model: document.getElementById('model').value,
        temperature: parseFloat(document.getElementById('temperature').value),
        maxTokens: parseInt(document.getElementById('maxTokens').value)
      };

      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) throw new Error('保存配置失败');
      
      const result = await response.json();
      showToast(result.message, 'success');
      
      // 关闭模态框
      const modal = bootstrap.Modal.getInstance(document.getElementById('settingsModal'));
      modal.hide();
    } catch (error) {
      showToast('保存配置失败: ' + error.message, 'error');
    }
  }

  // 执行分析
  async function analyze() {
    const text = textInput.value.trim();
    if (!text) {
      showToast('请输入要分析的内容', 'warning');
      return;
    }

    const mode = wordMode.checked ? 'word' : 'sentence';
    
    // 显示加载指示器
    loadingIndicator.classList.remove('d-none');
    resultContainer.classList.add('d-none');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, mode })
      });

      if (!response.ok) throw new Error('分析请求失败');
      
      const data = await response.json();
      
      if (mode === 'word') {
        renderWordResult(data.result);
      } else {
        renderSentenceResult(data.result);
      }

      resultContainer.classList.remove('d-none');
      resultContainer.scrollIntoView({ behavior: 'smooth' });
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