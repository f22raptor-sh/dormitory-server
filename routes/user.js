var express = require("express");
var router = express.Router();
let db; // db 객체를 받기 위한 변수 선언

router.setDb = (database) => {
  db = database; // db 객체를 저장
};

router.post("/", function (req, res, next) {
  let req_name = req.body.name;
  let req_pw = req.body.pw;

  let ref = db.ref("/manager");
  ref.once("value", (snapshot) => {
    const data = snapshot.val();
    const manager = {};

    snapshot.forEach((childSnapshot) => {
      const key = childSnapshot.key;
      const value = childSnapshot.val();

      if (key !== "std_list") {
        manager[key] = value;
      }
    });
    if (data) {
      if (req_name in manager) {
        if (req_pw == manager[req_name]) {
          if (req_name.startsWith("master")) {
            req.session.user = {
              auth: "7A61D3AA5B3EE2EB55514F9A1024A2A50153FE0F6BC368C87E93AE2E3B5DEE67",
              manager_name: "master",
            };
            res.redirect(301, "/auth/1");
            /* res.render('point_layout',{display:true}); */
          } else {
            req.session.user = {
              auth: "9C42A22CBFDF4A33A2954D60761D70671B109FF4523C198FEF99CE089FBCBC33",
              manager_name: req_name,
            };
            res.redirect(301, "/auth/1");
            /* res.render('point_layout',{display:false}); */
          }
        } else {
          res.redirect(301, "/");
        }
      } else {
        const std_list = Object.values(data["std_list"]).map(String);
        if (std_list.includes(req_name)) {
          let s_ref = db.ref("/" + req_name + "/");
          s_ref.once("value", (snapshot) => {
            const std_data = snapshot.val();
            if (std_data["password"] == req_pw) {
              req.session.user = { std_num: req_name };
              if (std_data["state"] == "2") {
                res.render("student_layout", {
                  number: req_name,
                  name: std_data["name"],
                  plus_point:
                    std_data["plus_point"] + std_data["extra_plus_point"],
                  minus_point:
                    std_data["minus_point"] + std_data["extra_minus_point"],
                  state: "퇴사 위험 상태입니다.",
                  display1: true,
                  display2: true,
                  log: std_data["log"],
                });
              } else if (std_data["state"] == "1") {
                res.render("student_layout", {
                  number: req_name,
                  name: std_data["name"],
                  plus_point:
                    std_data["plus_point"] + std_data["extra_plus_point"],
                  minus_point:
                    std_data["minus_point"] + std_data["extra_minus_point"],
                  state: "퇴사 상태입니다.",
                  display1: false,
                  display2: true,
                  log: std_data["log"],
                });
              } else if (std_data["state"] == "3") {
                res.render("student_layout", {
                  number: req_name,
                  name: std_data["name"],
                  plus_point:
                    std_data["plus_point"] + std_data["extra_plus_point"],
                  minus_point:
                    std_data["minus_point"] + std_data["extra_minus_point"],
                  state: "퇴사 대상자입니다.",
                  display1: true,
                  display2: true,
                  log: std_data["log"],
                });
              } else {
                res.render("student_layout", {
                  number: req_name,
                  name: std_data["name"],
                  plus_point:
                    std_data["plus_point"] + std_data["extra_plus_point"],
                  minus_point:
                    std_data["minus_point"] + std_data["extra_minus_point"],
                  state: "",
                  display1: true,
                  display2: false,
                  log: std_data["log"],
                });
              }
            } else {
              res.redirect(301, "/");
            }
          });
        } else {
          res.redirect(301, "/");
        }
      }
    } else {
      err_data = {
        error: "데이터베이스 에러",
        loc: "user.js",
        message: "데이터베이스 조회 결과 없음",
      };
      res.send(err_data);
    }
  });
});

router.post("/pwchange", function (req, res, next) {
  if (req.session && req.session.user) {
    const std_num = req.session.user.std_num;
    const std_pw = req.body.password;
    let ref = db.ref("/" + std_num + "/");
    let updates = {};
    ref.once("value", (snapshot) => {
      updates["password"] = std_pw;
      ref
        .update(updates)
        .then(() => {
          res.status(200).json("Good");
        })
        .catch((error) => {
          res.status(400);
          console.error("데이터 처리 오류:", error);
        });
    });
  } else {
    res.redirect("/");
  }
});
module.exports = router;
