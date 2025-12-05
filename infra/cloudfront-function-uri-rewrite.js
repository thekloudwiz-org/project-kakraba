function handler(event) {
    var request = event.request;
    var uri = request.uri;
    
    // Handle creator portal routes
    if (uri.startsWith('/creator')) {
        // If requesting /creator or /creator/ serve the index
        if (uri === '/creator' || uri === '/creator/') {
            request.uri = '/creator/index.html';
        }
        // If requesting a creator route without extension, serve the index
        else if (!uri.match(/\.[a-zA-Z0-9]+$/)) {
            request.uri = '/creator/index.html';
        }
    }
    // Handle fan portal routes
    else if (uri.startsWith('/fan')) {
        // If requesting /fan or /fan/ serve the index
        if (uri === '/fan' || uri === '/fan/') {
            request.uri = '/fan/index.html';
        }
        // If requesting a fan route without extension, serve the index
        else if (!uri.match(/\.[a-zA-Z0-9]+$/)) {
            request.uri = '/fan/index.html';
        }
    }
    // Handle landing page routes
    else {
        // If requesting root or a route without extension, serve landing page index
        if (uri === '/' || (!uri.match(/\.[a-zA-Z0-9]+$/) && !uri.startsWith('/assets'))) {
            request.uri = '/index.html';
        }
    }
    
    return request;
}
