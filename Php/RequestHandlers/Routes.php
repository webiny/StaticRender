<?php
/**
 * Webiny Platform (http://www.webiny.com/)
 *
 * @copyright Copyright Webiny LTD
 */

namespace Apps\StaticRender\Php\RequestHandlers;

use Apps\Webiny\Php\Lib\WebinyTrait;
use Apps\Webiny\Php\Lib\Response\HtmlResponse;
use Apps\StaticRender\Php\Entities\Cache;
use Apps\StaticRender\Php\Renderer\Renderer;
use Webiny\Component\StdLib\StdObjectTrait;

class Routes
{
    use WebinyTrait, StdObjectTrait;

    public function handle()
    {

        if (!$this->isBot() || !$this->wIsProduction()) {
            return null;
        }

        if ($this->isStaticRenderRequest()) {
            return null;
        }

        if (!$this->wRequest()->isApi() && !$this->isStaticRenderRequest()) {

            $url = $this->wRequest()->getCurrentUrl();
            $content = false;

            // check if we have it in the cache
            $cache = Cache::findOne(['url' => $url]);
            if ($cache) {
                $content = $cache->content;
                $statusCode = $cache->statusCode;
            } else {
                // if it's not cached, let's try and render it
                try {
                    $renderer = new Renderer($this->wRequest()->getCurrentUrl());
                    if ($renderer !== false && $renderer != '') {
                        $content = $renderer->getContent();
                        $statusCode = $renderer->getStatusCode();

                        // save the page
                        $cache = new Cache();
                        $cache->url = $url;
                        $cache->ttl = $renderer->getTtl();
                        $cache->content = $content;
                        $cache->statusCode = $statusCode;
                        $cache->userAgent = $this->wRequest()->server()->httpUserAgent();
                        $cache->ip = $this->wRequest()->getClientIp();
                        $cache->ref = $this->wRequest()->server()->httpReferer();
                        $cache->save();
                    }
                } catch (\Exception $e) {
                    return null;
                }
            }

            if ($content) {
                return new HtmlResponse($content, $statusCode);
            }
        }

        return null;
    }

    private function isBot()
    {
        return $this->str($this->wRequest()->server()->httpUserAgent())->match('/bot|crawl|slurp|spider|curl|facebookexternalhit|wget/i');
    }

    private function isStaticRenderRequest()
    {
        $headers = $this->wRequest()->header();
        $possibleValues = [
            'HTTP_XWEBINYSTATICRENDER',
            'XWEBINYSTATICRENDER',
            'XWebinyStaticRender',
            'Xwebinystaticrender'
        ];

        foreach ($headers as $name => $val) {
            if (in_array($name, $possibleValues)) {
                return true;
            }
        }

        return false;
    }
}