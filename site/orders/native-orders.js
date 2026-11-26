/* Each resort service opens a fresh request using the original controller and message builder. */
export function createResortOrders({version,services,share}){
 let context=null,active=null,item=null,trigger=null,savedY=0;
 const snapshots=new Map();
 const dialog=document.createElement('dialog');dialog.id='native-order-dialog';dialog.className='native-order-dialog';dialog.setAttribute('aria-labelledby','native-order-title');
 dialog.innerHTML='<header class="native-order-header"><h2 id="native-order-title"></h2><button type="button" class="native-order-close" aria-label="إغلاق الطلب">×</button></header><div class="native-order-body"><p class="native-order-loading" role="status">جاري تحميل الطلب…</p><section class="native-order-error" hidden><p>تعذر تحميل الطلب. حاول مرة أخرى.</p><button type="button" class="native-order-retry">إعادة المحاولة</button><button type="button" class="native-order-external">فتح صفحة الطلب</button></section></div>';
 document.body.append(dialog);
 const body=dialog.querySelector('.native-order-body'),loading=dialog.querySelector('.native-order-loading'),error=dialog.querySelector('.native-order-error'),title=dialog.querySelector('h2');
 if(history.state?.fdResortOrder){const state={...history.state};delete state.fdResortOrder;history.replaceState(state,'',location.href);}
 const fallback=kind=>kind==='guest'?'/guest-services/':'/services-guide/';
 function command(data){item?.iframe.contentWindow.postMessage({type:'familyday-resort-order-command',...data},location.origin);}
 function dispose(){if(!item)return;clearTimeout(item.timer);item.iframe.remove();item=null;}
 function failed(){if(!active||!item)return;clearTimeout(item.timer);loading.hidden=true;error.hidden=false;item.iframe.hidden=true;}
 function show(descriptor){
  dispose();active=descriptor;title.textContent=descriptor.title;
  loading.hidden=false;error.hidden=true;
  error.querySelector('.native-order-external').dataset.url=fallback(descriptor.kind)+'#'+descriptor.anchor;
  const iframe=document.createElement('iframe');iframe.className='native-order-frame';iframe.title='طلب '+descriptor.title;iframe.allow='clipboard-write; web-share';iframe.hidden=true;
  item={iframe,timer:setTimeout(failed,25000)};body.append(iframe);
  iframe.src=fallback(descriptor.kind)+'?embed=resort-order&direct='+encodeURIComponent(descriptor.service)+'&v='+encodeURIComponent(version);
 }
 function open(descriptor,source){
  trigger=source||document.activeElement;savedY=scrollY;
  const token=globalThis.crypto?.randomUUID?.()||String(Date.now());descriptor={...descriptor,token,scrollY:savedY,focusElement:trigger};snapshots.set(token,descriptor);if(snapshots.size>50)snapshots.delete(snapshots.keys().next().value);
  history.pushState({...history.state,fdResortOrder:token},'',location.href);
  document.body.classList.add('native-order-open');dialog.showModal();show(descriptor);
 }
 function closeUI(){
  const restoreFocus=active?.keyboard;active=null;dispose();dialog.close();document.body.classList.remove('native-order-open');
  window.scrollTo({top:savedY,behavior:'instant'});if(trigger?.isConnected){if(restoreFocus)trigger.focus({preventScroll:true});else trigger.blur();}
 }
 function requestClose(){if(!dialog.open)return;if(history.state?.fdResortOrder===active?.token)history.back();else closeUI();}
 dialog.querySelector('.native-order-close').addEventListener('click',requestClose);
 dialog.addEventListener('cancel',e=>{e.preventDefault();requestClose();});
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)requestClose();}});
 error.querySelector('.native-order-external').addEventListener('click',()=>location.assign(error.querySelector('.native-order-external').dataset.url));
 error.querySelector('.native-order-retry').addEventListener('click',()=>show(active));
 document.addEventListener('click',event=>{
  if(context?.venue==='resort'&&!event.defaultPrevented){
   const choice=event.target.closest('[data-dining-size]');
   if(choice){
    const service=services.find(s=>s.id==='dining'),size=choice.dataset.diningSize,option=choice.dataset.diningOption;
    if(!Object.hasOwn(service.prices,size)||!['plain','tansiq'].includes(option))return;
    const guide=choice.closest('.dining-guide'),button=guide.querySelector('[data-service-portal]');
    guide.querySelectorAll('[data-dining-size]').forEach(item=>item.setAttribute('aria-pressed',String(item===choice)));
    const name='طاولة طعام لـ'+size+' '+(Number(size)<=10?'أشخاص':'شخصًا')+' — '+(option==='plain'?'تجهيز أساسي':'تجهيز مع تنسيق');
    button.dataset.resortOrderKey='dining-'+size+'-'+option;button.disabled=false;
    guide.querySelector('.dining-selected-option').textContent=name+' — '+service.prices[size][option]+' ريال';return;
   }
  }
  const link=event.target.closest('[data-service-portal]');
  if(!link||link.disabled||context?.venue!=='resort'||event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||dialog.contains(link))return;
  const target=new URL(link.href||link.dataset.serviceUrl,location.origin);if(target.origin!==location.origin&&target.origin!=='https://familydaystay.com')return;
  const kind=['/arrangements/','/services-guide/'].includes(target.pathname)?'arrangements':target.pathname==='/guest-services/'?'guest':null;if(!kind)return;
  const selected=services.find(s=>s.path===context.path),service=link.dataset.resortService||(selected?.id==='menu'?'restaurant':selected?.id);
  if(!service)return;
  const record=selected||services.find(s=>(s.id==='menu'?'restaurant':s.id)===service);
  event.preventDefault();open({kind,service,keyboard:event.detail===0,entry:link.dataset.resortOrderKey||'',anchor:target.hash.slice(1)||service,title:record?.name||'طلبات إضافية أثناء الإقامة',path:service==='extras'?'/guest-services/#extras':record?.path||context.path},link);
 });
 window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.data?.type!=='familyday-resort-order'||!item||event.source!==item.iframe.contentWindow||event.data.kind!==active?.kind)return;
  const {action}=event.data;
  if(action==='focus'){const controls=[...dialog.querySelectorAll('.native-order-header button')];(event.data.edge==='last'?controls.at(-1):controls[0])?.focus();}
  if(action==='ready')command({action:'open',service:active.service,anchor:active.anchor,entry:active.entry});
  if(action==='opened'){if(typeof event.data.title==='string'&&event.data.title)title.textContent=event.data.title;clearTimeout(item.timer);loading.hidden=true;error.hidden=true;item.iframe.hidden=false;}
  if(action==='closed'||action==='submitted')requestClose();
  if(action==='error')failed();
  if(action==='share'&&typeof event.data.path==='string'){
   const u=new URL(event.data.path,location.origin);if(u.origin!==location.origin||!services.some(s=>s.path===u.pathname)&&u.pathname!=='/guest-services/')return;
   share(u.pathname+u.search+u.hash,document.title);
  }
 });
 return {
  isOpen:()=>dialog.open,
  reset:()=>{if(dialog.open&&active)show(active);},
  setContext(next){context=next;},
  handlePopstate(){
   const token=history.state?.fdResortOrder;
   if(dialog.open){if(token!==active?.token)closeUI();return true;}
   if(token&&snapshots.has(token)){const descriptor=snapshots.get(token);savedY=descriptor.scrollY;trigger=descriptor.focusElement;document.body.classList.add('native-order-open');dialog.showModal();show(descriptor);return true;}
   return false;
  }
 };
}
