var bodyParser = require('body-parser');
var _ = require('underscore');
var dict = require('./dictionary');
var fs = require('fs');
var users = require('./users');
var game = require('./game');
var 
	headTemplate = fs.readFileSync('app_modules/templates/head.html', 'utf8'),
	questionTemplate = fs.readFileSync('app_modules/templates/question.html', 'utf8'),
	resultsTemplate = fs.readFileSync('app_modules/templates/results.html', 'utf8'),
	loginTemplate = fs.readFileSync('app_modules/templates/login.html', 'utf8'),
	//homeTemplate = fs.readFileSync('app_modules/templates/home.html', 'utf8');
	gameNotStartedTemplate = fs.readFileSync('app_modules/templates/gameNotStarted.html', 'utf8'),
	startGameTemplate = fs.readFileSync('app_modules/templates/startGame.html', 'utf8'),
	adminTemplate = fs.readFileSync('app_modules/templates/admin.html', 'utf8'),
	userTemplate = fs.readFileSync('app_modules/templates/user.html', 'utf8'),
	answerStateTemplate = fs.readFileSync('app_modules/templates/answerState.html', 'utf8');



module.exports = function(app) {	
	app.use(bodyParser.json());       // to support JSON-encoded bodies
	app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
		extended: true
	})); 

	function clearHeaders(res){
		res.setHeader('Cache-Control','no-cache');
		res.setHeader('Pragma','no-cache');
		res.setHeader('Expires','-1');
		res.setHeader('Cache-Control','no-cache, no-store');
	}
	
	function getTemplate (template, params){
		return headTemplate+_.template(template)(params)+'</div></body></html>'
	}
	
	function checkRights(req, res, next, isAdmin, isGame, isQuestion){
		clearHeaders(res);
		if(req.session.userId&&(!isAdmin||req.session.isAdmin)){
			if(!isGame||game.isStarted()){
				if(!isQuestion||game.getCurrentQuestion()){
					// всё ок
					next();
				}else{
					// вопрос не задан
					if(req.session.isAdmin){
						next();
					}else{
						// юзеру показываем сообщение
						redirectTo(res,'/user');
						res.end();
					}
				}
			} else{
				// игра не начата
				if(req.session.isAdmin){
					// админу показываем стартовую страницу
					res.send(getTemplate(startGameTemplate));
					res.end();
				}else{
					// юзеру показываем сообщение
					res.send(getTemplate(gameNotStartedTemplate));
					res.end();
				}
			}
		} else{
			res.send(getTemplate(loginTemplate));
			res.end();
		};
	}	
	function checkUser(req, res, next){
		checkRights(req, res, next);
	}
	function checkAdmin(req, res, next){
		checkRights(req, res, next, true);
	}
	function checkAdminGame(req, res, next){
		checkRights(req, res, next, true, true);
	}
	function checkUserGame(req, res, next){
		checkRights(req, res, next, false, true);
	}
	function checkUserQuestion(req, res, next){
		checkRights(req, res, next, false, true, true);
	}
	function redirectTo (res, location){
		res.writeHead(302, {
		  'Location': location
		});
	}
	function getState(req){
		var state = {
				isAdmin:req.session.isAdmin,
				users:users,
				game:game,
				question:game.getCurrentQuestion(),
				user:users.getUserById(req.session.userId),
				session:req.session,
				dict:dict,
				answerState:req.query.answerState
		}
		return state;
	}
	// GETS
	app.get('/', checkUser, function(req, res, next){
		var user = users.getUserById(req.session.userId);
		if(user.isAdmin){
			redirectTo(res,'/admin')
		} else{
			redirectTo(res,'/user')
		}
		res.end();
				
	});	
	app.get('/login', function(req, res, next){
		res.send(getTemplate(loginTemplate));
		res.end();
	});
	app.get('/results', checkUser, function (req, res, next) {
		var state = getState(req);
		state.results = game.getResults(users.getUsers())
		res.send(getTemplate(resultsTemplate,state));
		res.end();
	});
	app.get('/game', checkAdminGame, function (req, res, next) {
		res.send(getTemplate(startGameTemplate));
		res.end();
	});
	app.get('/question', checkAdminGame, function (req, res, next) {
		res.send(getTemplate(questionTemplate,getState(req)));
		res.end();
	});
	app.get('/admin', checkAdminGame, function (req, res, next) {
		res.send(getTemplate(adminTemplate,getState(req)));
		res.end();
	});
	app.get('/user', checkUserGame, function (req, res, next) {
		res.send(getTemplate(userTemplate,getState(req)));
		res.end();
	});
	app.get('/answerState', checkUserGame, function (req, res, next) {
		res.send(getTemplate(answerStateTemplate,getState(req)));
		res.end();
	});
	app.get('/answer', checkAdminGame, function (req, res, next) {
		res.send(game.getAnswer(req.query.questionId, req.query.userId));
		res.end();
		
	});
	// POSTS
	app.post('/result', checkAdminGame, function (req, res, next) {
		game.setResult(req.body);
		res.send({});
		res.end();
	});	
	app.post('/question', checkAdminGame, function (req, res, next) {
		game.startQuestion(req.body);
		redirectTo(res,'/results');
		res.end();
	});	
	app.post('/answer', checkUserGame, function (req, res, next) {
		var answerState = game.recieveAnswer(req.session.userId, req.body);
		redirectTo(res,'/answerState?answerState='+answerState);
		res.end();
		
	});
	app.post('/start', checkAdmin, function (req, res, next) {
		game.startGame(req.body);
		redirectTo(res,'/question');
		res.end();
	});
	
	app.post('/login', function(req, res, next){
		var user = users.loginUser(req.body, req.session);
		if(user){
			
			req.session.userId = user.id;
			req.session.isAdmin = user.isAdmin;
			redirectTo(res,'/');
			
		} else{
			res.send(getTemplate(loginTemplate));
		}
		res.end();
	});
	return;
	
};