// AI英语分析程序 - 主要JavaScript文件

class EnglishAnalyzer {
  constructor() {
    this.initializeElements();
    this.bindEvents();
  }

  initializeElements() {
    this.textInput = document.getElementById('textInput');
    this.analyzeBtn = document.getElementById('analyzeBtn');
    this.loadingIndicator = document.getElementById('loadingIndicator');
    this.resultContainer = document.getElementById('resultContainer');
  }

  bindEvents() {
    // 分析按钮点击事件
    this.analyzeBtn.addEventListener('click', () => this.analyzeText());

    // 输入框回车事件
    this.textInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.analyzeText();
      }
    });
  }

  async analyzeText() {
    const text = this.textInput.value.trim();
    if (!text) {
      this.showError('请输入要分析的文本');
      return;
    }

    const mode = document.querySelector('input[name="analysisMode"]:checked').value;
    
    try {
      this.showLoading();
      
      const response = await axios.post('/api/analyze', {
        text: text,
        mode: mode
      });

      if (response.data.success) {
        this.showResult(response.data.content, mode);
      } else {
        this.showError(response.data.error || '分析失败');
      }
    } catch (error) {
      console.error('分析错误:', error);
      if (error.response?.data?.error) {
        this.showError(error.response.data.error);
      } else {
        this.showError('网络错误，请检查连接');
      }
    } finally {
      this.hideLoading();
    }
  }

  showLoading() {
    this.loadingIndicator.classList.remove('d-none');
    this.resultContainer.classList.add('d-none');
    this.analyzeBtn.disabled = true;
    this.analyzeBtn.innerHTML = '<i class="bi bi-hourglass-split"></i>';
  }

  hideLoading() {
    this.loadingIndicator.classList.add('d-none');
    this.analyzeBtn.disabled = false;
    this.analyzeBtn.innerHTML = '<i class="bi bi-search"></i>';
  }

  showResult(content, mode) {
    // 显示结果头部
    this.resultContainer.innerHTML = `
      <div class="result-header">
        <h3>${mode === 'word' ? '📚 单词分析结果' : '📝 句子解析结果'}</h3>
        <div class="result-actions">
          <div class="action-group">
            <button class="action-btn" onclick="analyzer.copyResult()" title="复制结果">
              <i class="bi bi-clipboard"></i>
            </button>
            <button class="action-btn" onclick="analyzer.clearResult()" title="清除结果">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
      <div class="analysis-content animate__animated animate__fadeIn" id="exportContent">
        <!-- 结果将在这里渲染 -->
      </div>
    `;

    const analysisContent = this.resultContainer.querySelector('.analysis-content');

    if (mode === 'word') {
      // 单词模式：直接渲染HTML
      const cleanHtml = DOMPurify.sanitize(content);
      analysisContent.innerHTML = cleanHtml;
    } else {
      // 句子模式：解析JSON并渲染
      try {
        const result = JSON.parse(content);
        this.renderSentenceResult(result, analysisContent);
      } catch (error) {
        console.error('JSON解析错误:', error);
        this.showError('结果解析失败，请重试');
        return;
      }
    }

    this.resultContainer.classList.remove('d-none');

    // 滚动到结果区域
    this.resultContainer.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  // 渲染句子分析结果 - 完全参考exampleproject
  renderSentenceResult(result, container) {
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
          <div class="structure-explanation">${result.structure.explanation}</div>
        </div>

        <div class="components">
          <h5 class="section-title">句子成分</h5>
          ${result.components.map(comp => `
            <div class="component">
              <div class="role">${comp.role}</div>
              <div class="text"><strong>${comp.text}</strong></div>
              <div class="explanation">${comp.explanation}</div>
            </div>
          `).join('')}
        </div>

        <div class="key-phrases">
          <h5 class="section-title">关键词汇与短语</h5>
          ${result.keyPhrases.map(phrase => `
            <div class="key-phrase">
              <div class="phrase">${phrase.phrase}</div>
              <div class="meaning"><strong>含义：</strong> ${phrase.meaning}</div>
              <div class="usage"><strong>用法：</strong> ${phrase.usage}</div>
            </div>
          `).join('')}
        </div>

        <div class="grammar-points">
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

    container.innerHTML = html;
  }



  showError(message) {
    this.resultContainer.innerHTML = `
      <div class="error-message">
        <div class="error-icon">⚠️</div>
        <h3>分析失败</h3>
        <p>${message}</p>
        <button class="retry-btn" onclick="analyzer.clearResult()">
          重试
        </button>
      </div>
    `;
    this.resultContainer.classList.remove('d-none');
  }

  copyResult() {
    const analysisContent = this.resultContainer.querySelector('.analysis-content');
    if (analysisContent) {
      const text = analysisContent.innerText;
      navigator.clipboard.writeText(text).then(() => {
        this.showToast('结果已复制到剪贴板');
      }).catch(() => {
        this.showToast('复制失败，请手动选择复制');
      });
    }
  }

  clearResult() {
    this.resultContainer.classList.add('d-none');
    this.textInput.focus();
  }



  showToast(message) {
    // 创建简单的toast提示
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--primary);
      color: white;
      padding: 0.75rem 1rem;
      border-radius: var(--radius);
      box-shadow: var(--shadow-lg);
      z-index: 1001;
      font-size: 0.875rem;
      font-weight: 500;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }








}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }

  .toast {
    animation: slideIn 0.3s ease;
  }

  @media (max-width: 768px) {
    .result-header {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .result-actions {
      justify-content: center;
    }
  }
`;
document.head.appendChild(style);

// 检查依赖库加载状态
function checkLibraries() {
  const libraries = {
    'html2canvas': typeof html2canvas !== 'undefined',
    'jsPDF': typeof window.jspdf !== 'undefined',
    'DOMPurify': typeof DOMPurify !== 'undefined',
    'axios': typeof axios !== 'undefined'
  };

  console.log('📚 依赖库加载状态:', libraries);

  const allLoaded = Object.values(libraries).every(loaded => loaded);
  if (!allLoaded) {
    console.warn('⚠️ 部分依赖库未加载，导出功能可能不可用');
  }

  return allLoaded;
}

// 初始化应用
const analyzer = new EnglishAnalyzer();

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 AI英语分析程序已启动');
  console.log('🎨 使用现代青绿色配色方案');
  console.log('📝 支持Markdown格式输出');

  // 检查依赖库
  setTimeout(() => {
    checkLibraries();
  }, 1000);
});
