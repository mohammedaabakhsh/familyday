/* Loading/retry feedback only. Sources, quality and fetching strategy stay unchanged. */
var FD_IMAGE_FEEDBACK = (function(){
  'use strict';
  function watch(image, host, retryTarget){
    if(image.fdImageFeedback) return;
    image.fdImageFeedback=true;
    host.classList.add('fd-image-host');
    var status=document.createElement('span');
    status.className='fd-image-feedback';status.setAttribute('role','status');status.hidden=true;
    var message=document.createElement('span');status.appendChild(message);
    var retry=document.createElement(retryTarget ? 'span' : 'button');
    retry.className='fd-image-retry';retry.textContent='إعادة المحاولة';retry.hidden=true;
    if(!retryTarget) retry.type='button';
    status.appendChild(retry);host.appendChild(status);
    var failed=false, originalLabel=retryTarget && retryTarget.getAttribute('aria-label');
    function paint(state){
      failed=state==='error';status.hidden=state==='ready';retry.hidden=!failed;
      message.textContent=failed ? 'تعذّر تحميل الصورة' : 'جارٍ تحميل الصورة';
      status.classList.toggle('is-loading',state==='loading');
      image.classList.toggle('fd-image-failed',failed);
      if(retryTarget) retryTarget.setAttribute('aria-label',failed ? 'إعادة المحاولة — '+image.alt : originalLabel);
    }
    function pending(){paint('loading');}
    function retryImage(event){
      if(!failed) return;
      event.preventDefault();event.stopImmediatePropagation();
      var source=image.getAttribute('src');pending();image.removeAttribute('src');image.src=source;
    }
    (retryTarget || retry).addEventListener('click',retryImage,!!retryTarget);
    image.addEventListener('load',function(){if(image.complete && image.naturalWidth) paint('ready');});
    image.addEventListener('error',function(){if(image.complete) paint('error');});
    // A source may change while the same full-size map/tour image is reused.
    new MutationObserver(function(){
      if(image.complete && image.naturalWidth) paint('ready');else pending();
    }).observe(image,{attributes:true,attributeFilter:['src']});
    if(image.complete && image.naturalWidth) paint('ready');
    else if(image.complete && image.getAttribute('src')) paint('error');
    else pending();
  }
  return {watch:watch};
})();
