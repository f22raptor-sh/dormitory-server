const targetNode = document.querySelector(".knobs");
const beforeStyle = window.getComputedStyle(targetNode, ":before");
const newBeforeStyle = window.getComputedStyle(targetNode, ":before");
let beforeContent = beforeStyle.getPropertyValue("content");
const change_point_type = document.querySelectorAll(".type");

const point_type = document.getElementById("select");
const high_point_type = document.getElementById("hight_select");

setInterval(() => {
  const selectedOption = point_type.options[point_type.selectedIndex];
  const selectedText = selectedOption.text;
  if (selectedText == "이외") {
    high_point_type.classList.remove("hidden");
  } else {
    high_point_type.classList.add("hidden");
  }

  const newBeforeContent = newBeforeStyle.getPropertyValue("content");
  if (newBeforeContent != beforeContent) {
    change_point_type.forEach((element) => {
      element.classList.toggle("hidden");
    });
    beforeContent = newBeforeContent;
  }
}, 1000);

// 상벌점 종류 선택 js

function showToast(message, state = 1) {
  let toast = document.createElement("div");
  toast.classList.add("toast");
  if (state == 1) {
    toast.classList.add("toast_ok");
  } else if (state == 2) {
    toast.classList.add("toast_error");
  } else if (state == 3) {
    toast.classList.add("toast_wrong");
  }
  toast.innerText = message;
  let container = document.getElementById("toast-container");
  container.appendChild(toast);
  setTimeout(function () {
    toast.classList.add("hide");
    setTimeout(function () {
      container.removeChild(toast);
    }, 300);
  }, 3000);
}

// 토스트 알림 구현 js

const form1 = document.getElementById("user-form");

form1.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form1);
  const send_data = {
    number: formData.get("number"),
    except: formData.get("nonumber"),
    select_1: formData.get("select_1"),
    select_2: formData.get("select_2"),
    state: window
      .getComputedStyle(document.querySelector(".knobs"), ":before")
      .getPropertyValue("content"),
  };

  try {
    const response = await fetch("/point/point", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(send_data),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.message != "Good") {
        showToast(data.message, 2);
      } else {
        showToast("성공적으로 점수를 부여하였습니다", 1);
      }
    } else {
      showToast("서버 응답이 없습니다. 관리자에게 문의해주세요.", 2);
    }
  } catch (error) {
    console.log(error);
    showToast("데이터 전송 중 오류. 다시 시도해주세요.", 3);
  }
});

// 상벌점 입력

const select_all_btn = document.getElementById("select_all");
const num_input = document.getElementById("num_input");
const non_num = document.getElementById("num_out");

select_all_btn.addEventListener("click", (event) => {
  event.preventDefault();
  if (num_input.value != "select all") {
    num_input.value = "select all";
    non_num.style.display = "block";
  } else {
    num_input.value = "";
    non_num.style.display = "none";
  }
});

num_input.addEventListener("input", (event) => {
  console.log(num_input.value == "select all");
  if (num_input.value == "select all") {
    non_num.style.display = "block";
  } else {
    non_num.style.display = "none";
  }
});

const select_no_btn = document.getElementById("no_select");

select_no_btn.addEventListener("click", (event) => {
  event.preventDefault();
  num_input.value = "";
  non_num.style.display = "none";
});

// 전체 인원 선택

const uploadButton = document.getElementById("uploadButton");
const fileInput = document.getElementById("fileInput");

uploadButton.addEventListener("click", async () => {
  const yes_no = prompt(
    "학생 리스트를 초기화하시겠습니까? 현재 기록된 벌점 및 학생 리스트가 초기화됩니다.",
    "y / n"
  );
  if (yes_no == "y" || yes_no == "Y") {
    const file = fileInput.files[0];
    if (!file) {
      showToast("파일을 업로드 해주세요", 2);
      return;
    }

    const formData = new FormData();
    formData.append("excelFile", file);

    try {
      const response = await fetch("/point/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.text();
        alert(result); // 서버에서 온 응답 메시지
      } else {
        showToast("파일 업로드 실패.", 2);
      }
    } catch (error) {
      console.log(error);
      showToast("파일 업로드 중 오류. 다시 시도해주세요.", 3);
    }
  }
});

// 학생 리스트 파일 업로드
