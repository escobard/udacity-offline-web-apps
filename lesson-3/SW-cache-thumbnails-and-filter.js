var staticCacheName = 'wittr-static-v7';

// variable to contain the images cache
var contentImgsCache = 'wittr-content-imgs';

// array to hold the cache names we care about
var allCaches = [
  staticCacheName,
  contentImgsCache
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll([
        '/skeleton',
        'js/main.js',
        'css/main.css',
        'imgs/icon.png',
        'https://fonts.gstatic.com/s/roboto/v15/2UX7WLTfW3W8TclTUvlFyQ.woff',
        'https://fonts.gstatic.com/s/roboto/v15/d-6IYplOFocCacKzxwXSOD8E0i7KZn-EPnyo3HZu7kw.woff'
      ]);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('wittr-') &&
          // returns only the caches containing the string above, within the allCaches array
                 !allCaches.includes(cacheName);
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  var requestUrl = new URL(event.request.url);

  if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname === '/') {
      event.respondWith(caches.match('/skeleton'));
      return;
    }

    // handles fetch requests of files that start with the path name /photos/
    if (requestUrl.pathname.startsWith('/photos/')) {
      // this responds to this event with the servePhoto function, with the event.request argument
      event.respondWith(servePhoto(event.request));
      return;
    }
  }
 // TODO: respond to avatar urls by responding with
    // the return value of serveAvatar(event.request)
    // my own answer
    if (requestUrl.pathname.startsWith('/avatars/')) {
      event.respondWith(serveAvatar(event.request));
      return;
    }


  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});

function serveAvatar(request) {
  // Avatar urls look like:
  // avatars/sam-2x.jpg
  // But storageUrl has the -2x.jpg bit missing.
  // Use this url to store & match the image in the cache.
  // This means you only store one copy of each avatar.
  var storageUrl = request.url.replace(/-\dx\.jpg$/, '');

  // TODO: return images from the "wittr-content-imgs" cache
  // if they're in there. But afterwards, go to the network
  // to update the entry in the cache.
  //
  // Note that this is slightly different to servePhoto!
  
  /* my own answer
  return caches.open(contentImgsCache).then(function(cache) {
    return cache.match(storageUrl).then(function(response) {
      if (response) return response;

      return fetch(request).then(function(networkResponse) {
        cache.put(storageUrl, networkResponse.clone());
        return networkResponse;
      });
    });  
}); */

  // instructor answer:
  return caches.open(contentImgsCache).then(function(cache){
    return cache.match(storageUrl).then(function(response){

      // if there is a response to the storageUrl regex
      var networkFetch = fetch(request).then(function(networkResponse){

        //copies the url and data over to the imagsCache
        cache.put(storageUrl, networkResponse.clone());

        // returns the networkFetch fetch.then promise function argument
        return networkResponse;
      });

    // returns the caches.match response or he networkFetch response
    return response || networkFetch;
    });
  });
}
//
// this is the response to the photo fetch if event handler
function servePhoto(request) {
  // Photo urls look like:
  // /photos/9-8028-7527734776-e1d2bda28e-800px.jpg
  // But storageUrl has the -800px.jpg bit missing.
  // Use this url to store & match the image in the cache.
  // This means you only store one copy of each photo.
  // this grabs the Regex used to store images, and responds with the appropriate image dimension based on browser size, very neat
  var storageUrl = request.url.replace(/-\d+px\.jpg$/, '');

  // TODO: return images from the "wittr-content-imgs" cache
  // if they're in there. Otherwise, fetch the images from
  // the network, put them into the cache, and send it back
  // to the browser.
  //
  // HINT: cache.put supports a plain url as the first parameter

  return caches.open(contentImgsCache).then(function(cache){
    return cache.match(storageUrl).then(function(response){
      // fetches the image from the cache if already stored within the cache if already stored
      if(response) return response;

      // if not, returns a fetch promise
      return fetch(request).then(function(networkResponse){
        cache.put(storageUrl, networkResponse.clone());
        return networkResponse;
      });
    });
  })
}

self.addEventListener('message', function(event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});