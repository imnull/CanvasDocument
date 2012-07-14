(function(w){

var $d = {
	ht : new HashTable(),
	global : new HashTable(),
	add : function(key, open, close){
		this.ht.add(key, {
			open : open, close : close
		})
	},
	$ : function(key, name){
		if(this.ht.has(key) && typeof this.ht.get(key)[name] === 'function'){
			this.ht.get(key)[name](this.global);
			return true;
		}
		return false;
	},
	open : function(key){ return this.$(key, 'open'); },
	close : function(key){ return this.$(key, 'close'); }
}

w.director = w.gd = $d;

})(window)

