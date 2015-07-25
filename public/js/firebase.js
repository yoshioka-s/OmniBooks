angular.module('omnibooks.database', ['firebase'])
  .factory('fireBase', function($firebaseArray, $firebaseObject) {
    var myDataRef = new Firebase('https://shutorial.firebaseio.com/');

    var enterBook = function(org, username, title, img, author, isbn) {
      var bookDetails = {
        title: title,
        img: img,
        author: author,
        isbn: isbn
      };
      // push book details in org books and user bookshelf nodes
      myDataRef.child(org).child('books').push(bookDetails);
      myDataRef.child(org).child('users').child(username).child('bookshelf').push(bookDetails);
    };

    //get all books in same org
    var getOrgBook = function(org) {
      var ref = myDataRef.child(org).child('books');
      return $firebaseArray(ref);
    };

    //get one book from a user, return object
    var getUserBook = function(org, username, id, callback) {
      var ref = myDataRef.child(org).child('books').child(id);
      ref.on('value', function(dataSnapshot) {
        callback(dataSnapshot.val());
        ref.off();
      });
      return $firebaseObject(ref);
    };

    // returns array of all books belonging to a user
    var getUserBookshelf = function(org, username) {
      var ref = myDataRef.child(org).child('users').child(username).child('bookshelf');
      return $firebaseArray(ref);
    };

    //get user detail info, return object
    var getUserInfo = function(org, username) {
      return $firebaseObject(myDataRef.child(org).child('users').child(username));
    };

    //for signup
    var createUser = function(authInfo, success, failed) {
      myDataRef.createUser(authInfo, function(err, userData) {
        if (err) {
          failed('the email address is already registered.');
          return;
        }

        // save the user data
        var users = myDataRef.child(authInfo.org).child('users');
        users.child(authInfo.name).set({
          userDetail: {
            email: authInfo.email
          }
        });
        // save the userOrg
        var userOrg = myDataRef.child('userOrg');
        userOrg.child(authInfo.name).set(authInfo.org);
        success(authInfo);
        // save the email
        var email = myDataRef.child('email');
        userOrg.child(authInfo.email).set({
          name: authInfo.name,
          org: authInfo.org
          });
        // invoke the callback
        success(authInfo);
      });
    };

    //return users list
    var getUserOrg = function() {
      return $firebaseObject(myDataRef.child('userOrg'));
    };

    //return email list
    var getEmail = function() {
      return $firebaseObject(myDataRef.child('email'));
    };

    //for login
    var authWithPassword = function(authInfo, success, failed) {
      myDataRef.authWithPassword(authInfo, function(err, userData) {
        if (err) {
          failed('incorrect password.');
          return;
        }
        success(authInfo);
      });
    };

    // auto login
    var autoLogin = function (callback) {
      var authData = myDataRef.getAuth();
      if(authData){
        var email = authData.password.email;
        var emailList = $firebaseObject(myDataRef.child('email'));
        emailList.$loaded().then(function (argument) {
          var authInfo = {
            name: emailList[email].name,
            email: email,
            org: emailList[email].org
          }
          callback(authInfo);
        });
      }
    };

    return {
      enterBook: enterBook,
      getOrgBook: getOrgBook,
      getUserBook: getUserBook,
      getUserBookshelf: getUserBookshelf,
      getUserInfo: getUserInfo,
      createUser: createUser,
      authWithPassword: authWithPassword,
      getUserOrg: getUserOrg,
      autoLogin: autoLogin,
      getEmail: getEmail
    };
  });
