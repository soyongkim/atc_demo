// network_analyze_https.js
const { app, servers, port } = require('./server.js');
const { peer_max, webrtc_peers, init_webrtc_peers, update_webrtc_peers, add_webrtc_peers, remove_webrtc_peers } = require('./recorded_metrics.js');
const setupRoutes = require('./routes.js');

init_webrtc_peers();
setupRoutes(app, peer_max, webrtc_peers, update_webrtc_peers, add_webrtc_peers, remove_webrtc_peers);

servers.listen(port, () => {
    console.log(`server is listening at localhost:${port}`);
});