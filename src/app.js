const express = require("express");
require("dotenv").config();

const mongoose = require("mongoose");
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@mandalaclimb.g7s5c.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`;
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    autoIndex: true,
  })
  .then(() => console.log("Conectado a mongodb"))
  .catch((e) => console.log("Error de conexión", e));

const {
  problem_add_multiple,
  fetch_problems,
  parse_problems,
} = require("./controllers/problemController");

var boulders = require("./routes/boulders");
var traverses = require("./routes/traverses");

const Info = require("../models/info");
const Log = require("../models/log");
const app = express();

const hostname = "localhost"; //npm run start:dev
const port = process.env.PORT || 3000;

const server = app.listen(port, () =>
  console.log(`Server ready on http://${hostname}:${port}/`)
);

/****************************** */
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const { monthName } = require("./constants");
const User = require("../models/user");

require("../config/passport")(passport);
app.use(express.urlencoded({ extended: true }));
//express session
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
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
  res.locals.path = req.path;
  next();
});

/****************************** */

app.set("view engine", process.env.FRONTEND);
app.locals.basedir = __dirname + `/views_${process.env.FRONTEND}`
console.log(__dirname + `/views_${process.env.FRONTEND}`)
app.set("views", __dirname + `/views_${process.env.FRONTEND}`);
app.use(express.static(__dirname + "/public"));

app.use("/images", express.static("images"));
// <>------------------------------------------<>------------------------------------------<>

app.get("/", async (req, res) => {
  // await bot.telegram.sendMessage(process.env.TELEGRAM_GROUP, "Group", {})
  // await bot.telegram.sendMessage(process.env.TELEGRAM_DEV, "Personal", {})
  var infos = await Info.find().exec();
  //console.log(infos)
  res.render("index", { infos: infos });
});

app.post("/test", async (req, res) => {
  // if (req.user && req.user.admin) {
  //   var user = await User.findOne({ _id: req.body.users });
  //   // console.log(user)
  //   var perm = user.getPermissions();
  //   var obj = {};
  //   switch (req.body.paid) {
  //     case "month":
  //       var paid = req.body.selectedmonth.split("-");
  //       obj[paid[1] - 1] = 0;
  //       if (!perm[paid[0]]) perm[paid[0]] = {};
  //       Object.assign(perm[paid[0]], obj);
  //       break;
  //     case "training":
  //       var paid = req.body.selectedmonth.split("-");
  //       obj[paid[1] - 1] = 1;
  //       if (!perm[paid[0]]) perm[paid[0]] = {};
  //       Object.assign(perm[paid[0]], obj);
  //       break;
  //     case "voucher":
  //       perm.days += 5;
  //       break;
  //     case "trainingVoucher":
  //       perm.trainingDays += 5;
  //       break;
  //   }
  //   user.permissions = JSON.stringify(perm);
  //   // console.log(user);
  //   await user.save();
  //   res.redirect("/test");
  // } else {
  //   console.log("No admin");
  //   res.redirect("/");
  // }
});

app.get("/logs", async (req, res) => {
  if (req.user && req.user.admin) {
    var infos = await Log.find().populate("user").exec();
    infos.map((info) => {
      info.tittle = info.user.name;
      info.description = info.request;
      // console.log(info)
      return info;
    });
    // console.log(infos)

    //console.log(infos)
    res.render("index", { infos: infos });
  } else {
    res.redirect("/");
  }
});

app.get("/test", async (req, res) => {
  // if(req.user && req.user.admin){
  //   // var page_schema = [];
  //   var month = req.query.month || new Date().getMonth();
  //   var year = req.query.year || new Date().getFullYear();
  //   if(month > 11){
  //     year ++;
  //     month %= 12
  //   }
  //   if (month < 0) {
  //     year --;
  //     month -= -12;
  //   }
  //   const books = await BookDate.find({ month: month, year: year })
  //     .populate("bookMorning")
  //     .populate("bookEvening")
  //     .populate("bookNight");
  //   books.forEach((book) => {
  //     book.bookNames = [[], [], []];
  //     book.bookMorning.forEach((user) => {
  //       book.bookNames[0].push(user.name);
  //     });
  //     book.bookEvening.forEach((user) => {
  //       book.bookNames[1].push(user.name);
  //     });
  //     book.bookNight.forEach((user) => {
  //       book.bookNames[2].push(user.name);
  //     });
  //   });
  //   page_schema.push({
  //     name: "bookings",
  //     books: books,
  //     max: process.env.CAPACITY,
  //     monthName: monthName[month],
  //     year: year,
  //     month: month,
  //   });
  // res.render("builder", { tittleText: "Test", page_schema: page_schema });
  //   // res.send(books);
  // }else{
  //   res.redirect('/users/booking')
  // }
    res.redirect("/")
});

process.on("SIGTERM", () => {
  server.close(() => {
    console.log("Process terminated");
  });
});

app.use("/users", require("./routes/users"));

app.use("/boulders", boulders);
app.use("/traverses", traverses);

app.use("/addproblems", problem_add_multiple);

// <>------------------------------------------<>------------------------------------------<>

/*app.use((req, res, next) => {
  //res.redirect('/')
})*/

// async function getWeeksInMonth(year, month) {
//   const weeks = [],
//     firstDate = new Date(year, month, 1),
//     lastDate = new Date(year, month + 1, 0),
//     numDays = lastDate.getDate();

//   // console.log(weeks)
//   // console.log(firstDate)
//   // console.log(lastDate)
//   // console.log(numDays)
//   let dayOfWeekCounter = (firstDate.getDay() + 6) % 7;

//   const capacity = process.env.CAPACITY;
//   for (let date = 1; date <= numDays; date++) {
//     if (dayOfWeekCounter === 0 || weeks.length === 0) {
//       weeks.push([]);
//     }
//     switch (dayOfWeekCounter) {
//       //FIN DE SEMANA
//       case 5:
//       case 6:
//         var book = { day: date, weekend: true };
//         break;

//       //ENTRE SEMANA
//       default:
//         var book = await BookDate.findOne({
//           year: year,
//           month: month,
//           day: date,
//         });

//         if (!book) {
//           book = await BookDate.create({ year: year, month: month, day: date });
//         }
//         if (dayOfWeekCounter == 4) {
//           book.friday = true;
//           book.full =
//             book.bookMorning.length >= capacity &&
//             book.bookEvening.length >= capacity;
//         } else {
//           book.full =
//             book.bookMorning.length >= capacity &&
//             book.bookEvening.length >= capacity &&
//             book.bookNight.length >= capacity;
//         }
//         break;
//     }
//     weeks[weeks.length - 1].push(book);
//     dayOfWeekCounter = (dayOfWeekCounter + 1) % 7;
//   }

//   return weeks
//     .filter((w) => !!w.length)
//     .map((w) => ({
//       start: w[0],
//       end: w[w.length - 1],
//       dates: w,
//     }));
// }
