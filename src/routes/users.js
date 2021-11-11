const express = require("express");
const router = express.Router();

const User = require("../../models/user");
const BookDate = require("../../models/bookDate");
const Book = require("../../models/book");
const bcrypt = require("bcrypt");
const passport = require("passport");
const { getWeeksInMonth } = require("../commonFunctions");
const { monthName, dayName } = require("../constants");
const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");
const jwt = require("jsonwebtoken");
let transporter = nodemailer.createTransport(
  smtpTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  })
);

//LOGIN
router.get("/login", (req, res) => {
  // console.log('GET LOGIN')
  if (req.user) {
    res.redirect(req.query.redirect || "/users/dashboard");
  } else {
    res.render("login");
  }
});

router.post("/login", (req, res, next) => {
  // console.log(req.query.redirect)
  passport.authenticate("local", {
    successRedirect: "back",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

//REGISTER
router.get("/register", (req, res) => {
  if (req.user) {
    res.redirect("/users/dashboard");
  } else {
    res.render("register");
  }
});

router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];
  console.log(" Name " + name + " email :" + email + " pass:" + password);
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Por favor, rellene todos los campos" });
  }
  //check if match
  if (password !== password2) {
    errors.push({ msg: "Las contraseñas no coinciden" });
  }

  //check if password is more than 6 characters
  if (password.length < 6) {
    errors.push({ msg: "La contraseña debe tener al menos 6 caracteres" });
  }
  if (errors.length > 0) {
    res.render("register", {
      errors: errors,
      name: name,
      email: email,
      password: password,
      password2: password2,
    });
  } else {
    //validation passed
    User.findOne({ email: email }).exec((err, user) => {
      if (user) {
        errors.push({ msg: "El email está en uso" });
        res.render("register", { errors, name, email, password, password2 });
      } else {
        const newUser = new User({
          name: name,
          email: email,
          password: password,
        });

        //hash password
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            //save pass to hash
            newUser.password = hash;
            //save user
            newUser
              .save()
              .then((value) => {
                req.flash("success_msg", "Se ha registrado con éxito");
                res.redirect("/users/login");
              })
              .catch((value) => console.log(value));
          })
        );
      }
    });
  }
});

//LOGOUT
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "Now logged out");
  res.redirect("/");
});

//DASHBOARD
router.get("/dashboard", (req, res) => {
  if (!req.user) return res.redirect("/users/login");
  return res.render("dashboard");
});

router.post("/dashboard", (req, res) => {
  res.send("ok");
});

//VERIFICATION
router.get("/verification/:token", async function (req, res) {
  const { token } = req.params;

  if (!token) {
    req.flash("error_msg", "El link es incorrecto"); //No hay token
    return res.redirect("/users/login");
  }

  let payload = null;
  try {
    payload = jwt.verify(token, process.env.TOKEN);
  } catch (err) {
    if ((err.name = "TokenExpiredError")) {
      req.flash("error_msg", "El link ha caducado"); //Token expirado
      return res.redirect("/users/login");
    }
    return res.status(500).send(err);
  }

  try {
    // Step 2 - Find user with matching ID
    const user = await User.findOne({ _id: payload.ID }).exec();
    if (!user) {
      req.flash("error_msg", "El usuario no está registrado");
      return res.redirect("/user/register");
    }
    // Step 3 - Update user verification status to true
    user.isVerified = true;
    await user.save();
    req.flash("success_msg", "Se ha verificado con éxito, inicie sesión");
    return res.redirect("/users/login");
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.post("/verification", (req, res) => {
  console.log("Post a verification");
  if (req.user && !req.user.isVerified) {
    const url = `http://mandalaclimb.herokuapp.com/users/verification/${req.user.generateVerificationToken()}`;
    var to = req.user.email,
      subject = "Verificación de email",
      message = `Haz click <a href = ${url}>aquí</a> para confirmar tu email`;

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: to, //from req.body.to
      subject: subject, //from req.body.subject
      html: message, //from req.body.message
    };
    //delivery
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        res.render("dashboard");
      }
    });
  } else {
    res.redirect("/users/login");
  }
});

router.post("/config", (req, res) => {
  //const { name, email, password, password2 } = req.body;
  const { name, email } = req.body;
  console.log(req.body);
  res.redirect("/users/dashboard");
});

//BOOKING
router.get("/booking", async (req, res) => {
  if (req.user && req.user.canBook) {
    var month = req.query.month || new Date().getMonth();
    var year = req.query.year || new Date().getFullYear();
    if (month > 11) {
      year++;
      month %= 12;
    }
    if (month < 0) {
      year--;
      month -= -12;
    }

    const monthFormatted = await getWeeksInMonth(year, month);
    var page_schema = [];
    var users = undefined;
    if (req.user.admin) {
      users = await User.find().exec();
      users.map((user) => {
        user.parsedPermissions = user.getPermissions();
        user.monthSubscription =
          !!user.getPermissions()[year] &&
          !(user.getPermissions()[year][month] == undefined);
        user.monthTraining =
          !!user.getPermissions()[year] && !!user.getPermissions()[year][month];
      });
    }
    page_schema.push({
      name: "booking",
      month: monthFormatted,
      monthName: monthName[month],
      monthNumber: month,
      year: year,
      max: process.env.CAPACITY,
      monthSubscription:
        !!req.user.getPermissions()[year] &&
        !(req.user.getPermissions()[year][month] == undefined),
      monthTraining:
        !!req.user.getPermissions()[year] &&
        !!req.user.getPermissions()[year][month],
      permissions: req.user.getPermissions(),
      users: users,
    });
    res.render("builder", { tittleText: "Reservar", page_schema: page_schema });
    // res.send('ok')
  } else {
    res.redirect("/users/dashboard");
  }
});

router.post("/booking", async (req, res) => {
  // console.log(req.body.month + " " + req.body.date + " " + req.query.time);
  if (req.user && req.user.canBook) {
    const user = req.user.admin
      ? await User.findOne({ _id: req.body.userBooking })
      : req.user;
    const year = req.body.year;
    const month = req.body.month;
    const method = req.body.method;
    const permissions = user.getPermissions();

    //CHECK PERMISSIONS
    var permissionGranted = user._id.equals("612cbc6301d5f95906c21dd4") || req.user.admin;
    switch (method) {
      case "month":
        if (!!permissions[year] && !(permissions[year][month] == undefined)) {
          permissionGranted = true;
        }
        break;
      case "training":
        if (!!permissions[year] && !!permissions[year][month]) {
          permissionGranted = true;
        }
        break;
      case "voucher":
        if (permissions.days > 0) {
          permissionGranted = true;
        }
        break;
      case "trainingVoucher":
        if (permissions.trainingDays > 0) {
          permissionGranted = true;
        }
        break;
    }

    //CREATE BOOK
    const book = {
      user: user._id,
      name: user._id.equals("612cbc6301d5f95906c21dd4")
        ? req.body.bookingName
        : user.name,
      trainingType: method,
    };

    //GET THE DATE
    const booking = await BookDate.findOne({
      month: month,
      day: req.body.date,
      year: year,
    })
      .populate({ path: "bookMorning", populate: { path: "user" } })
      .populate({ path: "bookEvening", populate: { path: "user" } })
      .populate({ path: "bookNight", populate: { path: "user" } });

    const bookingRaw = await BookDate.findOne({
      month: month,
      day: req.body.date,
      year: year,
    });

    //CHECK IF DUPLICATED OR FULL
    var check = false;
    if (permissionGranted) {
      switch (req.query.time) {
        case "morning":
          check = await checkBooking(booking.bookMorning, user, method, book);
          if (check) bookingRaw.bookMorning.push(check._id);
          break;

        case "evening":
          check = await checkBooking(booking.bookEvening, user, method, book);
          if (check) bookingRaw.bookEvening.push(check._id);
          break;

        case "night":
          check = await checkBooking(booking.bookNight, user, method, book);
          if (check) bookingRaw.bookNight.push(check._id);
          break;
      }
    }

    //SAVE DATE
    if (!!check) {
      switch (method) {
        case "voucher":
          permissions.days -= 1;
          break;

        case "trainingVoucher":
          permissions.trainingDays -= 1;
          break;
      }
      user.permissions = JSON.stringify(permissions)
      user.save()
    }
    await bookingRaw.save();
    res.redirect(`booking?month=${month}&year=${year}`);
  } else {
    res.redirect("/");
  }
});

router.get("/books", async (req, res) => {
  if (req.user && req.user /*.admin*/) {
    var page_schema = [];
    var month = req.query.month || new Date().getMonth();
    var year = req.query.year || new Date().getFullYear();
    if (month > 11) {
      year++;
      month %= 12;
    }
    if (month < 0) {
      year--;
      month -= -12;
    }

    const books = await BookDate.find({ month: month, year: year })
      .populate({ path: "bookMorning", populate: { path: "user" } })
      .populate({ path: "bookEvening", populate: { path: "user" } })
      .populate({ path: "bookNight", populate: { path: "user" } });

    books.forEach(book => {
      const date = new Date(book.year, book.month, book.day)
      book.dayName = dayName[date.getDay()]
    });

    page_schema.push({
      name: "books",
      books: books,
      max: process.env.CAPACITY,
      monthName: monthName[month],
      year: year,
      month: month,
    });

    res.render("builder", { tittleText: "Reservas", page_schema: page_schema });
  } else {
    res.redirect("/users/booking");
  }
});

router.get("/unbook", async (req, res) => {
  const { id } = req.query;
  const bookInfo = await Book.findById(id) 
  if (req.user && (req.user.admin || req.user._id.equals(bookInfo.user))) {
    const { day, month, year, time } = req.query;
    const bookDate = await BookDate.findOne({
      day: day,
      month: month,
      year: year,
    }).exec();

    //DELETE BOOK FROM DB
    var cancelDate = new Date(year, month, day);
    var date = new Date();
    var book;
    switch (time) {
      case "morning":
        cancelDate.setHours(10);
        book = bookDate.bookMorning[bookDate.bookMorning.indexOf(id)]
        bookDate.bookMorning.splice(bookDate.bookMorning.indexOf(id), 1);
        break;

      case "evening":
        cancelDate.setHours(17);
        book = bookDate.bookEvening[bookDate.bookEvening.indexOf(id)]
        bookDate.bookEvening.splice(bookDate.bookEvening.indexOf(id), 1);
        break;

      case "night":
        cancelDate.setHours(19);
        book = bookDate.bookNight[bookDate.bookNight.indexOf(id)]
        bookDate.bookNight.splice(bookDate.bookNight.indexOf(id), 1);
        break;
    }

    if ((cancelDate - date) / 1000 / 60 / 60 / 24 > 1 || req.user.admin) {
      //If the cancel is in time
      var book = await Book.findById(id)
      var user = await User.findById(book.user).exec()
      var permissions = user.getPermissions()
      switch (book.trainingType) {
        case 'voucher':
          permissions.days += 1;
          break;
      
        case 'trainingVoucher':
          permissions.trainingDays += 1;
          break;
      }
      user.permissions = JSON.stringify(permissions)
      user.save()

      await Book.deleteOne({ _id: id });
      await BookDate.updateOne({ day: day, month: month, year: year }, bookDate);
    }
    res.redirect("/users/books");
    // res.send(userid + ' => ' + day + '/' + month + '/' + year + ' ' + time);
  } else {
    res.redirect("/users/booking");
  }
});

router.get("/profile/:id", async (req, res) => {
  const { id } = req.params;
  if (req.user && (req.user._id == id || req.user.admin)) {
    const user = await User.findOne({ _id: id }).exec();
    var page_schema = [];
    page_schema.push({
      name: "card",
      tittle: user.name,
      description: "<strong><u>Email:</u></strong> " + user.email,
      list: [{ name: user._id }],
    });
    console.log(page_schema[0].list);
    res.render("builder", { tittleText: "Perfil", page_schema: page_schema });
  } else {
    res.redirect("/");
  }
});

router.get("/payment", async (req, res) => {
  if (!(req.user && req.user.admin)) {
    res.redirect("/");
    return;
  }
  var users = await User.find().exec();
  // res.send(users);
  users.map((user) => (user.parsedPermissions = user.getPermissions()));

  var page_schema = [];
  page_schema.push({
    name: "payment",
    users: users,
  });
  page_schema.push({
    name: "permissions",
    users: users,
  });
  res.render("builder", { tittleText: "Pagos", page_schema: page_schema });
});

router.post("/payment", async (req, res) => {
  if (req.user && req.user.admin) {
    var user = await User.findOne({ _id: req.body.users });
    var perm = user.getPermissions();
    var obj = {};
    switch (req.body.paid) {
      case "month":
        var paid = req.body.selectedmonth.split("-");
        obj[paid[1] - 1] = 0;
        if (!perm[paid[0]]) perm[paid[0]] = {};
        Object.assign(perm[paid[0]], obj);
        break;
      case "training":
        var paid = req.body.selectedmonth.split("-");
        obj[paid[1] - 1] = 1;
        if (!perm[paid[0]]) perm[paid[0]] = {};
        Object.assign(perm[paid[0]], obj);
        break;

      case "voucher":
        perm.days += 5;
        break;

      case "trainingVoucher":
        perm.trainingDays += 5;
        break;
    }

    user.permissions = JSON.stringify(perm);
    // console.log(user);
    await user.save();
    res.redirect("/users/payment");
  } else {
    console.log("No admin");
    res.redirect("/");
  }
});

// router.get("/permissions", async (req, res) => {

// })

// router.post("/permissions", async (req, res) => {

// })

async function checkBooking(bookArray, user, method, newBook) {
  //FULL SESSION
  if (bookArray.length >= process.env.CAPACITY) return false;
  if(method == "voucher" || method == "trainingVoucher") return await Book.create(newBook);

  var book;
  for (book of bookArray) {
    if(!book.user._id.equals(user._id)) continue;

    switch (method) {
      case "month":
        if(book.trainingType == "month") return false
        if(book.trainingType == "training"){
          book.trainingType = "month";
          book.user = book.user._id;
          Book.updateOne({ _id: book._id }, book);
          return false;
        }
        break;

      case "training":
        if(book.trainingType == "training") return false
        if(book.trainingType == "month"){
          book.trainingType = "training";
          book.user = book.user._id;
          Book.updateOne({ _id: book._id }, book);
          return false;
        }
        break;

      // case "voucher":
      //   break;

      // case "trainingVoucher":
      //   break;
    }

    // if (
    //   book.user._id.equals(user._id) &&
    //   (book.trainingType == method ||
    //     (method == "training" && book.trainingType == "month") ||
    //     (method == "month" && book.trainingType == "training"))
    // ) {
    //   duplicated = true;
    //   break;
    // }
  }
  return await Book.create(newBook);

  // if (!duplicated) {
  //   return await Book.create(newBook);
  // } else {
    // if (method == "training" && book.trainingType == "month") {
    //   book.trainingType = "training";
    //   book.user = book.user._id;
    //   Book.updateOne({ _id: book._id }, book);
    // }
    // console.log("Duplicated or updated");
    // return false;
  // }
}

module.exports = router;
