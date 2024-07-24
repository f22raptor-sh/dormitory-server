var express = require("express");
var router = express.Router();
var path = require("path");
// const cors = require('cors');
// app.use(cors());
const publicDir = path.join(__dirname, "..", "public");
/* GET home page. */
router.post("/", function (req, res, next) {
  if (req.headers["user-agent"].includes("Mobile")) {
    res.sendFile(path.join(publicDir, "Mindex.html")); // 'index.html' 파일을 클라이언트로 전송
  } else {
    res.sendFile(path.join(publicDir, "Pindex.html")); // 'index.html' 파일을 클라이언트로 전송
  }
});

router.get("/", function (req, res, next) {
  if (req.headers["user-agent"].includes("Mobile")) {
    res.sendFile(path.join(publicDir, "Mindex.html")); // 'index.html' 파일을 클라이언트로 전송
  } else {
    res.sendFile(path.join(publicDir, "Pindex.html")); // 'index.html' 파일을 클라이언트로 전송
  }
});

module.exports = router;
