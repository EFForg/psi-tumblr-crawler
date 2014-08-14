// Requires
const
    assert  = require('assert'),
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
                config.tumblr +
                '/api/read/json?' +
                '&type='   + 'photo' +
                '&filter=' + 'text' +
                '&start='  + this.start +
                '&num='    + this.num;

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

            Crawler.model.posts = _.map(Crawler.model.posts, function (post) {
                // Trim whitespace from the caption
                var blurb = post["photo-caption"].trim();

                // Update the protocol to HTTPS.
                // We also need to use the `38` subdomain...
                // since some of the other subdomains don't have valid certs.
                var url500 = post["photo-url-500"].replace(/^http:\/\/\d+/, "https://38"),
                    url1280 = post["photo-url-1280"].replace(/^http:\/\/\d+/, "https://38");

                return {
                    "blurb"   : blurb,
                    "height"  : post["height"],
                    "url500"  : url500,
                    "url1280" : url1280,
                    "width"   : post["width"]
                }
            });
        },

        save: function () {
            var dir = __dirname + '/../data';

            // Create directory, if needed
            mkdirp(dir);

            // Should be 10+ posts
            assert(Crawler.model.posts.length > 10);

            fs.writeFileSync(dir + '/posts.json', JSON.stringify(Crawler.model.posts));
        },

        start: function () {
            Crawler.controller.getMorePosts();
        }
    }
};


Crawler.controller.start();