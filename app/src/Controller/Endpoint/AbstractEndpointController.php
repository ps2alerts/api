<?php

namespace Ps2alerts\Api\Controller\Endpoint;

use Aura\SqlQuery\AbstractQuery;
use League\Container\ContainerAwareInterface;
use League\Container\ContainerAwareTrait;
use Ps2alerts\Api\Contract\ConfigAwareInterface;
use Ps2alerts\Api\Contract\ConfigAwareTrait;
use Ps2alerts\Api\Contract\DatabaseAwareInterface;
use Ps2alerts\Api\Contract\DatabaseAwareTrait;
use Ps2alerts\Api\Contract\UtilityAwareInterface;
use Ps2alerts\Api\Contract\UtilityAwareTrait;
use Ps2alerts\Api\Exception\InvalidArgumentException;
use Ps2alerts\Api\Utility\ResponseHandler;
use League\Fractal\TransformerAbstract;

abstract class AbstractEndpointController extends ResponseHandler implements
    ConfigAwareInterface,
    ContainerAwareInterface,
    DatabaseAwareInterface,
    UtilityAwareInterface
{
    use ConfigAwareTrait;
    use ContainerAwareTrait;
    use DatabaseAwareTrait;
    use UtilityAwareTrait;

    /**
     * Contains the repository used for interfacing with the database
     *
     * @var \Ps2alerts\Api\Repository\AbstractEndpointRepository
     */
    protected $repository;

    /**
     * Holds the transformer we're going to use
     *
     * @var TransformerAbstract
     */
    protected $transformer;

    /**
     * Gets the Server or Zone filters and runs a check to make sure the request validates. Also formats the list
     * correctly for inclusion in query strings.
     *
     * @param  string $queryString
     * @param  string $type
     *
     * @throws InvalidArgumentException
     *
     * @return string
     */
    public function validateQueryStringArguments($queryString, string $type)
    {
        $filters = $this->getConfigItem($type);
        $numericals = ['servers', 'zones'];
        $strings = ['factions', 'brackets', 'dates'];

        if (!empty($queryString)) {
            $values = explode(',', $queryString);

            // Run a check on the IDs provided to make sure they're valid and no naughty things are being passed
            foreach ($values as $val) {
                // If the query string should contain only numbers
                if (in_array($type, $numericals)) {
                    if (!is_numeric($val)) {
                        throw new InvalidArgumentException("Non numerical ID detected. Only numerical IDs are accepted with this request.");
                    }
                }
                if (in_array($type, $strings)) {
                    if (is_numeric($val)) {
                        throw new InvalidArgumentException("Numerical input detected. Only string inputs are accepted with this request.");
                    }
                }

                if ($type !== 'dates' && !in_array($val, $filters)) {
                    throw new InvalidArgumentException("Unrecognized {$type}. Please check the DATA you sent.");
                }

                if ($type === 'dates') {
                    if (!$this->getDateValidationUtility()->validate($val, 'Y-m-d')) {
                        throw new InvalidArgumentException('Unrecognized date format. Dates must be in Y-m-d format.');
                    }
                }
            }

            // Additional check for ordering of dates
            if ($type === 'dates') {
                if ($values[0] > $values[1]) {
                    throw new InvalidArgumentException('First date provided MUST come BEFORE second date.');
                }
            }

            // Allow brackets to have UNK as otherwise it's filtering out the queries
            if ($type === 'brackets') {
                $values[] = 'UNK';
            }

            // Format into strings comma separated for SQL
            if (in_array($type, $strings)) {
                $queryString = "'" . implode("','", $values) . "'";
            }

            return $queryString;
        }

        if ($type === 'dates') {
            return $queryString;
        }

        // Allow brackets to have UNK as otherwise it's filtering out the queries
        if ($type === 'brackets') {
            $values[] = 'UNK';
        }

        // If no query string was provided
        $return = implode(',', $filters);

        if (in_array($type, $strings)) {
            $return = "'" . implode("','", $filters) . "'";
        }

        return $return;
    }

    /**
     * Checks formatting of dates input and then adds them to query
     *
     * @param mixed         $dates
     * @param AbstractQuery $query
     * @param boolean       $raw   Determines if query is being used in raw mode
     *
     * @return void
     */
    public function addDateRangeWhereClause($dates, AbstractQuery $query, $raw = false)
    {
        if (! is_array($dates)) {
            $dates = str_replace('\'', '', $dates); // Remove escaping quotes
            $dates = explode(',', $dates);
        }

        // If somehow we don't have a full date range, add today's date
        if (empty($dates[1])) {
            $dates[1] = date('Y-m-d');
        }

        if ($raw === false) {
            $query->where('ResultDateTime >= ?', $dates[0]);
            $query->where('ResultDateTime <= ?', $dates[1]);
        } else {
            $query->where("ResultDateTime >= '{$dates[0]}' AND ResultDateTime <= '{$dates[1]}'");
        }
    }

    public function convertStringToArrayForAuraBinds(string $string)
    {
        $string = str_replace('\'', '', $string); // Remove escaping quotes
        return explode(',', $string);
    }
}
