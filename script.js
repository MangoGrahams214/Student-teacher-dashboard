// ══════════════════════════════════════════
//   StudentPerf Dashboard — script.js
// ══════════════════════════════════════════

/* ─────────────────────────────────────────
   CONSTANTS & STATE
   ───────────────────────────────────────── */

const SUBJECTS = ['Mathematics', 'Science', 'English', 'Filipino', 'MAPEH'];

let state = {
  role: 'teacher',
  currentUser: null,
  students: [
    { id: '2024-0001', fname: 'Maria',  lname: 'Santos',    section: 'A', grades: {} },
    { id: '2024-0002', fname: 'Juan',   lname: 'Dela Cruz', section: 'A', grades: {} },
    { id: '2024-0003', fname: 'Ana',    lname: 'Reyes',     section: 'B', grades: {} },
    { id: '2024-0004', fname: 'Carlos', lname: 'Garcia',    section: 'B', grades: {} },
    { id: '2024-0005', fname: 'Lisa',   lname: 'Mendoza',   section: 'C', grades: {} },
    { id: '2024-0006', fname: 'Miguel', lname: 'Torres',    section: 'A', grades: {} },
    { id: '2024-0007', fname: 'Rosa',   lname: 'Flores',    section: 'C', grades: {} },
    { id: '2024-0008', fname: 'Diego',  lname: 'Ramirez',   section: 'B', grades: {} },
  ],
  gradeRecords: [],
  editingStudentIdx: null,
  charts: {}
};

/* ─────────────────────────────────────────
   SEED DATA
   ───────────────────────────────────────── */

// seedGrades[subjectIndex][studentIndex] = [q1,q2,q3,a1,a2,a3,exam]
const seedGrades = [
  // Mathematics
  [[90,88,92,95,87,91,89],[75,72,78,80,74,76,73],[85,88,84,90,87,92,86],[68,65,70,72,67,69,65],[92,95,90,96,93,91,94],[78,80,76,82,79,81,77],[55,58,52,60,57,54,59],[82,85,80,88,84,86,83]],
  // Science
  [[88,90,87,92,89,91,86],[80,78,82,84,79,81,77],[84,86,82,88,85,87,83],[62,65,60,68,64,66,63],[90,93,88,94,91,89,92],[76,78,74,80,77,79,75],[60,62,58,64,61,59,63],[86,88,84,90,87,89,85]],
  // English
  [[92,90,94,96,91,93,90],[70,73,68,74,71,72,69],[86,88,84,90,87,89,85],[70,68,72,74,69,71,67],[88,91,86,92,89,87,90],[80,82,78,84,81,83,79],[58,60,56,62,59,57,61],[84,86,82,88,85,87,83]],
  // Filipino
  [[86,88,84,90,87,89,85],[73,76,70,78,74,75,72],[82,84,80,86,83,85,81],[66,64,68,70,65,67,63],[91,94,89,95,92,90,93],[79,81,77,83,80,82,78],[62,64,60,66,63,61,65],[88,90,86,92,89,91,87]],
  // MAPEH
  [[89,91,87,93,90,88,91],[77,75,79,81,76,78,74],[83,85,81,87,84,86,82],[64,67,62,68,65,66,63],[93,96,91,97,94,92,95],[77,79,75,81,78,80,76],[57,59,55,61,58,56,60],[80,82,78,84,81,83,79]],
];

state.students.forEach((s, si) => {
  SUBJECTS.forEach((subj, sj) => {
    const d = seedGrades[sj][si];
    state.gradeRecords.push({
      studentId: s.id,
      subject: subj,
      q1: d[0], q2: d[1], q3: d[2],
      a1: d[3], a2: d[4], a3: d[5],
      exam: d[6],
      final: computeGrade(d[0], d[1], d[2], d[3], d[4], d[5], d[6])
    });
  });
});

/* ─────────────────────────────────────────
   UTILITY FUNCTIONS
   ───────────────────────────────────────── */

function computeGrade(q1, q2, q3, a1, a2, a3, exam) {
  const qa = ((+q1 || 0) + (+q2 || 0) + (+q3 || 0)) / 3;
  const aa = ((+a1 || 0) + (+a2 || 0) + (+a3 || 0)) / 3;
  return Math.round(qa * 0.3 + aa * 0.3 + (+exam || 0) * 0.4);
}

function getStudentAvg(studentId) {
  const recs = state.gradeRecords.filter(r => r.studentId === studentId);
  if (!recs.length) return 0;
  return Math.round(recs.reduce((a, r) => a + r.final, 0) / recs.length);
}

function getGradeLabel(avg) {
  if (avg >= 90) return { label: 'Outstanding', color: 'green' };
  if (avg >= 85) return { label: 'Very Good',   color: 'blue'  };
  if (avg >= 80) return { label: 'Good',         color: 'blue'  };
  if (avg >= 75) return { label: 'Fair',          color: 'gold'  };
  return               { label: 'At Risk',       color: 'red'   };
}

function getStudentSubjects(studentId) {
  return SUBJECTS.map(s => {
    const r = state.gradeRecords.find(x => x.studentId === studentId && x.subject === s);
    return r ? r.final : null;
  });
}

function destroyCharts(ids) {
  ids.forEach(id => {
    if (state.charts[id]) {
      try { state.charts[id].destroy(); } catch (e) {}
      delete state.charts[id];
    }
  });
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function showToast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${type === 'success' ? '✅' : '❌'}</span> ${msg}`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

/* ─────────────────────────────────────────
   LOGIN / LOGOUT
   ───────────────────────────────────────── */

let loginRole = 'teacher';

function setRole(r) {
  loginRole = r;
  document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');

  const sw = document.getElementById('student-select-wrap');
  if (r === 'student') {
    sw.style.display = 'block';
    const sel = document.getElementById('student-login-select');
    sel.innerHTML = state.students
      .map(s => `<option value="${s.id}">${s.fname} ${s.lname} (${s.id})</option>`)
      .join('');
    document.getElementById('login-user').value = 'student';
    document.getElementById('login-pass').value = 'pass123';
  } else {
    sw.style.display = 'none';
    document.getElementById('login-user').value = 'teacher1';
    document.getElementById('login-pass').value = 'pass123';
  }
}

function login() {
  const u = document.getElementById('login-user').value.trim();
  const p = document.getElementById('login-pass').value.trim();

  if (p !== 'pass123') { showToast('Invalid credentials', 'error'); return; }

  if (loginRole === 'teacher' && u === 'teacher1') {
    state.role = 'teacher';
    state.currentUser = { name: 'Prof. Reyes', role: 'teacher' };
  } else if (loginRole === 'student') {
    const sid = document.getElementById('student-login-select').value;
    const s   = state.students.find(x => x.id === sid);
    if (!s) { showToast('Student not found', 'error'); return; }
    state.role = 'student';
    state.currentUser = s;
  } else {
    showToast('Invalid credentials', 'error'); return;
  }

  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  initApp();
}

function logout() {
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
  Object.values(state.charts).forEach(c => { try { c.destroy(); } catch (e) {} });
  state.charts = {};
}

/* ─────────────────────────────────────────
   APP INIT & NAVIGATION
   ───────────────────────────────────────── */

const teacherNav = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'students',  icon: '👥', label: 'Students'  },
  { id: 'grades',    icon: '📝', label: 'Grades'    },
  { id: 'rankings',  icon: '🏆', label: 'Rankings'  },
];

const studentNav = [
  { id: 'my-grades',   icon: '📚', label: 'My Grades'   },
  { id: 'my-progress', icon: '📈', label: 'My Progress' },
];

function initApp() {
  const nav   = state.role === 'teacher' ? teacherNav : studentNav;
  const navEl = document.getElementById('nav-items');

  navEl.innerHTML = nav.map(n => `
    <button class="nav-item" id="nav-${n.id}" onclick="showPage('${n.id}')">
      <span class="icon">${n.icon}</span><span>${n.label}</span>
    </button>`).join('');

  document.getElementById('sidebar-role-badge').textContent =
    state.role === 'teacher' ? '👨‍🏫 Teacher View' : '👨‍🎓 Student View';

  const u = state.currentUser;
  document.getElementById('user-display-name').textContent =
    state.role === 'teacher' ? u.name : `${u.fname} ${u.lname}`;
  document.getElementById('user-display-role').textContent =
    state.role === 'teacher' ? 'Class Teacher' : `ID: ${u.id}`;
  document.getElementById('user-avatar-init').textContent =
    state.role === 'teacher' ? 'T' : u.fname[0];

  const firstPage = nav[0].id;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${firstPage}`).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`nav-${firstPage}`)?.classList.add('active');

  if (state.role === 'teacher') renderDashboard();
  else                          renderMyGrades();
}

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${id}`).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`nav-${id}`)?.classList.add('active');

  const renders = {
    dashboard:      renderDashboard,
    students:       renderStudentsTable,
    grades:         renderGradesTable,
    rankings:       renderRankings,
    'my-grades':    renderMyGrades,
    'my-progress':  renderMyProgress,
  };
  if (renders[id]) renders[id]();
}

/* ─────────────────────────────────────────
   TEACHER — DASHBOARD
   ───────────────────────────────────────── */

function renderDashboard() {
  destroyCharts(['chart-bar', 'chart-pie', 'chart-subject']);

  const avgs     = state.students.map(s => getStudentAvg(s.id));
  const classAvg = Math.round(avgs.reduce((a, b) => a + b, 0) / avgs.length);
  const atRisk   = avgs.filter(a => a < 75).length;
  const topScore = Math.max(...avgs);

  // Risk banner
  const riskStudents = state.students.filter((_, i) => avgs[i] < 75);
  document.getElementById('risk-banners').innerHTML = riskStudents.length
    ? `<div class="risk-banner">⚠️ <span>${riskStudents.length} student${riskStudents.length > 1 ? 's' : ''} at risk:</span> ${riskStudents.map(s => `${s.fname} ${s.lname}`).join(', ')}</div>`
    : '';

  // Stat cards
  document.getElementById('stats-grid').innerHTML = `
    <div class="stat-card blue">
      <div class="stat-icon">👥</div>
      <div class="stat-value">${state.students.length}</div>
      <div class="stat-label">Total Students</div>
    </div>
    <div class="stat-card green">
      <div class="stat-icon">📊</div>
      <div class="stat-value">${classAvg}</div>
      <div class="stat-label">Class Average</div>
    </div>
    <div class="stat-card gold">
      <div class="stat-icon">🏆</div>
      <div class="stat-value">${topScore}</div>
      <div class="stat-label">Top Score</div>
    </div>
    <div class="stat-card red">
      <div class="stat-icon">⚠️</div>
      <div class="stat-value">${atRisk}</div>
      <div class="stat-label">At-Risk Students</div>
    </div>`;

  // Bar chart — students sorted by avg
  const sorted = state.students
    .map(s => ({ name: `${s.fname} ${s.lname.split(' ')[0]}.`, avg: getStudentAvg(s.id) }))
    .sort((a, b) => b.avg - a.avg);

  state.charts['chart-bar'] = new Chart(document.getElementById('chart-bar'), {
    type: 'bar',
    data: {
      labels: sorted.map(s => s.name),
      datasets: [{
        label: 'Average',
        data: sorted.map(s => s.avg),
        backgroundColor: sorted.map(s => s.avg >= 75 ? 'rgba(79,127,255,.7)' : 'rgba(255,77,109,.7)'),
        borderRadius: 8, borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#7b82a8', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,.04)' } },
        y: { ticks: { color: '#7b82a8' }, grid: { color: 'rgba(255,255,255,.06)' }, min: 50, max: 100 }
      }
    }
  });

  // Doughnut — grade bands
  const bands = { Outstanding: 0, 'Very Good': 0, Good: 0, Fair: 0, 'At Risk': 0 };
  avgs.forEach(a => { bands[getGradeLabel(a).label]++; });

  state.charts['chart-pie'] = new Chart(document.getElementById('chart-pie'), {
    type: 'doughnut',
    data: {
      labels: Object.keys(bands),
      datasets: [{
        data: Object.values(bands),
        backgroundColor: ['#26d07c', '#4f7fff', '#7c4dff', '#f5c542', '#ff4d6d'],
        borderWidth: 2, borderColor: '#13182a'
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { color: '#7b82a8', boxWidth: 12, font: { size: 11 } } } }
    }
  });

  // Bar chart — subject averages
  const subjectAvgs = SUBJECTS.map(subj => {
    const recs = state.gradeRecords.filter(r => r.subject === subj);
    return recs.length ? Math.round(recs.reduce((a, r) => a + r.final, 0) / recs.length) : 0;
  });

  state.charts['chart-subject'] = new Chart(document.getElementById('chart-subject'), {
    type: 'bar',
    data: {
      labels: SUBJECTS,
      datasets: [{
        label: 'Class Average',
        data: subjectAvgs,
        backgroundColor: [
          'rgba(79,127,255,.7)', 'rgba(38,208,124,.7)',
          'rgba(124,77,255,.7)', 'rgba(245,197,66,.7)', 'rgba(255,159,67,.7)'
        ],
        borderRadius: 8, borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#7b82a8' }, grid: { display: false } },
        y: { ticks: { color: '#7b82a8' }, grid: { color: 'rgba(255,255,255,.06)' }, min: 50, max: 100 }
      }
    }
  });
}

/* ─────────────────────────────────────────
   TEACHER — STUDENTS
   ───────────────────────────────────────── */

let studentSearchVal = '';

function renderStudentsTable() {
  const avgs   = state.students.map(s => getStudentAvg(s.id));
  const ranked = state.students.map((s, i) => ({ ...s, avg: avgs[i], rank: 0 }));
  ranked.sort((a, b) => b.avg - a.avg);
  ranked.forEach((s, i) => (s.rank = i + 1));

  const sf  = document.getElementById('filter-section')?.value || '';
  const stf = document.getElementById('filter-status')?.value  || '';

  const visible = ranked.filter(s => {
    const name       = `${s.fname} ${s.lname}`.toLowerCase();
    const matchSearch = !studentSearchVal || name.includes(studentSearchVal.toLowerCase()) || s.id.includes(studentSearchVal);
    const matchSect   = !sf  || s.section === sf;
    const matchStatus = !stf || (stf === 'passing' ? s.avg >= 75 : s.avg < 75);
    return matchSearch && matchSect && matchStatus;
  });

  const tbody = document.getElementById('students-tbody');
  if (!visible.length) {
    tbody.innerHTML = `<tr><td colspan="12"><div class="empty-state"><div class="empty-icon">🔍</div>No students found.</div></td></tr>`;
    return;
  }

  tbody.innerHTML = visible.map(s => {
    const subScores = SUBJECTS.map(subj => {
      const r = state.gradeRecords.find(x => x.studentId === s.id && x.subject === subj);
      return r ? r.final : '—';
    });
    const gl     = getGradeLabel(s.avg);
    const rClass = s.rank === 1 ? 'gold' : s.rank === 2 ? 'silver' : s.rank === 3 ? 'bronze' : '';
    return `<tr>
      <td><span class="rank-badge ${rClass}">${s.rank}</span></td>
      <td><strong>${s.fname} ${s.lname}</strong></td>
      <td style="color:var(--text-dim);font-size:.82rem;">${s.id}</td>
      <td>${s.section}</td>
      ${subScores.map(sc => `<td>${sc}</td>`).join('')}
      <td><strong style="color:${s.avg >= 75 ? 'var(--accent)' : 'var(--red)'};">${s.avg}</strong></td>
      <td><span class="badge badge-${gl.color}">${gl.label}</span></td>
      <td>
        <button class="btn btn-ghost" style="padding:5px 10px;font-size:.75rem;" onclick="openEditStudent('${s.id}')">Edit</button>
        <button class="btn btn-danger" style="padding:5px 10px;font-size:.75rem;" onclick="deleteStudent('${s.id}')">Del</button>
      </td>
    </tr>`;
  }).join('');
}

function filterStudents(val) {
  if (val !== undefined) studentSearchVal = val;
  renderStudentsTable();
}

function openAddStudent() {
  state.editingStudentIdx = null;
  document.getElementById('student-modal-title').textContent = 'Add New Student';
  ['s-fname', 's-lname', 's-id'].forEach(id => (document.getElementById(id).value = ''));
  document.getElementById('s-section').value = 'A';
  document.getElementById('student-modal').classList.add('open');
}

function openEditStudent(sid) {
  const s = state.students.find(x => x.id === sid);
  if (!s) return;
  state.editingStudentIdx = state.students.indexOf(s);
  document.getElementById('student-modal-title').textContent = 'Edit Student';
  document.getElementById('s-fname').value   = s.fname;
  document.getElementById('s-lname').value   = s.lname;
  document.getElementById('s-id').value      = s.id;
  document.getElementById('s-section').value = s.section;
  document.getElementById('student-modal').classList.add('open');
}

function saveStudent() {
  const fname   = document.getElementById('s-fname').value.trim();
  const lname   = document.getElementById('s-lname').value.trim();
  const id      = document.getElementById('s-id').value.trim();
  const section = document.getElementById('s-section').value;

  if (!fname || !lname || !id) { showToast('Fill in all fields', 'error'); return; }

  if (state.editingStudentIdx === null) {
    if (state.students.find(s => s.id === id)) { showToast('Student ID already exists', 'error'); return; }
    state.students.push({ id, fname, lname, section, grades: {} });
    showToast('Student added successfully!', 'success');
  } else {
    state.students[state.editingStudentIdx] = {
      ...state.students[state.editingStudentIdx], fname, lname, section
    };
    showToast('Student updated!', 'success');
  }

  closeModal('student-modal');
  renderStudentsTable();
  populateStudentSelect();
}

function deleteStudent(sid) {
  if (!confirm('Delete this student and all their grades?')) return;
  state.students     = state.students.filter(s => s.id !== sid);
  state.gradeRecords = state.gradeRecords.filter(r => r.studentId !== sid);
  showToast('Student deleted', 'success');
  renderStudentsTable();
}

/* ─────────────────────────────────────────
   TEACHER — GRADES
   ───────────────────────────────────────── */

function renderGradesTable() {
  const tbody = document.getElementById('grades-tbody');
  if (!state.gradeRecords.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">📝</div>No grade records yet.</div></td></tr>`;
    return;
  }
  tbody.innerHTML = state.gradeRecords.map((r, i) => {
    const s    = state.students.find(x => x.id === r.studentId);
    const name = s ? `${s.fname} ${s.lname}` : 'Unknown';
    const qa   = ((r.q1 + r.q2 + r.q3) / 3).toFixed(1);
    const aa   = ((r.a1 + r.a2 + r.a3) / 3).toFixed(1);
    return `<tr>
      <td><strong>${name}</strong></td>
      <td>${r.subject}</td>
      <td>${qa}</td><td>${aa}</td><td>${r.exam}</td>
      <td><strong style="color:${r.final >= 75 ? 'var(--accent)' : 'var(--red)'};">${r.final}</strong></td>
      <td>
        <button class="btn btn-ghost" style="padding:5px 10px;font-size:.75rem;" onclick="editGradeRecord(${i})">Edit</button>
        <button class="btn btn-danger" style="padding:5px 10px;font-size:.75rem;" onclick="deleteGrade(${i})">Del</button>
      </td>
    </tr>`;
  }).join('');
}

function populateStudentSelect() {
  const sel = document.getElementById('g-student');
  sel.innerHTML = state.students
    .map(s => `<option value="${s.id}">${s.fname} ${s.lname}</option>`)
    .join('');
}

function openGradeModal() {
  populateStudentSelect();
  ['g-q1', 'g-q2', 'g-q3', 'g-a1', 'g-a2', 'g-a3', 'g-exam'].forEach(id => (document.getElementById(id).value = ''));
  document.getElementById('grade-preview').textContent = '—';
  delete document.getElementById('grade-modal').dataset.editIdx;
  document.getElementById('grade-modal').classList.add('open');
}

function editGradeRecord(i) {
  const r = state.gradeRecords[i];
  populateStudentSelect();
  document.getElementById('g-student').value = r.studentId;
  document.getElementById('g-subject').value = r.subject;
  document.getElementById('g-q1').value      = r.q1;
  document.getElementById('g-q2').value      = r.q2;
  document.getElementById('g-q3').value      = r.q3;
  document.getElementById('g-a1').value      = r.a1;
  document.getElementById('g-a2').value      = r.a2;
  document.getElementById('g-a3').value      = r.a3;
  document.getElementById('g-exam').value    = r.exam;
  updateGradePreview();
  document.getElementById('grade-modal').dataset.editIdx = i;
  document.getElementById('grade-modal').classList.add('open');
}

function deleteGrade(i) {
  if (!confirm('Delete this grade record?')) return;
  state.gradeRecords.splice(i, 1);
  showToast('Grade deleted', 'success');
  renderGradesTable();
}

function updateGradePreview() {
  const vals  = ['g-q1', 'g-q2', 'g-q3', 'g-a1', 'g-a2', 'g-a3', 'g-exam'].map(id => +document.getElementById(id).value || 0);
  const grade = computeGrade(...vals);
  const el    = document.getElementById('grade-preview');
  el.textContent = grade || '—';
  el.style.color = grade >= 75 ? 'var(--green)' : 'var(--red)';
}

function saveGrade() {
  const sid   = document.getElementById('g-student').value;
  const subj  = document.getElementById('g-subject').value;
  const vals  = ['g-q1', 'g-q2', 'g-q3', 'g-a1', 'g-a2', 'g-a3', 'g-exam'].map(id => +document.getElementById(id).value || 0);
  const [q1, q2, q3, a1, a2, a3, exam] = vals;
  const final = computeGrade(q1, q2, q3, a1, a2, a3, exam);
  const record = { studentId: sid, subject: subj, q1, q2, q3, a1, a2, a3, exam, final };

  const editIdx = document.getElementById('grade-modal').dataset.editIdx;
  if (editIdx !== undefined && editIdx !== '') {
    state.gradeRecords[+editIdx] = record;
    delete document.getElementById('grade-modal').dataset.editIdx;
    showToast('Grade updated!', 'success');
  } else {
    const existing = state.gradeRecords.findIndex(r => r.studentId === sid && r.subject === subj);
    if (existing >= 0) state.gradeRecords[existing] = record;
    else               state.gradeRecords.push(record);
    showToast('Grade saved!', 'success');
  }

  closeModal('grade-modal');
  renderGradesTable();
}

/* ─────────────────────────────────────────
   TEACHER — RANKINGS
   ───────────────────────────────────────── */

function renderRankings() {
  destroyCharts(['chart-top']);

  const ranked = [...state.students]
    .map(s => ({ ...s, avg: getStudentAvg(s.id) }))
    .sort((a, b) => b.avg - a.avg);
  ranked.forEach((s, i) => (s.rank = i + 1));

  // Top-5 horizontal bar
  const top5 = ranked.slice(0, 5);
  state.charts['chart-top'] = new Chart(document.getElementById('chart-top'), {
    type: 'bar',
    data: {
      labels: top5.map(s => `${s.fname} ${s.lname.split(' ')[0]}.`),
      datasets: [{
        data: top5.map(s => s.avg),
        backgroundColor: [
          'rgba(245,197,66,.8)', 'rgba(192,192,192,.6)',
          'rgba(205,127,50,.6)', 'rgba(79,127,255,.5)', 'rgba(79,127,255,.4)'
        ],
        borderRadius: 10, borderSkipped: false
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#7b82a8' }, grid: { color: 'rgba(255,255,255,.06)' }, min: 50, max: 100 },
        y: { ticks: { color: '#e8eaf6', font: { weight: '600' } }, grid: { display: false } }
      }
    }
  });

  // At-risk list
  const atRisk = ranked.filter(s => s.avg < 75);
  document.getElementById('at-risk-list').innerHTML = atRisk.length
    ? atRisk.map(s => `
        <div style="display:flex;align-items:center;gap:10px;padding:10px;background:rgba(255,77,109,.06);border:1px solid rgba(255,77,109,.15);border-radius:8px;margin-bottom:8px;">
          <span style="font-size:1.2rem;">⚠️</span>
          <div>
            <div style="font-size:.9rem;font-weight:500;">${s.fname} ${s.lname}</div>
            <div style="font-size:.78rem;color:var(--text-dim);">Section ${s.section} · Avg: <span style="color:var(--red);font-weight:700;">${s.avg}</span></div>
          </div>
        </div>`).join('')
    : '<div class="empty-state" style="padding:20px;"><div class="empty-icon">✅</div>No at-risk students!</div>';

  // Full rankings table
  document.getElementById('rankings-tbody').innerHTML = ranked.map(s => {
    const gl       = getGradeLabel(s.avg);
    const rClass   = s.rank === 1 ? 'gold' : s.rank === 2 ? 'silver' : s.rank === 3 ? 'bronze' : '';
    const pct      = Math.round((s.avg - 50) / 50 * 100);
    const barColor = s.avg >= 90 ? '#26d07c' : s.avg >= 75 ? '#4f7fff' : '#ff4d6d';
    return `<tr>
      <td><span class="rank-badge ${rClass}">${s.rank}</span></td>
      <td><strong>${s.fname} ${s.lname}</strong></td>
      <td>${s.section}</td>
      <td><strong style="color:${s.avg >= 75 ? 'var(--accent)' : 'var(--red)'};">${s.avg}</strong></td>
      <td><span class="badge badge-${gl.color}">${gl.label}</span></td>
      <td>
        <div class="progress-bar-wrap">
          <div class="progress-bar" style="width:${Math.max(0, pct)}%;background:${barColor};"></div>
        </div>
      </td>
    </tr>`;
  }).join('');
}

/* ─────────────────────────────────────────
   STUDENT — MY GRADES
   ───────────────────────────────────────── */

function renderMyGrades() {
  destroyCharts(['chart-student-subject']);

  const s         = state.currentUser;
  const avg       = getStudentAvg(s.id);
  const gl        = getGradeLabel(avg);
  const subScores = getStudentSubjects(s.id);

  // Profile card
  document.getElementById('student-profile-card').innerHTML = `
    <div class="profile-avatar">${s.fname[0]}</div>
    <div class="profile-name">${s.fname} ${s.lname}</div>
    <div class="profile-id">${s.id} · Section ${s.section}</div>
    <div class="profile-gpa">
      <div class="gpa-val">${avg}</div>
      <div class="gpa-label">Overall Average</div>
    </div>
    <span class="badge badge-${gl.color}" style="display:inline-block;margin-bottom:16px;">${gl.label}</span>
    <div class="subject-grades">
      ${SUBJECTS.map((subj, i) => {
        const score = subScores[i] || 0;
        const color = score >= 90 ? '#26d07c' : score >= 75 ? '#4f7fff' : '#ff4d6d';
        return `<div class="subject-row">
          <div class="subject-name">${subj.substring(0, 4)}.</div>
          <div class="subject-bar"><div class="subject-bar-fill" style="width:${score}%;background:${color};"></div></div>
          <div class="subject-score" style="color:${color};">${score || '—'}</div>
        </div>`;
      }).join('')}
    </div>`;

  // Subject bar chart
  state.charts['chart-student-subject'] = new Chart(document.getElementById('chart-student-subject'), {
    type: 'bar',
    data: {
      labels: SUBJECTS,
      datasets: [{
        label: 'Your Score',
        data: subScores,
        backgroundColor: subScores.map(sc => sc >= 90 ? 'rgba(38,208,124,.7)' : sc >= 75 ? 'rgba(79,127,255,.7)' : 'rgba(255,77,109,.7)'),
        borderRadius: 8, borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#7b82a8' }, grid: { display: false } },
        y: { ticks: { color: '#7b82a8' }, grid: { color: 'rgba(255,255,255,.06)' }, min: 50, max: 100 }
      }
    }
  });

  // Detail table
  const tbody = document.getElementById('my-grades-tbody');
  const recs  = SUBJECTS.map(subj => state.gradeRecords.find(r => r.studentId === s.id && r.subject === subj));
  tbody.innerHTML = recs.map((r, i) => {
    if (!r) return `<tr><td>${SUBJECTS[i]}</td><td colspan="5" style="color:var(--text-muted);">No grades recorded</td></tr>`;
    const gl = getGradeLabel(r.final);
    return `<tr>
      <td><strong>${r.subject}</strong></td>
      <td>${((r.q1 + r.q2 + r.q3) / 3).toFixed(1)}</td>
      <td>${((r.a1 + r.a2 + r.a3) / 3).toFixed(1)}</td>
      <td>${r.exam}</td>
      <td><strong style="color:${r.final >= 75 ? 'var(--accent)' : 'var(--red)'};">${r.final}</strong></td>
      <td><span class="badge badge-${gl.color}">${gl.label}</span></td>
    </tr>`;
  }).join('');
}

/* ─────────────────────────────────────────
   STUDENT — MY PROGRESS
   ───────────────────────────────────────── */

function renderMyProgress() {
  destroyCharts(['chart-student-progress', 'chart-student-radar', 'chart-student-donut']);

  const s         = state.currentUser;
  const subScores = getStudentSubjects(s.id);
  const valid     = subScores.filter(Boolean);
  const baseAvg   = valid.reduce((a, b) => a + b, 0) / valid.length;

  // Simulated quarterly trend
  const qData = [
    Math.round(baseAvg * 0.88),
    Math.round(baseAvg * 0.93),
    Math.round(baseAvg * 0.97),
    Math.round(baseAvg)
  ];

  state.charts['chart-student-progress'] = new Chart(document.getElementById('chart-student-progress'), {
    type: 'line',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [{
        label: 'Overall Average',
        data: qData,
        borderColor: '#4f7fff',
        backgroundColor: 'rgba(79,127,255,.15)',
        fill: true, tension: .4,
        pointRadius: 6, pointBackgroundColor: '#4f7fff',
        pointBorderColor: '#13182a', pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#7b82a8' }, grid: { display: false } },
        y: { ticks: { color: '#7b82a8' }, grid: { color: 'rgba(255,255,255,.06)' }, min: 50, max: 100 }
      }
    }
  });

  // Radar
  state.charts['chart-student-radar'] = new Chart(document.getElementById('chart-student-radar'), {
    type: 'radar',
    data: {
      labels: SUBJECTS,
      datasets: [{
        label: 'Your Scores',
        data: subScores,
        borderColor: '#7c4dff',
        backgroundColor: 'rgba(124,77,255,.15)',
        pointBackgroundColor: '#7c4dff',
        pointBorderColor: '#13182a', pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        r: {
          ticks: { display: false, stepSize: 20 },
          grid: { color: 'rgba(255,255,255,.08)' },
          angleLines: { color: 'rgba(255,255,255,.08)' },
          pointLabels: { color: '#7b82a8', font: { size: 11 } },
          min: 0, max: 100
        }
      }
    }
  });

  // Donut — component averages
  const recs  = state.gradeRecords.filter(r => r.studentId === s.id);
  const avgQA = recs.length ? recs.reduce((a, r) => a + (r.q1 + r.q2 + r.q3) / 3, 0) / recs.length : 0;
  const avgAA = recs.length ? recs.reduce((a, r) => a + (r.a1 + r.a2 + r.a3) / 3, 0) / recs.length : 0;
  const avgEx = recs.length ? recs.reduce((a, r) => a + r.exam, 0)                  / recs.length : 0;

  state.charts['chart-student-donut'] = new Chart(document.getElementById('chart-student-donut'), {
    type: 'doughnut',
    data: {
      labels: ['Quizzes (30%)', 'Assignments (30%)', 'Exams (40%)'],
      datasets: [{
        data: [Math.round(avgQA), Math.round(avgAA), Math.round(avgEx)],
        backgroundColor: ['rgba(79,127,255,.8)', 'rgba(38,208,124,.8)', 'rgba(245,197,66,.8)'],
        borderWidth: 2, borderColor: '#13182a'
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { color: '#7b82a8', boxWidth: 12, font: { size: 11 } } } }
    }
  });
}

/* ─────────────────────────────────────────
   GLOBAL EVENT LISTENERS
   (runs after DOM is fully loaded via defer / bottom-of-body placement)
   ───────────────────────────────────────── */

// Close modals when clicking the backdrop
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});

// Live grade preview in grade modal
['g-q1', 'g-q2', 'g-q3', 'g-a1', 'g-a2', 'g-a3', 'g-exam'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', updateGradePreview);
});