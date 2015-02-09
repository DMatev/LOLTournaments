'use strict';
angular.module('TeamController', [])
	.controller('TeamCtrl', function ($scope, $http, $window, User, Team){
		$scope.error = null;
		$scope.myTeam = {};
		$scope.teamList = {};
		$scope.requestsList = {};
		$scope.teamForm = {};
		$scope.selectedTournament = null;	

		function getUserInfo (){
			User.getInfo()
				.success(function (data){
					$scope.user.username = data.username;
					$scope.user.email = data.email;
					$scope.user.role = data.role;
					$scope.user.duty = data.duty;
					$scope.user.team = data.team;
				})
				.error(function (){
	            	$scope.isAuthenticated = false;
	            	delete $window.sessionStorage.token;
	          });
		}

		function getMyTeam (){
			User.getMyTeam()
				.success(function (data){
					$scope.myTeam = data;
				});
		}

		function getAllRequests (){
			Team.requests()
				.success(function (data){
					$scope.requestsList = data;
				});
		}

		function getAllTeams (){
			Team.getAll()
				.success(function (data){
					$scope.teamList = data;
				});
		}

		$scope.createTeam = function (){
			Team.create($scope.teamForm.name)
				.success(function (){
					$scope.error = null;
					$scope.teamForm = {};
					getUserInfo();
					getMyTeam();
					getAllRequests();
				})
				.error(function (data){
					$scope.error = data;
				});
		};

		$scope.leaveTeam = function (){
			Team.leave()
				.success(function (){
					$scope.error = null;
					$scope.teamForm = {};
					getUserInfo();
					getMyTeam();
					getAllTeams();
				})
				.error(function(data){
					$scope.error = data;
				});
		};

		$scope.selectTeam = function (id){
			if($scope.teamList[id].requests.indexOf($scope.user.username) === -1){
				$scope.selectedTeam = id;
			}
		};

		$scope.joinTeam = function (){
			Team.join($scope.teamList[$scope.selectedTeam].name.original)
				.success(function (){
					delete $scope.selectedTeam;
					$scope.error = null;
					getAllTeams();
				})
				.error(function (data){
					$scope.error = data;
				});
		};

		$scope.handleTeamRequest = function (name, approved){
			if(approved === 'true'){
				approved = true;
			} else {
				approved = false;
			}
			Team.handleTeamRequest(name, approved)
				.success(function (){
					$scope.error = null;
					getMyTeam();
					getAllRequests();
				})
				.error(function (data){
					$scope.error = data;
				});
		};
		
		$scope.kickMember = function (member){
			Team.kickMember(member)
				.success(function (){
					$scope.error = null;
					getMyTeam();
				})
				.error(function (data){
					$scope.error = data;
				});
		};

		$scope.change = function (tournament){
			$scope.selectedTournament = tournament;
		};

		getUserInfo();
		getMyTeam();
		getAllRequests();
		getAllTeams();	
	});