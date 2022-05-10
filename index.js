// Package Import
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const secret = "key1234";

//App Definition
const app = express();

//------- Import cars DB ---------//

const cars = require("./data/cars.js");

function getId() {
  const lastCar = cars.slice(-1)[0];

  let id = lastCar?.id;
  id = id ? id + 1 : 1;

  return id;
}

// Test if server works!
app.get("/", (req, res) => {
  res.send("Cars");
});

app.get("/cars", (req, res) => [res.send(cars)]);

app.get("/cars/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const car = cars.find((c) => c.id === id);

  res.send(car);
});

app.post("/cars", (req, res) => {
  // Att skapa en ny produkt
  const id = getId();

  const newCar = {
    id,
    make: req.body.make,
    model: req.body.model,
  };
  cars.push(newCar);

  res.send({ id });
});

app.put("/cars/:id", (req, res) => {
  //Ersätter en produkt
  const id = parseInt(req.params.id);

  const index = cars.findIndex((c) => c.id === id);

  cars[index].make = req.body.make;
  cars[index].model = req.body.model;

  res.sendStatus(200);
});

app.delete("/cars/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const index = cars.findIndex((c) => c.id === id);

  cars.splice(index, 1);

  res.sendStatus(200);
});

// -------------- CARS END ------------------//
// --------------- USERS  START---------------//
app.use(express.json());
app.use(cors());
// get the client
const mysql = require("mysql2");
const bcryptjs = require("bcryptjs");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  port: "8888",
  password: "root",
  database: "myDB",
  socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock",
});
connection.connect(function (err) {
  if (err) {
    return console.error("error: " + err.message);
  }
  console.log("Connected to the MySQL server.");
});

app.post("/register", jsonParser, function (req, res, next) {
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    // Store hash in your password DB.

    connection.execute(
      "INSERT INTO users (email, password, fname, lname) VALUES (?, ?, ?, ?)",
      [req.body.email, hash, req.body.fname, req.body.lname],
      function (err, results, fields) {
        if (err) {
          res.json({ status: "error", message: err });
          return;
        }
        res.json({ status: "ok" });
      }
    );
  });
});
app.post("/login", jsonParser, function (req, res, next) {
  connection.execute(
    "SELECT * FROM users WHERE email=?",
    [req.body.email],
    function (err, users, fields) {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      if (users.length == 0) {
        res.json({ status: "error", message: "no user found" });
        return;
      }
      bcrypt.compare(
        req.body.password,
        users[0].password,
        function (err, isLogin) {
          if (isLogin) {
            let token = jwt.sign({ email: users[0].email }, secret, {
              expiresIn: "2h",
            });
            res.json({ status: "ok", message: "login success", token });
          } else {
            res.json({ status: "error", message: "login failed" });
          }
        }
      );
    }
  );
});

app.post("/auth", jsonParser, function (req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    var decoded = jwt.verify(token, secret);
    res.json({ status: "ok", decoded });
  } catch (err) {
    res.json({ status: "err", message: err.message });
  }
});
//Import users DB

//Middleware setup

//Routes
app.listen(8000, () => {
  console.log("http://localhost:8000/");
});
