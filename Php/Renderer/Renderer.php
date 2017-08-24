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
    private $statusCode;

    public function __construct($url)
    {
        $this->url = $url;
        $this->loadConfig();
        $this->renderPage();
    }

    /**
     * @return string Page content.
     */
    public function getContent()
    {
        return $this->content;
    }

    public function getStatusCode()
    {
        return $this->statusCode;
    }

    public function getTtl()
    {
        $ttl = $this->config->get('Settings.CacheTtl', 600);

        return new UTCDatetime((time() + $ttl) * 1000);
    }

    private function loadConfig()
    {
        $this->config = $this->wConfig()->get('StaticRender', false);

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
        return realpath(__DIR__) . '/Render.js';
    }

    private function renderPage()
    {
        // node Render.js $url $pathToPhantomJs $timeout
        $command = $this->getNodePath() . ' ' . $this->getRenderJsPath() . ' "' . $this->url . '"' . ' "' . $this->getPhantomJsPath() . '"' . ' ' . $this->getResourceTimeout() . ' 2>&1';

        $this->content = shell_exec($command);

        // check if we have the status code
        $str = strtok($this->content, "\n");
        if (strpos($str, 'status code:') !== false) {
            $this->statusCode = trim(str_replace('status code:', '', $str));

            $this->content = substr($this->content, strpos($str, "\n") + strlen($str));
        } else {
            $this->statusCode = 503;
            $this->content = '';
        }
    }
}