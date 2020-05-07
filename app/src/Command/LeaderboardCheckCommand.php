<?php

namespace Ps2alerts\Api\Command;

use Ps2alerts\Api\Command\BaseCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class LeaderboardCheckCommand extends BaseCommand
{
    protected $config;
    protected $redis;

    protected function configure()
    {
        parent::configure(); // See BaseCommand.php
        $this
            ->setName('Leaderboards:Check')
            ->setDescription('Checks all leaderboards for updates');

        $this->config = $this->container->get('config');
        $this->redis = $this->container->get('redis');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $this->checkPlayerLeaderboards($output);
    }

    public function checkPlayerLeaderboards(OutputInterface $output)
    {
        $output->writeln("Checking Player Leaderboards");
        $date = date('U');
        $deadline = $date - 21600; // 6 hours ago

        $servers = $this->config['servers'];
        $servers[] = 0;

        foreach ($servers as $server) {
            $output->writeln("Checking Server {$server}");

            $key = "ps2alerts:api:leaderboards:status:{$server}";
            $resultKey = "ps2alerts:api:leaderboards:lastResult:{$server}";

            if (!$this->redis->exists($key)) {
                $output->writeln("Key doesn't exist for server {$server}! Forcing!");
                $this->update($server, $output);
                continue;
            }

            $data = json_decode($this->redis->get($key), true);

            if ($data['beingUpdated'] == 1) {
                $output->writeln("Server {$server} is currently being updated. Deferring.");
                continue;
            }

            $query = $this->auraFactory->newSelect();
            $query->cols(['ResultID']);
            $query->from('ws_results');
            if ($server !== 0) {
                $query->where('ResultServer = ?', $server);
            }
            $query->where('InProgress = ?', 0);
            $query->orderBy(['ResultID DESC']);
            $query->limit(1);

            $statement = $this->db->prepare($query->getStatement());
            $statement->execute($query->getBindValues());

            $row = $statement->fetch(\PDO::FETCH_OBJ);
            $force = false;

            if (!$this->redis->exists($resultKey)) {
                $force = true;
            } else {
                $lastResult = $this->redis->get($resultKey);
                if ($lastResult != $row->ResultID) {
                    $force = true;
                }
            }

            if ($force === true) {
                $output->writeln("Forcing...");
            }

            if ($data['lastUpdated'] <= $deadline || $force === true) {
                $this->update($server, $output);
                $this->redis->set($resultKey, $row->ResultID);
            }
        }
    }

    /**
     * @param integer $server
     * @param OutputInterface $output
     */
    public function update($server, $output) {
        $output->writeln("Executing update for server: {$server}");

        $command = "php {$this->config['commands_path']} Leaderboard:Players {$server}";
        exec($command);
    }
}
