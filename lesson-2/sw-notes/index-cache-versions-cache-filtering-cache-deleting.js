// if versions are getting to a higher iteration number (say 19-20) it will get messy deleting caches since users might be on 14-17 and are
// requesting #18.
// To avoid complications, we create a variable to store the current cacche
var staticCacheName = 'wittr-static-v2';

self.addEventListener('install', function(event) {
  event.waitUntil(
    // TODO: change the site's theme, eg swap the vars in public/scss/_theme.scss
    // Ensure at least $primary-color changes
    // TODO: change cache name to 'wittr-static-v2'
    // changed from witter-static-v1
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll([
        '/',
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

    // this grabs all of the cache names that currently exsist
    caches.keys().then(function(cacheNames){
    // wraps the filter, and the map promise in a Promise.all which waits until all the promises are completed to return the Promise.resolve
    return Promise.all(
      // creates a filter for the cache names after the caches have been requested
      cacheNames.filter(function(cacheName){
        // only return cache that returns with the set string
        // this grabs a list of caches we don't need anymore, if the exsist, grabbing all caches except for our static cache
        return cacheName.startWith('wittr-') && cacheName != staticCacheName;
      })// this maps the caches returning a promise for each matching request, or grabs each individual cache in 
      // the caches array and then does something with them
      .map(function(cacheName){
        // this deletes the caches that do not match the string in the cacheNames filter funciton, or the static cache
        return cache.delete(cacheName);
      })
    );
  })

  // this was grabbed from the instructor notes, deletes the old cache without any issues.   
  // this is the quick solution, deprecating for scalable solution above
  //  return caches.delete('witter-static-v1')


  // this was grabbed from : https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
  // Not working too well in our case, will review instructor quiz
    /*
     caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (cacheWhitelist.indexOf(key) === -1) {
          return caches.delete(key);
        }
      }));
    })*/
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});