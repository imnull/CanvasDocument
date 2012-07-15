(function(w){

var RL = function ResourceLoader(){
	this.hash = {};
	this.total = 0;
	this.onloadfired = false;
}
RL.RetryTimes = 5;
RL.RetryDelay = 700;
RL.Timeout = 10000;
RL.prototype = {
	add : function(key, url){
		if(!(key in this.hash)){
			this.total += 1;
		} else {
			if(!!this.hash[key].locked) throw 'The key [' + key + '] is locked';
			else console.log('Override key [' + key + ']')
		}
		this.hash[key] = { url : url };
		this.onloadfired = false;
	},
	load : function(json){
		if(!json || typeof json != 'object') return;
		var p;
		for(p in json){
			this.add(p, json[p]);
		}
		p = null;
		this.$();
	},
	$ : function(){
		var p, h = this.hash, n, _ = this, c = 0;
		for(p in h){
			n = h[p];
			switch(n.state){
				case 4: //success
				case 8: //timeout
				case 9: //error
					break;
				case 1:
					c += 1;
					break;
				default:
					c += 1;
					n.state = 1;
					n.locked = true;
					n.img = (function(_n, _p){
						var i = new Image();
						i.onload = function(){
							_n.state = 4;
							_.$();
						}
						i.onerror = function(e){
							if(typeof i.error_retry != 'number'){
								i.error_retry = 0;
							}
							i.error_retry += 1;
							if(i.error_retry <= RL.RetryTimes){
								console.log('Retry [' + i.error_retry + '/' + RL.RetryTimes + '] -> '
									+ _p + ' : ' + i.src);
								var retry = setTimeout(function(){
									clearTimeout(retry);
									i.src = _n.url;
								}, RL.RetryDelay);
							} else {
								_n.state = 9;
								if(typeof _.onerror === 'function'){
									_.onerror(_p, i.src);
								}
								_.$();
							}
						}
						i.src = _n.url;
						var timeout = setTimeout(function(){
							if(_n.state != 4 && _n.state != 9){
								_n.state = 8;
								console.log('Resource loading timeout. [' + _p + '] ' + i.src);
								i = null;
								_.$();
							}
							clearTimeout(timeout);
							timeout = null;
						}, RL.Timeout);
						return i;
					})(n, p);
					break;
			}
		}
		if(c < 1 && !this.onloadfired && typeof _.onload === 'function'){
			this.onloadfired = true;
			_.onload(_.hash);
		}
		else if(typeof _.onloading === 'function') {
			_.onloading(_.total - c, _.total, _.hash)
		}
		n = p = h = null;
	}
}

w.ResourceLoader = RL;


/*
 * Depended on HashTable.js
 */

 /*
function rr(){
	this.ht = new HashTable();
}
rr.RetryTimes = 5;
rr.RetryDelay = 700;
rr.prototype = {
	load : function(json){
		this.ht.load(json, function(v){ return { url : v }; });
		this.$();
	},
	$ : function(){
		var c = 0, _ = this;
		this.ht.each(function(n, p){
			switch(n.state){
				case 4:
				case 9:
					break;
				case 1:
					c += 1;
					break;
				default:
					c += 1;
					n.state = 1;
					var i = new Image();
					i.onload = function(){
						n.state = 4;
						_.$();
					}
					i.onerror = function(e){
						if(typeof i.retry != 'number'){
							i.retry = 0;
						}
						i.retry += 1;
						if(i.retry <= rr.RetryTimes){
							console.log('Retry [' + i.retry + '/' + rr.RetryTimes + '] -> '
								+ p + ' : ' + i.src);
							var retry = setTimeout(function(){
								clearTimeout(retry);
								retry = null;
								i.src = n.url;
							}, rr.RetryDelay);
						} else {
							n.state = 9;
							i.retry = 0;
							if(typeof _.onerror === 'function'){
								_.onerror(p, i.src);
							}
							_.$();
						}
					}
					i.src = n.url;
					n.img = i;
					break;
			}
		});
		if(c < 1 && typeof _.onload === 'function') _.onload(_.hash);
		else if(typeof _.onloading === 'function') {
			_.onloading(_.ht.total - c, _.ht.total, _.hash)
		}
	}
}
*/

})(window);

