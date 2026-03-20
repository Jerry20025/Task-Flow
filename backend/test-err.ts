import * as http from "http";

const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
}, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const token = JSON.parse(data).data.accessToken;

        const orgReq = http.request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/v1/orgs',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }, orgRes => {
            let orgData = '';
            orgRes.on('data', chunk => orgData += chunk);
            orgRes.on('end', () => console.log(orgData));
        });

        orgReq.write(JSON.stringify({ org_name: "test" }));
        orgReq.end();
    });
});
req.write(JSON.stringify({ email: "john@example.com", password: "Password123" }));
req.end();
