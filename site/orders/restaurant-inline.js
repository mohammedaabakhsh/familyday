/* Main-site restaurant basket. The original portal owns the shared WhatsApp message format. */
export function createRestaurantInline({menu,cabins,messageBuilder,share}){
 const identityKey='familyday.resort-direct-identity.v1',recipient='966537006531';
 const products=new Map(),controllers=new WeakMap(),selection=new Map();
 const customer={name:'',cabin:'',notes:''};
 for(const [category,items] of Object.entries(menu))for(const product of items)for(const variant of product.bbq?['لحم','دجاج']:['']){
  const key=product.name+(variant?' — '+variant:'');products.set(key,{key,category,product});
 }
 function restoreIdentity(){try{const saved=JSON.parse(sessionStorage.getItem(identityKey));if(typeof saved?.name==='string')customer.name=saved.name.slice(0,100);if(Object.hasOwn(cabins,saved?.cabin))customer.cabin=saved.cabin;}catch(_){/* Storage is optional. */}}
 restoreIdentity();
 const node=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
 const chosen=()=>[...products.values()].filter(p=>selection.has(p.key)).map(p=>({...p,...selection.get(p.key)}));
 const lineTotal=p=>(p.product.price+(p.cheese?p.product.cheesePrice:0))*p.qty;
 function saveIdentity(){try{sessionStorage.setItem(identityKey,JSON.stringify({name:customer.name,cabin:customer.cabin}));}catch(_){}}
 function bind(root){
  if(!root)return;
  restoreIdentity();
  if(controllers.has(root)){controllers.get(root).render();return;}
  const rows=[],fields={};
  const summary=node('section',undefined,'inline-restaurant-summary');summary.id='inline-restaurant-summary';summary.hidden=true;summary.setAttribute('aria-labelledby','inline-restaurant-summary-title');
  const header=node('header'),title=node('h2','ملخص طلب المطعم');title.id='inline-restaurant-summary-title';
  const shareButton=node('button','مشاركة المنيو','text-link');shareButton.type='button';shareButton.addEventListener('click',()=>share('/menu/','المطعم'));header.append(title,shareButton);summary.append(header);
  const form=node('form',undefined,'inline-restaurant-form');form.id='inline-restaurant-order';
  const count=node('p',undefined,'inline-restaurant-count');count.setAttribute('role','status');
  const list=node('div',undefined,'inline-restaurant-items');
  const total=node('div',undefined,'inline-restaurant-total'),amount=node('strong');total.append(node('span','إجمالي المطعم'),amount);
  form.append(count,list,total);
  for(const [key,label] of [['name','الاسم'],['cabin','اسم الكوخ'],['notes','ملاحظات الطلب (اختياري)']]){
   const wrap=node('label',label,'inline-restaurant-field'),input=node(key==='cabin'?'select':key==='notes'?'textarea':'input');
   input.id='inline-restaurant-'+key;input.name=key;input.required=key!=='notes';
   if(key==='name'){input.type='text';input.autocomplete='name';input.maxLength=100;}
   if(key==='notes'){input.rows=3;input.maxLength=1000;input.placeholder='مثل بدون بصل أو أي تفاصيل تخص طلب المطعم';}
   if(key==='cabin'){input.add(new Option('اختر الكوخ',''));for(const name of Object.keys(cabins))input.add(new Option(name,name));}
   input.value=customer[key];input.addEventListener(key==='cabin'?'change':'input',()=>{customer[key]=input.value;if(key!=='notes')saveIdentity();if(key==='cabin')renderCabin();});
   fields[key]=input;wrap.append(input);form.append(wrap);
   if(key==='cabin'){const number=node('p',undefined,'inline-restaurant-cabin-number');number.hidden=true;form.append(number);}
  }
  const send=node('button','إرسال الطلب','button primary wide');send.type='submit';
  const note=node('p','تابع طلبك عبر واتساب المطعم','inline-restaurant-confirmation');form.append(send,note);summary.append(form);
  const jump=node('button','', 'button outline wide inline-restaurant-jump');jump.type='button';jump.hidden=true;jump.addEventListener('click',()=>{summary.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});title.tabIndex=-1;title.focus({preventScroll:true});});
  root.querySelector('.menu-categories').before(jump);root.append(summary);root.querySelector('.restaurant-inline-status')?.remove();
  function renderCabin(){const number=form.querySelector('.inline-restaurant-cabin-number');number.hidden=!Object.hasOwn(cabins,customer.cabin);number.textContent=number.hidden?'':'رقم الكوخ: '+cabins[customer.cabin];}
  function step(key,delta){const current=selection.get(key)||{qty:0,cheese:false},qty=Math.max(0,Math.min(99,current.qty+delta));if(qty)selection.set(key,{qty,cheese:current.cheese});else selection.delete(key);render();}
  function counter(label,keyFor){
   const group=node('div',undefined,'inline-menu-quantity');group.setAttribute('role','group');group.setAttribute('aria-label','كمية '+label);
   const minus=node('button','−'),output=node('output','0'),plus=node('button','+');output.dir='ltr';output.setAttribute('aria-label','الكمية');
   for(const [button,delta,verb] of [[minus,-1,'تقليل'],[plus,1,'زيادة']]){button.type='button';button.dataset.step=delta;button.setAttribute('aria-label',verb+' كمية '+label);button.addEventListener('click',()=>{step(keyFor(),delta);if(button.disabled)group.querySelector('button:not(:disabled)')?.focus({preventScroll:true});});}
   group.append(minus,output,plus);return group;
  }
  root.querySelectorAll('.restaurant-menu-category').forEach((category,ci)=>{
   const items=Object.values(menu)[ci];
   category.querySelectorAll('.menu-row').forEach((row,pi)=>{
    const product=items[pi],base=product.name;row.dataset.menuName=base;
    const controls=node('div',undefined,'inline-menu-controls');let variant;
    if(product.bbq){const wrap=node('label','نوع البوكس','inline-menu-option');variant=node('select');variant.setAttribute('aria-label','نوع '+base);variant.add(new Option('لحم','لحم'));variant.add(new Option('دجاج','دجاج'));variant.addEventListener('change',render);wrap.append(variant);controls.append(wrap);}
    const keyFor=()=>base+(variant?' — '+variant.value:'');
    const quantity=counter(base,keyFor);controls.append(quantity);let cheese;
    if(product.cheesePrice){row.querySelector('small')?.remove();const wrap=node('label',undefined,'inline-menu-cheese');cheese=node('input');cheese.type='checkbox';cheese.addEventListener('change',()=>{const selected=selection.get(keyFor());if(selected)selected.cheese=cheese.checked;render();});wrap.append(cheese,node('span','إضافة جبنة · '+product.cheesePrice+' ريال لكل قطعة'));controls.append(wrap);}
    row.append(controls);rows.push({row,quantity,cheese,keyFor,category});
   });
  });
  function render(){
   const items=chosen(),sum=items.reduce((n,p)=>n+lineTotal(p),0);
   for(const row of rows){const item=selection.get(row.keyFor()),qty=item?.qty||0;row.quantity.querySelector('output').textContent=qty;row.quantity.querySelector('[data-step="-1"]').disabled=!qty;row.quantity.querySelector('[data-step="1"]').disabled=qty===99;row.row.classList.toggle('has-selection',!!qty);if(row.cheese){row.cheese.checked=!!item?.cheese;row.cheese.disabled=!qty;}}
   summary.hidden=jump.hidden=!items.length;send.disabled=!items.length;count.textContent='عدد الأصناف: '+items.length;amount.textContent=sum+' ريال';jump.textContent='ملخص طلب المطعم · '+sum+' ريال';
   // Preserve controls and focus for selected rows while quantities change.
   for(const row of [...list.children])if(!selection.has(row.dataset.menuKey))row.remove();
   let position=0;
   for(const item of items){
    let row=[...list.children].find(e=>e.dataset.menuKey===item.key);
    if(!row){row=node('article',undefined,'inline-restaurant-item');row.dataset.menuKey=item.key;const copy=node('div',undefined,'inline-restaurant-item-copy');copy.append(node('h3',item.key),node('p',undefined,'inline-restaurant-item-price'));const controls=counter(item.key,()=>item.key),remove=node('button','حذف','inline-restaurant-remove');remove.type='button';remove.setAttribute('aria-label','حذف '+item.key);remove.addEventListener('click',()=>{selection.delete(item.key);render();});row.append(copy,controls,remove);}
    row.querySelector('.inline-restaurant-item-price').textContent=item.qty+' × '+item.product.price+' ريال'+(item.cheese?' + إضافة جبنة: '+item.qty+' × '+item.product.cheesePrice+' ريال':'')+' = '+lineTotal(item)+' ريال';
    row.querySelector('output').textContent=item.qty;row.querySelector('[data-step="-1"]').disabled=false;row.querySelector('[data-step="1"]').disabled=item.qty===99;if(list.children[position]!==row)list.insertBefore(row,list.children[position]||null);position++;
   }
   for(const key of Object.keys(fields))if(fields[key]!==document.activeElement)fields[key].value=customer[key];renderCabin();
  }
  form.addEventListener('submit',event=>{
   event.preventDefault();if(!chosen().length||!form.reportValidity()||!customer.name.trim()||!Object.hasOwn(cabins,customer.cabin))return;
   const message=messageBuilder.build(menu,key=>{const item=selection.get(key);return item?{qty:item.qty,cheeseQty:item.cheese?item.qty:0}:null;},{name:customer.name,cabin:customer.cabin,number:cabins[customer.cabin],notes:customer.notes});
   if(message){saveIdentity();window.open('https://wa.me/'+recipient+'?text='+encodeURIComponent(message),'_blank','noopener,noreferrer');}
  });
  controllers.set(root,{render});render();
 }
 return {bind};
}
