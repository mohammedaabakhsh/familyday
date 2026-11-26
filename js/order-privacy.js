/* Order details live only in the current visit, never in browser storage. */
(function () {
  'use strict';
  const keys=['familyday.resort-direct-identity.v1','familyday.guest-orders.v2','familyday.arrangements-orders.v1','familyday.chalet-guest-orders.v1','familyday.guest-extras.v1','familyday.menu-cart.v1'];
  const resets=new Set();
  const embedded=parent!==window&&new URLSearchParams(location.search).get('embed')==='resort-order';
  let backgrounded=false;
  function discardStoredOrders(){
    for(const name of ['localStorage','sessionStorage'])try{
      const storage=window[name];for(const key of keys)storage.removeItem(key);
    }catch(_){/* Ordering also works when browser storage is unavailable. */}
  }
  function disableAutocomplete(root){
    if(root.nodeType!==1)return;
    if(root.matches('form,input,select,textarea'))root.setAttribute('autocomplete','off');
    root.querySelectorAll('form,input,select,textarea').forEach(field=>field.setAttribute('autocomplete','off'));
  }
  function reset(){discardStoredOrders();for(const callback of resets)callback();}
  discardStoredOrders();disableAutocomplete(document.documentElement);
  new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(disableAutocomplete)))
    .observe(document.documentElement,{childList:true,subtree:true});
  window.FD_ORDER_PRIVACY={register(callback){resets.add(callback);callback();}};
  // Embedded requests are reset by the main site's existing request controller.
  if(embedded)return;
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden)backgrounded=true;
    else if(backgrounded){backgrounded=false;reset();}
  });
  window.addEventListener('pagehide',reset);
  window.addEventListener('pageshow',event=>{if(event.persisted)requestAnimationFrame(reset);});
})();
