self.addEventListener('fetch', function(event) {
	 /* original responses
	 
	   console.log('Service Request');
	  console.log(event.request);
	  */
	 
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
});