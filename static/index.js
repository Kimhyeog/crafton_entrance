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
    <div class"btn-box flex gap-1">
      <button class="btn btn-info text-white edit-button" onclick="showEditForm('${_id}')">수정</button>
      <button class="btn btn-danger delete-button" onclick="deleteMemo('${_id}')">삭제</button>
      <button class="btn btn-outline-primary like-button rounded-circle" onclick="likeMemo('${_id}')">좋아요</button>
    </div>
  </div>
`;

          $("#card-list").append(memoCard);
        }
      } else alert(`에러 : ${res.message}`);
    },
  });
}

function deleteMemo(memo_id) {
  $.ajax({
    type: "POST",
    url: "/memo/delete",
    data: { memoId: memo_id },
    success: (res) => {
      if (res.result === "success") {
        alert(res.message);
        window.location.reload();
      } else alert(res.message);
    },
    error: () => alert("서버 접근 오류"),
  });
}

function showEditForm(memo_id) {
  // 1. 해당 memo_id의 cardDiv 변수에 저장
  const cardElement = $(`#${memo_id}`);

  // 2. 기존 title , content 갖고오기
  const currentTitle = cardElement.find(".card-title").text();
  const currentContent = cardElement.find(".card-text").text();

  // 질문: .text().trim() 까지 하는 이유는?

  // 3. 그 해당 memoCard의 구성 태그들 숨기기 =>find() , hide()
  cardElement.find(".card-title").hide();
  cardElement.find(".card-text").hide();
  cardElement.find(".card-likes").hide();
  cardElement.find(".delete-button").hide();
  cardElement.find(".like-button").hide();
  cardElement.find(".edit-button").hide();

  // 4. 해당 memoCard의 수정폼 삽입
  //  => 여기에 currentTitle , currentContent를 인자에 전달
  //  이유 : 비교를 위해
  const editFormBox = `
    <form id="memo-update-form" class="my-4">
      <input id="memo-update-title" class="form-control new-title mb-2" value="${currentTitle}">
      <textarea id="memo-update-content" class="form-control new-content mb-2">${currentContent}</textarea>
      <button class="btn btn-success save-button">저장</button>
    </form>
  `;

  $(`#${memo_id}`).append(editFormBox);

  // 5. editFormBox의 form에 수정 API 라우터 핸들러 연결
  $("#memo-update-form").on("submit", (event) => {
    event.preventDefault();

    updateMemo(memo_id, currentTitle, currentContent);
  });
}

function updateMemo(memo_id, oldTitle, oldContent) {
  // 1. 수정폼의 수정된 newTitle , newContent 추출
  const newTitle = $("#memo-update-title").val();
  const newContent = $("#memo-update-content").val();

  // 2. 수정된 내용, 제목 둘중 하나라도 공백이면 중단
  if (!newTitle || !newContent) {
    alert("수정할 제목 및 내용은 필수 입력 항목입니다.");
    return;
  }

  // 3. 기존내용 , 제목 모두 동일하면 중단
  if (newTitle === oldTitle && newContent === oldContent) {
    alert("수정된 내용이 없습니다.");
    return;
  }

  // 4. 검증 끝났으면, API에 값들 전달
  $.ajax({
    type: "POST",
    url: "/memo/update",
    data: {
      memoId: memo_id,
      newTitle: newTitle,
      newContent: newContent,
    },
    success: (res) => {
      if (res.result === "success") {
        alert(res.message);
        window.location.reload();
      } else alert("서버에서 memo 수정을 오류 처리");
    },
    error: () => alert("서버에 접근도 못한 오류"),
  });
}

$(document).ready(() => {
  // form 태그에 registerMemo() 핸들러 등록 방법
  // => 이렇게 등록시,
  //    <button type="submit" class="btn btn-primary" onclick="registerMemo()">저장하기</button>
  // 버튼태그에 registerMemo() 핸들러에 등록할 필요 없다
  $("#memo-form").on("submit", registerMemo);

  // 수정하기 핸들러 등록
  // $("#memo-update-form").on("submit", updateMemo);

  // 페이지 접속시마다, 모든 메모들 출력되도록 하기
  readAllMemos();
});
