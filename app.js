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
  search.addEventListener('input', () => {
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
