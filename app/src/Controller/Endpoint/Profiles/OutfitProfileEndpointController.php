<?php

namespace Ps2alerts\Api\Controller\Endpoint\Profiles;

use Ps2alerts\Api\Controller\Endpoint\AbstractEndpointController;
use Ps2alerts\Api\Repository\Metrics\OutfitTotalRepository;
use Ps2alerts\Api\Transformer\Profiles\OutfitProfileTransformer;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

class OutfitProfileEndpointController extends AbstractEndpointController
{
    /**
     * Construct
     *
     * @param OutfitTotalRepository    $outfitTotalRepo
     * @param OutfitProfileTransformer $outfitProfileTransformer
     */
    public function __construct(
        OutfitTotalRepository    $outfitTotalRepo,
        OutfitProfileTransformer $outfitProfileTransformer
    ) {
        $this->repository = $outfitTotalRepo;
        $this->transformer = $outfitProfileTransformer;
    }

    /**
     * Gets a outfit
     *
     * @param  ServerRequestInterface $request
     * @param  ResponseInterface      $response
     * @param  array                  $args
     *
     * @return ResponseInterface
     */
    public function getOutfit(ServerRequestInterface $request, ResponseInterface $response, array $args)
    {
        $outfit = $this->repository->readSinglebyId($args['id']);

        return $this->respond(
            'item',
            $outfit,
            $this->transformer
        );
    }
}
