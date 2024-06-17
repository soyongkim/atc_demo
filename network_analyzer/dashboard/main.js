var user_max = 2;
var ctx = [];
var config = [];
var throughput_chart = []; // Initialize this array based on your application's requirements

var matching_table = [];

function init_dashboard() {
    // Matching index (html's positon) and user (client)
    for(var i=0; i<user_max; i++) {
        matching_table[i] = {};
        matching_table[i].user = "";
    }
    init_throughput_chart(ctx);
}

// function init_througpuh_chart() {
// 	for (var i = 0; i < user_max; i++) {
// 		ctx[i] = document.getElementById('user_chart-' + (i+1));
// 		config[i] = {
// 			type: 'line',
// 			id: "",
// 			data: {
// 				labels: [ // Date Objects
// 					'data1',
// 					'data2',
// 					'data3',
// 					'data4',
// 					'data5',
// 				],
// 				datasets: [
// 					{
// 						borderColor: 'rgba(0,0,0,1)',
// 						backgroundColor: 'rgba(0,0,0,1)',
// 						data: [ 0, 0, 0, 0, 0 ],
// 						fill: false,
// 						datalabels: {
// 							color: 'black',
// 							align: 'top'
// 						}
// 					}
// 				]
// 			},
// 			options: {
// 				maintainAspectRatio: false,
// 				title: {
// 					text: 'Time Scale'
// 				},
// 				scales: {
// 					yAxes: [{
// 						scaleLabel: {
// 							display: true,
// 							labelString: 'Throughput'
// 						},
// 						// ticks: {
// 						// 	max: 1000,
// 						// 	min: 0
// 						// }
// 					}]
// 				},
// 				legend: {
// 					display: false
// 				},
// 				animaion: false
// 			}
// 		};
// 		myChart[i] = new Chart(ctx[i], config[i]);
// 	}
// }

function is_valid_user(user_metrics) {
    var user = user_metrics.id;
    var state = user_metrics.state;

    for(var i=0; i<user_max; i++) {
        if(user != "" && state == 'connected') {
            return true;
        }
    }

    return false;
}


function matching_user(user_metrics) {
    var user = user_metrics.id;
    //var metric = recent_metrics.recent_metric;

    for(var i=0; i<user_max; i++) {
        if(matching_table[i].user == user) {
            console.log("Matching user", user_metrics);
            update_drawing(i, user_metrics);
            return true;
        }
    }

    return false;
}

function register_user(user_metrics) {
    var user = user_metrics.id;
    for(var i=0; i<user_max; i++) {
        if(matching_table[i].user == "") {
            matching_table[i].user = user;
            $('#user-' + (i + 1)).removeClass('hide').html(user).show();
            update_drawing(i, user_metrics);
            return;
        }
    }
}


function remove_user(user_metrics) {
    var user = user_metrics.id;
    if(user == "") {
        return;
    }

    for(var i=0; i<user_max; i++) {
        if(matching_table[i].user == user) {
            matching_table[i].user = "";
            $('#user-' + (i + 1)).removeClass('hide').html('').show();
            $('#peer_id-' + (i + 1)).html('');
            $('#rtt-' + (i + 1)).html('');
            $('#packet_loss-' + (i + 1)).html('');
            $('#throughput-' + (i + 1)).html('');
            $('#jitter-' + (i + 1)).html('');
            $('#framerate-' + (i + 1)).html('');
            $('#resolution-' + (i + 1)).html('');
        }
    }

}


function update_drawing(position, user_metrics) {
    var user = user_metrics.id;
    var metric = user_metrics.recent_metric;

    console.log(user, metric);

    $('#peer_id-' + (position + 1)).html(metric.remote_id);
    $('#rtt-' + (position + 1)).html(metric.rtt);
    $('#packet_loss-' + (position + 1)).html(metric.packetloss);
    $('#throughput-' + (position + 1)).html(metric.throughput);
    $('#jitter-' + (position + 1)).html(metric.jitter);
    $('#framerate-' + (position + 1)).html(metric.framerate);
    $('#resolution-' + (position + 1)).html(metric.frameheight);

    update_throughput_chart(position, metric);
}

function init_throughput_chart(ctx) {
    for (var i = 0; i < user_max; i++) {
        ctx[i] = document.getElementById('user_chart-' + (i+1));
        config[i] = {
            type: 'line',
            id: "",
            data: {
                labels: [ // Date Objects
                    'time1',
                    'time2',
                    'time3',
                    'time4',
                    'time5',
                ],
                datasets: [
                    {
                        borderColor: 'rgba(0,0,0,1)',
                        backgroundColor: 'rgba(0,0,0,1)',
                        data: [ 0, 0, 0, 0, 0 ],
                        fill: false,
                        datalabels: {
                            color: 'black',
                            align: 'top'
                        }
                    }
                ]
            },
            options: {
                maintainAspectRatio: false,
                title: {
                    text: 'Time Scale'
                },
                scales: {
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Throughput'
                        },
                    }]
                },
                legend: {
                    display: false
                },
                animaion: false
            }
        };
        throughput_chart[i] = new Chart(ctx[i], config[i]);
    }
}

function update_throughput_chart(position, metric) {
    var date = new Date(metric.tsnow);
    var humanReadableDate = date.toLocaleTimeString();
    console.log("Time:", humanReadableDate);

    // Remove the first element from the labels array
    throughput_chart[position].data.labels.shift();
    // Add the new date to the end of the labels array
    throughput_chart[position].data.labels.push(humanReadableDate);

    // Remove the first element from the data array
    throughput_chart[position].data.datasets[0].data.shift();
    // Add the new throughput value to the end of the data array
    throughput_chart[position].data.datasets[0].data.push(metric.throughput);
    // Update the chart to reflect the new data
    throughput_chart[position].update();
}


function request_cumulated_metrics(user_position) {
    var user = matching_table[user_position - 1].user;
    if (user == "") {
        console.log("No user to request metrics from");
        return;
    }

    fetch("https://" + window.location.hostname + ":50000/get_dashboard?id=" + user)
        .then((res) => res.json())
        .then((data) => {
            console.log("Received data:", data); // Log the received data to inspect its structure

            // Check if the fetch was successful and data contains the metrics array
            if (!data.success || !Array.isArray(data.metrics)) {
                console.error("Fetch was unsuccessful or data.metrics is not an array:", data);
                return; // Exit the function if conditions are not met
            }

            // Convert data.metrics to CSV format
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "Timestamp,Throughput,RTT,Packet Loss,Jitter,Framerate,Resolution\n";
            data.metrics.forEach((metric) => {
                // Construct a CSV row for each metric
                const row = [
                    metric.tsnow,
                    metric.throughput,
                    metric.rtt === null ? 'N/A' : metric.rtt, // Handle null RTT
                    metric.packetloss,
                    metric.jitter,
                    metric.framerate,
                    `${metric.frameheight}p` // Assuming frameheight is the vertical resolution
                ].join(',');
                csvContent += row + "\n";
            });
            // Create a temporary link element to download the CSV file
            const link = document.createElement('a');
            link.href = encodeURI(csvContent);
            link.download = `${user}_metrics.csv`;
            link.click();
        })
        .catch((error) => {
            console.error("Failed to fetch or process data:", error);
        });
}


window.onload = function() {
    init_dashboard();
}


function get_mobius_metrics() {
    fetch("https://" + window.location.hostname + ":50000/get_mobius")
        .then((res) => res.json())
        .then((data) => {
            console.log("Received data:", data); // Log the received data to inspect its structure

            // Check if the fetch was successful and data contains the mobius_metrics array
            if (!data.success || !Array.isArray(data.mobius_metrics)) {
                console.error("Fetch was unsuccessful or data.mobius_metrics is not an array:", data);
                return; // Exit the function if conditions are not met
            }

            // Convert data.mobius_metrics to CSV format
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "RTT,Packet Loss\n";
            data.mobius_metrics.forEach((metric) => {
                // Construct a CSV row for each metric
                const row = [
                    metric.rtt,
                    metric.loss,
                ].join(',');
                csvContent += row + "\n";
            });
            // Create a temporary link element to download the CSV file
            const link = document.createElement('a');
            link.href = encodeURI(csvContent);
            link.download = "mobius_metrics.csv"; // Updated to use a static file name
            link.click();
        })
        .catch((error) => {
            console.error("Failed to fetch or process data:", error);
        });
}



setInterval(() => {
    //console.log("Test update_dashboard");
    fetch("https://" + window.location.hostname + ":50000/update_dashboard")
    .then((res) => res.json())
    .then((data) => {
        //console.log(data);
        var recent_metrics = data.recent_metrics;
        //console.log(recent_metrics);
        for(var i=0; i<recent_metrics.length; i++) {
            //console.log("Test 1");
            if(is_valid_user(recent_metrics[i])) {
                //console.log("Test 2");
                if(!matching_user(recent_metrics[i])) {
                    //console.log("Test 3");
                    register_user(recent_metrics[i]);
                }
            } else{
                //console.log("Test 4");
                remove_user(recent_metrics[i]);
            }
        }
    });

    fetch("https://" + window.location.hostname + ":50000/get_latest_mobius")
    .then((res) => res.json())
    .then((data) => {
        console.log(data);
        var lastest_metric = data.mobius_latest_metric;
        $('#mobius_rtt').html(lastest_metric.rtt);
        $('#mobius_loss').html(lastest_metric.loss);
    });
}, 1000); // 1000 milliseconds = 1 second



// setInterval(() => {
//     console.log("Test update_dashboard");
//     let req = https.request(options, res => {
//         res.on('data', recent_metrics => {
//             console.log(recent_metrics);
//             matching_peer(recent_metrics);
//         });
//       });
      
//       req.on('error', error => {
//         console.error(error);
//       });
      
//       req.end();


//     // for (var i = 0; i < webrtc_peers.length; i++) {
//     //     for (var j = 0; j < new_webrtc_peers.length; j++) {
//     //         if (webrtc_peers[i].id == new_webrtc_peers[j].id) {
//     //             for (var data_idx = 0; data_idx < data_max - 1; data_idx++) {
//     //                 webrtc_peers[i].data[data_idx] = webrtc_peers[i].data[data_idx + 1];
//     //             }
//     //             webrtc_peers[i].data[data_max - 1] = new_webrtc_peers[j].data;
//     //             break;
//     //         }
//     //     }
//     // }

//     // var p = 0;
//     // for (var i = 0; i < peer_max; i++) {
//     //     for (var j = p; j < peer_max; j++) {
//     //         if (config[i].id == "" || config[i].id == webrtc_peers[j].id) {
//     //             config[i].id = webrtc_peers[j].id;
//     //             $('#user' + (i + 1)).removeClass('hide').html(webrtc_peers[j].name).show();
//     //             for (var k = 0; k < data_max; k++) {
//     //                 $('#peer_id-' + (i + 1)).html(webrtc_peers[j].data[k].alaten);
//     //                 $('#rtt-' + (i + 1)).html(webrtc_peers[j].data[k].alaten);
//     //                 $('#packet_loss-' + (i + 1)).html(webrtc_peers[j].data[k].rlaten);
//     //                 $('#throughput-' + (i + 1)).html(webrtc_peers[j].data[k].loss);
//     //                 $('#jitter-' + (i + 1)).html(webrtc_peers[j].data[k].bitrate + "kbps");
//     //                 $('#framerate-' + (i + 1)).html(webrtc_peers[j].data[k].bitrate + "kbps");
//     //                 $('#resoultion-' + (i + 1)).html(webrtc_peers[j].data[k].bitrate + "kbps");
//     //                 config[i].data.datasets[0].data.splice(0, 1);
//     //                 config[i].data.datasets[0].data.push(webrtc_peers[j].data[k].bitrate);
//     //             }
//     //             p++;
//     //             break;
//     //         }
//     //     }
//     // }

//     // for (var i = 0; i < peer_max; i++) {
//     //     myChart[i].update();
//     // }
// }, 1000); // 1000 milliseconds = 1 second