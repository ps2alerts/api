<?php

// @todo Go over this ENTIRE file again as there's been major refactors since and it's likely broken!

namespace Ps2alerts\Api\Controller\Endpoint\Leaderboards;

use Ps2alerts\Api\Repository\Metrics\OutfitTotalRepository;
use Ps2alerts\Api\Transformer\Leaderboards\OutfitLeaderboardTransformer;
use Psr\Http\Message\ResponseInterface;

class LeaderboardOutfitEndpointController extends AbstractLeaderboardEndpointController
{
    protected $repository;

    /**
     * Construct
     *
     * @param League\Fractal\Manager $fractal
     */
    public function __construct(
        OutfitTotalRepository  $repository
    ) {
        $this->repository = $repository;
    }

    /**
     * Get Outfit Leaderboard
     *
     * @return ResponseInterface
     */
    public function outfits()
    {
        try {
            $this->validateRequestVars();
        } catch (\Exception $e) {
            return $this->respondWithError($e->getMessage(), self::CODE_WRONG_ARGS);
        }

        $server = $_GET['server'];
        $limit  = $_GET['limit'];
        $offset = $_GET['offset'];

        // Translate field into table specific columns

        if (isset($_GET['field'])) {
            $field = $this->getField($_GET['field']);
        }

        if (! isset($field)) {
            return $this->respondWithError('Field wasn\'t provided and is required.', self::CODE_WRONG_ARGS);
        }

        // Perform Query
        $query = $this->repository->newQuery();
        $query->cols(['*']);
        $query->orderBy(["{$field} desc"]);
        $query->where('outfitID > 0');

        if (isset($server)) {
            $query->where('outfitServer = ?', $server);
        }

        if (isset($limit)) {
            $query->limit($limit);
        } else {
            $query->limit(10); // Set default limit
        }

        if (isset($offset)) {
            $query->offset($offset);
        }

        return $this->respond(
            'collection',
            $this->repository->fireStatementAndReturn($query),
            new OutfitLeaderboardTransformer
        );
    }

    /**
     * Gets the appropiate field for the table and handles some table naming oddities
     * @param  string $input Field to look at
     * @return string
     */
    public function getField($input) {
        $field = null;
        switch ($input) {
            case 'kills':
                $field = 'outfitKills';
                break;
            case 'deaths':
                $field = 'outfitDeaths';
                break;
            case 'teamkills':
                $field = 'outfitTKs';
                break;
            case 'suicides':
                $field = 'outfitSuicides';
                break;
            case 'captures':
                $field = 'outfitCaptures';
                break;
        }

        return $field;
    }
}
