var path = require('path');

// Postgres DATABASE_URL = postgress://user:password@host:port/database
// SQLite DATABASE_URL = sqlite://:@:/
var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name = (url[6] || null);
var user    = (url[2] || null);
var pwd     = (url[3] || null);
var protocol= (url[1] || null);
var dialect = (url[1] || null);
var port    = (url[5] || null);
var host    = (url[4] || null);
var storage = process.env.DATABASE_STORAGE;

// Cargar modelo ORM
var Sequelize = require('sequelize');

// Usar BBDD SQLite o Postgress
var sequelize = new Sequelize(DB_name, user, pwd,
  { dialect: protocol,
    protocol: protocol,
    port: port,
    host: host,
    storage: storage,
    omitNull: true
    }
  );

// Importar definicion de la tabla Quiz
var quiz_path = path.join(__dirname,'quiz');
var Quiz = sequelize.import(quiz_path);

// Importar definicion de la tabla Comment
var comment_path = path.join(__dirname,'comment');
var Comment = sequelize.import(comment_path);

// Importar definicion de la tabla User
var user_path = path.join(__dirname,'user');
var User = sequelize.import(user_path);

// Importar definicion de la tabla Favourites
var fav_path = path.join(__dirname,'favourites');
var Fav = sequelize.import(fav_path);

Comment.belongsTo(Quiz); //asociación
Quiz.hasMany(Comment);

//los quizes pertenecen a un usuario registrado
Quiz.belongsTo(User);
User.hasMany(Quiz);

//asociación de usuarios con sus preguntas favoritas
User.belongsToMany(Quiz, {through: 'Fav'});
Quiz.belongsToMany(User, {through: 'Fav'});

exports.Quiz = Quiz; //exportar definición de la tabla Quiz
exports.Comment = Comment; //exportar definición de la tabla Comment
exports.User = User; //exportar definición de la tabla User
exports.Fav = Fav; //exportar definición de la tabla
//sequelize.sync() carga e inicializa tabla de preguntas en BD
sequelize.sync().then(function() {
  //success(..) ejecuta el manejador una vez creada la tabla
  User.count().then(function(count) {
    if (count === 0) {
      User.bulkCreate(
        [ {username: 'admin',   password: 'vero',   isAdmin: true},
          {username: 'pepe',    password: 'pepe'}
        ]
      ).then(function(){
        console.log('Tabla de usuarios inicializada');
        Quiz.count().then(function(count) {
          if (count === 0) { //la tabla se inicializa solo si está vacía
            Quiz.bulkCreate(
              [ {pregunta: 'Capital de Italia',       respuesta: 'Roma',            UserId: '2',  image:null},
                {pregunta: 'Capital de Portugal',     respuesta: 'Lisboa',          UserId: '2',  image:null},
                {pregunta: 'Quién descubrió América', respuesta: 'Cristóbal Colón', UserId: '2',  image:null}
              ]
            ).then(function() {console.log('Base de datos inicializada')});
          };
        });
      });
    };
  });
});