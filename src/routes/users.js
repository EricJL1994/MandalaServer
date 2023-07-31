const express = require("express");
const router = express.Router();

const User = require("../../models/user");
const BookDate = require("../../models/bookDate");
const LeagueBoulder = require("../../models/leagueBoulder");
const Book = require("../../models/book");
const bcrypt = require("bcrypt");
const passport = require("passport");
const { logger } = require("../utils/logger");
const { getWeeksInMonth } = require("../commonFunctions");
const { monthName, dayName, trainingNames, walls, difficultyColor } = require("../constants");
const jwt = require("jsonwebtoken");
const { recoveryMail, welcomeMail, verificationMail } = require("../utils/email");
const { getClosestLeague } = require("../controllers/leagueController");
const League = require("../../models/league");

const timesNames = { morning: "Mañana", evening: "Tarde", night: "Noche" };

//LOGIN
router.get("/login", (req, res) => {
  if (req.user) {
    res.redirect(req.query.redirect || "/users/dashboard");
  } else {
    req.session.redirectTo = req.query.redirect
    res.render("builder", {
      tittleText: "Inicio de sesión",
      page_schema: [{ name: "login" }],
    });
  }
});

router.post("/login", (req, res, next) => {
    var redirectTo = req.session.redirectTo || "/"
    delete req.session.redirectTo
    passport.authenticate("local", {
      successRedirect: redirectTo,
      failureRedirect: "/users/login",
      failureFlash: true,
      badRequestMessage: "Rellene los campos",
    })(req, res, next);
    // })
  },
  // function (req, res) {
  //   // logger(true, false, `El usuario _${req.user.name}_ \\(${req.user._id}\\) ha iniciado sesión`)
  //   res.redirect("back");
  // }
);

//REGISTER
router.get("/register", (req, res) => {
  if (req.user) {
    res.redirect("/users/dashboard");
  } else {
    res.render("builder", {
      tittleText: "Registro",
      page_schema: [{ name: "register" }],
    });
  }
});

router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];
  // console.log(" Name " + name + " email :" + email + " pass:" + password);
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Por favor, rellene todos los campos" });
  }
  //check if match
  if (password !== password2) {
    errors.push({ msg: "Las contraseñas no coinciden" });
  }
  // TODO: Check in front end
  //check if password is more than 6 characters
  if (password.length < 6) {
    errors.push({ msg: "La contraseña debe tener al menos 6 caracteres" });
  }
  if (errors.length > 0) {
    res.render("builder", {
      errors: errors,
      name: name,
      email: email,
      password: password,
      password2: password2,
      page_schema: [{ name: "register" }],
    });
  } else {
    //validation passed
    User.findOne({ email: email }).exec((err, user) => {
      if (user) {
        errors.push({ msg: "El email está en uso" });
        res.render("builder", {
          errors: errors,
          name: name,
          email: email,
          password: password,
          password2: password2,
          page_schema: [{ name: "register" }],
        });
      } else {
        const newUser = new User({
          name: name,
          email: email,
          password: password,
        });

        //hash password
        user.changePassword(password, value => {
          logger(
            `${newUser.name} se ha registrado [Perfil](https://mandalaclimb.herokuapp.com/users/profile/${newUser._id})`,
            newUser._id
          );
          welcomeMail(user)
          req.flash("success_msg", "Se ha registrado con éxito");
          res.redirect("/users/login");
        })
        // bcrypt.genSalt(10, (err, salt) =>
        //   bcrypt.hash(newUser.password, salt, (err, hash) => {
        //     if (err) throw err;
        //     //save pass to hash
        //     newUser.password = hash;
        //     //save user
        //     newUser
        //       .save()
        //       .then((value) => {
        //         logger(
        //           `${newUser.name} se ha registrado [Perfil](https://mandalaclimb.herokuapp.com/users/profile/${newUser._id})`,
        //           newUser._id
        //         );
        //         req.flash("success_msg", "Se ha registrado con éxito");
        //         res.redirect("/users/login");
        //       })
        //       .catch((value) => console.log(value));
        //   })
        // );
      }
    });
  }
});

//REGISTER DUMMY
router.get("/registerPremade/:id", async (req, res) => {
  const { id } = req.params;
  
  var failed = false
  var user = await User.findOne({ _id: id }).exec().catch((err) => {
    failed = err
  });

  if(failed || !user) {
    return res.redirect("/users/register");
  }
  
  return res.render("builder", {
    tittleText: "Registro",
    page_schema: [{ name: "register_dummy", username: user.name }],
  });
});

router.post("/registerPremade/:id", async (req, res) => {
  const { id } = req.params
  var failed = false
  var user = await User.findOne({ _id: id }).exec().catch((err) => {
    failed = err
  });
  //No user found or id is bad
  if(failed || !user) {
    return res.redirect("/users/register");
  }

  const { name, email, password, password2 } = req.body;
  let errors = [];
  // console.log(" Name " + name + " email :" + email + " pass:" + password);
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
    res.render("builder", {
      errors: errors,
      name: name,
      email: email,
      password: password,
      password2: password2,
      page_schema: [{ name: "register_dummy" }],
    });
  } else {
    //validation passed
    User.findOne({ email: email }).exec((err, userFound) => {
      if (userFound) {
        errors.push({ msg: "El email está en uso" });
        res.render("builder", {
          errors: errors,
          name: name,
          email: email,
          password: password,
          password2: password2,
          page_schema: [{ name: "register_dummy" }],
        });
      } else {
        user.name = name
        user.email = email
        user.password = password

        //hash password
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) throw err;
            //save pass to hash
            user.password = hash;
            //save user
            user
              .save()
              .then((value) => {
                logger(
                  `${user.name} se ha actualizado [Perfil](https://mandalaclimb.herokuapp.com/users/profile/${user._id})`,
                  user._id
                );
                req.flash("success_msg", "Se ha registrado con éxito");
                // console.log(user)
                req.logout()
                res.redirect("/users/login");
              })
              .catch((value) => console.log(value));
          })
        );
      }
    });
  }
})

//LOGOUT
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "Ha cerrado sesión");
  res.redirect("/");
});

//DASHBOARD
router.get("/dashboard", (req, res) => {
  if (!req.user) return res.redirect("/users/login");
  // return res.render("dashboard");
  return res.render("builder", {
    tittleText: "Perfil",
    page_schema: [{ name: "dashboard" }],
  });
});

// router.post("/dashboard", (req, res) => {
//   res.send("ok");
// });

//VERIFICATION
router.get("/verification/:token", async (req, res) => {
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
    logger(
      `El usuario _${user.name}_ \\(${user._id}\\) ha verificado su email`,
      user._id
    );
    return res.redirect("/users/login");
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.post("/verification", (req, res) => {
  // console.log("Post a verification");
  if (req.user && !req.user.isVerified) {
    const link = `http://mandalaclimb.herokuapp.com/users/verification/${req.user.generateVerificationToken()}`;

    verificationMail(req.user, link)
    req.flash("success_msg", "Hemos enviado un email a tu correo electrónico")
    return res.redirect("/users/dashboard");
  } else {
    return res.redirect("/users/login");
  }
});

//PASSWORD RECOVERY
router.get("/passwordRecovery", async (req, res) => {
  res.redirect("login")
})

router.post("/passwordRecovery", async (req, res) => {
  const { email } = req.body
  var user = await User.findOne({email}).exec()
  if(!user) {
    req.flash("error_msg", `Este usuario no existe`);
    return res.redirect("login")
  }
  const password = Math.random().toString(36).substring(2,10)
  // console.log(password)
  user.changePassword(password, value => {
    recoveryMail(user, password)
    req.flash("success_msg", "Le hemos enviado un email\nSiga los pasos indicados");
    // sendMail(email, "Mandala Climb · Recuperación de contraseña", `Su nueva contraseña es <b>${password}</b><br>Le recomendamos que la cambie cuanto antes`)
    return res.redirect("/users/login");
  })
  // res.redirect("/users/login")
})

//CHANGE PASSWORD
router.get("/changePassword", (req, res) => {
  res.render("builder", {
    tittleText: "Cambiar contraseña",
    page_schema: [{ name: "change_password" }],
  })
})

router.post("/changePassword", async (req, res) => {
  if(!req.user) return res.redirect("/users/login")
  const { old_password, password, password2 } = req.body

  var user = await User.findOne({email: req.user.email}).exec()
  // console.log("Comparar")
  bcrypt.compare(old_password, user.password, (err, isMatch) => {
    if (err) throw err;
    // Contraseña incorrecta
    if(!isMatch) {
      req.flash("error_msg", "Contraseña incorrecta");
      return res.render("builder", {tittleText: "Cambiar contraseña", page_schema: [{ name: "change_password" }]})
    }
    // Contraseñas no coinciden
    if(password != password2){
      req.flash("error_msg", "Las contraseñas no coinciden");
      return res.render("builder", {tittleText: "Cambiar contraseña", page_schema: [{ name: "change_password" }]})
    }
    // Contraseña correcta

    user.changePassword(password, value => {
      logger(
        `${user.name} ha cambiado la contraseña [Perfil](https://mandalaclimb.herokuapp.com/users/profile/${user._id})`,
        user._id
      )
      req.flash("success_msg", "Contraseña cambiada con éxito")
      return res.redirect("/users/dashboard")
    })
  });
})

router.get("/league", async (req, res) => {
  var league = (await getClosestLeague())[0]
  // console.log(league)
  // return res.send(league)
  league.boulders.map(boulder => {
    boulder.wallName = walls[boulder.wall]
    boulder.color = difficultyColor[boulder.difficultyName]
  })
  res.render("builder", { tittleText: "Liga", page_schema: [{ name: "table", arrayProblems: league.boulders, doneURL: "/users/leagueBoulderDone" }] });
})

router.get("/league/:id", async (req, res) => {
  // var league = (await getClosestLeague())[0]
  const { id } = req.params
  var league = await League.findById(id).populate("boulders")
  // console.log(league)
  // return res.send(league)
  league.boulders.map(boulder => {
    boulder.wallName = walls[boulder.wall]
    boulder.color = difficultyColor[boulder.difficultyName]
  })
  res.render("builder", { tittleText: "Liga", page_schema: [{ name: "table", arrayProblems: league.boulders, doneURL: "/users/leagueBoulderDone" }] });
})

router.post("/leagueBoulderDone", async (req, res) => {
  if(req.user) {
    const { id } = req.body
    let boulder = await LeagueBoulder.findById(id)
    if(boulder.redpoints.includes(req.user._id)){
      boulder.redpoints.splice(boulder.redpoints.indexOf(req.user._id), 1)
      res.send({done: false})
    }else{
      boulder.redpoints.push(req.user._id)
      res.send({done: true})
    }
    boulder.save()
  }
})

//BOOKING
// router.get("/booking", async (req, res) => {
//   if (req.user && req.user.canBook) {
//     var month = req.query.month || new Date().getMonth();
//     var year = req.query.year || new Date().getFullYear();
//     if (month > 11) {
//       year++;
//       month %= 12;
//     }
//     if (month < 0) {
//       year--;
//       month -= -12;
//     }

//     const monthFormatted = await getWeeksInMonth(year, month);
//     var page_schema = [];
//     var users = undefined;
//     if (req.user.admin) {
//       users = await User.find().exec();
//       users.map((user) => {
//         user.parsedPermissions = user.getPermissions();
//         user.monthSubscription =
//           !!user.getPermissions()[year] &&
//           !(user.getPermissions()[year][month] == undefined);
//         user.monthTraining =
//           !!user.getPermissions()[year] && !!user.getPermissions()[year][month];
//       });
//     }
//     page_schema.push({
//       name: "booking",
//       month: monthFormatted,
//       monthName: monthName[month],
//       monthNumber: month,
//       year: year,
//       max: process.env.CAPACITY,
//       monthSubscription:
//         !!req.user.getPermissions()[year] &&
//         !(req.user.getPermissions()[year][month] == undefined),
//       monthTraining:
//         !!req.user.getPermissions()[year] &&
//         !!req.user.getPermissions()[year][month],
//       permissions: req.user.getPermissions(),
//       users: users,
//     });
//     res.render("builder", { tittleText: "Reservar", page_schema: page_schema });
//     // res.send('ok')
//   } else {
//     res.redirect("/users/dashboard");
//   }
// });

// router.post("/booking", async (req, res) => {
//   // console.log(req.body.month + " " + req.body.date + " " + req.query.time);
//   if (req.user && req.user.canBook) {
//     const user = req.user.admin
//       ? await User.findOne({ _id: req.body.userBooking })
//       : req.user;
//     const year = req.body.year;
//     const month = req.body.month;
//     const method = req.body.method;
//     if (!method) return res.redirect(`booking?month=${month}&year=${year}`);
//     const permissions = user.getPermissions();

//     //CHECK PERMISSIONS
//     var permissionGranted =
//       user._id.equals("612cbc6301d5f95906c21dd4") || req.user.admin;
//     switch (method) {
//       case "month":
//         if (!!permissions[year] && !(permissions[year][month] == undefined)) {
//           permissionGranted = true;
//         }
//         break;
//       case "training":
//         if (!!permissions[year] && !!permissions[year][month]) {
//           permissionGranted = true;
//         }
//         break;
//       case "voucher":
//         if (permissions.days > 0) {
//           permissionGranted = true;
//         }
//         break;
//       case "trainingVoucher":
//         if (permissions.trainingDays > 0) {
//           permissionGranted = true;
//         }
//         break;
//     }

//     //CREATE BOOK
//     const book = {
//       user: user._id,
//       name: user._id.equals("612cbc6301d5f95906c21dd4")
//         ? req.body.bookingName
//         : user.name,
//       trainingType: method,
//     };

//     //GET THE DATE
//     const booking = await BookDate.findOne({
//       month: month,
//       day: req.body.date,
//       year: year,
//     })
//       .populate({ path: "bookMorning", populate: { path: "user" } })
//       .populate({ path: "bookEvening", populate: { path: "user" } })
//       .populate({ path: "bookNight", populate: { path: "user" } });

//     const bookingRaw = await BookDate.findOne({
//       month: month,
//       day: req.body.date,
//       year: year,
//     });

//     //CHECK IF DUPLICATED OR FULL
//     var check = false;
//     if (permissionGranted) {
//       switch (req.query.time) {
//         case "morning":
//           check = await checkBooking(booking.bookMorning, user, method, book);
//           if (check) bookingRaw.bookMorning.push(check._id);
//           break;

//         case "evening":
//           check = await checkBooking(booking.bookEvening, user, method, book);
//           if (check) bookingRaw.bookEvening.push(check._id);
//           break;

//         case "night":
//           check = await checkBooking(booking.bookNight, user, method, book);
//           if (check) bookingRaw.bookNight.push(check._id);
//           break;
//       }
//     }

//     //SAVE DATE
//     if (!!check) {
//       switch (method) {
//         case "voucher":
//           permissions.days -= 1;
//           break;

//         case "trainingVoucher":
//           permissions.trainingDays -= 1;
//           break;
//       }
//       user.permissions = JSON.stringify(permissions);
//       user.save();
//     }
//     await bookingRaw.save();
//     logger(
//       `Reserva el día ${booking.day}/${month - -1}/${year}\\(${
//         timesNames[req.query.time]
//       }\\) para el usuario _${user.name}_\n Tipo: ${trainingNames[method]}`,
//       req.user._id
//     );
//     res.redirect(`booking?month=${month}&year=${year}`);
//   } else {
//     res.redirect("/");
//   }
// });

// router.get("/books", async (req, res) => {
//   if (req.user) {
//     var page_schema = [];
//     var month = req.query.month || new Date().getMonth();
//     var year = req.query.year || new Date().getFullYear();
//     if (month > 11) {
//       year++;
//       month %= 12;
//     }
//     if (month < 0) {
//       year--;
//       month -= -12;
//     }

//     const books = await BookDate.find({ month: month, year: year })
//       .populate({ path: "bookMorning", populate: { path: "user" } })
//       .populate({ path: "bookEvening", populate: { path: "user" } })
//       .populate({ path: "bookNight", populate: { path: "user" } });
//     var totalBooks = 0;
//     books.forEach((book) => {
//       const date = new Date(book.year, book.month, book.day);
//       book.dayName = dayName[date.getDay()];

//       for (let i = 0; i < book.bookMorning.length; i++) {
//         totalBooks++;
//         if (!(req.user.admin || book.bookMorning[i].user._id == req.user._id)) {
//           totalBooks--;
//           book.bookMorning.splice(i, 1);
//           i--;
//         }
//       }
//       for (let i = 0; i < book.bookEvening.length; i++) {
//         totalBooks++;
//         if (!(req.user.admin || book.bookEvening[i].user._id == req.user._id)) {
//           totalBooks--;
//           book.bookEvening.splice(i, 1);
//           i--;
//         }
//       }
//       for (let i = 0; i < book.bookNight.length; i++) {
//         totalBooks++;
//         if (!(req.user.admin || book.bookNight[i].user._id == req.user._id)) {
//           totalBooks--;
//           book.bookNight.splice(i, 1);
//           i--;
//         }
//       }
//     });

//     page_schema.push({
//       name: "books",
//       books: books,
//       max: process.env.CAPACITY,
//       monthName: monthName[month],
//       year: year,
//       month: month,
//       totalBooks,
//     });

//     res.render("builder", { tittleText: "Reservas", page_schema: page_schema });
//   } else {
//     res.redirect("/users/booking");
//   }
// });

// router.get("/unbook", async (req, res) => {
//   const { id } = req.query;
//   const bookInfo = await Book.findById(id);
//   if (req.user && (req.user.admin || req.user._id.equals(bookInfo.user))) {
//     const { day, month, year, time } = req.query;
//     const bookDate = await BookDate.findOne({
//       day: day,
//       month: month,
//       year: year,
//     }).exec();

//     //DELETE BOOK FROM DB
//     var cancelDate = new Date(year, month, day);
//     var date = new Date();
//     var book;
//     switch (time) {
//       case "morning":
//         cancelDate.setHours(10);
//         book = bookDate.bookMorning[bookDate.bookMorning.indexOf(id)];
//         bookDate.bookMorning.splice(bookDate.bookMorning.indexOf(id), 1);
//         break;

//       case "evening":
//         cancelDate.setHours(17);
//         book = bookDate.bookEvening[bookDate.bookEvening.indexOf(id)];
//         bookDate.bookEvening.splice(bookDate.bookEvening.indexOf(id), 1);
//         break;

//       case "night":
//         cancelDate.setHours(19);
//         book = bookDate.bookNight[bookDate.bookNight.indexOf(id)];
//         bookDate.bookNight.splice(bookDate.bookNight.indexOf(id), 1);
//         break;
//     }

//     if ((cancelDate - date) / 1000 / 60 / 60 / 24 > 1 || req.user.admin) {
//       //If the cancel is in time
//       var book = await Book.findById(id);
//       var user = await User.findById(book.user).exec();
//       var permissions = user.getPermissions();
//       switch (book.trainingType) {
//         case "voucher":
//           permissions.days += 1;
//           break;

//         case "trainingVoucher":
//           permissions.trainingDays += 1;
//           break;
//       }
//       user.permissions = JSON.stringify(permissions);
//       user.save();
//       await Book.deleteOne({ _id: id });
//       await BookDate.updateOne(
//         { day: day, month: month, year: year },
//         bookDate
//       );
//       logger(
//         `Cancelada la reserva del día ${day}/${month - -1}/${year}\\(${
//           timesNames[time]
//         }\\) del usuario _${user.name}_ \\(${
//           trainingNames[book.trainingType]
//         }\\)`,
//         req.user._id
//       );
//     }
//     res.redirect("/users/books");
//     // res.send(userid + ' => ' + day + '/' + month + '/' + year + ' ' + time);
//   } else {
//     res.redirect("/users/booking");
//   }
// });

router.get("/profile/:id", async (req, res) => {
  const { id } = req.params;
  if (req.user && (req.user._id == id || req.user.admin)) {
    const user = await User.findOne({ _id: id }).exec();
    var list = [];
    list.push({ name: `<strong><u>Correo</u></strong>: ${user.email}` });
    list.push({
      name: `<strong><u>Verificado</u></strong>: ${user.isVerified}`,
    });
    list.push({ name: `<strong><u>Admin</u></strong>: ${user.admin}` });
    list.push({ name: `<strong><u>Reservas</u></strong>: ${user.canBook}` });
    list.push({
      name: `<strong><u>Fecha</u></strong>: ${user.date.toLocaleDateString()}`,
    });
    var page_schema = [];
    var parsedKeys = Object.keys(user.getPermissions());
    parsedKeys.splice(parsedKeys.indexOf("days"), 1);
    parsedKeys.splice(parsedKeys.indexOf("trainingDays"), 1);
    var permissions = {
      days: user.getPermissions().days,
      trainingDays: user.getPermissions().trainingDays,
      parsed: user.getPermissions(),
      parsedKeys,
    };
    page_schema.push({
      name: "card",
      tittle: user.name,
      description: user._id,
      list,
      permissions,
    });
    // console.log(page_schema[0].list);
    res.render("builder", { tittleText: "Perfil", page_schema: page_schema });
  } else {
    res.redirect("/");
  }
});

//PAYMENT
// router.get("/payment", async (req, res) => {
//   if (!req.user?.admin) {
//     res.redirect("/");
//     return;
//   }
//   var users = await User.find().exec();
//   var month_users = [];

//   const month = new Date().getMonth();
//   const year = new Date().getFullYear();
//   users.map((user) => {
//     user.parsedPermissions = user.getPermissions();
//     if (user.parsedPermissions[year]?.[month] != undefined) {
//       month_users.push(user);
//     }
//   });

//   month_users.sort((a, b) => {
//     return a.parsedPermissions[year][month] - b.parsedPermissions[year][month];
//   });

//   var page_schema = [];

//   page_schema.push({
//     name: "payment",
//     users,
//   });

//   page_schema.push({
//     name: "month_subscriptions",
//     users: month_users,
//     month: +month,
//     year: +year,
//   });

//   /*page_schema.push({
//     name: "permissions",
//     users,
//   });*/
//   res.render("builder", { tittleText: "Pagos", page_schema });
// });

// router.post("/payment", async (req, res) => {
//   if (req.user?.admin) {
//     var user = await User.findOne({ _id: req.body.users });
//     var perm = user.getPermissions();
//     var obj = {};
//     switch (req.body.paid) {
//       case "month":
//         var paid = req.body.selectedmonth.split("-");
//         obj[paid[1] - 1] = 0;
//         if (!perm[paid[0]]) perm[paid[0]] = {};
//         Object.assign(perm[paid[0]], obj);
//         break;
//       case "training":
//         var paid = req.body.selectedmonth.split("-");
//         obj[paid[1] - 1] = 1;
//         if (!perm[paid[0]]) perm[paid[0]] = {};
//         Object.assign(perm[paid[0]], obj);
//         break;

//       case "voucher":
//         perm.days = +perm.days + +req.body.paidDays || +5;
//         break;

//       case "trainingVoucher":
//         perm.trainingDays = +perm.trainingDays + +req.body.paidDays || +5;
//         break;
//     }

//     user.permissions = JSON.stringify(perm);
//     await user.save();

//     const monthPaid =
//       req.body.paid == "month" || req.body.paid == "training"
//         ? String(req.body.selectedmonth).replace("-", "/")
//         : "";
//     logger(
//       `Añadido *${
//         trainingNames[req.body.paid]
//       }* ${monthPaid} para el usuario _${user.name}_`,
//       req.user._id
//     );

//     res.redirect("/users/payment");
//   } else {
//     console.log("No admin");
//     res.redirect("/");
//   }
// });

// router.get("/permissions", async (req, res) => {
// })

// router.post("/permissions", async (req, res) => {
// })

// async function checkBooking(bookArray, user, method, newBook) {
//   //FULL SESSION
//   if (bookArray.length >= process.env.CAPACITY) return false;
//   if (method == "voucher" || method == "trainingVoucher")
//     return await Book.create(newBook);

//   var book;
//   for (book of bookArray) {
//     if (!book.user._id.equals(user._id)) continue;

//     switch (method) {
//       case "month":
//         if (book.trainingType == "month") return false;
//         if (book.trainingType == "training") {
//           book.trainingType = "month";
//           book.user = book.user._id;
//           Book.updateOne({ _id: book._id }, book);
//           return false;
//         }
//         break;

//       case "training":
//         if (book.trainingType == "training") return false;
//         if (book.trainingType == "month") {
//           book.trainingType = "training";
//           book.user = book.user._id;
//           Book.updateOne({ _id: book._id }, book);
//           return false;
//         }
//         break;

//       // case "voucher":
//       //   break;

//       // case "trainingVoucher":
//       //   break;
//     }

//     // if (
//     //   book.user._id.equals(user._id) &&
//     //   (book.trainingType == method ||
//     //     (method == "training" && book.trainingType == "month") ||
//     //     (method == "month" && book.trainingType == "training"))
//     // ) {
//     //   duplicated = true;
//     //   break;
//     // }
//   }
//   return await Book.create(newBook);

//   // if (!duplicated) {
//   //   return await Book.create(newBook);
//   // } else {
//   // if (method == "training" && book.trainingType == "month") {
//   //   book.trainingType = "training";
//   //   book.user = book.user._id;
//   //   Book.updateOne({ _id: book._id }, book);
//   // }
//   // console.log("Duplicated or updated");
//   // return false;
//   // }
// }

module.exports = router;
