/**
 *	Combine .filter + .find
 */

function domLib_find($set, selector) {
	return $set.filter(selector).add($set.find(selector));
}

function domLib_on($set, type, selector, fn) {

	if (selector == null) {
		return $set.on(type, fn);
	}

	$set.on(type, selector, fn);
	$set.filter(selector).on(type, fn);
	return $set;
}
