s_ref.once("value").then((snapshot) => {
  for (std_number in snapshot.val()) {
    if (std_number != "manager") {
      const currentPlus = snapshot.val()[std_number]["plus_point"];
      const currentMinus = snapshot.val()[std_number]["minus_point"];
      const excurrentPlus = snapshot.val()[std_number]["extra_plus_point"];
      const excurrentMinus = snapshot.val()[std_number]["extra_minus_point"];

      updatedValue =
        currentPlus - currentMinus + excurrentPlus - excurrentMinus;
      if (updatedValue > 0) {
        console.log(updatedValue);
        console.log(std_number);
        updates["/" + std_number + "/extra_minus_point"] =
          snapshot.val()["extra_minus_point"] + updatedValue;
        updates["/" + std_number + `/log/${day}`] =
          "2학기 시작 상점 상쇄 (" + updatedValue + ")";
      }
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
