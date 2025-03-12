// Simple script to test the login API
const fetch = require('node-fetch');

async function testLoginApi() {
  console.log('Testing login API...');
  
  try {
    const response = await fetch('http://localhost:3000/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com', // Replace with a valid email from your database
        password: 'password123'    // Replace with the correct password
      }),
      // Set a longer timeout
      timeout: 30000 // 30 seconds
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Login successful:', data);
    } else {
      const errorData = await response.json();
      console.log('Login failed with status:', response.status);
      console.log('Error details:', errorData);
    }
  } catch (error) {
    console.error('Error testing login API:', error);
  }
}

testLoginApi();
