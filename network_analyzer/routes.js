// routes.js
const { peer_max, webrtc_peers, mobius_metrics, update_webrtc_peers, add_webrtc_peers, remove_webrtc_peers, update_mobius } = require('./recorded_metrics.js');

module.exports = function(app) {
    // Your existing route handlers here
    // Route for serving the dashboard HTML file
    app.get('/', function (req, res) {
        res.sendFile(__dirname + '/dashboard/index.html');
    });
    
    // Route for serving the main.js file
    app.get('/main.js', function (req, res) {
        res.sendFile(__dirname + '/dashboard/main.js');
    });

    app.get('/update_dashboard', function (req, res) {
        var recent_metrics = [];
        //console.log(webrtc_peers);
        for (var i = 0; i < peer_max; i++) {
            if (webrtc_peers[i]) {
                //console.log(webrtc_peers[i]);
                var id = webrtc_peers[i].id;
                var state = webrtc_peers[i].state;
                var metrics = webrtc_peers[i].metrics;
                var recent_metric = metrics[metrics.length - 1];
                recent_metrics.push({id: id, state: state, recent_metric: recent_metric});
            }
        }

        res.json({
            success: true,
            recent_metrics : recent_metrics
        });
    });

    app.get('/get_dashboard', function (req, res) {
        var id = req.query.id;
        var metrics = [];
        console.log("Get cumulated metrics", id);
        for (var i = 0; i < peer_max; i++) {
            //console.log("Compare ", webrtc_peers[i].id, id, webrtc_peers[i].id === id)
            if (webrtc_peers[i] && webrtc_peers[i].id.toString() === id.toString()) {
                console.log("Suceess cumulated metrics", id);
                metrics = webrtc_peers[i].metrics;
                break;
            }
        }

        res.json({
            success: true,
            metrics: metrics
        });
    });

    app.post('/update_webrtc', (req, res) => {
        var id = req.body.id;
        var metrics = req.body.metrics;
        //console.log("update", id);
        update_webrtc_peers(id, metrics);
        res.json({
            success: true,
        });
    });

    app.post('/register_webrtc', (req, res) => {
        var id = req.body.id;
        console.log("register", id);
        add_webrtc_peers(id);
        res.json({
            success: true,
        });
    });

    app.post('/exit_webrtc', (req, res) => {
        var id = req.body.id;
        console.log("exit", id);
        remove_webrtc_peers(id);
        res.json({
            success: true,
        });
    });

    // Mobius
    app.post('/update_mobius', (req, res) => {
        var metric = req.body; // Directly use req.body to get the metric data
        //console.log("update mobius", metric);
        update_mobius(metric); // Assuming update_mobius function can handle the metric object directly
        res.json({
            success: true,
        });
    });

    app.get('/get_latest_mobius', function (req, res) {
        if(mobius_metrics.length === 0){
            res.json({
                success: false,
                mobius_latest_metric: []
            });
            return;
        }

        var lastest_metric = mobius_metrics[mobius_metrics.length - 1];
        res.json({
            success: true,
            mobius_latest_metric: lastest_metric
        });
    });


    app.get('/get_mobius', function (req, res) {
        console.log("Get mobius metrics");
        res.json({
            success: true,
            mobius_metrics: mobius_metrics
        });
    });
};