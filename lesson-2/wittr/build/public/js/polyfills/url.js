(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

'use strict';

(function (scope) {
  'use strict';

  // feature detect for URL constructor
  var hasWorkingUrl = false;
  if (!scope.forceJURL) {
    try {
      var u = new URL('b', 'http://a');
      u.pathname = 'c%20d';
      hasWorkingUrl = u.href === 'http://a/c%20d';
    } catch (e) {}
  }

  if (hasWorkingUrl) return;

  var relative = Object.create(null);
  relative['ftp'] = 21;
  relative['file'] = 0;
  relative['gopher'] = 70;
  relative['http'] = 80;
  relative['https'] = 443;
  relative['ws'] = 80;
  relative['wss'] = 443;

  var relativePathDotMapping = Object.create(null);
  relativePathDotMapping['%2e'] = '.';
  relativePathDotMapping['.%2e'] = '..';
  relativePathDotMapping['%2e.'] = '..';
  relativePathDotMapping['%2e%2e'] = '..';

  function isRelativeScheme(scheme) {
    return relative[scheme] !== undefined;
  }

  function invalid() {
    clear.call(this);
    this._isInvalid = true;
  }

  function IDNAToASCII(h) {
    if ('' == h) {
      invalid.call(this);
    }
    // XXX
    return h.toLowerCase();
  }

  function percentEscape(c) {
    var unicode = c.charCodeAt(0);
    if (unicode > 0x20 && unicode < 0x7F &&
    // " # < > ? `
    [0x22, 0x23, 0x3C, 0x3E, 0x3F, 0x60].indexOf(unicode) == -1) {
      return c;
    }
    return encodeURIComponent(c);
  }

  function percentEscapeQuery(c) {
    // XXX This actually needs to encode c using encoding and then
    // convert the bytes one-by-one.

    var unicode = c.charCodeAt(0);
    if (unicode > 0x20 && unicode < 0x7F &&
    // " # < > ` (do not escape '?')
    [0x22, 0x23, 0x3C, 0x3E, 0x60].indexOf(unicode) == -1) {
      return c;
    }
    return encodeURIComponent(c);
  }

  var EOF = undefined,
      ALPHA = /[a-zA-Z]/,
      ALPHANUMERIC = /[a-zA-Z0-9\+\-\.]/;

  function parse(input, stateOverride, base) {
    function err(message) {
      errors.push(message);
    }

    var state = stateOverride || 'scheme start',
        cursor = 0,
        buffer = '',
        seenAt = false,
        seenBracket = false,
        errors = [];

    loop: while ((input[cursor - 1] != EOF || cursor == 0) && !this._isInvalid) {
      var c = input[cursor];
      switch (state) {
        case 'scheme start':
          if (c && ALPHA.test(c)) {
            buffer += c.toLowerCase(); // ASCII-safe
            state = 'scheme';
          } else if (!stateOverride) {
            buffer = '';
            state = 'no scheme';
            continue;
          } else {
            err('Invalid scheme.');
            break loop;
          }
          break;

        case 'scheme':
          if (c && ALPHANUMERIC.test(c)) {
            buffer += c.toLowerCase(); // ASCII-safe
          } else if (':' == c) {
              this._scheme = buffer;
              buffer = '';
              if (stateOverride) {
                break loop;
              }
              if (isRelativeScheme(this._scheme)) {
                this._isRelative = true;
              }
              if ('file' == this._scheme) {
                state = 'relative';
              } else if (this._isRelative && base && base._scheme == this._scheme) {
                state = 'relative or authority';
              } else if (this._isRelative) {
                state = 'authority first slash';
              } else {
                state = 'scheme data';
              }
            } else if (!stateOverride) {
              buffer = '';
              cursor = 0;
              state = 'no scheme';
              continue;
            } else if (EOF == c) {
              break loop;
            } else {
              err('Code point not allowed in scheme: ' + c);
              break loop;
            }
          break;

        case 'scheme data':
          if ('?' == c) {
            query = '?';
            state = 'query';
          } else if ('#' == c) {
            this._fragment = '#';
            state = 'fragment';
          } else {
            // XXX error handling
            if (EOF != c && '\t' != c && '\n' != c && '\r' != c) {
              this._schemeData += percentEscape(c);
            }
          }
          break;

        case 'no scheme':
          if (!base || !isRelativeScheme(base._scheme)) {
            err('Missing scheme.');
            invalid.call(this);
          } else {
            state = 'relative';
            continue;
          }
          break;

        case 'relative or authority':
          if ('/' == c && '/' == input[cursor + 1]) {
            state = 'authority ignore slashes';
          } else {
            err('Expected /, got: ' + c);
            state = 'relative';
            continue;
          }
          break;

        case 'relative':
          this._isRelative = true;
          if ('file' != this._scheme) this._scheme = base._scheme;
          if (EOF == c) {
            this._host = base._host;
            this._port = base._port;
            this._path = base._path.slice();
            this._query = base._query;
            this._username = base._username;
            this._password = base._password;
            break loop;
          } else if ('/' == c || '\\' == c) {
            if ('\\' == c) err('\\ is an invalid code point.');
            state = 'relative slash';
          } else if ('?' == c) {
            this._host = base._host;
            this._port = base._port;
            this._path = base._path.slice();
            this._query = '?';
            this._username = base._username;
            this._password = base._password;
            state = 'query';
          } else if ('#' == c) {
            this._host = base._host;
            this._port = base._port;
            this._path = base._path.slice();
            this._query = base._query;
            this._fragment = '#';
            this._username = base._username;
            this._password = base._password;
            state = 'fragment';
          } else {
            var nextC = input[cursor + 1];
            var nextNextC = input[cursor + 2];
            if ('file' != this._scheme || !ALPHA.test(c) || nextC != ':' && nextC != '|' || EOF != nextNextC && '/' != nextNextC && '\\' != nextNextC && '?' != nextNextC && '#' != nextNextC) {
              this._host = base._host;
              this._port = base._port;
              this._username = base._username;
              this._password = base._password;
              this._path = base._path.slice();
              this._path.pop();
            }
            state = 'relative path';
            continue;
          }
          break;

        case 'relative slash':
          if ('/' == c || '\\' == c) {
            if ('\\' == c) {
              err('\\ is an invalid code point.');
            }
            if ('file' == this._scheme) {
              state = 'file host';
            } else {
              state = 'authority ignore slashes';
            }
          } else {
            if ('file' != this._scheme) {
              this._host = base._host;
              this._port = base._port;
              this._username = base._username;
              this._password = base._password;
            }
            state = 'relative path';
            continue;
          }
          break;

        case 'authority first slash':
          if ('/' == c) {
            state = 'authority second slash';
          } else {
            err("Expected '/', got: " + c);
            state = 'authority ignore slashes';
            continue;
          }
          break;

        case 'authority second slash':
          state = 'authority ignore slashes';
          if ('/' != c) {
            err("Expected '/', got: " + c);
            continue;
          }
          break;

        case 'authority ignore slashes':
          if ('/' != c && '\\' != c) {
            state = 'authority';
            continue;
          } else {
            err('Expected authority, got: ' + c);
          }
          break;

        case 'authority':
          if ('@' == c) {
            if (seenAt) {
              err('@ already seen.');
              buffer += '%40';
            }
            seenAt = true;
            for (var i = 0; i < buffer.length; i++) {
              var cp = buffer[i];
              if ('\t' == cp || '\n' == cp || '\r' == cp) {
                err('Invalid whitespace in authority.');
                continue;
              }
              // XXX check URL code points
              if (':' == cp && null === this._password) {
                this._password = '';
                continue;
              }
              var tempC = percentEscape(cp);
              null !== this._password ? this._password += tempC : this._username += tempC;
            }
            buffer = '';
          } else if (EOF == c || '/' == c || '\\' == c || '?' == c || '#' == c) {
            cursor -= buffer.length;
            buffer = '';
            state = 'host';
            continue;
          } else {
            buffer += c;
          }
          break;

        case 'file host':
          if (EOF == c || '/' == c || '\\' == c || '?' == c || '#' == c) {
            if (buffer.length == 2 && ALPHA.test(buffer[0]) && (buffer[1] == ':' || buffer[1] == '|')) {
              state = 'relative path';
            } else if (buffer.length == 0) {
              state = 'relative path start';
            } else {
              this._host = IDNAToASCII.call(this, buffer);
              buffer = '';
              state = 'relative path start';
            }
            continue;
          } else if ('\t' == c || '\n' == c || '\r' == c) {
            err('Invalid whitespace in file host.');
          } else {
            buffer += c;
          }
          break;

        case 'host':
        case 'hostname':
          if (':' == c && !seenBracket) {
            // XXX host parsing
            this._host = IDNAToASCII.call(this, buffer);
            buffer = '';
            state = 'port';
            if ('hostname' == stateOverride) {
              break loop;
            }
          } else if (EOF == c || '/' == c || '\\' == c || '?' == c || '#' == c) {
            this._host = IDNAToASCII.call(this, buffer);
            buffer = '';
            state = 'relative path start';
            if (stateOverride) {
              break loop;
            }
            continue;
          } else if ('\t' != c && '\n' != c && '\r' != c) {
            if ('[' == c) {
              seenBracket = true;
            } else if (']' == c) {
              seenBracket = false;
            }
            buffer += c;
          } else {
            err('Invalid code point in host/hostname: ' + c);
          }
          break;

        case 'port':
          if (/[0-9]/.test(c)) {
            buffer += c;
          } else if (EOF == c || '/' == c || '\\' == c || '?' == c || '#' == c || stateOverride) {
            if ('' != buffer) {
              var temp = parseInt(buffer, 10);
              if (temp != relative[this._scheme]) {
                this._port = temp + '';
              }
              buffer = '';
            }
            if (stateOverride) {
              break loop;
            }
            state = 'relative path start';
            continue;
          } else if ('\t' == c || '\n' == c || '\r' == c) {
            err('Invalid code point in port: ' + c);
          } else {
            invalid.call(this);
          }
          break;

        case 'relative path start':
          if ('\\' == c) err("'\\' not allowed in path.");
          state = 'relative path';
          if ('/' != c && '\\' != c) {
            continue;
          }
          break;

        case 'relative path':
          if (EOF == c || '/' == c || '\\' == c || !stateOverride && ('?' == c || '#' == c)) {
            if ('\\' == c) {
              err('\\ not allowed in relative path.');
            }
            var tmp;
            if (tmp = relativePathDotMapping[buffer.toLowerCase()]) {
              buffer = tmp;
            }
            if ('..' == buffer) {
              this._path.pop();
              if ('/' != c && '\\' != c) {
                this._path.push('');
              }
            } else if ('.' == buffer && '/' != c && '\\' != c) {
              this._path.push('');
            } else if ('.' != buffer) {
              if ('file' == this._scheme && this._path.length == 0 && buffer.length == 2 && ALPHA.test(buffer[0]) && buffer[1] == '|') {
                buffer = buffer[0] + ':';
              }
              this._path.push(buffer);
            }
            buffer = '';
            if ('?' == c) {
              this._query = '?';
              state = 'query';
            } else if ('#' == c) {
              this._fragment = '#';
              state = 'fragment';
            }
          } else if ('\t' != c && '\n' != c && '\r' != c) {
            buffer += percentEscape(c);
          }
          break;

        case 'query':
          if (!stateOverride && '#' == c) {
            this._fragment = '#';
            state = 'fragment';
          } else if (EOF != c && '\t' != c && '\n' != c && '\r' != c) {
            this._query += percentEscapeQuery(c);
          }
          break;

        case 'fragment':
          if (EOF != c && '\t' != c && '\n' != c && '\r' != c) {
            this._fragment += c;
          }
          break;
      }

      cursor++;
    }
  }

  function clear() {
    this._scheme = '';
    this._schemeData = '';
    this._username = '';
    this._password = null;
    this._host = '';
    this._port = '';
    this._path = [];
    this._query = '';
    this._fragment = '';
    this._isInvalid = false;
    this._isRelative = false;
  }

  // Does not process domain names or IP addresses.
  // Does not handle encoding for the query parameter.
  function jURL(url, base /* , encoding */) {
    if (base !== undefined && !(base instanceof jURL)) base = new jURL(String(base));

    this._url = url;
    clear.call(this);

    var input = url.replace(/^[ \t\r\n\f]+|[ \t\r\n\f]+$/g, '');
    // encoding = encoding || 'utf-8'

    parse.call(this, input, null, base);
  }

  jURL.prototype = Object.defineProperties({
    toString: function toString() {
      return this.href;
    }
  }, {
    href: {
      get: function get() {
        if (this._isInvalid) return this._url;

        var authority = '';
        if ('' != this._username || null != this._password) {
          authority = this._username + (null != this._password ? ':' + this._password : '') + '@';
        }

        return this.protocol + (this._isRelative ? '//' + authority + this.host : '') + this.pathname + this._query + this._fragment;
      },
      set: function set(href) {
        clear.call(this);
        parse.call(this, href);
      },
      configurable: true,
      enumerable: true
    },
    protocol: {
      get: function get() {
        return this._scheme + ':';
      },
      set: function set(protocol) {
        if (this._isInvalid) return;
        parse.call(this, protocol + ':', 'scheme start');
      },
      configurable: true,
      enumerable: true
    },
    host: {
      get: function get() {
        return this._isInvalid ? '' : this._port ? this._host + ':' + this._port : this._host;
      },
      set: function set(host) {
        if (this._isInvalid || !this._isRelative) return;
        parse.call(this, host, 'host');
      },
      configurable: true,
      enumerable: true
    },
    hostname: {
      get: function get() {
        return this._host;
      },
      set: function set(hostname) {
        if (this._isInvalid || !this._isRelative) return;
        parse.call(this, hostname, 'hostname');
      },
      configurable: true,
      enumerable: true
    },
    port: {
      get: function get() {
        return this._port;
      },
      set: function set(port) {
        if (this._isInvalid || !this._isRelative) return;
        parse.call(this, port, 'port');
      },
      configurable: true,
      enumerable: true
    },
    pathname: {
      get: function get() {
        return this._isInvalid ? '' : this._isRelative ? '/' + this._path.join('/') : this._schemeData;
      },
      set: function set(pathname) {
        if (this._isInvalid || !this._isRelative) return;
        this._path = [];
        parse.call(this, pathname, 'relative path start');
      },
      configurable: true,
      enumerable: true
    },
    search: {
      get: function get() {
        return this._isInvalid || !this._query || '?' == this._query ? '' : this._query;
      },
      set: function set(search) {
        if (this._isInvalid || !this._isRelative) return;
        this._query = '?';
        if ('?' == search[0]) search = search.slice(1);
        parse.call(this, search, 'query');
      },
      configurable: true,
      enumerable: true
    },
    hash: {
      get: function get() {
        return this._isInvalid || !this._fragment || '#' == this._fragment ? '' : this._fragment;
      },
      set: function set(hash) {
        if (this._isInvalid) return;
        this._fragment = '#';
        if ('#' == hash[0]) hash = hash.slice(1);
        parse.call(this, hash, 'fragment');
      },
      configurable: true,
      enumerable: true
    },
    origin: {
      get: function get() {
        var host;
        if (this._isInvalid || !this._scheme) {
          return '';
        }
        // javascript: Gecko returns String(""), WebKit/Blink String("null")
        // Gecko throws error for "data://"
        // data: Gecko returns "", Blink returns "data://", WebKit returns "null"
        // Gecko returns String("") for file: mailto:
        // WebKit/Blink returns String("SCHEME://") for file: mailto:
        switch (this._scheme) {
          case 'data':
          case 'file':
          case 'javascript':
          case 'mailto':
            return 'null';
        }
        host = this.host;
        if (!host) {
          return '';
        }
        return this._scheme + '://' + host;
      },
      configurable: true,
      enumerable: true
    }
  });

  // Copy over the static methods
  var OriginalURL = scope.URL;
  if (OriginalURL) {
    jURL.createObjectURL = function (blob) {
      // IE extension allows a second optional options argument.
      // http://msdn.microsoft.com/en-us/library/ie/hh772302(v=vs.85).aspx
      return OriginalURL.createObjectURL.apply(OriginalURL, arguments);
    };
    jURL.revokeObjectURL = function (url) {
      OriginalURL.revokeObjectURL(url);
    };
  }

  scope.URL = jURL;
})(self);

},{}]},{},[1])

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJEOi9Eb2N1bWVudHMvU2Nob29sL1VkYWNpdHkvY291cnNlcy9vZmZsaW5lLWFwcGxpY2F0aW9ucy9sZXNzb24tMi93aXR0ci9wdWJsaWMvanMvcG9seWZpbGxzL3VybC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0FDR0EsQ0FBQyxVQUFTLEtBQUssRUFBRTtBQUNmLGNBQVksQ0FBQzs7O0FBR2IsTUFBSSxhQUFhLEdBQUcsS0FBSyxDQUFDO0FBQzFCLE1BQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFO0FBQ3BCLFFBQUk7QUFDRixVQUFJLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDakMsT0FBQyxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7QUFDckIsbUJBQWEsR0FBRyxDQUFDLENBQUMsSUFBSSxLQUFLLGdCQUFnQixDQUFDO0tBQzdDLENBQUMsT0FBTSxDQUFDLEVBQUUsRUFBRTtHQUNkOztBQUVELE1BQUksYUFBYSxFQUNmLE9BQU87O0FBRVQsTUFBSSxRQUFRLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNuQyxVQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3JCLFVBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDckIsVUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUN4QixVQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3RCLFVBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDeEIsVUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNwQixVQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDOztBQUV0QixNQUFJLHNCQUFzQixHQUFHLE1BQU0sQ0FB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Q0FBQztBQUNqQixZQUFJLENBQUMsSUFBSSxFQUFFO0FBQ1QsaUJBQU8sRUFBRSxDQUFDO1NBQ1g7QUFDRCxlQUFPLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQztPQUNwQzs7OztJQUNGLENBQUM7OztBQUdGLE1BQUksV0FBVyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7QUFDNUIsTUFBSSxXQUFXLEVBQUU7QUFDZixRQUFJLENBQUMsZUFBZSxHQUFHLFVBQVMsSUFBSSxFQUFFOzs7QUFHcEMsYUFBTyxXQUFXLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUM7S0FDbEUsQ0FBQztBQUNGLFFBQUksQ0FBQyxlQUFlLEdBQUcsVUFBUyxHQUFHLEVBQUU7QUFDbkMsaUJBQVcsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDbEMsQ0FBQztHQUNIOztBQUVELE9BQUssQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDO0NBRWxCLENBQUEsQ0FBRSxJQUFJLENBQUMsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiBBbnkgY29weXJpZ2h0IGlzIGRlZGljYXRlZCB0byB0aGUgUHVibGljIERvbWFpbi5cclxuICogaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvcHVibGljZG9tYWluL3plcm8vMS4wLyAqL1xyXG5cclxuKGZ1bmN0aW9uKHNjb3BlKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAvLyBmZWF0dXJlIGRldGVjdCBmb3IgVVJMIGNvbnN0cnVjdG9yXHJcbiAgdmFyIGhhc1dvcmtpbmdVcmwgPSBmYWxzZTtcclxuICBpZiAoIXNjb3BlLmZvcmNlSlVSTCkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgdmFyIHUgPSBuZXcgVVJMKCdiJywgJ2h0dHA6Ly9hJyk7XHJcbiAgICAgIHUucGF0aG5hbWUgPSAnYyUyMGQnO1xyXG4gICAgICBoYXNXb3JraW5nVXJsID0gdS5ocmVmID09PSAnaHR0cDovL2EvYyUyMGQnO1xyXG4gICAgfSBjYXRjaChlKSB7fVxyXG4gIH1cclxuXHJcbiAgaWYgKGhhc1dvcmtpbmdVcmwpXHJcbiAgICByZXR1cm47XHJcblxyXG4gIHZhciByZWxhdGl2ZSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XHJcbiAgcmVsYXRpdmVbJ2Z0cCddID0gMjE7XHJcbiAgcmVsYXRpdmVbJ2ZpbGUnXSA9IDA7XHJcbiAgcmVsYXRpdmVbJ2dvcGhlciddID0gNzA7XHJcbiAgcmVsYXRpdmVbJ2h0dHAnXSA9IDgwO1xyXG4gIHJlbGF0aXZlWydodHRwcyddID0gNDQzO1xyXG4gIHJlbGF0aXZlWyd3cyddID0gODA7XHJcbiAgcmVsYXRpdmVbJ3dzcyddID0gNDQzO1xyXG5cclxuICB2YXIgcmVsYXRpdmVQYXRoRG90TWFwcGluZyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XHJcbiAgcmVsYXRpdmVQYXRoRG90TWFwcGluZ1snJTJlJ10gPSAnLic7XHJcbiAgcmVsYXRpdmVQYXRoRG90TWFwcGluZ1snLiUyZSddID0gJy4uJztcclxuICByZWxhdGl2ZVBhdGhEb3RNYXBwaW5nWyclMmUuJ10gPSAnLi4nO1xyXG4gIHJlbGF0aXZlUGF0aERvdE1hcHBpbmdbJyUyZSUyZSddID0gJy4uJztcclxuXHJcbiAgZnVuY3Rpb24gaXNSZWxhdGl2ZVNjaGVtZShzY2hlbWUpIHtcclxuICAgIHJldHVybiByZWxhdGl2ZVtzY2hlbWVdICE9PSB1bmRlZmluZWQ7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBpbnZhbGlkKCkge1xyXG4gICAgY2xlYXIuY2FsbCh0aGlzKTtcclxuICAgIHRoaXMuX2lzSW52YWxpZCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBJRE5BVG9BU0NJSShoKSB7XHJcbiAgICBpZiAoJycgPT0gaCkge1xyXG4gICAgICBpbnZhbGlkLmNhbGwodGhpcylcclxuICAgIH1cclxuICAgIC8vIFhYWFxyXG4gICAgcmV0dXJuIGgudG9Mb3dlckNhc2UoKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcGVyY2VudEVzY2FwZShjKSB7XHJcbiAgICB2YXIgdW5pY29kZSA9IGMuY2hhckNvZGVBdCgwKTtcclxuICAgIGlmICh1bmljb2RlID4gMHgyMCAmJlxyXG4gICAgICAgdW5pY29kZSA8IDB4N0YgJiZcclxuICAgICAgIC8vIFwiICMgPCA+ID8gYFxyXG4gICAgICAgWzB4MjIsIDB4MjMsIDB4M0MsIDB4M0UsIDB4M0YsIDB4NjBdLmluZGV4T2YodW5pY29kZSkgPT0gLTFcclxuICAgICAgKSB7XHJcbiAgICAgIHJldHVybiBjO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChjKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHBlcmNlbnRFc2NhcGVRdWVyeShjKSB7XHJcbiAgICAvLyBYWFggVGhpcyBhY3R1YWxseSBuZWVkcyB0byBlbmNvZGUgYyB1c2luZyBlbmNvZGluZyBhbmQgdGhlblxyXG4gICAgLy8gY29udmVydCB0aGUgYnl0ZXMgb25lLWJ5LW9uZS5cclxuXHJcbiAgICB2YXIgdW5pY29kZSA9IGMuY2hhckNvZGVBdCgwKTtcclxuICAgIGlmICh1bmljb2RlID4gMHgyMCAmJlxyXG4gICAgICAgdW5pY29kZSA8IDB4N0YgJiZcclxuICAgICAgIC8vIFwiICMgPCA+IGAgKGRvIG5vdCBlc2NhcGUgJz8nKVxyXG4gICAgICAgWzB4MjIsIDB4MjMsIDB4M0MsIDB4M0UsIDB4NjBdLmluZGV4T2YodW5pY29kZSkgPT0gLTFcclxuICAgICAgKSB7XHJcbiAgICAgIHJldHVybiBjO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChjKTtcclxuICB9XHJcblxyXG4gIHZhciBFT0YgPSB1bmRlZmluZWQsXHJcbiAgICAgIEFMUEhBID0gL1thLXpBLVpdLyxcclxuICAgICAgQUxQSEFOVU1FUklDID0gL1thLXpBLVowLTlcXCtcXC1cXC5dLztcclxuXHJcbiAgZnVuY3Rpb24gcGFyc2UoaW5wdXQsIHN0YXRlT3ZlcnJpZGUsIGJhc2UpIHtcclxuICAgIGZ1bmN0aW9uIGVycihtZXNzYWdlKSB7XHJcbiAgICAgIGVycm9ycy5wdXNoKG1lc3NhZ2UpXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHN0YXRlID0gc3RhdGVPdmVycmlkZSB8fCAnc2NoZW1lIHN0YXJ0JyxcclxuICAgICAgICBjdXJzb3IgPSAwLFxyXG4gICAgICAgIGJ1ZmZlciA9ICcnLFxyXG4gICAgICAgIHNlZW5BdCA9IGZhbHNlLFxyXG4gICAgICAgIHNlZW5CcmFja2V0ID0gZmFsc2UsXHJcbiAgICAgICAgZXJyb3JzID0gW107XHJcblxyXG4gICAgbG9vcDogd2hpbGUgKChpbnB1dFtjdXJzb3IgLSAxXSAhPSBFT0YgfHwgY3Vyc29yID09IDApICYmICF0aGlzLl9pc0ludmFsaWQpIHtcclxuICAgICAgdmFyIGMgPSBpbnB1dFtjdXJzb3JdO1xyXG4gICAgICBzd2l0Y2ggKHN0YXRlKSB7XHJcbiAgICAgICAgY2FzZSAnc2NoZW1lIHN0YXJ0JzpcclxuICAgICAgICAgIGlmIChjICYmIEFMUEhBLnRlc3QoYykpIHtcclxuICAgICAgICAgICAgYnVmZmVyICs9IGMudG9Mb3dlckNhc2UoKTsgLy8gQVNDSUktc2FmZVxyXG4gICAgICAgICAgICBzdGF0ZSA9ICdzY2hlbWUnO1xyXG4gICAgICAgICAgfSBlbHNlIGlmICghc3RhdGVPdmVycmlkZSkge1xyXG4gICAgICAgICAgICBidWZmZXIgPSAnJztcclxuICAgICAgICAgICAgc3RhdGUgPSAnbm8gc2NoZW1lJztcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBlcnIoJ0ludmFsaWQgc2NoZW1lLicpO1xyXG4gICAgICAgICAgICBicmVhayBsb29wO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ3NjaGVtZSc6XHJcbiAgICAgICAgICBpZiAoYyAmJiBBTFBIQU5VTUVSSUMudGVzdChjKSkge1xyXG4gICAgICAgICAgICBidWZmZXIgKz0gYy50b0xvd2VyQ2FzZSgpOyAvLyBBU0NJSS1zYWZlXHJcbiAgICAgICAgICB9IGVsc2UgaWYgKCc6JyA9PSBjKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3NjaGVtZSA9IGJ1ZmZlcjtcclxuICAgICAgICAgICAgYnVmZmVyID0gJyc7XHJcbiAgICAgICAgICAgIGlmIChzdGF0ZU92ZXJyaWRlKSB7XHJcbiAgICAgICAgICAgICAgYnJlYWsgbG9vcDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaXNSZWxhdGl2ZVNjaGVtZSh0aGlzLl9zY2hlbWUpKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5faXNSZWxhdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCdmaWxlJyA9PSB0aGlzLl9zY2hlbWUpIHtcclxuICAgICAgICAgICAgICBzdGF0ZSA9ICdyZWxhdGl2ZSc7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5faXNSZWxhdGl2ZSAmJiBiYXNlICYmIGJhc2UuX3NjaGVtZSA9PSB0aGlzLl9zY2hlbWUpIHtcclxuICAgICAgICAgICAgICBzdGF0ZSA9ICdyZWxhdGl2ZSBvciBhdXRob3JpdHknO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2lzUmVsYXRpdmUpIHtcclxuICAgICAgICAgICAgICBzdGF0ZSA9ICdhdXRob3JpdHkgZmlyc3Qgc2xhc2gnO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHN0YXRlID0gJ3NjaGVtZSBkYXRhJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIGlmICghc3RhdGVPdmVycmlkZSkge1xyXG4gICAgICAgICAgICBidWZmZXIgPSAnJztcclxuICAgICAgICAgICAgY3Vyc29yID0gMDtcclxuICAgICAgICAgICAgc3RhdGUgPSAnbm8gc2NoZW1lJztcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKEVPRiA9PSBjKSB7XHJcbiAgICAgICAgICAgIGJyZWFrIGxvb3A7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBlcnIoJ0NvZGUgcG9pbnQgbm90IGFsbG93ZWQgaW4gc2NoZW1lOiAnICsgYylcclxuICAgICAgICAgICAgYnJlYWsgbG9vcDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdzY2hlbWUgZGF0YSc6XHJcbiAgICAgICAgICBpZiAoJz8nID09IGMpIHtcclxuICAgICAgICAgICAgcXVlcnkgPSAnPyc7XHJcbiAgICAgICAgICAgIHN0YXRlID0gJ3F1ZXJ5JztcclxuICAgICAgICAgIH0gZWxzZSBpZiAoJyMnID09IGMpIHtcclxuICAgICAgICAgICAgdGhpcy5fZnJhZ21lbnQgPSAnIyc7XHJcbiAgICAgICAgICAgIHN0YXRlID0gJ2ZyYWdtZW50JztcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIFhYWCBlcnJvciBoYW5kbGluZ1xyXG4gICAgICAgICAgICBpZiAoRU9GICE9IGMgJiYgJ1xcdCcgIT0gYyAmJiAnXFxuJyAhPSBjICYmICdcXHInICE9IGMpIHtcclxuICAgICAgICAgICAgICB0aGlzLl9zY2hlbWVEYXRhICs9IHBlcmNlbnRFc2NhcGUoYyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdubyBzY2hlbWUnOlxyXG4gICAgICAgICAgaWYgKCFiYXNlIHx8ICEoaXNSZWxhdGl2ZVNjaGVtZShiYXNlLl9zY2hlbWUpKSkge1xyXG4gICAgICAgICAgICBlcnIoJ01pc3Npbmcgc2NoZW1lLicpO1xyXG4gICAgICAgICAgICBpbnZhbGlkLmNhbGwodGhpcyk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzdGF0ZSA9ICdyZWxhdGl2ZSc7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ3JlbGF0aXZlIG9yIGF1dGhvcml0eSc6XHJcbiAgICAgICAgICBpZiAoJy8nID09IGMgJiYgJy8nID09IGlucHV0W2N1cnNvcisxXSkge1xyXG4gICAgICAgICAgICBzdGF0ZSA9ICdhdXRob3JpdHkgaWdub3JlIHNsYXNoZXMnO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZXJyKCdFeHBlY3RlZCAvLCBnb3Q6ICcgKyBjKTtcclxuICAgICAgICAgICAgc3RhdGUgPSAncmVsYXRpdmUnO1xyXG4gICAgICAgICAgICBjb250aW51ZVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ3JlbGF0aXZlJzpcclxuICAgICAgICAgIHRoaXMuX2lzUmVsYXRpdmUgPSB0cnVlO1xyXG4gICAgICAgICAgaWYgKCdmaWxlJyAhPSB0aGlzLl9zY2hlbWUpXHJcbiAgICAgICAgICAgIHRoaXMuX3NjaGVtZSA9IGJhc2UuX3NjaGVtZTtcclxuICAgICAgICAgIGlmIChFT0YgPT0gYykge1xyXG4gICAgICAgICAgICB0aGlzLl9ob3N0ID0gYmFzZS5faG9zdDtcclxuICAgICAgICAgICAgdGhpcy5fcG9ydCA9IGJhc2UuX3BvcnQ7XHJcbiAgICAgICAgICAgIHRoaXMuX3BhdGggPSBiYXNlLl9wYXRoLnNsaWNlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3F1ZXJ5ID0gYmFzZS5fcXVlcnk7XHJcbiAgICAgICAgICAgIHRoaXMuX3VzZXJuYW1lID0gYmFzZS5fdXNlcm5hbWU7XHJcbiAgICAgICAgICAgIHRoaXMuX3Bhc3N3b3JkID0gYmFzZS5fcGFzc3dvcmQ7XHJcbiAgICAgICAgICAgIGJyZWFrIGxvb3A7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKCcvJyA9PSBjIHx8ICdcXFxcJyA9PSBjKSB7XHJcbiAgICAgICAgICAgIGlmICgnXFxcXCcgPT0gYylcclxuICAgICAgICAgICAgICBlcnIoJ1xcXFwgaXMgYW4gaW52YWxpZCBjb2RlIHBvaW50LicpO1xyXG4gICAgICAgICAgICBzdGF0ZSA9ICdyZWxhdGl2ZSBzbGFzaCc7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKCc/JyA9PSBjKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2hvc3QgPSBiYXNlLl9ob3N0O1xyXG4gICAgICAgICAgICB0aGlzLl9wb3J0ID0gYmFzZS5fcG9ydDtcclxuICAgICAgICAgICAgdGhpcy5fcGF0aCA9IGJhc2UuX3BhdGguc2xpY2UoKTtcclxuICAgICAgICAgICAgdGhpcy5fcXVlcnkgPSAnPyc7XHJcbiAgICAgICAgICAgIHRoaXMuX3VzZXJuYW1lID0gYmFzZS5fdXNlcm5hbWU7XHJcbiAgICAgICAgICAgIHRoaXMuX3Bhc3N3b3JkID0gYmFzZS5fcGFzc3dvcmQ7XHJcbiAgICAgICAgICAgIHN0YXRlID0gJ3F1ZXJ5JztcclxuICAgICAgICAgIH0gZWxzZSBpZiAoJyMnID09IGMpIHtcclxuICAgICAgICAgICAgdGhpcy5faG9zdCA9IGJhc2UuX2hvc3Q7XHJcbiAgICAgICAgICAgIHRoaXMuX3BvcnQgPSBiYXNlLl9wb3J0O1xyXG4gICAgICAgICAgICB0aGlzLl9wYXRoID0gYmFzZS5fcGF0aC5zbGljZSgpO1xyXG4gICAgICAgICAgICB0aGlzLl9xdWVyeSA9IGJhc2UuX3F1ZXJ5O1xyXG4gICAgICAgICAgICB0aGlzLl9mcmFnbWVudCA9ICcjJztcclxuICAgICAgICAgICAgdGhpcy5fdXNlcm5hbWUgPSBiYXNlLl91c2VybmFtZTtcclxuICAgICAgICAgICAgdGhpcy5fcGFzc3dvcmQgPSBiYXNlLl9wYXNzd29yZDtcclxuICAgICAgICAgICAgc3RhdGUgPSAnZnJhZ21lbnQnO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdmFyIG5leHRDID0gaW5wdXRbY3Vyc29yKzFdXHJcbiAgICAgICAgICAgIHZhciBuZXh0TmV4dEMgPSBpbnB1dFtjdXJzb3IrMl1cclxuICAgICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAgICdmaWxlJyAhPSB0aGlzLl9zY2hlbWUgfHwgIUFMUEhBLnRlc3QoYykgfHxcclxuICAgICAgICAgICAgICAobmV4dEMgIT0gJzonICYmIG5leHRDICE9ICd8JykgfHxcclxuICAgICAgICAgICAgICAoRU9GICE9IG5leHROZXh0QyAmJiAnLycgIT0gbmV4dE5leHRDICYmICdcXFxcJyAhPSBuZXh0TmV4dEMgJiYgJz8nICE9IG5leHROZXh0QyAmJiAnIycgIT0gbmV4dE5leHRDKSkge1xyXG4gICAgICAgICAgICAgIHRoaXMuX2hvc3QgPSBiYXNlLl9ob3N0O1xyXG4gICAgICAgICAgICAgIHRoaXMuX3BvcnQgPSBiYXNlLl9wb3J0O1xyXG4gICAgICAgICAgICAgIHRoaXMuX3VzZXJuYW1lID0gYmFzZS5fdXNlcm5hbWU7XHJcbiAgICAgICAgICAgICAgdGhpcy5fcGFzc3dvcmQgPSBiYXNlLl9wYXNzd29yZDtcclxuICAgICAgICAgICAgICB0aGlzLl9wYXRoID0gYmFzZS5fcGF0aC5zbGljZSgpO1xyXG4gICAgICAgICAgICAgIHRoaXMuX3BhdGgucG9wKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc3RhdGUgPSAncmVsYXRpdmUgcGF0aCc7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ3JlbGF0aXZlIHNsYXNoJzpcclxuICAgICAgICAgIGlmICgnLycgPT0gYyB8fCAnXFxcXCcgPT0gYykge1xyXG4gICAgICAgICAgICBpZiAoJ1xcXFwnID09IGMpIHtcclxuICAgICAgICAgICAgICBlcnIoJ1xcXFwgaXMgYW4gaW52YWxpZCBjb2RlIHBvaW50LicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgnZmlsZScgPT0gdGhpcy5fc2NoZW1lKSB7XHJcbiAgICAgICAgICAgICAgc3RhdGUgPSAnZmlsZSBob3N0JztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBzdGF0ZSA9ICdhdXRob3JpdHkgaWdub3JlIHNsYXNoZXMnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoJ2ZpbGUnICE9IHRoaXMuX3NjaGVtZSkge1xyXG4gICAgICAgICAgICAgIHRoaXMuX2hvc3QgPSBiYXNlLl9ob3N0O1xyXG4gICAgICAgICAgICAgIHRoaXMuX3BvcnQgPSBiYXNlLl9wb3J0O1xyXG4gICAgICAgICAgICAgIHRoaXMuX3VzZXJuYW1lID0gYmFzZS5fdXNlcm5hbWU7XHJcbiAgICAgICAgICAgICAgdGhpcy5fcGFzc3dvcmQgPSBiYXNlLl9wYXNzd29yZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzdGF0ZSA9ICdyZWxhdGl2ZSBwYXRoJztcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnYXV0aG9yaXR5IGZpcnN0IHNsYXNoJzpcclxuICAgICAgICAgIGlmICgnLycgPT0gYykge1xyXG4gICAgICAgICAgICBzdGF0ZSA9ICdhdXRob3JpdHkgc2Vjb25kIHNsYXNoJztcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGVycihcIkV4cGVjdGVkICcvJywgZ290OiBcIiArIGMpO1xyXG4gICAgICAgICAgICBzdGF0ZSA9ICdhdXRob3JpdHkgaWdub3JlIHNsYXNoZXMnO1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdhdXRob3JpdHkgc2Vjb25kIHNsYXNoJzpcclxuICAgICAgICAgIHN0YXRlID0gJ2F1dGhvcml0eSBpZ25vcmUgc2xhc2hlcyc7XHJcbiAgICAgICAgICBpZiAoJy8nICE9IGMpIHtcclxuICAgICAgICAgICAgZXJyKFwiRXhwZWN0ZWQgJy8nLCBnb3Q6IFwiICsgYyk7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ2F1dGhvcml0eSBpZ25vcmUgc2xhc2hlcyc6XHJcbiAgICAgICAgICBpZiAoJy8nICE9IGMgJiYgJ1xcXFwnICE9IGMpIHtcclxuICAgICAgICAgICAgc3RhdGUgPSAnYXV0aG9yaXR5JztcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBlcnIoJ0V4cGVjdGVkIGF1dGhvcml0eSwgZ290OiAnICsgYyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnYXV0aG9yaXR5JzpcclxuICAgICAgICAgIGlmICgnQCcgPT0gYykge1xyXG4gICAgICAgICAgICBpZiAoc2VlbkF0KSB7XHJcbiAgICAgICAgICAgICAgZXJyKCdAIGFscmVhZHkgc2Vlbi4nKTtcclxuICAgICAgICAgICAgICBidWZmZXIgKz0gJyU0MCc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc2VlbkF0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBidWZmZXIubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICB2YXIgY3AgPSBidWZmZXJbaV07XHJcbiAgICAgICAgICAgICAgaWYgKCdcXHQnID09IGNwIHx8ICdcXG4nID09IGNwIHx8ICdcXHInID09IGNwKSB7XHJcbiAgICAgICAgICAgICAgICBlcnIoJ0ludmFsaWQgd2hpdGVzcGFjZSBpbiBhdXRob3JpdHkuJyk7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgLy8gWFhYIGNoZWNrIFVSTCBjb2RlIHBvaW50c1xyXG4gICAgICAgICAgICAgIGlmICgnOicgPT0gY3AgJiYgbnVsbCA9PT0gdGhpcy5fcGFzc3dvcmQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3Bhc3N3b3JkID0gJyc7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgdmFyIHRlbXBDID0gcGVyY2VudEVzY2FwZShjcCk7XHJcbiAgICAgICAgICAgICAgKG51bGwgIT09IHRoaXMuX3Bhc3N3b3JkKSA/IHRoaXMuX3Bhc3N3b3JkICs9IHRlbXBDIDogdGhpcy5fdXNlcm5hbWUgKz0gdGVtcEM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnVmZmVyID0gJyc7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKEVPRiA9PSBjIHx8ICcvJyA9PSBjIHx8ICdcXFxcJyA9PSBjIHx8ICc/JyA9PSBjIHx8ICcjJyA9PSBjKSB7XHJcbiAgICAgICAgICAgIGN1cnNvciAtPSBidWZmZXIubGVuZ3RoO1xyXG4gICAgICAgICAgICBidWZmZXIgPSAnJztcclxuICAgICAgICAgICAgc3RhdGUgPSAnaG9zdCc7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYnVmZmVyICs9IGM7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnZmlsZSBob3N0JzpcclxuICAgICAgICAgIGlmIChFT0YgPT0gYyB8fCAnLycgPT0gYyB8fCAnXFxcXCcgPT0gYyB8fCAnPycgPT0gYyB8fCAnIycgPT0gYykge1xyXG4gICAgICAgICAgICBpZiAoYnVmZmVyLmxlbmd0aCA9PSAyICYmIEFMUEhBLnRlc3QoYnVmZmVyWzBdKSAmJiAoYnVmZmVyWzFdID09ICc6JyB8fCBidWZmZXJbMV0gPT0gJ3wnKSkge1xyXG4gICAgICAgICAgICAgIHN0YXRlID0gJ3JlbGF0aXZlIHBhdGgnO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGJ1ZmZlci5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgICAgICAgIHN0YXRlID0gJ3JlbGF0aXZlIHBhdGggc3RhcnQnO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHRoaXMuX2hvc3QgPSBJRE5BVG9BU0NJSS5jYWxsKHRoaXMsIGJ1ZmZlcik7XHJcbiAgICAgICAgICAgICAgYnVmZmVyID0gJyc7XHJcbiAgICAgICAgICAgICAgc3RhdGUgPSAncmVsYXRpdmUgcGF0aCBzdGFydCc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKCdcXHQnID09IGMgfHwgJ1xcbicgPT0gYyB8fCAnXFxyJyA9PSBjKSB7XHJcbiAgICAgICAgICAgIGVycignSW52YWxpZCB3aGl0ZXNwYWNlIGluIGZpbGUgaG9zdC4nKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGJ1ZmZlciArPSBjO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ2hvc3QnOlxyXG4gICAgICAgIGNhc2UgJ2hvc3RuYW1lJzpcclxuICAgICAgICAgIGlmICgnOicgPT0gYyAmJiAhc2VlbkJyYWNrZXQpIHtcclxuICAgICAgICAgICAgLy8gWFhYIGhvc3QgcGFyc2luZ1xyXG4gICAgICAgICAgICB0aGlzLl9ob3N0ID0gSUROQVRvQVNDSUkuY2FsbCh0aGlzLCBidWZmZXIpO1xyXG4gICAgICAgICAgICBidWZmZXIgPSAnJztcclxuICAgICAgICAgICAgc3RhdGUgPSAncG9ydCc7XHJcbiAgICAgICAgICAgIGlmICgnaG9zdG5hbWUnID09IHN0YXRlT3ZlcnJpZGUpIHtcclxuICAgICAgICAgICAgICBicmVhayBsb29wO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKEVPRiA9PSBjIHx8ICcvJyA9PSBjIHx8ICdcXFxcJyA9PSBjIHx8ICc/JyA9PSBjIHx8ICcjJyA9PSBjKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2hvc3QgPSBJRE5BVG9BU0NJSS5jYWxsKHRoaXMsIGJ1ZmZlcik7XHJcbiAgICAgICAgICAgIGJ1ZmZlciA9ICcnO1xyXG4gICAgICAgICAgICBzdGF0ZSA9ICdyZWxhdGl2ZSBwYXRoIHN0YXJ0JztcclxuICAgICAgICAgICAgaWYgKHN0YXRlT3ZlcnJpZGUpIHtcclxuICAgICAgICAgICAgICBicmVhayBsb29wO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgfSBlbHNlIGlmICgnXFx0JyAhPSBjICYmICdcXG4nICE9IGMgJiYgJ1xccicgIT0gYykge1xyXG4gICAgICAgICAgICBpZiAoJ1snID09IGMpIHtcclxuICAgICAgICAgICAgICBzZWVuQnJhY2tldCA9IHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoJ10nID09IGMpIHtcclxuICAgICAgICAgICAgICBzZWVuQnJhY2tldCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJ1ZmZlciArPSBjO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZXJyKCdJbnZhbGlkIGNvZGUgcG9pbnQgaW4gaG9zdC9ob3N0bmFtZTogJyArIGMpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ3BvcnQnOlxyXG4gICAgICAgICAgaWYgKC9bMC05XS8udGVzdChjKSkge1xyXG4gICAgICAgICAgICBidWZmZXIgKz0gYztcclxuICAgICAgICAgIH0gZWxzZSBpZiAoRU9GID09IGMgfHwgJy8nID09IGMgfHwgJ1xcXFwnID09IGMgfHwgJz8nID09IGMgfHwgJyMnID09IGMgfHwgc3RhdGVPdmVycmlkZSkge1xyXG4gICAgICAgICAgICBpZiAoJycgIT0gYnVmZmVyKSB7XHJcbiAgICAgICAgICAgICAgdmFyIHRlbXAgPSBwYXJzZUludChidWZmZXIsIDEwKTtcclxuICAgICAgICAgICAgICBpZiAodGVtcCAhPSByZWxhdGl2ZVt0aGlzLl9zY2hlbWVdKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wb3J0ID0gdGVtcCArICcnO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBidWZmZXIgPSAnJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoc3RhdGVPdmVycmlkZSkge1xyXG4gICAgICAgICAgICAgIGJyZWFrIGxvb3A7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc3RhdGUgPSAncmVsYXRpdmUgcGF0aCBzdGFydCc7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgfSBlbHNlIGlmICgnXFx0JyA9PSBjIHx8ICdcXG4nID09IGMgfHwgJ1xccicgPT0gYykge1xyXG4gICAgICAgICAgICBlcnIoJ0ludmFsaWQgY29kZSBwb2ludCBpbiBwb3J0OiAnICsgYyk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpbnZhbGlkLmNhbGwodGhpcyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAncmVsYXRpdmUgcGF0aCBzdGFydCc6XHJcbiAgICAgICAgICBpZiAoJ1xcXFwnID09IGMpXHJcbiAgICAgICAgICAgIGVycihcIidcXFxcJyBub3QgYWxsb3dlZCBpbiBwYXRoLlwiKTtcclxuICAgICAgICAgIHN0YXRlID0gJ3JlbGF0aXZlIHBhdGgnO1xyXG4gICAgICAgICAgaWYgKCcvJyAhPSBjICYmICdcXFxcJyAhPSBjKSB7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ3JlbGF0aXZlIHBhdGgnOlxyXG4gICAgICAgICAgaWYgKEVPRiA9PSBjIHx8ICcvJyA9PSBjIHx8ICdcXFxcJyA9PSBjIHx8ICghc3RhdGVPdmVycmlkZSAmJiAoJz8nID09IGMgfHwgJyMnID09IGMpKSkge1xyXG4gICAgICAgICAgICBpZiAoJ1xcXFwnID09IGMpIHtcclxuICAgICAgICAgICAgICBlcnIoJ1xcXFwgbm90IGFsbG93ZWQgaW4gcmVsYXRpdmUgcGF0aC4nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgdG1wO1xyXG4gICAgICAgICAgICBpZiAodG1wID0gcmVsYXRpdmVQYXRoRG90TWFwcGluZ1tidWZmZXIudG9Mb3dlckNhc2UoKV0pIHtcclxuICAgICAgICAgICAgICBidWZmZXIgPSB0bXA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCcuLicgPT0gYnVmZmVyKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5fcGF0aC5wb3AoKTtcclxuICAgICAgICAgICAgICBpZiAoJy8nICE9IGMgJiYgJ1xcXFwnICE9IGMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3BhdGgucHVzaCgnJyk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCcuJyA9PSBidWZmZXIgJiYgJy8nICE9IGMgJiYgJ1xcXFwnICE9IGMpIHtcclxuICAgICAgICAgICAgICB0aGlzLl9wYXRoLnB1c2goJycpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCcuJyAhPSBidWZmZXIpIHtcclxuICAgICAgICAgICAgICBpZiAoJ2ZpbGUnID09IHRoaXMuX3NjaGVtZSAmJiB0aGlzLl9wYXRoLmxlbmd0aCA9PSAwICYmIGJ1ZmZlci5sZW5ndGggPT0gMiAmJiBBTFBIQS50ZXN0KGJ1ZmZlclswXSkgJiYgYnVmZmVyWzFdID09ICd8Jykge1xyXG4gICAgICAgICAgICAgICAgYnVmZmVyID0gYnVmZmVyWzBdICsgJzonO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB0aGlzLl9wYXRoLnB1c2goYnVmZmVyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBidWZmZXIgPSAnJztcclxuICAgICAgICAgICAgaWYgKCc/JyA9PSBjKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5fcXVlcnkgPSAnPyc7XHJcbiAgICAgICAgICAgICAgc3RhdGUgPSAncXVlcnknO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCcjJyA9PSBjKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5fZnJhZ21lbnQgPSAnIyc7XHJcbiAgICAgICAgICAgICAgc3RhdGUgPSAnZnJhZ21lbnQnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKCdcXHQnICE9IGMgJiYgJ1xcbicgIT0gYyAmJiAnXFxyJyAhPSBjKSB7XHJcbiAgICAgICAgICAgIGJ1ZmZlciArPSBwZXJjZW50RXNjYXBlKGMpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ3F1ZXJ5JzpcclxuICAgICAgICAgIGlmICghc3RhdGVPdmVycmlkZSAmJiAnIycgPT0gYykge1xyXG4gICAgICAgICAgICB0aGlzLl9mcmFnbWVudCA9ICcjJztcclxuICAgICAgICAgICAgc3RhdGUgPSAnZnJhZ21lbnQnO1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChFT0YgIT0gYyAmJiAnXFx0JyAhPSBjICYmICdcXG4nICE9IGMgJiYgJ1xccicgIT0gYykge1xyXG4gICAgICAgICAgICB0aGlzLl9xdWVyeSArPSBwZXJjZW50RXNjYXBlUXVlcnkoYyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnZnJhZ21lbnQnOlxyXG4gICAgICAgICAgaWYgKEVPRiAhPSBjICYmICdcXHQnICE9IGMgJiYgJ1xcbicgIT0gYyAmJiAnXFxyJyAhPSBjKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZyYWdtZW50ICs9IGM7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG5cclxuICAgICAgY3Vyc29yKys7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjbGVhcigpIHtcclxuICAgIHRoaXMuX3NjaGVtZSA9ICcnO1xyXG4gICAgdGhpcy5fc2NoZW1lRGF0YSA9ICcnO1xyXG4gICAgdGhpcy5fdXNlcm5hbWUgPSAnJztcclxuICAgIHRoaXMuX3Bhc3N3b3JkID0gbnVsbDtcclxuICAgIHRoaXMuX2hvc3QgPSAnJztcclxuICAgIHRoaXMuX3BvcnQgPSAnJztcclxuICAgIHRoaXMuX3BhdGggPSBbXTtcclxuICAgIHRoaXMuX3F1ZXJ5ID0gJyc7XHJcbiAgICB0aGlzLl9mcmFnbWVudCA9ICcnO1xyXG4gICAgdGhpcy5faXNJbnZhbGlkID0gZmFsc2U7XHJcbiAgICB0aGlzLl9pc1JlbGF0aXZlID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvLyBEb2VzIG5vdCBwcm9jZXNzIGRvbWFpbiBuYW1lcyBvciBJUCBhZGRyZXNzZXMuXHJcbiAgLy8gRG9lcyBub3QgaGFuZGxlIGVuY29kaW5nIGZvciB0aGUgcXVlcnkgcGFyYW1ldGVyLlxyXG4gIGZ1bmN0aW9uIGpVUkwodXJsLCBiYXNlIC8qICwgZW5jb2RpbmcgKi8pIHtcclxuICAgIGlmIChiYXNlICE9PSB1bmRlZmluZWQgJiYgIShiYXNlIGluc3RhbmNlb2YgalVSTCkpXHJcbiAgICAgIGJhc2UgPSBuZXcgalVSTChTdHJpbmcoYmFzZSkpO1xyXG5cclxuICAgIHRoaXMuX3VybCA9IHVybDtcclxuICAgIGNsZWFyLmNhbGwodGhpcyk7XHJcblxyXG4gICAgdmFyIGlucHV0ID0gdXJsLnJlcGxhY2UoL15bIFxcdFxcclxcblxcZl0rfFsgXFx0XFxyXFxuXFxmXSskL2csICcnKTtcclxuICAgIC8vIGVuY29kaW5nID0gZW5jb2RpbmcgfHwgJ3V0Zi04J1xyXG5cclxuICAgIHBhcnNlLmNhbGwodGhpcywgaW5wdXQsIG51bGwsIGJhc2UpO1xyXG4gIH1cclxuXHJcbiAgalVSTC5wcm90b3R5cGUgPSB7XHJcbiAgICB0b1N0cmluZzogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmhyZWY7XHJcbiAgICB9LFxyXG4gICAgZ2V0IGhyZWYoKSB7XHJcbiAgICAgIGlmICh0aGlzLl9pc0ludmFsaWQpXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3VybDtcclxuXHJcbiAgICAgIHZhciBhdXRob3JpdHkgPSAnJztcclxuICAgICAgaWYgKCcnICE9IHRoaXMuX3VzZXJuYW1lIHx8IG51bGwgIT0gdGhpcy5fcGFzc3dvcmQpIHtcclxuICAgICAgICBhdXRob3JpdHkgPSB0aGlzLl91c2VybmFtZSArXHJcbiAgICAgICAgICAgIChudWxsICE9IHRoaXMuX3Bhc3N3b3JkID8gJzonICsgdGhpcy5fcGFzc3dvcmQgOiAnJykgKyAnQCc7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB0aGlzLnByb3RvY29sICtcclxuICAgICAgICAgICh0aGlzLl9pc1JlbGF0aXZlID8gJy8vJyArIGF1dGhvcml0eSArIHRoaXMuaG9zdCA6ICcnKSArXHJcbiAgICAgICAgICB0aGlzLnBhdGhuYW1lICsgdGhpcy5fcXVlcnkgKyB0aGlzLl9mcmFnbWVudDtcclxuICAgIH0sXHJcbiAgICBzZXQgaHJlZihocmVmKSB7XHJcbiAgICAgIGNsZWFyLmNhbGwodGhpcyk7XHJcbiAgICAgIHBhcnNlLmNhbGwodGhpcywgaHJlZik7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldCBwcm90b2NvbCgpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX3NjaGVtZSArICc6JztcclxuICAgIH0sXHJcbiAgICBzZXQgcHJvdG9jb2wocHJvdG9jb2wpIHtcclxuICAgICAgaWYgKHRoaXMuX2lzSW52YWxpZClcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIHBhcnNlLmNhbGwodGhpcywgcHJvdG9jb2wgKyAnOicsICdzY2hlbWUgc3RhcnQnKTtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0IGhvc3QoKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLl9pc0ludmFsaWQgPyAnJyA6IHRoaXMuX3BvcnQgP1xyXG4gICAgICAgICAgdGhpcy5faG9zdCArICc6JyArIHRoaXMuX3BvcnQgOiB0aGlzLl9ob3N0O1xyXG4gICAgfSxcclxuICAgIHNldCBob3N0KGhvc3QpIHtcclxuICAgICAgaWYgKHRoaXMuX2lzSW52YWxpZCB8fCAhdGhpcy5faXNSZWxhdGl2ZSlcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIHBhcnNlLmNhbGwodGhpcywgaG9zdCwgJ2hvc3QnKTtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0IGhvc3RuYW1lKCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5faG9zdDtcclxuICAgIH0sXHJcbiAgICBzZXQgaG9zdG5hbWUoaG9zdG5hbWUpIHtcclxuICAgICAgaWYgKHRoaXMuX2lzSW52YWxpZCB8fCAhdGhpcy5faXNSZWxhdGl2ZSlcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIHBhcnNlLmNhbGwodGhpcywgaG9zdG5hbWUsICdob3N0bmFtZScpO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXQgcG9ydCgpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX3BvcnQ7XHJcbiAgICB9LFxyXG4gICAgc2V0IHBvcnQocG9ydCkge1xyXG4gICAgICBpZiAodGhpcy5faXNJbnZhbGlkIHx8ICF0aGlzLl9pc1JlbGF0aXZlKVxyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgcGFyc2UuY2FsbCh0aGlzLCBwb3J0LCAncG9ydCcpO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXQgcGF0aG5hbWUoKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLl9pc0ludmFsaWQgPyAnJyA6IHRoaXMuX2lzUmVsYXRpdmUgP1xyXG4gICAgICAgICAgJy8nICsgdGhpcy5fcGF0aC5qb2luKCcvJykgOiB0aGlzLl9zY2hlbWVEYXRhO1xyXG4gICAgfSxcclxuICAgIHNldCBwYXRobmFtZShwYXRobmFtZSkge1xyXG4gICAgICBpZiAodGhpcy5faXNJbnZhbGlkIHx8ICF0aGlzLl9pc1JlbGF0aXZlKVxyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgdGhpcy5fcGF0aCA9IFtdO1xyXG4gICAgICBwYXJzZS5jYWxsKHRoaXMsIHBhdGhuYW1lLCAncmVsYXRpdmUgcGF0aCBzdGFydCcpO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXQgc2VhcmNoKCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5faXNJbnZhbGlkIHx8ICF0aGlzLl9xdWVyeSB8fCAnPycgPT0gdGhpcy5fcXVlcnkgP1xyXG4gICAgICAgICAgJycgOiB0aGlzLl9xdWVyeTtcclxuICAgIH0sXHJcbiAgICBzZXQgc2VhcmNoKHNlYXJjaCkge1xyXG4gICAgICBpZiAodGhpcy5faXNJbnZhbGlkIHx8ICF0aGlzLl9pc1JlbGF0aXZlKVxyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgdGhpcy5fcXVlcnkgPSAnPyc7XHJcbiAgICAgIGlmICgnPycgPT0gc2VhcmNoWzBdKVxyXG4gICAgICAgIHNlYXJjaCA9IHNlYXJjaC5zbGljZSgxKTtcclxuICAgICAgcGFyc2UuY2FsbCh0aGlzLCBzZWFyY2gsICdxdWVyeScpO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXQgaGFzaCgpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX2lzSW52YWxpZCB8fCAhdGhpcy5fZnJhZ21lbnQgfHwgJyMnID09IHRoaXMuX2ZyYWdtZW50ID9cclxuICAgICAgICAgICcnIDogdGhpcy5fZnJhZ21lbnQ7XHJcbiAgICB9LFxyXG4gICAgc2V0IGhhc2goaGFzaCkge1xyXG4gICAgICBpZiAodGhpcy5faXNJbnZhbGlkKVxyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgdGhpcy5fZnJhZ21lbnQgPSAnIyc7XHJcbiAgICAgIGlmICgnIycgPT0gaGFzaFswXSlcclxuICAgICAgICBoYXNoID0gaGFzaC5zbGljZSgxKTtcclxuICAgICAgcGFyc2UuY2FsbCh0aGlzLCBoYXNoLCAnZnJhZ21lbnQnKTtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0IG9yaWdpbigpIHtcclxuICAgICAgdmFyIGhvc3Q7XHJcbiAgICAgIGlmICh0aGlzLl9pc0ludmFsaWQgfHwgIXRoaXMuX3NjaGVtZSkge1xyXG4gICAgICAgIHJldHVybiAnJztcclxuICAgICAgfVxyXG4gICAgICAvLyBqYXZhc2NyaXB0OiBHZWNrbyByZXR1cm5zIFN0cmluZyhcIlwiKSwgV2ViS2l0L0JsaW5rIFN0cmluZyhcIm51bGxcIilcclxuICAgICAgLy8gR2Vja28gdGhyb3dzIGVycm9yIGZvciBcImRhdGE6Ly9cIlxyXG4gICAgICAvLyBkYXRhOiBHZWNrbyByZXR1cm5zIFwiXCIsIEJsaW5rIHJldHVybnMgXCJkYXRhOi8vXCIsIFdlYktpdCByZXR1cm5zIFwibnVsbFwiXHJcbiAgICAgIC8vIEdlY2tvIHJldHVybnMgU3RyaW5nKFwiXCIpIGZvciBmaWxlOiBtYWlsdG86XHJcbiAgICAgIC8vIFdlYktpdC9CbGluayByZXR1cm5zIFN0cmluZyhcIlNDSEVNRTovL1wiKSBmb3IgZmlsZTogbWFpbHRvOlxyXG4gICAgICBzd2l0Y2ggKHRoaXMuX3NjaGVtZSkge1xyXG4gICAgICAgIGNhc2UgJ2RhdGEnOlxyXG4gICAgICAgIGNhc2UgJ2ZpbGUnOlxyXG4gICAgICAgIGNhc2UgJ2phdmFzY3JpcHQnOlxyXG4gICAgICAgIGNhc2UgJ21haWx0byc6XHJcbiAgICAgICAgICByZXR1cm4gJ251bGwnO1xyXG4gICAgICB9XHJcbiAgICAgIGhvc3QgPSB0aGlzLmhvc3Q7XHJcbiAgICAgIGlmICghaG9zdCkge1xyXG4gICAgICAgIHJldHVybiAnJztcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdGhpcy5fc2NoZW1lICsgJzovLycgKyBob3N0O1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIC8vIENvcHkgb3ZlciB0aGUgc3RhdGljIG1ldGhvZHNcclxuICB2YXIgT3JpZ2luYWxVUkwgPSBzY29wZS5VUkw7XHJcbiAgaWYgKE9yaWdpbmFsVVJMKSB7XHJcbiAgICBqVVJMLmNyZWF0ZU9iamVjdFVSTCA9IGZ1bmN0aW9uKGJsb2IpIHtcclxuICAgICAgLy8gSUUgZXh0ZW5zaW9uIGFsbG93cyBhIHNlY29uZCBvcHRpb25hbCBvcHRpb25zIGFyZ3VtZW50LlxyXG4gICAgICAvLyBodHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvaWUvaGg3NzIzMDIodj12cy44NSkuYXNweFxyXG4gICAgICByZXR1cm4gT3JpZ2luYWxVUkwuY3JlYXRlT2JqZWN0VVJMLmFwcGx5KE9yaWdpbmFsVVJMLCBhcmd1bWVudHMpO1xyXG4gICAgfTtcclxuICAgIGpVUkwucmV2b2tlT2JqZWN0VVJMID0gZnVuY3Rpb24odXJsKSB7XHJcbiAgICAgIE9yaWdpbmFsVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHNjb3BlLlVSTCA9IGpVUkw7XHJcblxyXG59KShzZWxmKTsiXX0=