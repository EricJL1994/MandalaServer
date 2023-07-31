const problemTypesToJSONDatabase = {
  Boulder: 'boulders',
  Traverse: 'traverses'
}

const difficultyColor = {
  Pink: '#FF96FF',
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
  Violeta: 'Vio',
  Zafiro: 'Zaf',
}

const monthName = {
  0: 'Enero',
  1: 'Febrero',
  2: 'Marzo',
  3: 'Abril',
  4: 'Mayo',
  5: 'Junio',
  6: 'Julio',
  7: 'Agosto',
  8: 'Septiembre',
  9: 'Octubre',
  10: 'Noviembre',
  11: 'Diciembre',
}

const dayName = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
}

const trainingNames = {
  month: 'Mes',
  training: 'Mes y entreno',
  voucher: 'Bono',
  trainingVoucher: 'Bono y entreno'
}

module.exports = { problemTypesToJSONDatabase, difficultyColor, walls, holdColorsFormatter, monthName, dayName, trainingNames }