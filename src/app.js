const express = require('express')
const { problem_show } = require('./controllers/problemController')

var boulders = require('./routes/boulders')
var traverses = require('./routes/traverses')

const app = express()

const hostname = 'localhost' //npm run start:dev
const port = process.env.PORT || 3000

const server = app.listen(port, () => console.log(`Server ready on http://${hostname}:${port}/`))

// app.set('view engine', 'ejs')
app.set('view engine', 'pug')
// app.set('views', __dirname + '/views')
app.set('views', __dirname + '/views_pug')
app.use(express.static(__dirname + "/public"))

// <>------------------------------------------<>------------------------------------------<>

app.get('/', (req, res) => {
  //res.send('<a href="/showproblems">All Problems</a>')
  res.render("index")
})

process.on('SIGTERM', () => {
server.close(() => {
    console.log('Process terminated')
  })
})

app.use('/showproblems', problem_show)

app.use('/boulders', boulders)
app.use('/traverses', traverses)

// <>------------------------------------------<>------------------------------------------<>
