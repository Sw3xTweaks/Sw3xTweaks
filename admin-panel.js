// SwexTweaks Admin Panel - Protected
// © 2025 SwexTweaks — Yetkisiz erişim yasaktır.

(function() {
  // ── Token doğrulama ──────────────────────────────────────────
  const _tk  = sessionStorage.getItem('_ax');
  const _uid = sessionStorage.getItem('_ax_uid');
  if (!_tk || !_uid) { _deny('no-token'); return; }
  try {
    const p = JSON.parse(atob(_tk));
    if (!p.exp || Date.now() > p.exp)    { _deny('expired'); return; }
    if (!p.uid || p.uid !== _uid)        { _deny('uid-mismatch'); return; }
  } catch { _deny('parse-error'); return; }

  function _deny(reason) {
    sessionStorage.clear();
    document.body.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#000;gap:12px;font-family:monospace">
      <div style="color:#f87171;font-size:1.4rem">⛔ Yetkisiz Erişim</div>
      <div style="color:#52525b;font-size:0.8rem">${reason}</div>
    </div>`;
    setTimeout(() => window.location.href = 'admin.html', 2000);
  }

  // ── Admin Watchdog ───────────────────────────────────────────
  let _lastActivity = Date.now();
  const IDLE_LIMIT   = 30 * 60 * 1000; // 30 dk hareketsizlik → çıkış
  const TOKEN_CHECK  = 60 * 1000;       // 60 sn'de bir token kontrol

  // Aktivite takibi
  ['mousemove','keydown','click','scroll'].forEach(ev => {
    document.addEventListener(ev, () => { _lastActivity = Date.now(); }, { passive: true });
  });

  // Idle watchdog — 30 dk hareketsizlik
  setInterval(() => {
    if (Date.now() - _lastActivity > IDLE_LIMIT) {
      console.warn('[AdminWatchdog] Idle timeout — logging out');
      _forceLogout('idle-timeout');
    }
  }, 30000);

  // Token geçerlilik watchdog — her 60 sn
  setInterval(() => {
    const tk = sessionStorage.getItem('_ax');
    const uid = sessionStorage.getItem('_ax_uid');
    if (!tk || !uid) { _forceLogout('session-lost'); return; }
    try {
      const p = JSON.parse(atob(tk));
      if (!p.exp || Date.now() > p.exp) { _forceLogout('token-expired'); }
      if (!p.uid || p.uid !== uid)      { _forceLogout('uid-changed'); }
    } catch { _forceLogout('token-corrupt'); }
  }, TOKEN_CHECK);

  // Sekme gizlenince sayaç başlat
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      sessionStorage.setItem('_ax_hidden', Date.now());
    } else {
      const t = sessionStorage.getItem('_ax_hidden');
      if (t && Date.now() - parseInt(t) > IDLE_LIMIT) {
        _forceLogout('tab-hidden-timeout');
      }
      sessionStorage.removeItem('_ax_hidden');
    }
  });

  // Birden fazla sekme tespiti
  const _tabKey = '_ax_tab_' + Math.random().toString(36).slice(2);
  sessionStorage.setItem(_tabKey, '1');
  window.addEventListener('storage', e => {
    // Başka sekmede logout olursa bu sekmeyi de kapat
    if (e.key === '_ax' && !e.newValue) { _forceLogout('other-tab-logout'); }
  });

  // URL manipülasyon tespiti
  (function _checkURL() {
    const suspicious = /<script|javascript:|data:|vbscript:|on\w+=/i;
    if (suspicious.test(decodeURIComponent(location.href))) {
      _forceLogout('url-injection');
    }
  })();

  // Hızlı API çağrısı tespiti (rate limit)
  let _apiCallCount = 0;
  const _origFetch = window.fetch;
  window.fetch = function(...args) {
    _apiCallCount++;
    if (_apiCallCount > 50) {
      _apiCallCount = 0;
      console.warn('[AdminWatchdog] Anormal API çağrısı hızı');
    }
    setTimeout(() => { _apiCallCount = Math.max(0, _apiCallCount - 1); }, 10000);
    return _origFetch.apply(this, args);
  };

  function _forceLogout(reason) {
    console.warn('[AdminWatchdog] Force logout:', reason);
    sessionStorage.clear();
    window.location.href = 'admin.html?reason=' + reason;
  }

})();

// Obfuscated config
const _cfg = [
  'aHR0cHM6Ly9hd2duZ2ttaGpqc2Flc3phbmZrdy5zdXBhYmFzZS5jbw==',
  'c2JfcHVibGlzaGFibGVfYWFiU0d5Z3ZrZkFCanhlR3ZfTEN6Z18yV0Noc3FWUQ=='
].map(x => atob(x));

const sb = supabase.createClient(_cfg[0], _cfg[1]);

// Session yenileme kontrolü — 55 dakikada bir token yenile
setInterval(async () => {
  const { data } = await sb.auth.getSession();
  if (!data.session) { sessionStorage.clear(); window.location.href = 'admin.html'; }
}, 55 * 60 * 1000);

// Admin kontrolü
async function isAdmin(uid) {
  try {
    const { data } = await sb.from('admins').select('user_id').eq('user_id', uid).single();
    return !!data;
  } catch { return false; }
}

// Giriş
async function doAdminLogin() {
  const email = document.getElementById('a-email').value.trim();
  const pass  = document.getElementById('a-pass').value;
  const btn   = document.getElementById('a-btn');
  const err   = document.getElementById('a-err');

  err.style.display = 'none';
  if (!email || !pass) { showAdminErr('Tüm alanları doldur.'); return; }

  btn.disabled = true;
  btn.textContent = 'Giriş yapılıyor...';

  const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });

  if (error || !data?.user) {
    showAdminErr('E-posta veya şifre hatalı.');
    btn.disabled = false;
    btn.textContent = 'Giriş Yap';
    return;
  }

  const ok = await isAdmin(data.user.id);
  if (!ok) {
    await sb.auth.signOut();
    showAdminErr('Yetkisiz erişim.');
    btn.disabled = false;
    btn.textContent = 'Giriş Yap';
    return;
  }

  openPanel();
}

function showAdminErr(msg) {
  const el = document.getElementById('a-err');
  el.textContent = '❌ ' + msg;
  el.style.display = 'block';
}

function openPanel() {
  // admin.html'deyse login formunu gizle
  const lw = document.getElementById('login-wrap');
  const ap = document.getElementById('admin-panel');
  if (lw) lw.style.display = 'none';
  if (ap) ap.style.display = 'block';
  // ax-panel.html'deyse direkt yükle
  const ul = document.getElementById('admin-user-label');
  if (ul) ul.textContent = '👤 Admin';
  loadStats();
  loadReviews();
}

async function adminLogout() {
  await sb.auth.signOut();
  location.reload();
}

// Sayfa açılınca oturum kontrol
sb.auth.getSession().then(async ({ data }) => {
  if (!data.session?.user) return;
  const ok = await isAdmin(data.session.user.id);
  if (ok) openPanel();
});

// Enter tuşu
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const lw = document.getElementById('login-wrap');
    if (lw && lw.style.display !== 'none') doAdminLogin();
  }
});

// Sekme
function showTab(tab) {
  ['reviews','users','visitors','charts','announce','settings','notes','activity'].forEach((t, i) => {
    document.querySelectorAll('.admin-tab')[i]?.classList.toggle('active', t === tab);
    document.getElementById('tab-'+t)?.classList.toggle('show', t === tab);
  });
  if (tab === 'users')    loadUsers();
  if (tab === 'visitors') loadVisitors();
  if (tab === 'charts')   loadCharts();
  if (tab === 'announce') loadAnnounce();
  if (tab === 'settings') loadSettings();
  if (tab === 'notes')    loadNotes();
  if (tab === 'activity') loadActivity();
}

// İstatistikler
async function loadStats() {
  try {
    const { data: reviews } = await sb.from('reviews').select('rating');
    const count = reviews?.length || 0;
    const avg = count > 0 ? (reviews.reduce((s,r) => s+r.rating, 0)/count).toFixed(1) : '—';
    document.getElementById('stat-reviews').textContent = count;
    document.getElementById('stat-rating').textContent = count > 0 ? avg+' ★' : '—';
    // Sayı animasyonu
    if (typeof animateCount === 'function') animateCount(document.getElementById('stat-reviews'), count);
  } catch(e) {}
  try {
    const { count } = await sb.from('discord_users').select('*', { count: 'exact', head: true });
    document.getElementById('stat-users').textContent = count || 0;
    if (typeof animateCount === 'function') animateCount(document.getElementById('stat-users'), count || 0);
  } catch(e) { document.getElementById('stat-users').textContent = '0'; }
  try {
    const { data } = await sb.from('site_stats').select('value');
    const total = data?.reduce((s,r) => s+(r.value||0), 0) || 0;
    document.getElementById('stat-downloads').textContent = total || '—';
    if (typeof animateCount === 'function' && total > 0) animateCount(document.getElementById('stat-downloads'), total);
  } catch(e) { document.getElementById('stat-downloads').textContent = '—'; }
}

// Yorumlar
async function loadReviews() {
  const c = document.getElementById('reviews-container');
  let all = [];
  try {
    const { data, error } = await sb.from('reviews').select('id, username, comment, rating, created_at').order('created_at', { ascending: false });
    if (error) { console.error('Reviews error:', error); }
    if (data) all = data.map(r => ({
      id: r.id, src: 'db',
      name: r.username||'—', text: r.comment||'—',
      rating: r.rating||5,
      date: r.created_at ? new Date(r.created_at).toLocaleDateString('tr-TR') : '—'
    }));
  } catch(e) { console.error(e); }
  try {
    JSON.parse(localStorage.getItem('swex_reviews')||'[]').forEach((r,i) => {
      all.push({ id:'l'+i, src:'local', name:r.name||'—', text:r.text||'—', rating:r.rating||5, date:r.date||'—' });
    });
  } catch(e) {}
  document.getElementById('stat-reviews').textContent = all.length;
  if (!all.length) { c.innerHTML = '<div class="empty-state">Henüz yorum yok.</div>'; return; }
  c.innerHTML = `<table class="data-table"><thead><tr><th>#</th><th>Kaynak</th><th>Kullanıcı</th><th>Yorum</th><th>Puan</th><th>Tarih</th><th>İşlem</th></tr></thead><tbody>
  ${all.map((r,i) => `<tr id="row-${r.id}" style="animation-delay:${i*0.04}s"><td>${i+1}</td>
  <td><span style="padding:2px 8px;border-radius:4px;font-size:0.72rem;font-weight:700;${r.src==='db'?'background:rgba(52,211,153,0.1);color:#34d399':'background:rgba(251,191,36,0.1);color:#fbbf24'}">${r.src==='db'?'☁️ DB':'💾 Local'}</span></td>
  <td><strong>${r.name}</strong></td><td style="max-width:280px;overflow:hidden;text-overflow:ellipsis">${r.text}</td>
  <td>${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</td><td>${r.date}</td>
  <td><button class="del-btn" onclick="delReview('${r.id}','${r.src}')">Sil</button></td></tr>`).join('')}
  </tbody></table>`;
}

async function delReview(id, src) {
  if (!confirm('Silmek istediğine emin misin?')) return;
  if (src === 'db') {
    await sb.from('reviews').delete().eq('id', id);
  } else {
    const idx = parseInt(id.replace('l',''));
    const arr = JSON.parse(localStorage.getItem('swex_reviews')||'[]');
    arr.splice(idx, 1);
    localStorage.setItem('swex_reviews', JSON.stringify(arr));
  }
  document.getElementById('row-'+id)?.remove();
  loadStats();
}

function clearAllLocalReviews() {
  if (!confirm('Tüm local yorumları sil?')) return;
  localStorage.removeItem('swex_reviews');
  loadReviews();
}

// Duyuru
async function loadAnnounce() {
  const { data } = await sb.from('settings').select('value').eq('key','announcement').single();
  document.getElementById('announce-input').value = data?.value || localStorage.getItem('swex_announce') || '';
}

function saveAnnounce() {
  const text = document.getElementById('announce-input').value.trim();
  localStorage.setItem('swex_announce', text);
  sb.from('settings').upsert({ key:'announcement', value:text }, { onConflict:'key' }).then(() => {
    const st = document.getElementById('announce-save-status');
    st.style.display = 'block';
    st.textContent = '✅ ' + (text ? 'Duyuru yayınlandı!' : 'Duyuru kaldırıldı.');
    setTimeout(() => st.style.display = 'none', 2000);
  });
}

function clearAnnounce() {
  document.getElementById('announce-input').value = '';
  saveAnnounce();
}

// Ziyaretçiler
async function loadVisitors() {
  const c = document.getElementById('visitors-container');
  c.innerHTML = '<div class="loading">Yükleniyor...</div>';
  try {
    const { data, error } = await sb.from('visitors')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) {
      console.error('Visitors error:', error);
      c.innerHTML = `<div class="empty-state">Hata: ${error.message || 'Bilinmeyen hata'}</div>`;
      return;
    }

    if (!data || data.length === 0) {
      c.innerHTML = '<div class="empty-state">Henüz ziyaretçi kaydı yok.</div>';
      return;
    }

    // Bugünkü ziyaret sayısını hesapla
    const today = new Date().toDateString();
    const todayCount = data.filter(v => v.created_at && new Date(v.created_at).toDateString() === today).length;

    // Online sayısı (son 10 dakika)
    const onlineCount = data.filter(v => v.created_at && Date.now() - new Date(v.created_at).getTime() < 600000).length;

    c.innerHTML = `
      <div style="display:flex;gap:16px;margin-bottom:16px;flex-wrap:wrap;">
        <div style="padding:10px 16px;background:rgba(52,211,153,0.08);border:1px solid rgba(52,211,153,0.2);border-radius:10px;font-size:0.82rem;">
          <span style="color:#34d399;font-weight:700">${data.length}</span> <span style="color:#52525b">toplam kayıt</span>
        </div>
        <div style="padding:10px 16px;background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);border-radius:10px;font-size:0.82rem;">
          <span style="color:#818cf8;font-weight:700">${todayCount}</span> <span style="color:#52525b">bugün</span>
        </div>
        <div style="padding:10px 16px;background:rgba(244,114,182,0.08);border:1px solid rgba(244,114,182,0.2);border-radius:10px;font-size:0.82rem;">
          <span style="color:#f472b6;font-weight:700">${onlineCount}</span> <span style="color:#52525b">son 10 dk</span>
        </div>
      </div>
      <table class="data-table">
        <thead><tr>
          <th>#</th><th>IP</th><th>Ülke</th><th>Şehir</th>
          <th>Cihaz</th><th>Tarayıcı</th><th>Sayfa</th><th>Tarih</th>
        </tr></thead>
        <tbody>
          ${data.map((v,i) => `
            <tr>
              <td>${i+1}</td>
              <td style="font-family:monospace;font-size:0.78rem;color:#818cf8">${v.ip||'—'}</td>
              <td>${v.country||'—'}</td>
              <td>${v.city||'—'}</td>
              <td>${v.device||'—'}</td>
              <td>${v.browser||'—'}</td>
              <td style="font-size:0.75rem;color:#52525b">${v.page||'/'}</td>
              <td style="font-size:0.75rem">${v.created_at ? new Date(v.created_at).toLocaleString('tr-TR') : '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>`;
  } catch(e) {
    console.error('loadVisitors exception:', e);
    c.innerHTML = `<div class="empty-state">Hata oluştu: ${e.message}</div>`;
  }
}

async function clearVisitors() {
  if (!confirm('Tüm ziyaretçi kayıtlarını silmek istediğine emin misin?')) return;
  await sb.from('visitors').delete().neq('id', 0);
  loadVisitors();
}

// Kullanıcılar
async function loadUsers() {
  const c = document.getElementById('users-container');
  c.innerHTML = '<div class="loading">Yükleniyor...</div>';
  const { data, error } = await sb.from('discord_users').select('*').order('last_login', { ascending: false });
  if (error || !data?.length) {
    c.innerHTML = '<div class="empty-state">Henüz kullanıcı yok.</div>';
    return;
  }
  document.getElementById('stat-users').textContent = data.length;
  c.innerHTML = `<table class="data-table"><thead><tr><th>#</th><th>Avatar</th><th>Kullanıcı</th><th>Discord ID</th><th>Son Giriş</th></tr></thead><tbody>
  ${data.map((u,i) => `<tr><td>${i+1}</td>
  <td>${u.avatar ? `<img src="${u.avatar}" width="32" height="32" style="border-radius:50%">` : `<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#a855f7);display:flex;align-items:center;justify-content:center;font-weight:800">${(u.username||'?')[0].toUpperCase()}</div>`}</td>
  <td><strong>${u.username||'—'}</strong></td>
  <td style="font-family:monospace;font-size:0.78rem;color:#52525b">${u.discord_id||'—'}</td>
  <td>${u.last_login ? new Date(u.last_login).toLocaleString('tr-TR') : '—'}</td></tr>`).join('')}
  </tbody></table>`;
}

// Ayarlar
async function loadSettings() {
  try {
    const { data } = await sb.from('site_stats').select('key,value');
    document.getElementById('dl-pc').value   = data?.find(r=>r.key==='pc_optimizer_downloads')?.value || 0;
    document.getElementById('dl-swex').value = data?.find(r=>r.key==='swex_optimizer_downloads')?.value || 0;
  } catch(e) {}
  try {
    const { data } = await sb.from('settings').select('key,value');
    document.getElementById('ver-pc').value   = data?.find(r=>r.key==='ver_pc')?.value || 'v2.1.0';
    document.getElementById('ver-swex').value = data?.find(r=>r.key==='ver_swex')?.value || 'v3.0.2';
    const cd = data?.find(r=>r.key==='countdown_date')?.value || '';
    const rm = data?.find(r=>r.key==='review_mode')?.value || 'auto';
    if (cd) document.getElementById('countdown-date').value = cd;
    document.getElementById(rm==='manual'?'mode-manual':'mode-auto').checked = true;
  } catch(e) {}
}

async function saveDownloadCounts() {
  const pc   = parseInt(document.getElementById('dl-pc').value) || 0;
  const swex = parseInt(document.getElementById('dl-swex').value) || 0;
  await sb.from('site_stats').upsert([{key:'pc_optimizer_downloads',value:pc},{key:'swex_optimizer_downloads',value:swex}],{onConflict:'key'});
  const st = document.getElementById('dl-status');
  st.style.display = 'block'; st.textContent = '✅ Kaydedildi!';
  setTimeout(() => st.style.display = 'none', 2000);
  loadStats();
}

async function saveVersions() {
  await sb.from('settings').upsert([
    {key:'ver_pc',   value:document.getElementById('ver-pc').value.trim()},
    {key:'ver_swex', value:document.getElementById('ver-swex').value.trim()}
  ],{onConflict:'key'});
  const st = document.getElementById('ver-status');
  st.style.display = 'block'; st.textContent = '✅ Kaydedildi!';
  setTimeout(() => st.style.display = 'none', 2000);
}

async function saveCountdownDate() {
  await sb.from('settings').upsert({key:'countdown_date',value:document.getElementById('countdown-date').value},{onConflict:'key'});
  const st = document.getElementById('countdown-status');
  st.style.display = 'block'; st.textContent = '✅ Kaydedildi!';
  setTimeout(() => st.style.display = 'none', 2000);
}

async function saveReviewMode() {
  const mode = document.querySelector('input[name="review-mode"]:checked')?.value || 'auto';
  await sb.from('settings').upsert({key:'review_mode',value:mode},{onConflict:'key'});
  const st = document.getElementById('mode-status');
  st.style.display = 'block'; st.textContent = '✅ Kaydedildi!';
  setTimeout(() => st.style.display = 'none', 2000);
}

// Aktivite
async function loadActivity() {
  // Online sayısı — Supabase'den son 10 dakika
  try {
    const tenMinAgo = new Date(Date.now() - 600000).toISOString();
    const { data: onlineData } = await sb.from('visitors')
      .select('id', { count: 'exact' })
      .gte('created_at', tenMinAgo);
    const onlineCount = Math.max(onlineData?.length || 0, 1);
    document.getElementById('act-online').textContent = onlineCount;
  } catch(e) {
    document.getElementById('act-online').textContent = '1';
  }

  // Bugün ziyaret — Supabase'den
  try {
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    const { data: todayData } = await sb.from('visitors')
      .select('id')
      .gte('created_at', todayStart.toISOString());
    document.getElementById('act-today').textContent = todayData?.length || '0';
  } catch(e) {
    document.getElementById('act-today').textContent = '0';
  }

  // Toplam indirme
  try {
    const { data } = await sb.from('site_stats').select('value');
    document.getElementById('act-downloads').textContent = data?.reduce((s,r)=>s+(r.value||0),0) || 0;
  } catch(e) {}

  // İndirme dağılım grafiği
  try {
    const { data } = await sb.from('site_stats').select('key,value');
    const pc   = data?.find(r=>r.key==='pc_optimizer_downloads')?.value || 0;
    const swex = data?.find(r=>r.key==='swex_optimizer_downloads')?.value || 0;
    const max  = Math.max(pc, swex, 1);
    document.getElementById('download-chart').innerHTML =
      `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1">
        <div style="font-size:0.75rem;color:#818cf8;font-weight:700">${pc}</div>
        <div style="width:100%;background:#818cf8;border-radius:4px 4px 0 0;height:${(pc/max)*70}px;min-height:4px"></div>
        <div style="font-size:0.68rem;color:#52525b">PC Opt.</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1">
        <div style="font-size:0.75rem;color:#f472b6;font-weight:700">${swex}</div>
        <div style="width:100%;background:#f472b6;border-radius:4px 4px 0 0;height:${(swex/max)*70}px;min-height:4px"></div>
        <div style="font-size:0.68rem;color:#52525b">Swex Opt.</div>
      </div>`;
  } catch(e) {}
}

// ===== TEMA =====
let _darkMode = true;
function toggleTheme() {
  _darkMode = !_darkMode;
  document.body.style.background = _darkMode ? '#000' : '#f0f0f5';
  document.body.style.color = _darkMode ? '#f5f5f7' : '#1a1a2e';
  document.getElementById('theme-btn').textContent = _darkMode ? '🌙' : '☀️';
}

// ===== BİLDİRİM =====
let _notifOpen = false;
const _notifs = [];
function toggleNotifPanel() {
  _notifOpen = !_notifOpen;
  document.getElementById('notif-panel').style.display = _notifOpen ? 'block' : 'none';
  if (_notifOpen) {
    document.getElementById('notif-dot').style.display = 'none';
    renderNotifs();
  }
}
function addNotif(msg, type = 'info') {
  _notifs.unshift({ msg, type, time: new Date().toLocaleTimeString('tr-TR') });
  document.getElementById('notif-dot').style.display = 'block';
}
function renderNotifs() {
  const list = document.getElementById('notif-list');
  if (!_notifs.length) { list.innerHTML = '<div style="font-size:0.78rem;color:#52525b;text-align:center;padding:16px">Henüz bildirim yok</div>'; return; }
  list.innerHTML = _notifs.slice(0, 20).map(n => `
    <div style="padding:10px 12px;background:rgba(255,255,255,0.04);border-radius:8px;border-left:3px solid ${n.type==='success'?'#34d399':n.type==='warning'?'#fbbf24':'#818cf8'}">
      <div style="font-size:0.8rem;color:#f5f5f7">${n.msg}</div>
      <div style="font-size:0.7rem;color:#52525b;margin-top:2px">${n.time}</div>
    </div>`).join('');
}

// ===== GRAFİKLER =====
let _charts = {};
async function loadCharts() {
  try {
    const { data, error } = await sb.from('visitors')
      .select('created_at, country, device')
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) { console.error('Charts visitors error:', error); }

    const visitorData = data || [];

    // Son 7 gün
    const days = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      days[d.toLocaleDateString('tr-TR', { day:'2-digit', month:'2-digit' })] = 0;
    }
    visitorData.forEach(v => {
      if (!v.created_at) return;
      const d = new Date(v.created_at).toLocaleDateString('tr-TR', { day:'2-digit', month:'2-digit' });
      if (days[d] !== undefined) days[d]++;
    });

    // Ülkeler
    const countries = {};
    visitorData.forEach(v => {
      const c = v.country || 'Bilinmiyor';
      countries[c] = (countries[c] || 0) + 1;
    });
    const topCountries = Object.entries(countries).sort((a,b)=>b[1]-a[1]).slice(0,6);

    // Cihazlar
    const devices = {};
    visitorData.forEach(v => {
      const d = v.device || 'Bilinmiyor';
      devices[d] = (devices[d] || 0) + 1;
    });

    const colors = ['#6366f1','#a855f7','#f472b6','#34d399','#fbbf24','#60a5fa'];

    // Grafik 1: Ziyaretçi (son 7 gün)
    const cv1 = document.getElementById('chart-visitors');
    if (cv1) {
      if (_charts.visitors) _charts.visitors.destroy();
      _charts.visitors = new Chart(cv1, {
        type: 'line',
        data: {
          labels: Object.keys(days),
          datasets: [{
            label: 'Ziyaretçi',
            data: Object.values(days),
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99,102,241,0.1)',
            tension: 0.4, fill: true,
            pointBackgroundColor: '#818cf8',
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { labels: { color: '#a1a1aa' } } },
          scales: {
            x: { ticks: { color: '#52525b' }, grid: { color: 'rgba(255,255,255,0.05)' } },
            y: { beginAtZero: true, ticks: { color: '#52525b', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.05)' } }
          }
        }
      });
    }

    // Grafik 2: Ülkeler
    const cv2 = document.getElementById('chart-countries');
    if (cv2) {
      if (_charts.countries) _charts.countries.destroy();
      if (topCountries.length > 0) {
        _charts.countries = new Chart(cv2, {
          type: 'doughnut',
          data: {
            labels: topCountries.map(c=>c[0]),
            datasets: [{ data: topCountries.map(c=>c[1]), backgroundColor: colors, borderWidth: 0 }]
          },
          options: { responsive: true, plugins: { legend: { labels: { color: '#a1a1aa', font: { size: 11 } } } } }
        });
      } else {
        cv2.parentElement.innerHTML += '<div style="text-align:center;color:#52525b;font-size:0.78rem;padding:20px">Henüz veri yok</div>';
      }
    }

    // Grafik 3: Cihazlar
    const cv3 = document.getElementById('chart-devices');
    if (cv3) {
      if (_charts.devices) _charts.devices.destroy();
      if (Object.keys(devices).length > 0) {
        _charts.devices = new Chart(cv3, {
          type: 'pie',
          data: {
            labels: Object.keys(devices),
            datasets: [{ data: Object.values(devices), backgroundColor: ['#6366f1','#f472b6','#34d399','#fbbf24'], borderWidth: 0 }]
          },
          options: { responsive: true, plugins: { legend: { labels: { color: '#a1a1aa' } } } }
        });
      } else {
        cv3.parentElement.innerHTML += '<div style="text-align:center;color:#52525b;font-size:0.78rem;padding:20px">Henüz veri yok</div>';
      }
    }

    // Grafik 4: İndirmeler
    const cv4 = document.getElementById('chart-downloads');
    if (cv4) {
      const { data: stats } = await sb.from('site_stats').select('key,value');
      const pc   = stats?.find(r=>r.key==='pc_optimizer_downloads')?.value || 0;
      const swex = stats?.find(r=>r.key==='swex_optimizer_downloads')?.value || 0;
      if (_charts.downloads) _charts.downloads.destroy();
      _charts.downloads = new Chart(cv4, {
        type: 'bar',
        data: {
          labels: ['PC Optimizer', 'Swex Optimizer'],
          datasets: [{ data: [pc, swex], backgroundColor: ['#6366f1','#f472b6'], borderRadius: 8, borderWidth: 0 }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#a1a1aa' }, grid: { display: false } },
            y: { beginAtZero: true, ticks: { color: '#52525b' }, grid: { color: 'rgba(255,255,255,0.05)' } }
          }
        }
      });
    }
  } catch(e) {
    console.error('Chart error:', e);
  }
}

// ===== NOTLAR =====
async function loadNotes() {
  const list = document.getElementById('notes-list');
  try {
    const { data } = await sb.from('admin_notes').select('*').order('created_at', { ascending: false });
    if (!data?.length) { list.innerHTML = '<div style="font-size:0.78rem;color:#52525b;text-align:center;padding:16px">Henüz not yok</div>'; return; }
    list.innerHTML = data.map(n => `
      <div style="padding:10px 12px;background:rgba(255,255,255,0.04);border-radius:8px;border:1px solid rgba(255,255,255,0.06);position:relative">
        <div style="font-size:0.82rem;color:#f5f5f7;margin-bottom:4px;white-space:pre-wrap">${n.content}</div>
        <div style="font-size:0.7rem;color:#52525b">${new Date(n.created_at).toLocaleString('tr-TR')}</div>
        <button onclick="deleteNote(${n.id})" style="position:absolute;top:8px;right:8px;background:none;border:none;color:#52525b;cursor:pointer;font-size:0.75rem">✕</button>
      </div>`).join('');
  } catch(e) { list.innerHTML = '<div style="font-size:0.78rem;color:#f87171;text-align:center;padding:16px">Hata oluştu</div>'; }
}

async function saveNote() {
  const content = document.getElementById('note-input').value.trim();
  if (!content) return;
  await sb.from('admin_notes').insert({ content });
  document.getElementById('note-input').value = '';
  const st = document.getElementById('note-status');
  st.style.display = 'block'; st.textContent = '✅ Not kaydedildi!';
  setTimeout(() => st.style.display = 'none', 2000);
  loadNotes();
  addNotif('Yeni not kaydedildi', 'success');
}

async function deleteNote(id) {
  await sb.from('admin_notes').delete().eq('id', id);
  loadNotes();
}

// ===== BAKIM MODU =====
async function toggleMaintenance() {
  const on = document.getElementById('maintenance-toggle').checked;
  const slider = document.getElementById('maintenance-slider');
  const label = document.getElementById('maintenance-label');
  slider.style.background = on ? '#6366f1' : 'rgba(255,255,255,0.1)';
  label.textContent = on ? '🚧 Aktif - Site kapalı' : 'Kapalı';
  label.style.color = on ? '#fbbf24' : '#a1a1aa';
  await sb.from('settings').upsert({ key: 'maintenance_mode', value: on ? 'true' : 'false' }, { onConflict: 'key' });
  const st = document.getElementById('maintenance-status');
  st.style.display = 'block'; st.textContent = on ? '🚧 Bakım modu aktif!' : '✅ Site açık';
  st.style.color = on ? '#fbbf24' : '#34d399';
  setTimeout(() => st.style.display = 'none', 2000);
  addNotif(on ? '🚧 Bakım modu açıldı!' : '✅ Bakım modu kapatıldı', on ? 'warning' : 'success');
}

// ===== İNDİRME LİNKLERİ =====
async function saveDlLinks() {
  const pc = document.getElementById('dl-link-pc').value.trim();
  const swex = document.getElementById('dl-link-swex').value.trim();
  await sb.from('settings').upsert([
    { key: 'dl_link_pc', value: pc },
    { key: 'dl_link_swex', value: swex }
  ], { onConflict: 'key' });
  const st = document.getElementById('dl-link-status');
  st.style.display = 'block'; st.textContent = '✅ Linkler kaydedildi!';
  setTimeout(() => st.style.display = 'none', 2000);
  addNotif('İndirme linkleri güncellendi', 'success');
}

// Ayarlar yüklenince bakım modu ve linkleri de yükle
const _origLoadSettings = loadSettings;
loadSettings = async function() {
  await _origLoadSettings();
  try {
    const { data } = await sb.from('settings').select('key,value');
    const maintenance = data?.find(r=>r.key==='maintenance_mode')?.value === 'true';
    const dlPc = data?.find(r=>r.key==='dl_link_pc')?.value || '';
    const dlSwex = data?.find(r=>r.key==='dl_link_swex')?.value || '';
    const toggle = document.getElementById('maintenance-toggle');
    const slider = document.getElementById('maintenance-slider');
    const label = document.getElementById('maintenance-label');
    if (toggle) { toggle.checked = maintenance; slider.style.background = maintenance ? '#6366f1' : 'rgba(255,255,255,0.1)'; label.textContent = maintenance ? '🚧 Aktif - Site kapalı' : 'Kapalı'; label.style.color = maintenance ? '#fbbf24' : '#a1a1aa'; }
    if (document.getElementById('dl-link-pc')) document.getElementById('dl-link-pc').value = dlPc;
    if (document.getElementById('dl-link-swex')) document.getElementById('dl-link-swex').value = dlSwex;
  } catch(e) {}
};

// Gerçek zamanlı yorum bildirimi
sb.channel('reviews-channel').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reviews' }, payload => {
  addNotif(`💬 Yeni yorum: ${payload.new.username || 'Anonim'}`, 'info');
}).subscribe();
