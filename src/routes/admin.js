const express = require("express");
const router = express.Router();

const Log = require("../../models/log");
const User = require("../../models/user");
const Boulder = require("../../models/boulder");
const League = require("../../models/league");
const LeagueBoulder = require("../../models/leagueBoulder");

const { convertTicksToDate, convertDateToTicks, formatDate, sortBoulders } = require("../commonFunctions");
const { getLeagueParticipants, confirmLeague, getClosestLeague } = require("../controllers/leagueController")
const { holdColorsFormatter, walls, difficultyColor } = require("../constants");
const { count } = require("../../models/leagueBoulder");
const { boulders_summary } = require("../controllers/problemController");

router.get("/logs", async (req,res) => {
  if (req.user && req.user.admin) {
    var logs = await Log.find().sort({date: 'desc'}).populate("user").exec();
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
  if(!req.user?.admin) return res.redirect("/");
  var page_schema = []

  page_schema.push({
    name: "admin_users",
    users: await User.find().exec(),
  })
  return res.render("builder", {page_schema})
})

router.get("/newBoulder", async (req, res) => {
  if(!req.user?.admin) return res.redirect("/");
  let diffNames = await Boulder.find().distinct("difficultyName")
  let boulderCount = {}
  for (const difficulty of diffNames) {
    boulderCount[difficulty] = await Boulder.countDocuments({difficultyName: difficulty})
  }
  // console.log(boulderCount)
  return res.render("builder", {tittleText: 'Nuevo Bloque', page_schema: [{name: "new_boulder", boulderCount, holdColors: holdColorsFormatter, walls}]})
})

router.post("/newBoulder", async (req, res) => {
  const { difficulty, number, date, holdColor, pending, wall, redpoints } = req.body
  console.log(difficulty, number, date, holdColor, pending, wall, redpoints)
})

router.get("/editBoulder/:id", async (req, res) => {
  if(!req.user?.admin){
    return res.redirect("/")
  }
  const { id } = req.params
  Boulder.findById(id).then(boulder => {
    boulder.formattedDate = formatDate(boulder.date, true)
    return res.render("builder", {tittleText: 'Editar Bloque', page_schema: [{name: "edit_boulder", boulder, holdColors: holdColorsFormatter, walls}]})
  }).catch(e => {
    console.log(e)
    return res.render("builder", {tittleText: 'Editar Bloque', page_schema: [{name: "edit_boulder"}]})
  })
})

router.post("/editBoulder/:id", async (req, res) => {
  if(!req.user?.admin) return res.redirect("/");
  const { id } = req.params
  const { difficulty, number, date, holdColor, pending, wall, clear } = req.body

  Boulder.findById(id).then(async (boulder) =>  {
    //TODO: PENDING TIMEZONE ADJUSTMENT
    if(!!clear) {
      boulder.redpoints.splice(0, boulder.redpoints.length)
      boulder.league = undefined
    }
    boulder.dateValue = convertDateToTicks(new Date(date)) + 36960000000 //THIS
    boulder.holdColor = holdColor
    boulder.wall = wall
    boulder.pending = !!pending
    boulder.date = date
    await boulder.save()
  }).catch(e => {
    console.warn(e)
  })
  return res.redirect("/boulders/show")
})

router.get("/boulders", async (req, res) => {
  if(req.user?.admin){
    var boulders = await Boulder.find().sort({difficultyName: 'asc', number: 'asc'}).exec();
    boulders.map((log) => {
      log.date = formatDate(convertTicksToDate(log.dateValue))
      return log;
    });
  
    res.render("builder", {page_schema: [{name: "admin_boulders", boulders}]})
  }else{
    res.redirect("/")
  }
})

// router.get("/adjust", async (req, res) => {
//   if(req.user?.admin){
//     Boulder.find().then(result => result.map(b => {
//         //console.log(b)
//         let date = convertTicksToDate(b.dateValue)
//         date.setFullYear(2022)
//         b.dateValue = convertDateToTicks(date)
//         //console.log(b)
//         b.save()
//       }))
//     res.send("ok")
//   }
// })

router.get("/leagues", async (req, res) => {
  let leagues = await League.find().sort({date: "desc"})/*.populate("boulders")*/
  // const start = new Date()

  await Promise.all(leagues.map(async league => {
    if(league.ready) {
      await getLeagueParticipants(league._id).then(users => {
        league.participants = users[0].users
      })
    }
    return league
  }))
  
  // console.log(leagues)
  // const end = new Date()
  // console.log((end - start))
  return res.render("builder", {page_schema: [{name: "leagues", leagues}]})
  // res.send(leagues)
})

router.get("/newLeague", async (req, res) => {
  if(req.user?.admin){
    let date = new Date()
    date.setHours(0, 0, 0, 0)
    await League.create({date})
    return res.redirect("/admin/leagues")
  }
  res.redirect("/")
})

router.get("/editLeague/:id", async (req, res) => {
  if(!req.user?.admin){
    return res.redirect("/")
  }

  const { id } = req.params
  const league = await League.findById(id)
  var boulders = await boulders_summary()
  boulders = boulders.map(difficulty => {
    for (const boulder of difficulty.boulders) {
      boulder.added = (boulder.league == id)
      boulder.done = (boulder.league != undefined) && (boulder.league != id)
    }
    return difficulty
  })
  
  // console.table(boulders[1].boulders)
  return res.render("builder", {page_schema: [{name: "edit_league", league, boulders}]})
})

router.post("/editLeague/:id", async (req, res) => {
  if(!req.user?.admin){
    return res.redirect("/")
  }

  const { id } = req.params
  const { date } = req.body
  const league = await League.findById(id)
  league.date = date
  await league.save()
  // console.log(league, date)
  // res.send("ok")
  res.redirect("/admin/leagues")
  //TODO: Guardar la fecha del formulario
})

router.post("/saveLeague/:id", async (req, res) => {
  if(!req.user?.admin){
    return res.redirect("/")
  }

  const { id } = req.params
  await confirmLeague(id)
  res.redirect("/admin/leagues")
})

router.post("/addToLeague/", async (req, res) => {
  if(!req.user?.admin){
    return res.redirect("/")
  }

  const { id, difficultyName, number } = req.body
  // console.log({ id, difficultyName, number })
  var boulder = await Boulder.findOne({difficultyName, number}).exec()
  // console.log(boulder)
  if(boulder.league){
    if(boulder.league == id){
      boulder.league = undefined
      boulder.save()
    }
    return res.send({added: false})
  }
  console.log("NO LEAGUE")
  boulder.league = id
  boulder.save()
  // console.log(boulder)
  return res.send({added: true})
})

router.get("/setPending", async (req, res) => {
  
  return res.render("builder", {page_schema: [{name: "set_pending", holdColors: holdColorsFormatter}]})
})

router.post("/setPending", async (req, res) => {
  if(!req.user?.admin){
    return
  }

  const { holdColor } = req.body
  var boulders = await Boulder.find({holdColor}).exec()
  console.log("Marcando los bloques " + holdColor + " como pendientes") //LOG
  for (const boulder of boulders) {
    boulder.pending = true;
    // console.log(boulder)
    boulder.save()
  }
  
  // return res.send({done: true})
  return res.redirect("/boulders/show")
})

// router.get("/sum", async (req, res) => {
//   const league = await getClosestLeague();
//   console.log(league)
//   // res.send(await boulders_summary())
//   // let boulder = await Boulder.findOne({difficultyName: "Orange", number: 3}).exec()
//   // let b = await LeagueBoulder.formLeagueBoulder(boulder)
//   // console.log(b)
//   // res.send(b)
//   // let b = LeagueBoulder.formLeagueBoulder(boulder, formed => {
//   //   console.log(formed)
//   //   res.send(formed)
//   // })
//   res.send(league)
// })

module.exports = router;