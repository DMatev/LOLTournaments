var expressJwt = require('express-jwt');
var sanitizeHtml = require('sanitize-html');
var config = require('./config');

var loginSystem = require('./controllers/loginSystem');
var news = require('./controllers/news');
var hallOfFame = require('./controllers/hallOfFame');
var user = require('./controllers/user');
var teams = require('./controllers/teams');
var myTeam = require('./controllers/myTeam');
var tournaments = require('./controllers/tournaments');

module.exports = function(app) {

  app.use('/api', expressJwt({ secret: config.jwtSecret }));

  app.use(function (err, req, res, next){
    if(err.constructor.name === 'UnauthorizedError'){
      res.status(401).send('Unauthorized');
    }
  });

  // code 0-mongodb error
  // code 1-mongodb error - server not found
  // code 2-required parameter not given
  // code 3-data - validation error
  // code 4-data - already taken
  // code 5-wrong password/recoveryCode
  // code 6-server signin is closed
  // code 7-server signup is closed
  // code 8-forbidden (only admins)
  // code 9-forbidden (only captains)
  // code 10-user not found in db
  // code 11-news not found in db
  // code 12-comment not found in db
  // code 13-record of Hall Of Fame not found in db
  // code 14-team not found in db
  // code 15-tournament not found in db
  // code 16-user dont have a team
  // code 17-team is not in 'free' status
  // code 18-user already have a team
  // code 19-user already have send request to join this team
  // code 20-you dont have request from this user
  // code 21-team is full
  // code 22-captain cant kick himself
  // code 23-player not found
  // code 24-tournament not found
  // code 25-tournament is not in 'signing' stage
  // code 26-team already signed in tournament
  // code 27-team is not full

  // signin, required params 'username, password'
  app.post('/signin', function (req, res){
    var username = sanitizeHtml(req.body.username, { allowedTags: [], allowedAttributes: [] });
    var password = sanitizeHtml(req.body.password, { allowedTags: [], allowedAttributes: [] });
    if(typeof req.body.username !== 'string'){
      return res.status(400).json({ code: 2, field: 'username', description: 'username is required', message: 'Username cannot be blank' });
    }
    if(typeof req.body.password !== 'string'){
      return res.status(400).json({ code: 2, field: 'password', description: 'password is required', message: 'Password cannot be blank' });
    }
    return loginSystem.signin({ username: username, password: password }, function (data){
      return res.status(data.status).json(data.content);
    });
  });

  // signup, required params 'username, password, email'
  app.post('/signup', function (req, res){
    var username = sanitizeHtml(req.body.username, { allowedTags: [], allowedAttributes: [] });
    var password = sanitizeHtml(req.body.password, { allowedTags: [], allowedAttributes: [] });
    var email = sanitizeHtml(req.body.email, { allowedTags: [], allowedAttributes: [] });
    if(typeof req.body.username !== 'string'){
      return res.status(400).json({ code: 2, field: 'username', description: 'username is required', message: 'Username cannot be blank' });
    }
    if(typeof req.body.password !== 'string'){
      return res.status(400).json({ code: 2, field: 'password', description: 'password is required', message: 'Password cannot be blank' });
    }
    if(typeof req.body.email !== 'string'){
      return res.status(400).json({ code: 2, field: 'email', description: 'email is required', message: 'Email cannot be blank' });
    }
    if(!/^[a-zA-Z0-9_-]{3,20}$/.test(username)){
      return res.status(400).json({ code: 3, field: 'username', description: 'username validation is wrong', message: 'Username must contain only letters, numbers or symbols "-", " _" with min 3 and max 20 symbols' });
    }
    // TODO: check for reserved words such as 'admin'
    if(!/^[a-zA-Z0-9_-]{6,20}$/.test(password)){
      return res.status(400).json({ code: 3, field: 'password', description: 'password validation is wrong', message: 'Password must contain only letters, numbers or symbols "-", " _" with min 6 and max 20 symbols' });
    }
    if(!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)){
      return res.status(400).json({ code: 3, field: 'email', description: 'email validation is wrong', message: 'Email address is invalid' });
    }
    return loginSystem.signup({ username: username, password: password, email: email }, function (data){
      return res.status(data.status).json(data.content);
    });
  });
  
  // send request for recoverying forgotten password, required params 'username'
  app.post('/recovery/request', function (req, res){
    var username = sanitizeHtml(req.body.username, { allowedTags: [], allowedAttributes: [] });
    if(typeof req.body.username !== 'string'){
      return res.status(400).json({ code: 2, field: 'username', description: 'username is required', message: 'Username cannot be blank' });
    }
    return loginSystem.recovery.request({ username: username }, function (data){
      return res.status(data.status).json(data.content);
    });
  });

  // change youser password with recoveryCode, required params 'username, password, recoveryCode'
  app.post('/recovery/change', function (req, res){
    var username = sanitizeHtml(req.body.username, { allowedTags: [], allowedAttributes: [] });
    var password = sanitizeHtml(req.body.password, { allowedTags: [], allowedAttributes: [] });
    var recoveryCode = sanitizeHtml(req.body.recoveryCode, { allowedTags: [], allowedAttributes: [] });
    if(typeof req.body.username !== 'string'){
      return res.status(400).json({ code: 2, field: 'username', description: 'username is required', message: 'Username cannot be blank' });
    }
    if(typeof req.body.password !== 'string'){
      return res.status(400).json({ code: 2, field: 'password', description: 'password is required', message: 'Password cannot be blank' });
    }
    if(!/^[a-zA-Z0-9_-]{6,20}$/.test(password)){
      return res.status(400).json({ code: 3, field: 'password', description: 'password validation is wrong', message: 'Password must contain only letters, numbers or symbols "-", " _" with min 6 and max 20 symbols' });
    }
    if(typeof req.body.recoveryCode !== 'string'){
      return res.status(400).json({ code: 2, field: 'recoveryCode', description: 'recovery code is required', message: 'Recovery code cannot be blank' });
    }
    return loginSystem.recovery.change({ username: username, password: password, recoveryCode: recoveryCode }, function(data){
      return res.status(data.status).json(data.content);
    });
  });

  // get all visible news
  app.get('/news', function (req, res){
    return news.getAllVisible(function (data){
      return res.status(data.status).json(data.content);
    });
  });

  // get all records from Hall Of Fame
  app.get('/halloffame', function (req, res){
    return hallOfFame.getAll(function (data){
      return res.status(data.status).json(data.content);
    });
  });

  // get user info
  app.get('/api/userinfo', function (req, res){
    return user.getInfo({ id: req.user.id }, function (data){
      return res.status(data.status).json(data.content);
    });
  });

  // get all news
  app.get('/api/news', function (req, res){
    return news.getAll({ consumer: { id: req.user.id } }, function (data){
      return res.status(data.status).json(data.content);
    });
  });

  // create news, required params 'title, content', optinal 'author, isVisible'
  app.post('/api/news', function (req, res){
    var title = sanitizeHtml(req.body.title, { allowedTags: [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'b', 'i', 'strong', 'em', 'strike'], allowedAttributes: [] });
    var content = sanitizeHtml(req.body.content, { allowedTags: [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'b', 'i', 'strong', 'em', 'strike'], allowedAttributes: [] });
    var author = sanitizeHtml(req.body.author, { allowedTags: [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'b', 'i', 'strong', 'em', 'strike'], allowedAttributes: [] });
    var news = { };
    if(typeof req.body.title !== 'string'){
      return res.status(400).json({ code: 2, field: 'title', description: 'title is required', message: 'Title cannot be blank' });
    }
    if(typeof req.body.content !== 'string'){
      return res.status(400).json({ code: 2, field: 'content', description: 'content is required', message: 'Content cannot be blank' });
    }
    if(typeof req.body.author === 'string'){
      news.author = author;
    }
    if(typeof req.body.isVisible === 'boolean'){
      news.isVisible = req.body.isVisible;
    }
    news.title = title;
    news.content = content;
    return news.publish({ consumer: { id: req.user.id }, news: news }, function (data){
      return res.status(data.status).json(data.content);
    });
  });

  // get news by id
  app.get('/api/news/:id', function (req, res){
    if(!/^[0-9a-fA-F]{24}$/.test(req.params.id)){
      return res.status(400).json({ code: 3, field: 'id', description: 'id validation is wrong', message: 'Wrong id' }); 
    }
    return news.getById({ consumer: { id: req.user.id }, news: { id: req.params.id } }, function (data){
      return res.status(data.status).json(data.content);
    });
  });

  // remove news by id
  app.delete('/api/news/:id', function (req, res){
    if(!/^[0-9a-fA-F]{24}$/.test(req.params.id)){
      return res.status(400).json({ code: 3, field: 'id', description: 'id validation is wrong', message: 'Wrong id' }); 
    }
    return news.remove({ consumer: { id: req.user.id }, news: { id: req.params.id } }, function (data){
      return res.status(data.status).json(data.content);
    });
  });

  // edit news by id, optinal params 'title, content, author, isVisible'
  app.put('/api/news/:id', function (req, res){
    var title = sanitizeHtml(req.body.title, { allowedTags: [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'b', 'i', 'strong', 'em', 'strike'], allowedAttributes: [] });
    var content = sanitizeHtml(req.body.content, { allowedTags: [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'b', 'i', 'strong', 'em', 'strike'], allowedAttributes: [] });
    var author = sanitizeHtml(req.body.author, { allowedTags: [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'b', 'i', 'strong', 'em', 'strike'], allowedAttributes: [] });
    var news = { };
    if(!/^[0-9a-fA-F]{24}$/.test(req.params.id)){
      return res.status(400).json({ code: 3, field: 'id', description: 'id validation is wrong', message: 'Wrong id' }); 
    }
    if(typeof req.body.title === 'string'){
      news.title = title;
    }
    if(typeof req.body.content === 'string'){
      news.content = content;
    }
    if(typeof req.body.author === 'string'){
      news.author = author;
    }
    if(typeof req.body.isVisible === 'boolean'){
      news.isVisible = req.body.isVisible;
    }
    news.id = req.params.id;
    return news.edit({ consumer: { id: req.user.id }, news: news }, function (data){
      return res.status(data.status).json(data.content);
    });
  });
  
  // post comment on news by id, required params 'content'
  app.post('/api/news/:id/comment', function (req, res){
    var content = sanitizeHtml(req.body.content, { allowedTags: [], allowedAttributes: [] });
    if(!/^[0-9a-fA-F]{24}$/.test(req.params.id)){
      return res.status(400).json({ code: 3, field: 'id', description: 'id validation is wrong', message: 'Wrong id' }); 
    }
    if(typeof req.body.content !== 'string'){
      return res.status(400).json({ code: 2, field: 'content', description: 'content is required', message: 'Content cannot be blank' });
    }
    return news.comments.publish({ consumer: { id: req.user.id }, news: { id: req.params.id }, comment: { content: content } }, function (data){
      return res.status(data.status).json(data.content);
    });
  });

  // delete comment on news by ids
  app.delete('/api/news/:nid/comment/:cid', function (req, res){
    var content = sanitizeHtml(req.body.content, { allowedTags: [], allowedAttributes: [] });
    if(!/^[0-9a-fA-F]{24}$/.test(req.params.nid)){
      return res.status(400).json({ code: 3, field: 'id', description: 'news id validation is wrong', message: 'Wrong id' }); 
    }
    if(!/^[0-9a-fA-F]{24}$/.test(req.params.cid)){
      return res.status(400).json({ code: 3, field: 'id', description: 'comment id validation is wrong', message: 'Wrong id' }); 
    }
    return news.comments.remove ({ consumer: { id: req.user.id }, news: { id: req.params.nid }, comment: { id: req.params.cid } }, function (data){
      return res.status(data.status).json(data.content);
    });
  });

  // DONT NEED THIS SHIT, SHOULD BE AUTMATIC
  // post record for Hall Of Fame, required params 'team, tournament'
  app.post('/api/halloffame', function (req, res){
    var team = sanitizeHtml(req.body.team, { allowedTags: [], allowedAttributes: [] });
    var tournament = sanitizeHtml(req.body.tournament, { allowedTags: [], allowedAttributes: [] });
    if(typeof req.body.team !== 'string'){
      return res.status(400).json({ code: 2, field: 'team', description: 'team is required', message: 'Team cannot be blank' });
    }
    if(typeof req.body.tournament !== 'string'){
      return res.status(400).json({ code: 2, field: 'tournament', description: 'tournament is required', message: 'Tournament cannot be blank' });
    }
    return hallOfFame.publish({ consumer: { id: req.user.id }, record: { team: team, tournament: tournament } }, function (data){
      return res.status(data.status).json(data.content);
    });
  });

  // edit record of Hall Of Fame, optinal params 'team, tournament'
  app.put('/api/halloffame/:id', function (req, res){
    var team = sanitizeHtml(req.body.team, { allowedTags: [], allowedAttributes: [] });
    var tournament = sanitizeHtml(req.body.tournament, { allowedTags: [], allowedAttributes: [] });
    var record = { };
    if(!/^[0-9a-fA-F]{24}$/.test(req.params.id)){
      return res.status(400).json({ code: 3, field: 'id', description: 'id validation is wrong', message: 'Wrong id' }); 
    }
    if(typeof req.body.team === 'string'){
      record.team = team;
    }
    if(typeof req.body.tournament === 'string'){
      record.tournament = tournament;
    }
    record.id = req.params.id;
    return hallOfFame.edit({ consumer: { id: req.user.id }, record: record }, function (data){
      return res.status(data.status).json(data.content);
    });
  });

  // delete record from Hall Of Fame by id
  app.delete('/api/halloffame/:id', function (req, res){
    if(!/^[0-9a-fA-F]{24}$/.test(req.params.id)){
      return res.status(400).json({ code: 3, field: 'id', description: 'id validation is wrong', message: 'Wrong id' }); 
    }
    return hallOfFame.remove({ consumer: { id: req.user.id }, record: { id: req.params.id } }, function (data){
      return res.status(data.status).json(data.content);
    });
  });

  // get al teams
  app.get('/api/teams', function (req, res){
    return teams.getAll(function (data){
      return res.status(data.status).json(data.content);
    });
  });

  // get team by id
  app.get('/api/teams/id/:id', function (req, res){
    if(!/^[0-9a-fA-F]{24}$/.test(req.params.id)){
      return res.status(400).json({ code: 3, field: 'id', description: 'id validation is wrong', message: 'Wrong id' }); 
    }
    return teams.getById({ team: { id: req.params.id } }, function (data){
      return res.status(data.status).json(data.content);
    });
  });

  // get team by name
  app.get('/api/teams/name/:name', function (req, res){
    var name = sanitizeHtml(req.params.name, { allowedTags: [], allowedAttributes: [] });
    return teams.getByName({ name: name }, function (data){
      return res.status(data.status).json(data.content);
    });
  });

  // send request to join team, required params 'name'
  app.post('/api/teams/request', function (req, res){
    var name = sanitizeHtml(req.body.name, { allowedTags: [], allowedAttributes: [] });
    if(typeof req.body.name !== 'string'){
      return res.status(400).json({ code: 2, field: 'name', description: 'name is required', message: 'Name cannot be blank' });
    }
    return user.joinTeam({ consumer: { id: req.user.id }, team: { name: name } }, function (data){
      return res.status(data.status).json(data.content);
    });
  });

  // create team, required params 'name'
  app.post('/api/myteam', function (req, res){
    var name = sanitizeHtml(req.body.name, { allowedTags: [], allowedAttributes: [] });
    if(typeof req.body.name !== 'string'){
      return res.status(400).json({ code: 2, field: 'name', description: 'name is required', message: 'Name cannot be blank' });
    }
    if(!/^[a-zA-Z0-9_-\s]{3,35}$/.test(name)){
      return res.status(400).json({ code: 3, field: 'name', description: 'name validation is wrong', message: 'Team name must contain only letters, space, numbers or symbols "-", " _" with min 3 and max 35 symbols' }); 
    }
    return myTeam.create({ consumer: { id: req.user.id }, team: { name: name } }, function (data){
      return res.status(data.status).json(data.content);
    });
  });

  // dismiss my team
  app.delete('/api/myteam', function (req, res){
    return myTeam.dismiss({ consumer: { id: req.user.id } }, function (data){
      return res.status(data.status).json(data.content);
    });
  });

  // kick member from my team 
  app.delete('/api/myteam/member/:member', function (req, res){
    var member = sanitizeHtml(req.params.member, { allowedTags: [], allowedAttributes: [] });
    return myTeam.kick({ consumer: { id: req.user.id }, name: member }, function (data){
      return res.status(data.status).json(data.content);
    });
  });

  // get my team joining requests
  app.get('/api/myteam/requests', function (req, res){
    return myTeam.requests.review({ consumer: { id: req.user.id } }, function (data){
      return res.status(data.status).json(data.content);
    });
  });

  // edit my team joining requests, requred params 'name, approved'
  app.put('/api/myteam/requests', function (req, res){
    var name = sanitizeHtml(req.body.name, { allowedTags: [], allowedAttributes: [] });
    if(typeof req.body.name !== 'string'){
      return res.status(400).json({ code: 2, field: 'name', description: 'name is required', message: 'Name cannot be blank' });
    }
    if(typeof req.body.approved !== 'boolean'){
      return res.status(400).json({ code: 2, field: 'approved', description: 'approved is required', message: 'Approved cannot be blank' });
    }
    return myTeam.requests.edit({ consumer: { id: req.user.id }, approved: req.body.approved, name: name }, function (data){
      return res.status(data.status).json(data.content);
    });
  });

  // sign my team for tournament, required params 'name'
  app.post('/api/myteam/tournament', function (req, res){
    var name = sanitizeHtml(req.body.name, { allowedTags: [], allowedAttributes: [] });
    if(typeof req.body.name !== 'string'){
      return res.status(400).json({ code: 2, field: 'name', description: 'name is required', message: 'Name cannot be blank' });
    }
    return myTeam.tournament.signin({ consumer: { id: req.user.id }, name: name }, function (data){
      return res.status(data.status).json(data.content);
    });
  });

  // create tournament, required params 'name, numberOfCompetitors', optinal params 'type'
  app.post('/api/tournaments', function (req, res){
    var name = sanitizeHtml(req.body.name, { allowedTags: [], allowedAttributes: [] });
    var type = sanitizeHtml(req.body.type, { allowedTags: [], allowedAttributes: [] });
    var number = req.body.numberOfCompetitors;
    var tournament = {};
    if(typeof req.body.name !== 'string'){
      return res.status(400).json({ code: 2, field: 'name', description: 'name is required', message: 'Name cannot be blank' });
    }
    if(!/^[a-zA-Z0-9_-\s]{3,35}$/.test(name)){
      return res.status(400).json({ code: 3, field: 'name', description: 'name validation is wrong', message: 'Team name must contain only letters, space, numbers or symbols "-", " _" with min 3 and max 35 symbols' }); 
    }
    if(typeof req.body.numberOfCompetitors !== 'number'){
      return res.status(400).json({ code: 2, field: 'numberOfCompetitors', description: 'numberOfCompetitors is required', message: 'Number of competitors cannot be blank' });
    }
    if(!((number != 0) && !(number & (number - 1)))){
      return res.status(400).json({ code: 3, field: 'numberOfCompetitors', description: 'numberOfCompetitors validation is wrong', message: 'Number of competitors must be positive integer number powered of 2' }); 
    }
    if((number < 4) || (number > 16)){
      return res.status(400).json({ code: 3, field: 'numberOfCompetitors', description: 'numberOfCompetitors validation is wrong', message: 'Number of competitors must be 4,8 or 16' }); 
    }
    tournament.name = name;
    tournament.numberOfCompetitors = number;
    if(typeof req.body.type === 'string'){
      tournament.type = type;
    }
    return tournaments.create({ consumer: { id: req.user.id }, tournament: tournament }, function (data){
      return res.status(data.status).json(data.content);
    });
  });

};