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

  /* 확대 보기 : 아트머그 화면 전체를 40% 검정으로 덮고, 그 위에 사진 · 움짤을 띄움 (어디를 눌러도 / Esc 로 닫힘)
     PC 의 움짤은 화면에 꽉 차는 크기의 1/4 (가로 · 세로 각각 절반) */
  var zbox = null, zmedia = null, zOverflow = '';
  function zoomClose() {
    if (!zbox || zbox.style.display === 'none') return;
    zbox.style.display = 'none';
    if (zmedia) { if (zmedia.pause) zmedia.pause(); zmedia.removeAttribute('src'); if (zmedia.load) zmedia.load(); zmedia.parentNode.removeChild(zmedia); zmedia = null; }
    document.documentElement.style.overflow = zOverflow;
  }
  function zoom(d) {
    var src = String(d.src || '');
    if (!/^https:\/\//.test(src)) return;
    if (!zbox) {
      zbox = document.createElement('div');
      zbox.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:2147483000;display:none;align-items:center;justify-content:center;box-sizing:border-box;padding:64px 16px 24px;background:rgba(0,0,0,.4);cursor:zoom-out';
      var x = document.createElement('button');
      x.type = 'button'; x.textContent = '✕'; x.setAttribute('aria-label', '닫기');
      x.style.cssText = 'position:absolute;top:12px;right:12px;width:44px;height:44px;padding:0;border:0;background:none;color:#fff;font-size:30px;line-height:1;cursor:pointer;opacity:.85';
      zbox.appendChild(x);
      zbox.addEventListener('click', zoomClose);
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') zoomClose(); });
      document.documentElement.appendChild(zbox);
    }
    zoomClose();
    var m = document.createElement(d.video ? 'video' : 'img');
    m.style.cssText = 'display:block;min-width:0;min-height:0;max-width:100%;max-height:100%;object-fit:contain;border-radius:8px';
    var small = d.gif && !touch && window.matchMedia && matchMedia('(min-width:761px)').matches;
    function fit(w, h) {
      if (!small || !w || !h) return;
      var k = Math.min(1, (zbox.clientWidth - 32) / w, (zbox.clientHeight - 88) / h) / 2;
      m.style.width = Math.round(w * k) + 'px';
      m.style.height = Math.round(h * k) + 'px';
    }
    if (d.video) {
      m.muted = true; m.loop = true; m.autoplay = true; m.setAttribute('playsinline', '');
      m.addEventListener('loadedmetadata', function () { fit(m.videoWidth, m.videoHeight); });
    } else m.addEventListener('load', function () { fit(m.naturalWidth, m.naturalHeight); });
    m.src = src;
    zbox.appendChild(m);
    zmedia = m;
    zOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    zbox.style.display = 'flex';
    if (d.video) { var p = m.play && m.play(); if (p && p.catch) p.catch(function () {}); }
    else if (m.complete) fit(m.naturalWidth, m.naturalHeight);
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
