// server.js
// where your node app starts

// init project
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const fs = require("fs");
const nodemailer = require("nodemailer");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var recID;

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// init sqlite db
const dbFile = "./.data/sqlite.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(dbFile);


/*
// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(() => {
    console.log('Databases ready to go!');
    db.each("SELECT * from Requests", (err, row) => {
      if (row) {
        console.log(`record: ${row.dream}`);
      }
    });
  }
);
*/

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(`${__dirname}/views/index.html`);
});

/*
// endpoint to get all the dreams in the database
app.get("/getDreams", (request, response) => {
  db.all("SELECT * from Dreams", (err, rows) => {
    response.send(rows);
  });
});
*/

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMU,
    pass: process.env.GMP
  }
});

app.get("/getCards", async (request, response) => {
  await db.all("SELECT * from Requests", (err, rows) => {
    var sending = JSON.stringify(rows);
    response.send(sending);
  });
})

app.post("/newrequest", async (request, response) => {
  //let sentRequest = JSON.parse(request);
  await db.run(`INSERT INTO Requests(employee, item, link, why_needed, when_needed, category, status, created) VALUES(?, ?, ?, ?, ?, ?, ?, ?)`, [request.body.employee, request.body.item, request.body.link, request.body.why_needed, request.body.when_needed, request.body.category, "New", request.body.request_time], function(err) {
    if (err) {
      return console.log(err.message);
    }
    // get the last insert id
    console.log(`A row has been inserted with rowid ${this.lastID}`);
    recID = this.lastID;
    console.log(`this is ${recID}`);
    db.all(`SELECT * from Requests WHERE id='${recID}'`, (err, rows) => {
    var sending = JSON.stringify(rows);
    response.send(sending);
  });
    var mailOptions = {
  from: 'thesportstrifecta@gmail.com',
  to: 'sean@glitch.com',
  subject: 'New Glitch Request',
  text: `${request.body.employee} has requested ${request.body.item} for ${request.body.when_needed}. The reason is ${request.body.why_needed} Use this link please: ${request.body.link}`
};
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent' + info.response);
      }
    });
  });
  
});

app.post("/ordered", async (request, response) => {
  let reqID = request.body.id;
  let notes = request.body.notes;
  console.log(notes);
  await db.run(`UPDATE Requests SET status = 'Ordered', notes = '${notes}' WHERE id = ${reqID}`, function(err){
    if (err) {
      return console.log(err.message);
    }
    console.log(`Updated ${reqID} to ordered`);
    
  });
});

app.post("/updatenote", async (request, response) => {
  let noteID = request.body.id;
  let notes = request.body.note;
  console.log(notes);
  await db.run(`UPDATE Requests SET notes = notes || '<br><br>${notes}' WHERE id = ${noteID}`, function(err){
    if (err) {
      return console.log(err.message);
    }
    console.log(`Updated ${noteID}'s notes`);
  });
  
 /* var respData = await db.run(`SELECT notes FROM Requests WHERE id = ${noteID}`, function(err, rows){
    if (err) {
      return console.log(err.message);
    }
 });
  console.log('the data is ' + respData); */
});

/*
// endpoint to add a dream to the database
app.post("/addDream", (request, response) => {
  console.log(`add to dreams ${request.body.dream}`);

  // DISALLOW_WRITE is an ENV variable that gets reset for new projects
  // so they can write to the database
  if (!process.env.DISALLOW_WRITE) {
    const cleansedDream = cleanseString(request.body.dream);
    db.run(`INSERT INTO Dreams (dream) VALUES (?)`, cleansedDream, error => {
      if (error) {
        response.send({ message: "error!" });
      } else {
        response.send({ message: "success" });
      }
    });
  }
});

// endpoint to clear dreams from the database
app.get("/clearDreams", (request, response) => {
  // DISALLOW_WRITE is an ENV variable that gets reset for new projects so you can write to the database
  if (!process.env.DISALLOW_WRITE) {
    db.each(
      "SELECT * from Dreams",
      (err, row) => {
        console.log("row", row);
        db.run(`DELETE FROM Dreams WHERE ID=?`, row.id, error => {
          if (row) {
            console.log(`deleted row ${row.id}`);
          }
        });
      },
      err => {
        if (err) {
          response.send({ message: "error!" });
        } else {
          response.send({ message: "success" });
        }
      }
    );
  }
});
*/

// helper function that prevents html/css/script malice
const cleanseString = function(string) {
  return string.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

// listen for requests :)
var listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});