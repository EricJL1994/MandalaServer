const { colours } = require("./constants");

function logger(type, str) {
  var time = getTimestamp();
  // process.stdout.write(time + ' ');

  switch (type) {
    case 'SUCCESS':
      console.log(time + ' ' + colours.fg.TP_ANSI_FG_GREEN + str + colours.TP_ANSI_RESET);
      break;

    case 'ERROR':
      console.log(time + ' ' + colours.fg.TP_ANSI_FG_RED + str + colours.TP_ANSI_RESET);
      break;

    default:
      console.log(time + ' ' + colours.fg.TP_ANSI_FG_WHITE + str + colours.TP_ANSI_RESET);
      break;
  }
}

function getTimestamp() {
  return '[' + colours.fg.TP_ANSI_FG_YELLOW + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + colours.TP_ANSI_RESET + ']:';
}


function isEmpty(str) {
  return (!str || str.length === 0 );
}

function isBlank(str) {
  return (!str || /^\s*$/.test(str));
}

const objectKeyValueFlip = (obj) => {
  return Object.entries(obj).reduce((ret, entry) => {
    const [ key, value ] = entry
    ret[value] = key
    return ret
  }, {})
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

function convertDateToTicks(date){
  var ticksPerMilisecond = 10000

  var epochMicrotimeDiff = Math.abs(new Date(0, 0, 1).setFullYear(1));

  return (epochMicrotimeDiff + date.getTime()) * ticksPerMilisecond
}

function formatDate(date) {
  return `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`
}

module.exports = { isEmpty, isBlank, logger, convertTicksToDate, convertDateToTicks, formatDate, objectKeyValueFlip }