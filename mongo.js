const { MongoClient } = require("mongodb");

let dbConnection;
module.exports = {
  connectToDb: (connectionCB) => {
    //connect to database
    MongoClient.connect("mongodb://localhost:27017/PetsLove")
      .then((client) => {
        dbConnection = client.db();
        return connectionCB();
      })
      .catch((error) => {
        console.log("Error connecting to Mongodb:", error);
        return connectionCB(error);
      });
  },
  getDb: () => dbConnection,
};
