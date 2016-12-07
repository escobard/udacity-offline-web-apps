(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

self.addEventListener('fetch', function (event) {
	/* original responses
 
   console.log('Service Request');
  console.log(event.request);
  */
	event.respondWith(
	/* this is an object
 new Response('<strong class="a-winner-is-me">Hello <br>World<br></strong>', {
 // the headers property takes an object of header's and values
 	headers: {'content-type':'text/html' }
 }) */

	// respond with a fetch to a GIF
	fetch('/imgs/dr-evil.gif'));
});

},{}],2:[function(require,module,exports){
"use strict";

var r = FetchEvent.prototype.respondWith;
FetchEvent.prototype.respondWith = function () {
  return new URL(this.request.url).search.endsWith("bypass-sw") ? void 0 : r.apply(this, arguments);
};

},{}]},{},[1,2])

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJEOi9Eb2N1bWVudHMvU2Nob29sL1VkYWNpdHkvY291cnNlcy9vZmZsaW5lLWFwcGxpY2F0aW9ucy9sZXNzb24tMi93aXR0ci9wdWJsaWMvanMvc3cvaW5kZXguanMiLCJEOi9Eb2N1bWVudHMvU2Nob29sL1VkYWNpdHkvY291cnNlcy9vZmZsaW5lLWFwcGxpY2F0aW9ucy9sZXNzb24tMi93aXR0ci9wdWJsaWMvanMvc3cvcHJlcm9sbC9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxVQUFTLEtBQUssRUFBRTs7Ozs7O0FBTTdDLE1BQUssQ0FBQyxXQUFXOzs7Ozs7OztBQVFoQixNQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FDekIsQ0FBQztDQUNKLENBQUMsQ0FBQzs7Ozs7QUNoQkgsSUFBSSxDQUFDLEdBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUE7QUFDdEMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUMsWUFBVTtBQUFDLFNBQU8sSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUFDLEtBQUssQ0FBQyxHQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFDLFNBQVMsQ0FBQyxDQUFBO0NBQUMsQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJzZWxmLmFkZEV2ZW50TGlzdGVuZXIoJ2ZldGNoJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHQgLyogb3JpZ2luYWwgcmVzcG9uc2VzXHJcblx0IFxyXG5cdCAgIGNvbnNvbGUubG9nKCdTZXJ2aWNlIFJlcXVlc3QnKTtcclxuXHQgIGNvbnNvbGUubG9nKGV2ZW50LnJlcXVlc3QpO1xyXG5cdCAgKi9cclxuXHQgZXZlbnQucmVzcG9uZFdpdGgoXHJcblx0IFx0LyogdGhpcyBpcyBhbiBvYmplY3RcclxuXHQgXHRuZXcgUmVzcG9uc2UoJzxzdHJvbmcgY2xhc3M9XCJhLXdpbm5lci1pcy1tZVwiPkhlbGxvIDxicj5Xb3JsZDxicj48L3N0cm9uZz4nLCB7XHJcblx0IFx0Ly8gdGhlIGhlYWRlcnMgcHJvcGVydHkgdGFrZXMgYW4gb2JqZWN0IG9mIGhlYWRlcidzIGFuZCB2YWx1ZXNcclxuXHQgXHRcdGhlYWRlcnM6IHsnY29udGVudC10eXBlJzondGV4dC9odG1sJyB9XHJcblx0IFx0fSkgKi9cclxuXHJcblx0IFx0Ly8gcmVzcG9uZCB3aXRoIGEgZmV0Y2ggdG8gYSBHSUZcclxuXHQgXHRmZXRjaCgnL2ltZ3MvZHItZXZpbC5naWYnKVxyXG5cdCBcdCk7XHJcbn0pOyIsInZhciByPUZldGNoRXZlbnQucHJvdG90eXBlLnJlc3BvbmRXaXRoXHJcbkZldGNoRXZlbnQucHJvdG90eXBlLnJlc3BvbmRXaXRoPWZ1bmN0aW9uKCl7cmV0dXJuIG5ldyBVUkwodGhpcy5yZXF1ZXN0LnVybCkuc2VhcmNoLmVuZHNXaXRoKFwiYnlwYXNzLXN3XCIpP3ZvaWQgMDpyLmFwcGx5KHRoaXMsYXJndW1lbnRzKX0iXX0=