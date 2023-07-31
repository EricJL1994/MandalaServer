const BookDate = require("../models/bookDate");

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

function convertTicksToDate(ticks) {
  //ticks are in nanotime; convert to microtime
  var ticksToMicrotime = ticks / 10000;

  //ticks are recorded from 1/1/1; get microtime difference from 1/1/1/ to 1/1/1970

  //SOLUCION 1 => CALCULAR EL EPOC CON TIMEZONE
  // var epochDate = new Date(0, 0, 1)
  // epochDate.setFullYear(1)
  // epochDate.setUTCHours(12, 0, 0)
  // return (new Date(ticksToMicrotime - epochDate))

  // SOLUCION 2 => CALCULAR LA FECHA Y AJUSTAR LA HORA
  var epochMicrotimeDiff = Math.abs(new Date(0, 0, 1).setFullYear(1));
  var date = new Date(ticksToMicrotime - epochMicrotimeDiff)
  date.setUTCHours(0, 0, 0)
  return date

  //new date is ticks, converted to microtime, minus difference from epoch microtime
  return new Date(ticksToMicrotime - epochMicrotimeDiff);
}

function convertDateToTicks(date) {
  var ticksPerMilisecond = 10000;

  var epochMicrotimeDiff = Math.abs(new Date(0, 0, 1).setFullYear(1));

  return (epochMicrotimeDiff + date.getTime()) * ticksPerMilisecond;
}

function formatDate(date, reversed = false) {
  if (!reversed) return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
  var month = date.getMonth() + 1
  if (month < 10) month = "0" + month
  var day = date.getDate()
  if (day < 10) day = "0" + day
  return `${date.getFullYear()}-${month}-${day}`
}

function compareBoulders(a, b) {
  if(sortingColors[a.difficultyName] > sortingColors[b.difficultyName]) return 1
  if(sortingColors[a.difficultyName] < sortingColors[b.difficultyName]) return -1
  return a.number - b.number
}

const sortingColors = {
  Pink: 0,
  Green: 1,
  Orange: 2,
  Yellow: 3,
  Red: 4
}

module.exports = {
  getWeeksInMonth,
  convertTicksToDate,
  convertDateToTicks,
  formatDate,
  sortBoulders: compareBoulders,
  sortingColors,
};
