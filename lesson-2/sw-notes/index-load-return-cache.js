self.addEventListener('install', function(event) {
  var urlsToCache = [
    '/',
    'js/main.js',
    'css/main.css',
    'imgs/icon.png',
    'https://fonts.gstatic.com/s/roboto/v15/2UX7WLTfW3W8TclTUvlFyQ.woff',
    'https://fonts.gstatic.com/s/roboto/v15/d-6IYplOFocCacKzxwXSOD8E0i7KZn-EPnyo3HZu7kw.woff'
  ];

  event.waitUntil(
    // TODO: open a cache named 'wittr-static-v1'
    // Add cache the urls from urlsToCache
    caches.open('wittr-static-v1')
    .then(function(cache){
    	return cache.addAll(urlsToCache);
    })
    
  );
});

self.addEventListener('fetch', function(event) {
  // Leave this blank for now.
  // We'll get to this in the next task.
  // creates the fetch response grabbing the cache
  event.respondWith(
  	// attempts to match cache files with event.request.
  	// if no matches are found, the promise will return as unresolved / undefined
  	caches.match(event.request).then(function(response){
  		// if the request is true(thy) and has a response, then we return it with an if statement
      /* better written alternative below 
  		if (response) return response;
  		// if not, then we return a fetch to the network with the original request (this will not work offline)
  		return fetch(event.request);*/
      return (response) || return fetch(event.request)
  	})
  );
});