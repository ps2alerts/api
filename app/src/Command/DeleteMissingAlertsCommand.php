<?php

namespace Ps2alerts\Api\Command;

use Ps2alerts\Api\Command\BaseCommand;
use Ps2alerts\Api\Repository\AlertRepository;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class DeleteMissingAlertsCommand extends BaseCommand
{
    protected $alertRepo;
    protected $alertProcessor;

    protected function configure()
    {
        parent::configure(); // See BaseCommand.php
        $this
            ->setName('DeleteMissingAlerts')
            ->setDescription('Deletes all missing alerts');

        $this->alertRepo = $this->container->get('Ps2alerts\Api\Repository\AlertRepository');
        $this->alertProcessor = new DeleteAlertCommand();
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $query = $this->auraFactory->newSelect();
        $query->from('ws_results');
        $query->cols(['ResultID']);
        $query->orderBy(['ResultID DESC']);

        $allQuery = $this->db->prepare($query->getStatement());
        $allQuery->execute($query->getBindValues());

        $result = $allQuery->fetch(\PDO::FETCH_OBJ);

        $count = 0;
        $missing = 0;
        $max = $result->ResultID;

        while($count < $max) {
            $count++;

            $per = round(($count / $max) * 100, 2);

            $output->writeln("{$count} / {$max} - {$per}%");

            $pdo = $this->auraFactory->newSelect();
            $pdo->from('ws_results');
            $pdo->cols(['ResultID']);
            $pdo->where('ResultID = ?', $count);

            $alertQuery = $this->db->prepare($pdo->getStatement());
            $alertQuery->execute($pdo->getBindValues());

            $alert = $alertQuery->fetch(\PDO::FETCH_OBJ);

            if (empty($alert)) {
                $missing++;
                $output->writeln("ALERT #{$count} DOES NOT EXIST!");
                $this->alertProcessor->processAlert($count, $output, true);
            }
        }

        $output->writeln("{$missing} missing alerts processed!");
    }
}
