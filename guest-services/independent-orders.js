/* Standalone resort and chalet invoices. Native requests retain their own presentation. */
(function () {
  'use strict';
  if(parent!==window&&new URLSearchParams(location.search).get('embed')==='resort-order')return;
  const isChalet=document.body.dataset.venue==='chalet',venue=isChalet?'chalet':'resort';
  const copy=window.FD_GUEST_ORDER_MESSAGE.forVenue?.(venue)||window.FD_GUEST_ORDER_MESSAGE.copy;
  let mounted=false;
  function mount(){
    const api=window.FD_GUEST_INDEPENDENT_ORDER;if(mounted||!api)return;mounted=true;
    const selection=document.getElementById('service-dialog');
    const dialog=document.createElement('dialog');dialog.id='service-request-dialog';dialog.className='service-dialog service-request-dialog';dialog.setAttribute('aria-labelledby','service-request-title');
    dialog.innerHTML='<header class="dialog-header"><div><h2 id="service-request-title" tabindex="-1"></h2></div><button type="button" class="request-edit" aria-label="تعديل الاختيار">›</button><button type="button" class="dialog-close" aria-label="إغلاق الطلب">×</button></header><div class="dialog-body"><form id="service-request-order" class="order-box"><ul class="request-invoice" aria-label="تفاصيل الطلب"></ul><div class="order-total"><span>إجمالي الطلب</span><strong><bdi id="service-request-total">0</bdi> ريال</strong></div><div class="customer-fields"></div></form></div><footer class="dialog-footer"><button type="submit" form="service-request-order" class="send-order">إرسال الطلب</button><p class="confirmation-note"></p></footer>';
    document.body.append(dialog);
    const form=dialog.querySelector('form'),list=dialog.querySelector('.request-invoice'),send=dialog.querySelector('.send-order'),customer=dialog.querySelector('.customer-fields'),fields={};
    customer.append(document.getElementById('customer-fields-template').content.cloneNode(true));
    for(const field of customer.querySelectorAll('[data-field]')){
      const name=field.dataset.field;fields[name]=field;field.id='service-request-'+name;field.removeAttribute('data-field');customer.querySelector('[data-for="'+name+'"]').htmlFor=field.id;
    }
    customer.querySelector('[data-for="notes"]').textContent='ملاحظات الطلب (اختياري)';
    if(fields.cabin)for(const name of Object.keys(api.cabins))fields.cabin.add(new Option(name+' ('+api.cabins[name]+')',name));
    let order=null,token='',closing='',readyForPrivacy=false,sending=false;
    const customers=new Map();
    function remember(){if(order)customers.set(order.service,{name:fields.name.value,cabin:fields.cabin?.value,notes:fields.notes.value});}
    function node(tag,text,className){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e;}
    function quantity(item){return item.qty||1;}
    function amount(items){return items.reduce((total,item)=>total+item.price,0);}
    function itemName(item){return item.name+(item.details.some(text=>/^إضافة جبنة/.test(text))?' — مع جبنة':'');}
    function clearMarker(){if(history.state?.guestServiceRequest){const state={...history.state};delete state.guestServiceRequest;history.replaceState(state,'',location.href);}}
    function discard(){order=null;token='';list.replaceChildren();form.reset();sending=false;send.disabled=false;}
    function close(action){
      dialog.close();clearMarker();closing='';sending=false;send.disabled=false;
      if(action==='exit')customers.clear();else if(action==='submitted')customers.delete(order?.service);else remember();
      if(action==='edit'){api.resume();return;}
      discard();api.finish({discard:action==='submitted'||action==='exit'});
      if(action==='exit')api.reset();
    }
    function requestClose(action){
      if(closing)return;closing=action;
      if(history.state?.guestServiceRequest===token)history.back();else close(action);
    }
    function renderInvoice(){
      list.replaceChildren();
      for(const item of order.items){
        const row=node('li'),details=node('div',undefined,'request-invoice-copy');details.append(node('strong',itemName(item)),node('span','الكمية: '+quantity(item)+' · سعر الوحدة: '+item.price/quantity(item)+' ريال'));
        for(const detail of item.details)if(!/^إضافة جبنة/.test(detail))details.append(node('span',detail));
        const actions=node('div',undefined,'request-invoice-actions'),remove=node('button','حذف','remove-item');remove.type='button';remove.setAttribute('aria-label','حذف '+item.name);
        remove.addEventListener('click',()=>{api.remove(item.id);order.items=order.items.filter(line=>line.id!==item.id);renderInvoice();(list.querySelector('.restore-item')||list.querySelector('.remove-item')||dialog.querySelector('.request-edit')).focus({preventScroll:true});});
        actions.append(node('bdi',item.price+' ريال','request-line-total'),remove);row.append(details,actions);list.append(row);
      }
      const removed=api.removed(order.service);
      for(const record of removed){
        const row=node('li',undefined,'request-recovery'),label=node('span',record.line.name),restore=node('button','+ إضافة من جديد','restore-item');restore.type='button';restore.dataset.restoreItem=record.line.id;restore.setAttribute('aria-label','إضافة '+record.line.name);
        restore.onclick=()=>{api.restore(record.line.id);const current=api.snapshot();order.items=current?.items||[];order.water=current?.water||null;renderInvoice();};row.append(label,restore);list.append(row);
      }
      if(!order.items.length&&!removed.length)list.append(node('li','لم تختر أي أصناف. ارجع للاختيار لإضافة طلبك.','request-empty'));
      document.getElementById('service-request-total').textContent=String(amount(order.items));send.disabled=!order.items.length;
    }
    function open(){
      const next=api.snapshot();if(!next||!copy[next.service])return;
      order=next;const text=copy[order.service];dialog.dataset.tone=order.service;dialog.querySelector('h2').textContent=text.title;dialog.querySelector('.confirmation-note').textContent=text.followup;
      fields.notes.placeholder=order.service==='restaurant'?'مثل بدون بصل أو أي تفاصيل تخص طلب المطعم':'أضف أي تفاصيل تساعدنا في تجهيز طلبك';
      const saved=customers.get(order.service)||{name:'',cabin:'',notes:''};
      for(const [key,field] of Object.entries(fields))field.value=saved[key];
      renderInvoice();
      fields.cabin?.dispatchEvent(new Event('change'));
      api.pause();token=String(Date.now())+'-'+Math.random().toString(36).slice(2);history.pushState({...history.state,guestServiceRequest:token},'',location.href);dialog.showModal();dialog.querySelector('.dialog-body').scrollTop=0;dialog.querySelector('h2').focus({preventScroll:true});
    }
    function message(){return window.FD_GUEST_ORDER_MESSAGE.build(order,{venue,name:fields.name.value,cabin:fields.cabin?.value,number:api.cabins[fields.cabin?.value],notes:fields.notes.value});}
    selection.addEventListener('click',event=>{
      if(!event.target.closest('#apply-selection')||document.getElementById('apply-selection').disabled)return;
      event.preventDefault();event.stopImmediatePropagation();open();
    },true);
    dialog.querySelector('.dialog-close').addEventListener('click',()=>requestClose('cancel'));
    dialog.querySelector('.request-edit').addEventListener('click',()=>requestClose('edit'));
    dialog.addEventListener('cancel',event=>{event.preventDefault();requestClose('cancel');});
    dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)requestClose('cancel');}});
    window.addEventListener('popstate',event=>{
      if(dialog.open&&event.state?.guestServiceRequest!==token){const key=location.hash.slice(1).replace(/-service$/,'');const action=closing||'edit';close(action);event.stopImmediatePropagation();if(action==='cancel'&&copy[key])document.getElementById(key+'-card').click();}
      else if(!dialog.open){clearMarker();discard();}
    },true);
    window.addEventListener('hashchange',()=>{if(dialog.open){const key=location.hash.slice(1).replace(/-service$/,'');close('cancel');if(copy[key])document.getElementById(key+'-card').click();}else discard();});
    document.addEventListener('fd:guest-selection-closed',()=>{remember();if(dialog.open)dialog.close();clearMarker();closing='';discard();});
    form.addEventListener('submit',event=>{
      event.preventDefault();if(!order||!order.items.length||sending||!form.reportValidity()||!fields.name.value.trim()||fields.cabin&&!Object.hasOwn(api.cabins,fields.cabin.value))return;
      sending=true;send.disabled=true;const url='https://wa.me/'+copy[order.service].phone+'?text='+encodeURIComponent(message());window.open(url,'_blank','noopener,noreferrer');requestClose('submitted');
    });
    window.FD_ORDER_PRIVACY.register(()=>{
      if(!readyForPrivacy)return;
      customers.clear();if(dialog.open)close('exit');else {discard();api.finish({discard:true});api.reset();}
    });readyForPrivacy=true;
    window.FD_ORDER_VISIT?.register(isChalet?'portal:chalet-customers':'portal:guest-customers',()=>{remember();return [...customers];},saved=>{customers.clear();for(const [key,value] of saved||[])customers.set(key,value);});
    api.activate(copy);
  }
  document.addEventListener('fd:guest-requests-ready',mount);mount();
})();
