(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

self.addEventListener('fetch', function (event) {
	/* original responses
 
   console.log('Service Request');
  console.log(event.request);
  */
	event.respondWith(
	// this is an object
	new Response('<strong class="a-winner-is-me">Hello <br>World<br></strong>', {
		// the headers property takes an object of header's and values
		headers: { 'content-type': 'text/html' }
	}));
});

},{}],2:[function(require,module,exports){
"use strict";

var r = FetchEvent.prototype.respondWith;
FetchEvent.prototype.respondWith = function () {
  return new URL(this.request.url).search.endsWith("bypass-sw") ? void 0 : r.apply(this, arguments);
};

},{}]},{},[1,2])

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJEOi9Eb2N1bWVudHMvU2Nob29sL1VkYWNpdHkvY291cnNlcy9vZmZsaW5lLWFwcGxpY2F0aW9ucy9sZXNzb24tMi93aXR0ci9wdWJsaWMvanMvc3cvaW5kZXguanMiLCJEOi9Eb2N1bWVudHMvU2Nob29sL1VkYWNpdHkvY291cnNlcy9vZmZsaW5lLWFwcGxpY2F0aW9ucy9sZXNzb24tMi93aXR0ci9wdWJsaWMvanMvc3cvcHJlcm9sbC9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxVQUFTLEtBQUssRUFBRTs7Ozs7O0FBTTdDLE1BQUssQ0FBQyxXQUFXOztBQUVoQixLQUFJLFFBQVEsQ0FBQyw2REFBNkQsRUFBRTs7QUFFM0UsU0FBTyxFQUFFLEVBQUMsY0FBYyxFQUFDLFdBQVcsRUFBRTtFQUN0QyxDQUFDLENBQ0QsQ0FBQztDQUNKLENBQUMsQ0FBQzs7Ozs7QUNiSCxJQUFJLENBQUMsR0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQTtBQUN0QyxVQUFVLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBQyxZQUFVO0FBQUMsU0FBTyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEdBQUMsS0FBSyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUMsU0FBUyxDQUFDLENBQUE7Q0FBQyxDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInNlbGYuYWRkRXZlbnRMaXN0ZW5lcignZmV0Y2gnLCBmdW5jdGlvbihldmVudCkge1xyXG5cdCAvKiBvcmlnaW5hbCByZXNwb25zZXNcclxuXHQgXHJcblx0ICAgY29uc29sZS5sb2coJ1NlcnZpY2UgUmVxdWVzdCcpO1xyXG5cdCAgY29uc29sZS5sb2coZXZlbnQucmVxdWVzdCk7XHJcblx0ICAqL1xyXG5cdCBldmVudC5yZXNwb25kV2l0aChcclxuXHQgXHQvLyB0aGlzIGlzIGFuIG9iamVjdFxyXG5cdCBcdG5ldyBSZXNwb25zZSgnPHN0cm9uZyBjbGFzcz1cImEtd2lubmVyLWlzLW1lXCI+SGVsbG8gPGJyPldvcmxkPGJyPjwvc3Ryb25nPicsIHtcclxuXHQgXHQvLyB0aGUgaGVhZGVycyBwcm9wZXJ0eSB0YWtlcyBhbiBvYmplY3Qgb2YgaGVhZGVyJ3MgYW5kIHZhbHVlc1xyXG5cdCBcdFx0aGVhZGVyczogeydjb250ZW50LXR5cGUnOid0ZXh0L2h0bWwnIH1cclxuXHQgXHR9KVxyXG5cdCBcdCk7XHJcbn0pOyIsInZhciByPUZldGNoRXZlbnQucHJvdG90eXBlLnJlc3BvbmRXaXRoXHJcbkZldGNoRXZlbnQucHJvdG90eXBlLnJlc3BvbmRXaXRoPWZ1bmN0aW9uKCl7cmV0dXJuIG5ldyBVUkwodGhpcy5yZXF1ZXN0LnVybCkuc2VhcmNoLmVuZHNXaXRoKFwiYnlwYXNzLXN3XCIpP3ZvaWQgMDpyLmFwcGx5KHRoaXMsYXJndW1lbnRzKX0iXX0=