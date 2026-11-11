/* 아트머그 글 본문용 로더
   아트머그 본문(HTML)에는 아래 두 줄만 넣으면 됩니다. 이후 수정은 이 파일만 고치면 바로 반영돼요.

   <div id="leuin-embed"></div>
   <script>(function(){var s=document.createElement('script');s.src='https://mororororo.github.io/artmug/embed.js?v='+Date.now();document.body.appendChild(s);})();</script>

   하는 일
   · 본문 iframe(index.html) : 내부 스크롤 없이, 페이지 높이에 맞춰 iframe 높이를 자동 조절
   · 리모컨 iframe(remote.html) : 본문 바깥, 오른쪽 광고 배너와 같은 가로 위치에 화면 고정
   · 아트머그 글 화면 전체 배경색을 페이지 배경색으로
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

  /* 본문 iframe */
  var mount = document.getElementById('leuin-embed');
  var frame = document.createElement('iframe');
  frame.id = 'leuin-frame';
  frame.src = BASE;
  frame.title = '르인 커미션 안내';
  frame.setAttribute('scrolling', 'no');
  frame.setAttribute('frameborder', '0');
  frame.setAttribute('allow', 'clipboard-write');
  if (mount) mount.appendChild(frame);
  else (document.currentScript && document.currentScript.parentNode || document.body).appendChild(frame);

  /* 리모컨 iframe : 화면 고정 (휴대폰 · 태블릿에서는 표시하지 않음) */
  var touch = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (window.matchMedia && matchMedia('(hover:none) and (pointer:coarse)').matches);
  var remote = null;
  if (!touch) {
    remote = document.createElement('iframe');
    remote.id = 'leuin-remote';
    remote.src = BASE + 'remote.html';
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

  /* 본문 높이 자동 조절 */
  window.addEventListener('message', function (e) {
    if (e.origin !== ORIGIN || !e.data || e.source !== frame.contentWindow) return;
    var h = +e.data.leuinHeight;
    if (h > 100) frame.style.height = Math.ceil(h) + 'px';
  });
})();
