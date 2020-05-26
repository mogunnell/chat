var config = {
  apiKey: "AIzaSyAUN_V4ZOnrirCXqo-X6l_qpUpl8F_7Jwk",
  authDomain: "packerchatdb.firebaseapp.com",
  databaseURL: "https://packerchatdb.firebaseio.com",
  projectId: "packerchatdb",
  storageBucket: "packerchatdb.appspot.com",
  messagingSenderId: "937579243126"
  };
firebase.initializeApp(config);
var provider = new firebase.auth.GoogleAuthProvider();
// Get a reference to the database service
var database = firebase.database();
var auth = firebase.auth();
var roomRef;

function login(callbackAuth = function(user) {console.log(user)}, callbackData = function(data) {console.log(data)}, roomName = location.hash.toLowerCase().replace("#","_")) {
  // Initialize Firebase
  if(roomName == "") {
    roomName = "_";
  }
  firebase.auth().onAuthStateChanged(function(user) {
    if (!user) {
      auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(function() {
            auth.signInWithPopup(provider).then(function(result) {
            var user = {};
            user.name = result.user.displayName;
            user.id = result.user.uid;
            callbackAuth(user);
            getMessages(roomName, callbackData);
          }).catch(function(error) {
            console.log("Login error.");
            console.log(error);
            callbackAuth(null);
          });
        })
        .catch(function(error) {
          console.log("Persistence error.");
          console.log(error);
          callbackAuth(null);
        });
    } else {
      console.log("Already logged in!");
      console.log(auth.currentUser);
      var user = {};
      user.name = auth.currentUser.displayName;
      user.id = auth.currentUser.uid;
      callbackAuth(user);
      getMessages(roomName, callbackData);
    }
  });
}

function getMessages(roomName, callbackData) {
  if(roomRef != null) {
    roomRef.off('child_added');
  }
  roomRef = database.ref('rooms/' + roomName + '/messages');
  roomRef.on('child_added', function(snapshot) {
    callbackData(snapshot.val());
  });
}

function sendMessage(text) {
  var user = auth.currentUser;
  var data = {
    content: text,
    timestamp: firebase.database.ServerValue.TIMESTAMP,
    uid: user.uid,
    name: user.displayName
  }
  database.ref('users/' + user.uid).set(firebase.database.ServerValue.TIMESTAMP);
  roomRef.push(data);
}