export const TIME_STARTED_FROM_IMPLICIT_QUERY = {
    name: 'timeStartedFrom',
    required: false,
    type: String,
};

export const TIME_STARTED_TO_IMPLICIT_QUERY = {
    name: 'timeStartedTo',
    required: false,
    type: String,
};

export const TIME_STARTED_IMPLICIT_QUERIES = {
    ...TIME_STARTED_FROM_IMPLICIT_QUERY,
    ...TIME_STARTED_TO_IMPLICIT_QUERY,
};
