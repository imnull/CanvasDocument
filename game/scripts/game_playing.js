gd.add('playing', function open(g){
	g.sence = g.sence || 'fruit';
	g.cardcount = g.cardcount || 6;

	var doc = g.$('doc');
	var rs = g.$('resources');
	var bg = g.$('index_background_dom') || doc.createPanel(320, 200, 640, 400);
	bg.image = rs.$('sence_' + g.sence + '_bg').img;
	var img = rs.$('card_' + g.sence).img;
	var logo = rs.$('logo').img;
	var prog = doc.createProgressBar();
	prog.moveTo(320, 380);

	var mask = doc.createPanel(320, 200, 640, 400);
	mask.config.fillStyle = 'rgba(0,0,0,.5)';

	var menu = doc.createPanel(320, 190, 350, 240);
	menu.image = rs.$('menu').img;
	menu.config.fillStyle = 'rgba(0,0,0,0)';


	var menubutton = doc.createPanel(620, 20, 25, 30);
	menubutton.image = rs.$('menu_button').img;
	menubutton.config.fillStyle = 'rgba(0,0,0,0)';



	var b1 = doc.createPanel(318, 133, 155, 38);
	var b2 = doc.createPanel(318, 186, 155, 38);
	var b3 = doc.createPanel(318, 242, 155, 38);
	b1.config.fillStyle = 'rgba(0,0,0,0)';
	b2.config.fillStyle = 'rgba(0,0,0,0)';
	b3.config.fillStyle = 'rgba(0,0,0,0)';

	b1.mousedown(function(){
		gd.open('modes');
	})
	b2.mousedown(function(){
		gd.open('level');
	})
	b3.mousedown(function(){
		doc.remove(mask);
		doc.remove(menu);
		doc.remove(b1);
		doc.remove(b2);
		doc.remove(b3);
		doc.draw();
	})

	menubutton.mousedown(function(){
		doc.append(mask);
		doc.append(menu);
		doc.append(b1);
		doc.append(b2);
		doc.append(b3);
		doc.draw();
	});

	doc.append(bg);

	var rotate = false;
	if(g.cardcount < 0){
		g.cardcount = -g.cardcount;
		rotate = true;
	}
	var map = cardMaps[g.sence].slice(0);
	var c = Math.abs(g.cardcount) / 2;
	var H = fitMul(g.cardcount);
	var s = cardSize(H, g.cardcount / H, doc);
	var waitms = c * 1000 * 1;

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
		card.config.imageCoord = { x : _map[0], y : _map[1], width : 180, height : 240 };
		card2._coord = 
		card2.config.imageCoord = { x : _map[0], y : _map[1], width : 180, height : 240 }
		card.config.imageCoord.offsetX = s.width * .9 * (1 - 1 / 1.3) * .5;
		card2.config.imageCoord.offsetX = s.width * .9 * (1 - 1 / 1.3) * .5;
		if(rotate){
			card.config.imageCoord.angle = 90 * (Math.floor(100 * Math.random()) % 4);
			card2.config.imageCoord.angle = 90 * (Math.floor(100 * Math.random()) % 4);
		}
		card._back = card2._back = logo;
		card._face = card2._face = img;
		cards.push(card);
		cards.push(card2);
		card._allok = card2._allok = function(state){
			return every(cards, function(c){ return c._state === state; });
		}
		card.$in = card2.$in = cardin;
		card.$fall = card2.$fall = cardfall;
		card.$turn = card2.$turn = cardturn;
		card.id = card2.id = i;

		map.splice(idx, 1);
	}
	
	arrayChaos(cards, rotate);

	each(cards, function(card, i){
		var x = (i % H) * s.width + s.left;
		var y = Math.floor(i / H) * s.height + s.top
		card.$in(x, y, 720, 1500, i * 80, waitProg, 1);
		doc.append(card);
	})

	//记牌时间
	function waitProg(){
		doc.append(prog);
		ani.reg(function(s, i){
			prog.set(i, waitms);
			if(i >= waitms){
				doc.remove(prog);
				turnBack();
				return true;
			}
		})
	}

	//翻转到背面
	function turnBack(){
		each(cards, function(card, i){
			card.$turn(0, 180, 500, 0, startGame, 2);
		})
	}

	var pairA = null;
	var pairB = null;
	function startGame(){

		doc.append(menubutton);

		each(cards, function(card){
			card.evtkey = card.mousedown(manturncard);
		})
	}

	function compair(){
		if(pairA.id === pairB.id){
			pairA.$in(0, -pairA.config.height, 0, 500, 0, function(){
				doc.remove(this);
				pairA = null;
				//if(!cards.length) alert(0)
			});
			pairB.$in(0, -pairB.config.height, 0, 500, 0, function(){
				doc.remove(this);
				pairB = null
				//if(!cards.length) alert(0)
			});
			var idx
			idx = cards.indexOf(pairA);
			cards.splice(idx, 1);
			idx = cards.indexOf(pairB);
			cards.splice(idx, 1);

		} else {
			var okA = false, okB = false;
			pairA.$fall(800, 0, function(){
				okA = true;
				if(okA && okB){
					pairA = pairB = null;
				}
			});
			pairB.$fall(800, 0, function(){
				okB = true;
				if(okA && okB){
					pairA = pairB = null;
				}
			});
		}
	}

	function manturncard(){
		if(pairA && pairB) return;
		var _ = this;
		if(!pairA){
			pairA = _;
		} else if(!pairB) {
			if(pairA === _) return;
			pairB = _;
		}
		_.$turn(180, 360, 500, 0, function(){
			_.state = 11;
			if(pairA && pairB && pairA.state === 11 && pairB.state === 11){
				pairA.state = pairB.state = 5;
				compair();
			}
		});
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

function cardturn(a1, a2, dur, predelay, callback, checkstate){
	var _ = this;
	var step = ani.S(dur || 500);
	var fa = twe['linear'];
	var one = Math.PI / 180;
	var da = a2 - a1;
	var fn = function(){
		ani.reg(function(c){
			var scaleX = Math.cos(fa(c, a1, da, step) * one);
			if(scaleX <= 0){
				_.image = _._back;
				delete _.config.imageCoord;
			} else {
				_.image = _._face;
				_.config.imageCoord = _._coord;
			}
			_.scale(scaleX, 1);
			if(c >= step){
				if(typeof checkstate === 'number'){
					_._state = checkstate;
					if(_._allok(checkstate) && typeof callback === 'function'){
						callback();
					}
				} else if(typeof callback === 'function') {
					callback.call(_);
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
 * 卡片入场动画
 */
function cardin(x, y, a, dur, predelay, callback, checkstate, mx, my, ma){
	var _ = this;
	var X = _.config.x;
	var Y = _.config.y;
	var dx = typeof x === 'number' ? x - X : 0;
	var dy = typeof y === 'number' ? y - Y : 0;
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
				if(typeof checkstate === 'number'){
					_._state = checkstate;
					if(_._allok(checkstate) && typeof callback === 'function'){
						callback();
					}
				} else if(typeof callback === 'function'){
					callback.call(_);
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
 * 卡片翻错的动作
 */
function cardfall(dur, predelay, callback){
	var _ = this;
	_.config.fillStyle = 'rgba(255, 0, 0, .5)';
	var fn = function(){
		_.$scaleTo(.8, .8, dur, 'bounce_out', function(){
			var h = setTimeout(function(){
				_.config.fillStyle = '#fff';
				_.$scaleTo(1, 1, dur, 'back_out', function(){
					_.$turn(0, 180, 300, 0, callback);
				})
			}, 1000);
		});
	}
	if(typeof predelay === 'number' && predelay > 0) setTimeout(fn, predelay);
	else fn();
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

function arrayChaos(arr, rotate){
	arr.sort(function(a, b){
		return 0.5 - Math.random();
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