/* Standalone resort invoices. Native main-site requests and chalet ordering retain their own flows. */
(function () {
  'use strict';
  if(document.body.dataset.venue==='chalet'||parent!==window&&new URLSearchParams(location.search).get('embed')==='resort-order')return;
  const copy=window.FD_GUEST_ORDER_MESSAGE.copy;
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
    for(const name of Object.keys(api.cabins))fields.cabin.add(new Option(name,name));
    const number=customer.querySelector('.cabin-number');
    fields.cabin.addEventListener('change',()=>{number.hidden=!Object.hasOwn(api.cabins,fields.cabin.value);number.querySelector('output').textContent=number.hidden?'':String(api.cabins[fields.cabin.value]);});
    let order=null,token='',closing='',readyForPrivacy=false,sending=false;
    function node(tag,text,className){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e;}
    function quantity(item){return item.qty||1;}
    function amount(items){return items.reduce((total,item)=>total+item.price,0);}
    function itemName(item){return item.name+(item.details.some(text=>/^إضافة جبنة/.test(text))?' — مع جبنة':'');}
    function clearMarker(){if(history.state?.guestServiceRequest){const state={...history.state};delete state.guestServiceRequest;history.replaceState(state,'',location.href);}}
    function discard(){order=null;token='';list.replaceChildren();form.reset();number.hidden=true;number.querySelector('output').textContent='';sending=false;send.disabled=false;}
    function close(action){
      dialog.close();clearMarker();closing='';sending=false;send.disabled=false;
      if(action==='edit'){api.resume();return;}
      discard();api.finish();
    }
    function requestClose(action){
      if(closing)return;closing=action;
      if(history.state?.guestServiceRequest===token)history.back();else close(action);
    }
    function open(){
      const next=api.snapshot();if(!next||!copy[next.service])return;
      order=next;const text=copy[order.service];dialog.dataset.tone=order.service;dialog.querySelector('h2').textContent=text.title;dialog.querySelector('.confirmation-note').textContent=text.followup;
      fields.notes.placeholder=order.service==='restaurant'?'مثل بدون بصل أو أي تفاصيل تخص طلب المطعم':'أضف أي تفاصيل تساعدنا في تجهيز طلبك';
      list.replaceChildren();
      for(const item of order.items){
        const row=node('li'),details=node('div',undefined,'request-invoice-copy');details.append(node('strong',itemName(item)),node('span','الكمية: '+quantity(item)+' · سعر الوحدة: '+item.price/quantity(item)+' ريال'));
        for(const detail of item.details)if(!/^إضافة جبنة/.test(detail))details.append(node('span',detail));
        row.append(details,node('bdi',item.price+' ريال','request-line-total'));list.append(row);
      }
      document.getElementById('service-request-total').textContent=String(amount(order.items));
      fields.cabin.dispatchEvent(new Event('change'));
      api.pause();token=String(Date.now())+'-'+Math.random().toString(36).slice(2);history.pushState({...history.state,guestServiceRequest:token},'',location.href);dialog.showModal();dialog.querySelector('.dialog-body').scrollTop=0;dialog.querySelector('h2').focus({preventScroll:true});
    }
    function message(){return window.FD_GUEST_ORDER_MESSAGE.build(order,{name:fields.name.value,cabin:fields.cabin.value,number:api.cabins[fields.cabin.value],notes:fields.notes.value});}
    selection.addEventListener('click',event=>{
      if(!event.target.closest('#apply-selection')||document.getElementById('apply-selection').disabled)return;
      event.preventDefault();event.stopImmediatePropagation();open();
    },true);
    dialog.querySelector('.dialog-close').addEventListener('click',()=>requestClose('cancel'));
    dialog.querySelector('.request-edit').addEventListener('click',()=>requestClose('edit'));
    dialog.addEventListener('cancel',event=>{event.preventDefault();requestClose('cancel');});
    dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)requestClose('cancel');}});
    window.addEventListener('popstate',event=>{
      if(dialog.open&&event.state?.guestServiceRequest!==token){const key=location.hash.slice(1).replace(/-service$/,'');const action=closing||'cancel';close(action);event.stopImmediatePropagation();if(action==='cancel'&&copy[key])document.getElementById(key+'-card').click();}
      else if(!dialog.open){clearMarker();discard();}
    },true);
    window.addEventListener('hashchange',()=>{if(dialog.open){const key=location.hash.slice(1).replace(/-service$/,'');close('cancel');if(copy[key])document.getElementById(key+'-card').click();}else discard();});
    document.addEventListener('fd:guest-selection-closed',()=>{if(dialog.open)dialog.close();clearMarker();closing='';discard();});
    form.addEventListener('submit',event=>{
      event.preventDefault();if(!order||sending||!form.reportValidity()||!fields.name.value.trim()||!Object.hasOwn(api.cabins,fields.cabin.value))return;
      sending=true;send.disabled=true;const url='https://wa.me/'+copy[order.service].phone+'?text='+encodeURIComponent(message());window.open(url,'_blank','noopener,noreferrer');requestClose('submitted');
    });
    window.FD_ORDER_PRIVACY.register(()=>{
      if(!readyForPrivacy)return;
      if(dialog.open)close('cancel');else {discard();api.finish();}
    });readyForPrivacy=true;
    api.activate(copy);
  }
  document.addEventListener('fd:guest-requests-ready',mount);mount();
})();
