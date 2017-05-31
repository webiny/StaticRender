<?php
/**
 * Webiny Platform (http://www.webiny.com/)
 *
 * @copyright Copyright Webiny LTD
 */

namespace Apps\StaticRender\Php\Renderer;

use Apps\Webiny\Php\DevTools\WebinyTrait;
use Apps\StaticRender\Php\Exceptions\StaticRenderException;
use Webiny\Component\Config\ConfigObject;
use Webiny\Component\StdLib\StdObjectTrait;
use MongoDB\BSON\UTCDatetime;

set_time_limit(300);

class Renderer
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

    public function getTtl()
    {
        $ttl = $this->config->get('Settings.CacheTtl', 600);
        return new UTCDatetime((time() + $ttl) * 1000);
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

    private function getRenderJsPath()
    {
        return realpath(__DIR__).'/Render.js';
    }

    private function renderPage()
    {
        // node Render.js $url $pathToPhantomJs $timeout
        $command = $this->getNodePath()
            .' ' . $this->getRenderJsPath()
            .' "'.$this->url.'"'
            .' "'.$this->getPhantomJsPath().'"'
            .' '.$this->getResourceTimeout()
            .' 2>&1';

        $output = shell_exec($command);

        return $output;
    }
}