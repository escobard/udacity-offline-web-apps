self.addEventListener('fetch', function(event) {
	 /* original responses
	 
	   console.log('Service Request');
	  console.log(event.request);
	  */
	 event.respondWith(
	 	// this is an object
	 	new Response('<strong class="a-winner-is-me">Hello <br>World<br></strong>', {
	 	// the headers property takes an object of header's and values
	 		headers: {'content-type':'text/html' }
	 	})
	 	);
});