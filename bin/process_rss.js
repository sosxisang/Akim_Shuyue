'use strict';

// 引入必要模块
var fs = require('fs');
var moment = require('moment');
var marked = require('marked');

// 读取配置信息
var siteRoot = process.argv[2];
if (fs.existsSync(siteRoot + '/site.json') && 
    fs.existsSync(siteRoot + '/articles/articles.json')) { 

    var globalConfig = require(siteRoot + '/site.json');
    var articlesConfig = require(siteRoot + '/articles/articles.json');
} else {
    console.log('[ERROR]Config files missing.');
    process.exit(1);
}

// 检测并读取模板文件
if (fs.existsSync(siteRoot + '/rss.template')) {
    var template = fs.readFileSync(siteRoot + '/rss.template', 'utf8');
    var templateStat = fs.statSync(siteRoot + '/rss.template');
    console.log('[PROCESSING]Read rss template completed.');
} else {
    console.log('[ERROR]Rss template missing.');
    process.exit(1);
}

console.log('[PROCESSING]Generate rss.');
// 根据配置生成rss feed
var t = template;
t = t.replace(/{%= TITLE %}/g, globalConfig.rss.title);
t = t.replace(/{%= LINK %}/g, globalConfig.link);
t = t.replace(/{%= DESC %}/g, globalConfig.rss.desc);
t = t.replace(/{%= LAST_BUILD_DATE %}/g, moment().format('ddd, DD MMM YYYY') + ' 00:00:00 GMT');
t = t.replace(/{%= LANG %}/g, globalConfig.rss.lang);

var items = '';
articlesConfig.articles.slice(0, globalConfig.rss.max).forEach(function (article) {
    items += '<item>\n';
    items += '<title>' + article.title + '</title>\n';
    items += '<link>' + globalConfig.link + '/articles/' + article.id + '.html</link>\n';
    items += '<guid>' + globalConfig.link + '/articles/' + article.id + '.html</guid>\n';
    items += '<author>' + globalConfig.master.email + ' ' + globalConfig.master.name + '</author>\n';
    items += '<pubDate>' + moment(article.postedOn).format('ddd, DD MMM YYYY HH:mm:ss') + ' GMT</pubDate>\n';

    var content = '';
    if (fs.existsSync(siteRoot + '/articles/' + article.id + '.html.text')) {
        content = fs.readFileSync(siteRoot + '/articles/' + article.id + '.html.text', 'utf8');
    } else if (fs.existsSync(siteRoot + '/articles/' + article.id + '.markdown.text')) {
        content = fs.readFileSync(siteRoot + '/articles/' + article.id + '.markdown.text', 'utf8');
        content = marked(content);
    }

    content = content.replace(/&(?!\w+;)/g, '&amp;')
                     .replace(/</g, '&lt;')
                     .replace(/>/g, '&gt;')
                     .replace(/"/g, '&quot;');

    items += '<description>' + content + '</description>\n';
    items += '</item>\n';
});
t = t.replace(/{%= ITEMS %}/g, items);

fs.writeFileSync(siteRoot + '/rss.xml', t);

console.log('Done!');
