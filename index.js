const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const mongodb = require("mongodb");

// 加载环境变量
dotenv.config();

// 创建 Express 应用
const app = express();
app.use(express.json());
const port = 8080;

// 生成 secret key
const crypto = require("crypto");
const SECRET_KEY = crypto.randomBytes(64).toString("hex");

//MongoDB fetch
const mongoURI = "mongodb://localhost:27017";
const dbName = "userDataBase";
const collectionName = "users";

//// Middleware：身份验证
function authenticateToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).send("Access Denied");

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) return res.status(403).send("Invalid Token");
    req.user = user;
    next();
  });
}

// 连接 MongoDB
MongoClient.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then((client) => {
  console.log("connected to MongoDB");
  const db = client.db(dbName);
  const usersCollection = db.collection(collectionName);

  //sign up
  app.post("/signup", async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const newUser = {
        username: req.body.username,
        password: hashedPassword,
      };
      const result = await usersCollection.insertOne(newUser);
      res.status(201).send("User sign up/ registered successfully");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error registering user");
    }
  });

  // login
  app.post("/login", async (req, res) => {
    const user = await usersCollection.findOne({ username: req.body.username });
    if (!user) return res.status(400).send("User not found");

    try {
      if (await bcrypt.compare(req.body.password, user.password)) {
        const token = jwt.sign(
          { username: user.username },
          process.env.JWT_SECRET_KEY
        );
        res.header("authorization", token).send(token);
      } else {
        res.status(401).send("Invalid password");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Error logging in");
    }
  });
  // update password 更新用户密码
  app.put("/update-password", authenticateToken, async (req, res) => {
    try {
      // 从请求体中获取新密码
      const newPassword = req.body.newPassword;

      // 哈希新密码
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // 更新用户密码
      const result = await usersCollection.updateOne(
        { username: req.user.username }, // 根据用户名查找用户
        { $set: { password: hashedPassword } } // 设置新密码
      );

      if (result.modifiedCount === 1) {
        res.status(200).send("Password updated successfully");
      } else {
        res.status(404).send("User not found");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Error updating password");
    }
  });

  //delete 删除用户账户
  app.delete("/delete-account", authenticateToken, async (req, res) => {
    try {
      await usersCollection.deleteOne({ username: req.user.username });
      res.status(200).send("Account deleted successfully");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error deleting account");
    }
  });
});

// 监听端口
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
