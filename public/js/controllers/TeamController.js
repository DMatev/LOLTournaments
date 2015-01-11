'use strict';
angular.module('TeamController',[])
	.controller('TeamCtrl',['$scope','$http','$window',function($scope,$http,$window){
		$scope.team='none';
		$scope.teamForm={};
		$scope.teamList={};
		$scope.myTeam={};
		
		$scope.requestsList={};
		$scope.selectedTeam;
		$scope.tournamentList={};
		$scope.selectedTournament;
		

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
					getMyTeam();
					getAllTeams();
				})
				.error(function(data){
					console.log(data);
				});
		};

		$scope.selectTeam=function(id){
			if($scope.teamList[id].requests.indexOf($scope.user.username)>-1){
				alert('You have already sent request to that team');
			}else{
				$scope.selectedTeam=id;
			}
		};

		$scope.joinTeam=function(){
			$http.post('/api/teams/request',{name:$scope.teamList[$scope.selectedTeam].name.original})
				.success(function(data){
					delete $scope.selectedTeam;
					getAllTeams();
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
					getMyTeam();
					getAllRequests();
					console.log(data);
				})
				.error(function(data){
					console.log(data);
				});
		};
		
		$scope.kickMember=function(member){
			$http.delete('/api/myteam/member/'+member)
				.success(function(data){
					getMyTeam();
					console.log(data);
				})
				.error(function(data){
					console.log(data);
				});
		};

		$scope.joinTournament=function(){
			$http.post('/api/myteam/tournament',{name:$scope.selectedTournament})
				.success(function(data){
					console.log(data);
				})
				.error(function(data){
					console.log(data);
				});
		};


		//AT start-get all teams,get my team list members,get request for my team

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

		//GET ALL TOURNAMENTS TO MAKE LIST or dropdown or smth else
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

		//GET TEAM MEMBERS
		function getMyTeam(){
			$http.get('/api/myteam')
			//$http.get('/api/teams/name/'+$scope.user.team)
				.success(function(data){
					$scope.myTeam=data;
					console.log(data);
				})
				.error(function(data){
					console.log(data);
				});
		}
		getMyTeam();

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