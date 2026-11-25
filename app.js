(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const search = byId('search');
  const clearSearch = byId('clear-search');
  const count = byId('result-count');
  const empty = byId('empty');
  const chips = [...document.querySelectorAll('.chip')];
  const sections = [...document.querySelectorAll('main section[data-cat]')];
  const numbers = new Intl.NumberFormat('ar');
  const normalize = value => value.normalize('NFKC').toLocaleLowerCase('ar')
    .replace(/[\p{M}ـ]/gu, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').trim();
  const cards = sections.flatMap(section =>
    [...section.querySelectorAll('.card')].map(card => ({
      section, card, keywords: normalize(card.textContent),
    })));
  let active = '';

  function apply() {
    const words = normalize(search.value).split(/\s+/).filter(Boolean);
    let matching = 0;
    for (const row of cards) {
      const visible = (!active || row.section.dataset.cat === active) &&
        words.every(word => row.keywords.includes(word));
      row.card.hidden = !visible;
      const accordion = row.card.querySelector('details.acc');
      if (accordion && words.length) accordion.open = visible;
      if (visible) matching++;
    }
    for (const section of sections) {
      section.hidden = ![...section.querySelectorAll('.card')].some(card => !card.hidden);
    }
    count.textContent = `عدد النتائج: ${numbers.format(matching)}`;
    empty.hidden = matching !== 0;
    clearSearch.hidden = search.value.length === 0;
  }

  for (const chip of chips) {
    chip.addEventListener('click', () => {
      active = chip.dataset.cat;
      for (const other of chips) {
        const selected = other === chip;
        other.classList.toggle('on', selected);
        other.setAttribute('aria-pressed', String(selected));
      }
      apply();
    });
  }
  search.addEventListener('input', apply);
  clearSearch.addEventListener('click', () => {
    search.value = '';
    search.focus();
    apply();
  });
  apply();
})();
