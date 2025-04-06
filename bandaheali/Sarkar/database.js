import { Sequelize, DataTypes } from 'sequelize';
import path from 'path';

const dbPath = path.join(process.cwd(), 'antidelete.db');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false
});

const DeletedMessage = sequelize.define('DeletedMessage', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  content: DataTypes.TEXT,
  media: DataTypes.BLOB,
  type: DataTypes.STRING,
  mimetype: DataTypes.STRING,
  sender: DataTypes.STRING,
  senderFormatted: DataTypes.STRING,
  timestamp: DataTypes.BIGINT,
  chatJid: DataTypes.STRING
}, {
  freezeTableName: true,
  timestamps: false
});

const Settings = sequelize.define('Settings', {
  enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  path: {
    type: DataTypes.STRING,
    defaultValue: 'inbox'
  }
}, {
  freezeTableName: true,
  timestamps: false
});

// Initialize database
(async () => {
  try {
    await sequelize.sync();
    await Settings.findOrCreate({ where: { id: 1 } });
    console.log('Database ready');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
})();

export { DeletedMessage, Settings, sequelize };
