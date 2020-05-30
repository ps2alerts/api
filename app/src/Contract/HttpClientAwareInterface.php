<?php

namespace Ps2alerts\Api\Contract;

use GuzzleHttp\Client;

interface HttpClientAwareInterface
{
    /**
     * Sets the http client
     *
     * @param Client
     */
    public function setHttpClientDriver(Client $client);

    /**
     * Gets the http client
     *
     * @return Client
     */
    public function getHttpClientDriver();
}
