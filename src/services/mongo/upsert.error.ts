/**
 * A failed upsert, marked with whether any part of it may already be in the database. Replaying a message that
 * wrote nothing is safe; replaying one that half-applied its increments counts them twice.
 */
export class UpsertError extends Error {
    constructor(message: string, public readonly nothingWritten: boolean) {
        super(message);
    }
}
