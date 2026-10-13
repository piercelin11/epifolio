// Client keys for rows added in an editor card, so they keep their
// identity while they are edited and dragged before they have an id.

let lastKey = 0;

export const newKey = () => `new-${++lastKey}`;
