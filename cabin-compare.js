// Reversible comparison trial. Reads the same cabin facts as the detail pages.
var FD_CABIN_COMPARE = (function(){
  var selected = [], tray, dialog;
  function cabin(id){return data.resort.items.find(function(c){return c.id===id && c.id!==11;});}
  function request(name, detail){document.dispatchEvent(new CustomEvent(name,{detail:detail}));}
  function button(label, action){var el=document.createElement('button');el.type='button';el.textContent=label;el.addEventListener('click',action);return el;}
  function init(){
    if(tray) return;
    var app=document.getElementById('app');
    if(!app) return;
    tray=document.createElement('section');tray.className='fd-compare-tray';tray.hidden=true;
    tray.setAttribute('aria-label','الأكواخ المختارة للمقارنة');
    tray.innerHTML='<div class="fd-compare-selection"></div><div class="fd-compare-tray-actions"><p role="status"></p></div>';
    var actions=tray.lastElementChild;
    var open=button('عرض المقارنة',function(){if(selected.length===2) request('fd-compare-open',selected.slice());});
    open.className='fd-compare-open';open.disabled=true;actions.appendChild(open);
    var clear=button('مسح الاختيار',function(){selected=[];sync();});clear.className='fd-compare-clear';actions.appendChild(clear);
    app.appendChild(tray);
    dialog=document.createElement('dialog');dialog.className='fd-compare-dialog';dialog.id='fd-compare-dialog';
    dialog.setAttribute('aria-labelledby','fd-compare-title');
    dialog.innerHTML='<header><div><h2 id="fd-compare-title">مقارنة الأكواخ</h2><p>اختر الإقامة الأنسب لك</p></div></header><div class="fd-compare-scroll"></div>';
    var close=button('×',function(){request('fd-compare-dismiss');});close.className='fd-compare-close';close.setAttribute('aria-label','إغلاق المقارنة');dialog.firstElementChild.appendChild(close);
    dialog.addEventListener('cancel',function(e){e.preventDefault();request('fd-compare-dismiss');});
    dialog.addEventListener('click',function(e){if(e.target===dialog)request('fd-compare-dismiss');});
    document.body.appendChild(dialog);sync();
  }
  function sync(){
    if(!tray) return;
    tray.hidden=!selected.length;
    document.getElementById('app').classList.toggle('fd-comparing',!!selected.length);
    var names=tray.firstElementChild;names.replaceChildren();
    selected.forEach(function(id){var c=cabin(id);var b=button(c.name+' ×',function(){selected=selected.filter(function(x){return x!==id;});sync();});b.setAttribute('aria-label','إزالة '+c.name+' من المقارنة');names.appendChild(b);});
    tray.querySelector('[role="status"]').textContent=selected.length===1?'اختر كوخًا آخر للمقارنة':'تم اختيار كوخين';
    tray.querySelector('.fd-compare-open').disabled=selected.length!==2;
    document.querySelectorAll('[data-compare-cabin]').forEach(function(b){
      var id=Number(b.dataset.compareCabin), checked=selected.indexOf(id)!==-1;
      b.setAttribute('aria-pressed',String(checked));b.textContent=checked?'محدد ✓':'قارن';
      b.disabled=selected.length===2&&!checked;
      b.title=b.disabled?'أزل أحد الاختيارين لتغيير المقارنة':'';
    });
  }
  function specials(c){
    var items=c.features.indoor.concat(c.features.outdoor,c.pool.facilities).filter(function(t){return /بانيو|جاكوزي|سرير تشميس داخل/.test(t);});
    if(/جاكوزي/.test(c.pool.label))items.push('جاكوزي داخل المسبح');
    if(c.id===3||c.id===9)items.push('يمكن ربط الكلاسيكي ورويال بسعة إجمالية حتى 35 ضيفًا');
    return items.length?items.join(' · '):'—';
  }
  function show(ids){
    init();
    var items=ids.map(cabin).filter(Boolean);if(items.length!==2||items[0].id===items[1].id)return;
    var table=document.createElement('table');table.className='fd-compare-table';
    var head=table.createTHead().insertRow();var corner=document.createElement('th');corner.scope='col';corner.textContent='المواصفات';head.appendChild(corner);
    items.forEach(function(c){var th=document.createElement('th');th.scope='col';var img=document.createElement('img');img.src=GALLERY[c.id][0];img.alt='';img.width=96;img.height=96;th.appendChild(img);var name=document.createElement('strong');name.textContent=c.name;th.appendChild(name);head.appendChild(th);});
    var body=table.createTBody();
    [
      ['الضيوف',function(c){return resortGuestText(c.guests);}],
      ['غرف النوم',function(c){return resortRoomText(c.rooms);}],
      ['الأسرّة',function(c){return c.features.indoor.filter(function(t){return /^غرفة نوم/.test(t);}).join(' · ');}],
      ['الحمامات',function(c){return c.bathroom===1?'حمام واحد':c.bathroom===2?'حمامان':c.bathroom+' حمامات';}],
      ['المسبح',function(c){return c.pool.label+' وعمق '+c.pool.depthCm+' سم.';}],
      ['مميزات خاصة',specials]
    ].forEach(function(row){var tr=body.insertRow(),th=document.createElement('th');th.scope='row';th.textContent=row[0];tr.appendChild(th);items.forEach(function(c){
      var td=tr.insertCell(),text=row[1](c);
      text.split(/(\d+\s*×\s*\d+)/).forEach(function(part){
        if(/^\d+\s*×/.test(part)){var size=document.createElement('bdi');size.dir='ltr';size.textContent=part;td.appendChild(size);}
        else td.appendChild(document.createTextNode(part));
      });
    });});
    var end=body.insertRow(),label=document.createElement('th');label.scope='row';label.textContent='التفاصيل';end.appendChild(label);
    items.forEach(function(c){var td=end.insertCell();var b=button('عرض التفاصيل',function(){request('fd-compare-detail',c.id);});b.setAttribute('aria-label','عرض تفاصيل '+c.name);td.appendChild(b);});
    var scroll=dialog.lastElementChild;scroll.replaceChildren(table);scroll.scrollTop=0;
    if(!dialog.open)dialog.showModal();
    dialog.querySelector('.fd-compare-close').focus();
  }
  document.addEventListener('DOMContentLoaded',init);
  return {
    sync:sync,show:show,hide:function(){if(dialog&&dialog.open)dialog.close();},
    cardButton:function(c){return '<button type="button" class="fd-card-compare" data-compare-cabin="'+c.id+'" aria-label="مقارنة '+c.name+'" aria-pressed="'+(selected.indexOf(c.id)!==-1)+'" onclick="FD_CABIN_COMPARE.toggle(event,'+c.id+')">قارن</button>';},
    toggle:function(event,id){event.stopPropagation();if(!cabin(id))return;init();var index=selected.indexOf(id);if(index!==-1)selected.splice(index,1);else if(selected.length<2)selected.push(id);sync();}
  };
})();
