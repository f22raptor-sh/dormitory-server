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

  if (method === "user") {
    // method가 'user'인 경우의 처리
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
                      text: "이전에 인증된 상태 입니다.\n정상적으로 사용하실 수 있습니다.",
                    },
                  },
                ],
              },
            })
            .status(200);
        } else if (!id) {
          data[i][1] = user_id; // B열이 비어있다면 user_id 등록
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
                      text: "인증되었습니다.\n지금부터 정상적으로 사용할 수 있습니다.",
                    },
                  },
                ],
              },
            })
            .status(200);
        } else if (id != user_id) {
          return res
            .json({
              version: "2.0",
              template: {
                outputs: [
                  {
                    simpleText: {
                      text: "해당 학번으로 인증된 계정이 있습니다. \n본인 학번으로 다른 사람이 인증했다면,\n상담직원과 채팅으로 전환한 후 문의해주시기 바랍니다.",
                    },
                  },
                ],
              },
            })
            .status(200);
        }
      }

      if (id == user_id && input != user_input) {
        return res
          .json({
            version: "2.0",
            template: {
              outputs: [
                {
                  simpleText: {
                    text:
                      "다른 학번으로 이미 인증된 상태입니다.\n등록된 학번은 " +
                      input +
                      '입니다.\n 다른 학번으로 인증하기 위해서 인증을 해제하고 싶으시다면, "인증 해제"를 입력해주세요.',
                  },
                },
              ],
            },
          })
          .status(200);
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
                  text: "존재하지 않는 학번입니다.",
                },
              },
            ],
          },
        })
        .status(200);
    }
  } else if (method === "check" || method === "log") {
    let check_id = false;
    for (let i = 0; i < data.length; i++) {
      const [input, id] = data[i];

      if (id == user_id && !check_id) {
        check_id = true;
        const std_num = input;
        let ref = db.ref("/" + std_num + "/");
        ref.once("value", (snapshot) => {
          const std_data = snapshot.val();
          const keys = Object.keys(std_data["log"]);
          if (method == "check") {
            if (std_data["state"] == "2") {
              return res
                .json({
                  version: "2.0",
                  template: {
                    outputs: [
                      {
                        simpleText: {
                          text:
                            std_num +
                            " " +
                            std_data["name"] +
                            "\n상점 : " +
                            String(
                              std_data["plus_point"] +
                                std_data["extra_plus_point"]
                            ) +
                            "\
                          \n벌점 : " +
                            String(
                              std_data["minus_point"] +
                                std_data["extra_minus_point"]
                            ) +
                            "\n마지막 업데이트 : " +
                            keys[keys.length - 1] +
                            "\n퇴사 위험 상태입니다.",
                        },
                      },
                    ],
                  },
                })
                .status(200);
            } else if (std_data["state"] == "1") {
              return res
                .json({
                  version: "2.0",
                  template: {
                    outputs: [
                      {
                        simpleText: {
                          text:
                            std_num +
                            " " +
                            std_data["name"] +
                            "\n상점 : " +
                            String(
                              std_data["plus_point"] +
                                std_data["extra_plus_point"]
                            ) +
                            "\
                          \n벌점 : " +
                            String(
                              std_data["minus_point"] +
                                std_data["extra_minus_point"]
                            ) +
                            "\n마지막 업데이트 : " +
                            keys[keys.length - 1] +
                            "\n\n퇴사 시작일 : " +
                            std_data["start_day"] +
                            "\n퇴사 종료일 : " +
                            std_data["end_day"] +
                            "\n퇴사 상태입니다.",
                        },
                      },
                    ],
                  },
                })
                .status(200);
            } else if (std_data["state"] == "3") {
              return res
                .json({
                  version: "2.0",
                  template: {
                    outputs: [
                      {
                        simpleText: {
                          text:
                            std_num +
                            " " +
                            std_data["name"] +
                            "\n상점 : " +
                            String(
                              std_data["plus_point"] +
                                std_data["extra_plus_point"]
                            ) +
                            "\
                          \n벌점 : " +
                            String(
                              std_data["minus_point"] +
                                std_data["extra_minus_point"]
                            ) +
                            "\n마지막 업데이트 : " +
                            keys[keys.length - 1] +
                            "\n\n퇴사 시작일 : " +
                            std_data["start_day"] +
                            "\n퇴사 종료일 : " +
                            std_data["end_day"] +
                            "\n퇴사 예정자 입니다.",
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
                          text:
                            std_num +
                            " " +
                            std_data["name"] +
                            "\n상점 : " +
                            String(
                              std_data["plus_point"] +
                                std_data["extra_plus_point"]
                            ) +
                            "\
                          \n벌점 : " +
                            String(
                              std_data["minus_point"] +
                                std_data["extra_minus_point"]
                            ) +
                            "\n마지막 업데이트 : " +
                            keys[keys.length - 1],
                        },
                      },
                    ],
                  },
                })
                .status(200);
            }
          } else if (method === "log") {
            const lines = [];
            for (const [timestamp, content] of Object.entries(
              std_data["log"]
            )) {
              const [year, month, day] = timestamp.split("-");
              const dateFormatted = `${year}-${month}-${day}`;
              lines.push(`${dateFormatted} - ${content}`);
            }
            lines.reverse();
            return res
              .json({
                version: "2.0",
                template: {
                  outputs: [
                    {
                      simpleText: {
                        text:
                          std_num +
                          " " +
                          std_data["name"] +
                          "\n 상벌점 기록은 다음과 같습니다.\n" +
                          lines.join("\n") +
                          "\n마지막 업데이트 : " +
                          keys[keys.length - 1],
                      },
                    },
                  ],
                },
              })
              .status(200);
          }
        });
      }
    }

    // B열에 user_id가 없을 때
    if (!check_id) {
      return res
        .json({
          version: "2.0",
          template: {
            outputs: [
              {
                simpleText: {
                  text: "등록되지 않은 사용자 입니다.\n학번을 입력해주세요.",
                },
              },
            ],
          },
        })
        .status(200);
    }
  } else if (method === "delete") {
    let updated = false;
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] == user_id) {
        data[i][1] = "";
        updated = true;
        break;
      }
    }

    if (updated) {
      const newSheet = xlsx.utils.aoa_to_sheet(data);
      workbook.Sheets[workbook.SheetNames[0]] = newSheet;
      xlsx.writeFile(workbook, userlogPath);
      return res
        .json({
          version: "2.0",
          template: {
            outputs: [
              {
                simpleText: {
                  text: "계정 인증이 해제되었습니다. \n 다른 계정으로 인증하려면 학번을 입력해주세요.",
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
                  text: "이 계정으로 등록된 학번이 없습니다.\n학번을 입력해서 인증해주세요.",
                },
              },
            ],
          },
        })
        .status(200);
    }
  } else {
    return res
      .json({
        version: "2.0",
        template: {
          outputs: [
            {
              simpleText: {
                text: "오류",
              },
            },
          ],
        },
      })
      .status(200);
  }
});

module.exports = router;
