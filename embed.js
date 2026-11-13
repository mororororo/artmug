/* 아트머그 글 본문용 로더
   아트머그 본문(HTML)에는 아래 두 줄만 넣으면 됩니다. 이후 수정은 이 파일만 고치면 바로 반영돼요.

   <div id="leuin-embed"></div>
   <script>(function(){var s=document.createElement('script');s.src='https://mororororo.github.io/artmug/embed.js?v='+Date.now();document.body.appendChild(s);})();</script>

   하는 일
   · 본문 iframe(index.html) : 내부 스크롤 없이, 페이지 높이에 맞춰 iframe 높이를 자동 조절
   · 리모컨 iframe(remote.html) : 본문 바깥, 오른쪽 광고 배너와 같은 가로 위치에 화면 고정
   · 아트머그 글 화면 전체(상단 · 하단 포함) 배경색을 페이지 배경색으로
   · 아트머그의 '내용 더 보기'(3000px 에서 잘림) 를 풀어 처음부터 전체 표시 */
(function () {
  'use strict';
  if (window.__leuinEmbed) return;
  window.__leuinEmbed = true;

  var ORIGIN = 'https://mororororo.github.io', BASE = ORIGIN + '/artmug/';
  var CREAM = '#FDF8F1', RW = 180, RH = 440;

  var css = document.createElement('style');
  css.textContent =
    'html,body,#wrapBody,#rightInfo,#detailViews{background-color:' + CREAM + '!important}' +
    '#detailViews .detailinfo.showstep1{max-height:none!important}' +
    '#detailViews .btn_open{display:none!important}' +
    '#leuin-frame{display:block;width:100%;height:9100px;border:0;background:transparent}' +
    '#leuin-remote{position:fixed;top:50%;left:50%;width:' + RW + 'px;height:' + RH + 'px;margin:-' + (RH / 2) + 'px 0 0 570px;border:0;background:transparent;z-index:9999}';
  document.head.appendChild(css);

  /* 페이지 전체 배경 : 상단 · 하단 · 좌우 등 화면 폭의 넓은 흰색(밝은색) 영역을 모두 같은 연노란색으로
     (작은 버튼 · 상자 · 이미지는 그대로) */
  function paintPage() {
    var vw = document.documentElement.clientWidth || window.innerWidth;
    var all = document.body ? document.body.getElementsByTagName('*') : [];
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.tagName === 'IFRAME' || el.tagName === 'IMG' || el.tagName === 'SCRIPT' || el.tagName === 'STYLE') continue;
      if (el.offsetWidth < vw * 0.6 && el.offsetWidth < 900) continue;
      var m = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/.exec(getComputedStyle(el).backgroundColor);
      if (!m || (m[4] !== undefined && +m[4] < 0.5)) continue;
      if (Math.min(+m[1], +m[2], +m[3]) < 235) continue;
      el.style.setProperty('background-color', CREAM, 'important');
    }
  }
  paintPage();
  window.addEventListener('load', paintPage);
  setTimeout(paintPage, 1500);
  setTimeout(paintPage, 4000);

  /* 아트머그 편집기에서 글을 다시 저장하면, 화면에 그려져 있던 iframe 들까지 본문에 같이 저장됨.
     그렇게 남은 예전 iframe 은 이 파일과 연결되지 않아(확대 보기 · 높이 조절 안 됨) 지우고 새로 만듦 */
  var stale = document.querySelectorAll('#leuin-frame, #leuin-remote');
  for (var si = 0; si < stale.length; si++) stale[si].parentNode.removeChild(stale[si]);

  /* 본문 iframe */
  var mount = document.getElementById('leuin-embed');
  var frame = document.createElement('iframe');
  frame.id = 'leuin-frame';
  /* 매번 새 버전을 불러오도록 주소 뒤에 시간 값 (브라우저가 예전 페이지를 최대 10분 보관하는 문제 방지) */
  var VER = '?v=' + Date.now();
  frame.src = BASE + VER;
  frame.title = '르인 커미션 안내';
  frame.setAttribute('scrolling', 'no');
  frame.setAttribute('frameborder', '0');
  /* autoplay : 리깅 영상(YouTube)이 한 번 누르면 바로 재생되도록 iframe 안쪽까지 자동 재생 허용 */
  frame.setAttribute('allow', 'clipboard-write; autoplay; fullscreen; encrypted-media; picture-in-picture');
  frame.setAttribute('allowfullscreen', '');
  if (mount) mount.appendChild(frame);
  else (document.currentScript && document.currentScript.parentNode || document.body).appendChild(frame);

  /* 모바일 : 위 썸네일(#big_img) ~ 소개글 상자 사이 여백을 지금의 1.5배로
     (지금 여백 = 아트머그 쪽 간격 + 본문 안쪽 위 여백 16px → 그 절반만큼 iframe 위에 더함) */
  function padTop() {
    var big = document.getElementById('big_img');
    frame.style.marginTop = '';
    if (!big || !big.offsetHeight || !frame.offsetWidth || frame.offsetWidth > 760) return;
    var g = frame.getBoundingClientRect().top - big.getBoundingClientRect().bottom;
    if (g < 0 || g > 200) return;
    frame.style.marginTop = Math.round((g + 16) / 2) + 'px';
  }
  padTop();
  window.addEventListener('load', padTop);
  window.addEventListener('resize', padTop);
  setTimeout(padTop, 1500);

  /* 리모컨 iframe : 화면 고정 (휴대폰 · 태블릿에서는 표시하지 않음) */
  var touch = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (window.matchMedia && matchMedia('(hover:none) and (pointer:coarse)').matches);
  var remote = null;
  if (!touch) {
    remote = document.createElement('iframe');
    remote.id = 'leuin-remote';
    remote.src = BASE + 'remote.html' + VER;
    remote.title = '페이지 메뉴';
    remote.setAttribute('scrolling', 'no');
    remote.setAttribute('frameborder', '0');
    document.body.appendChild(remote);
  }

  /* 가로 위치 : 오른쪽 광고 배너의 가운데에 맞춤 (배너가 없으면 본문 칸 오른쪽 + 40px 위치의 160px 칸 기준) */
  function placeRemote() {
    if (!remote) return;
    var vw = document.documentElement.clientWidth, x;
    var ban = document.querySelector('.ad_banner6');
    var br = ban && ban.offsetWidth ? ban.getBoundingClientRect() : null;
    if (br && br.width > 40) x = br.left + br.width / 2;
    else {
      var col = document.querySelector('.subContent') || document.getElementById('detailViews');
      x = col ? col.getBoundingClientRect().right + 40 + 80 : vw / 2 + 660;
    }
    var left = Math.round(Math.min(x - RW / 2, vw - RW + 4));
    remote.style.left = left + 'px';
    remote.style.marginLeft = '0';
  }
  placeRemote();
  window.addEventListener('resize', placeRemote);
  window.addEventListener('load', placeRemote);
  setTimeout(placeRemote, 1500);

  /* 확대 보기 : 아트머그 화면 전체를 75% 검정으로 덮고, 그 위에 사진 · 움짤을 띄움 (어디를 눌러도 / Esc 로 닫힘)
     PC 의 움짤은 화면에 꽉 차는 크기의 1/4 (가로 · 세로 각각 절반) */
  /* 여러 장이면 확대 상태 그대로 좌우 화살표 / 아래 동그라미 · 작은 썸네일 / ← → 키 / 스와이프로 넘김
     넘길 때마다 본문(iframe)에 번호를 알려 뒤의 캐러셀도 같이 이동 */
  var zbox = null, zwrap = null, zdots = null, zthumbs = null, zmedia = null, zOverflow = '';
  var zList = [], zIdx = 0, zSmall = false, zSwiped = false, zSw = null;
  var ZARW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M__"/></svg>';
  function zOpen() { return zbox && zbox.style.display !== 'none'; }
  function zoomClose() {
    if (!zOpen()) return;
    zbox.style.display = 'none';
    zClearMedia();
    zthumbs.innerHTML = '';
    document.documentElement.style.overflow = zOverflow;
  }
  function zClearMedia() {
    if (zmedia) { if (zmedia.pause) zmedia.pause(); zmedia.removeAttribute('src'); if (zmedia.load) zmedia.load(); zmedia.parentNode.removeChild(zmedia); zmedia = null; }
  }
  function zBuild() {
    var st = document.createElement('style');
    st.textContent =
      '.lzm{position:fixed;top:0;left:0;right:0;bottom:0;z-index:2147483000;display:none;flex-direction:column;align-items:center;box-sizing:border-box;padding:64px 16px;background:rgba(0,0,0,.75);cursor:zoom-out}' +
      '.lzm.multi{padding-bottom:14px}' +
      '.lzm *{box-sizing:border-box}' +
      '.lzm-x{position:absolute;top:12px;right:12px;width:44px;height:44px;padding:0;border:0;background:none;color:#fff;font-size:30px;line-height:1;cursor:pointer;opacity:.85;outline:none;box-shadow:none;-webkit-tap-highlight-color:transparent}' +
      '.lzm-w{position:relative;flex:1;min-height:0;width:100%;display:flex;align-items:center;justify-content:center}' +
      '.lzm.multi .lzm-w{padding:0 74px}' +
      '.lzm-w img,.lzm-w video{display:block;min-width:0;min-height:0;max-width:100%;max-height:100%;object-fit:contain;border-radius:8px}' +
      '.lzm-a{position:absolute;top:50%;z-index:2;display:none;place-items:center;width:46px;height:46px;margin-top:-23px;padding:0;border:0;border-radius:50%;background:rgba(255,255,255,.14);color:#fff;cursor:pointer;opacity:.85;outline:none;transition:opacity .2s,background .2s;-webkit-tap-highlight-color:transparent}' +
      '@media (hover:hover){.lzm-a:hover{opacity:1;background:rgba(255,255,255,.24)}}' +
      '.lzm-a svg{width:26px;height:26px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}' +
      '.lzm-a.p{left:0}.lzm-a.n{right:0}' +
      '.lzm.multi .lzm-a{display:grid}' +
      '.lzm-nav{display:none;flex:none;flex-direction:column;align-items:center;gap:12px;width:100%;max-width:960px;padding-top:16px;cursor:default}' +
      '.lzm.multi .lzm-nav{display:flex}' +
      '.lzm-d{display:flex;flex-wrap:wrap;justify-content:center;gap:7px}' +
      '.lzm-d button{width:7px;height:7px;padding:0;border:0;border-radius:50%;background:rgba(255,255,255,.35);cursor:pointer;transition:background .2s,transform .2s}' +
      '.lzm-d button[aria-current="true"]{background:#fff;transform:scale(1.25)}' +
      '.lzm-t{display:flex;gap:8px;max-width:100%;padding:2px;overflow-x:auto;scrollbar-width:none}' +
      '.lzm-t::-webkit-scrollbar{display:none}' +
      '.lzm-t>:first-child{margin-left:auto}.lzm-t>:last-child{margin-right:auto}' +
      '.lzm-t button{position:relative;flex:none;width:58px;height:58px;padding:0;border:2px solid transparent;border-radius:9px;background:rgba(255,255,255,.08);overflow:hidden;cursor:pointer;opacity:.5;transition:opacity .2s,border-color .2s}' +
      '.lzm-t button:hover{opacity:.85}' +
      '.lzm-t button[aria-current="true"]{border-color:#fff;opacity:1}' +
      '.lzm-t img,.lzm-t video{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;pointer-events:none;border-radius:0}' +
      '@media (max-width:760px){.lzm.multi .lzm-w{padding:0}.lzm.multi{padding-bottom:39px}.lzm-a,.lzm-a:hover,.lzm-a:active,.lzm-a:focus{width:38px;height:38px;margin-top:-19px;background:rgba(0,0,0,.35);opacity:.85;transition:none}.lzm-a svg{width:22px;height:22px}' +
      '.lzm-d button{width:6px;height:6px}.lzm-t{gap:6px}.lzm-t button{width:48px;height:48px;border-radius:8px}}';
    document.head.appendChild(st);
    zbox = document.createElement('div');
    zbox.className = 'lzm';
    zbox.innerHTML = '<button type="button" class="lzm-x" aria-label="닫기">✕</button>' +
      '<div class="lzm-w"><button type="button" class="lzm-a p" aria-label="이전 이미지">' + ZARW.replace('__', '14.5 6l-6 6 6 6') + '</button>' +
      '<button type="button" class="lzm-a n" aria-label="다음 이미지">' + ZARW.replace('__', '9.5 6l6 6-6 6') + '</button></div>' +
      '<div class="lzm-nav"><div class="lzm-d"></div><div class="lzm-t"></div></div>';
    zwrap = zbox.querySelector('.lzm-w'); zdots = zbox.querySelector('.lzm-d'); zthumbs = zbox.querySelector('.lzm-t');
    zbox.querySelector('.lzm-a.p').addEventListener('click', function (e) { e.stopPropagation(); zStep(-1); });
    zbox.querySelector('.lzm-a.n').addEventListener('click', function (e) { e.stopPropagation(); zStep(1); });
    zbox.querySelector('.lzm-nav').addEventListener('click', function (e) { e.stopPropagation(); });
    zbox.addEventListener('click', function () { if (zSwiped) { zSwiped = false; return; } zoomClose(); });
    document.addEventListener('keydown', function (e) {
      if (!zOpen()) return;
      if (e.key === 'Escape') zoomClose();
      else if (e.key === 'ArrowLeft') { e.preventDefault(); zStep(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); zStep(1); }
    });
    zwrap.addEventListener('pointerdown', function (e) { if (zList.length > 1 && !e.target.closest('.lzm-a')) zSw = { x: e.clientX, y: e.clientY, id: e.pointerId }; });
    zwrap.addEventListener('pointerup', function (e) {
      if (!zSw || e.pointerId !== zSw.id) return;
      var dx = e.clientX - zSw.x, dy = e.clientY - zSw.y; zSw = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { zSwiped = true; setTimeout(function () { zSwiped = false; }, 400); zStep(dx < 0 ? 1 : -1); }
    });
    zwrap.addEventListener('pointercancel', function () { zSw = null; });
    zwrap.addEventListener('dragstart', function (e) { e.preventDefault(); });
    document.documentElement.appendChild(zbox);
  }
  function zStep(d) { if (zList.length > 1) zShow(zIdx + d); }
  /* 화살표 : 화면 끝이 아니라 보이는 이미지 좌우 25px 바깥 (자리가 모자라면 화면 안쪽 끝에 붙음) */
  function zArrows() {
    if (!zOpen() || zList.length < 2 || !zmedia || !zmedia.offsetWidth) return;
    var P = zbox.querySelector('.lzm-a.p'), N = zbox.querySelector('.lzm-a.n');
    var W = zwrap.clientWidth, aw = P.offsetWidth || 46;
    P.style.left = Math.max(0, zmedia.offsetLeft - 25 - aw) + 'px';
    N.style.right = Math.max(0, W - zmedia.offsetLeft - zmedia.offsetWidth - 25 - aw) + 'px';
  }
  window.addEventListener('resize', zArrows);
  function zShow(i, first) {
    var n = zList.length;
    zIdx = ((i % n) + n) % n;
    var it = zList[zIdx];
    zClearMedia();
    var m = document.createElement(it.video ? 'video' : 'img');
    function fit(w, h) {
      fit0(w, h);
      zArrows();
    }
    function fit0(w, h) {
      if (!zSmall || !w || !h) return;
      var cs = getComputedStyle(zwrap);
      var bw = zwrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), bh = zwrap.clientHeight;
      var k = Math.min(1, bw / w, bh / h) / 2;
      m.style.width = Math.round(w * k) + 'px';
      m.style.height = Math.round(h * k) + 'px';
    }
    if (it.video) {
      m.muted = true; m.loop = true; m.autoplay = true; m.setAttribute('playsinline', '');
      m.addEventListener('loadedmetadata', function () { fit(m.videoWidth, m.videoHeight); });
    } else { m.alt = it.alt || ''; m.draggable = false; m.addEventListener('load', function () { fit(m.naturalWidth, m.naturalHeight); }); }
    m.src = it.src;
    zwrap.insertBefore(m, zwrap.firstChild);
    zmedia = m;
    if (it.video) { var p = m.play && m.play(); if (p && p.catch) p.catch(function () {}); }
    else if (m.complete) fit(m.naturalWidth, m.naturalHeight);
    var k;
    for (k = 0; k < zdots.children.length; k++) zdots.children[k].setAttribute('aria-current', k === zIdx ? 'true' : 'false');
    for (k = 0; k < zthumbs.children.length; k++) zthumbs.children[k].setAttribute('aria-current', k === zIdx ? 'true' : 'false');
    var cur = zthumbs.children[zIdx];
    if (cur && zthumbs.scrollWidth > zthumbs.clientWidth) {
      zthumbs.scrollTo({ left: cur.offsetLeft - zthumbs.clientWidth / 2 + cur.clientWidth / 2, behavior: first ? 'auto' : 'smooth' });
    }
    if (!first) { try { frame.contentWindow.postMessage({ leuinZoomAt: zIdx }, ORIGIN); } catch (er) {} }
  }
  function zoom(d) {
    /* 예전 형식 { src, video } 도 받음 */
    var list = d.items && d.items.length ? d.items : [{ src: d.src, video: d.video }];
    list = list.filter(function (x) { return x && /^https:\/\//.test(String(x.src || '')); })
               .map(function (x) { return { src: String(x.src), video: !!x.video, alt: String(x.alt || '') }; });
    if (!list.length) return;
    if (!zbox) zBuild();
    zoomClose();
    zList = list;
    zSmall = !!d.gif && !touch && window.matchMedia && matchMedia('(min-width:761px)').matches;
    var multi = list.length > 1;
    zbox.classList.toggle('multi', multi);
    zdots.innerHTML = ''; zthumbs.innerHTML = '';
    if (multi) list.forEach(function (x, k) {
      var b = document.createElement('button');
      b.type = 'button'; b.setAttribute('aria-label', (k + 1) + '번 이미지');
      b.addEventListener('click', function () { zShow(k); });
      zdots.appendChild(b);
      var t = document.createElement('button');
      t.type = 'button'; t.setAttribute('aria-label', (k + 1) + '번 이미지 보기');
      var tm = document.createElement(x.video ? 'video' : 'img');
      if (x.video) { tm.muted = true; tm.setAttribute('playsinline', ''); tm.preload = 'metadata'; tm.src = x.src + '#t=0.1'; }
      else { tm.alt = ''; tm.loading = 'lazy'; tm.draggable = false; tm.src = x.src; }
      t.appendChild(tm);
      t.addEventListener('click', function () { zShow(k); });
      zthumbs.appendChild(t);
    });
    zOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    zbox.style.display = 'flex';
    zShow(Math.max(0, Math.min(list.length - 1, +d.i || 0)), true);
  }

  /* 본문 높이 자동 조절 · 문의 창 열기 */
  function hello() { try { frame.contentWindow.postMessage({ leuinHost: 1 }, ORIGIN); } catch (er) {} }
  frame.addEventListener('load', hello);
  window.addEventListener('message', function (e) {
    if (e.origin !== ORIGIN || !e.data || e.source !== frame.contentWindow) return;
    if (e.data.leuinHello) { hello(); return; }
    /* '신청 내용 복사 후 문의글 작성' : 아트머그의 '작가에게 문의' 버튼을 눌러 화면 아래 문의 창(로그인 전이면 로그인 창)을 띄움 */
    /* 모바일 : 아트머그 모바일 문의 페이지로 이동 (아트머그 주소만 허용) */
    if (e.data.leuinGo) {
      var u = String(e.data.leuinGo);
      if (/^https:\/\/(www\.)?artmug\.kr\//.test(u)) location.href = u;
      return;
    }
    if (e.data.leuinInquiry) {
      var btns = document.querySelectorAll('p.btn_qna, .btn_qna'), qb = null;
      for (var i = 0; i < btns.length && !qb; i++) if (btns[i].offsetWidth) qb = btns[i];
      qb = qb || btns[0];
      if (qb) qb.click();
      return;
    }
    /* 사진 · 움짤 확대 보기 : 아트머그 화면 전체를 어둡게 하고 그 위에 크게 */
    if (e.data.leuinZoom) { zoom(e.data.leuinZoom); return; }
    var h = +e.data.leuinHeight;
    if (h > 100) frame.style.height = Math.ceil(h) + 'px';
  });
})();
