const https = require("https");

// Health check URL (public)
const HEALTH_CHECK_URL = "https://vitravel.onrender.com/healthz"; // Change to your actual backend URL

// Function to check server health
function checkServerHealth() {
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

// Run the health check
async function monitorServer() {
    try {
        const healthStatus = await checkServerHealth();
        console.log(healthStatus);
    } catch (error) {
        console.error(error.message);
        console.log("⚠️ Server is down! Private repo should handle restart.");
    }
}

monitorServer();
