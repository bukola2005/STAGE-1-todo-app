 /* ════════════════════════════════════════
     STATE
  ════════════════════════════════════════ */
  const state = {
    title: "Design the onboarding flow for CatchUp & Focus",
    description: "Create wireframes and a prototype for the onboarding screens — permissions request, contact picker, and focus session setup. Ensure alignment with the NativeWind design system and that it passes all accessibility checks before handoff to development.",
    priority: "High",
    status: "In Progress",
    dueDate: new Date("2026-04-19T18:00:00Z"),
  };

  let timerInterval = null;
  let snapshot = null; // for cancel

  /* ════════════════════════════════════════
     ELEMENTS
  ════════════════════════════════════════ */
  const card         = document.getElementById("todo-card");
  const checkbox     = document.getElementById("todo-complete");
  const titleDisplay = document.getElementById("title-display");
  const priorityBadge = document.getElementById("priority-badge");
  const statusBadge  = document.getElementById("status-badge");
  const statusControl = document.getElementById("status-control");
  const priorityDot  = document.getElementById("priority-dot");
  const overdueEl    = document.getElementById("overdue-indicator");
  const timeEl       = document.getElementById("time-remaining-el");
  const editBtn      = document.getElementById("edit-btn");
  const editForm     = document.getElementById("edit-form-container");
  const saveBtn      = document.getElementById("save-btn");
  const cancelBtn    = document.getElementById("cancel-btn");
  const expandBtn    = document.getElementById("expand-btn");
  const collapsible  = document.getElementById("collapsible-section");
  const expandLabel  = document.getElementById("expand-label");
  const descPreview  = document.getElementById("desc-preview");

  /* edit form fields */
  const fTitle    = document.getElementById("edit-title-input");
  const fDesc     = document.getElementById("edit-description-input");
  const fPriority = document.getElementById("edit-priority-select");
  const fDueDate  = document.getElementById("edit-due-date-input");

  /* ════════════════════════════════════════
     TIME
  ════════════════════════════════════════ */
  function getTimeRemaining(due) {
    const diff = due - Date.now();
    const abs  = Math.abs(diff);
    const mins  = Math.floor(abs / 60000);
    const hours = Math.floor(abs / 3600000);
    const days  = Math.floor(abs / 86400000);
    if (diff < 0) {
      if (mins  < 60) return { text: `Overdue by ${mins} min${mins !== 1 ? "s" : ""}`, overdue: true };
      if (hours < 24) return { text: `Overdue by ${hours} hr${hours !== 1 ? "s" : ""}`, overdue: true };
      return               { text: `Overdue by ${days} day${days !== 1 ? "s" : ""}`, overdue: true };
    }
    if (mins  < 2)   return { text: "Due now!",                                         overdue: false };
    if (hours < 1)   return { text: `Due in ${mins} minutes`,                           overdue: false };
    if (hours < 24)  return { text: `Due in ${hours} hour${hours !== 1 ? "s" : ""}`,    overdue: false };
    if (days === 1)  return { text: "Due tomorrow",                                      overdue: false };
    return               { text: `Due in ${days} days`,                                 overdue: false };
  }

  function updateTimer() {
    if (state.status === "Done") {
      timeEl.textContent = "✅ Completed";
      timeEl.className   = "done-time";
      timeEl.setAttribute("aria-label", "Task completed");
      overdueEl.classList.remove("visible");
      card.classList.remove("overdue");
      return;
    }
    const { text, overdue } = getTimeRemaining(state.dueDate);
    timeEl.textContent = text;
    timeEl.setAttribute("aria-label", "Time remaining: " + text);
    timeEl.classList.toggle("overdue", overdue);
    timeEl.classList.remove("done-time");
    overdueEl.classList.toggle("visible", overdue);
    card.classList.toggle("overdue", overdue);
  }

  function startTimer() {
    clearInterval(timerInterval);
    updateTimer();
    timerInterval = setInterval(updateTimer, 30000);
  }

  /* ════════════════════════════════════════
     RENDER STATE → UI
  ════════════════════════════════════════ */
  const PRIORITY_MAP = {
    High:   { cls: "priority-high",   badgeCls: "badge-priority-high",   color: "var(--red)",    shadow: "var(--red)",    icon: "🔥" },
    Medium: { cls: "priority-medium", badgeCls: "badge-priority-medium", color: "var(--yellow)", shadow: "var(--yellow)", icon: "⚡" },
    Low:    { cls: "priority-low",    badgeCls: "badge-priority-low",    color: "var(--green)",  shadow: "var(--green)",  icon: "🌿" },
  };
  const STATUS_MAP = {
    "Pending":     { cls: "badge-status-pending",     icon: "🕐", dot: "status-pending" },
    "In Progress": { cls: "badge-status-in-progress", icon: "⚡", dot: "status-in-progress" },
    "Done":        { cls: "badge-status-done",        icon: "✅", dot: "status-done" },
  };

  function renderPriority() {
    const p = PRIORITY_MAP[state.priority];
    card.classList.remove("priority-high", "priority-medium", "priority-low");
    card.classList.add(p.cls);
    priorityBadge.className = `badge ${p.badgeCls}`;
    priorityBadge.textContent = `${p.icon} ${state.priority}`;
    priorityBadge.setAttribute("aria-label", "Priority: " + state.priority);
    priorityDot.style.background  = p.color;
    priorityDot.style.boxShadow   = `0 0 6px ${p.shadow}`;
  }

  function renderStatus() {
    const s = STATUS_MAP[state.status];
    statusBadge.className = `badge ${s.cls}`;
    statusBadge.textContent = `${s.icon} ${state.status}`;
    statusBadge.setAttribute("aria-label", "Status: " + state.status);
    statusControl.value = state.status;

    const isDone = state.status === "Done";
    checkbox.checked = isDone;
    checkbox.setAttribute("aria-checked", isDone);
    card.classList.toggle("status-done", isDone);
    updateTimer();
  }

  function renderContent() {
    titleDisplay.textContent = state.title;
    descPreview.textContent  = state.description;
    const dateStr = state.dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    document.getElementById("due-date-display").textContent = "Due " + dateStr;
    document.getElementById("due-date-display").setAttribute("datetime", state.dueDate.toISOString());
    timeEl.setAttribute("datetime", state.dueDate.toISOString());
  }

  /* ════════════════════════════════════════
     CHECKBOX
  ════════════════════════════════════════ */
  checkbox.addEventListener("change", function () {
    state.status = this.checked ? "Done" : "Pending";
    renderStatus();
  });

  /* ════════════════════════════════════════
     STATUS CONTROL
  ════════════════════════════════════════ */
  statusControl.addEventListener("change", function () {
    state.status = this.value;
    renderStatus();
  });

  /* ════════════════════════════════════════
     EXPAND / COLLAPSE
  ════════════════════════════════════════ */
  expandBtn.addEventListener("click", function () {
    const expanded = this.getAttribute("aria-expanded") === "true";
    this.setAttribute("aria-expanded", !expanded);
    collapsible.classList.toggle("expanded", !expanded);
    collapsible.setAttribute("aria-hidden", expanded);
    expandLabel.textContent = expanded ? "Show more" : "Show less";
  });

  /* ════════════════════════════════════════
     EDIT MODE
  ════════════════════════════════════════ */
  function openEdit() {
    snapshot = { ...state, dueDate: new Date(state.dueDate) };
    fTitle.value    = state.title;
    fDesc.value     = state.description;
    fPriority.value = state.priority;
    // format date for input
    const d = state.dueDate;
    fDueDate.value  = d.toISOString().slice(0, 10);
    card.classList.add("editing");
    // focus first field
    setTimeout(() => fTitle.focus(), 50);
  }

  function closeEdit() {
    card.classList.remove("editing");
    editBtn.focus();
  }

  editBtn.addEventListener("click", openEdit);

  saveBtn.addEventListener("click", function () {
    if (!fTitle.value.trim()) { fTitle.focus(); return; }
    state.title       = fTitle.value.trim();
    state.description = fDesc.value.trim();
    state.priority    = fPriority.value;
    if (fDueDate.value) {
      state.dueDate = new Date(fDueDate.value + "T18:00:00Z");
    }
    renderContent();
    renderPriority();
    renderStatus();
    startTimer();
    closeEdit();
  });

  cancelBtn.addEventListener("click", function () {
    if (snapshot) {
      Object.assign(state, snapshot);
    }
    closeEdit();
  });

  /* Trap focus inside edit form */
  editForm.addEventListener("keydown", function (e) {
    if (e.key !== "Tab") return;
    const focusable = editForm.querySelectorAll('input, textarea, select, button');
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });

  /* ════════════════════════════════════════
     INIT
  ════════════════════════════════════════ */
  renderContent();
  renderPriority();
  renderStatus();
  startTimer();