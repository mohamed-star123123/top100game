// Service worker: handles the Mute / Delete buttons on message notifications.
self.addEventListener('install', function (e) { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('notificationclick', function (e) {
  var d = (e.notification && e.notification.data) || {};
  var act = e.action || 'open';
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      if (list.length) {
        list[0].postMessage({ t: 'nact', a: act, code: d.code, idx: d.idx });
        return list[0].focus();
      }
      var url = './?nact=' + encodeURIComponent(act) + '&code=' + encodeURIComponent(d.code || '') + '&idx=' + encodeURIComponent(d.idx == null ? '' : d.idx);
      return self.clients.openWindow(url);
    })
  );
});
