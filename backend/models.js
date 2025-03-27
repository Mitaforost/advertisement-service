const { Sequelize, DataTypes } = require('sequelize');
const config = require('./config');

// Инициализация sequelize
const sequelize = new Sequelize({
    dialect: config.dialect,
    host: config.host,
    username: config.username,
    password: config.password,
    database: config.database,
    logging: config.logging
});

// Определение моделей
const User = sequelize.define('User', {
    username: { type: DataTypes.STRING(50), unique: true, allowNull: false },
    password: { type: DataTypes.STRING(255), allowNull: false },
    email: { type: DataTypes.STRING(100), unique: true, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
}, { tableName: 'users', timestamps: false });

const Category = sequelize.define('Category', {
    name: { type: DataTypes.STRING(100), unique: true, allowNull: false },
}, { tableName: 'categories', timestamps: false });

const Ad = sequelize.define('Ad', {
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    category_id: { type: DataTypes.INTEGER },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    location: { type: DataTypes.STRING(255) },
    created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
}, { tableName: 'ads', timestamps: false });

const AdImage = sequelize.define('AdImage', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    ad_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'ads',
            key: 'id'
        }
    },
    image_url: {
        type: DataTypes.STRING(255),
        allowNull: false
    }
}, {
    tableName: 'ad_images',
    timestamps: false
});

const Message = sequelize.define('Message', {
    sender_id: { type: DataTypes.INTEGER, allowNull: false },
    receiver_id: { type: DataTypes.INTEGER, allowNull: false },
    ad_id: { type: DataTypes.INTEGER, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    sent_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'messages', timestamps: false });

const Favorite = sequelize.define('Favorite', {
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    ad_id: { type: DataTypes.INTEGER, allowNull: false },
    added_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
}, { tableName: 'favorites', timestamps: false });

const AdView = sequelize.define('AdView', {
    ad_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER },
    viewed_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
}, { tableName: 'ad_views', timestamps: false });

User.hasMany(Ad, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Ad.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });

Category.hasMany(Ad, { foreignKey: 'category_id', onDelete: 'SET NULL' });
Ad.belongsTo(Category, { foreignKey: 'category_id', onDelete: 'SET NULL' });

Ad.hasMany(AdImage, { foreignKey: 'ad_id', onDelete: 'CASCADE' });
AdImage.belongsTo(Ad, { foreignKey: 'ad_id', onDelete: 'CASCADE' });

User.hasMany(Message, { foreignKey: 'sender_id', onDelete: 'CASCADE' });
User.hasMany(Message, { foreignKey: 'receiver_id', onDelete: 'CASCADE' });
Message.belongsTo(User, { foreignKey: 'sender_id', onDelete: 'CASCADE' });
Message.belongsTo(User, { foreignKey: 'receiver_id', onDelete: 'CASCADE' });

Ad.hasMany(Message, { foreignKey: 'ad_id', onDelete: 'CASCADE' });
Message.belongsTo(Ad, { foreignKey: 'ad_id', onDelete: 'CASCADE' });

User.belongsToMany(Ad, { through: Favorite, foreignKey: 'user_id', onDelete: 'CASCADE' });
Ad.belongsToMany(User, { through: Favorite, foreignKey: 'ad_id', onDelete: 'CASCADE' });

Ad.hasMany(AdView, { foreignKey: 'ad_id', onDelete: 'CASCADE' });
AdView.belongsTo(Ad, { foreignKey: 'ad_id', onDelete: 'CASCADE' });

async function getStatistics() {
    try {
        const [userCount, adCount, messageCount, favoriteCount] = await Promise.all([
            User.count(),
            Ad.count(),
            Message.count(),
            Favorite.count()
        ]);

        return {
            userCount,
            adCount,
            messageCount,
            favoriteCount
        };
    } catch (error) {
        console.error('Error while fetching statistics:', error);
        throw error;
    }
}

module.exports = {
    sequelize,
    User,
    Category,
    Ad,
    AdImage,
    Message,
    Favorite,
    AdView,
    getStatistics,
};
