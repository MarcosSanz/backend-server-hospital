var express = require('express');

var mdAutenticacion = require('../middlewares/autentificacion');

var app = express();

var Hospital = require('../models/hospital');

// ===============================
// Obtener todos los hospitales
// ===============================
app.get('/', (req, res, next) => {

  // variable para la paginacion y la harcodeamos a numbero obligatorio.
  var desde = req.query.desde || 0;
  desde = Number(desde);

  Hospital.find({})
    // con skip salta a donde queramos en la paginacion.
    .skip(desde)
    // Con limit paginamos los resultados en el numero que deseemos.
    .limit(5)
    // Con populate obtenemos los datos que queremos visualizar 
    .populate('usuario', 'nombre mail')
    .exec(
      (err, hospitales) => {

        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error cargando hospital',
            errors: err
          });
        }
        // variable para mostrar el contador del total.
        Hospital.count({}, (err, conteo) =>{
          if (err) {
            return res.status(500).json({
              ok: false,
              mensaje: 'Error cargando paginación de hospitales',
              errors: err
            });
          }          
          res.status(200).json({
            ok: true,
            hospitales: hospitales,            
            total: conteo
          });
        });
      });
});

// ===============================
// Acturalizar hospitales
// ===============================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

  var id = req.params.id;
  var body = req.body;

  Hospital.findById(id, (err, hospital) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar el hospital',
        errors: err
      });
    }
    if (!hospital) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El hospital con el id: ' + id + ' no existe',
        errors: { message: 'No existe un hospital con ese ID' }
      });
    }

    hospital.nombre = body.nombre;
    hospital.usuario = req.usuario._id;

    hospital.save((err, hospitalGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar el hospital',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        hospital: hospitalGuardado
      });

    });

  });
});

// ===============================
// Crear un nuevo hospital
// ===============================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

  var body = req.body;
  var hospital = new Hospital({
    nombre: body.nombre,
    usuario: req.usuario._id
  })

  hospital.save((err, hospitalGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear hospital',
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      hospital: hospitalGuardado
    });
  });

});

// ===============================
// Borrar un hospital usando el ID
// ===============================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

  var id = req.params.id;

  Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al borrar hospital',
        errors: err
      });
    }
    if (!hospitalBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No existe un hospital con ese id',
        errors: { message: 'No existe un hospital con ese id' }
      });
    }
    res.status(200).json({
      ok: true,
      hospital: hospitalBorrado
    });
  });

});

module.exports = app;