/* Reuse the established resort order documents, controllers and message builders. */
(function () {
  'use strict';
  const version=new URL(document.currentScript.src).searchParams.get('v')||'1';
  const embedded=parent!==window&&new URLSearchParams(location.search).get('embed')==='resort-order';
  const guest=!!document.getElementById('service-dialog');
  const dialog=document.getElementById(guest?'service-dialog':'arrangement-dialog');
  const kind=guest?'guest':'arrangements';
  const shareIcon='<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 16V2m-5 5 5-5 5 5M6 10H3v11h18V10h-3"/></svg>';
  let metadata=null,ready=false,wasOpen=false,view=false,directForm,sendButton,confirmationNote;
  const post=(action,data={})=>{if(embedded)parent.postMessage({type:'familyday-resort-order',kind,action,...data},location.origin);};
  function serviceKey(){
    if(guest)return dialog.dataset.tone||'';
    return document.querySelector('.guide-section.is-active')?.id||'';
  }
  function sharePath(){
    const key=serviceKey(),service=metadata?.services?.[key];if(!service)return null;
    if(embedded)return service.path;
    return service.portalSharePath||(guest?'/guest-services/#'+key:'/services-guide/'+key+'/');
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
      if(guest){const service=Object.values(metadata?.services||{}).find(item=>item.portalSharePath===path);document.querySelector('#share-dialog h2').textContent=service?'رابط '+service.title:'رابط خدمات إقامتك';}
      const field=document.getElementById('share-link');field.value=url;document.getElementById('share-dialog').showModal();field.select();
    }
  }
  const shareButton=document.createElement('button');shareButton.type='button';shareButton.className='resort-service-share';shareButton.innerHTML=shareIcon;shareButton.title='مشاركة الخدمة';shareButton.setAttribute('aria-label','مشاركة الخدمة');shareButton.disabled=true;
  dialog.querySelector('header').insertBefore(shareButton,dialog.querySelector('header button'));
  shareButton.addEventListener('click',()=>share(sharePath()));
  // Standalone service shares stay in their portal; embedded shares stay in the native guide.
  document.addEventListener('click',event=>{
    const item=embedded&&event.target.closest('[data-share-path]');if(item){event.preventDefault();event.stopImmediatePropagation();share(item.dataset.sharePath);return;}
    if(embedded&&event.target.closest('.seating-collapsed-summary')){event.preventDefault();return;}
    // The guide's own handler knows the current section; keep its header share local to that section.
    const button=guest&&event.target.closest('#share-page');if(!button)return;
    event.preventDefault();event.stopImmediatePropagation();share('/guest-services/');
  },true);
  function updateShare(){shareButton.disabled=!sharePath();if(guest&&!embedded){const title=metadata?.services?.[serviceKey()]?.title;shareButton.title='مشاركة '+(title||'الخدمة');shareButton.setAttribute('aria-label',shareButton.title);}}
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
      for(const key of ['water','games','hospitality']){
        const service=metadata.services[key],panel=document.getElementById(key+'-service');if(!service||!panel)continue;
        if(!embedded&&key==='games')photo(service,panel);
      }
    }
    updateShare();
  }
  fetch('/site/orders/service-links.json?v='+encodeURIComponent(version)).then(r=>{if(!r.ok)throw Error('Service links unavailable');return r.json();}).then(data=>{metadata=data;enhance();}).catch(()=>{shareButton.title='تعذر تحميل رابط المشاركة';});
  function closeSource(){
    if(dialog.open)dialog.querySelector(guest?'.dialog-close':'[data-close-arrangements]').click();
  }
  function syncDirect(){
    if(sendButton)sendButton.disabled=!window.FD_RESORT_DIRECT_ORDER.canSubmit();
    if(confirmationNote)confirmationNote.textContent=directForm.querySelector('.arrangement-confirmation,.confirmation-note').textContent;
  }
  function mountDirect(){
    const api=window.FD_RESORT_DIRECT_ORDER;if(!api){post('error');return false;}
    document.documentElement.classList.add('resort-order-embedded');document.body.classList.add('resort-order-embedded');
    document.body.append(dialog);
    directForm=document.getElementById(api.formId);directForm.classList.add('resort-direct-form');directForm.removeAttribute('aria-labelledby');directForm.setAttribute('aria-label','بيانات الطلب');
    directForm.autocomplete='off';document.querySelectorAll('input,select,textarea').forEach(field=>field.setAttribute('autocomplete','off'));
    dialog.querySelector(guest?'.dialog-body':'#guide-content').append(directForm);
    sendButton=document.createElement('button');sendButton.type='submit';sendButton.setAttribute('form',api.formId);sendButton.className='resort-direct-send';sendButton.textContent='إرسال الطلب';
    const footer=dialog.querySelector('footer');footer.append(sendButton);
    const sourceNote=directForm.querySelector('.arrangement-confirmation,.confirmation-note');
    if(sourceNote){confirmationNote=sourceNote.cloneNode(true);confirmationNote.className='resort-direct-confirmation';footer.append(confirmationNote);new MutationObserver(syncDirect).observe(sourceNote,{childList:true,subtree:true,characterData:true});}
    if(!guest)directForm.querySelector('.arrangement-total>span').textContent='إجمالي الخدمة';
    directForm.addEventListener('submit',event=>{
      event.preventDefault();event.stopImmediatePropagation();
      if(api.submit(event)===true)post('submitted');
    },true);
    const observer=new MutationObserver(syncDirect);
    observer.observe(guest?document.getElementById('apply-selection'):directForm.querySelector('.arrangement-send'),{attributes:true,attributeFilter:['disabled']});
    syncDirect();return true;
  }
  function openCommand(command){
    if(!ready){post('error');return;}
    view=true;
    if(guest){const card=document.getElementById(command.service+'-card');if(!card||card.disabled){post('error');return;}card.click();}
    else{
      history.replaceState(null,'','#'+(command.anchor||command.service));window.dispatchEvent(new PopStateEvent('popstate'));
      if(!dialog.open){post('error');return;}
      if(command.entry&&!window.FD_RESORT_DIRECT_ORDER.selectEntry(command.entry)){post('error');return;}
    }
    if(command.draft){window.FD_RESORT_DIRECT_ORDER?.restoreDraft?.(command.draft);window.FD_RESORT_DIRECT_ORDER?.resumeRequest?.();}
    wasOpen=dialog.open;syncDirect();updateShare();post('opened',{title:window.FD_RESORT_DIRECT_ORDER?.getTitle?.()});
  }
  window.addEventListener('message',event=>{
    if(!embedded||event.origin!==location.origin||event.source!==parent||event.data?.type!=='familyday-resort-order-command')return;
    if(event.data.action==='open')openCommand(event.data);
    if(event.data.action==='resume'){window.FD_RESORT_DIRECT_ORDER?.resumeRequest?.();syncDirect();}
    if(event.data.action==='cancel'){view=false;closeSource();wasOpen=false;}
  });
  document.addEventListener('keydown',event=>{
    if(!embedded||!dialog.open||event.key!=='Tab')return;
    const controls=[...dialog.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),summary,[tabindex="0"]')].filter(e=>e.checkVisibility()&&e.tabIndex>=0);
    if(event.shiftKey&&document.activeElement===controls[0]||!event.shiftKey&&document.activeElement===controls.at(-1)){event.preventDefault();event.stopImmediatePropagation();post('focus',{edge:event.shiftKey?'last':'first'});}
  },true);
  new MutationObserver(()=>{
    updateShare();
    if(embedded&&wasOpen&&!dialog.open&&view){view=false;post('closed');}
    wasOpen=dialog.open;
  }).observe(dialog,{attributes:true,attributeFilter:['open','data-tone']});
  if(!guest)document.addEventListener('fd:arrangement-view',updateShare);
  function checkReady(){
    if(ready)return;
    if(guest?!document.getElementById('services-error').hidden:!!document.querySelector('.load-error')){post('error');return;}
    if(guest?document.getElementById('water-card').disabled||!document.getElementById('guest-name'):!document.getElementById('guide-content').classList.contains('is-ready'))return;
    // Guest controls are hydrated in an async controller; wait until its direct API is attached.
    if(embedded&&!window.FD_RESORT_DIRECT_ORDER)return;
    ready=true;readyObserver.disconnect();if(embedded){if(!mountDirect())return;document.querySelectorAll('.seating-collapsed-summary').forEach(e=>e.tabIndex=-1);}
    enhance();post('ready');
  }
  const readyObserver=new MutationObserver(checkReady);readyObserver.observe(document.body,{subtree:true,attributes:true,childList:true});checkReady();
})();
