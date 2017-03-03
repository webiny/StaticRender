<?php
/**
 * Webiny Platform (http://www.webiny.com/)
 *
 * @copyright Copyright Webiny LTD
 */

namespace Apps\StaticRender\Php\RequestHandlers;

use Apps\Core\Php\DevTools\WebinyTrait;
use Apps\Core\Php\DevTools\Response\HtmlResponse;
use Apps\StaticRender\Php\Entities\Cache;
use Apps\StaticRender\Php\Renderer\Renderer;
use MongoDB\BSON\UTCDatetime;
use Webiny\Component\StdLib\StdObjectTrait;

class Routes
{
    use WebinyTrait, StdObjectTrait;

    public function handle()
    {

        if (!$this->isBot()) {
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
            } else {
                // if it's not cached, let's try and render it
                try {
                    $renderer = new Renderer($this->wRequest()->getCurrentUrl());
                    if ($renderer !== false && $renderer != '') {
                        $content = $renderer->getContent();

                        // save the page
                        $cache = new Cache();
                        $cache->url = $url;
                        $cache->ttl = new UTCDatetime((time() + $renderer->getTtl()) * 1000);
                        $cache->content = $content;
                        $cache->save();
                    }
                } catch (\Exception $e) {
                    return null;
                }
            }

            if ($content) {
                return new HtmlResponse($content);
            }
        }

        return null;
    }

    private function isBot()
    {
        return $this->str($this->wRequest()->server()->httpUserAgent())->match('/bot|crawl|slurp|spider|facebookexternalhit/i');
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