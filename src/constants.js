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

const problemTypesToJSONDatabase = {
  Boulder: 'boulders',
  Traverse: 'traverses'
}

const difficultyColor = {
  Pink: '#FF96FF',
  Green_ORIGINAL: '#87FF4E',
  Green: '#86d562',
  Orange: '#FFA84E',
  Yellow: '#FFE14E',
  Red: '#FF524E'
}

const walls = {
  0: 'Placa',
  1: 'Slab',
  2: 'Esquina',
  3: 'Tablón',
  4: 'Puerta',
  5: 'Desplome',
  6: 'Escondido',
}

const holdColorsFormatter = {
  Amarillo: 'Ama',
  AmarilloFluor: 'Ama Fl',
  Azul: 'Az',
  Blanco: 'Bl',
  Granate: 'Gran',
  Gris: 'Gris',
  Naranja: 'Nar',
  NaranjaFluor: 'Nar Fl',
  Negro: 'Neg',
  Rojo: 'Rojo',
  Rosa: 'Rosa',
  RosaFluor: 'Rosa Fl',
  Verde: 'Ver',
  VerdeFluor: 'Ver Fl',
  Voileta: 'Vio',
  Zafiro: 'Zaf',
}

module.exports = { colours, problemTypesToJSONDatabase, difficultyColor, walls, holdColorsFormatter }