const boom = require('@hapi/boom');

function validatorHandler(schema, property) {
  return (req, res, next) => {
    const data = req[property];
    const { error } = schema.validate(data, { abortEarly: false });
    if (error) {
      next(boom.badRequest(error));
    }
    next();
  }
}

// function validatorHandler(schema, property) {
//   return (req, res, next) => {
//     let data;


//     // Si la propiedad es 'body', combinamos el body con los archivos
//     if (property === 'body') {
//       // Si es un solo archivo, lo añadimos a req.body
//       if (req.file) {
//         data = {
//           ...req.body,
//           file: req.file  // Añadimos el archivo al cuerpo
//         };
//       } else if (req.files) {
//         // Si es múltiple archivo, los añadimos a req.body como un array de archivos
//         data = {
//           ...req.body,
//           files: req.files // Añadimos múltiples archivos al cuerpo
//         };
//       } else {
//         data = req.body;  // Si no hay archivos, solo usamos el body
//       }
//     } else {
//       data = req[property];  // Para otros casos (ej: params, query, etc.)
//     }

//     const { error } = schema.validate(data, { abortEarly: false });
//     if (error) {
//       next(boom.badRequest(error));
//     } else {
//       next();
//     }
//   }
// }

module.exports = validatorHandler;
