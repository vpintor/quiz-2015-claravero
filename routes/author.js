var express = require('express');
var router = express.Router();

// Página de entrada (home page)
router.get('/', function(req, res) {
  res.render('author', { title: 'Author', errors: []});
});

module.exports = router;