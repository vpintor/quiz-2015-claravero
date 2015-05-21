var express = require('express');
var router = express.Router();

var quizController = require('../controllers/quiz_controller');
var commentController = require('../controllers/comment_controller');
var sessionController = require('../controllers/session_controller');
var statisticsController = require('../controllers/statistics_controller');
var userController = require('../controllers/user_controller');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Quiz Edav', errors: [] });
});

/*
router.get('/quizes/question', quizController.question);
router.get('/quizes/answer',   quizController.answer);
*/

// Autoload de comandis con: quizId
router.param('quizId', quizController.load);   // autoload: quizId
router.param('commentId', commentController.load);  // autoload :commentId
router.param('userId', userController.load); //autoload :userId

// Definición de rutas de /quizes
router.get('/quizes',                               quizController.index);
router.get('/quizes/:quizId(\\d+)',                 quizController.show);
router.get('/quizes/:quizId(\\d+)/answer',          quizController.answer);
router.get('/quizes/new',                           sessionController.loginRequired, quizController.new);
router.post('/quizes/create',                       sessionController.loginRequired, quizController.create);
router.get('/quizes/:quizId(\\d+)/edit',            sessionController.loginRequired, quizController.edit);
router.put('/quizes/:quizId(\\d+)',                 sessionController.loginRequired, quizController.update);
router.delete('/quizes/:quizId(\\d+)',              sessionController.loginRequired, quizController.destroy);

//comentarios
router.get('/quizes/:quizId(\\d+)/comments/new',    commentController.new);
router.post('/quizes/:quizId(\\d+)/comments',       commentController.create);
router.get('/quizes/:quizId(\\d+)/comments/:commentId(\\d+)/publish', sessionController.loginRequired, commentController.publish);

// Definición de rutas de sesion
router.get('/login',                                sessionController.new);     // formulario login
router.post('/login',                               sessionController.create);  // crear sesión
router.get('/logout',                               sessionController.destroy); // destruir sesión

//definicion de la ruta de estadísticas
router.get('/quizes/statistics',                    statisticsController.statistics);

//definición de las rutas de cuentas
router.get('/user',                                 userController.new); //formulario sign up
router.post('/user',                                userController.create); //registrar usuario
router.get('/user/:userId(\\d+)/edit',              sessionController.loginRequired, userController.edit);
router.put('/user/:userId(\\d+)',                   sessionController.loginRequired, userController.update);
router.delete('/user/:userId(\\d+)',                 sessionController.loginRequired, userController.destroy);

module.exports = router;