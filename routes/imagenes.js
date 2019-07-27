var express = require('express');

var app = express();
var path = require('path');
var fs = require('fs');

app.get('/:tipo/:img', (req, res, next) => {

  var tipo = req.params.tipo;
  var img = req.params.img;

  // var path = `./uploads/${ tipo }/${ img }`;
  //   fs.exists(path, existe => {
  //       if (!existe) {
  //           path = './assets/no-img.jpg';
  //       }
  //       res.sendfile(path);
  //   });

  var pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${img}`);
  if (fs.existsSync(pathImagen)) {
    res.sendFile(pathImagen);
  } else {
    var pathNoImagen = path.resolve(__dirname, '../assets/no-img.jpg');
    res.sendFile(pathNoImagen);
  }
});

module.exports = app;