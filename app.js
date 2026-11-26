(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const search = byId('search');
  const clearSearch = byId('clear-search');
  const count = byId('result-count');
  const empty = byId('empty');
  const sections = [...document.querySelectorAll('main section[data-cat]')];
  const directory = byId('category-grid');
  const homeHeading = byId('directory-heading');
  const sectionHeading = byId('section-heading');
  const backButton = byId('back-categories');
  const sectionTitle = byId('section-title');
  const newsFeature = byId('open-news');
  const newsPanel = byId('news-panel');
  const newsList = byId('news-list');
  const newsUpdated = byId('news-updated');
  const backNews = byId('back-news');
  let newsActive = false;
  const numbers = new Intl.NumberFormat('ar');
  const normalize = value => value.normalize('NFKC').toLocaleLowerCase('ar')
    .replace(/[\p{M}ـ]/gu, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').trim();
  const meta = {
    'غذاء': { icon: 'utensils', note: 'المواد الغذائية والخدمات', tone: 'food' },
    'غاز': { icon: 'flame', note: 'التسجيل ومتابعة الطلبات', tone: 'gas' },
    'مساعدات نقدية وعينية': { icon: 'hand-heart', note: 'الدعم النقدي والعيني', tone: 'aid' },
    'أيتام': { icon: 'heart-handshake', note: 'الكفالات ورعاية الأيتام', tone: 'orphans' },
    'وظائف وتطوع': { icon: 'briefcase-business', note: 'فرص العمل والتطوع', tone: 'jobs' },
    'تعليم': { icon: 'graduation-cap', note: 'الصفوف والرزم التعليمية', tone: 'education' }
  };
  const cards = sections.flatMap(section =>
    [...section.querySelectorAll('.card')].map(card => ({ section, card, keywords: normalize(card.textContent) })));
  let active = null;

  function buildCategoryCards() {
    directory.replaceChildren();
    sections.forEach(section => {
      const category = section.dataset.cat;
      const info = meta[category] || { icon: 'layers', note: 'استكشف الموارد والخدمات', tone: 'default' };
      const total = section.querySelectorAll('.card').length;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `category-tile tone-${info.tone}`;
      button.setAttribute('aria-label', `فتح قسم ${category}، ${numbers.format(total)} عناصر`);
      button.innerHTML = `<span class="tile-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><use href="#icon-${info.icon}"></use></svg></span><span class="tile-count">${numbers.format(total)}</span><span class="tile-title"></span><span class="tile-note"></span><span class="tile-arrow" aria-hidden="true">←</span>`;
      button.querySelector('.tile-title').textContent = category === 'مساعدات نقدية وعينية' ? 'المساعدات' : category === 'وظائف وتطوع' ? 'الوظائف والفرص' : category;
      button.querySelector('.tile-note').textContent = info.note;
      button.addEventListener('click', () => openCategory(section));
      directory.append(button);
    });
  }

  function showHome() {
    active = null;
    newsActive = false;
    newsFeature.hidden = false;
    newsPanel.hidden = true;
    homeHeading.hidden = false;
    directory.hidden = false;
    sectionHeading.hidden = true;
    sections.forEach(section => { section.hidden = true; });
    count.hidden = true;
    empty.hidden = true;
    search.value = '';
    clearSearch.hidden = true;
    directory.querySelectorAll('.category-tile').forEach(tile => tile.disabled = false);
  }

  function openCategory(section) {
    newsActive = false;
    newsFeature.hidden = true;
    newsPanel.hidden = true;
    active = section;
    homeHeading.hidden = true;
    directory.hidden = true;
    sectionHeading.hidden = false;
    sectionTitle.textContent = section.dataset.cat === 'مساعدات نقدية وعينية' ? 'المساعدات' : section.dataset.cat === 'وظائف وتطوع' ? 'الوظائف والفرص' : section.dataset.cat;
    sections.forEach(item => { item.hidden = item !== section; });
    search.value = '';
    clearSearch.hidden = true;
    apply();
    sectionHeading.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderNews(items, updatedAt) {
    newsList.replaceChildren();
    if (!Array.isArray(items) || !items.length) {
      const emptyState = document.createElement('div');
      emptyState.className = 'news-empty';
      emptyState.innerHTML = '<span class="news-empty-icon" aria-hidden="true">▤</span><strong>لا توجد أخبار حديثة حالياً</strong><p>سيتم عرض الأخبار تلقائياً عند استيرادها من المصادر المعتمدة.</p>';
      newsList.append(emptyState);
    } else {
      items.forEach(item => {
        if (!item || typeof item.title !== 'string' || typeof item.url !== 'string' || !/^https:\/\//i.test(item.url)) return;
        const card = document.createElement('article'); card.className = 'news-card';
        if (typeof item.imageUrl === 'string' && /^https:\/\//i.test(item.imageUrl)) {
          const image = document.createElement('img'); image.className = 'news-card-image';
          image.src = item.imageUrl; image.alt = ''; image.loading = 'lazy'; image.referrerPolicy = 'no-referrer';
          image.onerror = () => image.remove(); card.append(image);
        }
        const title = document.createElement('h3'); title.textContent = item.title;
        card.append(title);
        if (typeof item.summary === 'string' && item.summary.trim()) { const summary = document.createElement('p'); summary.textContent = item.summary; card.append(summary); }
        const foot = document.createElement('div'); foot.className = 'news-card-foot';
        let published = '';
        if (item.publishedAt) {
          const date = new Date(item.publishedAt);
          if (!Number.isNaN(date.getTime())) published = date.toLocaleString('ar', { dateStyle: 'medium', timeStyle: 'short' });
        }
        const source = document.createElement('span'); source.textContent = [item.source, published].filter(Boolean).join(' · ');
        const link = document.createElement('a'); link.href = item.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = 'المصدر الأصلي ←';
        foot.append(source, link); card.append(foot); newsList.append(card);
      });
      if (!newsList.children.length) renderNews([], updatedAt);
    }
    if (updatedAt) {
      const date = new Date(updatedAt);
      newsUpdated.textContent = Number.isNaN(date.getTime()) ? 'آخر تحديث متاح' : `آخر تحديث: ${date.toLocaleString('ar', { dateStyle: 'medium', timeStyle: 'short' })}`;
    } else newsUpdated.textContent = 'بانتظار أول عملية استيراد';
  }

  async function openNews() {
    newsActive = true; active = null;
    homeHeading.hidden = true; directory.hidden = true; newsFeature.hidden = true;
    sectionHeading.hidden = true; newsPanel.hidden = false;
    sections.forEach(section => { section.hidden = true; });
    count.hidden = true; empty.hidden = true; search.value = ''; clearSearch.hidden = true;
    search.placeholder = 'ابحث في خدمات أثر...';
    newsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    newsUpdated.textContent = 'جاري جلب آخر الأخبار...';
    const apiBase = String(window.ATHAR_NEWS_API_BASE || '').replace(/\/$/, '');
    if (!apiBase || apiBase.includes('YOUR-ATHAR-NEWS-WORKER')) {
      renderNews([], null);
      newsUpdated.textContent = 'بانتظار ربط خدمة Cloudflare';
      return;
    }
    try {
      const response = await fetch(`${apiBase}/api/news?limit=60`, { cache: 'no-store', headers: { 'Accept': 'application/json' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!data || data.ok !== true || !Array.isArray(data.news)) throw new Error('Invalid news response');
      renderNews(data.news, data.updatedAt);
    } catch (_) {
      renderNews([], null);
      newsUpdated.textContent = 'تعذر الاتصال بخدمة الأخبار؛ سنحاول عند فتح الصحيفة مجددًا';
    }
  }

  function apply() {
    const words = normalize(search.value).split(/\s+/).filter(Boolean);
    let matching = 0;
    for (const row of cards) {
      const inScope = !active || row.section === active;
      const visible = inScope && words.every(word => row.keywords.includes(word));
      row.card.hidden = !visible;
      const accordion = row.card.querySelector('details.acc');
      if (accordion && words.length) accordion.open = visible;
      if (visible) matching++;
    }
    sections.forEach(section => {
      section.hidden = active ? section !== active : words.length ? ![...section.querySelectorAll('.card')].some(card => !card.hidden) : true;
    });
    count.hidden = !active && !words.length;
    count.textContent = `عدد النتائج: ${numbers.format(matching)}`;
    empty.hidden = matching !== 0 || (!active && !words.length);
    clearSearch.hidden = search.value.length === 0;
  }

  backButton.addEventListener('click', showHome);
  newsFeature.addEventListener('click', openNews);
  backNews.addEventListener('click', showHome);
  search.addEventListener('input', () => {
    if (newsActive) return;
    if (!active && search.value.trim()) {
      homeHeading.hidden = true;
      directory.hidden = true;
      sectionHeading.hidden = false;
      sectionTitle.textContent = 'نتائج البحث';
      backButton.querySelector('.back-label').textContent = 'العودة إلى الأقسام';
    } else if (!active && !search.value.trim()) {
      showHome();
      return;
    }
    if (active) backButton.querySelector('.back-label').textContent = 'العودة إلى الأقسام';
    apply();
  });
  clearSearch.addEventListener('click', () => {
    search.value = '';
    search.focus();
    if (!active) showHome(); else apply();
  });
  buildCategoryCards();
  showHome();
})();
