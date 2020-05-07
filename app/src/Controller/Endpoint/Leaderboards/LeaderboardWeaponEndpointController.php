<?php

// @todo Go over this ENTIRE file again as there's been major refactors since and it's likely broken!

namespace Ps2alerts\Api\Controller\Endpoint\Leaderboards;

use Ps2alerts\Api\Repository\Metrics\WeaponTotalRepository;
use Ps2alerts\Api\Transformer\Leaderboards\WeaponLeaderboardTransformer;
use Psr\Http\Message\ResponseInterface;

class LeaderboardWeaponEndpointController extends AbstractLeaderboardEndpointController
{
    /**
     * Construct
     *
     * @param WeaponTotalRepository $repository
     */
    public function __construct(
        WeaponTotalRepository  $repository
    ) {
        $this->repository = $repository;
    }

    /**
     * Get Weapon Leaderboard
     *
     * @return ResponseInterface
     */
    public function weapons()
    {
        try {
            $this->validateRequestVars();
        } catch (\Exception $e) {
            return $this->respondWithError($e->getMessage(), self::CODE_WRONG_ARGS);
        }

        // Translate field into table specific columns
        if (isset($_GET['field'])) {
            $field = $this->getField($_GET['field']);
        }

        if (! isset($field)) {
            return $this->respondWithError('Field wasn\'t provided and is required.', self::CODE_WRONG_ARGS);
        }

        $weapons = $this->getRedisUtility()->checkRedis('api', 'leaderboards', "weapons:{$field}");

        // If we have this cached already
        if (empty($weapons)) {
            // Perform Query
            $query = $this->repository->newQuery();
            $query->cols([
                'weaponID',
                'SUM(killCount) as killCount',
                'SUM(teamkills) as teamkills',
                'SUM(headshots) as headshots'
            ]);
            $query->where('weaponID > 0');
            $query->orderBy(["{$field} desc"]);
            $query->groupBy(['weaponID']);

            $weapons = $this->repository->fireStatementAndReturn($query);

            // Cache results in redis
            $this->getRedisUtility()->storeInRedis('api', 'leaderboards', "weapons:{$field}", $weapons);
        }

        return $this->respond(
            'collection',
            $weapons,
            new WeaponLeaderboardTransformer
        );
    }

    /**
     * Gets the appropriate field for the table and handles some table naming oddities
     *
     * @param  string $input Field to look at
     * @return string
     */
    public function getField($input) {
        $field = null;
        switch ($input) {
            case 'kills':
                $field = 'killCount';
                break;
            case 'headshots':
                $field = 'headshots';
                break;
            case 'teamkills':
                $field = 'teamkills';
                break;
        }

        return $field;
    }
}
