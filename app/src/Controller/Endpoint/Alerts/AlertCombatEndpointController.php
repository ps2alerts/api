<?php

namespace Ps2alerts\Api\Controller\Endpoint\Alerts;

use Ps2alerts\Api\Exception\InvalidArgumentException;
use Ps2alerts\Api\Repository\Metrics\CombatRepository;
use Ps2alerts\Api\Repository\Metrics\ClassRepository;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

class AlertCombatEndpointController extends AlertEndpointController
{
    /**
     * @var ClassRepository
     */
    protected $classRepository;

    /**
     * @var CombatRepository
     */
    protected $combatRepository;

    /**
     * AlertCombatEndpointController constructor.
     * @param ClassRepository $classRepository
     * @param CombatRepository $combatRepository
     */
    public function __construct(
        classRepository $classRepository,
        combatRepository $combatRepository
    ) {
        $this->classRepository  = $classRepository;
        $this->combatRepository = $combatRepository;
    }

    /**
     * Retrieves combat totals on a global and per-server basis
     * @param ServerRequestInterface $request
     * @param ResponseInterface $response
     * @return ResponseInterface
     * @throws \Exception
     */
    public function getCombatTotals(ServerRequestInterface $request, ResponseInterface $response)
    {
        try {
            $servers = $this->validateQueryStringArguments(
                (isset($_GET['servers']) ? $_GET['servers'] : null),
                'servers'
            );
            $zones = $this->validateQueryStringArguments(
                (isset($_GET['zones']) ? $_GET['zones'] : null),
                'zones'
            );
        } catch (InvalidArgumentException $e) {
            return $this->respondWithError($e->getMessage(), self::CODE_WRONG_ARGS);
        }

        $serversExploded = explode(',', $servers);
        $zonesExploded = explode(',', $zones);
        $zonesIn = $this->combatRepository->generateWhereInString($zonesExploded);

        $results = [];

        foreach ($serversExploded as $server) {
            $metrics = ['kills', 'deaths', 'teamkills', 'suicides', 'headshots'];
            $factions = ['vs', 'nc', 'tr'];

            // Check if we have an entry in Redis
            $data = $this->getRedisUtility()->checkRedis('api', 'combatTotals', "{$server}-data");
            $dataArchive = $this->getRedisUtility()->checkRedis('api', 'combatTotals', "{$server}-dataArchive");

            $mergedArray = [];

            if (! $data || ! $dataArchive) {
                $sums = [];
                foreach ($metrics as $metric) {
                    foreach ($factions as $faction) {
                        $dbMetric = $metric . strtoupper($faction); // e.g. killsVS
                        $dataMetric = $metric . strtoupper($faction); // e.g. killsVS

                        // Handle teamkills inconsistency
                        if ($metric === 'teamkills') {
                            $dbMetric = 'teamKills' . strtoupper($faction);
                        }
                        $sums[] = "SUM(factions.{$dbMetric}) AS $dataMetric";
                    }

                    // Totals
                    $dbMetric = 'total' . ucfirst($metric); // e.g. killsVS
                    $dataMetric = 'total' . ucfirst($metric); // e.g. killsVS

                    // Handle teamkills inconsistency
                    if ($metric === 'teamkills') {
                        $dbMetric = 'totalTKs'; // Christ knows why
                    }
                    $sums[] = "SUM(factions.{$dbMetric}) AS $dataMetric";
                }

                $query = $this->combatRepository->newQuery('single', true);
                $query->cols($sums);
                $query->from('ws_factions AS factions');
                $query->join(
                    'INNER',
                    'ws_results AS results',
                    "factions.resultID = results.ResultID"
                );
                $query->where('results.ResultServer = ?', $server);
                $query->where("results.ResultAlertCont IN {$zonesIn}");
                $query->where('results.Valid = ?', 1);

                $data = $this->combatRepository->fireStatementAndReturn($query, true);
                $dataArchive = $this->combatRepository->fireStatementAndReturn($query, true, false, true);

                // Store the results in Redis
                $this->getRedisUtility()->storeInRedis('api', 'combatTotals', "{$server}-data", $data, 3600);
                $this->getRedisUtility()->storeInRedis('api', 'combatTotals', "{$server}-dataArchive", $dataArchive, 3600);
            }

            $metrics = ['kills', 'deaths', 'teamkills', 'suicides', 'headshots'];
            $factions = ['vs', 'nc', 'tr'];

            // Merge the two arrays together
            foreach ($metrics as $metric) {
                // Tot up totals
                $dbMetric = 'total' . ucfirst($metric);
                $mergedArray['totals'][$metric] = (int) $data[$dbMetric] + (int) $dataArchive[$dbMetric];
                $results['all']['totals'][$metric] += $mergedArray['totals'][$metric];

                foreach ($factions as $faction) {
                    $dbMetric = $metric . strtoupper($faction);
                    $mergedArray[$metric][$faction] = (int) $data[$dbMetric] + (int) $dataArchive[$dbMetric];
                    $results['all'][$metric][$faction] += $mergedArray[$metric][$faction];
                }
            }

            $results[$server] = $mergedArray;
        }

        return $this->respondWithData($results);
    }

    /**
     * @param ServerRequestInterface $request
     * @param ResponseInterface $response
     * @return ResponseInterface
     * @throws \Exception
     */
    public function getClassTotals(ServerRequestInterface $request, ResponseInterface $response)
    {
        try {
            $servers = $this->validateQueryStringArguments($_GET['servers'], 'servers');
            $zones   = $this->validateQueryStringArguments($_GET['zones'], 'zones');
        } catch (InvalidArgumentException $e) {
            return $this->respondWithError($e->getMessage(), self::CODE_WRONG_ARGS);
        }

        $serversExploded = explode(',', $servers);
        $zonesExploded = explode(',', $zones);
        $zonesIn = $this->combatRepository->generateWhereInString($zonesExploded);
        $classes = $this->getConfig()['classes'];

        // Build classes array
        foreach ($classes as $class) {
            $results['totals'][$class] = [
                'kills'     => 0,
                'deaths'    => 0,
                'teamkills' => 0,
                'suicides'  => 0,
                'kdr'       => 0
            ];
        }

        foreach ($serversExploded as $server) {
            // Check if we have an entry in Redis
            $data = $this->getRedisUtility()->checkRedis('api', 'classCombat', "{$server}-data", 'object');
            $dataArchive = $this->getRedisUtility()->checkRedis('api', 'classCombat', "{$server}-dataArchive", 'object');

            // If data needs a pull
            if (! $data || ! $dataArchive) {
                $query = $this->combatRepository->newQuery('single', true);
                $query->cols([
                        'classID',
                        'results.ResultServer AS server',
                        'SUM(kills) AS kills',
                        'SUM(deaths) AS deaths',
                        'SUM(teamkills) AS teamkills',
                        'SUM(suicides) AS suicides'
                ]);
                $query->from('ws_classes AS classes');
                $query->join(
                    'INNER',
                    'ws_results AS results',
                    "classes.resultID = results.ResultID"
                );
                $query->where('results.ResultServer = ?', $server);
                $query->where("results.ResultAlertCont IN {$zonesIn}");
                $query->where('results.Valid = ?', 1);
                $query->where('classID != ?', 0);
                $query->groupBy(['classID, server']);

                $data = $this->classRepository->fireStatementAndReturn($query, false, true);
                $dataArchive = $this->classRepository->fireStatementAndReturn($query, false, true, true);

                // Store the results in Redis
                $this->getRedisUtility()->storeInRedis('api', 'classCombat', "{$server}-data", $data, 3600);
                $this->getRedisUtility()->storeInRedis('api', 'classCombat', "{$server}-dataArchive", $dataArchive, 3600);
            }

            // Typecase into ints and increase totals
            $metrics = ['kills', 'deaths', 'teamkills', 'suicides'];
            foreach ($data as $row) {
                $row->classID   = (int) $row->classID;
                $row->server   = (int) $row->server;
                $classGroup = $this->findClassGrouping($row->classID);
                $faction = $this->findClassFaction($row->classID);

                foreach ($metrics as $metric) {
                    $row->$metric = (int) $row->$metric;
                    $results[$row->server][$row->classID][$metric] += $row->$metric;
                    $results['totals'][$row->classID][$metric] += $row->$metric;
                    $results['byMetric'][$metric][$row->classID] += $row->$metric;
                    $results['byMetric'][$metric]['total'] += $row->$metric;

                    // Assign to class group
                    $results['classGroups']['totals'][$classGroup][$metric] += $row->$metric;
                    $results['classGroups'][$row->server][$classGroup][$metric] += $row->$metric;
                    $results['classGroupFactionMetric'][$classGroup][$faction][$metric] += $row->$metric;
                }
            }

            foreach ($dataArchive as $row) {
                $row->classID   = (int) $row->classID;
                $row->server   = (int) $row->server;

                foreach ($metrics as $metric) {
                    $row->$metric = (int) $row->$metric;
                    $results[$row->server][$row->classID][$metric] += $row->$metric;
                    $results['totals'][$row->classID][$metric] += $row->$metric;
                    $results['byMetric'][$metric][$row->classID] += $row->$metric;
                    $results['byMetric'][$metric]['total'] += $row->$metric;

                    // Assign to class group
                    $classGroup = $this->findClassGrouping($row->classID);
                    $results['classGroups']['totals'][$classGroup][$metric] += $row->$metric;
                    $results['classGroups'][$row->server][$classGroup][$metric] += $row->$metric;

                    $faction = $this->findClassFaction($row->classID);
                    $results['classGroupFactionMetric'][$classGroup][$faction][$metric] += $row->$metric;
                }
            }

            // Calculate KDRs
            foreach ($results['byMetric']['kills'] as $class => $kills) {
                $results['byMetric']['kdr'][$class] = $kills / $results['byMetric']['deaths'][$class];

                if (empty($results['byMetric']['kdr']['max'])) {
                    $results['byMetric']['kdr']['max'] = $results['byMetric']['kdr'][$class];
                }

                if ($results['byMetric']['kdr'][$class] > $results['byMetric']['kdr']['max']) {
                    $results['byMetric']['kdr']['max'] = $results['byMetric']['kdr'][$class];
                }
            }

            foreach ($results['classGroups'] as $server => $classArray) {
                foreach ($classArray as $class => $metrics) {
                    $results['classGroups'][$server][$class]['kdr'] = $metrics['kills'] / $metrics['deaths'];
                }
            }

            foreach ($results['classGroupFactionMetric'] as $class => $factions) {
                foreach ($factions as $faction => $metrics) {
                    $results['classGroupFactionMetric'][$class][$faction]['kdr'] = $metrics['kills'] / $metrics['deaths'];
                }
            }
        }

        return $this->respondWithData($results);
    }

    /**
     * @param $classID
     * @return bool|int|string
     */
    private function findClassGrouping($classID)
    {
        $classGroups = $this->getConfig()['classesGroups'];

        foreach ($classGroups as $group => $ids) {
            foreach ($ids as $id) {
                if ($classID === $id) {
                    return $group;
                }
            }
        }

        return false;
    }

    /**
     * @param $classID
     * @return bool|int|string
     */
    private function findClassFaction($classID)
    {
        $classesFactions = $this->getConfig()['classesFactions'];

        foreach ($classesFactions as $faction => $ids) {
            foreach ($ids as $id) {
                if ($classID === $id) {
                    return $faction;
                }
            }
        }

        return false;
    }
}
