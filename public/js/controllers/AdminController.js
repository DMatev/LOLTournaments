'use strict';
angular.module('AdminController',[])
	.controller('AdminCtrl', function($scope, $http) {
	  $scope.users = [];
	  $scope.tournamentForm={};
	  $scope.tournamentList={};

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
	  	console.log($scope.newsForm);
	  	$http.post('/api/news',{title:$scope.newsForm.title,content:$scope.newsForm.content})
	  		.success(function(data){
	  			console.log(data);
	  			getNews();
	  		})
	  		.error(function(data){
	  			console.log(data);
	  		});
	  };

 	  $scope.deleteNews=function(id){
	  	$http.delete('/api/news/'+id)
	  		.success(function(data){
	  			console.log(data);
	  			getNews();
	  		})
	  		.error(function(data){
	  			console.log(data);
	  		});
	  };
		$scope.editNews=function(news){
			console.log(news);
			$scope.newsEditForm.visible=true;
			$scope.newsEditForm.selected=news._id;
			$scope.newsEditForm.title=news.title;
			$scope.newsEditForm.content=news.content;
		};

		$scope.editThisNews=function(){
			console.log('opa');
		  	$http.put('/api/news/'+$scope.newsEditForm.selected,
		  		{title:$scope.newsEditForm.title,content:$scope.newsEditForm.content})
		  		.success(function(data){
		  			console.log(data);
		  			$scope.newsEditForm.visible=false;
		  			getNews();
		  		})
		  		.error(function(data){
		  			console.log(data);
		  		});
	  	};

 	  $scope.deleteComment=function(nid,cid){
	  	$http.delete('/api/news/'+nid+'/comment/'+cid)
	  		.success(function(data){
	  			console.log(data);
	  			getNews();
	  		})
	  		.error(function(data){
	  			console.log(data);
	  		});
	  };	

	  $scope.createHallOfFameRecord=function(){
	  	console.log($scope.hallOfFameForm);
	  	$http.post('/api/halloffame',{team:$scope.hallOfFameForm.team,tournament:$scope.hallOfFameForm.tournament})
	  		.success(function(data){
	  			console.log(data);
	  			getHallOfFame();
	  		})
	  		.error(function(data){
	  			console.log(data);
	  		});
	  };

	  $scope.deleteHallOfFameRecord=function(id){
	  	$http.delete('/api/halloffame/'+id)
	  		.success(function(data){
	  			console.log(data);
	  			getHallOfFame();
	  		})
	  		.error(function(data){
	  			console.log(data);
	  		});
	  };
		$scope.editHallOfFame=function(record){
			$scope.hallOfFameEditForm.visible=true;
			$scope.hallOfFameEditForm.selected=record._id;
			$scope.hallOfFameEditForm.team=record.team;
			$scope.hallOfFameEditForm.tournament=record.tournament;
		};

		$scope.editHallOfFameRecord=function(){
			console.log('opa');
		  	$http.put('/api/halloffame/'+$scope.hallOfFameEditForm.selected,
		  		{team:$scope.hallOfFameEditForm.team,tournament:$scope.hallOfFameEditForm.tournament})
		  		.success(function(data){
		  			console.log(data);
		  			$scope.hallOfFameEditForm.visible=false;
		  			getHallOfFame();
		  		})
		  		.error(function(data){
		  			console.log(data);
		  		});
	  	};

	  $scope.createTournament=function(){
	  	$http.post('/api/tournaments',{
	  		name:$scope.tournamentForm.tournamentName,
	  		numberOfCompetitors:$scope.tournamentForm.tournamentParticipantsNumber})
	  		.success(function(data){
	  			console.log(data);
	  		})
	  		.error(function(data){
	  			console.log(data);
	  		});
	  };

	  $scope.startTournament=function(tournamentName){
	  	$http.put('/api/tournaments/name/'+tournamentName+'/start')
	  		.success(function(data){
	  			console.log(data);
	  		}).error(function(data){
	  			console.log(data);
	  		});
	  };

	  	function getAllTournaments(){
			$http.get('/api/tournaments')
				.success(function(data){
					$scope.tournamentList=data;
					console.log(data);
				})
				.error(function(data){
					console.log(data);
				});
		}

		function getNews(){
			$http.get('/api/news')
				.success(function(data){
					$scope.newsList=data;
					console.log(data);
				})
				.error(function(data){
					console.log(data);
				});
		}

		function getHallOfFame(){
			$http.get('/halloffame')
				.success(function(data){
					$scope.hallOfFameList=data;
					console.log(data);
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
		  			console.log(data);
		  		}).error(function(data){
		  			console.log(data);
		  		});
		  };
	}])
	.controller('accordionNews',['$scope','$http',function($scope,$http){
		
		$scope.oneAtATime=true;
		
		// $scope.startTournament=function(tournamentName){
		//   	$http.put('/api/tournaments/name/'+tournamentName+'/start')
		//   		.success(function(data){
		//   			console.log(data);
		//   		}).error(function(data){
		//   			console.log(data);
		//   		});
		//   };
	}]);