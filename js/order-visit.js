/* Orders stay in memory. A one-use handoff carries them only across an internal document navigation. */
(function(){
  'use strict';
  if(window.FD_ORDER_VISIT||parent!==window)return;
  const key='familyday.internal-order-handoff.v1',controllers=new Map();let records={},destination=null;
  const clean=url=>{const u=new URL(url,location.href);u.hash='';return u.href;};
  function consume(restoring=false){
    let saved=null;try{saved=JSON.parse(sessionStorage.getItem(key)||'null');sessionStorage.removeItem(key);}catch(_){}
    const reload=!restoring&&performance.getEntriesByType('navigation')[0]?.type==='reload';
    records=saved&&!reload&&saved.target===clean(location.href)&&Date.now()-saved.time<15000?saved.records:{};
  }
  consume();
  function prepare(url){
    if(!url){destination=null;return;}
    try{const next=new URL(url,location.href);destination=next.origin===location.origin?{url:clean(next),time:Date.now()}:null;}catch(_){destination=null;}
  }
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href]');if(!link||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||link.target==='_blank'||link.hasAttribute('download'))return;
    queueMicrotask(()=>{if(!event.defaultPrevented)prepare(link.href);});
  });
  window.navigation?.addEventListener('navigate',event=>{if(event.destination.sameDocument){destination=null;return;}prepare(event.navigationType==='reload'?null:event.destination.url);});
  window.addEventListener('pagehide',()=>{
    try{sessionStorage.removeItem(key);}catch(_){}
    if(destination&&Date.now()-destination.time<5000){
      for(const [name,api] of controllers)records[name]=api.snapshot();
      try{sessionStorage.setItem(key,JSON.stringify({target:destination.url,time:Date.now(),records}));}catch(_){}
    }
    destination=null;
  },true);
  window.addEventListener('pageshow',event=>{
    if(!event.persisted)return;consume(true);const incoming=records;requestAnimationFrame(()=>requestAnimationFrame(()=>{for(const [name,api] of controllers)if(Object.hasOwn(incoming,name))api.restore(incoming[name]);}));
  });
  // A background return is the end of the previous active visit, matching the exit policy.
  let backgrounded=false;document.addEventListener('visibilitychange',()=>{if(document.hidden)backgrounded=true;else if(backgrounded){backgrounded=false;records={};destination=null;try{sessionStorage.removeItem(key);}catch(_){}}});
  window.FD_ORDER_VISIT={prepare,register(name,snapshot,restore){controllers.set(name,{snapshot,restore});if(Object.hasOwn(records,name))restore(records[name]);}};
})();
