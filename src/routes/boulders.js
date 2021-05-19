
var express = require('express');
var router = express.Router();
var problemController = require('../controllers/problemController')

// TODO: ESTO ES POSIBLE? meter el app para hacer cosas con él.....
// o hago un render a pelo sin el view engine y listo en verdad, porque el app ya lo está pillando arriba en la ruta buena
/*
const app = express()
app.set('view engine', 'pug')
app.set('views', __dirname + '/views_pug')
*/

router.get('/details', problemController.problem_detail);

router.post('/xxx', problemController.problem_get);

router.post('/xxx', problemController.problem_add);

router.post('/xxx', problemController.problem_update);

router.post('/xxx', problemController.problem_delete);

module.exports = router;