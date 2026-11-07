// FAQ summaries use the same unit records as cards, details and maps.
(function(){
  function answer(key,text){var el=document.querySelector('[data-shared-fact="'+key+'"]');if(el)el.textContent=text;}
  var cabins=data.resort.items.filter(function(c){return c.guests>0;});
  var low=Math.min.apply(null,cabins.map(function(c){return c.guests;}));
  var high=Math.max.apply(null,cabins.map(function(c){return c.guests;}));
  var rooms=Array.from(new Set(cabins.map(function(c){return c.rooms;}))).sort();
  var roomText=rooms.map(function(n){return n===1?'بغرفة نوم واحدة':n===2?'بغرفتي نوم':'بـ'+n+' غرف نوم';}).join(' وأخرى ');
  answer('resort-capacity','تختلف سعة استقبال الضيوف حسب الكوخ، وتبدأ من '+(low===2?'ضيفين':low+' ضيوف')+' وتصل إلى '+high+' ضيفًا. وتتوفر أكواخ '+roomText+'.');
  answer('resort-combined','نعم، يمكن ربط كوخ رويال والكوخ الكلاسيكي عبر باب داخلي عند حجزهما معًا، بسعة إجمالية تصل إلى '+resortCombinedGuests()+' ضيفًا.');
  var depths=cabins.map(function(c){return c.pool.depthCm;});
  var min=Math.min.apply(null,depths),max=Math.max.apply(null,depths);
  answer('resort-pools','جميع مسابح الأكواخ خاصة '+(min===max?'بعمق '+min+' سم':'بأعماق تتراوح بين '+min+' و'+max+' سم')+'، وتختلف أبعادها بحسب تصميم الكوخ.');
  var first=FD_STAY_UNITS[0],second=FD_STAY_UNITS[1];
  var capacity=first.guests===second.guests?'يتسع كل قسم لاستقبال '+resortGuestText(first.guests):'يتسع القسم الأول لاستقبال '+resortGuestText(first.guests)+'، والقسم الثاني '+resortGuestText(second.guests);
  function roomCount(n){return n===1?'غرفة نوم واحدة':n===2?'غرفتي نوم':n+' غرف نوم';}
  var bed=second.tags.find(function(t){return /^غرفة النوم/.test(t);}).replace(/^غرفة النوم (الرئيسية|الثانية) بـ?/, '');
  var maximum=first.maxGuests===second.maxGuests?'في كل قسم إلى '+first.maxGuests:'في القسم الأول إلى '+first.maxGuests+'، وفي القسم الثاني إلى '+second.maxGuests;
  answer('stay-capacity',capacity+'. يضم القسم الأول '+roomCount(first.rooms)+'، ويضم القسم الثاني '+roomCount(second.rooms)+' تحتوي على '+bed+'. ويمكن زيادة عدد الضيوف '+maximum+' ضيفًا كحد أقصى، برسوم إضافية.');
})();
