import { SERVER_URL } from '#config/config.js';

fetch(`${SERVER_URL}/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'Wisso124214',
    email: 'wisso124214@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  }),
})
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => {
    console.error('Error:', error);
  });
