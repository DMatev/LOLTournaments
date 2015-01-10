var mongoose = require('mongoose');
//unfinished

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
    if(this.stage.isSigningOpen && (this.teams.length === this.numberOfCompetitors)){
        this.stage.isSigningOpen = false;
        this.stage.isRunning = true;
        this.currentStage = {};
        this.currentStage.matches = [];
        this.currentStage.start = new Date();
        for(var i=0; i<this.teams.length; i=i+2){
            this.currentStage.matches.push({ team1: this.teams[i].name, team2: this.teams[i+1].name })
        }
        return next(null);
    } else {
        return next(1);
    }
};

tournamentSchema.methods.moveCurrentStageToHistory = function (next){
    var pool = [], found = false, history = {};
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
                return next(null, history, this.currentStage, true, false);
            } else {
                return next(3); //finishing left
            }
        }
    } else {
        return next(1); //stage is not 'running'
    }
};

module.exports = mongoose.model('Tournament', tournamentSchema);
