(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const search = byId('search');
  const category = byId('category');
  const region = byId('region');
  const reset = byId('reset');
  const count = byId('result-count');
  const empty = byId('empty');
  const numbers = new Intl.NumberFormat('ar');
  const normalize = value => value.normalize('NFKC').toLocaleLowerCase('ar')
    .replace(/[\p{M}\u0640]/gu, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').trim();
  const cards = [...document.querySelectorAll('[data-service]')].map(node => ({
    node, category: node.dataset.category, region: node.dataset.region,
    keywords: normalize(node.textContent),
  }));
  function options(select, key) {
    for (const value of new Set(cards.map(row => row[key]))) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.append(option);
    }
  }
  function filter() {
    const words = normalize(search.value).split(/\s+/).filter(Boolean);
    let matching = 0;
    for (const card of cards) {
      const visible = (!category.value || card.category === category.value) &&
        (!region.value || card.region === region.value) && words.every(word => card.keywords.includes(word));
      card.node.hidden = !visible;
      if (visible) matching++;
    }
    count.textContent = `عدد النتائج: ${numbers.format(matching)}`;
    empty.hidden = matching !== 0;
    reset.disabled = !search.value && !category.value && !region.value;
  }
  options(category, 'category');
  options(region, 'region');
  search.addEventListener('input', filter);
  category.addEventListener('change', filter);
  region.addEventListener('change', filter);
  reset.addEventListener('click', () => {
    search.value = category.value = region.value = '';
    search.focus();
    filter();
  });
  byId('filters').hidden = false;
  count.hidden = false;
  filter();
})();
