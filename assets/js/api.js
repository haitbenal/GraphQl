const endpoint = "https://learn.zone01oujda.ma/api/graphql-engine/v1/graphql";

async function FetchData(query) {
  const token = localStorage.getItem("jwtToken");
  if (!token) {
    throw new Error("No authentication token found. Please login first.");
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Basic ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error("Unauthorized: token expired or invalid");
      }
      throw new Error(`HTTP Error: ${res.status}`);
    }
    const body = await res.json();
    if (body.errors) {
      console.error("Errors:", body.errors);
    }
    return body.data;

  } catch (error) {
    console.error("Request Error:", error);
    throw error;
  }
}
