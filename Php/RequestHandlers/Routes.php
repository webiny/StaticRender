<?php
/**
 * Webiny Platform (http://www.webiny.com/)
 *
 * @copyright Copyright Webiny LTD
 */

namespace Apps\StaticRender\Php\RequestHandlers;

use Apps\Core\Php\DevTools\WebinyTrait;
use Apps\Core\Php\DevTools\Response\HtmlResponse;
use Apps\StaticRender\Php\Renderer\Renderer;
use Webiny\Component\StdLib\StdObjectTrait;

class Routes
{
    use WebinyTrait, StdObjectTrait;

    public function handle()
    {

        if(!$this->isBot()){
            return null;
        }

        if ($this->isStaticRenderRequest()){
            return null;
        }

        if (!$this->wRequest()->isApi() && !$this->isStaticRenderRequest()) {

            $renderer = new Renderer($this->wRequest()->getCurrentUrl());

            die('content:'.$renderer->getContent());

            // check if we have it on the database

            // validate ttl

            // if ttl has expired or we don't have it cached, render via phantomjs

            return new HtmlResponse($this->wRouter()->execute($match));
        }

        return null;
    }

    private function isBot()
    {
        return $this->str($this->wRequest()->server()->httpUserAgent())->match('/bot|crawl|slurp|spider/i');
    }

    private function isStaticRenderRequest()
    {
        if($this->wRequest()->header('HTTP_XWEBINYSTATICRENDER', false)
            || $this->wRequest()->header('XWEBINYSTATICRENDER', false)
            || $this->wRequest()->header('XWebinyStaticRender', false)
            || $this->wRequest()->header('Xwebinystaticrender', false)
        ){
            return true;
        }

        return false;
    }
}