const lowDB = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const Boulder = require('../../models/boulder')
const { logger, convertTicksToDate, formatDate, htmlEnclose } = require('../commonFunctions')
const { problemTypesToJSONDatabase } = require('../constants')

// ESTA COSA VA CON RUTA RELATIVA DESDE EL PATH QUE LANZA EL PROYECTO (la ruta del package.json)
const adapter = new FileSync('./src/storageData/database.json')
const database = lowDB(adapter)

// var index = require('../views_pug/index.pug')
// var problemDetail = require('../views_pug/boulder/boulder.pug')

exports.problem_show = async function(req, res) {
  // req.query --------------- www.url.com/?color=verde&var2=loquesea2
  // req.params -------------- www.url.com/verde/loquesea2

  console.log('Request petition:')
  console.log(req.query)

  const mongoBoulders = await Boulder.find().sort({dificultyName: 'asc', number: 'asc'})
                      .then(result => result.map(boulder => {
                          return {...boulder.toObject(), date: formatDate(convertTicksToDate(boulder.dateValue))}
                        })
                      ).catch(err => console.log(err))

  // const resultBoulders = database.get(problemTypesToJSONDatabase['Boulder']).sortBy(['dificultyName', 'number']).value().map(boulder => {
  //   return {...boulder, date: formatDate(convertTicksToDate(boulder.dateValue))}
  // })
  
  const resultTraverses = database.get(problemTypesToJSONDatabase['Traverse']).sortBy(['dificultyName', 'number']).value().map(traverse => {
    return {...traverse, date: formatDate(convertTicksToDate(traverse.dateValue))}
  })

  res.render("show_problems", {arrayBoulders: mongoBoulders,  arrayTraverses: resultTraverses})
}

exports.problem_detail = function(req, res) {
  res.render('problem_detail', {message: 'Prueba'});
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
  console.log(problemExists)

  if (!problemExists) {
    console.log(newProblemData)
    database.get(problemType).push(newProblemData).write()

    logger('SUCCESS', 'Problema creado')
    res.status(200).send('Se ha insertado el problema')
  } else {
    logger('ERROR', 'El problema ya existe en la aplicación')
    res.status(400).send('El problema ya existe en la aplicación')
  }
}

exports.test = async function(req, res){
  console.log("TEST")
  const mongoExists = await Boulder.findOne({dificultyName: "Green", number: 1}).exec()

  console.log(mongoExists);
  res.send();
}

exports.problem_add_multiple = async function(req, res) {
  const newProblemsData = JSON.parse(req.query.problems)
  const problemsType = req.query.type
  const databaseSize = database.get(problemsType).size().value()
  var edited = false

  newProblemsData.map(async problemString=> {
    const problem = JSON.parse(problemString)
    //const problemExists = database.get(problemsType).find({ dificultyName: problem.dificultyName, number: problem.number }).value()
    //const mongoExists = Boulder.findOne({dificultyName: problem.dificultyName, number: problem.number}).exec()

    const mongoExists = await Boulder.findOne({dificultyName: problem.dificultyName, number: problem.number}).exec()

    if (!mongoExists) {
      console.log(problem)
      Boulder.create(problem)
      //database.get(problemsType).push(problem).write()
  
      logger('SUCCESS', 'Problema creado')
    } else {
      edited = true
      /*database.get(problemsType).find(problemExists).assign({
        "dateValue": problem.dateValue,
        "holdColor": problem.holdColor,
        "pending": problem.pending,
        "intersectionsName": problem.intersectionsName,
        "wall": problem.wall
      }).write();*/
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