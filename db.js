require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.POSTGRES_DB_URI);   

const testDbConnection = async () => {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
};

module.exports = {
    sq:  sequelize,
    testDbConnection
};