import AggregatorDataHandler from './aggregator.data.handler';

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

    it('requeues a failed write the first time instead of acking it', async () => {
        const handler = new AggregatorDataHandler({upsert: jest.fn().mockRejectedValue(new Error('down'))} as never);
        const {channel, message, context} = contextFor(false);

        await handler.upsert(data, context, 'Entity');

        expect(channel.nack).toHaveBeenCalledWith(message, false, true);
        expect(channel.ack).not.toHaveBeenCalled();
    });

    it('drops a write that fails again on redelivery, so a bad message cannot loop', async () => {
        const handler = new AggregatorDataHandler({upsert: jest.fn().mockRejectedValue(new Error('down'))} as never);
        const {channel, message, context} = contextFor(true);

        await handler.upsert(data, context, 'Entity');

        expect(channel.ack).toHaveBeenCalledWith(message);
        expect(channel.nack).not.toHaveBeenCalled();
    });
});
