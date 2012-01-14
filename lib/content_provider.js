var fs = require('fs'),
	markdown = require('markdown').markdown,
	content_cache = {},
	content_path = __dirname + '/content/',
	timestamps = {};

var parse_markdown = function(path, callback) {
	fs.readFile(path, 'ascii', function(err, data) {
		if (err) throw err;
		callback(markdown.toHTML(data));
	});
};

module.exports = {
	get_content: function(key, callback) {
		var path = content_path + key;
		fs.stat(path, function(err, stats) {
			if (err) throw err; // TODO: better error handling
			if (!timestamps[key] || timestamps[key] < stats.mtime.getTime()) {
				parse_markdown(path, function(output) {
					content_cache[key] = output;
					timestamps[key] = stats.mtime.getTime();
					callback(output);
				});
			} else {
				callback(content_cache[key]);		
			}
		});
	}
};