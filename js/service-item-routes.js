/* Stable, shared item URLs. Catalogue content and prices stay in their original source. */
(function(){
 'use strict';
 const groups={
  coordination:{parent:'/services/coordination/',prefix:'package-',parameter:'package',keys:['1','2','3','celebration','vip','resort']},
  seating:{parent:'/services/outdoor-seating/',prefix:'session-',parameter:'session',keys:['1','2','3','4','5','6']}
 };
 function path(service,key){const group=groups[service];return group?.keys.includes(String(key))?group.parent+group.prefix+key+'/':null;}
 function parse(value){
  const pathname=String(value).replace(/index\.html$/,'');
  for(const [service,group] of Object.entries(groups))for(const key of group.keys){const itemPath=path(service,key);if(pathname===itemPath)return {service,key,parent:group.parent,path:itemPath};}
  return null;
 }
 function resolve(value){
  const url=new URL(value,location.origin);if(url.origin!==location.origin)return url;
  for(const [service,group] of Object.entries(groups))if(url.pathname===group.parent){
   const itemPath=path(service,url.searchParams.get(group.parameter));
   if(itemPath){url.pathname=itemPath;url.searchParams.delete(group.parameter);}break;
  }
  return url;
 }
 window.FD_SERVICE_ITEM_ROUTES=Object.freeze({path,parse,resolve});
})();
