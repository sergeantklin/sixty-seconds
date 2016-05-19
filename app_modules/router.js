var bodyParser = require('body-parser');
var _ = require('underscore');
var dict = require('./dictionary');
var fs = require('fs');
var users = require('./users');
var game = require('./game');
var 
	questionTemplate = fs.readFileSync('app_modules/templates/question.html', 'utf8'),
	resultsTemplate = fs.readFileSync('app_modules/templates/results.html', 'utf8'),
	loginTemplate = fs.readFileSync('app_modules/templates/login.html', 'utf8'),
	//homeTemplate = fs.readFileSync('app_modules/templates/home.html', 'utf8');
	gameNotStartedTemplate = fs.readFileSync('app_modules/templates/gameNotStarted.html', 'utf8'),
	startGameTemplate = fs.readFileSync('app_modules/templates/startGame.html', 'utf8'),
	adminTemplate = fs.readFileSync('app_modules/templates/admin.html', 'utf8'),
	userTemplate = fs.readFileSync('app_modules/templates/user.html', 'utf8'),
	answerStateTemplate = fs.readFileSync('app_modules/templates/answerState.html', 'utf8'),
	answerTemplate = fs.readFileSync('app_modules/templates/answer.html', 'utf8');



module.exports = function(app) {	
	app.use(bodyParser.json());       // to support JSON-encoded bodies
	app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
		extended: true
	})); 

	function checkRights(req, res, next, isAdmin, isGame, isQuestion){
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
					res.send(_.template(startGameTemplate)());
					res.end();
				}else{
					// юзеру показываем сообщение
					res.send(_.template(gameNotStartedTemplate)());
					res.end();
				}
			}
		} else{
			res.send(_.template(loginTemplate)());
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
		res.send(_.template(loginTemplate)());
		res.end();
	});
	app.get('/results', checkUser, function (req, res, next) {
		var state = getState(req);
		state.results = game.getResults(users.getUsers())
		res.send(_.template(resultsTemplate)(state));
		res.end();
	});
	app.get('/question', checkAdminGame, function (req, res, next) {
		res.send(_.template(questionTemplate)(getState(req)));
		res.end();
	});
	app.get('/admin', checkAdminGame, function (req, res, next) {
		res.send(_.template(adminTemplate)(getState(req)));
		res.end();
	});
	app.get('/user', checkUserGame, function (req, res, next) {
		res.send(_.template(userTemplate)(getState(req)));
		res.end();
	});
	app.get('/answerState', checkUserGame, function (req, res, next) {
		res.send(_.template(answerStateTemplate)(getState(req)));
		res.end();
	});
	// POSTS
	app.post('/question', checkAdminGame, function (req, res, next) {
		game.startQuestion(req.body);
		console.log(game.getResults(users.getUsers()))
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
			res.send(_.template(loginTemplate)());
		}
		res.end();
	});
	return;
	//app.use(compress()); 

	
	
	
    app.post('/logoff', auth.checkUser, function(req, res) {require('./logoff')(req, res,models)});
    app.post('/getMyUser', auth.checkUser, function(req, res) {require('./getMyUser')(req, res,models)});
    app.post('/createUser', auth.checkAdmin, function(req, res) {require('./createUser')(req, res,models, game)});
    app.post('/newGame', auth.checkAdmin, function(req, res) {require('./newGame')(req, res,models, game)});
    app.post('/postState', auth.checkAdmin, function(req, res) {require('./postState')(req, res,models, game)});
    app.post('/getAnswersCount', auth.checkAdmin, function(req, res) {require('./getAnswersCount')(req, res,models, game)});
    app.post('/postAnswer', auth.checkUser, function(req, res) {require('./postAnswer')(req, res,models, game)});
    app.post('/setInGame', auth.checkAdmin, function(req, res) {require('./setInGame')(req, res, models, game)});
    app.post('/confirmAnswer', auth.checkAdmin, function(req, res) {require('./confirmAnswer')(req, res, models, game)});
    app.post('/getQuestionsCount', auth.checkAdmin, function(req, res) {require('./getQuestionsCount')(req, res, models, game)});
    app.post('/getNewAnswers', auth.checkAdmin, function(req, res) {require('./getNewAnswers')(req, res, models, game)});
    app.post('/getNewAnswersCount', auth.checkAdmin, function(req, res) {require('./getNewAnswersCount')(req, res, models, game)});
    app.post('/getState', auth.checkUser, function(req, res) {require('./getState')(req, res, models, game)});
    app.post('/getResults', auth.checkUser, function(req, res) {require('./getResults')(req, res, models, game)});
    app.post('/getUsers', auth.checkAdmin, function(req, res) {require('./getUsers')(req, res, models, game)});
    //app.post('/getCurrentAdminGame', /*auth.checkUser,*/ function(req, res) {require('./getCurrentAdminGame')(req, res,models, game)});
	app.post('/login', auth.loginUser);
	app.post('/register', auth.registerUser);
	// страница пользователя
	app.get('/user', function(req, res) {
		res.send("3");
		return;
		if(!req.user){return res.redirect('/login')}
		res.send(req.user);
	});	
	
};