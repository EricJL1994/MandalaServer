const { colours, dayName, trainingNames } = require("./constants");
const BookDate = require("../models/bookDate");
const Log = require("../models/log");
const User = require("../models/user");
const { Mongoose } = require("mongoose");

const {Telegraf} = require("telegraf");
const telegramBot = new Telegraf(process.env.TELEGRAM_TOKEN);

telegramBot.command('reservas', async ctx => {
  // const user = await User.findOne({telegram: ctx.chat.id}) IMPLEMENTAR EL ID DE TELEGRAM EN EL USUARIO
  // if(user && user.admin){
  if(ctx.chat.id == process.env.TELEGRAM_DEV){
    const date = new Date()
    const book = await BookDate.findOne({day: date.getDate(), month: date.getMonth(), year: date.getFullYear()})
    .populate({ path: "bookMorning", populate: { path: "user" } })
    .populate({ path: "bookEvening", populate: { path: "user" } })
    .populate({ path: "bookNight", populate: { path: "user" } });
    // console.log(book)
    ctx.replyWithMarkdownV2(`*Reservas para el día ${book.day}/${book.month + 1}/${book.year}*`)
    if(book.bookMorning.length) await ctx.replyWithMarkdownV2(`__*Mañana* (${process.env.CAPACITY - book.bookMorning.length} huecos)__\n${formatBookArray(book.bookMorning)}`)
    if(book.bookEvening.length) await ctx.replyWithMarkdownV2(`__*Tarde* (${process.env.CAPACITY - book.bookEvening.length} huecos)__\n${formatBookArray(book.bookEvening)}`)
    if(book.bookNight.length) await ctx.replyWithMarkdownV2(`__*Noche* (${process.env.CAPACITY - book.bookNight.length} huecos)__\n${formatBookArray(book.bookNight)}`)
  }else{
    ctx.reply("Necesitas ser un administrador para usar este comando")
  }
})

telegramBot.start(ctx => ctx.replyWithMarkdownV2(`Visita nuestra web: [🌐](http://www.mandalaclimb.herokuapp.com/users/login)`))
telegramBot.launch()

function formatBookArray(bookArray){
  var result = ""
  for (const book of bookArray) {
    result += book.user.name
    result += "\n"
    result += trainingNames[book.trainingType]
    result += "\n"
    // result += 
    result += "\n"
    // result +=
  }
  return result
}

function webLogger(telegram, mongo, message){
  if(telegram) telegramBot.telegram.sendMessage(process.env.TELEGRAM_GROUP, message, {parse_mode: "MarkdownV2"})
  if (!!mongo) Log.create({user: mongo, request: message})
}

function logger(type, str) {
  var time = getTimestamp();
  // process.stdout.write(time + ' ');

  switch (type) {
    case "SUCCESS":
      console.log(
        time + " " + colours.fg.TP_ANSI_FG_GREEN + str + colours.TP_ANSI_RESET
      );
      break;

    case "ERROR":
      console.log(
        time + " " + colours.fg.TP_ANSI_FG_RED + str + colours.TP_ANSI_RESET
      );
      break;

    default:
      console.log(
        time + " " + colours.fg.TP_ANSI_FG_WHITE + str + colours.TP_ANSI_RESET
      );
      break;
  }
}

function getTimestamp() {
  return (
    "[" +
    colours.fg.TP_ANSI_FG_YELLOW +
    new Date().toISOString().replace(/T/, " ").replace(/\..+/, "") +
    colours.TP_ANSI_RESET +
    "]:"
  );
}

function isEmpty(str) {
  return !str || str.length === 0;
}

function isBlank(str) {
  return !str || /^\s*$/.test(str);
}

const objectKeyValueFlip = (obj) => {
  return Object.entries(obj).reduce((ret, entry) => {
    const [key, value] = entry;
    ret[value] = key;
    return ret;
  }, {});
};

async function getWeeksInMonth(year, month) {
  const weeks = [],
    firstDate = new Date(year, month, 1),
    lastDate = new Date(year, month + 1, 0),
    numDays = lastDate.getDate();

  let dayOfWeekCounter = (firstDate.getDay() + 6) % 7;

  const capacity = process.env.CAPACITY;

  var books = await BookDate.find({year: year, month: month})
  if(books.length == 0) return false;
  //OPTIMIZAR PARA UNA SOLA PETICIÓN
  for (let date = 1; date <= numDays; date++) {
    if (dayOfWeekCounter === 0 || weeks.length === 0) {
      weeks.push([]);
    }
    switch (dayOfWeekCounter) {
      //FIN DE SEMANA
      case 5:
      case 6:
        var book = { day: date, weekend: true };
        break;

      //ENTRE SEMANA
      default:
        var book;
        for (const b of books) {
          if(b.day == date){
            book = b;
            break;
          }
        }

        if (dayOfWeekCounter == 4) {
          book.friday = true;
          book.full =
            book.bookMorning.length >= capacity &&
            book.bookEvening.length >= capacity;
        } else {
          book.full =
            book.bookMorning.length >= capacity &&
            book.bookEvening.length >= capacity &&
            book.bookNight.length >= capacity;
        }
        book.bookingArray = []
        book.bookingArray.push(book.bookOpen[0] ? book.bookMorning.length : undefined)
        book.bookingArray.push(book.bookOpen[1] ? book.bookEvening.length : undefined)
        book.bookingArray.push(book.bookOpen[2] ? book.bookNight.length : undefined)
        break;
    }
    // book.dayName = dayName[dayOfWeekCounter]
    weeks[weeks.length - 1].push(book);
    dayOfWeekCounter = (dayOfWeekCounter + 1) % 7;
  }

  return weeks
    .filter((w) => !!w.length)
    .map((w) => ({
      // start: w[0],
      // end: w[w.length - 1],
      dates: w,
    }));
}

/*
  if (!!str) {
    // Some code here
  }

  if (Boolean(str)) {
    // Code here
  }

 * Both do the same function. Typecast the variable to Boolean, where str is a variable.
 * It returns false for null, undefined, 0, 000, "", false.
 * It returns true for string "0" and whitespace " ".
*/

function convertTicksToDate(ticks) {
  //ticks are in nanotime; convert to microtime
  var ticksToMicrotime = ticks / 10000;

  //ticks are recorded from 1/1/1; get microtime difference from 1/1/1/ to 1/1/1970
  var epochMicrotimeDiff = Math.abs(new Date(0, 0, 1).setFullYear(1));

  //new date is ticks, converted to microtime, minus difference from epoch microtime
  return new Date(ticksToMicrotime - epochMicrotimeDiff);
}

function convertDateToTicks(date) {
  var ticksPerMilisecond = 10000;

  var epochMicrotimeDiff = Math.abs(new Date(0, 0, 1).setFullYear(1));

  return (epochMicrotimeDiff + date.getTime()) * ticksPerMilisecond;
}

function formatDate(date) {
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

module.exports = {
  isEmpty,
  isBlank,
  logger,
  convertTicksToDate,
  convertDateToTicks,
  formatDate,
  objectKeyValueFlip,
  getWeeksInMonth,
  webLogger,
};
