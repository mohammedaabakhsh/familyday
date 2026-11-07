// FAQ summaries use the same unit records as cards, details and maps.
(function(){
  function answer(key,text){var el=document.querySelector('[data-shared-fact="'+key+'"]');if(el){el.textContent='';text.split('\n').forEach(function(line,i){if(i)el.appendChild(document.createElement('br'));el.appendChild(document.createTextNode(line));});}}
  var cabins=data.resort.items.filter(function(c){return c.guests>0;});
  var low=Math.min.apply(null,cabins.map(function(c){return c.guests;}));
  var high=Math.max.apply(null,cabins.map(function(c){return c.guests;}));
  var rooms=Array.from(new Set(cabins.map(function(c){return c.rooms;}))).sort();
  var roomText=rooms.map(function(n){return n===1?'غرفة نوم واحدة':n===2?'غرفتي نوم':n+' غرف نوم';}).join(' أو ');
  answer('resort-capacity','تختلف السعة حسب الكوخ، من '+(low===2?'ضيفين':low+' ضيوف')+' إلى '+high+' ضيفًا.\nوتتوفر أكواخ ب'+roomText+'.');
  answer('resort-combined','نعم، يمكن حجز كوخ رويال والكوخ الكلاسيكي معًا وربطهما عبر باب داخلي، بسعة إجمالية تصل إلى '+resortCombinedGuests()+' ضيفًا.');
  var depths=cabins.map(function(c){return c.pool.depthCm;});
  var min=Math.min.apply(null,depths),max=Math.max.apply(null,depths);
  answer('resort-pools',(min===max?'عمق جميع مسابح الأكواخ '+min+' سم':'تتراوح أعماق مسابح الأكواخ بين '+min+' و'+max+' سم')+'، وتختلف أبعادها حسب الكوخ.');
  var first=FD_STAY_UNITS[0],second=FD_STAY_UNITS[1];
  var capacity=first.guests===second.guests?'يتسع كل قسم لاستقبال '+resortGuestText(first.guests):'يتسع القسم الأول لاستقبال '+resortGuestText(first.guests)+'، والقسم الثاني '+resortGuestText(second.guests);
  function roomCount(n){return n===1?'غرفة نوم واحدة':n===2?'غرفتي نوم':n+' غرف نوم';}
  var bed=second.tags.find(function(t){return /^غرفة النوم/.test(t);}).replace(/^غرفة النوم (الرئيسية|الثانية) بـ?/, '');
  var maximum=first.maxGuests===second.maxGuests?'في كل قسم إلى '+first.maxGuests:'في القسم الأول إلى '+first.maxGuests+'، وفي القسم الثاني إلى '+second.maxGuests;
  answer('stay-capacity',capacity+'. يضم القسم الأول '+roomCount(first.rooms)+'، ويضم القسم الثاني '+roomCount(second.rooms)+' تحتوي على '+bed+'. ويمكن زيادة عدد الضيوف '+maximum+' ضيفًا كحد أقصى، برسوم إضافية.');
})();
