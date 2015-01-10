'use strict';
angular.module('appRoutes',[])
  .config(['$stateProvider', '$urlRouterProvider',
   function($stateProvider, $urlRouterProvider) {
      
      $stateProvider
        .state('home',{
          url:'',
          templateUrl:'views/main.html'
        })
        .state('account',{
          url:'/account',
          templateUrl:'views/account.html'
        });


      $urlRouterProvider.otherwise('');
   }]);