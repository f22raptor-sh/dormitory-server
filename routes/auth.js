var express = require("express");
var router = express.Router();

router.get("/1", function (req, res, next) {
  if (req.session && req.session.user) {
    const auth_cookie = req.session.user.auth;
    if (
      auth_cookie ==
      "7A61D3AA5B3EE2EB55514F9A1024A2A50153FE0F6BC368C87E93AE2E3B5DEE67"
    ) {
      res.render("point_layout", { display: true });
    } else if (
      auth_cookie ==
      "9C42A22CBFDF4A33A2954D60761D70671B109FF4523C198FEF99CE089FBCBC33"
    ) {
      res.render("point_layout", { display: false });
    } else {
      res.sendFile("err404.html", { root: "public" });
    }
  } else {
    res.redirect("/");
  }
});

module.exports = router;
