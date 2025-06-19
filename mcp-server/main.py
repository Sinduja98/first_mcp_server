# server.py
from mcp.server.fastmcp import FastMCP
import httpx

# Create an MCP server
mcp = FastMCP("Demo")

NWS_API_BASE = "https://api.weather.gov"
USER_AGENT = "weather-app/1.0"


async def make_nws_request(url):
    """Make a request to the NWS API with proper error handling."""
    headers = {
        "User-agent": USER_AGENT,
        "Accept": "application/geo+json"
    }
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=headers, timeout=30.0)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return None

def format_alert(feature: dict) -> str:
    """Format an alert feature into a readable string."""
    props = feature["properties"]
    return f"""
Event: {props.get('event', 'Unknown')}
Area: {props.get('areaDesc', 'Unknown')}
Severity: {props.get('severity', 'Unknown')}
Description: {props.get('description', 'No description available')}
Instructions: {props.get('instruction', 'No specific instructions provided')}
"""

@mcp.tool()
async def get_weather_alerts(state:str)->str:
    """Get weather alerts for a US state.

    Args:
        state: Two-letter US state code (e.g. CA, NY, IN)
    """
    url=f"{NWS_API_BASE}/alerts/active/area/{state}"
    data= await make_nws_request(url)

    if not data or "features" not in data:
        return "No alerts found or unable to fetch alerts"

    if not data["features"]:
        return "No active alerts found for the state"

    alerts=[format_alert(word) for word in data["features"]]
    return "\n---\n".join(alerts)



# Add an addition tool
@mcp.tool()
def add(a: int, b: int) -> int:
    """Add two numbers
    Args:
        a (int): The first number
        b (int): The second number
    Returns:
        int: The sum of the two numbers
    """
    return a + b


# Add a dynamic greeting resource
@mcp.resource("greeting://{name}")
def get_greeting(name: str) -> str:
    """Get a personalized greeting"""
    return f"Hello, {name}!"

if __name__ == "__main__":
    mcp.run()
