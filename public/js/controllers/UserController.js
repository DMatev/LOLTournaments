'use strict';
angular.module('UserController', [])
  .controller('UserCtrl', function ($scope, $http, $window, $state, User){
    $scope.isAuthenticated = false;
    $scope.errorSignin = null;
    $scope.errorSignup = null;
    $scope.errorRecoveryRequest = null;
    $scope.errorRecoveryChange = null;
    $scope.recovery = null;
    $scope.successMessage = null;
    $scope.user = {};
    
    function getInfo (redirect){
      User.getInfo()
        .success(function (data){
          $scope.user = { username: data.username, email: data.email, role: data.role, duty: data.duty, team: data.team };
          $scope.isAuthenticated = true;
          if(redirect){
            $state.go('home');
          }
        })
        .error(function (){
          $scope.isAuthenticated = false;
          delete $window.sessionStorage.token;
        });
    }

    function init(){
      if($window.sessionStorage.token){
        getInfo();
      } else {
        if(typeof Storage !== 'undefined'){
          if(localStorage.getItem('token')){
            $window.sessionStorage.token = localStorage.getItem('token'); // Retrieve

            getInfo();
          }
        }
      }    
    }

    $scope.signin = function (rememberMe){
      User.signin($scope.user) 
        .success(function (data){
          $window.sessionStorage.token = data.token;
          $scope.errorSignin = null;
        
          getInfo(true);

          if(rememberMe){
            if(typeof Storage !== 'undefined'){
              localStorage.setItem('token', data.token); // Store token to local storage
            }
          }

        })
        .error(function (data){
          // Erase the token if the user fails to log in
          delete $window.sessionStorage.token;
          $scope.isAuthenticated = false;
          // Handle login errors here
          $scope.errorSignin = data;
        });
    };

    $scope.signup = function (){
      User.signup($scope.user.username, $scope.user.password, $scope.user.email) 
        .success(function (data){
          $window.sessionStorage.token = data.token;
          $scope.errorSignup = null;

          getInfo(true);

          if(typeof Storage !== 'undefined'){
            localStorage.setItem('token', data.token); // Store token to local storage
          } 
            
        })
        .error(function (data){
          delete $window.sessionStorage.token;
          $scope.isAuthenticated = false;
          // Handle login errors here
          $scope.errorSignup = data;
        });
    };

    $scope.logout = function (){
      $scope.user = {};
      $scope.isAuthenticated = false;
      delete $window.sessionStorage.token;
      if(typeof Storage !== 'undefined'){
        localStorage.clear();
      }
      $state.go('home');
    };

    $scope.toogleRecovery = function (){
      $scope.recovery = !$scope.recovery;
      $scope.successMessage = null;
    };

    $scope.recoveryRequest = function (){
      User.recoveryRequest($scope.user.username)
        .success(function (data){
          $scope.errorRecoveryRequest = null;
          $scope.successMessage = data;
        })
        .error(function (data){
          $scope.successMessage = null;
          $scope.errorRecoveryRequest = data;
        });
    };

    $scope.recoveryChange = function (){
      User.recoveryChange($scope.user.username, $scope.user.password, $scope.user.recoveryCode)
        .success(function (data){
          $scope.errorRecoveryChange = null;
          $scope.successMessage = data;
        })
        .error(function (data){
          $scope.successMessage = null;
          $scope.errorRecoveryChange = data;
        });
    };
    
    init();
  })
  .factory('authInterceptor', function ($rootScope, $q, $window){
    return {
      request: function (config){
        config.headers = config.headers || {};
        if($window.sessionStorage.token){
          config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
        }
        return config;
      },
      responseError: function (rejection){
        if(rejection.status === 401){
          // handle the case where the user is not authenticated
        }
        return $q.reject(rejection);
      }
    };
  })
  .config(function ($httpProvider){
    $httpProvider.interceptors.push('authInterceptor');
  });
