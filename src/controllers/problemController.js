const lowDB = require('lowdb')

const FileSync = require('lowdb/adapters/FileSync')
const { logger, convertTicksToDate, formatDate, htmlEnclose } = require('../commonFunctions')
const { problemTypesToJSONDatabase } = require('../constants')

// ESTA COSA VA CON RUTA RELATIVA DESDE EL PATH QUE LANZA EL PROYECTO (la ruta del package.json)
const adapter = new FileSync('./src/storageData/database.json')
const database = lowDB(adapter)

// var index = require('../views_pug/index.pug')
// var problemDetail = require('../views_pug/boulder/boulder.pug')

exports.problem_show = function(req, res) {
  // req.query --------------- www.url.com/?color=verde&var2=loquesea2
  // req.params -------------- www.url.com/verde/loquesea2

  console.log('Request petition:')
  console.log(req.query)
  const result = database.get(problemTypesToJSONDatabase['Boulder'], problemTypesToJSONDatabase['Traverse']).value().sort((a,b)=> a.dificultyName == b.dificultyName ? (a.number > b.number ? 1:-1) : a.dificultyName > b.dificultyName ? 1 : -1)
  result.forEach(element => element.date = formatDate(convertTicksToDate(element.dateValue)))
  res.render("show_problems", {arrayBloques: result })
  /*const result = database.get(
    problemTypesToJSONDatabase['Boulder'], problemTypesToJSONDatabase['Traverse']).value().map(
      element => `${element.dificultyName}_${element.number} - ${formatDate(convertTicksToDate(element.dateValue))}`)

  var html = ""
  result.forEach(element => {
    html+= htmlEnclose(element, 'li')
  })

  html = htmlEnclose(html, 'ul')
  //html = htmlEnclose(html, 'table')
  res.send(html)*/
}

exports.problem_detail = function(req, res) {
  res.render('problemDetail', {message: 'Prueba'});
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

exports.problem_add_multiple = function(req, res) {
  const newProblemsData = JSON.parse(req.query.problems)
  const problemsType = req.query.type
  const databaseSize = database.get(problemsType).size().value()
  const failed = false
  newProblemsData.map(problemString => {
    const problem = JSON.parse(problemString)
    const problemExists = database.get(problemsType).find({ dificultyName: problem.dificultyName, number: problem.number }).value()
    
    if (!problemExists) {
      console.log(problem)
      database.get(problemsType).push(problem).write()
  
      logger('SUCCESS', 'Problema creado')
    } else {
      failed = true
      logger('ERROR', 'El problema ya existe en la aplicación')
    }
  })

  if (!failed) {
    res.status(200).send('Se han insertado los problemas')
  } else {
    res.status(400).send(`${database.get(problemsType).size().value() - newProblemsData.length - databaseSize} problemas han fallado`)
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