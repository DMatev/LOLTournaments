'use strict';
angular.module('AdminController',[])
	.controller('AdminCtrl', function($scope, $http) {
	  $scope.users = [];
	  $scope.tournamentForm={};
	  $scope.tournamentList={};
	  $scope.stageResults=[];

	  $scope.newsEditForm={
	  	visible: false,
	  	selected: null
	  };

	  $scope.newsForm={};
	  $scope.newsList={};

	  $scope.hallOfFameEditForm={
	  	visible: false,
	  	selected: null
	  };

	  $scope.hallOfFameForm={};
	  $scope.hallOfFameList={};

	  $scope.createNews=function(){
	  	$http.post('/api/news',{title:$scope.newsForm.title,content:$scope.newsForm.content})
	  		.success(function(data){
	  			$scope.errorNews=null;
	  			$scope.newsForm.title=null;
	  			$scope.newsForm.content=null;
	  			getNews();
	  		})
	  		.error(function(data){
	  			$scope.errorNews=data;
	  		});
	  };

 	  $scope.deleteNews=function(id){
	  	$http.delete('/api/news/'+id)
	  		.success(function(data){
	  			getNews();
	  		})
	  		.error(function(data){
	  			getNews();
	  		});
	  };
		$scope.editNews=function(news){
			$scope.newsEditForm.visible=true;
			$scope.newsEditForm.selected=news._id;
			$scope.newsEditForm.title=news.title;
			$scope.newsEditForm.content=news.content;
		};

		$scope.editThisNews=function(){
		  	$http.put('/api/news/'+$scope.newsEditForm.selected,
		  		{title:$scope.newsEditForm.title,content:$scope.newsEditForm.content})
		  		.success(function(data){
		  			$scope.errorNews=null;
		  			$scope.newsEditForm.visible=false;
		  			getNews();
		  		})
		  		.error(function(data){
		  			$scope.errorNews=data;
		  		});
	  	};

 	  $scope.deleteComment=function(nid,cid){
	  	$http.delete('/api/news/'+nid+'/comment/'+cid)
	  		.success(function(data){
	  			getNews();
	  		})
	  		.error(function(data){
	  			getNews();
	  		});
	  };	

	  $scope.createHallOfFameRecord=function(){
	  	$http.post('/api/halloffame',{team:$scope.hallOfFameForm.team,tournament:$scope.hallOfFameForm.tournament})
	  		.success(function(data){
	  			$scope.errorHallOfFame=null;
	  			$scope.hallOfFameForm.team=null;
	  			$scope.hallOfFameForm.tournament=null;
	  			getHallOfFame();
	  		})
	  		.error(function(data){
	  			$scope.errorHallOfFame=data;
	  		});
	  };

	  $scope.deleteHallOfFameRecord=function(id){
	  	$http.delete('/api/halloffame/'+id)
	  		.success(function(data){
	  			getHallOfFame();
	  		})
	  		.error(function(data){
	  			getHallOfFame();
	  		});
	  };
		$scope.editHallOfFame=function(record){
			$scope.hallOfFameEditForm.visible=true;
			$scope.hallOfFameEditForm.selected=record._id;
			$scope.hallOfFameEditForm.team=record.team;
			$scope.hallOfFameEditForm.tournament=record.tournament;
		};

		$scope.editHallOfFameRecord=function(){
		  	$http.put('/api/halloffame/'+$scope.hallOfFameEditForm.selected,
		  		{team:$scope.hallOfFameEditForm.team,tournament:$scope.hallOfFameEditForm.tournament})
		  		.success(function(data){
		  			$scope.errorHallOfFame=null;
		  			$scope.hallOfFameEditForm.visible=false;
		  			getHallOfFame();
		  		})
		  		.error(function(data){
		  			$scope.errorHallOfFame=data;
		  		});
	  	};
	  ///
	  /// TOURNAMENTs functions
	  ///
	  $scope.createTournament=function(){
	  	$http.post('/api/tournaments',{
	  		name:$scope.tournamentForm.tournamentName,
	  		numberOfCompetitors:$scope.tournamentForm.tournamentParticipantsNumber})
	  		.success(function(data){
	  			$scope.errorCreateTournament=null;
	  			getAllTournaments();
	  		})
	  		.error(function(data){
	  			$scope.errorCreateTournament=data;
	  		});
	  };

	  $scope.startTournament=function(tournamentName){
	  	$http.put('/api/tournaments/name/'+tournamentName+'/start')
	  		.success(function(data){
	  			$scope.errorTournaments=null;
	  			getAllTournaments();
	  		}).error(function(data){
	  			$scope.errorTournaments=data;
	  		});
	  };

	  $scope.resolveMatch=function(tournamentName,matchId,resolvedWinner){
	  	console.log(tournamentName +' '+ matchId + ' ' +resolvedWinner);
	  	$http.put('/api/tournaments/name/'+tournamentName+'/match/'+matchId,
	  		{winner:resolvedWinner})
	  		.success(function(data){
	  			$scope.errorTournaments=null;
	  			getAllTournaments();
	  		})
	  		.error(function(data){
	  			$scope.errorTournaments=data;
	  		});
	  };

	  $scope.endStageTournament=function(tournamentName){
	  	$http
	  	.put('/api/tournaments/name/'+tournamentName+'/stage/resolve')
	  		.success(function(data){
	  			$scope.errorTournaments=null;
	  			$http.put('/api/tournaments/name/'+tournamentName+'/stage/end')
	  				.success(function(data){
	  					$scope.errorTournaments=null;
	  				})
	  				.error(function(data){
	  					$scope.errorTournaments=data;
	  				});
	  		})
	  		.error(function(data){
	  			$scope.errorTournaments=data;
	  		});
	  };

	  $scope.endTournament=function(tournamentName){
	  	$http.put('/api/tournaments/name/'+tournamentName+'/end')
	  		.success(function(data){
	  			$scope.errorTournaments=null;
	  		})
	  		.error(function(data){
	  			$scope.errorTournaments=data;
	  		});
	  };

	  	function getAllTournaments(){
			$http.get('/api/tournaments')
				.success(function(data){
					$scope.tournamentList=data;
				})
				.error(function(data){
					console.log(data);
				});
		}

		function getNews(){
			$http.get('/api/news')
				.success(function(data){
					$scope.newsList=data;
				})
				.error(function(data){
					console.log(data);
				});
		}

		function getHallOfFame(){
			$http.get('/halloffame')
				.success(function(data){
					$scope.hallOfFameList=data;
				})
				.error(function(data){
					console.log(data);
				});
		}
		getAllTournaments();
		getNews();
		getHallOfFame();
	 
	})
	.controller('accordionTournaments',['$scope','$http',function($scope,$http){
		
		$scope.oneAtATime=true;
		
		$scope.startTournament=function(tournamentName){
		  	$http.put('/api/tournaments/name/'+tournamentName+'/start')
		  		.success(function(data){
		  			$scope.errorTournaments=null;
		  		}).error(function(data){
		  			$scope.errorTournaments=data;
		  		});
		  };
	}])
	.controller('accordionNews',['$scope','$http',function($scope,$http){
		
		$scope.oneAtATime=true;
		
	}]);