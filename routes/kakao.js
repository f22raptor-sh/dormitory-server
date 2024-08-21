var express = require("express");
var router = express.Router();
const xlsx = require("xlsx");
const fs = require("fs");

let db; // db 객체를 받기 위한 변수 선언

router.setDb = (database) => {
  db = database; // db 객체를 저장
};

const userlogPath = "./views/user.xlsx";

router.post("/", function (req, res, next) {
  let method = req.get("method");
  let user_id = req.body["userRequest"]["user"]["id"];
  let user_input = req.body["userRequest"]["utterance"];

  // if (method == "user") {
  if (!fs.existsSync(userlogPath)) {
    console.log("No Log file on path " + userlogPath);
    return res
      .status(404)
      .json({ message: "사용자 로그 파일을 찾을 수 없습니다." });
  }

  const workbook = xlsx.readFile(userlogPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  let found = false;

  for (let i = 0; i < data.length; i++) {
    const [input, id] = data[i];

    if (input == user_input) {
      found = true;

      if (id == user_id) {
        return res
          .json({
            version: "2.0",
            template: {
              outputs: [
                {
                  simpleText: {
                    text: "이전에 인증한 상태 입니다.",
                  },
                },
              ],
            },
          })
          .status(200);
      } else if (!id) {
        data[i][1] = user_id; // B열이 비어있다면 새로 등록
        const updatedSheet = xlsx.utils.aoa_to_sheet(data);
        workbook.Sheets[workbook.SheetNames[0]] = updatedSheet;
        xlsx.writeFile(workbook, userlogPath);
        return res
          .json({
            version: "2.0",
            template: {
              outputs: [
                {
                  simpleText: {
                    text: "성공적으로 인증되었습니다.",
                  },
                },
              ],
            },
          })
          .status(200);
      } else {
        return res
          .json({
            version: "2.0",
            template: {
              outputs: [
                {
                  simpleText: {
                    text: "다른 학번으로 이미 인증되어있습니다.",
                  },
                },
              ],
            },
          })
          .status(200);
      }
    }
  }

  if (!found) {
    return res
      .json({
        version: "2.0",
        template: {
          outputs: [
            {
              simpleText: {
                text: "존재하지 않는 학번입니다. 다시 확인해주세요.",
              },
            },
          ],
        },
      })
      .status(200);
  }
  // } else if (True) {
  //   // 여기에는 사용자의 실제 id와 excel에 저장된 id가 일치하는지 확인한다.
  //   // 일치할 경우 다음을 실행한다.
  //   if (method == "check") {
  //     let ref = db.ref("/" + user_input + "/");
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
});

module.exports = router;
