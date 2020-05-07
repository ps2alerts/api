<?php

// @todo Go over this ENTIRE file again as there's been major refactors since and it's likely broken!

namespace Ps2alerts\Api\Controller\Endpoint\Leaderboards;

use Ps2alerts\Api\Exception\CensusEmptyException;
use Ps2alerts\Api\Exception\CensusErrorException;
use Ps2alerts\Api\Repository\Metrics\PlayerTotalRepository;
use Ps2alerts\Api\Transformer\Leaderboards\PlayerLeaderboardTransformer;
use Ps2alerts\Api\Controller\Endpoint\Data\DataEndpointController;

class LeaderboardPlayerEndpointController extends AbstractLeaderboardEndpointController
{
    protected $dataEndpoint;
    protected $repository;

    /**
     * Construct
     *
     * @param DataEndpointController
     * @param PlayerTotalRepository
     */
    public function __construct(
        DataEndpointController $dataEndpoint,
        PlayerTotalRepository  $repository
    ) {
        $this->repository = $repository;
        $this->dataEndpoint = $dataEndpoint;
    }

    /**
     * Get Player Leaderboard
     *
     * @return \League\Fractal\Manager|\Psr\Http\Message\ResponseInterface
     */
    public function players()
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

        if (isset($server)) {
            $query->where('playerServer = ?', $server);
        }

        if (isset($limit)) {
            $query->limit($limit);
        } else {
            $query->limit(10); // Set default limit
        }

        if (isset($offset)) {
            $query->offset($offset);
        }

        $players = $this->repository->fireStatementAndReturn($query);

        $count = count($players);

        // Gets outfit details
        for ($i = 0; $i < $count; $i++) {
            if (! empty($players[$i]['playerOutfit'])) {
                // Gets outfit details
                try {
                    $outfit = $this->dataEndpoint->getOutfit($players[$i]['playerOutfit']);
                } catch (CensusErrorException $e) {
                    $outfit = null;
                } catch (CensusEmptyException $e) {
                    $outfit = null;
                }

                $players[$i]['playerOutfit'] = $outfit;
            }
        }

        return $this->respond(
            'collection',
            $players,
            new PlayerLeaderboardTransformer
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
                $field = 'playerKills';
                break;
            case 'deaths':
                $field = 'playerDeaths';
                break;
            case 'teamkills':
                $field = 'playerTeamKills';
                break;
            case 'suicides':
                $field = 'playerSuicides';
                break;
            case 'headshots':
                $field = 'headshots';
                break;
        }

        return $field;
    }
}
