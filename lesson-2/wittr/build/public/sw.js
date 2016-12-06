(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

self.addEventListener('fetch', function (event) {
	/* original responses
 
   console.log('Service Request');
  console.log(event.request);
  */
	event.respondWith(new Response('Hello World'));
});

},{}],2:[function(require,module,exports){
"use strict";

var r = FetchEvent.prototype.respondWith;
FetchEvent.prototype.respondWith = function () {
  return new URL(this.request.url).search.endsWith("bypass-sw") ? void 0 : r.apply(this, arguments);
};

},{}]},{},[1,2])

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJEOi9Eb2N1bWVudHMvU2Nob29sL1VkYWNpdHkvY291cnNlcy9vZmZsaW5lLWFwcGxpY2F0aW9ucy9sZXNzb24tMi93aXR0ci9wdWJsaWMvanMvc3cvaW5kZXguanMiLCJEOi9Eb2N1bWVudHMvU2Nob29sL1VkYWNpdHkvY291cnNlcy9vZmZsaW5lLWFwcGxpY2F0aW9ucy9sZXNzb24tMi93aXR0ci9wdWJsaWMvanMvc3cvcHJlcm9sbC9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxVQUFTLEtBQUssRUFBRTs7Ozs7O0FBTTdDLE1BQUssQ0FBQyxXQUFXLENBQ2hCLElBQUksUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUMxQixDQUFDO0NBQ0osQ0FBQyxDQUFDOzs7OztBQ1RILElBQUksQ0FBQyxHQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFBO0FBQ3RDLFVBQVUsQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFDLFlBQVU7QUFBQyxTQUFPLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsR0FBQyxLQUFLLENBQUMsR0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksRUFBQyxTQUFTLENBQUMsQ0FBQTtDQUFDLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwic2VsZi5hZGRFdmVudExpc3RlbmVyKCdmZXRjaCcsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0IC8qIG9yaWdpbmFsIHJlc3BvbnNlc1xyXG5cdCBcclxuXHQgICBjb25zb2xlLmxvZygnU2VydmljZSBSZXF1ZXN0Jyk7XHJcblx0ICBjb25zb2xlLmxvZyhldmVudC5yZXF1ZXN0KTtcclxuXHQgICovXHJcblx0IGV2ZW50LnJlc3BvbmRXaXRoKFxyXG5cdCBcdG5ldyBSZXNwb25zZSgnSGVsbG8gV29ybGQnKVxyXG5cdCBcdCk7XHJcbn0pOyIsInZhciByPUZldGNoRXZlbnQucHJvdG90eXBlLnJlc3BvbmRXaXRoXHJcbkZldGNoRXZlbnQucHJvdG90eXBlLnJlc3BvbmRXaXRoPWZ1bmN0aW9uKCl7cmV0dXJuIG5ldyBVUkwodGhpcy5yZXF1ZXN0LnVybCkuc2VhcmNoLmVuZHNXaXRoKFwiYnlwYXNzLXN3XCIpP3ZvaWQgMDpyLmFwcGx5KHRoaXMsYXJndW1lbnRzKX0iXX0=