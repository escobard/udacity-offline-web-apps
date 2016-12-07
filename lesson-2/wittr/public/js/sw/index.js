self.addEventListener('install', function(event){
	event.waitUntil(
		);
});

// fetches event functions of the service worker
self.addEventListener('fetch', function(event) {
	 /* original responses
	 
	   console.log('Service Request');
	  console.log(event.request);
	  
	 
	 // this logs the data requests on page load
	 console.log(event.request);

	 // this loads the event response only if the requested url ends with .jpg
	 if(event.request.url.endsWith('.jpg')) {
	 	event.respondWith(
		 	// respond with a fetch to a GIF
		 	fetch('/imgs/dr-evil.gif')
	 	); 
	 }
	 	/* this is an object
	 	new Response('<strong class="a-winner-is-me">Hello <br>World<br></strong>', {
	 	// the headers property takes an object of header's and values
	 		headers: {'content-type':'text/html' }
	 	}) */	
	event.respondWith(
		// creates the fetch event where the request is fetched
		fetch(event.request)
		// creates the then statement if the fetch promise was succesful
		.then(function(response) {
			// if response fails
			if (response.status == 404){
				return fetch('/imgs/dr-evil.gif');
			}
			// otherwise return the response
			return response;
		})
		// this catches an error for the ORIGINAL fetch request, this will run in cases the application is offline
		.catch(function(){
			// this is the returned response when the original fetch event is rejected / failed
			return new Response('Uh oh, that totally failed')
		})
		);
});