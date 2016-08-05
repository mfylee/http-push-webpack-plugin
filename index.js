/**
 * @author lifayu
 * @since 16/8/5
 */

var fs = require('fs');
var path = require('path');
var u = require('underscore');
var request = require('request');
var log = require('log-util');
var chalk = require('chalk');

function upload(url, data, content, subpath, callback) {
    var formData = u.extend(data, {
        file: {
            value: content,
            options: {
                filename: subpath
            }
        }
    });
    request.post({
        url: url,
        formData: formData
    }, function (err, res, body) {
        if (err) {
            callback(err);
            return;
        }
        callback();
    })
}

/**
 * http上传插件
 *
 * @param options
 * @param options.receiver
 * @param options.to
 * @param options.token
 *
 * @constructor
 */
function HttpPushWebpackPlugin(options) {
    this.options = options;
}

HttpPushWebpackPlugin.prototype.apply = function (compiler) {
    var me = this;
    if (compiler) {
        compiler.plugin('after-emit', function(data, cb) {
            me.upload(data, cb);
        });
    }
};

HttpPushWebpackPlugin.prototype.upload = function (compilation, cb) {
    var assets = compilation.assets;
    var opt = this.options;
    u.each(assets, function (item, filename) {
        var content = fs.readFileSync(item.existsAt, 'utf8');
        var subpath = path.basename(filename);
        upload(opt.receiver, {
            token: opt.token,
            to: opt.to + '/' + filename
        }, content, subpath, function (err, res) {
            if (err) {
                log.error(filename + ' - ' + chalk.red('[error] [' + err + ']'));
            }
            else {
                log.info(filename +  chalk.green(' [DONE]'));
            }
        })
    });
    cb();
};

module.exports = HttpPushWebpackPlugin;