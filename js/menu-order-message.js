/* Shared restaurant WhatsApp copy. Category/item order and prices follow the menu. */
window.FD_MENU_ORDER_MESSAGE = (function () {
  'use strict';
  function build(menu, selectionFor, customer) {
    var sections=[],total=0;
    Object.keys(menu).forEach(function(category){
      var items=[];
      menu[category].forEach(function(product){
        var names=product.bbq ? ['لحم','دجاج'].map(function(type){return product.name+' — '+type;}) : [product.name];
        names.forEach(function(name){
          var selected=selectionFor(name);
          if(!selected || !Number.isSafeInteger(selected.qty) || selected.qty<1) return;
          var price=product.price*selected.qty;
          items.push(name+' × '+selected.qty+' = '+price+' ريال');
          total+=price;
          if(product.cheesePrice && Number.isSafeInteger(selected.cheeseQty) && selected.cheeseQty>0){
            var qty=Math.min(selected.qty,selected.cheeseQty),extra=product.cheesePrice*qty;
            items.push('  إضافة جبنة × '+qty+' = '+extra+' ريال');
            total+=extra;
          }
        });
      });
      if(items.length) sections.push(category+':\n'+items.join('\n'));
    });
    if(!sections.length) return '';
    var lines=['السلام عليكم، أرغب بطلب من المطعم.','','الاسم: '+customer.name.trim(),
      'الكوخ: '+customer.cabin,'رقم الكوخ: '+customer.number,'','الطلب:','',
      sections.join('\n\n'),'','إجمالي الطلب: '+total+' ريال'];
    if(customer.notes.trim()) lines.push('','ملاحظات: '+customer.notes.trim());
    return lines.join('\n');
  }
  return {build:build};
})();
