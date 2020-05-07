<?php

namespace Ps2alerts\Api\Contract;

use Aura\Sql\ExtendedPdo as DBDriver;

interface DatabaseAwareInterface
{
    /**
     * Sets the Database driver
     *
     * @param \Aura\Sql\ExtendedPdo $db
     */
    public function setDatabaseDriver(DBDriver $db);

    /**
     * Gets the Database driver
     *
     * @return \Aura\Sql\ExtendedPdo
     */
    public function getDatabaseDriver();

    /**
     * Sets the DatabaseData driver
     *
     * @param \Aura\Sql\ExtendedPdo $dbData
     */
    public function setDatabaseDataDriver(DBDriver $dbData);

    /**
     * Gets the DatabaseData driver
     *
     * @return \Aura\Sql\ExtendedPdo
     */
    public function getDatabaseDataDriver();

    /**
     * Sets the Database Archive driver
     *
     * @param \Aura\Sql\ExtendedPdo $db
     */
    public function setDatabaseArchiveDriver(DBDriver $db);

    /**
     * Gets the Database Archive driver
     *
     * @return \Aura\Sql\ExtendedPdo
     */
    public function getDatabaseArchiveDriver();
}
