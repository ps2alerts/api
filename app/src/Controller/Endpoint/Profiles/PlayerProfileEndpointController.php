<?php

namespace Ps2alerts\Api\Controller\Endpoint\Profiles;

use Ps2alerts\Api\Controller\Endpoint\AbstractEndpointController;
use Ps2alerts\Api\Repository\Metrics\PlayerTotalRepository;
use Ps2alerts\Api\Transformer\Profiles\PlayerProfileTransformer;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

class PlayerProfileEndpointController extends AbstractEndpointController
{
    /**
     * Construct
     *
     * @param PlayerTotalRepository    $playerTotalRepo
     * @param PlayerProfileTransformer $playerProfileTransformer
     */
    public function __construct(
        PlayerTotalRepository    $playerTotalRepo,
        PlayerProfileTransformer $playerProfileTransformer
    ) {
        $this->repository = $playerTotalRepo;
        $this->transformer = $playerProfileTransformer;
    }

    /**
     * Gets a player
     *
     * @param  ServerRequestInterface $request
     * @param  ResponseInterface      $response
     * @param  array                  $args
     *
     * @return ResponseInterface
     */
    public function getPlayer(ServerRequestInterface $request, ResponseInterface $response, array $args)
    {
        $player = $this->repository->readSinglebyId($args['id']);

        return $this->respond(
            'item',
            $player,
            $this->transformer
        );
    }
}
