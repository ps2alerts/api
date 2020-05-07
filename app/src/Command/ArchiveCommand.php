<?php

namespace Ps2alerts\Api\Command;

use Ps2alerts\Api\Command\BaseCommand;
use Ps2alerts\Api\Repository\AlertRepository;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class ArchiveCommand extends BaseCommand
{
    protected $dbArchive;
    protected $alertRepo;
    protected $guzzle;
    protected $recordsArchived = 0;
    protected $alertsArchived = 0;

    protected function configure()
    {
        parent::configure(); // See BaseCommand.php
        $this
            ->setName('Archive')
            ->setDescription('Archives old alerts')
            ->addArgument('start', InputArgument::OPTIONAL, 'ResultID to start from')
            ->addArgument('process', InputArgument::OPTIONAL, 'Number of results to process');
        $this->dbArchive = $this->container->get('Database\Archive');
        $this->alertRepo = $this->container->get('Ps2alerts\Api\Repository\AlertRepository');
        $this->guzzle = $this->container->get('GuzzleHttp\Client');
    }

    /**
     * Execution
     *
     * @param  InputInterface   $input
     * @param  OutputInterface $output
     *
     * @return void
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $output->writeln('Executing archive operations...');

        $this->check($input, $output);
    }

    /**
     * Checks for alerts to be archived then runs routing against said alerts
     *
     * @param  OutputInterface $output
     *
     * @return void
     */
    public function check(InputInterface $input, OutputInterface $output)
    {
        $obj = new \DateTime();
        $obj->sub(new \DateInterval('P3D'));

        $query = $this->alertRepo->newQuery();
        $query->cols(['*']);
        $query->where('ResultStartTime < ?', $obj->format('U'));
        $query->where('Archived = 0');

        if (!empty($input->getArgument('start'))) {
            $query->where('ResultID >= ?', $input->getArgument('start'));
        }

        if (!empty($input->getArgument('process'))) {
            $query->where('ResultID <= ?', $input->getArgument('process'));
        }

        $alerts = $this->alertRepo->fireStatementAndReturn($query);
        $count = count($alerts);

        $output->writeln("Detected {$count} alerts to be archived");

        if ($count > 0) {
            $tables = [
                'ws_classes',
                'ws_classes_totals',
                'ws_combat_history',
                'ws_factions',
                'ws_map',
                'ws_map_initial',
                'ws_outfits',
                'ws_players',
                'ws_pops',
                'ws_vehicles',
                'ws_weapons',
                'ws_xp'
            ];

            for ($i = 0; $i < $count; $i++) {
                $this->archive($alerts[$i], $tables, $output);

                $per = ($i / $count) * 100;
                $per = round($per, 2);
                $output->writeln("{$i} / {$count} ({$per}%) processed");
            }
        }

        $records = number_format($this->recordsArchived, 0);

        $payload = [
            'channel' => '#logs',
            'username' => 'ps2alerts-archive',
            'text' => "Alerts archived: {$this->alertsArchived} - Records archived: {$records}",
            'icon_emoji' => ':open_file_folder:'
        ];

        $this->guzzle->request(
            'POST',
            'https://hooks.slack.com/services/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',
            ['json' => $payload]
        );

        $output->writeln("Archived {$records} records!");
    }

    /**
     * Execution of routine
     *
     * @param  array                                            $alert
     * @param  array                                            $tables
     * @param  Symfony\Component\Console\Output\OutputInterface $output
     *
     * @return void
     */
    public function archive($alert, $tables, OutputInterface $output)
    {
        $output->writeln("Processing Alert #{$alert['ResultID']}");

        $this->dbArchive->beginTransaction();

        // Get all data and insert it into the archive DB
        foreach ($tables as $table) {
            $output->writeln("Alert #{$alert['ResultID']} - Table: {$table}");

            $sql = "SELECT * FROM {$table} WHERE resultID = :result";

            $stm = $this->db->prepare($sql);
            $stm->bindParam(':result', $alert['ResultID']);
            $stm->execute();

            if ($stm->rowCount() > 0) {
                $values = '';
                $cols = '';

                // Build the values so we can do all of this in one huge query,
                // which helps with transmission over the internet greatly.
                while ($row = $stm->fetch(\PDO::FETCH_ASSOC)) {
                    $cols = $this->buildCols($row);
                    $data = $this->buildValues($row);
                    $values .= "('{$data}'),";
                }

                $values = rtrim($values, ',');
                $sql = "INSERT INTO {$table} ({$cols}) VALUES {$values}";

                $this->dbArchive->exec($sql);
            }
        }

        try {
            $output->writeln('Committing...');
            $this->dbArchive->commit();
        } catch (\Exception $e) {
            $this->dbArchive->rollBack();
            throw new \Exception($e->getMessage());
        }

        $records = 0;

        $this->db->beginTransaction();

        // Loop through all tables and delete the alert's data from the DB
        foreach ($tables as $table) {
            $sql = "DELETE FROM {$table} WHERE resultID = :result";
            $stm = $this->db->prepare($sql);
            $stm->execute(['result' => $alert['ResultID']]);

            $this->recordsArchived += $stm->rowCount();
            $records += $stm->rowCount();

            $output->writeln("Archived {$stm->rowCount()} from Alert #{$alert['ResultID']} - Table {$table}");
        }

        $this->db->commit();

        $output->writeln("{$records} records archived for Alert #{$alert['ResultID']}");
        $this->alertsArchived++;

        // Set the alert as archived in the resultset
        $sql = "UPDATE ws_results SET Archived = '1' WHERE ResultID = :result";
        $stm = $this->db->prepare($sql);
        $stm->execute(['result' => $alert['ResultID']]);
    }

    /**
     * Builds the columns of the insert query
     *
     * @param  array $row
     *
     * @return string
     */
    public function buildCols($row)
    {
        $keys = [];
        foreach ($row as $key => $val) {
            $keys[] = (string) $key;
        }

        return implode(",", $keys);
    }

    /**
     * Builds the values of the insert query
     *
     * @param  array $row
     *
     * @return string
     */
    public function buildValues($row)
    {
        $values = [];
        foreach ($row as $key => $val) {
            $val = str_replace("'", '', $val); // Remove any apostophies from char names
            $values[] = $val;
        }

        return implode("','", $values);
    }
}
