(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const search = byId('search');
  const count = byId('result-count');
  const empty = byId('empty');
  const chips = [...document.querySelectorAll('.chip')];
  const sections = [...document.querySelectorAll('section[data-cat]')];
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
    for (const section of sections) section.hidden = false;
    for (const row of cards) {
      const visible = (!active || row.section.dataset.cat === active) &&
        words.every(word => row.keywords.includes(word));
      row.card.hidden = !visible;
      const acc = row.card.querySelector('details.acc');
      if (acc) acc.open = visible && words.length > 0;
      if (visible) matching++;
    }
    for (const section of sections) {
      section.hidden = ![...section.querySelectorAll('.card')].some(card => !card.hidden);
    }
    count.textContent = `عدد النتائج: ${numbers.format(matching)}`;
    empty.hidden = matching !== 0;
  }
  for (const chip of chips) {
    chip.addEventListener('click', () => {
      active = chip.dataset.cat;
      for (const other of chips) other.classList.toggle('on', other === chip);
      apply();
    });
  }
  search.addEventListener('input', apply);
  apply();
})();
