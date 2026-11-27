/* The stay's single request uses one catalogue and message in both interfaces. */
(async function(){
 'use strict';
 const base='/stay/guest-services/',section=base+'slide/';
 const embedded=parent!==window&&new URLSearchParams(location.search).get('embed')==='resort-order';
 const $=selector=>document.querySelector(selector),details=$('#stay-detail-dialog'),request=$('#stay-request-dialog');
 const name=$('#stay-name'),notes=$('#stay-notes'),send=$('#send-stay');
 let service,phone,selected=false,trigger=null,initialized=false;
 function portalURL(view){const url=new URL(view==='home'?base:section,location.origin);url.search=location.search;return url.pathname+url.search;}
 const post=(action,data={})=>{if(embedded)parent.postMessage({type:'familyday-resort-order',kind:'stay',action,...data},location.origin);};
 if(embedded){document.documentElement.classList.add('resort-order-embedded');document.body.classList.add('resort-order-embedded');}
 const initialSection=location.pathname===section||location.hash==='#slide';
 $('#reload-services').onclick=()=>location.reload();
 try{
  const response=await fetch('/data/services.json?v=20261127-maintenance-v131');if(!response.ok)throw Error('catalogue');
  const source=(await response.json()).stay;service=source.slide;phone=source.phone;
  if(!(service.price>0)||!/^966\d{9}$/.test(phone)||!service.name||!service.image)throw Error('Invalid stay service');
 }catch(error){$('#services-loading').hidden=true;$('#services-error').hidden=false;post('error');return;}
 $('#services-loading').hidden=true;
 $('#slide-title').textContent=$('#stay-detail-title').textContent=service.name;
 $('#slide-intro').textContent=service.cardIntro;
 $('#slide-description').textContent=service.pageIntro||service.description;
 $('#slide-location').textContent=service.location;
 $('#slide-price').textContent=service.price+' ريال';
 $('#slide-photo').src=service.image;$('#slide-photo').alt=service.name;
 $('#request-slide').textContent=service.orderLabel;
 $('#stay-request-title').textContent='طلب '+service.name;
 $('#stay-followup').textContent=service.followup;
 const homeTitle='خدمات إقامتك | استراحة يوم العائلة';
 function metadata(view){
  if(embedded)return;
  const active=view!=='home',path=active?section:base,title=active?service.name+' | استراحة يوم العائلة':homeTitle,description=active?service.description:'كل ما تحتاجه أثناء إقامتك';
  document.title=title;$('link[rel="canonical"]').href=new URL(path,location.origin).href;
  for(const key of ['og:title','twitter:title'])document.querySelector('meta[property="'+key+'"],meta[name="'+key+'"]').content=title;
  for(const key of ['description','og:description','twitter:description'])document.querySelector('meta[property="'+key+'"],meta[name="'+key+'"]').content=description;
  $('meta[property="og:url"]').content=new URL(path,location.origin).href;
 }
 function snapshot(){return {selected,name:name.value,notes:notes.value};}
 function restore(saved){selected=saved?.selected===true;name.value=typeof saved?.name==='string'?saved.name.slice(0,100):'';notes.value=typeof saved?.notes==='string'?saved.notes.slice(0,1000):'';renderInvoice();}
 function renderInvoice(){
  const list=$('#stay-invoice');list.replaceChildren();
  {
   const row=document.createElement('li'),copy=document.createElement('div'),title=document.createElement('strong'),info=document.createElement('span'),remove=document.createElement('button');
   copy.className='request-invoice-copy';title.textContent=service.name;info.textContent='الكمية: '+(selected?1:0)+' — سعر اللعبة: '+service.price+' ريال';copy.append(title,info);
   remove.type='button';remove.className=selected?'remove-item':'restore-item';remove.textContent=selected?'حذف':'+ إضافة اللعبة';remove.setAttribute('aria-label',(selected?'حذف ':'إضافة ')+service.name);remove.onclick=()=>{selected=!selected;renderInvoice();list.querySelector('button').focus({preventScroll:true});};row.append(copy,remove);list.append(row);
  }
  $('#stay-total').textContent=String(selected?service.price:0);send.disabled=!selected;
 }
 function view(which){
  for(const d of [details,request])if(d.open)d.close();
  metadata(which);
  if(which==='details')details.showModal();
  if(which==='request'){renderInvoice();request.showModal();}
  if(which==='home'&&trigger?.isConnected)trigger.focus({preventScroll:true});
 }
 function open(which){
  if(embedded){view(which);return;}
  history.pushState({...history.state,fdStayPortal:which},'',portalURL(which));view(which);
 }
 function reset(){
  selected=false;name.value='';notes.value='';renderInvoice();
  for(const d of [details,request])if(d.open)d.close();
  if(!embedded&&initialized){history.replaceState({...history.state,fdStayPortal:'home'},'',portalURL('home'));metadata('home');}
 }
 function back(){if(embedded)post('closed');else history.back();}
 $('#slide-card').disabled=false;$('#slide-card').onclick=()=>{trigger=$('#slide-card');open('details');};
 $('#request-slide').onclick=()=>{selected=true;open('request');};
 document.querySelectorAll('[data-close-stay]').forEach(button=>button.onclick=back);
 for(const d of [details,request])d.addEventListener('cancel',event=>{event.preventDefault();back();});
 window.addEventListener('popstate',()=>{if(!embedded)view(history.state?.fdStayPortal||'home');});
 function message(){
  const lines=[service.greeting,'','الاسم: '+name.value.trim(),'المكان: استراحة يوم العائلة','القسم: '+service.location,'','الخدمة: '+service.name,'الكمية: 1','إجمالي الطلب: '+service.price+' ريال'];
  if(notes.value.trim())lines.push('','ملاحظات: '+notes.value.trim());return lines.join('\n');
 }
 $('#stay-order').addEventListener('submit',event=>{
  event.preventDefault();if(!selected||!name.value.trim()){name.setCustomValidity(name.value.trim()?'':'يرجى إدخال الاسم');name.reportValidity();return;}
  window.open('https://wa.me/'+phone+'?text='+encodeURIComponent(message()),'_blank','noopener,noreferrer');
  selected=false;name.value='';notes.value='';renderInvoice();
  if(embedded)post('submitted');else{view('home');history.go(-2);}
 });
 name.addEventListener('input',()=>name.setCustomValidity(''));
 async function share(path){
  const text=new URL(path,location.origin).href;
  try{if(navigator.share){await navigator.share({text});return;}await navigator.clipboard.writeText(text);$('#share-status').textContent='تم نسخ الرابط';$('#share-status').classList.add('visible');setTimeout(()=>$('#share-status').classList.remove('visible'),2500);}
  catch(error){if(error.name==='AbortError')return;$('#share-link').value=text;$('#share-dialog').showModal();$('#share-link').select();}
 }
 $('#share-page').onclick=()=>share(base);$('#share-slide').onclick=()=>share(section);$('#close-share').onclick=()=>$('#share-dialog').close();
 window.FD_RESORT_DIRECT_ORDER={exportDraft:snapshot,restoreDraft:restore};
 if(embedded){
  window.addEventListener('message',event=>{
   if(event.origin!==location.origin||event.source!==parent||event.data?.type!=='familyday-resort-order-command')return;
   if(event.data.action==='open'){
    if(event.data.service!=='slide'){post('error');return;}
    if(event.data.draft)restore(event.data.draft);else selected=true;
    view('request');post('opened',{title:'طلب '+service.name});
   }
   if(event.data.action==='cancel'){if(request.open)request.close();}
  });
  document.addEventListener('keydown',event=>{
   if(event.key!=='Tab'||!request.open)return;
   const controls=[...request.querySelectorAll('button:not(:disabled),input,textarea')].filter(e=>e.checkVisibility());
   if(event.shiftKey&&document.activeElement===controls[0]||!event.shiftKey&&document.activeElement===controls.at(-1)){event.preventDefault();post('focus',{edge:event.shiftKey?'last':'first'});}
  });
 }
 window.FD_ORDER_PRIVACY?.register(reset);
 window.FD_ORDER_VISIT?.register('stay:slide',snapshot,restore);
 if(!embedded){history.replaceState({...history.state,fdStayPortal:'home'},'',initialSection?portalURL('home'):location.href);if(initialSection)open('details');}
 initialized=true;
 document.body.classList.add('stay-services-ready');post('ready');
})();
