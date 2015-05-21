// Definición del modelo de User-Quiz y encriptación de contraseñas
var crypto = require('crypto');
var key = process.env.PASSWORD_ENCRYPTION_KEY;

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define(
    'User',
    { username: {
        type: DataTypes.STRING,
        unique: true,
        validate: {
          notEmpty: {msg: "-> Falta Usuario"},
          //devuelve error si el usuario ya está cogido
          isUnique: function(value, next) {
            var self = this;
            User
            .find({where: {username: value}})
            .then(function(user) {
              if (user && self.id !== user.id) {
                return next('Usuario en uso');
              }
              return next();
            }).catch(function(err) {return next(err);});
          }
        }
      },
      password: {
        type: DataTypes.STRING,
        validate: { notEmpty: {msg: "-> Falta Contraseña"}},
        set: function(password) {
          var encr = crypto
                      .createHmac('sha1', key)
                      .update(password)
                      .digest('hex');
          //evita passwords vacíos
          if (password === '') {encr = '';}
          this.setDataValue('password', encr);
        }
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {
      instanceMethods: {
        verifyPassword: function(password) {
          var encr = crypto
                      .createHmac('sha1', key)
                      .update(password)
                      .digest('hex');
          return encr === this.password;
        }
      }
    }
  );
  return User;
}