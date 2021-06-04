const express = require('express')
require('dotenv').config()

const mongoose = require('mongoose');
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@mandalaclimb.g7s5c.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log('Conectado a mongodb'))
  .catch(e => console.log('Error de conexión', e))
  
const { problem_show, problem_add_multiple, last_problems } = require('./controllers/problemController')

var boulders = require('./routes/boulders')
var traverses = require('./routes/traverses')

const app = express()

const hostname = 'localhost' //npm run start:dev
const port = process.env.PORT || 3000

const server = app.listen(port, () => console.log(`Server ready on http://${hostname}:${port}/`))

/****************************** */
const session = require('express-session');
const passport = require("passport");

require('../config/passport')(passport)
app.use(express.urlencoded({extended : false}));
//express session
app.use(session({
    secret : 'secret',
    resave : true,
    saveUninitialized : true
}));
app.use(passport.initialize());
app.use(passport.session());
/****************************** */

app.set('view engine', process.env.FRONTEND);
app.set('views', __dirname + `/views_${process.env.FRONTEND}`)
app.use(express.static(__dirname + '/public'));

// <>------------------------------------------<>------------------------------------------<>

app.get('/', (req, res) => {
  res.render('index')
})

process.on('SIGTERM', () => {
server.close(() => {
    console.log('Process terminated')
  })
})
var users = require('./routes/users')
app.use('/users', users);

app.use('/boulders', boulders)
app.use('/traverses', traverses)

app.use('/addproblems', problem_add_multiple)

// <>------------------------------------------<>------------------------------------------<>