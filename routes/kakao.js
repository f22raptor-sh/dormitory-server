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
  if (method == "user") {
    const searchValue = "test";
    // req.body["userRequest"]["utterance"]
    const replacementValue = user_id; // B열 데이터가 비어있을 때 채울 값

    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const data = {};
    const range = xlsx.utils.decode_range(sheet["!ref"]);
    let found = false;

    for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
      const cellA = sheet[xlsx.utils.encode_cell({ r: rowNum, c: 0 })];
      const cellB = sheet[xlsx.utils.encode_cell({ r: rowNum, c: 1 })];

      const key = cellA ? cellA.v : "";
      const value = cellB ? cellB.v : null;

      if (key == searchValue) {
        found = true;
        if (value === null || value === "") {
          sheet[xlsx.utils.encode_cell({ r: rowNum, c: 1 })] = {
            v: replacementValue,
          };
          res
            .json({
              version: "2.0",
              template: {
                outputs: [
                  {
                    simpleText: {
                      text: "인증되었습니다. 정상적으로 서비스를 이용할 수 있습니다.",
                    },
                  },
                ],
              },
            })
            .status(200);
        } else {
          res
            .json({
              version: "2.0",
              template: {
                outputs: [
                  {
                    simpleText: {
                      text: "다른 카카오톡 계정으로 인증된 상태입니다.\n 인증한 계정이 없을 경우 관리자에게 문의해주세요.",
                    },
                  },
                ],
              },
            })
            .status(200);
        }
      }

      if (key) {
        data[key] = value;
      }
    }

    if (found) {
      xlsx.writeFile(filePath, workbook);
    } else {
      res
        .json({
          version: "2.0",
          template: {
            outputs: [
              {
                simpleText: {
                  text: "등록되지 않은 사용자입니다 관리자에게 문의해주시기 바랍니다.",
                },
              },
            ],
          },
        })
        .status(200);
    }
  } else if (method == "check") {
  } else if (method == "log") {
  }
});

module.exports = router;
