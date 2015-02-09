'use strict';
angular.module('appRoutes', [])
  .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider){

    function isUser($location, $http){
      return $http.get('/api/userinfo')
        .then(function (){
          return;
        });
    }

    function isAdmin($location, $http){
      return $http.get('/api/news')
        .then(function (){
          return;
        });
    }

    $stateProvider
      .state('home',{
        url:'/',
        templateUrl:'views/main.html',
        controller:'NewsCtrl'
      })
      .state('login',{
        url:'/login',
        templateUrl:'views/login.html'
      })
      .state('halloffame',{
        url:'/halloffame',
        templateUrl:'views/halloffame.html',
        controller:'HallOfFameCtrl'
      })
      .state('tournaments',{
        url:'/tournaments',
        templateUrl:'views/tournaments.html',
        controller:'TournamentsCtrl',
        resolve: {
          logged: isUser
        }
      })
      .state('myteam',{
        url:'/myteam',
        templateUrl:'views/myteam.html',
        controller:'TeamCtrl',
        resolve: {
          logged: isUser
        }
      })
      .state('admin',{
        url:'/admin',
        templateUrl:'views/admin.html',
        controller:'AdminCtrl',
        resolve: {
          logged: isAdmin
        }
      });

    $urlRouterProvider.otherwise('/');
 }]);