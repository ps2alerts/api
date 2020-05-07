<?php

namespace Ps2alerts\Api\Controller\Endpoint\Alerts;

use Ps2alerts\Api\Repository\AlertRepository;
use Ps2alerts\Api\Transformer\AlertTotalTransformer;
use Ps2alerts\Api\Transformer\AlertTransformer;
use Ps2alerts\Api\Exception\InvalidArgumentException;
use Psr\Http\Message\ResponseInterface;

class AlertCountsEndpointController extends AlertEndpointController
{
    /**
     * @var AlertRepository
     */
    protected $repository;

    /**
     * @var AlertTransformer
     */
    protected $transformer;

    /**
     * AlertCountsEndpointController constructor.
     *
     * @param AlertRepository $repository
     * @param AlertTransformer $transformer
     */
    public function __construct(
        AlertRepository  $repository,
        AlertTransformer $transformer
    ) {
        $this->repository  = $repository;
        $this->transformer = $transformer;
    }

    /**
     * Returns the victories of each faction and the totals
     *
     * @return ResponseInterface
     */
    public function getVictories()
    {
        return $this->getCountData('victories');
    }

    /**
     * Returns the dominations of each faction and the totals
     *
     * @return ResponseInterface
     */
    public function getDominations()
    {
        return $this->getCountData('dominations');
    }

    /**
     * Gets the required count data and returns
     *
     * @param  string $mode The type of data we're getting (victory / domination)
     *
     * @return ResponseInterface
     */
    public function getCountData($mode)
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
            $dates = $this->validateQueryStringArguments(
                (isset($_GET['dates']) ? $_GET['dates'] : null),
                'dates'
            );
        } catch (InvalidArgumentException $e) {
            return $this->respondWithError($e->getMessage(), self::CODE_WRONG_ARGS);
        }

        $counts = [];
        $serversExploded = explode(',', $servers);
        $fractal = $this->getContainer()->get('FractalUtility');

        foreach ($serversExploded as $server) {
            $query = $this->repository->newQuery();

            $sql = $this->generateFactionCaseSql($server, $zones, $mode);

            $query->cols([$sql]);

            if (! empty($dates)) {
                $this->addDateRangeWhereClause($dates, $query, true);
            }

            $data = $this->repository->readRaw($query->getStatement(), true);
            $data['total'] = array_sum($data);

            if ($mode === 'domination') {
                $data['draw'] = null; // Since domination draws are not possible, set it to null
            }

            // Build each section of the final response using the transformer
            $counts['data'][$server] = $fractal->createItem($data, new AlertTotalTransformer);
        }

        // Return the now formatted array to the response
        return $this->respondWithData($counts);
    }

    /**
     * Get Daily totals over a range of dates
     *
     * @return ResponseInterface
     *@throws \Ps2alerts\Api\Exception\InvalidArgumentException
     */
    public function getDailyTotals()
    {
        try {
            $servers = $this->validateQueryStringArguments($_GET['servers'], 'servers');
            $zones   = $this->validateQueryStringArguments($_GET['zones'], 'zones');
            $dates   = $this->validateQueryStringArguments($_GET['dates'], 'dates');
        } catch (InvalidArgumentException $e) {
            return $this->respondWithError($e->getMessage(), self::CODE_WRONG_ARGS);
        }

        $data = [];

        $metrics = $this->getDailyMetrics($servers, $zones, $dates);
        $fractal = $this->getContainer()->get('FractalUtility');

        foreach ($metrics as $row) {
            $date = $row['dateIndex'];
            unset($row['dateIndex']);
            $row['total'] = array_sum($row);

            // Build each section of the final response using the transformer
            $data['data'][$date] = $fractal->createItem($row, new AlertTotalTransformer);
        }

        // Return the now formatted array to the response
        return $this->respondWithData($data);
    }

    /**
     * Get Daily totals over a range of dates broken down by server
     *
     * @return ResponseInterface
     */
    public function getDailyTotalsByServer()
    {
        try {
            $servers = $this->validateQueryStringArguments($_GET['servers'], 'servers');
            $zones   = $this->validateQueryStringArguments($_GET['zones'], 'zones');
            $dates   = $this->validateQueryStringArguments($_GET['dates'], 'dates');
        } catch (InvalidArgumentException $e) {
            return $this->respondWithError($e->getMessage(), self::CODE_WRONG_ARGS);
        }

        $data = [];
        $serversExploded = explode(',', $servers);
        $fractal = $this->getContainer()->get('FractalUtility');

        foreach ($serversExploded as $server) {
            $metrics = $this->getDailyMetrics($server, $zones, $dates);

            foreach ($metrics as $row) {
                $date = $row['dateIndex'];
                unset($row['dateIndex']);
                $row['total'] = array_sum($row);

                // Build each section of the final response using the transformer
                $data['data'][$server][$date] = $fractal->createItem($row, new AlertTotalTransformer);
            }
        }

        // Return the now formatted array to the response
        return $this->respondWithData($data);
    }

    /**
     * Gets raw daily metrics which can be further processed
     *
     * @param  string $server
     * @param  string $zones
     * @param  string $dates
     *
     * @return array
     */
    public function getDailyMetrics($server, $zones, $dates)
    {
        $query = $this->repository->newQuery();

        $sql = $this->generateFactionCaseSql($server, $zones);
        $sql .= ', DATE(ResultDateTime) AS dateIndex';
        $query->cols([$sql]);

        $query->where('ResultDateTime IS NOT NULL');
        if (! empty($dates)) {
            $this->addDateRangeWhereClause($dates, $query, true);
        }
        $query->groupBy(['dateIndex']);

        $metrics = $this->repository->readRaw($query->getStatement());

        // Regenerate the data with a date range to add 0s to where there was no data for those dates

        $begin = new \DateTime('2014-10-29');
        $end = new \DateTime('today');
        $interval = new \DateInterval('P1D');
        $daterange = new \DatePeriod($begin, $interval, $end);

        $data = [];

        foreach ($daterange as $date) {
            $data[$date->format('Y-m-d')] = [
                'vs' => 0,
                'nc' => 0,
                'tr' => 0,
                'draw' => 0,
                'dateIndex' => $date->format('Y-m-d')
            ];
        }

        foreach ($metrics as $key => $metric) {
            $data[$metric['dateIndex']] = $metrics[$key];
        }

        return $data;
    }

    /**
     * Generates the SELECT CASE statements required to filter down by Faction and Server
     *
     * @param  string $server
     * @param  string $zones
     * @param  string $mode
     *
     * @return string
     */
    public function generateFactionCaseSql($server = null, $zones = null, $mode = null)
    {
        $sql = '';

        foreach ($this->getConfigItem('factions') as $faction) {
            $factionAbv = strtoupper($faction);

            $sql .= "SUM(CASE WHEN `ResultWinner` = '{$factionAbv}' ";
            if (! empty($server)) {
                $sql .= "AND `ResultServer` IN ({$server}) ";
            }

            if (! empty($zones)) {
                $sql .= "AND `ResultAlertCont` IN ({$zones}) ";
            }

            if ($mode === 'dominations') {
                $sql .= "AND `ResultDomination` = 1 ";
            }

            $sql .= "THEN 1 ELSE 0 END) AS {$faction}";

            if ($factionAbv !== 'DRAW') {
                $sql .= ", ";
            }
        }

        return $sql;
    }
}
