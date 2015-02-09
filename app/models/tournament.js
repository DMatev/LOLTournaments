'use strict';
var mongoose = require('mongoose');

var tournamentSchema = mongoose.Schema({
    
	name: {
        original: String,
        lowerCase: String
    },
    type: { type: String, default: 'Direct eleminations' },
    numberOfCompetitors: Number,
    stage: { 
        isSigningOpen: { type: Boolean, default: true },
        isRunning: { type: Boolean, default: false },
        isOver: { type: Boolean, default: false }
    },
    teams: [{
        name: String,
        captain: String,
        players: [ String ]
    }],
    resultsFromCaptains:[{
        name: String,
        won: Boolean
    }],
    currentStage: {
        start: Date,
        end: Date,
        matches: [{
            team1: String,
            team2: String,
            winner: { type: Number, default: 2 } //0 for team 1 or 1 for team 2, 2 for not known yet
        }]
    },
    history: []
});

tournamentSchema.methods.setCurrentStageEnd = function (date){
    this.currentStage.end = date;
};

tournamentSchema.methods.makeFirstStage = function (next){
    if(!this.stage.isSigningOpen){
        return next(1); // not in 'signing' stage
    } else {
        if(this.teams.length !== this.numberOfCompetitors){
            return next(2); // tournament not full
        } else {
            // need shuffle first
            this.stage.isSigningOpen = false;
            this.stage.isRunning = true;
            this.currentStage = {};
            this.currentStage.matches = [];
            this.currentStage.start = new Date();
            for(var i=0; i<this.teams.length; i=i+2){
                this.currentStage.matches.push({ team1: this.teams[i].name, team2: this.teams[i+1].name })
            }
            return next(null);
        }
    }
};

tournamentSchema.methods.finish = function (next){
    if(!this.stage.isRunning){
        return next(1); //stage is not 'running'
    } else {
        if(this.currentStage.matches.length !== 1){
            return next(2); //current tournament stage is not the last stage
        }
        if(this.currentStage.matches[0].winner === 2){
            return next(3); //the last match is not decided
        }
        this.stage.isRunning = false;
        this.stage.isOver = true;
        return next(null);
    }
};

tournamentSchema.methods.moveCurrentStageToHistory = function (next){
    var pool = [];
    var found = false;
    var history = {};
    var match = {};
    if(this.stage.isRunning){
        for(var i=0; i<this.currentStage.matches.length; i++){
            if(this.currentStage.matches[i].winner === 2){
                return next(2); //there matches that are not decided
            }
        }
        if(!found){
            if(this.currentStage.matches.length >= 2){
                history.start = this.currentStage.start;
                history.matches =[];
                for(var i=0; i<this.currentStage.matches.length; i++){
                    match = {};
                    match.winner = this.currentStage.matches[i].winner;
                    match.team1 = this.currentStage.matches[i].team1;
                    match.team2 = this.currentStage.matches[i].team2
                    match._id = this.currentStage.matches[i]._id;
                    history.matches.push(match);
                    if(this.currentStage.matches[i].winner == 0){
                        pool.push(this.currentStage.matches[i].team1);
                    } else {
                        pool.push(this.currentStage.matches[i].team2);
                    }
                }
                this.currentStage.start = new Date();
                this.currentStage.matches = [];
                for(var i=0; i<pool.length; i=i+2){
                    this.currentStage.matches.push({ team1: pool[i], team2: pool[i+1] })
                }
                return next(null, history, this.currentStage);
            } else {
                return next(3); //finishing left
            }
        }
    } else {
        return next(1); //stage is not 'running'
    }
};

tournamentSchema.methods.tryResolveMatches = function (next){ //next(err, fixList);
    var pool = [];
    var fixList = [];
    var match = {};
    var loopIndex = 0;
    var that = this;
    function itterate(){
        if(loopIndex == pool.length){
            // end of loop should call next with 'eror' and array to fix
            if(fixList.length === 0){
                return next(null, null);
            } else {
                return next(null, fixList);
            }
        } else {
            findTeamInResultsArray(pool[loopIndex].team1, that.resultsFromCaptains, function (firstFound, firstValue, firstId){
                findTeamInResultsArray(pool[loopIndex].team2, that.resultsFromCaptains, function (secondFound, secondValue, secondId){
                    if(firstFound && !secondFound){ //only team1 send score
                        // should set the score of the match with firstValue
                        if(firstValue){
                            that.currentStage.matches[pool[loopIndex].index].winner = 0;
                        } else {
                            that.currentStage.matches[pool[loopIndex].index].winner = 1;
                        }
                        loopIndex++;
                        return itterate();
                    }
                    if(!firstFound && secondFound){ //only team2 send score
                        // should set the score of the match with secondValue
                        if(secondValue){
                            that.currentStage.matches[pool[loopIndex].index].winner = 1;
                        } else {
                            that.currentStage.matches[pool[loopIndex].index].winner = 0;
                        }
                        loopIndex++;
                        return itterate();
                    }
                    if(firstFound && secondFound){ //both send score
                        if(firstValue !== secondValue){ //both send correct score
                            if(firstValue){
                                that.currentStage.matches[pool[loopIndex].index].winner = 0;
                            } else {
                                that.currentStage.matches[pool[loopIndex].index].winner = 1;
                            }
                            loopIndex++;
                            return itterate();
                        } else { //some1 lies
                            // should set place to populate matches to fix
                            fixList.push({ '_id': pool[loopIndex]._id, 'winner': pool[loopIndex].winner, 'team1': pool[loopIndex].team1, 'team2': pool[loopIndex].team2});
                            loopIndex++;
                            return itterate();
                        }
                    }
                    if(!firstFound && !secondFound){ //noone send score
                        // should set place to populate matches to fix
                        fixList.push({ '_id': pool[loopIndex]._id, 'winner': pool[loopIndex].winner, 'team1': pool[loopIndex].team1, 'team2': pool[loopIndex].team2})
                        loopIndex++;
                        return itterate();
                    }
                });  
            });  
        }
    };
    if(!this.stage.isRunning){
        return next(1); //stage is not 'running'
    } else {
        for(var i=0; i<this.currentStage.matches.length; i++){
            if(this.currentStage.matches[i].winner === 2){
                match = {}
                match.winner = this.currentStage.matches[i].winner;
                match.team1 = this.currentStage.matches[i].team1;
                match.team2 = this.currentStage.matches[i].team2
                match._id = this.currentStage.matches[i]._id;
                match.index = i;
                pool.push(match);
            }
        }
        if(pool.length === 0){
            return next(null, null);
        } else {
            itterate();
        }
    }
};

function findTeamInResultsArray(x, array, callback){
    if(array.length === 0){
        return callback(false);
    }
    for(var i=0; i<array.length; i++){
        if(x === array[i].name){
            return callback(true, array[i].won, array[i]._id);
        }
    }
    return callback(false);

};
module.exports = mongoose.model('Tournament', tournamentSchema);
