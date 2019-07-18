var express = require('express')
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

// var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');

// ===============================
// Obtener todos los usuarios
// ===============================
app.get('/', (req, res, next) => {

  Usuario.find({}, 'nombre email img role')
    .exec(
      (err, usuarios) => {

        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error cargando usuarios!',
            errors: err
          });
        }
        res.status(200).json({
          ok: true,
          usuarios: usuarios
        });

      });
});

// ===============================
// Verificar token
// ===============================

app.use('/', (req, res, next) => {

  var token = req.query.token;

  jwt.verify(token, SEED, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Token incorrecto',
        errors: err
      });
    }
    // req.usuario = decoded.usuario;
    next();
  });
});

// ===============================
// Acturalizar usuarios
// ===============================
app.put('/:id', (req, res) => {

  var id = req.params.id;
  var body = req.body;

  Usuario.findById(id, (err, usuario) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar el usuario',
        errors: err
      });
    }
    if (!usuario) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El usuario con el id: ' + id + ' no existe',
        errors: { message: 'No existe un usuario con ese ID' }
      });
    }

    usuario.nombre = body.nombre;
    usuario.emil = body.email;
    usuario.role = body.role;

    usuario.save((err, usuarioGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar el usuario',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        usuario: usuarioGuardado
      });

    });

  });
});

// ===============================
// Crear un nuevo usuario
// ===============================
app.post('/', (req, res) => {

  var body = req.body;
  var usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    img: body.img,
    role: body.role
  })

  usuario.save((err, usuarioGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear usuario',
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      usuario: usuarioGuardado,
      usuariotoken: req.usuario
    });
  });

});

// ===============================
// Borrar un usuario
// ===============================
app.delete('/:id', (req, res) => {

  var id = req.params, id;

  Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al borrar usuario',
        errors: err
      });
    }
    if (!usuarioBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No existe un usuario con ese id',
        errors: { message: 'No existe un usuario con ese id' }
      });
    }
    res.status(200).json({
      ok: true,
      usuario: usuarioBorrado
    });
  });

});

module.exports = app;