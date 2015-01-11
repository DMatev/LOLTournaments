'use strict';
angular.module('NewsController',[])
	.controller('NewsCtrl',['$scope','$http',function($scope,$http){
		$scope.news=[];
		$http.get('/api/news')
			.success(function(data){
				$scope.news=data;
				console.log(data);
			})
			.error(function(data){
				console.log(data);
			});
	}]);