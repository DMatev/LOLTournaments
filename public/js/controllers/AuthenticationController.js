'use strict';
angular.module('AuthenticationController', [])
  .controller('UserCtrl', function ($scope, $http, $window, $state) {
    $scope.user = {}; //{username: 'john.doe', password: 'foobar'};
    $scope.isAuthenticated = false;
    $scope.welcome = '';
    $scope.message = '';

    $scope.signin = function () {
      $http
        .post('/signin', $scope.user) //.post('/signup', $scope.user) .post('/signin', $scope.user) 
        .success(function (data, status, headers, config) {
          $window.sessionStorage.token = data.token;
        
          $http
            .get('/api/userinfo') 
            .success(function (data, status, headers, config) {
              console.log(data);
              $scope.user = {username: data.username, email: data.email, role: data.role, duty: data.duty, team: data.team};
              $scope.welcome = 'Welcome, ' +  $scope.user.username;
              $scope.isAuthenticated = true;
              $state.go('home');
              
            })
            .error(function (data, status, headers, config) {
              console.log(data);
              $scope.isAuthenticated = false;
              delete $window.sessionStorage.token;
            });
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
    };

    $scope.signup = function () {
      $http
        .post('/signup', {username: $scope.user.username, password: $scope.user.password, email: $scope.user.email}) //.post('/signup', $scope.user) .post('/signin', $scope.user) 
        .success(function (data, status, headers, config) {
          $window.sessionStorage.token = data.token;
        
          $http
            .get('/api/userinfo') 
            .success(function (data, status, headers, config) {
              console.log(data);
              $scope.user = {username: data.username, email: data.email, role: data.role, duty: data.duty, team: data.team};
              $scope.welcome = 'Welcome, ' +  $scope.user.username;
              $scope.isAuthenticated = true;
              $state.go('home');
              
            })
            .error(function (data, status, headers, config) {
              console.log(data);
              $scope.isAuthenticated = false;
              delete $window.sessionStorage.token;
            });
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
    };

    $scope.logout = function () {
      $scope.user={};
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

      // $http({url: '/api/teams', method: 'GET', params: {name: 'ChobanitE'}})
      // .success(function (data, status, headers, config) {
      //   console.log(data);
      // })
      // .error(function (data, status, headers, config) {
      //   console.log(status);
      //   console.log(data);
      // });
      
      $http
      .get('/api/tournaments') 
      .success(function (data, status, headers, config) {
        console.log(data);
      })
      .error(function (data, status, headers, config) {
        console.log(data);
      });
    };
    
    function init(){
      if($window.sessionStorage.token){
        $http
          .get('/api/userinfo') 
          .success(function (data, status, headers, config) {
            console.log(data);
            $scope.isAuthenticated = true;
            $scope.user = {username: data.username, email: data.email, role: data.role, duty: data.duty, team: data.team};

          })
          .error(function (data, status, headers, config) {
            console.log(data);
            $scope.isAuthenticated = false;
            delete $window.sessionStorage.token;
          });
      } else {
          if (typeof Storage !== 'undefined'){
            if(localStorage.getItem('token')){
              $window.sessionStorage.token = localStorage.getItem('token'); // Retrieve
              //should make a secret request to actually check for auth and if no erros continue
              $http
                .get('/api/userinfo') 
                .success(function (data, status, headers, config) {
                  console.log(data);
                  $scope.isAuthenticated = true;
                  $scope.user = {username: data.username, email: data.email, role: data.role, duty: data.duty, team: data.team};
                })
                .error(function (data, status, headers, config) {
                  console.log(data);
                  $scope.isAuthenticated = false;
                  delete $window.sessionStorage.token;
                });

              

            }
          }  
      }
            
    };
    init();

  })
.factory('authInterceptor', function ($rootScope, $q, $window) {
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
})
.config(function ($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');
});
