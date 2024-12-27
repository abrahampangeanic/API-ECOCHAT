const express = require('express');
const passport = require('passport');
const boom = require('@hapi/boom');

const CollectionSourceService = require('../services/collectionsource.service');
const service = new CollectionSourceService();
const InstanceService = require('../services/instance.service');
const instanceServ = new InstanceService();
const PipelineService = require('../services/pipeline.service');
const pipelineServ = new PipelineService();

const validatorHandler = require('../middlewares/validator.handler');
const { getInstanceSchema} = require('../schemas/instance.schema');
const { getCollectionSourceSchema, createCollectionSourceSchema } = require('../schemas/collectionsources.schema');

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: CollectionSources
 *   description: Endpoints para gestionar fuentes de colecciones
 */

/**
 * @swagger
 * /instances/{instanceId}/collectionsources:
 *   post:
 *     summary: Obtener todas las fuentes de colecciones de una instancia
 *     tags: [CollectionSources]
 *     description: Recupera una lista de fuentes de colecciones asociadas a una instancia específica. Requiere autenticación con token JWT.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: instanceId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la instancia
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - collectionId
 *               - sourceId
 *             properties:
 *               collectionId:
 *                 type: string
 *                 description: ID de la colección a actualizar.
 *               sourceId:
 *                 type: string
 *                 description: ID de la fuente a actualizar.
 *           example:
 *             collectionId: "123e4567-e89b-12d3-a456-426614174000"
 *             sourceId: "123e4567-e89b-12d3-a456-426614174001"
 *     responses:
 *       200:
 *         description: Lista de fuentes de colecciones obtenida correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:  
 *                     type: number
 *                     example: 1
 *                   collectionId:                    
 *                     type: string
 *                     example: "123e4567-e89b-12d3-a456-426614174000"
 *                   sourceId:
 *                     type: string
 *                     example: "123e4567-e89b-12d3-a456-426614174001"
 *       401:
 *         description: No autorizado. El token JWT es inválido o el usuario no tiene permisos.
 *       403:
 *         description: Prohibido. El usuario no tiene acceso a esta instancia.
 *       500:
 *         description: Error interno del servidor.
 */
router.post('/',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getInstanceSchema, 'params'),
  validatorHandler(createCollectionSourceSchema, 'body'),
  async (req, res, next) => {
    try {
        const { instanceId  } = req.params;
        const userId = req.user.sub;

        if(req.user.role !== 'SUPER') {
          const relationships = await instanceServ.checkInstancesByUser(instanceId, userId);
          if(relationships.length === 0) throw boom.unauthorized();
        }

        const body = req.body;
        const collection = await service.create(body);

        const collectionSourcePipiline = {
          collection_id: body.collectionId,
          document_ids: [ body.sourceId]
        }

        await pipelineServ.addCollectionSource(collectionSourcePipiline);

        res.status(201).json(collection);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /instances/{instanceId}/collectionsources/{id}:
 *   delete:
 *     summary: Elimina un sources de una coleccion
 *     description: |
 *       Este endpoint permite eliminar un source de una colección específica por su `Id` y su `instanceId`.
 *       Requiere autenticación con JWT y roles específicos.
 *     tags: [AssistantCollections]
 *     parameters:
 *       - in: path
 *         name: instanceId
 *         required: true
 *         description: El ID de la instancia .
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         description: El ID de la colección a eliminar.
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Source de colección eliminada
 *         content:
 *           application/json:
 *             schema:  
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: AssistantCollection deleted
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Acceso denegado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Access Denied
 *       404:
 *         description: Colección de asistentes no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Instance not found
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */
router.delete('/:id',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getCollectionSourceSchema, 'params'),
  async (req, res, next) => {
    try {
      const { instanceId, id } = req.params;
      const userId = req.user.sub;
      if(req.user.role !== 'SUPER') {
        const relationships = await instanceServ.checkInstancesByUser(instanceId, userId);
        if(relationships.length === 0) throw boom.unauthorized();
      }

      const deleteCS = await service.delete(id);

      const collectionSourcePipiline = {
        collection_id: deleteCS.collectionId,
        document_ids: [ deleteCS.sourceId]
      }

      const rta = await pipelineServ.deleteCollectionSource(collectionSourcePipiline);
      console.log("res pipeline delete CollectionSource", rta)

      res.status(201).json({id});
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

