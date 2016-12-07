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
			return new Response('Whoops, not found');
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

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJEOi9Eb2N1bWVudHMvU2Nob29sL1VkYWNpdHkvY291cnNlcy9vZmZsaW5lLWFwcGxpY2F0aW9ucy9sZXNzb24tMi93aXR0ci9wdWJsaWMvanMvc3cvaW5kZXguanMiLCJEOi9Eb2N1bWVudHMvU2Nob29sL1VkYWNpdHkvY291cnNlcy9vZmZsaW5lLWFwcGxpY2F0aW9ucy9sZXNzb24tMi93aXR0ci9wdWJsaWMvanMvc3cvcHJlcm9sbC9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxVQUFTLEtBQUssRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBc0I5QyxNQUFLLENBQUMsV0FBVzs7QUFFaEIsTUFBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7O0VBRW5CLElBQUksQ0FBQyxVQUFTLFFBQVEsRUFBRTs7QUFFeEIsTUFBSSxRQUFRLENBQUMsTUFBTSxJQUFJLEdBQUcsRUFBQztBQUMxQixVQUFPLElBQUksUUFBUSxDQUFDLG1CQUFtQixDQUFDLENBQUM7R0FDekM7O0FBRUQsU0FBTyxRQUFRLENBQUM7RUFDaEIsQ0FBQzs7VUFFSSxDQUFDLFlBQVU7O0FBRWhCLFNBQU8sSUFBSSxRQUFRLENBQUMsNEJBQTRCLENBQUMsQ0FBQTtFQUNqRCxDQUFDLENBQ0QsQ0FBQztDQUNILENBQUMsQ0FBQzs7Ozs7QUN4Q0gsSUFBSSxDQUFDLEdBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUE7QUFDdEMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUMsWUFBVTtBQUFDLFNBQU8sSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUFDLEtBQUssQ0FBQyxHQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFDLFNBQVMsQ0FBQyxDQUFBO0NBQUMsQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJzZWxmLmFkZEV2ZW50TGlzdGVuZXIoJ2ZldGNoJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHQgLyogb3JpZ2luYWwgcmVzcG9uc2VzXHJcblx0IFxyXG5cdCAgIGNvbnNvbGUubG9nKCdTZXJ2aWNlIFJlcXVlc3QnKTtcclxuXHQgIGNvbnNvbGUubG9nKGV2ZW50LnJlcXVlc3QpO1xyXG5cdCAgXHJcblx0IFxyXG5cdCAvLyB0aGlzIGxvZ3MgdGhlIGRhdGEgcmVxdWVzdHMgb24gcGFnZSBsb2FkXHJcblx0IGNvbnNvbGUubG9nKGV2ZW50LnJlcXVlc3QpO1xyXG5cclxuXHQgLy8gdGhpcyBsb2FkcyB0aGUgZXZlbnQgcmVzcG9uc2Ugb25seSBpZiB0aGUgcmVxdWVzdGVkIHVybCBlbmRzIHdpdGggLmpwZ1xyXG5cdCBpZihldmVudC5yZXF1ZXN0LnVybC5lbmRzV2l0aCgnLmpwZycpKSB7XHJcblx0IFx0ZXZlbnQucmVzcG9uZFdpdGgoXHJcblx0XHQgXHQvLyByZXNwb25kIHdpdGggYSBmZXRjaCB0byBhIEdJRlxyXG5cdFx0IFx0ZmV0Y2goJy9pbWdzL2RyLWV2aWwuZ2lmJylcclxuXHQgXHQpOyBcclxuXHQgfVxyXG5cdCBcdC8qIHRoaXMgaXMgYW4gb2JqZWN0XHJcblx0IFx0bmV3IFJlc3BvbnNlKCc8c3Ryb25nIGNsYXNzPVwiYS13aW5uZXItaXMtbWVcIj5IZWxsbyA8YnI+V29ybGQ8YnI+PC9zdHJvbmc+Jywge1xyXG5cdCBcdC8vIHRoZSBoZWFkZXJzIHByb3BlcnR5IHRha2VzIGFuIG9iamVjdCBvZiBoZWFkZXIncyBhbmQgdmFsdWVzXHJcblx0IFx0XHRoZWFkZXJzOiB7J2NvbnRlbnQtdHlwZSc6J3RleHQvaHRtbCcgfVxyXG5cdCBcdH0pICovXHRcclxuXHRldmVudC5yZXNwb25kV2l0aChcclxuXHRcdC8vIGNyZWF0ZXMgdGhlIGZldGNoIGV2ZW50IHdoZXJlIHRoZSByZXF1ZXN0IGlzIGZldGNoZWRcclxuXHRcdGZldGNoKGV2ZW50LnJlcXVlc3QpXHJcblx0XHQvLyBjcmVhdGVzIHRoZSB0aGVuIHN0YXRlbWVudCBpZiB0aGUgZmV0Y2ggcHJvbWlzZSB3YXMgc3VjY2VzZnVsXHJcblx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG5cdFx0XHQvLyBpZiByZXNwb25zZSBmYWlsc1xyXG5cdFx0XHRpZiAocmVzcG9uc2Uuc3RhdHVzID09IDQwNCl7XHJcblx0XHRcdFx0cmV0dXJuIG5ldyBSZXNwb25zZSgnV2hvb3BzLCBub3QgZm91bmQnKTtcclxuXHRcdFx0fVxyXG5cdFx0XHQvLyBvdGhlcndpc2UgcmV0dXJuIHRoZSByZXNwb25zZVxyXG5cdFx0XHRyZXR1cm4gcmVzcG9uc2U7XHJcblx0XHR9KVxyXG5cdFx0Ly8gdGhpcyBjYXRjaGVzIGFuIGVycm9yIGZvciB0aGUgT1JJR0lOQUwgZmV0Y2ggcmVxdWVzdCwgdGhpcyB3aWxsIHJ1biBpbiBjYXNlcyB0aGUgYXBwbGljYXRpb24gaXMgb2ZmbGluZVxyXG5cdFx0LmNhdGNoKGZ1bmN0aW9uKCl7XHJcblx0XHRcdC8vIHRoaXMgaXMgdGhlIHJldHVybmVkIHJlc3BvbnNlIHdoZW4gdGhlIG9yaWdpbmFsIGZldGNoIGV2ZW50IGlzIHJlamVjdGVkIC8gZmFpbGVkXHJcblx0XHRcdHJldHVybiBuZXcgUmVzcG9uc2UoJ1VoIG9oLCB0aGF0IHRvdGFsbHkgZmFpbGVkJylcclxuXHRcdH0pXHJcblx0XHQpO1xyXG59KTsiLCJ2YXIgcj1GZXRjaEV2ZW50LnByb3RvdHlwZS5yZXNwb25kV2l0aFxyXG5GZXRjaEV2ZW50LnByb3RvdHlwZS5yZXNwb25kV2l0aD1mdW5jdGlvbigpe3JldHVybiBuZXcgVVJMKHRoaXMucmVxdWVzdC51cmwpLnNlYXJjaC5lbmRzV2l0aChcImJ5cGFzcy1zd1wiKT92b2lkIDA6ci5hcHBseSh0aGlzLGFyZ3VtZW50cyl9Il19