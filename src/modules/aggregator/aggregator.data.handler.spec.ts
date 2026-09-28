import AggregatorDataHandler from './aggregator.data.handler';
import {UpsertError} from '../../services/mongo/upsert.error';

const contextFor = (redelivered: boolean): {channel: {ack: jest.Mock, nack: jest.Mock}, message: unknown, context: never} => {
    const channel = {ack: jest.fn(), nack: jest.fn()};
    const message = {fields: {redelivered}};

    return {channel, message, context: {getChannelRef: () => channel, getMessage: () => message} as never};
};

describe('AggregatorDataHandler.upsert', () => {
    const data = {docs: [{$inc: {kills: 1}}], conditionals: [{id: 1}]} as never;

    it('acks once the write succeeds', async () => {
        const handler = new AggregatorDataHandler({upsert: jest.fn().mockResolvedValue(true)} as never);
        const {channel, message, context} = contextFor(false);

        await handler.upsert(data, context, 'Entity');

        expect(channel.ack).toHaveBeenCalledWith(message);
        expect(channel.nack).not.toHaveBeenCalled();
    });

    it('requeues a write that provably did nothing, the first time', async () => {
        const handler = new AggregatorDataHandler({upsert: jest.fn().mockRejectedValue(new UpsertError('down', true))} as never);
        const {channel, message, context} = contextFor(false);

        await handler.upsert(data, context, 'Entity');

        expect(channel.nack).toHaveBeenCalledWith(message, false, true);
        expect(channel.ack).not.toHaveBeenCalled();
    });

    it('drops a write that fails again on redelivery, so a bad message cannot loop', async () => {
        const handler = new AggregatorDataHandler({upsert: jest.fn().mockRejectedValue(new UpsertError('down', true))} as never);
        const {channel, message, context} = contextFor(true);

        await handler.upsert(data, context, 'Entity');

        expect(channel.ack).toHaveBeenCalledWith(message);
        expect(channel.nack).not.toHaveBeenCalled();
    });

    it('does not replay a write that may have half-applied, since that would double count', async () => {
        const handler = new AggregatorDataHandler({upsert: jest.fn().mockRejectedValue(new UpsertError('timeout', false))} as never);
        const {channel, message, context} = contextFor(false);

        await handler.upsert(data, context, 'Entity');

        expect(channel.ack).toHaveBeenCalledWith(message);
        expect(channel.nack).not.toHaveBeenCalled();
    });
});

describe('AggregatorDataHandler.settleGlobalFailure', () => {
    const handler = new AggregatorDataHandler({} as never);

    it('drops a message whose alert was deleted', async () => {
        const {channel, message, context} = contextFor(false);

        await handler.settleGlobalFailure(context, new Error('Instance 10-1 does not exist.'), 'pattern', '10-1');

        expect(channel.ack).toHaveBeenCalledWith(message);
    });

    it('requeues a message whose alert lookup failed, since nothing was written yet', async () => {
        const {channel, message, context} = contextFor(false);

        await handler.settleGlobalFailure(context, new Error('connection reset'), 'pattern', '10-1');

        expect(channel.nack).toHaveBeenCalledWith(message, false, true);
        expect(channel.ack).not.toHaveBeenCalled();
    });
});
