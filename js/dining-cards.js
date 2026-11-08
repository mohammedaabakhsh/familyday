/* Shared dining price layout and source-backed copy for both surfaces. */
var FD_DINING_CARDS = (function(){
  'use strict';
  function node(tag,cls,text){
    var el=document.createElement(tag);
    if(cls) el.className=cls;
    if(text!==undefined) el.textContent=text;
    return el;
  }
  function source(doc){return doc.querySelector('#dining-card-template').content;}
  function table(doc,orderable){
    var copy=source(doc),table=node('table','fd-dining-table');
    table.setAttribute('aria-label',orderable ? 'اختر السعر حسب عدد الأشخاص والتجهيز' : 'أسعار طاولات الطعام حسب عدد الأشخاص والتجهيز');
    var head=node('thead'),heading=node('tr'),labels={};
    ['plain','tansiq'].forEach(function(option){labels[option]=copy.querySelector('[data-option="'+option+'"] .fd-dining-option-name').textContent;});
    ['الأشخاص',labels.plain,labels.tansiq].forEach(function(label){var th=node('th','',label);th.scope='col';heading.appendChild(th);});
    head.appendChild(heading);table.appendChild(head);
    var body=node('tbody');
    Object.keys(_tawilatPrices).forEach(function(size){
      var capacity=size+' '+(Number(size)<=10 ? 'أشخاص' : 'شخصًا');
      var row=node('tr','fd-dining-row');row.id='dining-card-'+size;row.dataset.size=size;
      var th=node('th');th.scope='row';th.setAttribute('aria-label',capacity);
      th.appendChild(node('span','fd-dining-capacity',size));row.appendChild(th);
      ['plain','tansiq'].forEach(function(option){
        var cell=node('td'),price=_tawilatPrices[size][option];
        var box=node(orderable ? 'button' : 'span','fd-dining-price-box'+(orderable ? ' fd-dining-option' : ''));
        box.dataset.option=option;box.dataset.size=size;
        box.appendChild(node('bdi','fd-dining-price',String(price)));
        box.appendChild(node('span','fd-dining-currency','ريال'));
        if(orderable){
          box.type='button';box.setAttribute('aria-pressed','false');
          box.dataset.selection=capacity+' · '+labels[option];
          box.setAttribute('aria-label',capacity+'، '+labels[option]+'، '+price+' ريال');
        }
        cell.appendChild(box);row.appendChild(cell);
      });
      body.appendChild(row);
    });
    table.appendChild(body);return table;
  }
  function details(doc){
    var info=source(doc).querySelector('.fd-dining-info').cloneNode(true);
    _tawilatInclusions.forEach(function(text){info.querySelector('.fd-dining-inclusions').appendChild(node('li','',text));});
    return info;
  }
  return {table:table,details:details};
})();
