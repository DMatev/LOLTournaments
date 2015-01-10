'use strict';
angular.module('AdminController',[])
	.controller('AdminCtrl', function($scope, $http) {
	  // List of users got from the server
	  $scope.users = [];

	  // Fill the array to display it in the page
	  $http.get('/users').success(function(users){
	    for (var i in users)
	      $scope.users.push(users[i]);
	  });
	});