import { FetchData } from "./api.js";

const USER_QUERY = `{
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

const XP_TRANSACTIONS_QUERY = `{
  transaction(
    where: {type: {_eq: "xp"}, event: {object: {name: {_eq: "Module"}}}}
    order_by: [{createdAt: desc}]
  ) {
    amount
    type
    createdAt
    object {
      name
    }
  }
}`;

const LEVEL_QUERY = `{
  lvl: transaction_aggregate(where: {
    type: { _eq: "level" },
    event: { object: { name: { _eq: "Module" } } }
  }) {
    aggregate {
      max {
        amount
      }
    }
  }
  totalxpamount: transaction_aggregate(where: {
    type: { _eq: "xp" },
    eventId: { _eq: 41 }
  }) {
    aggregate {
      sum {
        amount
      }
    }
  }
}`;

const SKILLS_QUERY = `{
  prog: transaction_aggregate(where: { type: { _eq: "skill_prog" }, event: { object: { name: { _eq: "Module" } } } }) { aggregate { max { amount } } }
  go: transaction_aggregate(where: { type: { _eq: "skill_go" }, event: { object: { name: { _eq: "Module" } } } }) { aggregate { max { amount } } }
  back: transaction_aggregate(where: { type: { _eq: "skill_back-end" }, event: { object: { name: { _eq: "Module" } } } }) { aggregate { max { amount } } }
  front: transaction_aggregate(where: { type: { _eq: "skill_front-end" }, event: { object: { name: { _eq: "Module" } } } }) { aggregate { max { amount } } }
  html: transaction_aggregate(where: { type: { _eq: "skill_html" }, event: { object: { name: { _eq: "Module" } } } }) { aggregate { max { amount } } }
  js: transaction_aggregate(where: { type: { _eq: "skill_js" }, event: { object: { name: { _eq: "Module" } } } }) { aggregate { max { amount } } }
  tcp: transaction_aggregate(where: { type: { _eq: "skill_tcp" }, event: { object: { name: { _eq: "Module" } } } }) { aggregate { max { amount } } }
  game: transaction_aggregate(where: { type: { _eq: "skill_game" }, event: { object: { name: { _eq: "Module" } } } }) { aggregate { max { amount } } }
  ai: transaction_aggregate(where: { type: { _eq: "skill_ai" }, event: { object: { name: { _eq: "Module" } } } }) { aggregate { max { amount } } }
  algo: transaction_aggregate(where: { type: { _eq: "skill_algo" }, event: { object: { name: { _eq: "Module" } } } }) { aggregate { max { amount } } }
  sql: transaction_aggregate(where: { type: { _eq: "skill_sql" }, event: { object: { name: { _eq: "Module" } } } }) { aggregate { max { amount } } }
  css: transaction_aggregate(where: { type: { _eq: "skill_css" }, event: { object: { name: { _eq: "Module" } } } }) { aggregate { max { amount } } }
  docker: transaction_aggregate(where: { type: { _eq: "skill_docker" }, event: { object: { name: { _eq: "Module" } } } }) { aggregate { max { amount } } }
  unix: transaction_aggregate(where: { type: { _eq: "skill_unix" }, event: { object: { name: { _eq: "Module" } } } }) { aggregate { max { amount } } }
  stats: transaction_aggregate(where: { type: { _eq: "skill_stats" }, event: { object: { name: { _eq: "Module" } } } }) { aggregate { max { amount } } }
  sysadmin: transaction_aggregate(where: { type: { _eq: "skill_sys-admin" }, event: { object: { name: { _eq: "Module" } } } }) { aggregate { max { amount } } }
}`;

const AUDIT_QUERY = `{
  user {
    auditRatio
    success: audits_aggregate(where: {closureType: {_eq: succeeded}}) {
      aggregate {
        count
      }
    }
    failed: audits_aggregate(where: {closureType: {_eq: failed}}) {
      aggregate {
        count
      }
    }
  }
}`;

document.addEventListener("DOMContentLoaded", ProfileInit);

async function ProfileInit() {
  const token = localStorage.getItem("jwtToken");

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("jwtToken");
    window.location.href = "index.html";
  });

  try {
    const [userData, levelData, txData, auditData, skillsData] =
      await Promise.all([
        FetchData(USER_QUERY),
        FetchData(LEVEL_QUERY),
        FetchData(XP_TRANSACTIONS_QUERY),
        FetchData(AUDIT_QUERY),
        FetchData(SKILLS_QUERY),
      ]);

    RenderUser(userData);
    RenderLevelAndXP(levelData);
    RenderTransactions(txData);
    RenderSkillsGraphs(skillsData);
    RenderAuditGraphs(auditData);
  } catch (error) {
    localStorage.removeItem("jwtToken");
    window.location.href = "index.html";
  }
}

function RenderUser(data) {
  if (!data || !data.user || data.user.length === 0) return;

  const user = data.user[0];
  const imageAvatar = document.getElementById("avatar-profile");
  const fullName = document.getElementById("user-fullname");
  const userName = document.getElementById("user-login");
  const userEmail = document.getElementById("user-email");
  const auditRatio = document.getElementById("audit-ratio");

  const up = Number(user.totalUp || 0);
  const down = Number(user.totalDown || 0);
  const Ratio = down > 0 ? Math.round((up / down) * 10) / 10 : "∞";

  if (user.avatarUrl) imageAvatar.src = user.avatarUrl;
  fullName.textContent = `${user.firstName} ${user.lastName}`;
  userEmail.textContent = user.email;
  userName.textContent = `@${user.login}`;
  auditRatio.textContent = Ratio;
}

function RenderLevelAndXP(data) {
  if (!data) return;

  const currentLevelEl = document.getElementById("current-level");
  const totalXpEl = document.getElementById("total-xp");

  const level = data.lvl?.aggregate?.max?.amount || 0;
  currentLevelEl.textContent = level;

  const rawXp = data.totalxpamount?.aggregate?.sum?.amount || 0;
  totalXpEl.textContent = formatXP(rawXp);
}

function formatXP(amount) {
  if (amount >= 1000000) return Math.round(amount / 1000000) + " MB";
  if (amount >= 1000) return Math.round(amount / 1000) + " kB";
  return amount + " B";
}

function RenderTransactions(data) {
  const container = document.getElementById("transaction-graph-container");
  container.innerHTML = "";

  if (!data || !data.transaction || data.transaction.length === 0) {
    container.innerHTML = "<p>No transaction data available.</p>";
    return;
  }

  const listContainer = document.createElement("div");
  listContainer.style.width = "100%";
  listContainer.style.maxHeight = "250px";
  listContainer.style.overflowY = "auto";
  listContainer.style.paddingRight = "10px";

  data.transaction.forEach((tx) => {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.justifyContent = "space-between";
    row.style.padding = "10px 0";
    row.style.borderBottom = "1px dashed #333";
    row.style.fontFamily = "monospace";
    row.style.fontSize = "13px";

    const dateObj = new Date(tx.createdAt);
    const dateStr = dateObj.toISOString().split("T")[0];

    const name = tx.object?.name || "Unknown Task";

    const leftSide = document.createElement("div");
    leftSide.innerHTML = `<span style="color: #555;">[${dateStr}]</span> <span style="color: #ccc; margin-left: 10px;">${name}</span>`;

    const rightSide = document.createElement("div");
    rightSide.style.color = "#00ff00";
    rightSide.textContent = `+${formatXP(tx.amount)}`;

    row.appendChild(leftSide);
    row.appendChild(rightSide);
    listContainer.appendChild(row);
  });

  container.appendChild(listContainer);
}

function RenderAuditGraphs(data) {
  const container = document.getElementById("audit-graph-container");
  container.innerHTML = "";
  if (!data || !data.user || !data.user[0]) return;

  const success = data.user[0].success?.aggregate?.count || 0;
  const failed = data.user[0].failed?.aggregate?.count || 0;
  const total = success + failed;

  if (total === 0) {
    container.innerHTML = "<p>No audit data found.</p>";
    return;
  }

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 250 250");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");

  const cx = 125,
    cy = 125,
    r = 80;
  const circumference = 2 * Math.PI * r;
  const successDash = (success / total) * circumference;

  const failCircle = document.createElementNS(svgNS, "circle");
  failCircle.setAttribute("cx", cx);
  failCircle.setAttribute("cy", cy);
  failCircle.setAttribute("r", r);
  failCircle.setAttribute("fill", "none");
  failCircle.setAttribute("stroke", "#ff3333");
  failCircle.setAttribute("stroke-width", "25");

  const successCircle = document.createElementNS(svgNS, "circle");
  successCircle.setAttribute("cx", cx);
  successCircle.setAttribute("cy", cy);
  successCircle.setAttribute("r", r);
  successCircle.setAttribute("fill", "none");
  successCircle.setAttribute("stroke", "#00ff00");
  successCircle.setAttribute("stroke-width", "25");
  successCircle.setAttribute(
    "stroke-dasharray",
    `${successDash} ${circumference}`,
  );
  successCircle.setAttribute("stroke-dashoffset", "0");
  successCircle.setAttribute("transform", `rotate(-90 ${cx} ${cy})`);

  const centerText = document.createElementNS(svgNS, "text");
  centerText.setAttribute("x", cx);
  centerText.setAttribute("y", cy - 5);
  centerText.setAttribute("fill", "#fff");
  centerText.setAttribute("font-size", "22px");
  centerText.setAttribute("font-weight", "bold");
  centerText.setAttribute("text-anchor", "middle");
  centerText.textContent = `${Math.round((success / total) * 100)}%`;

  const ratioText = document.createElementNS(svgNS, "text");
  ratioText.setAttribute("x", cx);
  ratioText.setAttribute("y", cy + 20);
  ratioText.setAttribute("fill", "#777");
  ratioText.setAttribute("font-size", "12px");
  ratioText.setAttribute("text-anchor", "middle");
  ratioText.textContent = `${success} Pass / ${failed} Fail`;

  svg.appendChild(failCircle);
  svg.appendChild(successCircle);
  svg.appendChild(centerText);
  svg.appendChild(ratioText);

  container.appendChild(svg);
}

function RenderSkillsGraphs(data) {
  const container = document.getElementById("skills-graph-container");
  container.innerHTML = "";
  if (!data) return;

  const skills = [];
  for (const [key, val] of Object.entries(data)) {
    const amount = val?.aggregate?.max?.amount || 0;
    if (amount > 0) {
      skills.push({ name: key.replace("skill_", ""), amount });
    }
  }

  if (skills.length === 0) {
    container.innerHTML = "<p>No skills data found.</p>";
    return;
  }

  skills.sort((a, b) => b.amount - a.amount);

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");

  const rowHeight = 25;
  const svgHeight = skills.length * rowHeight + 20;
  svg.setAttribute("viewBox", `0 0 400 ${svgHeight}`);
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");

  skills.forEach((s, i) => {
    const y = i * rowHeight + 20;

    const percentage = Math.min(Math.round(s.amount), 100);

    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", "10");
    text.setAttribute("y", y);
    text.setAttribute("fill", "#ccc");
    text.setAttribute("font-size", "12px");
    text.setAttribute("font-family", "monospace");
    text.textContent = s.name.toUpperCase();

    const track = document.createElementNS(svgNS, "rect");
    track.setAttribute("x", "100");
    track.setAttribute("y", y - 9);
    track.setAttribute("width", "230");
    track.setAttribute("height", "8");
    track.setAttribute("fill", "#111");
    track.setAttribute("stroke", "#333");
    track.setAttribute("stroke-width", "1");

    const fillWidth = (percentage / 100) * 230;
    const fill = document.createElementNS(svgNS, "rect");
    fill.setAttribute("x", "100");
    fill.setAttribute("y", y - 9);
    fill.setAttribute("width", fillWidth);
    fill.setAttribute("height", "8");
    fill.setAttribute("fill", "#00ff00");

    const valText = document.createElementNS(svgNS, "text");
    valText.setAttribute("x", "345");
    valText.setAttribute("y", y);
    valText.setAttribute("fill", "#00ff00");
    valText.setAttribute("font-size", "12px");
    valText.setAttribute("font-family", "monospace");
    valText.textContent = `${percentage}%`;

    svg.appendChild(text);
    svg.appendChild(track);
    svg.appendChild(fill);
    svg.appendChild(valText);
  });

  container.appendChild(svg);
}
