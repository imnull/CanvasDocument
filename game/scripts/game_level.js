gd.add('level', function open(g){
	var doc = g.$('doc');
	var rs = g.$('resources');
	var bg = g.$('index_background_dom');
	bg.image = rs.$('sence_' + g.sence + '_bg').img;

	var bg_yellow = rs.$('level_yellow_bg').img;
	var bg_green = rs.$('level_green_bg').img;



	doc.append(bg);


	for(var i = 0, len = g.levels.length, len2 = len * .5; i < len; i++){
		var panel = doc.createPanel((i % len2) * 150 + 170, Math.floor(i / len2) * 180 + 110, 120, 150);
		panel.config.fillStyle = 'rgba(0,0,0,0)';
		panel.config.strokeStyle = '#000';
		panel.image = bg_yellow;
		panel._value = g.levels[i];
		panel.mousedown(function(){
			g.cardcount = this._value;
			gd.open('playing')
		})
		doc.append(panel);
	}


	doc.append(g.$('return'));
	doc.draw();



}, function close(g){
	console.log('game.level.closed.')
	console.log(g)
});