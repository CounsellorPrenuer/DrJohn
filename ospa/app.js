// ============================================================
// OSPA static-site app. No backend, no accounts — progress autosaves to
// localStorage (this browser only), and the downloadable PDF is the
// candidate's permanent record. See README.md for what's intentionally
// different from the full-stack version.
// ============================================================

const STORAGE_KEYS = {
  candidate: "ospa_candidate",
  responses: "ospa_responses",
  history: "ospa_history",
};

const screens = {
  welcome: document.getElementById("screen-welcome"),
  assessment: document.getElementById("screen-assessment"),
  report: document.getElementById("screen-report"),
};

function showScreen(name) {
  Object.values(screens).forEach((el) => el.classList.add("hidden"));
  screens[name].classList.remove("hidden");
}

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ---------- Welcome screen ----------

function initWelcome() {
  const form = document.getElementById("welcome-form");
  const nameInput = document.getElementById("candidate-name");
  const emailInput = document.getElementById("candidate-email");
  const resumeBanner = document.getElementById("resume-banner");
  const resumeBtn = document.getElementById("resume-btn");
  const historyList = document.getElementById("history-list");

  const candidate = loadJSON(STORAGE_KEYS.candidate, null);
  const responses = loadJSON(STORAGE_KEYS.responses, null);

  if (candidate) {
    nameInput.value = candidate.name || "";
    emailInput.value = candidate.email || "";
  }

  if (responses && Object.keys(responses).length > 0) {
    resumeBanner.classList.remove("hidden");
    resumeBtn.onclick = () => {
      showScreen("assessment");
      initAssessment();
    };
  }

  const history = loadJSON(STORAGE_KEYS.history, []);
  if (history.length > 0) {
    historyList.innerHTML = history
      .slice()
      .reverse()
      .map(
        (h) =>
          `<div class="history-item"><span>${new Date(h.completedAt).toLocaleDateString()} — Score ${h.overallScore.toFixed(2)}/5</span></div>`
      )
      .join("");
  } else {
    historyList.innerHTML = '<p style="color:var(--muted);font-size:13px;">No completed assessments yet on this device.</p>';
  }

  form.onsubmit = (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    if (!name) return;
    saveJSON(STORAGE_KEYS.candidate, { name, email });
    // Starting fresh clears any previous in-progress responses.
    localStorage.removeItem(STORAGE_KEYS.responses);
    showScreen("assessment");
    initAssessment();
  };
}

// ---------- Assessment screen ----------

let autosaveTimer = null;

function initAssessment() {
  const container = document.getElementById("questions-container");
  const progressFill = document.getElementById("progress-fill");
  const progressLabel = document.getElementById("progress-label");
  const saveStatus = document.getElementById("save-status");
  const submitBtn = document.getElementById("submit-btn");
  const errorEl = document.getElementById("assessment-error");

  let responses = loadJSON(STORAGE_KEYS.responses, {});

  container.innerHTML = OLQS.map(
    (olq) => `
    <fieldset class="card question-card" data-code="${olq.code}">
      <legend class="question-prompt">${olq.prompt}</legend>
      <div class="scale-labels"><span>Strongly disagree</span><span>Strongly agree</span></div>
      <div class="scale-row">
        ${[1, 2, 3, 4, 5]
          .map(
            (v) =>
              `<button type="button" class="scale-btn" data-code="${olq.code}" data-value="${v}">${v}</button>`
          )
          .join("")}
      </div>
    </fieldset>`
  ).join("");

  function updateProgress() {
    const answered = Object.keys(responses).length;
    const total = OLQS.length;
    progressLabel.textContent = `${answered} / ${total} answered`;
    progressFill.style.width = `${total === 0 ? 0 : (answered / total) * 100}%`;
  }

  function paintSelections() {
    container.querySelectorAll(".scale-btn").forEach((btn) => {
      const code = btn.dataset.code;
      const value = Number(btn.dataset.value);
      btn.classList.toggle("selected", responses[code] === value);
    });
  }

  function scheduleAutosave() {
    saveStatus.textContent = "Saving...";
    if (autosaveTimer) clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => {
      saveJSON(STORAGE_KEYS.responses, responses);
      saveStatus.textContent = "All changes saved to this browser";
    }, 500);
  }

  container.addEventListener("click", (e) => {
    const btn = e.target.closest(".scale-btn");
    if (!btn) return;
    const code = btn.dataset.code;
    const value = Number(btn.dataset.value);
    responses[code] = value;
    paintSelections();
    updateProgress();
    scheduleAutosave();
    errorEl.textContent = "";
  });

  updateProgress();
  paintSelections();

  submitBtn.onclick = () => {
    const unanswered = OLQS.filter((olq) => responses[olq.code] === undefined);
    if (unanswered.length > 0) {
      errorEl.textContent = `Please answer all questions (${unanswered.length} remaining).`;
      return;
    }

    saveJSON(STORAGE_KEYS.responses, responses);

    let result;
    try {
      result = computeOspaScore(responses);
    } catch (err) {
      errorEl.textContent = "Something went wrong scoring your responses: " + err.message;
      return;
    }

    const candidate = loadJSON(STORAGE_KEYS.candidate, { name: "Candidate", email: "" });
    const completedAt = new Date().toISOString();

    const history = loadJSON(STORAGE_KEYS.history, []);
    history.push({ completedAt, overallScore: result.overallScore });
    saveJSON(STORAGE_KEYS.history, history);

    // Clear in-progress responses now that this attempt is complete.
    localStorage.removeItem(STORAGE_KEYS.responses);

    renderReport(candidate, result, completedAt);
    showScreen("report");
  };
}

// ---------- Report screen ----------

let lastReport = null;

function renderReport(candidate, result, completedAt) {
  lastReport = { candidate, result, completedAt };

  document.getElementById("report-overall-value").textContent = `${result.overallScore.toFixed(2)} / 5`;
  document.getElementById("report-overall-band").textContent = bandFor(result.overallScore);

  const factorContainer = document.getElementById("factor-bars");
  factorContainer.innerHTML = Object.entries(result.factorScores)
    .sort((a, b) => b[1] - a[1])
    .map(
      ([factor, score]) => `
      <div class="factor-bar-row">
        <div class="factor-bar-label"><span>${FACTOR_LABELS[factor] ?? factor}</span><span>${score.toFixed(2)}/5</span></div>
        <div class="factor-bar-track"><div class="factor-bar-fill" style="width:${(score / 5) * 100}%"></div></div>
      </div>`
    )
    .join("");

  const olqContainer = document.getElementById("olq-bars");
  olqContainer.innerHTML = Object.entries(result.olqScores)
    .sort((a, b) => b[1] - a[1])
    .map(([code, score]) => {
      const olq = OLQS.find((o) => o.code === code);
      return `
      <div class="factor-bar-row">
        <div class="factor-bar-label"><span>${olq ? olq.name : code}</span><span>${score.toFixed(2)}/5</span></div>
        <div class="factor-bar-track"><div class="factor-bar-fill" style="width:${(score / 5) * 100}%"></div></div>
      </div>`;
    })
    .join("");

  document.getElementById("report-narrative").textContent = generateNarrative(
    result.olqScores,
    result.factorScores,
    result.overallScore
  );
}

function downloadPdf() {
  if (!lastReport) return;
  const { candidate, result, completedAt } = lastReport;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const marginX = 48;
  let y = 56;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Officer Development Report", marginX, y);
  y += 22;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    `Candidate: ${candidate.name}${candidate.email ? "  •  " + candidate.email : ""}`,
    marginX,
    y
  );
  y += 14;
  doc.text(`Generated: ${new Date(completedAt).toLocaleString()}`, marginX, y);
  y += 28;

  doc.setTextColor(20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text(`${result.overallScore.toFixed(2)} / 5`, marginX, y);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Overall Score (${bandFor(result.overallScore)})`, marginX + 130, y - 3);
  y += 32;

  doc.setDrawColor(200);
  doc.line(marginX, y, 548, y);
  y += 20;

  doc.setTextColor(20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Factor Breakdown", marginX, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  Object.entries(result.factorScores)
    .sort((a, b) => b[1] - a[1])
    .forEach(([factor, score]) => {
      doc.text(`${FACTOR_LABELS[factor] ?? factor}`, marginX, y);
      doc.text(`${score.toFixed(2)} / 5`, 480, y);
      y += 16;
    });
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Officer Like Qualities", marginX, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  Object.entries(result.olqScores)
    .sort((a, b) => b[1] - a[1])
    .forEach(([code, score]) => {
      const olq = OLQS.find((o) => o.code === code);
      doc.text(olq ? olq.name : code, marginX, y);
      doc.text(`${score.toFixed(2)} / 5`, 480, y);
      y += 16;
      if (y > 740) {
        doc.addPage();
        y = 56;
      }
    });
  y += 14;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Narrative", marginX, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const narrative = generateNarrative(result.olqScores, result.factorScores, result.overallScore);
  const lines = doc.splitTextToSize(narrative, 500);
  lines.forEach((line) => {
    if (y > 760) {
      doc.addPage();
      y = 56;
    }
    doc.text(line, marginX, y);
    y += 14;
  });

  y += 20;
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    "OSPA\u2122 \u2014 Officer Selection Potential Assessment. This report is a directional indicator based on a single",
    marginX,
    y
  );
  y += 10;
  doc.text("self-assessment session, not a definitive psychometric diagnosis.", marginX, y);

  const filename = `OSPA-Report-${candidate.name.replace(/\s+/g, "_")}-${completedAt.slice(0, 10)}.pdf`;
  doc.save(filename);
}

function startOver() {
  showScreen("welcome");
  initWelcome();
}

// ---------- Boot ----------

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("download-pdf-btn").onclick = downloadPdf;
  document.getElementById("start-over-btn").onclick = startOver;
  initWelcome();
  showScreen("welcome");
});
