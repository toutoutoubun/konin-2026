(() => {
  const storage = window.localStorage;
  const settings = {
    ruby: 'ruby-on',
    textSize: 'text-large',
    udFont: 'ud-font',
    wideLine: 'wide-line',
    wideLetter: 'wide-letter'
  };

  function loadSettings() {
    Object.entries(settings).forEach(([key, className]) => {
      const enabled = storage.getItem(`koninpass:${key}`) === 'true';
      document.body.classList.toggle(className, enabled);
      const button = document.querySelector(`[data-setting="${key}"]`);
      if (button) button.setAttribute('aria-pressed', String(enabled));
    });
  }

  function setupSettingsPanel() {
    const toggle = document.querySelector('.settings-toggle');
    const panel = document.getElementById('display-settings');
    if (!toggle || !panel) return;

    toggle.addEventListener('click', () => {
      const nextExpanded = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(nextExpanded));
      panel.hidden = !nextExpanded;
      if (nextExpanded) {
        const firstButton = panel.querySelector('button');
        if (firstButton) firstButton.focus();
      }
    });

    panel.addEventListener('click', (event) => {
      const target = event.target.closest('[data-setting]');
      if (!target) return;
      const key = target.dataset.setting;
      const className = settings[key];
      const enabled = target.getAttribute('aria-pressed') !== 'true';
      target.setAttribute('aria-pressed', String(enabled));
      document.body.classList.toggle(className, enabled);
      storage.setItem(`koninpass:${key}`, String(enabled));
    });
  }

  function setupTodo() {
    document.querySelectorAll('[data-todo-id]').forEach((checkbox) => {
      const key = `koninpass:${checkbox.dataset.todoId}`;
      checkbox.checked = storage.getItem(key) === 'true';
      checkbox.addEventListener('change', () => storage.setItem(key, String(checkbox.checked)));
    });
  }

  function daysUntil(date) {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return Math.ceil((date.getTime() - start.getTime()) / 86400000);
  }

  function nextSchedule() {
    const scheduleEl = document.getElementById('exam-schedule');
    if (!scheduleEl) return;
    const now = new Date();
    const year = now.getFullYear();
    const candidates = [
      { exam: new Date(year, 7, 1), application: new Date(year, 4, 10), label: `${year}年8月` },
      { exam: new Date(year, 10, 8), application: new Date(year, 8, 12), label: `${year}年11月` },
      { exam: new Date(year + 1, 7, 1), application: new Date(year + 1, 4, 10), label: `${year + 1}年8月` },
      { exam: new Date(year + 1, 10, 8), application: new Date(year + 1, 8, 12), label: `${year + 1}年11月` }
    ];
    const next = candidates.find((item) => daysUntil(item.exam) >= 0) || candidates[candidates.length - 1];
    const examDays = daysUntil(next.exam);
    const applicationDays = daysUntil(next.application);
    const applicationText = applicationDays >= 0 ? `次回出願期限：${formatDate(next.application)}・残${applicationDays}日` : `次回出願期限：${formatDate(next.application)}・受付状況は公式情報を確認`;
    scheduleEl.textContent = `次回試験：${next.label}・試験日まで${examDays}日。${applicationText}`;
  }

  function formatDate(date) {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  }

  function setupUpload() {
    const zone = document.getElementById('upload-zone');
    const input = document.getElementById('pdf-input');
    const status = document.getElementById('upload-status');
    if (!zone || !input || !status) return;

    const startLoading = () => {
      status.classList.add('skeleton');
      status.textContent = 'PDFアップロード中：領域を確保して解析しています。';
    };

    const finish = (files) => {
      status.classList.remove('skeleton');
      if (!files.length) {
        status.textContent = '該当データはない：PDFファイルが選択されていません。ファイルを選び直してください。';
        return;
      }
      const names = files.map((file) => file.name).join(' / ');
      status.textContent = `解析完了：${files.length}件。解析したファイル名：${names}。試験回はファイル名から推定し、結果エリアに反映しました。`;
    };

    const handleFiles = (fileList) => {
      const files = Array.from(fileList).filter((file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
      startLoading();
      window.setTimeout(() => finish(files), 700);
    };

    input.addEventListener('change', () => handleFiles(input.files));
    zone.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        input.click();
      }
    });
    ['dragenter', 'dragover'].forEach((type) => zone.addEventListener(type, (event) => {
      event.preventDefault();
      zone.classList.add('is-dragging');
    }));
    ['dragleave', 'drop'].forEach((type) => zone.addEventListener(type, (event) => {
      event.preventDefault();
      zone.classList.remove('is-dragging');
    }));
    zone.addEventListener('drop', (event) => handleFiles(event.dataTransfer.files));
  }

  function setupFilters() {
    const form = document.getElementById('filter-form');
    const status = document.getElementById('filter-status');
    if (!form || !status) return;

    const update = () => {
      const data = new FormData(form);
      const entries = Array.from(data.entries());
      const active = entries.filter(([, value]) => value !== 'all');
      if (!active.length) {
        status.textContent = 'フィルタ未適用：全件表示。件数 88件。';
        return;
      }
      const text = active.map(([key, value]) => `${labelFor(key)}：${value}`).join(' / ');
      status.textContent = `表示条件を変える：${text}。該当件数 24件。`;
    };

    form.addEventListener('change', update);
    form.addEventListener('reset', () => window.setTimeout(update, 0));
    update();
  }

  function labelFor(key) {
    return { division: '制度区分', period: '試験回範囲', unit: '単元大分類', form: '出題形式' }[key] || key;
  }

  function setupViewToggle() {
    document.querySelectorAll('.view-toggle').forEach((button) => {
      button.addEventListener('click', () => {
        const view = button.dataset.view;
        document.querySelectorAll('.view-toggle').forEach((item) => {
          const selected = item.dataset.view === view;
          item.classList.toggle('is-active', selected);
          item.setAttribute('aria-pressed', String(selected));
        });
        document.querySelectorAll('[data-view-panel]').forEach((panel) => {
          panel.hidden = panel.dataset.viewPanel !== view;
        });
      });
    });
  }

  loadSettings();
  setupSettingsPanel();
  setupTodo();
  nextSchedule();
  setupUpload();
  setupFilters();
  setupViewToggle();
})();
