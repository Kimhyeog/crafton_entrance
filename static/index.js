function registerMemo() {
  const title = $("#memo-title").val();
  const content = $("#memo-content").val();

  $.ajax({
    type: "POST",
    data: {
      title: title,
      content: content,
    },
    success: (res) => {
      if (res.result === "success") alert(res.message);
      else {
        alert(`에러 : ${res.message}`);
      }
    },
    error: () => {
      alert("네트워크 오류");
    },
  });
}

$(document).ready(() => {
  // form 태그에 registerMemo() 핸들러 등록 방법
  $("#memo-form").on("submit", registerMemo);
});
