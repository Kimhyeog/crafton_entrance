from flask import Flask,request,render_template, jsonify

from pymongo import MongoClient

# 해당 id를 찾기 위해 필요한 라이브러리 : string 타입 => ObjectId 타입으로 변경
from bson import ObjectId

client = MongoClient("localhost",27017)

db = client.dbjungle


app = Flask(__name__)


@app.route("/")
def mainPage() :
  return render_template("index.html")

@app.route("/memo",methods=["POST"])
def register_memo() :

  # param의 쿼리에 대한 키값을 post에서 갖고오는 방법 => request.form["속성명"]
  title = request.form["title"]
  content = request.form["content"]

  # 무작정 성공 X => title || content 공백이 있을 경우
  if not title or not content :
    return jsonify({
      "result" : "failure",
      "message" : "제목과 내용은 필수 입력 항목 입니다."
    })
  
  #쿼리의 값 검증 됐다면, => db 저장

  memo = {
    "title" : title,
    "likes" : 0,
    "content" : content
  }

  db.memos.insert_one(memo)

  
  return jsonify({
    "result" : "success",
    "message" : "메모 등록 완료"
  })

@app.route("/memo",methods=["GET"])
def read_All_memos() :

  # 모든 카드들 DB에서 꺼내오기
  # => list(db.컬렉션.find({} , {"_id" :0}))//아이디 제거 (X)
  # => list(db.컬렉션.find({})) // 좋아요 기능을 위해=> id 속성 추가
  # "likes" 속성값의 내림차순 정렬 => sort("likes", -1); 
  memos = list(db.memos.find({}).sort("likes",-1))
  # _id값들의 ObjectId 타입 => 문자열 값으로 변셩
  for memo in memos:
    memo["_id"] = str(memo["_id"])

  if len(memos)== 0 :
    return jsonify({
      "result" : "failure",
      "message" : "현재 저장된 메모가 존재하지 않습니다."
    })

  return jsonify({
    "result" : "success",
    # 모든 메모들 전달
    "memos" : memos,
    "message" : "모든 메모들 갖고오기 성공!"
  })

@app.route("/memo/like", methods=["POST"])
def like_memo() :

  # 1. 클라이언트에서 전달받기
  memoId = request.form["memoId"]
  # 2. 전달받은 memoId가 잘 받아진건지 확인
  if not memoId :
    return jsonify({
      "result" : "failure",
      "message" : "서버에서 memoId를 정상적으로 받지 못했습니다."
    })
  # 3. 잘받았다면, memos 중 해당 id가 있는지 찾기 => 하나만 찾아야 하므로, find_one()
  memo = db.memos.find_one({"_id": ObjectId(memoId)})

  # 4. 해당 memoId로 찾은 id가 없을 시, 오류 반환
  if memo is None :
    return jsonify({
      "result" : "failure",
      "message" : "좋아요를 누를 memo를 찾지 못했습니다."
    })
  # 5. 찾았다면, 해당 memo 좋아요값 수정 => db.memos.update_one()
  newLikes = memo["likes"] + 1

  db.memos.update_one({"_id" : ObjectId(memoId)},{"$set" : {"likes" : newLikes}})

  # 성공 메시지 반환
  return jsonify({
    "result" : "success",
    "message" : "좋아요를 성공했습니다."
  })

@app.route("/memo/delete",methods=["POST"])
def delete_memo() :
  # 1. 클라이언트에서 memoId 받기
  memoId = request.form["memoId"]

  # 2. 받은 memoId가 유효한지 확인
  if not memoId :
    return jsonify({
      "result" : "failure",
      "message" : "서버에서 memoId가 정상적으로 받지 못했습니다."
    })
  
  # 3. 잘 받았다면, 탐색
  memo = db.memos.find_one({"_id" : ObjectId(memoId)})

  # 4. 해당 memo를 찾지 못했다면,
  if memo is None :
    return jsonify({
      "result" : "failure",
      "message" : "서버에서 memoId에 해당되는 memo를 찾지 못했습니다."
    })
  
  # 5. 삭제
  db.memos.delete_one({"_id" : ObjectId(memoId)})
  
  return jsonify({
    "result" : "success",
    "message" : "해당 메모를 삭제하였습니다."
  })

@app.route("/memo/update",methods=["POST"])
def update_memo() :
  memoId = request.form["memoId"]
  newTitle = request.form["newTitle"]
  newContent = request.form["newContent"]
  
  # 1. memoId를 제대로 받지 못했다면,
  if not memoId :
    return jsonify({
    "result" : "failure",
    "message" : "서버에서 memoId를 받지 못했습니다."
    })

  # 2. memoId를 잘 받았다면, 해당 memo를 찾기

  memo = db.memos.find_one({"_id":ObjectId(memoId)})

  # 3. memoId에 해당되는 memo를 찾지 못했다면, => 오류 반환 
  if memo is None : 
    return jsonify({
    "result" : "failure",
    "message" :  "memoId에 해당되는 memo를 찾지 못했습니다."
    })

  # 4. 수정작업
  db.memos.update_one({"_id" : ObjectId(memoId)},{"$set" : {
    "title" : newTitle,
    "content" : newContent 
  }})

  # 5. 클라이언트에게 성공 메시지 전달
  return jsonify({
    "result" : "success",
    "message" : "해당 memo를 수정하였습니다."
  })

if __name__ == "__main__" :
  app.run("0.0.0.0",port=5000,debug=True)