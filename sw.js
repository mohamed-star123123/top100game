// Service worker: offline cache + Mute/Delete buttons on message notifications.
var C='top100game-v2';
var FILES=['./','index.html','manifest.json','icon-192.png','icon-512.png','apple-touch-icon.png','og.png'];
self.addEventListener('install',function(e){self.skipWaiting();e.waitUntil(caches.open(C).then(function(c){return Promise.all(FILES.map(function(f){return c.add(f).catch(function(){});}));}));});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(n){return n!==C;}).map(function(n){return caches.delete(n);}));}).then(function(){return self.clients.claim();}));});
self.addEventListener('fetch',function(e){var r=e.request;if(r.method!=='GET')return;
 e.respondWith(fetch(r).then(function(res){if(res&&(res.ok||res.type==='opaque')){var cp=res.clone();caches.open(C).then(function(c){c.put(r,cp);});}return res;})
  .catch(function(){return caches.match(r).then(function(m){return m||(r.mode==='navigate'?caches.match('index.html'):undefined);});}));});
self.addEventListener('notificationclick',function(e){
 var d=(e.notification&&e.notification.data)||{};var act=e.action||'open';e.notification.close();
 e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(list){
  if(list.length){list[0].postMessage({t:'nact',a:act,code:d.code,idx:d.idx});return list[0].focus();}
  return self.clients.openWindow('./?nact='+encodeURIComponent(act)+'&code='+encodeURIComponent(d.code||'')+'&idx='+encodeURIComponent(d.idx==null?'':d.idx));
 }));});
