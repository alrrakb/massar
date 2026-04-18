const fetch = require('node-fetch'); // أو استخدم fetch العادي لو النسخة حديثة

async function getMyEmail() {
  const response = await fetch('https://api.supabase.com/v1/me', {
    headers: {
      'Authorization': 'Bearer sbp_6931716ec1d77a9a307fff64d3cad9b4a6f6c452'
    }
  });
  const data = await response.json();
  console.log('Your Email is:', data.primary_email);
}

getMyEmail();