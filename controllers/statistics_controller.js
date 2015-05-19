var models = require('../models/models.js');

//GET /quizes/statistics
exports.statistics = function(req, res){
  models.Quiz.findAll().then(function(quizes){
    var numPregs = quizes.length;
    models.Comment.findAll().then(function(comments){
      var numComentarios = comments.length;
      var media = numComentarios/numPregs;
      var sinComments = 0;
      var conComments = 0;
      var array=[];
      for(var i=0; i<numComentarios; i++){ // recorro la tabla de comentarios y meto en cada índice del array[i] cuantos comentarios tiene la pregunta número i 
        if(array[comments[i].QuizId]){ // si no es el primer comentario con ese QuizId, aumento en 1 array[QuizId]
          array[comments[i].QuizId]++;
        }else{ // si es el primer comentario con ese QuizId, pongo a 1 array[QuizId]
          array[comments[i].QuizId] = 1;
        }
      }
      for(var i=1; i<=numPregs; i++){ // recorro la tabla de preguntas
        if(array[i]){ // si había comentarios en esa pregunta (es decir, guardé un array[i]!=undefined), conComments++
          conComments++;
        } else{
          sinComments++;
        }
      }
      res.render('quizes/statistics', {quizes: quizes, preguntas: numPregs, comentarios: numComentarios, media: media, sinComments: sinComments, conComments: conComments, errors: []});
    }).catch(function(error){next(error);})
  }).catch(function(error){next(error);})
};