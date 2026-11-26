(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  let token = '';
  const base = String(window.ATHAR_NEWS_API_BASE || '').replace(/\/$/, '');
  const status = (message, type = '') => { $('status').textContent = message; $('status').className = `status ${type}`; };
  async function api(path, options = {}) {
    if (!base || base.includes('YOUR-ATHAR-NEWS-WORKER')) throw new Error('ضع رابط Worker الحقيقي داخل news-config.js أولاً');
    const response = await fetch(`${base}${path}`, { ...options, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, ...(options.headers || {}) } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    return data;
  }
  async function loadSources() {
    const data = await api('/admin/sources');
    $('source-count').textContent = `${data.sources.length} مصدر`;
    const root = $('sources'); root.replaceChildren();
    if (!data.sources.length) { const p = document.createElement('p'); p.className = 'muted'; p.textContent = 'لم تضف أي مصادر بعد. أضف أول مصدر من النموذج أعلاه.'; root.append(p); return; }
    data.sources.forEach(source => {
      const row = document.createElement('article'); row.className = 'source';
      const main = document.createElement('div'); main.className = 'source-main';
      const name = document.createElement('div'); name.className = 'source-name'; name.textContent = source.name;
      const url = document.createElement('span'); url.className = 'source-url'; url.textContent = source.feed_url;
      const meta = document.createElement('div'); meta.className = 'source-meta'; meta.textContent = `${source.category} · ${source.last_success_at ? `آخر نجاح: ${new Date(source.last_success_at).toLocaleString('ar')}` : 'لم ينجح الاستيراد بعد'}${source.last_error ? ` · خطأ: ${source.last_error}` : ''}`;
      main.append(name,url,meta);
      const pill = document.createElement('span'); pill.className = `pill ${source.enabled ? '' : 'off'}`; pill.textContent = source.enabled ? 'نشط' : 'متوقف';
      const toggle = document.createElement('button'); toggle.className = 'secondary'; toggle.type = 'button'; toggle.textContent = source.enabled ? 'إيقاف' : 'تفعيل';
      toggle.addEventListener('click', async () => { toggle.disabled = true; try { await api(`/admin/sources/${source.id}`, { method:'PATCH', body:JSON.stringify({enabled:!source.enabled}) }); await loadSources(); } catch(e) { status(e.message,'error'); toggle.disabled=false; } });
      row.append(main,pill,toggle); root.append(row);
    });
  }
  $('connect').addEventListener('click', async () => {
    token = $('admin-token').value.trim();
    if (!token) { status('أدخل مفتاح الإدارة أولاً','error'); return; }
    $('connect').disabled = true;
    try { await loadSources(); $('manage-panel').hidden = false; $('disconnect').hidden = false; $('admin-token').disabled = true; $('connect').hidden = true; status('تم الاتصال بلوحة إدارة أثر','ok'); }
    catch(e) { token=''; status(e.message,'error'); }
    finally { $('connect').disabled = false; }
  });
  $('disconnect').addEventListener('click', () => { token=''; $('admin-token').value=''; $('admin-token').disabled=false; $('manage-panel').hidden=true; $('disconnect').hidden=true; $('connect').hidden=false; status('تم إنهاء الاتصال'); });
  $('source-form').addEventListener('submit', async event => {
    event.preventDefault(); const button = event.submitter; button.disabled=true;
    try {
      await api('/admin/sources',{method:'POST',body:JSON.stringify({name:$('source-name').value.trim(),feed_url:$('source-url').value.trim(),category:$('source-category').value})});
      $('source-form').reset(); status('تمت إضافة المصدر بنجاح','ok'); await loadSources();
    } catch(e) { status(e.message,'error'); } finally { button.disabled=false; }
  });
  $('refresh').addEventListener('click', async () => { try { await loadSources(); status('تم تحديث قائمة المصادر','ok'); } catch(e) { status(e.message,'error'); } });
  $('sync-now').addEventListener('click', async event => { const button=event.currentTarget; button.disabled=true; status('جارٍ فحص المصادر...'); try { const data=await api('/admin/sync',{method:'POST'}); const r=data.result||{}; status(`انتهى الفحص: ${r.imported||0} خبر جديد، ${r.errors||0} أخطاء، ${r.deleted||0} خبر منتهي حُذف`,'ok'); await loadSources(); } catch(e) { status(e.message,'error'); } finally { button.disabled=false; } });
})();
