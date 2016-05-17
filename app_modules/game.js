var _ = require('underscore');
var dict = require('./dictionary');
var questions;
var answers;
var results;
var questionsCount;
var isStarted = false;
var currentQuestion;
var questionTimeout;

var getResults = function(){
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
		
	} else{
		return ''
	}
}
var startQuestion = function(params){
	stopQuestion();
	var currentDate = new Date();
	currentQuestion = {
		id:currentDate.getTime(),
		content:params.question,
		timeout:params.timeout*10000,
		startTime:currentDate,
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
		answers = [];
		results = [];
		questionsCount = params.questions;
	}
}

module.exports = {
	isStarted:function(){return isStarted},
	hasQuestion:function(){return currentQuestion},
	getResults:getResults,
	getCurrentQuestion:getCurrentQuestion,
	startGame:startGame,
	startQuestion:startQuestion,
	stopQuestion:stopQuestion,
	recieveAnswer:recieveAnswer,
	
}