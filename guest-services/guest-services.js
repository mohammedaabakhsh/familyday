/* In-stay ordering: one resort basket and a separate restaurant order.
   Service copy/prices come from the main site; extras use their visible HTML rows.
   Only selections and guest-entered fields are saved, never trusted prices. */
(async function () {
  'use strict';
  var storageKey = 'familyday.guest-orders.v2';
  var cabins;
  var state = {name:'', cabin:'', notes:'', restaurantNotes:'', quantities:{}, water:null, cinema:'', games:'', menu:{}};
  var catalog;
  document.getElementById('reload-services').addEventListener('click',function(){location.reload();});
  try {catalog=await FD_GUEST_SOURCE.load();}
  catch (_) {
    document.getElementById('services-loading').hidden=true;
    document.getElementById('services-error').hidden=false;
    return;
  }
  document.getElementById('services-loading').hidden=true;
  cabins=catalog.cabins;
  var shortcut=document.getElementById('order-shortcut');
  var dialog=document.getElementById('service-dialog');
  var applyButton=document.getElementById('apply-selection');
  var orderSummary=document.getElementById('orders-summary');
  var draft=null,activeService='',dialogTrigger=null;
  function selection(){return draft || state;}
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
      value.adults>=0 && value.children>=0 && value.adults+value.children>0 && value.adults+value.children<=catalog.water.size;
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
        if (item && quantity(item.qty)) state.menu[key]={qty:quantity(item.qty),cheese:!!item.cheese && !!menuCatalog[key].cheesePrice};
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
    var row=group.closest('.extra-row,.menu-row');if(row) row.classList.toggle('is-selected',value>0);
  }
  function buildMenu() {
    var target=document.getElementById('guest-menu');
    Object.keys(catalog.menu).forEach(function(category,index){
      var details=el('details',undefined,'menu-category'), summary=el('summary'), list=el('div',undefined,'menu-list');
      summary.append(el('span',category),el('span','', 'menu-category-count'));
      details.name='guest-menu-category';
      details.dataset.category=category;
      details.addEventListener('toggle',function(){
        if(details.open) target.querySelectorAll('.menu-category').forEach(function(other){if(other!==details)other.open=false;});
        if(details.open) requestAnimationFrame(function(){
          if(!dialog.open || !details.open) return;
          var body=dialog.querySelector('.dialog-body'),rect=summary.getBoundingClientRect(),bounds=body.getBoundingClientRect();
          if(rect.top<bounds.top || rect.bottom>bounds.bottom) body.scrollTop+=rect.top-bounds.top;
        });
      });
      details.append(summary,list);target.appendChild(details);
      catalog.menu[category].forEach(function(item,itemIndex){
        var keys=(item.bbq ? ['لحم','دجاج'] : ['']).map(function(type){
          var key=item.name+(type ? ' — '+type : '');
          menuCatalog[key]={name:key,price:item.price,cheesePrice:item.cheesePrice || 0,group:category};return key;
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
          select.addEventListener('change',renderEditor);
        }
        var keyFor=function(){return select ? select.value : keys[0];};
        var group=counter(item.name,function(step){
          var menu=selection().menu, key=keyFor(), current=menu[key] || {qty:0,cheese:false};
          var next=Math.max(0,Math.min(99,current.qty+step));
          if(next) menu[key]={qty:next,cheese:current.cheese};else delete menu[key];
          renderEditor();
        });row.appendChild(group);
        if(item.cheesePrice){
          var extra=el('label',undefined,'menu-cheese');checkbox=el('input');checkbox.type='checkbox';
          checkbox.addEventListener('change',function(){
            if(selection().menu[keyFor()]) selection().menu[keyFor()].cheese=checkbox.checked;
            renderEditor();
          });
          extra.append(checkbox,el('span','إضافة جبنة · '+item.cheesePrice+' ريال لكل قطعة'));row.appendChild(extra);
        }
        list.appendChild(row);menuRows.push({row:row,group:group,keyFor:keyFor,select:select,keys:keys,checkbox:checkbox});
      });
    });
  }
  function menuLines(data) {
    data=data || state;
    return Object.keys(menuCatalog).filter(function(key){return data.menu[key] && data.menu[key].qty;}).map(function(key){
      var item=data.menu[key],product=menuCatalog[key];
      return {id:key,group:product.group,name:product.name,qty:item.qty,price:(product.price+(item.cheese ? product.cheesePrice : 0))*item.qty,
        details:item.cheese ? ['إضافة جبنة: '+item.qty+' × '+product.cheesePrice+' ريال'] : []};
    });
  }
  function waterSelection(data) {return (data || state).water || {adults:0,children:0};}
  function incompleteWater(data) {var water=(data || state).water;return !!water && water.adults+water.children!==catalog.water.size;}
  function resortLines(data) {
    data=data || state;
    var lines=[];
    if(data.water) lines.push({id:'water',group:'water',name:catalog.water.name,price:incompleteWater(data) ? 0 : catalog.water.price,
      pending:incompleteWater(data),details:['للكبار: '+data.water.adults,'للصغار: '+data.water.children]});
    if(data.games){var pack=catalog.games.packages[data.games];lines.push({id:'games',group:'games',name:pack.name,price:pack.price,details:[]});}
    if(data.cinema) lines.push({id:'cinema',group:'cinema',name:catalog.cinema.name,price:catalog.cinema.price,
      details:['مدة الجلسة: '+catalog.cinema.duration,'وقت البداية: '+time.querySelector('option[value="'+data.cinema+'"]').textContent]});
    extras.forEach(function(item){
      var qty=data.quantities[item.id] || 0;
      if(qty) lines.push({id:item.id,group:'extras',name:item.name,qty:qty,price:item.price*qty,details:[]});
    });return lines;
  }
  function groupTitle(key) {
    if(catalog[key]) return catalog[key].title;
    return key==='extras' ? document.getElementById('extras-title').textContent : key;
  }
  function groups(lines) {
    var grouped=[];
    lines.forEach(function(item){
      var group=grouped.find(function(group){return group.key===item.group;});
      if(!group){group={key:item.group,title:groupTitle(item.group),items:[]};grouped.push(group);}
      group.items.push(item);
    });return grouped;
  }
  function sum(lines) {return lines.reduce(function(total,item){return total+item.price;},0);}
  function itemLabel(item) {return item.name+(item.qty ? ' × '+item.qty : '');}
  function renderSummary(target, lines, remove) {
    target.replaceChildren();target.hidden=!lines.length;
    groups(lines).forEach(function(group){
      var section=el('li',undefined,'order-group'), heading=el('div',undefined,'order-group-heading'), list=el('ul',undefined,'order-group-items');
      section.dataset.group=group.key;section.dataset.tone=target.id==='restaurant-items' ? 'restaurant' : group.key;
      var pending=group.items.some(function(item){return item.pending;});
      heading.append(el('h4',group.title),el('strong',pending ? 'اختيار غير مكتمل' : sum(group.items)+' ريال'));
      section.append(heading,list);target.appendChild(section);
      group.items.forEach(function(item){
        var row=el('li'), copy=el('div',undefined,'order-item-copy');copy.appendChild(el('strong',itemLabel(item)));
        item.details.forEach(function(text){copy.appendChild(el('span',text));});
        if(item.pending) copy.appendChild(el('span','أكمل اختيار '+catalog.water.size+' ألعاب أو احذف الباقة.','pending-copy'));
        var actions=el('div',undefined,'order-item-actions');
        if(!item.pending) actions.appendChild(el('bdi',item.price+' ريال'));
        var button=el('button','حذف','remove-item');button.type='button';button.setAttribute('aria-label','حذف '+item.name);
        button.addEventListener('click',function(){
          var index=Array.from(target.querySelectorAll('button')).indexOf(button);
          remove(item.id);
          var buttons=target.querySelectorAll('button'),next=buttons[Math.min(index,buttons.length-1)];
          if(next) next.focus();else document.getElementById((target.id==='restaurant-items' ? 'restaurant' : item.group)+'-card').focus();
        });
        actions.appendChild(button);row.append(copy,actions);list.appendChild(row);
      });
    });
  }
  function renderMenuControls() {
    var data=selection();
    menuRows.forEach(function(item){
      var selected=data.menu[item.keyFor()], qty=selected ? selected.qty : 0;
      setCounter(item.group,qty,99);
      if(item.checkbox){item.checkbox.checked=!!(selected && selected.cheese);item.checkbox.disabled=!qty;}
    });
    var lines=menuLines(data);
    document.querySelectorAll('.menu-category').forEach(function(category){
      var selected=lines.filter(function(line){return line.group===category.dataset.category;});
      category.classList.toggle('is-selected',!!selected.length);
      category.querySelector('.menu-category-count').textContent=selected.length ? '✓ '+sum(selected)+' ريال' : '';
    });
  }
  function renderMenu() {
    var lines=menuLines();document.getElementById('restaurant-summary').hidden=!lines.length;
    renderSummary(document.getElementById('restaurant-items'),lines,function(id){delete state.menu[id];renderOrders();save();});
    document.getElementById('restaurant-count').textContent='عدد الأصناف: '+lines.length;
    document.getElementById('restaurant-total').textContent=String(sum(lines));
    restaurantForm.querySelector('.send-order').disabled=!lines.length;
    updateCard('restaurant',lines);
  }
  function renderServiceControls() {
    var data=selection(),water=waterSelection(data), total=water.adults+water.children;
    ['adults','children'].forEach(function(key){setCounter(document.getElementById('water-'+key).parentNode,water[key],water[key]+catalog.water.size-total);});
    document.getElementById('water-count').textContent=total===catalog.water.size ? 'اكتمل اختيار الألعاب' : total ? 'باقي '+(catalog.water.size-total)+' لإكمال باقة الألعاب' : 'اختر '+catalog.water.size+' ألعاب لإضافة الباقة';
    time.value=data.cinema;time.classList.toggle('is-selected',!!data.cinema);
    document.querySelectorAll('[name="games-package"]').forEach(function(input){
      input.checked=input.value===data.games;
      input.closest('label').classList.toggle('is-selected',!!data.games && input.checked);
    });
    document.getElementById('cinema-status').textContent=data.cinema ? 'تم اختيار وقت الجلسة' : '';
    document.getElementById('games-status').textContent=data.games ? 'تم اختيار الباقة' : '';
  }
  function updateShortcut() {
    var hasOrders=!!(resortLines().length || menuLines().length);
    orderSummary.hidden=!hasOrders;
    var rect=orderSummary.getBoundingClientRect(),visible=rect.top<innerHeight-110 && rect.bottom>60;
    shortcut.hidden=!hasOrders || visible || dialog.open;
    document.body.classList.toggle('has-order-shortcut',hasOrders);
  }
  function renderResort() {
    var lines=resortLines();
    renderSummary(document.getElementById('order-items'),lines,function(id){
      if(id==='water') state.water=null;else if(id==='cinema' || id==='games') state[id]='';else state.quantities[id]=0;
      renderOrders();save();
    });
    document.getElementById('order-count').textContent=lines.length ? 'عدد الاختيارات: '+lines.length : '';
    document.getElementById('order-total').textContent=String(sum(lines));
    document.getElementById('resort-summary').hidden=!lines.length;
    form.querySelector('.send-order').disabled=!lines.length || incompleteWater();
    var warning=document.getElementById('order-warning');warning.hidden=!incompleteWater();
    warning.textContent=incompleteWater() ? 'أكمل اختيار '+catalog.water.size+' ألعاب مائية أو احذف الباقة قبل متابعة الطلب.' : '';
    ['water','games','cinema','extras'].forEach(function(key){updateCard(key,lines.filter(function(line){return line.group===key;}));});
  }
  function submit(event, restaurant) {
    event.preventDefault();var target=restaurant ? restaurantForm : form;
    var lines=restaurant ? menuLines() : resortLines();
    if(!lines.length || (!restaurant && incompleteWater()) || !target.reportValidity()) return;
    if(!state.name.trim() || !Object.prototype.hasOwnProperty.call(cabins,state.cabin)) return;
    var message;
    if(restaurant){
      message=catalog.menuMessage.build(catalog.menu,function(key){
        var item=state.menu[key];
        return item ? {qty:item.qty,cheeseQty:item.cheese ? item.qty : 0} : null;
      },{name:state.name,cabin:state.cabin,number:cabins[state.cabin],notes:state.restaurantNotes});
      if(!message) return;
    } else {
      var parts=['السلام عليكم، أرغب بطلب الخدمات التالية أثناء إقامتي:',
        '', 'الاسم: '+state.name.trim(),'اسم الكوخ: '+state.cabin,'رقم الكوخ: '+cabins[state.cabin],'','الطلبات:'];
      groups(lines).forEach(function(group){
        parts.push('',group.title+':');
        group.items.forEach(function(item){parts.push(item.name+' × '+(item.qty || 1)+' = '+item.price+' ريال');parts=parts.concat(item.details);});
      });
      parts.push('','إجمالي الطلب: '+sum(lines)+' ريال');
      if(state.notes.trim()) parts.push('','ملاحظات: '+state.notes.trim());
      message=parts.join('\n');
    }
    save();
    // Prepare a draft only. Opening WhatsApp does not send or confirm the order.
    window.open('https://wa.me/'+(restaurant ? '966537006531' : '966556156693')+'?text='+encodeURIComponent(message),'_blank','noopener,noreferrer');
  }

  function renderOrders(){renderResort();renderMenu();updateShortcut();}
  function updateCard(key, lines) {
    var card=document.getElementById(key+'-card'),status=card.querySelector('.tile-selection');
    var pending=lines.some(function(line){return line.pending;});
    card.classList.toggle('is-selected',!!lines.length && !pending);
    card.classList.toggle('is-pending',pending);
    card.querySelector('.tile-default').hidden=!!lines.length;
    status.hidden=!lines.length;
    card.setAttribute('aria-describedby',key+(lines.length ? '-selection' : '-default'));
    status.replaceChildren();
    if(pending) status.textContent='أكمل اختيار الألعاب';
    else if(lines.length) status.append(document.createTextNode('✓ تمت الإضافة · '),el('bdi',sum(lines)+' ريال'));
    card.querySelector('.tile-action').textContent=lines.length ? 'تعديل الطلب ←' : 'عرض التفاصيل ←';
  }
  function serviceLines(key,data){
    return key==='restaurant' ? menuLines(data) : resortLines(data).filter(function(line){return line.group===key;});
  }
  function renderEditor(){
    renderMenuControls();renderServiceControls();
    extras.forEach(function(item){setCounter(item.row.querySelector('.quantity'),selection().quantities[item.id] || 0,99);});
    if(!activeService) return;
    var lines=serviceLines(activeService,draft),previous=serviceLines(activeService,state);
    var pending=lines.some(function(line){return line.pending;});
    document.getElementById('dialog-total').textContent=String(sum(lines));
    applyButton.disabled=pending || (!lines.length && !previous.length);
    applyButton.textContent=previous.length ? (lines.length ? 'حفظ التعديل' : 'حذف من الطلب') : 'إضافة للطلب';
    var status=document.getElementById('dialog-status');
    status.textContent=pending ? 'أكمل اختيار '+catalog.water.size+' ألعاب لإضافة الباقة.' : '';
  }
  function openEditor(key){
    if(dialog.open) return;
    activeService=key;draft=JSON.parse(JSON.stringify(state));
    dialogTrigger=document.getElementById(key+'-card');
    document.getElementById('service-dialog-title').textContent=document.getElementById(key+'-title').textContent;
    var subtitle=dialogTrigger.querySelector('.tile-default').textContent;
    if(key==='water') subtitle=catalog.water.size+' ألعاب بـ'+catalog.water.price+' ريال';
    else if(key==='cinema') subtitle=catalog.cinema.duration+' بـ'+catalog.cinema.price+' ريال';
    document.getElementById('service-dialog-subtitle').textContent=subtitle;
    dialog.dataset.tone=key;
    document.querySelectorAll('.service-panel').forEach(function(panel){panel.hidden=panel.id!==key+'-service';});
    document.querySelectorAll('.menu-category').forEach(function(category){category.open=false;});
    menuRows.forEach(function(item){if(item.select)item.select.value=item.keys.find(function(key){return draft.menu[key];}) || item.keys[0];});
    renderEditor();document.body.classList.add('dialog-open');dialog.showModal();
    dialog.querySelector('.dialog-body').scrollTop=0;
    document.getElementById('service-dialog-title').focus({preventScroll:true});
    updateShortcut();
  }
  function closeEditor(){
    dialog.close();draft=null;activeService='';document.body.classList.remove('dialog-open');
    if(dialogTrigger) dialogTrigger.focus({preventScroll:true});
    updateShortcut();
  }
  function setupDialogs(){
    document.querySelectorAll('[data-service]').forEach(function(card){
      card.disabled=false;card.addEventListener('click',function(){openEditor(card.dataset.service);});
    });
    dialog.querySelectorAll('.dialog-close,.dialog-cancel').forEach(function(button){button.addEventListener('click',closeEditor);});
    dialog.addEventListener('cancel',function(event){event.preventDefault();closeEditor();});
    dialog.addEventListener('keydown',function(event){
      if(event.key!=='Tab') return;
      var controls=Array.from(dialog.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),summary,[tabindex="0"]')).filter(function(node){return node.getClientRects().length;});
      var first=controls[0],last=controls[controls.length-1];
      if(event.shiftKey && (document.activeElement===first || document.activeElement.id==='service-dialog-title')){event.preventDefault();last.focus();}
      else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus();}
    });
    dialog.addEventListener('click',function(event){
      var rect=dialog.getBoundingClientRect();
      if(event.target===dialog && (event.clientX<rect.left || event.clientX>rect.right || event.clientY<rect.top || event.clientY>rect.bottom))closeEditor();
    });
    applyButton.addEventListener('click',function(){
      if(applyButton.disabled || !draft) return;
      var key=activeService==='restaurant' ? 'menu' : activeService==='extras' ? 'quantities' : activeService;
      state[key]=draft[key];
      save();renderOrders();closeEditor();
    });
    function openLinkedService(){
      var key=location.hash.slice(1).replace(/-service$/,'');
      if(document.getElementById(key+'-card'))openEditor(key);
    }
    window.addEventListener('hashchange',openLinkedService);openLinkedService();
  }
  function hydrateServices() {
    ['water','cinema','games'].forEach(function(key){
      var section=document.getElementById(key+'-service'), data=catalog[key];
      document.getElementById(key+'-title').textContent=data.title;
      var notes=section.querySelector('.usage-note');if(notes) notes.textContent=data.notes.join(' ');
      var contents=section.querySelector('.contents-list');
      if(contents){contents.replaceChildren();data.contents.forEach(function(text){contents.appendChild(el('li',text));});section.querySelector('.contents-title').textContent=data.contentsTitle;}
    });
    document.querySelector('#water-service .section-note').textContent=catalog.water.prompt;
    document.querySelector('#cinema-service .section-note').textContent=catalog.cinema.intro;
    catalog.cinema.times.forEach(function(slot){time.add(new Option(slot.label,slot.value));});time.disabled=false;
    var notes=document.querySelector('#cinema-service .usage ul');catalog.cinema.notes.forEach(function(text){notes.appendChild(el('li',text));});
    var packages=document.querySelector('.game-options');
    ['','box','table'].forEach(function(key){
      var label=el('label'),input=el('input'),copy=el('span');input.type='radio';input.name='games-package';input.value=key;
      if(!key) copy.textContent='بدون باقة ألعاب';
      else {var pack=catalog.games.packages[key];copy.appendChild(el('span',pack.name));if(key==='table') copy.appendChild(el('small',pack.description));copy.appendChild(el('strong',pack.price+' ريال'));}
      label.append(input,copy);packages.appendChild(label);
    });
  }
  hydrateServices();buildMenu();restore();
  document.querySelectorAll('.customer-fields').forEach(customerFields);
  document.querySelectorAll('[data-water]').forEach(function(button){button.addEventListener('click',function(){
    var data=selection(),water=waterSelection(data),key=button.dataset.water,step=Number(button.dataset.step),total=water.adults+water.children;
    if(step===1 && total<catalog.water.size || step===-1 && water[key]>0) water[key]+=step;
    data.water=water.adults+water.children ? water : null;
    renderEditor();
  });});
  time.addEventListener('change',function(){selection().cinema=time.value;renderEditor();});
  document.querySelectorAll('[name="games-package"]').forEach(function(input){input.addEventListener('change',function(){selection().games=input.value;renderEditor();});});
  extras.forEach(function(item){item.row.querySelectorAll('[data-step]').forEach(function(button){button.addEventListener('click',function(){
    var quantities=selection().quantities;
    quantities[item.id]=Math.max(0,Math.min(99,(quantities[item.id] || 0)+Number(button.dataset.step)));
    renderEditor();
  });});});
  shortcut.addEventListener('click',function(){
    // Focus first, then jump synchronously: no smooth-scroll/focus race on phones.
    orderSummary.focus({preventScroll:true});
    window.scrollTo(0,Math.max(0,scrollY+orderSummary.getBoundingClientRect().top-14));
    orderSummary.classList.remove('order-highlight');void orderSummary.offsetWidth;orderSummary.classList.add('order-highlight');
    updateShortcut();
  });
  new IntersectionObserver(updateShortcut,{rootMargin:'-60px 0px -110px 0px'}).observe(orderSummary);
  window.addEventListener('resize',updateShortcut);
  form.addEventListener('submit',function(event){submit(event,false);});
  restaurantForm.addEventListener('submit',function(event){submit(event,true);});
  renderCabins();renderOrders();renderEditor();setupDialogs();
})();
