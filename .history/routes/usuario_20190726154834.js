var express = require('express')
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autentificacion');

var app = express();

var Usuario = require('../models/usuario');

// ===============================
// Obtener todos los usuarios
// ===============================
app.get('/', (req, res, next) => {

  // variable para la paginacion y la harcodeamos a numbero obligatorio.
  var desde = req.query.desde || 0;
  desde = Number(desde);

  Usuario.find({}, 'nombre email img role google')
    // con skip salta a donde queramos en la paginacion.
    .skip(desde)
    // Con limit paginamos los resultados en el numero que deseemos.
    .limit(5)
    .exec(
      (err, usuarios) => {

        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error cargando usuarios!',
            errors: err
          });
        }

        // variable para mostrar el contador del total.
        Usuario.count({}, (err, conteo) =>{

          if (err) {
            return res.status(500).json({
              ok: false,
              mensaje: 'Error cargando paginación de usuarios!',
              errors: err
            });
          }
          
          res.status(200).json({
            ok: true,
            usuarios: usuarios,            
            total: conteo
          });
        });

      });
});

// ===============================
// Acturalizar usuarios
// ===============================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

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
    usuario.email = body.email;
    usuario.role = body.role;

    usuario.save((err, usuarioGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar el usuario',
          errors: err
        });
      }

      usuarioGuardado.password = ':)';
      
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
  });

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
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

  var id = req.params.id;

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