function HashTable(obj){
	this.hash = {};
	this.total = 0;
	this.load(obj);
}
HashTable.prototype = {
	add : function(key, obj){
		if(!(key in this.hash)){
			this.total += 1;
		} else {
			console.log('The key [' + key + '] is overrided')
		}
		this.hash[key] = obj;
	},
	load : function(obj, creator){
		if(!obj || typeof obj != 'object') return;
		var p;
		if(typeof creator != 'function'){
			for(p in obj){
				this.add(p, obj[p]);
			}
		} else {
			for(p in obj){
				this.add(p, creator(obj[p]));
			}
		}
		p = null;
	},
	remove : function(key){
		if(key in this.hash){
			this.total -= 1;
			return delete this.hash[key];
		}
		return false;
	},
	has : function(key){
		return key in this.hash;
	},
	get : function(key){
		return this.hash[key];
	},
	each : function(callback){
		if(typeof callback != 'function') return;
		var p, h = this.hash, i = 0;
		for(p in h){
			if(!!callback(h[p], p, h, i++)) break;
		}
		p = h = i = null;
	},
	map : function(callback){
		if(typeof callback != 'function') return;
		var arr = [];
		this.each(function(n){
			callback(n) && arr.push(n);
		})
		return arr;
	},
	every : function(callback){
		if(typeof callback != 'function') return;
		var b = true;
		this.each(function(n){
			if(!callback(n)){
				b = false;
				return true;
			}
		})
		return b;
	},
	some : function(callback){
		if(typeof callback != 'function') return;
		var b = false;
		this.each(function(n){
			if(!!callback(n)){
				b = true;
				return true;
			}
		})
		return b;
	}
}