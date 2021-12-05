const lowDB = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const Mongoose = require('mongoose')

const Boulder = require('../../models/boulder')
const Traverse = require('../../models/traverse')
const User = require('../../models/user')
const { logger, convertTicksToDate, formatDate, convertDateToTicks} = require('../commonFunctions')
const { problemTypesToJSONDatabase, difficultyColor, walls, holdColorsFormatter } = require('../constants')

// ESTA COSA VA CON RUTA RELATIVA DESDE EL PATH QUE LANZA EL PROYECTO (la ruta del package.json)
const adapter = new FileSync('./src/storageData/database.json')
const database = lowDB(adapter)

exports.problem_show = async function(req, res) {
  // console.log('A')
  // const problems = exports.fetch_problems(req, res)
  // console.log('B')
  // res.render('index')
  // res.render('show_problems', {tables: [await parse_problems(fetch_problems(req, res), req.user)], searchTime: (req.query.lastDays || 0)})
  var page_schema = []

  page_schema.push({
        name: "table",
        arrayProblems: await parse_problems(fetch_problems(req, res), req.user),
      })
  // res.render('show_problems', {tables: [await parse_problems(fetch_problems(req, res), req.user)], searchTime: (req.query.lastDays || 0)})
  res.render('builder', {tittleText: 'Boulders',page_schema: page_schema, searchTime: (req.query.lastDays || 0)})
}

exports.problem_detail = async function(req, res) {
  const problemDetailData = await parse_problems(fetch_problems(req, res))
  if(req.user && req.user.admin){
    problemDetailData[0].userList = await User.find({_id: {$in: problemDetailData[0].redpoints}})
  }
  // console.log(problemDetailData[0])
  res.render('problem_detail', {problemDetail: problemDetailData[0]});
}

exports.problem_get = function(req, res) { //SIN USAR
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

exports.problem_add = function(req, res) { //SIN USAR
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
  res.render('show_problems', {tables: [await fetch_problems(req, res)], searchTime: (req.query.lastDays || 15)})
  // res.render('show_problems', {tables: [await fetch_problems(req, res, req.query.lastDays || 15)]})
}

exports.problem_add_multiple = async function(req, res) {
  const newProblemsData = JSON.parse(req.query.problems)
  const problemsType = problemTypesToJSONDatabase[req.query.type]
  const databaseSize = await Boulder.countDocuments().exec()
  var edited = false

  //Devuelve un array de promesas en .map, con Promise.all podemos hacer el await, ahora responde correctamente con el status debido
  await Promise.all(newProblemsData.map(async problemString=> {
    const problem = JSON.parse(problemString)
    const mongoExists = await Boulder.findOne({dificultyName: problem.dificultyName, number: problem.number}).exec()

    if (!mongoExists) {
      Boulder.create(problem)
      logger('SUCCESS', 'Problema creado')
    } else {
      edited = true
      Boulder.findOneAndReplace({dificultyName: problem.dificultyName, number: problem.number}, problem).exec()
      logger('SUCCESS', 'Problema editado')
    }
  }))

  if (!edited) {
    res.status(200).send('Se han insertado los problemas')
  } else {
    res.status(200).send(`${newProblemsData.length - (await Boulder.count().exec() - databaseSize)} problemas editados`)
  }
}

exports.problem_update = function(req, res) { //SIN USAR
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

exports.problem_delete = function(req, res) { //SIN USAR
  res.send();
}

exports.problems_done = async function(req, res) {
  
  if (req.user) {
    problemsParsed = JSON.parse(JSON.parse(req.body.problemsToSubmit))
    const allProblems = await Boulder.find().exec()

    allProblems.forEach(problem => {
      
      if(problemsParsed.includes(problem._id+'')){
        if(problem.redpoints.includes(req.user._id)){
          problem.redpoints.splice(problem.redpoints.indexOf(req.user._id), 1)
        }else{
          problem.redpoints.push(req.user._id)
        }
        Boulder.updateOne({_id: problem._id}, problem).exec()
      }
    });
  }
  res.redirect(req.originalUrl)
}
/*******************************************************/

function fetch_problems (req, res) {
  
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
  var options = {}

  if(!req.query.pending) options.pending= false
  // if(req.query.difficultyName) mongoProblems.find({dificultyName: req.query.difficultyName})
  if(req.query.difficultyName) options.dificultyName= req.query.difficultyName
  
  // if(req.query.number) mongoProblems.find({number: req.query.number})
  if(req.query.number) options.number = req.query.number

  
  if(req.query.filterDays) {
    var d = new Date();
    d.setDate(d.getDate() - req.query.filterDays)
    options.dateValue = {$gte: convertDateToTicks(d)}
    // mongoProblems.find({dateValue: {$gte: convertDateToTicks(d)}}).sort({dateValue: 'asc'})
    mongoProblems.sort({dateValue: 'asc'})
  }
  mongoProblems.find(options)
  
  return mongoProblems.sort({dificultyName: 'asc', number: 'asc'})
  // mongoProblems.sort({dificultyName: 'asc', number: 'asc'}).exec()

  /*return mongoProblems.then(result => result.map(problem => {
    return Object.assign({}, {...problem.toObject(),
      date: formatDate(convertTicksToDate(problem.dateValue)),
      color: difficultyColor[problem.dificultyName],
      wallName: walls[problem.wall],
      done: req.user ? problem.redpoints.includes(req.user._id) : false
    })
  })).catch(err => console.log(err))*/
}

function parse_problems (problems, user){
  if(user && user.admin){
    
  }
  return problems.then(result => result.map(problem => {
    return Object.assign({}, {...problem.toObject(),
      date: formatDate(convertTicksToDate(problem.dateValue)),
      color: difficultyColor[problem.dificultyName],
      wallName: walls[problem.wall],
      done: user ? problem.redpoints.includes(user._id) : false,
      holdColorShort: holdColorsFormatter[problem.holdColor]
    })
  })).catch(err => console.log(err))
}

exports.fetch_problems = fetch_problems
exports.parse_problems = parse_problems
