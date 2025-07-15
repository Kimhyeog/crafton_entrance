from flask import Flask,request,render_template, jsonify

# request : API 라우터로 받은 데이터 처리를 위한 객체
# josnify : API 응답값 전달을 위한 객체

from pymongo import MongoClient

# mongodb 갖고오기
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
    "content" : content
  }

  db.memos.insert_one(memo)

  
  return jsonify({
    "result" : "success",
    "message" : "메모 등록 완료"
  })

if __name__ == "__main__" :
  app.run("0.0.0.0",port=5000,debug=True)