var webot = require('webot');
var Webot = webot.Webot;
var Info = webot.Info;
var wechat = require('wechat');

// convert weixin props to
// more human readable names
var pmap = {
    FromUserName: 'uid'
  , ToUserName: 'sp'
  , CreateTime: 'createTime'
  , MsgId: 'id'
  , MsgType: 'type'
  , Content: 'text'
};
var mmap = {
    Location_X: 'lat'
  , Location_Y: 'lng'
  , Scale: 'scale'
  , Label: 'label'
  , PicUrl: 'picUrl'
  , Event: 'event'
  , EventKey: 'eventKey'
  , Url: 'url'
  , Title: 'title'
  , Description: 'description'
};

function normInfo(original) {
  var param = {};
  var data = {
    original: original,
    param: param
  };

  var key, val;
  for (key in original) {
    val = original[key];
    if (key in pmap) {
      data[pmap[key]] = val;
    } else if (key in mmap) {
      param[mmap[key]] = val;
    } else {
      // 不知如何处理的参数会直接附在 data 上
      data[key] = val;
    }
  }
  data.created = new Date(parseInt(original.CreateTime, 10) * 1000);
  return Info(data);
}

// keep the original watch method private,
// but accessible.
Webot.prototype._watch = Webot.prototype.watch;

Webot.prototype.watch = function(app, options) {
  options = options || {};

  if (typeof options === 'string') {
    options = {
      token: options
    };
  }

  var self = this;
  app.use(options.path || '/', wechat(options.token, function(req, res, next) {
    var info = normInfo(req.weixin);
    info.session = req.wxsession;
    self.reply(info, function(err, info) {
      var reply = info.reply;
      if (typeof reply === 'object' && !reply.type && !Array.isArray(reply)) {
        reply = [reply];
      }
      res.reply(reply, info.flag);
    });
  }));
};

/**
 * Legacy API support.
 */
//webot.Info.prototype.toXML = function() {
  //this.flag = this.flag || 0;
  //return wechat.info2xml(this);
//};

module.exports = webot;
module.exports.wechat = wechat;
