'use strict';

// 引入必要模块
var fs = require('fs');
var marked = require('marked');

// 读取配置信息
var siteRoot = process.argv[2];
if (fs.existsSync(siteRoot + '/site.json') && fs.existsSync(siteRoot + '/articles/articles.json')) {
    var globalConfig = require(siteRoot + '/site.json');
    var articlesConfig = require(siteRoot + '/articles/articles.json');
} else {
    console.log('[ERROR]Config files missing.');
    process.exit(1);
}

// 检测并读取模板文件
if (fs.existsSync(siteRoot + '/articles/articles.template')) {
    var template = fs.readFileSync(siteRoot + '/articles/articles.template', 'utf8');
    var templateStat = fs.statSync(siteRoot + '/articles/articles.template');
    console.log('[PROCESSING]Read article template completed.');
} else {
    console.log('[ERROR]Article template missing.');
    process.exit(1);
}

// 生成Last Update时间
var d = new Date;
var yyyy = d.getFullYear().toString();
var mm = (d.getMonth() + 1).toString();
if (mm.length === 1) {
    mm = '0' + mm;
}
var dd = d.getDate().toString();
if (dd.length === 1) {
    dd = '0' + dd;
}
var updatedOn = yyyy + '-' + mm + '-' + dd;

// 根据配置生成文章html页面
articlesConfig.articles.forEach(function (article) {
    console.log('[PROCESSING]Generate article: ' + article.id + '.');
    var ext = '';
    if (fs.existsSync(siteRoot + '/articles/' + article.id + '.html.text')) {
        ext = 'html';
    } else if (fs.existsSync(siteRoot + '/articles/' + article.id + '.markdown.text')) {
        ext = 'markdown';
    }
    if (ext !== '') {
        // 只生成text文件mtime或模板文件的mtime晚于html文件mtime的文章
        var text = fs.readFileSync(siteRoot + '/articles/' + article.id + '.' + ext + '.text', 'utf8');
        var textStat = fs.statSync(siteRoot + '/articles/' + article.id + '.' + ext + '.text');

        if (ext === 'markdown') {
            text = marked(text);
        }

        var skip = false;
        if (fs.existsSync(siteRoot + '/articles/' + article.id + '.html')) {
            var htmlStat = fs.statSync(siteRoot + '/articles/' + article.id + '.html');
            if (htmlStat.mtime.getTime() > templateStat.mtime.getTime() && 
                htmlStat.mtime.getTime() > textStat.mtime.getTime()) {
                skip = true;
                console.log('[PROCESSING]Not modified.');
            }
        }

        if (skip === false) {
            var t = template;
            t = t.replace(/{%= TITLE %}/g, globalConfig.title);
            t = t.replace(/{%= META_AUTHOR %}/g, globalConfig.meta.author);
            t = t.replace(/{%= META_KW %}/g, globalConfig.meta.keywords.join(','));
            t = t.replace(/{%= META_DESC %}/g, article.abstract);
            t = t.replace(/{%= SUBTITLE %}/g, globalConfig.subtitle);
            t = t.replace(/{%= ARTICLE_TITLE %}/g, article.title);
            t = t.replace(/{%= ARTICLE_AUTHOR %}/g, article.author);
            t = t.replace(/{%= ARTICLE_POSTED_ON %}/g, article.postedOn);
            t = t.replace(/{%= ARTICLE_UPDATED_ON %}/g, updatedOn);
            t = t.replace(/{%= ARTICLE_LINK %}/g, '/articles/' + article.id + '.html');
            t = t.replace(/{%= ARTICLE_CONTENT %}/g, text);
            t = t.replace(/{%= COPYRIGHT_BEGINYEAR %}/g, globalConfig.copyright.beginYear);
            t = t.replace(/{%= COPYRIGHT_ENDYEAR %}/g, globalConfig.copyright.endYear);
            t = t.replace(/{%= COPYRIGHT_OWNER %}/g, globalConfig.copyright.owner);
            t = t.replace(/{%= COPYRIGHT_ICP %}/g, globalConfig.copyright.ICP);

            var tags = '';
            article.tags.forEach(function (tag) {
                tags += '<a class="tag" href="/tag.html#' + tag + '">' + tag + '</a>';
            });
            t = t.replace(/{%= ARTICLE_TAGS %}/g, tags);

            fs.writeFileSync(siteRoot + '/articles/' + article.id + '.html', t);
            console.log('[PROCESSING]Completed.');
        }
    } else {
        console.log('[PROCESSING]No text file.');
    }
}); 

console.log('Done!');
