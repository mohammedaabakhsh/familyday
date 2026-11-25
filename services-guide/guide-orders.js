/* Independent arrangements draft. Catalogue prices are always read afresh, never restored. */
(function () {
  'use strict';
  const storageKey='familyday.arrangements-orders.v1';
  const summary=document.getElementById('arrangement-summary');
  const form=document.getElementById('arrangement-order');
  const shortcut=document.getElementById('arrangement-shortcut');
  const fields={name:document.getElementById('arrangement-name'),cabin:document.getElementById('arrangement-cabin'),notes:document.getElementById('arrangement-notes')};
  const state={quantities:{},name:'',cabin:'',notes:''};
  const entries=new Map();let cabins={},ready=false;
  const node=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
  const quantity=value=>Number.isInteger(value)&&value>=0&&value<=99?value:0;
  function save(){try{sessionStorage.setItem(storageKey,JSON.stringify(state));}catch(_){/* The form also works without storage. */}}
  function restore(){try{
    const saved=JSON.parse(sessionStorage.getItem(storageKey));if(!saved||typeof saved!=='object')return;
    for(const key of ['name','notes'])if(typeof saved[key]==='string')state[key]=saved[key].slice(0,key==='name'?100:1000);
    if(Object.hasOwn(cabins,saved.cabin))state.cabin=saved.cabin;
    for(const key of entries.keys())state.quantities[key]=quantity(saved.quantities?.[key]);
  }catch(_){/* Ignore malformed or obsolete drafts. */}}
  const price=value=>{const n=Number(String(value).match(/\d+(?:\.\d+)?/)?.[0]);if(!Number.isFinite(n)||n<=0)throw Error('Invalid arrangement price');return n;};
  const lines=()=>Array.from(entries.values()).filter(e=>quantity(state.quantities[e.key])>0).map(e=>({...e,qty:state.quantities[e.key],total:e.price*state.quantities[e.key]}));
  const seatsChosen=()=>Array.from(entries.values()).some(e=>e.group==='seating'&&quantity(state.quantities[e.key])>0);
  function counter(entry){
    const group=node('div',undefined,'arrangement-quantity');group.setAttribute('role','group');group.setAttribute('aria-label','عدد '+entry.name);group.dataset.quantity=entry.key;
    for(const [step,label] of [[-1,'تقليل'],[0,''],[1,'زيادة']]){
      const e=node(step?'button':'output',step?(step===1?'+':'−'):'0');
      if(step){e.type='button';e.dataset.orderKey=entry.key;e.dataset.step=step;e.setAttribute('aria-label',label+' '+entry.name);}
      else {e.setAttribute('aria-label','الكمية');e.dir='ltr';}
      group.append(e);
    }return group;
  }
  function actions(entry){
    const wrap=node('div',undefined,'arrangement-actions');
    const order=node('button',undefined,'arrangement-request');order.innerHTML='<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 11.5a9 9 0 0 1-13.4 7.8L3 21l1.5-4.5A9 9 0 1 1 21 11.5Z"/><path d="m9 7-1 2q1 4 5 5l2-1-2-2-1 1-2-2 1-1Z"/></svg><span>الطلب عبر واتساب</span>';order.type='button';order.dataset.orderNow=entry.key;order.setAttribute('aria-controls','arrangement-summary');
    const share=node('button',undefined,'arrangement-share');share.type='button';share.dataset.sharePath=entry.path;share.setAttribute('aria-label','مشاركة '+entry.name);
    // Icon and text stay inside their own button, never inside an accordion summary.
    share.innerHTML='<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 16V2m-5 5 5-5 5 5M6 10H3v11h18V10h-3"/></svg><span>مشاركة</span>';
    wrap.append(order,share);return wrap;
  }
  function add(entry,host){
    entries.set(entry.key,entry);
    const controls=node('div',undefined,'arrangement-controls');controls.dataset.entry=entry.key;controls.append(counter(entry),actions(entry));host.append(controls);
  }
  function jump(){summary.focus({preventScroll:true});window.scrollTo({top:Math.max(0,scrollY+summary.getBoundingClientRect().top-18),behavior:'instant'});updateShortcut();}
  function updateShortcut(){const rect=summary.getBoundingClientRect();shortcut.hidden=summary.hidden||(rect.top<innerHeight-40&&rect.bottom>80);}
  function render(){
    const chosen=lines(),total=chosen.reduce((sum,e)=>sum+e.total,0),count=chosen.reduce((sum,e)=>sum+e.qty,0);
    summary.hidden=!chosen.length;
    document.getElementById('arrangement-total').textContent=total;
    document.getElementById('arrangement-count').textContent=count+' من التجهيزات المختارة';
    shortcut.textContent='ملخص الطلب · '+count+' · '+total+' ريال';
    const list=document.getElementById('arrangement-items');list.replaceChildren();
    for(const group of ['coordination','dining','seating','extra']){
      const items=chosen.filter(e=>e.group===group);if(!items.length)continue;
      const section=node('li',undefined,'arrangement-group');section.dataset.tone=group;
      section.append(node('h3',({coordination:'التنسيقات',dining:'طاولات الطعام',seating:'الجلسات الخارجية',extra:'إضافة اختيارية'})[group]));
      const rows=node('ul');section.append(rows);
      for(const entry of items){
        const row=node('li');const copy=node('div',undefined,'arrangement-item-copy');copy.append(node('strong',entry.name),node('span',entry.qty+' × '+entry.price+' = '+entry.total+' ريال'));
        if(entry.detail)copy.append(node('span',entry.detail));
        const remove=node('button','حذف','arrangement-remove');remove.type='button';remove.dataset.remove=entry.key;remove.setAttribute('aria-label','حذف '+entry.name);
        row.append(copy,counter(entry),remove);rows.append(row);
      }list.append(section);
    }
    const missingSeat=!!state.quantities['seating-extra']&&!seatsChosen();
    const warning=document.getElementById('arrangement-warning');warning.hidden=!missingSeat;warning.textContent=missingSeat?'اختر جلسة خارجية لإضافة الكيك والعصير، أو احذف الإضافة.':'';
    form.querySelector('[type="submit"]').disabled=!chosen.length||missingSeat;
    for(const key of entries.keys()){
      const entry=entries.get(key),qty=quantity(state.quantities[key]);
      document.querySelectorAll('[data-quantity="'+key+'"]').forEach(group=>{
        group.querySelector('output').textContent=qty;
        group.querySelector('[data-step="-1"]').disabled=!qty;
        group.querySelector('[data-step="1"]').disabled=qty===99||(entry.group==='extra'&&!seatsChosen());
      });
      const card=document.getElementById(entry.card);if(card)card.classList.toggle('has-selection',qty>0);
      if(entry.size){const button=document.querySelector('.fd-dining-option[data-size="'+entry.size+'"][data-option="'+entry.option+'"]');button.classList.toggle('is-selected',qty>0);button.setAttribute('aria-pressed',String(qty>0));}
    }
    for(const group of ['coordination','dining','seating']){
      const tile=document.querySelector('.contents a[href="#'+group+'"]');const selected=chosen.filter(e=>e.group===group);tile.classList.toggle('is-selected',!!selected.length);
    }
    document.getElementById('arrangement-cabin-number').hidden=!state.cabin;
    document.getElementById('arrangement-cabin-number').textContent=state.cabin?'رقم الكوخ: '+cabins[state.cabin]:'';
    save();updateShortcut();
  }
  document.addEventListener('fd:guide-ready',event=>{
    if(ready)return;const catalog=event.detail,data=catalog.arrangements;cabins=catalog.guest.cabins;
    data.coordination.packages.forEach(pack=>{
      const suffix=pack.id.replace('hd-coordination-package-',''),card=suffix==='resort'?'package-complete':'package-'+suffix;
      add({key:card,card,group:'coordination',name:pack.name,price:price(pack.price),path:pack.path},document.querySelector('#'+card+' .seating-collapsed-content'));
    });
    for(const [size,prices] of Object.entries(data.dining.prices))for(const option of ['plain','tansiq'])entries.set('dining-'+size+'-'+option,{key:'dining-'+size+'-'+option,group:'dining',name:'طاولة طعام لـ'+size+' '+(Number(size)<=10?'أشخاص':'شخصًا')+' — '+(option==='plain'?'تجهيز أساسي':'تجهيز مع تنسيق'),price:prices[option],size,option,path:data.dining.path});
    const diningActions=node('div',undefined,'dining-order-actions');const diningShare=node('button','مشاركة طاولات الطعام','arrangement-share');diningShare.type='button';diningShare.dataset.sharePath=data.dining.path;diningActions.append(diningShare);document.getElementById('dining').append(diningActions);
    data.seating.sessions.forEach((session,i)=>{const card='session-'+(i+1);add({key:card,card,group:'seating',name:session.name,detail:session.persons,price:price(session.price),path:data.seating.path+'?session='+(i+1)},document.querySelector('#'+card+' .seating-collapsed-content'));});
    add({key:'seating-extra',group:'extra',name:data.seating.extra.name,price:price(data.seating.extra.price),path:data.seating.path},document.querySelector('.seating-extra'));
    for(const name of Object.keys(cabins))fields.cabin.add(new Option(name,name));
    restore();for(const key of Object.keys(fields))fields[key].value=state[key];ready=true;render();
  });
  document.addEventListener('click',event=>{
    if(!ready)return;
    const step=event.target.closest('[data-order-key]'),remove=event.target.closest('[data-remove]'),now=event.target.closest('[data-order-now]'),dining=event.target.closest('.fd-dining-option');
    if(step){const entry=entries.get(step.dataset.orderKey);if(!entry||step.disabled)return;state.quantities[entry.key]=Math.max(0,Math.min(99,quantity(state.quantities[entry.key])+Number(step.dataset.step)));render();}
    else if(remove){const key=remove.dataset.remove;state.quantities[key]=0;render();const next=summary.querySelector('[data-remove]');if(next)next.focus();else(document.getElementById(entries.get(key).card)||document.querySelector('.contents a')).focus();}
    else if(dining){const key='dining-'+dining.dataset.size+'-'+dining.dataset.option;state.quantities[key]=state.quantities[key]?0:1;render();}
    else if(now){const entry=entries.get(now.dataset.orderNow);if(entry.group==='extra'&&!seatsChosen())return;state.quantities[entry.key]=state.quantities[entry.key]||1;render();jump();fields.name.focus({preventScroll:true});}
  });
  for(const [key,field] of Object.entries(fields))field.addEventListener(key==='cabin'?'change':'input',()=>{state[key]=field.value;save();if(key==='cabin')render();});
  form.addEventListener('submit',event=>{
    event.preventDefault();const chosen=lines();if(!ready||!chosen.length||!form.reportValidity()||!state.name.trim()||!Object.hasOwn(cabins,state.cabin)||state.quantities['seating-extra']&&!seatsChosen())return;
    const parts=['السلام عليكم، أرغب بطلب التنسيقات والتجهيزات التالية:','','الاسم: '+state.name.trim(),'اسم الكوخ: '+state.cabin,'رقم الكوخ: '+cabins[state.cabin],'','الطلبات:'];
    for(const entry of chosen){parts.push(entry.name+' × '+entry.qty+' = '+entry.total+' ريال');if(entry.detail)parts.push(entry.detail);}
    parts.push('','إجمالي الطلب: '+chosen.reduce((sum,e)=>sum+e.total,0)+' ريال');if(state.notes.trim())parts.push('','ملاحظات: '+state.notes.trim());save();
    // Open a text draft only; the guest reviews and sends it from WhatsApp.
    window.open('https://wa.me/966537009217?text='+encodeURIComponent(parts.join('\n')),'_blank','noopener,noreferrer');
  });
  shortcut.addEventListener('click',jump);new IntersectionObserver(updateShortcut,{rootMargin:'-80px 0px -40px'}).observe(summary);window.addEventListener('resize',updateShortcut);
})();
