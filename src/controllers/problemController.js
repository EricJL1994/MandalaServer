const lowDB = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const { rawListeners } = require('../../models/boulder')

const Boulder = require('../../models/boulder')
const Traverse = require('../../models/traverse')
const { logger, convertTicksToDate, formatDate, convertDateToTicks} = require('../commonFunctions')
const { problemTypesToJSONDatabase, difficultyColor, walls } = require('../constants')

// ESTA COSA VA CON RUTA RELATIVA DESDE EL PATH QUE LANZA EL PROYECTO (la ruta del package.json)
const adapter = new FileSync('./src/storageData/database.json')
const database = lowDB(adapter)

// var index = require('../views_pug/index.pug')
// var problemDetail = require('../views_pug/boulder/boulder.pug')

exports.problem_show = async function(req, res) {
  console.log('Request petition:')
  console.log(req.query)
  
  res.render('show_problems', {tables: [await fetch_problems(req, res)]})
}

exports.problem_detail = async function(req, res) {
  const problemDetailData = await fetch_problems(req, res)
  res.render('problem_detail', {problemDetail: problemDetailData[0]});
}

exports.problem_get = function(req, res) {
  // req.query --------------- www.url.com/?color=verde&var2=loquesea2
  // req.params -------------- www.url.com/verde/loquesea2

  console.log('Request petition:')
  console.log(req.query)
  
  if (!!req.query.type) {
    const problemType = problemTypesToJSONDatabase[req.query.type.trim()]
    
    if (!!req.query.color) {
      const color = req.query.color.trim()
      res.send(database.get(problemType).filter({dificultyName: color}).value().map(element => JSON.stringify(element)))
    } else {
      res.send(database.get(problemType).value().map(element => JSON.stringify(element)))
    }

  }
  else res.status(400).send('No se ha indicado tipo de problema')
}

exports.problem_add = function(req, res) {
  const newProblemData = JSON.parse(req.query.problem)
  const problemType = req.query.type

  const problemExists = database.get(problemType).find({ dificultyName: newProblemData.dificultyName, number: newProblemData.number }).value()
  //console.log(problemExists)

  if (!problemExists) {
    //console.log(newProblemData)
    database.get(problemType).push(newProblemData).write()

    //logger('SUCCESS', 'Problema creado')
    res.status(200).send('Se ha insertado el problema')
  } else {
    //logger('ERROR', 'El problema ya existe en la aplicación')
    res.status(400).send('El problema ya existe en la aplicación')
  }
}

exports.last_problems = async function(req, res) {
  // res.render('last_problems', {tables: await fetch_problems(req, res)})
  res.render('show_problems', {tables: [await fetch_problems(req, res, req.query.lastDays || 15)]})
}

exports.problem_add_multiple = async function(req, res) {
  const newProblemsData = JSON.parse(req.query.problems)
  const problemsType = problemTypesToJSONDatabase[req.query.type]
  const databaseSize = database.get(problemsType).size().value()
  var edited = false

  newProblemsData.map(async problemString=> {
    const problem = JSON.parse(problemString)
    //const problemExists = database.get(problemsType).find({ dificultyName: problem.dificultyName, number: problem.number }).value()
    //const mongoExists = Boulder.findOne({dificultyName: problem.dificultyName, number: problem.number}).exec()

    const mongoExists = await Boulder.findOne({dificultyName: problem.dificultyName, number: problem.number}).exec()

    if (!mongoExists) {
      //console.log(problem)
      Boulder.create(problem)
  
      logger('SUCCESS', 'Problema creado')
    } else {
      edited = true
      Boulder.findOneAndReplace({dificultyName: problem.dificultyName, number: problem.number}, problem).exec()
      logger('SUCCESS', 'Problema editado')
    }
  })

  if (!edited) {
    res.status(200).send('Se han insertado los problemas')
  } else {
    res.status(200).send(`${newProblemsData.length - (database.get(problemsType).size().value() - databaseSize)} problemas editados`)
  }
}

exports.problem_update = function(req, res) {
  const updateProblemData = JSON.parse(req.query.problem)
  const problemType = req.query.type

  const problemExists = database.get(problemType).find({ dificultyName: newProblemData.dificultyName, number: newProblemData.number }).value()
  console.log(problemExists)

  if (problemExists) {
    console.log(updateProblemData)

    database.get(problemType).find({ dificultyName: newProblemData.dificultyName, number: newProblemData.number }).assign(updateProblemData)

    logger('SUCCESS', 'Problema actualizado')
    res.status(200).send('Se ha actualizado el problema')
  } else {
    // Revisar código error
    logger('ERROR', 'El problema no se ha actualizado')
    res.status(400).send('El problema no ha podido actualizarse porque no existe')
    // Inserto el problema si no se encuentra?
  }
}

exports.problem_delete = function(req, res) {
  res.send();
}

/*******************************************************/

async function fetch_problems(req, res, lastDays, name) {
  
  var mongoProblems
  switch (req.baseUrl) {
    case '/traverses':
      mongoProblems = Traverse.find()
      break
    case '/boulders':
      mongoProblems = Boulder.find()
      break
    default:
      mongoProblems = Boulder.find()
  }

  if(req.query.difficultyName) mongoProblems.find({dificultyName: req.query.difficultyName})
  
  if(req.query.number) mongoProblems.find({number: req.query.number})

  if(lastDays) {
    var d = new Date();
    d.setDate(d.getDate() - lastDays)
    mongoProblems.find({dateValue: {$gte: convertDateToTicks(d)}}).sort({dateValue: 'asc'})
  }
  mongoProblems.sort({dificultyName: 'asc', number: 'asc'}).exec()

  return mongoProblems.then(result => result.map(problem => {
    return Object.assign({}, {...problem.toObject(), date: formatDate(convertTicksToDate(problem.dateValue)), color: difficultyColor[problem.dificultyName], wallName: walls[problem.wall]})
  })).catch(err => console.log(err))
}
