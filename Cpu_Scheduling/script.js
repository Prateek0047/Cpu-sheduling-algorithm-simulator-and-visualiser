document.addEventListener("DOMContentLoaded", function () {
  // DOM elements
  const algorithmSelect = document.getElementById("algorithm");
  const timeQuantumGroup = document.getElementById("timeQuantumGroup");
  const processInputs = document.getElementById("processInputs");
  const addProcessBtn = document.getElementById("addProcess");
  const simulateBtn = document.getElementById("simulate");
  const resetBtn = document.getElementById("reset");
  const resultsDiv = document.getElementById("results");
  const ganttChart = document.getElementById("ganttChart");
  const ganttContainer = document.getElementById("ganttContainer");
  const statsDiv = document.getElementById("stats");
  const processTable = document.getElementById("processTable");
  const tooltip = document.getElementById("tooltip");
  const infoTabs = document.querySelectorAll(".info-tab");
  const infoContents = document.querySelectorAll(".info-content");
  const algorithmDetails = document.getElementById("algorithmDetails");

  let waitingTimeChart = null;
  let turnaroundTimeChart = null;
  let responseTimeChart = null;
  let comparisonChart = null;

  // Color palette for processes
  const colorPalette = [
    "#4361ee",
    "#3a0ca3",
    "#4cc9f0",
    "#f72585",
    "#7209b7",
    "#560bad",
  ];

  // Algorithm information
  const algorithmInfo = {
    fcfs: {
      name: "First Come First Serve (FCFS)",
      description: "Processes are executed in the order they arrive.",
      characteristics: ["Non-preemptive", "Simple to implement"],
      formula: "Waiting Time = Start Time - Arrival Time",
      advantages: ["Easy to understand", "Fair scheduling"],
      disadvantages: [
        "High average waiting time",
        "Not optimal for short jobs",
      ],
      example:
        "P1(5ms) starts at 0, P2(3ms) arrives at 2. P1 runs until 5, then P2 from 5 to 8.",
      comparison: {
        Fairness: "High",
        "Starvation Prevention": "Yes",
        Complexity: "Low",
        Throughput: "Low",
      },
    },
    sjf: {
      name: "Shortest Job First (SJF)",
      description: "Chooses the process with the shortest burst time next.",
      characteristics: [
        "Non-preemptive",
        "Optimal for minimizing average waiting time",
      ],
      formula: "Average Waiting Time = Σ(Waiting Time)/n",
      advantages: ["Minimizes average waiting time", "Good for batch systems"],
      disadvantages: [
        "Requires knowing burst times in advance",
        "May cause starvation",
      ],
      example:
        "P1(6ms) starts at 0, P2(3ms) arrives at 2. P1 continues until 6, then P2 runs from 6 to 9.",
      comparison: {
        Fairness: "Medium",
        "Starvation Prevention": "No",
        Complexity: "Medium",
        Throughput: "High",
      },
    },
    srtf: {
      name: "Shortest Remaining Time First (SRTF)",
      description:
        "Preemptive version of SJF. Always selects the process with the smallest remaining time.",
      characteristics: ["Preemptive", "Reduces average waiting time"],
      formula: "Response Time = First CPU Allocation Time - Arrival Time",
      advantages: [
        "Better than SJF for interactive systems",
        "Improves throughput",
      ],
      disadvantages: ["More context switches", "Still needs burst estimates"],
      example:
        "P1(6ms) starts at 0, P2(3ms) arrives at 2. P1 is preempted at 2, P2 runs to 5, then P1 resumes.",
      comparison: {
        Fairness: "Medium",
        "Starvation Prevention": "No",
        Complexity: "High",
        Throughput: "High",
      },
    },
    rr: {
      name: "Round Robin (RR)",
      description: "Each process gets a fixed time quantum in a cyclic manner.",
      characteristics: ["Preemptive", "Fair allocation of CPU"],
      formula: "Turnaround Time = Completion Time - Arrival Time",
      advantages: ["No starvation", "Good response time"],
      disadvantages: [
        "Higher overhead due to frequent context switches",
        "Poorer throughput if time quantum is small",
      ],
      example:
        "Time Quantum = 2ms. P1(5ms), P2(3ms). Execution: P1(0-2), P2(2-4), P1(4-6), P2(6-7), P1(7-8)",
      comparison: {
        Fairness: "Very High",
        "Starvation Prevention": "Excellent",
        Complexity: "Medium",
        Throughput: "Moderate",
      },
    },
    priority: {
      name: "Priority Scheduling (Non-Preemptive)",
      description:
        "Processes are scheduled based on their priority value (lower number = higher priority).",
      characteristics: ["Non-preemptive", "Flexible"],
      formula: "Priority = Assigned Value (e.g., 0-Highest, 99-Lowest)",
      advantages: ["Can prioritize critical processes", "Easy to implement"],
      disadvantages: [
        "Risk of starvation for low-priority processes",
        "Priority inversion can occur",
      ],
      example:
        "P1(prio=2, 5ms), P2(prio=1, 3ms). P2 runs first even though it arrived later.",
      comparison: {
        Fairness: "Low",
        "Starvation Prevention": "No",
        Complexity: "Medium",
        Throughput: "High",
      },
    },
    priority_p: {
      name: "Priority Scheduling (Preemptive)",
      description:
        "Same as non-preemptive but interrupts current process if new one has higher priority.",
      characteristics: ["Preemptive", "Dynamic scheduling"],
      formula: "New Process Priority > Current Process Priority → Preemption",
      advantages: [
        "More responsive to high-priority tasks",
        "Better for real-time systems",
      ],
      disadvantages: [
        "Increased context switches",
        "Complex handling of priorities",
      ],
      example:
        "P1(prio=2, 5ms) running. P2(prio=1, 3ms) arrives at 2. P1 is preempted, P2 runs from 2-5, then P1 resumes.",
      comparison: {
        Fairness: "Low",
        "Starvation Prevention": "No",
        Complexity: "High",
        Throughput: "Medium",
      },
    },
    aging: {
      name: "Aging Algorithm",
      description:
        "The Aging algorithm prevents starvation by gradually increasing the priority of processes that wait in the ready queue for a long time.",
      characteristics: ["Prevents starvation", "Dynamic priority adjustment"],
      formula: "Priority_new = Priority_base + (Time Waiting × Aging Factor)",
      advantages: [
        "Reduces chances of starvation",
        "Dynamic adjustment based on waiting time",
      ],
      disadvantages: [
        "Complexity in managing aging factors",
        "May cause unfairness if not tuned properly",
      ],
      example:
        "P1(5ms) waits while P2(3ms) arrives later but gets higher priority due to aging.",
      comparison: {
        Fairness: "High",
        "Starvation Prevention": "Excellent",
        Complexity: "Medium",
        Throughput: "Moderate",
      },
    },
    hrrn: {
      name: "Highest Response Ratio Next (HRRN)",
      description:
        "HRRN selects the process with the highest response ratio, calculated as (Waiting Time + Burst Time) / Burst Time. It minimizes average turnaround time.",
      characteristics: [
        "Non-preemptive",
        "Optimal for minimizing turnaround time",
      ],
      formula: "Response Ratio = (Waiting Time + Burst Time) / Burst Time",
      advantages: [
        "Minimizes average turnaround time",
        "Favors shorter jobs while preventing starvation",
      ],
      disadvantages: [
        "Requires knowing burst times in advance",
        "Not suitable for real-time systems",
      ],
      example:
        "P1(6ms) starts at 0, P2(3ms) arrives at 2. P1 finishes at 6, P2 runs from 6 to 9.",
      comparison: {
        "Turnaround Time": "Best",
        "Starvation Prevention": "Good",
        Preemption: "No",
        Predictability: "High",
      },
    },
  };

  // Initialize app
  initializeApp();

  function initializeApp() {
    // Set up event listeners
    algorithmSelect.addEventListener("change", updateInputFields);
    addProcessBtn.addEventListener("click", addProcessRow);
    simulateBtn.addEventListener("click", simulate);
    resetBtn.addEventListener("click", reset);

    // Initialize tabs
    setupInfoTabs();

    // Initial setup
    createParticles();
    updateInputFields();
    updateAlgorithmInfo();
    updateAlgorithmDetails();

    // Add default processes
    for (let i = 0; i < 3; i++) {
      addProcessRow();
    }
  }

  function setupInfoTabs() {
    infoTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        infoTabs.forEach((t) => t.classList.remove("active"));
        infoContents.forEach((c) => c.classList.remove("active"));
        tab.classList.add("active");
        const tabId = tab.getAttribute("data-tab");
        document.getElementById(tabId).classList.add("active");
      });
    });
  }

  function updateInputFields() {
    const algorithm = algorithmSelect.value;
    timeQuantumGroup.style.display = algorithm === "rr" ? "block" : "none";

    // Show/hide priority fields
    const priorityFields = document.querySelectorAll(".priority");
    priorityFields.forEach((field) => {
      field.closest(".process-input-container").style.display =
        algorithm === "priority" || algorithm === "priority_p"
          ? "block"
          : "none";
    });

    updateAlgorithmInfo();
    updateAlgorithmDetails();
  }

  function addProcessRow() {
    const processNumber = processInputs.children.length + 1;
    const newRow = document.createElement("div");
    newRow.className = "process-row";
    newRow.innerHTML = `
          <div class="process-input-container">
              <div class="process-label">Process ID</div>
              <div class="input-with-icon">
                  <i class="fas fa-tag"></i>
                  <input type="text" placeholder="Process ID" class="pid" value="P${processNumber}">
              </div>
          </div>
          <div class="process-input-container">
              <div class="process-label">Arrival Time</div>
              <div class="input-with-icon">
                  <i class="fas fa-clock"></i>
                  <input type="number" class="arrival" value="0" min="0">
              </div>
          </div>
          <div class="process-input-container">
              <div class="process-label">Burst Time</div>
              <div class="number-control">
                  <button class="number-btn decrease-btn" data-target="burst"><i class="fas fa-minus"></i></button>
                  <input type="number" class="burst" value="3" min="1">
                  <button class="number-btn increase-btn" data-target="burst"><i class="fas fa-plus"></i></button>
              </div>
          </div>
          <div class="process-input-container" style="display: none;">
              <div class="process-label">Priority</div>
              <div class="number-control">
                  <button class="number-btn decrease-btn" data-target="priority"><i class="fas fa-minus"></i></button>
                  <input type="number" class="priority" value="0" min="0">
                  <button class="number-btn increase-btn" data-target="priority"><i class="fas fa-plus"></i></button>
              </div>
          </div>
          <button class="remove-btn"><i class="fas fa-trash"></i></button>
      `;
    processInputs.appendChild(newRow);

    // Add remove button handler
    newRow.querySelector(".remove-btn").addEventListener("click", () => {
      processInputs.removeChild(newRow);
      updateProcessNumbers();
    });

    // Add number control handlers
    newRow.querySelectorAll(".number-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const target = e.currentTarget.dataset.target;
        const input = newRow.querySelector(`.${target}`);
        if (btn.classList.contains("increase-btn")) {
          input.stepUp();
        } else {
          input.stepDown();
        }
        input.dispatchEvent(new Event("change"));
      });
    });

    updateProcessNumbers();
  }

  function updateProcessNumbers() {
    const rows = processInputs.querySelectorAll(".process-row");
    rows.forEach((row, index) => {
      const pidInput = row.querySelector(".pid");
      if (!pidInput.value.startsWith("P") || !/\d/.test(pidInput.value)) {
        pidInput.value = `P${index + 1}`;
      }
    });
  }

  function getProcesses() {
    const processes = [];
    const rows = processInputs.querySelectorAll(".process-row");
    let idCounter = 1;

    rows.forEach((row, index) => {
      const pid = row.querySelector(".pid").value || `P${idCounter++}`;
      const arrivalTime = parseInt(row.querySelector(".arrival").value) || 0;
      const burstTime = parseInt(row.querySelector(".burst").value) || 1;
      const priority = parseInt(row.querySelector(".priority")?.value || 0);

      processes.push({
        pid,
        arrivalTime,
        burstTime,
        remainingTime: burstTime,
        priority,
        color: colorPalette[index % colorPalette.length],
        startTime: null,
        endTime: null,
        waitingTime: 0,
        turnaroundTime: 0,
        responseTime: -1,
      });
    });

    return processes;
  }

  function calculateSchedule(algorithm, processes, timeQuantum = 2) {
    switch (algorithm) {
      case "fcfs":
        return simulateFCFS([...processes]);
      case "sjf":
        return simulateSJF([...processes]);
      case "srtf":
        return simulateSRTF([...processes]);
      case "rr":
        return simulateRR([...processes], timeQuantum);
      case "priority":
        return simulatePriority([...processes]);
      case "priority_p":
        return simulatePreemptivePriority([...processes]);
      case "aging":
        return simulateAging([...processes]);
      case "hrrn":
        return simulateHRRN([...processes]);
      default:
        return [];
    }
  }

  function simulateAging(processes) {
    let currentTime = 0;
    let completed = 0;
    const n = processes.length;
    const ganttChartData = [];

    // Initialize remaining time
    processes.forEach((p) => (p.remainingTime = p.burstTime));

    const agingFactor = 0.5;

    while (completed < n) {
      const readyQueue = processes.filter(
        (p) => p.arrivalTime <= currentTime && p.remainingTime > 0
      );

      if (readyQueue.length === 0) {
        currentTime++;
        continue;
      }

      // Apply aging and sort by effective priority
      readyQueue.forEach((p) => {
        p.effectivePriority =
          p.priority + (currentTime - p.arrivalTime) * agingFactor;
      });

      readyQueue.sort((a, b) => a.effectivePriority - b.effectivePriority);

      const currentProcess = readyQueue[0];
      currentProcess.remainingTime--;
      currentProcess.waitingTime += Math.max(
        0,
        currentTime - currentProcess.arrivalTime - currentProcess.burstTime + 1
      );

      if (currentProcess.startTime === null) {
        currentProcess.startTime = currentTime;
        currentProcess.responseTime = currentTime - currentProcess.arrivalTime;
      }

      // Update or create Gantt chart entry
      if (
        ganttChartData.length > 0 &&
        ganttChartData[ganttChartData.length - 1].pid === currentProcess.pid
      ) {
        ganttChartData[ganttChartData.length - 1].endTime++;
      } else {
        ganttChartData.push({
          pid: currentProcess.pid,
          startTime: currentTime,
          endTime: currentTime + 1,
          color: currentProcess.color,
        });
      }

      if (currentProcess.remainingTime === 0) {
        currentProcess.endTime = currentTime + 1;
        currentProcess.turnaroundTime =
          currentProcess.endTime - currentProcess.arrivalTime;
        currentProcess.waitingTime =
          currentProcess.turnaroundTime - currentProcess.burstTime;
        completed++;
      }

      currentTime++;
    }

    return ganttChartData;
  }

  function simulateHRRN(processes) {
    let currentTime = 0;
    let completed = 0;
    const n = processes.length;
    const ganttChartData = [];

    // Initialize remaining time
    processes.forEach((p) => (p.remainingTime = p.burstTime));

    while (completed < n) {
      const available = processes.filter(
        (p) => p.arrivalTime <= currentTime && p.remainingTime > 0
      );

      if (available.length === 0) {
        currentTime++;
        continue;
      }

      // Calculate response ratio and select process with highest
      available.forEach((p) => {
        p.responseRatio =
          (currentTime - p.arrivalTime + p.burstTime) / p.burstTime;
      });

      available.sort((a, b) => b.responseRatio - a.responseRatio);

      const currentProcess = available[0];

      // Record start time
      if (currentProcess.startTime === null) {
        currentProcess.startTime = currentTime;
        currentProcess.responseTime = currentTime - currentProcess.arrivalTime;
      }

      // Run process until completion
      currentProcess.remainingTime--;

      if (
        ganttChartData.length > 0 &&
        ganttChartData[ganttChartData.length - 1].pid === currentProcess.pid
      ) {
        ganttChartData[ganttChartData.length - 1].endTime++;
      } else {
        ganttChartData.push({
          pid: currentProcess.pid,
          startTime: currentTime,
          endTime: currentTime + 1,
          color: currentProcess.color,
        });
      }

      if (currentProcess.remainingTime === 0) {
        currentProcess.endTime = currentTime + 1;
        currentProcess.turnaroundTime =
          currentProcess.endTime - currentProcess.arrivalTime;
        currentProcess.waitingTime =
          currentProcess.turnaroundTime - currentProcess.burstTime;
        completed++;
      }

      currentTime++;
    }

    return ganttChartData;
  }

  function simulate() {
    const algorithm = algorithmSelect.value;
    const processes = getProcesses();
    if (processes.length === 0) {
      alert("Please add at least one process");
      return;
    }

    let timeQuantum = 0;
    if (algorithm === "rr") {
      timeQuantum = parseInt(document.getElementById("timeQuantum").value) || 2;
    }

    const ganttData = calculateSchedule(algorithm, processes, timeQuantum);
    displayResults(ganttData, processes);
  }

  function displayResults(ganttData, processes) {
    ganttContainer.innerHTML = "";
    statsDiv.innerHTML = "";
    processTable.innerHTML = "";

    ganttChart.style.display = "block";
    statsDiv.style.display = "block";
    processTable.style.display = "block";
    chartContainer.style.display = "block";

    renderGanttChart(ganttData);
    renderStats(processes);
    renderProcessTable(processes);
    updateCharts(processes);
  }

  function renderGanttChart(ganttData) {
    const totalTime =
      ganttData.length > 0 ? ganttData[ganttData.length - 1].endTime : 10;
    const containerWidth = ganttContainer.offsetWidth;
    const scale = containerWidth / totalTime;

    // Create legend
    const legend = document.createElement("div");
    legend.className = "color-legend";
    const uniqueProcesses = {};

    ganttData.forEach((item) => {
      if (item.pid !== "IDLE" && !uniqueProcesses[item.pid]) {
        uniqueProcesses[item.pid] = item.color;
      }
    });

    Object.keys(uniqueProcesses).forEach((pid) => {
      const legendItem = document.createElement("div");
      legendItem.className = "legend-item";
      const colorBox = document.createElement("div");
      colorBox.className = "legend-color";
      colorBox.style.backgroundColor = uniqueProcesses[pid];
      const label = document.createElement("span");
      label.textContent = pid;
      legendItem.appendChild(colorBox);
      legendItem.appendChild(label);
      legend.appendChild(legendItem);
    });

    if (ganttData.some((item) => item.pid === "IDLE")) {
      const idleLegend = document.createElement("div");
      idleLegend.className = "legend-item";
      const colorBox = document.createElement("div");
      colorBox.className = "legend-color";
      colorBox.style.backgroundColor = "#cccccc";
      const label = document.createElement("span");
      label.textContent = "IDLE";
      idleLegend.appendChild(colorBox);
      idleLegend.appendChild(label);
      legend.appendChild(idleLegend);
    }

    ganttContainer.appendChild(legend);

    // Render Gantt blocks
    ganttData.forEach((item, index) => {
      const block = document.createElement("div");
      block.className = "gantt-block";
      block.style.width = `${(item.endTime - item.startTime) * scale}px`;
      block.style.backgroundColor = item.color;
      block.textContent = item.pid;

      block.addEventListener("mousemove", (e) => {
        tooltip.innerHTML = `<strong>${item.pid}</strong><br>Start: ${
          item.startTime
        }<br>End: ${item.endTime}<br>Duration: ${
          item.endTime - item.startTime
        }`;
        tooltip.style.left = `${e.pageX + 10}px`;
        tooltip.style.top = `${e.pageY + 10}px`;
        tooltip.style.opacity = "1";
      });

      block.addEventListener("mouseout", () => {
        tooltip.style.opacity = "0";
      });

      ganttContainer.appendChild(block);
    });

    // Add timeline
    const timeline = document.createElement("div");
    timeline.className = "time-line";
    timeline.style.width = `${totalTime * scale}px`;
    ganttContainer.appendChild(timeline);

    // Add time markers every 5 units
    for (let time = 0; time <= totalTime; time += 5) {
      const marker = document.createElement("div");
      marker.className = "time-marker";
      marker.style.left = `${time * scale}px`;
      marker.textContent = time;
      ganttContainer.appendChild(marker);
    }
  }

  function renderStats(processes) {
    const totalWT = processes.reduce((sum, p) => sum + p.waitingTime, 0);
    const avgWT = (totalWT / processes.length).toFixed(2);

    const totalTT = processes.reduce((sum, p) => sum + p.turnaroundTime, 0);
    const avgTT = (totalTT / processes.length).toFixed(2);

    statsDiv.innerHTML = `
          <p><strong>Average Waiting Time:</strong> ${avgWT} ms</p>
          <p><strong>Average Turnaround Time:</strong> ${avgTT} ms</p>
      `;
  }

  function renderProcessTable(processes) {
    let tableHTML = `
          <table>
              <thead>
                  <tr>
                      <th>Process</th>
                      <th>Burst</th>
                      <th>Arrival</th>
                      <th>Completion</th>
                      <th>Turnaround</th>
                      <th>Waiting</th>
                      <th>Response</th>
                  </tr>
              </thead>
              <tbody>
      `;

    processes.forEach((p) => {
      tableHTML += `
              <tr>
                  <td>${p.pid}</td>
                  <td>${p.burstTime}</td>
                  <td>${p.arrivalTime}</td>
                  <td>${p.endTime}</td>
                  <td>${p.turnaroundTime}</td>
                  <td>${p.waitingTime}</td>
                  <td>${p.responseTime}</td>
              </tr>
          `;
    });

    tableHTML += `</tbody></table>`;
    processTable.innerHTML = tableHTML;
  }

  function updateCharts(processes) {
    const labels = processes.map((p) => p.pid);
    const waitingTimes = processes.map((p) => p.waitingTime);
    const turnaroundTimes = processes.map((p) => p.turnaroundTime);

    if (waitingTimeChart) waitingTimeChart.destroy();
    if (turnaroundTimeChart) turnaroundTimeChart.destroy();

    const ctx1 = document.getElementById("waitingTimeChart").getContext("2d");
    const ctx2 = document
      .getElementById("turnaroundTimeChart")
      .getContext("2d");

    waitingTimeChart = new Chart(ctx1, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Waiting Time (ms)",
            data: waitingTimes,
            backgroundColor: "#f72585",
          },
        ],
      },
      options: { responsive: true, scales: { y: { beginAtZero: true } } },
    });

    turnaroundTimeChart = new Chart(ctx2, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Turnaround Time (ms)",
            data: turnaroundTimes,
            backgroundColor: "#4361ee",
          },
        ],
      },
      options: { responsive: true, scales: { y: { beginAtZero: true } } },
    });
  }

  function updateAlgorithmInfo() {
    const algorithm = algorithmSelect.value;
    const info = algorithmInfo[algorithm];

    infoTabs.forEach((tab) => {
      tab.classList.remove("active");
      if (tab.getAttribute("data-tab") === "description") {
        tab.classList.add("active");
      }
    });

    infoContents.forEach((content) => {
      content.classList.remove("active");
      if (content.id === "description") {
        content.innerHTML = `<p>${info.description}</p>`;
        content.classList.add("active");
      }
    });

    const details = document.createElement("div");
    details.innerHTML = `
          <p><strong>Formula:</strong> ${info.formula}</p>
          <p><strong>Advantages:</strong> <ul>${info.advantages
            .map((a) => `<li>${a}</li>`)
            .join("")}</ul></p>
          <p><strong>Disadvantages:</strong> <ul>${info.disadvantages
            .map((d) => `<li>${d}</li>`)
            .join("")}</ul></p>
      `;
    algorithmDetails.innerHTML = details.innerHTML;
  }

  function updateAlgorithmDetails() {
    const algorithm = algorithmSelect.value;
    const info = algorithmInfo[algorithm];
    const details = document.createElement("div");
    details.innerHTML = `
          <p><strong>Example:</strong> ${info.example}</p>
          <p><strong>Comparison:</strong></p>
          <ul>
              ${Object.entries(info.comparison)
                .map(([key, val]) => `<li><strong>${key}:</strong> ${val}</li>`)
                .join("")}
          </ul>
      `;
    algorithmDetails.innerHTML = details.innerHTML;
  }

  function createParticles() {
    const particlesContainer = document.getElementById("particles");
    const particleCount = window.innerWidth < 768 ? 20 : 50;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.classList.add("particle");
      const size = Math.random() * 6 + 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particlesContainer.appendChild(particle);
    }
  }

  function reset() {
    processInputs.innerHTML = "";
    ganttChart.style.display = "none";
    statsDiv.style.display = "none";
    processTable.style.display = "none";
    chartContainer.style.display = "none";
    resultsDiv.innerHTML =
      '<p>Select an algorithm and click "Simulate" to see the results.</p>';

    for (let i = 0; i < 3; i++) {
      addProcessRow();
    }

    if (waitingTimeChart) waitingTimeChart.destroy();
    if (turnaroundTimeChart) turnaroundTimeChart.destroy();
    if (responseTimeChart) responseTimeChart.destroy();
    if (comparisonChart) comparisonChart.destroy();

    updateAlgorithmInfo();
    updateAlgorithmDetails();
  }
});
