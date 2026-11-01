
(function(){
  ['grid','grid2'].forEach(function(gridId){
  const grid=document.getElementById(gridId);
  const noun=gridId==='grid2'?'القسم':'الكوخ';
  const controls=document.createElement('div');
  controls.className='fd-carousel-controls';
  controls.innerHTML='<button type="button" aria-label="الكوخ السابق">&#8250;</button><span class="fd-carousel-count" role="status" aria-live="polite" aria-atomic="true"></span><button type="button" aria-label="الكوخ التالي">&#8249;</button>';
  controls.children[0].setAttribute('aria-label',noun+' السابق');
  controls.children[2].setAttribute('aria-label',noun+' التالي');
  grid.after(controls);
  const previous=controls.children[0], count=controls.children[1], next=controls.children[2];
  const desktop=matchMedia('(min-width:900px)');
  let cards=[], selected=0, frame=0, timer=0;
  const digits=new Intl.NumberFormat('en-US',{useGrouping:false});
  function update(){
    if(!cards.length||desktop.matches)return;
    const box=grid.getBoundingClientRect(), center=box.left+box.width/2;
    let distance=Infinity;
    cards.forEach((card,i)=>{const r=card.getBoundingClientRect(), d=Math.abs(r.left+r.width/2-center);if(d<distance){distance=d;selected=i;}});
    const text=digits.format(selected+1)+' من '+digits.format(cards.length);
    if(count.textContent!==text)count.textContent=text;
    previous.disabled=selected===0;next.disabled=selected===cards.length-1;
  }
  function go(index,instant){
    if(desktop.matches||index<0||index>=cards.length||!grid.clientWidth)return;
    const box=grid.getBoundingClientRect(), r=cards[index].getBoundingClientRect();
    grid.scrollBy({left:r.left+r.width/2-box.left-box.width/2,behavior:instant||matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }
  function setup(){
    cards=Array.from(grid.querySelectorAll(':scope > .fd-cabin-card-v2:not(.hidden)'));
    const enabled=cards.length>0;
    grid.classList.toggle('fd-carousel',enabled);controls.hidden=!enabled||desktop.matches;
    controls.style.display=enabled&&!desktop.matches?'flex':'none';
    if(!enabled)return;
    grid.setAttribute('role','region');grid.setAttribute('aria-label',gridId==='grid2'?'تصفح أقسام الاستراحة':'تصفح الأكواخ');
    selected=0;previous.disabled=true;next.disabled=cards.length<2;
    count.textContent=digits.format(1)+' من '+digits.format(cards.length);
    requestAnimationFrame(()=>go(0,true));
  }
  previous.onclick=()=>go(selected-1);next.onclick=()=>go(selected+1);
  grid.addEventListener('scroll',()=>{clearTimeout(timer);timer=setTimeout(update,90);},{passive:true});
  grid.addEventListener('keydown',event=>{
    if(!desktop.matches && (event.key==='ArrowLeft'||event.key==='ArrowRight')){
      event.preventDefault();go(selected+(event.key==='ArrowLeft'?1:-1));
    }
  });
  // Native touch scrolling suppresses clicks while swiping; keep every card's original click handler.
  new MutationObserver(()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(setup);}).observe(grid,{childList:true});
  new ResizeObserver(()=>{go(selected,true);update();}).observe(grid);
  desktop.addEventListener('change',setup);
  setup();
  });
})();
