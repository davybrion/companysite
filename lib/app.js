var express = require('express'),
	app = module.exports = express.createServer(),
	NodePie = require('nodepie'),
	content_provider = require('./content_provider'),
	request = require('request');

app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.register('.html', require('ejs'));

var recentFeedItems = null;

app.dynamicHelpers({
	page: function() {
		return {};
	},
	recentFeedItems: function() {
		return recentFeedItems;
	}
});

app.configure(function(){
	app.use(express.staticCache());
	var oneWeek = 604800;
	app.use(express.static(__dirname + '/static', { maxAge: oneWeek }));
	app.use(express.errorHandler({ dumpExceptions: true }));
});


var render_markdown = function(file, title, section, res) {
	content_provider.get_content(file, function(output) {
		res.render('md_view', {
			content: output,
			title: title,
			section: section
		});
	});	
};

app.get('/', function(req, res) {
	render_markdown('home.md', 'Home', 'Home', res);
});

app.get('/contracting', function(req, res) {
	render_markdown('contracting.md', 'Contracting', 'Contracting', res);
});

app.get('/consulting', function(req, res) {
	render_markdown('consulting.md', 'Consulting', 'Consulting', res);
});

app.get('/training', function(req, res) {
	render_markdown('training.md', 'Training', 'Training', res);
});

app.get('/training/nhibernate', function(req, res) {
	render_markdown('nhibernate_training.md', 'NHibernate Workshop', 'Training', res);
});

app.get('/reviews', function(req, res) {
	render_markdown('reviews.md', 'Reviews', 'Reviews', res);
});

app.get('/contact', function(req, res) {
	res.render('contact')
});

var etag = null;

var processFeed = function(callback) {
	var options = {
		url: 'http://feeds.feedburner.com/davybrion',
		headers: {
			'If-None-Match': etag
		}
	};
	request(options, function(err, response, body) {
		etag = response.headers.etag;
		if (!err && response.statusCode == 200) {
			var feed = new NodePie(body);
			feed.init();
			recentFeedItems = [];
			var newItems = feed.getItems(0, 5);
			for (var i = 0; i < 5; i++) {
				recentFeedItems.push({
					date: newItems[i].getDate(),
					url: newItems[i].getPermalink(),
					title: newItems[i].getTitle()
				});
			}
			if (callback) callback();
		};
	});	
};

setInterval(processFeed, 1800000); // process feed items every 30 minutes

processFeed(function() {
	app.listen(3000);
	console.log('Express started on port 3000');	
});

