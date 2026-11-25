/* Native resort ordering uses the original order documents as persistent same-origin views.
   The original controllers own quantities, validation, totals, drafts and WhatsApp text. */
export function createResortOrders({version,services,share,toast}){
 const frames=new Map(),states={guest:{},arrangements:{}},snapshots=new Map();
 let context=null,active=null,trigger=null,savedY=0,closingToast=false;
 const icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 16V2m-5 5 5-5 5 5M6 10H3v11h18V10h-3"/></svg>';
 const badge=document.createElement('button');badge.type='button';badge.className='native-order-shortcut';badge.hidden=true;badge.setAttribute('aria-haspopup','dialog');badge.setAttribute('aria-controls','native-order-dialog');
 const dialog=document.createElement('dialog');dialog.id='native-order-dialog';dialog.className='native-order-dialog';dialog.setAttribute('aria-labelledby','native-order-title');
 dialog.innerHTML='<header class="native-order-header"><h2 id="native-order-title"></h2><button type="button" class="native-order-share" aria-label="مشاركة الخدمة">'+icon+'</button><button type="button" class="native-order-close" aria-label="إغلاق الطلب">×</button></header><nav class="native-order-tabs" aria-label="نوع الطلب" hidden></nav><div class="native-order-body"><p class="native-order-loading" role="status">جاري تحميل الطلب…</p><section class="native-order-error" hidden><p>تعذر تحميل الطلب. حاول مرة أخرى.</p><button type="button" class="native-order-retry">إعادة المحاولة</button><button type="button" class="native-order-external">فتح صفحة الطلب</button></section></div>';
 document.body.append(badge,dialog);
 const body=dialog.querySelector('.native-order-body'),tabs=dialog.querySelector('.native-order-tabs'),loading=dialog.querySelector('.native-order-loading'),error=dialog.querySelector('.native-order-error'),title=dialog.querySelector('h2'),shareButton=dialog.querySelector('.native-order-share');
 if(history.state?.fdResortOrder){const state={...history.state};delete state.fdResortOrder;history.replaceState(state,'',location.href);}
 const count=kind=>Object.values(states[kind]).reduce((n,x)=>n+x.count,0);
 function update(){
  const n=count('guest')+count('arrangements');badge.hidden=!n||context?.venue!=='resort'||['map','tour','destinations'].includes(context?.type);
  badge.textContent='طلباتي · '+n;document.body.classList.toggle('has-native-orders',!badge.hidden);
  tabs.hidden=active?.mode!=='summary'||active?.editing||!count('guest')||!count('arrangements');
  tabs.replaceChildren();
  if(!tabs.hidden)for(const [kind,label] of [['guest','الخدمات والمطعم'],['arrangements','التنسيقات والجلسات']]){
   const b=document.createElement('button');b.type='button';b.textContent=label+' · '+count(kind);b.setAttribute('aria-pressed',String(active.kind===kind));b.addEventListener('click',()=>show({...active,kind}));tabs.append(b);
  }
 }
 function fallback(kind){return kind==='guest'?'/guest-services/':'/services-guide/';}
 function frame(kind){
  if(frames.has(kind))return frames.get(kind);
  const iframe=document.createElement('iframe');iframe.className='native-order-frame';iframe.title=kind==='guest'?'طلبات خدمات المنتجع والمطعم':'طلبات التنسيقات والجلسات';iframe.allow='clipboard-write; web-share';iframe.hidden=true;
  const state={iframe,ready:false,timer:null};frames.set(kind,state);body.append(iframe);
  // Replace the child document's initial entry so opening an order adds one parent Back step.
  iframe.src=fallback(kind)+'?embed=resort-order&v='+encodeURIComponent(version);
  return state;
 }
 function command(kind,data){const item=frames.get(kind);item?.iframe.contentWindow.postMessage({type:'familyday-resort-order-command',...data},location.origin);}
 function failed(){if(!active)return;clearTimeout(frames.get(active.kind)?.timer);loading.hidden=true;error.hidden=false;frames.get(active.kind).iframe.hidden=true;}
 function sendOpen(){
  if(!active)return;const item=frames.get(active.kind);if(!item?.ready)return;
  command(active.kind,{action:'open',mode:active.mode,service:active.service,anchor:active.anchor});
 }
 function show(descriptor){
  active=descriptor;dialog.dataset.compact=descriptor.mode==='editor'?descriptor.service:'';
  title.textContent=descriptor.mode==='summary'?'ملخص طلبك':descriptor.title||'اختيار الخدمة';
  shareButton.hidden=descriptor.mode==='summary'||!descriptor.path;
  for(const [kind,item] of frames){item.iframe.hidden=true;if(kind!==descriptor.kind)command(kind,{action:'cancel'});}
  error.hidden=true;loading.hidden=false;
  error.querySelector('.native-order-external').dataset.url=fallback(descriptor.kind)+(descriptor.anchor?'#'+descriptor.anchor:'');
  const item=frame(descriptor.kind);clearTimeout(item.timer);item.timer=setTimeout(failed,25000);
  update();sendOpen();
 }
 function open(descriptor,source){
  trigger=source||document.activeElement;savedY=scrollY;
  const token=globalThis.crypto?.randomUUID?.()||String(Date.now());descriptor={...descriptor,token,scrollY:savedY,focusElement:trigger};snapshots.set(token,descriptor);if(snapshots.size>50)snapshots.delete(snapshots.keys().next().value);
  history.pushState({...history.state,fdResortOrder:token},'',location.href);
  document.body.classList.add('native-order-open');dialog.showModal();show(descriptor);
 }
 function closeUI(){
  const previous=active;active=null;
  for(const [kind,item] of frames){clearTimeout(item.timer);command(kind,{action:'cancel'});item.iframe.hidden=true;}
  dialog.close();document.body.classList.remove('native-order-open');
  window.scrollTo({top:savedY,behavior:'instant'});if(trigger?.isConnected)trigger.focus({preventScroll:true});
  if(closingToast){toast('تم تحديث طلبك');closingToast=false;}update();return previous;
 }
 function requestClose(){if(!dialog.open)return;if(history.state?.fdResortOrder===active?.token)history.back();else closeUI();}
 function openSummary(){const kind=count('guest')?'guest':'arrangements';open({kind,mode:'summary'},badge);}
 badge.addEventListener('click',openSummary);
 dialog.querySelector('.native-order-close').addEventListener('click',requestClose);
 dialog.addEventListener('cancel',e=>{e.preventDefault();requestClose();});
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)requestClose();}});
 shareButton.addEventListener('click',()=>{if(active?.sharePath||active?.path)share(active.sharePath||active.path,title.textContent);});
 error.querySelector('.native-order-external').addEventListener('click',()=>location.assign(error.querySelector('.native-order-external').dataset.url));
 error.querySelector('button').addEventListener('click',()=>{const descriptor=active,item=frames.get(descriptor.kind);clearTimeout(item.timer);item.iframe.remove();frames.delete(descriptor.kind);show(descriptor);});
 document.addEventListener('click',event=>{
  const link=event.target.closest('a[data-service-portal]');
  if(!link||context?.venue!=='resort'||event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||dialog.contains(link))return;
  const target=new URL(link.href,location.origin);if(target.origin!==location.origin&&target.origin!=='https://familydaystay.com')return;
  const kind=['/arrangements/','/services-guide/'].includes(target.pathname)?'arrangements':target.pathname==='/guest-services/'?'guest':null;if(!kind)return;
  const selected=services.find(s=>s.path===context.path),service=selected?.id==='menu'?'restaurant':selected?.id;
  if(!service)return;
  event.preventDefault();open({kind,mode:'editor',service,anchor:target.hash.slice(1)||service,title:selected.name,path:context.path+location.search.replace(/([?&])v=[^&]*(&|$)/,'$1').replace(/[?&]$/,'')},link);
 });
 window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.data?.type!=='familyday-resort-order')return;
  const {kind,action}=event.data,item=frames.get(kind);if(!item||event.source!==item.iframe.contentWindow)return;
  if(action==='focus'&&active?.kind===kind){const controls=[...dialog.querySelectorAll('.native-order-header button')].filter(e=>!e.hidden);(event.data.edge==='last'?controls.at(-1):controls[0])?.focus();}
  if(action==='ready'){item.ready=true;command(kind,{action:'state'});if(active?.kind===kind)sendOpen();}
  if(action==='state'){
   const incoming=event.data.state||{};const valid=Object.create(null);for(const [key,value] of Object.entries(incoming))if(Number.isInteger(value?.count)&&value.count>=0&&Number.isFinite(value.total)&&value.total>=0)valid[key]={count:value.count,total:value.total};
   states[kind]=valid;update();
  }
  if(action==='opened'&&active?.kind===kind){clearTimeout(item.timer);loading.hidden=true;error.hidden=true;item.iframe.hidden=false;}
  if(action==='closed'&&active?.kind===kind&&active.mode==='editor'){closingToast=event.data.committed===true;requestClose();}
  if(action==='editor'&&active?.kind===kind&&active.mode==='summary'){active.editing=!!event.data.title;active.sharePath=event.data.path||null;title.textContent=event.data.title||'ملخص طلبك';shareButton.hidden=!event.data.path;update();}
  if(action==='error'&&active?.kind===kind)failed();
  if(action==='share'&&typeof event.data.path==='string'){
   const u=new URL(event.data.path,location.origin);if(u.origin!==location.origin||!services.some(s=>s.path===u.pathname)&&u.pathname!=='/guest-services/')return;
   share(u.pathname+u.search+u.hash,document.title);
  }
 });
 function restore(){
  for(const [kind,key] of [['guest','familyday.guest-orders.v2'],['arrangements','familyday.arrangements-orders.v1']]){
   if(frames.has(kind))continue;
   try{const data=JSON.parse(sessionStorage.getItem(key)||'null');if(data&&(data.games||data.cinema||data.water||['quantities','hospitality','menu'].some(k=>Object.keys(data[k]||{}).length)))frame(kind);}catch(_){}
  }
 }
 return {
  isOpen:()=>dialog.open,
  setContext(next){context=next;if(next.venue==='resort'&&next.type!=='destinations')restore();update();},
  handlePopstate(){
   const token=history.state?.fdResortOrder;
   if(dialog.open){if(token!==active?.token)closeUI();return true;}
   if(token&&snapshots.has(token)){const descriptor=snapshots.get(token);savedY=descriptor.scrollY;trigger=descriptor.focusElement;document.body.classList.add('native-order-open');dialog.showModal();show(descriptor);return true;}
   return false;
  }
 };
}
