import {config} from './index';

describe('rabbitmq queue options', () => {
    // RabbitMQ refuses a redeclare with different arguments, so these must equal the aggregator's ApiQueue
    it('declares the api queue memory-only, matching the aggregator', () => {
        expect(config().rabbitmq.queueOptions).toEqual({
            durable: false,
            messageTtl: 10800000,
        });
    });
});
