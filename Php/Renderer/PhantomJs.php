<?php
/**
 * Webiny Platform (http://www.webiny.com/)
 *
 * @copyright Copyright Webiny LTD
 */

namespace Apps\StaticRender\Php\Renderer;

use Apps\Core\Php\DevTools\WebinyTrait;
use Apps\StaticRender\Php\Exceptions\StaticRenderException;
use Webiny\Component\Config\ConfigObject;
use Webiny\Component\StdLib\StdObjectTrait;

set_time_limit(300);

class PhantomJs
{
    use WebinyTrait, StdObjectTrait;

    private $url;
    /**
     * @var ConfigObject
     */
    private $config;
    private $content;

    public function __construct($url)
    {
        $this->url = $url;
        $this->loadConfig();
        $this->content = $this->renderPage();
    }

    public function getContent()
    {
        return $this->content;
    }

    private function loadConfig()
    {
        $this->config = $this->wConfig()->getConfig()->get('Application.StaticRender', false);

        if (!$this->config) {
            throw new StaticRenderException('StaticRender config is missing.');
        }
    }

    private function getResourceTimeout()
    {
        return $this->config->get('Settings.ResourceTimeout', 5000);
    }


    private function getJsTemplateSource()
    {
        return 'var page = require(\'webpage\').create();
var url = \'' . $this->url . '\';
var ref = \'' . $this->wRequest()->server()->httpReferer() . '\';
//page.settings.resourceTimeout = ' . $this->getResourceTimeout() . ';
page.settings.userAgent = \'Mozilla/5.0 (Windows NT 6.1; WOW64; Webiny StaticRender) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.120 Safari/537.36\';

function onPageReady() {
    var htmlContent = page.evaluate(function () {
        return document.documentElement.outerHTML;
    });

    console.log(htmlContent);

    phantom.exit();
}

page.open(url, function (status) {
    function checkReadyState() {
        setTimeout(function () {
            var readyState = page.evaluate(function () {
                return document.readyState;
            });

            if ("complete" === readyState) {
                onPageReady();
            } else {
                checkReadyState();
            }
        });
    }

    checkReadyState();
});';
    }

    private function getJsTemplatePath()
    {
        $absPath = $this->wConfig()->get('Application.AbsolutePath', false);
        if (!$absPath) {
            throw new StaticRenderException('Application.AbsolutePath not set in the application config.');
        }

        $templatePath = $absPath . 'Cache' . DIRECTORY_SEPARATOR . 'static-renderer-' . time() . '-' . md5($this->url) . '.js';
        file_put_contents($templatePath, $this->getJsTemplateSource());

        die($templatePath)
        return $templatePath;
    }

    private function renderPage()
    {
        $phantomJsPath = $this->config->get('Settings.PathToPhantomJs', false);
        if (!$phantomJsPath) {
            throw new StaticRenderException('PathToPhantomJs is not defined in the config.');
        }


        $command = $phantomJsPath . ' ' . $this->getJsTemplatePath() . ' 2>&1';

        exec($command, $output);

        array_shift($output);
        array_pop($output);

        //remove any whitespace from the array elements and join all the html lines into one string of all the html

        $output = array_map('trim', $output);
        $output = join("", $output);

        return $output;
    }
}