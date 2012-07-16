gd.add('welcome', function open(g){
	var doc = g.$('doc');
	var rs = g.$('resources');
	var bgimg = rs.$('index_background').img;
	var buttonimg = rs.$('play_button').img;

	var w = doc.origin.width, h = doc.origin.height;

	//background
	var bg = doc.createPanel(w * .5,h * .5, w, h);
	bg.image = bgimg;

	//board
	var board = doc.createPanel(370, 258, 130, 100);
	board.image = buttonimg;
	board.config.fillStyle = 'rgba(0,0,0,0)';
	board.config.strokeStyle = '#000000';
	//board.config.lineWidth = 2;


	doc.append(bg);
	doc.append(board);
	doc.draw();

	var run_ani = false;
	ani.reg(function(t){
		var s = Math.sin(((t * 5) % 360) * (Math.PI / 180)) * 30;
		board.rotate(s, -0.1, -0.9);
		return run_ani;
	})

	board.mousedown(function(){
		run_ani = true;
		gd.close('welcome');
	})

	g.add('index_background_dom', bg);


}, function close(g){
	//console.log('game.welcome.closed.')
	//console.log(g);
	gd.open('modes');
});