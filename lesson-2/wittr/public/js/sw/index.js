self.addEventListener('fetch', function(event) {
	 /* original responses
	 
	   console.log('Service Request');
	  console.log(event.request);
	  */
	 event.respondWith(
	 	// this is an object
	 	new Response('Hello <br>World<br>', {
	 	// the headers property takes an object of header's and values
	 		headers: {'foo':'bar' }
	 	})
	 	);
});