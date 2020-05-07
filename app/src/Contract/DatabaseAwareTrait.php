<?php

namespace Ps2alerts\Api\Contract;

use Aura\Sql\ExtendedPdo as DBDriver;

trait DatabaseAwareTrait
{
    /**
     * @var \Aura\Sql\ExtendedPdo
     */
    protected $db;

    /**
     * @var \Aura\Sql\ExtendedPdo
     */
    protected $dbData;

    /**
     * @var \Aura\Sql\ExtendedPdo
     */
    protected $dbArchive;

    /**
     * Sets the Database driver
     *
     * @param \Aura\Sql\ExtendedPdo $db
     */
    public function setDatabaseDriver(DBDriver $db)
    {
        $this->db = $db;
    }

    /**
     * Gets the Database driver
     *
     * @return \Aura\Sql\ExtendedPdo
     */
    public function getDatabaseDriver()
    {
        return $this->db;
    }

    /**
     * Sets the Database Data driver
     *
     * @param \Aura\Sql\ExtendedPdo $db
     */
    public function setDatabaseDataDriver(DBDriver $db)
    {
        $this->dbData = $db;
    }

    /**
     * Gets the Database Data driver
     *
     * @return \Aura\Sql\ExtendedPdo
     */
    public function getDatabaseDataDriver()
    {
        return $this->dbData;
    }

    /**
     * Sets the Database Data driver
     *
     * @param \Aura\Sql\ExtendedPdo $db
     */
    public function setDatabaseArchiveDriver(DBDriver $db)
    {
        $this->dbArchive = $db;
    }

    /**
     * Gets the Database Data driver
     *
     * @return \Aura\Sql\ExtendedPdo
     */
    public function getDatabaseArchiveDriver()
    {
        return $this->dbArchive;
    }
}
