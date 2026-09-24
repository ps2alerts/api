import {MongoEntityManager} from 'typeorm';
import {Gauge} from 'prom-client';
import InstanceMetagameTerritoryEntity from '../modules/data/entities/instance/instance.metagame.territory.entity';
import {Ps2AlertsEventState} from '../modules/data/ps2alerts-constants/ps2AlertsEventState';

// Mirrors the host healthcheck: any state other than STARTING means the alert was recorded.
export function startAlertLiveness(em: MongoEntityManager, intervalMs = 300000): void {
    const active = new Gauge({name: 'ps2alerts_alerts_active', help: 'Metagame alerts currently running'});
    const lastStarted = new Gauge({name: 'ps2alerts_last_alert_started_timestamp_seconds', help: 'Start time of the newest recorded metagame alert'});
    // The two gauges above keep their last value when Mongo fails; this is what shows they went stale.
    const refreshed = new Gauge({name: 'ps2alerts_alerts_liveness_refreshed_timestamp_seconds', help: 'When the alert liveness gauges last refreshed successfully'});

    const refresh = async (): Promise<void> => {
        active.set(await em.count(InstanceMetagameTerritoryEntity, {state: Ps2AlertsEventState.STARTED}));

        // Newest by _id rides the default index instead of sorting on timeStarted.
        const [newest] = await em.createCursor<InstanceMetagameTerritoryEntity, InstanceMetagameTerritoryEntity>(
            InstanceMetagameTerritoryEntity,
            {state: {$ne: Ps2AlertsEventState.STARTING}},
        // eslint-disable-next-line @typescript-eslint/naming-convention
        ).sort({_id: -1}).limit(1).toArray();

        if (newest) {
            lastStarted.set(new Date(newest.timeStarted).getTime() / 1000);
        }

        refreshed.setToCurrentTime();
    };

    const tick = (): void => {
        refresh().catch(() => undefined);
    };

    tick();
    setInterval(tick, intervalMs).unref();
}
