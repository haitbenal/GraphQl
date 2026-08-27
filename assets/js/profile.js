import { FetchData } from "./api.js";

const UserQurey = `{
  user {
    id
    login
    email
    firstName
    lastName
    totalUp
    totalDown
    avatarUrl
  }
}`;

document.addEventListener("DOMContentLoaded", ProfileInit);

async function ProfileInit() {
  const token = localStorage.getItem("jwtToken");

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  const results = await FetchData(UserQurey);
  RenderUser(results);
  console.log(results);
}

function RenderUser(data) {
  const user = data.user[0];
  const imageAvatar = document.getElementById("avatar-profile");
  const fullName = document.getElementById("user-fullname");
  const userName = document.getElementById("avatar-profile");
  const userEmail = document.getElementById("user-email");
  const totalEx = document.getElementById("total-xp");
  const auditRatio = document.getElementById("audit-ratio")

  const up = Number(user.totalUp || 0);
  const down = Number(user.totalDown || 0);

  
  const Ratio = down > 0 ? Math.round((up / down) * 10) / 10 : "∞";

  imageAvatar.src = user.avatarUrl;
  fullName.innerHTML = `${user.firstName} ${user.lastName}`;
  userEmail.innerHTML = user.email;
  userName.innerHTML = user.login;
  auditRatio.innerHTML = Ratio;
}
