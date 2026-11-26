/* Independent arrangements draft. Catalogue prices are always read afresh, never restored. */
(function () {
  'use strict';
  const params=new URLSearchParams(location.search);
  const directService=parent!==window&&params.get('embed')==='resort-order'&&['coordination','dining','seating','cinema'].includes(params.get('direct'))?params.get('direct'):'';
  const browseOrders=!(parent!==window&&params.get('embed')==='resort-order');
  const independent=!!directService||browseOrders;
  const identityKey='familyday.resort-direct-identity.v1';
  const storageKey='familyday.arrangements-orders.v1';
  const summary=document.getElementById('arrangement-summary');
  const form=document.getElementById('arrangement-order');
  const shortcut=document.getElementById('arrangement-shortcut');
  const fields={name:document.getElementById('arrangement-name'),cabin:document.getElementById('arrangement-cabin'),notes:document.getElementById('arrangement-notes')};
  const state={quantities:{},name:'',cabin:'',notes:'',cinemaTime:''};
  const entries=new Map();let cabins={},ready=false,cinemaConfig,cinemaTime,cinemaTimeField;
  let requestDialog,requestEntry,requestTrigger,requestScroll=0,requestURL='',diningChoice='',diningRequestButton,diningSelectionStatus,specificEntry;
  const groups=[['coordination','التنسيقات'],['dining','طاولات الطعام'],['seating','الجلسات الخارجية'],['extra','إضافة اختيارية'],['cinema','جلسة السينما']];
  const node=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
  const quantity=value=>Number.isInteger(value)&&value>=0&&value<=99?value:0;
  function save(){try{sessionStorage.setItem(independent?identityKey:storageKey,JSON.stringify(independent?{name:state.name,cabin:state.cabin}:state));}catch(_){/* The form also works without storage. */}}
  function restore(){try{
    const saved=JSON.parse(sessionStorage.getItem(independent?identityKey:storageKey));if(!saved||typeof saved!=='object')return;
    for(const key of (independent?['name']:['name','notes']))if(typeof saved[key]==='string')state[key]=saved[key].slice(0,key==='name'?100:1000);
    if(Object.hasOwn(cabins,saved.cabin))state.cabin=saved.cabin;
    if(independent)return;
    for(const key of entries.keys())state.quantities[key]=quantity(saved.quantities?.[key]);
  }catch(_){/* Ignore malformed or obsolete drafts. */}}
  const price=value=>{const n=Number(String(value).match(/\d+(?:\.\d+)?/)?.[0]);if(!Number.isFinite(n)||n<=0)throw Error('Invalid arrangement price');return n;};
  const lines=()=>Array.from(entries.values()).filter(e=>quantity(state.quantities[e.key])>0).map(e=>({...e,qty:state.quantities[e.key],total:e.price*state.quantities[e.key]}));
  const cinemaChosen=()=>quantity(state.quantities['cinema-session'])>0;
  const validCinemaTime=()=>!!cinemaConfig?.times.some(slot=>slot.value===state.cinemaTime);
  function cinemaTimeRange(value){
    const start=Number(value),duration=Number(cinemaConfig.duration.match(/\d+(?:\.\d+)?/)?.[0]);
    if(!duration)return 'مدة الجلسة: '+cinemaConfig.duration;
    const end=start+duration;
    function label(hour){
      const minutes=Math.round(hour*60),h=Math.floor(minutes/60)%24,m=minutes%60;
      const clock=String(h%12||12)+(m?':'+String(m).padStart(2,'0'):'');
      return clock+(h===0&&m===0?' منتصف الليل':h<12?' صباحًا':h===12?' ظهرًا':' مساءً');
    }
    return 'من '+label(start)+' إلى '+label(end)+(Math.floor(end/24)>Math.floor(start/24)?' (اليوم التالي)':'');
  }
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
    if(browseOrders && entry.group!=='extra'){
      const order=node('button',entry.group==='coordination'?'اطلب هذه الباقة عبر واتساب':'اطلب عبر واتساب','arrangement-request-button');order.type='button';order.dataset.requestKey=entry.key;order.setAttribute('aria-label','طلب '+entry.name+' عبر واتساب');wrap.append(order);
    }
    // Each service is shared once, using its header and complete public section.
    return wrap;
  }
  function add(entry,host){
    entries.set(entry.key,entry);
    if(browseOrders){
      if(entry.group==='extra')return;
      const controls=actions(entry);controls.classList.add('arrangement-browse-actions');
      host.querySelector('.seating-collapsed-content,.cinema-service-body').append(controls);return;
    }
    if(entry.group==='cinema')return;
    const controls=node('div',undefined,'arrangement-controls');controls.dataset.entry=entry.key;controls.append(counter(entry));const shareActions=actions(entry);if(shareActions.childElementCount)controls.append(shareActions);host.append(controls);
  }
  function jump(){summary.focus({preventScroll:true});window.scrollTo({top:Math.max(0,scrollY+summary.getBoundingClientRect().top-18),behavior:'instant'});updateShortcut();}
  function updateShortcut(){if(browseOrders){shortcut.hidden=true;return;}const rect=summary.getBoundingClientRect();shortcut.hidden=document.getElementById('arrangement-dialog').open||summary.hidden||(rect.top<innerHeight-40&&rect.bottom>80);}
  function limitDining(){
    let kept=false;
    for(const entry of entries.values()){
      if(entry.group!=='dining')continue;
      const selected=!kept&&quantity(state.quantities[entry.key])>0;
      state.quantities[entry.key]=selected?1:0;
      if(selected)kept=true;
    }
  }
  function render(){
    limitDining();
    const chosen=lines(),total=chosen.reduce((sum,e)=>sum+e.total,0),count=chosen.reduce((sum,e)=>sum+e.qty,0);
    summary.hidden=browseOrders||!chosen.length;
    document.getElementById('arrangement-total').textContent=total;
    document.getElementById('arrangement-count').textContent=count+' من التجهيزات المختارة';
    shortcut.textContent='ملخص الطلب · '+count+' · '+total+' ريال';
    document.getElementById('arrangement-dialog-status').textContent=count?'إجمالي الطلب: '+total+' ريال':'اختر الكمية بالموجب والسالب';
    const list=document.getElementById('arrangement-items');list.replaceChildren();
    for(const [group,title] of groups){
      const items=chosen.filter(e=>e.group===group);if(!items.length)continue;
      const section=node('li',undefined,'arrangement-group');section.dataset.tone=group;
      section.append(node('h3',title));
      const rows=node('ul');section.append(rows);
      for(const entry of items){
        const row=node('li');const copy=node('div',undefined,'arrangement-item-copy');copy.append(node('strong',entry.name),node('span',entry.qty+' × '+entry.price+' = '+entry.total+' ريال'));
        if(entry.detail)copy.append(node('span',entry.detail));
        const remove=node('button','حذف','arrangement-remove');remove.type='button';remove.dataset.remove=entry.key;remove.setAttribute('aria-label','حذف '+entry.name);
        row.append(copy);if(entry.group!=='dining')row.append(counter(entry));row.append(remove);rows.append(row);
      }list.append(section);
    }
    const missingSeat=!!state.quantities['seating-extra']&&!seatsChosen();
    const warning=document.getElementById('arrangement-warning');warning.hidden=!missingSeat;warning.textContent=missingSeat?'اختر جلسة خارجية لإضافة الكيك والعصير، أو احذف الإضافة.':'';
    form.querySelector('[type="submit"]').disabled=!chosen.length||missingSeat||(cinemaChosen()&&!validCinemaTime());
    for(const key of entries.keys()){
      const entry=entries.get(key),qty=quantity(state.quantities[key]);
      document.querySelectorAll('[data-quantity="'+key+'"]').forEach(group=>{
        group.querySelector('output').textContent=qty;
        group.querySelector('[data-step="-1"]').disabled=!qty;
        group.querySelector('[data-step="1"]').disabled=qty===99||(entry.group==='extra'&&!seatsChosen());
      });
      const card=document.getElementById(entry.card);if(card)card.classList.toggle('has-selection',!browseOrders&&qty>0);
      if(entry.size){const button=document.querySelector('.fd-dining-option[data-size="'+entry.size+'"][data-option="'+entry.option+'"]'),selected=browseOrders?entry.key===diningChoice:qty>0;button.classList.toggle('is-selected',selected);button.setAttribute('aria-pressed',String(selected));}
    }
    if(diningRequestButton){
      const selected=entries.get(diningChoice);diningRequestButton.disabled=!selected;
      diningSelectionStatus.textContent=selected?selected.name+' — '+selected.price+' ريال':'اختر عدد الأشخاص ونوع التجهيز';
    }
    for(const group of ['coordination','dining','seating','cinema']){
      const tile=document.querySelector('.contents a[href="#'+group+'"]');const selected=chosen.filter(e=>e.group===group);tile.classList.toggle('is-selected',!browseOrders&&!!selected.length);
    }
    document.getElementById('arrangement-cabin-number').hidden=!state.cabin;
    document.getElementById('arrangement-cabin-number').textContent=state.cabin?'رقم الكوخ: '+cabins[state.cabin]:'';
    if(cinemaTimeField){
      const selectingCinema=browseOrders?requestEntry?.group==='cinema':directService==='cinema';
      cinemaTimeField.hidden=!selectingCinema;cinemaTime.required=selectingCinema;
      cinemaTimeField.querySelector('small').textContent=state.cinemaTime?cinemaTimeRange(state.cinemaTime):'مدة الجلسة: '+cinemaConfig.duration;
      form.querySelector('.arrangement-confirmation').textContent=selectingCinema?'تابع طلبك مع فريق خدمات المنتجع عبر واتساب لتأكيد الموعد.':'تابع طلبك مع منسّق المناسبات عبر واتساب لتأكيد التفاصيل والموعد.';
    }
    if(browseOrders&&requestEntry){
      requestDialog.querySelector('.request-total-label').textContent='إجمالي الخدمة';
      requestDialog.querySelector('[data-request-extra]').checked=!!state.quantities['seating-extra'];
    }
    save();updateShortcut();
  }
  function closeRequestUI(){
    requestDialog.close();state.quantities={};state.notes='';state.cinemaTime='';if(cinemaTime)cinemaTime.value='';fields.notes.value='';requestEntry=null;render();
    document.body.classList.remove('arrangement-request-open');window.scrollTo({top:requestScroll,behavior:'instant'});if(requestTrigger?.isConnected)requestTrigger.focus({preventScroll:true});
  }
  function closeRequest(){
    if(!requestDialog.open)return;
    if(history.state?.arrangementRequest)history.back();else closeRequestUI();
  }
  function openRequest(entry,trigger){
    requestEntry=entry;requestTrigger=trigger;requestScroll=scrollY;requestURL=location.href;
    state.quantities={[entry.key]:1};state.notes='';state.cinemaTime='';if(cinemaTime)cinemaTime.value='';fields.notes.value='';
    document.getElementById('arrangement-request-title').textContent='طلب '+entry.name;
    const amount=requestDialog.querySelector('.arrangement-request-quantity');amount.replaceChildren();
    if(!['dining','cinema'].includes(entry.group)){amount.append(node('span','الكمية'),counter(entry));}
    amount.hidden=['dining','cinema'].includes(entry.group);
    const extra=requestDialog.querySelector('.arrangement-request-extra');extra.hidden=entry.group!=='seating';
    const addon=entries.get('seating-extra');extra.querySelector('span').textContent=addon?addon.name+' — '+addon.price+' ريال':'';
    render();history.pushState({...history.state,arrangementRequest:true},'',location.href);
    document.body.classList.add('arrangement-request-open');requestDialog.showModal();requestDialog.querySelector('.arrangement-request-body').scrollTop=0;
  }
  function setupBrowseRequest(){
    requestDialog=node('dialog',undefined,'arrangement-request');requestDialog.setAttribute('aria-labelledby','arrangement-request-title');
    requestDialog.innerHTML='<header><h2 id="arrangement-request-title" tabindex="-1"></h2><button type="button" data-close-request aria-label="إغلاق الطلب">×</button></header><div class="arrangement-request-body"><div class="arrangement-request-quantity"></div><label class="arrangement-request-extra" hidden><input type="checkbox" data-request-extra><span></span></label></div>';
    document.body.append(requestDialog);requestDialog.querySelector('.arrangement-request-body').append(form);
    form.setAttribute('aria-label','بيانات الطلب');form.querySelector('.arrangement-send').textContent='إرسال الطلب';
    form.querySelector('.arrangement-total>span').classList.add('request-total-label');
    requestDialog.querySelector('[data-close-request]').addEventListener('click',closeRequest);requestDialog.addEventListener('cancel',e=>{e.preventDefault();closeRequest();});
    requestDialog.addEventListener('click',e=>{if(e.target===requestDialog){const r=requestDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeRequest();}});
    requestDialog.querySelector('[data-request-extra]').addEventListener('change',e=>{state.quantities['seating-extra']=e.target.checked?1:0;render();});
    if(history.state?.arrangementRequest){const next={...history.state};delete next.arrangementRequest;history.replaceState(next,'',location.href);}
    window.addEventListener('popstate',e=>{
      if(requestDialog.open){const samePage=location.href===requestURL;closeRequestUI();if(samePage)e.stopImmediatePropagation();}
      else if(history.state?.arrangementRequest){const next={...history.state};delete next.arrangementRequest;history.replaceState(next,'',location.href);}
    },true);
  }
  if(browseOrders)setupBrowseRequest();
  document.addEventListener('fd:guide-ready',event=>{
    if(ready)return;const catalog=event.detail,data=catalog.arrangements;cabins=catalog.guest.cabins;cinemaConfig=catalog.guest.cinema;
    data.coordination.packages.forEach(pack=>{
      const suffix=pack.id.replace('hd-coordination-package-',''),card=suffix==='resort'?'package-complete':'package-'+suffix;
      add({key:card,card,group:'coordination',name:pack.name,price:price(pack.price),path:pack.path},document.getElementById(card));
    });
    for(const [size,prices] of Object.entries(data.dining.prices))for(const option of ['plain','tansiq'])entries.set('dining-'+size+'-'+option,{key:'dining-'+size+'-'+option,group:'dining',name:'طاولة طعام لـ'+size+' '+(Number(size)<=10?'أشخاص':'شخصًا')+' — '+(option==='plain'?'تجهيز أساسي':'تجهيز مع تنسيق'),price:prices[option],size,option,path:data.dining.path});
    if(browseOrders){
      const diningActions=node('div',undefined,'dining-order-actions');
      diningSelectionStatus=node('p','اختر عدد الأشخاص ونوع التجهيز','dining-selection-status');diningSelectionStatus.setAttribute('role','status');diningSelectionStatus.setAttribute('aria-live','polite');
      diningRequestButton=node('button','اطلب عبر واتساب','arrangement-request-button');diningRequestButton.type='button';diningRequestButton.dataset.diningRequest='';diningRequestButton.disabled=true;
      diningActions.append(diningSelectionStatus,diningRequestButton);document.querySelector('#dining .fd-dining-table').after(diningActions);
    }
    data.seating.sessions.forEach((session,i)=>{const card='session-'+(i+1);add({key:card,card,group:'seating',name:session.name,capacity:session.persons,price:price(session.price),path:data.seating.path+'?session='+(i+1)},document.getElementById(card));});
    add({key:'seating-extra',group:'extra',name:data.seating.extra.name,price:price(data.seating.extra.price),path:data.seating.path},document.querySelector('.seating-extra'));
    add({key:'cinema-session',card:'cinema-session',group:'cinema',name:cinemaConfig.name,price:cinemaConfig.price,path:'/services/cinema/'},document.getElementById('cinema-session'));
    cinemaTimeField=node('label',undefined,'arrangement-cinema-time');cinemaTimeField.append(node('span','وقت بداية الجلسة'));
    cinemaTime=node('select');cinemaTime.id='cinema-time';cinemaTime.setAttribute('form','arrangement-order');cinemaTime.add(new Option('اختر وقت بداية الجلسة',''));
    cinemaConfig.times.forEach(slot=>cinemaTime.add(new Option(slot.label,slot.value)));const timeStatus=node('small','مدة الجلسة: '+cinemaConfig.duration);timeStatus.id='cinema-status';timeStatus.setAttribute('role','status');cinemaTimeField.append(cinemaTime,timeStatus);
    (browseOrders?requestDialog.querySelector('.arrangement-request-body'):document.getElementById('cinema')).prepend(cinemaTimeField);
    cinemaTime.addEventListener('change',()=>{state.cinemaTime=cinemaTime.value;render();});
    if(directService==='cinema')state.quantities['cinema-session']=1;
    for(const name of Object.keys(cabins))fields.cabin.add(new Option(name,name));
    restore();for(const key of Object.keys(fields))fields[key].value=state[key];ready=true;render();
  });
  document.addEventListener('click',event=>{
    if(!ready)return;
    const request=event.target.closest('[data-request-key]');if(browseOrders&&request){openRequest(entries.get(request.dataset.requestKey),request);return;}
    const diningRequest=event.target.closest('[data-dining-request]');if(browseOrders&&diningRequest){const entry=entries.get(diningChoice);if(entry)openRequest(entry,diningRequest);return;}
    const step=event.target.closest('[data-order-key]'),remove=event.target.closest('[data-remove]'),dining=event.target.closest('.fd-dining-option');
    if(step){const entry=entries.get(step.dataset.orderKey);if(!entry||step.disabled)return;state.quantities[entry.key]=Math.max(0,Math.min(99,quantity(state.quantities[entry.key])+Number(step.dataset.step)));render();}
    else if(remove){const key=remove.dataset.remove;state.quantities[key]=0;render();const next=summary.querySelector('[data-remove]');if(next)next.focus();else(document.getElementById(entries.get(key).card)||document.querySelector('.contents a')).focus();}
    else if(dining){
      const key='dining-'+dining.dataset.size+'-'+dining.dataset.option,next=state.quantities[key]?0:1;
      if(browseOrders){diningChoice=key;render();return;}
      for(const entry of entries.values())if(entry.group==='dining')state.quantities[entry.key]=0;
      state.quantities[key]=next;render();
    }

  });
  for(const [key,field] of Object.entries(fields))field.addEventListener(key==='cabin'?'change':'input',()=>{state[key]=field.value;save();if(key==='cabin')render();});
  function submitOrder(event){
    event.preventDefault();const chosen=lines();if(!ready||!chosen.length||(cinemaChosen()&&!validCinemaTime())||(cinemaChosen()&&chosen.some(entry=>entry.group!=='cinema'))||!form.reportValidity()||!state.name.trim()||!Object.hasOwn(cabins,state.cabin)||state.quantities['seating-extra']&&!seatsChosen())return;
    const requestedGroups=[...new Set(chosen.filter(entry=>entry.group!=='extra').map(entry=>entry.group))];
    const requestLabel=requestedGroups.length===1?({coordination:'تنسيق',dining:'تجهيز طاولة طعام',seating:'جلسة خارجية',cinema:'جلسة سينما'}[requestedGroups[0]]||'الخدمات التالية'):'الخدمات التالية';
    const parts=['السلام عليكم، أرغب بطلب '+requestLabel+':','','الاسم: '+state.name.trim(),'اسم الكوخ: '+state.cabin,'رقم الكوخ: '+cabins[state.cabin],'','الطلبات:'];
    for(const [group,title] of groups){
      const items=chosen.filter(entry=>entry.group===group);if(!items.length)continue;
      parts.push('',title+':');
      for(const entry of items){
        // Capacity belongs beside the session name, never on a separate message line.
        const name=entry.group==='seating'?entry.name.replace(/\s+لـ?\s*\d+\s+(?:أشخاص|شخصًا|شخصاً)\s*$/u,'')+' — '+(entry.capacity.startsWith('ل')?entry.capacity:'لـ'+entry.capacity):entry.name;
        parts.push(name+' × '+entry.qty+' = '+entry.total+' ريال');
        if(entry.group==='cinema')parts.push('مدة الجلسة: '+cinemaConfig.duration,'وقت بداية الجلسة: '+cinemaConfig.times.find(slot=>slot.value===state.cinemaTime).label);
      }
    }
    parts.push('','إجمالي الطلب: '+chosen.reduce((sum,e)=>sum+e.total,0)+' ريال');if(state.notes.trim())parts.push('','ملاحظات: '+state.notes.trim());save();
    // Open a text draft only; the guest reviews and sends it from WhatsApp.
    window.open('https://wa.me/'+(cinemaChosen()?'966556156693':'966537009217')+'?text='+encodeURIComponent(parts.join('\n')),'_blank','noopener,noreferrer');
    return true;
  }
  form.addEventListener('submit',event=>{if(submitOrder(event)===true&&browseOrders)closeRequest();});
  function selectEntry(key){
    const entry=entries.get(key);if(!ready||!entry||entry.group!==directService||!['coordination','dining'].includes(entry.group))return false;
    specificEntry=entry;state.quantities={[key]:1};state.notes='';fields.notes.value='';
    document.body.classList.add('resort-specific-request');
    let selected=document.querySelector('.resort-entry-selection');
    if(!selected){selected=node('section',undefined,'resort-entry-selection');selected.setAttribute('aria-label','الخدمة المختارة');form.before(selected);}
    selected.replaceChildren();selected.hidden=entry.group!=='coordination';
    if(entry.group==='coordination')selected.append(node('span','الكمية'),counter(entry));
    render();return true;
  }
  if(directService)window.FD_RESORT_DIRECT_ORDER={formId:'arrangement-order',canSubmit:()=>ready&&!form.querySelector('.arrangement-send').disabled,submit:submitOrder,selectEntry,getTitle:()=>specificEntry?'طلب '+specificEntry.name:directService==='cinema'?'طلب '+cinemaConfig.name:''};
  document.addEventListener('fd:arrangement-view',updateShortcut);shortcut.addEventListener('click',jump);new IntersectionObserver(updateShortcut,{rootMargin:'-80px 0px -40px'}).observe(summary);window.addEventListener('resize',updateShortcut);
})();
