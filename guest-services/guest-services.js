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
  var selectedCount=0;
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
        revealFold(details);
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
          select.addEventListener('change',renderMenu);
        }
        var keyFor=function(){return select ? select.value : keys[0];};
        var group=counter(item.name,function(step){
          var key=keyFor(), current=state.menu[key] || {qty:0,cheese:false};
          var next=Math.max(0,Math.min(99,current.qty+step));
          if(next) state.menu[key]={qty:next,cheese:current.cheese};else delete state.menu[key];
          renderMenu();save();
        });row.appendChild(group);
        if(item.cheesePrice){
          var extra=el('label',undefined,'menu-cheese');checkbox=el('input');checkbox.type='checkbox';
          checkbox.addEventListener('change',function(){
            if(state.menu[keyFor()]) state.menu[keyFor()].cheese=checkbox.checked;
            renderMenu();save();
          });
          extra.append(checkbox,el('span','إضافة جبنة · '+item.cheesePrice+' ريال لكل قطعة'));row.appendChild(extra);
        }
        list.appendChild(row);menuRows.push({row:row,group:group,keyFor:keyFor,select:select,keys:keys,checkbox:checkbox});
      });
    });
  }
  function menuLines() {
    return Object.keys(menuCatalog).filter(function(key){return state.menu[key] && state.menu[key].qty;}).map(function(key){
      var item=state.menu[key], data=menuCatalog[key];
      return {id:key,group:data.group,name:data.name,qty:item.qty,price:(data.price+(item.cheese ? data.cheesePrice : 0))*item.qty,
        details:item.cheese ? ['إضافة جبنة: '+item.qty+' × '+data.cheesePrice+' ريال'] : []};
    });
  }
  function waterSelection() {return state.water || {adults:0,children:0};}
  function incompleteWater() {return !!state.water && state.water.adults+state.water.children!==catalog.water.size;}
  function resortLines() {
    var lines=[];
    if(state.water) lines.push({id:'water',group:'water',name:catalog.water.name,price:incompleteWater() ? 0 : catalog.water.price,
      pending:incompleteWater(),details:['للكبار: '+state.water.adults,'للصغار: '+state.water.children]});
    if(state.games){var pack=catalog.games.packages[state.games];lines.push({id:'games',group:'games',name:pack.name,price:pack.price,details:[]});}
    if(state.cinema) lines.push({id:'cinema',group:'cinema',name:catalog.cinema.name,price:catalog.cinema.price,
      details:['مدة الجلسة: '+catalog.cinema.duration,'وقت البداية: '+time.querySelector('option[value="'+state.cinema+'"]').textContent]});
    extras.forEach(function(item){
      var qty=state.quantities[item.id] || 0;
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
          if(next) next.focus();else if(target.id==='order-items') form.focus();else document.querySelector('.menu-category summary').focus();
        });
        actions.appendChild(button);row.append(copy,actions);list.appendChild(row);
      });
    });
  }
  function renderMenu() {
    menuRows.forEach(function(item){
      var selected=state.menu[item.keyFor()], qty=selected ? selected.qty : 0;
      setCounter(item.group,qty,99);
      if(item.checkbox){item.checkbox.checked=!!(selected && selected.cheese);item.checkbox.disabled=!qty;}
    });
    var lines=menuLines();restaurantForm.hidden=!lines.length;
    renderSummary(document.getElementById('restaurant-items'),lines,function(id){delete state.menu[id];renderMenu();save();});
    document.getElementById('restaurant-count').textContent='عدد الأصناف: '+lines.length;
    document.getElementById('restaurant-total').textContent=String(sum(lines));
    restaurantForm.querySelector('.send-order').disabled=!lines.length;
    updateFold('restaurant',lines);
    document.querySelectorAll('.menu-category').forEach(function(category){
      var selected=lines.filter(function(line){return line.group===category.dataset.category;});
      category.classList.toggle('is-selected',!!selected.length);
      category.querySelector('.menu-category-count').textContent=selected.length ? '✓ '+sum(selected)+' ريال' : '';
    });
  }
  function renderServiceControls() {
    var water=waterSelection(), total=water.adults+water.children;
    ['adults','children'].forEach(function(key){setCounter(document.getElementById('water-'+key).parentNode,water[key],water[key]+catalog.water.size-total);});
    document.getElementById('water-count').textContent=total===catalog.water.size ? 'أضيفت الباقة إلى طلبك' : total ? 'باقي '+(catalog.water.size-total)+' لإكمال باقة الألعاب' : 'اختر '+catalog.water.size+' ألعاب لإضافة الباقة';
    time.value=state.cinema;time.classList.toggle('is-selected',!!state.cinema);
    document.querySelectorAll('[name="games-package"]').forEach(function(input){
      input.checked=input.value===state.games;
      input.closest('label').classList.toggle('is-selected',!!state.games && input.checked);
    });
    document.getElementById('cinema-status').textContent=state.cinema ? 'أضيفت الجلسة إلى طلبك' : '';
    document.getElementById('games-status').textContent=state.games ? 'أضيفت الباقة إلى طلبك' : '';
  }
  function updateShortcut() {
    var rect=form.getBoundingClientRect(), visible=rect.top<innerHeight-110 && rect.bottom>60;
    shortcut.hidden=!selectedCount || visible;
  }
  function renderResort() {
    extras.forEach(function(item){
      var qty=state.quantities[item.id] || 0;setCounter(item.row.querySelector('.quantity'),qty,99);
    });
    var lines=resortLines();
    renderSummary(document.getElementById('order-items'),lines,function(id){
      if(id==='water') state.water=null;else if(id==='cinema' || id==='games') state[id]='';else state.quantities[id]=0;
      renderResort();save();
    });
    document.getElementById('order-count').textContent=lines.length ? 'عدد الاختيارات: '+lines.length : 'لم تختر أي طلبات بعد';
    document.getElementById('order-total').textContent=String(sum(lines));
    document.getElementById('shortcut-total').textContent=String(sum(lines));
    selectedCount=lines.length;updateShortcut();
    document.body.classList.toggle('has-order-shortcut',!!lines.length);
    form.querySelector('.order-details').hidden=!lines.length;
    form.querySelector('.send-order').disabled=!lines.length || incompleteWater();
    var warning=document.getElementById('order-warning');warning.hidden=!incompleteWater();
    warning.textContent=incompleteWater() ? 'أكمل اختيار '+catalog.water.size+' ألعاب مائية أو احذف الباقة قبل متابعة الطلب.' : '';
    renderServiceControls();
    ['water','games','cinema','extras'].forEach(function(key){updateFold(key,lines.filter(function(line){return line.group===key;}));});
  }
  function submit(event, restaurant) {
    event.preventDefault();var target=restaurant ? restaurantForm : form;
    var lines=restaurant ? menuLines() : resortLines();
    if(!lines.length || (!restaurant && incompleteWater()) || !target.reportValidity()) return;
    if(!state.name.trim() || !Object.prototype.hasOwnProperty.call(cabins,state.cabin)) return;
    var message=[restaurant ? 'السلام عليكم، أرغب بطلب التالي من المطعم:' : 'السلام عليكم، أرغب بطلب الخدمات التالية أثناء إقامتي:',
      '', 'الاسم: '+state.name.trim(),'اسم الكوخ: '+state.cabin,'رقم الكوخ: '+cabins[state.cabin],'','الطلبات:'];
    groups(lines).forEach(function(group){
      message.push('',group.title+' — '+sum(group.items)+' ريال');
      group.items.forEach(function(item){message.push('• '+itemLabel(item)+' — '+item.price+' ريال');message=message.concat(item.details);});
    });
    message.push('','الإجمالي: '+sum(lines)+' ريال');
    var notes=(restaurant ? state.restaurantNotes : state.notes).trim();
    if(notes) message.push('','ملاحظات: '+notes);
    save();
    // Prepare a draft only. Opening WhatsApp does not send or confirm the order.
    window.open('https://wa.me/'+(restaurant ? '966537006531' : '966556156693')+'?text='+encodeURIComponent(message.join('\n')),'_blank','noopener,noreferrer');
  }

  function updateFold(key, lines) {
    var fold=document.getElementById(key+'-service'), status=fold.querySelector('.fold-selection');
    var pending=lines.some(function(line){return line.pending;});
    fold.classList.toggle('is-selected',!!lines.length && !pending);
    fold.classList.toggle('is-pending',pending);
    fold.querySelector('.fold-default').hidden=!!lines.length;
    status.hidden=!lines.length;
    status.textContent=pending ? 'أكمل اختيار الألعاب · '+(state.water.adults+state.water.children)+' من '+catalog.water.size : lines.length ? '✓ في طلبك · '+sum(lines)+' ريال' : '';
  }
  function revealFold(fold) {
    if(!fold.open) return;
    requestAnimationFrame(function(){
      var summary=fold.querySelector('summary'),rect=summary.getBoundingClientRect();
      if(!fold.open || !rect.width) return;
      if(rect.top<14 || rect.bottom>innerHeight-90) window.scrollTo(0,Math.max(0,scrollY+rect.top-14));
      updateShortcut();
    });
  }
  function setupFolds() {
    var folds=Array.from(document.querySelectorAll('.guest-service-fold'));
    folds.forEach(function(fold){fold.addEventListener('toggle',function(){
      if(fold.open) folds.forEach(function(other){if(other!==fold)other.open=false;});
      revealFold(fold);updateShortcut();
    });});
    function openLinkedFold(){
      var fold=document.getElementById(location.hash.slice(1));
      if(fold && fold.classList.contains('guest-service-fold')){fold.open=true;revealFold(fold);}
    }
    window.addEventListener('hashchange',openLinkedFold);openLinkedFold();
  }
  function hydrateServices() {
    ['water','cinema','games'].forEach(function(key){
      var section=document.getElementById(key+'-service'), data=catalog[key];
      section.querySelector('.fold-title').textContent=data.title;
      var notes=section.querySelector('.usage-note');if(notes) notes.textContent=data.notes.join(' ');
      var contents=section.querySelector('.contents-list');
      if(contents){contents.replaceChildren();data.contents.forEach(function(text){contents.appendChild(el('li',text));});section.querySelector('.contents-title').textContent=data.contentsTitle;}
    });
    document.querySelector('#water-service .section-price').textContent=catalog.water.size+' ألعاب بـ'+catalog.water.price+' ريال';
    document.querySelector('#water-service .section-note').textContent=catalog.water.prompt;
    document.querySelector('#cinema-service .section-price').textContent=catalog.cinema.duration+' بـ'+catalog.cinema.price+' ريال';
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
  menuRows.forEach(function(item){if(item.select){var key=item.keys.find(function(key){return state.menu[key];});if(key)item.select.value=key;}});
  document.querySelectorAll('[data-water]').forEach(function(button){button.addEventListener('click',function(){
    var water=waterSelection(),key=button.dataset.water,step=Number(button.dataset.step),total=water.adults+water.children;
    if(step===1 && total<catalog.water.size || step===-1 && water[key]>0) water[key]+=step;
    state.water=water.adults+water.children ? water : null;
    renderResort();save();
  });});
  time.addEventListener('change',function(){state.cinema=time.value;renderResort();save();});
  document.querySelectorAll('[name="games-package"]').forEach(function(input){input.addEventListener('change',function(){state.games=input.value;renderResort();save();});});
  extras.forEach(function(item){item.row.querySelectorAll('[data-step]').forEach(function(button){button.addEventListener('click',function(){
    state.quantities[item.id]=Math.max(0,Math.min(99,(state.quantities[item.id] || 0)+Number(button.dataset.step)));
    renderResort();save();
  });});});
  shortcut.addEventListener('click',function(){
    // Focus first, then jump synchronously: no smooth-scroll/focus race on phones.
    form.focus({preventScroll:true});
    window.scrollTo(0,Math.max(0,scrollY+form.getBoundingClientRect().top-14));
    form.classList.remove('order-highlight');void form.offsetWidth;form.classList.add('order-highlight');
    updateShortcut();
  });
  new IntersectionObserver(updateShortcut,{rootMargin:'-60px 0px -110px 0px'}).observe(form);
  window.addEventListener('resize',updateShortcut);
  form.addEventListener('submit',function(event){submit(event,false);});
  restaurantForm.addEventListener('submit',function(event){submit(event,true);});
  setupFolds();renderCabins();renderResort();renderMenu();
})();
