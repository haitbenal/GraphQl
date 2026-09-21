const API_URL = "https://learn.zone01oujda.ma/api/auth/signin";

const loginForm = document.getElementById("login-form");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const errorDiv = document.getElementById("login-error");

function PrintError(message) {
  errorDiv.textContent = message;
  errorDiv.style.display = "block";
}

function toBase64Utf8(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const user = usernameInput.value.trim();
  const pass = passwordInput.value.trim();

  if (!username || !password) {
    PrintError("Please enter both username and password");
    return;
  }
  try {
    const encodedData = toBase64Utf8(`${user}:${pass}`);
    
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${encodedData}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        PrintError("Invalid username or password");
      } else if (res.status === 400) {
        PrintError("Bad request. Please check your input");
      } else {
        PrintError(`Authentication failed (Status: ${res.status})`);
      }
      return;
    }

    const token = await res.json();
    if (!token) {
      PrintError("No token received from server");
      return;
    }
    localStorage.setItem("jwtToken", token);
    
    window.location.href = 'profile.html';

  } catch (error) {}

});
