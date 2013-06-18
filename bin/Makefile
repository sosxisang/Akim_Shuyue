ROOT=C:\Users\Akim\Documents\Akim_Shuyue\site

all: index tag rss articles

index:
	node process_index.js $(ROOT)
	
tag:
	node process_tag.js $(ROOT)

rss:
	node process_rss.js $(ROOT)

articles:
	node process_articles.js $(ROOT)

clean:
	del $(ROOT)\index.html
	del $(ROOT)\tag.html
	del $(ROOT)\articles\*.html
	del $(ROOT)\pages\*.html
	del $(ROOT)\categories\*.html
