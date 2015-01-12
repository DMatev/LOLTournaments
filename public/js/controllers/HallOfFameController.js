'use strict';
angular.module('HallOfFameController',[])
	.controller('HallOfFameCtrl',['$scope','$http',function($scope,$http){
		$scope.hallOfFame=[];
		$scope.oneAtATime=false;
		$scope.collapsed=true;

		function geHallOfFame(){
			$http.get('/halloffame')
				.success(function(data){
					$scope.hallOfFame=data;
					console.log(data);
				})
				.error(function(data){
					console.log(data);
				});
		}
		geHallOfFame();
	}]);