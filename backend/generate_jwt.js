const jwt = require('jsonwebtoken');

const payload = {
  username: 'testuser',
  role: 'user'
};

const secretKey = 'your_jwt_secret_key';

const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });

console.log('Generated JWT token:');
console.log(token);
