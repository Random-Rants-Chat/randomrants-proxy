export default {
  async fetch(request, env, ctx) {
    // 1. Define your target (Render)
    const TARGET_URL = "https://random-rants-plus.onrender.com";
    
    // 2. Parse the incoming request URL
    const url = new URL(request.url);
    const target = new URL(TARGET_URL);

    // 3. Copy the path and query params (e.g., /socket.io/?EIO=4...)
    url.hostname = target.hostname;
    url.protocol = target.protocol;
    url.port = target.port;

    // 4. Handle WebSocket Upgrades specifically
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader === 'websocket') {
      return await handleWebSocket(request, url);
    }

    // 5. Handle Standard HTTP Requests (GET, POST, PUT, etc.)
    // We create a new request with the same body and headers
    const newRequest = new Request(url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: 'follow'
    });

    // 6. Send to Render and return the response
    return fetch(newRequest);
  }
};

// Helper function to handle the WebSocket handshake
async function handleWebSocket(request, url) {
  // Create a new request specifically for the WebSocket handshake
  const wsRequest = new Request(url, {
    method: request.method,
    headers: request.headers,
    redirect: 'follow'
  });

  // Fetch the remote WebSocket
  const response = await fetch(wsRequest);

  // If the remote server accepted the upgrade (Status 101), return it
  if (response.status === 101) {
    // Cloudflare Workers automatically handles the piping of the WebSocket
    return response;
  }
  
  // If it failed, return the error
  return response;
}