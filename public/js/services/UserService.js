'use strict';
angular.module('UserService',[])
	.factory('User', function ($http){
        return {
            getInfo : function (){
                return $http.get('/api/userinfo');
            },
            getMyTeam: function (){
            	return $http.get('/api/myteam');
            },
            signin: function (user){
                return $http.post('/signin', user);
            },
            signup: function (username, password, email){
                return $http.post('/signup', { username: username, password: password, email: email });
            },
            recoveryRequest: function (username){
                return  $http.post('/recovery/request', { username: username });
            },
            recoveryChange: function (username, password, recoveryCode){
                return $http.post('/recovery/change', { username: username, password: password, recoveryCode: recoveryCode });
            }
        };
    });