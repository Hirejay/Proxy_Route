require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors()); // Allow requests from other origins

// Route to fetch OSRM directions
app.post("/get-route", async (req, res) => {
  try {
    const { workerLatitude, workerLongitude, clientLatitude, clientLongitude } = req.body;

    if (!workerLatitude || !workerLongitude || !clientLatitude || !clientLongitude) {
      return res.status(400).json({ success: false, message: "Missing coordinates" });
    }

    const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${workerLongitude},${workerLatitude};${clientLongitude},${clientLatitude}?overview=full&geometries=geojson`;

    const response = await axios.get(osrmUrl);

    if (!response.data.routes.length) {
      return res.status(404).json({ success: false, message: "No route found" });
    }

    return res.status(200).json({
      success: true,
      route: {
        distance: `${(response.data.routes[0].distance / 1000).toFixed(2)} km`,
        duration: `${(response.data.routes[0].duration / 60).toFixed(2)} min`,
        geometry: response.data.routes[0].geometry,
      },
    });
  } catch (error) {
    console.error("OSRM Proxy Error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

app.get('/', (req, res) => {
    res.send('Hello, This is the Proxy Route App');
});

app.get('/test', (req, res) => {
    res.send('Test proxy route working');
});

// Export for Vercel
module.exports = app;
// app.listen(PORT, () => {
//   console.log(`OSRM Proxy server running on port ${PORT}`);
// });
