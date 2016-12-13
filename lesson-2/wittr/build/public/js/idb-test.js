(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

(function() {
  function toArray(arr) {
    return Array.prototype.slice.call(arr);
  }

  function promisifyRequest(request) {
    return new Promise(function(resolve, reject) {
      request.onsuccess = function() {
        resolve(request.result);
      };

      request.onerror = function() {
        reject(request.error);
      };
    });
  }

  function promisifyRequestCall(obj, method, args) {
    var request;
    var p = new Promise(function(resolve, reject) {
      request = obj[method].apply(obj, args);
      promisifyRequest(request).then(resolve, reject);
    });

    p.request = request;
    return p;
  }
  
  function promisifyCursorRequestCall(obj, method, args) {
    var p = promisifyRequestCall(obj, method, args);
    return p.then(function(value) {
      if (!value) return;
      return new Cursor(value, p.request);
    });
  }

  function proxyProperties(ProxyClass, targetProp, properties) {
    properties.forEach(function(prop) {
      Object.defineProperty(ProxyClass.prototype, prop, {
        get: function() {
          return this[targetProp][prop];
        }
      });
    });
  }

  function proxyRequestMethods(ProxyClass, targetProp, Constructor, properties) {
    properties.forEach(function(prop) {
      if (!(prop in Constructor.prototype)) return;
      ProxyClass.prototype[prop] = function() {
        return promisifyRequestCall(this[targetProp], prop, arguments);
      };
    });
  }

  function proxyMethods(ProxyClass, targetProp, Constructor, properties) {
    properties.forEach(function(prop) {
      if (!(prop in Constructor.prototype)) return;
      ProxyClass.prototype[prop] = function() {
        return this[targetProp][prop].apply(this[targetProp], arguments);
      };
    });
  }

  function proxyCursorRequestMethods(ProxyClass, targetProp, Constructor, properties) {
    properties.forEach(function(prop) {
      if (!(prop in Constructor.prototype)) return;
      ProxyClass.prototype[prop] = function() {
        return promisifyCursorRequestCall(this[targetProp], prop, arguments);
      };
    });
  }

  function Index(index) {
    this._index = index;
  }

  proxyProperties(Index, '_index', [
    'name',
    'keyPath',
    'multiEntry',
    'unique'
  ]);

  proxyRequestMethods(Index, '_index', IDBIndex, [
    'get',
    'getKey',
    'getAll',
    'getAllKeys',
    'count'
  ]);

  proxyCursorRequestMethods(Index, '_index', IDBIndex, [
    'openCursor',
    'openKeyCursor'
  ]);

  function Cursor(cursor, request) {
    this._cursor = cursor;
    this._request = request;
  }

  proxyProperties(Cursor, '_cursor', [
    'direction',
    'key',
    'primaryKey',
    'value'
  ]);

  proxyRequestMethods(Cursor, '_cursor', IDBCursor, [
    'update',
    'delete'
  ]);

  // proxy 'next' methods
  ['advance', 'continue', 'continuePrimaryKey'].forEach(function(methodName) {
    if (!(methodName in IDBCursor.prototype)) return;
    Cursor.prototype[methodName] = function() {
      var cursor = this;
      var args = arguments;
      return Promise.resolve().then(function() {
        cursor._cursor[methodName].apply(cursor._cursor, args);
        return promisifyRequest(cursor._request).then(function(value) {
          if (!value) return;
          return new Cursor(value, cursor._request);
        });
      });
    };
  });

  function ObjectStore(store) {
    this._store = store;
  }

  ObjectStore.prototype.createIndex = function() {
    return new Index(this._store.createIndex.apply(this._store, arguments));
  };

  ObjectStore.prototype.index = function() {
    return new Index(this._store.index.apply(this._store, arguments));
  };

  proxyProperties(ObjectStore, '_store', [
    'name',
    'keyPath',
    'indexNames',
    'autoIncrement'
  ]);

  proxyRequestMethods(ObjectStore, '_store', IDBObjectStore, [
    'put',
    'add',
    'delete',
    'clear',
    'get',
    'getAll',
    'getAllKeys',
    'count'
  ]);

  proxyCursorRequestMethods(ObjectStore, '_store', IDBObjectStore, [
    'openCursor',
    'openKeyCursor'
  ]);

  proxyMethods(ObjectStore, '_store', IDBObjectStore, [
    'deleteIndex'
  ]);

  function Transaction(idbTransaction) {
    this._tx = idbTransaction;
    this.complete = new Promise(function(resolve, reject) {
      idbTransaction.oncomplete = function() {
        resolve();
      };
      idbTransaction.onerror = function() {
        reject(idbTransaction.error);
      };
    });
  }

  Transaction.prototype.objectStore = function() {
    return new ObjectStore(this._tx.objectStore.apply(this._tx, arguments));
  };

  proxyProperties(Transaction, '_tx', [
    'objectStoreNames',
    'mode'
  ]);

  proxyMethods(Transaction, '_tx', IDBTransaction, [
    'abort'
  ]);

  function UpgradeDB(db, oldVersion, transaction) {
    this._db = db;
    this.oldVersion = oldVersion;
    this.transaction = new Transaction(transaction);
  }

  UpgradeDB.prototype.createObjectStore = function() {
    return new ObjectStore(this._db.createObjectStore.apply(this._db, arguments));
  };

  proxyProperties(UpgradeDB, '_db', [
    'name',
    'version',
    'objectStoreNames'
  ]);

  proxyMethods(UpgradeDB, '_db', IDBDatabase, [
    'deleteObjectStore',
    'close'
  ]);

  function DB(db) {
    this._db = db;
  }

  DB.prototype.transaction = function() {
    return new Transaction(this._db.transaction.apply(this._db, arguments));
  };

  proxyProperties(DB, '_db', [
    'name',
    'version',
    'objectStoreNames'
  ]);

  proxyMethods(DB, '_db', IDBDatabase, [
    'close'
  ]);

  // Add cursor iterators
  // TODO: remove this once browsers do the right thing with promises
  ['openCursor', 'openKeyCursor'].forEach(function(funcName) {
    [ObjectStore, Index].forEach(function(Constructor) {
      Constructor.prototype[funcName.replace('open', 'iterate')] = function() {
        var args = toArray(arguments);
        var callback = args[args.length - 1];
        var nativeObject = this._store || this._index;
        var request = nativeObject[funcName].apply(nativeObject, args.slice(0, -1));
        request.onsuccess = function() {
          callback(request.result);
        };
      };
    });
  });

  // polyfill getAll
  [Index, ObjectStore].forEach(function(Constructor) {
    if (Constructor.prototype.getAll) return;
    Constructor.prototype.getAll = function(query, count) {
      var instance = this;
      var items = [];

      return new Promise(function(resolve) {
        instance.iterateCursor(query, function(cursor) {
          if (!cursor) {
            resolve(items);
            return;
          }
          items.push(cursor.value);

          if (count !== undefined && items.length == count) {
            resolve(items);
            return;
          }
          cursor.continue();
        });
      });
    };
  });

  var exp = {
    open: function(name, version, upgradeCallback) {
      var p = promisifyRequestCall(indexedDB, 'open', [name, version]);
      var request = p.request;

      request.onupgradeneeded = function(event) {
        if (upgradeCallback) {
          upgradeCallback(new UpgradeDB(request.result, event.oldVersion, request.transaction));
        }
      };

      return p.then(function(db) {
        return new DB(db);
      });
    },
    delete: function(name) {
      return promisifyRequestCall(indexedDB, 'deleteDatabase', [name]);
    }
  };

  if (typeof module !== 'undefined') {
    module.exports = exp;
  }
  else {
    self.idb = exp;
  }
}());

},{}],2:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _idb = require('idb');

var _idb2 = _interopRequireDefault(_idb);

// more on usage of this API here : https://github.com/jakearchibald/idb
// goes as follows idb.open(name, version, upgradeCallback)
// Example:
// This returns a promise, let's store that for later with a var

var dbPromise = _idb2['default'].open('test-db', 4,
// this defines the database
function (upgradeDb) {

  // this creates a switch to update the browser with the new version of the indexDB, to the new one
  switch (upgradeDb.oldVersion) {

    // case 0 is called if the browser does not have the first version installed, then it installs it if it does not
    case 0:
      // this store has a key that's separate to the data, which is what we want to store in keyvalStore
      var keyValStore = upgradeDb.createObjectStore('keyval');

      //objectStore documentation here: https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore
      // accepts the values of objectStore(name, optionalKey)
      keyValStore.put(
      // this is the object name:
      'world',
      // and this is the optional key
      'hello');

    // after case 1 is called, this stores  the new objectStore after the first case hase been creater, or if already created
    // it installs case 1 after confirming case 0 is created
    case 1:

      // object stores can only be called within the upgradeDb function nowhere else.
      // below is the code  to create a new object store for the 'people' object
      // This sets the object's 'name' as the key, which is stored by name rather than by key
      // when adding new object stores, the version needs to be changed
      upgradeDb.createObjectStore('people', { keyPath: 'name' });

    // upgrading to a new version, to filter out DB results, by favorite animal.
    // Must create a new case, created below
    case 2:
      var peopleStore = upgradeDb.transaction.objectStore('people');

      // this creates an index, which sorts the 'vaforiteanimal' property
      peopleStore.createIndex('animal', 'favoriteAnimal');

    // the code to list all the people will be modified to sort results by favoriteAnimal below

    // upgrading to version 4, for the quiz in lesson 3
    case 3:
      var peopleStore = upgradeDb.transaction.objectStore('people');

      peopleStore.createIndex('age', 'age');
  }
});

// this calls our database, and reads from it, after the promise has been fulfilled (dbPromise)
dbPromise.then(function (db) {

  // this is the function to read from the database which accepts the objectStore which was created above, in this case keyval
  // this function selects the 'keyval' object store, ready to use, with an optional 'do something' argument
  var transaction = db.transaction('keyval');

  // this calls the object store (DB) we want to display
  var keyValDB = transaction.objectStore('keyval');

  // this returns a key within the keyval object, in thie case the 'hello' created above
  // this returns a promise
  return keyValDB.get('hello');

  // within the promise, we grab the value of hello, which in this case is world.
  // the value of this key store is the function argument
}).then(function (val) {
  console.log('The value of "hello" is:', val);
});

// the following is used to add values to exsisting object stores
dbPromise.then(function (db) {
  // once again grabs our DB, but this time, 'readwrite' is added to the optional valueto write something
  var transaction = db.transaction('keyval', 'readwrite');

  // this once again calls our db after its been registered
  var keyValWrite = transaction.objectStore('keyval');

  // this stores new values into ur DB, with the value being the first argument and the key being the second argument
  keyValWrite.put('bar', 'foo');

  // this returns a promise, that only returns if and when the transaction completes, and rejects if it fails
  return transaction.complete;
}).then(function () {
  console.log('Added foo:bar to keyval');
});

// the following is used to add values to exsisting object stores
dbPromise.then(function (db) {
  // once again grabs our DB, but this time, 'readwrite' is added to the optional valueto write something
  var transaction = db.transaction('keyval', 'readwrite');

  // this once again calls our db after its been registered
  var keyValWrite = transaction.objectStore('keyval');

  // this stores new values into ur DB, with the value being the first argument and the key being the second argument
  keyValWrite.put('dog', 'favoriteAnimal');

  // this returns a promise, that only returns if and when the transaction completes, and rejects if it fails
  return transaction.complete;
}).then(function () {
  console.log('Added favoriteAnimal key : dog');
});

// the following creates the values to the people Object store:
dbPromise.then(function (db) {
  // once again grabs our DB, but this time, 'readwrite' is added to the optional valueto write something
  var transaction = db.transaction('people', 'readwrite');

  // this once again calls our db after its been registered
  var peopleStore = transaction.objectStore('people');

  // this stores new values into ur DB, creating an object with whatever values I set within the transaction.put arguments.
  // There is no key necessary here, since we have told this specific store to add the name property as the key for this DB
  // Example here:
  peopleStore.put({
    name: 'Sam Munoz',
    age: 25,
    favoriteAnimal: 'dog'
  });

  // here are more to people to add to this DB objectStore:
  peopleStore.put({
    name: 'Hermione Granger',
    age: 18,
    favoriteAnimal: 'cat'
  });

  peopleStore.put({
    name: 'Harry Potter',
    age: 19,
    favoriteAnimal: 'owl'
  });

  peopleStore.put({
    name: 'Ronald Wesley',
    age: 19,
    favoriteAnimal: 'rat'
  });

  // this returns a promise, that only returns if and when the transaction completes, and rejects if it fails
  return transaction.complete;
}).then(function () {
  console.log('People added');
});

// the following reads the values of the people objectStore
// this calls our database, and reads from it, after the promise has been fulfilled (dbPromise)
dbPromise.then(function (db) {

  // this is the function to read from the database which accepts the objectStore which was created above, in this case keyval
  // this function selects the 'keyval' object store, ready to use, with an optional 'do something' argument
  var transaction = db.transaction('people');

  // this calls the object store (DB) we want to display
  var peopleRead = transaction.objectStore('people');

  // this calls the index we created for case 2 of this DB
  var animalIndex = peopleRead.index('animal');

  // this returns all keys and values within the people objectSTore
  // return peopleRead.getAll();

  // this returns the key values sorting them by the index we created for animals
  // return animalIndex.getAll();

  // this returns the key values of this objectStore that contain the getAll argument value.
  // Example:
  return animalIndex.getAll('cat');

  // once fulfilled, this logs the values of the people store
  // this grabs ALL the values of the DB and logs them in alphabetical order
  // VERY IMPORTANT this is exactly how the values will be grabbed from the transportation API and placed within the view of the application
  //
}).then(function (val) {
  console.log('People:', val);
});

// index promise to grab the values of the 'age' index of the 'people' objectStore
dbPromise.then(function (db) {
  var transaction = db.transaction('people');

  // this calls the object store (DB) we want to display
  var peopleRead = transaction.objectStore('people');

  // this calls the index we created for case 2 of this DB
  var ageIndex = peopleRead.index('age');

  return ageIndex.getAll();
}).then(function (val) {
  console.log('Age', val);
});

// the following can be used to create Cursors for index calues
dbPromise.then(function (db) {
  var transaction = db.transaction('people');

  var peopleRead = transaction.objectStore('people');

  var ageIndex = peopleRead.index('age');

  // this returns the cursos
  return ageIndex.openCursor();
}).then(function logPerson(cursor) {
  // if the cursor value is null, then return
  if (!cursor) return;
  //
  // cursor grabs values by object properties, the following grabs value and name
  console.log('Cursored at:', cursor.value.name);

  // returns the promise for the next cursor or leaves it undefined if there isnt a cursor
  return cursor['continue']()
  // if cursor is valid, then it returns the next cursor value, or person in this case
  // creates a loop that runs through all the values
  .then(logPerson);

  // other optional values for cursor are:
  // cursor.update(newValue) - updates the current cursor with a value of our choice
  // cursor.delete() - deletes the current cursor
})

// this can be used to skip cursor values, for example:
.then(function (cursor) {
  if (!cursor) return;

  // this skips the number of items specified in the function argument
  return cursor.advance(2);
}).then(function () {
  // this is only ran when the cursor has ran through all the DB values, and we are not at the end of the list
  console.log('Done cursoring');
});

},{"idb":1}]},{},[2])

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaWRiL2xpYi9pZGIuanMiLCJEOi9Eb2N1bWVudHMvU2Nob29sL3VkYWNpdHkvY291cnNlcy9vZmZsaW5lLWFwcGxpY2F0aW9ucy9sZXNzb24tMi93aXR0ci9wdWJsaWMvanMvaWRiLXRlc3QvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O21CQy9TZ0IsS0FBSzs7Ozs7Ozs7O0FBT3JCLElBQUksU0FBUyxHQUFHLGlCQUFJLElB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LE1BQUksQ0FBQyxNQUFNLEVBQUUsT0FBTzs7O0FBR3BCLFNBQU8sTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUMxQixDQUFDLENBQ0QsSUFBSSxDQUFDLFlBQVU7O0FBRWQsU0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0NBQy9CLENBQUMsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbihmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gdG9BcnJheShhcnIpIHtcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJyKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHByb21pc2lmeVJlcXVlc3QocmVxdWVzdCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHJlcXVlc3Qub25zdWNjZXNzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlc29sdmUocmVxdWVzdC5yZXN1bHQpO1xuICAgICAgfTtcblxuICAgICAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChyZXF1ZXN0LmVycm9yKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBwcm9taXNpZnlSZXF1ZXN0Q2FsbChvYmosIG1ldGhvZCwgYXJncykge1xuICAgIHZhciByZXF1ZXN0O1xuICAgIHZhciBwID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICByZXF1ZXN0ID0gb2JqW21ldGhvZF0uYXBwbHkob2JqLCBhcmdzKTtcbiAgICAgIHByb21pc2lmeVJlcXVlc3QocmVxdWVzdCkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgIH0pO1xuXG4gICAgcC5yZXF1ZXN0ID0gcmVxdWVzdDtcbiAgICByZXR1cm4gcDtcbiAgfVxuICBcbiAgZnVuY3Rpb24gcHJvbWlzaWZ5Q3Vyc29yUmVxdWVzdENhbGwob2JqLCBtZXRob2QsIGFyZ3MpIHtcbiAgICB2YXIgcCA9IHByb21pc2lmeVJlcXVlc3RDYWxsKG9iaiwgbWV0aG9kLCBhcmdzKTtcbiAgICByZXR1cm4gcC50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBpZiAoIXZhbHVlKSByZXR1cm47XG4gICAgICByZXR1cm4gbmV3IEN1cnNvcih2YWx1ZSwgcC5yZXF1ZXN0KTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHByb3h5UHJvcGVydGllcyhQcm94eUNsYXNzLCB0YXJnZXRQcm9wLCBwcm9wZXJ0aWVzKSB7XG4gICAgcHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uKHByb3ApIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShQcm94eUNsYXNzLnByb3RvdHlwZSwgcHJvcCwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiB0aGlzW3RhcmdldFByb3BdW3Byb3BdO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHByb3h5UmVxdWVzdE1ldGhvZHMoUHJveHlDbGFzcywgdGFyZ2V0UHJvcCwgQ29uc3RydWN0b3IsIHByb3BlcnRpZXMpIHtcbiAgICBwcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24ocHJvcCkge1xuICAgICAgaWYgKCEocHJvcCBpbiBDb25zdHJ1Y3Rvci5wcm90b3R5cGUpKSByZXR1cm47XG4gICAgICBQcm94eUNsYXNzLnByb3RvdHlwZVtwcm9wXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5UmVxdWVzdENhbGwodGhpc1t0YXJnZXRQcm9wXSwgcHJvcCwgYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBwcm94eU1ldGhvZHMoUHJveHlDbGFzcywgdGFyZ2V0UHJvcCwgQ29uc3RydWN0b3IsIHByb3BlcnRpZXMpIHtcbiAgICBwcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24ocHJvcCkge1xuICAgICAgaWYgKCEocHJvcCBpbiBDb25zdHJ1Y3Rvci5wcm90b3R5cGUpKSByZXR1cm47XG4gICAgICBQcm94eUNsYXNzLnByb3RvdHlwZVtwcm9wXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpc1t0YXJnZXRQcm9wXVtwcm9wXS5hcHBseSh0aGlzW3RhcmdldFByb3BdLCBhcmd1bWVudHMpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHByb3h5Q3Vyc29yUmVxdWVzdE1ldGhvZHMoUHJveHlDbGFzcywgdGFyZ2V0UHJvcCwgQ29uc3RydWN0b3IsIHByb3BlcnRpZXMpIHtcbiAgICBwcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24ocHJvcCkge1xuICAgICAgaWYgKCEocHJvcCBpbiBDb25zdHJ1Y3Rvci5wcm90b3R5cGUpKSByZXR1cm47XG4gICAgICBQcm94eUNsYXNzLnByb3RvdHlwZVtwcm9wXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5Q3Vyc29yUmVxdWVzdENhbGwodGhpc1t0YXJnZXRQcm9wXSwgcHJvcCwgYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBJbmRleChpbmRleCkge1xuICAgIHRoaXMuX2luZGV4ID0gaW5kZXg7XG4gIH1cblxuICBwcm94eVByb3BlcnRpZXMoSW5kZXgsICdfaW5kZXgnLCBbXG4gICAgJ25hbWUnLFxuICAgICdrZXlQYXRoJyxcbiAgICAnbXVsdGlFbnRyeScsXG4gICAgJ3VuaXF1ZSdcbiAgXSk7XG5cbiAgcHJveHlSZXF1ZXN0TWV0aG9kcyhJbmRleCwgJ19pbmRleCcsIElEQkluZGV4LCBbXG4gICAgJ2dldCcsXG4gICAgJ2dldEtleScsXG4gICAgJ2dldEFsbCcsXG4gICAgJ2dldEFsbEtleXMnLFxuICAgICdjb3VudCdcbiAgXSk7XG5cbiAgcHJveHlDdXJzb3JSZXF1ZXN0TWV0aG9kcyhJbmRleCwgJ19pbmRleCcsIElEQkluZGV4LCBbXG4gICAgJ29wZW5DdXJzb3InLFxuICAgICdvcGVuS2V5Q3Vyc29yJ1xuICBdKTtcblxuICBmdW5jdGlvbiBDdXJzb3IoY3Vyc29yLCByZXF1ZXN0KSB7XG4gICAgdGhpcy5fY3Vyc29yID0gY3Vyc29yO1xuICAgIHRoaXMuX3JlcXVlc3QgPSByZXF1ZXN0O1xuICB9XG5cbiAgcHJveHlQcm9wZXJ0aWVzKEN1cnNvciwgJ19jdXJzb3InLCBbXG4gICAgJ2RpcmVjdGlvbicsXG4gICAgJ2tleScsXG4gICAgJ3ByaW1hcnlLZXknLFxuICAgICd2YWx1ZSdcbiAgXSk7XG5cbiAgcHJveHlSZXF1ZXN0TWV0aG9kcyhDdXJzb3IsICdfY3Vyc29yJywgSURCQ3Vyc29yLCBbXG4gICAgJ3VwZGF0ZScsXG4gICAgJ2RlbGV0ZSdcbiAgXSk7XG5cbiAgLy8gcHJveHkgJ25leHQnIG1ldGhvZHNcbiAgWydhZHZhbmNlJywgJ2NvbnRpbnVlJywgJ2NvbnRpbnVlUHJpbWFyeUtleSddLmZvckVhY2goZnVuY3Rpb24obWV0aG9kTmFtZSkge1xuICAgIGlmICghKG1ldGhvZE5hbWUgaW4gSURCQ3Vyc29yLnByb3RvdHlwZSkpIHJldHVybjtcbiAgICBDdXJzb3IucHJvdG90eXBlW21ldGhvZE5hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY3Vyc29yID0gdGhpcztcbiAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIGN1cnNvci5fY3Vyc29yW21ldGhvZE5hbWVdLmFwcGx5KGN1cnNvci5fY3Vyc29yLCBhcmdzKTtcbiAgICAgICAgcmV0dXJuIHByb21pc2lmeVJlcXVlc3QoY3Vyc29yLl9yZXF1ZXN0KS50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgaWYgKCF2YWx1ZSkgcmV0dXJuO1xuICAgICAgICAgIHJldHVybiBuZXcgQ3Vyc29yKHZhbHVlLCBjdXJzb3IuX3JlcXVlc3QpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIE9iamVjdFN0b3JlKHN0b3JlKSB7XG4gICAgdGhpcy5fc3RvcmUgPSBzdG9yZTtcbiAgfVxuXG4gIE9iamVjdFN0b3JlLnByb3RvdHlwZS5jcmVhdGVJbmRleCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgSW5kZXgodGhpcy5fc3RvcmUuY3JlYXRlSW5kZXguYXBwbHkodGhpcy5fc3RvcmUsIGFyZ3VtZW50cykpO1xuICB9O1xuXG4gIE9iamVjdFN0b3JlLnByb3RvdHlwZS5pbmRleCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgSW5kZXgodGhpcy5fc3RvcmUuaW5kZXguYXBwbHkodGhpcy5fc3RvcmUsIGFyZ3VtZW50cykpO1xuICB9O1xuXG4gIHByb3h5UHJvcGVydGllcyhPYmplY3RTdG9yZSwgJ19zdG9yZScsIFtcbiAgICAnbmFtZScsXG4gICAgJ2tleVBhdGgnLFxuICAgICdpbmRleE5hbWVzJyxcbiAgICAnYXV0b0luY3JlbWVudCdcbiAgXSk7XG5cbiAgcHJveHlSZXF1ZXN0TWV0aG9kcyhPYmplY3RTdG9yZSwgJ19zdG9yZScsIElEQk9iamVjdFN0b3JlLCBbXG4gICAgJ3B1dCcsXG4gICAgJ2FkZCcsXG4gICAgJ2RlbGV0ZScsXG4gICAgJ2NsZWFyJyxcbiAgICAnZ2V0JyxcbiAgICAnZ2V0QWxsJyxcbiAgICAnZ2V0QWxsS2V5cycsXG4gICAgJ2NvdW50J1xuICBdKTtcblxuICBwcm94eUN1cnNvclJlcXVlc3RNZXRob2RzKE9iamVjdFN0b3JlLCAnX3N0b3JlJywgSURCT2JqZWN0U3RvcmUsIFtcbiAgICAnb3BlbkN1cnNvcicsXG4gICAgJ29wZW5LZXlDdXJzb3InXG4gIF0pO1xuXG4gIHByb3h5TWV0aG9kcyhPYmplY3RTdG9yZSwgJ19zdG9yZScsIElEQk9iamVjdFN0b3JlLCBbXG4gICAgJ2RlbGV0ZUluZGV4J1xuICBdKTtcblxuICBmdW5jdGlvbiBUcmFuc2FjdGlvbihpZGJUcmFuc2FjdGlvbikge1xuICAgIHRoaXMuX3R4ID0gaWRiVHJhbnNhY3Rpb247XG4gICAgdGhpcy5jb21wbGV0ZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgaWRiVHJhbnNhY3Rpb24ub25jb21wbGV0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9O1xuICAgICAgaWRiVHJhbnNhY3Rpb24ub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QoaWRiVHJhbnNhY3Rpb24uZXJyb3IpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIFRyYW5zYWN0aW9uLnByb3RvdHlwZS5vYmplY3RTdG9yZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgT2JqZWN0U3RvcmUodGhpcy5fdHgub2JqZWN0U3RvcmUuYXBwbHkodGhpcy5fdHgsIGFyZ3VtZW50cykpO1xuICB9O1xuXG4gIHByb3h5UHJvcGVydGllcyhUcmFuc2FjdGlvbiwgJ190eCcsIFtcbiAgICAnb2JqZWN0U3RvcmVOYW1lcycsXG4gICAgJ21vZGUnXG4gIF0pO1xuXG4gIHByb3h5TWV0aG9kcyhUcmFuc2FjdGlvbiwgJ190eCcsIElEQlRyYW5zYWN0aW9uLCBbXG4gICAgJ2Fib3J0J1xuICBdKTtcblxuICBmdW5jdGlvbiBVcGdyYWRlREIoZGIsIG9sZFZlcnNpb24sIHRyYW5zYWN0aW9uKSB7XG4gICAgdGhpcy5fZGIgPSBkYjtcbiAgICB0aGlzLm9sZFZlcnNpb24gPSBvbGRWZXJzaW9uO1xuICAgIHRoaXMudHJhbnNhY3Rpb24gPSBuZXcgVHJhbnNhY3Rpb24odHJhbnNhY3Rpb24pO1xuICB9XG5cbiAgVXBncmFkZURCLnByb3RvdHlwZS5jcmVhdGVPYmplY3RTdG9yZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgT2JqZWN0U3RvcmUodGhpcy5fZGIuY3JlYXRlT2JqZWN0U3RvcmUuYXBwbHkodGhpcy5fZGIsIGFyZ3VtZW50cykpO1xuICB9O1xuXG4gIHByb3h5UHJvcGVydGllcyhVcGdyYWRlREIsICdfZGInLCBbXG4gICAgJ25hbWUnLFxuICAgICd2ZXJzaW9uJyxcbiAgICAnb2JqZWN0U3RvcmVOYW1lcydcbiAgXSk7XG5cbiAgcHJveHlNZXRob2RzKFVwZ3JhZGVEQiwgJ19kYicsIElEQkRhdGFiYXNlLCBbXG4gICAgJ2RlbGV0ZU9iamVjdFN0b3JlJyxcbiAgICAnY2xvc2UnXG4gIF0pO1xuXG4gIGZ1bmN0aW9uIERCKGRiKSB7XG4gICAgdGhpcy5fZGIgPSBkYjtcbiAgfVxuXG4gIERCLnByb3RvdHlwZS50cmFuc2FjdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgVHJhbnNhY3Rpb24odGhpcy5fZGIudHJhbnNhY3Rpb24uYXBwbHkodGhpcy5fZGIsIGFyZ3VtZW50cykpO1xuICB9O1xuXG4gIHByb3h5UHJvcGVydGllcyhEQiwgJ19kYicsIFtcbiAgICAnbmFtZScsXG4gICAgJ3ZlcnNpb24nLFxuICAgICdvYmplY3RTdG9yZU5hbWVzJ1xuICBdKTtcblxuICBwcm94eU1ldGhvZHMoREIsICdfZGInLCBJREJEYXRhYmFzZSwgW1xuICAgICdjbG9zZSdcbiAgXSk7XG5cbiAgLy8gQWRkIGN1cnNvciBpdGVyYXRvcnNcbiAgLy8gVE9ETzogcmVtb3ZlIHRoaXMgb25jZSBicm93c2VycyBkbyB0aGUgcmlnaHQgdGhpbmcgd2l0aCBwcm9taXNlc1xuICBbJ29wZW5DdXJzb3InLCAnb3BlbktleUN1cnNvciddLmZvckVhY2goZnVuY3Rpb24oZnVuY05hbWUpIHtcbiAgICBbT2JqZWN0U3RvcmUsIEluZGV4XS5mb3JFYWNoKGZ1bmN0aW9uKENvbnN0cnVjdG9yKSB7XG4gICAgICBDb25zdHJ1Y3Rvci5wcm90b3R5cGVbZnVuY05hbWUucmVwbGFjZSgnb3BlbicsICdpdGVyYXRlJyldID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhcmdzID0gdG9BcnJheShhcmd1bWVudHMpO1xuICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmdzW2FyZ3MubGVuZ3RoIC0gMV07XG4gICAgICAgIHZhciBuYXRpdmVPYmplY3QgPSB0aGlzLl9zdG9yZSB8fCB0aGlzLl9pbmRleDtcbiAgICAgICAgdmFyIHJlcXVlc3QgPSBuYXRpdmVPYmplY3RbZnVuY05hbWVdLmFwcGx5KG5hdGl2ZU9iamVjdCwgYXJncy5zbGljZSgwLCAtMSkpO1xuICAgICAgICByZXF1ZXN0Lm9uc3VjY2VzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGNhbGxiYWNrKHJlcXVlc3QucmVzdWx0KTtcbiAgICAgICAgfTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vIHBvbHlmaWxsIGdldEFsbFxuICBbSW5kZXgsIE9iamVjdFN0b3JlXS5mb3JFYWNoKGZ1bmN0aW9uKENvbnN0cnVjdG9yKSB7XG4gICAgaWYgKENvbnN0cnVjdG9yLnByb3RvdHlwZS5nZXRBbGwpIHJldHVybjtcbiAgICBDb25zdHJ1Y3Rvci5wcm90b3R5cGUuZ2V0QWxsID0gZnVuY3Rpb24ocXVlcnksIGNvdW50KSB7XG4gICAgICB2YXIgaW5zdGFuY2UgPSB0aGlzO1xuICAgICAgdmFyIGl0ZW1zID0gW107XG5cbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICAgIGluc3RhbmNlLml0ZXJhdGVDdXJzb3IocXVlcnksIGZ1bmN0aW9uKGN1cnNvcikge1xuICAgICAgICAgIGlmICghY3Vyc29yKSB7XG4gICAgICAgICAgICByZXNvbHZlKGl0ZW1zKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaXRlbXMucHVzaChjdXJzb3IudmFsdWUpO1xuXG4gICAgICAgICAgaWYgKGNvdW50ICE9PSB1bmRlZmluZWQgJiYgaXRlbXMubGVuZ3RoID09IGNvdW50KSB7XG4gICAgICAgICAgICByZXNvbHZlKGl0ZW1zKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgY3Vyc29yLmNvbnRpbnVlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfSk7XG5cbiAgdmFyIGV4cCA9IHtcbiAgICBvcGVuOiBmdW5jdGlvbihuYW1lLCB2ZXJzaW9uLCB1cGdyYWRlQ2FsbGJhY2spIHtcbiAgICAgIHZhciBwID0gcHJvbWlzaWZ5UmVxdWVzdENhbGwoaW5kZXhlZERCLCAnb3BlbicsIFtuYW1lLCB2ZXJzaW9uXSk7XG4gICAgICB2YXIgcmVxdWVzdCA9IHAucmVxdWVzdDtcblxuICAgICAgcmVxdWVzdC5vbnVwZ3JhZGVuZWVkZWQgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBpZiAodXBncmFkZUNhbGxiYWNrKSB7XG4gICAgICAgICAgdXBncmFkZUNhbGxiYWNrKG5ldyBVcGdyYWRlREIocmVxdWVzdC5yZXN1bHQsIGV2ZW50Lm9sZFZlcnNpb24sIHJlcXVlc3QudHJhbnNhY3Rpb24pKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgcmV0dXJuIHAudGhlbihmdW5jdGlvbihkYikge1xuICAgICAgICByZXR1cm4gbmV3IERCKGRiKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgZGVsZXRlOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgICByZXR1cm4gcHJvbWlzaWZ5UmVxdWVzdENhbGwoaW5kZXhlZERCLCAnZGVsZXRlRGF0YWJhc2UnLCBbbmFtZV0pO1xuICAgIH1cbiAgfTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGV4cDtcbiAgfVxuICBlbHNlIHtcbiAgICBzZWxmLmlkYiA9IGV4cDtcbiAgfVxufSgpKTtcbiIsImltcG9ydCBpZGIgZnJvbSAnaWRiJztcclxuXHJcbi8vIG1vcmUgb24gdXNhZ2Ugb2YgdGhpcyBBUEkgaGVyZSA6IGh0dHBzOi8vZ2l0aHViLmNvbS9qYWtlYXJjaGliYWxkL2lkYlxyXG4vLyBnb2VzIGFzIGZvbGxvd3MgaWRiLm9wZW4obmFtZSwgdmVyc2lvbiwgdXBncmFkZUNhbGxiYWNrKVxyXG4vLyBFeGFtcGxlOiBcclxuLy8gVGhpcyByZXR1cm5zIGEgcHJvbWlzZSwgbGV0J3Mgc3RvcmUgdGhhdCBmb3IgbGF0ZXIgd2l0aCBhIHZhclxyXG5cclxudmFyIGRiUHJvbWlzZSA9IGlkYi5vcGVuKCd0ZXN0LWRiJywgNCwgXHJcbiAgLy8gdGhpcyBkZWZpbmVzIHRoZSBkYXRhYmFzZVxyXG4gIGZ1bmN0aW9uKHVwZ3JhZGVEYil7XHJcbiAgICBcclxuICAgIC8vIHRoaXMgY3JlYXRlcyBhIHN3aXRjaCB0byB1cGRhdGUgdGhlIGJyb3dzZXIgd2l0aCB0aGUgbmV3IHZlcnNpb24gb2YgdGhlIGluZGV4REIsIHRvIHRoZSBuZXcgb25lXHJcbiAgICBzd2l0Y2godXBncmFkZURiLm9sZFZlcnNpb24pe1xyXG5cclxuICAgICAvLyBjYXNlIDAgaXMgY2FsbGVkIGlmIHRoZSBicm93c2VyIGRvZXMgbm90IGhhdmUgdGhlIGZpcnN0IHZlcnNpb24gaW5zdGFsbGVkLCB0aGVuIGl0IGluc3RhbGxzIGl0IGlmIGl0IGRvZXMgbm90IFxyXG4gICAgICBjYXNlIDA6XHJcbiAgICAgIC8vIHRoaXMgc3RvcmUgaGFzIGEga2V5IHRoYXQncyBzZXBhcmF0ZSB0byB0aGUgZGF0YSwgd2hpY2ggaXMgd2hhdCB3ZSB3YW50IHRvIHN0b3JlIGluIGtleXZhbFN0b3JlXHJcbiAgICAgIHZhciBrZXlWYWxTdG9yZSA9IHVwZ3JhZGVEYi5jcmVhdGVPYmplY3RTdG9yZSgna2V5dmFsJyk7XHJcblxyXG4gICAgICAvL29iamVjdFN0b3JlIGRvY3VtZW50YXRpb24gaGVyZTogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0lEQk9iamVjdFN0b3JlXHJcbiAgICAgIC8vIGFjY2VwdHMgdGhlIHZhbHVlcyBvZiBvYmplY3RTdG9yZShuYW1lLCBvcHRpb25hbEtleSlcclxuICAgICAga2V5VmFsU3RvcmUucHV0KFxyXG4gICAgICAgIC8vIHRoaXMgaXMgdGhlIG9iamVjdCBuYW1lOlxyXG4gICAgICAgICd3b3JsZCcsIFxyXG4gICAgICAgIC8vIGFuZCB0aGlzIGlzIHRoZSBvcHRpb25hbCBrZXlcclxuICAgICAgICAnaGVsbG8nKTtcclxuXHJcbiAgICAvLyBhZnRlciBjYXNlIDEgaXMgY2FsbGVkLCB0aGlzIHN0b3JlcyAgdGhlIG5ldyBvYmplY3RTdG9yZSBhZnRlciB0aGUgZmlyc3QgY2FzZSBoYXNlIGJlZW4gY3JlYXRlciwgb3IgaWYgYWxyZWFkeSBjcmVhdGVkXHJcbiAgICAvLyBpdCBpbnN0YWxscyBjYXNlIDEgYWZ0ZXIgY29uZmlybWluZyBjYXNlIDAgaXMgY3JlYXRlZFxyXG4gICAgY2FzZSAxOlxyXG4gICAgXHJcbiAgICAgIC8vIG9iamVjdCBzdG9yZXMgY2FuIG9ubHkgYmUgY2FsbGVkIHdpdGhpbiB0aGUgdXBncmFkZURiIGZ1bmN0aW9uIG5vd2hlcmUgZWxzZS5cclxuICAgICAgLy8gYmVsb3cgaXMgdGhlIGNvZGUgIHRvIGNyZWF0ZSBhIG5ldyBvYmplY3Qgc3RvcmUgZm9yIHRoZSAncGVvcGxlJyBvYmplY3RcclxuICAgICAgLy8gVGhpcyBzZXRzIHRoZSBvYmplY3QncyAnbmFtZScgYXMgdGhlIGtleSwgd2hpY2ggaXMgc3RvcmVkIGJ5IG5hbWUgcmF0aGVyIHRoYW4gYnkga2V5XHJcbiAgICAgIC8vIHdoZW4gYWRkaW5nIG5ldyBvYmplY3Qgc3RvcmVzLCB0aGUgdmVyc2lvbiBuZWVkcyB0byBiZSBjaGFuZ2VkXHJcbiAgICAgIHVwZ3JhZGVEYi5jcmVhdGVPYmplY3RTdG9yZSgncGVvcGxlJywge2tleVBhdGg6ICduYW1lJ30pO1xyXG5cclxuICAgIC8vIHVwZ3JhZGluZyB0byBhIG5ldyB2ZXJzaW9uLCB0byBmaWx0ZXIgb3V0IERCIHJlc3VsdHMsIGJ5IGZhdm9yaXRlIGFuaW1hbC5cclxuICAgIC8vIE11c3QgY3JlYXRlIGEgbmV3IGNhc2UsIGNyZWF0ZWQgYmVsb3dcclxuICAgIGNhc2UgMjpcclxuICAgICAgdmFyIHBlb3BsZVN0b3JlID0gdXBncmFkZURiLnRyYW5zYWN0aW9uLm9iamVjdFN0b3JlKCdwZW9wbGUnKTtcclxuXHJcbiAgICAgIC8vIHRoaXMgY3JlYXRlcyBhbiBpbmRleCwgd2hpY2ggc29ydHMgdGhlICd2YWZvcml0ZWFuaW1hbCcgcHJvcGVydHlcclxuICAgICAgcGVvcGxlU3RvcmUuY3JlYXRlSW5kZXgoJ2FuaW1hbCcsICdmYXZvcml0ZUFuaW1hbCcpO1xyXG5cclxuICAgICAgLy8gdGhlIGNvZGUgdG8gbGlzdCBhbGwgdGhlIHBlb3BsZSB3aWxsIGJlIG1vZGlmaWVkIHRvIHNvcnQgcmVzdWx0cyBieSBmYXZvcml0ZUFuaW1hbCBiZWxvd1xyXG4gICAgXHJcbiAgICAvLyB1cGdyYWRpbmcgdG8gdmVyc2lvbiA0LCBmb3IgdGhlIHF1aXogaW4gbGVzc29uIDNcclxuICAgIGNhc2UgMzpcclxuICAgICAgdmFyIHBlb3BsZVN0b3JlID0gdXBncmFkZURiLnRyYW5zYWN0aW9uLm9iamVjdFN0b3JlKCdwZW9wbGUnKTtcclxuXHJcbiAgICAgIHBlb3BsZVN0b3JlLmNyZWF0ZUluZGV4KCdhZ2UnLCAnYWdlJyk7XHJcbiAgICB9XHJcblxyXG4gICAgXHJcblxyXG59KTtcclxuXHJcbi8vIHRoaXMgY2FsbHMgb3VyIGRhdGFiYXNlLCBhbmQgcmVhZHMgZnJvbSBpdCwgYWZ0ZXIgdGhlIHByb21pc2UgaGFzIGJlZW4gZnVsZmlsbGVkIChkYlByb21pc2UpXHJcbmRiUHJvbWlzZS50aGVuKGZ1bmN0aW9uKGRiKXtcclxuXHJcbiAgLy8gdGhpcyBpcyB0aGUgZnVuY3Rpb24gdG8gcmVhZCBmcm9tIHRoZSBkYXRhYmFzZSB3aGljaCBhY2NlcHRzIHRoZSBvYmplY3RTdG9yZSB3aGljaCB3YXMgY3JlYXRlZCBhYm92ZSwgaW4gdGhpcyBjYXNlIGtleXZhbFxyXG4gIC8vIHRoaXMgZnVuY3Rpb24gc2VsZWN0cyB0aGUgJ2tleXZhbCcgb2JqZWN0IHN0b3JlLCByZWFkeSB0byB1c2UsIHdpdGggYW4gb3B0aW9uYWwgJ2RvIHNvbWV0aGluZycgYXJndW1lbnRcclxuICB2YXIgdHJhbnNhY3Rpb24gPSBkYi50cmFuc2FjdGlvbigna2V5dmFsJyk7XHJcblxyXG4gIC8vIHRoaXMgY2FsbHMgdGhlIG9iamVjdCBzdG9yZSAoREIpIHdlIHdhbnQgdG8gZGlzcGxheVxyXG4gIHZhciBrZXlWYWxEQiA9IHRyYW5zYWN0aW9uLm9iamVjdFN0b3JlKCdrZXl2YWwnKTtcclxuXHJcbiAgLy8gdGhpcyByZXR1cm5zIGEga2V5IHdpdGhpbiB0aGUga2V5dmFsIG9iamVjdCwgaW4gdGhpZSBjYXNlIHRoZSAnaGVsbG8nIGNyZWF0ZWQgYWJvdmVcclxuICAvLyB0aGlzIHJldHVybnMgYSBwcm9taXNlXHJcbiAgcmV0dXJuIGtleVZhbERCLmdldCgnaGVsbG8nKTtcclxuXHJcbiAgLy8gd2l0aGluIHRoZSBwcm9taXNlLCB3ZSBncmFiIHRoZSB2YWx1ZSBvZiBoZWxsbywgd2hpY2ggaW4gdGhpcyBjYXNlIGlzIHdvcmxkLlxyXG4gIC8vIHRoZSB2YWx1ZSBvZiB0aGlzIGtleSBzdG9yZSBpcyB0aGUgZnVuY3Rpb24gYXJndW1lbnRcclxufSkudGhlbihmdW5jdGlvbih2YWwpe1xyXG4gIGNvbnNvbGUubG9nKCdUaGUgdmFsdWUgb2YgXCJoZWxsb1wiIGlzOicsIHZhbCk7XHJcbn0pO1xyXG5cclxuLy8gdGhlIGZvbGxvd2luZyBpcyB1c2VkIHRvIGFkZCB2YWx1ZXMgdG8gZXhzaXN0aW5nIG9iamVjdCBzdG9yZXNcclxuZGJQcm9taXNlLnRoZW4oZnVuY3Rpb24oZGIpe1xyXG4gIC8vIG9uY2UgYWdhaW4gZ3JhYnMgb3VyIERCLCBidXQgdGhpcyB0aW1lLCAncmVhZHdyaXRlJyBpcyBhZGRlZCB0byB0aGUgb3B0aW9uYWwgdmFsdWV0byB3cml0ZSBzb21ldGhpbmdcclxuICB2YXIgdHJhbnNhY3Rpb24gPSBkYi50cmFuc2FjdGlvbigna2V5dmFsJywgJ3JlYWR3cml0ZScpO1xyXG5cclxuICAvLyB0aGlzIG9uY2UgYWdhaW4gY2FsbHMgb3VyIGRiIGFmdGVyIGl0cyBiZWVuIHJlZ2lzdGVyZWRcclxuICB2YXIga2V5VmFsV3JpdGUgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZSgna2V5dmFsJyk7XHJcblxyXG4gIC8vIHRoaXMgc3RvcmVzIG5ldyB2YWx1ZXMgaW50byB1ciBEQiwgd2l0aCB0aGUgdmFsdWUgYmVpbmcgdGhlIGZpcnN0IGFyZ3VtZW50IGFuZCB0aGUga2V5IGJlaW5nIHRoZSBzZWNvbmQgYXJndW1lbnRcclxuICBrZXlWYWxXcml0ZS5wdXQoJ2JhcicsICdmb28nKTtcclxuXHJcbiAgLy8gdGhpcyByZXR1cm5zIGEgcHJvbWlzZSwgdGhhdCBvbmx5IHJldHVybnMgaWYgYW5kIHdoZW4gdGhlIHRyYW5zYWN0aW9uIGNvbXBsZXRlcywgYW5kIHJlamVjdHMgaWYgaXQgZmFpbHNcclxuICByZXR1cm4gdHJhbnNhY3Rpb24uY29tcGxldGU7XHJcbn0pLnRoZW4oZnVuY3Rpb24oKXtcclxuICBjb25zb2xlLmxvZygnQWRkZWQgZm9vOmJhciB0byBrZXl2YWwnKTtcclxufSk7XHJcblxyXG4vLyB0aGUgZm9sbG93aW5nIGlzIHVzZWQgdG8gYWRkIHZhbHVlcyB0byBleHNpc3Rpbmcgb2JqZWN0IHN0b3Jlc1xyXG5kYlByb21pc2UudGhlbihmdW5jdGlvbihkYil7XHJcbiAgLy8gb25jZSBhZ2FpbiBncmFicyBvdXIgREIsIGJ1dCB0aGlzIHRpbWUsICdyZWFkd3JpdGUnIGlzIGFkZGVkIHRvIHRoZSBvcHRpb25hbCB2YWx1ZXRvIHdyaXRlIHNvbWV0aGluZ1xyXG4gIHZhciB0cmFuc2FjdGlvbiA9IGRiLnRyYW5zYWN0aW9uKCdrZXl2YWwnLCAncmVhZHdyaXRlJyk7XHJcblxyXG4gIC8vIHRoaXMgb25jZSBhZ2FpbiBjYWxscyBvdXIgZGIgYWZ0ZXIgaXRzIGJlZW4gcmVnaXN0ZXJlZFxyXG4gIHZhciBrZXlWYWxXcml0ZSA9IHRyYW5zYWN0aW9uLm9iamVjdFN0b3JlKCdrZXl2YWwnKTtcclxuXHJcbiAgLy8gdGhpcyBzdG9yZXMgbmV3IHZhbHVlcyBpbnRvIHVyIERCLCB3aXRoIHRoZSB2YWx1ZSBiZWluZyB0aGUgZmlyc3QgYXJndW1lbnQgYW5kIHRoZSBrZXkgYmVpbmcgdGhlIHNlY29uZCBhcmd1bWVudFxyXG4gIGtleVZhbFdyaXRlLnB1dCgnZG9nJywgJ2Zhdm9yaXRlQW5pbWFsJyk7XHJcblxyXG4gIC8vIHRoaXMgcmV0dXJucyBhIHByb21pc2UsIHRoYXQgb25seSByZXR1cm5zIGlmIGFuZCB3aGVuIHRoZSB0cmFuc2FjdGlvbiBjb21wbGV0ZXMsIGFuZCByZWplY3RzIGlmIGl0IGZhaWxzXHJcbiAgcmV0dXJuIHRyYW5zYWN0aW9uLmNvbXBsZXRlO1xyXG59KS50aGVuKGZ1bmN0aW9uKCl7XHJcbiAgY29uc29sZS5sb2coJ0FkZGVkIGZhdm9yaXRlQW5pbWFsIGtleSA6IGRvZycpO1xyXG59KTtcclxuXHJcbi8vIHRoZSBmb2xsb3dpbmcgY3JlYXRlcyB0aGUgdmFsdWVzIHRvIHRoZSBwZW9wbGUgT2JqZWN0IHN0b3JlOlxyXG5kYlByb21pc2UudGhlbihmdW5jdGlvbihkYil7XHJcbiAgLy8gb25jZSBhZ2FpbiBncmFicyBvdXIgREIsIGJ1dCB0aGlzIHRpbWUsICdyZWFkd3JpdGUnIGlzIGFkZGVkIHRvIHRoZSBvcHRpb25hbCB2YWx1ZXRvIHdyaXRlIHNvbWV0aGluZ1xyXG4gIHZhciB0cmFuc2FjdGlvbiA9IGRiLnRyYW5zYWN0aW9uKCdwZW9wbGUnLCAncmVhZHdyaXRlJyk7XHJcblxyXG4gIC8vIHRoaXMgb25jZSBhZ2FpbiBjYWxscyBvdXIgZGIgYWZ0ZXIgaXRzIGJlZW4gcmVnaXN0ZXJlZFxyXG4gIHZhciBwZW9wbGVTdG9yZSA9IHRyYW5zYWN0aW9uLm9iamVjdFN0b3JlKCdwZW9wbGUnKTtcclxuXHJcbiAgLy8gdGhpcyBzdG9yZXMgbmV3IHZhbHVlcyBpbnRvIHVyIERCLCBjcmVhdGluZyBhbiBvYmplY3Qgd2l0aCB3aGF0ZXZlciB2YWx1ZXMgSSBzZXQgd2l0aGluIHRoZSB0cmFuc2FjdGlvbi5wdXQgYXJndW1lbnRzLlxyXG4gIC8vIFRoZXJlIGlzIG5vIGtleSBuZWNlc3NhcnkgaGVyZSwgc2luY2Ugd2UgaGF2ZSB0b2xkIHRoaXMgc3BlY2lmaWMgc3RvcmUgdG8gYWRkIHRoZSBuYW1lIHByb3BlcnR5IGFzIHRoZSBrZXkgZm9yIHRoaXMgREJcclxuICAvLyBFeGFtcGxlIGhlcmU6IFxyXG4gIHBlb3BsZVN0b3JlLnB1dCh7XHJcbiAgICBuYW1lOidTYW0gTXVub3onLFxyXG4gICAgYWdlOiAyNSxcclxuICAgIGZhdm9yaXRlQW5pbWFsOiAnZG9nJ1xyXG4gIH0pO1xyXG5cclxuICAvLyBoZXJlIGFyZSBtb3JlIHRvIHBlb3BsZSB0byBhZGQgdG8gdGhpcyBEQiBvYmplY3RTdG9yZTpcclxuICBwZW9wbGVTdG9yZS5wdXQoe1xyXG4gICAgbmFtZTonSGVybWlvbmUgR3JhbmdlcicsXHJcbiAgICBhZ2U6IDE4LFxyXG4gICAgZmF2b3JpdGVBbmltYWw6ICdjYXQnXHJcbiAgfSk7ICBcclxuXHJcbiAgcGVvcGxlU3RvcmUucHV0KHtcclxuICAgIG5hbWU6J0hhcnJ5IFBvdHRlcicsXHJcbiAgICBhZ2U6IDE5LFxyXG4gICAgZmF2b3JpdGVBbmltYWw6ICdvd2wnXHJcbiAgfSk7ICBcclxuXHJcbiAgcGVvcGxlU3RvcmUucHV0KHtcclxuICAgIG5hbWU6J1JvbmFsZCBXZXNsZXknLFxyXG4gICAgYWdlOiAxOSxcclxuICAgIGZhdm9yaXRlQW5pbWFsOiAncmF0J1xyXG4gIH0pOyBcclxuXHJcbiAgLy8gdGhpcyByZXR1cm5zIGEgcHJvbWlzZSwgdGhhdCBvbmx5IHJldHVybnMgaWYgYW5kIHdoZW4gdGhlIHRyYW5zYWN0aW9uIGNvbXBsZXRlcywgYW5kIHJlamVjdHMgaWYgaXQgZmFpbHNcclxuICByZXR1cm4gdHJhbnNhY3Rpb24uY29tcGxldGU7XHJcbn0pLnRoZW4oZnVuY3Rpb24oKXtcclxuICBjb25zb2xlLmxvZygnUGVvcGxlIGFkZGVkJyk7XHJcbn0pO1xyXG5cclxuLy8gdGhlIGZvbGxvd2luZyByZWFkcyB0aGUgdmFsdWVzIG9mIHRoZSBwZW9wbGUgb2JqZWN0U3RvcmVcclxuLy8gdGhpcyBjYWxscyBvdXIgZGF0YWJhc2UsIGFuZCByZWFkcyBmcm9tIGl0LCBhZnRlciB0aGUgcHJvbWlzZSBoYXMgYmVlbiBmdWxmaWxsZWQgKGRiUHJvbWlzZSlcclxuZGJQcm9taXNlLnRoZW4oZnVuY3Rpb24oZGIpe1xyXG5cclxuICAvLyB0aGlzIGlzIHRoZSBmdW5jdGlvbiB0byByZWFkIGZyb20gdGhlIGRhdGFiYXNlIHdoaWNoIGFjY2VwdHMgdGhlIG9iamVjdFN0b3JlIHdoaWNoIHdhcyBjcmVhdGVkIGFib3ZlLCBpbiB0aGlzIGNhc2Uga2V5dmFsXHJcbiAgLy8gdGhpcyBmdW5jdGlvbiBzZWxlY3RzIHRoZSAna2V5dmFsJyBvYmplY3Qgc3RvcmUsIHJlYWR5IHRvIHVzZSwgd2l0aCBhbiBvcHRpb25hbCAnZG8gc29tZXRoaW5nJyBhcmd1bWVudFxyXG4gIHZhciB0cmFuc2FjdGlvbiA9IGRiLnRyYW5zYWN0aW9uKCdwZW9wbGUnKTtcclxuXHJcbiAgLy8gdGhpcyBjYWxscyB0aGUgb2JqZWN0IHN0b3JlIChEQikgd2Ugd2FudCB0byBkaXNwbGF5XHJcbiAgdmFyIHBlb3BsZVJlYWQgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZSgncGVvcGxlJyk7XHJcblxyXG4gIC8vIHRoaXMgY2FsbHMgdGhlIGluZGV4IHdlIGNyZWF0ZWQgZm9yIGNhc2UgMiBvZiB0aGlzIERCXHJcbiAgdmFyIGFuaW1hbEluZGV4ID0gcGVvcGxlUmVhZC5pbmRleCgnYW5pbWFsJyk7XHJcblxyXG4gIC8vIHRoaXMgcmV0dXJucyBhbGwga2V5cyBhbmQgdmFsdWVzIHdpdGhpbiB0aGUgcGVvcGxlIG9iamVjdFNUb3JlXHJcbiAgLy8gcmV0dXJuIHBlb3BsZVJlYWQuZ2V0QWxsKCk7XHJcblxyXG4gIC8vIHRoaXMgcmV0dXJucyB0aGUga2V5IHZhbHVlcyBzb3J0aW5nIHRoZW0gYnkgdGhlIGluZGV4IHdlIGNyZWF0ZWQgZm9yIGFuaW1hbHNcclxuICAvLyByZXR1cm4gYW5pbWFsSW5kZXguZ2V0QWxsKCk7XHJcblxyXG4gIC8vIHRoaXMgcmV0dXJucyB0aGUga2V5IHZhbHVlcyBvZiB0aGlzIG9iamVjdFN0b3JlIHRoYXQgY29udGFpbiB0aGUgZ2V0QWxsIGFyZ3VtZW50IHZhbHVlLlxyXG4gIC8vIEV4YW1wbGU6XHJcbiAgcmV0dXJuIGFuaW1hbEluZGV4LmdldEFsbCgnY2F0JylcclxuXHJcbiAgLy8gb25jZSBmdWxmaWxsZWQsIHRoaXMgbG9ncyB0aGUgdmFsdWVzIG9mIHRoZSBwZW9wbGUgc3RvcmVcclxuICAvLyB0aGlzIGdyYWJzIEFMTCB0aGUgdmFsdWVzIG9mIHRoZSBEQiBhbmQgbG9ncyB0aGVtIGluIGFscGhhYmV0aWNhbCBvcmRlclxyXG4gIC8vIFZFUlkgSU1QT1JUQU5UIHRoaXMgaXMgZXhhY3RseSBob3cgdGhlIHZhbHVlcyB3aWxsIGJlIGdyYWJiZWQgZnJvbSB0aGUgdHJhbnNwb3J0YXRpb24gQVBJIGFuZCBwbGFjZWQgd2l0aGluIHRoZSB2aWV3IG9mIHRoZSBhcHBsaWNhdGlvblxyXG4gIC8vIFxyXG59KS50aGVuKGZ1bmN0aW9uKHZhbCl7XHJcbiAgY29uc29sZS5sb2coJ1Blb3BsZTonLCB2YWwpO1xyXG59KTtcclxuXHJcbi8vIGluZGV4IHByb21pc2UgdG8gZ3JhYiB0aGUgdmFsdWVzIG9mIHRoZSAnYWdlJyBpbmRleCBvZiB0aGUgJ3Blb3BsZScgb2JqZWN0U3RvcmVcclxuZGJQcm9taXNlLnRoZW4oZnVuY3Rpb24oZGIpe1xyXG4gIHZhciB0cmFuc2FjdGlvbiA9IGRiLnRyYW5zYWN0aW9uKCdwZW9wbGUnKTtcclxuXHJcbiAgLy8gdGhpcyBjYWxscyB0aGUgb2JqZWN0IHN0b3JlIChEQikgd2Ugd2FudCB0byBkaXNwbGF5XHJcbiAgdmFyIHBlb3BsZVJlYWQgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZSgncGVvcGxlJyk7XHJcblxyXG4gIC8vIHRoaXMgY2FsbHMgdGhlIGluZGV4IHdlIGNyZWF0ZWQgZm9yIGNhc2UgMiBvZiB0aGlzIERCXHJcbiAgdmFyIGFnZUluZGV4ID0gcGVvcGxlUmVhZC5pbmRleCgnYWdlJyk7XHJcblxyXG4gIHJldHVybiBhZ2VJbmRleC5nZXRBbGwoKTtcclxufSkudGhlbihmdW5jdGlvbih2YWwpe1xyXG4gIGNvbnNvbGUubG9nKCdBZ2UnLCB2YWwpO1xyXG59KTtcclxuXHJcbi8vIHRoZSBmb2xsb3dpbmcgY2FuIGJlIHVzZWQgdG8gY3JlYXRlIEN1cnNvcnMgZm9yIGluZGV4IGNhbHVlc1xyXG5kYlByb21pc2UudGhlbihmdW5jdGlvbihkYil7XHJcbiAgdmFyIHRyYW5zYWN0aW9uID0gZGIudHJhbnNhY3Rpb24oJ3Blb3BsZScpO1xyXG5cclxuICB2YXIgcGVvcGxlUmVhZCA9IHRyYW5zYWN0aW9uLm9iamVjdFN0b3JlKCdwZW9wbGUnKTtcclxuXHJcbiAgdmFyIGFnZUluZGV4ID0gcGVvcGxlUmVhZC5pbmRleCgnYWdlJyk7XHJcblxyXG4gIC8vIHRoaXMgcmV0dXJucyB0aGUgY3Vyc29zXHJcbiAgcmV0dXJuIGFnZUluZGV4Lm9wZW5DdXJzb3IoKTtcclxufSkudGhlbihmdW5jdGlvbiBsb2dQZXJzb24oY3Vyc29yKXtcclxuICAvLyBpZiB0aGUgY3Vyc29yIHZhbHVlIGlzIG51bGwsIHRoZW4gcmV0dXJuXHJcbiAgaWYgKCFjdXJzb3IpIHJldHVybjtcclxuICAvL1xyXG4gIC8vIGN1cnNvciBncmFicyB2YWx1ZXMgYnkgb2JqZWN0IHByb3BlcnRpZXMsIHRoZSBmb2xsb3dpbmcgZ3JhYnMgdmFsdWUgYW5kIG5hbWVcclxuICBjb25zb2xlLmxvZygnQ3Vyc29yZWQgYXQ6JywgY3Vyc29yLnZhbHVlLm5hbWUpO1xyXG5cclxuICAvLyByZXR1cm5zIHRoZSBwcm9taXNlIGZvciB0aGUgbmV4dCBjdXJzb3Igb3IgbGVhdmVzIGl0IHVuZGVmaW5lZCBpZiB0aGVyZSBpc250IGEgY3Vyc29yXHJcbiAgcmV0dXJuIGN1cnNvci5jb250aW51ZSgpXHJcbiAgLy8gaWYgY3Vyc29yIGlzIHZhbGlkLCB0aGVuIGl0IHJldHVybnMgdGhlIG5leHQgY3Vyc29yIHZhbHVlLCBvciBwZXJzb24gaW4gdGhpcyBjYXNlXHJcbiAgLy8gY3JlYXRlcyBhIGxvb3AgdGhhdCBydW5zIHRocm91Z2ggYWxsIHRoZSB2YWx1ZXNcclxuICAudGhlbihsb2dQZXJzb24pO1xyXG5cclxuICAvLyBvdGhlciBvcHRpb25hbCB2YWx1ZXMgZm9yIGN1cnNvciBhcmU6XHJcbiAgLy8gY3Vyc29yLnVwZGF0ZShuZXdWYWx1ZSkgLSB1cGRhdGVzIHRoZSBjdXJyZW50IGN1cnNvciB3aXRoIGEgdmFsdWUgb2Ygb3VyIGNob2ljZVxyXG4gIC8vIGN1cnNvci5kZWxldGUoKSAtIGRlbGV0ZXMgdGhlIGN1cnJlbnQgY3Vyc29yXHJcbn0pXHJcblxyXG4vLyB0aGlzIGNhbiBiZSB1c2VkIHRvIHNraXAgY3Vyc29yIHZhbHVlcywgZm9yIGV4YW1wbGU6XHJcbi50aGVuKGZ1bmN0aW9uKGN1cnNvcil7XHJcbiAgaWYgKCFjdXJzb3IpIHJldHVybjtcclxuXHJcbiAgLy8gdGhpcyBza2lwcyB0aGUgbnVtYmVyIG9mIGl0ZW1zIHNwZWNpZmllZCBpbiB0aGUgZnVuY3Rpb24gYXJndW1lbnRcclxuICByZXR1cm4gY3Vyc29yLmFkdmFuY2UoMik7XHJcbn0pXHJcbi50aGVuKGZ1bmN0aW9uKCl7XHJcbiAgLy8gdGhpcyBpcyBvbmx5IHJhbiB3aGVuIHRoZSBjdXJzb3IgaGFzIHJhbiB0aHJvdWdoIGFsbCB0aGUgREIgdmFsdWVzLCBhbmQgd2UgYXJlIG5vdCBhdCB0aGUgZW5kIG9mIHRoZSBsaXN0XHJcbiAgY29uc29sZS5sb2coJ0RvbmUgY3Vyc29yaW5nJyk7XHJcbn0pOyJdfQ==