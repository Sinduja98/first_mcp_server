const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

app.post('/ozwell/session', async (req, res) => {
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
