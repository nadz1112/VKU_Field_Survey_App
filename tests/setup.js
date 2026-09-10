import 'fake-indexeddb/auto';

// Mock storage estimate if not present in happy-dom
if (!navigator.storage) {
  navigator.storage = {
    estimate: async () => ({
      usage: 1024 * 200,
      quota: 1024 * 1024 * 100
    })
  };
}
