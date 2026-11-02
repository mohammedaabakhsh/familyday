/* In-stay ordering: one resort basket and a separate restaurant order.
   Menu prices use service-data.js; extra prices use their visible HTML rows.
   Only selections and guest-entered fields are saved, never trusted prices. */
(function () {
  'use strict';
  var storageKey = 'familyday.guest-orders.v2';
  var cabins = window.FD_CABIN_NUMBERS;
  var state = {name:'', cabin:'', notes:'', restaurantNotes:'', quantities:{}, water:null, cinema:'', games:'', menu:{}};
  var water = {adults:0, children:0};
  var menuCatalog = Object.create(null), menuRows = [];
  var form = document.getElementById('extras-order');
  var restaurantForm = document.getElementById('restaurant-order');
  var time = document.getElementById('cinema-time');
  var extras = Array.from(document.querySelectorAll('[data-extra]')).map(function (row) {
    return {id:row.dataset.extra, name:row.querySelector('h3').textContent,
      price:Number(row.querySelector('.extra-price bdi').textContent), row:row};
  });
  function el(tag, text, className) {
    var node=document.createElement(tag);
    if (text !== undefined) node.textContent=text;
    if (className) node.className=className;
    return node;
  }
  function quantity(value) { return Number.isInteger(value) && value>=0 && value<=99 ? value : 0; }
  function validWater(value) {
    return value && Number.isInteger(value.adults) && Number.isInteger(value.children) &&
      value.adults>=0 && value.children>=0 && value.adults+value.children===3;
  }
  function validTime(value) { return Array.from(time.options).some(function(option){return option.value===value && !!value;}); }
  function save() {
    try { sessionStorage.setItem(storageKey,JSON.stringify(state)); }
    catch (_) { /* Ordering also works without browser storage. */ }
  }
  function restore() {
    try {
      var saved=JSON.parse(sessionStorage.getItem(storageKey) || sessionStorage.getItem('familyday.guest-extras.v1'));
      if (!saved || typeof saved!=='object') return;
      if (typeof saved.name==='string') state.name=saved.name.slice(0,100);
      state.cabin=Object.keys(cabins).find(function(name){return saved.cabin===name || String(saved.cabin)===String(cabins[name]);}) || '';
      ['notes','restaurantNotes'].forEach(function(key){if(typeof saved[key]==='string') state[key]=saved[key].slice(0,1000);});
      extras.forEach(function(item){state.quantities[item.id]=quantity(saved.quantities && saved.quantities[item.id]);});
      if (validWater(saved.water)) state.water={adults:saved.water.adults,children:saved.water.children};
      if (validTime(saved.cinema)) state.cinema=saved.cinema;
      if (['box','table'].indexOf(saved.games)!==-1) state.games=saved.games;
      Object.keys(menuCatalog).forEach(function(key){
        var item=saved.menu && saved.menu[key];
        if (item && quantity(item.qty)) state.menu[key]={qty:quantity(item.qty),cheese:!!item.cheese && menuCatalog[key].cheese};
      });
    } catch (_) { /* Ignore invalid drafts rather than block the page. */ }
  }
  function customerFields(container) {
    var scope=container.dataset.scope;
    container.appendChild(document.getElementById('customer-fields-template').content.cloneNode(true));
    container.querySelectorAll('[data-field]').forEach(function(field){
      var key=field.dataset.field;
      field.id=scope+'-'+key;
      container.querySelector('[data-for="'+key+'"]').htmlFor=field.id;
      if(key==='cabin') Object.keys(cabins).forEach(function(name){field.add(new Option(name,name));});
      if(key==='notes') field.value=scope==='guest' ? state.notes : state.restaurantNotes;
      else field.value=state[key];
      field.addEventListener(key==='cabin' ? 'change' : 'input',function(){
        if(key==='notes') state[scope==='guest' ? 'notes' : 'restaurantNotes']=field.value;
        else {
          state[key]=field.value;
          document.querySelectorAll('[data-field="'+key+'"]').forEach(function(other){if(other!==field) other.value=field.value;});
          if(key==='cabin') renderCabins();
        }
        save();
      });
    });
    if(scope==='restaurant') container.querySelector('textarea').placeholder='مثل بدون بصل أو أي تفاصيل تخص طلب المطعم';
  }
  function renderCabins() {
    document.querySelectorAll('.cabin-number').forEach(function(row){
      row.hidden=!Object.prototype.hasOwnProperty.call(cabins,state.cabin);
      row.querySelector('output').textContent=row.hidden ? '' : String(cabins[state.cabin]);
    });
  }
  function counter(label, onStep) {
    var group=el('div',undefined,'quantity');group.setAttribute('role','group');group.setAttribute('aria-label',label);
    [-1,1].forEach(function(step){
      if(step===1){var output=el('output','0');output.dir='ltr';group.appendChild(output);}
      var button=el('button',step===1 ? '+' : '−');button.type='button';button.dataset.step=String(step);
      button.setAttribute('aria-label',(step===1 ? 'زيادة كمية ' : 'تقليل كمية ')+label);
      button.addEventListener('click',function(){onStep(step);});group.appendChild(button);
    });
    return group;
  }
  function setCounter(group, value, max) {
    group.querySelector('output').textContent=String(value);
    group.querySelector('[data-step="-1"]').disabled=value===0;
    group.querySelector('[data-step="1"]').disabled=value>=max;
  }
  function buildMenu() {
    var target=document.getElementById('guest-menu');
    Object.keys(_menuData).forEach(function(category,index){
      var details=el('details',undefined,'menu-category'), summary=el('summary',category), list=el('div',undefined,'menu-list');
      details.dataset.category=category;
      details.append(summary,list);target.appendChild(details);
      _menuData[category].forEach(function(item,itemIndex){
        var keys=(item.bbq ? ['لحم','دجاج'] : ['']).map(function(type){
          var key=item.name+(type ? ' — '+type : '');
          menuCatalog[key]={name:key,price:item.price,cheese:!!item.cheese};return key;
        });
        var row=el('article',undefined,'menu-row'), copy=el('div',undefined,'extra-copy');
        row.dataset.menuName=item.name;copy.appendChild(el('h3',item.name));
        if(item.desc) copy.appendChild(el('p',item.desc,'extra-note'));
        copy.appendChild(el('p',item.price+' ريال','extra-price'));row.appendChild(copy);
        var select=null, checkbox=null;
        if(item.bbq){
          var label=el('label','نوع البوكس','menu-option');select=el('select');
          select.id='bbq-'+index+'-'+itemIndex;label.htmlFor=select.id;
          keys.forEach(function(key,i){select.add(new Option(i===0 ? 'لحم' : 'دجاج',key));});
          label.appendChild(select);row.appendChild(label);
          select.addEventListener('change',renderMenu);
        }
        var keyFor=function(){return select ? select.value : keys[0];};
        var group=counter(item.name,function(step){
          var key=keyFor(), current=state.menu[key] || {qty:0,cheese:false};
          var next=Math.max(0,Math.min(99,current.qty+step));
          if(next) state.menu[key]={qty:next,cheese:current.cheese};else delete state.menu[key];
          renderMenu();save();
        });row.appendChild(group);
        if(item.cheese){
          var extra=el('label',undefined,'menu-cheese');checkbox=el('input');checkbox.type='checkbox';
          checkbox.addEventListener('change',function(){
            if(state.menu[keyFor()]) state.menu[keyFor()].cheese=checkbox.checked;
            renderMenu();save();
          });
          extra.append(checkbox,el('span','إضافة جبنة · 1 ريال لكل قطعة'));row.appendChild(extra);
        }
        list.appendChild(row);menuRows.push({row:row,group:group,keyFor:keyFor,select:select,keys:keys,checkbox:checkbox});
      });
    });
  }
  function menuLines() {
    return Object.keys(menuCatalog).filter(function(key){return state.menu[key] && state.menu[key].qty;}).map(function(key){
      var item=state.menu[key], data=menuCatalog[key];
      return {id:key,name:data.name,qty:item.qty,price:(data.price+(item.cheese ? 1 : 0))*item.qty,
        details:item.cheese ? ['إضافة جبنة: '+item.qty+' × 1 ريال'] : []};
    });
  }
  function resortLines() {
    var lines=[];
    if(state.water) lines.push({id:'water',name:'باقة ألعاب مائية',price:50,details:['للكبار: '+state.water.adults,'للصغار: '+state.water.children]});
    if(state.cinema) lines.push({id:'cinema',name:'جلسة السينما',price:150,details:['مدة الجلسة: 3 ساعات','وقت البداية: '+time.querySelector('option[value="'+state.cinema+'"]').textContent]});
    if(state.games) lines.push({id:'games',name:state.games==='box' ? 'بوكس الألعاب' : 'طاولة الألعاب مع بوكس الألعاب',price:state.games==='box' ? 50 : 150,details:[]});
    extras.forEach(function(item){
      var qty=state.quantities[item.id] || 0;
      if(qty) lines.push({id:item.id,name:item.name,qty:qty,price:item.price*qty,details:[]});
    });return lines;
  }
  function sum(lines) {return lines.reduce(function(total,item){return total+item.price;},0);}
  function itemLabel(item) {return item.name+(item.qty ? ' × '+item.qty : '');}
  function renderSummary(target, lines, remove) {
    target.replaceChildren();target.hidden=!lines.length;
    lines.forEach(function(item){
      var row=el('li'), copy=el('div',undefined,'order-item-copy');copy.appendChild(el('strong',itemLabel(item)));
      item.details.forEach(function(text){copy.appendChild(el('span',text));});
      var actions=el('div',undefined,'order-item-actions'), price=el('bdi',item.price+' ريال');
      var button=el('button','حذف','remove-item');button.type='button';button.setAttribute('aria-label','حذف '+item.name);
      button.addEventListener('click',function(){
        var index=Array.from(target.children).indexOf(row);
        remove(item.id);
        var next=target.querySelectorAll('button')[Math.min(index,target.children.length-1)];
        if(next) next.focus();else if(target.id==='order-items') form.focus();else document.querySelector('.menu-category summary').focus();
      });
      actions.append(price,button);row.append(copy,actions);target.appendChild(row);
    });
  }
  function renderMenu() {
    menuRows.forEach(function(item){
      var selected=state.menu[item.keyFor()], qty=selected ? selected.qty : 0;
      setCounter(item.group,qty,99);item.row.classList.toggle('is-selected',qty>0);
      if(item.checkbox){item.checkbox.checked=!!(selected && selected.cheese);item.checkbox.disabled=!qty;}
    });
    var lines=menuLines();restaurantForm.hidden=!lines.length;
    renderSummary(document.getElementById('restaurant-items'),lines,function(id){delete state.menu[id];renderMenu();save();});
    document.getElementById('restaurant-count').textContent='عدد الأصناف: '+lines.length;
    document.getElementById('restaurant-total').textContent=String(sum(lines));
    restaurantForm.querySelector('.send-order').disabled=!lines.length;
  }
  function updateServiceButton(type, ready, same) {
    var button=document.getElementById('add-'+type), selected=state[type];
    button.disabled=!ready || same;
    button.textContent=same ? 'أضيف إلى طلبك' : selected ? 'تحديث الطلب' : 'إضافة إلى طلبك';
    document.getElementById(type+'-status').textContent=selected ? (same ? 'موجود في ملخص طلبك.' : 'عدّلت الاختيارات. اضغط «تحديث الطلب» لحفظها.') : '';
  }
  function renderServiceControls() {
    var total=water.adults+water.children;
    ['adults','children'].forEach(function(key){setCounter(document.getElementById('water-'+key).parentNode,water[key],water[key]+3-total);});
    document.getElementById('water-count').textContent=total===3 ? 'اكتملت الباقة · 3 ألعاب' : 'اخترت '+total+' من 3';
    updateServiceButton('water',total===3,!!state.water && state.water.adults===water.adults && state.water.children===water.children);
    updateServiceButton('cinema',!!time.value,!!state.cinema && state.cinema===time.value);
    var selected=document.querySelector('[name="games-package"]:checked');
    updateServiceButton('games',!!selected,!!selected && state.games===selected.value);
  }
  function renderResort() {
    extras.forEach(function(item){
      var qty=state.quantities[item.id] || 0;setCounter(item.row.querySelector('.quantity'),qty,99);
      item.row.classList.toggle('is-selected',qty>0);
    });
    var lines=resortLines();
    renderSummary(document.getElementById('order-items'),lines,function(id){
      if(id==='water') state.water=null;else if(id==='cinema' || id==='games') state[id]='';else state.quantities[id]=0;
      renderResort();save();
    });
    document.getElementById('order-count').textContent=lines.length ? 'عدد الاختيارات: '+lines.length : 'لم تختر أي طلبات بعد';
    document.getElementById('order-total').textContent=String(sum(lines));
    document.getElementById('shortcut-total').textContent=String(sum(lines));
    document.getElementById('order-shortcut').hidden=!lines.length;
    document.body.classList.toggle('has-order-shortcut',!!lines.length);
    form.querySelector('.send-order').disabled=!lines.length;
    renderServiceControls();
  }
  function submit(event, restaurant) {
    event.preventDefault();var target=restaurant ? restaurantForm : form;
    var lines=restaurant ? menuLines() : resortLines();
    if(!lines.length || !target.reportValidity()) return;
    if(!state.name.trim() || !Object.prototype.hasOwnProperty.call(cabins,state.cabin)) return;
    var message=[restaurant ? 'السلام عليكم، أرغب بطلب التالي من المطعم:' : 'السلام عليكم، أرغب بطلب الخدمات التالية أثناء إقامتي:',
      '', 'الاسم: '+state.name.trim(),'اسم الكوخ: '+state.cabin,'رقم الكوخ: '+cabins[state.cabin],'','الطلبات:'];
    lines.forEach(function(item){message.push('• '+itemLabel(item)+' — '+item.price+' ريال');message=message.concat(item.details);});
    message.push('','الإجمالي: '+sum(lines)+' ريال');
    var notes=(restaurant ? state.restaurantNotes : state.notes).trim();
    if(notes) message.push('','ملاحظات: '+notes);
    save();
    // Prepare a draft only. Opening WhatsApp does not send or confirm the order.
    window.open('https://wa.me/'+(restaurant ? '966537006531' : '966556156693')+'?text='+encodeURIComponent(message.join('\n')),'_blank','noopener,noreferrer');
  }

  buildMenu();restore();
  document.querySelectorAll('.customer-fields').forEach(customerFields);
  if(state.water) water={adults:state.water.adults,children:state.water.children};
  time.value=state.cinema;
  if(state.games) document.querySelector('[name="games-package"][value="'+state.games+'"]').checked=true;
  menuRows.forEach(function(item){if(item.select){var key=item.keys.find(function(key){return state.menu[key];});if(key)item.select.value=key;}});
  document.querySelectorAll('[data-water]').forEach(function(button){button.addEventListener('click',function(){
    var key=button.dataset.water,step=Number(button.dataset.step),total=water.adults+water.children;
    if(step===1 && total<3 || step===-1 && water[key]>0) water[key]+=step;
    renderServiceControls();
  });});
  time.addEventListener('change',renderServiceControls);
  document.querySelectorAll('[name="games-package"]').forEach(function(input){input.addEventListener('change',renderServiceControls);});
  ['water','cinema','games'].forEach(function(type){document.getElementById('add-'+type).addEventListener('click',function(){
    if(type==='water' && validWater(water)) state.water={adults:water.adults,children:water.children};
    if(type==='cinema' && validTime(time.value)) state.cinema=time.value;
    var selected=document.querySelector('[name="games-package"]:checked');
    if(type==='games' && selected) state.games=selected.value;
    renderResort();save();
  });});
  extras.forEach(function(item){item.row.querySelectorAll('[data-step]').forEach(function(button){button.addEventListener('click',function(){
    state.quantities[item.id]=Math.max(0,Math.min(99,(state.quantities[item.id] || 0)+Number(button.dataset.step)));
    renderResort();save();
  });});});
  document.getElementById('order-shortcut').addEventListener('click',function(){
    form.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',block:'start'});form.focus({preventScroll:true});
  });
  form.addEventListener('submit',function(event){submit(event,false);});
  restaurantForm.addEventListener('submit',function(event){submit(event,true);});
  renderCabins();renderResort();renderMenu();
})();
