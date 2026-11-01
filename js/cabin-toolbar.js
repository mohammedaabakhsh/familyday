
(function(){
 var launcher=document.getElementById('fd-map-launcher');
 var heading=document.querySelector('#app .cabin-heading-row');
 var toolbar=document.querySelector('#app .cabin-toolbar');
 var mobile=window.matchMedia('(max-width:899px)');
 function placeMap(){(mobile.matches?heading:toolbar).appendChild(launcher);}
 mobile.addEventListener('change',placeMap);
 placeMap();
})();
