/* Share the exploration itself, without the sender's return/navigation context. */
var FD_EXPLORATION_SHARE = (function(){
  'use strict';
  function url(kind){
    var path=kind==='chalet' ? '/chalet-map/' : location.pathname.replace(/\/index\.html$/, '/').replace(/\/?$/, '/');
    var result=new URL(path,location.origin), params=new URLSearchParams(location.search);
    if(path==='/dome-tour/' && params.get('cabin')==='12') result.searchParams.set('cabin','12');
    if(path==='/greek-tour/' && params.get('cabin')==='13') result.searchParams.set('cabin','13');
    return result.href;
  }
  async function copy(value,host){
    try{await navigator.clipboard.writeText(value);return true;}catch(ignore){}
    var buffer=document.createElement('textarea');buffer.value=value;buffer.readOnly=true;
    buffer.className='fd-exploration-copy-buffer';host.appendChild(buffer);buffer.select();
    var copied=false;try{copied=document.execCommand('copy');}catch(ignore){}buffer.remove();return copied;
  }
  function mount(header,kind){
    if(!header || header.querySelector('.fd-exploration-share')) return;
    header.classList.add('fd-exploration-heading');
    var button=document.createElement('button');button.type='button';button.className='fd-exploration-share';
    button.setAttribute('aria-label','مشاركة الاستكشاف');button.title='مشاركة الاستكشاف';
    button.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3m-4 4 4-4 4 4M6 11H4v10h16V11h-2"/></svg>';
    var status=document.createElement('span');status.className='fd-exploration-share-status';
    status.setAttribute('role','status');status.setAttribute('aria-live','polite');
    button.addEventListener('click',async function(event){
      event.stopPropagation();if(button.disabled) return;
      var value=url(kind),title=header.querySelector('h1,h2').textContent.trim();
      status.textContent='';button.disabled=true;
      try{
        if(navigator.share){
          try{await navigator.share({title:title,url:value});return;}
          catch(error){if(error.name==='AbortError') return;}
        }
        var copied=await copy(value,header);
        if(header.isConnected) status.textContent=copied ? 'تم نسخ الرابط' : 'تعذّر نسخ الرابط حاول مرة أخرى';
      }finally{
        button.disabled=false;
        if(button.isConnected && button.getClientRects().length) button.focus({preventScroll:true});
      }
    });
    header.append(button,status);
  }
  return {mount:mount};
})();
