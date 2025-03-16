// Simple script to test the login API using built-in fetch
// Add "type": "module" to your package.json or save this with .mjs extension

// Test configuration
const API_URL = 'http://localhost:3000/api/users/login';
const TEST_EMAIL = 'taha.romdhane1999@gmail.com'; // Use your actual test email
const TEST_PASSWORD = 'your-password'; // Use your actual test password

async function testLoginApi() {
  console.log(`Testing login API at ${API_URL}...`);
  
  try {
    console.log('Sending request...');
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      })
    });
    
    console.log(`Response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Login successful!');
      console.log('Response data:', data);
    } else {
      try {
        const errorData = await response.json();
        console.log('Login failed with status:', response.status);
        console.log('Error details:', errorData);
      } catch (e) {
        console.log('Could not parse error response:', e.message);
        console.log('Raw response:', await response.text());
      }
    }
  } catch (error) {
    console.error('Error testing login API:', error.message);
  }
}

testLoginApi();
