'use strict';
angular.module('TournamentsController', [])
	.controller('TournamentsCtrl', function ($scope, $http, User,Tournament){
		$scope.collapsed = true;
		$scope.error = null;
		$scope.myTeam = {};
		$scope.tournaments = [];

		function getTournaments (){
			Tournament.getAll()
				.success(function(data){
					$scope.tournaments = data;
					commitable();
				});
		}

		function getMyTeam (){
			User.getMyTeam()
				.success(function (data){
					$scope.myTeam = data;
				});
		}

		function commitable(){
			var found;
			if($scope.user.duty === 'captain'){
				for(var i=0; i<$scope.tournaments.length; i++){
					if($scope.tournaments[i].stage.isRunning){
						for(var j=0; j<$scope.tournaments[i].teams.length; j++){
							if($scope.tournaments[i].teams[j].name === $scope.user.team){
								found = false;
								for(var k=0; k<$scope.tournaments[i].resultsFromCaptains.length; k++){
									if($scope.tournaments[i].resultsFromCaptains[k].name ===  $scope.user.team){
										found = true;
									}
								}
								if(!found){
									$scope.tournaments[i].isCommitable = true;
								}
							}
						}
					}
				}
			}
		}

		$scope.joinTournament = function (selectedTournament){
			Tournament.join(selectedTournament.name.original)
				.success(function (){
					$scope.error = null;
					getMyTeam();
					getTournaments();
				})
				.error(function (data){
					$scope.error = data;
				});
		};

		$scope.sendScore = function (answer){
			Tournament.sendScore(answer)
				.success(function (){
						getTournaments();
					});
		};

		getMyTeam();
		getTournaments();
	});