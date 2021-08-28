const { colours } = require("./constants");
const BookDate = require("../models/bookDate");
const { Mongoose } = require("mongoose");

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

  // console.log(weeks)
  // console.log(firstDate)
  // console.log(lastDate)
  // console.log(numDays)
  let dayOfWeekCounter = (firstDate.getDay() + 6) % 7;

  const capacity = process.env.CAPACITY;
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
        var book = await BookDate.findOne({
          year: year,
          month: month,
          day: date,
        });

        if (!book) {
          book =
            await (dayOfWeekCounter == 4
              ? BookDate.create({
                  year: year,
                  month: month,
                  day: date,
                  bookOpen: [true, true, false],
                })
              : BookDate.create({ year: year, month: month, day: date }));
        }
        if (dayOfWeekCounter == 4) {
          // console.log(book.noNight);

          // await BookDate.updateOne({ year: year, month: month, day: date }, book)
          // console.log(await BookDate.findOne({
          //   year: year,
          //   month: month,
          //   day: date,
          // }).bookNight)
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
};
