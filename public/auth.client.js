var myApp = angular.module('myApp', []);

//this is used to parse the profile
function url_base64_decode(str) {
  var output = str.replace('-', '+').replace('_', '/');
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += '==';
      break;
    case 3:
      output += '=';
      break;
    default:
      throw 'Illegal base64url string!';
  }
  return window.atob(output); //polifyll https://github.com/davidchambers/Base64.js
}

myApp.controller('UserCtrl', function ($scope, $http, $window) {
  $scope.user = {username: 'admin', password: 'kobakaa', email: 'dido_bido@abv.bg'}; //{username: 'john.doe', password: 'foobar'};
  $scope.isAuthenticated = false;
  $scope.welcome = '';
  $scope.message = '';

  $scope.submit = function () {
    $http
      .post('/signin', $scope.user) //.post('/signup', $scope.user) .post('/signin', $scope.user) 
      .success(function (data, status, headers, config) {
        $window.sessionStorage.token = data.token;
        $scope.isAuthenticated = true;
        var encodedProfile = data.token.split('.')[1];
        var profile = JSON.parse(url_base64_decode(encodedProfile));
        $scope.welcome = 'Welcome ' + profile.id;
        if (typeof Storage !== 'undefined') 
          localStorage.setItem('token', data.token); // Store
      })
      .error(function (data, status, headers, config) {
        // Erase the token if the user fails to log in
        delete $window.sessionStorage.token;
        $scope.isAuthenticated = false;
        // Handle login errors here
        $scope.error = data;
        $scope.welcome = '';
      });
      //PUT AND POST WORKS WITH json data
      // $http
      // .post('/recovery/change', {username: 'admin', password: 'kobakaa', recoveryCode: 'DeHUS'}) 
      // .success(function (data, status, headers, config) {
      //   console.log(data);
      // })
      // .error(function (data, status, headers, config) {
      //   console.log(data);
      // });
      //GET AND DELETE WORKS WITH Queries
      // $http({url: '/api/news', method: 'DELETE', params: {id: '54931f3103bea7580a3e16b5'}})
      // .success(function (data, status, headers, config) {
      //   console.log(data);
      // })
      // .error(function (data, status, headers, config) {
      //   console.log(data);
      // });
  };

  $scope.logout = function () {
    $scope.welcome = '';
    $scope.message = '';
    $scope.isAuthenticated = false;
    delete $window.sessionStorage.token;
    if (typeof Storage !== 'undefined'){
      localStorage.clear();
    }
  };

  $scope.sendAwesomeAjax = function () {
    // $http
    // .post('/api/team/requests', {name: 'ditkom', approved: true }) 
    // .success(function (data, status, headers, config) {
    //   console.log(data);
    // })
    // .error(function (data, status, headers, config) {
    //   console.log(data);
    // });

    $http({url: '/api/teams', method: 'GET', params: {name: 'ChobanitE'}})
    .success(function (data, status, headers, config) {
      console.log(data);
    })
    .error(function (data, status, headers, config) {
      console.log(status);
      console.log(data);
    });

  };
  
  function init(){
    if($window.sessionStorage.token){
      $scope.isAuthenticated = true;
    } else {
        if (typeof Storage !== 'undefined'){
          if(localStorage.getItem('token')){
            $window.sessionStorage.token = localStorage.getItem('token'); // Retrieve
            //should make a secret request to actually check for auth and if no erros continue
            $scope.isAuthenticated = true;

          }
        }  
    }
          
  };
  init();

});

myApp.factory('authInterceptor', function ($rootScope, $q, $window) {
  return {
    request: function (config) {
      config.headers = config.headers || {};
      if ($window.sessionStorage.token) {
        config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
      }
      return config;
    },
    responseError: function (rejection) {
      if (rejection.status === 401) {
        // handle the case where the user is not authenticated
      }
      return $q.reject(rejection);
    }
  };
});

myApp.config(function ($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');
});
