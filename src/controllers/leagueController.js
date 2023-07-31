const Mongoose = require('mongoose')
const Boulder = require('../../models/boulder')
const Traverse = require('../../models/traverse')
const League = require('../../models/league')
const LeagueBoulder = require('../../models/leagueBoulder')
const User = require('../../models/user')
const { aggregate } = require('../../models/boulder')

exports.getLeague = async function(req, res){
}

exports.createLeague = async function(){
  await League.create({date: new Date()})
  let leagues = await League.find().sort({date: "desc"})
  let boulders = await Boulder.find({dateValue: {$gte: convertDateToTicks(leagues[1].date)}, pending: false})
  // console.log([leagues[0].boulders.length, boulders.length])
  // console.log(boulders)
  let currentLeague = await League.findOne({_id: leagues[0]._id})
  console.log(currentLeague)
  /*if(!currentLeague.boulders.length){
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
  }*/
}

exports.getClosestLeague = async function(){
  const today = new Date()
  let aggregate = League.aggregate([
    { $match: {
      // date: {$gte: new Date(today.getFullYear(), today.getMonth(), today.getDate())},
      ready: true
    }},
    { $project: {
      date: true,
      boulders: true,
      ready: true,
      time_dist: {$abs: [{$subtract: ["$date", new Date()]}]}
    }},
    { $sort: {time_dist: 1}},
    { $limit: 1},
    { $lookup: {
      from: LeagueBoulder.collection.name,
      localField: 'boulders',
      foreignField: '_id',
      as: 'boulders'}},
  ])
  return aggregate
}

exports.confirmLeague = async function(id){
  let league = await League.findById(id)
  // console.log("League", league)
  let boulders = await Boulder.find({league: id})
  let promises = boulders.map(async b => {
    // console.log("Forming:", b.difficultyName + b.number)
    await LeagueBoulder.formLeagueBoulder(b, lb => {
      // console.log("Pushing", b.difficultyName + b.number)
      league.boulders.push(lb._id)
    })
  })
  league.ready = true
  await Promise.all(promises)
  // console.log("Post", league)
  await league.save()
}

exports.getLeagueParticipants = async function(id){
  //TODO: Fix aggregate
  // let aggregate = await League.aggregate([
    // {$match:{_id:Mongoose.Types.ObjectId(id)}},
    // {$unwind:"$boulders"},
    // {$lookup: {
    //   from: Boulder.collection.name,
    //   localField: "boulders",
    //   foreignField: "_id",
    //   as: "boulders",
    // }},
    // {$unwind:"$boulders"},
    // {$unwind:"$boulders.redpoints"},
    // {$group:{_id:"$_id", users: {$addToSet: "$boulders.redpoints"}}},


    // {$lookup: {
    //   from: User.collection.name,
    //   localField: "users",
    //   foreignField: "_id",
    //   as: "users",
    // }},
    // {$unwind:"$users"},
    // {$group:{_id:"$_id", usernames: {$addToSet: "$users.name"}}},
  // ])

  // console.log("=====================LEAGUE=====================")
  // console.log(aggregate)
  return [{users: []}]
  return aggregate
}