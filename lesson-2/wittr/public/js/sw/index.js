self.addEventListener('fetch', function(event) {
	 /* original responses
	 
	   console.log('Service Request');
	  console.log(event.request);
	  */
	 event.respondWith(
	 	new Response('Hello World')
	 	);
});