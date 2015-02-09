'use strict';
angular.module('HallOfFameController', [])
	.controller('HallOfFameCtrl', function ($scope, $http, HallOfFame){
		$scope.hallOfFame = [];

		function geHallOfFame(){
			HallOfFame.get()
				.success(function (data){
					$scope.hallOfFame = data;
				});
		}

		geHallOfFame();
	});