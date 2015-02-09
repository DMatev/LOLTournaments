'use strict';
angular.module('AdminController', ['ngSanitize'])
	.controller('AdminCtrl', function ($scope, $http, News, HallOfFame, Tournament){
		$scope.oneAtATime = true;
		$scope.errorNews = null;
		$scope.errorHallOfFame = null;
		$scope.errorTournaments = null;
		$scope.errorCreateTournament = null;
		$scope.newsList = {};
		$scope.hallOfFameList = {};
		$scope.tournaments = {};
		$scope.newsForm = {};
	  	$scope.hallOfFameForm = {};
	  	$scope.tournamentForm = {};
		$scope.newsEditForm = {
	  		visible: false,
	  		selected: null
	  	};
	  	$scope.hallOfFameEditForm = {
	  		visible: false,
	  		selected: null
	  	};

		function getNews (){
			News.getAll()
				.success(function (data){
					$scope.newsList = data;
				});
		}

		function getHallOfFame (){
			HallOfFame.get()
				.success(function (data){
					$scope.hallOfFameList = data;
				});
		}

		function getAllTournaments (){
			Tournament.getAll()
				.success(function (data){
					$scope.tournaments = data;
					resolvable();
				});
		}

		function resolvable(){
	 		var found;
			for(var i=0; i<$scope.tournaments.length; i++){
				if($scope.tournaments[i].stage.isRunning){
					found = false;
					for(var j=0; j<$scope.tournaments[i].currentStage.matches.length; j++){
						if($scope.tournaments[i].currentStage.matches[j].winner === 2){
							j = $scope.tournaments[i].currentStage.matches.length;
							$scope.tournaments[i].isResolvable = true;
							found = true;
						}
					}
					if(!found){
						$scope.tournaments[i].isEndable = true;
					}
				}
			}
		}

		// NEWS
		$scope.createNews = function (){
		  	News.create($scope.newsForm.title, $scope.newsForm.content)
		  		.success(function (){
		  			$scope.errorNews = null;
		  			$scope.newsForm.title = null;
		  			$scope.newsForm.content = null;
		  			getNews();
		  		})
		  		.error(function (data){
		  			$scope.errorNews = data;
		  		});
	  	};

 	 	$scope.deleteNews = function (id){
 	  		News.delete(id)
		  		.success(function (){
		  			getNews();
		  		})
		  		.error(function (){
		  			getNews();
		  		});
	  	};

		$scope.editNews = function(news){
			$scope.newsEditForm.visible = true;
			$scope.newsEditForm.selected = news._id;
			$scope.newsEditForm.title = news.title;
			$scope.newsEditForm.content = news.content;
		};

		$scope.editThisNews = function(){
			News.edit($scope.newsEditForm.selected, $scope.newsEditForm.title, $scope.newsEditForm.content)
		  		.success(function (){
		  			$scope.errorNews = null;
		  			$scope.newsEditForm.visible = false;
		  			getNews();
		  		})
		  		.error(function (data){
		  			$scope.errorNews = data;
		  		});
	  	};

 	 	$scope.deleteComment = function (nid, cid){
		  	News.deleteComment(nid, cid)
		  		.success(function (){
		  			getNews();
		  		})
		  		.error(function (){
		  			getNews();
		  		});
	  	};	

	  	// HALLOFFAME
	 	$scope.createHallOfFameRecord = function (){
		  	HallOfFame.createRecord($scope.hallOfFameForm.team, $scope.hallOfFameForm.tournament)
		  		.success(function (){
		  			$scope.errorHallOfFame = null;
		  			$scope.hallOfFameForm.team = null;
		  			$scope.hallOfFameForm.tournament = null;
		  			getHallOfFame();
		  		})
		  		.error(function (data){
		  			$scope.errorHallOfFame = data;
		  		});
	  	};

	  	$scope.deleteHallOfFameRecord = function (id){
		  	HallOfFame.deleteRecord(id)
		  		.success(function (){
		  			getHallOfFame();
		  		})
		  		.error(function (){
		  			getHallOfFame();
		  		});
	  	};

		$scope.editHallOfFame = function (record){
			$scope.hallOfFameEditForm.visible = true;
			$scope.hallOfFameEditForm.selected = record._id;
			$scope.hallOfFameEditForm.team = record.team;
			$scope.hallOfFameEditForm.tournament = record.tournament;
		};

		$scope.editHallOfFameRecord=function(){
			HallOfFame.edit($scope.hallOfFameEditForm.selected, $scope.hallOfFameEditForm.team, $scope.hallOfFameEditForm.tournament)
		  		.success(function (){
		  			$scope.errorHallOfFame = null;
		  			$scope.hallOfFameEditForm.visible = false;
		  			getHallOfFame();
		  		})
		  		.error(function (data){
		  			$scope.errorHallOfFame = data;
		  		});
	  	};

	  	// TOURNAMENTS 
	  	$scope.createTournament = function (){
		  	Tournament.create($scope.tournamentForm.tournamentName, $scope.tournamentForm.tournamentParticipantsNumber)
		  		.success(function (){
		  			$scope.errorCreateTournament = null;
		  			$scope.tournamentForm.tournamentName = null;
		  			$scope.tournamentForm.tournamentParticipantsNumber = null;
		  			getAllTournaments();
		  		})
		  		.error(function (data){
		  			$scope.errorCreateTournament = data;
		  		});
	  	};

	  	$scope.startTournament = function (tournamentName){
		  	Tournament.start(tournamentName)
		  		.success(function (){
		  			$scope.errorTournaments = null;
		  			getAllTournaments();
		  		})
		  		.error(function (data){
		  			$scope.errorTournaments = data;
		  		});
	  	};

	  	$scope.resolveMatch = function (tournamentName, matchId, resolvedWinner){
			Tournament.resolveMatch(tournamentName, matchId, resolvedWinner)
		  		.success(function (){
		  			$scope.errorTournaments = null;
		  			getAllTournaments();
		  		})
		  		.error(function (data){
		  			$scope.errorTournaments = data;
		  		});
	  	};

		$scope.tryResolveStage = function (tournamentName){
		  	Tournament.tryResolveStage(tournamentName)
		  		.success(function (){
		  			$scope.errorTournaments = null;
		  			getAllTournaments();
		  		})
		  		.error(function (data){
		  			$scope.errorTournaments = data;
		  			getAllTournaments();
		  		});
		};

		$scope.endStageTournament = function (tournamentName){
		  	Tournament.endStage(tournamentName)
				.success(function (){
					$scope.errorTournaments = null;
					getAllTournaments();
				})
				.error(function (data){
					$scope.errorTournaments = data;
				});
		};

	  	$scope.endTournament = function (tournamentName){
		  	Tournament.end(tournamentName)
		  		.success(function (){
		  			$scope.errorTournaments = null;
		  			getAllTournaments();
		  		})
		  		.error(function (data){
		  			$scope.errorTournaments = data;
		  		});
	  	};

		getAllTournaments();
		getNews();
		getHallOfFame();
	});