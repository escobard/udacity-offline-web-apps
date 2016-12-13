import idb from 'idb';

// more on usage of this API here : https://github.com/jakearchibald/idb
// goes as follows idb.open(name, version, upgradeCallback)
// Example: 
// This returns a promise, let's store that for later with a var

var dbPromise = idb.open('test-db', 1, 
  // this defines the database
  function(upgradeDb){
    // this store has a key that's separate to the data, which is what we want to store in keyvalStore
    var keyValStore = upgradeDb.createObjectStore('keyval');

    //objectStore documentation here: https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore
    // accepts the values of objectStore(name, optionalKey)
    keyValStore.put(
      // this is the object name:
      'world', 
      // and this is the optional key
      'hello');
});

// this calls our database, and reads from it, after the promise has been fulfilled (dbPromise)
dbPromise.then(function(db){

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
}).then(function(val){
  console.log('The value of "hello" is:', val);
});

// the following is used to add values to exsisting object stores
dbPromise.then(function(db){
  // once again grabs our DB, but this time, 'readwrite' is added to the optional valueto write something
  var transaction = db.transaction('keyval', 'readwrite');

  // this once again calls our db after its been registered
  var keyValWrite = transaction.objectStore('keyval');

  // this stores new values into ur DB, with the key being the first argument and the value being the second argument
  keyValWrite.put('bar', 'foo');

  // this returns a promise, that only returns if and when the transaction completes, and rejects if it fails
  return transaction.complete;
}).then(function(){
  console.log('Added foo:bar to keyval');
})