
### 安装
```
npm install http-push-webpack-plugin --save-dev
```

### 配置
```
var HttpPushWebpackPlugin = require('http-push-webpack-plugin');

new HttpPushWebpackPlugin({
    receiver: 'http://host:port/receiver', // 服务端文件上传接口
    token: 'token', // 验证token
    to: '/home/work/xxx' // 上传文件目录
})
```

### 服务端部署
> 使用如下代码，用node启动服务
```node
#!/usr/bin/env node

var http = require('http');
var formidable = require('formidable');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var PORT = parseInt(process.argv[2]) || 8990;

var server = http.createServer(function (req, res) {
    
    function error(err) {
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end(err.toString()); //fail
    }

    function next(from, to) {
        fs.readFile(from, function (err, content) {
            if (err) {
                error(err);
            } else {
                fs.writeFile(to, content, function (err) {
                    if (err) {
                        error(err);
                    }
                    res.writeHead(200, {'Content-Type': 'text/plain'});
                    res.end('0'); //success
                });
            }
        });
    }

    if (req.url == '/') {
        // show a file upload form
        res.writeHead(200, {'content-type': 'text/html'});
        res.end('I\'m ready for that, you know.');
    } else if (req.url == '/receiver' && req.method.toLowerCase() == 'post') {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) {
                error(err);
            } else {
                var to = fields['to'];
            		var token = fields['token'];
            		if (token !== '/**** 填写约定的token值 ***/'){
            			error('密码错误');
            			return;
            		}
	
                fs.exists(to, function (exists) {
                    if (exists) {
                        fs.unlink(to, function (err) {
                            next(files.file.path, to); 
                        });
                    } else {
                        fs.exists(path.dirname(to), function (exists) {
                            if (exists) {
                                next(files.file.path, to); 
                            } else {
                                mkdirp(path.dirname(to), 0777, function (err) {
                                    if (err) {
                                        error(err);
                                        return;
                                    }
                                    next(files.file.path, to); 
                                });
                            }
                        });
                    }
                });
            }
        });
    }
});

server.listen(PORT, function () {
    console.log('receiver listening *:' + PORT);
});
```
