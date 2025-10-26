/**
 * Simple in-memory job store for demo / dev purposes.
 * Not persistent. Each job contains:
 *  - id, data (parsed CSV array), createdAt, status
 *  - diagnosis, forecast, recommendations, lastExecution
 */
const store = {};

function createId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

module.exports = {
  createJob: (payload) => {
    const id = createId();
    store[id] = Object.assign({ id, status: 'created' }, payload);
    return id;
  },
  getJob: (id) => {
    return store[id] || null;
  },
  updateJob: (id, patch) => {
    if (!store[id]) return null;
    store[id] = Object.assign({}, store[id], patch);
    return store[id];
  },
  _dump: () => store
};
