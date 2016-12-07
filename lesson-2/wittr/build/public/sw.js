(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

self.addEventListener('fetch', function (event) {
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
	.then(function (response) {
		// if response fails
		if (response.status == 404) {
			return fetch('/imgs/dr-evil.gif');
		}
		// otherwise return the response
		return response;
	})
	// this catches an error for the ORIGINAL fetch request, this will run in cases the application is offline
	['catch'](function () {
		// this is the returned response when the original fetch event is rejected / failed
		return new Response('Uh oh, that totally failed');
	}));
});

},{}],2:[function(require,module,exports){
"use strict";

var r = FetchEvent.prototype.respondWith;
FetchEvent.prototype.respondWith = function () {
  return new URL(this.request.url).search.endsWith("bypass-sw") ? void 0 : r.apply(this, arguments);
};

},{}]},{},[1,2])

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJEOi9Eb2N1bWVudHMvU2Nob29sL1VkYWNpdHkvY291cnNlcy9vZmZsaW5lLWFwcGxpY2F0aW9ucy9sZXNzb24tMi93aXR0ci9wdWJsaWMvanMvc3cvaW5kZXguanMiLCJEOi9Eb2N1bWVudHMvU2Nob29sL1VkYWNpdHkvY291cnNlcy9vZmZsaW5lLWFwcGxpY2F0aW9ucy9sZXNzb24tMi93aXR0ci9wdWJsaWMvanMvc3cvcHJlcm9sbC9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxVQUFTLEtBQUssRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBc0I5QyxNQUFLLENBQUMsV0FBVzs7QUFFaEIsTUFBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7O0VBRW5CLElBQUksQ0FBQyxVQUFTLFFBQVEsRUFBRTs7QUFFeEIsTUFBSSxRQUFRLENBQUMsTUFBTSxJQUFJLEdBQUcsRUFBQztBQUMxQixVQUFPLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0dBQ2xDOztBQUVELFNBQU8sUUFBUSxDQUFDO0VBQ2hCLENBQUM7O1VBRUksQ0FBQyxZQUFVOztBQUVoQixTQUFPLElBQUksUUFBUSxDQUFDLDRCQUE0QixDQUFDLENBQUE7RUFDakQsQ0FBQyxDQUNELENBQUM7Q0FDSCxDQUFDLENBQUM7Ozs7O0FDeENILElBQUksQ0FBQyxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFBO0FBQ3RDLFVBQVUsQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFDLFlBQVU7QUFBQyxTQUFPLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsR0FBQyxLQUFLLENBQUMsR0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksRUFBQyxTQUFTLENBQUMsQ0FBQTtDQUFDLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwic2VsZi5hZGRFdmVudExpc3RlbmVyKCdmZXRjaCcsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0IC8qIG9yaWdpbmFsIHJlc3BvbnNlc1xyXG5cdCBcclxuXHQgICBjb25zb2xlLmxvZygnU2VydmljZSBSZXF1ZXN0Jyk7XHJcblx0ICBjb25zb2xlLmxvZyhldmVudC5yZXF1ZXN0KTtcclxuXHQgIFxyXG5cdCBcclxuXHQgLy8gdGhpcyBsb2dzIHRoZSBkYXRhIHJlcXVlc3RzIG9uIHBhZ2UgbG9hZFxyXG5cdCBjb25zb2xlLmxvZyhldmVudC5yZXF1ZXN0KTtcclxuXHJcblx0IC8vIHRoaXMgbG9hZHMgdGhlIGV2ZW50IHJlc3BvbnNlIG9ubHkgaWYgdGhlIHJlcXVlc3RlZCB1cmwgZW5kcyB3aXRoIC5qcGdcclxuXHQgaWYoZXZlbnQucmVxdWVzdC51cmwuZW5kc1dpdGgoJy5qcGcnKSkge1xyXG5cdCBcdGV2ZW50LnJlc3BvbmRXaXRoKFxyXG5cdFx0IFx0Ly8gcmVzcG9uZCB3aXRoIGEgZmV0Y2ggdG8gYSBHSUZcclxuXHRcdCBcdGZldGNoKCcvaW1ncy9kci1ldmlsLmdpZicpXHJcblx0IFx0KTsgXHJcblx0IH1cclxuXHQgXHQvKiB0aGlzIGlzIGFuIG9iamVjdFxyXG5cdCBcdG5ldyBSZXNwb25zZSgnPHN0cm9uZyBjbGFzcz1cImEtd2lubmVyLWlzLW1lXCI+SGVsbG8gPGJyPldvcmxkPGJyPjwvc3Ryb25nPicsIHtcclxuXHQgXHQvLyB0aGUgaGVhZGVycyBwcm9wZXJ0eSB0YWtlcyBhbiBvYmplY3Qgb2YgaGVhZGVyJ3MgYW5kIHZhbHVlc1xyXG5cdCBcdFx0aGVhZGVyczogeydjb250ZW50LXR5cGUnOid0ZXh0L2h0bWwnIH1cclxuXHQgXHR9KSAqL1x0XHJcblx0ZXZlbnQucmVzcG9uZFdpdGgoXHJcblx0XHQvLyBjcmVhdGVzIHRoZSBmZXRjaCBldmVudCB3aGVyZSB0aGUgcmVxdWVzdCBpcyBmZXRjaGVkXHJcblx0XHRmZXRjaChldmVudC5yZXF1ZXN0KVxyXG5cdFx0Ly8gY3JlYXRlcyB0aGUgdGhlbiBzdGF0ZW1lbnQgaWYgdGhlIGZldGNoIHByb21pc2Ugd2FzIHN1Y2Nlc2Z1bFxyXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuXHRcdFx0Ly8gaWYgcmVzcG9uc2UgZmFpbHNcclxuXHRcdFx0aWYgKHJlc3BvbnNlLnN0YXR1cyA9PSA0MDQpe1xyXG5cdFx0XHRcdHJldHVybiBmZXRjaCgnL2ltZ3MvZHItZXZpbC5naWYnKTtcclxuXHRcdFx0fVxyXG5cdFx0XHQvLyBvdGhlcndpc2UgcmV0dXJuIHRoZSByZXNwb25zZVxyXG5cdFx0XHRyZXR1cm4gcmVzcG9uc2U7XHJcblx0XHR9KVxyXG5cdFx0Ly8gdGhpcyBjYXRjaGVzIGFuIGVycm9yIGZvciB0aGUgT1JJR0lOQUwgZmV0Y2ggcmVxdWVzdCwgdGhpcyB3aWxsIHJ1biBpbiBjYXNlcyB0aGUgYXBwbGljYXRpb24gaXMgb2ZmbGluZVxyXG5cdFx0LmNhdGNoKGZ1bmN0aW9uKCl7XHJcblx0XHRcdC8vIHRoaXMgaXMgdGhlIHJldHVybmVkIHJlc3BvbnNlIHdoZW4gdGhlIG9yaWdpbmFsIGZldGNoIGV2ZW50IGlzIHJlamVjdGVkIC8gZmFpbGVkXHJcblx0XHRcdHJldHVybiBuZXcgUmVzcG9uc2UoJ1VoIG9oLCB0aGF0IHRvdGFsbHkgZmFpbGVkJylcclxuXHRcdH0pXHJcblx0XHQpO1xyXG59KTsiLCJ2YXIgcj1GZXRjaEV2ZW50LnByb3RvdHlwZS5yZXNwb25kV2l0aFxyXG5GZXRjaEV2ZW50LnByb3RvdHlwZS5yZXNwb25kV2l0aD1mdW5jdGlvbigpe3JldHVybiBuZXcgVVJMKHRoaXMucmVxdWVzdC51cmwpLnNlYXJjaC5lbmRzV2l0aChcImJ5cGFzcy1zd1wiKT92b2lkIDA6ci5hcHBseSh0aGlzLGFyZ3VtZW50cyl9Il19