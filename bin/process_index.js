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
if (fs.existsSync(siteRoot + '/index.template')) {
    var template = fs.readFileSync(siteRoot + '/index.template', 'utf8');
    var templateStat = fs.statSync(siteRoot + '/index.template');
    console.log('[PROCESSING]Read index template completed.');
} else {
    console.log('[ERROR]Index template missing.');
    process.exit(1);
}

console.log('[PROCESSING]Generate index.');
// 根据配置生成index页面
var t = template;
t = t.replace(/{%= TITLE %}/g, globalConfig.title);
t = t.replace(/{%= SUBTITLE %}/g, globalConfig.subtitle);
t = t.replace(/{%= META_AUTHOR %}/g, globalConfig.meta.author);
t = t.replace(/{%= META_DESC %}/g, globalConfig.meta.description);
t = t.replace(/{%= ABOUT_ME %}/g, globalConfig.master.about);
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
    //首页只展示数量大于2的Tag
    if (m[tag].length >= 2) {
        tagCloud += '<a href="/tag.html#' + tag + '">' + tag + ' <span class="count">×' + m[tag].length + '</span></a>';
    }
});
t = t.replace(/{%= TAG_CLOUD %}/g, tagCloud);
t = t.replace(/{%= META_KW %}/g, _.keys(m).join(','));

var articleBlocks = '';
articlesConfig.articles.forEach(function (article) {
    //生成Tags
    var tags = '';
    article.tags.forEach(function (tag) {
        tags += '<a class="tag" href="/tag.html#' + tag + '">' + tag + '</a>';
    });

    articleBlocks += '<div class="article-block">';
    articleBlocks += '<p class="title"><a href="/articles/' + article.id + '.html">' + article.title + '</a></p>';
    articleBlocks += '<p class="abstract">&lt;摘要&gt;: ' + article.abstract + '</p>';
    articleBlocks += '<p class="meta">作者 ' + article.author + ' | 发布于 ' + article.postedOn + ' | Tags ' + tags + '</p>';
    articleBlocks += '</div>';
});
t = t.replace(/{%= ARTICLES %}/g, articleBlocks);

fs.writeFileSync(siteRoot + '/index.html', t);

console.log('Done!');
