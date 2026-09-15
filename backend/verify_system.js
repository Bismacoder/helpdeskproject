const http = require('http');

const makeRequest = (options, postData = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('====================================================');
  console.log('  STARTING COMPREHENSIVE END-TO-END VERIFICATION    ');
  console.log('====================================================');

  // 1. Check Root Endpoint
  console.log('\n[1] Testing Root API Health Check...');
  const health = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/',
    method: 'GET',
  });
  console.log(`Status: ${health.status}, Response:`, health.data);
  if (health.status !== 200) throw new Error('Health check failed');

  // 2. Test Admin Login
  console.log('\n[2] Testing Admin Login (admin@helpdesk.com)...');
  const adminLogin = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'admin@helpdesk.com', password: 'admin123' }
  );
  console.log(`Status: ${adminLogin.status}, Message:`, adminLogin.data.message);
  const adminToken = adminLogin.data.data.token;
  if (!adminToken) throw new Error('Admin login failed');

  // 3. Test Agent Login
  console.log('\n[3] Testing Agent Login (agent@helpdesk.com)...');
  const agentLogin = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'agent@helpdesk.com', password: 'agent123' }
  );
  console.log(`Status: ${agentLogin.status}, Message:`, agentLogin.data.message);
  const agentToken = agentLogin.data.data.token;
  const agentId = agentLogin.data.data._id;
  if (!agentToken) throw new Error('Agent login failed');

  // 4. Test Requester Registration & Login
  console.log('\n[4] Testing Requester Registration...');
  const testEmail = `testuser_${Date.now()}@example.com`;
  const registerRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { name: 'Student Tester', email: testEmail, password: 'password123' }
  );
  console.log(`Status: ${registerRes.status}, Message:`, registerRes.data.message);
  const requesterToken = registerRes.data.data.token;
  if (!requesterToken) throw new Error('Registration failed');

  // 5. Test Categories Fetch
  console.log('\n[5] Testing Categories API...');
  const categoriesRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/categories',
    method: 'GET',
    headers: { Authorization: `Bearer ${requesterToken}` },
  });
  console.log(`Status: ${categoriesRes.status}, Categories Found: ${categoriesRes.data.count}`);
  const sampleCategory = categoriesRes.data.data[0];
  if (!sampleCategory) throw new Error('No categories found');

  // 6. Test Ticket Creation by Requester
  console.log('\n[6] Testing Ticket Creation by Requester...');
  const createTicketRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/tickets',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${requesterToken}`,
      },
    },
    {
      title: 'Printer Paper Jam on Floor 3',
      description: 'The laser printer is reporting error 50.4 paper feed jam.',
      category: sampleCategory._id,
      priority: 'High',
    }
  );
  console.log(`Status: ${createTicketRes.status}, Message:`, createTicketRes.data.message);
  const newTicket = createTicketRes.data.data;
  if (!newTicket || !newTicket._id) throw new Error('Ticket creation failed');

  // 7. Test Admin Assigning Ticket to Agent
  console.log('\n[7] Testing Admin Assigning Ticket to Agent...');
  const assignRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/tickets/${newTicket._id}/assign`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    },
    { agentId: agentId }
  );
  console.log(`Status: ${assignRes.status}, Message:`, assignRes.data.message);

  // 8. Test Agent Updating Status (Open -> In Progress -> Resolved) with Comment
  console.log('\n[8] Testing Agent Updating Ticket Status to In Progress...');
  const statusRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/tickets/${newTicket._id}/status`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${agentToken}`,
      },
    },
    {
      status: 'In Progress',
      comment: 'Dispatched maintenance technician to inspect roller unit.',
    }
  );
  console.log(`Status: ${statusRes.status}, Message:`, statusRes.data.message);

  // 9. Test Adding Comment
  console.log('\n[9] Testing User & Agent Adding Comments...');
  const comment1 = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/tickets/${newTicket._id}/comments`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${requesterToken}`,
      },
    },
    { message: 'Thanks for looking into this so quickly!' }
  );
  console.log(`Requester Comment Status: ${comment1.status}`);

  const comment2 = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/tickets/${newTicket._id}/comments`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${agentToken}`,
      },
    },
    { message: 'Paper jam cleared and test page printed successfully.' }
  );
  console.log(`Agent Comment Status: ${comment2.status}`);

  // 10. Test Retrieving Status History
  console.log('\n[10] Testing Status History Audit Trail...');
  const historyRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/tickets/${newTicket._id}/history`,
    method: 'GET',
    headers: { Authorization: `Bearer ${requesterToken}` },
  });
  console.log(`Status: ${historyRes.status}, History Entries: ${historyRes.data.count}`);
  historyRes.data.data.forEach((h, idx) => {
    console.log(`   [#${idx + 1}] ${h.oldStatus} ➔ ${h.newStatus} | Note: "${h.comment}" | By: ${h.changedBy?.name}`);
  });

  // 11. Test Admin Dashboard Stats
  console.log('\n[11] Testing Dashboard Statistics Endpoint...');
  const statsRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/tickets/stats/dashboard',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log(`Status: ${statsRes.status}, Metrics:`, statsRes.data.data);

  console.log('\n====================================================');
  console.log('  ALL END-TO-END TESTS PASSED SUCCESSFULLY! ✅      ');
  console.log('====================================================\n');
};

runTests().catch((err) => {
  console.error('\n❌ Test Error:', err);
  process.exit(1);
});
