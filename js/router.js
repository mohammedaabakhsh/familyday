
// Family Day navigation history: existing views remain the rendering layer.
// A route has a parent; only changed layers are reopened, so Back from a
// popup preserves the underlying grid/filter or service form selections.
(function(){
  'use strict';
  var originals = {};
  var current = {name:'dest', args:[]};
  var rendering = false;
  var waitingForBack = false;
  var version = 2;
  var serviceViews = {
    hospitality:['showTansidat','closeHospitalityDetail'],
    setups:['openSetupsDetail','closeSetupsDetail'],
    maiya:['openMaiyaDetail','closeMaiyaDetail'],
    tarfihi:['openTarfihiDetail','closeTarfihiDetail'],
    sharik:['showSharik','closeSharikDetail'],
    contest:['showContest','closeContestDetail'],
    walaa:['showWalaa','closeWalaaDetail'],
    menu:['openMenuDetail','closeMenuDetail']
  };

  function route(name,args,parent){
    var legacy={sinema:'cinema',tawilat:'dining',jalsat:'seating'};
    if(legacy[name]){args=[legacy[name]];name='setups';}
    if(name==='hospitality' && args && args[0]==='packages'){name='setups';args=['cinema'];}
    var tabs={hospitality:['hospitality','coordination'],setups:['cinema','dining','seating']};
    var overview=tabs[name] && (!args || tabs[name].indexOf(args[0])===-1);
    if(tabs[name]) args=[overview ? tabs[name][0] : args[0]];
    var r = {name:name,args:args || []};
    // Group links keep their general preview; selecting a tab uses its own share URL.
    if(overview) r.overview=true;
    if(parent) r.parent = parent;
    else if(name==='home') r.parent = route('dest');
    else if(name==='resort' || name==='services' || name==='faq') r.parent = route('home',['resort']);
    else if(name==='chalet' || name==='faq2') r.parent = route('home',['stay']);
    else if(name==='chalet-detail' || name==='chalet-faq') r.parent = route('home',['chalet']);
    else if(name==='contact') r.parent = route('home',[r.args[0] || 'resort']);
    else if(name==='cabin') r.parent = route(r.args[0]>=20 ? 'chalet' : 'resort');
    else if(name==='map') r.parent = route('resort');
    else if(name==='chalet-map') r.parent = route('home',['chalet']);
    else if(serviceViews[name]) r.parent = route('services');
    return r;
  }
  function key(r){ return JSON.stringify(r); }
  function pathFor(r){
    var list=[];
    while(r){ list.unshift(r); r=r.parent; }
    return list;
  }
  function shareKey(r){
    var specific=['home','contact','cabin'].indexOf(r.name)!==-1 || (['hospitality','setups'].indexOf(r.name)!==-1 && !r.overview);
    return r.name + (specific ? '='+r.args[0] : '');
  }
  function sharePage(r){
    return FD_SHARE_PAGES.find(function(p){return p.route===shareKey(r);});
  }
  function urlFor(r){
    var cleanUrl=cleanFamilyDayURL();
    if(['map','chalet-details'].indexOf(cleanUrl.searchParams.get('from'))!==-1) cleanUrl.searchParams.delete('from');
    cleanUrl.searchParams.delete('tab');
    var base='/'+cleanUrl.search;
    if(r.name==='map') return '/resort-map/'+cleanUrl.search+(r.args.length ? '#map='+r.args[0] : '');
    if(r.name==='chalet-map'){
      if(r.parent && r.parent.name==='chalet-detail') cleanUrl.searchParams.set('from','chalet-details');
      return '/chalet-map/'+cleanUrl.search;
    }
    var shared=sharePage(r);
    if(shared){
      if(r.name==='cabin' && r.parent && r.parent.name==='map') cleanUrl.searchParams.set('from','map');
      return shared.path+cleanUrl.search;
    }
    if(r.name==='dest') return base;
    if(r.name==='home') return base+'#home='+r.args[0];
    if(r.name==='cabin') return base+'#cabin='+r.args[0];
    if(r.name==='contact') return base+'#contact='+r.args[0];
    if(['photos','map-photos','dome-gallery','cabin-compare','tour','order','menu-cart'].indexOf(r.name)!==-1) return urlFor(r.parent);
    return base+'#'+r.name;
  }
  function fromHash(){
    var hash=location.hash.slice(1);
    if(!hash){
      var pathname=location.pathname.replace(/\/?$/,'/');
      var shared=FD_SHARE_PAGES.find(function(p){return p.path===pathname;});
      if(shared) hash=shared.route;
    }
    if(/^cabin=\d+$/.test(hash) && new URLSearchParams(location.search).get('from')==='map') hash+='&from=map';
    if((hash==='chalet-map' || (!hash && /^\/chalet-map\/?$/.test(location.pathname))) && new URLSearchParams(location.search).get('from')==='chalet-details') return route('chalet-map',[],route('chalet-detail'));
    if(!hash && /^\/(resort-map|chalet-map)\/?$/.test(location.pathname)) return route(location.pathname.indexOf('resort-map')!==-1 ? 'map' : 'chalet-map');
    var mapMatch=/^map=(\d+)$/.exec(hash);
    if(mapMatch){
      var mapId=Number(mapMatch[1]);
      if(data.resort.items.some(function(c){return c.id===mapId;})) return route('map',[mapId]);
      return route('map');
    }
    var mapDetail=/^cabin=(\d+)&from=map$/.exec(hash);
    if(mapDetail){var mapCabinId=Number(mapDetail[1]);if(data.resort.items.some(function(c){return c.id===mapCabinId;}))return route('cabin',[mapCabinId],route('map',[mapCabinId]));}
    var match=/^cabin=(\d+)$/.exec(hash);
    if(match){
      var id=Number(match[1]);
      if(id===20 || id===21 || data.resort.items.some(function(c){return c.id===id;})) return route('cabin',[id]);
    }
    match=/^(home|contact)=(resort|stay|chalet)$/.exec(hash);
    if(match) return route(match[1],[match[2]]);
    if(['sinema','tawilat','jalsat'].indexOf(hash)!==-1) return route(hash);
    match=/^(hospitality|setups)=([a-z]+)$/.exec(hash);
    if(match) return route(match[1],[match[2]]);
    if(hash==='hospitality' || hash==='setups') return route(hash,[new URLSearchParams(location.search).get('tab')]);
    if(['resort','chalet','services','faq','faq2','map','chalet-detail','chalet-faq','chalet-map'].indexOf(hash)!==-1 || serviceViews[hash]) return route(hash);
    return route('dest');
  }
  function remember(name){
    if(!originals[name]) originals[name]=window[name];
    return originals[name];
  }
  function call(name,args){ return remember(name).apply(window,args || []); }
  function openView(r){
    switch(r.name){
      case 'dest': call('goBackToDestination'); break;
      case 'home': call('showDestination',r.args); break;
      case 'resort': call('showSection',['resort']); break;
      case 'chalet': call('showSection2'); break;
      case 'chalet-detail': call('openPrivateChalet'); break;
      case 'chalet-map': FD_CHALET_MAP.show(); break;
      case 'chalet-faq': call('showChaletFaq'); break;
      case 'services': call('showServices'); break;
      case 'faq': call('showFaq'); break;
      case 'faq2': call('showFaq2'); break;
      case 'contact': call('showContact',r.args); break;
      case 'cabin':
        document.getElementById('ov').dataset.returnToMap = String(!!r.parent && r.parent.name==='map');
        if(r.parent && r.parent.name==='map') document.dispatchEvent(new CustomEvent('fd-map-suspend'));
        if(r.args[0]>=20){
          var item=_chaletItems2.find(function(c){return c.id===r.args[0];});
          if(item) call('openMDirect',[item]);
        } else call('openM',[r.args[0],'resort']);
        break;
      case 'photos': call('openFS',r.args); break;
      case 'dome-gallery': FD_DOME_GALLERY.show(r.args[0]); break;
      case 'cabin-compare': FD_CABIN_COMPARE.show(r.args); break;
      case 'menu-cart': call('openMenuCartReview'); break;
      case 'map-photos':
        document.dispatchEvent(new CustomEvent('fd-map-photos-open',{detail:{locationKey:r.args[0]}}));
        break;
      case 'tour':
        if(r.parent && r.parent.name==='map') document.dispatchEvent(new CustomEvent('fd-map-suspend'));
        call('open3D',r.args); break;
      case 'order':
        _orderDraftScope=r.parent ? r.parent.name+(r.parent.name==='setups' ? ':'+r.parent.args[0] : '') : r.args[0];
        _isMenuOrder=!!r.args[2];
        _orderResortScope=r.args.length>3 ? !!r.args[3] : !!r.parent && ['menu','setups','sinema','maiya','tarfihi','tawilat','jalsat'].indexOf(r.parent.name)!==-1;
        call('openOrderPopup',r.args.slice(0,2));
        break;
      case 'map':
        document.getElementById('fd-map-open').click();
        if(r.args.length) document.dispatchEvent(new CustomEvent('fd-map-select-cabin',{detail:{cabinId:r.args[0]}}));
        break;
      default:
        if(serviceViews[r.name]) {
          call(serviceViews[r.name][0],r.args);
          if(['menu','setups','tarfihi','maiya','hospitality'].indexOf(r.name)!==-1) {
            var back=document.querySelector('#'+r.name+'-detail button[onclick="'+serviceViews[r.name][1]+'()"]');
            if(back) back.setAttribute('aria-label',fdOpenedFromGuestServices() ? 'العودة إلى خدمات إقامتك' : r.parent && r.parent.name==='cabin' ? (r.parent.args[0]===11 ? 'العودة إلى الحديقة' : 'العودة إلى الكوخ') : 'العودة إلى الخدمات');
          }
        }
    }
  }
  function closeView(r){
    var close={home:'goBackToDestination',resort:'goBack',chalet:'goBack2',
      services:'closeServices',faq:'closeFaq',faq2:'closeFaq2',contact:'closeContact',
      cabin:'closeM','chalet-detail':'closeM','chalet-faq':'closeChaletFaq',photos:'closeFS',tour:'closeIframe',order:'closeOrderPopup','menu-cart':'closeMenuCartReview'};
    if(r.name==='cabin-compare'){
      FD_CABIN_COMPARE.hide();
    } else if(r.name==='dome-gallery'){
      FD_DOME_GALLERY.hide();
    } else if(r.name==='map-photos'){
      document.dispatchEvent(new CustomEvent('fd-map-photos-close'));
    } else if(r.name==='chalet-map'){
      FD_CHALET_MAP.hide();
    } else if(r.name==='map'){
      var dialog=document.getElementById('fd-map-dialog');
      if(dialog && dialog.open) dialog.close();
    } else if(close[r.name]) {
      call(close[r.name]);
      if((r.name==='cabin' || r.name==='tour') && r.parent && r.parent.name==='map') document.dispatchEvent(new CustomEvent('fd-map-resume'));
    }
    else if(serviceViews[r.name]) {
      call(serviceViews[r.name][1]);
    }
  }
  var defaultPageTitle=document.title;
  var defaultPageDescription=document.querySelector('meta[name="description"]').content;
  function updatePagePreview(r){
    // Temporary dialogs keep the title of the underlying shareable page.
    var pageRoute=r;
    while(pageRoute && !sharePage(pageRoute)) pageRoute=pageRoute.parent;
    var preview=(pageRoute && sharePage(pageRoute)) || {title:defaultPageTitle,description:defaultPageDescription,path:'/'};
    document.title=preview.title;
    ['meta[property="og:title"]','meta[name="twitter:title"]'].forEach(function(selector){var el=document.querySelector(selector);if(el)el.content=preview.title;});
    ['meta[name="description"]','meta[property="og:description"]','meta[name="twitter:description"]'].forEach(function(selector){var el=document.querySelector(selector);if(el)el.content=preview.description;});
    document.querySelector('meta[property="og:url"]').content=location.origin+preview.path;
    document.querySelector('link[rel="canonical"]').href=location.origin+preview.path;
  }
  function renderRoute(next){
    var before=pathFor(current), after=pathFor(next), common=0;
    while(common<before.length && common<after.length && key(before[common])===key(after[common])) common++;
    rendering=true;
    try{
      for(var i=before.length-1;i>=common;i--) closeView(before[i]);
      for(var j=common;j<after.length;j++) openView(after[j]);
      current=next;
      updatePagePreview(next);
      document.body.style.overflow=after.some(function(r){
        return ['cabin','chalet-detail','photos','dome-gallery','tour','setups','hospitality','walaa','map','chalet-map'].indexOf(r.name)!==-1;
      }) ? 'hidden' : '';
    } finally { rendering=false; }
  }
  function navigate(next,replace){
    if(waitingForBack || key(next)===key(current)) return;
    var previous=key(current);
    var oldState=history.state;
    renderRoute(next);
    var state={fdNavigation:version,route:next,previous:replace && oldState ? oldState.previous : previous};
    history[replace ? 'replaceState' : 'pushState'](state,'',urlFor(next));
  }
  function returnTo(parent){
    if(waitingForBack) return;
    parent=parent || current.parent || route('dest');
    var state=history.state;
    if(state && state.fdNavigation===version && state.previous===key(parent)){
      waitingForBack=true;
      history.back();
    } else navigate(parent,true);
  }
  function wrapOpen(name,makeRoute){
    var original=remember(name);
    window[name]=function(){
      if(rendering) return original.apply(this,arguments);
      var next=makeRoute.apply(null,arguments);
      var replace=(current.name==='cabin' && next.name==='cabin') || (current.name==='menu-cart' && next.name==='order');
      navigate(next,replace);
    };
  }
  function wrapClose(name,parentFor){
    var original=remember(name);
    window[name]=function(){
      if(rendering) return original.apply(this,arguments);
      if(serviceViews[current.name] && serviceViews[current.name][1]===name && fdReturnToGuestServices()) return;
      returnTo(parentFor ? parentFor() : current.parent);
    };
  }
  wrapOpen('showDestination',function(type){return route('home',[type]);});
  wrapOpen('showSection',function(){return route('resort');});
  wrapOpen('showSection2',function(){return route('chalet');});
  wrapOpen('openPrivateChalet',function(){return route('chalet-detail');});
  wrapOpen('showChaletFaq',function(){return route('chalet-faq',[],current.name==='contact' && current.args[0]==='chalet' ? current : null);});
  wrapClose('closeChaletFaq');
  wrapOpen('showServices',function(){return route('services');});
  wrapOpen('showFaq',function(){return route('faq');});
  wrapOpen('showFaq2',function(){return route('faq2',[],current.name==='contact' && current.args[0]==='stay' ? current : null);});
  wrapOpen('showContact',function(type){return route('contact',[type || 'resort']);});
  function cabinRoute(id){
    var parent=current.name==='cabin' ? current.parent : current.name==='map' ? current : null;
    return route('cabin',[id],parent);
  }
  wrapOpen('openM',cabinRoute);
  wrapOpen('openMDirect',function(c){return cabinRoute(c.id);});
  Object.keys(serviceViews).forEach(function(name){
    wrapOpen(serviceViews[name][0],function(tab){return route(name,['hospitality','setups'].indexOf(name)!==-1 ? [tab] : []);});
    wrapClose(serviceViews[name][1]);
  });
  // Tab changes replace this page entry, so Back returns to the caller, not every tab.
  var originalHospitalityTab=remember('showHospitalityTab');
  window.showHospitalityTab=function(tab){
    if(rendering) return originalHospitalityTab(tab);
    navigate(route('hospitality',[tab],current.name==='hospitality' ? current.parent : null),true);
  };
  window.selectSetupsTab=function(tab){
    navigate(route('setups',[tab],current.name==='setups' ? current.parent : null),true);
  };
  ['closeSinemaDetail','closeJalsatDetail','closeTawilatDetail'].forEach(function(name){
    window[name]=function(){window.closeSetupsDetail();};
  });
  document.addEventListener('fd-chalet-map-request',function(){
    if(!rendering && current.name!=='chalet-map') navigate(route('chalet-map',[],current));
  });
  document.addEventListener('fd-chalet-map-dismiss',function(){
    if(!rendering && current.name==='chalet-map') returnTo(current.parent);
  });
  document.addEventListener('fd-compare-open',function(event){
    if(current.name==='resort') navigate(route('cabin-compare',event.detail,current));
  });
  document.addEventListener('fd-compare-dismiss',function(){
    if(current.name==='cabin-compare')returnTo(current.parent);
  });
  window.openAccommodationFaq=function(event,name){
    if(event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return true;
    var expected=current.name==='chalet-detail' ? 'chalet-faq' : current.name==='cabin' ? (current.args[0]>=20 ? 'faq2' : 'faq') : null;
    if(name!==expected) return true;
    event.preventDefault();
    navigate(route(name,[],current));
    return false;
  };
  window.openCabinService=function(event,name){
    if(event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return true;
    if(current.name!=='cabin' || ['menu','jalsat','tawilat','sinema','tarfihi','maiya','hospitality'].indexOf(name)===-1) return true;
    event.preventDefault();
    navigate(route(name,[],current));
    return false;
  };
  wrapOpen('openFS',function(imgs,index,sourceId){return route('photos',[imgs,index || 0,sourceId == null ? null : sourceId],current);});
  document.addEventListener('fd-dome-gallery-request',function(event){
    var cabin=event.detail;
    var matchesCabin=cabin && current.name==='cabin' && current.args[0]===cabin.id;
    var matchesChalet=cabin && current.name==='chalet-detail' && cabin.id===PRIVATE_CHALET.id;
    if(!rendering && (matchesCabin || matchesChalet)){
      navigate(route('dome-gallery',[{id:cabin.id,name:cabin.name}],current));
    }
  });
  document.addEventListener('fd-dome-gallery-dismiss',function(){
    if(!rendering && current.name==='dome-gallery') returnTo(current.parent);
  });
  // Remember the map selection in this entry, including native browser Back/reload.
  document.addEventListener('fd-map-selection-change',function(event){
    if(rendering || current.name!=='map') return;
    var id=event.detail && event.detail.cabinId;
    var args=data.resort.items.some(function(c){return c.id===id;}) ? [id] : [];
    current=route('map',args,current.parent);
    history.replaceState(Object.assign({},history.state,{fdNavigation:version,route:current}),'',urlFor(current));
  });
  // Map photos are a separate view so Back and X return to the selected map cabin.
  document.addEventListener('fd-map-photos-request',function(event){
    var locationKey=event.detail && event.detail.locationKey;
    if(!locationKey) return;
    var parent=current.name==='map' ? current : route('map',[],current);
    navigate(route('map-photos',[locationKey],parent));
  });
  document.addEventListener('fd-map-photos-dismiss',function(){
    if(!rendering && current.name==='map-photos') returnTo(current.parent);
  });
  wrapOpen('open3D',function(url){return route('tour',[url],current);});
  wrapOpen('openOrderPopup',function(name,showTime){
    var parent=current.name==='menu-cart' ? current.parent : current;
    return route('order',[name,!!showTime,_isMenuOrder,['menu','setups','sinema','maiya','tarfihi','tawilat','jalsat'].indexOf(parent.name)!==-1],parent);
  });
  var originalCartReview=remember('openMenuCartReview');
  window.openMenuCartReview=function(){
    if(!Object.keys(_menuCart).length)return originalCartReview();
    navigate(route('menu-cart',[],current.name==='menu' ? current : route('menu')));
  };
  wrapClose('closeMenuCartReview');
  document.addEventListener('keydown',function(event){
    if(event.defaultPrevented || event.key!=='Escape')return;
    if(['photos','menu-cart','cabin','chalet-detail','order','tour','dome-gallery'].indexOf(current.name)!==-1){
      event.preventDefault();returnTo(current.parent);
    }
  });
  ['closeM','closeServices','closeFaq','closeFaq2','closeContact',
    'closeFS','closeIframe','closeOrderPopup','goBack','goBack2'].forEach(function(name){wrapClose(name);});
  wrapClose('goBackToDestination',function(){return route('dest');});
  // A bottom-tab switch is one navigation, not a modal-close plus a page-open.
  window.bottomNav=function(tab){navigate(route(tab==='services' ? 'services' : 'resort'));};
  window.openResortMap=function(){navigate(route('map',[],current));};

  function dismissSplash(){
    clearTimeout(_autoEnterTimer);
    clearTimeout(_enterMainTimer);
    var splash=document.getElementById('splash');
    if(splash){splash.style.display='none';splash.style.pointerEvents='none';}
  }
  function restore(){
    waitingForBack=false;
    dismissSplash();
    var state=history.state;
    var next=state && state.fdNavigation===version && urlFor(state.route)===urlFor(fromHash()) ? state.route : fromHash();
    if(next.name==='menu-cart' && !Object.keys(_menuCart).length)next=next.parent;
    renderRoute(next);
    if(!state || state.fdNavigation!==version || key(next)!==key(state.route) || location.search!==cleanFamilyDayURL().search) history.replaceState({fdNavigation:version,route:next},'',urlFor(next));
  }
  window.addEventListener('popstate',restore);
  window.addEventListener('hashchange',restore);
  window.addEventListener('load',function(){
    // The existing map retains its own rendering and controls.
    var mapButton=document.getElementById('fd-map-open');
    if(mapButton) mapButton.addEventListener('click',function(){
      var dialog=document.getElementById('fd-map-dialog');
      if(!dialog || !dialog.open) return;
      if(!dialog.dataset.fdHistory){
        dialog.dataset.fdHistory='1';
        dialog.addEventListener('close',function(){
          if(!rendering && current.name==='map') returnTo(current.parent);
        });
      }
      if(!rendering && current.name!=='map') navigate(route('map',[],current));
    });
    var state=history.state;
    var next=state && state.fdNavigation===version && urlFor(state.route)===urlFor(fromHash()) ? state.route : fromHash();
    if(next.name==='menu-cart' && !Object.keys(_menuCart).length)next=next.parent;
    if(next.name!=='dest' && key(next)!==key(current)){
      dismissSplash();
      call('goBackToDestination');
      renderRoute(next);
    }
    history.replaceState({fdNavigation:version,route:next,previous:state && state.previous},'',urlFor(next));
    markMainNavigationReady();
  });
  // Native BFCache already preserves the page and its history; do not reload it.
  window.addEventListener('pageshow',function(event){if(event.persisted) restore();});
})();
