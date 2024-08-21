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
  console.log(method);
  console.log(req.body["user"]["id"]);
  // if (method == "user") {
  //   const searchValue = "search_key"; // A열에서 찾을 값
  //   const replacementValue = "replacement_value"; // B열 데이터가 비어있을 때 채울 값

  //   const workbook = xlsx.readFile(filePath);
  //   const sheetName = workbook.SheetNames[0];
  //   const sheet = workbook.Sheets[sheetName];

  //   const data = {};
  //   const range = xlsx.utils.decode_range(sheet["!ref"]);
  //   let found = false;

  //   for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
  //     const cellA = sheet[xlsx.utils.encode_cell({ r: rowNum, c: 0 })];
  //     const cellB = sheet[xlsx.utils.encode_cell({ r: rowNum, c: 1 })];

  //     const key = cellA ? cellA.v : "";
  //     const value = cellB ? cellB.v : null;

  //     if (key === searchValue) {
  //       found = true;
  //       if (value === null || value === "") {
  //         sheet[xlsx.utils.encode_cell({ r: rowNum, c: 1 })] = {
  //           v: replacementValue,
  //         };
  //       } else {
  //         // 사용자 검증 단계
  //         console.log(`Found value: ${value}`);
  //       }
  //     }

  //     if (key) {
  //       data[key] = value;
  //     }
  //   }

  //   if (found) {
  //     xlsx.writeFile(filePath, workbook);
  //   } else {
  //     res
  //       .json({
  //         version: "2.0",
  //         template: {
  //           outputs: [
  //             {
  //               simpleText: {
  //                 text: "등록되지 않은 사용자입니다 관리자에게 문의해주시기 바랍니다.",
  //               },
  //             },
  //           ],
  //         },
  //       })
  //       .status(200);
  //     return;
  //   }
  // } else if (method == "check") {
  // } else if (method == "log") {
  // }
  console.log(req.body);
});

module.exports = router;
