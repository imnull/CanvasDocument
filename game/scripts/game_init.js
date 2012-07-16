gd.add('init', function open(g){
	var doc = new CanvasDocument('test');
	var bar = doc.createProgressBar();
	doc.append(bar);
	bar.moveTo(320, 150);
	doc.draw();

	gd.regdoc(doc);
	ani.regdoc(doc);

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
		'index_background' : 'images/index_bg.png',
		'commonbg' : 'images/commonbg.png',
		'play_button' : 'images/play.png',
		'mode_plain' : 'images/mode_plain.png',
		'mode_timer' : 'images/mode_timer.png',
		'mode_endless' : 'images/mode_endless.png'
	})

	g.add('doc', doc);
	g.add('progressBar', bar);
	g.add('resources', rl);

	//doc.fit(window);
	//window.addEventListener('resize', function(){
	//	doc.fit(window);
	//})
}, function close(g){
	g.get('progressBar').set(0);
	gd.open('welcome');
});