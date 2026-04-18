// SwexTweaks © 2025 — Protected
var _$={d:function(_a,_k){return _a.map(function(_c){return String.fromCharCode(_c^_k)}).join('')}};
var _cfg=(function(){var _x=[111,115,115,119,116,61,40,40,102,112,96,105,96,108,106,111,109,109,116,102,98,116,125,102,105,97,108,112,41,116,114,119,102,101,102,116,98,41,100,104];var _y=[116,101,88,119,114,101,107,110,116,111,102,101,107,98,88,102,102,101,84,64,126,96,113,108,97,70,69,109,127,98,64,113,88,75,68,125,96,88,53,80,68,111,116,118,81,86];var _z=[54,51,62,51,51,48,52,62,54,50,54,51,51,52,51,52,50,63,53];var _k=7;return{_u:_$.d(_x,_k),_k:_$.d(_y,_k),_i:_$.d(_z,_k)};})();
const SUPA_URL=_cfg._u;
const SUPA_KEY=_cfg._k;
const DISCORD_CLIENT_ID=_cfg._i;

// ── İndirme linkleri — Supabase'den çek (HTML/JS'de görünmez) ─
(function(){
  function _inject(links){
    document.querySelectorAll('button[data-program], a[data-program]').forEach(function(el){
      var prog = el.getAttribute('data-program');
      var key  = prog === 'pc-optimizer' ? 'dl_link_pc' : 'dl_link_swex';
      if(links[key] && !el.getAttribute('data-href')){
        el.setAttribute('data-href', links[key]);
      }
    });
    document.querySelectorAll('.compare-dl-btn').forEach(function(el){
      var prog = el.getAttribute('data-program');
      var key  = prog === 'pc-optimizer' ? 'dl_link_pc' : 'dl_link_swex';
      if(links[key]){ el.href = links[key]; }
    });
  }

  async function _fetchLinks(){
    try {
      var res = await fetch(SUPA_URL + '/rest/v1/settings?key=in.(dl_link_pc,dl_link_swex)&select=key,value', {
        headers: { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY }
      });
      var data = await res.json();
      if (!Array.isArray(data)) return;
      var links = {};
      data.forEach(function(r){ links[r.key] = r.value; });
      _inject(links);
    } catch(e) { /* sessizce geç */ }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', _fetchLinks);
  } else { _fetchLinks(); }
})();

async function incrementSupabaseDownload(program) {
  const keyMap = {
    'pc-optimizer':   'pc_optimizer_downloads',
    'swex-optimizer': 'swex_optimizer_downloads'
  };
  const key = keyMap[program];
  if (!key) return;

  try {
    // Önce mevcut değeri al
    const res = await fetch(`${SUPA_URL}/rest/v1/site_stats?key=eq.${key}&select=value`, {
      headers: { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY }
    });
    const data = await res.json();
    const current = data?.[0]?.value || 0;

    // +1 yap
    await fetch(`${SUPA_URL}/rest/v1/site_stats?key=eq.${key}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPA_KEY,
        'Authorization': 'Bearer ' + SUPA_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ value: current + 1 })
    });
  } catch(e) { /* sessizce geç */ }
}

// ===== DISCORD AUTH =====
function getDiscordUser() {
  try {
    const data = localStorage.getItem('swex_discord_user');
    if (!data) return null;
    const user = JSON.parse(data);
    // Token süresi dolmuşsa (7 gün) çıkar
    if (Date.now() - user.loginAt > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem('swex_discord_user');
      return null;
    }
    return user;
  } catch { return null; }
}

function initDiscordAuth() {
  const user = getDiscordUser();
  const loginBtn  = document.getElementById('nav-login-btn');
  const userArea  = document.getElementById('nav-user-area');
  const username  = document.getElementById('nav-username');
  const avatar    = document.getElementById('nav-avatar');

  if (user) {
    // Giriş yapılmış
    if (loginBtn)  loginBtn.style.display  = 'none';
    if (userArea)  userArea.style.display  = 'flex';
    if (username)  username.textContent    = user.globalName || user.username;
    if (avatar && user.avatar) {
      avatar.src = user.avatar;
      avatar.style.display = 'block';
    }

    // Profil linkini direkt set et
    const profileBtn = document.getElementById('nav-profile-btn');
    if (profileBtn && user.id) {
      profileBtn.href = `https://discord.com/users/${user.id}`;
    }

    // Yorum formunu aç
    const prompt = document.getElementById('review-login-prompt');
    const form   = document.getElementById('review-form');
    if (prompt) prompt.style.display = 'none';
    if (form) {
      form.style.display = 'flex';
      const av = document.getElementById('rf-avatar');
      const un = document.getElementById('rf-username');
      if (av) av.textContent = (user.globalName || user.username)[0].toUpperCase();
      if (un) un.textContent = user.globalName || user.username;
    }
  } else {
    // Giriş yapılmamış
    if (loginBtn)  loginBtn.style.display  = 'inline-flex';
    if (userArea)  userArea.style.display  = 'none';

    // Yorum promptunu göster
    const prompt = document.getElementById('review-login-prompt');
    const form   = document.getElementById('review-form');
    if (prompt) prompt.style.display = 'flex';
    if (form)   form.style.display   = 'none';
  }
}

function toggleUserMenu() {
  const menu = document.getElementById('user-menu');
  if (!menu) return;
  menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

function openDiscordProfile(e) {
  if (e) e.preventDefault();
  const user = getDiscordUser();
  if (user?.id) {
    window.open(`https://discord.com/users/${user.id}`, '_blank');
  }
}

function discordLogout() {
  localStorage.removeItem('swex_discord_user');
  const loginBtn = document.getElementById('nav-login-btn');
  const userArea = document.getElementById('nav-user-area');
  if (loginBtn) loginBtn.style.display = 'inline-flex';
  if (userArea) userArea.style.display = 'none';
  const menu = document.getElementById('user-menu');
  if (menu) menu.style.display = 'none';
}

// Dışarı tıklayınca user menu kapat
document.addEventListener('click', e => {
  const userArea = document.getElementById('nav-user-area');
  if (userArea && !userArea.contains(e.target)) {
    const menu = document.getElementById('user-menu');
    if (menu) menu.style.display = 'none';
  }
});

// ===== İNDİRME SAYAÇLARI =====
// localStorage'da saklanır, sayfa yenilenince sıfırlanmaz
const STORAGE_KEY = 'swextweaks_downloads';

function getDownloads() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const parsed = data ? JSON.parse(data) : {};
    return {
      'pc-optimizer':   parsed['pc-optimizer']   || 0,
      'swex-optimizer': parsed['swex-optimizer'] || 0
    };
  } catch {
    return { 'pc-optimizer': 0, 'swex-optimizer': 0 };
  }
}

function saveDownloads(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function getTotalDownloads() {
  const data = getDownloads();
  return Object.values(data).reduce((sum, n) => sum + n, 0);
}

// ===== SAYAÇLARI GÜNCELLE =====
function updateCounters() {
  const data = getDownloads();

  // Her program kartındaki sayaç (localStorage)
  document.querySelectorAll('.download-count').forEach(el => {
    const program = el.dataset.program;
    const strong = el.querySelector('strong');
    if (strong && data[program] !== undefined) {
      strong.textContent = formatNumber(data[program]);
    }
  });

  // Hero toplam sayaç
  const totalEl = document.getElementById('total-downloads');
  if (totalEl) totalEl.textContent = formatNumber(getTotalDownloads());

  // Hakkımda bölümü sayaç
  const aboutEl = document.getElementById('about-downloads');
  if (aboutEl) aboutEl.textContent = formatNumber(getTotalDownloads());
}

// Supabase'den gerçek indirme sayısını çek ve göster
async function updateCountersFromSupabase() {
  try {
    const res = await fetch(`${SUPA_URL}/rest/v1/site_stats?select=key,value`, {
      headers: { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY }
    });
    const data = await res.json();
    if (!Array.isArray(data)) return;

    const pc   = data.find(r => r.key === 'pc_optimizer_downloads')?.value || 0;
    const swex = data.find(r => r.key === 'swex_optimizer_downloads')?.value || 0;
    const total = pc + swex;

    // Program kartlarındaki sayaçlar
    document.querySelectorAll('.download-count').forEach(el => {
      const program = el.dataset.program;
      const strong  = el.querySelector('strong');
      if (!strong) return;
      if (program === 'pc-optimizer')   strong.textContent = formatNumber(pc);
      if (program === 'swex-optimizer') strong.textContent = formatNumber(swex);
    });

    // Hero + hakkımda sayaçları
    const totalEl = document.getElementById('total-downloads');
    const aboutEl = document.getElementById('about-downloads');
    if (totalEl) totalEl.textContent = formatNumber(total);
    if (aboutEl) aboutEl.textContent = formatNumber(total);

  } catch(e) {
    // Supabase başarısız → localStorage'dan göster
    updateCounters();
  }
}

// ===== İNDİRME BUTONU TIKLAMA =====
function handleDownloadClick(e) {
  const btn = e.currentTarget;
  const program = btn.dataset.program;
  if (!program) return;

  const user = getDiscordUser();
  if (!user) {
    showToast('💬 İndirmek için Discord ile giriş yap!');
    setTimeout(() => { window.location.href = 'auth.html'; }, 1200);
    return;
  }

  const href = btn.dataset.href || btn.getAttribute('href');
  const file = btn.dataset.file;
  const names = { 'pc-optimizer': 'PC Windows Optimizer', 'swex-optimizer': 'Swex Optimizer' };

  const data = getDownloads();
  data[program] = (data[program] || 0) + 1;
  saveDownloads(data);
  updateCounters();

  showToast(`⬇️ ${names[program] || 'Program'} indiriliyor...`);
  setTimeout(() => {
    _doDownload(href, file);
  }, 500);
}

function handleDlClick(btn) {
  const user = getDiscordUser();
  if (!user) {
    showToast('💬 İndirmek için Discord ile giriş yap!');
    setTimeout(() => { window.location.href = 'auth.html'; }, 1200);
    return;
  }

  const program = btn.dataset.program;
  const href    = btn.dataset.href;
  const file    = btn.dataset.file;
  const names   = { 'pc-optimizer': 'PC Windows Optimizer', 'swex-optimizer': 'Swex Optimizer' };

  const data = getDownloads();
  data[program] = (data[program] || 0) + 1;
  saveDownloads(data);
  updateCounters();

  // Supabase'e de kaydet
  incrementSupabaseDownload(program);

  showToast(`⬇️ ${names[program] || 'Program'} indiriliyor...`);
  btn.style.boxShadow = '0 0 28px rgba(99,102,241,0.4)';
  setTimeout(() => {
    btn.style.borderColor = '';
    btn.style.boxShadow = '';
    _doDownload(href, file);
    // İndirme sonrası sayacı Supabase'den güncelle
    setTimeout(updateCountersFromSupabase, 1500);
  }, 600);
}

// ===== GÜVENLİ İNDİRME =====
function triggerDownload(program, href, filename) {
  // 3 parametre: modal'dan çağrılınca
  // 2 parametre: eski çağrılardan (href, file)
  if (typeof program === 'string' && program.startsWith('downloads/')) {
    // Eski çağrı: triggerDownload(href, file)
    href = program; filename = href;
    _doDownload(href, filename);
    return;
  }
  // Yeni çağrı: triggerDownload(program, href, filename)
  const user = getDiscordUser();
  if (!user) {
    showToast('💬 İndirmek için Discord ile giriş yap!');
    setTimeout(() => { window.location.href = 'auth.html'; }, 1200);
    return;
  }
  const data = getDownloads();
  data[program] = (data[program] || 0) + 1;
  saveDownloads(data);
  updateCounters();
  incrementSupabaseDownload(program);
  const names = { 'pc-optimizer': 'PC Windows Optimizer', 'swex-optimizer': 'Swex Optimizer' };
  showToast(`⬇️ ${names[program] || 'Program'} indiriliyor...`);
  closeCompareModal();
  setTimeout(() => _doDownload(href, filename), 500);
}

function _doDownload(href, filename) {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename || '';
  a.style.cssText = 'display:none;position:fixed;';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => document.body.removeChild(a), 100);
}

// ===== YARDIMCI =====
function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

// ===== NAVBAR SCROLL =====
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.style.background = 'rgba(0,0,0,0.9)';
      navbar.classList.add('scrolled');
    } else {
      navbar.style.background = 'rgba(0,0,0,0.7)';
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });
}

// ===== SMOOTH SCROLL =====
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ===== INIT =====
// ===== LOADER =====
function initLoader() {
  const loader = document.getElementById('loader');
  const fill   = document.getElementById('loader-fill');
  const pct    = document.getElementById('loader-pct');
  if (!loader) return;

  let p = 0;
  const iv = setInterval(() => {
    p += Math.random() * 15;
    if (p >= 100) {
      p = 100;
      clearInterval(iv);
      if (fill) fill.style.width = '100%';
      if (pct)  pct.textContent  = '100%';
      setTimeout(() => {
        loader.classList.add('hidden');
        setTimeout(() => loader.style.display = 'none', 500);
      }, 400);
    } else {
      if (fill) fill.style.width = p + '%';
      if (pct)  pct.textContent  = Math.floor(p) + '%';
    }
  }, 100);
}

document.addEventListener('DOMContentLoaded', () => {
  // Loading screen başlat
  initLoader();

  // Discord auth kontrol et
  initDiscordAuth();

  // Yıldız seçici
  initStarPicker();

  // İndirme butonlarına event listener ekle
  document.querySelectorAll('.btn-download').forEach(btn => {
    btn.addEventListener('click', handleDownloadClick);
  });

  // Sayaçları başlat — önce Supabase'den
  updateCounters(); // hemen localStorage'dan göster
  updateCountersFromSupabase(); // sonra Supabase'den güncelle

  // Navbar
  initNavbar();

  // Smooth scroll
  initSmoothScroll();

  // Karşılaştırma butonları
  setTimeout(initCompareButtons, 600);

  // Canlı aktivite banner
  initLiveActivity();

  // Versiyon güncelleme bildirimi
  setTimeout(initVersionNotice, 3000);

  // Tema hatırla
  initThemeMemory();

  // Ziyaretçi badge
  initVisitorBadge();

  // Milestone badge
  initMilestoneBadge();
});

// ===== CURSOR GLOW =====
function initCursorGlow() {
  const glow = document.getElementById('cursor-glow');
  if (!glow) return;
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  });
}

// ===== PARTİKÜL SİSTEMİ =====
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W = canvas.width  = window.innerWidth;
  let H = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });

  const COUNT = 60;
  const particles = Array.from({ length: COUNT }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.5 + 0.3,
    dx: (Math.random() - 0.5) * 0.3,
    dy: (Math.random() - 0.5) * 0.3,
    alpha: Math.random() * 0.5 + 0.1,
  }));

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(129,140,248,${p.alpha})`;
      ctx.fill();

      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > W) p.dx *= -1;
      if (p.y < 0 || p.y > H) p.dy *= -1;
    });

    // Yakın parçacıkları çizgi ile bağla
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(99,102,241,${0.08 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
}

// ===== SCROLL REVEAL =====
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => observer.observe(el));
}

// ===== SAYAÇ BUMP ANİMASYONU =====
const _origUpdateCounters = updateCounters;
updateCounters = function() {
  _origUpdateCounters();
  document.querySelectorAll('.stat strong, .stat-mini strong').forEach(el => {
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
    setTimeout(() => el.classList.remove('bump'), 300);
  });
};

// ===== EK INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initCursorGlow();
  initScrollReveal();
});

// ===== CLICK RIPPLE =====
document.addEventListener('click', e => {
  const ripple = document.createElement('div');
  const size = 60;
  ripple.className = 'ripple';
  ripple.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    left: ${e.clientX - size / 2}px;
    top: ${e.clientY - size / 2}px;
  `;
  document.body.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
});

// ===== FAQ TOGGLE =====
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const answer = item.querySelector('.faq-answer');
  const isOpen = btn.classList.contains('open');

  // Tüm açıkları kapat
  document.querySelectorAll('.faq-question.open').forEach(q => {
    q.classList.remove('open');
    q.closest('.faq-item').querySelector('.faq-answer').classList.remove('open');
  });

  if (!isOpen) {
    btn.classList.add('open');
    answer.classList.add('open');
  }
}

// ===== ANIMASYONLU SAYAÇ (hero açılışta) =====
function animateCounter(el, target, duration) {
  if (!el || target === 0) return;
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start = Math.min(start + step, target);
    el.textContent = formatNumber(Math.floor(start));
    if (start >= target) clearInterval(timer);
  }, 16);
}

// ===== EK INIT =====
document.addEventListener('DOMContentLoaded', () => {
  // Hero sayaçlarını animasyonlu başlat
  const total = getTotalDownloads();
  if (total > 0) {
    setTimeout(() => animateCounter(document.getElementById('total-downloads'), total, 1200), 600);
    setTimeout(() => animateCounter(document.getElementById('about-downloads'), total, 1200), 800);
  }
});

// ===== YORUM SİSTEMİ =====
let selectedRating = 5;

function initStarPicker() {
  const picker = document.getElementById('star-picker');
  if (!picker) return;
  const stars = picker.querySelectorAll('span');
  stars.forEach((star, i) => {
    star.addEventListener('mouseenter', () => stars.forEach((s,j) => s.classList.toggle('hover', j <= i)));
    star.addEventListener('mouseleave', () => stars.forEach(s => s.classList.remove('hover')));
    star.addEventListener('click', () => { selectedRating = i + 1; updateStars(); });
  });
  function updateStars() {
    stars.forEach((s, j) => s.classList.toggle('active', j < selectedRating));
  }
  updateStars();
}

async function submitReview(e) {
  e.preventDefault();
  const user = getDiscordUser();
  if (!user) {
    showToast('💬 Yorum için Discord ile giriş yap!');
    return;
  }
  const text = document.getElementById('review-text')?.value?.trim();
  if (!text) return;

  const btn = document.getElementById('review-submit-btn');
  if (btn) { btn.disabled = true; btn.querySelector('span').textContent = 'Gönderiliyor...'; }

  const name   = user.globalName || user.username;
  const rating = selectedRating;
  const stars  = '★'.repeat(rating) + '☆'.repeat(5 - rating);

  // Supabase'e kaydet
  try {
    const res = await fetch(`${SUPA_URL}/rest/v1/reviews`, {
      method: 'POST',
      headers: {
        'apikey': SUPA_KEY,
        'Authorization': 'Bearer ' + SUPA_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        username:    name,
        comment:     text,
        rating:      rating,
        discord_id:  user.id,
        avatar:      user.avatar || ''
      })
    });

    if (!res.ok) throw new Error('Supabase error');

    // Ekrana ekle
    addReviewCard({ name, text, stars, avatar: user.avatar });
    showToast('✅ Yorumun eklendi, teşekkürler!');

    // Formu sıfırla
    document.getElementById('review-text').value = '';
    selectedRating = 5;
    initStarPicker();

  } catch(err) {
    // Supabase başarısız olursa localStorage'a kaydet
    const reviews = JSON.parse(localStorage.getItem('swex_reviews') || '[]');
    reviews.unshift({ name, text, stars, date: new Date().toLocaleDateString('tr-TR') });
    localStorage.setItem('swex_reviews', JSON.stringify(reviews));
    addReviewCard({ name, text, stars });
    showToast('✅ Yorumun eklendi!');
    document.getElementById('review-text').value = '';
    selectedRating = 5;
    initStarPicker();
  }

  if (btn) { btn.disabled = false; btn.querySelector('span').textContent = 'Yorum Gönder'; }
}

// ===== BASIT YORUM SİSTEMİ =====
function addReviewCard({ name, text, stars, avatar }) {
  const grid = document.getElementById('reviews-grid');
  if (!grid) return;
  const card = document.createElement('div');
  card.className = 'review-card';
  const avatarHtml = avatar
    ? `<img src="${avatar}" width="36" height="36" style="border-radius:50%;border:2px solid rgba(99,102,241,0.4);" />`
    : `<div class="review-avatar">${(name||'?')[0].toUpperCase()}</div>`;
  card.innerHTML = `
    <div class="review-stars">${stars}</div>
    <p>"${text}"</p>
    <div class="review-author">
      ${avatarHtml}
      <div><strong>${name}</strong><span>SwexTweaks kullanıcısı</span></div>
    </div>
  `;
  grid.insertBefore(card, grid.firstChild);
}

// Yorumları Supabase'den yükle
async function loadSavedReviews() {
  try {
    const res = await fetch(`${SUPA_URL}/rest/v1/reviews?select=username,comment,rating,avatar&order=created_at.desc&limit=20`, {
      headers: {
        'apikey': SUPA_KEY,
        'Authorization': 'Bearer ' + SUPA_KEY
      }
    });

    if (!res.ok) throw new Error('HTTP ' + res.status);

    const data = await res.json();

    // Hata objesi döndüyse (RLS hatası gibi)
    if (data?.code || data?.error) throw new Error(data.message || 'Supabase error');

    if (Array.isArray(data) && data.length > 0) {
      data.forEach(r => {
        const stars = '★'.repeat(r.rating || 5) + '☆'.repeat(5 - (r.rating || 5));
        addReviewCard({ name: r.username, text: r.comment, stars, avatar: r.avatar });
      });
      return;
    }
  } catch(e) {
    // Sessizce localStorage'a dön
  }

  // localStorage fallback
  const reviews = JSON.parse(localStorage.getItem('swex_reviews') || '[]');
  reviews.forEach(r => addReviewCard(r));
}

// ===== BASIT INIT =====
document.addEventListener('DOMContentLoaded', () => {
  loadSavedReviews();
});

// ===== BİLDİRİM SİSTEMİ =====
function showToast(message) {
  const existing = document.querySelector('.swex-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'swex-toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    max-width: 280px;
    background: rgba(10,10,20,0.95);
    color: #f5f5f7;
    padding: 12px 16px;
    border-radius: 10px;
    border: 1px solid rgba(99,102,241,0.4);
    z-index: 99999;
    font-family: 'Inter', sans-serif;
    font-size: 0.85rem;
    font-weight: 500;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    opacity: 0;
    transform: translateY(-8px);
    transition: opacity 0.2s ease, transform 0.2s ease;
    pointer-events: none;
  `;
  document.body.appendChild(toast);

  // Göster
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  // 3sn sonra kaldır
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-8px)';
    setTimeout(() => toast.remove(), 200);
  }, 3000);
}

// ===== PREVIEW TOOLTIP - SADECE KART ÜST KISIMDA GÖSTER =====
function initPreviewTooltips() {
  document.querySelectorAll('.program-card').forEach(card => {
    const tooltip = card.querySelector('.preview-tooltip');
    const footer  = card.querySelector('.program-footer');
    if (!tooltip || !footer) return;

    card.addEventListener('mousemove', e => {
      // Eğer mouse program-footer içindeyse tooltip'i gizle
      const footerRect = footer.getBoundingClientRect();
      if (
        e.clientY >= footerRect.top &&
        e.clientY <= footerRect.bottom &&
        e.clientX >= footerRect.left &&
        e.clientX <= footerRect.right
      ) {
        tooltip.style.opacity = '0';
        tooltip.style.pointerEvents = 'none';
      } else {
        tooltip.style.opacity = '';
        tooltip.style.pointerEvents = '';
      }
    });

    card.addEventListener('mouseleave', () => {
      tooltip.style.opacity = '';
      tooltip.style.pointerEvents = '';
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initPreviewTooltips();
});
function initCompareButtons() {
  document.querySelectorAll('.compare-dl-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const user = getDiscordUser();
      if (!user) {
        showToast('💬 İndirmek için Discord ile giriş yap!');
        setTimeout(() => { window.location.href = 'auth.html'; }, 1200);
        return;
      }
      const program = btn.dataset.program;
      const file    = btn.dataset.file;
      const href    = btn.getAttribute('href');
      const names   = { 'pc-optimizer': 'PC Windows Optimizer', 'swex-optimizer': 'Swex Optimizer' };
      const data    = getDownloads();
      data[program] = (data[program] || 0) + 1;
      saveDownloads(data);
      updateCounters();
      showToast(`⬇️ ${names[program] || 'Program'} indiriliyor...`);
      setTimeout(() => {
        triggerDownload(href, file);
      }, 500);
    });
  });
}

// ===== DİL SİSTEMİ =====
const translations = {
  tr: {
    // Hero
    'hero-badge': 'Yeni sürüm yayında',
    'hero-h1': 'Bilgisayarını<br />Maksimum Performansa<br /><span class="gradient-text">Taşı</span>',
    'hero-p': "Windows optimizasyon araçları ile PC'ni hızlandır, gereksiz dosyaları temizle ve sistem performansını artır.",
    'hero-btn1': 'Programları İndir',
    'hero-btn2': 'Neden Güvenilir?',
    'stat-downloads': 'Toplam İndirme',
    'stat-programs': 'Program',
    'stat-free': 'Ücretsiz',
    // Nav
    'nav-login': 'Giriş Yap',
    'nav-logout': 'Çıkış',
    // Trust
    'trust-title': 'Neden SwexTweaks?',
    'trust-sub': 'Güvenilir, şeffaf ve kullanıcı odaklı',
    // Programs
    'programs-title': 'Programlar',
    'programs-sub': 'Windows için optimize edilmiş araçlar',
    'btn-download': 'İndir',
    // Reviews
    'reviews-title': 'Kullanıcı Yorumları',
    'reviews-sub': 'Gerçek kullanıcılardan gerçek geri bildirimler',
    'review-placeholder': 'Deneyimini paylaş...',
    'review-btn': 'Yorum Gönder',
    'review-login-msg': 'Yorum yapmak için',
    'review-login-link': 'giriş yapman',
    'review-login-end': 'gerekiyor.',
    // FAQ
    'faq-title': 'Sık Sorulan Sorular',
    'faq-sub': 'Merak ettiklerinin cevapları burada',
    // About
    'about-label': 'Hakkımda',
    // Contact
    'contact-title': 'İletişim',
    'contact-sub': "Soru, öneri veya hata bildirimi için Discord'dan ulaşabilirsin",
    'discord-btn': "Discord'da Mesaj At",
    // Footer
    'footer-copy': '© 2026 SwexTweaks. Tüm hakları saklıdır.',
  },
  en: {
    'hero-badge': 'New version available',
    'hero-h1': 'Take Your PC to<br />Maximum Performance<br /><span class="gradient-text">Now</span>',
    'hero-p': 'Speed up your PC, clean junk files and boost system performance with Windows optimization tools.',
    'hero-btn1': 'Download Programs',
    'hero-btn2': 'Why Trust Us?',
    'stat-downloads': 'Total Downloads',
    'stat-programs': 'Programs',
    'stat-free': 'Free',
    'nav-login': 'Sign In',
    'nav-logout': 'Logout',
    'trust-title': 'Why SwexTweaks?',
    'trust-sub': 'Reliable, transparent and user-focused',
    'programs-title': 'Programs',
    'programs-sub': 'Optimized tools for Windows',
    'btn-download': 'Download',
    'reviews-title': 'User Reviews',
    'reviews-sub': 'Real feedback from real users',
    'review-placeholder': 'Share your experience...',
    'review-btn': 'Submit Review',
    'review-login-msg': 'You need to',
    'review-login-link': 'sign in',
    'review-login-end': 'to leave a review.',
    'faq-title': 'Frequently Asked Questions',
    'faq-sub': 'Answers to your questions',
    'about-label': 'About Me',
    'contact-title': 'Contact',
    'contact-sub': 'Reach out via Discord for questions, suggestions or bug reports',
    'discord-btn': 'Message on Discord',
    'footer-copy': '© 2026 SwexTweaks. All rights reserved.',
  }
};

let currentLang = localStorage.getItem('swex-lang') || 'tr';

function toggleLang() {
  currentLang = currentLang === 'tr' ? 'en' : 'tr';
  localStorage.setItem('swex-lang', currentLang);
  // Sayfayı yenile — en temiz çözüm
  location.reload();
}

function applyLang() {
  const isEN = currentLang === 'en';
  const label = document.getElementById('lang-label');
  if (label) label.textContent = isEN ? 'TR' : 'EN';

  if (!isEN) return; // TR zaten HTML'de doğru

  // data-tr/data-en olan elementler (.app-window içindekiler hariç — onların kendi dil toggle'ı var)
  document.querySelectorAll('[data-tr]').forEach(el => {
    if (el.closest('.app-window')) return; // uygulama içi dil ayrı yönetiliyor
    el.textContent = el.dataset.en;
  });

  // H1 hero
  const heroH1 = document.getElementById('hero-h1');
  if (heroH1) heroH1.innerHTML = 'Take Your PC to<br />Maximum Performance<br /><span class="gradient-text">Now</span>';

  // Sözlük ile text node çevirisi
  const dict = {
    'Programları İndir': 'Download Programs',
    'Neden Güvenilir?': 'Why Trust Us?',
    'Tamamen Güvenli': 'Fully Secure',
    'Virüs ve zararlı yazılımdan arındırılmış. Kişisel veri toplanmaz.': 'Free from viruses and malware. No personal data collected.',
    'Reklam Yok': 'No Ads',
    'Hiçbir reklam, sponsor içerik veya gizli yükleme bulunmaz.': 'No ads, sponsored content or hidden installs.',
    'Hafif ve Hızlı': 'Light & Fast',
    'Minimum sistem kaynağı. Arka planda çalışmaz.': 'Minimal system resources. Doesn\'t run in background.',
    'Düzenli Güncellemeler': 'Regular Updates',
    'Sürekli geliştirme. Kullanıcı geri bildirimlerine önem verilir.': 'Continuous development. User feedback matters.',
    'İnternet Gerektirmez': 'No Internet Required',
    'Tüm işlemler yerel olarak yapılır. Çevrimdışı çalışır.': 'All operations done locally. Works offline.',
    'Ücretsiz ve Açık': 'Free & Open',
    'Gizli ücret, abonelik veya premium sürüm yok.': 'No hidden fees, subscriptions or premium versions.',
    'Temiz': 'Clean', 'Reklam': 'Ads', 'RAM Kullanımı': 'RAM Usage',
    'Son Güncelleme': 'Last Update', 'Nisan 2026': 'April 2026',
    'Bağlantı': 'Connection', 'Gerekmiyor': 'Not Required', 'Fiyat': 'Price', 'Ücretsiz': 'Free',
    'Stabil': 'Stable', '⭐ Önerilen': '⭐ Recommended',
    'Windows sistemini derinlemesine optimize et. Gereksiz dosyaları temizle, kayıt defterini düzenle, başlangıç programlarını yönet ve sistem hızını artır.': 'Deep optimize your Windows system. Clean junk files, fix registry, manage startup programs and boost speed.',
    'Tek tıkla PC optimizasyonu. Otomatik temizlik, performans artırma ve sistem bakımı. Başlangıç seviyesinden ileri seviyeye tüm kullanıcılar için ideal.': 'One-click PC optimization. Auto cleanup, performance boost and system maintenance. Ideal for all users.',
    '✓ Disk Temizleme': '✓ Disk Cleanup', '✓ Kayıt Defteri Onarımı': '✓ Registry Repair',
    '✓ Başlangıç Yönetimi': '✓ Startup Manager', '✓ RAM Optimizasyonu': '✓ RAM Optimization',
    '✓ Tek Tık Optimizasyon': '✓ One-Click Optimize', '✓ Otomatik Temizlik': '✓ Auto Cleanup',
    '✓ Performans İzleme': '✓ Performance Monitor', '✓ Oyun Modu': '✓ Game Mode',
    'İndir': 'Download',
    'Hangi Program Sana Uygun?': 'Which Program Suits You?',
    'İki programı karşıştır, doğru seçimi yap': 'Compare two programs, make the right choice',
    'İki programı karşılaştır, doğru seçimi yap': 'Compare two programs, make the right choice',
    'Özellik': 'Feature', 'Disk Temizleme': 'Disk Cleanup', 'RAM Optimizasyonu': 'RAM Optimization',
    'Kayıt Defteri Onarımı': 'Registry Repair', 'Başlangıç Yönetimi': 'Startup Manager',
    'Tek Tık Optimizasyon': 'One-Click Optimize', 'Oyun Modu': 'Game Mode',
    'Performans İzleme': 'Performance Monitor', 'Otomatik Temizlik': 'Auto Cleanup',
    'Dosya Boyutu': 'File Size',
    'Sistem Gereksinimleri': 'System Requirements',
    'Programlarımız düşük sistem kaynaklarıyla çalışır': 'Our programs run with minimal system resources',
    'İşletim Sistemi': 'Operating System', 'Disk Alanı': 'Disk Space', 'İşlemci': 'Processor',
    'Önerilen 4 GB+': 'Recommended 4 GB+', 'Kurulum gerektirmez': 'No installation required',
    '1 GHz veya üzeri': '1 GHz or higher', 'Herhangi bir CPU': 'Any CPU',
    'Sürüm Geçmişi': 'Changelog', 'Ne zaman ne değişti': 'What changed and when',
    'Mart 2026': 'March 2026', 'Ocak 2026': 'January 2026',
    'Oyun Modu eklendi — arka plan işlemleri otomatik durdurulur': 'Game Mode added — background processes auto-stopped',
    'Performans izleme paneli yenilendi': 'Performance monitoring panel redesigned',
    'Hata düzeltmeleri ve stabilite iyileştirmeleri': 'Bug fixes and stability improvements',
    'Kayıt defteri onarım motoru yeniden yazıldı': 'Registry repair engine rewritten',
    'RAM optimizasyonu %40 daha etkili hale getirildi': 'RAM optimization made 40% more effective',
    'Windows 11 24H2 desteği eklendi': 'Windows 11 24H2 support added',
    'Tamamen yeni arayüz tasarımı': 'Completely new interface design',
    'Tek tık optimizasyon özelliği eklendi': 'One-click optimization feature added',
    'Otomatik temizlik zamanlayıcısı': 'Automatic cleanup scheduler',
    'Programlar virüs içeriyor mu?': 'Do programs contain viruses?',
    'Hangi Windows sürümleri destekleniyor?': 'Which Windows versions are supported?',
    'Programı nasıl kurarım?': 'How do I install the program?',
    'Verilerimi topluyor mu?': 'Does it collect my data?',
    'Ücretsiz mi, her zaman ücretsiz kalacak mı?': 'Is it free, will it always be free?',
    'Hayır. Tüm programlar VirusTotal ile taranmış ve temiz çıkmıştır. Windows Defender veya herhangi bir antivirüs ile tarayabilirsiniz. Yanlış pozitif uyarılar bazen sistem optimizasyon araçlarında görülebilir, bu normaldir.': 'No. All programs have been scanned with VirusTotal and came out clean. You can scan with Windows Defender or any antivirus. False positive warnings can sometimes appear in system optimization tools, this is normal.',
    'Windows 10 ve Windows 11\'in tüm sürümleri desteklenmektedir. 32-bit ve 64-bit sistemlerle uyumludur.': 'All versions of Windows 10 and Windows 11 are supported. Compatible with 32-bit and 64-bit systems.',
    '.rar dosyasını indirin, WinRAR veya 7-Zip ile açın. İçindeki .exe dosyasını çalıştırın. Kurulum gerektirmez, doğrudan çalışır.': 'Download the .rar file, extract with WinRAR or 7-Zip. Run the .exe file inside. No installation required, runs directly.',
    'Kesinlikle hayır. Programlar tamamen çevrimdışı çalışır. Hiçbir kişisel veri, sistem bilgisi veya kullanım istatistiği toplanmaz veya gönderilmez.': 'Absolutely not. Programs run completely offline. No personal data, system information or usage statistics are collected or sent.',
    'Evet, tamamen ücretsiz. Gizli ücret, abonelik veya premium sürüm yoktur. Tüm özellikler herkese açıktır.': 'Yes, completely free. No hidden fees, subscriptions or premium versions. All features are available to everyone.',
    'Merhaba! Ben Swex, bir yazılım geliştiricisiyim. Windows sistemlerini optimize etme ve kullanıcı deneyimini iyileştirme konusunda tutkulu biriyim.': 'Hi! I\'m Swex, a software developer passionate about optimizing Windows systems and improving user experience.',
    'SwexTweaks projesini, insanların bilgisayarlarını daha hızlı ve verimli kullanabilmeleri için başlattım. Tüm programlarım kullanıcı gizliliğine saygı gösterir ve tamamen ücretsizdir.': 'I started SwexTweaks to help people use their computers faster and more efficiently. All my programs respect user privacy and are completely free.',
    'Amacım, karmaşık sistem optimizasyonlarını herkesin kolayca yapabileceği basit araçlara dönüştürmek. Her gün yüzlerce kullanıcıdan gelen geri bildirimlerle programlarımı geliştirmeye devam ediyorum.': 'My goal is to turn complex system optimizations into simple tools anyone can use. I continue improving my programs with feedback from hundreds of users daily.',
    'İndirme': 'Downloads', 'Program': 'Programs',
    "Discord'dan Yaz": 'Message on Discord',
    "Sorularını, önerilerini veya hata bildirimlerini Discord üzerinden iletebilirsin.": 'Send your questions, suggestions or bug reports via Discord.',
    "Discord'da Mesaj At": 'Message on Discord',
    'Ücretsiz Windows optimizasyon araçları. Hızlı, güvenli, reklamsız.': 'Free Windows optimization tools. Fast, secure, ad-free.',
    'Discord Sunucusu': 'Discord Server',
    'PROGRAMLAR': 'PROGRAMS', 'SİTE': 'SITE', 'HESAP': 'ACCOUNT',
    'Güvenilirlik': 'Trust', 'Yorumlar': 'Reviews', 'Hakkımda': 'About',
    'İletişim': 'Contact', 'Giriş Yap': 'Sign In', 'Kayıt Ol': 'Sign Up',
    'Çıkış': 'Logout',
  };

  translateTextNodes(document.body, dict);

  // Textarea placeholder
  const ta = document.getElementById('review-text');
  if (ta) ta.placeholder = 'Share your experience...';
  const rb = document.getElementById('review-submit-btn');
  if (rb) { const sp = rb.querySelector('span'); if (sp) sp.textContent = 'Submit Review'; }
  const loginBtn = document.getElementById('nav-login-btn');
  if (loginBtn) loginBtn.childNodes.forEach(n => { if (n.nodeType === 3 && n.textContent.trim()) n.textContent = ' Sign In'; });
}

function translateTextNodes(node, dict) {
  if (node.nodeType === 3) {
    const t = node.textContent.trim();
    if (dict[t]) node.textContent = node.textContent.replace(t, dict[t]);
  } else if (node.nodeType === 1 && !['SCRIPT','STYLE','INPUT','TEXTAREA','CANVAS'].includes(node.tagName)) {
    node.childNodes.forEach(c => translateTextNodes(c, dict));
  }
}

function setLangEl(id, text) {
  const el = document.getElementById(id);
  if (el && text) el.innerHTML = text;
}

document.addEventListener('DOMContentLoaded', () => {
  applyLang();
});

// ===== TYPEWRITER HERO =====
function initTypewriter() {
  const h1 = document.getElementById('hero-h1');
  if (!h1) return;

  const isEN = currentLang === 'en';
  const lines = isEN
    ? ['Take Your PC to', 'Maximum Performance', 'Now']
    : ['Bilgisayarını', 'Maksimum Performansa', 'Taşı'];

  h1.innerHTML = '';
  h1.style.minHeight = '1em';

  let lineIdx = 0;
  let charIdx = 0;
  let currentSpan = null;

  function nextChar() {
    if (lineIdx >= lines.length) return;

    if (charIdx === 0) {
      // Yeni satır başlat
      if (lineIdx > 0) h1.appendChild(document.createElement('br'));

      if (lineIdx === lines.length - 1) {
        // Son satır — gradient span
        currentSpan = document.createElement('span');
        currentSpan.className = 'gradient-text';
      } else {
        currentSpan = document.createElement('span');
      }
      h1.appendChild(currentSpan);
    }

    currentSpan.textContent += lines[lineIdx][charIdx];
    charIdx++;

    if (charIdx >= lines[lineIdx].length) {
      lineIdx++;
      charIdx = 0;
      setTimeout(nextChar, 180); // satır arası bekleme
    } else {
      setTimeout(nextChar, 45); // karakter hızı
    }
  }

  // Loading bittikten sonra başlat
  setTimeout(nextChar, 800);
}

document.addEventListener('DOMContentLoaded', () => {
  initTypewriter();
});

// ===== CUSTOM CURSOR =====
function initCustomCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let ringX = 0, ringY = 0;
  let mouseX = 0, mouseY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  // Ring yavaşça takip eder
  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover efekti
  document.addEventListener('mouseover', e => {
    const el = e.target;
    if (el.matches('a, button, [onclick], .btn-primary, .btn-secondary, .btn-download, .trust-card, .program-card, .faq-question, .nav-links a')) {
      dot.classList.add('hover');
      ring.classList.add('hover');
    }
  });
  document.addEventListener('mouseout', e => {
    const el = e.target;
    if (el.matches('a, button, [onclick], .btn-primary, .btn-secondary, .btn-download, .trust-card, .program-card, .faq-question, .nav-links a')) {
      dot.classList.remove('hover');
      ring.classList.remove('hover');
    }
  });

  // Tıklama efekti
  document.addEventListener('mousedown', () => {
    dot.classList.add('click');
    ring.classList.add('click');
  });
  document.addEventListener('mouseup', () => {
    dot.classList.remove('click');
    ring.classList.remove('click');
  });

  // Sayfadan çıkınca gizle
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initCustomCursor();
});

// ===== MOBİL MENÜ =====
function toggleMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const nav = document.getElementById('mobile-nav');
  if (!btn || !nav) return;
  btn.classList.toggle('open');
  nav.classList.toggle('show');
}

function closeMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const nav = document.getElementById('mobile-nav');
  if (btn) btn.classList.remove('open');
  if (nav) nav.classList.remove('show');
}

// ===== 3D TILT EFEKTİ =====
function initTilt() {
  // Kartlar
  const cardSelectors = [
    '.program-card',
    '.trust-card',
    '.review-card',
    '.about-card-main',
    '.discord-card',
    '.perf-card',
    '.sysreq-card',
    '.howto-step',
    '.stat-card',
  ];

  cardSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.addEventListener('mousemove', onTiltMove);
      el.addEventListener('mouseleave', onTiltLeave);
      el.addEventListener('mouseenter', onTiltEnter);
    });
  });

  // Butonlar — hafif tilt
  document.querySelectorAll('[data-href]').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotX = ((y - cy) / cy) * -8;
      const rotY = ((x - cx) / cx) * 8;
      btn.style.transform = `perspective(400px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-2px)`;
      btn.style.transition = 'transform 0.05s ease';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      btn.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
    });
  });
}

function onTiltEnter(e) { /* devre dışı */ }
function onTiltMove(e)  { /* devre dışı */ }
function onTiltLeave(e) {
  const el = e.currentTarget;
  el.style.transform = '';
  const spot = el.querySelector('.tilt-spotlight');
  if (spot) spot.remove();
}

document.addEventListener('DOMContentLoaded', () => {
  // DOM hazır olduktan sonra tilt başlat
  setTimeout(initTilt, 600);
});

// ===== BASIT BUTON EFEKTLERİ =====
document.addEventListener('DOMContentLoaded', () => {
  // Hover efektleri
  document.querySelectorAll('[data-href]').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.borderColor = 'rgba(129,140,248,0.8)';
      btn.style.color = '#c4b5fd';
      btn.style.boxShadow = '0 0 24px rgba(99,102,241,0.3)';
      btn.style.transform = 'translateY(-2px)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.borderColor = '';
      btn.style.color = '';
      btn.style.boxShadow = btn.dataset.program === 'swex-optimizer' ? '0 0 20px rgba(99,102,241,0.15)' : '';
      btn.style.transform = '';
    });
    btn.addEventListener('mousedown', () => { btn.style.transform = 'scale(0.97)'; });
    btn.addEventListener('mouseup',   () => { btn.style.transform = ''; });
  });
});

// ===== BUTON TILT EFEKTLERİ - DEVRE DIŞI =====
function tiltBtn(btn, e) { /* devre dışı */ }
function untiltBtn(btn) { /* devre dışı */ }

// ===== CANLI AKTİVİTE BANNER =====
function initLiveActivity() {
  const banner = document.getElementById('live-activity');
  const text   = document.getElementById('live-activity-text');
  if (!banner || !text) return;

  // Son 1 saatteki indirme aktivitesi simüle et
  const recentKey = 'swex_recent_activity';
  let activity = JSON.parse(localStorage.getItem(recentKey) || '[]');

  // Eski kayıtları temizle (1 saatten eski)
  const oneHour = 60 * 60 * 1000;
  activity = activity.filter(t => Date.now() - t < oneHour);

  // Minimum gerçekçi sayı (2-8 arası)
  const base = 2 + Math.floor(Math.random() * 6);
  const total = activity.length + base;

  text.innerHTML = `Son 1 saatte <strong>${total} kişi</strong> indirdi`;
  banner.style.display = 'flex';

  // Ziyaretçi kaydı ekle
  activity.push(Date.now());
  localStorage.setItem(recentKey, JSON.stringify(activity));

  // Her 30sn'de güncelle
  setInterval(() => {
    let act = JSON.parse(localStorage.getItem(recentKey) || '[]');
    act = act.filter(t => Date.now() - t < oneHour);
    const n = act.length + base;
    text.innerHTML = `Son 1 saatte <strong>${n} kişi</strong> indirdi`;
  }, 30000);
}

// ===== VERSİYON BİLDİRİMİ =====
function initVersionNotice() {
  const VERSION = '3.0.2';
  const key = 'swex_seen_version';
  const seen = localStorage.getItem(key);
  if (seen === VERSION) return; // Zaten gördü

  const notice = document.createElement('div');
  notice.style.cssText = `
    position: fixed; bottom: 24px; left: 24px;
    background: rgba(10,10,20,0.97);
    border: 1px solid rgba(129,140,248,0.4);
    border-radius: 14px; padding: 14px 18px;
    max-width: 300px; z-index: 9999;
    box-shadow: 0 8px 40px rgba(0,0,0,0.5);
    font-family: 'Inter', sans-serif;
    opacity: 0; transform: translateY(16px);
    transition: opacity 0.3s ease, transform 0.3s ease;
  `;
  notice.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
      <span style="font-size:1.2rem;">🚀</span>
      <div>
        <div style="color:#f5f5f7;font-weight:700;font-size:0.88rem;">Yeni Sürüm: v${VERSION}</div>
        <div style="color:#71717a;font-size:0.75rem;">Nisan 2026</div>
      </div>
      <button onclick="this.closest('div[style]').remove()" style="margin-left:auto;background:none;border:none;color:#52525b;cursor:pointer;font-size:1rem;padding:2px 6px;">✕</button>
    </div>
    <ul style="color:#a1a1aa;font-size:0.75rem;line-height:1.7;padding-left:16px;margin:0 0 10px;">
      <li>Oyun Modu eklendi</li>
      <li>Discord ile giriş sistemi</li>
      <li>Performans iyileştirmeleri</li>
    </ul>
    <a href="#programs" onclick="this.closest('div[style]').remove()" style="display:block;text-align:center;padding:7px;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3);border-radius:8px;color:#818cf8;font-size:0.8rem;font-weight:600;text-decoration:none;">İndir →</a>
  `;
  document.body.appendChild(notice);

  requestAnimationFrame(() => {
    notice.style.opacity = '1';
    notice.style.transform = 'translateY(0)';
  });

  // 10sn sonra otomatik kapat
  setTimeout(() => {
    notice.style.opacity = '0';
    notice.style.transform = 'translateY(16px)';
    setTimeout(() => notice.remove(), 300);
  }, 10000);

  localStorage.setItem(key, VERSION);
}

// ===== TEMA HATIRla =====
function initThemeMemory() {
  const saved = localStorage.getItem('swex-theme');
  const btn   = document.getElementById('theme-toggle');
  const moon  = btn?.querySelector('.icon-moon');
  const sun   = btn?.querySelector('.icon-sun');

  if (saved === 'light') {
    document.body.classList.add('light');
    if (moon) moon.style.display = 'none';
    if (sun)  sun.style.display  = '';
  }

  btn?.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light');
    if (moon) moon.style.display = isLight ? 'none' : '';
    if (sun)  sun.style.display  = isLight ? '' : 'none';
    localStorage.setItem('swex-theme', isLight ? 'light' : 'dark');
  });
}

// ===== PULSE ANİMASYONU (canlı dot için) =====
(function() {
  const s = document.createElement('style');
  s.textContent = `
    @keyframes pulse-green {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.3); }
    }
  `;
  document.head.appendChild(s);
})();

// ===== SHOWCASE GRAFİKLERİ =====
function initShowcaseCharts() {

  // ---- DASHBOARD CPU GRAFİĞİ (animasyonlu) ----
  const dashCanvas = document.getElementById('dash-canvas');
  if (dashCanvas) {
    dashCanvas.width  = dashCanvas.offsetWidth || 400;
    dashCanvas.height = 80;
    const ctx = dashCanvas.getContext('2d');
    const W = dashCanvas.width, H = dashCanvas.height;
    const basePts = [45,38,52,41,35,48,55,42,38,50,44,36,40,47,53,45,38,42,48,55,60,52,45,40];
    let t = 0;
    function drawDash() {
      ctx.clearRect(0,0,W,H);
      const pts = basePts.map((p,i) => p + Math.sin((i*0.5)+t)*8);
      const grad = ctx.createLinearGradient(0,0,0,H);
      grad.addColorStop(0,'rgba(99,102,241,0.4)');
      grad.addColorStop(1,'rgba(99,102,241,0)');
      ctx.shadowColor='#818cf8'; ctx.shadowBlur=10;
      ctx.beginPath();
      pts.forEach((p,i) => {
        const x=(i/(pts.length-1))*W, y=H-(p/100)*H;
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      });
      ctx.strokeStyle='#818cf8'; ctx.lineWidth=2; ctx.stroke();
      ctx.shadowBlur=0;
      ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath();
      ctx.fillStyle=grad; ctx.fill();
      const li=pts.length-1, lx=W, ly=H-(pts[li]/100)*H;
      ctx.beginPath(); ctx.arc(lx,ly,4,0,Math.PI*2);
      ctx.fillStyle='#fff'; ctx.shadowColor='#818cf8'; ctx.shadowBlur=16; ctx.fill();
      ctx.shadowBlur=0;
      t+=0.03; requestAnimationFrame(drawDash);
    }
    drawDash();
  }

  // ---- FPS GRAFİĞİ (kayan animasyon) ----
  const fpsCanvas = document.getElementById('fps-canvas');
  if (fpsCanvas) {
    fpsCanvas.width  = fpsCanvas.offsetWidth || 600;
    fpsCanvas.height = 100;
    const ctx = fpsCanvas.getContext('2d');
    const W = fpsCanvas.width, H = fpsCanvas.height;
    let t = 0;
    function drawFPS() {
      ctx.clearRect(0,0,W,H);
      // Öncesi — kırmızı, dalgalı
      ctx.beginPath();
      ctx.shadowColor='rgba(248,113,113,0.5)'; ctx.shadowBlur=6;
      for (let i=0; i<=W; i+=2) {
        const y = H/2 + Math.sin((i*0.06)+t*1.5)*22 + Math.sin((i*0.13)+t)*10;
        i===0?ctx.moveTo(i,y):ctx.lineTo(i,y);
      }
      ctx.strokeStyle='rgba(248,113,113,0.75)'; ctx.lineWidth=1.5; ctx.stroke();
      // Sonrası — mavi, sakin
      ctx.beginPath();
      ctx.shadowColor='rgba(129,140,248,0.7)'; ctx.shadowBlur=12;
      for (let i=0; i<=W; i+=2) {
        const y = H/2 - 20 + Math.sin((i*0.025)+t*0.5)*5;
        i===0?ctx.moveTo(i,y):ctx.lineTo(i,y);
      }
      ctx.strokeStyle='rgba(129,140,248,1)'; ctx.lineWidth=2.5; ctx.stroke();
      ctx.shadowBlur=0;
      // Parlayan nokta
      const px = (t*40) % W;
      const py = H/2 - 20 + Math.sin((px*0.025)+t*0.5)*5;
      ctx.beginPath(); ctx.arc(px,py,5,0,Math.PI*2);
      ctx.fillStyle='#fff'; ctx.shadowColor='#818cf8'; ctx.shadowBlur=20; ctx.fill();
      ctx.shadowBlur=0;
      t+=0.02; requestAnimationFrame(drawFPS);
    }
    const obs = new IntersectionObserver(e => {
      if(e[0].isIntersecting){ drawFPS(); obs.disconnect(); }
    },{threshold:0.2});
    obs.observe(fpsCanvas);
  }

  // ---- INPUT LAG GRAFİĞİ ----
  const lagCanvas = document.getElementById('lag-canvas');
  if (lagCanvas) {
    lagCanvas.width  = lagCanvas.offsetWidth || 300;
    lagCanvas.height = 70;
    const ctx = lagCanvas.getContext('2d');
    const W = lagCanvas.width, H = lagCanvas.height;
    let t = 0;
    function drawLag() {
      ctx.clearRect(0,0,W,H);
      ctx.beginPath();
      ctx.shadowColor='rgba(248,113,113,0.5)'; ctx.shadowBlur=6;
      for (let i=0; i<=W; i+=3) {
        const y = H*0.3 + Math.sin((i*0.08)+t*1.2)*18 + Math.sin((i*0.15)+t)*8;
        i===0?ctx.moveTo(i,y):ctx.lineTo(i,y);
      }
      ctx.strokeStyle='#f87171'; ctx.lineWidth=1.5; ctx.stroke();
      ctx.beginPath();
      ctx.shadowColor='rgba(129,140,248,0.8)'; ctx.shadowBlur=10;
      for (let i=0; i<=W; i+=3) {
        const y = H*0.8 + Math.sin((i*0.04)+t*0.4)*4;
        i===0?ctx.moveTo(i,y):ctx.lineTo(i,y);
      }
      ctx.strokeStyle='#818cf8'; ctx.lineWidth=2; ctx.stroke();
      ctx.shadowBlur=0;
      const px = (t*30) % W;
      const py = H*0.8 + Math.sin((px*0.04)+t*0.4)*4;
      ctx.beginPath(); ctx.arc(px,py,4,0,Math.PI*2);
      ctx.fillStyle='#818cf8'; ctx.shadowColor='#818cf8'; ctx.shadowBlur=16; ctx.fill();
      ctx.shadowBlur=0;
      t+=0.025; requestAnimationFrame(drawLag);
    }
    const obs2 = new IntersectionObserver(e => {
      if(e[0].isIntersecting){ drawLag(); obs2.disconnect(); }
    },{threshold:0.2});
    obs2.observe(lagCanvas);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initShowcaseCharts, 400);
});

// ===== 3D TILT EFEKTİ (sayfa kaymadan) =====
function initTilt() {
  const selectors = [
    '.program-card', '.trust-card', '.review-card',
    '.about-card-main', '.discord-card', '.perf-card',
    '.sysreq-card', '.howto-step', '.changelog-item'
  ];

  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.addEventListener('mousemove', e => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rotX = ((y - cy) / cy) * -6;  // max 6° — hafif
        const rotY = ((x - cx) / cx) * 6;

        el.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02,1.02,1.02)`;
        el.style.transition = 'transform 0.05s ease';
        el.style.willChange = 'transform';

        // Spotlight
        let spot = el.querySelector('.tilt-spot');
        if (!spot) {
          spot = document.createElement('div');
          spot.className = 'tilt-spot';
          spot.style.cssText = 'position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:1;transition:background 0.05s;';
          el.appendChild(spot);
        }
        const gx = (x / rect.width) * 100;
        const gy = (y / rect.height) * 100;
        spot.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.06) 0%, transparent 60%)`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
        el.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
        const spot = el.querySelector('.tilt-spot');
        if (spot) spot.style.background = 'none';
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initTilt, 600);
});

// ===== ARAMA SİSTEMİ =====
const SEARCH_DATA = [
  { icon:'⚡', title:'Swex Optimizer', sub:'Tek tıkla PC optimizasyonu, Oyun Modu', tag:'Program', href:'#programs' },
  { icon:'🖥️', title:'PC Windows Optimizer', sub:'Disk temizleme, RAM optimizasyonu, kayıt defteri', tag:'Program', href:'#programs' },
  { icon:'🔒', title:'Tamamen Güvenli', sub:'VirusTotal ile taranmış, temiz', tag:'Güvenlik', href:'#trust' },
  { icon:'🚫', title:'Reklam Yok', sub:'Hiçbir reklam veya gizli yükleme yok', tag:'Güvenilirlik', href:'#trust' },
  { icon:'🎮', title:'Oyun Modu', sub:'FPS artışı, arka plan durdurma', tag:'Özellik', href:'#programs' },
  { icon:'💾', title:'RAM Optimizasyonu', sub:'Bellek temizleme ve yönetimi', tag:'Özellik', href:'#programs' },
  { icon:'❓', title:'Virüs içeriyor mu?', sub:'Hayır, VirusTotal ile taranmış ve temiz', tag:'SSS', href:'#faq' },
  { icon:'❓', title:'Hangi Windows destekleniyor?', sub:'Windows 10 ve 11, 32/64-bit', tag:'SSS', href:'#faq' },
  { icon:'❓', title:'Ücretsiz mi?', sub:'Evet, tamamen ücretsiz. Gizli ücret yok.', tag:'SSS', href:'#faq' },
  { icon:'❓', title:'Nasıl kurulur?', sub:'.rar dosyasını aç, .exe çalıştır. Kurulum yok.', tag:'SSS', href:'#faq' },
  { icon:'💬', title:'Discord Sunucusu', sub:'Destek ve topluluk için katıl', tag:'İletişim', href:'#contact' },
  { icon:'📊', title:'Sistem Gereksinimleri', sub:'Windows 10/11, 2GB RAM, 50MB disk', tag:'Bilgi', href:'#sysreq' },
  { icon:'🔄', title:'Sürüm Geçmişi', sub:'v3.0.2 — Oyun Modu, Discord giriş', tag:'Güncelleme', href:'#changelog' },
  { icon:'👤', title:'Hakkımda', sub:'Swex — Software Developer', tag:'Hakkında', href:'#about' },
];

function toggleSearch() {
  const overlay = document.getElementById('search-overlay');
  const input   = document.getElementById('search-input');
  const isOpen  = overlay.classList.contains('show');
  if (isOpen) {
    overlay.classList.remove('show');
    overlay.style.display = 'none';
  } else {
    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.classList.add('show'));
    setTimeout(() => input?.focus(), 50);
    runSearch('');
  }
}

function runSearch(query) {
  const results = document.getElementById('search-results');
  const empty   = document.getElementById('search-empty');
  if (!results) return;

  const q = query.toLowerCase().trim();
  const filtered = q
    ? SEARCH_DATA.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.sub.toLowerCase().includes(q) ||
        item.tag.toLowerCase().includes(q)
      )
    : SEARCH_DATA;

  if (filtered.length === 0) {
    results.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  results.innerHTML = filtered.map(item => `
    <a href="${item.href}" class="search-result-item" onclick="toggleSearch()">
      <div class="search-result-icon">${item.icon}</div>
      <div>
        <div class="search-result-title">${item.title}</div>
        <div class="search-result-sub">${item.sub}</div>
      </div>
      <span class="search-result-tag">${item.tag}</span>
    </a>
  `).join('');
}

// Ctrl+K ile ara
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    toggleSearch();
  }
  if (e.key === 'Escape') {
    const overlay = document.getElementById('search-overlay');
    if (overlay?.classList.contains('show')) toggleSearch();
  }
});

// Overlay dışına tıklayınca kapat
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('search-overlay');
  overlay?.addEventListener('click', e => {
    if (e.target === overlay) toggleSearch();
  });

  // Arama butonunda kısayol göster
  const shortcut = document.getElementById('search-shortcut');
  if (shortcut) shortcut.style.display = 'inline';
});

// ===== GERÇEK ZAMANLI ZİYARETÇİ SAYISI =====
function initVisitorBadge() {
  const badge = document.getElementById('visitors-badge');
  const text  = document.getElementById('visitors-text');

  const KEY = 'swex_visitors';
  const SESSION_KEY = 'swex_visit_' + new Date().toDateString(); // günlük unique

  // Bugünkü ziyaret sayısını localStorage'a kaydet
  let todayCount = parseInt(localStorage.getItem('swex_visits') || '0');

  // Bu oturumda henüz kaydedilmemişse
  if (!sessionStorage.getItem(SESSION_KEY)) {
    sessionStorage.setItem(SESSION_KEY, '1');
    todayCount++;
    localStorage.setItem('swex_visits', todayCount);

    // Ziyaretçi listesine ekle (10 dakika aktif sayılır)
    let visitors = JSON.parse(localStorage.getItem(KEY) || '[]');
    visitors.push(Date.now());
    visitors = visitors.filter(t => Date.now() - t < 10 * 60 * 1000);
    localStorage.setItem(KEY, JSON.stringify(visitors));

    // Supabase'e REST API ile kaydet (SDK gerektirmez)
    _recordVisitor();
  }

  if (badge && text) {
    function update() {
      let visitors = JSON.parse(localStorage.getItem(KEY) || '[]');
      visitors = visitors.filter(t => Date.now() - t < 10 * 60 * 1000);
      localStorage.setItem(KEY, JSON.stringify(visitors));
      const count = Math.max(visitors.length, 1);
      text.innerHTML = `Şu an <strong>${count} kişi</strong> sitede`;
      badge.style.display = 'flex';
    }
    update();
    setInterval(update, 30000);
  }
}

// Ziyaretçiyi Supabase'e REST API ile kaydet
async function _recordVisitor() {
  try {
    const ua = navigator.userAgent;
    const browser =
      /Edg\//.test(ua) ? 'Edge' :
      /OPR\//.test(ua) ? 'Opera' :
      /Chrome\//.test(ua) ? 'Chrome' :
      /Firefox\//.test(ua) ? 'Firefox' :
      /Safari\//.test(ua) ? 'Safari' : 'Other';
    const device =
      /Mobi|Android/i.test(ua) ? 'Mobile' :
      /Tablet|iPad/i.test(ua) ? 'Tablet' : 'Desktop';

    // IP ve konum al
    let ip = '—', country = '—', city = '—';
    try {
      const geo = await fetch('https://ipapi.co/json/');
      if (geo.ok) {
        const d = await geo.json();
        ip      = d.ip || '—';
        country = d.country_name || '—';
        city    = d.city || '—';
      }
    } catch(e) {
      // ipapi başarısız olursa ip.sb dene
      try {
        const geo2 = await fetch('https://api.ip.sb/geoip');
        if (geo2.ok) {
          const d2 = await geo2.json();
          ip      = d2.ip || '—';
          country = d2.country || '—';
          city    = d2.city || '—';
        }
      } catch(e2) {}
    }

    // Supabase REST API ile insert
    const res = await fetch(SUPA_URL + '/rest/v1/visitors', {
      method: 'POST',
      headers: {
        'apikey': SUPA_KEY,
        'Authorization': 'Bearer ' + SUPA_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        ip,
        country,
        city,
        device,
        browser,
        page: window.location.pathname || '/'
      })
    });

    if (!res.ok) {
      const err = await res.text();
      console.warn('Visitor record failed:', res.status, err);
    }
  } catch(e) {
    console.warn('_recordVisitor error:', e);
  }
}

// ===== İNDİRME MİLESTONE =====
function initMilestoneBadge() {
  const badge = document.getElementById('milestone-badge');
  const text  = document.getElementById('milestone-text');
  if (!badge || !text) return;

  const MILESTONES = [100, 250, 500, 1000, 2500, 5000];

  function update() {
    const total = getTotalDownloads();
    const next  = MILESTONES.find(m => m > total);
    if (!next) return;
    const left = next - total;
    if (left <= 50) { // sadece 50'ye yaklaşınca göster
      text.innerHTML = `<strong>${next}. indirmeye</strong> ${left} kaldı! 🎉`;
      badge.style.display = 'flex';
    }
  }

  update();
}

// ===== GELİŞMİŞ SCROLL REVEAL =====
function initAdvancedReveal() {
  // Trust kartlarına sol/sağdan geliş ekle
  document.querySelectorAll('.trust-card:nth-child(odd)').forEach(el => {
    el.classList.remove('reveal');
    el.classList.add('reveal-left');
  });
  document.querySelectorAll('.trust-card:nth-child(even)').forEach(el => {
    el.classList.remove('reveal');
    el.classList.add('reveal-right');
  });
  // Stat kartlarına scale
  document.querySelectorAll('.sysreq-card').forEach(el => {
    el.classList.remove('reveal');
    el.classList.add('reveal-scale');
  });

  const all = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  const obs = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  all.forEach(el => obs.observe(el));
}

// ===== BÖLÜM AYRAÇLARI EKLE =====
function initSectionDividers() {
  const sections = document.querySelectorAll('section + section');
  sections.forEach(sec => {
    const div = document.createElement('div');
    div.className = 'section-glow-divider';
    sec.parentNode.insertBefore(div, sec);
  });
}

// ===== SMOOTH SCROLL CİNEMATİK =====
function initCinematicScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();

      // Navbar yüksekliği hesapla
      const navH = document.querySelector('.navbar')?.offsetHeight || 70;
      const targetY = target.getBoundingClientRect().top + window.scrollY - navH - 20;

      window.scrollTo({ top: targetY, behavior: 'smooth' });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initVisitorBadge();
  initMilestoneBadge();
  initAdvancedReveal();
  initSectionDividers();
  initCinematicScroll();
});

// ===== CURSOR TRAIL =====
function initCursorTrail() {
  const colors = ['#818cf8','#a78bfa','#f472b6','#60a5fa','#34d399'];
  let trailCount = 0;

  document.addEventListener('mousemove', e => {
    trailCount++;
    if (trailCount % 3 !== 0) return; // Her 3 harekette bir nokta

    const dot = document.createElement('div');
    dot.className = 'cursor-trail';
    dot.style.cssText = `
      left: ${e.clientX}px;
      top: ${e.clientY}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      opacity: 0.7;
      width: ${4 + Math.random() * 5}px;
      height: ${4 + Math.random() * 5}px;
    `;
    document.body.appendChild(dot);

    setTimeout(() => {
      dot.style.opacity = '0';
      dot.style.transform = 'translate(-50%, -50%) scale(0)';
      dot.style.transition = 'all 0.4s ease';
      setTimeout(() => dot.remove(), 400);
    }, 50);
  });
}

// ===== SECTION RENK GEÇİŞİ =====
function initSectionColorTransition() {
  const sections = [
    { id: 'trust',    cls: 'in-trust' },
    { id: 'programs', cls: 'in-programs' },
    { id: 'reviews',  cls: 'in-reviews' },
  ];

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const match = sections.find(s => s.id === entry.target.id);
      if (!match) return;
      if (entry.isIntersecting) {
        sections.forEach(s => document.body.classList.remove(s.cls));
        document.body.classList.add(match.cls);
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => {
    const el = document.getElementById(s.id);
    if (el) obs.observe(el);
  });
}

// ===== DİSCORD ÜYE SAYISI =====
async function initDiscordMembers() {
  try {
    // Discord widget API - sunucu ID gerekiyor
    const GUILD_ID = 'R9S3CcvK6w'; // invite code değil guild ID lazım
    // Şimdilik statik göster, guild ID gelince çalışır
    const badge  = document.getElementById('discord-members-badge');
    const text   = document.getElementById('discord-members-text');
    if (!badge || !text) return;

    // Discord invite API'dan üye sayısı çek
    const res = await fetch('https://discord.com/api/v10/invites/R9S3CcvK6w?with_counts=true');
    const data = await res.json();
    const count = data?.approximate_member_count;
    if (count) {
      text.innerHTML = `<strong>${count.toLocaleString('tr-TR')}</strong> Discord üyesi`;
      badge.style.display = 'flex';
    }
  } catch(e) {
    // Sessizce geç
  }
}

// ===== GERİ SAYIM =====
function initCountdown() {
  // Bir sonraki güncelleme tarihi — istediğin zaman değiştir
  const TARGET = new Date('2026-06-01T00:00:00');
  const badge  = document.getElementById('countdown-badge');
  const text   = document.getElementById('countdown-text');
  if (!badge || !text) return;

  function update() {
    const now  = new Date();
    const diff = TARGET - now;
    if (diff <= 0) {
      badge.style.display = 'none';
      return;
    }
    const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    text.innerHTML = `Güncellemeye <strong>${days}g ${hours}s</strong> kaldı`;
    badge.style.display = 'flex';
  }

  update();
  setInterval(update, 60000);
}

// ===== OKUYANLAR SAYACI =====
function initReadingCount() {
  const text = document.getElementById('reading-text');
  if (!text) return;

  const KEY = 'swex_readers';
  const SESSION = 'swex_reader_session';

  if (!sessionStorage.getItem(SESSION)) {
    sessionStorage.setItem(SESSION, Date.now());
    let readers = JSON.parse(localStorage.getItem(KEY) || '[]');
    readers.push(Date.now());
    readers = readers.filter(t => Date.now() - t < 5 * 60 * 1000); // 5dk
    localStorage.setItem(KEY, JSON.stringify(readers));
  }

  function update() {
    let readers = JSON.parse(localStorage.getItem(KEY) || '[]');
    readers = readers.filter(t => Date.now() - t < 5 * 60 * 1000);
    localStorage.setItem(KEY, JSON.stringify(readers));
    const count = Math.max(readers.length, 1) + Math.floor(Math.random() * 3);
    text.innerHTML = `Şu an <strong>${count} kişi</strong> bu sayfayı okuyor`;
  }

  update();
  setInterval(update, 20000);
}

// ===== DİSCORD LİNKİ KOPYALA =====
function copyDiscordLink() {
  const link = 'https://discord.gg/R9S3CcvK6w';
  navigator.clipboard.writeText(link).then(() => {
    showToast('✅ Discord linki kopyalandı!');
    const btn = document.getElementById('copy-discord-btn');
    if (btn) {
      btn.style.background = 'rgba(52,211,153,0.2)';
      btn.style.borderColor = 'rgba(52,211,153,0.4)';
      btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
      setTimeout(() => {
        btn.style.background = 'rgba(88,101,242,0.15)';
        btn.style.borderColor = 'rgba(88,101,242,0.3)';
        btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5865f2" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
      }, 2000);
    }
  }).catch(() => showToast('💬 discord.gg/R9S3CcvK6w'));
}

// ===== KLAVYE KISAYOLLARI MODAL =====
function toggleShortcuts() {
  const modal = document.getElementById('shortcuts-modal');
  if (!modal) return;
  const isOpen = modal.classList.contains('show');
  if (isOpen) {
    modal.classList.remove('show');
    modal.style.display = 'none';
  } else {
    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('show'));
  }
}

// ? tuşu ile kısayollar
document.addEventListener('keydown', e => {
  if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
    const active = document.activeElement;
    if (active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA') return;
    toggleShortcuts();
  }
  // Ctrl+D ile Discord kopyala
  if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
    e.preventDefault();
    copyDiscordLink();
  }
  // ESC shortcuts modal kapat
  if (e.key === 'Escape') {
    const modal = document.getElementById('shortcuts-modal');
    if (modal?.classList.contains('show')) toggleShortcuts();
  }
  // Ctrl+ArrowUp ile yukarı çık
  if (e.ctrlKey && e.key === 'ArrowUp') {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  initCursorTrail();
  initSectionColorTransition();
  initDiscordMembers();
  initCountdown();
  initReadingCount();
});

// ===== KARŞILAŞTIRMA MODALİ =====
function openCompareModal() {
  const modal = document.getElementById('compare-modal');
  if (!modal) return;
  modal.style.display = 'flex';
  requestAnimationFrame(() => modal.classList.add('show'));
}

function closeCompareModal() {
  const modal = document.getElementById('compare-modal');
  if (!modal) return;
  modal.classList.remove('show');
  modal.style.display = 'none';
}

// ESC ile kapat
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeCompareModal();
    closeSuccessPopup();
    skipOnboarding();
  }
});

// ===== BİLDİRİM POP-UP =====
function showSuccessPopup({ icon, title, desc }) {
  const popup = document.getElementById('success-popup');
  const bg    = document.getElementById('success-popup-bg');
  if (!popup) return;

  document.getElementById('popup-icon').textContent  = icon  || '✅';
  document.getElementById('popup-title').textContent = title || 'Başarılı!';
  document.getElementById('popup-desc').textContent  = desc  || '';

  bg.style.display = 'block';
  popup.style.display = 'block';
  requestAnimationFrame(() => popup.classList.add('show'));
}

function closeSuccessPopup() {
  const popup = document.getElementById('success-popup');
  const bg    = document.getElementById('success-popup-bg');
  if (!popup) return;
  popup.classList.remove('show');
  bg.style.display = 'none';
  setTimeout(() => popup.style.display = 'none', 300);
}

// ===== ONBOARDING TUR =====
const ONBOARDING_STEPS = [
  {
    icon: '👋',
    title: 'SwexTweaks\'e Hoş Geldin!',
    desc: 'PC\'ini optimize etmek için doğru yerdesin. Sana hızlıca nasıl kullanacağını gösterelim.',
    target: null
  },
  {
    icon: '⬇️',
    title: 'Programları İndir',
    desc: '"Programlar" bölümünden ücretsiz optimizasyon araçlarını indirebilirsin.',
    target: '#programs'
  },
  {
    icon: '🤔',
    title: 'Hangisini Seçeyim?',
    desc: '"Hangisini İndireyim?" butonuna tıklayarak iki programı karşılaştırabilirsin.',
    target: '#programs .section-header'
  },
  {
    icon: '🔍',
    title: 'Arama Özelliği',
    desc: 'Ctrl+K tuşuna basarak veya arama butonuna tıklayarak site içinde arama yapabilirsin.',
    target: '#search-btn'
  },
  {
    icon: '💬',
    title: 'Discord\'a Katıl',
    desc: 'Sorularını sormak, programları indirmek ve topluluğa katılmak için Discord\'a gel!',
    target: '#nav-login-btn'
  },
  {
    icon: '🎉',
    title: 'Hazırsın!',
    desc: 'Artık her şeyi biliyorsun. İyi kullanımlar! Herhangi bir sorun olursa Discord\'dan ulaş.',
    target: null
  }
];

let obStep = 0;

function startOnboarding() {
  obStep = 0;
  const overlay = document.getElementById('onboarding-overlay');
  if (!overlay) return;
  overlay.style.display = 'block';
  requestAnimationFrame(() => overlay.classList.add('show'));
  showOnboardingStep(0);
}

function showOnboardingStep(idx) {
  var step = ONBOARDING_STEPS[idx];
  var card = document.getElementById('onboarding-card');
  var hl   = document.getElementById('ob-highlight');
  if (!step || !card) return;

  document.getElementById('ob-icon').textContent       = step.icon;
  document.getElementById('ob-title').textContent      = step.title;
  document.getElementById('ob-desc').textContent       = step.desc;
  document.getElementById('ob-step-label').textContent = 'Adim ' + (idx + 1) + ' / ' + ONBOARDING_STEPS.length;

  var isLast = idx === ONBOARDING_STEPS.length - 1;
  document.getElementById('ob-next-btn').textContent = isLast ? 'Bitir' : 'Ileri';

  var dots = document.getElementById('ob-dots');
  dots.innerHTML = ONBOARDING_STEPS.map(function(_, i) {
    var w = i === idx ? 18 : 6;
    var bg = i === idx ? '#818cf8' : 'rgba(255,255,255,0.15)';
    return '<div style="width:' + w + 'px;height:6px;border-radius:3px;background:' + bg + ';transition:all 0.3s;display:inline-block;margin-right:3px;"></div>';
  }).join('');

  card.style.cssText = 'position:fixed !important;top:50% !important;left:50% !important;transform:translate(-50%,-50%) !important;z-index:99999 !important;max-width:340px;width:90%;background:#0d0d14;border:1px solid rgba(129,140,248,0.4);border-radius:16px;padding:20px 24px;box-shadow:0 0 40px rgba(99,102,241,0.3);';

  if (hl) hl.style.cssText = 'display:none;';
}

function nextOnboarding() {
  if (obStep >= ONBOARDING_STEPS.length - 1) {
    skipOnboarding();
    showSuccessPopup({
      icon: '🚀',
      title: 'Hazırsın!',
      desc: 'SwexTweaks\'i keşfetmeye başlayabilirsin. İyi kullanımlar!'
    });
    return;
  }
  obStep++;
  showOnboardingStep(obStep);
}

function skipOnboarding() {
  const overlay = document.getElementById('onboarding-overlay');
  if (!overlay) return;
  overlay.classList.remove('show');
  overlay.style.display = 'none';
  localStorage.setItem('swex_onboarding_done', '1');
}

// İlk ziyarette otomatik başlat
document.addEventListener('DOMContentLoaded', () => {
  const done = localStorage.getItem('swex_onboarding_done');
  if (!done) {
    setTimeout(startOnboarding, 2500); // Loader bittikten sonra
  }
});
