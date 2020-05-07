<?php

namespace Ps2alerts\Api\Command;

use Ps2alerts\Api\Command\BaseCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class LeaderboardOutfitsCommand extends BaseCommand
{
    protected $redis;

    protected function configure()
    {
        parent::configure(); // See BaseCommand.php
        $this
            ->setName('Leaderboards:Outfits')
            ->setDescription('Processes all outfit leaderboards');

        $this->redis = $this->container->get('redis');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $start = microtime(true);
        $output->writeln("Running Player Leaderboards");

        $this->playerLeaderboards($output);

        $end = microtime(true);
        $output->writeln("Processing took ".gmdate("H:i:s", ($end - $start)));
    }

    public function playerLeaderboards(OutputInterface $output)
    {
        $metrics = [
            'playerKills',
            'playerDeaths',
            'playerTeamkills',
            'playerSuicides',
            'headshots'
        ];
        $servers = [0, 1, 10, 13, 17, 25, 1000, 2000];

        foreach ($servers as $server) {
            foreach ($metrics as $metric) {
                $this->markAsBeingUpdated($metric, $server);
            }
        }

        foreach ($servers as $server) {
            foreach ($metrics as $metric) {
                $count = 0;
                $limit = 10000;
                $ladderLimit = 10000;
                $pos = 1;

                $output->writeln("Running metric: {$metric} for server {$server}");

                $list = "ps2alerts:api:leaderboards:players:{$metric}:list-{$server}";

                // Delete the list for reprocessing
                if ($this->redis->exists($list)) {
                    $this->redis->del($list);
                }

                // Continue with loop until we don't have a count % modulus returning from the query
                while ($count < $ladderLimit && $count % $limit === 0 || $count === 0) {
                    $per = ($count / $ladderLimit) * 100;
                    $output->writeln("========= {$count} / {$ladderLimit} ({$per}%) =========");

                    $query = $this->auraFactory->newSelect();
                    $query->cols(['*']);
                    $query->from('ws_players_total');

                    if ($server !== 0) {
                        $query->where('playerServer', $server);
                    }

                    $query->orderBy([$metric . ' DESC']);
                    $query->limit($limit);
                    $query->offset($count);

                    $statement = $this->db->prepare($query->getStatement());
                    $statement->execute($query->getBindValues());

                    $count = $count + $statement->rowCount();

                    while ($player = $statement->fetch(\PDO::FETCH_OBJ)) {
                        $playerPosKey = "ps2alerts:api:leaderboards:players:pos:{$player->playerID}";

                        // If player record doesn't exist
                        if (!$this->redis->exists($playerPosKey)) {
                            $data = [
                                'id'      => $player->playerID,
                                'updated' => date('U', strtotime('now'))
                            ];
                        } else {
                            $data = json_decode($this->redis->get($playerPosKey), true);
                        }

                        // For first time running
                        if (!empty($data[$server][$metric])) {
                            $data[$server][$metric]['old'] = $data[$server][$metric]['new'];
                        } else {
                            $data[$server][$metric]['old'] = 0;
                        }

                        $data[$server][$metric]['new'] = $pos;
                        $data['updated'] = date('U', strtotime('now'));

                        $this->redis->set($playerPosKey, json_encode($data));
                        $this->redis->rpush($list, $player->playerID);

                        $pos++;
                    }
                }

                $this->markAsComplete($metric, $server);
            }
        }
    }

    /**
     * @param string $metric
     * @param integer $server
     */
    public function markAsBeingUpdated($metric, $server)
    {
        $key = "ps2alerts:api:leaderboards:status:{$metric}:{$server}";

        // Create the key if it doesn't exist for some reason (1st runs)
        if (!$this->redis->exists($key)) {
            $data = [
                'beingUpdated' => 1,
                'lastUpdated'  => 'never'
            ];
        } else {
            $data = $this->redis->get($key);
            $data['beingUpdated'] = 1;
        }

        $this->redis->set($key, json_encode($data));
    }

    /**
     * @param string $metric
     * @param integer $server
     */
    public function markAsComplete($metric, $server)
    {
        $key = "ps2alerts:api:leaderboards:status:{$metric}:{$server}";

        $data = [
            'beingUpdated' => 0,
            'lastUpdated'  => date('U', strtotime('now'))
        ];

        $this->redis->set($key, json_encode($data));
    }
}
