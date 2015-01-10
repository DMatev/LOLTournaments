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
          /*resolve:{
            'U':['$http',function($http){
              return $http.get('/api/userinfo')
                .then(function(data){
                  console.log(data.data);
                  return data.data
                });
            }]
          },*/
          url:'/account',
          templateUrl:'views/account.html',
        });


      $urlRouterProvider.otherwise('');
   }]);