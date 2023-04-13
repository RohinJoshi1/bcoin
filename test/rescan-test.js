const assert = require('bsert');
const bcoin = require('../lib/bcoin');
const { Rescan } = require('../lib/client');

// Create a test function
async function testRescan() {
  // Create the Bcoin SPV node
  const node = new bcoin.SPVNode({
    network: 'testnet',
    db: 'memory',
  });

  // Open the node
  await node.open();

  // Set up Rescan options
  const options = {
    watchAddresses: ['tb1q4z4cl3qfneu23h0zvy7f93lyvfnz0s2ze0mjfa'], // Addresses to watch for transactions
    startHeight: 1000000, // Optional start height (defaults to latest known height)
    endHeight: 1001000, // Optional end height (defaults to continuing until stopped)
    watchUnconfirmed: false, // Set to true to watch unconfirmed transactions
  };

  // Create the Rescan object
  const rescan = new Rescan(node.pool, options);

  // Register for block notifications
  let connectedCount = 0;
  let disconnectedCount = 0;
  rescan.on('block', (entry, txs) => {
    connectedCount++;
  });
  rescan.on('blockdisconnect', (entry, txs) => {
    disconnectedCount++;
  });

  // Register for transaction notifications
  let txCount = 0;
  rescan.on('tx', (tx) => {
    txCount++;
  });

  // Start the Rescan
  await rescan.open();

  // Wait for Rescan to complete
  await rescan.finished();

  // Verify that the Rescan worked as expected
  assert.strictEqual(connectedCount, 1001, 'Connected blocks count is incorrect');
  assert.strictEqual(disconnectedCount, 0, 'Disconnected blocks count is incorrect');
  assert.strictEqual(txCount, 1, 'Received transaction count is incorrect');

  // Close the node
  await node.close();
}

// Run the test
testRescan()
  .then(() => console.log('Rescan test passed!'))
  .catch((err) => console.error('Rescan test failed:', err));
