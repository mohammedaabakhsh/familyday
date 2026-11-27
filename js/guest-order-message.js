/* Approved resort service wording, shared by the main site and standalone invoices. */
(function(){
  'use strict';
  const copy={
    restaurant:{title:'طلب المطعم',orderLabel:'اطلب من المطعم',greeting:'السلام عليكم، أرغب بطلب من المطعم.',followup:'تابع طلبك مع المطعم على واتساب',phone:'966537006531'},
    hospitality:{title:'طلب الضيافة',orderLabel:'اطلب الضيافة',greeting:'السلام عليكم، أرغب بطلب ضيافة.',followup:'تابع طلب الضيافة مع خدمات المنتجع على واتساب',phone:'966556156693'},
    extras:{title:'طلب المستلزمات الإضافية',orderLabel:'اطلب هذه المستلزمات',greeting:'السلام عليكم، أرغب بطلب مستلزمات إضافية.',followup:'تابع طلب المستلزمات الإضافية مع خدمات المنتجع على واتساب',phone:'966556156693'},
    water:{title:'طلب الألعاب المائية',orderLabel:'اطلب الألعاب المائية',greeting:'السلام عليكم، أرغب بطلب ألعاب مائية.',followup:'تابع طلب الألعاب المائية مع خدمات المنتجع على واتساب',phone:'966556156693'},
    games:{title:'طلب الألعاب الترفيهية',orderLabel:'اطلب الألعاب الترفيهية',greeting:'السلام عليكم، أرغب بطلب ألعاب ترفيهية.',followup:'تابع طلب الألعاب الترفيهية مع خدمات المنتجع على واتساب',phone:'966556156693'}
  };
  function quantity(item){return item.qty||1;}
  function amount(items){return items.reduce((total,item)=>total+item.price,0);}
  function itemName(item){return item.name+((item.details||[]).some(text=>/^إضافة جبنة/.test(text))?' — مع جبنة':'');}
  function itemLine(item){return itemName(item)+' — الكمية: '+quantity(item)+' — '+item.price+' ريال';}
    function build(order,customer){
      const parts=[copy[order.service].greeting,'','الاسم: '+customer.name.trim(),'اسم الكوخ: '+customer.cabin,'رقم الكوخ: '+customer.number,''];
      const item=order.items[0];
      if(order.service==='restaurant')parts.push('الطلب:',...order.items.map(itemLine),'');
      else if(order.service==='water')parts.push('الباقة: '+item.name,'الكمية: '+quantity(item),'ألعاب للكبار: '+order.water.adults,'ألعاب للأطفال: '+order.water.children);
      else if(order.items.length===1)parts.push((order.service==='extras'?'الصنف: ':'الباقة: ')+item.name,'الكمية: '+quantity(item));
      else parts.push(order.service==='extras'?'الأصناف:':'الباقات:',...order.items.map(itemLine),'');
      parts.push('إجمالي الطلب: '+amount(order.items)+' ريال');if(customer.notes.trim())parts.push('','ملاحظات: '+customer.notes.trim());return parts.join('\n');
    }
  function restaurant(menu,selectionFor,customer){
    const items=[];
    for(const products of Object.values(menu))for(const product of products){
      const names=product.bbq?['لحم','دجاج'].map(type=>product.name+' — '+type):[product.name];
      for(const name of names){
        const selected=selectionFor(name);if(!selected||!Number.isSafeInteger(selected.qty)||selected.qty<1)continue;
        const cheese=product.cheesePrice&&selected.cheeseQty===selected.qty;
        items.push({name,qty:selected.qty,price:(product.price+(cheese?product.cheesePrice:0))*selected.qty,details:cheese?['إضافة جبنة']:[]});
      }
    }
    return items.length?build({service:'restaurant',items},customer):'';
  }
  window.FD_GUEST_ORDER_MESSAGE=Object.freeze({copy:Object.freeze(copy),build,restaurant});
})();
