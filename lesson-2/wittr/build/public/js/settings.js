(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function transition(el, obj, duration, easing) {
  return new Promise(function(resolve, reject) {
    if (obj.transform) {
      obj['-webkit-transform'] = obj.transform;
    }

    var objKeys = Object.keys(obj);

    if (duration) {
      el.style.transitionProperty = objKeys.join();
      if (easing) el.style.transitionTimingFunction = easing;
      el.style.transitionDuration = duration + 's';
      el.offsetLeft; // style recalc

      el.addEventListener('transitionend', function te() {
        el.style.transitionProperty = '';
        el.style.transitionTimingFunction = '';
        el.style.transitionDuration = '';
        resolve();
        el.removeEventListener('transitionend', te);
      });
    }
    else {
      resolve();
    }

    objKeys.forEach(function(key) {
      el.style.setProperty(key, obj[key]);
    });
  });
};

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _mdlTextfield = require('./mdl/textfield');

var _mdlTextfield2 = _interopRequireDefault(_mdlTextfield);

var _simpleTransition = require('simple-transition');

var _simpleTransition2 = _interopRequireDefault(_simpleTransition);

var _viewsSpinner = require('./views/spinner');

var _viewsSpinner2 = _interopRequireDefault(_viewsSpinner);

var _tests = require('./tests');

var _tests2 = _interopRequireDefault(_tests);

var TestController = (function () {
  function TestController(container) {
    var _this = this;

    _classCallCheck(this, TestController);

    this._memeContainer = container.querySelector('.meme-container');
    this._memeImgContainer = container.querySelector('.meme-img-container');
    this._feedbackText = container.querySelector('.feedback-text');
    this._form = container.querySelector('.test-form');
    this._currentMemeImg = null;
    this._spinner = new _viewsSpinner2['default']();

    this._memeContainer.appendChild(this._spinner.container);

    new _mdlTextfield2['default'](container.querySelector('.mdl-js-textfield'));
    this._form.addEventListener('submit', function (e) {
      return _this._onSubmit(e);
    });
    this._form.testId.addEventListener('input', function (e) {
      return _this._onInput(e);
    });
  }

  _createClass(TestController, [{
    key: '_onInput',
    value: function _onInput(event) {
      if (!this._form.testId.value.trim()) {
        this._removeCurrentFeedback();
      }
    }
  }, {
    key: '_onSubmit',
    value: function _onSubmit(event) {
      var _this2 = this;

      event.preventDefault();
      var val = this._form.testId.value.trim().toLowerCase();
      this._form.testId.blur();

      this._removeCurrentFeedback();
      (0, _simpleTransition2['default'])(this._memeContainer, { opacity: 1 }, 0.3);
      this._spinner.show(800);

      if (!_tests2['default'][val]) {
        this._displayFeedback("Didn't recognise that test ID", 'mistake.gif', false);
        return;
      }

      _tests2['default'][val]().then(function (args) {
        _this2._displayFeedback.apply(_this2, _toConsumableArray(args));
      })['catch'](function (err) {
        _this2._displayFeedback("Oh dear, something went really wrong", 'mistake.gif', false);
        throw err;
      });
    }
  }, {
    key: '_removeCurrentFeedback',
    value: function _removeCurrentFeedback() {
      this._feedbackText.textContent = '';
      this._memeContainer.style.opacity = '';
      this._spinner.hide();

      if (this._currentMemeImg) {
        URL.revokeObjectURL(this._currentMemeImg.href);
        this._memeImgContainer.removeChild(this._currentMemeImg);
        this._currentMemeImg = undefined;
      }
    }
  }, {
    key: '_displayFeedback',
    value: function _displayFeedback(text, url, winning) {
      var _this3 = this;

      this._feedbackText.textContent = text;
      this._spinner.hide();

      if (winning) {
        this._feedbackText.classList.remove('fail');
      } else {
        this._feedbackText.classList.add('fail');
      }

      return fetch('/imgs/test-memes/' + url).then(function (r) {
        return r.blob();
      }).then(function (blob) {
        _this3._currentMemeImg = new Image();
        // hahaha, yes, I know
        _this3._currentMemeImg.src = URL.createObjectURL(blob.slice(1));
        _this3._memeImgContainer.appendChild(_this3._currentMemeImg);
      });
    }
  }]);

  return TestController;
})();

exports['default'] = TestController;
module.exports = exports['default'];

},{"./mdl/textfield":4,"./tests":6,"./views/spinner":7,"simple-transition":1}],3:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _TestController = require('./TestController');

var _TestController2 = _interopRequireDefault(_TestController);

var settingsForm = document.querySelector('.settings-form');

settingsForm.addEventListener('change', function () {
  fetch(settingsForm.action, {
    method: settingsForm.method,
    body: new FormData(settingsForm)
  });
});

if (!self.fetch) {
  document.querySelector('.warning').style.display = 'block';
}

new _TestController2['default'](document.querySelector('.tester'));

},{"./TestController":2}],4:[function(require,module,exports){
/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

/**
 * Class constructor for Textfield MDL component.
 * Implements MDL component design pattern defined at:
 * https://github.com/jasonmayes/mdl-component-design-pattern
 *
 * @constructor
 * @param {HTMLElement} element The element that will be upgraded.
 */
Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = MaterialTextfield;

function MaterialTextfield(element) {
  this.element_ = element;
  this.maxRows = this.Constant_.NO_MAX_ROWS;
  // Initialize instance.
  this.init();
}

/**
 * Store constants in one place so they can be updated easily.
 *
 * @enum {string | number}
 * @private
 */
MaterialTextfield.prototype.Constant_ = {
  NO_MAX_ROWS: -1,
  MAX_ROWS_ATTRIBUTE: 'maxrows'
};

/**
 * Store strings for class names defined by this component that are used in
 * JavaScript. This allows us to simply change it in one place should we
 * decide to modify at a later date.
 *
 * @enum {string}
 * @private
 */
MaterialTextfield.prototype.CssClasses_ = {
  LABEL: 'mdl-textfield__label',
  INPUT: 'mdl-textfield__input',
  IS_DIRTY: 'is-dirty',
  IS_FOCUSED: 'is-focused',
  IS_DISABLED: 'is-disabled',
  IS_INVALID: 'is-invalid',
  IS_UPGRADED: 'is-upgraded'
};

/**
 * Handle input being entered.
 *
 * @param {Event} event The event that fired.
 * @private
 */
MaterialTextfield.prototype.onKeyDown_ = function (event) {
  var currentRowCount = event.target.value.split('\n').length;
  if (event.keyCode === 13) {
    if (currentRowCount >= this.maxRows) {
      event.preventDefault();
    }
  }
};

/**
 * Handle focus.
 *
 * @param {Event} event The event that fired.
 * @private
 */
MaterialTextfield.prototype.onFocus_ = function (event) {
  this.element_.classList.add(this.CssClasses_.IS_FOCUSED);
};

/**
 * Handle lost focus.
 *
 * @param {Event} event The event that fired.
 * @private
 */
MaterialTextfield.prototype.onBlur_ = function (event) {
  this.element_.classList.remove(this.CssClasses_.IS_FOCUSED);
};

/**
 * Handle reset event from out side.
 *
 * @param {Event} event The event that fired.
 * @private
 */
MaterialTextfield.prototype.onReset_ = function (event) {
  this.updateClasses_();
};

/**
 * Handle class updates.
 *
 * @private
 */
MaterialTextfield.prototype.updateClasses_ = function () {
  this.checkDisabled();
  this.checkValidity();
  this.checkDirty();
};

// Public methods.

/**
 * Check the disabled state and update field accordingly.
 *
 * @public
 */
MaterialTextfield.prototype.checkDisabled = function () {
  if (this.input_.disabled) {
    this.element_.classList.add(this.CssClasses_.IS_DISABLED);
  } else {
    this.element_.classList.remove(this.CssClasses_.IS_DISABLED);
  }
};
MaterialTextfield.prototype['checkDisabled'] = MaterialTextfield.prototype.checkDisabled;

/**
 * Check the validity state and update field accordingly.
 *
 * @public
 */
MaterialTextfield.prototype.checkValidity = function () {
  if (this.input_.validity) {
    if (this.input_.validity.valid) {
      this.element_.classList.remove(this.CssClasses_.IS_INVALID);
    } else {
      this.element_.classList.add(this.CssClasses_.IS_INVALID);
    }
  }
};
MaterialTextfield.prototype['checkValidity'] = MaterialTextfield.prototype.checkValidity;

/**
 * Check the dirty state and update field accordingly.
 *
 * @public
 */
MaterialTextfield.prototype.checkDirty = function () {
  if (this.input_.value && this.input_.value.length > 0) {
    this.element_.classList.add(this.CssClasses_.IS_DIRTY);
  } else {
    this.element_.classList.remove(this.CssClasses_.IS_DIRTY);
  }
};
MaterialTextfield.prototype['checkDirty'] = MaterialTextfield.prototype.checkDirty;

/**
 * Disable text field.
 *
 * @public
 */
MaterialTextfield.prototype.disable = function () {
  this.input_.disabled = true;
  this.updateClasses_();
};
MaterialTextfield.prototype['disable'] = MaterialTextfield.prototype.disable;

/**
 * Enable text field.
 *
 * @public
 */
MaterialTextfield.prototype.enable = function () {
  this.input_.disabled = false;
  this.updateClasses_();
};
MaterialTextfield.prototype['enable'] = MaterialTextfield.prototype.enable;

/**
 * Update text field value.
 *
 * @param {string} value The value to which to set the control (optional).
 * @public
 */
MaterialTextfield.prototype.change = function (value) {

  if (value) {
    this.input_.value = value;
  } else {
    this.input_.value = '';
  }
  this.updateClasses_();
};
MaterialTextfield.prototype['change'] = MaterialTextfield.prototype.change;

/**
 * Initialize element.
 */
MaterialTextfield.prototype.init = function () {

  if (this.element_) {
    this.label_ = this.element_.querySelector('.' + this.CssClasses_.LABEL);
    this.input_ = this.element_.querySelector('.' + this.CssClasses_.INPUT);

    if (this.input_) {
      if (this.input_.hasAttribute(
      /** @type {string} */this.Constant_.MAX_ROWS_ATTRIBUTE)) {
        this.maxRows = parseInt(this.input_.getAttribute(
        /** @type {string} */this.Constant_.MAX_ROWS_ATTRIBUTE), 10);
        if (isNaN(this.maxRows)) {
          this.maxRows = this.Constant_.NO_MAX_ROWS;
        }
      }

      this.boundUpdateClassesHandler = this.updateClasses_.bind(this);
      this.boundFocusHandler = this.onFocus_.bind(this);
      this.boundBlurHandler = this.onBlur_.bind(this);
      this.boundResetHandler = this.onReset_.bind(this);
      this.input_.addEventListener('input', this.boundUpdateClassesHandler);
      this.input_.addEventListener('focus', this.boundFocusHandler);
      this.input_.addEventListener('blur', this.boundBlurHandler);
      this.input_.addEventListener('reset', this.boundResetHandler);

      if (this.maxRows !== this.Constant_.NO_MAX_ROWS) {
        // TODO: This should handle pasting multi line text.
        // Currently doesn't.
        this.boundKeyDownHandler = this.onKeyDown_.bind(this);
        this.input_.addEventListener('keydown', this.boundKeyDownHandler);
      }

      this.updateClasses_();
      this.element_.classList.add(this.CssClasses_.IS_UPGRADED);
    }
  }
};

/**
 * Downgrade the component
 *
 * @private
 */
MaterialTextfield.prototype.mdlDowngrade_ = function () {
  this.input_.removeEventListener('input', this.boundUpdateClassesHandler);
  this.input_.removeEventListener('focus', this.boundFocusHandler);
  this.input_.removeEventListener('blur', this.boundBlurHandler);
  this.input_.removeEventListener('reset', this.boundResetHandler);
  if (this.boundKeyDownHandler) {
    this.input_.removeEventListener('keydown', this.boundKeyDownHandler);
  }
};
module.exports = exports['default'];

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var WindowMessenger = (function () {
  function WindowMessenger(url) {
    var _this = this;

    _classCallCheck(this, WindowMessenger);

    this._requestId = 0;

    this._iframe = document.createElement('iframe');
    this._iframe.className = 'hidden-tester';
    this._ready = new Promise(function (resolve, reject) {
      var listener = function listener(e) {
        resolve();
        _this._iframe.removeEventListener('load', listener);
        _this._iframe.removeEventListener('error', errorListener);
      };
      var errorListener = function errorListener(e) {
        reject(Error("Iframe load failed"));
        _this._iframe.removeEventListener('load', listener);
        _this._iframe.removeEventListener('error', errorListener);
      };
      _this._iframe.addEventListener('load', listener);
      _this._iframe.addEventListener('error', errorListener);
      _this._iframe.src = url;
    });
    document.body.appendChild(this._iframe);

    this._targetOrigin = new URL(url).origin;

    this._windowListener = function (event) {
      return _this._onMessage(event);
    };
    self.addEventListener('message', this._windowListener);

    // message jobs awaiting response {callId: [resolve, reject]}
    this._pending = {};
  }

  _createClass(WindowMessenger, [{
    key: 'destruct',
    value: function destruct() {
      document.body.removeChild(this._iframe);
      self.removeEventListener('message', this._windowListener);
    }
  }, {
    key: '_onMessage',
    value: function _onMessage(event) {
      if (event.origin != this._targetOrigin) return;

      if (!event.data.id) {
        console.log("Unexpected message", event);
        return;
      }

      var resolver = this._pending[event.data.id];

      if (!resolver) {
        console.log("No resolver for", event);
        return;
      }

      delete this._pending[event.data.id];

      if (event.data.error) {
        resolver[1](new Error(event.data.error));
        return;
      }

      resolver[0](event.data.result);
    }
  }, {
    key: 'message',
    value: function message(_message) {
      var _this2 = this;

      return this._ready.then(function (_) {
        var requestId = ++_this2._requestId;
        _message.id = requestId;

        return new Promise(function (resolve, reject) {
          _this2._pending[requestId] = [resolve, reject];
          _this2._iframe.contentWindow.postMessage(_message, _this2._targetOrigin);
        });
      });
    }
  }]);

  return WindowMessenger;
})();

exports['default'] = WindowMessenger;
module.exports = exports['default'];

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _lieFi$registered$swWaiting$swActive$htmlResponse$gifResponse$gif404$installCached$cacheServed$newCacheReady$newCacheUsed$updateNotify$updateReload$serveSkeleton$idbAnimal$idbAge$idbStore$idbShow$idbClean$cachePhotos$cacheClean$cacheAvatars;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _WindowMessenger = require('./WindowMessenger');

var _WindowMessenger2 = _interopRequireDefault(_WindowMessenger);

var appOrigin = new URL(location.href);
appOrigin.port = self.config.appPort;
var executorUrl = new URL('/remote?bypass-sw', appOrigin);

function remoteEval(js) {
  var messenger = new _WindowMessenger2['default'](executorUrl);
  var error = undefined;

  if (typeof js === 'function') {
    js = '(' + js.toString() + ')()';
  }

  return figureOutConnectionType().then(function (type) {
    if (type === 'offline') return ["Looks like the server is offline", 'sad.gif', false];

    return messenger.message({
      eval: js
    })['catch'](function (err) {
      error = err;
    }).then(function (val) {
      messenger.destruct();
      if (error) throw error;
      return val;
    });
  });
}

function figureOutConnectionType() {
  var start = performance.now();

  return Promise.race([fetch(new URL('/ping', appOrigin)), new Promise(function (r) {
    return setTimeout(r, 4000);
  })]).then(function (_) {
    var duration = performance.now() - start;

    if (duration < 3000) {
      return 'perfect';
    }
    if (duration < 3500) {
      return 'slow';
    }
    return 'lie-fi';
  }, function (_) {
    return 'offline';
  });
}

exports['default'] = (_lieFi$registered$swWaiting$swActive$htmlResponse$gifResponse$gif404$installCached$cacheServed$newCacheReady$newCacheUsed$updateNotify$updateReload$serveSkeleton$idbAnimal$idbAge$idbStore$idbShow$idbClean$cachePhotos$cacheClean$cacheAvatars = {
  demo: function demo() {
    return Promise.resolve(["Yep, the demo's working!", 'demo.gif', true]);
  },
  offline: function offline() {
    return figureOutConnectionType().then(function (type) {
      if (type == 'offline') {
        return ["Yep! The server is totally dead!", '1.gif', true];
      }
      return ["Hmm, no, looks like the server is still up", 'nope.gif', false];
    });
  }
}, _defineProperty(_lieFi$registered$swWaiting$swActive$htmlResponse$gifResponse$gif404$installCached$cacheServed$newCacheReady$newCacheUsed$updateNotify$updateReload$serveSkeleton$idbAnimal$idbAge$idbStore$idbShow$idbClean$cachePhotos$cacheClean$cacheAvatars, 'lie-fi', function lieFi() {
  return figureOutConnectionType().then(function (type) {
    switch (type) {
      case "lie-fi":
        return ["Yeeeep, that's lie-fi alright.", '2.gif', true];
      case "offline":
        return ["Hmm, no, looks like the server is down.", 'nope.gif', false];
      default:
        return ["The server responded way too fast for lie-fi.", 'not-quite.gif', false];
    }
  });
}), _defineProperty(_lieFi$registered$swWaiting$swActive$htmlResponse$gifResponse$gif404$installCached$cacheServed$newCacheReady$newCacheUsed$updateNotify$updateReload$serveSkeleton$idbAnimal$idbAge$idbStore$idbShow$idbClean$cachePhotos$cacheClean$cacheAvatars, 'registered', function registered() {
  return remoteEval(function () {
    if (navigator.serviceWorker.controller) return ["Service worker successfully registered!", '3.gif', true];
    return ["Doesn't look like there's a service worker registered :(", 'nope.gif', false];
  });
}), _defineProperty(_lieFi$registered$swWaiting$swActive$htmlResponse$gifResponse$gif404$installCached$cacheServed$newCacheReady$newCacheUsed$updateNotify$updateReload$serveSkeleton$idbAnimal$idbAge$idbStore$idbShow$idbClean$cachePhotos$cacheClean$cacheAvatars, 'sw-waiting', function swWaiting() {
  return remoteEval(function () {
    return navigator.serviceWorker.getRegistration('/').then(function (reg) {
      if (!reg) return ["Doesn't look like there's a service worker registered at all!", 'sad.gif', false];
      if (!reg.waiting) return ["There's no service worker waiting", 'nope.gif', false];
      return ["Yey! There's a service worker waiting!", "4.gif", true];
    });
  });
}), _defineProperty(_lieFi$registered$swWaiting$swActive$htmlResponse$gifResponse$gif404$installCached$cacheServed$newCacheReady$newCacheUsed$updateNotify$updateReload$serveSkeleton$idbAnimal$idbAge$idbStore$idbShow$idbClean$cachePhotos$cacheClean$cacheAvatars, 'sw-active', function swActive() {
  return remoteEval(function () {
    return navigator.serviceWorker.getRegistration('/').then(function (reg) {
      if (!reg) return ["Doesn't look like there's a service worker registered at all!", 'sad.gif', false];
      if (reg.waiting) return ["There's still a service worker waiting", 'nope.gif', false];
      return ["No service worker waiting! Yay!", "5.gif", true];
    });
  });
}), _defineProperty(_lieFi$registered$swWaiting$swActive$htmlResponse$gifResponse$gif404$installCached$cacheServed$newCacheReady$newCacheUsed$updateNotify$updateReload$serveSkeleton$idbAnimal$idbAge$idbStore$idbShow$idbClean$cachePhotos$cacheClean$cacheAvatars, 'html-response', function htmlResponse() {
  return remoteEval(function () {
    return fetch('/').then(function (response) {
      var type = response.headers.get('content-type');

      if (!type || type.toLowerCase() != 'text/html' && !type.toLowerCase().startsWith('text/html')) {
        return ["The response doesn't have the 'Content-Type: text/html' header", 'nope.gif', false];
      }

      return response.text().then(function (text) {
        return new DOMParser().parseFromString(text, 'text/html');
      }).then(function (doc) {
        if (doc.body.querySelector('.a-winner-is-me')) {
          return ["Custom HTML response found! Yay!", "6.gif", true];
        }
        return ["Can't find an element with class 'a-winner-is-me'", 'nope.gif', false];
      });
    });
  });
}), _defineProperty(_lieFi$registered$swWaiting$swActive$htmlResponse$gifResponse$gif404$installCached$cacheServed$newCacheReady$newCacheUsed$updateNotify$updateReload$serveSkeleton$idbAnimal$idbAge$idbStore$idbShow$idbClean$cachePhotos$cacheClean$cacheAvatars, 'gif-response', function gifResponse() {
  return remoteEval(function () {
    return fetch('/').then(function (response) {
      var type = response.headers.get('content-type');

      if (!type || !type.toLowerCase().startsWith('text/html')) {
        return ["Looks like it isn't just URLs ending with .jpg that are being intercepted", 'not-quite.gif', false];
      }

      return fetch('/blah.jpg').then(function (response) {
        var type = response.headers.get('content-type');

        if (!type || !type.toLowerCase().startsWith('image/gif')) {
          return ["Doesn't look like urls ending .jpg are getting a gif in response", 'no-cry.gif', false];
        }

        return ["Images are being intercepted!", "7.gif", true];
      });
    });
  });
}), _defineProperty(_lieFi$registered$swWaiting$swActive$htmlResponse$gifResponse$gif404$installCached$cacheServed$newCacheReady$newCacheUsed$updateNotify$updateReload$serveSkeleton$idbAnimal$idbAge$idbStore$idbShow$idbClean$cachePhotos$cacheClean$cacheAvatars, 'gif-404', function gif404() {
  return remoteEval(function () {
    return Promise.all([fetch('/'), fetch('/imgs/dr-evil.gif?bypass-sw'), fetch('/' + Math.random())]).then(function (responses) {
      var pageType = responses[0].headers.get('content-type');

      if (!pageType || !pageType.toLowerCase().startsWith('text/html')) {
        return ["Looks like non-404 pages are getting the gif too", 'not-quite.gif', false];
      }

      var type = responses[2].headers.get('content-type');

      if (!type || !type.toLowerCase().startsWith('image/gif')) {
        return ["Doesn't look like 404 responses are getting a gif in return", 'nope.gif', false];
      }

      return Promise.all(responses.slice(1).map(function (r) {
        return r.arrayBuffer().then(function (b) {
          return new Uint8Array(b);
        });
      })).then(function (arrays) {
        var itemsToCheck = 2000;
        var a1 = arrays[0];
        var a2 = arrays[1];

        for (var i = 0; i < itemsToCheck; i++) {
          if (a1[i] !== a2[i]) {
            return ["Doesn't look like 404 responses are getting the dr-evil gif in return", 'not-quite.gif', false];
          }
        }
        return ["Yay! 404 pages get gifs!", "8.gif", true];
      });
    });
  });
}), _defineProperty(_lieFi$registered$swWaiting$swActive$htmlResponse$gifResponse$gif404$installCached$cacheServed$newCacheReady$newCacheUsed$updateNotify$updateReload$serveSkeleton$idbAnimal$idbAge$idbStore$idbShow$idbClean$cachePhotos$cacheClean$cacheAvatars, 'install-cached', function installCached() {
  return remoteEval(function () {
    var expectedUrls = ['/', '/js/main.js', '/css/main.css', '/imgs/icon.png', 'https://fonts.gstatic.com/s/roboto/v15/2UX7WLTfW3W8TclTUvlFyQ.woff', 'https://fonts.gstatic.com/s/roboto/v15/d-6IYplOFocCacKzxwXSOD8E0i7KZn-EPnyo3HZu7kw.woff'].map(function (url) {
      return new URL(url, location).href;
    });

    return caches.has('wittr-static-v1').then(function (has) {
      if (!has) return ["Can't find a cache named wittr-static-v1", 'nope.gif', false];

      return caches.open('wittr-static-v1').then(function (c) {
        return c.keys();
      }).then(function (reqs) {
        var urls = reqs.map(function (r) {
          return r.url;
        });
        var allAccountedFor = expectedUrls.every(function (url) {
          return urls.includes(url);
        });

        if (allAccountedFor) {
          return ["Yay! The cache is ready to go!", "9.gif", true];
        }
        return ["The cache is there, but it's missing some things", 'not-quite.gif', false];
      });
    });
  });
}), _defineProperty(_lieFi$registered$swWaiting$swActive$htmlResponse$gifResponse$gif404$installCached$cacheServed$newCacheReady$newCacheUsed$updateNotify$updateReload$serveSkeleton$idbAnimal$idbAge$idbStore$idbShow$idbClean$cachePhotos$cacheClean$cacheAvatars, 'cache-served', function cacheServed() {
  return remoteEval(function () {
    return Promise.all([fetch('/'), fetch('/ping').then(function (r) {
      return r.json();
    })['catch'](function (e) {
      return { ok: false };
    })]).then(function (responses) {
      var cachedResponse = responses[0];
      var jsonResponse = responses[1];

      if (!jsonResponse.ok) return ["Doesn't look like non-cached requests are getting through", 'not-quite.gif', false];

      return new Promise(function (r) {
        return setTimeout(r, 2000);
      }).then(function (_) {
        return fetch('/');
      }).then(function (response) {
        if (cachedResponse.headers.get('Date') === response.headers.get('Date')) {
          return ["Yay! Cached responses are being returned!", "10.gif", true];
        }
        return ["Doesn't look like responses are returned from the cache", 'nope.gif', false];
      });
    });
  });
}), _defineProperty(_lieFi$registered$swWaiting$swActive$htmlResponse$gifResponse$gif404$installCached$cacheServed$newCacheReady$newCacheUsed$updateNotify$updateReload$serveSkeleton$idbAnimal$idbAge$idbStore$idbShow$idbClean$cachePhotos$cacheClean$cacheAvatars, 'new-cache-ready', function newCacheReady() {
  return remoteEval(function () {
    return Promise.all([caches.has('wittr-static-v1'), caches.has('wittr-static-v2')]).then(function (hasCaches) {
      if (!hasCaches[0]) return ["Looks like the v1 cache has already gone", 'sad.gif', false];
      if (!hasCaches[1]) return ["Can't find the wittr-static-v2 cache", 'sad.gif', false];

      return Promise.all(['wittr-static-v1', 'wittr-static-v2'].map(function (name) {
        return caches.open(name).then(function (c) {
          return c.match('/css/main.css');
        }).then(function (r) {
          return r && r.text();
        });
      })).then(function (cssTexts) {
        if (!cssTexts[0]) return ["Can't find CSS in the v1 cache", 'sad.gif', false];
        if (!cssTexts[1]) return ["Can't find CSS in the v2 cache", 'sad.gif', false];

        if (cssTexts[0] === cssTexts[1]) {
          return ["There's a new cache, but the CSS looks the same", 'nope.gif', false];
        }
        return ["Yay! The new cache is ready, but isn't disrupting current pages", "11.gif", true];
      });
    });
  });
}), _defineProperty(_lieFi$registered$swWaiting$swActive$htmlResponse$gifResponse$gif404$installCached$cacheServed$newCacheReady$newCacheUsed$updateNotify$updateReload$serveSkeleton$idbAnimal$idbAge$idbStore$idbShow$idbClean$cachePhotos$cacheClean$cacheAvatars, 'new-cache-used', function newCacheUsed() {
  return remoteEval(function () {
    return Promise.all([caches.has('wittr-static-v1'), caches.has('wittr-static-v2')]).then(function (hasCaches) {
      if (hasCaches[0]) return ["Looks like the v1 cache is still there", 'not-quite.gif', false];
      if (!hasCaches[1]) return ["Can't find the wittr-static-v2 cache", 'sad.gif', false];

      return Promise.all([fetch('/css/main.css'), new Promise(function (r) {
        return setTimeout(r, 2000);
      }).then(function (_) {
        return fetch('/css/main.css');
      })]).then(function (responses) {
        if (responses[0].headers.get('Date') != responses[1].headers.get('Date')) {
          return ["Doesn't look like the CSS is being served from the cache", 'mistake.gif', false];
        }

        return openIframe('/').then(function (iframe) {
          var win = iframe.contentWindow;
          var doc = win.document;
          var bg = win.getComputedStyle(doc.querySelector('.toolbar')).backgroundColor;

          if (bg == 'rgb(63, 81, 181)') {
            return ["Doesn't look like the header color has changed", 'no-cry.gif', false];
          }
          return ["Yay! You safely updated the CSS!", "12.gif", true];
        });
      });
    });
  });
}), _defineProperty(_lieFi$registered$swWaiting$swActive$htmlResponse$gifResponse$gif404$installCached$cacheServed$newCacheReady$newCacheUsed$updateNotify$updateReload$serveSkeleton$idbAnimal$idbAge$idbStore$idbShow$idbClean$cachePhotos$cacheClean$cacheAvatars, 'update-notify', function updateNotify() {
  return remoteEval(function () {
    return navigator.serviceWorker.getRegistration().then(function (reg) {
      if (!reg.waiting) return ["Doesn't look like there's a waiting worker", 'nope.gif', false];

      return openIframe('/').then(function (iframe) {
        var win = iframe.contentWindow;
        var doc = win.document;

        return new Promise(function (r) {
          return setTimeout(r, 500);
        }).then(function (_) {
          if (doc.querySelector('.toast')) {
            return ["Yay! There are notifications!", "13.gif", true];
          }
          return ["Doesn't look like there's a notification being triggered", 'sad.gif', false];
        });
      });
    });
  });
}), _defineProperty(_lieFi$registered$swWaiting$swActive$htmlResponse$gifResponse$gif404$installCached$cacheServed$newCacheReady$newCacheUsed$updateNotify$updateReload$serveSkeleton$idbAnimal$idbAge$idbStore$idbShow$idbClean$cachePhotos$cacheClean$cacheAvatars, 'update-reload', function updateReload() {
  return remoteEval(function () {
    return navigator.serviceWorker.getRegistration().then(function (reg) {
      if (!reg.waiting) return ["Doesn't look like there's a waiting worker", 'nope.gif', false];

      return openIframe('/').then(function (iframe) {
        var win = iframe.contentWindow;
        var doc = win.document;

        return new Promise(function (resolve) {
          setTimeout(function (_) {
            return resolve(["Didn't detect the page being reloaded :(", 'sad.gif', false]);
          }, 8000);
          iframe.addEventListener('load', function (_) {
            resolve(["Yay! The page reloaded!", "14.gif", true]);
          });
        });
      });
    });
  });
}), _defineProperty(_lieFi$registered$swWaiting$swActive$htmlResponse$gifResponse$gif404$installCached$cacheServed$newCacheReady$newCacheUsed$updateNotify$updateReload$serveSkeleton$idbAnimal$idbAge$idbStore$idbShow$idbClean$cachePhotos$cacheClean$cacheAvatars, 'serve-skeleton', function serveSkeleton() {
  return remoteEval(function () {
    return fetch('/').then(function (r) {
      return r.text();
    }).then(function (text) {
      if (text.includes('post-content')) {
        return ["Doesn't look like the page skeleton is being served", 'nope.gif', false];
      }

      return fetch('https://google.com/').then(function (r) {
        return r.text();
      })['catch'](function (e) {
        return '';
      }).then(function (gText) {
        if (gText == text) {
          return ["Looks like you're serving the skeleton for https://google.com/ too!", 'not-quite.gif', false];
        }
        return ["Yay! The page skeleton is being served!", "15.gif", true];
      });
    });
  });
}), _defineProperty(_lieFi$registered$swWaiting$swActive$htmlResponse$gifResponse$gif404$installCached$cacheServed$newCacheReady$newCacheUsed$updateNotify$updateReload$serveSkeleton$idbAnimal$idbAge$idbStore$idbShow$idbClean$cachePhotos$cacheClean$cacheAvatars, 'idb-animal', function idbAnimal() {
  return remoteEval(function () {
    return openDb('test-db').then(function (db) {
      var tx = db.transaction('keyval');
      return tx.objectStore('keyval').get('favoriteAnimal').then(function (animal) {
        if (!animal) return ["Can't find favoriteAnimal in keyval", 'nope.gif', false];
        return ["Yay! Your favorite animal is \"" + animal + "\"", "16.gif", true];
      });
    }, function (err) {
      return ["Couldn't open the test-db database at all :(", 'sad.gif', false];
    });
  });
}), _defineProperty(_lieFi$registered$swWaiting$swActive$htmlResponse$gifResponse$gif404$installCached$cacheServed$newCacheReady$newCacheUsed$updateNotify$updateReload$serveSkeleton$idbAnimal$idbAge$idbStore$idbShow$idbClean$cachePhotos$cacheClean$cacheAvatars, 'idb-age', function idbAge() {
  return remoteEval(function () {
    return openDb('test-db').then(function (db) {
      if (!Array.from(db.objectStoreNames).includes('people')) {
        return ["Can't find the 'people' objectStore", 'mistake.gif', false];
      }

      var tx = db.transaction('people');
      var store = tx.objectStore('people');

      if (!Array.from(store.indexNames).includes('age')) {
        return ["Can't find the 'age' index in the 'people' objectStore", 'sad.gif', false];
      }

      var index = store.index('age');

      if (index.keyPath == 'age') {
        return ["Yay! The age index is working", "17.gif", true];
      }

      return ["The age index isn't indexed by age", 'nope.gif', false];
    }, function (err) {
      return ["Couldn't open the test-db database at all :(", 'sad.gif', false];
    });
  });
}), _defineProperty(_lieFi$registered$swWaiting$swActive$htmlResponse$gifResponse$gif404$installCached$cacheServed$newCacheReady$newCacheUsed$updateNotify$updateReload$serveSkeleton$idbAnimal$idbAge$idbStore$idbShow$idbClean$cachePhotos$cacheClean$cacheAvatars, 'idb-store', function idbStore() {
  return remoteEval(function () {
    return openDb('wittr').then(function (db) {
      if (!Array.from(db.objectStoreNames).includes('wittrs')) {
        return ["There isn't a 'wittrs' objectStore", 'sad.gif', false];
      }

      var tx = db.transaction('wittrs');
      var store = tx.objectStore('wittrs');

      if (store.keyPath != 'id') {
        return ["'wittrs' objectStore doesn't use 'id' as its primary key", 'nope.gif', false];
      }

      if (!Array.from(store.indexNames).includes('by-date')) {
        return ["There isn't a 'by-date' index on the 'wittrs' objectStore", 'nope.gif', false];
      }

      var index = store.index('by-date');

      if (index.keyPath != 'time') {
        return ["The 'by-date' index isn't using 'time' as its key", 'nope.gif', false];
      }

      return store.getAll().then(function (messages) {
        if (!messages.length) {
          return ["The objectStore is there, but it's empty", 'sad.gif', false];
        }

        var looksMessagey = messages.every(function (message) {
          return message.id && message.avatar && message.name && message.time && message.body;
        });

        if (looksMessagey) {
          return ["The database is set up and populated!", "18.gif", true];
        }

        return ["Looks like some incorrect data is in the database", 'not-quite.gif', false];
      });
    }, function () {
      return ["Couldn't open the 'wittr' database at all :(", 'sad.gif', false];
    });
  });
}), _defineProperty(_lieFi$registered$swWaiting$swActive$htmlResponse$gifResponse$gif404$installCached$cacheServed$newCacheReady$newCacheUsed$updateNotify$updateReload$serveSkeleton$idbAnimal$idbAge$idbStore$idbShow$idbClean$cachePhotos$cacheClean$cacheAvatars, 'idb-show', function idbShow() {
  return remoteEval(function () {
    return openDb('wittr').then(function (db) {
      return openIframe('/?no-socket').then(function (iframe) {
        var win = iframe.contentWindow;
        var doc = win.document;

        return new Promise(function (r) {
          return setTimeout(r, 500);
        }).then(function () {
          var times = Array.from(doc.querySelectorAll('.post-content time'));
          if (!times.length) return ["Page looks empty without the web socket", 'nope.gif', false];

          var inOrder = times.map(function (t) {
            return new Date(t.getAttribute('datetime'));
          }).every(function (time, i, arr) {
            var nextTime = arr[i + 1];
            if (!nextTime) return true;
            return time >= nextTime;
          });

          if (!inOrder) return ["So close! But the newest post should appear at the top", 'not-quite.gif', false];
          return ["Page populated from IDB!", "19.gif", true];
        });
      });
    }, function () {
      return ["Couldn't open the 'wittr' database at all :(", 'sad.gif', false];
    });
  });
}), _defineProperty(_lieFi$registered$swWaiting$swActive$htmlResponse$gifResponse$gif404$installCached$cacheServed$newCacheReady$newCacheUsed$updateNotify$updateReload$serveSkeleton$idbAnimal$idbAge$idbStore$idbShow$idbClean$cachePhotos$cacheClean$cacheAvatars, 'idb-clean', function idbClean() {
  return remoteEval(function () {
    return openDb('wittr').then(function (db) {
      var tx = db.transaction('wittrs');
      var store = tx.objectStore('wittrs');

      return store.count().then(function (num) {
        if (num > 30) {
          return ["There are more than 30 items in the store", 'nope.gif', false];
        }

        if (num < 30) {
          return ["There are less than 30 items in the store, so it isn't clear if this is working", 'not-quite.gif', false];
        }

        return ["Looks like the database is being cleaned!", "20.gif", true];
      });
    }, function () {
      return ["Couldn't open the 'wittr' database at all :(", 'sad.gif', false];
    });
  });
}), _defineProperty(_lieFi$registered$swWaiting$swActive$htmlResponse$gifResponse$gif404$installCached$cacheServed$newCacheReady$newCacheUsed$updateNotify$updateReload$serveSkeleton$idbAnimal$idbAge$idbStore$idbShow$idbClean$cachePhotos$cacheClean$cacheAvatars, 'cache-photos', function cachePhotos() {
  return remoteEval(function () {
    return caches.has('wittr-content-imgs').then(function (hasCache) {
      if (!hasCache) return ["There isn't a 'wittr-content-imgs' cache", 'sad.gif', false];

      // clear cache
      return caches['delete']('wittr-content-imgs').then(function () {
        var imageUrlSmall = '/photos/4-3087-2918949798-865f134ef3-320px.jpg';
        var imageUrlMedium = '/photos/4-3087-2918949798-865f134ef3-640px.jpg';

        return fetch(imageUrlMedium).then(function (medResponse) {
          return new Promise(function (r) {
            return setTimeout(r, 2000);
          }).then(function () {
            return fetch(imageUrlMedium);
          }).then(function (anotherMedResponse) {
            if (medResponse.headers.get('Date') != anotherMedResponse.headers.get('Date')) {
              return ["Doesn't look like images are being returned from the cache", 'nope.gif', false];
            }

            return fetch(imageUrlSmall).then(function (smallResponse) {
              return Promise.all([smallResponse.blob(), medResponse.blob()]);
            }).then(function (blobs) {
              if (blobs[0].size != blobs[1].size) {
                return ["The originally cached image isn't being returned for different sizes", 'nope.gif', false];
              }
              return ["Photos are being cached and served correctly!", "21.gif", true];
            });
          });
        });
      });
    });
  });
}), _defineProperty(_lieFi$registered$swWaiting$swActive$htmlResponse$gifResponse$gif404$installCached$cacheServed$newCacheReady$newCacheUsed$updateNotify$updateReload$serveSkeleton$idbAnimal$idbAge$idbStore$idbShow$idbClean$cachePhotos$cacheClean$cacheAvatars, 'cache-clean', function cacheClean() {
  return remoteEval(function () {
    return caches.open('wittr-content-imgs').then(function (cache) {
      var imageUrlMedium = '/photos/4-3087-2918949798-865f134ef3-640px.jpg';

      return fetch(imageUrlMedium).then(function (r) {
        return r.blob();
      }).then(function () {
        return new Promise(function (r) {
          return setTimeout(r, 500);
        });
      }).then(function () {
        return cache.match('/photos/4-3087-2918949798-865f134ef3').then(function (response) {
          if (!response) return ["Photos aren't appearing in the cache where we'd expect", 'not-quite.gif', false];

          var start = Date.now();

          return Promise.resolve().then(function checkCache() {
            if (Date.now() - start > 8000) {
              return ["The image cache doesn't seem to be getting cleaned", 'nope.gif', false];
            }

            return cache.match('/photos/4-3087-2918949798-865f134ef3').then(function (response) {
              if (!response) {
                return ["Yay! The image cache is being cleaned!", '22.gif', true];
              }
              return new Promise(function (r) {
                return setTimeout(r, 100);
              }).then(checkCache);
            });
          });
        });
      });
    });
  });
}), _defineProperty(_lieFi$registered$swWaiting$swActive$htmlResponse$gifResponse$gif404$installCached$cacheServed$newCacheReady$newCacheUsed$updateNotify$updateReload$serveSkeleton$idbAnimal$idbAge$idbStore$idbShow$idbClean$cachePhotos$cacheClean$cacheAvatars, 'cache-avatars', function cacheAvatars() {
  return remoteEval(function () {
    return caches['delete']('wittr-content-imgs').then(function () {
      var imageUrlSmall = '/avatars/marc-1x.jpg';
      var imageUrlMedium = '/avatars/marc-2x.jpg';

      return fetch(imageUrlSmall).then(function (smallResponse) {
        return new Promise(function (r) {
          return setTimeout(r, 2000);
        }).then(function () {
          return fetch(imageUrlMedium);
        }).then(function (medResponse) {
          if (smallResponse.headers.get('Date') != medResponse.headers.get('Date')) {
            return ["Doesn't look like avatars are being returned from the cache, even if the request is for a different size", 'nope.gif', false];
          }

          return new Promise(function (r) {
            return setTimeout(r, 2000);
          }).then(function () {
            return fetch(imageUrlMedium);
          }).then(function (anotherMedResponse) {
            if (medResponse.headers.get('Date') == anotherMedResponse.headers.get('Date')) {
              return ["Doesn't look like avatars are being updated after being returned from the cache", 'nope.gif', false];
            }
            return ["Avatars are being cached, served and updated correctly!", "23.gif", true];
          });
        });
      });
    });
  });
}), _lieFi$registered$swWaiting$swActive$htmlResponse$gifResponse$gif404$installCached$cacheServed$newCacheReady$newCacheUsed$updateNotify$updateReload$serveSkeleton$idbAnimal$idbAge$idbStore$idbShow$idbClean$cachePhotos$cacheClean$cacheAvatars);
module.exports = exports['default'];

},{"./WindowMessenger":5}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilsParseHTML = require('../../utils/parseHTML');

var _utilsParseHTML2 = _interopRequireDefault(_utilsParseHTML);

var Spinner = (function () {
  function Spinner() {
    var _this = this;

    _classCallCheck(this, Spinner);

    this.container = (0, _utilsParseHTML2['default'])('<div class="spinner">' + '<div class="spinner-container">' + '<div class="spinner-layer">' + '<div class="circle-clipper left">' + '<div class="circle"></div>' + '</div>' + '<div class="gap-patch">' + '<div class="circle"></div>' + '</div>' + '<div class="circle-clipper right">' + '<div class="circle"></div>' + '</div>' + '</div>' + '</div>' + '</div>' + '').firstChild;

    this._showTimeout = null;
    this.container.style.display = 'none';

    var animEndListener = function animEndListener(event) {
      if (event.target == _this.container) {
        _this.container.style.display = 'none';
      }
    };

    this.container.addEventListener('webkitAnimationEnd', animEndListener);
    this.container.addEventListener('animationend', animEndListener);
  }

  _createClass(Spinner, [{
    key: 'show',
    value: function show() {
      var _this2 = this;

      var delay = arguments.length <= 0 || arguments[0] === undefined ? 300 : arguments[0];

      clearTimeout(this._showTimeout);
      this.container.style.display = 'none';
      this.container.classList.remove('cooldown');
      this._showTimeout = setTimeout(function (_) {
        _this2.container.style.display = '';
      }, delay);
    }
  }, {
    key: 'hide',
    value: function hide() {
      clearTimeout(this._showTimeout);
      this.container.classList.add('cooldown');
    }
  }]);

  return Spinner;
})();

exports['default'] = Spinner;
module.exports = exports['default'];

},{"../../utils/parseHTML":8}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = strToEls;
var contextRange = document.createRange();
contextRange.setStart(document.body, 0);

function strToEls(str) {
  return contextRange.createContextualFragment(str);
}

module.exports = exports["default"];

},{}]},{},[3])

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXRyYW5zaXRpb24vaW5kZXguanMiLCJEOi9Eb2N1bWVudHMvU2Nob29sL1VkYWNpdHkvY291cnNlcy9vZmZsaW5lLWFwcGxpY2F0aW9ucy9sZXNzb24tMi93aXR0ci9wdWJsaWMvanMvc2V0dGluZ3MvVGVzdENvbnRyb2xsZXIuanMiLCJEOi9Eb2N1bWVudHMvU2Nob29sL1VkYWNpdHkvY291cnNlcy9vZmZsaW5lLWFwcGxpY2F0aW9ucy9sZXNzb24tMi93aXR0ci9wdWJsaWMvanMvc2V0dGluZ3MvaW5kZXguanMiLCJEOi9Eb2N1bWVudHMvU2Nob29sL1VkYWNpdHkvY291cnNlcy9vZmZsaW5lLWFwcGxpY2F0aW9ucy9sZXNzb24tMi93aXR0ci9wdWJsaWMvanMvc2V0dGluZ3MvbWRsL3RleHRmaWVsZC5qcyIsIkQ6L0RvY3VtZW50cy9TY2hvb2wvVWRhY2l0eS9jb3Vyc2VzL29mZmxpbmUtYXBwbGljYXRpb25zL2xlc3Nvbi0yL3dpdHRyL3B1YmxpYy9qcy9zZXR0aW5ncy90ZXN0cy9XaW5kb3dNZXNzZW5nZXIuanMiLCJEOi9Eb2N1bWVudHMvU2Nob29sL1VkYWNpdHkvY291cnNlcy9vZmZsaW5lLWFwcGxpY2F0aW9ucy9sZXNzb24tMi93aXR0ci9wdWJsaWMvanMvc2V0dGluZ3MvdGVzdHMvaW5kZXguanMiLCJEOi9Eb2N1bWVudHMvU2Nob29sL1VkYWNpdHkvY291cnNlcy9vZmZsaW5lLWFwcGxpY2F0aW9ucy9sZXNzb24tMi93aXR0ci9wdWJsaWMvanMvc2V0dGluZ3Mvdmlld3Mvc3Bpbm5lci5qcyIsIkQ6L0RvY3VtZW50cy9TY2hvb2wvVWRhY2l0eS9jb3Vyc2VzL29mZmxpbmUtYXBwbGljYXRpb25zL2xlc3Nvbi0yL3dpdHRyL3B1YmxpYy9qcy91dGlscy9wYXJzZUhUTUwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNB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QUFNLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDNUMsVUFBSSxDQUFDLFlBQVksR0FBRyxVQUFVLENBQUMsVUFBQSxDQUFDLEVBQUk7QUFDbEMsZUFBSyxTQUFTLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7T0FDbkMsRUFBRSxLQUFLLENBQUMsQ0FBQztLQUNYOzs7V0FFRyxnQkFBRztBQUNMLGtCQUFZLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ2hDLFVBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztLQUMxQzs7O1NBN0NrQixPQUFPOzs7cUJBQVAsT0FBTzs7Ozs7Ozs7O3FCQ0NKLFFBQVE7QUFIaEMsSUFBSSxZQUFZLEdBQUcsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQzFDLFlBQVksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQzs7QUFFekIsU0FBUyxRQUFRLENBQUMsR0FBRyxFQUFFO0FBQ3BDLFNBQU8sWUFBWSxDQUFDLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ25EIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdHJhbnNpdGlvbihlbCwgb2JqLCBkdXJhdGlvbiwgZWFzaW5nKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICBpZiAob2JqLnRyYW5zZm9ybSkge1xuICAgICAgb2JqWyctd2Via2l0LXRyYW5zZm9ybSddID0gb2JqLnRyYW5zZm9ybTtcbiAgICB9XG5cbiAgICB2YXIgb2JqS2V5cyA9IE9iamVjdC5rZXlzKG9iaik7XG5cbiAgICBpZiAoZHVyYXRpb24pIHtcbiAgICAgIGVsLnN0eWxlLnRyYW5zaXRpb25Qcm9wZXJ0eSA9IG9iaktleXMuam9pbigpO1xuICAgICAgaWYgKGVhc2luZykgZWwuc3R5bGUudHJhbnNpdGlvblRpbWluZ0Z1bmN0aW9uID0gZWFzaW5nO1xuICAgICAgZWwuc3R5bGUudHJhbnNpdGlvbkR1cmF0aW9uID0gZHVyYXRpb24gKyAncyc7XG4gICAgICBlbC5vZmZzZXRMZWZ0OyAvLyBzdHlsZSByZWNhbGNcblxuICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcigndHJhbnNpdGlvbmVuZCcsIGZ1bmN0aW9uIHRlKCkge1xuICAgICAgICBlbC5zdHlsZS50cmFuc2l0aW9uUHJvcGVydHkgPSAnJztcbiAgICAgICAgZWwuc3R5bGUudHJhbnNpdGlvblRpbWluZ0Z1bmN0aW9uID0gJyc7XG4gICAgICAgIGVsLnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbiA9ICcnO1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCB0ZSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXNvbHZlKCk7XG4gICAgfVxuXG4gICAgb2JqS2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgZWwuc3R5bGUuc2V0UHJvcGVydHkoa2V5LCBvYmpba2V5XSk7XG4gICAgfSk7XG4gIH0pO1xufTtcbiIsImltcG9ydCBNYXRlcmlhbFRleHRmaWVsZCBmcm9tICcuL21kbC90ZXh0ZmllbGQnO1xyXG5pbXBvcnQgc2ltcGxlVHJhbnNpdGlvbiBmcm9tICdzaW1wbGUtdHJhbnNpdGlvbic7XHJcbmltcG9ydCBTcGlubmVyVmlldyBmcm9tICcuL3ZpZXdzL3NwaW5uZXInO1xyXG5pbXBvcnQgdGVzdHMgZnJvbSAnLi90ZXN0cyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXN0Q29udHJvbGxlciB7XHJcbiAgY29uc3RydWN0b3IoY29udGFpbmVyKSB7XHJcbiAgICB0aGlzLl9tZW1lQ29udGFpbmVyID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5tZW1lLWNvbnRhaW5lcicpO1xyXG4gICAgdGhpcy5fbWVtZUltZ0NvbnRhaW5lciA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcubWVtZS1pbWctY29udGFpbmVyJyk7XHJcbiAgICB0aGlzLl9mZWVkYmFja1RleHQgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcignLmZlZWRiYWNrLXRleHQnKTtcclxuICAgIHRoaXMuX2Zvcm0gPSBjb250YWluZXIucXVlcnlTZWxlY3RvcignLnRlc3QtZm9ybScpO1xyXG4gICAgdGhpcy5fY3VycmVudE1lbWVJbWcgPSBudWxsO1xyXG4gICAgdGhpcy5fc3Bpbm5lciA9IG5ldyBTcGlubmVyVmlldygpO1xyXG5cclxuICAgIHRoaXMuX21lbWVDb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5fc3Bpbm5lci5jb250YWluZXIpO1xyXG5cclxuICAgIG5ldyBNYXRlcmlhbFRleHRmaWVsZChjb250YWluZXIucXVlcnlTZWxlY3RvcignLm1kbC1qcy10ZXh0ZmllbGQnKSk7XHJcbiAgICB0aGlzLl9mb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIGUgPT4gdGhpcy5fb25TdWJtaXQoZSkpO1xyXG4gICAgdGhpcy5fZm9ybS50ZXN0SWQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBlID0+IHRoaXMuX29uSW5wdXQoZSkpO1xyXG5cclxuICB9XHJcblxyXG4gIF9vbklucHV0KGV2ZW50KSB7XHJcbiAgICBpZiAoIXRoaXMuX2Zvcm0udGVzdElkLnZhbHVlLnRyaW0oKSkge1xyXG4gICAgICB0aGlzLl9yZW1vdmVDdXJyZW50RmVlZGJhY2soKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIF9vblN1Ym1pdChldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIGNvbnN0IHZhbCA9IHRoaXMuX2Zvcm0udGVzdElkLnZhbHVlLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgdGhpcy5fZm9ybS50ZXN0SWQuYmx1cigpO1xyXG4gICAgXHJcbiAgICB0aGlzLl9yZW1vdmVDdXJyZW50RmVlZGJhY2soKTtcclxuICAgIHNpbXBsZVRyYW5zaXRpb24odGhpcy5fbWVtZUNvbnRhaW5lciwge29wYWNpdHk6IDF9LCAwLjMpO1xyXG4gICAgdGhpcy5fc3Bpbm5lci5zaG93KDgwMCk7XHJcblxyXG4gICAgaWYgKCF0ZXN0c1t2YWxdKSB7XHJcbiAgICAgIHRoaXMuX2Rpc3BsYXlGZWVkYmFjayhcIkRpZG4ndCByZWNvZ25pc2UgdGhhdCB0ZXN0IElEXCIsICdtaXN0YWtlLmdpZicsIGZhbHNlKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRlc3RzW3ZhbF0oKS50aGVuKGFyZ3MgPT4ge1xyXG4gICAgICB0aGlzLl9kaXNwbGF5RmVlZGJhY2soLi4uYXJncyk7XHJcbiAgICB9KS5jYXRjaChlcnIgPT4ge1xyXG4gICAgICB0aGlzLl9kaXNwbGF5RmVlZGJhY2soXCJPaCBkZWFyLCBzb21ldGhpbmcgd2VudCByZWFsbHkgd3JvbmdcIiwgJ21pc3Rha2UuZ2lmJywgZmFsc2UpO1xyXG4gICAgICB0aHJvdyBlcnI7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIF9yZW1vdmVDdXJyZW50RmVlZGJhY2soKSB7XHJcbiAgICB0aGlzLl9mZWVkYmFja1RleHQudGV4dENvbnRlbnQgPSAnJztcclxuICAgIHRoaXMuX21lbWVDb250YWluZXIuc3R5bGUub3BhY2l0eSA9ICcnO1xyXG4gICAgdGhpcy5fc3Bpbm5lci5oaWRlKCk7XHJcblxyXG4gICAgaWYgKHRoaXMuX2N1cnJlbnRNZW1lSW1nKSB7XHJcbiAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwodGhpcy5fY3VycmVudE1lbWVJbWcuaHJlZik7XHJcbiAgICAgIHRoaXMuX21lbWVJbWdDb250YWluZXIucmVtb3ZlQ2hpbGQodGhpcy5fY3VycmVudE1lbWVJbWcpO1xyXG4gICAgICB0aGlzLl9jdXJyZW50TWVtZUltZyA9IHVuZGVmaW5lZDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIF9kaXNwbGF5RmVlZGJhY2sodGV4dCwgdXJsLCB3aW5uaW5nKSB7XHJcbiAgICB0aGlzLl9mZWVkYmFja1RleHQudGV4dENvbnRlbnQgPSB0ZXh0O1xyXG4gICAgdGhpcy5fc3Bpbm5lci5oaWRlKCk7XHJcblxyXG4gICAgaWYgKHdpbm5pbmcpIHtcclxuICAgICAgdGhpcy5fZmVlZGJhY2tUZXh0LmNsYXNzTGlzdC5yZW1vdmUoJ2ZhaWwnKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLl9mZWVkYmFja1RleHQuY2xhc3NMaXN0LmFkZCgnZmFpbCcpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmZXRjaChgL2ltZ3MvdGVzdC1tZW1lcy8ke3VybH1gKS50aGVuKHIgPT4gci5ibG9iKCkpLnRoZW4oYmxvYiA9PiB7XHJcbiAgICAgIHRoaXMuX2N1cnJlbnRNZW1lSW1nID0gbmV3IEltYWdlKCk7XHJcbiAgICAgIC8vIGhhaGFoYSwgeWVzLCBJIGtub3dcclxuICAgICAgdGhpcy5fY3VycmVudE1lbWVJbWcuc3JjID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iLnNsaWNlKDEpKTtcclxuICAgICAgdGhpcy5fbWVtZUltZ0NvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLl9jdXJyZW50TWVtZUltZyk7XHJcbiAgICB9KTtcclxuICB9XHJcbn0iLCJpbXBvcnQgVGVzdENvbnRyb2xsZXIgZnJvbSAnLi9UZXN0Q29udHJvbGxlcic7XHJcblxyXG5jb25zdCBzZXR0aW5nc0Zvcm0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2V0dGluZ3MtZm9ybScpO1xyXG5cclxuc2V0dGluZ3NGb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcclxuICBmZXRjaChzZXR0aW5nc0Zvcm0uYWN0aW9uLCB7XHJcbiAgICBtZXRob2Q6IHNldHRpbmdzRm9ybS5tZXRob2QsXHJcbiAgICBib2R5OiBuZXcgRm9ybURhdGEoc2V0dGluZ3NGb3JtKVxyXG4gIH0pO1xyXG59KTtcclxuXHJcbmlmICghc2VsZi5mZXRjaCkge1xyXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy53YXJuaW5nJykuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbn1cclxuXHJcbm5ldyBUZXN0Q29udHJvbGxlcihkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudGVzdGVyJykpOyIsIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgMjAxNSBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xyXG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXHJcbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxyXG4gKlxyXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxyXG4gKlxyXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXHJcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcclxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXHJcbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcclxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXHJcbiAqL1xyXG5cclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxuLyoqXHJcbiAqIENsYXNzIGNvbnN0cnVjdG9yIGZvciBUZXh0ZmllbGQgTURMIGNvbXBvbmVudC5cclxuICogSW1wbGVtZW50cyBNREwgY29tcG9uZW50IGRlc2lnbiBwYXR0ZXJuIGRlZmluZWQgYXQ6XHJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9qYXNvbm1heWVzL21kbC1jb21wb25lbnQtZGVzaWduLXBhdHRlcm5cclxuICpcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgVGhlIGVsZW1lbnQgdGhhdCB3aWxsIGJlIHVwZ3JhZGVkLlxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gTWF0ZXJpYWxUZXh0ZmllbGQoZWxlbWVudCkge1xyXG4gIHRoaXMuZWxlbWVudF8gPSBlbGVtZW50O1xyXG4gIHRoaXMubWF4Um93cyA9IHRoaXMuQ29uc3RhbnRfLk5PX01BWF9ST1dTO1xyXG4gIC8vIEluaXRpYWxpemUgaW5zdGFuY2UuXHJcbiAgdGhpcy5pbml0KCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTdG9yZSBjb25zdGFudHMgaW4gb25lIHBsYWNlIHNvIHRoZXkgY2FuIGJlIHVwZGF0ZWQgZWFzaWx5LlxyXG4gKlxyXG4gKiBAZW51bSB7c3RyaW5nIHwgbnVtYmVyfVxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuTWF0ZXJpYWxUZXh0ZmllbGQucHJvdG90eXBlLkNvbnN0YW50XyA9IHtcclxuICBOT19NQVhfUk9XUzogLTEsXHJcbiAgTUFYX1JPV1NfQVRUUklCVVRFOiAnbWF4cm93cydcclxufTtcclxuXHJcbi8qKlxyXG4gKiBTdG9yZSBzdHJpbmdzIGZvciBjbGFzcyBuYW1lcyBkZWZpbmVkIGJ5IHRoaXMgY29tcG9uZW50IHRoYXQgYXJlIHVzZWQgaW5cclxuICogSmF2YVNjcmlwdC4gVGhpcyBhbGxvd3MgdXMgdG8gc2ltcGx5IGNoYW5nZSBpdCBpbiBvbmUgcGxhY2Ugc2hvdWxkIHdlXHJcbiAqIGRlY2lkZSB0byBtb2RpZnkgYXQgYSBsYXRlciBkYXRlLlxyXG4gKlxyXG4gKiBAZW51bSB7c3RyaW5nfVxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuTWF0ZXJpYWxUZXh0ZmllbGQucHJvdG90eXBlLkNzc0NsYXNzZXNfID0ge1xyXG4gIExBQkVMOiAnbWRsLXRleHRmaWVsZF9fbGFiZWwnLFxyXG4gIElOUFVUOiAnbWRsLXRleHRmaWVsZF9faW5wdXQnLFxyXG4gIElTX0RJUlRZOiAnaXMtZGlydHknLFxyXG4gIElTX0ZPQ1VTRUQ6ICdpcy1mb2N1c2VkJyxcclxuICBJU19ESVNBQkxFRDogJ2lzLWRpc2FibGVkJyxcclxuICBJU19JTlZBTElEOiAnaXMtaW52YWxpZCcsXHJcbiAgSVNfVVBHUkFERUQ6ICdpcy11cGdyYWRlZCdcclxufTtcclxuXHJcbi8qKlxyXG4gKiBIYW5kbGUgaW5wdXQgYmVpbmcgZW50ZXJlZC5cclxuICpcclxuICogQHBhcmFtIHtFdmVudH0gZXZlbnQgVGhlIGV2ZW50IHRoYXQgZmlyZWQuXHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5NYXRlcmlhbFRleHRmaWVsZC5wcm90b3R5cGUub25LZXlEb3duXyA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgdmFyIGN1cnJlbnRSb3dDb3VudCA9IGV2ZW50LnRhcmdldC52YWx1ZS5zcGxpdCgnXFxuJykubGVuZ3RoO1xyXG4gIGlmIChldmVudC5rZXlDb2RlID09PSAxMykge1xyXG4gICAgaWYgKGN1cnJlbnRSb3dDb3VudCA+PSB0aGlzLm1heFJvd3MpIHtcclxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIH1cclxuICB9XHJcbn07XHJcblxyXG4vKipcclxuICogSGFuZGxlIGZvY3VzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge0V2ZW50fSBldmVudCBUaGUgZXZlbnQgdGhhdCBmaXJlZC5cclxuICogQHByaXZhdGVcclxuICovXHJcbk1hdGVyaWFsVGV4dGZpZWxkLnByb3RvdHlwZS5vbkZvY3VzXyA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgdGhpcy5lbGVtZW50Xy5jbGFzc0xpc3QuYWRkKHRoaXMuQ3NzQ2xhc3Nlc18uSVNfRk9DVVNFRCk7XHJcbn07XHJcblxyXG4vKipcclxuICogSGFuZGxlIGxvc3QgZm9jdXMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IFRoZSBldmVudCB0aGF0IGZpcmVkLlxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuTWF0ZXJpYWxUZXh0ZmllbGQucHJvdG90eXBlLm9uQmx1cl8gPSBmdW5jdGlvbihldmVudCkge1xyXG4gIHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LnJlbW92ZSh0aGlzLkNzc0NsYXNzZXNfLklTX0ZPQ1VTRUQpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEhhbmRsZSByZXNldCBldmVudCBmcm9tIG91dCBzaWRlLlxyXG4gKlxyXG4gKiBAcGFyYW0ge0V2ZW50fSBldmVudCBUaGUgZXZlbnQgdGhhdCBmaXJlZC5cclxuICogQHByaXZhdGVcclxuICovXHJcbk1hdGVyaWFsVGV4dGZpZWxkLnByb3RvdHlwZS5vblJlc2V0XyA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgdGhpcy51cGRhdGVDbGFzc2VzXygpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEhhbmRsZSBjbGFzcyB1cGRhdGVzLlxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuTWF0ZXJpYWxUZXh0ZmllbGQucHJvdG90eXBlLnVwZGF0ZUNsYXNzZXNfID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy5jaGVja0Rpc2FibGVkKCk7XHJcbiAgdGhpcy5jaGVja1ZhbGlkaXR5KCk7XHJcbiAgdGhpcy5jaGVja0RpcnR5KCk7XHJcbn07XHJcblxyXG4vLyBQdWJsaWMgbWV0aG9kcy5cclxuXHJcbi8qKlxyXG4gKiBDaGVjayB0aGUgZGlzYWJsZWQgc3RhdGUgYW5kIHVwZGF0ZSBmaWVsZCBhY2NvcmRpbmdseS5cclxuICpcclxuICogQHB1YmxpY1xyXG4gKi9cclxuTWF0ZXJpYWxUZXh0ZmllbGQucHJvdG90eXBlLmNoZWNrRGlzYWJsZWQgPSBmdW5jdGlvbigpIHtcclxuICBpZiAodGhpcy5pbnB1dF8uZGlzYWJsZWQpIHtcclxuICAgIHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLklTX0RJU0FCTEVEKTtcclxuICB9IGVsc2Uge1xyXG4gICAgdGhpcy5lbGVtZW50Xy5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuQ3NzQ2xhc3Nlc18uSVNfRElTQUJMRUQpO1xyXG4gIH1cclxufTtcclxuTWF0ZXJpYWxUZXh0ZmllbGQucHJvdG90eXBlWydjaGVja0Rpc2FibGVkJ10gPVxyXG4gICAgTWF0ZXJpYWxUZXh0ZmllbGQucHJvdG90eXBlLmNoZWNrRGlzYWJsZWQ7XHJcblxyXG4vKipcclxuICogQ2hlY2sgdGhlIHZhbGlkaXR5IHN0YXRlIGFuZCB1cGRhdGUgZmllbGQgYWNjb3JkaW5nbHkuXHJcbiAqXHJcbiAqIEBwdWJsaWNcclxuICovXHJcbk1hdGVyaWFsVGV4dGZpZWxkLnByb3RvdHlwZS5jaGVja1ZhbGlkaXR5ID0gZnVuY3Rpb24oKSB7XHJcbiAgaWYgKHRoaXMuaW5wdXRfLnZhbGlkaXR5KSB7XHJcbiAgICBpZiAodGhpcy5pbnB1dF8udmFsaWRpdHkudmFsaWQpIHtcclxuICAgICAgdGhpcy5lbGVtZW50Xy5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuQ3NzQ2xhc3Nlc18uSVNfSU5WQUxJRCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5JU19JTlZBTElEKTtcclxuICAgIH1cclxuICB9XHJcbn07XHJcbk1hdGVyaWFsVGV4dGZpZWxkLnByb3RvdHlwZVsnY2hlY2tWYWxpZGl0eSddID1cclxuICAgIE1hdGVyaWFsVGV4dGZpZWxkLnByb3RvdHlwZS5jaGVja1ZhbGlkaXR5O1xyXG5cclxuLyoqXHJcbiAqIENoZWNrIHRoZSBkaXJ0eSBzdGF0ZSBhbmQgdXBkYXRlIGZpZWxkIGFjY29yZGluZ2x5LlxyXG4gKlxyXG4gKiBAcHVibGljXHJcbiAqL1xyXG5NYXRlcmlhbFRleHRmaWVsZC5wcm90b3R5cGUuY2hlY2tEaXJ0eSA9IGZ1bmN0aW9uKCkge1xyXG4gIGlmICh0aGlzLmlucHV0Xy52YWx1ZSAmJiB0aGlzLmlucHV0Xy52YWx1ZS5sZW5ndGggPiAwKSB7XHJcbiAgICB0aGlzLmVsZW1lbnRfLmNsYXNzTGlzdC5hZGQodGhpcy5Dc3NDbGFzc2VzXy5JU19ESVJUWSk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LnJlbW92ZSh0aGlzLkNzc0NsYXNzZXNfLklTX0RJUlRZKTtcclxuICB9XHJcbn07XHJcbk1hdGVyaWFsVGV4dGZpZWxkLnByb3RvdHlwZVsnY2hlY2tEaXJ0eSddID1cclxuICAgIE1hdGVyaWFsVGV4dGZpZWxkLnByb3RvdHlwZS5jaGVja0RpcnR5O1xyXG5cclxuLyoqXHJcbiAqIERpc2FibGUgdGV4dCBmaWVsZC5cclxuICpcclxuICogQHB1YmxpY1xyXG4gKi9cclxuTWF0ZXJpYWxUZXh0ZmllbGQucHJvdG90eXBlLmRpc2FibGUgPSBmdW5jdGlvbigpIHtcclxuICB0aGlzLmlucHV0Xy5kaXNhYmxlZCA9IHRydWU7XHJcbiAgdGhpcy51cGRhdGVDbGFzc2VzXygpO1xyXG59O1xyXG5NYXRlcmlhbFRleHRmaWVsZC5wcm90b3R5cGVbJ2Rpc2FibGUnXSA9IE1hdGVyaWFsVGV4dGZpZWxkLnByb3RvdHlwZS5kaXNhYmxlO1xyXG5cclxuLyoqXHJcbiAqIEVuYWJsZSB0ZXh0IGZpZWxkLlxyXG4gKlxyXG4gKiBAcHVibGljXHJcbiAqL1xyXG5NYXRlcmlhbFRleHRmaWVsZC5wcm90b3R5cGUuZW5hYmxlID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy5pbnB1dF8uZGlzYWJsZWQgPSBmYWxzZTtcclxuICB0aGlzLnVwZGF0ZUNsYXNzZXNfKCk7XHJcbn07XHJcbk1hdGVyaWFsVGV4dGZpZWxkLnByb3RvdHlwZVsnZW5hYmxlJ10gPSBNYXRlcmlhbFRleHRmaWVsZC5wcm90b3R5cGUuZW5hYmxlO1xyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZSB0ZXh0IGZpZWxkIHZhbHVlLlxyXG4gKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gdmFsdWUgVGhlIHZhbHVlIHRvIHdoaWNoIHRvIHNldCB0aGUgY29udHJvbCAob3B0aW9uYWwpLlxyXG4gKiBAcHVibGljXHJcbiAqL1xyXG5NYXRlcmlhbFRleHRmaWVsZC5wcm90b3R5cGUuY2hhbmdlID0gZnVuY3Rpb24odmFsdWUpIHtcclxuXHJcbiAgaWYgKHZhbHVlKSB7XHJcbiAgICB0aGlzLmlucHV0Xy52YWx1ZSA9IHZhbHVlO1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0aGlzLmlucHV0Xy52YWx1ZSA9ICcnO1xyXG4gIH1cclxuICB0aGlzLnVwZGF0ZUNsYXNzZXNfKCk7XHJcbn07XHJcbk1hdGVyaWFsVGV4dGZpZWxkLnByb3RvdHlwZVsnY2hhbmdlJ10gPSBNYXRlcmlhbFRleHRmaWVsZC5wcm90b3R5cGUuY2hhbmdlO1xyXG5cclxuLyoqXHJcbiAqIEluaXRpYWxpemUgZWxlbWVudC5cclxuICovXHJcbk1hdGVyaWFsVGV4dGZpZWxkLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gIGlmICh0aGlzLmVsZW1lbnRfKSB7XHJcbiAgICB0aGlzLmxhYmVsXyA9IHRoaXMuZWxlbWVudF8ucXVlcnlTZWxlY3RvcignLicgKyB0aGlzLkNzc0NsYXNzZXNfLkxBQkVMKTtcclxuICAgIHRoaXMuaW5wdXRfID0gdGhpcy5lbGVtZW50Xy5xdWVyeVNlbGVjdG9yKCcuJyArIHRoaXMuQ3NzQ2xhc3Nlc18uSU5QVVQpO1xyXG5cclxuICAgIGlmICh0aGlzLmlucHV0Xykge1xyXG4gICAgICBpZiAodGhpcy5pbnB1dF8uaGFzQXR0cmlidXRlKFxyXG4gICAgICAgICAgICAvKiogQHR5cGUge3N0cmluZ30gKi8gKHRoaXMuQ29uc3RhbnRfLk1BWF9ST1dTX0FUVFJJQlVURSkpKSB7XHJcbiAgICAgICAgdGhpcy5tYXhSb3dzID0gcGFyc2VJbnQodGhpcy5pbnB1dF8uZ2V0QXR0cmlidXRlKFxyXG4gICAgICAgICAgICAvKiogQHR5cGUge3N0cmluZ30gKi8gKHRoaXMuQ29uc3RhbnRfLk1BWF9ST1dTX0FUVFJJQlVURSkpLCAxMCk7XHJcbiAgICAgICAgaWYgKGlzTmFOKHRoaXMubWF4Um93cykpIHtcclxuICAgICAgICAgIHRoaXMubWF4Um93cyA9IHRoaXMuQ29uc3RhbnRfLk5PX01BWF9ST1dTO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5ib3VuZFVwZGF0ZUNsYXNzZXNIYW5kbGVyID0gdGhpcy51cGRhdGVDbGFzc2VzXy5iaW5kKHRoaXMpO1xyXG4gICAgICB0aGlzLmJvdW5kRm9jdXNIYW5kbGVyID0gdGhpcy5vbkZvY3VzXy5iaW5kKHRoaXMpO1xyXG4gICAgICB0aGlzLmJvdW5kQmx1ckhhbmRsZXIgPSB0aGlzLm9uQmx1cl8uYmluZCh0aGlzKTtcclxuICAgICAgdGhpcy5ib3VuZFJlc2V0SGFuZGxlciA9IHRoaXMub25SZXNldF8uYmluZCh0aGlzKTtcclxuICAgICAgdGhpcy5pbnB1dF8uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCB0aGlzLmJvdW5kVXBkYXRlQ2xhc3Nlc0hhbmRsZXIpO1xyXG4gICAgICB0aGlzLmlucHV0Xy5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIHRoaXMuYm91bmRGb2N1c0hhbmRsZXIpO1xyXG4gICAgICB0aGlzLmlucHV0Xy5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgdGhpcy5ib3VuZEJsdXJIYW5kbGVyKTtcclxuICAgICAgdGhpcy5pbnB1dF8uYWRkRXZlbnRMaXN0ZW5lcigncmVzZXQnLCB0aGlzLmJvdW5kUmVzZXRIYW5kbGVyKTtcclxuXHJcbiAgICAgIGlmICh0aGlzLm1heFJvd3MgIT09IHRoaXMuQ29uc3RhbnRfLk5PX01BWF9ST1dTKSB7XHJcbiAgICAgICAgLy8gVE9ETzogVGhpcyBzaG91bGQgaGFuZGxlIHBhc3RpbmcgbXVsdGkgbGluZSB0ZXh0LlxyXG4gICAgICAgIC8vIEN1cnJlbnRseSBkb2Vzbid0LlxyXG4gICAgICAgIHRoaXMuYm91bmRLZXlEb3duSGFuZGxlciA9IHRoaXMub25LZXlEb3duXy5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuaW5wdXRfLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLmJvdW5kS2V5RG93bkhhbmRsZXIpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLnVwZGF0ZUNsYXNzZXNfKCk7XHJcbiAgICAgIHRoaXMuZWxlbWVudF8uY2xhc3NMaXN0LmFkZCh0aGlzLkNzc0NsYXNzZXNfLklTX1VQR1JBREVEKTtcclxuICAgIH1cclxuICB9XHJcbn07XHJcblxyXG4vKipcclxuICogRG93bmdyYWRlIHRoZSBjb21wb25lbnRcclxuICpcclxuICogQHByaXZhdGVcclxuICovXHJcbk1hdGVyaWFsVGV4dGZpZWxkLnByb3RvdHlwZS5tZGxEb3duZ3JhZGVfID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy5pbnB1dF8ucmVtb3ZlRXZlbnRMaXN0ZW5lcignaW5wdXQnLCB0aGlzLmJvdW5kVXBkYXRlQ2xhc3Nlc0hhbmRsZXIpO1xyXG4gIHRoaXMuaW5wdXRfLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgdGhpcy5ib3VuZEZvY3VzSGFuZGxlcik7XHJcbiAgdGhpcy5pbnB1dF8ucmVtb3ZlRXZlbnRMaXN0ZW5lcignYmx1cicsIHRoaXMuYm91bmRCbHVySGFuZGxlcik7XHJcbiAgdGhpcy5pbnB1dF8ucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzZXQnLCB0aGlzLmJvdW5kUmVzZXRIYW5kbGVyKTtcclxuICBpZiAodGhpcy5ib3VuZEtleURvd25IYW5kbGVyKSB7XHJcbiAgICB0aGlzLmlucHV0Xy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5ib3VuZEtleURvd25IYW5kbGVyKTtcclxuICB9XHJcbn07IiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgV2luZG93TWVzc2VuZ2VyIHtcclxuICBjb25zdHJ1Y3Rvcih1cmwpIHtcclxuICAgIHRoaXMuX3JlcXVlc3RJZCA9IDA7XHJcbiAgICBcclxuICAgIHRoaXMuX2lmcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xyXG4gICAgdGhpcy5faWZyYW1lLmNsYXNzTmFtZSA9ICdoaWRkZW4tdGVzdGVyJztcclxuICAgIHRoaXMuX3JlYWR5ID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICBjb25zdCBsaXN0ZW5lciA9IGUgPT4ge1xyXG4gICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICB0aGlzLl9pZnJhbWUucmVtb3ZlRXZlbnRMaXN0ZW5lcignbG9hZCcsIGxpc3RlbmVyKTtcclxuICAgICAgICB0aGlzLl9pZnJhbWUucmVtb3ZlRXZlbnRMaXN0ZW5lcignZXJyb3InLCBlcnJvckxpc3RlbmVyKTtcclxuICAgICAgfTtcclxuICAgICAgY29uc3QgZXJyb3JMaXN0ZW5lciA9IGUgPT4ge1xyXG4gICAgICAgIHJlamVjdChFcnJvcihcIklmcmFtZSBsb2FkIGZhaWxlZFwiKSk7XHJcbiAgICAgICAgdGhpcy5faWZyYW1lLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBsaXN0ZW5lcik7XHJcbiAgICAgICAgdGhpcy5faWZyYW1lLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZXJyb3JMaXN0ZW5lcik7XHJcbiAgICAgIH07XHJcbiAgICAgIHRoaXMuX2lmcmFtZS5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgbGlzdGVuZXIpO1xyXG4gICAgICB0aGlzLl9pZnJhbWUuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBlcnJvckxpc3RlbmVyKTtcclxuICAgICAgdGhpcy5faWZyYW1lLnNyYyA9IHVybDtcclxuICAgIH0pO1xyXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLl9pZnJhbWUpO1xyXG5cclxuICAgIHRoaXMuX3RhcmdldE9yaWdpbiA9IG5ldyBVUkwodXJsKS5vcmlnaW47XHJcblxyXG4gICAgdGhpcy5fd2luZG93TGlzdGVuZXIgPSBldmVudCA9PiB0aGlzLl9vbk1lc3NhZ2UoZXZlbnQpO1xyXG4gICAgc2VsZi5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgdGhpcy5fd2luZG93TGlzdGVuZXIpO1xyXG5cclxuICAgIC8vIG1lc3NhZ2Ugam9icyBhd2FpdGluZyByZXNwb25zZSB7Y2FsbElkOiBbcmVzb2x2ZSwgcmVqZWN0XX1cclxuICAgIHRoaXMuX3BlbmRpbmcgPSB7fTtcclxuICB9XHJcblxyXG4gIGRlc3RydWN0KCkge1xyXG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCh0aGlzLl9pZnJhbWUpO1xyXG4gICAgc2VsZi5yZW1vdmVFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgdGhpcy5fd2luZG93TGlzdGVuZXIpO1xyXG4gIH1cclxuXHJcbiAgX29uTWVzc2FnZShldmVudCkge1xyXG4gICAgaWYgKGV2ZW50Lm9yaWdpbiAhPSB0aGlzLl90YXJnZXRPcmlnaW4pIHJldHVybjtcclxuXHJcbiAgICBpZiAoIWV2ZW50LmRhdGEuaWQpIHtcclxuICAgICAgY29uc29sZS5sb2coXCJVbmV4cGVjdGVkIG1lc3NhZ2VcIiwgZXZlbnQpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHJlc29sdmVyID0gdGhpcy5fcGVuZGluZ1tldmVudC5kYXRhLmlkXTtcclxuXHJcbiAgICBpZiAoIXJlc29sdmVyKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwiTm8gcmVzb2x2ZXIgZm9yXCIsIGV2ZW50KTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGRlbGV0ZSB0aGlzLl9wZW5kaW5nW2V2ZW50LmRhdGEuaWRdO1xyXG5cclxuICAgIGlmIChldmVudC5kYXRhLmVycm9yKSB7XHJcbiAgICAgIHJlc29sdmVyWzFdKG5ldyBFcnJvcihldmVudC5kYXRhLmVycm9yKSk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICByZXNvbHZlclswXShldmVudC5kYXRhLnJlc3VsdCk7XHJcbiAgfVxyXG5cclxuICBtZXNzYWdlKG1lc3NhZ2UpIHtcclxuICAgIHJldHVybiB0aGlzLl9yZWFkeS50aGVuKF8gPT4ge1xyXG4gICAgICBjb25zdCByZXF1ZXN0SWQgPSArK3RoaXMuX3JlcXVlc3RJZDtcclxuICAgICAgbWVzc2FnZS5pZCA9IHJlcXVlc3RJZDtcclxuXHJcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgdGhpcy5fcGVuZGluZ1tyZXF1ZXN0SWRdID0gW3Jlc29sdmUsIHJlamVjdF07XHJcbiAgICAgICAgdGhpcy5faWZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UobWVzc2FnZSwgdGhpcy5fdGFyZ2V0T3JpZ2luKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IFdpbmRvd01lc3NlbmdlciBmcm9tICcuL1dpbmRvd01lc3Nlbmdlcic7XHJcblxyXG5jb25zdCBhcHBPcmlnaW4gPSBuZXcgVVJMKGxvY2F0aW9uLmhyZWYpO1xyXG5hcHBPcmlnaW4ucG9ydCA9IHNlbGYuY29uZmlnLmFwcFBvcnQ7XHJcbmNvbnN0IGV4ZWN1dG9yVXJsID0gbmV3IFVSTCgnL3JlbW90ZT9ieXBhc3Mtc3cnLCBhcHBPcmlnaW4pO1xyXG5cclxuZnVuY3Rpb24gcmVtb3RlRXZhbChqcykge1xyXG4gIGNvbnN0IG1lc3NlbmdlciA9IG5ldyBXaW5kb3dNZXNzZW5nZXIoZXhlY3V0b3JVcmwpO1xyXG4gIGxldCBlcnJvcjtcclxuXHJcbiAgaWYgKHR5cGVvZiBqcyA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAganMgPSAnKCcgKyBqcy50b1N0cmluZygpICsgJykoKSc7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gZmlndXJlT3V0Q29ubmVjdGlvblR5cGUoKS50aGVuKHR5cGUgPT4ge1xyXG4gICAgaWYgKHR5cGUgPT09ICdvZmZsaW5lJykgcmV0dXJuIFtcIkxvb2tzIGxpa2UgdGhlIHNlcnZlciBpcyBvZmZsaW5lXCIsICdzYWQuZ2lmJywgZmFsc2VdO1xyXG5cclxuICAgIHJldHVybiBtZXNzZW5nZXIubWVzc2FnZSh7XHJcbiAgICAgIGV2YWw6IGpzXHJcbiAgICB9KS5jYXRjaChlcnIgPT4ge1xyXG4gICAgICBlcnJvciA9IGVycjtcclxuICAgIH0pLnRoZW4odmFsID0+IHtcclxuICAgICAgbWVzc2VuZ2VyLmRlc3RydWN0KCk7XHJcbiAgICAgIGlmIChlcnJvcikgdGhyb3cgZXJyb3I7XHJcbiAgICAgIHJldHVybiB2YWw7XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGZpZ3VyZU91dENvbm5lY3Rpb25UeXBlKCkge1xyXG4gIGNvbnN0IHN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcblxyXG4gIHJldHVybiBQcm9taXNlLnJhY2UoW1xyXG4gICAgZmV0Y2gobmV3IFVSTCgnL3BpbmcnLCBhcHBPcmlnaW4pKSxcclxuICAgIG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCA0MDAwKSlcclxuICBdKS50aGVuKF8gPT4ge1xyXG4gICAgY29uc3QgZHVyYXRpb24gPSBwZXJmb3JtYW5jZS5ub3coKSAtIHN0YXJ0O1xyXG5cclxuICAgIGlmIChkdXJhdGlvbiA8IDMwMDApIHtcclxuICAgICAgcmV0dXJuICdwZXJmZWN0JztcclxuICAgIH1cclxuICAgIGlmIChkdXJhdGlvbiA8IDM1MDApIHtcclxuICAgICAgcmV0dXJuICdzbG93JztcclxuICAgIH1cclxuICAgIHJldHVybiAnbGllLWZpJztcclxuICB9LCBfID0+IHtcclxuICAgIHJldHVybiAnb2ZmbGluZSc7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICBkZW1vKCkge1xyXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShbXCJZZXAsIHRoZSBkZW1vJ3Mgd29ya2luZyFcIiwgJ2RlbW8uZ2lmJywgdHJ1ZV0pO1xyXG4gIH0sXHJcbiAgb2ZmbGluZSgpIHtcclxuICAgIHJldHVybiBmaWd1cmVPdXRDb25uZWN0aW9uVHlwZSgpLnRoZW4odHlwZSA9PiB7XHJcbiAgICAgIGlmICh0eXBlID09ICdvZmZsaW5lJykge1xyXG4gICAgICAgIHJldHVybiBbXCJZZXAhIFRoZSBzZXJ2ZXIgaXMgdG90YWxseSBkZWFkIVwiLCAnMS5naWYnLCB0cnVlXTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gW1wiSG1tLCBubywgbG9va3MgbGlrZSB0aGUgc2VydmVyIGlzIHN0aWxsIHVwXCIsICdub3BlLmdpZicsIGZhbHNlXTtcclxuICAgIH0pO1xyXG4gIH0sXHJcbiAgWydsaWUtZmknXSgpIHtcclxuICAgIHJldHVybiBmaWd1cmVPdXRDb25uZWN0aW9uVHlwZSgpLnRoZW4odHlwZSA9PiB7XHJcbiAgICAgIHN3aXRjaCh0eXBlKSB7XHJcbiAgICAgICAgY2FzZSBcImxpZS1maVwiOlxyXG4gICAgICAgICAgcmV0dXJuIFtcIlllZWVlcCwgdGhhdCdzIGxpZS1maSBhbHJpZ2h0LlwiLCAnMi5naWYnLCB0cnVlXTtcclxuICAgICAgICBjYXNlIFwib2ZmbGluZVwiOlxyXG4gICAgICAgICAgcmV0dXJuIFtcIkhtbSwgbm8sIGxvb2tzIGxpa2UgdGhlIHNlcnZlciBpcyBkb3duLlwiLCAnbm9wZS5naWYnLCBmYWxzZV07XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIHJldHVybiBbXCJUaGUgc2VydmVyIHJlc3BvbmRlZCB3YXkgdG9vIGZhc3QgZm9yIGxpZS1maS5cIiwgJ25vdC1xdWl0ZS5naWYnLCBmYWxzZV07XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH0sXHJcbiAgcmVnaXN0ZXJlZCgpIHtcclxuICAgIHJldHVybiByZW1vdGVFdmFsKGZ1bmN0aW9uKCkge1xyXG4gICAgICBpZiAobmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIuY29udHJvbGxlcikgcmV0dXJuIFtcIlNlcnZpY2Ugd29ya2VyIHN1Y2Nlc3NmdWxseSByZWdpc3RlcmVkIVwiLCAnMy5naWYnLCB0cnVlXTtcclxuICAgICAgcmV0dXJuIFtcIkRvZXNuJ3QgbG9vayBsaWtlIHRoZXJlJ3MgYSBzZXJ2aWNlIHdvcmtlciByZWdpc3RlcmVkIDooXCIsICdub3BlLmdpZicsIGZhbHNlXTtcclxuICAgIH0pO1xyXG4gIH0sXHJcbiAgWydzdy13YWl0aW5nJ10oKSB7XHJcbiAgICByZXR1cm4gcmVtb3RlRXZhbChmdW5jdGlvbigpIHtcclxuICAgICAgcmV0dXJuIG5hdmlnYXRvci5zZXJ2aWNlV29ya2VyLmdldFJlZ2lzdHJhdGlvbignLycpLnRoZW4ocmVnID0+IHtcclxuICAgICAgICBpZiAoIXJlZykgcmV0dXJuIFtcIkRvZXNuJ3QgbG9vayBsaWtlIHRoZXJlJ3MgYSBzZXJ2aWNlIHdvcmtlciByZWdpc3RlcmVkIGF0IGFsbCFcIiwgJ3NhZC5naWYnLCBmYWxzZV07XHJcbiAgICAgICAgaWYgKCFyZWcud2FpdGluZykgcmV0dXJuIFtcIlRoZXJlJ3Mgbm8gc2VydmljZSB3b3JrZXIgd2FpdGluZ1wiLCAnbm9wZS5naWYnLCBmYWxzZV07XHJcbiAgICAgICAgcmV0dXJuIFtcIllleSEgVGhlcmUncyBhIHNlcnZpY2Ugd29ya2VyIHdhaXRpbmchXCIsIFwiNC5naWZcIiwgdHJ1ZV07XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfSxcclxuICBbJ3N3LWFjdGl2ZSddKCkge1xyXG4gICAgcmV0dXJuIHJlbW90ZUV2YWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiBuYXZpZ2F0b3Iuc2VydmljZVdvcmtlci5nZXRSZWdpc3RyYXRpb24oJy8nKS50aGVuKHJlZyA9PiB7XHJcbiAgICAgICAgaWYgKCFyZWcpIHJldHVybiBbXCJEb2Vzbid0IGxvb2sgbGlrZSB0aGVyZSdzIGEgc2VydmljZSB3b3JrZXIgcmVnaXN0ZXJlZCBhdCBhbGwhXCIsICdzYWQuZ2lmJywgZmFsc2VdO1xyXG4gICAgICAgIGlmIChyZWcud2FpdGluZykgcmV0dXJuIFtcIlRoZXJlJ3Mgc3RpbGwgYSBzZXJ2aWNlIHdvcmtlciB3YWl0aW5nXCIsICdub3BlLmdpZicsIGZhbHNlXTtcclxuICAgICAgICByZXR1cm4gW1wiTm8gc2VydmljZSB3b3JrZXIgd2FpdGluZyEgWWF5IVwiLCBcIjUuZ2lmXCIsIHRydWVdO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH0sXHJcbiAgWydodG1sLXJlc3BvbnNlJ10oKSB7XHJcbiAgICByZXR1cm4gcmVtb3RlRXZhbChmdW5jdGlvbigpIHtcclxuICAgICAgcmV0dXJuIGZldGNoKCcvJykudGhlbihyZXNwb25zZSA9PiB7XHJcbiAgICAgICAgY29uc3QgdHlwZSA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdjb250ZW50LXR5cGUnKTtcclxuXHJcbiAgICAgICAgaWYgKCF0eXBlIHx8ICh0eXBlLnRvTG93ZXJDYXNlKCkgIT0gJ3RleHQvaHRtbCcgJiYgIXR5cGUudG9Mb3dlckNhc2UoKS5zdGFydHNXaXRoKCd0ZXh0L2h0bWwnKSkpIHtcclxuICAgICAgICAgIHJldHVybiBbXCJUaGUgcmVzcG9uc2UgZG9lc24ndCBoYXZlIHRoZSAnQ29udGVudC1UeXBlOiB0ZXh0L2h0bWwnIGhlYWRlclwiLCAnbm9wZS5naWYnLCBmYWxzZV07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVzcG9uc2UudGV4dCgpLnRoZW4odGV4dCA9PiBuZXcgRE9NUGFyc2VyKCkucGFyc2VGcm9tU3RyaW5nKHRleHQsICd0ZXh0L2h0bWwnKSkudGhlbihkb2MgPT4ge1xyXG4gICAgICAgICAgaWYgKGRvYy5ib2R5LnF1ZXJ5U2VsZWN0b3IoJy5hLXdpbm5lci1pcy1tZScpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbXCJDdXN0b20gSFRNTCByZXNwb25zZSBmb3VuZCEgWWF5IVwiLCBcIjYuZ2lmXCIsIHRydWVdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIFtcIkNhbid0IGZpbmQgYW4gZWxlbWVudCB3aXRoIGNsYXNzICdhLXdpbm5lci1pcy1tZSdcIiwgJ25vcGUuZ2lmJywgZmFsc2VdO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH0sXHJcbiAgWydnaWYtcmVzcG9uc2UnXSgpIHtcclxuICAgIHJldHVybiByZW1vdGVFdmFsKGZ1bmN0aW9uKCkge1xyXG4gICAgICByZXR1cm4gZmV0Y2goJy8nKS50aGVuKHJlc3BvbnNlID0+IHtcclxuICAgICAgICBjb25zdCB0eXBlID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoJ2NvbnRlbnQtdHlwZScpO1xyXG5cclxuICAgICAgICBpZiAoIXR5cGUgfHwgIXR5cGUudG9Mb3dlckNhc2UoKS5zdGFydHNXaXRoKCd0ZXh0L2h0bWwnKSkge1xyXG4gICAgICAgICAgcmV0dXJuIFtcIkxvb2tzIGxpa2UgaXQgaXNuJ3QganVzdCBVUkxzIGVuZGluZyB3aXRoIC5qcGcgdGhhdCBhcmUgYmVpbmcgaW50ZXJjZXB0ZWRcIiwgJ25vdC1xdWl0ZS5naWYnLCBmYWxzZV07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmV0Y2goJy9ibGFoLmpwZycpLnRoZW4ocmVzcG9uc2UgPT4ge1xyXG4gICAgICAgICAgY29uc3QgdHlwZSA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdjb250ZW50LXR5cGUnKTtcclxuXHJcbiAgICAgICAgICBpZiAoIXR5cGUgfHwgIXR5cGUudG9Mb3dlckNhc2UoKS5zdGFydHNXaXRoKCdpbWFnZS9naWYnKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gW1wiRG9lc24ndCBsb29rIGxpa2UgdXJscyBlbmRpbmcgLmpwZyBhcmUgZ2V0dGluZyBhIGdpZiBpbiByZXNwb25zZVwiLCAnbm8tY3J5LmdpZicsIGZhbHNlXTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICByZXR1cm4gW1wiSW1hZ2VzIGFyZSBiZWluZyBpbnRlcmNlcHRlZCFcIiwgXCI3LmdpZlwiLCB0cnVlXTtcclxuICAgICAgICB9KVxyXG4gICAgICB9KTtcclxuICAgIH0pXHJcbiAgfSxcclxuICBbJ2dpZi00MDQnXSgpIHtcclxuICAgIHJldHVybiByZW1vdGVFdmFsKGZ1bmN0aW9uKCkge1xyXG4gICAgICByZXR1cm4gUHJvbWlzZS5hbGwoW1xyXG4gICAgICAgIGZldGNoKCcvJyksXHJcbiAgICAgICAgZmV0Y2goJy9pbWdzL2RyLWV2aWwuZ2lmP2J5cGFzcy1zdycpLFxyXG4gICAgICAgIGZldGNoKCcvJyArIE1hdGgucmFuZG9tKCkpXHJcbiAgICAgIF0pLnRoZW4ocmVzcG9uc2VzID0+IHtcclxuICAgICAgICBjb25zdCBwYWdlVHlwZSA9IHJlc3BvbnNlc1swXS5oZWFkZXJzLmdldCgnY29udGVudC10eXBlJyk7XHJcblxyXG4gICAgICAgIGlmICghcGFnZVR5cGUgfHwgIXBhZ2VUeXBlLnRvTG93ZXJDYXNlKCkuc3RhcnRzV2l0aCgndGV4dC9odG1sJykpIHtcclxuICAgICAgICAgIHJldHVybiBbXCJMb29rcyBsaWtlIG5vbi00MDQgcGFnZXMgYXJlIGdldHRpbmcgdGhlIGdpZiB0b29cIiwgJ25vdC1xdWl0ZS5naWYnLCBmYWxzZV07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCB0eXBlID0gcmVzcG9uc2VzWzJdLmhlYWRlcnMuZ2V0KCdjb250ZW50LXR5cGUnKTtcclxuXHJcbiAgICAgICAgaWYgKCF0eXBlIHx8ICF0eXBlLnRvTG93ZXJDYXNlKCkuc3RhcnRzV2l0aCgnaW1hZ2UvZ2lmJykpIHtcclxuICAgICAgICAgIHJldHVybiBbXCJEb2Vzbid0IGxvb2sgbGlrZSA0MDQgcmVzcG9uc2VzIGFyZSBnZXR0aW5nIGEgZ2lmIGluIHJldHVyblwiLCAnbm9wZS5naWYnLCBmYWxzZV07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoXHJcbiAgICAgICAgICByZXNwb25zZXMuc2xpY2UoMSkubWFwKHIgPT4gci5hcnJheUJ1ZmZlcigpLnRoZW4oYiA9PiBuZXcgVWludDhBcnJheShiKSkpXHJcbiAgICAgICAgKS50aGVuKGFycmF5cyA9PiB7XHJcbiAgICAgICAgICBjb25zdCBpdGVtc1RvQ2hlY2sgPSAyMDAwO1xyXG4gICAgICAgICAgY29uc3QgYTEgPSBhcnJheXNbMF07XHJcbiAgICAgICAgICBjb25zdCBhMiA9IGFycmF5c1sxXTtcclxuXHJcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0ZW1zVG9DaGVjazsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChhMVtpXSAhPT0gYTJbaV0pIHtcclxuICAgICAgICAgICAgICByZXR1cm4gW1wiRG9lc24ndCBsb29rIGxpa2UgNDA0IHJlc3BvbnNlcyBhcmUgZ2V0dGluZyB0aGUgZHItZXZpbCBnaWYgaW4gcmV0dXJuXCIsICdub3QtcXVpdGUuZ2lmJywgZmFsc2VdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gW1wiWWF5ISA0MDQgcGFnZXMgZ2V0IGdpZnMhXCIsIFwiOC5naWZcIiwgdHJ1ZV07XHJcbiAgICAgICAgfSlcclxuICAgICAgfSlcclxuICAgIH0pO1xyXG4gIH0sXHJcbiAgWydpbnN0YWxsLWNhY2hlZCddKCkge1xyXG4gICAgcmV0dXJuIHJlbW90ZUV2YWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgIGNvbnN0IGV4cGVjdGVkVXJscyA9IFtcclxuICAgICAgICAnLycsXHJcbiAgICAgICAgJy9qcy9tYWluLmpzJyxcclxuICAgICAgICAnL2Nzcy9tYWluLmNzcycsXHJcbiAgICAgICAgJy9pbWdzL2ljb24ucG5nJyxcclxuICAgICAgICAnaHR0cHM6Ly9mb250cy5nc3RhdGljLmNvbS9zL3JvYm90by92MTUvMlVYN1dMVGZXM1c4VGNsVFV2bEZ5US53b2ZmJyxcclxuICAgICAgICAnaHR0cHM6Ly9mb250cy5nc3RhdGljLmNvbS9zL3JvYm90by92MTUvZC02SVlwbE9Gb2NDYWNLenh3WFNPRDhFMGk3S1puLUVQbnlvM0hadTdrdy53b2ZmJ1xyXG4gICAgICBdLm1hcCh1cmwgPT4gbmV3IFVSTCh1cmwsIGxvY2F0aW9uKS5ocmVmKTtcclxuXHJcbiAgICAgIHJldHVybiBjYWNoZXMuaGFzKCd3aXR0ci1zdGF0aWMtdjEnKS50aGVuKGhhcyA9PiB7XHJcbiAgICAgICAgaWYgKCFoYXMpIHJldHVybiBbXCJDYW4ndCBmaW5kIGEgY2FjaGUgbmFtZWQgd2l0dHItc3RhdGljLXYxXCIsICdub3BlLmdpZicsIGZhbHNlXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGNhY2hlcy5vcGVuKCd3aXR0ci1zdGF0aWMtdjEnKS50aGVuKGMgPT4gYy5rZXlzKCkpLnRoZW4ocmVxcyA9PiB7XHJcbiAgICAgICAgICBjb25zdCB1cmxzID0gcmVxcy5tYXAociA9PiByLnVybCk7XHJcbiAgICAgICAgICBjb25zdCBhbGxBY2NvdW50ZWRGb3IgPSBleHBlY3RlZFVybHMuZXZlcnkodXJsID0+IHVybHMuaW5jbHVkZXModXJsKSk7XHJcblxyXG4gICAgICAgICAgaWYgKGFsbEFjY291bnRlZEZvcikge1xyXG4gICAgICAgICAgICByZXR1cm4gW1wiWWF5ISBUaGUgY2FjaGUgaXMgcmVhZHkgdG8gZ28hXCIsIFwiOS5naWZcIiwgdHJ1ZV07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gW1wiVGhlIGNhY2hlIGlzIHRoZXJlLCBidXQgaXQncyBtaXNzaW5nIHNvbWUgdGhpbmdzXCIsICdub3QtcXVpdGUuZ2lmJywgZmFsc2VdO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KVxyXG4gICAgfSk7XHJcbiAgfSxcclxuICBbJ2NhY2hlLXNlcnZlZCddKCkge1xyXG4gICAgcmV0dXJuIHJlbW90ZUV2YWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiBQcm9taXNlLmFsbChbXHJcbiAgICAgICAgZmV0Y2goJy8nKSxcclxuICAgICAgICBmZXRjaCgnL3BpbmcnKS50aGVuKHIgPT4gci5qc29uKCkpLmNhdGNoKGUgPT4gKHtvazogZmFsc2V9KSlcclxuICAgICAgXSkudGhlbihyZXNwb25zZXMgPT4ge1xyXG4gICAgICAgIGNvbnN0IGNhY2hlZFJlc3BvbnNlID0gcmVzcG9uc2VzWzBdO1xyXG4gICAgICAgIGNvbnN0IGpzb25SZXNwb25zZSA9IHJlc3BvbnNlc1sxXTtcclxuXHJcbiAgICAgICAgaWYgKCFqc29uUmVzcG9uc2Uub2spIHJldHVybiBbXCJEb2Vzbid0IGxvb2sgbGlrZSBub24tY2FjaGVkIHJlcXVlc3RzIGFyZSBnZXR0aW5nIHRocm91Z2hcIiwgJ25vdC1xdWl0ZS5naWYnLCBmYWxzZV07XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgMjAwMCkpLnRoZW4oXyA9PiBmZXRjaCgnLycpKS50aGVuKHJlc3BvbnNlID0+IHtcclxuICAgICAgICAgIGlmIChjYWNoZWRSZXNwb25zZS5oZWFkZXJzLmdldCgnRGF0ZScpID09PSByZXNwb25zZS5oZWFkZXJzLmdldCgnRGF0ZScpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbXCJZYXkhIENhY2hlZCByZXNwb25zZXMgYXJlIGJlaW5nIHJldHVybmVkIVwiLCBcIjEwLmdpZlwiLCB0cnVlXTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBbXCJEb2Vzbid0IGxvb2sgbGlrZSByZXNwb25zZXMgYXJlIHJldHVybmVkIGZyb20gdGhlIGNhY2hlXCIsICdub3BlLmdpZicsIGZhbHNlXTtcclxuICAgICAgICB9KVxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH0sXHJcbiAgWyduZXctY2FjaGUtcmVhZHknXSgpIHtcclxuICAgIHJldHVybiByZW1vdGVFdmFsKGZ1bmN0aW9uKCkge1xyXG4gICAgICByZXR1cm4gUHJvbWlzZS5hbGwoW1xyXG4gICAgICAgIGNhY2hlcy5oYXMoJ3dpdHRyLXN0YXRpYy12MScpLFxyXG4gICAgICAgIGNhY2hlcy5oYXMoJ3dpdHRyLXN0YXRpYy12MicpXHJcbiAgICAgIF0pLnRoZW4oaGFzQ2FjaGVzID0+IHtcclxuICAgICAgICBpZiAoIWhhc0NhY2hlc1swXSkgcmV0dXJuIFtcIkxvb2tzIGxpa2UgdGhlIHYxIGNhY2hlIGhhcyBhbHJlYWR5IGdvbmVcIiwgJ3NhZC5naWYnLCBmYWxzZV07XHJcbiAgICAgICAgaWYgKCFoYXNDYWNoZXNbMV0pIHJldHVybiBbXCJDYW4ndCBmaW5kIHRoZSB3aXR0ci1zdGF0aWMtdjIgY2FjaGVcIiwgJ3NhZC5naWYnLCBmYWxzZV07XHJcblxyXG4gICAgICAgIHJldHVybiBQcm9taXNlLmFsbChcclxuICAgICAgICAgIFsnd2l0dHItc3RhdGljLXYxJywgJ3dpdHRyLXN0YXRpYy12MiddLm1hcChuYW1lID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlcy5vcGVuKG5hbWUpXHJcbiAgICAgICAgICAgICAgLnRoZW4oYyA9PiBjLm1hdGNoKCcvY3NzL21haW4uY3NzJykpXHJcbiAgICAgICAgICAgICAgLnRoZW4ociA9PiByICYmIHIudGV4dCgpKVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICApLnRoZW4oY3NzVGV4dHMgPT4ge1xyXG4gICAgICAgICAgaWYgKCFjc3NUZXh0c1swXSkgcmV0dXJuIFtcIkNhbid0IGZpbmQgQ1NTIGluIHRoZSB2MSBjYWNoZVwiLCAnc2FkLmdpZicsIGZhbHNlXTtcclxuICAgICAgICAgIGlmICghY3NzVGV4dHNbMV0pIHJldHVybiBbXCJDYW4ndCBmaW5kIENTUyBpbiB0aGUgdjIgY2FjaGVcIiwgJ3NhZC5naWYnLCBmYWxzZV07XHJcblxyXG4gICAgICAgICAgaWYgKGNzc1RleHRzWzBdID09PSBjc3NUZXh0c1sxXSkge1xyXG4gICAgICAgICAgICByZXR1cm4gW1wiVGhlcmUncyBhIG5ldyBjYWNoZSwgYnV0IHRoZSBDU1MgbG9va3MgdGhlIHNhbWVcIiwgJ25vcGUuZ2lmJywgZmFsc2VdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIFtcIllheSEgVGhlIG5ldyBjYWNoZSBpcyByZWFkeSwgYnV0IGlzbid0IGRpc3J1cHRpbmcgY3VycmVudCBwYWdlc1wiLCBcIjExLmdpZlwiLCB0cnVlXTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICB9KVxyXG4gIH0sXHJcbiAgWyduZXctY2FjaGUtdXNlZCddKCkge1xyXG4gICAgcmV0dXJuIHJlbW90ZUV2YWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiBQcm9taXNlLmFsbChbXHJcbiAgICAgICAgY2FjaGVzLmhhcygnd2l0dHItc3RhdGljLXYxJyksXHJcbiAgICAgICAgY2FjaGVzLmhhcygnd2l0dHItc3RhdGljLXYyJylcclxuICAgICAgXSkudGhlbihoYXNDYWNoZXMgPT4ge1xyXG4gICAgICAgIGlmIChoYXNDYWNoZXNbMF0pIHJldHVybiBbXCJMb29rcyBsaWtlIHRoZSB2MSBjYWNoZSBpcyBzdGlsbCB0aGVyZVwiLCAnbm90LXF1aXRlLmdpZicsIGZhbHNlXTtcclxuICAgICAgICBpZiAoIWhhc0NhY2hlc1sxXSkgcmV0dXJuIFtcIkNhbid0IGZpbmQgdGhlIHdpdHRyLXN0YXRpYy12MiBjYWNoZVwiLCAnc2FkLmdpZicsIGZhbHNlXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFtcclxuICAgICAgICAgIGZldGNoKCcvY3NzL21haW4uY3NzJyksXHJcbiAgICAgICAgICBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgMjAwMCkpLnRoZW4oXyA9PiBmZXRjaCgnL2Nzcy9tYWluLmNzcycpKVxyXG4gICAgICAgIF0pLnRoZW4ocmVzcG9uc2VzID0+IHtcclxuICAgICAgICAgIGlmIChyZXNwb25zZXNbMF0uaGVhZGVycy5nZXQoJ0RhdGUnKSAhPSByZXNwb25zZXNbMV0uaGVhZGVycy5nZXQoJ0RhdGUnKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gW1wiRG9lc24ndCBsb29rIGxpa2UgdGhlIENTUyBpcyBiZWluZyBzZXJ2ZWQgZnJvbSB0aGUgY2FjaGVcIiwgJ21pc3Rha2UuZ2lmJywgZmFsc2VdO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHJldHVybiBvcGVuSWZyYW1lKCcvJykudGhlbihpZnJhbWUgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCB3aW4gPSBpZnJhbWUuY29udGVudFdpbmRvdztcclxuICAgICAgICAgICAgY29uc3QgZG9jID0gd2luLmRvY3VtZW50O1xyXG4gICAgICAgICAgICBjb25zdCBiZyA9IHdpbi5nZXRDb21wdXRlZFN0eWxlKGRvYy5xdWVyeVNlbGVjdG9yKCcudG9vbGJhcicpKS5iYWNrZ3JvdW5kQ29sb3I7XHJcblxyXG4gICAgICAgICAgICBpZiAoYmcgPT0gJ3JnYig2MywgODEsIDE4MSknKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIFtcIkRvZXNuJ3QgbG9vayBsaWtlIHRoZSBoZWFkZXIgY29sb3IgaGFzIGNoYW5nZWRcIiwgJ25vLWNyeS5naWYnLCBmYWxzZV07IFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBbXCJZYXkhIFlvdSBzYWZlbHkgdXBkYXRlZCB0aGUgQ1NTIVwiLCBcIjEyLmdpZlwiLCB0cnVlXTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pXHJcbiAgICAgIH0pXHJcbiAgICB9KTtcclxuICB9LFxyXG4gIFsndXBkYXRlLW5vdGlmeSddKCkge1xyXG4gICAgcmV0dXJuIHJlbW90ZUV2YWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiBuYXZpZ2F0b3Iuc2VydmljZVdvcmtlci5nZXRSZWdpc3RyYXRpb24oKS50aGVuKHJlZyA9PiB7XHJcbiAgICAgICAgaWYgKCFyZWcud2FpdGluZykgcmV0dXJuIFtcIkRvZXNuJ3QgbG9vayBsaWtlIHRoZXJlJ3MgYSB3YWl0aW5nIHdvcmtlclwiLCAnbm9wZS5naWYnLCBmYWxzZV07XHJcblxyXG4gICAgICAgIHJldHVybiBvcGVuSWZyYW1lKCcvJykudGhlbihpZnJhbWUgPT4ge1xyXG4gICAgICAgICAgY29uc3Qgd2luID0gaWZyYW1lLmNvbnRlbnRXaW5kb3c7XHJcbiAgICAgICAgICBjb25zdCBkb2MgPSB3aW4uZG9jdW1lbnQ7XHJcblxyXG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCA1MDApKS50aGVuKF8gPT4ge1xyXG4gICAgICAgICAgICBpZiAoZG9jLnF1ZXJ5U2VsZWN0b3IoJy50b2FzdCcpKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIFtcIllheSEgVGhlcmUgYXJlIG5vdGlmaWNhdGlvbnMhXCIsIFwiMTMuZ2lmXCIsIHRydWVdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBbXCJEb2Vzbid0IGxvb2sgbGlrZSB0aGVyZSdzIGEgbm90aWZpY2F0aW9uIGJlaW5nIHRyaWdnZXJlZFwiLCAnc2FkLmdpZicsIGZhbHNlXTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSlcclxuICB9LFxyXG4gIFsndXBkYXRlLXJlbG9hZCddKCkge1xyXG4gICAgcmV0dXJuIHJlbW90ZUV2YWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiBuYXZpZ2F0b3Iuc2VydmljZVdvcmtlci5nZXRSZWdpc3RyYXRpb24oKS50aGVuKHJlZyA9PiB7XHJcbiAgICAgICAgaWYgKCFyZWcud2FpdGluZykgcmV0dXJuIFtcIkRvZXNuJ3QgbG9vayBsaWtlIHRoZXJlJ3MgYSB3YWl0aW5nIHdvcmtlclwiLCAnbm9wZS5naWYnLCBmYWxzZV07XHJcblxyXG4gICAgICAgIHJldHVybiBvcGVuSWZyYW1lKCcvJykudGhlbihpZnJhbWUgPT4ge1xyXG4gICAgICAgICAgY29uc3Qgd2luID0gaWZyYW1lLmNvbnRlbnRXaW5kb3c7XHJcbiAgICAgICAgICBjb25zdCBkb2MgPSB3aW4uZG9jdW1lbnQ7XHJcblxyXG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KF8gPT4gcmVzb2x2ZShbXCJEaWRuJ3QgZGV0ZWN0IHRoZSBwYWdlIGJlaW5nIHJlbG9hZGVkIDooXCIsICdzYWQuZ2lmJywgZmFsc2VdKSwgODAwMCk7XHJcbiAgICAgICAgICAgIGlmcmFtZS5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgXyA9PiB7XHJcbiAgICAgICAgICAgICAgcmVzb2x2ZShbXCJZYXkhIFRoZSBwYWdlIHJlbG9hZGVkIVwiLCBcIjE0LmdpZlwiLCB0cnVlXSk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICB9KVxyXG4gIH0sXHJcbiAgWydzZXJ2ZS1za2VsZXRvbiddKCkge1xyXG4gICAgcmV0dXJuIHJlbW90ZUV2YWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiBmZXRjaCgnLycpLnRoZW4ociA9PiByLnRleHQoKSkudGhlbih0ZXh0ID0+IHtcclxuICAgICAgICBpZiAodGV4dC5pbmNsdWRlcygncG9zdC1jb250ZW50JykpIHtcclxuICAgICAgICAgIHJldHVybiBbXCJEb2Vzbid0IGxvb2sgbGlrZSB0aGUgcGFnZSBza2VsZXRvbiBpcyBiZWluZyBzZXJ2ZWRcIiwgJ25vcGUuZ2lmJywgZmFsc2VdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZldGNoKCdodHRwczovL2dvb2dsZS5jb20vJykudGhlbihyID0+IHIudGV4dCgpKS5jYXRjaChlID0+ICcnKS50aGVuKGdUZXh0ID0+IHtcclxuICAgICAgICAgIGlmIChnVGV4dCA9PSB0ZXh0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbXCJMb29rcyBsaWtlIHlvdSdyZSBzZXJ2aW5nIHRoZSBza2VsZXRvbiBmb3IgaHR0cHM6Ly9nb29nbGUuY29tLyB0b28hXCIsICdub3QtcXVpdGUuZ2lmJywgZmFsc2VdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIFtcIllheSEgVGhlIHBhZ2Ugc2tlbGV0b24gaXMgYmVpbmcgc2VydmVkIVwiLCBcIjE1LmdpZlwiLCB0cnVlXTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9LFxyXG4gIFsnaWRiLWFuaW1hbCddKCkge1xyXG4gICAgcmV0dXJuIHJlbW90ZUV2YWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiBvcGVuRGIoJ3Rlc3QtZGInKS50aGVuKGRiID0+IHtcclxuICAgICAgICBjb25zdCB0eCA9IGRiLnRyYW5zYWN0aW9uKCdrZXl2YWwnKTtcclxuICAgICAgICByZXR1cm4gdHgub2JqZWN0U3RvcmUoJ2tleXZhbCcpLmdldCgnZmF2b3JpdGVBbmltYWwnKS50aGVuKGFuaW1hbCA9PiB7XHJcbiAgICAgICAgICBpZiAoIWFuaW1hbCkgcmV0dXJuIFtcIkNhbid0IGZpbmQgZmF2b3JpdGVBbmltYWwgaW4ga2V5dmFsXCIsICdub3BlLmdpZicsIGZhbHNlXTtcclxuICAgICAgICAgIHJldHVybiBbXCJZYXkhIFlvdXIgZmF2b3JpdGUgYW5pbWFsIGlzIFxcXCJcIiArIGFuaW1hbCArIFwiXFxcIlwiLCBcIjE2LmdpZlwiLCB0cnVlXTtcclxuICAgICAgICB9KVxyXG4gICAgICB9LCBlcnIgPT4ge1xyXG4gICAgICAgIHJldHVybiBbXCJDb3VsZG4ndCBvcGVuIHRoZSB0ZXN0LWRiIGRhdGFiYXNlIGF0IGFsbCA6KFwiLCAnc2FkLmdpZicsIGZhbHNlXTtcclxuICAgICAgfSlcclxuICAgIH0pO1xyXG4gIH0sXHJcbiAgWydpZGItYWdlJ10oKSB7XHJcbiAgICByZXR1cm4gcmVtb3RlRXZhbChmdW5jdGlvbigpIHtcclxuICAgICAgcmV0dXJuIG9wZW5EYigndGVzdC1kYicpLnRoZW4oZGIgPT4ge1xyXG4gICAgICAgIGlmICghQXJyYXkuZnJvbShkYi5vYmplY3RTdG9yZU5hbWVzKS5pbmNsdWRlcygncGVvcGxlJykpIHtcclxuICAgICAgICAgIHJldHVybiBbXCJDYW4ndCBmaW5kIHRoZSAncGVvcGxlJyBvYmplY3RTdG9yZVwiLCAnbWlzdGFrZS5naWYnLCBmYWxzZV07IFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdHggPSBkYi50cmFuc2FjdGlvbigncGVvcGxlJyk7XHJcbiAgICAgICAgY29uc3Qgc3RvcmUgPSB0eC5vYmplY3RTdG9yZSgncGVvcGxlJyk7XHJcblxyXG4gICAgICAgIGlmICghQXJyYXkuZnJvbShzdG9yZS5pbmRleE5hbWVzKS5pbmNsdWRlcygnYWdlJykpIHtcclxuICAgICAgICAgIHJldHVybiBbXCJDYW4ndCBmaW5kIHRoZSAnYWdlJyBpbmRleCBpbiB0aGUgJ3Blb3BsZScgb2JqZWN0U3RvcmVcIiwgJ3NhZC5naWYnLCBmYWxzZV07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBpbmRleCA9IHN0b3JlLmluZGV4KCdhZ2UnKTtcclxuXHJcbiAgICAgICAgaWYgKGluZGV4LmtleVBhdGggPT0gJ2FnZScpIHtcclxuICAgICAgICAgIHJldHVybiBbXCJZYXkhIFRoZSBhZ2UgaW5kZXggaXMgd29ya2luZ1wiLCBcIjE3LmdpZlwiLCB0cnVlXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBbXCJUaGUgYWdlIGluZGV4IGlzbid0IGluZGV4ZWQgYnkgYWdlXCIsICdub3BlLmdpZicsIGZhbHNlXTtcclxuICAgICAgfSwgZXJyID0+IHtcclxuICAgICAgICByZXR1cm4gW1wiQ291bGRuJ3Qgb3BlbiB0aGUgdGVzdC1kYiBkYXRhYmFzZSBhdCBhbGwgOihcIiwgJ3NhZC5naWYnLCBmYWxzZV07XHJcbiAgICAgIH0pXHJcbiAgICB9KTtcclxuICB9LFxyXG4gIFsnaWRiLXN0b3JlJ10oKSB7XHJcbiAgICByZXR1cm4gcmVtb3RlRXZhbChmdW5jdGlvbigpIHtcclxuICAgICAgcmV0dXJuIG9wZW5EYignd2l0dHInKS50aGVuKGRiID0+IHtcclxuICAgICAgICBpZiAoIUFycmF5LmZyb20oZGIub2JqZWN0U3RvcmVOYW1lcykuaW5jbHVkZXMoJ3dpdHRycycpKSB7XHJcbiAgICAgICAgICByZXR1cm4gW1wiVGhlcmUgaXNuJ3QgYSAnd2l0dHJzJyBvYmplY3RTdG9yZVwiLCAnc2FkLmdpZicsIGZhbHNlXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHR4ID0gZGIudHJhbnNhY3Rpb24oJ3dpdHRycycpO1xyXG4gICAgICAgIGNvbnN0IHN0b3JlID0gdHgub2JqZWN0U3RvcmUoJ3dpdHRycycpO1xyXG5cclxuICAgICAgICBpZiAoc3RvcmUua2V5UGF0aCAhPSAnaWQnKSB7XHJcbiAgICAgICAgICByZXR1cm4gW1wiJ3dpdHRycycgb2JqZWN0U3RvcmUgZG9lc24ndCB1c2UgJ2lkJyBhcyBpdHMgcHJpbWFyeSBrZXlcIiwgJ25vcGUuZ2lmJywgZmFsc2VdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFBcnJheS5mcm9tKHN0b3JlLmluZGV4TmFtZXMpLmluY2x1ZGVzKCdieS1kYXRlJykpIHtcclxuICAgICAgICAgIHJldHVybiBbXCJUaGVyZSBpc24ndCBhICdieS1kYXRlJyBpbmRleCBvbiB0aGUgJ3dpdHRycycgb2JqZWN0U3RvcmVcIiwgJ25vcGUuZ2lmJywgZmFsc2VdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgaW5kZXggPSBzdG9yZS5pbmRleCgnYnktZGF0ZScpO1xyXG5cclxuICAgICAgICBpZiAoaW5kZXgua2V5UGF0aCAhPSAndGltZScpIHtcclxuICAgICAgICAgIHJldHVybiBbXCJUaGUgJ2J5LWRhdGUnIGluZGV4IGlzbid0IHVzaW5nICd0aW1lJyBhcyBpdHMga2V5XCIsICdub3BlLmdpZicsIGZhbHNlXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBzdG9yZS5nZXRBbGwoKS50aGVuKG1lc3NhZ2VzID0+IHtcclxuICAgICAgICAgIGlmICghbWVzc2FnZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbXCJUaGUgb2JqZWN0U3RvcmUgaXMgdGhlcmUsIGJ1dCBpdCdzIGVtcHR5XCIsICdzYWQuZ2lmJywgZmFsc2VdO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGNvbnN0IGxvb2tzTWVzc2FnZXkgPSBtZXNzYWdlcy5ldmVyeShtZXNzYWdlID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2UuaWQgJiYgbWVzc2FnZS5hdmF0YXIgJiYgbWVzc2FnZS5uYW1lICYmIG1lc3NhZ2UudGltZSAmJiBtZXNzYWdlLmJvZHk7XHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICBpZiAobG9va3NNZXNzYWdleSkge1xyXG4gICAgICAgICAgICByZXR1cm4gW1wiVGhlIGRhdGFiYXNlIGlzIHNldCB1cCBhbmQgcG9wdWxhdGVkIVwiLCBcIjE4LmdpZlwiLCB0cnVlXTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICByZXR1cm4gW1wiTG9va3MgbGlrZSBzb21lIGluY29ycmVjdCBkYXRhIGlzIGluIHRoZSBkYXRhYmFzZVwiLCAnbm90LXF1aXRlLmdpZicsIGZhbHNlXTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgIHJldHVybiBbXCJDb3VsZG4ndCBvcGVuIHRoZSAnd2l0dHInIGRhdGFiYXNlIGF0IGFsbCA6KFwiLCAnc2FkLmdpZicsIGZhbHNlXTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9LFxyXG4gIFsnaWRiLXNob3cnXSgpIHtcclxuICAgIHJldHVybiByZW1vdGVFdmFsKGZ1bmN0aW9uKCkge1xyXG4gICAgICByZXR1cm4gb3BlbkRiKCd3aXR0cicpLnRoZW4oZGIgPT4ge1xyXG4gICAgICAgIHJldHVybiBvcGVuSWZyYW1lKCcvP25vLXNvY2tldCcpLnRoZW4oaWZyYW1lID0+IHtcclxuICAgICAgICAgIGNvbnN0IHdpbiA9IGlmcmFtZS5jb250ZW50V2luZG93O1xyXG4gICAgICAgICAgY29uc3QgZG9jID0gd2luLmRvY3VtZW50O1xyXG5cclxuICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgNTAwKSkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRpbWVzID0gQXJyYXkuZnJvbShkb2MucXVlcnlTZWxlY3RvckFsbCgnLnBvc3QtY29udGVudCB0aW1lJykpO1xyXG4gICAgICAgICAgICBpZiAoIXRpbWVzLmxlbmd0aCkgcmV0dXJuIFtcIlBhZ2UgbG9va3MgZW1wdHkgd2l0aG91dCB0aGUgd2ViIHNvY2tldFwiLCAnbm9wZS5naWYnLCBmYWxzZV07XHJcblxyXG4gICAgICAgICAgICBjb25zdCBpbk9yZGVyID0gdGltZXMubWFwKHQgPT4gbmV3IERhdGUodC5nZXRBdHRyaWJ1dGUoJ2RhdGV0aW1lJykpKS5ldmVyeSgodGltZSwgaSwgYXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc3QgbmV4dFRpbWUgPSBhcnJbaSsxXTtcclxuICAgICAgICAgICAgICBpZiAoIW5leHRUaW1lKSByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICByZXR1cm4gdGltZSA+PSBuZXh0VGltZTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWluT3JkZXIpIHJldHVybiBbXCJTbyBjbG9zZSEgQnV0IHRoZSBuZXdlc3QgcG9zdCBzaG91bGQgYXBwZWFyIGF0IHRoZSB0b3BcIiwgJ25vdC1xdWl0ZS5naWYnLCBmYWxzZV07XHJcbiAgICAgICAgICAgIHJldHVybiBbXCJQYWdlIHBvcHVsYXRlZCBmcm9tIElEQiFcIiwgXCIxOS5naWZcIiwgdHJ1ZV07XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgIHJldHVybiBbXCJDb3VsZG4ndCBvcGVuIHRoZSAnd2l0dHInIGRhdGFiYXNlIGF0IGFsbCA6KFwiLCAnc2FkLmdpZicsIGZhbHNlXTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9LFxyXG4gIFsnaWRiLWNsZWFuJ10oKSB7XHJcbiAgICByZXR1cm4gcmVtb3RlRXZhbChmdW5jdGlvbigpIHtcclxuICAgICAgcmV0dXJuIG9wZW5EYignd2l0dHInKS50aGVuKGRiID0+IHtcclxuICAgICAgICBjb25zdCB0eCA9IGRiLnRyYW5zYWN0aW9uKCd3aXR0cnMnKTtcclxuICAgICAgICBjb25zdCBzdG9yZSA9IHR4Lm9iamVjdFN0b3JlKCd3aXR0cnMnKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHN0b3JlLmNvdW50KCkudGhlbihudW0gPT4ge1xyXG4gICAgICAgICAgaWYgKG51bSA+IDMwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbXCJUaGVyZSBhcmUgbW9yZSB0aGFuIDMwIGl0ZW1zIGluIHRoZSBzdG9yZVwiLCAnbm9wZS5naWYnLCBmYWxzZV07XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKG51bSA8IDMwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbXCJUaGVyZSBhcmUgbGVzcyB0aGFuIDMwIGl0ZW1zIGluIHRoZSBzdG9yZSwgc28gaXQgaXNuJ3QgY2xlYXIgaWYgdGhpcyBpcyB3b3JraW5nXCIsICdub3QtcXVpdGUuZ2lmJywgZmFsc2VdO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHJldHVybiBbXCJMb29rcyBsaWtlIHRoZSBkYXRhYmFzZSBpcyBiZWluZyBjbGVhbmVkIVwiLCBcIjIwLmdpZlwiLCB0cnVlXTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgIHJldHVybiBbXCJDb3VsZG4ndCBvcGVuIHRoZSAnd2l0dHInIGRhdGFiYXNlIGF0IGFsbCA6KFwiLCAnc2FkLmdpZicsIGZhbHNlXTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9LFxyXG4gIFsnY2FjaGUtcGhvdG9zJ10oKSB7XHJcbiAgICByZXR1cm4gcmVtb3RlRXZhbChmdW5jdGlvbigpIHtcclxuICAgICAgcmV0dXJuIGNhY2hlcy5oYXMoJ3dpdHRyLWNvbnRlbnQtaW1ncycpLnRoZW4oaGFzQ2FjaGUgPT4ge1xyXG4gICAgICAgIGlmICghaGFzQ2FjaGUpIHJldHVybiBbXCJUaGVyZSBpc24ndCBhICd3aXR0ci1jb250ZW50LWltZ3MnIGNhY2hlXCIsICdzYWQuZ2lmJywgZmFsc2VdO1xyXG5cclxuICAgICAgICAvLyBjbGVhciBjYWNoZVxyXG4gICAgICAgIHJldHVybiBjYWNoZXMuZGVsZXRlKCd3aXR0ci1jb250ZW50LWltZ3MnKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgIGNvbnN0IGltYWdlVXJsU21hbGwgPSAnL3Bob3Rvcy80LTMwODctMjkxODk0OTc5OC04NjVmMTM0ZWYzLTMyMHB4LmpwZyc7XHJcbiAgICAgICAgICBjb25zdCBpbWFnZVVybE1lZGl1bSA9ICcvcGhvdG9zLzQtMzA4Ny0yOTE4OTQ5Nzk4LTg2NWYxMzRlZjMtNjQwcHguanBnJztcclxuXHJcbiAgICAgICAgICByZXR1cm4gZmV0Y2goaW1hZ2VVcmxNZWRpdW0pLnRoZW4obWVkUmVzcG9uc2UgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UociA9PiBzZXRUaW1lb3V0KHIsIDIwMDApKVxyXG4gICAgICAgICAgICAgIC50aGVuKCgpID0+IGZldGNoKGltYWdlVXJsTWVkaXVtKSkudGhlbihhbm90aGVyTWVkUmVzcG9uc2UgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKG1lZFJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdEYXRlJykgIT0gYW5vdGhlck1lZFJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdEYXRlJykpIHtcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuIFtcIkRvZXNuJ3QgbG9vayBsaWtlIGltYWdlcyBhcmUgYmVpbmcgcmV0dXJuZWQgZnJvbSB0aGUgY2FjaGVcIiwgJ25vcGUuZ2lmJywgZmFsc2VdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBmZXRjaChpbWFnZVVybFNtYWxsKS50aGVuKHNtYWxsUmVzcG9uc2UgPT4ge1xyXG4gICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoW3NtYWxsUmVzcG9uc2UuYmxvYigpLCBtZWRSZXNwb25zZS5ibG9iKCldKTtcclxuICAgICAgICAgICAgICAgIH0pLnRoZW4oYmxvYnMgPT4ge1xyXG4gICAgICAgICAgICAgICAgICBpZiAoYmxvYnNbMF0uc2l6ZSAhPSBibG9ic1sxXS5zaXplKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtcIlRoZSBvcmlnaW5hbGx5IGNhY2hlZCBpbWFnZSBpc24ndCBiZWluZyByZXR1cm5lZCBmb3IgZGlmZmVyZW50IHNpemVzXCIsICdub3BlLmdpZicsIGZhbHNlXTtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICByZXR1cm4gW1wiUGhvdG9zIGFyZSBiZWluZyBjYWNoZWQgYW5kIHNlcnZlZCBjb3JyZWN0bHkhXCIsIFwiMjEuZ2lmXCIsIHRydWVdO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9LFxyXG4gIFsnY2FjaGUtY2xlYW4nXSgpIHtcclxuICAgIHJldHVybiByZW1vdGVFdmFsKGZ1bmN0aW9uKCkge1xyXG4gICAgICByZXR1cm4gY2FjaGVzLm9wZW4oJ3dpdHRyLWNvbnRlbnQtaW1ncycpLnRoZW4oY2FjaGUgPT4ge1xyXG4gICAgICAgIGNvbnN0IGltYWdlVXJsTWVkaXVtID0gJy9waG90b3MvNC0zMDg3LTI5MTg5NDk3OTgtODY1ZjEzNGVmMy02NDBweC5qcGcnO1xyXG5cclxuICAgICAgICByZXR1cm4gZmV0Y2goaW1hZ2VVcmxNZWRpdW0pLnRoZW4ociA9PiByLmJsb2IoKSkudGhlbigoKSA9PiBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgNTAwKSkpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIGNhY2hlLm1hdGNoKCcvcGhvdG9zLzQtMzA4Ny0yOTE4OTQ5Nzk4LTg2NWYxMzRlZjMnKS50aGVuKHJlc3BvbnNlID0+IHtcclxuICAgICAgICAgICAgaWYgKCFyZXNwb25zZSkgcmV0dXJuIFtcIlBob3RvcyBhcmVuJ3QgYXBwZWFyaW5nIGluIHRoZSBjYWNoZSB3aGVyZSB3ZSdkIGV4cGVjdFwiLCAnbm90LXF1aXRlLmdpZicsIGZhbHNlXTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gRGF0ZS5ub3coKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKGZ1bmN0aW9uIGNoZWNrQ2FjaGUoKSB7XHJcbiAgICAgICAgICAgICAgaWYgKERhdGUubm93KCkgLSBzdGFydCA+IDgwMDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBbXCJUaGUgaW1hZ2UgY2FjaGUgZG9lc24ndCBzZWVtIHRvIGJlIGdldHRpbmcgY2xlYW5lZFwiLCAnbm9wZS5naWYnLCBmYWxzZV07IFxyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgcmV0dXJuIGNhY2hlLm1hdGNoKCcvcGhvdG9zLzQtMzA4Ny0yOTE4OTQ5Nzk4LTg2NWYxMzRlZjMnKS50aGVuKHJlc3BvbnNlID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICghcmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuIFtcIllheSEgVGhlIGltYWdlIGNhY2hlIGlzIGJlaW5nIGNsZWFuZWQhXCIsICcyMi5naWYnLCB0cnVlXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgMTAwKSkudGhlbihjaGVja0NhY2hlKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9LFxyXG4gIFsnY2FjaGUtYXZhdGFycyddKCkge1xyXG4gICAgcmV0dXJuIHJlbW90ZUV2YWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiBjYWNoZXMuZGVsZXRlKCd3aXR0ci1jb250ZW50LWltZ3MnKS50aGVuKCgpID0+IHtcclxuICAgICAgICBjb25zdCBpbWFnZVVybFNtYWxsID0gJy9hdmF0YXJzL21hcmMtMXguanBnJztcclxuICAgICAgICBjb25zdCBpbWFnZVVybE1lZGl1bSA9ICcvYXZhdGFycy9tYXJjLTJ4LmpwZyc7XHJcblxyXG4gICAgICAgIHJldHVybiBmZXRjaChpbWFnZVVybFNtYWxsKS50aGVuKHNtYWxsUmVzcG9uc2UgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCAyMDAwKSlcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4gZmV0Y2goaW1hZ2VVcmxNZWRpdW0pKS50aGVuKG1lZFJlc3BvbnNlID0+IHtcclxuICAgICAgICAgICAgICBpZiAoc21hbGxSZXNwb25zZS5oZWFkZXJzLmdldCgnRGF0ZScpICE9IG1lZFJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdEYXRlJykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBbXCJEb2Vzbid0IGxvb2sgbGlrZSBhdmF0YXJzIGFyZSBiZWluZyByZXR1cm5lZCBmcm9tIHRoZSBjYWNoZSwgZXZlbiBpZiB0aGUgcmVxdWVzdCBpcyBmb3IgYSBkaWZmZXJlbnQgc2l6ZVwiLCAnbm9wZS5naWYnLCBmYWxzZV07XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UociA9PiBzZXRUaW1lb3V0KHIsIDIwMDApKS50aGVuKCgpID0+IGZldGNoKGltYWdlVXJsTWVkaXVtKSkudGhlbihhbm90aGVyTWVkUmVzcG9uc2UgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKG1lZFJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdEYXRlJykgPT0gYW5vdGhlck1lZFJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdEYXRlJykpIHtcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuIFtcIkRvZXNuJ3QgbG9vayBsaWtlIGF2YXRhcnMgYXJlIGJlaW5nIHVwZGF0ZWQgYWZ0ZXIgYmVpbmcgcmV0dXJuZWQgZnJvbSB0aGUgY2FjaGVcIiwgJ25vcGUuZ2lmJywgZmFsc2VdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtcIkF2YXRhcnMgYXJlIGJlaW5nIGNhY2hlZCwgc2VydmVkIGFuZCB1cGRhdGVkIGNvcnJlY3RseSFcIiwgXCIyMy5naWZcIiwgdHJ1ZV07XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxufTsiLCJpbXBvcnQgcGFyc2VIVE1MIGZyb20gJy4uLy4uL3V0aWxzL3BhcnNlSFRNTCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTcGlubmVyIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMuY29udGFpbmVyID0gcGFyc2VIVE1MKFxyXG4gICAgICAnPGRpdiBjbGFzcz1cInNwaW5uZXJcIj4nICtcclxuICAgICAgICAnPGRpdiBjbGFzcz1cInNwaW5uZXItY29udGFpbmVyXCI+JyArXHJcbiAgICAgICAgICAnPGRpdiBjbGFzcz1cInNwaW5uZXItbGF5ZXJcIj4nICtcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJjaXJjbGUtY2xpcHBlciBsZWZ0XCI+JyArXHJcbiAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJjaXJjbGVcIj48L2Rpdj4nICtcclxuICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cImdhcC1wYXRjaFwiPicgK1xyXG4gICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiY2lyY2xlXCI+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJjaXJjbGUtY2xpcHBlciByaWdodFwiPicgK1xyXG4gICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiY2lyY2xlXCI+PC9kaXY+JyArXHJcbiAgICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAgICc8L2Rpdj4nICtcclxuICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICc8L2Rpdj4nICtcclxuICAgICcnKS5maXJzdENoaWxkO1xyXG5cclxuICAgIHRoaXMuX3Nob3dUaW1lb3V0ID0gbnVsbDtcclxuICAgIHRoaXMuY29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcblxyXG4gICAgdmFyIGFuaW1FbmRMaXN0ZW5lciA9IGV2ZW50ID0+IHtcclxuICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PSB0aGlzLmNvbnRhaW5lcikge1xyXG4gICAgICAgIHRoaXMuY29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcignd2Via2l0QW5pbWF0aW9uRW5kJywgYW5pbUVuZExpc3RlbmVyKTtcclxuICAgIHRoaXMuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoJ2FuaW1hdGlvbmVuZCcsIGFuaW1FbmRMaXN0ZW5lcik7XHJcbiAgfVxyXG5cclxuICBzaG93KGRlbGF5ID0gMzAwKSB7XHJcbiAgICBjbGVhclRpbWVvdXQodGhpcy5fc2hvd1RpbWVvdXQpO1xyXG4gICAgdGhpcy5jb250YWluZXIuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgIHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2Nvb2xkb3duJyk7XHJcbiAgICB0aGlzLl9zaG93VGltZW91dCA9IHNldFRpbWVvdXQoXyA9PiB7XHJcbiAgICAgIHRoaXMuY29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSAnJztcclxuICAgIH0sIGRlbGF5KTtcclxuICB9XHJcblxyXG4gIGhpZGUoKSB7XHJcbiAgICBjbGVhclRpbWVvdXQodGhpcy5fc2hvd1RpbWVvdXQpO1xyXG4gICAgdGhpcy5jb250YWluZXIuY2xhc3NMaXN0LmFkZCgnY29vbGRvd24nKTtcclxuICB9XHJcbn1cclxuIiwidmFyIGNvbnRleHRSYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XHJcbmNvbnRleHRSYW5nZS5zZXRTdGFydChkb2N1bWVudC5ib2R5LCAwKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHN0clRvRWxzKHN0cikge1xyXG4gIHJldHVybiBjb250ZXh0UmFuZ2UuY3JlYXRlQ29udGV4dHVhbEZyYWdtZW50KHN0cik7XHJcbn0iXX0=