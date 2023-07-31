const express = require("express");
const router = express.Router();
const Boulder = require("../../models/boulder");
const { parse_boulders, fetch_boulders } = require("../controllers/problemController");
const { sortBoulders } = require("../commonFunctions");

router.get("/boulders", async (req, res) =>{
  // let b = (await parse_boulders(fetch_boulders(req, res), req.user)).sort(sortBoulders)
  // console.log(b)
  res.send((await parse_boulders(fetch_boulders(req, res), req.user)).sort(sortBoulders))
})

// router.get("/auth", async (req, res) => {
//   console.log(req.headers.auth)
//   res.send("ok")
// })

module.exports = router;