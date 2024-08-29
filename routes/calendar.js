var express = require("express");
var router = express.Router();

const { google } = require("googleapis");
const path = require("path");
const bodyParser = require("body-parser");
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

const keyPath = path.join(
  __dirname,
  "../path/helloworld-bsis-5f39a784a561.json"
);

const auth = new google.auth.GoogleAuth({
  keyFile: keyPath,
  scopes: ["https://www.googleapis.com/auth/calendar"],
});

const calendar = google.calendar({ version: "v3", auth });

//list 접근시 학생 리스트 표시
router.post("/", function (req, res, next) {
  res.render("calendar");
});

router.post("/add", async function (req, res, next) {
  const end_date = new Date(req.body.end_day);
  const nextDay = new Date(end_date.getTime());
  nextDay.setDate(nextDay.getDate() + 1);
  try {
    const event = {
      summary: req.body.std_num,
      start: {
        dateTime: `${req.body.start_day}T00:00:00`,
        timeZone: "Asia/Seoul",
      },
      end: {
        dateTime: `${nextDay.toISOString().split("T")[0]}T00:00:00`,
        timeZone: "Asia/Seoul",
      },
    };

    const result = await calendar.events.insert({
      calendarId: "bsishelloworld@gmail.com",
      resource: event,
    });

    console.log("Event added:", result.data.htmlLink);
    res.status(200).json({ message: "Good" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error occurred.");
  }
});

module.exports = router;
