(async function(){
'use strict';
const $=id=>document.getElementById(id), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=s=>Number((String(s).match(/\d+(?:\.\d+)?/)||[])[0]);
let catalog,active=null,draft={},chosen={water:null,games:false};
const dialog=$('service-dialog');
function renderSummary(){
 const entries=[];
 if(chosen.water)entries.push({id:'water',title:'الألعاب المائية',name:catalog.water.name,qty:chosen.water.packages,price:catalog.water.price*chosen.water.packages,details:['للكبار: '+chosen.water.adults,'للصغار: '+chosen.water.children]});
 if(chosen.games)entries.push({id:'games',title:'الألعاب الترفيهية',name:catalog.games.name,price:catalog.games.price,details:[]});
 const list=$('order-items');list.replaceChildren();
 entries.forEach(item=>{
  const group=document.createElement('li');group.className='order-group';group.dataset.tone=item.id;
  const heading=document.createElement('div');heading.className='order-group-heading';
  const title=document.createElement('h4');title.textContent=item.title;
  const subtotal=document.createElement('strong');subtotal.textContent=item.price+' ريال';heading.append(title,subtotal);
  const rows=document.createElement('ul');rows.className='order-group-items';
  const row=document.createElement('li'),copy=document.createElement('div');copy.className='order-item-copy';
  const name=document.createElement('strong');name.textContent=item.name+' × '+(item.qty||1);copy.appendChild(name);
  item.details.forEach(d=>{const span=document.createElement('span');span.textContent=d;copy.appendChild(span)});
  const actions=document.createElement('div');actions.className='order-item-actions';
  const amount=document.createElement('bdi');amount.textContent=item.price+' ريال';
  const remove=document.createElement('button');remove.type='button';remove.className='remove-item';remove.textContent='حذف';remove.setAttribute('aria-label','حذف '+item.name);
  remove.onclick=()=>{if(item.id==='water')chosen.water=null;else chosen.games=false;renderSummary()};
  actions.append(amount,remove);row.append(copy,actions);rows.appendChild(row);group.append(heading,rows);list.appendChild(group);
 });
 const total=entries.reduce((n,e)=>n+e.price,0);
 $('orders-summary').hidden=!entries.length;
 $('order-count').textContent=entries.length?'عدد الاختيارات: '+entries.length:'';
 $('order-total').textContent=String(total);
 ['water','games'].forEach(id=>{
  const card=$(id+'-card'), selected=entries.find(e=>e.id===id);
  card.classList.toggle('is-selected',!!selected);
  card.querySelector('.tile-default').hidden=!!selected;
  let status=card.querySelector('.tile-selection');
  if(!status){status=document.createElement('span');status.className='tile-selection';card.querySelector('.tile-copy').appendChild(status)}
  status.hidden=!selected;
  status.textContent=selected?'✓ تمت الإضافة · '+selected.price+' ريال':'';
  card.querySelector('.tile-action').textContent=selected?'تعديل الطلب ←':'عرض التفاصيل ←';
 });
}
function open(type){
 active=type;
 draft=type==='water'?{...(chosen.water||{packages:1,adults:0,children:0})}:{games:chosen.games};
 $('service-dialog-title').textContent=type==='water'?'الألعاب المائية':'الألعاب الترفيهية';
 dialog.dataset.tone=type;
 if(type==='water'){
 $('dialog-content').innerHTML='<p class="service-offer"><strong>'+esc(catalog.water.size)+' ألعاب بـ'+esc(catalog.water.price)+' ريال للباقة</strong></p><div class="extra-row water-packages-row"><strong>عدد الباقات</strong><div class="quantity"><button type="button" data-package-step="-1">−</button><output id="water-packages" dir="ltr">1</output><button type="button" data-package-step="1">+</button></div></div><p class="section-note">وزّع الألعاب بين الكبار والصغار</p><div class="selection-rows"><div class="extra-row"><strong>للكبار</strong><div class="quantity"><button type="button" data-kind="adults" data-step="-1">−</button><output id="count-adults" dir="ltr">0</output><button type="button" data-kind="adults" data-step="1">+</button></div></div><div class="extra-row"><strong>للصغار</strong><div class="quantity"><button type="button" data-kind="children" data-step="-1">−</button><output id="count-children" dir="ltr">0</output><button type="button" data-kind="children" data-step="1">+</button></div></div></div><p id="water-limit" class="selection-status"></p><p class="usage-note">'+catalog.water.notes.map(esc).join(' — ')+'</p>';
 $('dialog-content').querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{const k=b.dataset.kind,next=draft[k]+Number(b.dataset.step),other=draft[k==='adults'?'children':'adults'];if(next>=0&&next+other<=catalog.water.size*draft.packages){draft[k]=next;update()}});
 $('dialog-content').querySelectorAll('[data-package-step]').forEach(b=>b.onclick=()=>{const next=draft.packages+Number(b.dataset.packageStep);if(next<1||next>10)return;draft.packages=next;update()});
 }else{
 // Same panel structure, radio choices, list chips and usage note as the resort.
 // Chalet excludes only the table-with-box package.
 $('dialog-content').innerHTML='<section id="games-service" class="service-panel"><fieldset class="game-options"><legend class="field-label">اختر الباقة</legend><label><input type="radio" name="games-package" value="" '+(!draft.games?'checked':'')+'><span>بدون باقة ألعاب</span></label><label><input type="radio" name="games-package" value="box" '+(draft.games?'checked':'')+'><span><span>'+esc(catalog.games.name)+'</span><small>يشمل الألعاب الموضّحة أدناه</small><strong>'+esc(catalog.games.price)+' ريال</strong></span></label></fieldset><h3 class="contents-title">الألعاب المشمولة في الباقة</h3><ul class="contents-list games-contents">'+catalog.games.contents.map(n=>'<li>'+esc(n)+'</li>').join('')+'</ul><p id="games-status" class="selection-status" role="status"></p><p class="usage-note">'+esc(catalog.games.notes.join(' '))+'</p></section>';
 $('dialog-content').querySelectorAll('[name="games-package"]').forEach(input=>input.onchange=()=>{draft.games=input.value==='box';update()});
 }
 update();dialog.showModal();
}
function update(){
 let price=0,valid=false;
 if(active==='water'){
  const total=draft.adults+draft.children,required=catalog.water.size*draft.packages;
  $('water-packages').textContent=draft.packages;
  $('dialog-content').querySelector('[data-package-step="-1"]').disabled=draft.packages===1;
  $('dialog-content').querySelector('[data-package-step="1"]').disabled=draft.packages===10;
  for(const k of ['adults','children'])$('count-'+k).textContent=draft[k];
  $('dialog-content').querySelectorAll('[data-step]').forEach(b=>{const k=b.dataset.kind;b.disabled=Number(b.dataset.step)<0?draft[k]===0:total>=required});
  price=total===required?catalog.water.price*draft.packages:0;
  valid=total===required;
  $('water-limit').textContent=valid?'اكتملت الباقات':'اخترت '+total+' من '+required;
  $('dialog-status').textContent=valid?'':'أكمل اختيار '+required+' ألعاب لإضافة الباقات.';
 }else{
  valid=draft.games;
  price=valid?catalog.games.price:0;
  $('dialog-status').textContent='';
  $('games-status').textContent=valid?'تم اختيار الباقة':'';
  $('dialog-content').querySelectorAll('[name="games-package"]').forEach(input=>input.closest('label').classList.toggle('is-selected',input.checked));
 }
 $('dialog-total').textContent=price+' ريال';
 $('apply-selection').disabled=!valid && !(active==='games'&&chosen.games);
 $('apply-selection').textContent=(active==='water'?chosen.water:chosen.games)?(valid?'حفظ التعديل':'حذف من الطلب'):'إضافة للطلب';
}
function close(){dialog.close();active=null;}
$('apply-selection').onclick=()=>{
 if(active==='water'){if(draft.adults+draft.children!==catalog.water.size*draft.packages)return;chosen.water={...draft}}
 else chosen.games=draft.games;
 renderSummary();close();
 $('orders-summary').scrollIntoView({behavior:'smooth',block:'start'});
};
document.querySelectorAll('.dialog-close,.dialog-cancel').forEach(b=>b.onclick=close);
dialog.addEventListener('click',e=>{if(e.target===dialog)close()});
$('chalet-order').onsubmit=e=>{
 e.preventDefault();if(!e.target.reportValidity())return;
 const entries=[];
 if(chosen.water)entries.push({title:'الألعاب المائية',name:catalog.water.name,qty:chosen.water.packages,price:catalog.water.price*chosen.water.packages,details:['للكبار: '+chosen.water.adults,'للصغار: '+chosen.water.children]});
 if(chosen.games)entries.push({title:'الألعاب الترفيهية',name:catalog.games.name,price:catalog.games.price,details:[]});
 if(!entries.length)return;
 const parts=['السلام عليكم، أرغب بطلب الخدمات التالية:','','الاسم: '+$('guest-name').value.trim(),'','الطلبات:'];
 entries.forEach(item=>{parts.push('',item.title+':',item.name+' × '+(item.qty||1)+' = '+item.price+' ريال',...item.details)});
 parts.push('','إجمالي الطلب: '+entries.reduce((n,e)=>n+e.price,0)+' ريال');
 if($('guest-notes').value.trim())parts.push('','ملاحظات: '+$('guest-notes').value.trim());
 window.open('https://wa.me/966556156693?text='+encodeURIComponent(parts.join('\n')),'_blank','noopener,noreferrer');
};
$('share-page').onclick=async()=>{const url='https://familydaystay.com/chalet/guest-services/';try{if(navigator.share)await navigator.share({title:document.title,url});else if(navigator.clipboard){await navigator.clipboard.writeText(url);$('share-status').textContent='تم نسخ الرابط';}}catch(_){}};
try{
 const response=await fetch('/index.html',{cache:'no-cache'});if(!response.ok)throw Error('source');const doc=new DOMParser().parseFromString(await response.text(),'text/html');
 const text=sel=>{const el=doc.querySelector(sel);if(!el)throw Error(sel);return el.textContent.trim()};
 const list=sel=>Array.from(doc.querySelectorAll(sel),el=>el.textContent.trim());
 catalog={water:{name:doc.querySelector('.wm-package')?.getAttribute('aria-label')||'الألعاب المائية',price:num(text('.wm-offer strong')),size:num(text('.wm-offer')),notes:list('.wm-notes-list li')},games:{title:text('#tg-games-title'),name:text('#tarfihi-opt-box .tg-package-name'),price:num(text('#tarfihi-opt-box .tg-package-price')),description:text('#tarfihi-opt-box .tg-package-description'),contents:list('.tg-games li'),notes:list('.tg-notes-list li')}};
 if(!catalog.water.price||!catalog.games.price||!catalog.water.size)throw Error('price');
 $('water-card').disabled=false;$('games-card').disabled=false;$('water-card').onclick=()=>open('water');$('games-card').onclick=()=>open('games');
 $('services-loading').hidden=true;
}catch(e){$('services-loading').hidden=true;$('services-error').hidden=false;}
})();