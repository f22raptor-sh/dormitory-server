var express = require("express");
var router = express.Router();

const multer = require("multer");
const xlsx = require("xlsx");
const path = require("path");
const fs = require("fs");

const session = require("express-session");
const bodyParser = require("body-parser");
const { file } = require("googleapis/build/src/apis/file");
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

const upload = multer({ dest: "uploads/" });
const userlogPath = "./views/user.xlsx";

let db; // db 객체를 받기 위한 변수 선언

router.setDb = (database) => {
  db = database; // db 객체를 저장
};

// manager js와 manager css를 캐싱
router.post("/", function (req, res, next) {
  const filePath1 = path.join(__dirname, "../public/javascripts/manage.js");
  const filePath2 = path.join(__dirname, "../public/stylesheets/manage.css");

  // 캐싱 헤더 설정
  res.setHeader("Cache-Control", "public, max-age=86400"); // 1주일 동안 캐시 유지

  // 파일을 클라이언트로 전송
  res.sendFile(filePath1);
  res.sendFile(filePath2);
});

//1 에서 form의 데이터를 기반으로 상벌점 입력
const processs = [];
let updates = {};
router.post("/point", function (req, res, next) {
  let ref = db.ref("/manager");

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const date = String(today.getDate()).padStart(2, "0");
  const hours = String(today.getHours()).padStart(2, "0");
  const minutes = String(today.getMinutes()).padStart(2, "0");
  const seconds = String(today.getSeconds()).padStart(2, "0");
  const day = `${year}-${month}-${date}-${hours}:${minutes}:${seconds}`;

  if (
    req.body.select_1 == "옵션을 선택해 주세요" ||
    (req.body.select_1 == "이외" && req.body.select_2 == "옵션을 선택해 주세요")
  ) {
    res.status(200).json({ message: "벌점 종류를 선택해주세요." });
  } else {
    ref.once("value", (snapshot) => {
      const data = snapshot.val();
      const std_list = Object.values(data["std_list"]).map(String);
      let updatedValue, updatetext;
      if (req.body.number == "select all") {
        const except_temp = req.body.except;
        const except_num = except_temp.match(/\d+/g);
        let s_ref = db.ref("/");
        updates = {};
        s_ref.once("value").then((snapshot) => {
          for (std_number in snapshot.val()) {
            const currentPlus = snapshot.val()[std_number]["plus_point"];
            const currentMinus = snapshot.val()[std_number]["minus_point"];
            if (std_number != "manager" && !except_num.includes(std_number)) {
              if (req.body.state == '"상점"') {
                console.log("1");
                updatedValue =
                  currentPlus + parseFloat(req.body.select_1.split("점")[0]);
                updatetext = req.body.select_1;
                updates["/" + std_number + "/plus_point"] = updatedValue;
              } else if (req.body.select_1 == "이외") {
                updatedValue =
                  currentMinus + parseFloat(req.body.select_2.split("점")[0]);
                updates["/" + std_number + "/minus_point"] = updatedValue;
                updatetext = req.body.select_2;
              } else {
                updatedValue =
                  currentMinus + parseFloat(req.body.select_1.split("점")[0]);
                updates["/" + std_number + "/minus_point"] = updatedValue;
                updatetext = req.body.select_1;
              }
              updates["/" + std_number + `/log/${day}`] = updatetext;
            }
          }
          return s_ref
            .update(updates)
            .then(() => {
              res.status(200).json({ message: "Good" });
            })
            .catch((error) => {
              res.status(200).json({
                message: `오류가 발생했습니다. manager.js ${error}`,
              });
            });
        });
      } else {
        const req_num = req.body.number;
        const req_num_reg = req_num.match(/\d+/g);
        updates = {};
        req_num_reg.forEach((child_num) => {
          if (std_list.includes(child_num)) {
            let s_ref = db.ref("/" + child_num + "/");
            const temp_process = s_ref.once("value").then((snapshot) => {
              const currentPlus = snapshot.val()["plus_point"];
              const currentMinus = snapshot.val()["minus_point"];

              if (req.body.state == '"상점"') {
                updatedValue =
                  currentPlus + parseFloat(req.body.select_1.split("점")[0]);
                updatetext = req.body.select_1;
                updates["/" + child_num + "/plus_point"] = updatedValue;
              } else if (req.body.select_1 == "이외") {
                updatedValue =
                  currentMinus + parseFloat(req.body.select_2.split("점")[0]);
                updates["/" + child_num + "/minus_point"] = updatedValue;
                updatetext = req.body.select_2;
              } else {
                updatedValue =
                  currentMinus + parseFloat(req.body.select_1.split("점")[0]);
                updates["/" + child_num + "/minus_point"] = updatedValue;
                updatetext = req.body.select_1;
              }
              let updateValue = currentPlus - currentMinus;
              if (updateValue <= -7) {
                updates["/" + child_num + "/state"] = 3;
              } else if (updateValue <= -5) {
                updates["/" + child_num + "/state"] = 2;
              }
              updates["/" + child_num + `/log/${day}`] = updatetext;
            });
            processs.push(temp_process);
          }
        });
        Promise.all(processs).then(() => {
          let a_ref = db.ref("/");
          return a_ref
            .update(updates)
            .then(() => {
              res.status(200).json({ message: "Good" });
            })
            .catch((error) => {
              res.status(500).json({
                message: `오류가 발생했습니다. manager.js ${error}`,
              });
            });
        });
      }
    });
  }
});

//1에서 업로드한 excel 파일 처리

router.post("/upload", upload.single("excelFile"), (req, res) => {
  if (!req.file) {
    res.status(400).send("파일이 전송되지 않았습니다.");
    return;
  }

  // 업로드된 파일의 경로
  const filePath = req.file.path;
  const writePath = "./views/user.xlsx";
  // Excel 파일 읽기
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const workbook2 = xlsx.utils.book_new();
  const sheet2 = [];

  // 필요한 작업 수행
  const range = xlsx.utils.decode_range(sheet["!ref"]);
  let updates = {};
  let updates2 = {};

  // 기존 데이터 모두 제거
  const ref = db.ref("/");
  const ref2 = db.ref("/manager/std_list");
  ref
    .once("value")
    .then((snapshot) => {
      const data = snapshot.val();
      const keysToDelete = Object.keys(data).filter((key) => key !== "manager");
      keysToDelete.forEach((key) => {
        updates2[key] = null;
        updates[key] = null;
      });
      return ref2.update(updates2); // 업데이트가 완료되면 데이터 추가 진행
    })
    .then(() => {
      for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
        const cellA = sheet[xlsx.utils.encode_cell({ r: rowNum, c: 0 })]; // A열
        const cellB = sheet[xlsx.utils.encode_cell({ r: rowNum, c: 1 })]; // B열

        if (cellA && cellB) {
          const dataA = cellA.v; // A열 데이터
          const dataB = cellB.v; // B열 데이터
          sheet2.push([
            cellA ? cellA.v : "", // A열 데이터
          ]);
          const temp = {};
          const temp2 = {};
          temp["number"] = dataA;
          temp["password"] = "bsis!";
          temp["name"] = dataB;
          temp["log"] = { "0000-00-00-00:00:00": "상벌점 초기화됨" };
          temp["plus_point"] = 0;
          temp["minus_point"] = 0;
          temp["extra_plus_point"] = 0;
          temp["extra_minus_point"] = 0;
          temp["state"] = 0;
          temp2[dataA] = dataA;
          updates[dataA] = temp;
          ref2.update(temp2);
        }
      }

      if (fs.existsSync(writePath)) {
        fs.unlinkSync(writePath);
      }
      const newSheet = xlsx.utils.aoa_to_sheet(sheet2);
      if (workbook2.SheetNames.includes("Sheet1")) {
        delete workbook2.Sheets["Sheet1"];
      }
      xlsx.utils.book_append_sheet(workbook2, newSheet, "Sheet1");

      // 새로운 엑셀 파일로 저장
      xlsx.writeFile(workbook2, writePath);
      return ref.update(updates);
    })
    .then(() => {
      // 파일 삭제 등 추가 작업 수행
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("파일 삭제 오류:", err);
          res.status(500).send("파일 삭제 오류 발생");
          return;
        }
        res.status(200).send("파일이 성공적으로 처리되었습니다.");
      });
    })
    .catch((error) => {
      console.error("데이터 처리 오류:", error);
      res.status(500).send("데이터 처리 오류 발생");
    });
  // 처리가 완료되면 업로드된 파일 삭제 등 추가 작업 수행
});

router.post("/resetpw", function (req, res, next) {
  const std_num = req.body.name;

  if (!fs.existsSync(userlogPath)) {
    return res.status(400).json({ error: "File not found" });
  }
  // 엑셀 파일 읽기
  const workbook = xlsx.readFile(userlogPath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // 시트의 모든 데이터를 JSON 형태로 변환
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  // 데이터 업데이트
  let updated = false;
  for (let i = 1; i < data.length; i++) {
    // 0번째 인덱스는 헤더라고 가정
    if (data[i][0] === std_num) {
      data[i][1] = ""; // B열 데이터 제거
      updated = true;
      break;
    }
  }

  if (updated) {
    // 수정된 데이터를 시트로 변환
    const newSheet = xlsx.utils.aoa_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;

    // 수정된 엑셀 파일 저장
    xlsx.writeFile(userlogPath, workbook);
    console.log("good");
    res.status(200).json({ message: "Good" });
  } else {
    console.log("no stdnum");
    res.status(400).json({ error: "std_num not found" });
  }
  console.log("check1");
});

module.exports = router;
