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
const BookDate = require("../models/bookDate");
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

require("../config/passport")(passport);
app.use(express.urlencoded({ extended: true }));
//express session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
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
  // console.log(req.method + req.url + ' -> Redirect: ' + req.query.asd)
  next();
});

/****************************** */

app.set("view engine", process.env.FRONTEND);
app.set("views", __dirname + `/views_${process.env.FRONTEND}`);
app.use(express.static(__dirname + "/public"));

app.use("/images", express.static("images"));
// <>------------------------------------------<>------------------------------------------<>

app.get("/", async (req, res) => {
  var infos = await Info.find().exec();
  //console.log(infos)
  res.render("index", { infos: infos });
});

app.get("/test", async (req, res) => {
    var page_schema = [];
  //   const book = { year: 2021, month: 2, day: 22 };
  //   BookDate.findOne({ year: book.year, month: book.month, day: book.day }).then(
  //     (value) => {
  //       if (value) console.log(value);
  //     }
  //   );
  //   BookDate.create(book);
  //   console.log(BookDate.find().exec());
  //   console.log(getWeeksInMonth(2021, 6));
  //   page_schema.push({
  //     name: "card",
  //     src: "/images/TRAVESIAS-2.fw.png",
  //     alt: "Alt",
  //     tittle: "Test",
  //     description: "Esto es un test",
  //     link: "/",
  //   });
  //   page_schema.push({
  //     name: "card",
  //     alt: "Alt",
  //     tittle: "Test",
  //     description: "Esto es un test",
  //   });
  //   problems = await parse_problems(fetch_problems(req, res), req.user);
  //   page_schema.push({ name: "table", arrayProblems: problems });
  //   page_schema.push({
  //     name: "calendar",
  //     month: await getWeeksInMonth(2021, 6),
  //     max: process.env.CAPACITY,
  //   });

  const month = 7
  const year = 2021
  const books = await BookDate.find({month: month, year: year })
    .populate("bookMorning")
    .populate("bookEvening")
    .populate("bookNight");
  books.forEach(book => {
    book.bookNames = [[], [], []];
    book.bookMorning.forEach((user) => {
      book.bookNames[0].push(user.name);
    });
    book.bookEvening.forEach((user) => {
      book.bookNames[1].push(user.name);
    });
    book.bookNight.forEach((user) => {
      book.bookNames[2].push(user.name);
    });
    
  });
  page_schema.push({
    name: 'bookings',
    books: books,
    max: process.env.CAPACITY,
    monthName: monthName[month],
  })
  res.render("builder", { tittleText: "Test", page_schema: page_schema });
  // res.send(books);
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
