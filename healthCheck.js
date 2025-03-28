const https = require("https");

// Load secrets from GitHub Actions environment
const RENDER_SERVICE_ID = process.env.RENDER_SERVICE_ID;
const RENDER_API_KEY = process.env.RENDER_API_KEY;

const HEALTH_CHECK_URL = "https://vitravel.onrender.com/healthz"; // Change this to your actual health check URL
const RENDER_RESTART_URL = `https://api.render.com/v1/services/${RENDER_SERVICE_ID}/restart`;

if (!RENDER_SERVICE_ID || !RENDER_API_KEY) {
    console.error("❌ Missing API keys!");
    process.exit(1);
}

// Function to check server health
async function checkServerHealth() {
    return new Promise((resolve, reject) => {
        https.get(HEALTH_CHECK_URL, (res) => {
            if (res.statusCode === 200) {
                resolve("✅ Server is healthy!");
            } else {
                reject(new Error(`⚠️ Server returned status: ${res.statusCode}`));
            }
        }).on("error", (err) => reject(new Error(`❌ Health check failed: ${err.message}`)));
    });
}

// Function to restart the server using Render API
async function restartService() {
    return new Promise((resolve, reject) => {
        const options = {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${RENDER_API_KEY}`
            }
        };

        const req = https.request(RENDER_RESTART_URL, options, (res) => {
            let data = "";
            res.on("data", (chunk) => { data += chunk; });
            res.on("end", () => {
                if (res.statusCode === 200) {
                    resolve("🔄 Successfully restarted the Render service!");
                } else {
                    reject(new Error(`❌ Render API Error: ${res.statusCode} - ${data}`));
                }
            });
        });

        req.on("error", (err) => reject(new Error(`❌ Restart request failed: ${err.message}`)));
        req.end();
    });
}

// Run the health check and restart if needed
async function monitorServer() {
    try {
        const healthStatus = await checkServerHealth();
        console.log(healthStatus);
    } catch (error) {
        console.error(error.message);
        console.log("⚠️ Server is down! Restarting...");
        try {
            const restartStatus = await restartService();
            console.log(restartStatus);
        } catch (restartError) {
            console.error(restartError.message);
        }
    }
}

monitorServer();
