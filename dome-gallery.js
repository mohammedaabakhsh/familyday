/* Shared photo overview. Navigation, Escape and focus stay in the shared router. */
var FD_DOME_GALLERY = (function () {
  'use strict';

  var panel = null;
  var renderedSources = '';

  function photos(cabinId) {
    return typeof GALLERY !== 'undefined' && Array.isArray(GALLERY[cabinId]) ? GALLERY[cabinId].slice() : [];
  }

  function requestDismiss() {
    document.dispatchEvent(new CustomEvent('fd-dome-gallery-dismiss'));
  }

  function ensurePanel() {
    if (panel) return panel;
    panel = document.createElement('div');
    panel.id = 'fd-dome-gallery';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-labelledby', 'fd-dome-gallery-title');
    panel.setAttribute('aria-describedby', 'fd-dome-gallery-help');
    panel.tabIndex = -1;
    panel.innerHTML = '<div class="fd-dome-gallery-shell">'
      + '<header class="fd-dome-gallery-header">'
      + '<div class="fd-dome-gallery-heading"><h2 id="fd-dome-gallery-title">جميع الصور</h2>'
      + '<p id="fd-dome-gallery-help">اختر صورة لعرضها بالحجم الكامل</p></div>'
      + '<button type="button" class="fd-dome-gallery-close" aria-label="إغلاق جميع الصور والعودة إلى التفاصيل">'
      + '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>'
      + '</header><ol class="fd-dome-gallery-grid" aria-label="جميع الصور"></ol></div>';
    panel.querySelector('.fd-dome-gallery-close').addEventListener('click', requestDismiss);
    panel.addEventListener('click', function (event) {
      if (event.target === panel) requestDismiss();
    });
    document.body.appendChild(panel);
    return panel;
  }

  function renderPhotos(sources, cabin) {
    var key = JSON.stringify([cabin.id, cabin.name, sources]);
    if (renderedSources === key) return;
    var list = panel.querySelector('.fd-dome-gallery-grid');
    list.replaceChildren();
    sources.forEach(function (source, index) {
      var item = document.createElement('li');
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'fd-dome-gallery-photo';
      button.setAttribute('aria-label', 'تكبير الصورة ' + (index + 1) + ' من ' + sources.length + ' — ' + cabin.name);
      button.setAttribute('aria-haspopup', 'dialog');
      button.setAttribute('aria-controls', 'fsOverlay');
      var image = document.createElement('img');
      image.src = source;
      image.alt = '';
      image.width = 1200;
      image.height = 1200;
      var number = document.createElement('span');
      number.className = 'fd-dome-gallery-number';
      number.setAttribute('aria-hidden', 'true');
      number.textContent = String(index + 1);
      button.appendChild(image);
      button.appendChild(number);
      button.addEventListener('click', function () {
        // The shared router adds photos above the grid and handles Back/X.
        openFS(sources.slice(), index, cabin.id);
      });
      item.appendChild(button);
      list.appendChild(item);
    });
    renderedSources = key;
  }

  function mountTrigger(wrapper, cabin) {
    var previous = wrapper.querySelector('.fd-dome-gallery-trigger');
    if (previous) previous.remove();
    if (!cabin || !photos(cabin.id).length) return;
    ensurePanel();
    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'fd-dome-gallery-trigger';
    trigger.setAttribute('aria-label', 'عرض جميع صور ' + cabin.name);
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-controls', 'fd-dome-gallery');
    trigger.innerHTML = '<svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true"><rect x="2" y="2" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="12" y="2" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="2" y="12" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="12" y="12" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/></svg><span>عرض جميع الصور</span>';
    trigger.addEventListener('click', function () {
      document.dispatchEvent(new CustomEvent('fd-dome-gallery-request', {
        detail: { id: cabin.id, name: cabin.name }
      }));
    });
    wrapper.appendChild(trigger);
  }

  function show(cabin) {
    // Keep pre-rollout history entries for the original Dome overview working.
    cabin = cabin || { id: 1, name: 'بيت الدوم' };
    ensurePanel();
    panel.querySelector('#fd-dome-gallery-title').textContent = 'صور ' + cabin.name;
    panel.setAttribute('aria-label', 'صور ' + cabin.name);
    panel.querySelector('.fd-dome-gallery-close').setAttribute('aria-label', 'إغلاق جميع الصور والعودة إلى ' + cabin.name);
    panel.querySelector('.fd-dome-gallery-grid').setAttribute('aria-label', 'جميع صور ' + cabin.name);
    renderPhotos(photos(cabin.id), cabin);
    panel.hidden = false;
    panel.querySelector('.fd-dome-gallery-shell').scrollTop = 0;
  }

  function hide() {
    if (panel) panel.hidden = true;
  }

  // Pilot the approved inline gallery on both Dome units only.
  function mountInline(wrapper, cabin, sources) {
    if (cabin.id !== 1 && cabin.id !== 12) return false;
    wrapper.classList.add('fd-dome-inline');
    wrapper.ontouchstart = wrapper.ontouchend = wrapper.onclick = wrapper.onkeydown = null;
    var track = document.createElement('div');
    track.className = 'fd-dome-track';
    track.setAttribute('role', 'region');
    track.setAttribute('aria-label', 'صور ' + cabin.name + ' — اسحب لتصفح الصور');
    var slides = sources.map(function (src, i) {
      var slide = document.createElement('button');
      slide.type = 'button';slide.className = 'fd-dome-slide';
      slide.setAttribute('aria-label', 'تكبير الصورة ' + (i+1) + ' من ' + sources.length + ' — ' + cabin.name);
      slide.setAttribute('aria-haspopup', 'dialog');slide.setAttribute('aria-controls', 'fsOverlay');
      var img = document.createElement('img');
      img.src = src;img.alt = cabin.name + ' — صورة ' + (i+1);img.draggable = false;
      img.width = 1200;img.height = 1200;img.decoding = 'async';
      slide.appendChild(img);track.appendChild(slide);
      slide.addEventListener('click', function () {openFS(sources.slice(), i, cabin.id);});
      return slide;
    });
    wrapper.appendChild(track);
    var controls = document.createElement('div');controls.className = 'fd-dome-controls';
    controls.innerHTML = '<button type="button" class="fd-dome-next" aria-label="الصورة التالية"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg></button><span class="fd-dome-count" dir="ltr" role="status" aria-live="polite" aria-atomic="true"></span><button type="button" class="fd-dome-previous" aria-label="الصورة السابقة"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button>';
    wrapper.appendChild(controls);
    var next = controls.querySelector('.fd-dome-next'), previous = controls.querySelector('.fd-dome-previous'), count = controls.querySelector('.fd-dome-count');
    var index = 0, frame = 0, resizeFrame = 0;
    function paint() {
      galIdx = index;
      count.textContent = (index+1) + ' / ' + sources.length;
      next.disabled = index === sources.length-1;previous.disabled = index === 0;
      slides.forEach(function (slide,i) {slide.tabIndex = i===index ? 0 : -1;slide.setAttribute('aria-hidden',String(i!==index));});
    }
    function update() {
      frame = 0;
      var box = track.getBoundingClientRect();if(!box.width) return;
      var center = box.left+box.width/2, nearest = Infinity;
      slides.forEach(function (slide,i) {var r=slide.getBoundingClientRect(), distance=Math.abs(r.left+r.width/2-center);if(distance<nearest){nearest=distance;index=i;}});
      paint();
    }
    function go(to, instant) {
      if(to<0 || to>=sources.length) return;
      index=to;
      var a=track.getBoundingClientRect(), b=slides[index].getBoundingClientRect();
      track.scrollTo({left:track.scrollLeft+b.left+b.width/2-a.left-a.width/2,behavior:instant || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
      if(instant) paint();
    }
    track.addEventListener('scroll',function () {if(!frame) frame=requestAnimationFrame(update);},{passive:true});
    track.addEventListener('keydown',function (event) {
      if(['ArrowLeft','ArrowRight','Home','End'].indexOf(event.key)<0) return;
      event.preventDefault();go(event.key==='Home' ? 0 : event.key==='End' ? sources.length-1 : index+(event.key==='ArrowLeft' ? 1 : -1));
    });
    next.addEventListener('click',function () {go(index+1);});previous.addEventListener('click',function () {go(index-1);});
    var resize=new ResizeObserver(function () {cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(function () {go(index,true);});});resize.observe(track);
    wrapper.fdInlineGallery={go:go,destroy:function () {resize.disconnect();cancelAnimationFrame(frame);cancelAnimationFrame(resizeFrame);}};
    paint();return true;
  }

  return { mountInline: mountInline, mountTrigger: mountTrigger, show: show, hide: hide };
})();
