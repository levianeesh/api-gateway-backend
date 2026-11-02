import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  const [keyInfo, setKeyInfo] = useState({ hasKey: false, prefix: "" });
  const [newRawKey, setNewRawKey] = useState("");
  const [webhooks, setWebhooks] = useState([]);
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [logs, setLogs] = useState([]);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch API Key status
        const keyRes = await axios.get("http://localhost:5000/api-keys", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setKeyInfo(keyRes.data);
        const analyticsRes = await axios.get(
          "http://localhost:5000/analytics/logs",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        // Format the date to look nice on the chart
        const formattedLogs = analyticsRes.data.map((log) => ({
          ...log,
          time: new Date(log.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
        }));
        setLogs(formattedLogs);

        // Fetch Webhooks
        const webhookRes = await axios.get("http://localhost:5000/webhooks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWebhooks(webhookRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [token, navigate]);

  const generateKey = async () => {
    if (
      window.confirm(
        "Generating a new key will invalidate your old one. Continue?",
      )
    ) {
      try {
        const response = await axios.post(
          "http://localhost:5000/api-keys/generate",
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setNewRawKey(response.data.rawKey);
        setKeyInfo({
          hasKey: true,
          prefix: response.data.rawKey.substring(0, 16),
        });
      } catch (error) {
        console.error("Error generating key:", error);
      }
    }
  };

  const registerWebhook = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/webhooks/register",
        { url: newWebhookUrl },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      // Add the new webhook to the UI list immediately
      setWebhooks([
        ...webhooks,
        {
          _id: response.data.webhookId,
          url: newWebhookUrl,
          secret: response.data.secret,
        },
      ]);
      setNewWebhookUrl(""); // Clear the input
    } catch (error) {
      console.error("Error registering webhook:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "40px auto",
        padding: "2rem",
        fontFamily: "sans-serif",
        color: "#333",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "white",
        }}
      >
        <h1>Developer Dashboard</h1>
        <button
          onClick={handleLogout}
          style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
        >
          Log Out
        </button>
      </div>

      <hr style={{ margin: "20px 0" }} />

      {/* API KEY SECTION */}
      <section
        style={{
          backgroundColor: "#f4f4f9",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h2>API Key Management</h2>
        {keyInfo.hasKey ? (
          <p>
            <strong>Active Key:</strong> {keyInfo.prefix}****************
          </p>
        ) : (
          <p>You do not have an active API key.</p>
        )}

        {newRawKey && (
          <div
            style={{
              backgroundColor: "#e6ffe6",
              padding: "15px",
              border: "1px solid green",
              margin: "15px 0",
            }}
          >
            <h3 style={{ margin: "0 0 10px 0", color: "green" }}>
              Save this key now!
            </h3>
            <p style={{ margin: 0, wordBreak: "break-all" }}>
              <strong>{newRawKey}</strong>
            </p>
            <small>You will never be able to see this full key again.</small>
          </div>
        )}

        <button
          onClick={generateKey}
          style={{
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          {keyInfo.hasKey ? "Roll (Replace) API Key" : "Generate API Key"}
        </button>
      </section>
      {/* ANALYTICS SECTION */}
      <section
        style={{
          backgroundColor: "#f4f4f9",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h2>API Traffic (Last 20 Requests)</h2>
        {logs.length > 0 ? (
          <div
            style={{
              width: "100%",
              height: 300,
              backgroundColor: "white",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ddd",
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={logs}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis
                  label={{
                    value: "Response Time (ms)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="responseTime"
                  stroke="#007bff"
                  strokeWidth={2}
                  name="Response Time (ms)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p>No API traffic recorded yet. Make a request to see data!</p>
        )}
      </section>

      {/* WEBHOOK SECTION */}
      <section
        style={{
          backgroundColor: "#f4f4f9",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        <h2>Webhook Endpoints</h2>
        <p style={{ fontSize: "0.9rem", color: "#666" }}>
          We will send HTTP POST requests to these URLs when events occur.
        </p>

        {webhooks.length > 0 ? (
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {webhooks.map((wh) => (
              <li
                key={wh._id}
                style={{
                  backgroundColor: "white",
                  padding: "15px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  marginBottom: "10px",
                }}
              >
                <p style={{ margin: "0 0 10px 0" }}>
                  <strong>URL:</strong> {wh.url}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.85rem",
                    color: "#555",
                    backgroundColor: "#eee",
                    padding: "5px",
                    borderRadius: "3px",
                  }}
                >
                  <strong>Signing Secret:</strong> {wh.secret}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No webhooks registered yet.</p>
        )}

        <form
          onSubmit={registerWebhook}
          style={{ marginTop: "20px", display: "flex", gap: "10px" }}
        >
          <input
            type="url"
            placeholder="https://your-server.com/webhook"
            value={newWebhookUrl}
            onChange={(e) => setNewWebhookUrl(e.target.value)}
            required
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />
          <button
            type="submit"
            style={{
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Add Webhook
          </button>
        </form>
      </section>
    </div>
  );
}

export default Dashboard;
