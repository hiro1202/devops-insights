/* DevOps Insights — dummy data + Chart.js renderers */
(function () {
  const css = getComputedStyle(document.documentElement);
  const color = {
    cyan: css.getPropertyValue("--cyan").trim() || "#6ee7f7",
    purple: css.getPropertyValue("--purple").trim() || "#a78bfa",
    green: css.getPropertyValue("--green").trim() || "#34d399",
    red: css.getPropertyValue("--red").trim() || "#f87171",
    amber: css.getPropertyValue("--amber").trim() || "#fbbf24",
    text: css.getPropertyValue("--text").trim() || "#e2e8f0",
    textDim: css.getPropertyValue("--text-dim").trim() || "#94a3b8",
    grid: "rgba(148, 163, 184, 0.12)",
    border: css.getPropertyValue("--border").trim() || "#1e293b",
  };

  // ---------- Chart.js global defaults ----------
  if (window.Chart) {
    Chart.defaults.color = color.textDim;
    Chart.defaults.font.family =
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
    Chart.defaults.font.size = 11;
    Chart.defaults.borderColor = color.border;
  }

  // ---------- Dummy data ----------
  const days = Array.from({ length: 30 }, (_, i) => `D${i + 1}`);
  const seeded = (seed) => {
    let s = seed;
    return () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  };
  const series = (seed, base, jitter) => {
    const rnd = seeded(seed);
    return days.map((_, i) =>
      Math.max(0, Math.round(base + Math.sin(i / 3) * jitter + (rnd() - 0.5) * jitter * 1.4))
    );
  };

  const deploys = series(11, 6, 3);
  const incidents = days.map((_, i) => (i % 9 === 4 || i % 13 === 7 ? 1 : 0));

  // ---------- Sparklines ----------
  const sparkData = {
    deploy: series(2, 6, 3),
    lead: series(3, 4, 1.2),
    cfr: series(4, 5, 1.8),
    mttr: series(5, 4, 1.5),
    t1: series(6, 9, 2),
    t2: series(7, 7, 2),
    t3: series(8, 4, 1.8),
    t4: series(9, 5, 1.6),
  };
  const sparkColors = {
    deploy: color.cyan,
    lead: color.green,
    cfr: color.green,
    mttr: color.green,
    t1: color.cyan,
    t2: color.purple,
    t3: color.amber,
    t4: color.amber,
  };

  document.querySelectorAll("canvas.spark").forEach((c) => {
    const key = c.dataset.spark;
    const stroke = sparkColors[key] || color.cyan;
    const data = sparkData[key] || series(99, 5, 2);
    const grad = c.getContext("2d").createLinearGradient(0, 0, 0, 36);
    grad.addColorStop(0, hexToRgba(stroke, 0.35));
    grad.addColorStop(1, hexToRgba(stroke, 0));

    new Chart(c, {
      type: "line",
      data: {
        labels: data.map((_, i) => i),
        datasets: [
          {
            data,
            borderColor: stroke,
            backgroundColor: grad,
            borderWidth: 1.8,
            tension: 0.38,
            fill: true,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: { display: false },
          y: { display: false },
        },
        elements: { line: { capBezierPoints: true } },
      },
    });
  });

  // ---------- Deployment + Incidents chart ----------
  const deployCanvas = document.getElementById("deploys-chart");
  if (deployCanvas) {
    const ctx = deployCanvas.getContext("2d");
    const grad = ctx.createLinearGradient(0, 0, 0, 260);
    grad.addColorStop(0, hexToRgba(color.cyan, 0.35));
    grad.addColorStop(1, hexToRgba(color.cyan, 0));

    new Chart(deployCanvas, {
      data: {
        labels: days,
        datasets: [
          {
            type: "line",
            label: "Deploys",
            data: deploys,
            borderColor: color.cyan,
            backgroundColor: grad,
            borderWidth: 2,
            tension: 0.35,
            fill: true,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointHoverBackgroundColor: color.cyan,
            yAxisID: "y",
            order: 2,
          },
          {
            type: "bar",
            label: "Incidents",
            data: incidents,
            backgroundColor: hexToRgba(color.red, 0.85),
            borderRadius: 4,
            barThickness: 6,
            yAxisID: "y1",
            order: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#0f172a",
            borderColor: color.border,
            borderWidth: 1,
            titleColor: color.text,
            bodyColor: color.textDim,
            padding: 10,
            displayColors: true,
          },
        },
        scales: {
          x: {
            grid: { color: color.grid, drawTicks: false },
            ticks: {
              color: color.textDim,
              maxRotation: 0,
              autoSkipPadding: 16,
            },
            border: { display: false },
          },
          y: {
            position: "left",
            grid: { color: color.grid, drawTicks: false },
            ticks: { color: color.textDim, padding: 8 },
            border: { display: false },
            beginAtZero: true,
          },
          y1: {
            position: "right",
            grid: { display: false },
            ticks: { display: false },
            border: { display: false },
            beginAtZero: true,
            max: 4,
          },
        },
      },
    });
  }

  // ---------- SPACE radar ----------
  const radar = document.getElementById("space-radar");
  if (radar) {
    new Chart(radar, {
      type: "radar",
      data: {
        labels: [
          "Satisfaction",
          "Performance",
          "Activity",
          "Communication",
          "Efficiency",
        ],
        datasets: [
          {
            label: "Current",
            data: [4.2, 3.8, 4.5, 3.9, 4.1],
            borderColor: color.cyan,
            backgroundColor: hexToRgba(color.cyan, 0.2),
            borderWidth: 2,
            pointBackgroundColor: color.cyan,
            pointRadius: 3,
          },
          {
            label: "Previous",
            data: [3.7, 3.6, 4.1, 3.5, 3.8],
            borderColor: hexToRgba(color.purple, 0.7),
            backgroundColor: "transparent",
            borderDash: [4, 4],
            borderWidth: 1.5,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          r: {
            min: 0,
            max: 5,
            grid: { color: color.grid },
            angleLines: { color: color.grid },
            pointLabels: { color: color.textDim, font: { size: 10 } },
            ticks: {
              display: false,
              stepSize: 1,
            },
          },
        },
      },
    });
  }

  // ---------- DX Core 4 bars ----------
  const dxBars = document.getElementById("dxcore-bars");
  if (dxBars) {
    new Chart(dxBars, {
      type: "bar",
      data: {
        labels: ["Diffs/Eng", "Lead Time", "Deploys", "CFR"],
        datasets: [
          {
            label: "Score (0–10)",
            data: [8.2, 7.1, 8.6, 7.8],
            backgroundColor: [
              hexToRgba(color.cyan, 0.85),
              hexToRgba(color.purple, 0.85),
              hexToRgba(color.cyan, 0.85),
              hexToRgba(color.green, 0.85),
            ],
            borderRadius: 6,
            barThickness: 22,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            min: 0,
            max: 10,
            grid: { color: color.grid, drawTicks: false },
            ticks: { color: color.textDim, stepSize: 2 },
            border: { display: false },
          },
          y: {
            grid: { display: false },
            ticks: { color: color.text },
            border: { display: false },
          },
        },
      },
    });
  }

  // ---------- Helpers ----------
  function hexToRgba(hex, alpha) {
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
})();
