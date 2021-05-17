
var express = require('express');
var router = express.Router();
var problemController = require('../controllers/problemController')

router.get('/details', problemController.problem_detail);

router.post('/xxx', problemController.problem_get);

router.post('/xxx', problemController.problem_add);

router.post('/xxx', problemController.problem_update);

router.post('/xxx', problemController.problem_delete);

module.exports = router;