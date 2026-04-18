// SwexTweaks Init — Protected
(function(){var l=document.getElementById('loader'),f=document.getElementById('loader-fill'),p=document.getElementById('loader-pct');if(!l)return;var n=0,iv=setInterval(function(){n+=Math.random()*18+8;if(n>=100){n=100;clearInterval(iv);if(f)f.style.width='100%';if(p)p.textContent='100%';setTimeout(function(){l.style.opacity='0';l.style.transition='opacity 0.4s ease';setTimeout(function(){l.style.display='none';},400);},300);}else{if(f)f.style.width=n+'%';if(p)p.textContent=Math.floor(n)+'%';}},80);})();

(function(){
var _d=function(_a,_k){return _a.map(function(_c){return String.fromCharCode(_c^_k)}).join('')};
var _x=[111,115,115,119,116,61,40,40,102,112,96,105,96,108,106,111,109,109,116,102,98,116,125,102,105,97,108,112,41,116,114,119,102,101,102,116,98,41,100,104];
var _y=[116,101,88,119,114,101,107,110,116,111,102,101,107,98,88,102,102,101,84,64,126,96,113,108,97,70,69,109,127,98,64,113,88,75,68,125,96,88,53,80,68,111,116,118,81,86];
var _k=7;
async function _load(){try{var _u=_d(_x,_k),_s=_d(_y,_k);var r=await fetch(_u+'/rest/v1/settings?key=eq.announcement&select=value',{headers:{'apikey':_s,'Authorization':'Bearer '+_s}});var d=await r.json();var t=d?.[0]?.value||'';var b=document.getElementById('announce-banner'),e=document.getElementById('announce-text');if(t&&t.trim()&&b&&e){e.textContent=t;b.style.display='flex';}}catch(err){var t=localStorage.getItem('swex_announce');if(t&&t.trim()){var b=document.getElementById('announce-banner'),e=document.getElementById('announce-text');if(b&&e){e.textContent=t;b.style.display='flex';}}}}document.addEventListener('DOMContentLoaded',_load);
})();