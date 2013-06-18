'use strict';

// 引入必要模块
var fs = require('fs');
var _ = require('underscore');

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
if (fs.existsSync(siteRoot + '/tag.template')) {
    var template = fs.readFileSync(siteRoot + '/tag.template', 'utf8');
    var templateStat = fs.statSync(siteRoot + '/tag.template');
    console.log('[PROCESSING]Read tag template completed.');
} else {
    console.log('[ERROR]Tag template missing.');
    process.exit(1);
}

console.log('[PROCESSING]Generate tag.');
// 根据配置生成tag页面
var t = template;
t = t.replace(/{%= TITLE %}/g, globalConfig.title);
t = t.replace(/{%= SUBTITLE %}/g, globalConfig.subtitle);
t = t.replace(/{%= META_AUTHOR %}/g, globalConfig.meta.author);
t = t.replace(/{%= META_DESC %}/g, globalConfig.meta.description);
t = t.replace(/{%= COPYRIGHT_BEGINYEAR %}/g, globalConfig.copyright.beginYear);
t = t.replace(/{%= COPYRIGHT_ENDYEAR %}/g, globalConfig.copyright.endYear);
t = t.replace(/{%= COPYRIGHT_OWNER %}/g, globalConfig.copyright.owner);
t = t.replace(/{%= COPYRIGHT_ICP %}/g, globalConfig.copyright.ICP);

var m = {};
articlesConfig.articles.forEach(function (article) {
    article.tags.forEach(function (tag) {
        if (! _.has(m, tag)) {
            m[tag] = [];
        }
        m[tag].push(article);
    });
});

var tagCloud = '';
_.keys(m).forEach(function (tag) {
    tagCloud += '<a href="#' + tag + '">' + tag + ' <span class="count">×' + m[tag].length + '</span></a>';
});
t = t.replace(/{%= TAG_CLOUD %}/g, tagCloud);
t = t.replace(/{%= META_KW %}/g, _.keys(m).join(','));

var tagIndex = '';
_.each(m, function (v, k) {
    tagIndex += '<h1><a name="' + k + '">' + k + '</a></h1>';
    v.forEach(function (article) {
        tagIndex += '<p><a href="/articles/' + article.id + '.html">' + article.title + '</a></p>';
    });
});
t = t.replace(/{%= TAG_INDEX %}/g, tagIndex);

fs.writeFileSync(siteRoot + '/tag.html', t);

console.log('Done!');
