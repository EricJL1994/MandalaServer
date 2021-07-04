const express = require('express')
require('dotenv').config()

const mongoose = require('mongoose');
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@mandalaclimb.g7s5c.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
  .then(()=> console.log('Conectado a mongodb'))
  .catch(e => console.log('Error de conexión', e))
  
const { problem_add_multiple } = require('./controllers/problemController')

var boulders = require('./routes/boulders')
var traverses = require('./routes/traverses')

const Info = require("../models/info");
const app = express()

const hostname = 'localhost' //npm run start:dev
const port = process.env.PORT || 3000

const server = app.listen(port, () => console.log(`Server ready on http://${hostname}:${port}/`))

/****************************** */
const session = require('express-session');
const passport = require("passport");
const flash = require('connect-flash');

require('../config/passport')(passport)
app.use(express.urlencoded({extended : true}));
//express session
app.use(session({
    secret : 'secret',
    resave : true,
    saveUninitialized : true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req,res,next)=> {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error  = req.flash('error');
    res.locals.user = req.user;
    res.locals.allowRegister = process.env.REGISTER == 'true' ? true : undefined
    // console.log(req.method + req.url + ' -> Redirect: ' + req.query.redirect)
    res.locals.path = req.path;
    next();
    })
    
/****************************** */

app.set('view engine', process.env.FRONTEND);
app.set('views', __dirname + `/views_${process.env.FRONTEND}`)
app.use(express.static(__dirname + '/public'));

app.use('/images', express.static('images'));
// <>------------------------------------------<>------------------------------------------<>

app.get('/', async (req, res) => {
  var infos =  await Info.find().exec()
  //console.log(infos)
  res.render('index', {infos: infos})
})

// app.get('/test', (req, res) => {
//   Info.findOne().then(result => {
//     console.log(result)
//   })
//   res.render('index')
// })

process.on('SIGTERM', () => {
server.close(() => {
    console.log('Process terminated')
  })
})

app.use('/users', require('./routes/users'));

app.use('/boulders', boulders)
app.use('/traverses', traverses)

app.use('/addproblems', problem_add_multiple)

// <>------------------------------------------<>------------------------------------------<>

/*app.use((req, res, next) => {
  //res.redirect('/')
})*/