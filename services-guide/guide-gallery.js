/* Native, swipeable photo galleries. The pilot is limited to one package. */
(function () {
  'use strict';
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const chevron = direction => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="' + (direction === 'next' ? 'm15 5-7 7 7 7' : 'm9 5 7 7-7 7') + '"/></svg>';
  function markup(photos, title) {
    const images = photos.map((src, i) => '<div class="gallery-slide"><img src="/' + esc(src.replace(/^\//,'')) + '" alt="من أجواء أكواخ المنتجع — صورة ' + (i + 1) + '" width="1200" height="900" loading="lazy" decoding="async" draggable="false"></div>').join('');
    return '<figure class="package-photo package-gallery" aria-label="صور توضيحية من أجواء الأكواخ — ' + esc(title) + '"><div class="gallery-track" tabindex="0" role="region" aria-label="اسحب لتصفح صور ' + esc(title) + '">' + images + '</div><div class="gallery-controls"><button type="button" class="gallery-arrow gallery-next" aria-label="الصورة التالية">' + chevron('next') + '</button><span class="gallery-count" role="status" aria-live="polite" aria-atomic="true" dir="ltr">1 / ' + photos.length + '</span><button type="button" class="gallery-arrow gallery-previous" aria-label="الصورة السابقة">' + chevron('previous') + '</button></div></figure>';
  }
  function bind(root) {
    const track = root.querySelector('.gallery-track');
    const images = Array.from(track.children);
    const prev = root.querySelector('.gallery-previous');
    const next = root.querySelector('.gallery-next');
    const count = root.querySelector('.gallery-count');
    let index = 0, frame = 0, resizeFrame = 0;
    function update() {
      frame = 0;
      const box = track.getBoundingClientRect(), center = box.left + box.width / 2;
      let nearest = Infinity;
      images.forEach((image,i) => {const r=image.getBoundingClientRect(), distance=Math.abs(r.left+r.width/2-center);if(distance<nearest){nearest=distance;index=i;}});
      count.textContent = (index + 1) + ' / ' + images.length;
      prev.disabled = index === 0; next.disabled = index === images.length - 1;
    }
    function go(to, instant) {
      if(to<0 || to>=images.length) return;
      index = to;
      const a=track.getBoundingClientRect(), b=images[to].getBoundingClientRect();
      track.scrollTo({left:track.scrollLeft+b.left+b.width/2-a.left-a.width/2,behavior:instant || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
      if(instant) update();
    }
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
  function mount() {
    document.querySelectorAll('.package-gallery').forEach(bind);
  }
  window.FD_GUIDE_GALLERY={markup,mount};
})();
