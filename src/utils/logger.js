const Log = require("../../models/log");

exports.consoleLogger = function(str, state) {
  const stateDic = {
    SUCCESS: "TP_ANSI_FG_GREEN",
    WARNING: "TP_ANSI_FG_YELLOW",
    ERROR: "TP_ANSI_FG_RED",
  }
  
  const time = getTimestamp();
  console.log(time + " " +
    (colours.fg[stateDic[state]] || (colours.fg[`TP_ANSI_FG_${state}`] || colours.fg.TP_ANSI_FG_WHITE)) +
    str +
    colours.TP_ANSI_RESET);
}

exports.logger = function(message, mongoDBUser, telegramChat = process.env.TELEGRAM_DEV){
  // if(telegram) telegramBot.telegram.sendMessage(process.env.TELEGRAM_GROUP, message, {parse_mode: "MarkdownV2"})
  if (!!mongoDBUser) Log.create({user: mongoDBUser, request: message, environment: process.env.DEPLOY})
  if(!!telegramChat) {
    const { sendMessage } = require("./telegramBot")
    sendMessage(message, telegramChat)
  }
}

function getTimestamp() {
  return (
    "[" +
    // colours.fg.TP_ANSI_FG_YELLOW +
    new Date().toISOString().replace(/T/, " ").replace(/\..+/, "") +
    // colours.TP_ANSI_RESET +
    "]:"
  );
}

const colours = {
  TP_ANSI_RESET: "\x1b[0m",
  TP_ANSI_BOLD_ON: "\x1b[1m",
  Dim: "\x1b[2m",
  Underscore: "\x1b[4m",
  Blink: "\x1b[5m",
  TP_ANSI_INVERSE_ON: "\x1b[7m",
  Hidden: "\x1b[8m",
  TP_ANSI_BOLD_OFF: "\x1b[22m",

  fg: {
    TP_ANSI_FG_BLACK: "\x1b[30m",
    TP_ANSI_FG_RED: "\x1b[31m",
    TP_ANSI_FG_GREEN: "\x1b[32m",
    TP_ANSI_FG_YELLOW: "\x1b[33m",
    TP_ANSI_FG_BLUE: "\x1b[34m",
    TP_ANSI_FG_MAGENTA: "\x1b[35m",
    TP_ANSI_FG_CYAN: "\x1b[36m",
    TP_ANSI_FG_WHITE: "\x1b[37m",
  },

  bg: {
    TP_ANSI_BG_BLACK: "\x1b[40m",
    TP_ANSI_BG_RED: "\x1b[41m",
    TP_ANSI_BG_GREEN: "\x1b[42m",
    TP_ANSI_BG_YELLOW: "\x1b[43m",
    TP_ANSI_BG_BLUE: "\x1b[44m",
    TP_ANSI_BG_MAGENTA: "\x1b[45m",
    TP_ANSI_BG_CYAN: "\x1b[46m",
    TP_ANSI_BG_WHITE: "\x1b[47m",
  }
}