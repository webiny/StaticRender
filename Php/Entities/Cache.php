<?php

/**
 * Webiny Platform (http://www.webiny.com/)
 *
 * @copyright Copyright Webiny LTD
 */

namespace Apps\StaticRender\Php\Entities;


use Apps\Core\Php\DevTools\Entity\AbstractEntity;
use Webiny\Component\Mongo\Index\SingleIndex;

class Cache extends AbstractEntity
{
    protected static $entityCollection = 'StaticRenderCache';

    public function __construct()
    {
        parent::__construct();

        $this->index(new SingleIndex('ttl', 'ttl', false, false, false, 0)); // delete records automatically after ttl expires
        $this->index(new SingleIndex('url', 'url', false, true));

        $this->attributes->removeKey(['deletedOn', 'deletedBy', 'modifiedOn', 'modifiedBy', 'createdBy']);
        
        $this->attr('url')->char()->setValidators('required,unique')->setToArrayDefault();
        $this->attr('ttl')->datetime()->setToArrayDefault();
        $this->attr('content')->char()->setToArrayDefault();
    }
}