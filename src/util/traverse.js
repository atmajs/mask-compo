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
	
		return selector_match(node, matcher) === true
			? node
			: ((node = node[matcher.nextKey]) && find_findSingle(node, matcher))
			;
	}
	
	
}());
