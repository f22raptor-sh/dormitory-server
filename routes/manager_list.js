var express = require("express");
var router = express.Router();

const fs = require("fs");
const ejs = require("ejs");
const path = require("path");

let db; // db 객체를 받기 위한 변수 선언

router.setDb = (database) => {
  db = database; // db 객체를 저장
};

//list 접근시 학생 리스트 표시
router.post("/", function (req, res, next) {
  let ref = db.ref("/");
  const std_dummy_data = [];
  const class_dummy_data = [];
  ref.once("value", (snapshot) => {
    const data = snapshot.val();
    let data_keys = Object.keys(data);
    const unique_keys = Array.from(
      new Set(data_keys.map((item) => item.substring(0, 3)))
    );
    const room_keys = Array.from(
      new Set(data_keys.map((item) => `${item[0]}-${item.substring(2, 3)}`))
    );
    for (let i = 0; i < unique_keys.length; i++) {
      if (room_keys[i] != "학-" && room_keys[i] != "m-n") {
        const temp = {};
        temp["room_name"] = room_keys[i];
        temp["room_num"] = unique_keys[i];
        class_dummy_data.push(Object.assign({}, temp));
      }
      if (room_keys[i] == "m-n") {
        const temp = {};
        temp["room_name"] = "퇴사";
        temp["room_num"] = "out";
        class_dummy_data.push(Object.assign({}, temp));
      }
    }

    snapshot.forEach((child_snapshot) => {
      if (child_snapshot.key !== "manager") {
        child_data = child_snapshot.val();
        let child_std_num = String(child_data["number"]);

        const currentPlus = snapshot.val()[child_std_num]["plus_point"];
        const currentMinus = snapshot.val()[child_std_num]["minus_point"];

        const currentEPlus = snapshot.val()[child_std_num]["extra_plus_point"];
        const currentEMinus =
          snapshot.val()[child_std_num]["extra_minus_point"];

        const temp = {};
        temp["name"] = child_data["name"];
        temp["number"] = child_std_num;
        temp["point"] =
          currentPlus - currentMinus + currentEPlus - currentEMinus;
        temp["currentPlus"] = currentPlus;
        temp["currentMinus"] = currentMinus;
        temp["currentEPlus"] = currentEPlus;
        temp["currentEMinus"] = currentEMinus;
        temp["class_num"] = child_std_num.substring(0, 3);
        if (child_data["state"] == "1") {
          temp["state"] = "퇴사 상태";
          temp["class_name"] = "state_out";
          temp["display1"] = true;
          temp["display2"] = false;
          temp["display3"] = true;
        } else if (child_data["state"] == "2") {
          temp["state"] = "퇴사 주의";
          temp["class_name"] = "state_alt";
          temp["display1"] = false;
          temp["display2"] = true;
          temp["display3"] = false;
        } else if (child_data["state"] == "3") {
          temp["state"] = "퇴사 예정";
          temp["class_name"] = "state_target";
          temp["display1"] = true;
          temp["display2"] = true;
          temp["display3"] = false;
        } else {
          temp["state"] = "";
          temp["class_name"] = "state_nan";
          temp["display1"] = false;
          temp["display2"] = true;
          temp["display3"] = false;
        }
        std_dummy_data.push(temp);
      }
    });
    let btnTemplates = "";
    let stdTemplates = "";
    fs.readFile(
      path.join(__dirname, "../views/school_btn.ejs"),
      "utf8",
      (err, btnTemplateData) => {
        if (err) {
          console.error("Error reading school_btn file:", err);
          return;
        }
        class_dummy_data.forEach((class_data) => {
          const renderedTemplate = ejs.render(btnTemplateData, {
            room_num: class_data["room_num"],
            room_name: class_data["room_name"],
          });
          btnTemplates += renderedTemplate;
        });
        fs.readFile(
          path.join(__dirname, "../views/std_card.ejs"),
          "utf8",
          (err, stdTemplateData) => {
            if (err) {
              console.error("Error reading std_card file:", err);
              return;
            }
            std_dummy_data.forEach((std_data) => {
              const renderedTemplate = ejs.render(stdTemplateData, {
                name: std_data.name,
                number: std_data.number,
                state: std_data.state,
                point: Math.round(std_data.point * 10) / 10,
                class_num: std_data.class_num,
                class_state: std_data.class_name,
                display1: std_data.display1,
                display2: std_data.display2,
                display3: std_data.display3,
                plus: Math.round(std_data.currentPlus * 10) / 10,
                minus: Math.round(std_data.currentMinus * 10) / 10,
                Eplus: Math.round(std_data.currentEPlus * 10) / 10,
                Eminus: Math.round(std_data.currentEMinus * 10) / 10,
                Splus:
                  Math.round(
                    (std_data.currentEPlus + std_data.currentPlus) * 10
                  ) / 10,
                Sminus:
                  Math.round(
                    (std_data.currentEMinus + std_data.currentMinus) * 10
                  ) / 10,
              });
              stdTemplates += renderedTemplate;
            });
            res.render("list_layout", {
              btn_ara: btnTemplates,
              std_ara: stdTemplates,
            });
          }
        );
      }
    );
  });
});

//list에서 상벌점 입력
router.post("/change", function (req, res, next) {
  const std_method = req.body.action;
  const std_num = req.body.std_number;
  const ref = db.ref("/" + `${std_num}/`);
  let updates = {};
  ref
    .once("value")
    .then((snapshot) => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const date = String(today.getDate()).padStart(2, "0");
      const hours = String(today.getHours()).padStart(2, "0");
      const minutes = String(today.getMinutes()).padStart(2, "0");
      const seconds = String(today.getSeconds()).padStart(2, "0");
      const day = `${year}-${month}-${date}-${hours}:${minutes}:${seconds}`;
      if (std_method == "plus") {
        updates["plus_point"] = snapshot.val()["plus_point"] + 1;
        updates[`log/${day}`] = "+ 1점 : 교사재량";
      } else if (std_method == "minus") {
        updates["minus_point"] = snapshot.val()["minus_point"] + 1;
        updates[`log/${day}`] = "- 1점 : 교사재량";
      } else if (std_method == "extra_plus") {
        const amount = parseFloat(req.body.amount);
        updates["extra_plus_point"] =
          snapshot.val()["extra_plus_point"] + amount;
        updates[`log/${day}`] = "+ " + amount + "점 : 추가 상점";
      } else if (std_method == "extra_minus") {
        const amount = parseFloat(req.body.amount);
        updates["extra_minus_point"] =
          snapshot.val()["extra_minus_point"] + amount;
        updates[`log/${day}`] = "+ " + amount + "점 : 추가 벌점";
      } else if (std_method == "out") {
        const end_date = new Date(req.body.end_day);
        const nextDay = new Date(end_date.getTime());
        updates["state"] = 3;
        updates["start_day"] = req.body.start_day;
        updates["end_day"] = nextDay.toISOString().split("T")[0];
        updates["extra_plus_point"] =
          snapshot.val()["extra_plus_point"] -
          (snapshot.val()["extra_plus_point"] +
            snapshot.val()["plus_point"] -
            snapshot.val()["extra_minus_point"] -
            snapshot.val()["minus_point"]);
        updates[`log/${day}`] = "* 퇴사 ";
      }
      return ref.update(updates);
    })
    .catch((error) => {
      console.error("데이터 처리 오류:", error);
    });
  res.status(200).json("check");
});

router.post("/pwchange", function (req, res, next) {
  const manager_name = req.session.user.manager_name;
  const manager_pw = req.body.password;
  let ref = db.ref("manager");
  let updates = {};
  ref.once("value", (snapshot) => {
    updates[manager_name] = manager_pw;
    ref
      .update(updates)
      .then(() => {
        res.status(200).json("Good");
      })
      .catch((error) => {
        res.status(400);
        console.error("데이터 처리 오류:", error);
      });
    res.status(200).json("Good");
  });
});

router.post("/calendar", function (req, res, next) {
  res.render("calendar");
});

// 학생 이름 클릭시 로그 나옴. 그거
router.post("/log", function (req, res, next) {
  const std_num = req.body.std_number;
  const ref = db.ref("/" + `${std_num}/`);
  ref
    .once("value")
    .then((snapshot) => {
      res.status(200).json(snapshot.val()["log"]);
    })
    .catch((error) => {
      console.error("데이터 처리 오류:", error);
    });
});
module.exports = router;
