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

    private function getPhantomJsPath()
    {
        return $this->config->get('Settings.PathToPhantomJs', '/usr/local/bin/phantomjs');
    }

    private function getNodePath()
    {
        return $this->config->get('Settings.PathToNode', '/usr/bin/node');
    }


    private function getJsTemplateSource()
    {

        $appPath = realpath(__DIR__.'/../../');

        return '
                const phantom = require("'.$appPath.'/node_modules/phantom");
                
                const url = "' . $this->url . '";
                
                phantom.create([], {
                    phantomPath: "' . $this->getPhantomJsPath() . '"
                }).then(function (ph) {
                    ph.createPage().then(function (page) {
                
                        page.property(\'viewportSize\', {width: 1440, height: 768});
                        page.property(\'customHeaders\', {"XWebinyStaticRender": "true"});
                
                        page.open(url).then(function (status) {
                            console.log(status);
                            setTimeout(() => {
                                page.property(\'content\').then(function (content) {
                                    console.log(content);
                                    page.close();
                                    ph.exit();
                                });
                            }, ' . $this->getResourceTimeout() . ')
                        });
                    });
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

        return $templatePath;
    }

    private function renderPage()
    {
        $command = $this->getNodePath().' ' . $this->getJsTemplatePath().' 2>&1';

        $output = shell_exec($command);

        die(print_r($output));
        
        
        array_shift($output);
        array_pop($output);

        //remove any whitespace from the array elements and join all the html lines into one string of all the html

        $output = array_map('trim', $output);
        $output = join("", $output);

        return $output;
    }
}