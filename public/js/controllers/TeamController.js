'use strict';
angular.module('TeamController',[])
	.controller('TeamCtrl',['$scope','$http',function($scope,$http){
		$scope.team='none';
		$scope.teamForm={};



		$scope.createTeam=function(){
			$http.post('/api/myteam',{name:$scope.teamForm.name})
				.success(function(data){
					console.log(data);
					$scope.teamForm={};
					$http.get('/api/userinfo') 
			          .success(function (data) {
			            console.log(data);
			            $scope.isAuthenticated = true;
			            $scope.user = {username: data.username, email: data.email, role: data.role, duty: data.duty, team: data.team};

			          })
			          .error(function (data) {
			            console.log(data);
			            $scope.isAuthenticated = false;
			            delete $window.sessionStorage.token;
			          });
				})
				.error(function(data){
					console.log(data);
				});
		};

		$scope.disbandTeam=function(){
			$http.delete('/api/myteam')
				.success(function(data){
					console.log(data);
				})
				.error(function(data){
					console.log(data);
				});
		};


	}]);