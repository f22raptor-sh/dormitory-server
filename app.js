var createError = require("http-errors");
var express = require("express");
const fs = require("fs");

var path = require("path");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/user");
var pointRouter = require("./routes/manager_point");
var listRouter = require("./routes/manager_list");
var adminRouter = require("./routes/admin");
var calendarRouter = require("./routes/calendar");
var authRouter = require("./routes/auth");
var kakaoRouter = require("./routes/kakao");
const session = require("express-session");

var app = express();

app.use(
  session({
    secret: "AgsjqwebjtAEKmaGdsWEkljHfbqKjwietn",
    resave: false,
    saveUninitialized: false,
  })
);

const admin = require("firebase-admin");
const serviceAccount = require("./path/dormitory-server-firebase-adminsdk-1bg21-91498cdcb6.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://dormitory-server-default-rtdb.firebaseio.com/", // Firebase 프로젝트의 Database URL
});

const db = admin.database();
usersRouter.setDb(db);
pointRouter.setDb(db);
listRouter.setDb(db);
adminRouter.setDb(db);
kakaoRouter.setDb(db);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

function logHack(req, res, bool) {
  const filePath = "./log/hack.txt";
  if (bool == 1) {
    var newText = req.session.user.num + " : " + req.ip;
  } else {
    var newText = req.ip;
  }
  fs.open(filePath, "a", (err, fd) => {
    if (err) {
      console.error("Error opening file:", err);
      return;
    }
    fs.appendFile(fd, "\n" + newText, (err) => {
      if (err) {
        console.error("Error appending to file:", err);
        return;
      }
      // 파일 닫기
      fs.close(fd, (err) => {
        if (err) {
          console.error("Error closing file:", err);
        }
      });
    });
  });
}
function checkAuth(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    logHack(req, res, 0);
    res.redirect("/");
  }
}
function checkAdmin(req, res, next) {
  // 세션에 사용자 정보가 있는지 확인
  if (req.session && req.session.user) {
    const auth_cookie = req.session.user.auth;
    if (
      auth_cookie ==
        "7A61D3AA5B3EE2EB55514F9A1024A2A50153FE0F6BC368C87E93AE2E3B5DEE67" ||
      auth_cookie ==
        "9C42A22CBFDF4A33A2954D60761D70671B109FF4523C198FEF99CE089FBCBC33"
    ) {
      next();
    } else {
      logHack(req, res, 1);
      res.redirect("/");
    }
  } else {
    logHack(req, res, 0);
    res.redirect("/");
  }
}

app.use("/", indexRouter);
app.use("/auth", checkAuth, authRouter);
app.use("/user", usersRouter);

app.use("/point", checkAdmin, pointRouter);
app.use("/list", checkAdmin, listRouter);
app.use("/admin", checkAdmin, adminRouter);
app.use("/calendar", checkAdmin, calendarRouter);

app.use("/kakao", kakaoRouter);

app.get("/favicon.ico", (req, res) => {
  const faviconPath = path.join(__dirname, "public", "images", "favicon.ico");
  res.sendFile(faviconPath);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  /*   res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error'); */
  res.status(err.status || 500);
  res.send(`Error: ${err.message}`);
});

module.exports = app;
