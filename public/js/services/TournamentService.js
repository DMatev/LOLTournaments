'use strict';
angular.module('TournamentService',[])
	.factory('Tournament', function ($http){
        return {
            getAll : function (){
                return $http.get('/api/tournaments');
            },
            join: function (name){
                return $http.post('/api/myteam/tournament', { name: name });
            },
            sendScore: function (answer){
                return $http.post('/api/myteam/tournament/score', { won: answer });
            },
            create: function (name, numberOfCompetitors){
                return $http.post('/api/tournaments', { name: name, numberOfCompetitors: numberOfCompetitors });
            },
            start: function (name){
                return $http.put('/api/tournaments/name/' + name + '/start');
            },
            end: function (name){
                return $http.put('/api/tournaments/name/' + name + '/end');
            },
            resolveMatch: function (name, matchId, winner){
                return $http.put('/api/tournaments/name/' + name + '/match/' + matchId, { winner: winner });
            },
            tryResolveStage: function (name){
                return $http.put('/api/tournaments/name/' + name + '/stage/resolve');
            },
            endStage: function (name){
                return $http.put('/api/tournaments/name/' + name + '/stage/end');
            }
        };
    });