/* Each resort service opens a fresh request using the original controller and message builder. */
export function createResortOrders({version,services,share}){
 let context=null,active=null,item=null,trigger=null,savedY=0;
 const snapshots=new Map();
 const icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 16V2m-5 5 5-5 5 5M6 10H3v11h18V10h-3"/></svg>';
 const dialog=document.createElement('dialog');dialog.id='native-order-dialog';dialog.className='native-order-dialog';dialog.setAttribute('aria-labelledby','native-order-title');
 dialog.innerHTML='<header class="native-order-header"><h2 id="native-order-title"></h2><button type="button" class="native-order-share" aria-label="مشاركة الخدمة">'+icon+'</button><button type="button" class="native-order-close" aria-label="إغلاق الطلب">×</button></header><div class="native-order-body"><p class="native-order-loading" role="status">جاري تحميل الطلب…</p><section class="native-order-error" hidden><p>تعذر تحميل الطلب. حاول مرة أخرى.</p><button type="button" class="native-order-retry">إعادة المحاولة</button><button type="button" class="native-order-external">فتح صفحة الطلب</button></section></div>';
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
  iframe.src=fallback(descriptor.kind)+'?embed=resort-order&direct='+encodeURIComponent(descriptor.service)+(descriptor.itemKey?'&item='+encodeURIComponent(descriptor.itemKey):'')+'&v='+encodeURIComponent(version);
 }
 function open(descriptor,source){
  trigger=source||document.activeElement;savedY=scrollY;
  const token=globalThis.crypto?.randomUUID?.()||String(Date.now());descriptor={...descriptor,token,scrollY:savedY,focusElement:trigger};snapshots.set(token,descriptor);if(snapshots.size>50)snapshots.delete(snapshots.keys().next().value);
  history.pushState({...history.state,fdResortOrder:token},'',location.href);
  document.body.classList.add('native-order-open');dialog.showModal();show(descriptor);
 }
 function closeUI(){
  active=null;dispose();dialog.close();document.body.classList.remove('native-order-open');
  window.scrollTo({top:savedY,behavior:'instant'});if(trigger?.isConnected)trigger.focus({preventScroll:true});
 }
 function requestClose(){if(!dialog.open)return;if(history.state?.fdResortOrder===active?.token)history.back();else closeUI();}
 dialog.querySelector('.native-order-close').addEventListener('click',requestClose);
 dialog.addEventListener('cancel',e=>{e.preventDefault();requestClose();});
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)requestClose();}});
 dialog.querySelector('.native-order-share').addEventListener('click',()=>{if(active?.path)share(active.path,title.textContent);});
 error.querySelector('.native-order-external').addEventListener('click',()=>location.assign(error.querySelector('.native-order-external').dataset.url));
 error.querySelector('.native-order-retry').addEventListener('click',()=>show(active));
 document.addEventListener('click',event=>{
  const link=event.target.closest('a[data-service-portal]');
  if(!link||context?.venue!=='resort'||event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||dialog.contains(link))return;
  const target=new URL(link.href,location.origin);if(target.origin!==location.origin&&target.origin!=='https://familydaystay.com')return;
  const kind=['/arrangements/','/services-guide/'].includes(target.pathname)?'arrangements':target.pathname==='/guest-services/'?'guest':null;if(!kind)return;
  const selected=context.service||services.find(s=>s.path===context.path),service=link.dataset.resortService||(selected?.id==='menu'?'restaurant':selected?.id);
  if(!service)return;
  event.preventDefault();open({kind,service,itemKey:context.itemKey,anchor:target.hash.slice(1)||service,title:context.item?.name||selected?.name||'طلبات إضافية أثناء الإقامة',path:service==='extras'?'/guest-services/#extras':context.path},link);
 });
 window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.data?.type!=='familyday-resort-order'||!item||event.source!==item.iframe.contentWindow||event.data.kind!==active?.kind)return;
  const {action}=event.data;
  if(action==='focus'){const controls=[...dialog.querySelectorAll('.native-order-header button')];(event.data.edge==='last'?controls.at(-1):controls[0])?.focus();}
  if(action==='ready')command({action:'open',service:active.service,anchor:active.anchor});
  if(action==='opened'){clearTimeout(item.timer);loading.hidden=true;error.hidden=true;item.iframe.hidden=false;}
  if(action==='closed'||action==='submitted')requestClose();
  if(action==='error')failed();
  if(action==='share'&&typeof event.data.path==='string'){
   const u=new URL(event.data.path,location.origin);if(u.origin!==location.origin||!services.some(s=>s.path===u.pathname)&&!FD_SERVICE_ITEM_ROUTES.parse(u.pathname)&&u.pathname!=='/guest-services/')return;
   share(u.pathname+u.search+u.hash,document.title);
  }
 });
 return {
  isOpen:()=>dialog.open,
  setContext(next){context=next;},
  handlePopstate(){
   const token=history.state?.fdResortOrder;
   if(dialog.open){if(token!==active?.token)closeUI();return true;}
   if(token&&snapshots.has(token)){const descriptor=snapshots.get(token);savedY=descriptor.scrollY;trigger=descriptor.focusElement;document.body.classList.add('native-order-open');dialog.showModal();show(descriptor);return true;}
   return false;
  }
 };
}
