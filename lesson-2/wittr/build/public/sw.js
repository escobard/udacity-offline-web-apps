(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

self.addEventListener('install', function (event) {
	event.waitUntil();
});

// fetches event functions of the service worker
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

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJEOi9Eb2N1bWVudHMvU2Nob29sL1VkYWNpdHkvY291cnNlcy9vZmZsaW5lLWFwcGxpY2F0aW9ucy9sZXNzb24tMi93aXR0ci9wdWJsaWMvanMvc3cvaW5kZXguanMiLCJEOi9Eb2N1bWVudHMvU2Nob29sL1VkYWNpdHkvY291cnNlcy9vZmZsaW5lLWFwcGxpY2F0aW9ucy9sZXNzb24tMi93aXR0ci9wdWJsaWMvanMvc3cvcHJlcm9sbC9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxVQUFTLEtBQUssRUFBQztBQUMvQyxNQUFLLENBQUMsU0FBUyxFQUNiLENBQUM7Q0FDSCxDQUFDLENBQUM7OztBQUdILElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsVUFBUyxLQUFLLEVBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXNCOUMsTUFBSyxDQUFDLFdBQVc7O0FBRWhCLE1BQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDOztFQUVuQixJQUFJLENBQUMsVUFBUyxRQUFRLEVBQUU7O0FBRXhCLE1BQUksUUFBUSxDQUFDLE1BQU0sSUFBSSxHQUFHLEVBQUM7QUFDMUIsVUFBTyxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBQztHQUNsQzs7QUFFRCxTQUFPLFFBQVEsQ0FBQztFQUNoQixDQUFDOztVQUVJLENBQUMsWUFBVTs7QUFFaEIsU0FBTyxJQUFJLFFBQVEsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFBO0VBQ2pELENBQUMsQ0FDRCxDQUFDO0NBQ0gsQ0FBQyxDQUFDOzs7OztBQzlDSCxJQUFJLENBQUMsR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQTtBQUN0QyxVQUFVLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBQyxZQUFVO0FBQUMsU0FBTyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEdBQUMsS0FBSyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUMsU0FBUyxDQUFDLENBQUE7Q0FBQyxDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInNlbGYuYWRkRXZlbnRMaXN0ZW5lcignaW5zdGFsbCcsIGZ1bmN0aW9uKGV2ZW50KXtcclxuXHRldmVudC53YWl0VW50aWwoXHJcblx0XHQpO1xyXG59KTtcclxuXHJcbi8vIGZldGNoZXMgZXZlbnQgZnVuY3Rpb25zIG9mIHRoZSBzZXJ2aWNlIHdvcmtlclxyXG5zZWxmLmFkZEV2ZW50TGlzdGVuZXIoJ2ZldGNoJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHQgLyogb3JpZ2luYWwgcmVzcG9uc2VzXHJcblx0IFxyXG5cdCAgIGNvbnNvbGUubG9nKCdTZXJ2aWNlIFJlcXVlc3QnKTtcclxuXHQgIGNvbnNvbGUubG9nKGV2ZW50LnJlcXVlc3QpO1xyXG5cdCAgXHJcblx0IFxyXG5cdCAvLyB0aGlzIGxvZ3MgdGhlIGRhdGEgcmVxdWVzdHMgb24gcGFnZSBsb2FkXHJcblx0IGNvbnNvbGUubG9nKGV2ZW50LnJlcXVlc3QpO1xyXG5cclxuXHQgLy8gdGhpcyBsb2FkcyB0aGUgZXZlbnQgcmVzcG9uc2Ugb25seSBpZiB0aGUgcmVxdWVzdGVkIHVybCBlbmRzIHdpdGggLmpwZ1xyXG5cdCBpZihldmVudC5yZXF1ZXN0LnVybC5lbmRzV2l0aCgnLmpwZycpKSB7XHJcblx0IFx0ZXZlbnQucmVzcG9uZFdpdGgoXHJcblx0XHQgXHQvLyByZXNwb25kIHdpdGggYSBmZXRjaCB0byBhIEdJRlxyXG5cdFx0IFx0ZmV0Y2goJy9pbWdzL2RyLWV2aWwuZ2lmJylcclxuXHQgXHQpOyBcclxuXHQgfVxyXG5cdCBcdC8qIHRoaXMgaXMgYW4gb2JqZWN0XHJcblx0IFx0bmV3IFJlc3BvbnNlKCc8c3Ryb25nIGNsYXNzPVwiYS13aW5uZXItaXMtbWVcIj5IZWxsbyA8YnI+V29ybGQ8YnI+PC9zdHJvbmc+Jywge1xyXG5cdCBcdC8vIHRoZSBoZWFkZXJzIHByb3BlcnR5IHRha2VzIGFuIG9iamVjdCBvZiBoZWFkZXIncyBhbmQgdmFsdWVzXHJcblx0IFx0XHRoZWFkZXJzOiB7J2NvbnRlbnQtdHlwZSc6J3RleHQvaHRtbCcgfVxyXG5cdCBcdH0pICovXHRcclxuXHRldmVudC5yZXNwb25kV2l0aChcclxuXHRcdC8vIGNyZWF0ZXMgdGhlIGZldGNoIGV2ZW50IHdoZXJlIHRoZSByZXF1ZXN0IGlzIGZldGNoZWRcclxuXHRcdGZldGNoKGV2ZW50LnJlcXVlc3QpXHJcblx0XHQvLyBjcmVhdGVzIHRoZSB0aGVuIHN0YXRlbWVudCBpZiB0aGUgZmV0Y2ggcHJvbWlzZSB3YXMgc3VjY2VzZnVsXHJcblx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG5cdFx0XHQvLyBpZiByZXNwb25zZSBmYWlsc1xyXG5cdFx0XHRpZiAocmVzcG9uc2Uuc3RhdHVzID09IDQwNCl7XHJcblx0XHRcdFx0cmV0dXJuIGZldGNoKCcvaW1ncy9kci1ldmlsLmdpZicpO1xyXG5cdFx0XHR9XHJcblx0XHRcdC8vIG90aGVyd2lzZSByZXR1cm4gdGhlIHJlc3BvbnNlXHJcblx0XHRcdHJldHVybiByZXNwb25zZTtcclxuXHRcdH0pXHJcblx0XHQvLyB0aGlzIGNhdGNoZXMgYW4gZXJyb3IgZm9yIHRoZSBPUklHSU5BTCBmZXRjaCByZXF1ZXN0LCB0aGlzIHdpbGwgcnVuIGluIGNhc2VzIHRoZSBhcHBsaWNhdGlvbiBpcyBvZmZsaW5lXHJcblx0XHQuY2F0Y2goZnVuY3Rpb24oKXtcclxuXHRcdFx0Ly8gdGhpcyBpcyB0aGUgcmV0dXJuZWQgcmVzcG9uc2Ugd2hlbiB0aGUgb3JpZ2luYWwgZmV0Y2ggZXZlbnQgaXMgcmVqZWN0ZWQgLyBmYWlsZWRcclxuXHRcdFx0cmV0dXJuIG5ldyBSZXNwb25zZSgnVWggb2gsIHRoYXQgdG90YWxseSBmYWlsZWQnKVxyXG5cdFx0fSlcclxuXHRcdCk7XHJcbn0pOyIsInZhciByPUZldGNoRXZlbnQucHJvdG90eXBlLnJlc3BvbmRXaXRoXHJcbkZldGNoRXZlbnQucHJvdG90eXBlLnJlc3BvbmRXaXRoPWZ1bmN0aW9uKCl7cmV0dXJuIG5ldyBVUkwodGhpcy5yZXF1ZXN0LnVybCkuc2VhcmNoLmVuZHNXaXRoKFwiYnlwYXNzLXN3XCIpP3ZvaWQgMDpyLmFwcGx5KHRoaXMsYXJndW1lbnRzKX0iXX0=