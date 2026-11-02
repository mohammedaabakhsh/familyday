/* Shared checkout. Route state stores selections; prices always come from the catalog. */
var _orderItemName = '';
var _isMenuOrder = false;
var _orderResortScope = false;

function serviceOrderDetails(selection, restore) {
  var water = getMaiyaOrderDetails(selection);
  if (water) {
    if (restore) { _maiyaQuantities = water; renderMaiyaQuantities(); }
    return {title:'باقة ألعاب مائية', summary:['3 ألعاب بـ50 ريال','للكبار: '+water.adults,'للصغار: '+water.children]};
  }
  if (!selection || typeof selection !== 'object') return {title:String(selection || ''), summary:[]};
  if (selection.type === 'cinema') return {title:'جلسة السينما', summary:['مدة الجلسة: 3 ساعات','الإجمالي: 150 ريال']};
  if (selection.type === 'games' && ['box','table'].indexOf(selection.option) !== -1) {
    var table = selection.option === 'table';
    if (restore) selectTarfihiOpt(selection.option);
    return {title:table ? 'طاولة مع بوكس الألعاب' : 'بوكس الألعاب',
      summary:(table ? ['طاولة و4 كراسي مع بوكس الألعاب'] : []).concat('الإجمالي: '+(table ? 150 : 50)+' ريال'),
      message:['الباقة: '+(table ? 'طاولة مع بوكس الألعاب' : 'بوكس الألعاب'),'الإجمالي: '+(table ? 150 : 50)+' ريال']};
  }
  if (selection.type === 'dining' && Object.prototype.hasOwnProperty.call(_tawilatPrices,selection.size) && ['plain','tansiq'].indexOf(selection.option) !== -1) {
    if (restore) { setTawilatSize(selection.size); selectTawilatOpt(selection.option); }
    return {title:'طاولات الطعام', summary:['عدد الأشخاص: '+selection.size,
      'التجهيز: '+(selection.option === 'tansiq' ? 'مع تنسيق' : 'بدون تنسيق'),
      'إجمالي الطلب: '+_tawilatPrices[selection.size][selection.option]+' ريال']};
  }
  if (selection.type === 'seating' && Number.isInteger(selection.index) && _jalsatAllSessions[selection.index]) {
    var session = _jalsatAllSessions[selection.index];
    if (restore) {
      if (_jalsatSessions.indexOf(session) === -1) { _jalsatFilter='all'; buildJalsatSlides(); }
      jalsatGoTo(_jalsatSessions.indexOf(session));
      _jalsatCakeAdded = !!selection.cake;
      updateJalsatSummary();
    }
    var lines=['عدد الأشخاص: '+session.personsCat,'سعر الجلسة: '+session.price];
    if (selection.cake) lines.push('كيك وعصير: 170 ريال');
    lines.push('إجمالي الطلب: '+(parseInt(session.price,10)+(selection.cake ? 170 : 0))+' ريال');
    return {title:session.name,summary:lines,message:['الجلسة: '+session.name].concat(lines.map(function(line){return line==='كيك وعصير: 170 ريال' ? 'الإضافة: كيك وعصير — 170 ريال' : line;}))};
  }
  return null;
}

function configureResortOrderForm(itemName) {
  var select = document.getElementById('order-villa');
  if (select.options.length === 1) {
    Object.keys(FD_CABIN_NUMBERS).forEach(function(name){ select.add(new Option(name,name)); });
  }
  ['order-name','order-villa','order-time'].forEach(function(id){
    var field=document.getElementById(id);
    setResortOrderError(id,'');
    if (field.dataset.feedbackReady) return;
    field.dataset.feedbackReady='true';
    ['input','change'].forEach(function(event){field.addEventListener(event,function(){setResortOrderError(id,'');});});
  });
  document.getElementById('order-notes').placeholder = _isMenuOrder
    ? 'مثل بدون بصل أو أي تفاصيل تخص طلبك'
    : getMaiyaOrderDetails(itemName) ? 'مثل أعمار الأطفال أو أي تفاصيل تساعدنا في تجهيز طلبك'
    : 'أضف أي تفاصيل تساعدنا في تجهيز طلبك';
}

function renderOrderItemSummary(selection) {
  var summary=document.getElementById('order-item-name');
  summary.replaceChildren();
  var details=serviceOrderDetails(selection,true);
  if (!details) return;
  [details.title].concat(details.summary).forEach(function(text){
    var line=document.createElement('div');line.textContent=text;summary.appendChild(line);
  });
}

function setResortOrderError(id, text) {
  var field=document.getElementById(id), error=document.getElementById(id+'-error');
  error.textContent=text;
  if (text) field.setAttribute('aria-invalid','true');
  else field.removeAttribute('aria-invalid');
}

function validateResortOrder() {
  var name=document.getElementById('order-name'), cabin=document.getElementById('order-villa'), time=document.getElementById('order-time');
  var timeRequired=document.getElementById('order-time-wrap').style.display !== 'none';
  var errors=[
    [name,name.value.trim() ? '' : 'اكتب اسمك'],
    [cabin,Object.prototype.hasOwnProperty.call(FD_CABIN_NUMBERS,cabin.value) ? '' : 'اختر الكوخ'],
    [time,timeRequired && !time.value ? 'اختر وقت بداية الجلسة' : '']
  ];
  errors.forEach(function(entry){setResortOrderError(entry[0].id,entry[1]);});
  var first=errors.find(function(entry){return entry[1];});
  if(first) first[0].focus();
  return !first;
}

function updateCabinNum() {
  var number=FD_CABIN_NUMBERS[document.getElementById('order-villa').value];
  document.getElementById('order-cabin-num').textContent=number || '';
  document.getElementById('order-cabin-num-wrap').style.display=number ? 'flex' : 'none';
}

function openOrderPopup(selection, showTime) {
  FD_ORDER_DRAFTS.save();
  _orderItemName=selection;
  configureResortOrderForm(selection);
  renderOrderItemSummary(selection);
  FD_MENU_EXPERIENCE.renderCheckout();
  ['order-name','order-villa','order-notes','order-time'].forEach(function(id){document.getElementById(id).value='';});
  updateCabinNum();
  document.getElementById('order-time-wrap').style.display=showTime ? 'block' : 'none';
  FD_ORDER_DRAFTS.restore(_orderDraftScope || JSON.stringify(selection));
  document.getElementById('order-popup').classList.remove('hide');
  document.querySelector('#order-popup .fd-order-panel').scrollTop=0;
}

function closeOrderPopup() {
  FD_ORDER_DRAFTS.close();
  _isMenuOrder=false;
  document.getElementById('order-popup').classList.add('hide');
}

function sendOrderWhatsapp() {
  if (!validateResortOrder()) return;
  var name=document.getElementById('order-name').value.trim();
  var cabin=document.getElementById('order-villa').value;
  var notes=document.getElementById('order-notes').value.trim();
  var order=serviceOrderDetails(_orderItemName,false);
  if (!order) return;
  var message, phone=_isMenuOrder ? '966537006531' : '966556156693';
  if (getMaiyaOrderDetails(_orderItemName)) {
    message=buildMaiyaOrderMessage(_orderItemName,name,cabin,FD_CABIN_NUMBERS[cabin],notes);
  } else {
    var type=_orderItemName && _orderItemName.type;
    var request=_isMenuOrder ? 'من المطعم' : type==='games' ? 'الألعاب الترفيهية' : type==='seating' ? 'جلسة خارجية' : order.title;
    var lines=['السلام عليكم، أرغب بطلب '+request+'.','','الاسم: '+name,'الكوخ: '+cabin,'رقم الكوخ: '+FD_CABIN_NUMBERS[cabin],''];
    if (_isMenuOrder) {
      lines.push('الطلب:');
      Object.keys(_menuCart).filter(function(key){return key.indexOf('|')===-1;}).forEach(function(key){
        var item=_menuCart[key];
        lines.push(item.qty+' × '+key+' — '+(item.qty*item.price)+' ريال');
        Object.keys(_menuCart).filter(function(extra){return extra.split('|')[1]===key;}).forEach(function(extra){
          var addition=_menuCart[extra];
          lines.push('  + '+addition.qty+' × '+extra.split('|')[0]+' — '+(addition.qty*addition.price)+' ريال');
        });
      });
      lines.push('','إجمالي الطلب: '+_menuCartTotals().price+' ريال');
    } else {
      if (type==='cinema') {
        var hour=Number(document.getElementById('order-time').value)%24;
        lines.push('وقت بداية الجلسة: '+(hour%12 || 12)+':00 '+(hour>=12 ? 'مساءً' : 'صباحًا'));
      }
      lines=lines.concat(order.message || order.summary);
    }
    if (notes) lines.push('','ملاحظات: '+notes);
    message=lines.join('\n');
  }
  window.open('https://wa.me/'+phone+'?text='+encodeURIComponent(message),'_blank');
  FD_ORDER_DRAFTS.clear();
  closeOrderPopup();
}
