<?php

/**
 * Webiny Platform (http://www.webiny.com/)
 *
 * @copyright Copyright Webiny LTD
 */

namespace Apps\StaticRender\Php\Entities;


use Apps\Webiny\Php\DevTools\Entity\AbstractEntity;
use Apps\StaticRender\Php\Renderer\Renderer;
use Webiny\Component\Mongo\Index\SingleIndex;

/**
 * Class Cache
 *
 * @property string  $url
 * @property string  $content
 * @property string  $ttl
 * @property integer $statusCode
 * @property string  $userAgent
 * @property string  $ip
 * @property string  $ref
 *
 * @package Apps\StaticRender\Php\Entities
 */
class Cache extends AbstractEntity
{
    protected static $entityCollection = 'StaticRenderCache';

    public function __construct()
    {
        parent::__construct();

        $this->index(new SingleIndex('ttl', 'ttl', false, false, false, 0)); // delete records automatically after ttl expires
        $this->index(new SingleIndex('url', 'url', false, true));

        array_map(function ($key) {
            unset($this->attributes[$key]);
        }, ['deletedOn', 'deletedBy', 'modifiedOn', 'modifiedBy', 'createdBy']);

        $this->attr('url')->char()->setValidators('required,unique')->setToArrayDefault();
        $this->attr('ttl')->datetime()->setToArrayDefault();
        $this->attr('content')->char()->setToArrayDefault();
        $this->attr('userAgent')->char()->setToArrayDefault();
        $this->attr('ip')->char()->setToArrayDefault();
        $this->attr('ref')->char()->setToArrayDefault();
        $this->attr('statusCode')->integer()->setToArrayDefault();


        /**
         * @api.name Fetch as bot
         * @api.description Fetches the given url as how the page would be rendered for a bot by the static render app.
         */
        $this->api('POST', 'fetch-as-bot', function () {
            $payload = $this->wRequest()->getPayload();

            $renderer = new Renderer($payload->get('url'));

            return [
                'url'        => $payload->get('url'),
                'content'    => $renderer->getContent(),
                'statusCode' => $renderer->getStatusCode()
            ];
        });

        /**
         * @api.name        Refreshes the cache for the given entry
         * @api.description Refreshes the cache for the given entry
         */
        $this->api('GET', 'refresh/{entry}', function (Cache $entry) {
            $renderer = new Renderer($entry->url);

            $entry->content = $renderer->getContent();
            $entry->ttl = $renderer->getTtl();

            $entry->save();

            return $entry->toArray();
        });

        /**
         * @api.name Deletes all cache entries.
         * @api.description Deletes all cache entries.
         */
        $this->api('GET', 'delete-all', function () {
            $entries = Cache::find();
            foreach ($entries as $e) {
                $e->delete(true);
            }

            return true;
        });
    }

    public function delete($permanent = false)
    {
        return parent::delete(true);
    }
}