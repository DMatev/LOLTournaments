'use strict';
angular.module('AdminController',[])
	.controller('AdminCtrl', function($scope, $http) {
	  $scope.users = [];
	  $scope.tournamentForm={};
	  $scope.tournamentList={};

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
		getAllTournaments();
	 
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
	}]);