const path = require('path')
const databasetool = require(path.join(__dirname, "../tools/databasetool.js"));
const captchapng = require('captchapng')

/**
 * module.exports = {
 *  getRegisterPage:箭头函数
 * }
 * 导出的一个方法，该方法获取注册页面
 */
exports.getRegisterPage = (req,res) => {
    // 内部就是对 fs.readFile 的封装
    res.sendFile(path.join(__dirname,"../public/views/register.html"))
}

/**
 * 导出的注册方法
*/
exports.register = (req,res) => {
    const result = {
        status: 0,
        message: '注册成功'
    }
    // 1.拿到浏览器传输过来的数据(body-parser ===> app.js)
    const {username} = req.body
    
    // 2.先判断数据中用户名,是否存在,如果存在返回提示
    // Use connect method to connect to the server
    databasetool.findYige("accountInfo", { username }, (err, doc) => {
        // 如果result == null 没有查询到，就可以插入，如果查询到了，说明用户名已经存在
        if (doc) {
            // 存在
            result.status = 1;
            result.message = "用户名已经存在";
    
            // 返回
            res.json(result);
        } else {
            databasetool.insertSingle("accountInfo", req.body, (err, result2) => {
            if (!result2) {
              // 失败
                result.status = 2;
                result.message = "注册失败";
            }
    
            // 返回
            res.json(result);
            });
        }
    });
}

// 导出获取登录页面的方法
exports.getLoginPage = (req,res) => {
    res.sendFile(path.join(__dirname,"../public/views/login.html"))
}

// 导出获取验证码的方法
exports.getVcodeImage = (req, res) => {
    const vcode = parseInt(Math.random() * 9000 + 1000);
    // 把vcode保存到session对象中去，方便将来登录
    req.session.vcode = vcode
    console.log(req.session.vcode)
    var p = new captchapng(80, 30, vcode); // width,height,numeric captcha
    p.color(0, 0, 0, 0); // First color: background (red, green, blue, alpha)
    p.color(80, 80, 80, 255); // Second color: paint (red, green, blue, alpha)
  
    var img = p.getBase64();
    // var imgbase64 = new Buffer(img, "base64");
    var imgbase64 = Buffer.from(img, "base64");
    res.writeHead(200, {
        "Content-Type": "image/png"
    });
    res.end(imgbase64);
}

// 导出登录的方法
exports.login = (req,res) => {
    const result = {
        status: 0,
        message: "登录成功"
    }
    // 把浏览器传递过来的验证码 和 req.session.vcode 中的验证码对比
    const {username,password,vcode} = req.body
    console.log(vcode,req.session.vcode)
    //验证验证码
    if (vcode != req.session.vcode) {
        result.status = 1
        result.message = "验证码错误"

        res.json(result)
        return
    }

    // 验证码正确了
    // Use connect method to connect to the server
    databasetool.findYige("accountInfo", { username, password }, (err, doc) => {
        // 这里的代码，要等到databasetool中的callback执行的时候，才会执行
        // 那边会把 err和doc传递过来
        if (!doc) {
            result.status = 2;
            result.message = "用户名或是密码错误";
        }
    
        res.json(result);
    });
}