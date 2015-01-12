'use strict';
angular.module('TournamentsController',[])
	.controller('TournamentsCtrl',['$scope','$http',function($scope,$http){
		$scope.tournaments=[];
		$http.get('/api/tournaments')
			.success(function(data){
				$scope.tournaments=data;
			})
			.error(function(data){
				console.log(data);
			})
	}]);