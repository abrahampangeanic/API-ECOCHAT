'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const targets = [
      { table: 'assistants', column: 'openai_id' },
      { table: 'collections', column: 'openai_id' },
      { table: 'collection_source', column: 'openai_id' },
      { table: 'sources', column: 'openai_id' },
      { table: 'sessions', column: 'openai_id' },
    ];

    for (const target of targets) {
      const tableDefinition = await queryInterface.describeTable(target.table);
      if (!tableDefinition[target.column]) {
        await queryInterface.addColumn(target.table, target.column, {
          type: Sequelize.STRING,
          allowNull: true,
        });
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    const targets = [
      { table: 'assistants', column: 'openai_id' },
      { table: 'collections', column: 'openai_id' },
      { table: 'collection_source', column: 'openai_id' },
      { table: 'sources', column: 'openai_id' },
      { table: 'sessions', column: 'openai_id' },
    ];

    for (const target of targets) {
      const tableDefinition = await queryInterface.describeTable(target.table);
      if (tableDefinition[target.column]) {
        await queryInterface.removeColumn(target.table, target.column);
      }
    }
  },
};
