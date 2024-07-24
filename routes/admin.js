var express = require("express");
var router = express.Router();

const fs = require("fs");
const ejs = require("ejs");
const path = require("path");

const bodyParser = require("body-parser");
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

let db; // db 객체를 받기 위한 변수 선언

router.setDb = (database) => {
  db = database; // db 객체를 저장
};

//manager에서 리스트 표시
router.post("/", function (req, res, next) {
  let ref = db.ref("/manager/");
  const man_dummy_data = [];
  ref.once("value", (snapshot) => {
    const data = snapshot.val();
    const dataList = Object.keys(data).map((key) => ({
      key,
      value: data[key],
    }));
    dataList.forEach((child_data) => {
      if (child_data["key"] != "std_list" && child_data["key"] != "master") {
        temp = {};
        temp["name"] = child_data["key"];
        temp["password"] = child_data["value"];
        man_dummy_data.push(temp);
      }
    });
    let man_template = "";
    fs.readFile(
      path.join(__dirname, "../views/man_card.ejs"),
      "utf8",
      (err, btnTemplateData) => {
        if (err) {
          console.error("Error reading school_btn file:", err);
          return;
        }
        man_dummy_data.forEach((man_data) => {
          const renderedTemplate = ejs.render(btnTemplateData, {
            name: man_data.name,
            password: man_data.password,
          });
          man_template += renderedTemplate;
        });
        res.render("manager_layout", { manager_ara: man_template });
      }
    );
  });
});

router.post("/del", function (req, res, next) {
  const ref = db.ref(`/manager/${req.body.name}`);
  ref
    .remove()
    .then(() => {
      res.status(200).json("Good");
    })
    .catch((error) => {
      res.status(200).json("");
    });
});

router.post("/edit", function (req, res, next) {
  const ref = db.ref(`/manager`);
  const updates = {};
  updates[req.body.name] = req.body.password;
  ref
    .update(updates)
    .then(() => {
      res.status(200).json("Good");
    })
    .catch((error) => {
      res.status(200).json("");
    });
});

router.post("/add", function (req, res, next) {
  const ref = db.ref(`/manager`);
  const updates = {};
  updates[req.body.name] = req.body.password;
  ref
    .update(updates)
    .then(() => {
      res.status(200).json("Good");
    })
    .catch((error) => {
      res.status(200).json("");
    });
});

module.exports = router;
