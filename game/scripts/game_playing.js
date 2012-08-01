gd.add('playing', function open(g){
	g.sence = g.sence || 'fruit';
	g.cardcount = g.cardcount || 6;

	var doc = g.$('doc');
	var rs = g.$('resources');
	var W = doc.origin.width, H = doc.origin.height;
	var bg = g.$('index_background_dom') || doc.createPanel(320, 200, 640, 400);
	bg.image = rs.$('sence_' + g.sence + '_bg').img;
	var img = rs.$('card_' + g.sence).img;
	var logo = rs.$('logo').img;
	var prog = doc.createProgressBar();
	prog.moveTo(320, 380);

	var scoreBar = doc.createPanel(300, 15, 600, 24);
	scoreBar.config.textAlign = 'left';
	scoreBar.config.fillStyle = 'rgba(0,0,0,0)';
	scoreBar.config.textColor = '#ffffff';
	scoreBar.config.font = '14px 黑体';
	scoreBar._score = 0;
	scoreBar._next = 1;
	scoreBar._retry = 5;
	scoreBar.showScore = function(){
		var str = [];
		str.push('  ');
		str.push('得分: ');
		str.push(this._score);
		str.push('    ');
		str.push('累加: ');
		str.push(this._next);
		str.push('    ');
		str.push('重试: ');
		str.push(this._retry);
		scoreBar.content(str.join(''));
	}
	scoreBar.wrong = function(){
		this._next = 1;
		this._retry = Math.max(0, this._retry - 1);
		this.showScore();
	}
	scoreBar.right = function(){
		this._score += this._next;
		this._next += 1;
		this._retry = Math.min(5, this._retry + 1);
		this.showScore();
	}


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
		gd.open('playing');
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
	var cardcount = g.cardcount;
	if(cardcount < 0){
		cardcount = -cardcount;
		rotate = true;
	}
	var map = cardMaps[g.sence].slice(0);
	var c = cardcount / 2;
	var H = fitMul(cardcount);
	var s = cardSize(H, cardcount / H, doc);
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
		card.config.lineWidth = card2.config.lineWidth = 5;
		card.config.strokeStyle = card2.config.strokeStyle = '#fff';
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
		card.$out2 = card2.$out2 = cardfailout;
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

		doc.remove(g.$('return'));
		
		scoreBar.showScore();

		doc.append(scoreBar);
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
				scoreBar.right();

				if(cards.length < 1){
					success();
				}

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
					scoreBar.wrong();
					if(scoreBar._retry < 1) gameover();
				}
			});
			pairB.$fall(800, 0, function(){
				okB = true;
				if(okA && okB){
					pairA = pairB = null;
					scoreBar.wrong();
					if(scoreBar._retry < 1) gameover();
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

	function success(){
		doc.append(mask);
		var w = doc.origin.width, h = doc.origin.height;
		var panel = doc.createPanel(w * .5, h * .5, 300, 200);
		panel.config.fillStyle = 'rgba(0,0,0,0)';
		panel.image = rs.$('result_border').img;
		doc.append(panel);

		var c = Math.abs(g.cardcount) / 2;
		var result = getStar(c, scoreBar._score);
		for(var i = 0; i < 3; i++){
			var star = doc.createPanel(50 * (i - 1) + w * .5, 100, 42, 42);
			star.config.fillStyle = 'rgba(0,0,0,0)';
			if(i < result){
				star.image = rs.$('result_star_light').img;
			} else {
				star.image = rs.$('result_star_gray').img;
			}
			doc.append(star);
		}

		var retry = doc.createPanel(w * .5 - 60, h * .5, 72, 72);
		retry.config.fillStyle = 'rgba(0,0,0,0)';
		retry.image = rs.$('result_retry').img;
		retry.mousedown(function(){
			gd.open('playing');
		});
		doc.append(retry);

		var next = doc.createPanel(w * .5 + 60, h * .5, 72, 72);
		next.config.fillStyle = 'rgba(0,0,0,0)';
		next.image = rs.$('result_next').img;
		next.mousedown(function(){
			var index = g.levels.indexOf(g.cardcount);
			g.cardcount = g.levels[(index + 1) % g.levels.length];
			gd.open('playing');
		});
		doc.append(next);


		doc.draw();
	}

	function gameover(){
		each(cards, function(card, i){
			card.removeEvent('mousedown', card.evtkey);
			card.config.fillStyle = 'rgba(255, 0, 0, .5)'
			card.$turn(180, 360, 500, 100 * i, function(){
				card.$out2(1000, 800, function(){
					doc.remove(card);
					var index = cards.indexOf(card);
					cards.splice(index, 1);
					if(cards.length < 1){
						gd.open('level')
					}
				})
			});
		});
	}

	var w = fitMul(g.cardcount);

	//doc.append(g.$('return'));
	doc.draw();

}, function close(g){
	console.log('game.level.closed.')
	console.log(g)
});

/*
 * 差1的数列相加
 */
function scoreTotal(c){
	var r = 0;
	for(var i = 1; i <= c; i++){
		r += i;
	}
	return r;
}

/*
 * 获取星数
 */
function getStar(c, score){
	var s3 = .7;
	var s2 = .3;
	var s1 = .15;
	var r = scoreTotal(c);
	if(score >= s3 * r){
		return 3;
	} else if(score >= s2 * r){
		return 2;
	} else if(score >= s1 * r){
		return 1;
	} else {
		return 0;
	}
}

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
 * 游戏失败时卡片退场动作
 */
function cardfailout(dur, predelay, callback){
	this.config.fillStyle = 'rgba(255, 0, 0, .5)';
	var hTarget = 600;
	var x = this.config.x;
	var y = this.config.y;
	var _ = this;
	var step = ani.S(dur);
	var fn = function(){
		ani.reg(function(s){
			var r = s / step;
			_.moveTo(x, y + hTarget * r);
			_.rotate(s * 20);
			if(s > step){
				if(typeof callback === 'function'){
					callback(_);
				}
				return true;
			}
		})
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

/*
 * 数组乱序
 */
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