var find_findSingle;

(function(){

	
	find_findSingle = function(node, matcher) {
		
		if (is_Array(node)) {
			
			var imax = node.length,
				i = -1,
				result;
			
			while( ++i < imax ){
				
				result = find_findSingle(node[i], matcher);
				
				if (result != null) 
					return result;
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
	}
	
	
}());
