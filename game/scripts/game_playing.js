gd.add('playing', function open(g){
	var doc = g.$('doc');
	var rs = g.$('resources');
	var bg = g.$('index_background_dom');
	bg.image = rs.$('sence_' + g.sence + '_bg').img;
	var img = rs.$('card_' + g.sence).img;
	var logo = rs.$('logo').img;
	var prog = doc.createProgressBar();
	prog.moveTo(320, 380);

	doc.append(bg);

	var map = cardMaps[g.sence].slice(0);
	var c = g.cardcount / 2;
	var H = fitMul(g.cardcount);
	var s = cardSize(H, g.cardcount / H, doc);
	var waitms = c * 1000;

	var cards = [];
	for(var i = 0; i < c; i++){
		var maplen = map.length;
		var idx = Math.floor(maplen * Math.random()) % maplen;
		var _map = map[idx];
		var card = doc.createRoundPanel(-s.width, -s.height, s.width * .9, s.height * .9);
		var card2 = doc.createRoundPanel(-s.width, -s.height, s.width * .9, s.height * .9);
		card.image = card2.image = img;
		card.group = card2.group = i;
		card.config.fillStyle = 
		card2.config.fillStyle = 'rgba(255,255,255,1)';
		card._coord = 
		card2._coord = 
		card.config.imageCoord = 
		card2.config.imageCoord = { x : _map[0], y : _map[1], width : 180, height : 240 }
		card.config.imageCoord.offsetX = s.width * .9 * (1 - 1 / 1.3) * .5;
		card2.config.imageCoord.offsetX = s.width * .9 * (1 - 1 / 1.3) * .5;
		card._back = card2._back = logo;
		card._face = card2._face = img;
		cards.push(card);
		cards.push(card2);
		card._allok = card2._allok = function(){
			return every(cards, function(c){ return !!c._in; });
		}
		card.$in = card2.$in = cardin;

		map.splice(idx, 1);
	}
	
	arrayChaos(cards);

	each(cards, function(card, i){
		var x = (i % H) * s.width + s.left;
		var y = Math.floor(i / H) * s.height + s.top
		card.$in(x, y, 720, 1500, i * 80, waitProg);
		doc.append(card);
	})

	function waitProg(){
		doc.append(prog);
		ani.reg(function(s, i){
			prog.set(i, waitms);
			if(i >= waitms){
				doc.remove(prog);
				return true;
			}
		})
	}

	var w = fitMul(g.cardcount);


	doc.append(g.$('return'));
	doc.draw();



}, function close(g){
	console.log('game.level.closed.')
	console.log(g)
});

function each(arr, callback){
	var i = 0, len = arr.length;
	for(; i < len; i++){
		if(callback(arr[i], i, arr)) break;
	}
}

function every(arr, callback){
	var b = true;
	each(arr, function(a, i){
		if(!callback(a, i)){
			b = false;
			return true;
		}
	})
	return b;
}

function cardin(x, y, a, dur, predelay, callback, mx, my, ma){
	var _ = this;
	var X = _.config.x;
	var Y = _.config.y;
	var dx = x - X;
	var dy = y - Y;
	var step = ani.S(dur || 500);
	var fx = twe[mx || 'back_out'];
	var fy = twe[my || 'bounce_out'];
	var fa = twe[my || 'linear'];
	var one = Math.PI / 180;
	a = a || 0;
	var fn = function(){
		ani.reg(function(c){
			_.moveTo(fx(c, X, dx, step), fy(c, Y, dy, step));
			var scaleX = Math.cos(fa(c, 0, a, step) * one);
			if(scaleX <= 0){
				_.image = _._back;
				delete _.config.imageCoord;
			} else {
				_.image = _._face;
				_.config.imageCoord = _._coord;
			}
			_.scale(scaleX, 1);
			if(c >= step){
				_._in = true;
				if(_._allok() && typeof callback === 'function'){
					callback();
				}
				return true;
			}
		})
	}
	predelay = predelay || 0;
	if(predelay > 0){
		var h = setTimeout(fn, predelay);
	} else {
		fn();
	}
}

/*
 * 根据横纵数量适配卡片位置
 */
function cardSize(H, V, doc){
	var _w = doc.origin.width, _h = doc.origin.height;
	var rate = _w / _h;
	var RATE = H / V;
	var w, h, left, top;
	if(RATE > rate){
		w = _w * .8 / H;
		h = w * 1.0;
	} else {
		h = _h * .8 / V;
		w = h / 1.0;
	}
	left = (_w - w * H + w) * .5;
	top = (_h - h * V + h) * .5;
	return {
		width : w, height : h, left: left, top: top
	}
}

function arrayChaos(arr){
	arr.sort(function(a, b){
		return Math.random() >= 0.5;
	})
}

/*
 * 得到卡片矩阵尺寸
 */
function fitMul(c){
	var a = Math.floor(Math.sqrt(c));
	while(c % a > 0) a--;
	return c / a;
}


/*
 * 三个主题场景图片的坐标
 * 宽高默认 180 * 240,所以不做记录。
 */
var cardMaps = {
	cartoon : [
		[0, 0],	[180, 0], [360, 0], [540, 0], [720, 0],
		[0, 240], [180, 240], [360, 240], [540, 240], [720, 240],
		[0, 480], [180, 480], [360, 480], [540, 480], [720, 480],
		[0, 720], [180, 720], [360, 720], [540, 720], [720, 720],
		[0, 960], [180, 960], [360, 960], [540, 960], [720, 960],
		[0, 1200], [180, 1200], [360, 1200], [540, 1200], [720, 1200]
	],
	fruit : [
		[0, 0],	[180, 0], [360, 0], [540, 0], [720, 0],
		[0, 240], [180, 240], [360, 240], [540, 240], [720, 240],
		[0, 480], [180, 480], [360, 480], [540, 480], [720, 480],
		[0, 720], [180, 720], [360, 720], [540, 720], [720, 720],
		[0, 960], [180, 960]//, [360, 960], [540, 960], [720, 960],
		//[0, 1200], [180, 1200], [360, 1200], [540, 1200], [720, 1200]
	],
	letter : [
		[0, 0],	[180, 0], [360, 0], [540, 0], [720, 0],
		[0, 240], [180, 240], [360, 240], [540, 240],// [720, 240],
		[0, 480], [180, 480], [360, 480],// [540, 480], [720, 480],
		[0, 720], [180, 720], [360, 720], [540, 720], [720, 720],
		[0, 960], [180, 960], [360, 960], [540, 960],// [720, 960],
		[0, 1200], [180, 1200], [360, 1200], [540, 1200], [720, 1200]
	]
}