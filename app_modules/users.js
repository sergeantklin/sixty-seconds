var _ = require('underscore');
var users = [{
	id:2,
	username:"user",
	password:'123'
},{
	id:1,
	username:"admin",
	password:'123',
	isAdmin:true
}]
var getUserBySession = function(session) {
	return _.findWhere(users,{
		id:session.userId
	});
};
var getUserById = function(id) {
	return getUserBySession({userId:id})
};
var loginUser = function(data) {
	return _.findWhere(users,{
		username:data.username, 
		password:data.password
	});
}
//-------------
var registerUser = function(req, res) {
	models.users.findById(0).then(function(user) {
		if (!user) {
			res.send(JSON.stringify({ 
				Error: 'Такой пользователь не найден', 
			}));
		} else {
			if (req.body.password === user.password) {
				req.session.userId = user.id;
				res.send(user);
			} else {
				res.send(JSON.stringify({ 
					Error: 'Такой пользователь не найден', 
				}));
			}
		}
	});
}
var checkUser = function(req, res, next) {
	//console.log('user '+req.session.user_id)
	if (req.session.user_id||(Number(req.session.user_id)===0)) {
		models.users.findById(req.session.user_id).then(function(user) {
			if (user) {
				next();
			} else {
				res.send(JSON.stringify({ 
					Error: 'Ошибка аутентификации', 
				}));
				res.end();
			}
		});
	} else {
			res.send(JSON.stringify({ 
				Error: 'Вы не зарегистрированы в системе', 
			}));
	}
};
var checkAdmin = function(req, res, next) {
	//console.log('admin '+req.session.user_id)
	if (req.session.user_id||(Number(req.session.user_id)===0)) {
		models.users.findById(req.session.user_id).then(function(user) {
			if (user&&user.dataValues.admin) {
				next();
			} else {
				res.send(JSON.stringify({ 
					Error: 'Вы не обладаете требуемыми правами', 
				}));
				res.end();
			}
		});
	} else {
			res.send(JSON.stringify({ 
				Error: 'Вы не зарегистрированы в системе', 
			}));
	}
};
module.exports = {
	getUserBySession:getUserBySession,
	getUserById:getUserById,
	loginUser:loginUser
}