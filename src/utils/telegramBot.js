const {Telegraf} = require("telegraf");
const Boulder = require("../../models/boulder");
const telegramBot = new Telegraf(process.env.TELEGRAM_TOKEN);
const { consoleLogger } = require("./logger")

//LAUNCH TELEGRAM BOT
if(!Number.parseInt(process.env.CODING)){
  consoleLogger("Launching Telegram bot", "SUCCESS")
  telegramBot.launch()
}else{
  consoleLogger("Telegram bot disabled", "WARNING")
}

telegramBot.start(ctx => {
  var inline_keyboard = [[{text:'Bloques', callback_data: 'boulders'}]]
  ctx.replyWithMarkdownV2(`Visita nuestra web: [🌐](http://www.mandalaclimb.herokuapp.com/users/login)`, {reply_markup:{inline_keyboard}})
})

telegramBot.action('boulders', async ctx => {
  if(ctx.chat.id == process.env.TELEGRAM_DEV){
    var inline_keyboard = []
    let result = await Boulder.collection.distinct("difficultyName")
    result.map(difficulty => {
      inline_keyboard.push([{text: difficulty, callback_data: `colorBoulders${difficulty}`}])
    })
    // return ctx.replyWithMarkdownV2(`Elige una dificultad`, {reply_markup:{inline_keyboard}})
    // console.log(inline_keyboard)
    await ctx.editMessageText(`Elige una dificultad`)
    await ctx.editMessageReplyMarkup({inline_keyboard})
    await ctx.answerCbQuery()
  }else{
    return ctx.answerCbQuery("Permiso denegado", {show_alert: true})
  }
})

telegramBot.action(/colorBoulders(.+)/, async ctx => {
  if(ctx.chat.id == process.env.TELEGRAM_DEV){
    var inline_keyboard = []
    let result = await Boulder.find({difficultyName: ctx.match[1]}).distinct("number")
    let i = 0
    for (; i < result.length; i+=2) {
      inline_keyboard.push(
        i + 1 < result.length ?
        [{text: result[i], callback_data: `selectBoulder${ctx.match[1]}-${result[i]}`},{text: result[i+1], callback_data: `selectBoulder${ctx.match[1]}-${result[i+1]}`}] :
        [{text: result[i], callback_data: `selectBoulder${ctx.match[1]}-${result[i]}`}]
        )
    }
    inline_keyboard.push([{text: "Nuevo", callback_data: `newBoulder${ctx.match[1]}-${result.length + 1}`}])
    // result.map(number => {
    //   inline_keyboard.push([{text: number, callback_data: `selectBoulder${ctx.match[1]}-${number}`}])
    // })
    await ctx.editMessageText(`Elige un bloque ${ctx.match[1]}`)
    await ctx.editMessageReplyMarkup({inline_keyboard})
    await ctx.answerCbQuery()
  }else{
    return ctx.answerCbQuery("Permiso denegado", {show_alert: true})
  }
})

telegramBot.action(/selectBoulder(.+)-(.+)/, async ctx => {
  ctx.editMessageText(await Boulder.find({difficultyName: ctx.match[1], number: ctx.match[2]}))
  var inline_keyboard = []
  let result = await Boulder.find({difficultyName: ctx.match[1]}).distinct("number")
  result.map(boulder => {
    // inline_keyboard.push([{text: boulder, callback_data: `editBoulder${ctx.match[1]}-${ctx.match[2]}`}])
    inline_keyboard.push([{text: boulder, callback_data: `selectBoulder${ctx.match[1]}-${ctx.match[2]}`}])
  })
  ctx.editMessageReplyMarkup({inline_keyboard})
  ctx.answerCbQuery()
})

telegramBot.action(/newBoulder(.+)-(.+)/, async ctx => {
  let date = new Date()
  let boulder = await Boulder.create({
    difficultyName: ctx.match[1],
    number: ctx.match[2],
    // dateValue: convertDateToTicks(new Date()),
    date: date,
    holdColor: "Azul",
    pending: true,
    wall: 0,
  })
  console.log(boulder)
  ctx.answerCbQuery("Bloque creado", {show_alert: true})
})

// telegramBot.command('reservas', async ctx => {
//   // const user = await User.findOne({telegram: ctx.chat.id}) IMPLEMENTAR EL ID DE TELEGRAM EN EL USUARIO
//   // if(user && user.admin){
//   if(ctx.chat.id == process.env.TELEGRAM_DEV){
//     const date = new Date()
//     const book = await BookDate.findOne({day: date.getDate(), month: date.getMonth(), year: date.getFullYear()})
//     .populate({ path: "bookMorning", populate: { path: "user" } })
//     .populate({ path: "bookEvening", populate: { path: "user" } })
//     .populate({ path: "bookNight", populate: { path: "user" } });
//     // console.log(book)
//     ctx.replyWithMarkdownV2(`*Reservas para el día ${book.day}/${book.month + 1}/${book.year}*`)
//     if(book.bookMorning.length) await ctx.replyWithMarkdownV2(`__*Mañana* (${process.env.CAPACITY - book.bookMorning.length} huecos)__\n${formatBookArray(book.bookMorning)}`)
//     if(book.bookEvening.length) await ctx.replyWithMarkdownV2(`__*Tarde* (${process.env.CAPACITY - book.bookEvening.length} huecos)__\n${formatBookArray(book.bookEvening)}`)
//     if(book.bookNight.length) await ctx.replyWithMarkdownV2(`__*Noche* (${process.env.CAPACITY - book.bookNight.length} huecos)__\n${formatBookArray(book.bookNight)}`)
//   }else{
//     ctx.reply("Necesitas ser un administrador para usar este comando")
//   }
// })


// telegramBot.command('test', async ctx => {
//   for (let i = 0; i < 10 ; i += 2) {
//     console.log(i)
//   }
//   ctx.replyWithMarkdownV2("Hola", {reply_markup: {inline_keyboard: [[{text:'a', callback_data: 'a'},{text:'b', callback_data: 'a'}],[{text:'c', callback_data: 'a'},{text:'d', callback_data: 'a'}]]}})
// })

// function formatBookArray(bookArray){
//   var result = ""
//   for (const book of bookArray) {
//     result += book.user.name
//     result += "\n"
//     result += trainingNames[book.trainingType]
//     result += "\n"
//     // result += 
//     result += "\n"
//     // result +=
//   }
//   return result
// }

exports.sendMessage = function(chat, message){
  if(!Number.parseInt(process.env.CODING)) telegramBot.telegram.sendMessage(chat, message, {parse_mode: "MarkdownV2"})
}