// Like the original site, image hints become active only in a visitor's browser.
(function(){document.querySelectorAll('link[data-page-href]').forEach(function(link){link.href=link.dataset.pageHref;});})();
