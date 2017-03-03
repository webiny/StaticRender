/**
 * Node app that calls phantomJs to render the page and then outputs the page content.
 * App takes 3 arguments in the following order:
 *  1. which url to render
 *  2. path to phantomjs executable
 *  3. amount of miliseconds to wait before fetching the content
 */
const phantom = require("phantom");

const args = process.argv.slice(2);
const url = args[0];

phantom.create([], {
    phantomPath: args[1],
    logLevel: 'none'
}).then(function (ph) {
    ph.createPage().then(function (page) {

        page.property('viewportSize', {width: 1440, height: 768});
        page.property('customHeaders', {"XWebinyStaticRender": "true"});

        page.open(url).then(function (status) {
            setTimeout(() => {
                page.property('content').then(function (content) {
                    console.log(content);
                    page.close();
                    ph.exit();
                });
            }, args[2])
        });
    });
});