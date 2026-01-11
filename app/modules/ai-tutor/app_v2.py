from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def index():
    # 渲染主页面
    return render_template("index_v2.html")

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)