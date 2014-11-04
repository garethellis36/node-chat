// TODO complete the server-sent-event module
module.exports = sse;
sse.start = start;

function sse(res,name,data) {
  // send a server-sent event
  // TODO set event name
  // TODO send data as JSON
  res.write("event: " + name + "\n");
  res.write("data: " + JSON.stringify(data) + "\n\n");
}

function start(res) {
  // start a server-sent event
  // TODO set headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  res.write("\n");
}
