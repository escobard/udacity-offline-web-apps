import idb from 'idb';

// more on usage of this API here : https://github.com/jakearchibald/idb
// goes as follows idb.open(name, version, upgradeCallback)
// Example: 
// This returns a promise, let's store that for later with a var

var dbPromise = idb.open('test-db', 2, 
  // this defines the database
  function(upgradeDb){
    
    // this creates a switch to update the browser with the new version of the indexDB, to the new one
    switch(upgradeDb.oldVersion){

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
      upgradeDb.createObjectStore('people', {keyPath: 'name'});
    }

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

  // this stores new values into ur DB, with the value being the first argument and the key being the second argument
  keyValWrite.put('bar', 'foo');

  // this returns a promise, that only returns if and when the transaction completes, and rejects if it fails
  return transaction.complete;
}).then(function(){
  console.log('Added foo:bar to keyval');
});

// the following is used to add values to exsisting object stores
dbPromise.then(function(db){
  // once again grabs our DB, but this time, 'readwrite' is added to the optional valueto write something
  var transaction = db.transaction('keyval', 'readwrite');

  // this once again calls our db after its been registered
  var keyValWrite = transaction.objectStore('keyval');

  // this stores new values into ur DB, with the value being the first argument and the key being the second argument
  keyValWrite.put('dog', 'favoriteAnimal');

  // this returns a promise, that only returns if and when the transaction completes, and rejects if it fails
  return transaction.complete;
}).then(function(){
  console.log('Added favoriteAnimal key : dog');
});

// the following creates the values to the people Object store:
dbPromise.then(function(db){
  // once again grabs our DB, but this time, 'readwrite' is added to the optional valueto write something
  var transaction = db.transaction('people', 'readwrite');

  // this once again calls our db after its been registered
  var peopleStore = transaction.objectStore('people');

  // this stores new values into ur DB, creating an object with whatever values I set within the transaction.put arguments.
  // There is no key necessary here, since we have told this specific store to add the name property as the key for this DB
  // Example here: 
  peopleStore.put({
    name:'Sam Munoz',
    age: 25,
    favoriteAnimal: 'dog'
  });

  // here are more to people to add to this DB objectStore:
  peopleStore.put({
    name:'Hermione Granger',
    age: 18,
    favoriteAnimal: 'cat'
  });  

  peopleStore.put({
    name:'Harry Potter',
    age: 19,
    favoriteAnimal: 'owl'
  });  

  peopleStore.put({
    name:'Ronald Wesley',
    age: 19,
    favoriteAnimal: 'rat'
  }); 

  // this returns a promise, that only returns if and when the transaction completes, and rejects if it fails
  return transaction.complete;
}).then(function(){
  console.log('People added');
});

// the following reads the values of the people objectStore
// this calls our database, and reads from it, after the promise has been fulfilled (dbPromise)
dbPromise.then(function(db){

  // this is the function to read from the database which accepts the objectStore which was created above, in this case keyval
  // this function selects the 'keyval' object store, ready to use, with an optional 'do something' argument
  var transaction = db.transaction('people');

  // this calls the object store (DB) we want to display
  var peopleRead = transaction.objectStore('people');

  // this returns all keys and values within the people objectSTore
  return peopleRead.getAll();

  // once fulfilled, this logs the values of the people store
  // this grabs ALL the values of the DB and logs them in alphabetical order
  // VERY IMPORTANT this is exactly how the values will be grabbed from the transportation API and placed within the view of the application
  // 
}).then(function(val){
  console.log('People:', val);
});