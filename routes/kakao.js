var express = require("express");
var router = express.Router();
let db; // db 객체를 받기 위한 변수 선언

router.setDb = (database) => {
  db = database; // db 객체를 저장
};

router.post("/", function (req, res, next) {
  let method = req.get("method");
  if (method == "user") {
  } else if (method == "check") {
  } else if (method == "log") {
  }
  console.log(req.body);
  res
    .json({
      version: "2.0",
      template: { outputs: [{ simpleText: { text: "hello" } }] },
    })
    .status(200);
});

module.exports = router;
