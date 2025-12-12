const express = require('express');
const passport = require('passport');
const boom = require('@hapi/boom');
const fs = require('fs');

const SourceService = require('../../services/source.service');
const sourceService = new SourceService();
const InstanceService = require('../../services/instance.service');
const instanceServ = new InstanceService();
const DocumentService = require('../../services/document.service');
const documentServ = new DocumentService();

const CollectionSourceService = require('../../services/collectionsource.service');
const collectionSourceServ = new CollectionSourceService();
const CollectionService = require('../../services/collection.service');
const collectionServ = new CollectionService();

const validatorHandler = require('../../middlewares/validator.handler');
const uploadhandler = require('../../middlewares/upload.handler');
const { getInstanceSchema } = require('../../schemas/instance.schema');
const {
  getSourceSchema,
  createSourceSchema,
  createSourceFileSchema,
} = require('../../schemas/source.schema');
const { OpenAIManager } = require('../../libs/openai');
const openaiManager = new OpenAIManager();

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getInstanceSchema, 'params'),
  async (req, res, next) => {
    try {
      const { instanceId } = req.params;
      const userId = req.user.sub;
      if (req.user.role !== 'SUPER') {
        const relationships = await instanceServ.checkInstancesByUser(
          instanceId,
          userId
        );
        if (relationships.length === 0) throw boom.unauthorized();
      }

      const source = await sourceService.findByInstance(instanceId);
      res.json(source);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getSourceSchema, 'params'),
  async (req, res, next) => {
    try {
      const { instanceId, id } = req.params;
      const userId = req.user.sub;

      if (req.user.role !== 'SUPER') {
        const relationships = await instanceServ.checkInstancesByUser(
          instanceId,
          userId
        );
        if (relationships.length === 0) throw boom.unauthorized();
      }

      const instance = await sourceService.findOne(id);
      res.json(instance);
    } catch (error) {
      next(error);
    }
  }
);

// CREATE SOURCE FILE
router.post(
  '/file',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getInstanceSchema, 'params'),
  uploadhandler,
  validatorHandler(createSourceFileSchema, 'body'),
  async (req, res, next) => {
    try {
      const { instanceId } = req.params;
      const userId = req.user.sub;
      const files = req.files;
      if (req.user.role !== 'SUPER') {
        const relationships = await instanceServ.checkInstancesByUser(
          instanceId,
          userId
        );
        if (relationships.length === 0) throw boom.unauthorized();
      }

      for (const file of files) {
        const body = { ...req.body }; // Clone body object
        body.instanceId = instanceId;
        body.sourcetype = 'FILE';
        let totalSizeKB =
          files.reduce((total, file) => total + file.size, 0) / 1024; //files in KB
        if (totalSizeKB < 1) totalSizeKB = 1;
        body.storage_size = totalSizeKB;

        const filePath = `uploads/${instanceId}/${file.filename}`;
        const new_name = file.filename;
        const old_name = new_name.substr(14);

        fs.rename(file.path, filePath, async (err) => {
          if (err)
            return res.status(500).json({ error: 'Failed to store the file' });

          const fileInfo = await openaiManager.uploadFile(filePath);

          body.openai_id = fileInfo.fileId;
          body.indexstatus = 4; // INDEX SUCCESS
          const source = await sourceService.create(body);

          const documentInfo = {
            url: filePath,
            newname: new_name,
            oldname: old_name,
            state: 0,
            sourceId: source.id,
          };

          await documentServ.create(documentInfo);
        });
      }

      res.status(201).json({ message: 'Source created successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// CREATE SOURCE WEB
router.post(
  '/web',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getInstanceSchema, 'params'),
  validatorHandler(createSourceSchema, 'body'),
  async (req, res, next) => {
    try {
      const { instanceId } = req.params;
      const userId = req.user.sub;
      if (req.user.role !== 'SUPER') {
        const relationships = await instanceServ.checkInstancesByUser(
          instanceId,
          userId
        );
        if (relationships.length === 0) throw boom.unauthorized();
      }

      const body = req.body;
      body.instanceId = instanceId;
      body.indexstatus = 4; // INDEX SUCCESS
      const source = await sourceService.create(body);

      res.status(201).json(source);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE SOURCE
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getSourceSchema, 'params'),
  async (req, res, next) => {
    try {
      const { instanceId, id } = req.params;
      const userId = req.user.sub;

      if (req.user.role !== 'SUPER') {
        const relationships = await instanceServ.checkInstancesByUser(
          instanceId,
          userId
        );
        if (relationships.length === 0) throw boom.unauthorized();
      }

      const source = await sourceService.findOne(id);
      if (!source) throw boom.notFound('Source not found');

      if (source.sourcetype === 'FILE') {
        const collectionSources = await collectionSourceServ.findAllBySource(
          id
        );
        if (collectionSources.length > 0) {
          for (const collectionSource of collectionSources) {
            const collection = await collectionServ.findOne(
              collectionSource.collectionId
            );
            if (!collection) throw boom.notFound('Collection not found');
            const vectorStoreFile = await openaiManager.deleteVectorStoreFile(
              collection.openai_id,
              source.openai_id
            );
            if (!vectorStoreFile)
              throw boom.notFound('Vector store file not deleted');
          }
        }
        const vectorStoreFile = await openaiManager.deleteFile(
          source.openai_id
        );
        if (!vectorStoreFile)
          throw boom.notFound('Vector store file not deleted');
      }

      console.log('Eliminating source', id);
      await sourceService.delete(id);

      res.status(201).json({ id });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
