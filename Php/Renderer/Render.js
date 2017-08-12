/**
 * Node app that calls phantomJs to render the page and then outputs the page content.
 * App takes 3 arguments in the following order:
 *  1. which url to render
 *  2. path to phantomjs executable
 *  3. snapshot interval
 *  4. (optional) debug mode - to enable pass "debug" as 4th parameter
 *
 *  Note: this js file needs to be inside the PHP folder, otherwise webpack will strip it out when deploying the app to production.
 */
const phantom = require("phantom");

const args = process.argv.slice(2);
const url = args[0];
const snapshotInterval = args[2] || false;
const debug = args[3] || false;
const maxExecutionTime = 15000; // 15s

phantom.create([
    '--ignore-ssl-errors=yes',
    '--load-images=false',
    '--local-storage-path=/tmp',
    '--local-storage-quota=5000',
    '--offline-storage-path=/tmp',
    '--offline-storage-quota=5000'], {
    phantomPath: args[1],
    logLevel: (debug) ? 'info' : 'error'
}).then((ph) => {
    ph.createPage().then((page) => {

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


        page.open(url).then((status) => {

            let runs = maxExecutionTime / snapshotInterval;
            let webinyStartedInterval = setInterval(() => {

                page.evaluate(function () {
                    if (typeof window.webinyFirstRenderDone === 'function') {
                        if (window.webinyFirstRenderDone()) {
                            // we need to remove all the script elements from the static page (can cause problems with googlebot)
                            return document.documentElement.innerHTML.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
                        }
                    }
                    return false;
                }).then(content => {
                    if (content) {
                        clearInterval(webinyStartedInterval);

                        console.log(content);
                        page.close().then(() => {
                            ph.exit();
                        }).catch(error => {
                            console.log(error);
                            ph.exit();
                        });

                        return content;
                    }
                }).catch(error => {
                    console.log(error);
                    ph.exit();
                });

                runs--;
                if (runs < 0) {
                    ph.exit();
                }

            }, snapshotInterval);

        }).catch(error => {
            console.log(error);
            ph.exit();
        });
    }).catch(error => {
        console.log(error);
        ph.exit();
    });
});