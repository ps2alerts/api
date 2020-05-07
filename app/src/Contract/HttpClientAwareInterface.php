<?php

namespace Ps2alerts\Api\Contract;

use GuzzleHttp\Client;

interface HttpClientAwareInterface
{
    /**
     * Sets the http client
     *
     * @param \GuzzleHttp\Client
     */
    public function setHttpClientDriver(Client $client);

    /**
     * Gets the http client
     *
     * @return \GuzzleHttp\Client
     */
    public function getHttpClientDriver();
}
