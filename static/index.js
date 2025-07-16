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

function likeMemo(memo_id) {
  $.ajax({
    type: "POST",
    url: "/memo/like",

    data: { memoId: memo_id },
    success: (res) => {
      if (res.result === "success") {
        alert(res.message);

        // 좋아요 수 증가시키기
        // const likesElement = $(`#${memo_id}`).find(".card-likes");
        // const currentLikes = parseInt(likesElement.text());
        // likesElement.text(currentLikes + 1);

        // 또는 새로고침(비추천)
        window.location.reload();
      } else alert(res.message);
    },
    error: () => {
      alert("서버에 요청 오류");
    },
  });
}

function readAllMemos() {
  $.ajax({
    type: "GET",
    url: "/memo",
    success: (res) => {
      if (res.result === "success") {
        const memos = res.memos;

        for (let i = 0; i < memos.length; i++) {
          // 서버에서 받은 memoCard의 id도 받기
          const { _id, title, content, likes } = memos[i];

          // 받은 id를 memoCard div의 id속성에 추가
          const memoCard = `
  <div id="${_id}" class="card mb-3 p-3">
    <p class="card-title fw-bold">${title}</p>
    <p class="card-text">${content}</p>
    <p class="card-likes">👍 ${likes}</p>
    <button class="btn btn-info text-white edit-button">수정</button>
    <button class="btn btn-danger delete-button">삭제</button>
    <button class="btn btn-outline-primary rounded-circle" onclick="likeMemo('${_id}')">좋아요</button>
  </div>
`;

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
