var express = require("express");
var router = express.Router();
const xlsx = require("xlsx");

let db; // db 객체를 받기 위한 변수 선언

const filePath = "/views/user.xlsx";

router.setDb = (database) => {
  db = database; // db 객체를 저장
};

const userlogPath = "./views/user.xlsx";

router.post("/", function (req, res, next) {
  let method = req.get("method");
  let user_id = req.body["userRequest"]["user"]["id"];
  let std_num = req.body["userRequest"]["utterance"];
  // if (method == "user") {
  //   // user_id가 B열에 이미 있는지, std_num이 A에 있고, 그 옆의 B가 비어있는지 확인 후
  //   // B열에 없고 비어있다면 추가
  //   // B열에 있고 std_num과 동일하면 이미 등록되었다는 안내
  //   // B열에 있고 std_num과 다르면 이미 본 계정은 다른 학번으로 등록되었다는 안내
  // } else if (True) {
  //   // 여기에는 사용자의 실제 id와 excel에 저장된 id가 일치하는지 확인한다.
  //   // 일치할 경우 다음을 실행한다.
  //   if (method == "check") {
  //     let ref = db.ref("/" + std_num + "/");
  //     s_ref.once("value", (snapshot) => {
  //       const std_data = snapshot.val();
  //       // 이 부분을 챗봇의 응답 형식으로 바꿔야함. 깔끔하게 바꾸는게 좋을 듯
  //       // if (std_data["state"] == "2") {
  //       //   res.render("student_layout", {
  //       //     number: req_name,
  //       //     name: std_data["name"],
  //       //     plus_point: std_data["plus_point"] + std_data["extra_plus_point"],
  //       //     minus_point:
  //       //       std_data["minus_point"] + std_data["extra_minus_point"],
  //       //     state: "퇴사 위험 상태입니다.",
  //       //     display1: true,
  //       //     display2: true,
  //       //     log: std_data["log"],
  //       //   });
  //       // } else if (std_data["state"] == "1") {
  //       //   res.render("student_layout", {
  //       //     number: req_name,
  //       //     name: std_data["name"],
  //       //     plus_point: std_data["plus_point"] + std_data["extra_plus_point"],
  //       //     minus_point:
  //       //       std_data["minus_point"] + std_data["extra_minus_point"],
  //       //     state: "퇴사 상태입니다.",
  //       //     display1: false,
  //       //     display2: true,
  //       //     log: std_data["log"],
  //       //   });
  //       // } else if (std_data["state"] == "3") {
  //       //   res.render("student_layout", {
  //       //     number: req_name,
  //       //     name: std_data["name"],
  //       //     plus_point: std_data["plus_point"] + std_data["extra_plus_point"],
  //       //     minus_point:
  //       //       std_data["minus_point"] + std_data["extra_minus_point"],
  //       //     state: "퇴사 대상자입니다.",
  //       //     display1: true,
  //       //     display2: true,
  //       //     log: std_data["log"],
  //       //   });
  //       // } else {
  //       //   res.render("student_layout", {
  //       //     number: req_name,
  //       //     name: std_data["name"],
  //       //     plus_point: std_data["plus_point"] + std_data["extra_plus_point"],
  //       //     minus_point:
  //       //       std_data["minus_point"] + std_data["extra_minus_point"],
  //       //     state: "",
  //       //     display1: true,
  //       //     display2: false,
  //       //     log: std_data["log"],
  //       //   });
  //       // }
  //     });
  //   } else if (method == "log") {
  //     // 위 코드를 참고해서 std_data["log"] 를 편집하면 된다.
  //   }
  // } else {
  //   res
  //     .json({
  //       version: "2.0",
  //       template: {
  //         outputs: [
  //           {
  //             simpleText: {
  //               text: "이미 다른 계정 또는 다른 사람의 기기에 연결되어있습니다.\n\
  //               문의는 상담직원 연결로 전환 후 문의해주시기 바랍니다.\n\
  //               문의 가능 시간은 평일 9시부터 6시까지 입니다.",
  //             },
  //           },
  //         ],
  //       },
  //     })
  //     .status(200);
  // }
  res
    .json({
      version: "2.0",
      template: {
        outputs: [
          {
            simpleText: {
              text: "recive data" + method + "/" + user_id + "/" + std_num,
            },
          },
        ],
      },
    })
    .status(200);
});

module.exports = router;
