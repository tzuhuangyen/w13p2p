const { MongoClient } = mongodb;

module.exports = {
  connectToDb: (connectionCB) => {
    MongoClient.connect("mongodb://localhost:27017/");
  },
};
