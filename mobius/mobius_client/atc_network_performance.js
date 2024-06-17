const http = require('http');
const https = require('https');
var shortid = require('shortid');

let successfulRequests = 0;
let failedRequests = 0;
let totalRequests = 0;
const NUM_REQUESTS = 1000; // Number of requests to send
let interval;

const options = {
  hostname: conf.cse.host,
  port: conf.cse.port,
  path: '/atc-network',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Connection': 'keep-alive',
    'X-M2M-RI': shortid.generate(),
    'Accept': 'application/' + conf.ae.bodytype,
    'X-M2M-Origin': conf.ae.id,
    'Locale': 'en'
  }
};

const options_normal = {
  hostname: na_ipaddress,
  port: 50000,
  path: '/update_mobius',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};


const sendRequestOnem2mFormat = () => {
  const clientTimestamp = Date.now();
  const payload = 'x'.repeat(1024);

  var results_ci = {};
  var bodyString = '';

  results_ci['m2m:cin'] = {};
  results_ci['m2m:cin'].con = {
    'timestamp': clientTimestamp,
    'payload': payload
  };

  bodyString = JSON.stringify(results_ci);

  if (bodyString.length > 0) {
    options.headers['Content-Length'] = bodyString.length;
  }

  // var a = '; ty=4';
  // options.headers['Content-Type'] = 'application/vnd.onem2m-res+' + conf.ae.bodytype + a;

  const req = http.request(options, (res) => {
    let data = '';
    var rtt = 0;

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        const serverTimestamp = response.serverTimestamp;
        const clientEndTimestamp = Date.now();
        //const throughput = response.throughput;

        console.log(`Client Start Timestamp: ${clientTimestamp}`);
        console.log(`Server Timestamp: ${serverTimestamp}`);
        console.log(`Client End Timestamp: ${clientEndTimestamp}`);
        console.log(`One-way delay (Client to Server): ${serverTimestamp - clientTimestamp} ms`);
        rtt = clientEndTimestamp - clientTimestamp;
        //console.log(`Round-trip delay: ${clientEndTimestamp - clientTimestamp} ms`);
        //console.log(`Throughput: ${throughput} kbps`);

        successfulRequests++;
      } catch (error) {
        console.error('Error parsing response:', error);
        failedRequests++;
      }

      totalRequests++;
      const lossRate = (failedRequests / totalRequests) * 100; // percentage

      console.log(`Total Requests: ${totalRequests}`);
      console.log(`Successful Requests: ${successfulRequests}`);
      console.log(`Failed Requests: ${failedRequests}`);
      console.log(`Loss Rate: ${lossRate}%`);

      //console.log("na address: ", na_ipaddress);
      sendnetworkmetrics(rtt, lossRate);

      if (totalRequests >= NUM_REQUESTS) {
        console.log('Test completed.');
        clearInterval(interval);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Request error:', error);
    failedRequests++;
    totalRequests++;
    const lossRate = (failedRequests / totalRequests) * 100; // percentage

    console.log(`Total Requests: ${totalRequests}`);
    console.log(`Successful Requests: ${successfulRequests}`);
    console.log(`Failed Requests: ${failedRequests}`);
    console.log(`Loss Rate: ${lossRate}%`);

    if (totalRequests >= NUM_REQUESTS) {
      console.log('Test completed.');
      clearInterval(interval);
    }
  });


  console.log(bodyString);
  req.write(bodyString);
  req.end();
};


process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
function sendnetworkmetrics(rtt, loss) {
  const metric = {
    rtt: rtt,
    loss: loss
  };

  // Ensure options_normal is defined correctly
  const req = https.request(options_normal, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        console.log("Network metrics sent successfully");
        console.log(data); // Optionally log the response data
      } catch (error) {
        console.error('Error parsing response:', error);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Request failed:', error);
  });

  console.log("Sending network metrics: ", JSON.stringify(metric));
  req.write(JSON.stringify({'rtt': rtt, 'loss': loss}));
  req.end();
}


const sendRequest = () => {
  const clientTimestamp = Date.now();

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        const serverTimestamp = response.serverTimestamp;
        const clientEndTimestamp = Date.now();
        const throughput = response.throughput;

        console.log(`Client Start Timestamp: ${clientTimestamp}`);
        console.log(`Server Timestamp: ${serverTimestamp}`);
        console.log(`Client End Timestamp: ${clientEndTimestamp}`);
        console.log(`One-way delay (Client to Server): ${serverTimestamp - clientTimestamp} ms`);
        console.log(`Round-trip delay: ${clientEndTimestamp - clientTimestamp} ms`);
        console.log(`Throughput: ${throughput} kbps`);

        successfulRequests++;
      } catch (error) {
        console.error('Error parsing response:', error);
        failedRequests++;
      }

      totalRequests++;
      const lossRate = (failedRequests / totalRequests) * 100; // percentage

      console.log(`Total Requests: ${totalRequests}`);
      console.log(`Successful Requests: ${successfulRequests}`);
      console.log(`Failed Requests: ${failedRequests}`);
      console.log(`Loss Rate: ${lossRate}%`);

      if (totalRequests >= NUM_REQUESTS) {
        console.log('Test completed.');
        clearInterval(interval);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Request error:', error);
    failedRequests++;
    totalRequests++;
    const lossRate = (failedRequests / totalRequests) * 100; // percentage

    console.log(`Total Requests: ${totalRequests}`);
    console.log(`Successful Requests: ${successfulRequests}`);
    console.log(`Failed Requests: ${failedRequests}`);
    console.log(`Loss Rate: ${lossRate}%`);

    if (totalRequests >= NUM_REQUESTS) {
      console.log('Test completed.');
      clearInterval(interval);
    }
  });

  req.write(JSON.stringify({ timestamp: clientTimestamp }));
  req.end();
};

const atc_iot_device_action = (period) => {
  interval = setInterval(sendRequestOnem2mFormat, period);
};

module.exports = atc_iot_device_action;