gd.add('init', function open(g){
	var doc = new CanvasDocument('test');
	var bar = doc.createProgressBar();
	doc.append(bar);
	bar.moveTo(320, 150);
	doc.draw();

	var rl = new ResourceLoader();
	rl.onload = function(r){
		gd.close('init');
	}
	rl.onloading = function(c, t){
		bar.set(c, t);
		doc.draw();
	}
	rl.onerror = function(name, url){
		console.log('ERROR : Resource load failed. [' + name + ' : ' + url + ']');
	}

	rl.load({
		'baidu' : 'http://www.baidu.com/img/baidu_sylogo1.gif',
		'test1' : 'https://www.google.com.hk/logos/2012/klimt12-sr.png',
		'test2' : 'http://img.xptheme.com.cn/allimg/090425/0242560.jpg',
		'test3' : 'http://www.guilin98.com/upfile/route/2006/07/10/d9414183690.jpg',
		'test4' : 'http://img2.fengniao.com/product/19/649/ceQ4nfaPUF8Wg.jpg',
		'test5' : 'http://www.djy.gov.cn/upload/20090116_110316_136.jpg',
		'test6' : 'http://img.ivsky.com/Photo/UploadFiles/2010-6/201063113215692.jpg',
		'test7' : 'http://img.wallpapersking.com/d5/0/3/2006110909330234382.jpg',
		'test8' : 'http://img.ivsky.com/img/bizhi/img/201009/04/xinjiang-028.jpg',
		'test9' : 'http://www.51766.com/img/shlycsgn/1322706429715.jpg',
		'test10' : 'http://pic2.nipic.com/20090408/2137336_070710069_2.jpg',
		'test11' : 'http://photo.aiutrip.com/pic/2009-11-14/155810162.jpg'
	})

	g.add('doc', doc);
	g.add('progressBar', bar);
	g.add('resources', rl);
}, function close(g){
	g.get('progressBar').set(0);
	g.get('doc').clear();
	g.get('doc').draw();
	console.log('game.init.closed.')
	console.log(g)
});