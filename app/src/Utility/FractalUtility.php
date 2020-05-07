<?php

namespace Ps2alerts\Api\Utility;

use League\Fractal\Resource\Item;
use League\Fractal\Resource\Collection;
use League\Fractal\TransformerAbstract;
use Ps2alerts\Api\Contract\FractalAwareInterface;
use Ps2alerts\Api\Contract\FractalAwareTrait;

class FractalUtility implements FractalAwareInterface
{
    use FractalAwareTrait;

    /**
     * Creates the item array and returns it hence it came.
     *
     * @param  array               $item        The data to parse
     * @param  TransformerAbstract $transformer The transformer to be used
     *
     * @return array
     */
    public function createItem($item, TransformerAbstract $transformer)
    {
        $resource = new Item($item, $transformer);
        $data = $this->getFractalManager()->createData($resource);

        return $data->toArray();
    }

    /**
     * Creates a collection array and sends it back to hence it came.
     *
     * @param  array               $collection
     * @param  TransformerAbstract $transformer
     *
     * @return array
     */
    public function createCollection(array $collection, TransformerAbstract $transformer)
    {
        $resource = new Collection($collection, $transformer);
        $data = $this->getFractalManager()->createData($resource);

        return $data->toArray();
    }
}