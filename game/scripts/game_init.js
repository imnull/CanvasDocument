gd.add('init', function open(g){

	g.levels = [6, 8, 10, -10, 12, -12];

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
		'logo' : 'images/logo12.png',
		'commonbg' : 'images/commonbg.png',
		'play_button' : 'images/play.png',
		'return_button' : 'images/return.png',
		'menu_button' : 'images/menu.png',
		'menu' : 'images/menuList.png',
		'mode_plain' : 'images/mode_plain.png',
		'mode_timer' : 'images/mode_timer.png',
		'mode_endless' : 'images/mode_endless.png',
		'sence_fruit_logo' : 'images/sence_fruit_logo.png',
		'sence_cartoon_logo' : 'images/sence_cartoon_logo.png',
		'sence_letter_logo' : 'images/sence_letter_logo.png',
		'sence_button_left' : 'images/sence_left.png',
		'sence_button_right' : 'images/sence_right.png',
		'sence_fruit_bg' : 'images/sence_fruit_bg.jpg',
		'sence_letter_bg' : 'images/sence_letter_bg.jpg',
		'sence_cartoon_bg' : 'images/sence_cartoon_bg.jpg',
		'level_yellow_bg' : 'images/level_yellow.png',
		'level_green_bg' : 'images/level_green.png',
		'card_cartoon' : 'images/card_cartoon.png',
		'card_letter' : 'images/card_letter.png',
		'card_fruit' : 'images/card_fruit.png',
		'result_border' : 'images/result_outer.png',
		'result_star_gray' : 'images/star_grey.png',
		'result_star_light' : 'images/star_light.png',
		'result_retry' : 'images/result_retry.png',
		'result_next' : 'images/result_next.png',
	})


	g.add('doc', doc);
	g.add('progressBar', bar);
	g.add('resources', rl);

	doc.fit(window);
	doc.draw();
	window.addEventListener('resize', function(){
		doc.fit(window);
		doc.draw();
	})
	window.addEventListener('orientationchange', function () {
		window.scrollTo(0, 1);
		doc.fit(window);
		doc.draw();
	})
}, function close(g){
	g.get('progressBar').set(0);
	gd.open('welcome');
});