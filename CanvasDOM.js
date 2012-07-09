(function(w){

w.MOUSE_DOWN = 'ontouchstart' in document ? 'touchstart' : 'mousedown';
w.MOUSE_UP	 = 'ontouchend' in document ? 'touchend' : 'mouseup';
w.MOUSE_MOVE = 'ontouchmove' in document ? 'touchmove' : 'mousemove';

var _evt = {
	get : function (e) {
		return (e = e || window.event).touches && e.touches.length ? e.touches[0] : e;
	},
	pos: function (e) {
		e = this.get(e);
		var x, y;
		if ('pageX' in e) {
			x = e.pageX - e.target.offsetLeft;
			y = e.pageY - e.target.offsetTop;
		} else if ('offsetX' in e) {
			x = e.offsetX;
			y = e.offsetY;
		} else if ('clientX' in e) {
			x = e.clientX - e.target.offsetLeft;
			y = e.clientY - e.target.offsetTop;
		} else {
			x = y = 0;
		}
		return { x: x, y: y };
	}
}

var _ani = {
	FPS : 50,
	RATE : 1,
	S : function(d){
		return Math.ceil(d / (1000 / this.FPS));
	},
	cbs : [],
	reg : function(callback){
		var t = (new Date()).getTime();
		this.cbs.push({
			f : callback,
			t : t,
			i : t,
			c : 0
		});
		this.run();
	},
	run : function(){
		if(!!_ani._handle) return;
		_ani._handle = setInterval(_ani._run, 1000 / _ani.FPS)
	},
	_run : function(){
		if(_ani.cbs.length < 1){
			clearInterval(_ani._handle);
			delete _ani._handle;
		}
		var i = 0, cbs = _ani.cbs, len = cbs.length;
		var now = (new Date()).getTime();
		var r = _ani.RATE;
		var o;
		while(i < len){
			o = cbs[i];
			o.c += 1;
			if(o.f(o.c * r, (now - o.t) * r, (now - o.i) * r)){
				cbs.splice(i, 1);
				len--;
			} else {
				o.i = now;
				i++;
			}
		}
		cbs = len = now = null;

		if(!!_ani.docs){
			i = _ani.docs.length;
			while(--i >= 0){
				o = _ani.docs[i];
				o.doc.draw(o.before, o.after);
			}
		}
		o = null;
		i = null;
		//_ani.canvasdoc && _ani.canvasdoc.draw();
	},
	regdoc : function(doc, before, after){
		if(!this.docs) this.docs = [];
		this.docs.push({
			doc : doc, before : before, after : after
		});
	},
	removeDoc : function(doc){
		if(!this.docs) return;
		var i = this.docs.length;
		while(--i >= 0){
			if(this.docs[i] === doc){
				this.docs.splice(i, 1);
				return;
			}
		} 
	}
}




function _ani_run(){ _ani._run(); }

function _ext(a, b){	// a -> b
	if(!b) b = {};
	if(!a) return b;
	for(var p in a){
		if(typeof a[p] === 'object'){
			b[p] = _ext(a[p], b[p]);
		} else {
			b[p] = a[p]
		}
	}
	return b;
}
function _inherit(name, base, extra, init){
	eval('var fn = function ' + (name || '___') + '(config){'
		+ 'base.call(this, _ext(config, init || {}));'
		+ '}');
	fn.name = name;
	_ext(extra, _ext(base.prototype, fn.prototype));
	return fn;
}


function rndkey32() {
	var r = '', i = 0, len = 8;
	for (; i < len; i++)
		r += ((0xFFFFFF * (Math.random() + 1)) << 0).toString(36).substr(1);
	i = len = null;
	return r;
}

function cvsEventObject(target){
	this.hash = {};
	this.keys = {};
	this.target = target;
}
cvsEventObject.prototype = {
	regist : function(eventName, callback){
		if(!this.hash[eventName]){
			this.hash[eventName] = {};
		}
		if(!this.keys[eventName]){
			this.keys[eventName] = [];
		}
		var key = rndkey32();
		while(key in this.hash[eventName]) key = rndkey32();
		this.hash[eventName][key] = callback;
		this.keys[eventName].push(key);
		return key;
	},
	fire : function(en){
		if(!this.hash[en]) return;
		var h = this.hash[en], k = this.keys[en], i = k.length, t = this.target;
		while(--i >= 0){
			h[k[i]].call(t);
		}
	},
	remove : function(eventName, key){
		if(!(this.keys[eventName] instanceof Array)) return;
		var idx = this.keys[eventName].indexOf(key);
		if(idx < 0) return;
		this.keys[eventName].splice(idx, 1);
		return delete this.hash[eventName][key];
	}
}

function CanvasGenericElement(config){
	this.parent = null;
	this.children = [];
	this.image = null;
	this.radio = 1;
	this.config = _ext(config, {
		x : 0,
		y : 0,
		fillStyle : '#CCCCCC',
		strokeStyle : '#000000',
		text : '',
		lineWidth : 0,
		rotateAngle : 0,
		scaleX : 1,
		scaleY : 1,
		globalAlpha : 1,
		font : '12px Arial',
		align : null,
		valign : null
	});
	this.events = new cvsEventObject(this);
}
CanvasGenericElement.prototype = {
	each : function(callback){
		var i = 0, len = this.children.length;
		for(; i < len; i++){
			if(callback(this.children[i], i, len)) break;
		}
	},
	append : function(el){
		if(!this.ownerDocument || !el.ownerDocument || this.ownerDocument !== el.ownerDocument)
			throw 'Different ownerDocument';
		if(el.parent) el.parent.remove(el);
		el.parent = this;
		this.children.push(el);
	},
	removeAt : function(idx){
		if(idx < 0 || idx >= this.children.length) return;
		this.children[idx].parent = null;
		delete this.children[idx].parent;
		return this.children.splice(idx, 1);
	},
	remove : function(el){
		var idx = -1;
		this.each(function(_el, i){
			if(_el === el){
				idx = i;
				return true;
			}
		});
		this.removeAt(idx);
	},
	clear : function(){
		this.each(function(el){
			el.parent = null;
			delete el.parent;
		})
		this.children = [];
	},
	hasChild : function(el){
		var n = el.parent;
		while(!!n){
			if(n === this) return true;
			n = n.parent;
		}
		n = null;
		return false;
	},
	draw : function(ctx){

		ctx.save();

		ctx.translate(this.config.x * this.radio, this.config.y * this.radio);
		ctx.rotate(this.config.rotate);
		ctx.scale(this.config.scaleX, this.config.scaleY);

		this.path(ctx);
		this.fill(ctx);
		this.stroke(ctx);
		this.text(ctx);

		if(w.DEBUG){
			ctx.beginPath();
			ctx.rect(-1, -1, 2, 2);
			ctx.fillStyle = '#ffffff';
			ctx.strokeStyle = '#000000';
			ctx.lineWidth = 2;
			ctx.fill();
			ctx.stroke();
		}

		

		ctx.restore();

		var i = 0, len = this.children.length;
		for(; i < len; i++){
			this.children[i].draw(ctx);
		}
	},
	moveTo : function(x, y){
		this.config.x = x;
		this.config.y = y;
		return this;
	},
	scale : function(x, y){
		this.config.scaleX = x;
		this.config.scaleY = y;
		return this;
	},
	rotate : function(deg){
		this.config.rotate = deg * Math.PI / 180;
		return this;
	},
	content : function(str, color, font){
		this.config.text = str;
		if(!!font) this.config.font = font;
		this.config.textColor = color || '#000000';
		return this;
	},
	fill : function(ctx){
		ctx.fillStyle = this.config.fillStyle;
		ctx.fill();
	},
	stroke : function(ctx){
		ctx.lineWidth = this.config.lineWidth;
		ctx.strokeStyle = this.config.strokeStyle;
		ctx.stroke();
	},
	color : function(c){
		this.config.fillStyle = c;
		return this;
	},
	border : function(w, c){
		this.config.strokeStyle = c || this.config.strokeStyle;
		this.config.borderWidth = w || this.config.borderWidth;
		return this;
	},
	opacity : function(v){
		this.config.globalAlpha = v;
		return this;
	},
	text : function(ctx){
		if(!this.config.text) return;
		ctx.font = this.config.font;
		ctx.fillStyle = this.config.textColor || '#000000';

		var w, h;
		try {
			w = ctx.measureText(this.config.text).width;
			h = ctx.measureText('啊').width;
		} catch(ex){
			w = h = 0;
		}

		ctx.fillText(this.config.text, w * -.5, h * 0.20);

		return this;
	},
	fit : function(r){
		r = r || 1;
		//this.config.x *= r;
		//this.config.y *= r;
		this.radio = r;

		this.each(function(c){
			c.fit(r);
		})

		return this;
	},
	path : function(ctx){ throw 'Notcompliment'; },
	check : function(x, y){ throw 'Notcompliment'; },
	capture : function(x, y){
		var tmp = null
		if(!this.check(x, y)) return tmp;
		var i = this.children.length;
		while(--i >= 0){
			tmp = this.children[i].capture(x, y);
			if (!!tmp) return tmp;
		}
		return this;
	},
	bubble : function(eventName){

	},
	fireEvent : function(eventName, e, pos){
		this.events.fire(eventName, e, pos);
		this.parent && this.parent.fireEvent(eventName);
	},
	mousedown : function(callback){
		return this.events.regist('mousedown', callback);
	},
	mouseup : function(callback){
		return this.events.regist('mouseup', callback);
	},
	removeEvent : function(eventName, key){
		this.events.remove(eventName, key);
	},
	$moveTo : function(x, y, dur, m, callback, delay){
		var f = _twe[m || 'quad_out'];
		var X = this.config.x;
		var Y = this.config.y;
		var dx = x - X;
		var dy = y - Y;
		var step = _ani.S(dur);
		var _ = this;
		_ani.reg(function(c){
			_.moveTo(f(c, X, dx, step), f(c, Y, dy, step));
			if(c >= step){
				_.moveTo(x, y);
				if(typeof callback === 'function'){
					if(delay && delay > 0){
						var st = setTimeout(function(){
							clearTimeout(st);
							st = null;
							callback(_);
						}, delay)
					} else {
						callback(_);
					}
				}
				return true;
			}
		});
	},
	$scaleTo : function(x, y, dur, m, callback, delay){
		var f = _twe[m || 'quad_out'];
		var X = this.config.scaleX;
		var Y = this.config.scaleY;
		var dx = x - X;
		var dy = y - Y;
		var step = _ani.S(dur);
		var _ = this;
		_ani.reg(function(c){
			_.scale(f(c, X, dx, step), f(c, Y, dy, step));
			if(c >= step){
				_.scale(x, y);
				if(typeof callback === 'function'){
					if(delay && delay > 0){
						var st = setTimeout(function(){
							clearTimeout(st);
							st = null;
							callback(_);
						}, delay)
					} else {
						callback(_);
					}
				}
				return true;
			}
		});
	}
}

var cp = CanvasGenericElement.prototype;

var _twe = {
	linear : function(t,b,c,d){
		return c * t / d + b;
	},
	quad_in : function(t,b,c,d){
		return c * (t /= d) * t + b;
	},
	quad_out : function(t,b,c,d){
		return -c * (t /= d) * (t - 2) + b;
	},
	quad_io : function(t,b,c,d){
		if ((t /= d / 2) < 1) return c / 2 * t * t + b;
		return -c / 2 * ((--t)*(t - 2) - 1) + b;
	},
	quart_in: function(t,b,c,d){
		return c * (t /= d) * t * t * t + b;
	},
	quart_out: function(t,b,c,d){
		return -c * ((t = t / d- 1) * t * t * t - 1) + b;
	},
	quart_io: function(t,b,c,d){
		if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
		return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
	},
	elastic_in : function(t,b,c,d,a,p){
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	},
	elastic_out : function(t,b,c,d,a,p){
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return (a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b);
	},
	back_in: function(t,b,c,d,s){
		if (s == undefined) s = 1.70158;
		return c*(t/=d)*t*((s+1)*t - s) + b;
	},
	back_out: function(t,b,c,d,s){
		if (s == undefined) s = 1.70158;
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	},
	back_io: function(t,b,c,d,s){
		if (s == undefined) s = 1.70158; 
		if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	},
	bounce_in : function(t,b,c,d){
		return c - _twe['bounce$out'](d - t, 0, c, d) + b;
	},
	bounce_out : function(t,b,c,d){
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		} else {
			return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		}
	},
	bounce_io : function(t,b,c,d){
		if (t < d/2) return _twe['bounce$in'](t * 2, 0, c, d) * .5 + b;
		else return _twe['bounce$out'](t * 2 - d, 0, c, d) * .5 + c * .5 + b;
	}
}

var Panel = _inherit('Panel', CanvasGenericElement, {
	path : function(ctx){
		var W = this.config.width * this.radio;
		var H = this.config.height * this.radio;
		ctx.beginPath();
		ctx.rect(W * -.5, H * -.5, W, H);
	},
	size : function(w, h){
		this.config.width = w;
		this.config.height = h;
		return this;
	},
	check : function(x, y){
		var r = this.radio, c = this.config;
		var X = c.x * r, Y = c.y * r, W = c.width * r, H = c.height * r;
		//console.log(X, Y, W, H)
		var b = x >= X - W * .5
			&& x <= X + W * .5
			&& y >= Y - H * .5
			&& y <= Y + H * .5;
		return b;
	}
}, { config : { width : 100, height : 100 } });

var Circle = _inherit('Circle', CanvasGenericElement, {
	path : function(ctx){
		ctx.beginPath();
		ctx.arc(0, 0, this.config.radio * this.radio, 0, Math.PI * 2, false);
	},
	size : function(r){
		this.config.radio = r;
		return this;
	},
	check : function(x, y){
		x = this.config.x * this.radio - x;
		y = this.config.y * this.radio - y;
		var d2 = x * x + y * y, r = this.config.radio * this.radio;
		return d2 < r * r;
	}
}, { radio : 50 });

var Button = _inherit('Button', CanvasGenericElement, {
	path : function(ctx){
		var W = this.config.width * this.radio;
		var H = this.config.height * this.radio;
		var h = W * .5;
		var v = H * .5;
		var pi = Math.PI;
		ctx.beginPath();
		ctx.arc(-h, 0, v, pi * .5, pi * 1.5, false);
		ctx.lineTo(h, -v);
		ctx.arc(h, 0, v, pi * -.5, pi * .5, false);
		ctx.closePath();
	},
	size : function(w, h){
		this.config.width = w;
		this.config.height = h;
		return this;
	},
	check : function(x, y){
		var conf = this.config, R = this.radio
			, w = conf.width * R, h = conf.height * R
			, X = conf.x * R, Y = conf.y * R
			, r = h * .5
			, x1 = X - x - w * .5, x2 = X - x + w * .5, _y = Y - y;
			;
		return (x1 * x1 + _y * _y < r * r) || (x2 * x2 + _y * _y < r * r)
			|| (x >= X - w * .5 && x <= X + w * .5 && y >= Y - h * .5 && y <= Y + h * .5)
			;
	}
});

var Grid = _inherit('Grid', CanvasGenericElement, {
	path : function(ctx){
		var h = this.config.width * .5;
		var v = this.config.height * .5;
		var hs = this.config.width / this.config.sizeH;
		var vs = this.config.height / this.config.sizeV;
		ctx.beginPath();
		ctx.rect(
			this.config.width * -.5,
			this.config.height * -.5,
			this.config.width,
			this.config.height
			);
		var i, len;
		for(i = 1, len = this.config.sizeH; i < len; i++){
			ctx.moveTo(i * hs - h, -v);
			ctx.lineTo(i * hs - h, v);
		}
		for(i = 1, len = this.config.sizeV; i < len; i++){
			ctx.moveTo(-h, i * vs - v);
			ctx.lineTo(h, i * vs - v);
		}
	},
	size : function(w, h){
		this.config.width = w;
		this.config.height = h;
		return this;
	},
	check : function(x, y){
		return x >= this.config.x - this.config.width * .5
			&& x <= this.config.x + this.config.width * .5
			&& y >= this.config.y - this.config.height * .5
			&& y <= this.config.y + this.config.height * .5;
	},
	fit : function(r){
		r = r || 1;
		this.config.width *= r;
		this.config.height *= r;
		return cp.fit.call(this, r);
	}
}, { width : 200, height : 200, sizeH : 10, sizeV : 10 });

var Background = _inherit('Background', CanvasGenericElement, {
	path : function(ctx){ return; },
	size : function(w, h){ return; },
	check : function(x, y){ return false; },
	draw : function(ctx){
		if(!this.image) return;
		var img = this.image, c = this.config;
		ctx.drawImage(img, 0, 0, img.width, img.height, c.x, 0, c.width, c.height);
	},
	setImage : function(img){
		this.image = img || this.image;
		if(!this.image || !this.ownerDocument) return;

		var img = this.image;
		var ctx = this.ownerDocument.context;
		var _w = img.width, _h = img.height, _r = _w / _h;
		var w = ctx.canvas.width, h = ctx.canvas.height;
		var r = w / h;

		if(r > _r){
			this.config.width = w;
			this.config.height = w / _r;
		} else {
			this.config.width = h * _r;
			this.config.height = h;
		}

	},
	$move : function(rate){
		var _ = this;
		rate = rate || 1;
		_.moveKey = _ani.reg(function(f, i, l){
			if(!_.image) return;
			var img = _.image, w = img.width, h = img.height;

			if(rate > 0){
				_.moveTo(f * rate, f * rate);
			} else if(rate < 0 && _.image){
				_.moveTo(w + f * rate, h + f * rate);
			}
		})
	}
});

function CanvasDocument(id){
	CanvasGenericElement.call(this, {});
	var cvs = typeof id === 'string' ? document.getElementById(id) : cvs;
	if(!cvs) cvs = document.createElement('canvas');
	this.context = cvs.getContext('2d');
	this.ownerDocument = this;
	this.origin = {
		width : cvs.width,
		height : Math.max(cvs.height, 1),
	}

	var _ = this;
	cvs.addEventListener(MOUSE_DOWN, function(e){
		var pos = _evt.pos(e);
		var el = _.capture(pos.x, pos.y);
		el.fireEvent('mousedown', e, pos);
	}, false);
	cvs.addEventListener(MOUSE_UP, function(e){
		var pos = _evt.pos(e);
		var el = _.capture(pos.x, pos.y);
		el.fireEvent('mouseup', e, pos);
	}, false);
}
_ext(CanvasGenericElement.prototype, CanvasDocument.prototype);

CanvasDocument.prototype.createPanel = function(x, y, w, h){
	var p = new Panel({
		x : x || 0, y : y || 0, width : w || 100, height : h || 100
	});
	p.ownerDocument = this;
	return p;
}
CanvasDocument.prototype.createCircle = function(x, y, r){
	var p = new Circle({
		x : x || 0, y : y || 0, radio : r || 50
	});
	p.ownerDocument = this;
	return p;
}
CanvasDocument.prototype.createButton = function(x, y, w, h){
	var p = new Button({
		x : x || 0, y : y || 0, width : w || 100, height : h || 24
	});
	p.ownerDocument = this;
	return p;
}
CanvasDocument.prototype.createGrid = function(x, y, w, h){
	var p = new Grid({
		x : x || 0, y : y || 0, width : w || 200, height : h || 200
	});
	p.ownerDocument = this;
	return p;
}
CanvasDocument.prototype.createBackground = function(fillStyle){
	var p = new Background();
	p.ownerDocument = this;
	return p;
}
CanvasDocument.prototype.draw = function(before, after){
	var w = this.context.canvas.width;
	var h = this.context.canvas.height;
	this.context.clearRect(0, 0, w, h);

	if(typeof before === 'function'){
		before(this, w, h);
	}

	var i = 0, len = this.children.length;
	for(; i < len; i++){
		this.children[i].draw(this.context);
	}

	if(typeof after === 'function'){
		after(this, w, h);
	}
}
CanvasDocument.prototype.check = function(){
	return true;
}
CanvasDocument.prototype.fit = function(dom){
	dom = dom || this.context.canvas.parentNode;
	if(!dom || (dom != w && dom.nodeType != 1)) return;
	var W, H, cvs = this.context.canvas;
	if(dom === window){
		W = w.innerWidth;
		H = Math.max(w.innerHeight, 1);
	} else {
		W = dom.offsetWidth;
		H = Math.max(dom.offsetHeight, 1);
	}
	var r = this.origin.width / this.origin.height;
	var R = W / H;

	var _w, _h;
	if(r > R){
		_w = W;
		_h = W / r;
		r = W / this.origin.width;
	} else {
		_h = H;
		_w = H * r;
		r = H / this.origin.height;
	}

	cvs.width = Math.floor(_w);
	cvs.height = Math.floor(_h);

	return cp.fit.call(this, r);
}


w.CanvasGenericElement = CanvasGenericElement;
w.CanvasDocument = CanvasDocument;
w.ani = _ani;
w.evt = _evt;

})(window);