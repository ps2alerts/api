<?php

namespace Ps2alerts\Api\Contract;

use League\Fractal\TransformerAbstract;

interface EndpointInterface
{
    public function setStatusCode(int $statusCode);
    public function getStatusCode();

    public function validateQueryStringArguments($queryString, string $mode);

    public function respond(string $kind, array $data, TransformerAbstract $transformer);
    public function respondWithItem(array $collection, TransformerAbstract $transformer);
    public function respondWithCollection(array $collection, TransformerAbstract $transformer);
    public function respondWithError(string $message, $code);
    public function respondWithData(array $data);
}