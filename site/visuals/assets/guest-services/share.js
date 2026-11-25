(function () {
  'use strict';
  var button = document.getElementById('share-page');
  var dialog = document.getElementById('share-dialog');
  var status = document.getElementById('share-status');
  var timer;
  button.addEventListener('click', async function () {
    var canonical = document.querySelector('link[rel="canonical"]');
    var path = canonical ? new URL(canonical.href).pathname : location.pathname;
    var url = new URL(path, location.origin).href;
    try {
      if (navigator.share) {
        await navigator.share({title: document.title, url: url});
        return;
      }
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(url);
      status.textContent = 'تم نسخ رابط خدمات إقامتك';
      status.classList.add('visible');
      clearTimeout(timer);
      timer = setTimeout(function () {status.classList.remove('visible');}, 3500);
    } catch (error) {
      if (error.name === 'AbortError') return;
      document.getElementById('share-link').value = url;
      dialog.showModal();
      document.getElementById('share-link').select();
    }
  });
  document.getElementById('close-share').addEventListener('click', function () {dialog.close();});
})();
