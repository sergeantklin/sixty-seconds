var _ = require('underscore');
var dict = require('./dictionary');
var questions;
var questionsCount;
var isStarted = false;
var currentQuestion;
var questionTimeout;

var getResults = function(users){
	var results = [];
	_.each(users,function(user){
		var userResult = [];
		for(var i=0; i<questionsCount; i++){
			var question = i>questions.length-1?{answers:{}}:questions[i];
			userResult.push(question.answers[user.id]||{result:dict.answerResults.noAnswer});
		}
		results.push(userResult);
	})
	return results;
}
var getCurrentQuestion = function(){
	if(!currentQuestion){
		return;
	}
	currentQuestion.timeLeft = currentQuestion.timeout - (new Date().getTime() - currentQuestion.startTime);
	return currentQuestion;
}

var stopQuestion = function(){
	clearTimeout(questionTimeout);
	questionTimeout = null;
	currentQuestion = null;
}
var recieveAnswer = function(userId, answer){
	var questionId = answer.questionId;
	var currentQuestion = getCurrentQuestion();
	if(currentQuestion&&currentQuestion.id==answer.questionId){
		var currentAnswer = currentQuestion.answers[userId];
		if(currentAnswer){
			return dict.answerStates.duplicated;
		} else{
			currentQuestion.answers[userId] = {
				answer:answer.answer,
				result:dict.answerResults.waiting
			}
		}
	} else{
		return dict.answerStates.ignored;
	}
	return dict.answerStates.recieved;
}
var startQuestion = function(params){
	stopQuestion();
	var currentDate = new Date();
	currentQuestion = {
		id:currentDate.getTime(),
		content:params.question,
		timeout:params.timeout*10000,
		startTime:currentDate,
		answers:{}
	};
	questions.push(currentQuestion);
	questionTimeout = setTimeout(function(){
		stopQuestion();
	},currentQuestion.timeout);
}
var startGame = function(params){
	if(!isStarted){
		isStarted = true;
		currentQuestion = null;
		questions = [];
		questionsCount = params.questions;
	}
}

module.exports = {
	isStarted:function(){return isStarted},
	hasQuestion:function(){return currentQuestion},
	getQuestionsCount:function(){return questionsCount},
	getResults:getResults,
	getCurrentQuestion:getCurrentQuestion,
	startGame:startGame,
	startQuestion:startQuestion,
	stopQuestion:stopQuestion,
	recieveAnswer:recieveAnswer,
	
}