// webrtc.js
var webrtc_peers = [];
var peer_max = 2;

function init_webrtc_peers() {
    // add new peer until peer_max
    for (var i = 0; i < peer_max; i++) {
        webrtc_peers[i] = {};
        webrtc_peers[i].id = '';
        webrtc_peers[i].state = 'disconnected';
        webrtc_peers[i].metrics = [];
    }
}

function update_webrtc_peers(id, curMetrics) {
    // update the data if there is same id
    //console.log("update-peers", webrtc_peers);
    for (var i = 0; i < peer_max; i++) {
        if (webrtc_peers[i].id === id && webrtc_peers[i].state === 'connected') {
            webrtc_peers[i].metrics.push(curMetrics);
            //console.log(webrtc_peers);
            return;
        }
    }
}

function add_webrtc_peers(id) {
    // add new peer
    //console.log("add-peers ");
    for (var i = 0; i < peer_max; i++) {
        if (webrtc_peers[i].state === 'disconnected') {
            webrtc_peers[i].id = id;
            webrtc_peers[i].state = 'connected';
            webrtc_peers[i].metrics = [];
            console.log("add-peers", webrtc_peers);
            return;
        }
    }
}

function remove_webrtc_peers(id) {
    // remove peer
    console.log("remove-peers", webrtc_peers);
    for (var i = 0; i < peer_max; i++) {
        if (webrtc_peers[i].id === id) {
            webrtc_peers[i].state = 'disconnected';
            webrtc_peers[i].metrics = [];
            console.log(webrtc_peers);
            return;
        }
    }
}

var mobius_metrics = [];
function update_mobius(metric) {
    // update mobius
    //console.log("update-mobius", metric);
    mobius_metrics.push(metric);
}

module.exports = { peer_max, webrtc_peers, mobius_metrics, init_webrtc_peers, update_webrtc_peers, add_webrtc_peers, remove_webrtc_peers, update_mobius };