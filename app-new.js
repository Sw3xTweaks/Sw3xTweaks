// ===== DOWNLOAD COUNTER =====
let downloadCounts = {
  'swex-optimizer': 1247,
  'pc-tweak': 892
};

function updateDownloadCounters() {
  Object.keys(downloadCounts).forEach(program => {
    const el = document.querySelector(`[data-program="${program}"] strong`);
    const strong = el?.querySelector ? el.querySelector('strong') : el;
    if (strong && downloadCounts[program] !== undefined) {
      strong.textContent = formatNumber(downloadCounts[program]);
    }
  });

  // Hero toplam sayaç
  const totalEl = document.getElementById('total-downloads');
  if (totalEl) totalEl.textContent = formatNumber(getTotalDownloads());

  // Hakkımda bölümü sayaç
  const aboutEl = document.getElementById('about-downloads');
  if (aboutEl) aboutEl.textContent = formatNumber(getTotalDownloads());
}

// ===== YARDIMCI =====
function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

function getTotalDownloads() {
  return Object.values(downloadCounts).reduce((a, b) => a + b, 0);
}

// ===== DOWNLOAD HANDLER - DISCORD YÖNLENDİRME =====
function handleDownloadClick(e) {
  e.preventDefault();
  const btn = e.currentTarget;
  const program = btn.dataset.program;
  
  // Discord'a yönlendir
  notify({ 
    title: 'Discord\'a Katıl', 
    msg: 'Programları indirmek için Discord sunucumuza katıl!', 
    type: 'info', 
    icon: '💬' 
  });
  
  setTimeout(() => {
    window.open('https://discord.gg/R9S3CcvK6w', '_blank');
  }, 1500);
}

// ===== NOTIFICATION SYSTEM =====
function notify(options) {
  const { title, msg, type = 'info', icon = 'ℹ️', duration = 4000 } = options;
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-icon">${icon}</div>
    <div class="notification-content">
      <div class="notification-title">${title}</div>
      <div class="notification-message">${msg}</div>
    </div>
    <button class="notification-close" onclick="this.parentElement.remove()">×</button>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, duration);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  updateDownloadCounters();
  
  // İndirme butonlarına event listener ekle
  document.querySelectorAll('.btn-download, .btn-dl-new, .compare-dl-btn').forEach(btn => {
    btn.addEventListener('click', handleDownloadClick);
  });
  
  // Tema toggle
  initThemeToggle();
  
  // Diğer init fonksiyonları
  initLoader();
  initScrollExtras();
  initParticles();
  initCursorGlow();
  initCustomCursor();
  initTypewriter();
  initTilt();
  initShowcaseCharts();
  initAnnounce();
  initVisitorCount();
  applyLang();
});

// ===== THEME TOGGLE =====
function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;
  
  const moonIcon = toggle.querySelector('.icon-moon');
  const sunIcon = toggle.querySelector('.icon-sun');
  
  toggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    
    if (moonIcon && sunIcon) {
      moonIcon.style.display = isLight ? 'none' : 'block';
      sunIcon.style.display = isLight ? 'block' : 'none';
    }
    
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });
  
  // Kaydedilmiş tema
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    if (moonIcon && sunIcon) {
      moonIcon.style.display = 'none';
      sunIcon.style.display = 'block';
    }
  }
}

// ===== LOADER =====
function initLoader() {
  const loader = document.getElementById('loader');
  const fill = document.getElementById('loader-fill');
  const pct = document.getElementById('loader-pct');
  if (!loader) return;

  let p = 0;
  const interval = setInterval(() => {
    p += Math.random() * 15;
    if (p >= 100) {
      p = 100;
      clearInterval(interval);
      if (fill) fill.style.width = '100%';
      if (pct) pct.textContent = '100%';
      setTimeout(() => loader.classList.add('hidden'), 400);
    } else {
      if (fill) fill.style.width = p + '%';
      if (pct) pct.textContent = Math.floor(p) + '%';
    }
  }, 100);
}

// ===== SCROLL EXTRAS =====
function initScrollExtras() {
  const progress = document.getElementById('scroll-progress');
  const toTop = document.getElementById('to-top');
  
  window.addEventListener('scroll', () => {
    const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    if (progress) progress.style.width = scrolled + '%';
    
    if (toTop) {
      toTop.style.opacity = window.scrollY > 500 ? '1' : '0';
    }
  });
}

// ===== PARTICLES =====
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const particles = [];
  const particleCount = 50;
  
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1
    });
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
      
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(129, 140, 248, 0.1)';
      ctx.fill();
    });
    
    requestAnimationFrame(animate);
  }
  
  animate();
  
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// ===== CURSOR GLOW =====
function initCursorGlow() {
  const glow = document.getElementById('cursor-glow');
  if (!glow) return;
  
  document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
}

// ===== CUSTOM CURSOR =====
function initCustomCursor() {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;
  
  document.addEventListener('mousemove', (e) => {
    dot.style.left = e.clientX + 'px';
    dot.style.top = e.clientY + 'px';
    ring.style.left = e.clientX + 'px';
    ring.style.top = e.clientY + 'px';
  });
}

// ===== TYPEWRITER =====
function initTypewriter() {
  const element = document.getElementById('hero-h1');
  if (!element) return;
  
  const text = element.textContent;
  element.textContent = '';
  
  let i = 0;
  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, 50);
    }
  }
  
  setTimeout(type, 1000);
}

// ===== TILT EFFECT =====
function initTilt() {
  document.querySelectorAll('.program-card, .trust-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / centerY * -10;
      const rotateY = (x - centerX) / centerX * 10;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ===== SHOWCASE CHARTS =====
function initShowcaseCharts() {
  // FPS Chart
  const fpsCanvas = document.getElementById('fps-canvas');
  if (fpsCanvas) {
    const ctx = fpsCanvas.getContext('2d');
    const width = fpsCanvas.width;
    const height = fpsCanvas.height;
    
    // Örnek FPS verileri
    const beforeData = [45, 42, 48, 44, 41, 46, 43, 47, 44, 42];
    const afterData = [78, 82, 85, 80, 88, 84, 86, 89, 87, 85];
    
    ctx.clearRect(0, 0, width, height);
    
    // Before line (red)
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    beforeData.forEach((val, i) => {
      const x = (i / (beforeData.length - 1)) * width;
      const y = height - (val / 100) * height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    
    // After line (blue)
    ctx.strokeStyle = '#3b82f6';
    ctx.beginPath();
    afterData.forEach((val, i) => {
      const x = (i / (afterData.length - 1)) * width;
      const y = height - (val / 100) * height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }
}

// ===== ANNOUNCE =====
function initAnnounce() {
  // Duyuru sistemi - şimdilik boş
}

// ===== VISITOR COUNT =====
function initVisitorCount() {
  // Ziyaretçi sayacı - şimdilik boş
}

// ===== LANGUAGE =====
function applyLang() {
  // Dil sistemi - şimdilik boş
}

// ===== MOBILE MENU =====
function toggleMobileMenu() {
  const nav = document.getElementById('mobile-nav');
  if (nav) {
    nav.classList.toggle('active');
  }
}

function closeMobileMenu() {
  const nav = document.getElementById('mobile-nav');
  if (nav) {
    nav.classList.remove('active');
  }
}

// ===== LANGUAGE TOGGLE =====
function toggleLang() {
  // Dil değiştirme - şimdilik boş
}