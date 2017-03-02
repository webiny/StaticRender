<?php
/**
 * Webiny Platform (http://www.webiny.com/)
 *
 * @copyright Copyright Webiny LTD
 */

namespace Apps\StaticRender\Php\RequestHandlers;

use Apps\Core\Php\DevTools\WebinyTrait;
use Apps\Core\Php\DevTools\Response\HtmlResponse;
use Apps\StaticRender\Php\Renderer\PhantomJs;
use Webiny\Component\StdLib\StdObjectTrait;

class Routes
{
    use WebinyTrait, StdObjectTrait;

    public function handle()
    {

        return null;
        /*
        if(!$this->isBot()){
            return null;
        }
        */

        if ($this->isStaticRenderRequest()){
            //die('<html><head></head><body>'.print_r($_SERVER).'</body></html>');
        }


        if (!$this->wRequest()->isApi() && !$this->isStaticRenderRequest()) {

            $phantomjs = new PhantomJs('http://demo.app/');

            die($phantomjs->getContent());

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
        return $this->str($this->wRequest()->server()->httpUserAgent())->contains('Webiny StaticRender');
    }
}