<?php

// @todo Go over this ENTIRE file again as there's been major refactors since and it's likely broken!

namespace Ps2alerts\Api\Controller\Endpoint\Leaderboards;

use Ps2alerts\Api\Controller\Endpoint\AbstractEndpointController;
use Ps2alerts\Api\Exception\InvalidArgumentException;

abstract class AbstractLeaderboardEndpointController extends AbstractEndpointController
{
    /**
     * Validates the request variables
     *
     * @throws InvalidArgumentException
     * @return boolean
     */
    public function validateRequestVars()
    {
        try {
            if (! empty($_GET['field'])) {
                $this->parseField($_GET['field']);
            }

            if (! empty($_GET['server'])) {
                $this->parseServer($_GET['server']);
            }

            if (! empty($_GET['limit'])) {
                $this->parseOffset($_GET['limit']);
            }

            if (! empty($_GET['offset'])) {
                $this->parseOffset($_GET['offset']);
            }
        } catch (InvalidArgumentException $e) {
            return $e;
        }

        return true;
    }

    /**
     * Validate the field requested
     *
     * @return string
     * @throws InvalidArgumentException
     */
    public function parseField($field)
    {
        $validFields = [
            'kills',
            'deaths',
            'teamkills',
            'suicides',
            'headshots',
            'captures'
        ];

        if (! empty($field) && in_array($field, $validFields)) {
            return $field;
        }

        throw new InvalidArgumentException("Field '{$field}' is not supported.");
    }

    /**
     * Validate the server requested
     *
     * @return string
     * @throws InvalidArgumentException
     */
    public function parseServer($server)
    {
        $validServers = $this->getConfigItem('servers');

        // Remove Jaeger
        if (($key = array_search(19, $validServers)) !== false) {
            unset($validServers[$key]);
        }

        if (! empty($server) && in_array($server, $validServers)) {
            return $server;
        }

        throw new InvalidArgumentException("Server '{$server}' is not supported.");
    }

    /**
     * Parses limit, making sure it's numerical and valid
     *
     * @return boolean
     * @throws InvalidArgumentException
     */
    public function parseLimit($limit)
    {
        if (! isset($limit) && ! is_numeric($limit)) {
            throw new InvalidArgumentException("Limit needs to be in numerical format.");
        }

        return $limit;
    }

    /**
     * Parses offset, making sure it's numerical and valid
     *
     * @return integer
     * @throws InvalidArgumentException
     */
    public function parseOffset($offset)
    {
        if (! isset($offset) && ! is_numeric($offset)) {
            throw new InvalidArgumentException("Offset needs to be in numerical format.");
        }

        return $offset;
    }
}
