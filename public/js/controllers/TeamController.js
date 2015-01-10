'use strict';
angular.module('TeamController',[])
	.controller('TeamCtrl',['$scope','$http','$window',function($scope,$http,$window){
		$scope.team='none';
		$scope.teamForm={};
		$scope.teamList={};
		$scope.teamMemberList={};
		$scope.requestsList={};
		$scope.selectedTeam;
		
		$scope.selectTeam=function(id){
			$scope.selectedTeam=id;
		};

		function getUserInfo(){
			$http.get('/api/userinfo')
	          .success(function (data) {
	            $scope.isAuthenticated = true;
	            $scope.user = {username: data.username, email: data.email, role: data.role, duty: data.duty, team: data.team};

	          })
	          .error(function (data) {
	            console.log(data);
	            $scope.isAuthenticated = false;
	            delete $window.sessionStorage.token;
	          });
		}

		$scope.createTeam=function(){
			$http.post('/api/myteam',{name:$scope.teamForm.name})
				.success(function(data){
					console.log(data);
					$scope.teamForm={};
					getUserInfo();
				})
				.error(function(data){
					console.log(data);
				});
		};

		$scope.disbandTeam=function(){
			$http.delete('/api/myteam')
				.success(function(data){
					console.log(data);
					$scope.teamForm={};
					getUserInfo();
				})
				.error(function(data){
					console.log(data);
				});
		};

		$scope.joinTeam=function(){
			$http.post('/api/teams/request',{name:$scope.teamList[$scope.selectedTeam].name.original})
				.success(function(data){
					console.log(data);
				})
				.error(function(data){
					console.log(data);
				});
		};
		//STRANGE THINGS R HAPPENING must check
		$scope.handleTeamRequest=function(name,approved){
			if(approved==='true'){
				approved=true;
			}else{
				approved=false;
			}
			$http.put('/api/myteam/requests',{name:name,approved:approved})
				.success(function(data){
					console.log(data);
				})
				.error(function(data){
					console.log(data);
				});
		};



		$scope.test=function(username){
			console.log(username);
		};
		$scope.getTeamMembers=function(){
			$http.get('/api/teams/name/'+$scope.user.team)
				.success(function(data){
					$scope.teamMemberList=data.players;
					console.log(data);
				})
				.error(function(data){
					console.log(data);
				});
		}
		//getTeamMembers();

		//GET ALL TEAMS TO MAKE A LIST
		function getAllTeams(){
			$http.get('/api/teams')
				.success(function(data){
					$scope.teamList=data;
					console.log(data);
				})
				.error(function(data){
					console.log(data);
				});
		}

		getAllTeams();
		//GET ALL REQUESTS TO MY TEAM
		function getAllRequests(){
			$http.get('/api/myteam/requests')
				.success(function(data){
					$scope.requestsList=data;
					console.log(data);
				})
				.error(function(data){
					console.log(data);
				});
		}
		getAllRequests();


	}]);