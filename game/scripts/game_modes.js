gd.add('modes', function open(g){
	var doc = g.$('doc');
	var rs = g.$('resources');
	var bg = g.$('index_background_dom');
	var commonbg_img = rs.$('commonbg').img;
	bg.image = commonbg_img;

	var mode_plain_img = rs.$('mode_plain').img;
	var mode_timer_img = rs.$('mode_timer').img;
	var mode_endless_img = rs.$('mode_endless').img;

	var mode_plain = doc.createPanel(140, -60, 150, 100);
	mode_plain.image = mode_plain_img;
	mode_plain._name = 'plain';
	var mode_timer = doc.createPanel(320, -60, 150, 100);
	mode_timer.image = mode_timer_img;
	mode_timer._name = 'timer';
	var mode_endless = doc.createPanel(500, -60, 150, 100);
	mode_endless.image = mode_endless_img;
	mode_endless._name = 'endless';

	mode_plain.config.fillStyle =
	mode_timer.config.fillStyle = 
	mode_endless.config.fillStyle = 'rgba(0,0,0,0)';

	function mode_callback(){
		this._ready = true;
		if(!mode_plain._ready || !mode_timer._ready || !mode_endless._ready) return;
		mode_plain._event = mode_plain.mousedown(mode_mousedown);
		mode_timer._event = mode_timer.mousedown(mode_mousedown);
		mode_endless._event = mode_endless.mousedown(mode_mousedown);
	}

	function mode_mousedown(){
		
		var name = this._name;
		switch(name){
			case 'plain':
				mode_plain.removeEvent('mousedown', mode_plain._event);
				mode_timer.removeEvent('mousedown', mode_timer._event);
				mode_endless.removeEvent('mousedown', mode_endless._event);
				break;
			default:
				alert('Not implement');
				break;
		}
		/*
		var _ = this;
		this.$scaleTo(.1, .1, 1000, 'bounce_out', function(){
			_.$scaleTo(2, 2, 1000, 'elastic_in')
		});
		*/
	}

	mode_plain.$moveTo(140, 220, 500, 'back_out', mode_callback);
	mode_timer.$moveTo(320, 220, 600, 'back_out', mode_callback);
	mode_endless.$moveTo(500, 220, 700, 'back_out', mode_callback);

	doc.append(bg);
	doc.append(mode_plain);
	doc.append(mode_timer);
	doc.append(mode_endless);
	doc.draw();

}, function close(g){
	console.log('game.welcome.closed.')
	console.log(g)
});