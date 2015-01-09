var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var sanitizeHtml = require('sanitize-html');
var config = require('./config');
var controllers = require('./controllers');

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
    return controllers.signin({ username: username, password: password }, function (data){
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
    return controllers.signup({ username: username, password: password, email: email }, function (data){
      return res.status(data.status).json(data.content);
    });
  });
  
  // send request for recoverying forgotten password, required params 'username'
  app.post('/recovery/request', function (req, res){
    var username = sanitizeHtml(req.body.username, { allowedTags: [], allowedAttributes: [] });
    if(typeof req.body.username !== 'string'){
      return res.status(400).json({ code: 2, field: 'username', description: 'username is required', message: 'Username cannot be blank' });
    }
    return controllers.recovery.request({ username: username }, function (data){
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
    return controllers.recovery.change({ username: username, password: password, recoveryCode: recoveryCode }, function(data){
      return res.status(data.status).json(data.content);
    });
  });

  // get all visible news
  app.get('/news', function (req, res){
    return controllers.news.getAllVisible(function (data){
      return res.status(data.status).json(data.content);
    });
  });

  // get all records from Hall Of Fame
  app.get('/halloffame', function (req, res){
    return controllers.hallOfFame.getAll(function (data){
      return res.status(data.status).json(data.content);
    });
  });

  // get user info
  app.get('/api/userinfo', function (req, res){
    return controllers.users.getInfo({ id: req.user.id }, function (data){
      return res.status(data.status).json(data.content);
    });
  });

  // get all news
  app.get('/api/news', function (req, res){
    return controllers.news.getAll({ consumer: { id: req.user.id } }, function (data){
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
    return controllers.news.post({ consumer: { id: req.user.id }, news: news }, function (data){
      return res.status(data.status).json(data.content);
    });
  });

  // get news by id
  app.get('/api/news/:id', function (req, res){
    if(!/^[0-9a-fA-F]{24}$/.test(req.params.id)){
      return res.status(400).json({ code: 3, field: 'id', description: 'id validation is wrong', message: 'Wrong id' }); 
    }
    return controllers.news.get({ consumer: { id: req.user.id }, news: { id: req.params.id } }, function (data){
      return res.status(data.status).json(data.content);
    });
  });

  // remove news by id
  app.delete('/api/news/:id', function (req, res){
    if(!/^[0-9a-fA-F]{24}$/.test(req.params.id)){
      return res.status(400).json({ code: 3, field: 'id', description: 'id validation is wrong', message: 'Wrong id' }); 
    }
    return controllers.news.remove({ consumer: { id: req.user.id }, news: { id: req.params.id } }, function (data){
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
    return controllers.news.edit({ consumer: { id: req.user.id }, news: news }, function (data){
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
    return controllers.news.comment.post({ consumer: { id: req.user.id }, news: { id: req.params.id }, comment: { content: content } }, function (data){
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
    return controllers.news.comment.remove ({ consumer: { id: req.user.id }, news: { id: req.params.nid }, comment: { id: req.params.cid } }, function (data){
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
    return controllers.hallOfFame.post({ consumer: { id: req.user.id }, record: { team: team, tournament: tournament } }, function (data){
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
    return controllers.hallOfFame.edit({ consumer: { id: req.user.id }, record: record }, function (data){
      return res.status(data.status).json(data.content);
    });
  });

  // delete record from Hall Of Fame by id
  app.delete('/api/halloffame/:id', function (req, res){
    if(!/^[0-9a-fA-F]{24}$/.test(req.params.id)){
      return res.status(400).json({ code: 3, field: 'id', description: 'id validation is wrong', message: 'Wrong id' }); 
    }
    return controllers.hallOfFame.remove({ consumer: { id: req.user.id }, record: { id: req.params.id } }, function (data){
      return res.status(data.status).json(data.content);
    });
  });

  // get team by id
  app.get('/api/teams/id/:id', function (req, res){
    if(!/^[0-9a-fA-F]{24}$/.test(req.params.id)){
      return res.status(400).json({ code: 3, field: 'id', description: 'id validation is wrong', message: 'Wrong id' }); 
    }
    return controllers.teams.getById({ team: { id: req.params.id } }, function (data){
      return res.status(data.status).json(data.content);
    });
  });

  // get all teams, optinal query 'name' - return only one team by given name
  app.get('/api/teams', function (req, res){
    var name = sanitizeHtml(req.query.name, { allowedTags: [], allowedAttributes: [] });
    if(typeof req.query.name === 'string'){
      return controllers.teams.getByName({ name: name }, function (data){
        return res.status(data.status).json(data.content);
      });
    } else {
      return controllers.teams.getAll(function (data){
        return res.status(data.status).json(data.content);
      });
    }
  });

  // create team, required params 'name'
  app.post('/api/teams', function (req, res){
    var name = sanitizeHtml(req.body.name, { allowedTags: [], allowedAttributes: [] });
    if(typeof req.body.name !== 'string'){
      return res.status(400).json({ code: 2, field: 'name', description: 'name is required', message: 'Name cannot be blank' });
    }
    if(!/^[a-zA-Z0-9_-\s]{3,35}$/.test(name)){
      return res.status(400).json({ code: 3, field: 'name', description: 'name validation is wrong', message: 'Team name must contain only letters, space, numbers or symbols "-", " _" with min 3 and max 35 symbols' }); 
    }
    return controllers.teams.post({ consumer: { id: req.user.id }, team: { name: name } }, function (data){
      return res.status(data.status).json(data.content);
    });
  });

  // send request to join team, required params 'name'
  app.post('/api/teams/request', function (req, res){
    var name = sanitizeHtml(req.body.name, { allowedTags: [], allowedAttributes: [] });
    if(typeof req.body.name !== 'string'){
      return res.status(400).json({ code: 2, field: 'name', description: 'name is required', message: 'Name cannot be blank' });
    }
    return controllers.teams.requests.post({ consumer: { id: req.user.id }, team: { name: name } }, function (data){
      return res.status(data.status).json(data.content);
    });
  });

  // dissmiss team
  app.delete('/api/team', function (req, res){
    return controllers.teams.remove({ consumer: { id: req.user.id } }, function (data){
      return res.status(data.status).json(data.content);
    });
  });

  // get team requests
  app.get('/api/team/requests', function (req, res){
    return controllers.teams.requests.get({ consumer: { id: req.user.id } }, function (data){
      return res.status(data.status).json(data.content);
    });
  });

  // edit team requests, requred params 'name, approved'
  // not finished
  app.post('/api/team/requests', function (req, res){
    var name = sanitizeHtml(req.body.name, { allowedTags: [], allowedAttributes: [] });
    if(typeof req.body.name !== 'string'){
      return res.status(400).json({ code: 2, field: 'name', description: 'name is required', message: 'Name cannot be blank' });
    }
    if(typeof req.body.approved !== 'boolean'){
      return res.status(400).json({ code: 2, field: 'approved', description: 'approved is required', message: 'Approved cannot be blank' });
    }
    return controllers.teams.requests.edit({ consumer: { id: req.user.id }, approved: req.body.approved, name: name }, function (data){
      return res.status(data.status).json(data.content);
    });
  });

};