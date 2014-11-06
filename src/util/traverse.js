var find_findSingle,
	find_findAll;
(function(){
	
	find_findSingle = function(node, matcher) {
		
		if (is_Array(node)) {
			var imax = node.length,
				i = 0, x;
			
			for(; i < imax; i++) {
				x = find_findSingle(node[i], matcher);
				if (x != null) 
					return x;
			}
			return null;
		}
	
		if (selector_match(node, matcher))
			return node;
		
		node = node[matcher.nextKey];
		return node == null
			? null
			: find_findSingle(node, matcher)
			;
	};

	find_findAll = function(node, matcher, out) {
		if (out == null) 
			out = [];
		
		if (is_Array(node)) {
			var imax = node.length,
				i = 0, x;
			
			for(; i < imax; i++) {
				find_findAll(node[i], matcher, out);
			}
			return out;
		}
		
		if (selector_match(node, matcher))
			out.push(node);
		
		node = node[matcher.nextKey];
		return node == null
			? out
			: find_findAll(node, matcher, out)
			;
	};
	
}());
