

let fsIdx = 0, fsImgs = [], fsStartX = 0, fsDragging = false, fsSourceId = null;

function openFS(imgs, startIdx, sourceId){
  fsSourceId = sourceId == null ? null : sourceId;
  fsImgs = imgs;
  fsIdx = startIdx || 0;
  const track = document.getElementById('fsTrack');
  track.innerHTML = '';
  imgs.forEach((src, i) => {
    const slide = document.createElement('div');
    slide.className = 'fs-slide';
    const img = document.createElement('img');
    img.src = src;
    img.alt = galleryPhotoLabel(fsSourceId, src) || 'صورة '+(i+1)+' من '+imgs.length;
    slide.appendChild(img);
    track.appendChild(slide);
  });
  updateFS();
  document.getElementById('fsOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';

}

// Fullscreen swipe support (init once)
(function(){
  var overlay = document.getElementById('fsOverlay');
  if(!overlay) return;
  overlay.addEventListener('touchstart', function(e){ fsStartX = e.touches[0].clientX; fsDragging = true; },{passive:true});
  overlay.addEventListener('touchend', function(e){
    if(!fsDragging) return;
    var diff = fsStartX - e.changedTouches[0].clientX;
    if(Math.abs(diff) > 40){ diff > 0 ? goFS(fsIdx+1) : goFS(fsIdx-1); }
    fsDragging = false;
  });
})();

function goFS(idx){
  fsIdx = Math.max(0, Math.min(idx, fsImgs.length - 1));
  updateFS();
}

function moveFS(dir){fsIdx=(fsIdx+dir+fsImgs.length)%fsImgs.length;updateFS();}

function updateFS(){
  document.getElementById('fsTrack').style.transform = `translateX(${-fsIdx * 100}%)`;
  document.getElementById('fsCounter').textContent = (fsIdx+1) + ' من ' + fsImgs.length;
  var caption = document.getElementById('fsPhotoLabel');
  caption.textContent = galleryPhotoLabel(fsSourceId, fsImgs[fsIdx]);
  caption.hidden = !caption.textContent;

}

function closeFS(){
  if(fsSourceId!==null && fsSourceId===curId){
    galIdx=fsIdx;updGal(fsImgs.length);
  }
  document.getElementById('fsOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

render();
