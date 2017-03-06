/**
 * Node app that calls phantomJs to render the page and then outputs the page content.
 * App takes 3 arguments in the following order:
 *  1. which url to render
 *  2. path to phantomjs executable
 *  3. amount of miliseconds to wait before fetching the content
 *  4. (optional) debug mode - to enable pass "debug" as 4th parameter
 */
const phantom = require("phantom");

const args = process.argv.slice(2);
const url = args[0];

const debug = args[3] || false;

phantom.create([
    '--ignore-ssl-errors=yes',
    '--load-images=false',
    '--local-storage-path=/tmp',
    '--local-storage-quota=5000',
    '--offline-storage-path=/tmp',
    '--offline-storage-quota=5000'], {
    phantomPath: args[1],
    logLevel: (debug) ? 'info' : 'error'
}).then(function (ph) {
    ph.createPage().then(function (page) {

        if (debug) {
            page.on("onConsoleMessage", function (msg, lineNum, sourceId) {
                console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
            });

            page.on("onResourceRequested", (requestData) => {
                console.info('Requesting', requestData.url);
            });

            page.on("onResourceError", function (resourceError) {
                console.log('Unable to load resource (#' + resourceError.id + 'URL:' + resourceError.url + ')');
                console.log('Error code: ' + resourceError.errorCode + '. Description: ' + resourceError.errorString);
            });
        }

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