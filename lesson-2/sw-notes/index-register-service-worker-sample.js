import PostsView from './views/Posts';
import ToastsView from './views/Toasts';
import idb from 'idb';

export default function IndexController(container) {
  this._container = container;
  this._postsView = new PostsView(this._container);
  this._toastsView = new ToastsView(this._container);
  this._lostConnectionToast = null;
  this._openSocket();
  this._registerServiceWorker();
}

// registering a service worker, this is how below
IndexController.prototype._registerServiceWorker = function() {
  if (!navigator.serviceWorker) return;

  navigator.serviceWorker.register('/sw.js').then(function(reg) {
    console.log('Registration worked!');
  }).catch(function() {
    console.log('Registration failed!');
  });

  // service worker registration also accepts the following arguments to further modify service workers
  // the dev tools area of service workers is actually just taking the below service worker arguments
  /*
  reg.unregister();
  reg.update();
  
  reg.installing;
  // on reg.installing:
    // set a variable to call the installing method
    var sw = reg.installing;
    
    // function for controlling SW state when there is an update in progress:

      // checks if registration is installing
      if (reg.installing) {

        // if so, adds an event listener to track the registration state change
        reg.installing.addEventListener('statechange', function(){

          // this can have any kind of states attached to register, for example if SW is installed and waiting activation
          if (this.state == 'installed'){
            // there's an update ready, do something here
          }
        })
      }
    // logs the installing state of the service worker
    console.log(sw.state); // can emit the following states:

      // "installing" - SW is installing, but hasn't completed yet
      // "installed" - SW completed succesfully but hasn't yet activated
      // "activating" - the SW activate event has fired but is not yet complete, or activated
      // "activated" - the SW has activated, and ready to receive search events
      // "redundant" - the SW has been thrown away - happens when the SW has been preceded by a newers service worker, or fails to instll
   
   reg.waiting;
  // on reg.waiting - if there is a waiting worker then there is an update ready and waiting, example here:
    // 
    if (reg.waiting){
      // there is an update waiting!
    }
  reg.active;
  
  // when an update is found, the ServiceWorker.register object will add the following event
  reg.addEventListener('updatefound', function(){

    // reg.installing has changed, do something here, for example
    reg.installing.addEventListener('statechange', function(){
      // checks states
      if (this.state ==='state string') {
        // there's an update ready, do something
      }
    })
  })

  // the SW fires an event when it's state changes, which is the following

  sw.addEventListener('statechange', function(){
    // says the SW state has changed - with whatever the value of the property that changes
  })

  // this refers to the service worker that controls the current page 
  navigator.serviceWorker.controller

  // if there is no controller, or in other words if the page did not load using a service worker then the following can be used to control view
  if(!navigator.serviceWorker.controller) {
    // page didn't load using a service worker function
  }
   */
  }
};

// open a connection to the server for live updates
IndexController.prototype._openSocket = function() {
  var indexController = this;
  var latestPostDate = this._postsView.getLatestPostDate();

  // create a url pointing to /updates with the ws protocol
  var socketUrl = new URL('/updates', window.location);
  socketUrl.protocol = 'ws';

  if (latestPostDate) {
    socketUrl.search = 'since=' + latestPostDate.valueOf();
  }

  // this is a little hack for the settings page's tests,
  // it isn't needed for Wittr
  socketUrl.search += '&' + location.search.slice(1);

  var ws = new WebSocket(socketUrl.href);

  // add listeners
  ws.addEventListener('open', function() {
    if (indexController._lostConnectionToast) {
      indexController._lostConnectionToast.hide();
    }
  });

  ws.addEventListener('message', function(event) {
    requestAnimationFrame(function() {
      indexController._onSocketMessage(event.data);
    });
  });

  ws.addEventListener('close', function() {
    // tell the user
    if (!indexController._lostConnectionToast) {
      indexController._lostConnectionToast = indexController._toastsView.show("Unable to connect. Retrying…");
    }

    // try and reconnect in 5 seconds
    setTimeout(function() {
      indexController._openSocket();
    }, 5000);
  });
};

// called when the web socket sends message data
IndexController.prototype._onSocketMessage = function(data) {
  var messages = JSON.parse(data);
  this._postsView.addPosts(messages);
};