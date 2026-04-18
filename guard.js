(function () {
  'use strict';

  // ===== CONSOLE MESAJI =====
  setTimeout(() => {
    console.log(
      '\n%c ⚡ SwexTweaks \n',
      'background:linear-gradient(90deg,#6366f1,#a855f7,#f472b6);color:#fff;font-size:16px;font-weight:900;padding:10px 24px;border-radius:8px'
    );
    console.log('%c Bu site SwexTweaks tarafından korunmaktadır.', 'color:#a78bfa;font-size:13px;font-weight:600');
    console.log('%c Yetkisiz erişim girişimleri kayıt altına alınmaktadır.', 'color:#f87171;font-size:11px;font-weight:600');
  }, 500);

  // ===== ÖZEL CURSOR =====
  function initCursor() {
    if (document.getElementById('_sx_cur')) return;
    const ring = document.createElement('div');
    ring.id = '_sx_cur';
    ring.style.cssText = 'position:fixed;width:22px;height:22px;border:2px solid #818cf8;border-radius:50%;pointer-events:none;z-index:2147483647;transform:translate(-50%,-50%);transition:transform 0.15s,border-color 0.2s;mix-blend-mode:difference;top:-100px;left:-100px';
    const dot = document.createElement('div');
    dot.id = '_sx_dot';
    dot.style.cssText = 'position:fixed;width:5px;height:5px;background:#f472b6;border-radius:50%;pointer-events:none;z-index:2147483647;transform:translate(-50%,-50%);top:-100px;left:-100px';
    document.body.appendChild(ring);
    document.body.appendChild(dot);
    document.body.style.cursor = 'none';
    const s = document.createElement('style');
    s.textContent = '*,*::before,*::after{cursor:none!important}';
    document.head.appendChild(s);
    let mx=-100,my=-100,rx=-100,ry=-100;
    document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; dot.style.left=mx+'px'; dot.style.top=my+'px'; });
    document.addEventListener('mousedown', () => { ring.style.transform='translate(-50%,-50%) scale(0.6)'; ring.style.borderColor='#f472b6'; });
    document.addEventListener('mouseup',   () => { ring.style.transform='translate(-50%,-50%) scale(1)';   ring.style.borderColor='#818cf8'; });
    (function animRing(){ rx+=(mx-rx)*0.12; ry+=(my-ry)*0.12; ring.style.left=rx+'px'; ring.style.top=ry+'px'; requestAnimationFrame(animRing); })();
    document.addEventListener('mouseover', e => { if(e.target.matches('a,button,input,textarea,[onclick]')){ ring.style.transform='translate(-50%,-50%) scale(1.5)'; ring.style.borderColor='#f472b6'; }});
    document.addEventListener('mouseout',  e => { if(e.target.matches('a,button,input,textarea,[onclick]')){ ring.style.transform='translate(-50%,-50%) scale(1)';   ring.style.borderColor='#818cf8'; }});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initCursor);
  else initCursor();

  // ===== KLAVYE KORUMALARI =====
  document.addEventListener('keydown', e => {
    if (e.key === 'F12') { e.preventDefault(); e.stopPropagation(); return false; }
    if (e.ctrlKey && e.shiftKey && /^[ijckIJCK]$/.test(e.key)) { e.preventDefault(); e.stopPropagation(); return false; }
    if (e.ctrlKey && /^[uU]$/.test(e.key)) { e.preventDefault(); e.stopPropagation(); return false; }
    if (e.ctrlKey && /^[sS]$/.test(e.key)) { e.preventDefault(); return false; }
    if (e.ctrlKey && /^[aA]$/.test(e.key) && !e.target.matches('input,textarea')) { e.preventDefault(); return false; }
  }, true);

  // ===== SAĞ TIK ENGEL =====
  document.addEventListener('contextmenu', e => {
    if (!e.target.closest('input,textarea')) { e.preventDefault(); return false; }
  }, true);

  // ===== SEÇİM ENGEL =====
  document.addEventListener('selectstart', e => {
    if (!e.target.matches('input,textarea')) { e.preventDefault(); }
  });

  // ===== IFRAME KORUMA =====
  if (window.self !== window.top) {
    try { window.top.location = window.self.location; } catch(e) { document.body.innerHTML = ''; }
  }

  // ===== PRINT ENGEL =====
  window.addEventListener('beforeprint', e => { e.preventDefault(); });

  // ===== DRAG ENGEL =====
  document.addEventListener('dragstart', e => {
    if (!e.target.matches('input,textarea')) e.preventDefault();
  });

  // ===== WATCHDOG =====
  (function() {
    'use strict';

    // --- DevTools boyut tespiti ---
    let _devOpen = false;
    let _devCount = 0;
    function _checkDevTools() {
      const wDiff = window.outerWidth  - window.innerWidth  > 160;
      const hDiff = window.outerHeight - window.innerHeight > 160;
      if (wDiff || hDiff) {
        if (!_devOpen) {
          _devOpen = true;
          _devCount++;
          // 3 kez tespit edilirse sayfayı yenile
          if (_devCount >= 3) { _devCount = 0; location.reload(); }
        }
      } else {
        _devOpen = false;
      }
    }
    setInterval(_checkDevTools, 1000);

    // --- Debugger trap ---
    setInterval(function _trap() {
      const t = performance.now();
      // eslint-disable-next-line no-debugger
      debugger;
      if (performance.now() - t > 150) { console.clear(); }
    }, 4000);

    // --- Watchdog toast uyarısı ---
    function _wdToast(msg, color) {
      const _show = function() {
        const old = document.getElementById('_wd_toast');
        if (old) old.remove();

        const t = document.createElement('div');
        t.id = '_wd_toast';
        t.setAttribute('style',
          'position:fixed!important;' +
          'top:90px!important;' +
          'left:50%!important;' +
          'transform:translateX(-50%)!important;' +
          'background:rgba(10,10,20,0.97)!important;' +
          'border:2px solid ' + (color || '#f472b6') + '!important;' +
          'color:' + (color || '#f472b6') + '!important;' +
          'padding:14px 28px!important;' +
          'border-radius:12px!important;' +
          'font-family:Inter,monospace!important;' +
          'font-size:0.9rem!important;' +
          'font-weight:700!important;' +
          'z-index:2147483647!important;' +
          'pointer-events:none!important;' +
          'box-shadow:0 8px 40px rgba(0,0,0,0.8)!important;' +
          'letter-spacing:0.3px!important;'
        );
        t.textContent = msg;
        document.body.appendChild(t);

        // 3.5 sn sonra kaldır
        setTimeout(function() {
          if (t.parentNode) t.parentNode.removeChild(t);
        }, 3500);
      };

      // body hazır mı?
      if (document.body) {
        _show();
      } else {
        document.addEventListener('DOMContentLoaded', _show, { once: true });
      }
    }

    // --- Hız sınırı: çok hızlı tıklama tespiti ---
    let _clickCount = 0;
    let _clickReset = null;
    let _clickWarned = false;
    document.addEventListener('click', () => {
      _clickCount++;
      clearTimeout(_clickReset);
      _clickReset = setTimeout(() => { _clickCount = 0; _clickWarned = false; }, 2000);
      if (_clickCount > 8 && !_clickWarned) {
        _clickWarned = true;
        _wdToast('⚠️ Anormal tıklama hızı tespit edildi!', 'rgba(251,191,36,0.8)');
      }
    }, true);

    // --- Hız sınırı: çok hızlı klavye ---
    let _keyCount = 0;
    let _keyReset = null;
    let _keyWarned = false;
    document.addEventListener('keydown', () => {
      _keyCount++;
      clearTimeout(_keyReset);
      _keyReset = setTimeout(() => { _keyCount = 0; _keyWarned = false; }, 1000);
      if (_keyCount > 15 && !_keyWarned) {
        _keyWarned = true;
        _wdToast('⚠️ Anormal klavye hızı tespit edildi!', 'rgba(251,191,36,0.8)');
      }
    }, true);

    // --- Visibility watchdog: sekme gizlenince log ---
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        sessionStorage.setItem('_sx_hidden', Date.now());
      } else {
        const t = sessionStorage.getItem('_sx_hidden');
        if (t && Date.now() - parseInt(t) > 30 * 60 * 1000) {
          // 30 dakikadan fazla gizli kaldıysa sayfayı yenile
          sessionStorage.removeItem('_sx_hidden');
          location.reload();
        }
      }
    });

    // --- XSS / injection tespiti: URL'de şüpheli karakter ---
    (function _checkURL() {
      const suspicious = /<script|javascript:|data:|vbscript:|on\w+=/i;
      if (suspicious.test(decodeURIComponent(location.href))) {
        document.body.innerHTML = '';
        location.replace('/');
      }
    })();

    // --- Heartbeat: sayfa canlı mı? ---
    let _lastActivity = Date.now();
    ['mousemove','keydown','click','scroll','touchstart'].forEach(ev => {
      document.addEventListener(ev, () => { _lastActivity = Date.now(); }, { passive: true });
    });
    setInterval(() => {
      // 60 dakika hareketsizlik → sayfayı yenile
      if (Date.now() - _lastActivity > 60 * 60 * 1000) {
        _lastActivity = Date.now();
        location.reload();
      }
    }, 60000);

  })();

})();
