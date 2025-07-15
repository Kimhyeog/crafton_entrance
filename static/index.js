function registerMemo() {
  const title = $("#memo-title").val();
  const content = $("#memo-content").val();

  $.ajax({
    type: "POST",
    url: "/memo",
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

function readAllMemos() {
  $.ajax({
    type: "GET",
    url: "/memo",
    success: (res) => {
      if (res.result === "success") {
        // 서버에서 가져온 memos
        memos = res.memos;

        for (let i = 0; i < memos.length; i++) {
          const { title, content, likes } = memos[i];

          // 카드 div 만들기
          const memoCard = `
          <div>
          <p class="card-title">${title}</p>
          <p class="card-text">${content}</p>
          <p class="card-likes">${likes}</p>
          <button class="btn btn-info text-white edit-button">수정</button>
          <button class="btn btn-danger delete-button">삭제</button>
        </div>`;

          // 만든 카드 삽입
          $("#card-list").append(memoCard);
        }
      } else alert(`에러 : ${res.message}`);
    },
  });
}

$(document).ready(() => {
  // form 태그에 registerMemo() 핸들러 등록 방법
  $("#memo-form").on("submit", registerMemo);

  // 페이지 접속시마다, 모든 메모들 출력되도록 하기
  readAllMemos();
});
