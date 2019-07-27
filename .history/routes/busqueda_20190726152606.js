var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// ====================================
// Busqueda por colección
// ====================================

app.get('/coleccion/:tabla/:busqueda', (req, res) => {

  var busqueda = req.params.busqueda;
  var tabla = req.params.tabla;
  // Expresión regular para que la busqueda sea insensible al keySensitive.
  var regex = new RegExp(busqueda, 'i');
  var promesa;

  switch (tabla) {
    case 'usuarios':
      promesa = buscarUsuarios(busqueda, regex);
      break;
    case 'medicos':
      promesa = buscarMedicos(busqueda, regex);
      break;
    case 'hospitales':
      promesa = buscarHospitales(busqueda, regex);
      break;
    default:
      return res.status(400).json({
        ok: false,
        mensaje: 'Tipos de busqueda sólo son: usuarios, medicos y hospitales',
        error: { message: 'Tipo de tabla/colección no válido' }
      });
  }

  promesa.then(data => {
    res.status(200).json({
      ok: true,
      // Al ponerlo entre llaves manda el nombre dinamicamente y no en literal de 'tabla'.
      [tabla]: data
    });
  });

});

// ====================================
// Busqueda general
// ====================================

app.get('/todo/:busqueda', (req, res, next) => {

  var busqueda = req.params.busqueda;
  // Expresión regular para que la busqueda sea insensible al keySensitive.
  var regex = new RegExp(busqueda, 'i');

  // Mandamos todas las promesas a la vez, se controla en caso de error(catch).
  Promise.all([
    buscarHospitales(busqueda, regex),
    buscarMedicos(busqueda, regex),
    buscarUsuarios(busqueda, regex)
  ])
    .then(respuestas => {
      res.status(200).json({
        ok: true,
        hospitales: respuestas[0],
        medicos: respuestas[1],
        usuarios: respuestas[2]
      });
    });

});

// Hacemos una promesa para que el servicio de busqueda se asincrono y poder buscar en varios servicios.
function buscarHospitales(busqueda, regex) {

  return new Promise((resolve, reject) => {

    Hospital.find({ nombre: regex })
      // populate y exec es para buscar en otras listas (la de usuario en este caso).
      .populate('usuario', 'nombre email img')
      .exec((err, hospitales) => {
        if (err) {
          reject('Error al cargar hospitales', err);
        } else {
          resolve(hospitales);
        }
      });
  });
}

// Hacemos una promesa para que el servicio de busqueda se asincrono y poder buscar en varios servicios.
function buscarMedicos(busqueda, regex) {

  return new Promise((resolve, reject) => {
    Medico.find({ nombre: regex })
      .populate('usuario', 'nombre email img')
      .populate('hospital')
      .exec((err, medicos) => {

        if (err) {
          reject('Error al cargar medicos', err);
        } else {
          resolve(medicos)
        }
      });
  });
}

// Hacemos una promesa para que el servicio de busqueda se asincrono y poder buscar en varios servicios.
// En este caso vamos a buscar en las dos tablas simultaneamente.
function buscarUsuarios(busqueda, regex) {

  return new Promise((resolve, reject) => {

    Usuario.find({}, 'nombre email role img')
      .or([{ 'nombre': regex }, { 'email': regex }])
      .exec((err, usuario) => {

        if (err) {
          reject('Error al cargar usuarios', err);
        } else {
          resolve(usuario);
        }
      });
  });
}

module.exports = app;