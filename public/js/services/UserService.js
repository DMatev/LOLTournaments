'use strict';
angular.module('UserService',[])
	.factory('User',['$http',function($http){
		return{
			getInfo:function(){
				return $http.get('/api/userinfo');
			}
		};
	}]);