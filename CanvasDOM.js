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
		while(i < len){
			cbs[i].c += 1;
			if(cbs[i].f(cbs[i].c, now - cbs[i].t, now - cbs[i].i)){
				cbs.splice(i, 1);
				len--;
			} else {
				cbs[i].i = now;
				i++;
			}
		}
		i = cbs = len = now = null;
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
		font : '12px Arial'
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

		ctx.translate(this.config.x, this.config.y);
		ctx.rotate(this.config.rotate);
		ctx.scale(this.config.scaleX, this.config.scaleY);

		this.path(ctx);
		this.fill(ctx);
		this.stroke(ctx);
		this.text(ctx);

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

		ctx.fillText(this.config.text, w * -.5, h * .15);
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
		var h = this.config.width * .5;
		var v = this.config.height * .5;
		ctx.beginPath();
		ctx.rect(
			this.config.width * -.5,
			this.config.height * -.5,
			this.config.width,
			this.config.height
			);
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
	}
}, { config : { width : 100, height : 100 } });

var Circle = _inherit('Circle', CanvasGenericElement, {
	path : function(ctx){
		ctx.beginPath();
		ctx.arc(0, 0, this.config.radio, 0, Math.PI * 2, false);
	},
	size : function(r){
		this.config.radio = r;
		return this;
	},
	check : function(x, y){
		x = this.config.x - x;
		y = this.config.y - y;
		var d2 = x * x + y * y, r = this.config.radio;
		return d2 < r * r;
	}
}, { config : { radio : 50 } })

function CanvasDocument(id){
	CanvasGenericElement.call(this, {});
	var cvs = typeof id === 'string' ? document.getElementById(id) : cvs;
	if(!cvs) cvs = document.createElement('canvas');
	this.context = cvs.getContext('2d');
	this.ownerDocument = this;

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
CanvasDocument.prototype.draw = function(){
	this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
	var i = 0, len = this.children.length;
	for(; i < len; i++){
		this.children[i].draw(this.context);
	}
}
CanvasDocument.prototype.check = function(){
	return true;
}


w.CanvasGenericElement = CanvasGenericElement;
w.CanvasDocument = CanvasDocument;
w.ani = _ani;
w.evt = _evt;

})(window);