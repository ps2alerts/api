<?php

namespace Ps2alerts\Api\Repository;

use Aura\Sql\Profiler;
use Aura\SqlQuery\AbstractQuery;
use Aura\SqlQuery\QueryFactory;
use Ps2alerts\Api\Contract\ConfigAwareInterface;
use Ps2alerts\Api\Contract\ConfigAwareTrait;
use Ps2alerts\Api\Contract\DatabaseAwareInterface;
use Ps2alerts\Api\Contract\DatabaseAwareTrait;
use Ps2alerts\Api\Contract\RedisAwareInterface;
use Ps2alerts\Api\Contract\RedisAwareTrait;
use Ps2alerts\Api\Contract\UuidAwareInterface;
use Ps2alerts\Api\Contract\UuidAwareTrait;

abstract class AbstractEndpointRepository implements
    ConfigAwareInterface,
    DatabaseAwareInterface,
    RedisAwareInterface,
    UuidAwareInterface
{
    use ConfigAwareTrait;
    use DatabaseAwareTrait;
    use RedisAwareTrait;
    use UuidAwareTrait;

    /**
     * Determines the table that the DB is interfacing with
     *
     * @return string
     */
    abstract public function getTable();

    /**
     * Determines the primary key of the table
     *
     * @return string
     */
    abstract public function getPrimaryKey();

    /**
     * Determines the Result key of the table
     *
     * @return string
     */
    abstract public function getResultKey();

    /**
     * Allows the ability to overload and swap the DB driver if required
     *
     * @return \Aura\Sql\ExtendedPdo
     */
    protected function getDbDriver()
    {
        return $this->getDatabaseDriver();
    }

    /**
     * Allows the ability to overload and swap the DB driver if required
     *
     * @return \Aura\Sql\ExtendedPdo
     */
    protected function getDbArchiveDriver()
    {
        return $this->getDatabaseArchiveDriver();
    }

    /**
     * Builds a new query factory ready for use with the QueryObjects
     *
     * @param string $type    Type of query to use, such as Select, Update etc.
     * @param bool   $newOnly Whether we're getting a new query or using a raw one
     *
     * @return \Aura\SqlQuery\QueryInterface
     */
    public function newQuery($type = 'single', $newOnly = false)
    {
        $factory = new QueryFactory('mysql');

        if ($type === 'single') {
            $query = $factory->newSelect();

            if (!$newOnly) {
                $query->from($this->getTable());
            }
        } elseif ($type === 'update') {
            $query = $factory->newUpdate();
        } elseif ($type === 'delete') {
            $query = $factory->newDelete();
        }

        return $query;
    }

    /**
     * Executes the statement to the DB and returns the results
     *
     * @param  \Aura\SqlQuery\AbstractQuery $query   Query object to execute
     * @param  boolean                      $single  Return a sinlge record or not
     * @param  boolean                      $object  Return an object or not
     * @param  boolean                      $archive Flag to force to use the archive database
     *
     * @return array
     */
    public function fireStatementAndReturn(
        $query,
        $single  = false,
        $object  = false,
        $archive = false
    ) {
        $pdo = $this->getDbDriver();
        if ($archive === true) {
            // If we've been bounced back to search the archive, load that driver
            $pdo = $this->getDbArchiveDriver();
        }

        if ($this->getConfigItem('db_query_debug') === true) {
            $pdo->setProfiler(new Profiler);
            $pdo->getProfiler()->setActive(true);
            var_dump($pdo);
            var_dump($query->getStatement());
            var_dump($query->getBindValues());
        }

        if ($single === false) {
            if ($object === false) {
                $return = $pdo->fetchAll($query->getStatement(), $query->getBindValues());
            } else {
                $return = $pdo->fetchObjects($query->getStatement(), $query->getBindValues());
            }
        } else {
            if ($object === false) {
                $return = $pdo->fetchOne($query->getStatement(), $query->getBindValues());
            } else {
                $return = $pdo->fetchObject($query->getStatement(), $query->getBindValues());
            }
        }

        if ($this->getConfigItem('db_query_debug') === true) {
            var_dump($pdo->getProfiler()->getProfiles());
        }

        // If no data, recall this function with archive flag
        if (empty($return) && $archive === false) {
            return $this->fireStatementAndReturn(
                $query,
                $single,
                $object,
                true
            );
        }

        return $return;
    }

    /**
     * Allows for Raw SQL firing without the query builder
     *
     * @param  string  $sql
     * @param  boolean $single
     *
     * @return array
     */
    public function readRaw($sql, $single = false)
    {
        $pdo = $this->getDbDriver();

        if ($single === false) {
            return $pdo->fetchAll($sql);
        }

        return $pdo->fetchOne($sql);
    }

    /**
     * Reads a single record from the database
     *
     * @param  string $id
     * @param  string $keyType
     * @param  boolean $object
     * @param  boolean $archive
     *
     * @return array
     */
    public function readSinglebyId($id, $keyType = 'primary', $object = false, $archive = false)
    {
        $query = $this->newQuery();
        $key = $this->returnKeyType($keyType);

        $query->cols(['*'])
              ->where("{$key} = ?", $id);

        return $this->fireStatementAndReturn($query, true, $object, $archive);
    }

    /**
     * Allows reading of elements by ID including those from the archive
     *
     * @param  string $id
     * @param  string $keyType
     * @param  boolean $object
     *
     * @return array
     */
    public function readSingleByIdWithArchive($id, $keyType = 'primary', $object = false)
    {
        return array_merge(
            $this->readSingleById($id, $keyType, $object),
            $this->readSingleById($id, $keyType, $object, true)
        );
    }

    /**
     * Reads all related records from the database
     *
     * @param  string  $id
     * @param  string  $keyType Field to search on
     * @param  boolean $archive
     *
     * @return array
     */
    public function readAllById($id, $keyType = 'primary', $archive = false)
    {
        $query = $this->newQuery();
        $key = $this->returnKeyType($keyType);

        $query->cols(['*'])
              ->where("{$key} = ?", $id);

        return $this->fireStatementAndReturn($query, false, false, $archive);
    }

    /**
     * Grab all data from the database including from the archive
     *
     * @param  string $id
     * @param  string $keyType
     *
     * @return array
     */
    public function readAllByIdWithArchive($id, $keyType = 'primary')
    {
        return array_merge(
            $this->readAllById($id, $keyType),
            $this->readAllById($id, $keyType, true)
        );
    }

    /**
     * Reads all records based off a simple where statement
     *
     * @param  array $fields
     *
     * @return array
     */
    public function readAllByFields($fields)
    {
        $query = $this->newQuery();
        $query->cols(['*']);

        foreach ($fields as $field => $value) {
            $query->where("{$field} = ?", $value);
        }

        return $this->fireStatementAndReturn($query);
    }

    /**
     * Returns all records with no filtering
     *
     * @return array
     */
    public function readAll()
    {
        $query = $this->newQuery();
        $query->cols(['*']);

        return $this->fireStatementAndReturn($query);
    }

    /**
     * Reads the count of records based off a where statement
     *
     * @param  array $fields
     *
     * @return array
     */
    public function readCountByFields($fields)
    {
        $query = $this->newQuery();
        $key   = $this->returnKeyType('primary');

        $query->cols(["COUNT({$key}) as COUNT"]);

        foreach ($fields as $field => $value) {
            $query->where("{$field} = ?", $value);
        }

        $result = $this->fireStatementAndReturn($query);

        // Done this to prevent the need for clients to also do this. Returns a single number this way.
        return $result[0]["COUNT"];
    }

    /**
     * Sets the proper key to search on based off a string
     *
     * @param  string $key
     *
     * @return string
     */
    public function returnKeyType($key)
    {
        switch ($key) {
            case 'result':
                return $this->getResultKey();
            case 'primary':
                return $this->getPrimaryKey();
            default:
                return $key;
        }
    }

    /**
     * Generates a quoted string which is appropiate for WHERE IN statements
     *
     * @param  array  $array
     *
     * @return string
     */
    public function generateWhereInString(array $array)
    {
        $pdo = $this->getDbDriver();
        $string = "({$pdo->quote($array)})";
        return $string;
    }
}
