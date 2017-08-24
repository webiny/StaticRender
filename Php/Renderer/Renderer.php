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
        $this->cleanupProcesses();
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
        return $this->config->get('Settings.ResourceTimeout', 2000);
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
        $command = $this->getNodePath() . ' ' . $this->getRenderJsPath() . ' "' . $this->url . '"' . ' "' . $this->getPhantomJsPath() . '"' . ' ' . $this->getResourceTimeout() . ' 2>&1 & echo $!';

        $this->content = shell_exec($command);

        // first line is the pid
        // second line is the status code
        // all other lines are the content
        $this->content = explode("\n", $this->content);

        // get pid
        $pid = $this->content[0];

        // kill the process
        exec("kill -9 $pid");

        // check if we have the status code
        if (isset($this->content[1]) && strpos($this->content[1], 'status code:') !== false) {
            $this->statusCode = trim(str_replace('status code:', '', $this->content[1]));

            array_shift($this->content);
            array_shift($this->content);
        } else {
            $this->statusCode = 503;
            $this->content = '';
        }
    }

    private function cleanupProcesses()
    {
        $ps = shell_exec('ps -eo pid,lstart,command | grep phantomjs');
        $ps = explode("\n", $ps);

        foreach ($ps as $proc) {
            $procData = explode(' ', $proc);
            if (isset($procData[1])) {
                $pid = $procData[1];
                $time = strtotime($procData[2] . ' ' . $procData[3] . ' ' . $procData[4] . ' ' . $procData[5] . ' ' . $procData[6]);
                $runTime = time() - $time;

                // we will kill any script running over 15s
                if ($runTime > 15) {
                    exec("kill -9 $pid");
                }
            }
        }
    }
}