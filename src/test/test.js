
// const nodemailer = require("nodemailer");
// const smtpTransport = require("nodemailer-smtp-transport");
const Log = require("../../models/log");
const League = require("../../models/league");
const LeagueBoulder = require("../../models/leagueBoulder");
const User = require("../../models/user");
const Boulder = require("../../models/boulder");
const { convertTicksToDate, convertDateToTicks,formatDate } = require("../commonFunctions");
const { consoleLogger } = require("../utils/logger");
const { sendMail, welcomeMail, recoveryMail } = require("../utils/email");
exports.check = async function(req, res, next){
  // console.log(req.method, req.url)
  // console.log(req.path)
  // Boulder.collection.distinct("difficultyName", (err, r) =>{
  //   console.log(r)
  // })
  // console.log("Check")
  
  // console.log("Post a verification");
  /*let transporter = nodemailer.createTransport(
    smtpTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    })
  );
  const url = `http://mandalaclimb.herokuapp.com/users/verification/${req.user.generateVerificationToken()}`;
  var to = "eric.jl1994+test@gmail.com",
    subject = "Verificación de email",
    message = `Haz click <a href = ${url}>aquí</a> para confirmar tu email`;

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: to, //from req.body.to
    subject: subject, //from req.body.subject
    html: message, //from req.body.message
  };
  //delivery
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) console.log(error);
    console.log(info)
  });*/


  // let league = await League.findOne().sort({date: "desc"}).populate("boulders").exec()
  // let aggregate = await League.aggregate([
  //   // {$match:{_id:league._id}},
  //   {$unwind:"$boulders"},
  //   {$lookup: {
  //     from: LeagueBoulder.collection.name,
  //     localField: "boulders",
  //     foreignField: "_id",
  //     as: "boulders",
  //   }},
  //   {$unwind:"$boulders"},
  //   {$unwind:"$boulders.redpoints"},
  //   // {$group:{_id:"$lb.redpoints"}},
  //   {$group:{_id:"$_id", users: {$addToSet: "$boulders.redpoints"}}},
  //   {$lookup: {
  //     from: User.collection.name,
  //     localField: "users",
  //     foreignField: "_id",
  //     as: "users",
  //   }},
  //   {$unwind:"$users"},
  //   {$group:{_id:"$_id", usernames: {$addToSet: "$users.name"}}},

  //   // {$group:{_id:"$user.name"}},
  // ])
  // // console.log(league)
  // console.log(aggregate)
  // const { getLeagueParticipants } = require("../controllers/leagueController")
  // let result = await getLeagueParticipants("62f04b379fdc4736c888267a")
  // console.table(result)
  // console.log(await User.find({_id: { $in : result[0].users}}))
  // console.log(await getLeagueParticipants(req, res))
  next()
}


exports.searchUser = async function (req, res){
  let { id } = req
  let b = await Boulder.find({redpoints: mongoose.Types.ObjectId(id)}).exec()
  b = b.map(a => {
    return a.difficultyName + " " + a.number
  })
  res.send(b)
}

exports.test = async function (req, res){
  // var problems = (await parse_problems(fetch_problems(req, res), req.user)).sort(sortBoulders)
  // console.log(problems)
  // res.render("test", {problems})
  // consoleLogger("PRUEBA 1")
  sendMail("veronica.celdran91@gmail.com", "Hola guapa", "Te quiero mucho")
  res.send("ok")
}

exports.date = async function (req, res){
  // dateAdjust()
  // var b = await Boulder.findOne({difficultyName: "Pink", number: 1}).exec()
  var date = new Date(2022,9,1)
  var boulders = await Boulder.find({date: {$gte: date}})
  console.log(boulders)
  console.table(boulders.map(b => {
    return {...b.toObject()}
  }))
  // console.log(b)
  // console.log(convertTicksToDate(b.dateValue))
  // b.date = convertTicksToDate(b.dateValue)
  // await b.save()
  // res.send(formatDate(b.date))
  res.send("ok")
}

exports.mail = async function (req, res){
  // const pug = require("pug")
  // const user = await User.findOne({email:"veronica.celdran91@gmail.com"}).exec()
  // const html = pug.renderFile(__dirname + "/../views_pug/email/header.pug", {user, body: 'welcome'})
  // sendMail(user.email, "Bienvenido a Mandala Climb", html)
  // const user = await User.findOne({email:"eric.jl1994@gmail.com"}).exec()
  // res.send(html)
  // const html = await welcomeMail(await User.findOne({email:"eric.jl1994@gmail.com"}))
  const html = await recoveryMail(await User.findOne({email:"eric.jl1994@gmail.com"}), "abc123")
  res.send(html)
}

async function dateAdjust(){
  var mapped = [];
  const boulders = await Boulder.find().exec()
  mapped = boulders.map(b => { 
    // console.log(b)
    b.date = convertTicksToDate(b.dateValue)
    b.save()
    return Object.assign({}, {...b.toObject()})
    // return {_id: b._id, date: convertTicksToDate(b.dateValue), format: formatDate(convertTicksToDate(b.dateValue))}
  })
  mapped.sort((a, b) => a.date-b.date)
  // console.table(mapped)
  // console.table(mapped, ["_id", "format"])
}