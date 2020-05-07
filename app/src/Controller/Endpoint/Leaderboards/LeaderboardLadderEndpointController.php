<?php

// @todo Go over this ENTIRE file again as there's been major refactors since and it's likely broken!

namespace Ps2alerts\Api\Controller\Endpoint\Leaderboards;

use Ps2alerts\Api\Controller\Endpoint\AbstractEndpointController;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

class LeaderboardLadderEndpointController extends AbstractEndpointController
{
    public function playerLadder(ServerRequestInterface $request, ResponseInterface $response, array $args)
    {
        $redis = $this->getRedisDriver();
        $metric = $args['metric'];
        $server = $args['server'];

        $list = "ps2alerts:api:leaderboards:players:{$metric}:listById-{$server}";

        var_dump($list);

        $entries = $redis->get($list);

        var_dump($entries);
    }

    /**
     * Prompts the Leaderboard:Check command to resync the leaderboards
     *
     * @param  ServerRequestInterface  $request
     * @param  ResponseInterface $response
     *
     * @return ResponseInterface
     */
    public function update(ServerRequestInterface $request, ResponseInterface $response)
    {
        $config = $this->getConfig();

        // Only accept commands from internal IP
        $ip = $request->getClientIp();

        if ($ip !== $_SERVER['SERVER_ADDR']) {
            $response->setStatusCode(404);
            return $response;
        }

        $server = $_GET['server'];

        $redis = $this->getRedisDriver();
        $key = "ps2alerts:api:leaderboards:status:{$server}";

        // If we have a key, change the flag to force exists so the cronjob can run
        if ($redis->exists($key)) {
            $data = json_decode($redis->get($key));

             // Ignore if already flagged as being updated
            if ($data->beingUpdated == 0) {
                $data->forceUpdate = 1;
                $redis->set($key, json_encode($data));
            }
        } else {
            // Panic.
        }

        $response = $response->withStatus(202);
        return $response;
    }

    /**
     * Returns a list of times that a server leaderboard has been updated
     *
     * @param  ServerRequestInterface  $request
     * @param  ResponseInterface $response
     *
     * @return ResponseInterface
     */
    public function lastUpdate(ServerRequestInterface $request, ResponseInterface $response)
    {
        $config = $this->getConfig();
        $redis = $this->getRedisDriver();

        $data = [];

        foreach($config['servers'] as $server) {
            $key = "ps2alerts:api:leaderboards:status:{$server}";

            if ($redis->exists($key)) {
                $entry = json_decode($redis->get($key));
                $data[$server] = $this->createItem($entry, new LeaderboardUpdatedTransformer);
            }
        }

        return $this->respondWithData($data);
    }
}
