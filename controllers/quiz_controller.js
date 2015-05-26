var models = require('../models/models.js');

//MW que permite acciones solamente si el quiz objeto pertenece al usuario logueado o si es cuenta admin
exports.ownershipRequired = function(req, res, next) {
  var objQuizOwner = req.quiz.UserId;
  var logUser = req.session.user.id;
  var isAdmin = req.session.user.isAdmin;
  if (isAdmin || (objQuizOwner === logUser)) {
    next();
  }
  else {
    res.redirect('/');
  }
};

// Autoload :id
exports.load = function(req, res, next, quizId) {
  models.Quiz.find({
            where: {
                id: Number(quizId)
            },
            include: [{
                model: models.Comment
            }]
        }/*quizId*/).then(function(quiz) {
      if (quiz) {
        req.quiz = quiz;
        next();
      } else{next(new Error('No existe quizId=' + quizId))}
    }
  ).catch(function(error){next(error)});
};

// GET /quizes
exports.index = function(req, res) {
  var favs = [];
  if (req.query.search===undefined) {
    models.Quiz.findAll().then(
      function(quizes) {
        models.Fav.findAll().then(function(favoritos){
        for(index in quizes) {
          for(posicion in favoritos) {
            if (req.session && req.session.user && (favoritos[posicion].UserId === req.session.user.id) && (favoritos[posicion].QuizId === quizes[index].id)) {
              favs[index] = true;
              break;
            }
            else {
              favs[index] = false;
            }
          }
        }
        res.render('quizes/index.ejs', {quizes: quizes, fav:false, favs:favs, models:models, errors: []});
      })
    }).catch(function(error){next(error)});
  }
  else {
    models.Quiz.findAll({where:["pregunta like ?", "%"+req.query.search.replace(/\s/g,"%")+"%"], order: 'pregunta ASC'}).then(function(quizes) {
      models.Fav.findAll().then(function(favoritos){
      for(index in quizes) {
        for(posicion in favoritos) {
          if (req.session && req.session.user && (favoritos[posicion].UserId === req.session.user.id) && (favoritos[posicion].QuizId === quizes[index].id)) {
            favs[index] = true;
            break;
          }
          else {
            favs[index] = false;
          }
        }
      }
      res.render('quizes/index.ejs', { quizes: quizes, fav:false, favs:favs, models:models, errors: []});
     })
    }).catch(function(error) { next(error);})
  }
};

// GET /quizes/:userId/quizes
exports.myQuestions = function(req, res) {
  var options = {};
  var favs = [];
  if (req.user) { //req.user es creado por autoload de usuario si la ruta lleva el parametro .quizId
    options.where = {UserId:req.user.id}
  }
  models.Quiz.findAll(options).then(
    function(quizes) {
      models.Fav.findAll().then(function(f){
      for(index in quizes) {
        for(indexx in f) {
          if (req.session && req.session.user && (f[indexx].UserId === req.session.user.id) && (f[indexx].QuizId === quizes[index].id)) {
            favs[index] = true;
            break;
          }
          else {
            favs[index] = false;
          }
        }
      }
      res.render('quizes/index.ejs', {quizes:quizes, fav:false, favs:favs, models:models, errors: []});
    })
  }).catch(function(error){next(error)});
};

// GET /quizes/:id
exports.show = function(req, res) {
  res.render('quizes/show', { quiz: req.quiz, errors: []});
};            // req.quiz: instancia de quiz cargada con autoload

// GET /quizes/:id/answer
exports.answer = function(req, res) {
  var resultado = 'Incorrecto';
  if (req.query.respuesta === req.quiz.respuesta) {
    resultado = 'Correcto';
  }
  res.render(
    'quizes/answer',
    { quiz: req.quiz,
      respuesta: resultado,
      errors: []
    }
  );
};

// GET /quizes/new
exports.new = function(req, res) {
  var quiz = models.Quiz.build( // crea objeto quiz
    {pregunta: "Pregunta", respuesta: "Respuesta"}
  );

  res.render('quizes/new', {quiz: quiz, errors: []});
};

// POST /quizes/create
exports.create = function(req, res) {
  req.body.quiz.UserId = req.session.user.id;
  if (req.files.image) {
    req.body.quiz.image = req.files.image.name;
  }
  var quiz = models.Quiz.build( req.body.quiz );
  quiz
  .validate()
  .then(
    function(err){
      if (err) {
        res.render('quizes/new', {quiz: quiz, errors: err.errors});
      } else {
        quiz // save: guarda en DB campos pregunta y respuesta de quiz
        .save({fields: ["pregunta", "respuesta", "UserId", "image"]})
        .then( function(){ res.redirect('/quizes')})
      }      // res.redirect: Redirección HTTP a lista de preguntas
    }
  ).catch(function(error){next(error)});
};

// GET /quizes/:id/edit
exports.edit = function(req, res) {
  var quiz = req.quiz;  // req.quiz: autoload de instancia de quiz
  res.render('quizes/edit', {quiz: quiz, errors: []});
};

// PUT /quizes/:id
exports.update = function(req, res) {
  if (req.files.image) {
    req.quiz.image = req.files.image.name;
  }
  req.quiz.pregunta  = req.body.quiz.pregunta;
  req.quiz.respuesta = req.body.quiz.respuesta;

  req.quiz
  .validate()
  .then(
    function(err){
      if (err) {
        res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
      } else {
        req.quiz     // save: guarda campos pregunta y respuesta en DB
        .save({fields: ["pregunta", "respuesta", "image"]})
        .then( function(){ res.redirect('/quizes');});
      }     // Redirección HTTP a lista de preguntas (URL relativo)
    }
  ).catch(function(error){next(error)});
};

// DELETE /quizes/:id
exports.destroy = function(req, res) {
  req.quiz.destroy().then(
    function() {
        res.redirect(req.get('referer'));
  }).catch(function(error){next(error)});
};