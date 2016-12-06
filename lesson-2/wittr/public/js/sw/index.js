self.addEventListener('fetch', function(event) {
	  console.log('Service Request');
	  console.log(event.request);
});