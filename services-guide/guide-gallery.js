/* Shared inline photo galleries for all guide services. */
(function () {
  'use strict';
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const chevron = direction => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="' + (direction === 'next' ? 'm15 5-7 7 7 7' : 'm9 5 7 7-7 7') + '"/></svg>';
  function markup(photos, title, imageAlt) {
    const images = photos.map((src, i) => '<div class="gallery-slide"><img src="/' + esc(src.replace(/^\//,'')) + '" alt="' + esc(imageAlt || 'من أجواء أكواخ المنتجع') + ' — صورة ' + (i + 1) + '" width="1200" height="900" loading="lazy" decoding="async" draggable="false"></div>').join('');
    return '<figure class="package-photo package-gallery" aria-label="' + esc(imageAlt || 'صور توضيحية من أجواء الأكواخ — ' + title) + '"><div class="gallery-track" tabindex="0" role="region" aria-label="' + (photos.length > 1 ? 'اسحب لتصفح صور ' : 'صورة ') + esc(title) + '">' + images + '</div>' + (photos.length > 1 ? '<div class="gallery-controls"><button type="button" class="gallery-arrow gallery-next" aria-label="الصورة التالية">' + chevron('next') + '</button><span class="gallery-count" role="status" aria-live="polite" aria-atomic="true" dir="ltr">1 / ' + photos.length + '</span><button type="button" class="gallery-arrow gallery-previous" aria-label="الصورة السابقة">' + chevron('previous') + '</button></div>' : '') + '</figure>';
  }
  const resets = new WeakMap();
  function reset(scope = document) {
    if(!scope) return;
    scope.querySelectorAll('.package-gallery').forEach(gallery => {
      const restart = resets.get(gallery);
      if(restart) restart();
    });
  }
  // A full page departure also starts a fresh visit, including browser Back.
  window.addEventListener('pagehide',() => reset());
  function bind(root) {
    const track = root.querySelector('.gallery-track');
    const images = Array.from(track.children);
    if(images.length < 2){track.removeAttribute('tabindex');return;}
    const prev = root.querySelector('.gallery-previous');
    const next = root.querySelector('.gallery-next');
    const count = root.querySelector('.gallery-count');
    let index = 0, frame = 0, resizeFrame = 0;
    function update() {
      frame = 0;
      const box = track.getBoundingClientRect();
      if(!box.width) return;
      const center = box.left + box.width / 2;
      let nearest = Infinity;
      images.forEach((image,i) => {const r=image.getBoundingClientRect(), distance=Math.abs(r.left+r.width/2-center);if(distance<nearest){nearest=distance;index=i;}});
      count.textContent = (index + 1) + ' / ' + images.length;
      prev.disabled = index === 0; next.disabled = index === images.length - 1;
    }
    function go(to, instant) {
      if(to<0 || to>=images.length || !track.clientWidth) return;
      index = to;
      const a=track.getBoundingClientRect(), b=images[to].getBoundingClientRect();
      track.scrollTo({left:track.scrollLeft+b.left+b.width/2-a.left-a.width/2,behavior:instant || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
      if(instant) update();
    }
    function reset() {
      cancelAnimationFrame(frame);frame=0;
      cancelAnimationFrame(resizeFrame);resizeFrame=0;
      index=0;
      track.scrollTo({left:0,behavior:'instant'});
      count.textContent='1 / '+images.length;
      prev.disabled=true;next.disabled=false;
    }
    resets.set(root,reset);
    const details=root.closest('details');
    // Reapply on opening too: hidden tracks can retain an in-flight smooth scroll.
    if(details) details.addEventListener('toggle',reset);
    track.addEventListener('scroll',() => {if(!frame) frame=requestAnimationFrame(update);},{passive:true});
    track.addEventListener('keydown',event => {
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      go(event.key==='Home' ? 0 : event.key==='End' ? images.length-1 : index+(event.key==='ArrowLeft' ? 1 : -1));
    });
    prev.addEventListener('click',() => go(index-1));next.addEventListener('click',() => go(index+1));
    const resize=new ResizeObserver(() => {cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(() => go(index,true));});resize.observe(track);
    go(index,true);
  }
  const mounted = new WeakSet();
  function mount(scope = document) {
    scope.querySelectorAll('.package-gallery').forEach(root => {
      if(mounted.has(root)) return;
      mounted.add(root);
      bind(root);
    });
  }
  window.FD_GUIDE_GALLERY={markup,mount,reset};
})();
