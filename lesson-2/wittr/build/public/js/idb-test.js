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

var dbPromise = _idb2['default'].open('test-db', 3,
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

},{"idb":1}]},{},[2])

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaWRiL2xpYi9pZGIuanMiLCJEOi9Eb2N1bWVudHMvU2Nob29sL3VkYWNpdHkvY291cnNlcy9vZmZsaW5lLWFwcGxpY2F0aW9ucy9sZXNzb24tMi93aXR0ci9wdWJsaWMvanMvaWRiLXRlc3QvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7O21CQy9TZ0IsS0FBSzs7Ozs7Ozs7O0FBT3JCLElBQUksU0FBUyxHQUFHLGlCQUFJLElB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QyxrQkFBa0I7QUFDdkIsT0FBRyxFQUFFLEVBQUU7QUFDUCxrQkFBYyxFQUFFLEtBQUs7R0FDdEIsQ0FBQyxDQUFDOztBQUVILGFBQVcsQ0FBQyxHQUFHLENBQUM7QUFDZCxRQUFJLEVBQUMsY0FBYztBQUNuQixPQUFHLEVBQUUsRUFBRTtBQUNQLGtCQUFjLEVBQUUsS0FBSztHQUN0QixDQUFDLENBQUM7O0FBRUgsYUFBVyxDQUFDLEdBQUcsQ0FBQztBQUNkLFFBQUksRUFBQyxlQUFlO0FBQ3BCLE9BQUcsRUFBRSxFQUFFO0FBQ1Asa0JBQWMsRUFBRSxLQUFLO0dBQ3RCLENBQUMsQ0FBQzs7O0FBR0gsU0FBTyxXQUFXLENBQUMsUUFBUSxDQUFDO0NBQzdCLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBVTtBQUNoQixTQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0NBQzdCLENBQUMsQ0FBQzs7OztBQUlILFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBUyxFQUFFLEVBQUM7Ozs7QUFJekIsTUFBSSxXQUFXLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQzs7O0FBRzNDLE1BQUksVUFBVSxHQUFHLFdBQVcsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7OztBQUduRCxNQUFJLFdBQVcsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDOzs7Ozs7Ozs7O0FBVTdDLFNBQU8sV0FBVyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTs7Ozs7O0NBTWpDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBUyxHQUFHLEVBQUM7QUFDbkIsU0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUM7Q0FDN0IsQ0FBQyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxuKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiB0b0FycmF5KGFycikge1xuICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcnIpO1xuICB9XG5cbiAgZnVuY3Rpb24gcHJvbWlzaWZ5UmVxdWVzdChyZXF1ZXN0KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgcmVxdWVzdC5vbnN1Y2Nlc3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVzb2x2ZShyZXF1ZXN0LnJlc3VsdCk7XG4gICAgICB9O1xuXG4gICAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KHJlcXVlc3QuZXJyb3IpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHByb21pc2lmeVJlcXVlc3RDYWxsKG9iaiwgbWV0aG9kLCBhcmdzKSB7XG4gICAgdmFyIHJlcXVlc3Q7XG4gICAgdmFyIHAgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHJlcXVlc3QgPSBvYmpbbWV0aG9kXS5hcHBseShvYmosIGFyZ3MpO1xuICAgICAgcHJvbWlzaWZ5UmVxdWVzdChyZXF1ZXN0KS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG4gICAgfSk7XG5cbiAgICBwLnJlcXVlc3QgPSByZXF1ZXN0O1xuICAgIHJldHVybiBwO1xuICB9XG4gIFxuICBmdW5jdGlvbiBwcm9taXNpZnlDdXJzb3JSZXF1ZXN0Q2FsbChvYmosIG1ldGhvZCwgYXJncykge1xuICAgIHZhciBwID0gcHJvbWlzaWZ5UmVxdWVzdENhbGwob2JqLCBtZXRob2QsIGFyZ3MpO1xuICAgIHJldHVybiBwLnRoZW4oZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIGlmICghdmFsdWUpIHJldHVybjtcbiAgICAgIHJldHVybiBuZXcgQ3Vyc29yKHZhbHVlLCBwLnJlcXVlc3QpO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gcHJveHlQcm9wZXJ0aWVzKFByb3h5Q2xhc3MsIHRhcmdldFByb3AsIHByb3BlcnRpZXMpIHtcbiAgICBwcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24ocHJvcCkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFByb3h5Q2xhc3MucHJvdG90eXBlLCBwcm9wLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXNbdGFyZ2V0UHJvcF1bcHJvcF07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gcHJveHlSZXF1ZXN0TWV0aG9kcyhQcm94eUNsYXNzLCB0YXJnZXRQcm9wLCBDb25zdHJ1Y3RvciwgcHJvcGVydGllcykge1xuICAgIHByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbihwcm9wKSB7XG4gICAgICBpZiAoIShwcm9wIGluIENvbnN0cnVjdG9yLnByb3RvdHlwZSkpIHJldHVybjtcbiAgICAgIFByb3h5Q2xhc3MucHJvdG90eXBlW3Byb3BdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBwcm9taXNpZnlSZXF1ZXN0Q2FsbCh0aGlzW3RhcmdldFByb3BdLCBwcm9wLCBhcmd1bWVudHMpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHByb3h5TWV0aG9kcyhQcm94eUNsYXNzLCB0YXJnZXRQcm9wLCBDb25zdHJ1Y3RvciwgcHJvcGVydGllcykge1xuICAgIHByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbihwcm9wKSB7XG4gICAgICBpZiAoIShwcm9wIGluIENvbnN0cnVjdG9yLnByb3RvdHlwZSkpIHJldHVybjtcbiAgICAgIFByb3h5Q2xhc3MucHJvdG90eXBlW3Byb3BdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzW3RhcmdldFByb3BdW3Byb3BdLmFwcGx5KHRoaXNbdGFyZ2V0UHJvcF0sIGFyZ3VtZW50cyk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gcHJveHlDdXJzb3JSZXF1ZXN0TWV0aG9kcyhQcm94eUNsYXNzLCB0YXJnZXRQcm9wLCBDb25zdHJ1Y3RvciwgcHJvcGVydGllcykge1xuICAgIHByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbihwcm9wKSB7XG4gICAgICBpZiAoIShwcm9wIGluIENvbnN0cnVjdG9yLnByb3RvdHlwZSkpIHJldHVybjtcbiAgICAgIFByb3h5Q2xhc3MucHJvdG90eXBlW3Byb3BdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBwcm9taXNpZnlDdXJzb3JSZXF1ZXN0Q2FsbCh0aGlzW3RhcmdldFByb3BdLCBwcm9wLCBhcmd1bWVudHMpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIEluZGV4KGluZGV4KSB7XG4gICAgdGhpcy5faW5kZXggPSBpbmRleDtcbiAgfVxuXG4gIHByb3h5UHJvcGVydGllcyhJbmRleCwgJ19pbmRleCcsIFtcbiAgICAnbmFtZScsXG4gICAgJ2tleVBhdGgnLFxuICAgICdtdWx0aUVudHJ5JyxcbiAgICAndW5pcXVlJ1xuICBdKTtcblxuICBwcm94eVJlcXVlc3RNZXRob2RzKEluZGV4LCAnX2luZGV4JywgSURCSW5kZXgsIFtcbiAgICAnZ2V0JyxcbiAgICAnZ2V0S2V5JyxcbiAgICAnZ2V0QWxsJyxcbiAgICAnZ2V0QWxsS2V5cycsXG4gICAgJ2NvdW50J1xuICBdKTtcblxuICBwcm94eUN1cnNvclJlcXVlc3RNZXRob2RzKEluZGV4LCAnX2luZGV4JywgSURCSW5kZXgsIFtcbiAgICAnb3BlbkN1cnNvcicsXG4gICAgJ29wZW5LZXlDdXJzb3InXG4gIF0pO1xuXG4gIGZ1bmN0aW9uIEN1cnNvcihjdXJzb3IsIHJlcXVlc3QpIHtcbiAgICB0aGlzLl9jdXJzb3IgPSBjdXJzb3I7XG4gICAgdGhpcy5fcmVxdWVzdCA9IHJlcXVlc3Q7XG4gIH1cblxuICBwcm94eVByb3BlcnRpZXMoQ3Vyc29yLCAnX2N1cnNvcicsIFtcbiAgICAnZGlyZWN0aW9uJyxcbiAgICAna2V5JyxcbiAgICAncHJpbWFyeUtleScsXG4gICAgJ3ZhbHVlJ1xuICBdKTtcblxuICBwcm94eVJlcXVlc3RNZXRob2RzKEN1cnNvciwgJ19jdXJzb3InLCBJREJDdXJzb3IsIFtcbiAgICAndXBkYXRlJyxcbiAgICAnZGVsZXRlJ1xuICBdKTtcblxuICAvLyBwcm94eSAnbmV4dCcgbWV0aG9kc1xuICBbJ2FkdmFuY2UnLCAnY29udGludWUnLCAnY29udGludWVQcmltYXJ5S2V5J10uZm9yRWFjaChmdW5jdGlvbihtZXRob2ROYW1lKSB7XG4gICAgaWYgKCEobWV0aG9kTmFtZSBpbiBJREJDdXJzb3IucHJvdG90eXBlKSkgcmV0dXJuO1xuICAgIEN1cnNvci5wcm90b3R5cGVbbWV0aG9kTmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjdXJzb3IgPSB0aGlzO1xuICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgY3Vyc29yLl9jdXJzb3JbbWV0aG9kTmFtZV0uYXBwbHkoY3Vyc29yLl9jdXJzb3IsIGFyZ3MpO1xuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5UmVxdWVzdChjdXJzb3IuX3JlcXVlc3QpLnRoZW4oZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICBpZiAoIXZhbHVlKSByZXR1cm47XG4gICAgICAgICAgcmV0dXJuIG5ldyBDdXJzb3IodmFsdWUsIGN1cnNvci5fcmVxdWVzdCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gT2JqZWN0U3RvcmUoc3RvcmUpIHtcbiAgICB0aGlzLl9zdG9yZSA9IHN0b3JlO1xuICB9XG5cbiAgT2JqZWN0U3RvcmUucHJvdG90eXBlLmNyZWF0ZUluZGV4ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBJbmRleCh0aGlzLl9zdG9yZS5jcmVhdGVJbmRleC5hcHBseSh0aGlzLl9zdG9yZSwgYXJndW1lbnRzKSk7XG4gIH07XG5cbiAgT2JqZWN0U3RvcmUucHJvdG90eXBlLmluZGV4ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBJbmRleCh0aGlzLl9zdG9yZS5pbmRleC5hcHBseSh0aGlzLl9zdG9yZSwgYXJndW1lbnRzKSk7XG4gIH07XG5cbiAgcHJveHlQcm9wZXJ0aWVzKE9iamVjdFN0b3JlLCAnX3N0b3JlJywgW1xuICAgICduYW1lJyxcbiAgICAna2V5UGF0aCcsXG4gICAgJ2luZGV4TmFtZXMnLFxuICAgICdhdXRvSW5jcmVtZW50J1xuICBdKTtcblxuICBwcm94eVJlcXVlc3RNZXRob2RzKE9iamVjdFN0b3JlLCAnX3N0b3JlJywgSURCT2JqZWN0U3RvcmUsIFtcbiAgICAncHV0JyxcbiAgICAnYWRkJyxcbiAgICAnZGVsZXRlJyxcbiAgICAnY2xlYXInLFxuICAgICdnZXQnLFxuICAgICdnZXRBbGwnLFxuICAgICdnZXRBbGxLZXlzJyxcbiAgICAnY291bnQnXG4gIF0pO1xuXG4gIHByb3h5Q3Vyc29yUmVxdWVzdE1ldGhvZHMoT2JqZWN0U3RvcmUsICdfc3RvcmUnLCBJREJPYmplY3RTdG9yZSwgW1xuICAgICdvcGVuQ3Vyc29yJyxcbiAgICAnb3BlbktleUN1cnNvcidcbiAgXSk7XG5cbiAgcHJveHlNZXRob2RzKE9iamVjdFN0b3JlLCAnX3N0b3JlJywgSURCT2JqZWN0U3RvcmUsIFtcbiAgICAnZGVsZXRlSW5kZXgnXG4gIF0pO1xuXG4gIGZ1bmN0aW9uIFRyYW5zYWN0aW9uKGlkYlRyYW5zYWN0aW9uKSB7XG4gICAgdGhpcy5fdHggPSBpZGJUcmFuc2FjdGlvbjtcbiAgICB0aGlzLmNvbXBsZXRlID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBpZGJUcmFuc2FjdGlvbi5vbmNvbXBsZXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH07XG4gICAgICBpZGJUcmFuc2FjdGlvbi5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChpZGJUcmFuc2FjdGlvbi5lcnJvcik7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgVHJhbnNhY3Rpb24ucHJvdG90eXBlLm9iamVjdFN0b3JlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBPYmplY3RTdG9yZSh0aGlzLl90eC5vYmplY3RTdG9yZS5hcHBseSh0aGlzLl90eCwgYXJndW1lbnRzKSk7XG4gIH07XG5cbiAgcHJveHlQcm9wZXJ0aWVzKFRyYW5zYWN0aW9uLCAnX3R4JywgW1xuICAgICdvYmplY3RTdG9yZU5hbWVzJyxcbiAgICAnbW9kZSdcbiAgXSk7XG5cbiAgcHJveHlNZXRob2RzKFRyYW5zYWN0aW9uLCAnX3R4JywgSURCVHJhbnNhY3Rpb24sIFtcbiAgICAnYWJvcnQnXG4gIF0pO1xuXG4gIGZ1bmN0aW9uIFVwZ3JhZGVEQihkYiwgb2xkVmVyc2lvbiwgdHJhbnNhY3Rpb24pIHtcbiAgICB0aGlzLl9kYiA9IGRiO1xuICAgIHRoaXMub2xkVmVyc2lvbiA9IG9sZFZlcnNpb247XG4gICAgdGhpcy50cmFuc2FjdGlvbiA9IG5ldyBUcmFuc2FjdGlvbih0cmFuc2FjdGlvbik7XG4gIH1cblxuICBVcGdyYWRlREIucHJvdG90eXBlLmNyZWF0ZU9iamVjdFN0b3JlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBPYmplY3RTdG9yZSh0aGlzLl9kYi5jcmVhdGVPYmplY3RTdG9yZS5hcHBseSh0aGlzLl9kYiwgYXJndW1lbnRzKSk7XG4gIH07XG5cbiAgcHJveHlQcm9wZXJ0aWVzKFVwZ3JhZGVEQiwgJ19kYicsIFtcbiAgICAnbmFtZScsXG4gICAgJ3ZlcnNpb24nLFxuICAgICdvYmplY3RTdG9yZU5hbWVzJ1xuICBdKTtcblxuICBwcm94eU1ldGhvZHMoVXBncmFkZURCLCAnX2RiJywgSURCRGF0YWJhc2UsIFtcbiAgICAnZGVsZXRlT2JqZWN0U3RvcmUnLFxuICAgICdjbG9zZSdcbiAgXSk7XG5cbiAgZnVuY3Rpb24gREIoZGIpIHtcbiAgICB0aGlzLl9kYiA9IGRiO1xuICB9XG5cbiAgREIucHJvdG90eXBlLnRyYW5zYWN0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBUcmFuc2FjdGlvbih0aGlzLl9kYi50cmFuc2FjdGlvbi5hcHBseSh0aGlzLl9kYiwgYXJndW1lbnRzKSk7XG4gIH07XG5cbiAgcHJveHlQcm9wZXJ0aWVzKERCLCAnX2RiJywgW1xuICAgICduYW1lJyxcbiAgICAndmVyc2lvbicsXG4gICAgJ29iamVjdFN0b3JlTmFtZXMnXG4gIF0pO1xuXG4gIHByb3h5TWV0aG9kcyhEQiwgJ19kYicsIElEQkRhdGFiYXNlLCBbXG4gICAgJ2Nsb3NlJ1xuICBdKTtcblxuICAvLyBBZGQgY3Vyc29yIGl0ZXJhdG9yc1xuICAvLyBUT0RPOiByZW1vdmUgdGhpcyBvbmNlIGJyb3dzZXJzIGRvIHRoZSByaWdodCB0aGluZyB3aXRoIHByb21pc2VzXG4gIFsnb3BlbkN1cnNvcicsICdvcGVuS2V5Q3Vyc29yJ10uZm9yRWFjaChmdW5jdGlvbihmdW5jTmFtZSkge1xuICAgIFtPYmplY3RTdG9yZSwgSW5kZXhdLmZvckVhY2goZnVuY3Rpb24oQ29uc3RydWN0b3IpIHtcbiAgICAgIENvbnN0cnVjdG9yLnByb3RvdHlwZVtmdW5jTmFtZS5yZXBsYWNlKCdvcGVuJywgJ2l0ZXJhdGUnKV0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSB0b0FycmF5KGFyZ3VtZW50cyk7XG4gICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3NbYXJncy5sZW5ndGggLSAxXTtcbiAgICAgICAgdmFyIG5hdGl2ZU9iamVjdCA9IHRoaXMuX3N0b3JlIHx8IHRoaXMuX2luZGV4O1xuICAgICAgICB2YXIgcmVxdWVzdCA9IG5hdGl2ZU9iamVjdFtmdW5jTmFtZV0uYXBwbHkobmF0aXZlT2JqZWN0LCBhcmdzLnNsaWNlKDAsIC0xKSk7XG4gICAgICAgIHJlcXVlc3Qub25zdWNjZXNzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgY2FsbGJhY2socmVxdWVzdC5yZXN1bHQpO1xuICAgICAgICB9O1xuICAgICAgfTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgLy8gcG9seWZpbGwgZ2V0QWxsXG4gIFtJbmRleCwgT2JqZWN0U3RvcmVdLmZvckVhY2goZnVuY3Rpb24oQ29uc3RydWN0b3IpIHtcbiAgICBpZiAoQ29uc3RydWN0b3IucHJvdG90eXBlLmdldEFsbCkgcmV0dXJuO1xuICAgIENvbnN0cnVjdG9yLnByb3RvdHlwZS5nZXRBbGwgPSBmdW5jdGlvbihxdWVyeSwgY291bnQpIHtcbiAgICAgIHZhciBpbnN0YW5jZSA9IHRoaXM7XG4gICAgICB2YXIgaXRlbXMgPSBbXTtcblxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcbiAgICAgICAgaW5zdGFuY2UuaXRlcmF0ZUN1cnNvcihxdWVyeSwgZnVuY3Rpb24oY3Vyc29yKSB7XG4gICAgICAgICAgaWYgKCFjdXJzb3IpIHtcbiAgICAgICAgICAgIHJlc29sdmUoaXRlbXMpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpdGVtcy5wdXNoKGN1cnNvci52YWx1ZSk7XG5cbiAgICAgICAgICBpZiAoY291bnQgIT09IHVuZGVmaW5lZCAmJiBpdGVtcy5sZW5ndGggPT0gY291bnQpIHtcbiAgICAgICAgICAgIHJlc29sdmUoaXRlbXMpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjdXJzb3IuY29udGludWUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9KTtcblxuICB2YXIgZXhwID0ge1xuICAgIG9wZW46IGZ1bmN0aW9uKG5hbWUsIHZlcnNpb24sIHVwZ3JhZGVDYWxsYmFjaykge1xuICAgICAgdmFyIHAgPSBwcm9taXNpZnlSZXF1ZXN0Q2FsbChpbmRleGVkREIsICdvcGVuJywgW25hbWUsIHZlcnNpb25dKTtcbiAgICAgIHZhciByZXF1ZXN0ID0gcC5yZXF1ZXN0O1xuXG4gICAgICByZXF1ZXN0Lm9udXBncmFkZW5lZWRlZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGlmICh1cGdyYWRlQ2FsbGJhY2spIHtcbiAgICAgICAgICB1cGdyYWRlQ2FsbGJhY2sobmV3IFVwZ3JhZGVEQihyZXF1ZXN0LnJlc3VsdCwgZXZlbnQub2xkVmVyc2lvbiwgcmVxdWVzdC50cmFuc2FjdGlvbikpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gcC50aGVuKGZ1bmN0aW9uKGRiKSB7XG4gICAgICAgIHJldHVybiBuZXcgREIoZGIpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBkZWxldGU6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHJldHVybiBwcm9taXNpZnlSZXF1ZXN0Q2FsbChpbmRleGVkREIsICdkZWxldGVEYXRhYmFzZScsIFtuYW1lXSk7XG4gICAgfVxuICB9O1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZXhwO1xuICB9XG4gIGVsc2Uge1xuICAgIHNlbGYuaWRiID0gZXhwO1xuICB9XG59KCkpO1xuIiwiaW1wb3J0IGlkYiBmcm9tICdpZGInO1xyXG5cclxuLy8gbW9yZSBvbiB1c2FnZSBvZiB0aGlzIEFQSSBoZXJlIDogaHR0cHM6Ly9naXRodWIuY29tL2pha2VhcmNoaWJhbGQvaWRiXHJcbi8vIGdvZXMgYXMgZm9sbG93cyBpZGIub3BlbihuYW1lLCB2ZXJzaW9uLCB1cGdyYWRlQ2FsbGJhY2spXHJcbi8vIEV4YW1wbGU6IFxyXG4vLyBUaGlzIHJldHVybnMgYSBwcm9taXNlLCBsZXQncyBzdG9yZSB0aGF0IGZvciBsYXRlciB3aXRoIGEgdmFyXHJcblxyXG52YXIgZGJQcm9taXNlID0gaWRiLm9wZW4oJ3Rlc3QtZGInLCAzLCBcclxuICAvLyB0aGlzIGRlZmluZXMgdGhlIGRhdGFiYXNlXHJcbiAgZnVuY3Rpb24odXBncmFkZURiKXtcclxuICAgIFxyXG4gICAgLy8gdGhpcyBjcmVhdGVzIGEgc3dpdGNoIHRvIHVwZGF0ZSB0aGUgYnJvd3NlciB3aXRoIHRoZSBuZXcgdmVyc2lvbiBvZiB0aGUgaW5kZXhEQiwgdG8gdGhlIG5ldyBvbmVcclxuICAgIHN3aXRjaCh1cGdyYWRlRGIub2xkVmVyc2lvbil7XHJcblxyXG4gICAgIC8vIGNhc2UgMCBpcyBjYWxsZWQgaWYgdGhlIGJyb3dzZXIgZG9lcyBub3QgaGF2ZSB0aGUgZmlyc3QgdmVyc2lvbiBpbnN0YWxsZWQsIHRoZW4gaXQgaW5zdGFsbHMgaXQgaWYgaXQgZG9lcyBub3QgXHJcbiAgICAgIGNhc2UgMDpcclxuICAgICAgLy8gdGhpcyBzdG9yZSBoYXMgYSBrZXkgdGhhdCdzIHNlcGFyYXRlIHRvIHRoZSBkYXRhLCB3aGljaCBpcyB3aGF0IHdlIHdhbnQgdG8gc3RvcmUgaW4ga2V5dmFsU3RvcmVcclxuICAgICAgdmFyIGtleVZhbFN0b3JlID0gdXBncmFkZURiLmNyZWF0ZU9iamVjdFN0b3JlKCdrZXl2YWwnKTtcclxuXHJcbiAgICAgIC8vb2JqZWN0U3RvcmUgZG9jdW1lbnRhdGlvbiBoZXJlOiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvSURCT2JqZWN0U3RvcmVcclxuICAgICAgLy8gYWNjZXB0cyB0aGUgdmFsdWVzIG9mIG9iamVjdFN0b3JlKG5hbWUsIG9wdGlvbmFsS2V5KVxyXG4gICAgICBrZXlWYWxTdG9yZS5wdXQoXHJcbiAgICAgICAgLy8gdGhpcyBpcyB0aGUgb2JqZWN0IG5hbWU6XHJcbiAgICAgICAgJ3dvcmxkJywgXHJcbiAgICAgICAgLy8gYW5kIHRoaXMgaXMgdGhlIG9wdGlvbmFsIGtleVxyXG4gICAgICAgICdoZWxsbycpO1xyXG5cclxuICAgIC8vIGFmdGVyIGNhc2UgMSBpcyBjYWxsZWQsIHRoaXMgc3RvcmVzICB0aGUgbmV3IG9iamVjdFN0b3JlIGFmdGVyIHRoZSBmaXJzdCBjYXNlIGhhc2UgYmVlbiBjcmVhdGVyLCBvciBpZiBhbHJlYWR5IGNyZWF0ZWRcclxuICAgIC8vIGl0IGluc3RhbGxzIGNhc2UgMSBhZnRlciBjb25maXJtaW5nIGNhc2UgMCBpcyBjcmVhdGVkXHJcbiAgICBjYXNlIDE6XHJcbiAgICBcclxuICAgICAgLy8gb2JqZWN0IHN0b3JlcyBjYW4gb25seSBiZSBjYWxsZWQgd2l0aGluIHRoZSB1cGdyYWRlRGIgZnVuY3Rpb24gbm93aGVyZSBlbHNlLlxyXG4gICAgICAvLyBiZWxvdyBpcyB0aGUgY29kZSAgdG8gY3JlYXRlIGEgbmV3IG9iamVjdCBzdG9yZSBmb3IgdGhlICdwZW9wbGUnIG9iamVjdFxyXG4gICAgICAvLyBUaGlzIHNldHMgdGhlIG9iamVjdCdzICduYW1lJyBhcyB0aGUga2V5LCB3aGljaCBpcyBzdG9yZWQgYnkgbmFtZSByYXRoZXIgdGhhbiBieSBrZXlcclxuICAgICAgLy8gd2hlbiBhZGRpbmcgbmV3IG9iamVjdCBzdG9yZXMsIHRoZSB2ZXJzaW9uIG5lZWRzIHRvIGJlIGNoYW5nZWRcclxuICAgICAgdXBncmFkZURiLmNyZWF0ZU9iamVjdFN0b3JlKCdwZW9wbGUnLCB7a2V5UGF0aDogJ25hbWUnfSk7XHJcblxyXG4gICAgLy8gdXBncmFkaW5nIHRvIGEgbmV3IHZlcnNpb24sIHRvIGZpbHRlciBvdXQgREIgcmVzdWx0cywgYnkgZmF2b3JpdGUgYW5pbWFsLlxyXG4gICAgLy8gTXVzdCBjcmVhdGUgYSBuZXcgY2FzZSwgY3JlYXRlZCBiZWxvd1xyXG4gICAgY2FzZSAyOlxyXG4gICAgICB2YXIgcGVvcGxlU3RvcmUgPSB1cGdyYWRlRGIudHJhbnNhY3Rpb24ub2JqZWN0U3RvcmUoJ3Blb3BsZScpO1xyXG5cclxuICAgICAgLy8gdGhpcyBjcmVhdGVzIGFuIGluZGV4LCB3aGljaCBzb3J0cyB0aGUgJ3ZhZm9yaXRlYW5pbWFsJyBwcm9wZXJ0eVxyXG4gICAgICBwZW9wbGVTdG9yZS5jcmVhdGVJbmRleCgnYW5pbWFsJywgJ2Zhdm9yaXRlQW5pbWFsJyk7XHJcblxyXG4gICAgICAvLyB0aGUgY29kZSB0byBsaXN0IGFsbCB0aGUgcGVvcGxlIHdpbGwgYmUgbW9kaWZpZWQgdG8gc29ydCByZXN1bHRzIGJ5IGZhdm9yaXRlQW5pbWFsIGJlbG93XHJcbiAgICB9XHJcblxyXG59KTtcclxuXHJcbi8vIHRoaXMgY2FsbHMgb3VyIGRhdGFiYXNlLCBhbmQgcmVhZHMgZnJvbSBpdCwgYWZ0ZXIgdGhlIHByb21pc2UgaGFzIGJlZW4gZnVsZmlsbGVkIChkYlByb21pc2UpXHJcbmRiUHJvbWlzZS50aGVuKGZ1bmN0aW9uKGRiKXtcclxuXHJcbiAgLy8gdGhpcyBpcyB0aGUgZnVuY3Rpb24gdG8gcmVhZCBmcm9tIHRoZSBkYXRhYmFzZSB3aGljaCBhY2NlcHRzIHRoZSBvYmplY3RTdG9yZSB3aGljaCB3YXMgY3JlYXRlZCBhYm92ZSwgaW4gdGhpcyBjYXNlIGtleXZhbFxyXG4gIC8vIHRoaXMgZnVuY3Rpb24gc2VsZWN0cyB0aGUgJ2tleXZhbCcgb2JqZWN0IHN0b3JlLCByZWFkeSB0byB1c2UsIHdpdGggYW4gb3B0aW9uYWwgJ2RvIHNvbWV0aGluZycgYXJndW1lbnRcclxuICB2YXIgdHJhbnNhY3Rpb24gPSBkYi50cmFuc2FjdGlvbigna2V5dmFsJyk7XHJcblxyXG4gIC8vIHRoaXMgY2FsbHMgdGhlIG9iamVjdCBzdG9yZSAoREIpIHdlIHdhbnQgdG8gZGlzcGxheVxyXG4gIHZhciBrZXlWYWxEQiA9IHRyYW5zYWN0aW9uLm9iamVjdFN0b3JlKCdrZXl2YWwnKTtcclxuXHJcbiAgLy8gdGhpcyByZXR1cm5zIGEga2V5IHdpdGhpbiB0aGUga2V5dmFsIG9iamVjdCwgaW4gdGhpZSBjYXNlIHRoZSAnaGVsbG8nIGNyZWF0ZWQgYWJvdmVcclxuICAvLyB0aGlzIHJldHVybnMgYSBwcm9taXNlXHJcbiAgcmV0dXJuIGtleVZhbERCLmdldCgnaGVsbG8nKTtcclxuXHJcbiAgLy8gd2l0aGluIHRoZSBwcm9taXNlLCB3ZSBncmFiIHRoZSB2YWx1ZSBvZiBoZWxsbywgd2hpY2ggaW4gdGhpcyBjYXNlIGlzIHdvcmxkLlxyXG4gIC8vIHRoZSB2YWx1ZSBvZiB0aGlzIGtleSBzdG9yZSBpcyB0aGUgZnVuY3Rpb24gYXJndW1lbnRcclxufSkudGhlbihmdW5jdGlvbih2YWwpe1xyXG4gIGNvbnNvbGUubG9nKCdUaGUgdmFsdWUgb2YgXCJoZWxsb1wiIGlzOicsIHZhbCk7XHJcbn0pO1xyXG5cclxuLy8gdGhlIGZvbGxvd2luZyBpcyB1c2VkIHRvIGFkZCB2YWx1ZXMgdG8gZXhzaXN0aW5nIG9iamVjdCBzdG9yZXNcclxuZGJQcm9taXNlLnRoZW4oZnVuY3Rpb24oZGIpe1xyXG4gIC8vIG9uY2UgYWdhaW4gZ3JhYnMgb3VyIERCLCBidXQgdGhpcyB0aW1lLCAncmVhZHdyaXRlJyBpcyBhZGRlZCB0byB0aGUgb3B0aW9uYWwgdmFsdWV0byB3cml0ZSBzb21ldGhpbmdcclxuICB2YXIgdHJhbnNhY3Rpb24gPSBkYi50cmFuc2FjdGlvbigna2V5dmFsJywgJ3JlYWR3cml0ZScpO1xyXG5cclxuICAvLyB0aGlzIG9uY2UgYWdhaW4gY2FsbHMgb3VyIGRiIGFmdGVyIGl0cyBiZWVuIHJlZ2lzdGVyZWRcclxuICB2YXIga2V5VmFsV3JpdGUgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZSgna2V5dmFsJyk7XHJcblxyXG4gIC8vIHRoaXMgc3RvcmVzIG5ldyB2YWx1ZXMgaW50byB1ciBEQiwgd2l0aCB0aGUgdmFsdWUgYmVpbmcgdGhlIGZpcnN0IGFyZ3VtZW50IGFuZCB0aGUga2V5IGJlaW5nIHRoZSBzZWNvbmQgYXJndW1lbnRcclxuICBrZXlWYWxXcml0ZS5wdXQoJ2JhcicsICdmb28nKTtcclxuXHJcbiAgLy8gdGhpcyByZXR1cm5zIGEgcHJvbWlzZSwgdGhhdCBvbmx5IHJldHVybnMgaWYgYW5kIHdoZW4gdGhlIHRyYW5zYWN0aW9uIGNvbXBsZXRlcywgYW5kIHJlamVjdHMgaWYgaXQgZmFpbHNcclxuICByZXR1cm4gdHJhbnNhY3Rpb24uY29tcGxldGU7XHJcbn0pLnRoZW4oZnVuY3Rpb24oKXtcclxuICBjb25zb2xlLmxvZygnQWRkZWQgZm9vOmJhciB0byBrZXl2YWwnKTtcclxufSk7XHJcblxyXG4vLyB0aGUgZm9sbG93aW5nIGlzIHVzZWQgdG8gYWRkIHZhbHVlcyB0byBleHNpc3Rpbmcgb2JqZWN0IHN0b3Jlc1xyXG5kYlByb21pc2UudGhlbihmdW5jdGlvbihkYil7XHJcbiAgLy8gb25jZSBhZ2FpbiBncmFicyBvdXIgREIsIGJ1dCB0aGlzIHRpbWUsICdyZWFkd3JpdGUnIGlzIGFkZGVkIHRvIHRoZSBvcHRpb25hbCB2YWx1ZXRvIHdyaXRlIHNvbWV0aGluZ1xyXG4gIHZhciB0cmFuc2FjdGlvbiA9IGRiLnRyYW5zYWN0aW9uKCdrZXl2YWwnLCAncmVhZHdyaXRlJyk7XHJcblxyXG4gIC8vIHRoaXMgb25jZSBhZ2FpbiBjYWxscyBvdXIgZGIgYWZ0ZXIgaXRzIGJlZW4gcmVnaXN0ZXJlZFxyXG4gIHZhciBrZXlWYWxXcml0ZSA9IHRyYW5zYWN0aW9uLm9iamVjdFN0b3JlKCdrZXl2YWwnKTtcclxuXHJcbiAgLy8gdGhpcyBzdG9yZXMgbmV3IHZhbHVlcyBpbnRvIHVyIERCLCB3aXRoIHRoZSB2YWx1ZSBiZWluZyB0aGUgZmlyc3QgYXJndW1lbnQgYW5kIHRoZSBrZXkgYmVpbmcgdGhlIHNlY29uZCBhcmd1bWVudFxyXG4gIGtleVZhbFdyaXRlLnB1dCgnZG9nJywgJ2Zhdm9yaXRlQW5pbWFsJyk7XHJcblxyXG4gIC8vIHRoaXMgcmV0dXJucyBhIHByb21pc2UsIHRoYXQgb25seSByZXR1cm5zIGlmIGFuZCB3aGVuIHRoZSB0cmFuc2FjdGlvbiBjb21wbGV0ZXMsIGFuZCByZWplY3RzIGlmIGl0IGZhaWxzXHJcbiAgcmV0dXJuIHRyYW5zYWN0aW9uLmNvbXBsZXRlO1xyXG59KS50aGVuKGZ1bmN0aW9uKCl7XHJcbiAgY29uc29sZS5sb2coJ0FkZGVkIGZhdm9yaXRlQW5pbWFsIGtleSA6IGRvZycpO1xyXG59KTtcclxuXHJcbi8vIHRoZSBmb2xsb3dpbmcgY3JlYXRlcyB0aGUgdmFsdWVzIHRvIHRoZSBwZW9wbGUgT2JqZWN0IHN0b3JlOlxyXG5kYlByb21pc2UudGhlbihmdW5jdGlvbihkYil7XHJcbiAgLy8gb25jZSBhZ2FpbiBncmFicyBvdXIgREIsIGJ1dCB0aGlzIHRpbWUsICdyZWFkd3JpdGUnIGlzIGFkZGVkIHRvIHRoZSBvcHRpb25hbCB2YWx1ZXRvIHdyaXRlIHNvbWV0aGluZ1xyXG4gIHZhciB0cmFuc2FjdGlvbiA9IGRiLnRyYW5zYWN0aW9uKCdwZW9wbGUnLCAncmVhZHdyaXRlJyk7XHJcblxyXG4gIC8vIHRoaXMgb25jZSBhZ2FpbiBjYWxscyBvdXIgZGIgYWZ0ZXIgaXRzIGJlZW4gcmVnaXN0ZXJlZFxyXG4gIHZhciBwZW9wbGVTdG9yZSA9IHRyYW5zYWN0aW9uLm9iamVjdFN0b3JlKCdwZW9wbGUnKTtcclxuXHJcbiAgLy8gdGhpcyBzdG9yZXMgbmV3IHZhbHVlcyBpbnRvIHVyIERCLCBjcmVhdGluZyBhbiBvYmplY3Qgd2l0aCB3aGF0ZXZlciB2YWx1ZXMgSSBzZXQgd2l0aGluIHRoZSB0cmFuc2FjdGlvbi5wdXQgYXJndW1lbnRzLlxyXG4gIC8vIFRoZXJlIGlzIG5vIGtleSBuZWNlc3NhcnkgaGVyZSwgc2luY2Ugd2UgaGF2ZSB0b2xkIHRoaXMgc3BlY2lmaWMgc3RvcmUgdG8gYWRkIHRoZSBuYW1lIHByb3BlcnR5IGFzIHRoZSBrZXkgZm9yIHRoaXMgREJcclxuICAvLyBFeGFtcGxlIGhlcmU6IFxyXG4gIHBlb3BsZVN0b3JlLnB1dCh7XHJcbiAgICBuYW1lOidTYW0gTXVub3onLFxyXG4gICAgYWdlOiAyNSxcclxuICAgIGZhdm9yaXRlQW5pbWFsOiAnZG9nJ1xyXG4gIH0pO1xyXG5cclxuICAvLyBoZXJlIGFyZSBtb3JlIHRvIHBlb3BsZSB0byBhZGQgdG8gdGhpcyBEQiBvYmplY3RTdG9yZTpcclxuICBwZW9wbGVTdG9yZS5wdXQoe1xyXG4gICAgbmFtZTonSGVybWlvbmUgR3JhbmdlcicsXHJcbiAgICBhZ2U6IDE4LFxyXG4gICAgZmF2b3JpdGVBbmltYWw6ICdjYXQnXHJcbiAgfSk7ICBcclxuXHJcbiAgcGVvcGxlU3RvcmUucHV0KHtcclxuICAgIG5hbWU6J0hhcnJ5IFBvdHRlcicsXHJcbiAgICBhZ2U6IDE5LFxyXG4gICAgZmF2b3JpdGVBbmltYWw6ICdvd2wnXHJcbiAgfSk7ICBcclxuXHJcbiAgcGVvcGxlU3RvcmUucHV0KHtcclxuICAgIG5hbWU6J1JvbmFsZCBXZXNsZXknLFxyXG4gICAgYWdlOiAxOSxcclxuICAgIGZhdm9yaXRlQW5pbWFsOiAncmF0J1xyXG4gIH0pOyBcclxuXHJcbiAgLy8gdGhpcyByZXR1cm5zIGEgcHJvbWlzZSwgdGhhdCBvbmx5IHJldHVybnMgaWYgYW5kIHdoZW4gdGhlIHRyYW5zYWN0aW9uIGNvbXBsZXRlcywgYW5kIHJlamVjdHMgaWYgaXQgZmFpbHNcclxuICByZXR1cm4gdHJhbnNhY3Rpb24uY29tcGxldGU7XHJcbn0pLnRoZW4oZnVuY3Rpb24oKXtcclxuICBjb25zb2xlLmxvZygnUGVvcGxlIGFkZGVkJyk7XHJcbn0pO1xyXG5cclxuLy8gdGhlIGZvbGxvd2luZyByZWFkcyB0aGUgdmFsdWVzIG9mIHRoZSBwZW9wbGUgb2JqZWN0U3RvcmVcclxuLy8gdGhpcyBjYWxscyBvdXIgZGF0YWJhc2UsIGFuZCByZWFkcyBmcm9tIGl0LCBhZnRlciB0aGUgcHJvbWlzZSBoYXMgYmVlbiBmdWxmaWxsZWQgKGRiUHJvbWlzZSlcclxuZGJQcm9taXNlLnRoZW4oZnVuY3Rpb24oZGIpe1xyXG5cclxuICAvLyB0aGlzIGlzIHRoZSBmdW5jdGlvbiB0byByZWFkIGZyb20gdGhlIGRhdGFiYXNlIHdoaWNoIGFjY2VwdHMgdGhlIG9iamVjdFN0b3JlIHdoaWNoIHdhcyBjcmVhdGVkIGFib3ZlLCBpbiB0aGlzIGNhc2Uga2V5dmFsXHJcbiAgLy8gdGhpcyBmdW5jdGlvbiBzZWxlY3RzIHRoZSAna2V5dmFsJyBvYmplY3Qgc3RvcmUsIHJlYWR5IHRvIHVzZSwgd2l0aCBhbiBvcHRpb25hbCAnZG8gc29tZXRoaW5nJyBhcmd1bWVudFxyXG4gIHZhciB0cmFuc2FjdGlvbiA9IGRiLnRyYW5zYWN0aW9uKCdwZW9wbGUnKTtcclxuXHJcbiAgLy8gdGhpcyBjYWxscyB0aGUgb2JqZWN0IHN0b3JlIChEQikgd2Ugd2FudCB0byBkaXNwbGF5XHJcbiAgdmFyIHBlb3BsZVJlYWQgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZSgncGVvcGxlJyk7XHJcblxyXG4gIC8vIHRoaXMgY2FsbHMgdGhlIGluZGV4IHdlIGNyZWF0ZWQgZm9yIGNhc2UgMiBvZiB0aGlzIERCXHJcbiAgdmFyIGFuaW1hbEluZGV4ID0gcGVvcGxlUmVhZC5pbmRleCgnYW5pbWFsJyk7XHJcblxyXG4gIC8vIHRoaXMgcmV0dXJucyBhbGwga2V5cyBhbmQgdmFsdWVzIHdpdGhpbiB0aGUgcGVvcGxlIG9iamVjdFNUb3JlXHJcbiAgLy8gcmV0dXJuIHBlb3BsZVJlYWQuZ2V0QWxsKCk7XHJcblxyXG4gIC8vIHRoaXMgcmV0dXJucyB0aGUga2V5IHZhbHVlcyBzb3J0aW5nIHRoZW0gYnkgdGhlIGluZGV4IHdlIGNyZWF0ZWQgZm9yIGFuaW1hbHNcclxuICAvLyByZXR1cm4gYW5pbWFsSW5kZXguZ2V0QWxsKCk7XHJcblxyXG4gIC8vIHRoaXMgcmV0dXJucyB0aGUga2V5IHZhbHVlcyBvZiB0aGlzIG9iamVjdFN0b3JlIHRoYXQgY29udGFpbiB0aGUgZ2V0QWxsIGFyZ3VtZW50IHZhbHVlLlxyXG4gIC8vIEV4YW1wbGU6XHJcbiAgcmV0dXJuIGFuaW1hbEluZGV4LmdldEFsbCgnY2F0JylcclxuXHJcbiAgLy8gb25jZSBmdWxmaWxsZWQsIHRoaXMgbG9ncyB0aGUgdmFsdWVzIG9mIHRoZSBwZW9wbGUgc3RvcmVcclxuICAvLyB0aGlzIGdyYWJzIEFMTCB0aGUgdmFsdWVzIG9mIHRoZSBEQiBhbmQgbG9ncyB0aGVtIGluIGFscGhhYmV0aWNhbCBvcmRlclxyXG4gIC8vIFZFUlkgSU1QT1JUQU5UIHRoaXMgaXMgZXhhY3RseSBob3cgdGhlIHZhbHVlcyB3aWxsIGJlIGdyYWJiZWQgZnJvbSB0aGUgdHJhbnNwb3J0YXRpb24gQVBJIGFuZCBwbGFjZWQgd2l0aGluIHRoZSB2aWV3IG9mIHRoZSBhcHBsaWNhdGlvblxyXG4gIC8vIFxyXG59KS50aGVuKGZ1bmN0aW9uKHZhbCl7XHJcbiAgY29uc29sZS5sb2coJ1Blb3BsZTonLCB2YWwpO1xyXG59KTsiXX0=