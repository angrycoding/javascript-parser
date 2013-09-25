define(function() {

	function Stack() {
		this.frames = [{}];
	}

	Stack.prototype.put = function(key, value) {
		this.frames[this.frames.length - 1][key] = value;
	};

	Stack.prototype.get = function(key) {

		var frames = this.frames;
		var index = frames.length;

		while (index--) {
			if (frames[index].hasOwnProperty(key)) {
				return frames[index][key];
			}
		}
	};

	Stack.prototype.getAsync = function(key, ret) {

		var frames = this.frames;
		var index = frames.length;

		while (index--) {
			if (frames[index].hasOwnProperty(key)) {
				return ret(
					true,
					frames[index][key],
					frames[index],
					key
				);
			}
		}
		ret(false);
	};

	Stack.prototype.save = function() {
		this.frames.push({});
	};

	Stack.prototype.restore = function() {
		this.frames.pop();
	};

	return Stack;

});