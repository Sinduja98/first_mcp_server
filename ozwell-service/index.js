const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const app = express();
const path = require('path');
dotenv.config();

app.use(express.json());

// Serve config from .env
app.get('/config', (req, res) => {
  res.json({
    apiKey: process.env.OZWELL_API_KEY,
    workspaceId: process.env.OZWELL_WORKSPACE_ID,
    userId: process.env.OZWELL_USER_ID
  });
});

app.post('/session', async (req, res) => {
  const { apiKey, workspaceId, userId } = req.body;

  try {
    const response = await axios.post(
      `https://ai.bluehive.com/api/v1/workspaces/${workspaceId}/create-user-session`,
      {
        userId,
        metaData: {
          createListenSession: true,
          forceNewSession: true,
          embedType: "iframe-basic"
        }
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ loginUrl: response.data.loginUrl });
  } catch (err) {
    res.status(err.response?.status || 500).json({
      error: 'Ozwell API call failed',
      details: err.response?.data || err.message
    });
  }
});

app.listen(5000, () => console.log("Ozwell service running on port 5000"));
