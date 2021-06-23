const express = require("express");
const router = express.Router();

const User = require("../../models/user");
const bcrypt = require("bcrypt");
const passport = require("passport");
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const jwt = require('jsonwebtoken');
let transporter = nodemailer.createTransport(smtpTransport({    
  service: 'gmail',
  host: 'smtp.gmail.com', 
  auth: {        
       user: process.env.GMAIL_USER,        
       pass: process.env.GMAIL_PASS
  }
}));

//LOGIN
router.get("/login", (req, res) => {
  if(req.user) {
    res.redirect('/users/dashboard')
  }else{
    res.render("login");
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/users/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

//REGISTER
router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];
  console.log(" Name " + name + " email :" + email + " pass:" + password);
  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Por favor, rellene todos los campos' });
  }
  //check if match
  if (password !== password2) {
    errors.push({ msg: 'Las contraseñas no coinciden' });
  }

  //check if password is more than 6 characters
  if (password.length < 6) {
    errors.push({ msg: 'La contraseña debe tener al menos 6 caracteres' });
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
        errors.push({ msg: 'El email está en uso' });
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
                req.flash("success_msg", 'Se ha registrado con éxito');
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
router.get('/dashboard', (req, res) => {
  if(!req.user) return res.redirect('/users/login')
    return res.render('dashboard')
})

router.post('/dashboard', (req, res) => {
  res.send('ok')
})

//VERIFICATION
router.get('/verification/:token', async function(req, res) {
  const {token} = req.params

  if(!token){
    req.flash("error_msg", 'El link es incorrecto');//No hay token
    return res.redirect('/users/login')
  }

  let payload = null
  try{
    payload = jwt.verify(
      token,
      process.env.TOKEN
      );
  } catch (err){
    if(err.name= 'TokenExpiredError'){
      req.flash("error_msg", 'El link ha caducado');//Token expirado
      return res.redirect('/users/login')
    }
    return res.status(500).send(err)
  }

  try{
    // Step 2 - Find user with matching ID
    const user = await User.findOne({ _id: payload.ID }).exec();
    if (!user) {
      req.flash('error_msg', 'El usuario no está registrado')
      return res.redirect('/user/register')
    }
    // Step 3 - Update user verification status to true
    user.isVerified = true;
    await user.save();
    req.flash("success_msg", 'Se ha verificado con éxito, inicie sesión');
    return res.redirect('/users/login')
 } catch (err) {
    return res.status(500).send(err);
 }
})

router.post('/verification', (req, res) => {
  console.log('Post a verification')
  if(req.user && !req.user.isVerified){
    const url = `http://localhost:3000/users/verification/${req.user.generateVerificationToken()}`
    var to = req.user.email,
    subject = 'Verificación de email', 
    message = `Haz click <a href = ${url}>aquí</a> para confirmar tu email`;
    
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: to,                   // from req.body.to
      subject: subject,         //from req.body.subject
      html: message             //from req.body.message
    };
    //delivery
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);  
      } else {     
        res.render('dashboard')  
      }   
    });
  }else{
    res.redirect('/users/login')
  }
})

router.post('/config', (req, res) => {
  //const { name, email, password, password2 } = req.body;
  const {name, email} = req.body
  console.log(req.body)
  res.redirect('/users/dashboard')
})

module.exports = router;
