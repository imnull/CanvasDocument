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
	regdoc : function(doc){
		if(!this.docs) this.docs = [];
		this.docs.push(doc);
		return doc;
	},
	flush : function(){
		if(!this.docs) return;
		for(var i = 0, len = this.docs.length; i < len; i++){
			this.docs[i].clear();
			this.docs[i].draw();
		}
	},
	open : function(key){
		this.flush();
		return this.$(key, 'open');
	},
	close : function(key){
		this.flush();
		var b = this.$(key, 'close');
		return b;
	}
}

w.director = w.gd = $d;

})(window)

