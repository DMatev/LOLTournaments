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
	  		})
	  }

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
	.controller('accordionTournaments',function($scope){
		$scope.oneAtATime=true;
		
	})