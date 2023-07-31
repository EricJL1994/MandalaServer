const User = require("../models/user");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

module.exports = function (passport) {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      //match user
      User.findOne({ email: email })
        .then((user) => {
          if (!user) {
            return done(null, false, { message: "Este email no ha sido registrado" });
          }
          //math passwords
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            // if (isMatch) {
            //   return done(null, user);
            // } else {
            //   return done(null, false, { message: "Contraseña incorrecta" });
            // }
            return isMatch ? done(null, user) : done(null, false, { message: "Contraseña incorrecta" })
          });
        })
        .catch((err) => {
          console.log(err);
        });
    })
  );

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(async function (id, done) {
    await User.findById(id, function (err, user) {
      done(err, user);
    });
  });
};
