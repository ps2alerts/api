<?php

namespace Ps2alerts\Api\Controller\Endpoint\Search;

use Ps2alerts\Api\Controller\Endpoint\AbstractEndpointController;
use Ps2alerts\Api\Repository\Metrics\OutfitTotalRepository;
use Ps2alerts\Api\Repository\Metrics\PlayerTotalRepository;
use Ps2alerts\Api\Transformer\Search\OutfitSearchTransformer;
use Ps2alerts\Api\Transformer\Search\PlayerSearchTransformer;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

class SearchEndpointController extends AbstractEndpointController
{
    /**
     * Construct
     *
     * @param OutfitSearchTransformer $outfitSearchTransformer
     * @param OutfitTotalRepository   $outfitTotalRepo
     * @param PlayerSearchTransformer $playerSearchTransformer
     * @param PlayerTotalRepository   $playerTotalRepo
     */
    public function __construct(
        OutfitTotalRepository   $outfitTotalRepo,
        PlayerTotalRepository   $playerTotalRepo,
        OutfitSearchTransformer $outfitSearchTransformer,
        PlayerSearchTransformer $playerSearchTransformer
    ) {
        $this->playerRepository        = $playerTotalRepo;
        $this->outfitRepository        = $outfitTotalRepo;
        $this->playerSearchTransformer = $playerSearchTransformer;
        $this->outfitSearchTransformer = $outfitSearchTransformer;
    }

    /**
     * Endpoint to return potential players based on search term
     *
     * @param  ServerRequestInterface $request
     * @param  ResponseInterface      $response
     * @param  array                  $args
     *
     * @return ResponseInterface
     */
    public function getPlayersByTerm(ServerRequestInterface $request, ResponseInterface $response, array $args)
    {
        // If a valid player name we're searching on
        $this->parsePlayerName($args['term']);
        $players = $this->searchForPlayer($args['term']);

        if (! empty($players)) {
            return $this->respond(
                'collection',
                $players,
                $this->playerSearchTransformer
            );
        }

        return $this->respondWithError('Player could not be found', self::CODE_EMPTY);
    }

    /**
     * Endpoint to return potential players based on search term
     *
     * @param  ServerRequestInterface $request
     * @param  ResponseInterface      $response
     * @param  array                  $args
     *
     * @return ResponseInterface
     */
    public function getOutfitsByTerm(ServerRequestInterface $request, ResponseInterface $response, array $args)
    {
        $name = urldecode($args['term']); // Spaces will have to URL encoded

        $this->parseOutfitName($name);

        if (! empty($outfits)) {
            return $this->respond(
                'collection',
                $outfits,
                $this->outfitSearchTransformer
            );
        }

        return $this->respondWithError('Outfit could not be found', self::CODE_EMPTY);
    }

    /**
     * Takes a player name and searches for it
     *
     * @param  string $term
     *
     * @return array
     */
    public function searchForPlayer($term)
    {
        $query = $this->playerRepository->newQuery();
        $query->cols(['*']);
        $query->where('playerName LIKE :term');
        $query->bindValue('term', "%{$term}%");

        return $this->playerRepository->fireStatementAndReturn($query);
    }

    /**
     * Takes a outfit name and searches for it
     *
     * @param  string $term
     *
     * @return array
     */
    public function searchForOutfit($term)
    {
        $query = $this->outfitRepository->newQuery();
        $query->cols(['*']);
        $query->where("outfitTag LIKE :term");
        $query->bindValue('term', "%{$term}%");

        $data = $this->outfitRepository->fireStatementAndReturn($query);

        if (empty($data)) {
            $query = $this->outfitRepository->newQuery();
            $query->cols(['*']);
            $query->where("outfitName LIKE :term");
            $query->bindValue('term', "%{$term}%");

            $data = $this->outfitRepository->fireStatementAndReturn($query);
        }

        return $data;
    }

    /**
     * Parses a player name and makes sure it's valid
     *
     * @param  String $name
     *
     * @return ResponseInterface|boolean
     */
    public function parsePlayerName($name)
    {
        if (empty($name)) {
            return $this->respondWithError('Player name needs to be present.', self::CODE_WRONG_ARGS);
        }

        if (strlen($name) > 24) {
            return $this->respondWithError('Player names cannot be longer than 24 characters.', self::CODE_WRONG_ARGS);
        }

        return true;
    }

    /**
     * Parses a outfit name and makes sure it's valid
     *
     * @param  String $name
     *
     * @return ResponseInterface|boolean
     */
    public function parseOutfitName($name)
    {
        if (empty($name)) {
            return $this->respondWithError('Outfit name needs to be present.', self::CODE_WRONG_ARGS);
        }

        if (strlen($name) > 32) {
            return $this->respondWithError('Outfit names cannot be longer than 32 characters.', self::CODE_WRONG_ARGS);
        }

        return true;
    }

    /**
     * Runs checks on the player ID
     *
     * @param  string $id
     *
     * @return ResponseInterface|boolean
     */
    public function parsePlayerID($id)
    {
        if (empty($id)) {
            return $this->respondWithError('Player ID needs to be present.', self::CODE_WRONG_ARGS);
        }

        if (strlen($id > 19)) {
            return $this->respondWithError('Player ID cannot be longer than 19 characters.', self::CODE_WRONG_ARGS);
        }

        if (! is_numeric($id)) {
            return $this->respondWithError('Player ID must be numeric.', self::CODE_WRONG_ARGS);
        }

        return true;
    }
}
