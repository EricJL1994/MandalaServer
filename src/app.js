const express = require("express");
const app = express();
require("dotenv").config();
const { sortBoulders } = require("./commonFunctions")
const { consoleLogger } = require("./utils/logger")
require("./utils/telegramBot")
// <>------------------------------------------<>------------------------------------------<>
const mongoose = require("mongoose");
const mongoConnect = require("connect-mongo");
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@mandalaclimb.g7s5c.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`;
const clientP = mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    autoIndex: true,
  })
  .then((m) => {
    consoleLogger("Conectado a mongodb", "SUCCESS")
    // console.log("Conectado a mongodb")
    return m.connection.getClient()
  })
  .catch((e) => console.log("Error de conexión", e));

const { problem_add_multiple, fetch_problems, parse_problems } = require("./controllers/problemController");

const Info = require("../models/info");

// var hostname; //npm run start:dev
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  const hostnameDic = {
    PRODUCTION: "mandalaclimb.herokuapp.com",
    DEV_MAIN: "localhost",
  }
  // switch (process.env.DEPLOY) {
  //   case "PRODUCTION":
  //     hostname = "mandalaclimb.herokuapp.com"
  //     break;
      
  //   case "DEV_MAIN":
  //   default:
  //     hostname = "localhost"
  //     break;
  //   }
  consoleLogger(`Server ready on http://${hostnameDic[process.env.DEPLOY]}:${port}/`, "SUCCESS")
});

// <>------------------------------------------<>------------------------------------------<>
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const { monthName } = require("./constants");

require("../config/passport")(passport);
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
//express session
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    // store: mongoConnect.create({mongoUrl: uri, ttl: 6/*0 * 60 * 24 * 7*/ /*7 days*/}),
    store: mongoConnect.create({clientPromise: clientP, ttl: 60 * 60 * 24 * 7}),
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user;
  res.locals.allowRegister = process.env.REGISTER == "true" ? true : undefined;
  // res.locals.path = req.path;
  res.locals.path = req.url;
  next();
});

// <>------------------------------------------<>------------------------------------------<>

app.set("view engine", "pug");
app.set("views", __dirname + "/views_pug");
app.locals.basedir = app.get("views")
// app.locals.basedir = __dirname + "/views_pug"
app.use(express.static(__dirname + "/public"));

app.use("/images", express.static("images"));
// <>------------------------------------------<>------------------------------------------<>


process.on("SIGTERM", () => {
  server.close(() => {
    console.log("Process terminated");
  });
});

app.get("/", async (req, res) => {
  Info.find().then(infos => res.render("index", { infos: infos }))
});

// const { check, test, date, mail } = require("./test/test")
// app.use(check)

// app.get("/test", mail)
// app.get("/test", date)

// function adminCheck(req, res, next){
//   if(!req.user?.admin) return res.redirect("/")
//   next()
// }

// function userCheck(req, res, next){
//   if(!req.user) return res.redirect("/")
//   next()
// }

// <>------------------------------------------<>------------------------------------------<>
app.use("/users", require("./routes/users"));
app.use("/admin", /*adminCheck, */require("./routes/admin"));
app.use("/boulders", require("./routes/boulders"));
app.use("/traverses", require("./routes/traverses"));
// app.use("/api", require("./routes/api"));

// app.use("/addproblems", problem_add_multiple);
