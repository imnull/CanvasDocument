gd.add('sence', function open(g){
	var doc = g.$('doc');
	var rs = g.$('resources');
	var bg = g.$('index_background_dom');
	var commonbg_img = rs.$('commonbg').img;
	bg.image = commonbg_img;

	var w = doc.origin.width, h = doc.origin.height;
	var sence = doc.createPanel(w * .5, h * .5, 280, 230);
	var left = doc.createPanel(w * .1, h * .5, 100, 150);
	var right = doc.createPanel(w * .9, h * .5, 100, 150);
	var logos = [
		rs.$('sence_fruit_logo').img,
		rs.$('sence_letter_logo').img,
		rs.$('sence_cartoon_logo').img
	];
	var sences = [ 'fruit', 'letter', 'cartoon' ];
	var logo_index = 0;

	sence.image = logos[logo_index];
	left.image = rs.$('sence_button_left').img;
	right.image = rs.$('sence_button_right').img;

	var return_button = doc.createPanel(20, 17, 30, 30);
	return_button.image = rs.$('return_button').img;

	return_button.config.fillStyle =
	left.config.fillStyle =
	right.config.fillStyle =
	sence.config.fillStyle = 'rgba(0,0,0,0)';

	g.sence = sences[logo_index];
	var animation_run = false;
	left.mousedown(function(){
		if(animation_run) return;
		animation_run = true;
		sence.$moveTo(w + sence.config.width, sence.config.y, 300, 'quart_in', function(){
			logo_index = (logo_index + logos.length - 1) % logos.length;
			sence.image = logos[logo_index];
			g.sence = sences[logo_index];
			sence.moveTo(-sence.config.width, sence.config.y);
			sence.$moveTo(w * .5, sence.config.y, 200, 'quart_out', function(){
				animation_run = false;
			})
		})
	})
	right.mousedown(function(){
		if(animation_run) return;
		animation_run = true;
		sence.$moveTo(-sence.config.width, sence.config.y, 300, 'quart_in', function(){
			logo_index = (logo_index + 1) % logos.length;
			sence.image = logos[logo_index];
			g.sence = sences[logo_index];
			sence.moveTo(w + sence.config.width, sence.config.y);
			sence.$moveTo(w * .5, sence.config.y, 200, 'quart_out', function(){
				animation_run = false;
			})
		})
	})
	sence.mousedown(function(){
		gd.open('level');
	})
	return_button.mousedown(function(){
		switch(gd.pagename){
			case 'sence':
				gd.open('modes');
				break;
			case 'level':
				gd.open('sence');
				break;
			case 'playing':
				gd.open('level');
				break;
		}
	})

	doc.append(bg);
	doc.append(sence);
	doc.append(left);
	doc.append(right);
	doc.append(return_button);
	doc.draw();

	if(!g.has('return')){
		g.add('return', return_button);
	}

}, function close(g){
	console.log('game.sence.closed.')
	console.log(g)
});