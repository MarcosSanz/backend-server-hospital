var express = require('express');

var mdAutenticacion = require('../middlewares/autentificacion');

var app = express();

var Medico = require('../models/medico');

// ===============================
// Obtener todos los medicos
// ===============================
app.get('/', (req, res, next) => {

  // variable para la paginacion y la harcodeamos a numbero obligatorio.
  var desde = req.query.desde || 0;
  desde = Number(desde);

  Medico.find({})
    // con skip salta a donde queramos en la paginacion.
    .skip(desde)
    // Con limit paginamos los resultados en el numero que deseemos.
    .limit(5)
    // Con populate obtenemos los datos que queremos visualizar 
    .populate('usuario', 'nombre mail')
    .populate('hospital')
    .exec(
      (err, medicos) => {

        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error cargando medico',
            errors: err
          });
        }

        // variable para mostrar el contador del total.
        Medico.count({}, (err, conteo) =>{
          if (err) {
            return res.status(500).json({
              ok: false,
              mensaje: 'Error cargando paginación de medicos',
              errors: err
            });
          }          
          res.status(200).json({
            ok: true,
            medicos: medicos,            
            total: conteo
          });
        });

      });
});

// ===============================
// Actualizar medicos
// ===============================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

  var id = req.params.id;
  var body = req.body;

  Medico.findById(id, (err, medico) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar el medico',
        errors: err
      });
    }
    if (!medico) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El medico con el id: ' + id + ' no existe',
        errors: { message: 'No existe un medico con ese ID' }
      });
    }

    medico.nombre = body.nombre;
    medico.usuario = req.usuario._id;
    medico.hospital = body.hospital;

    medico.save((err, medicoGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar el medico',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        medico: medicoGuardado
      });

    });

  });
});

// ===============================
// Crear un nuevo medico
// ===============================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

  var body = req.body;
  var medico = new Medico({
    nombre: body.nombre,
    usuario: req.usuario._id,
    hospital: body.hospital
  })

  medico.save((err, medicoGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear medico',
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      medico: medicoGuardado
    });
  });

});

// ===============================
// Borrar un medico usando el ID
// ===============================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

  var id = req.params.id;

  Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al borrar medico',
        errors: err
      });
    }
    if (!medicoBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No existe un medico con ese id',
        errors: { message: 'No existe un medico con ese id' }
      });
    }
    res.status(200).json({
      ok: true,
      medico: medicoBorrado
    });
  });

});

module.exports = app;