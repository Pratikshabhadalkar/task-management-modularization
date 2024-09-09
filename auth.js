import jwt from 'jsonwebtoken';

const secret_key = 'your_secret_key';

export function handleAuthentication(req, res, callback) {
  // Ensure req and res are defined
  if (!req || !res || !req.headers) {
    if (res) {
      if (!res.headersSent) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Bad Request' }));
      }
    } else {
      console.error('Request or response object is missing.');
      return;
    }
  }

  // Extract token from authorization header
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    if (!res.headersSent) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ message: 'No token provided' }));
    }
  }

  // Verify the JWT token
  jwt.verify(token, secret_key, (err, decoded) => {
    if (err) {
      if (!res.headersSent) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Invalid token' }));
      }
    }

    // Call the callback with the decoded token if there are no errors
    if (!res.headersSent) {
      callback(decoded);
    }
  });
}
