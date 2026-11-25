/* Reuse the established resort order documents, controllers and message builders. */
(function () {
  'use strict';
  const version=new URL(document.currentScript.src).searchParams.get('v')||'1';
  const embedded=parent!==window&&new URLSearchParams(location.search).get('embed')==='resort-order';
  const guest=!!document.getElementById('service-dialog');
  const dialog=document.getElementById(guest?'service-dialog':'arrangement-dialog');
  const summary=document.getElementById(guest?'orders-summary':'arrangement-summary');
  const kind=guest?'guest':'arrangements';
  const shareIcon='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 16V2m-5 5 5-5 5 5M6 10H3v11h18V10h-3"/></svg>';
  let metadata=null,ready=false,wasOpen=false,view='',committed=false,notifyQueued=false;
  let summaryRoot,empty;
  const post=(action,data={})=>{if(embedded)parent.postMessage({type:'familyday-resort-order',kind,action,...data},location.origin);};
  const number=id=>Number(document.getElementById(id)?.textContent)||0;
  function counts(){
    if(guest)return {services:{count:document.querySelectorAll('#order-items .order-group-items>li').length,total:number('order-total')},restaurant:{count:document.querySelectorAll('#restaurant-items .order-group-items>li').length,total:number('restaurant-total')}};
    return {arrangements:{count:document.querySelectorAll('#arrangement-items .arrangement-item-copy').length,total:number('arrangement-total')}};
  }
  function addSummaryEdits(){
    if(!embedded)return;
    const headings=summary.querySelectorAll(guest?'.order-group-heading':'.arrangement-group>h3');
    for(const heading of headings){
      if(heading.querySelector('.resort-edit-order'))continue;
      const group=heading.closest(guest?'.order-group':'.arrangement-group');
      const key=guest?(heading.closest('#restaurant-items')?'restaurant':group.dataset.group):(group.dataset.tone==='extra'?'seating':group.dataset.tone);
      const button=document.createElement('button');button.type='button';button.className='resort-edit-order';button.textContent='تعديل';button.setAttribute('aria-label','تعديل '+(heading.querySelector('h4')?.textContent||heading.textContent));
      button.addEventListener('click',()=>{const target=guest?document.getElementById(key+'-card'):document.querySelector('.guide-tile[href="#'+key+'"]');target?.click();});heading.append(button);
    }
  }
  function publish(){
    if(!ready)return;
    addSummaryEdits();
    const state=counts();post('state',{state});
    if(empty)empty.hidden=Object.values(state).some(x=>x.count);
  }
  function schedule(){if(notifyQueued)return;notifyQueued=true;queueMicrotask(()=>{notifyQueued=false;publish();});}
  function serviceKey(){
    if(guest)return dialog.dataset.tone||'';
    return document.querySelector('.guide-section.is-active')?.id||'';
  }
  function sharePath(){
    const key=serviceKey(),service=metadata?.services?.[key];if(!service)return null;
    if(!guest){
      const hash=location.hash.slice(1);
      if(/^package-(1|2|3|celebration|vip|complete)$/.test(hash))return service.path+'?package='+hash.replace('package-','').replace('complete','resort');
      if(/^session-[1-6]$/.test(hash))return service.path+'?session='+hash.replace('session-','');
    }
    return service.path;
  }
  async function share(path){
    if(typeof path!=='string'||!path.startsWith('/')||path.startsWith('//'))return;
    if(embedded){post('share',{path});return;}
    const url=new URL(path,location.origin).href;
    try{
      if(navigator.share){await navigator.share({text:url});return;}
      await navigator.clipboard.writeText(url);
      const status=document.getElementById('share-status');status.textContent='تم نسخ الرابط';status.classList.add('visible');setTimeout(()=>status.classList.remove('visible'),3000);
    }catch(error){
      if(error.name==='AbortError')return;
      const field=document.getElementById('share-link');field.value=url;document.getElementById('share-dialog').showModal();field.select();
    }
  }
  const shareButton=document.createElement('button');shareButton.type='button';shareButton.className='resort-service-share';shareButton.innerHTML=shareIcon;shareButton.title='مشاركة الخدمة';shareButton.setAttribute('aria-label','مشاركة الخدمة');shareButton.disabled=true;
  dialog.querySelector('header').insertBefore(shareButton,dialog.querySelector('header button'));
  shareButton.addEventListener('click',()=>share(sharePath()));
  // The page retains its original public URL; service buttons share the original native service URL.
  document.addEventListener('click',event=>{
    const item=embedded&&event.target.closest('[data-share-path]');if(item){event.preventDefault();event.stopImmediatePropagation();share(item.dataset.sharePath);return;}
    if(embedded&&event.target.closest('.seating-collapsed-summary')){event.preventDefault();return;}
    const button=event.target.closest(guest?'#share-page':'.topbar [data-share]');if(!button)return;
    event.preventDefault();event.stopImmediatePropagation();share(guest?'/guest-services/':'/services-guide/');
  },true);
  if(guest)document.getElementById('share-page').innerHTML=shareIcon;
  function updateShare(){shareButton.disabled=!sharePath();}
  function photo(service,panel){
    if(!service.image||panel.querySelector('.resort-service-photo'))return;
    const figure=document.createElement('figure');figure.className='resort-service-photo';
    const button=document.createElement('button');button.type='button';button.setAttribute('aria-label','تكبير صورة '+service.title);
    const img=document.createElement('img');img.src=service.image;img.alt=service.title;img.loading='eager';img.decoding='async';if(service.size){img.width=service.size[0];img.height=service.size[1];}button.append(img);figure.append(button);
    panel.querySelector('.section-note').after(figure);
    button.addEventListener('click',()=>{
      let viewer=document.getElementById('resort-service-photo-viewer');
      if(!viewer){viewer=document.createElement('dialog');viewer.id='resort-service-photo-viewer';viewer.className='resort-service-photo-viewer';viewer.innerHTML='<button type="button" aria-label="إغلاق الصورة">×</button><img alt="">';viewer.querySelector('button').addEventListener('click',()=>viewer.close());viewer.addEventListener('click',e=>{if(e.target===viewer)viewer.close();});document.body.append(viewer);}
      viewer.querySelector('img').src=service.originalImage;viewer.querySelector('img').alt=service.title;viewer.showModal();
    });
  }
  function enhance(){
    if(!metadata?.services)return;
    if(guest){
      for(const key of ['water','games','cinema','hospitality']){
        const service=metadata.services[key],panel=document.getElementById(key+'-service');if(!service||!panel)continue;
        if(!embedded&&['cinema','games'].includes(key))photo(service,panel);
      }
    }
    updateShare();
  }
  fetch('/site/orders/service-links.json?v='+encodeURIComponent(version)).then(r=>{if(!r.ok)throw Error('Service links unavailable');return r.json();}).then(data=>{metadata=data;enhance();}).catch(()=>{shareButton.title='تعذر تحميل رابط المشاركة';});
  function initEmbedded(){
    document.documentElement.classList.add('resort-order-embedded');
    document.body.classList.add('resort-order-embedded');
    summaryRoot=document.createElement('main');summaryRoot.className='resort-embedded-summary';
    summaryRoot.append(summary);document.body.append(summaryRoot);document.body.append(dialog);
    empty=document.createElement('p');empty.className='resort-order-empty';empty.textContent='لم تضف طلبات بعد';summaryRoot.append(empty);
    if(guest){
      const extra=document.createElement('button');extra.className='resort-embedded-extra';extra.type='button';extra.textContent='إضافات أثناء الإقامة';extra.addEventListener('click',()=>document.getElementById('extras-card').click());summaryRoot.append(extra);
    }
  }
  if(embedded)initEmbedded();
  function closeSource(){
    if(!dialog.open)return;
    dialog.querySelector(guest?'.dialog-close':'[data-close-arrangements]').click();
  }
  function openCommand(command){
    if(!ready){post('error');return;}
    committed=false;view=command.mode;document.body.dataset.orderSurface=view;
    if(dialog.open)closeSource();
    if(view==='editor'){
      const key=command.service;
      if(guest){const card=document.getElementById(key+'-card');if(!card||card.disabled){post('error');return;}card.click();}
      else{
        const target=command.anchor||key;
        history.replaceState(null,'','#'+target);window.dispatchEvent(new PopStateEvent('popstate'));
        if(!dialog.open){post('error');return;}
      }
      wasOpen=dialog.open;
      requestAnimationFrame(()=>{
        const focus=[...dialog.querySelectorAll('input:not(:disabled),select:not(:disabled),button:not(:disabled)')].find(e=>e.checkVisibility());focus?.focus({preventScroll:true});
      });
    }else{window.scrollTo({top:0,behavior:'instant'});summaryRoot.scrollTop=0;publish();}
    updateShare();post('opened');
  }
  window.addEventListener('message',event=>{
    if(!embedded||event.origin!==location.origin||event.source!==parent||event.data?.type!=='familyday-resort-order-command')return;
    if(event.data.action==='open')openCommand(event.data);
    if(event.data.action==='cancel'){view='';document.body.dataset.orderSurface='';closeSource();wasOpen=false;}
    if(event.data.action==='state')publish();
  });
  document.addEventListener('keydown',event=>{
    if(!embedded||!dialog.open||event.key!=='Tab')return;
    const controls=[...dialog.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),summary,[tabindex="0"]')].filter(e=>e.checkVisibility()&&e.tabIndex>=0);
    if(event.shiftKey&&document.activeElement===controls[0]||!event.shiftKey&&document.activeElement===controls.at(-1)){event.preventDefault();event.stopImmediatePropagation();post('focus',{edge:event.shiftKey?'last':'first'});}
  },true);
  document.addEventListener('click',event=>{
    if(event.target.closest('#apply-selection,.arrangement-dialog-footer [data-close-arrangements]'))committed=true;
  },true);
  new MutationObserver(()=>{
    updateShare();
    if(embedded&&wasOpen&&!dialog.open&&view==='editor'){view='';post('closed',{committed});committed=false;}
    if(embedded&&view==='summary')post('editor',{title:dialog.open?document.getElementById(guest?'service-dialog-title':'arrangement-dialog-title').textContent:null,path:dialog.open?sharePath():null});
    wasOpen=dialog.open;
  }).observe(dialog,{attributes:true,attributeFilter:['open','data-tone']});
  if(!guest)document.addEventListener('fd:arrangement-view',updateShare);
  new MutationObserver(schedule).observe(summary,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden']});
  function checkReady(){
    if(ready)return;
    if(guest?!document.getElementById('services-error').hidden:!!document.querySelector('.load-error')){post('error');return;}
    if(guest?document.getElementById('water-card').disabled||!document.getElementById('guest-name'):!document.getElementById('guide-content').classList.contains('is-ready'))return;
    ready=true;readyObserver.disconnect();if(embedded)document.querySelectorAll('.seating-collapsed-summary').forEach(e=>e.tabIndex=-1);enhance();post('ready');publish();
  }
  const readyObserver=new MutationObserver(checkReady);readyObserver.observe(document.body,{subtree:true,attributes:true,childList:true});checkReady();
})();
