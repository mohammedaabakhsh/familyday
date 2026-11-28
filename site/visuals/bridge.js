// Keep all document navigation in this standalone preview, including Back/share.
(function(){
 document.querySelectorAll('.tour-back,.fd-exploration-share,.cm-close,.dt-heading,.cm-header,.fd-map-header').forEach(function(e){e.style.setProperty('display','none','important');});
 function navigate(path){parent.postMessage({type:'familyday-preview-navigate',path:path},location.origin);}
 document.addEventListener('click',function(event){
  var a=event.target.closest('a[href]');if(!a)return;
  var u=new URL(a.href,location.href);
  if(u.origin!==location.origin)return;
  event.preventDefault();event.stopImmediatePropagation();
  var path=u.pathname.replace(/^\/(?:site|preview)\/(?:visuals\/)?/,'/');
  var h=u.hash.match(/^#cabin=(\d+)/);
  if(h){var units={1:'dome-1',12:'dome-2',2:'pyramid',3:'classic',4:'greek-1',13:'greek-2',5:'palm-beach',6:'bohemian',7:'french',8:'rustic',9:'royal',10:'panoramic',11:'shared-garden'};path='/cabins/'+units[h[1]]+'/';u.search='';u.hash='';}
  else if(u.hash==='#resort'){path='/cabins/';u.hash='';}
  u.searchParams.delete('assetVersion');
  navigate(path+u.search+u.hash);
 },true);
 document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!location.pathname.includes('chalet-map')&&!location.pathname.includes('resort-map'))navigate('/cabins/');});
})();
