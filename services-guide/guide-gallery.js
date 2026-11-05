/* Native, swipeable photo galleries. The pilot is limited to one package. */
(function () {
  'use strict';
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const chevron = direction => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="' + (direction === 'next' ? 'm15 5-7 7 7 7' : 'm9 5 7 7-7 7') + '"/></svg>';
  const zoomIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6"/></svg>';
  function slides(photos, title, large) {
    return photos.map((src, i) => {
      const image = '<img src="/' + esc(src.replace(/^\//,'')) + '" alt="من أجواء أكواخ المنتجع — صورة ' + (i + 1) + '" width="1200" height="1200" loading="lazy" decoding="async">';
      return large ? '<div class="gallery-slide">' + image + '</div>' : '<button type="button" class="gallery-slide" aria-haspopup="dialog" aria-label="تكبير صورة ' + (i + 1) + ' من صور ' + esc(title) + '">' + image + '</button>';
    }).join('');
  }
  function controls(total) {
    return '<button type="button" class="gallery-arrow gallery-previous" aria-label="الصورة السابقة">' + chevron('previous') + '</button><button type="button" class="gallery-arrow gallery-next" aria-label="الصورة التالية">' + chevron('next') + '</button><span class="gallery-count" role="status" aria-live="polite" aria-atomic="true">1 من ' + total + '</span>';
  }
  function markup(photos, title) {
    return '<figure class="package-photo package-gallery" data-gallery="' + esc(JSON.stringify(photos)) + '" data-gallery-title="' + esc(title) + '" aria-label="صور ' + esc(title) + '"><div class="gallery-track" tabindex="0" role="region" aria-label="اسحب لتصفح صور ' + esc(title) + '">' + slides(photos,title,false) + '</div>' + controls(photos.length) + '<button type="button" class="gallery-zoom" aria-label="تكبير الصور" aria-haspopup="dialog">' + zoomIcon + '</button><figcaption>من أجواء الأكواخ</figcaption></figure>';
  }
  function bind(root, initial, onZoom) {
    const track = root.querySelector('.gallery-track');
    const images = Array.from(track.children);
    const prev = root.querySelector('.gallery-previous');
    const next = root.querySelector('.gallery-next');
    const count = root.querySelector('.gallery-count');
    let index = initial || 0, frame = 0, resizeFrame = 0;
    function update() {
      frame = 0;
      const box = track.getBoundingClientRect(), center = box.left + box.width / 2;
      let nearest = Infinity;
      images.forEach((image,i) => {const r=image.getBoundingClientRect(), distance=Math.abs(r.left+r.width/2-center);if(distance<nearest){nearest=distance;index=i;}});
      count.textContent = (index + 1) + ' من ' + images.length;
      prev.disabled = index === 0; next.disabled = index === images.length - 1;
      images.forEach((image,i) => {if(image.tagName==='BUTTON') image.tabIndex=i===index ? 0 : -1;});
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
    if(onZoom){
      images.forEach((image,i) => image.addEventListener('click',() => onZoom(i,image)));
      const zoom=root.querySelector('.gallery-zoom');zoom.addEventListener('click',() => onZoom(index,zoom));
    }
    const resize=new ResizeObserver(() => {cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(() => go(index,true));});resize.observe(track);
    go(index,true);
    return {go,getIndex:()=>index,activeSlide:()=>images[index],destroy:()=>{resize.disconnect();cancelAnimationFrame(frame);cancelAnimationFrame(resizeFrame);}};
  }
  let dialog, largeGallery, opener, inlineGallery;
  function closeGallery() {dialog.close();}
  function openGallery(photos,title,index,trigger,owner) {
    if(!dialog){
      dialog=document.createElement('dialog');dialog.className='guide-photo-dialog';dialog.setAttribute('aria-labelledby','guide-gallery-title');
      dialog.addEventListener('click',event => {if(event.target===dialog) closeGallery();});
      dialog.addEventListener('close',() => {
        if(largeGallery){inlineGallery.go(largeGallery.getIndex(),true);largeGallery.destroy();largeGallery=null;}
        document.documentElement.classList.remove('guide-gallery-open');
        const focusTarget=opener?.classList.contains('gallery-slide') ? inlineGallery.activeSlide() : opener;
        if(focusTarget?.isConnected) focusTarget.focus({preventScroll:true});
      });
      document.body.appendChild(dialog);
    }
    opener=trigger;inlineGallery=owner;
    dialog.innerHTML='<header><div><h2 id="guide-gallery-title">'+esc(title)+'</h2><p>من أجواء أكواخ المنتجع</p></div><button type="button" class="gallery-close" aria-label="إغلاق الصور">×</button></header><div class="gallery-large"><div class="gallery-track" tabindex="0" role="region" aria-label="صور مكبّرة — استخدم الأسهم أو اسحب للتنقل">'+slides(photos,title,true)+'</div>'+controls(photos.length)+'</div>';
    dialog.querySelector('.gallery-close').addEventListener('click',closeGallery);
    document.documentElement.classList.add('guide-gallery-open');dialog.showModal();
    largeGallery=bind(dialog.querySelector('.gallery-large'),index);
    dialog.querySelector('.gallery-close').focus();
  }
  function mount() {
    document.querySelectorAll('.package-gallery').forEach(root => {
      const photos=JSON.parse(root.dataset.gallery), title=root.dataset.galleryTitle;
      let owner=bind(root,0,(index,trigger) => openGallery(photos,title,index,trigger,owner));
    });
  }
  window.FD_GUIDE_GALLERY={markup,mount};
})();
