const $$objects = (function () {
	const ObjProto = Object.prototype;
	const dateIntervalRegexLast = /^LAST_(\d{1,3})([SMHDWOY])$/;

	const
		toString = ObjProto.toString,
		hasOwnProperty = ObjProto.hasOwnProperty;

	const nativeKeys = Object.keys;

	const my = {};

	my.isObject = function (obj) {
		return obj !== null && typeof obj === 'object';
	}

	my.isFunction = function (functionToCheck) {
		return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]'
	}

	my.isEmpty = function (obj) {
		if (!obj)
			return true;

		let empty = true;
		for (let prop in obj) {
			empty = false;
			break;
		}
		return empty;
	};

	my.shallowClone = function(obj) {
		if (null == obj || "object" != typeof obj)
			throw new Error("Shallow Clone: No object found!")
		let copy = obj.constructor();
		for (let attr in obj) {
			if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
		}
		return copy;
	};

	my.deepClone = function(obj) {
		if (null == obj || "object" != typeof obj)
			throw new Error("Deep Clone: No object found!")
		return JSON.parse(JSON.stringify(obj));
	};

	my.clear = function (obj) {
		for (let prop in obj) {
			if (obj.hasOwnProperty(prop) && typeof obj[prop] != 'function') {
				delete obj[prop];
			}
		}
	};

	my.getByDotNotation = function (obj, objPath) {
		let commentIndex = objPath.lastIndexOf("@");
		if (commentIndex !== -1) {
			objPath = objPath.substring(commentIndex + 1);
		}
		objPath = objPath.split(".");
		for (let i = 0; i < objPath.length && obj; i++)
			obj = obj[objPath[i]];
		return obj;
	};

	my.setByDotNotation = function (obj, objPath, value) {
		objPath = objPath.split(".");
		for (let i = 0; i < objPath.length && obj; i++) {
			let elem = objPath[i];
			if (i < objPath.length - 1) {
				if (!obj[elem])
					obj[elem] = {};
				obj = obj[elem];
			}
			else
				obj[elem] = value;
		}
	};

	my.propertyKeys = function (obj) {
		if ("object" != typeof obj)
			throw new Error("Property Keys: No object found!");
		if (obj == null)
			return [];

		let result = [];
		for (let key in obj) {
			result.push(key);
		}
		return result;
	};

	my.propertyValues = function (obj) {
		if ("object" != typeof obj)
			throw new Error("Property Values: No object found!");
		if (obj == null)
			return [];

		let result = [];
		for (let key in obj) {
			result.push(obj[key]);
		}
		return result;
	};

	my.size = function (obj) {
		if (obj && typeof obj == 'object') {
			let count = 0;
			for (let k in obj) {
				if (obj.hasOwnProperty(k))
					++count;
			}
			return count;
		}
		else {
			throw Error('Source obj is not valid!');
		}
	};

	return my;
}());

export default $$objects;
