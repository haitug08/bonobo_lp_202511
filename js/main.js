//===============================================================
// メニュー制御・スムーズスクロール・動画・パララックス
//===============================================================
$(function(){
  // --- 1. 新しいメニュー制御 ---
  
  // 3つの画像を対象にする（PC用、スマホ用、閉じるボタン）
  const $menuTrigger = $('.menu-pc, .menu-sp, .menu-close'); 
  const $menubar = $('#menubar');
  const $headerBox = $('#header-box'); // クラスを付け替える親箱

  // タッチデバイス判定
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);

  // ▼ 画像クリック時の動作
  $menuTrigger.on('click', function() {
    $menubar.fadeToggle();            // メニューのフェードイン・アウト
    $('body').toggleClass('noscroll');// 背景スクロール固定切り替え
    $headerBox.toggleClass('menu-open'); // ★画像の切り替え用クラスをON/OFF
  });

  // ▼ メニュー内のリンクをクリックしたら閉じる
  $menubar.find('a').on('click', function() {
    if ($(this).hasClass('ddmenu')) return;
    $menubar.fadeOut();
    $('body').removeClass('noscroll');
    $headerBox.removeClass('menu-open'); // ★クラスを外して画像を三本線に戻す
  });


  // --- 2. ドロップダウンメニュー制御 (階層がある場合用) ---
  function initDropdown($menu, isTouch) {
    $menu.find('ul li').each(function() {
      if ($(this).find('ul').length) {
        $(this).addClass('ddmenu_parent');
        $(this).children('a').addClass('ddmenu');
      }
    });
    if (isTouch) {
      $menu.find('.ddmenu').on('click', function(e) {
        e.preventDefault(); e.stopPropagation();
        const $dropdownMenu = $(this).siblings('ul');
        if ($dropdownMenu.is(':visible')) {
          $dropdownMenu.hide();
        } else {
          $menu.find('.ddmenu_parent ul').hide();
          $dropdownMenu.show();
        }
      });
    } else {
      $menu.find('.ddmenu_parent').hover(
        function() { $(this).children('ul').show(); },
        function() { $(this).children('ul').hide(); }
      );
    }
  }
  
  // ドロップダウン初期化実行
  initDropdown($menubar, isTouchDevice);
});


// --- スムーススクロール (変更なし) ---
$(function() {
    var topButton = $('.pagetop');
    var scrollShow = 'pagetop-show';
    function smoothScroll(target) {
        var scrollTo = target === '#' ? 0 : $(target).offset().top;
        $('html, body').animate({scrollTop: scrollTo}, 500);
    }
    $('a[href^="#"], .pagetop').click(function(e) {
        e.preventDefault();
        var id = $(this).attr('href') || '#';
        smoothScroll(id);
    });
    $(topButton).hide();
    $(window).scroll(function() {
        if($(this).scrollTop() >= 300) {
            $(topButton).fadeIn().addClass(scrollShow);
        } else {
            $(topButton).fadeOut().removeClass(scrollShow);
        }
    });
    if(window.location.hash) {
        $('html, body').scrollTop(0);
        setTimeout(function() { smoothScroll(window.location.hash); }, 10);
    }
});

// --- 画面の高さを取得 (変更なし) ---
function setDynamicHeight() {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight}px`);
}
setDynamicHeight();
window.addEventListener('resize', setDynamicHeight);

// --- 動画スライドショー (変更なし) ---
(function(){
  var scriptEl = document.currentScript || (function(){
    var ss = document.getElementsByTagName('script');
    return ss[ss.length - 1];
  })();
  var scriptDir = scriptEl.src.replace(/\/[^\/]+$/, '/');
  var imgBase = scriptDir + '../images/';

  $(function(){
    var filesPortrait  = ['1-tate.mp4','1-tate.mp4','1-tate.mp4'],
        filesLandscape = ['1-yoko.mp4','2-yoko.mp4','3-yoko.mp4'],
        slideInterval, currentIndex = 0, currentOrientation;

    function setVideoSources(orientation) {
      var files = orientation === 'portrait' ? filesPortrait : filesLandscape;
      $('#mainimg').find('video').each(function(i){
        this.pause();
        this.src   = imgBase + files[i];
        this.load();
        $(this).removeClass('active');
      });
    }
    function showSlide(idx) {
      $('#mainimg').find('video').each(function(i){
        if (i === idx) {
          this.currentTime = 0; this.play(); $(this).addClass('active');
        } else {
          this.pause(); $(this).removeClass('active');
        }
      });
    }
    function startSlideshow() {
      currentOrientation = window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
      setVideoSources(currentOrientation);
      currentIndex = 0;
      showSlide(currentIndex);
      slideInterval = setInterval(function(){
        currentIndex = (currentIndex + 1) % $('#mainimg').find('video').length;
        showSlide(currentIndex);
      }, 8000);
    }
    function stopSlideshow() { clearInterval(slideInterval); }
    function handleOrientationChange() {
      var newO = window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
      if (newO !== currentOrientation) {
        stopSlideshow(); startSlideshow();
      }
    }
    function debounce(fn, wait){
      var t; return function(){ clearTimeout(t); t = setTimeout(fn, wait); };
    }
    startSlideshow();
    $(window).on('resize', debounce(handleOrientationChange, 200));
  });
})();

// --- 背景画像パララックス制御 (変更なし) ---
$(document).ready(function() {
    var $target = $('.list-grid7 .list');
    updateParallax();
    $(window).on('scroll', updateParallax);

    function updateParallax() {
        var scrollTop = $(window).scrollTop();
        var windowHeight = $(window).height();
        $target.each(function() {
            var $this = $(this);
            var offsetTop = $this.offset().top;
            var height = $this.outerHeight();
            if (offsetTop + height > scrollTop && offsetTop < scrollTop + windowHeight) {
                var percentScrolled = (scrollTop + windowHeight - offsetTop) / (windowHeight + height);
                percentScrolled = Math.min(Math.max(percentScrolled, 0), 1);
                var yPos = (percentScrolled * 100);
                $this.css('background-position', 'center ' + yPos + '%');
            }
        });
    }
});

// --- テキストのフェードイン効果 (変更なし) ---
$(function() {
    $('.fade-in-text').on('inview', function(event, isInView) {
        if (isInView && !$(this).data('animated')) {
            let innerHTML = '';
            const text = $(this).text();
            $(this).text('');
            for (let i = 0; i < text.length; i++) {
                innerHTML += `<span class="char" style="animation-delay: ${i * 0.1}s;">${text[i]}</span>`;
            }
            $(this).html(innerHTML).css('visibility', 'visible');
            $(this).data('animated', true);
        }
    });
});
