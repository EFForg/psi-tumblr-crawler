// Requires
const
    config  = require(__dirname + '/../config'),
    fs      = require('fs'),
    mkdirp  = require('mkdirp').sync,
    request = require('request'),
    _       = require('underscore');


// Functionality
var Crawler = {
    model: {
        callback: null,
        start: 0,
        num: 50,
        posts: [],

        nextUrl: function () {
            var url =
                'http://' + config.tumblr +
                '/api/read/json?' +
                '&filter=' + 'text' +
                '&start='  + this.start +
                '&num='    + this.num;

            if (config.type) {
                url += '&type='   + config.type;
            }

            this.start += this.num;

            return url;
        },

        cleanAndParseJSON: function (json) {
            json = json.replace(/^var tumblr_api_read = /, '');
            json = json.replace(/;\n$/, '');

            return JSON.parse(json);
        }
    },


    controller: {
        getMorePosts: function () {
            var url = Crawler.model.nextUrl();

            request(url, function(err, response, body) {
                var data = Crawler.model.cleanAndParseJSON(body).posts;

                Crawler.model.posts = Crawler.model.posts.concat(data);

                console.log('Posts:', Crawler.model.posts.length);

                if (data.length === Crawler.model.num) {
                    Crawler.controller.getMorePosts();
                } else {
                    Crawler.controller.clean();
                    Crawler.controller.save();
                }
            });
        },

        clean: function () {
            // Remove duplicates
            Crawler.model.posts = _.uniq(Crawler.model.posts, false, function (post) {
                return post.id;
            });

            // Only certain Tumblr subdomains support HTTPS
            var secureSubdomains = ['33', '38'];

            Crawler.model.posts = _.map(Crawler.model.posts, function (post) {
                // Trim whitespace from the caption
                var blurb = post["photo-caption"].trim();

                // Find a secured CDN subdomain
                var key = post["id"] % secureSubdomains.length;
                var subdomain = secureSubdomains[key];

                // Update the URL
                var search = /^http:\/\/\d+/;
                var replacement = "https://" + subdomain;
                var photo = post["photo-url-500"].replace(search, replacement);

                return {
                    "blurb"  : blurb,
                    "height" : post["height"],
                    "id"     : post["id"],
                    "tags"   : post.tags,
                    "url500" : photo,
                    "width"  : post["width"]
                }
            });
        },

        save: function () {
            var dir = __dirname + '/../data';

            // Create directory, if needed
            mkdirp(dir);

            var json = JSON.stringify(Crawler.model.posts);

            var savedJson = '';
            if (fs.existsSync(dir + '/posts.json')) {
                savedJson = fs.readFileSync(dir + '/posts.json', 'utf-8');
            }

            if (json !== savedJson) {
                console.log('Saved changes to ./data/posts.json');
                fs.writeFileSync(dir + '/posts.json', json);
            } else {
                console.log('JSON was already current');
            }
        },

        start: function () {
            Crawler.controller.getMorePosts();
        }
    }
};


Crawler.controller.start();
