<?php

namespace Apps\StaticRender\Php\Entities;

use Apps\Webiny\Php\Lib\Api\ApiContainer;
use Apps\Webiny\Php\Lib\Entity\AbstractEntity;
use Apps\StaticRender\Php\Renderer\Renderer;
use Apps\Webiny\Php\Lib\Entity\Indexes\IndexContainer;
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
 */
class Cache extends AbstractEntity
{
    protected static $classId = 'StaticRender.Entities.Cache';
    protected static $collection = 'StaticRenderCache';

    public function __construct()
    {
        parent::__construct();

        $this->attributes->remove('deletedOn', 'deletedBy', 'modifiedOn', 'modifiedBy', 'createdBy');

        $this->attr('url')->char()->setValidators('required,unique')->setToArrayDefault();
        $this->attr('ttl')->datetime()->setToArrayDefault();
        $this->attr('content')->char()->setToArrayDefault();
        $this->attr('userAgent')->char()->setToArrayDefault();
        $this->attr('ip')->char()->setToArrayDefault();
        $this->attr('ref')->char()->setToArrayDefault();
        $this->attr('statusCode')->integer()->setToArrayDefault();
    }

    protected function entityApi(ApiContainer $api)
    {
        parent::entityApi($api);

        /**
         * @api.name Fetch as bot
         * @api.description Fetches the given url as how the page would be rendered for a bot by the static render app.
         */
        $api->post('fetch-as-bot', function () {
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
        $api->get('refresh/{entry}', function (Cache $entry) {
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
        $api->get('delete-all', function () {
            $entries = Cache::find();
            foreach ($entries as $e) {
                $e->delete(true);
            }

            return true;
        });
    }

    protected static function entityIndexes(IndexContainer $indexes)
    {
        parent::entityIndexes($indexes);

        // delete records automatically after ttl expires
        $indexes->add(new SingleIndex('ttl', 'ttl', false, false, false, 0));
        $indexes->add(new SingleIndex('url', 'url', false, true));
    }

    public function delete($permanent = false)
    {
        return parent::delete(true);
    }
}