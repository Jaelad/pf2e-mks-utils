const $$arrays = (function () {
	const ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype

	const
		push = ArrayProto.push,
		slice = ArrayProto.slice,
		concat = ArrayProto.concat,
		toString = ObjProto.toString,
		hasOwnProperty = ObjProto.hasOwnProperty;

	const
		nativeForEach = ArrayProto.forEach,
		nativeMap = ArrayProto.map,
		nativeReduce = ArrayProto.reduce,
		nativeReduceRight = ArrayProto.reduceRight,
		nativeFilter = ArrayProto.filter,
		nativeEvery = ArrayProto.every,
		nativeSome = ArrayProto.some,
		nativeIndexOf = ArrayProto.indexOf,
		nativeLastIndexOf = ArrayProto.lastIndexOf,
		nativeIsArray = Array.isArray,
		nativeKeys = Object.keys,
		nativeBind = FuncProto.bind;

	const my = {};

	my.isArray = nativeIsArray || function (obj) {
		return toString.call(obj) === '[object Array]';
	};

	my.isEmpty = function (obj) {
		return !this.isArray(obj) || obj.length <= 0;
	};

	my.isNotEmpty = function (obj) {
		return this.isArray(obj) && obj.length > 0;
	};

	my.contains = function (arr, value) {
		return this.isArray(arr) && arr.indexOf(value) !== -1;
	};

	my.containsAny = function (arr, valueArr) {
		if (this.isArray(arr) && this.isArray(valueArr)) {
			for (let i = 0; i < valueArr.length; i++) {
				if (arr.indexOf(valueArr[i]) !== -1)
					return true;
			}
		}

		return false;
	};

	my.containsAll = function (arr, valueArr) {
		if (this.isArray(arr) && this.isArray(valueArr)) {
			for (let i = 0; i < valueArr.length; i++) {
				if (arr.indexOf(valueArr[i]) === -1)
					return false;
			}
			return true
		}
		return false;
	};

	my.join = function (arr, delimiter) {
		if (arr == null || arr.length <= 0)
			return "";
		let str = "";
		if (delimiter == null)
			delimiter = ', ';
		for (let i = 0; i < arr.length; i++) {
			let arrayValue = arr[i];

			str += arrayValue;
			if (i < arr.length - 1) {
				str += delimiter;
			}
		}
		return str;
	};

	my.getObjectByKey = function (arr, key, value) {
		for (let i = 0; i < arr.length; i++)
			if (arr[i][key] === value)
				return arr[i];
		return null;
	};

	my.arrayUnique = function (array) {
		let a = array.concat();
		for (let i = 0; i < a.length; ++i)
			for (let j = i + 1; j < a.length; ++j)
				if (a[i] === a[j])
					a.splice(j--, 1);

		return a;
	};

	my.remove = function (srcArr, removedItems) {
		if (!$$arrays.isArray(srcArr) || removedItems == null)
			throw new TypeError()

		let removedArr = []

		if (!$$arrays.isArray(removedItems))
			removedItems = [removedItems]

		for (let i = 0; i < removedItems.length; ++i) {
			let j = srcArr.indexOf(removedItems[i])
			if (j !== -1) {
				let removed = srcArr.splice(j, 1)
				if (removed)
					removedArr.push(removed)
			}
		}

		return removedArr
	}

	my.pushAll = function (arr, values, unique) {
		if (arr == null || values == null)
			return

		let listToAdd = Array.isArray(values) ? values : [values]

		for (let i = 0; i < listToAdd.length; i++) {
			let elem = listToAdd[i];
			if (unique) {
				if (!$$arrays.contains(arr, elem))
					arr.push(elem);
			} else {
				arr.push(elem);
			}
		}
		return arr
	};

	my.clear = function (arr) {
		if (arr) {
			arr.length = 0
		}
	};

	my.merge = function () {
		const result = []
		for (let i = 0; i < arguments.length; i++) {
			this.pushAll(result, arguments[i])
		}
		return result
	}

	return my
}())

export default $$arrays
