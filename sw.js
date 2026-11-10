/* (c) BM Technologies. Confidential. All rights reserved. Premset Site Book field app: offline cache. */
const V='psb-field-ac785e3a2ae5';
const FILES=["./", "index.html", "live.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png", "pdf.min.mjs", "pdf.worker.min.mjs", "pdf-lib.min.js"];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(V).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})))).then(()=>{ if(!self.registration.active) return self.skipWaiting(); })); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k.startsWith('psb-field-')).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('message',e=>{ if(e.data==='skip') self.skipWaiting(); });
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return; const u=new URL(r.url); if(u.origin!==location.origin) return;
  if(r.mode==='navigate'){ const live=/\/live(\.html)?$/.test(u.pathname);
    /* supervisor website: always the newest copy when online (it needs signal anyway); field app: the cached copy, so it opens with no signal */
    if(live){ e.respondWith(fetch(r,{cache:'no-store'}).then(res=>{ if(res.ok){ const c=res.clone(); caches.open(V).then(x=>x.put('live.html',c)); } return res; }).catch(()=>caches.match('live.html',{cacheName:V}))); return; }
    e.respondWith(caches.match('index.html',{cacheName:V}).then(m=>m||fetch(r))); return; }
  e.respondWith(caches.match(r,{ignoreSearch:true,cacheName:V}).then(m=>m||fetch(r).catch(()=>new Response('',{status:404}))));
});
