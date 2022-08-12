const express = require("express");
const router = express.Router();

const Log = require("../../models/log");
const User = require("../../models/user");
const Boulder = require("../../models/boulder");
const League = require("../../models/league");
const LeagueBoulder = require("../../models/leagueBoulder");

const { convertTicksToDate, convertDateToTicks, formatDate, sortBoulders } = require("../commonFunctions");
const { holdColorsFormatter, walls, difficultyColor } = require("../constants")

router.get("/logs", async (req,res) => {
  if (req.user && req.user.admin) {
    var logs = await Log.find().populate("user").exec();
    logs.map((log) => {
      log.tittle = log.user?.name;
      log.description = log.request;
      // console.log(info)
      return log;
    });
    // console.log(infos)

    //console.log(infos)
    // res.render("index", { infos });
    res.render("builder", {page_schema: [{name: "logs", logs}]})
  } else {
    res.redirect("/");
  }
})

router.get("/register", async (req,res) => {
  if(req.user?.admin){
    return res.render("builder", {page_schema: [{name:"admin_register"}]})
  }
  return res.redirect("/")
})

router.post("/register", async (req,res) => {
  if(req.user?.admin){
    var success_msg = ''
    var errors = undefined
    const { name } = req.body;
    const user = await User.findOne({name: name})
    if (!!name && !user){
      await User.create({name: name, password: ""})
      success_msg = "Usuario creado: " + name
    }else{
      errors = [{ msg: "No se ha podido crear el usuario" }]
    }
    return res.render("builder", {errors, success_msg, page_schema: [{name:"admin_register"}]})
  }
})

router.get("/users", async (req,res) => {
  var page_schema = []

  page_schema.push({
    name: "admin_users",
    users: await User.find().exec(),
  })
  return res.render("builder", {page_schema})
})

router.get("/editBoulder/:id", async (req, res) => {
  const { id } = req.params
  Boulder.findById(id).then(boulder => {
    // console.log(boulder)
    boulder.date = convertTicksToDate(boulder.dateValue).toISOString().split('T')[0]
    return res.render("builder", {page_schema: [{name: "edit_boulder", boulder, holdColors: holdColorsFormatter}]})
  }).catch(e => {
    console.log(e)
    return res.render("builder", {page_schema: [{name: "edit_boulder"}]})
  })
})

router.get("/editBoulder", async(req, res) => {

})

router.post("/editBoulder/:id", async (req, res) => {
  const { id } = req.params
  const { difficulty, number, date, holdColor, pending, wall } = req.body

  Boulder.findById(id).then(async (boulder) =>  {
    //PENDING TIMEZONE ADJUSTMENT
    boulder.dateValue = convertDateToTicks(new Date(date)) + 36960000000 //THIS
    boulder.holdColor = holdColor
    boulder.wall = wall
    boulder.pending = !!pending
    console.log(boulder)
    await boulder.save()
  }).catch(e => {
    console.log(e)
  })
  return res.redirect("/boulders/show")
  // console.log(req.body)
  // console.log(difficulty)
  // console.log(number)
  // console.log(date)
  // console.log(holdColor)
  // console.log(pending)
  // console.log(wall)
})

router.get("/boulders", async (req, res) => {
  var boulders = await Boulder.find().sort({difficultyName: 'asc', number: 'asc'}).exec();
  boulders.map((log) => {
    log.date = formatDate(convertTicksToDate(log.dateValue))
    return log;
  });

  res.render("builder", {page_schema: [{name: "admin_boulders", boulders}]})
})

router.get("/adjust", async (req, res) => {
  Boulder.find().then(result => result.map(b => {
      //console.log(b)
      let date = convertTicksToDate(b.dateValue)
      date.setFullYear(2022)
      b.dateValue = convertDateToTicks(date)
      //console.log(b)
      b.save()
    }))
  res.send("ok")
})

router.get("/league", async (req, res) => {
  let leagues = await League.find().sort({date: "desc"})
  let boulders = await Boulder.find({dateValue: {$gte: convertDateToTicks(leagues[1].date)}, pending: false})
  console.log([leagues[0].boulders.length, boulders.length])
  // console.log(boulders)
  let currentLeague = await League.findOne({_id: leagues[0]._id})
  // console.log(currentLeague)
  if(!currentLeague.boulders.length){
    console.log("Añadiendo los bloques de la liga")
    for (const boulder of boulders) {
      // console.log(boulder)
      let lb = await LeagueBoulder.findOne({difficultyName: boulder.difficultyName, number: boulder.number})
      if(!lb){
        console.log("Creando bloque ", boulder.difficultyName + boulder.number)
        lb = await LeagueBoulder.create({
          difficultyName: boulder.difficultyName,
          number: boulder.number,
          holdColor: boulder.holdColor,
          wall: boulder.wall
        })
      }
      currentLeague.boulders.push(lb._id)
    }
    console.log("Guardando los datos")
    await currentLeague.save()
  }
  leagues = await League.find().sort({date: "desc"}).populate("boulders")
  // console.log(leagues)
  // return res.send(leagues)
  // console.log(l)
  let h = leagues[0].boulders.map(b => {
    return Object.assign({}, {...b.toObject(), /*date: formatDate(new Date()), */wallName: walls[b.wall], color: difficultyColor[b.difficultyName]})
    // return Object.assign({}, {...b.toObject(), date: new Date()})
  })
  h.sort(sortBoulders)
  // console.log(h)
  return res.render("builder", {page_schema: [{name: "table", arrayProblems: h}]})
  res.send("ok")
})

router.get("/newLeague", async (req, res) => {
  let league = League.create({date: new Date()})
  res.redirect("/admin/league")
})

module.exports = router;