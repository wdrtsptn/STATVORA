// Global State & Data
let radarChartInstance = null;
const intervalColors = ['#ff2d55', '#ff9500', '#ffcc00', '#34c759', '#007aff', '#af52de'];
const intervalLabels = ["00-15'", "16-30'", "31-45'", "46-60'", "61-75'", "76-90+'"];

// Dataset Mock Templates
const mockDatasets = {
  default: {
    teamA: { 
      name: "Real Madrid", attack: 85, midfield: 88, defence: 82, goalkeepers: 86, rating: 87, squad: 89,
      goalsHome: 2.4, goalsAway: 1.6, winsHome: 8, winsAway: 5, cornersHome: 6.2, cornersAway: 4.8,
      goalsDist: [4, 6, 3, 5, 4, 8],
      last5: [
        { opponent: 'vs Girona', score: '3 - 0', result: 'W' },
        { opponent: 'vs Atletico', score: '1 - 1', result: 'D' },
        { opponent: 'vs Sevilla', score: '2 - 1', result: 'W' },
        { opponent: 'vs Leipzig', score: '1 - 0', result: 'W' },
        { opponent: 'vs Valencia', score: '2 - 2', result: 'D' }
      ]
    },
    teamB: { 
      name: "FC Barcelona", attack: 83, midfield: 86, defence: 78, goalkeepers: 80, rating: 84, squad: 85,
      goalsHome: 2.1, goalsAway: 1.9, winsHome: 7, winsAway: 6, cornersHome: 5.9, cornersAway: 5.4,
      goalsDist: [3, 4, 5, 3, 6, 7],
      last5: [
        { opponent: 'vs Celta Vigo', score: '2 - 1', result: 'W' },
        { opponent: 'vs Napoli', score: '1 - 1', result: 'D' },
        { opponent: 'vs Granada', score: '3 - 3', result: 'D' },
        { opponent: 'vs Alaves', score: '3 - 1', result: 'W' },
        { opponent: 'vs Osasuna', score: '1 - 0', result: 'W' }
      ]
    },
    h2h: [
      { date: '21 Oct 2025', home: 'Real Madrid', away: 'FC Barcelona', score: '2 - 1' },
      { date: '21 Apr 2025', home: 'Real Madrid', away: 'FC Barcelona', score: '3 - 2' },
      { date: '28 Oct 2024', home: 'FC Barcelona', away: 'Real Madrid', score: '1 - 2' },
      { date: '06 Apr 2024', home: 'FC Barcelona', away: 'Real Madrid', score: '0 - 4' },
      { date: '16 Jan 2024', home: 'Real Madrid', away: 'FC Barcelona', score: '4 - 1' }
    ]
  },
  alternate: {
    teamA: { 
      name: "Arsenal FC", attack: 82, midfield: 85, defence: 88, goalkeepers: 84, rating: 85, squad: 86,
      goalsHome: 2.1, goalsAway: 1.5, winsHome: 7, winsAway: 5, cornersHome: 6.8, cornersAway: 5.1,
      goalsDist: [5, 3, 4, 6, 3, 5],
      last5: [
        { opponent: 'vs Newcastle', score: '4 - 1', result: 'W' },
        { opponent: 'vs Porto', score: '0 - 1', result: 'L' },
        { opponent: 'vs Burnley', score: '5 - 0', result: 'W' },
        { opponent: 'vs West Ham', score: '6 - 0', result: 'W' },
        { opponent: 'vs Liverpool', score: '3 - 1', result: 'W' }
      ]
    },
    teamB: { 
      name: "Man City", attack: 89, midfield: 91, defence: 85, goalkeepers: 87, rating: 89, squad: 92,
      goalsHome: 2.6, goalsAway: 2.2, winsHome: 8, winsAway: 7, cornersHome: 7.2, cornersAway: 6.0,
      goalsDist: [2, 5, 6, 4, 7, 8],
      last5: [
        { opponent: 'vs Bournemouth', score: '1 - 0', result: 'W' },
        { opponent: 'vs Brentford', score: '1 - 0', result: 'W' },
        { opponent: 'vs Chelsea', score: '1 - 1', result: 'D' },
        { opponent: 'vs Copenhagen', score: '3 - 1', result: 'W' },
        { opponent: 'vs Everton', score: '2 - 0', result: 'W' }
      ]
    },
    h2h: [
      { date: '31 Mar 2025', home: 'Man City', away: 'Arsenal FC', score: '0 - 0' },
      { date: '08 Oct 2024', home: 'Arsenal FC', away: 'Man City', score: '1 - 0' },
      { date: '06 Aug 2024', home: 'Arsenal FC', away: 'Man City', score: '1 - 1' },
      { date: '27 Apr 2024', home: 'Man City', away: 'Arsenal FC', score: '4 - 1' },
      { date: '15 Feb 2024', home: 'Arsenal FC', away: 'Man City', score: '1 - 3' }
    ]
  }
};

let currentDataset = mockDatasets.default;

// Theme Toggle Functionality
function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  if (!themeToggle) return;
  themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    if (radarChartInstance) {
      radarChartInstance.destroy();
      initRadarChart();
    }
  });
}

// Initialization on Load
window.onload = function () {
  initThemeToggle();
  initRadarChart();
  renderHomeAwayContext();
  renderH2HandLast5();
  renderGoalTimingDistribution();
  renderMonteCarloResults();
  renderStatisticalSelections();
};

// Render Home vs Away Context Separated
function renderHomeAwayContext() {
  const a = currentDataset.teamA;
  const b = currentDataset.teamB;

  document.getElementById('teamANameHomeLabel').innerText = `${a.name} (Home Team)`;
  document.getElementById('teamAGoalsHome').innerText = a.goalsHome.toFixed(2);
  document.getElementById('teamAGoalsAway').innerText = a.goalsAway.toFixed(2);
  document.getElementById('teamAWinsHome').innerText = `${a.winsHome} Match`;
  document.getElementById('teamAWinsAway').innerText = `${a.winsAway} Match`;
  document.getElementById('teamACornersHome').innerText = a.cornersHome.toFixed(1);
  document.getElementById('teamACornersAway').innerText = a.cornersAway.toFixed(1);

  document.getElementById('teamBNameAwayLabel').innerText = `${b.name} (Away Team)`;
  document.getElementById('teamBGoalsHome').innerText = b.goalsHome.toFixed(2);
  document.getElementById('teamBGoalsAway').innerText = b.goalsAway.toFixed(2);
  document.getElementById('teamBWinsHome').innerText = `${b.winsHome} Match`;
  document.getElementById('teamBWinsAway').innerText = `${b.winsAway} Match`;
  document.getElementById('teamBCornersHome').innerText = b.cornersHome.toFixed(1);
  document.getElementById('teamBCornersAway').innerText = b.cornersAway.toFixed(1);
}

// Render Head-to-Head & Last 5 Matches
function renderH2HandLast5() {
  // H2H
  const h2hContainer = document.getElementById('h2hList');
  h2hContainer.innerHTML = '';
  currentDataset.h2h.forEach(item => {
    const row = document.createElement('div');
    row.className = 'flex items-center justify-between p-2.5 rounded-xl bg-white/40 dark:bg-white/5 border border-white/20';
    row.innerHTML = `
      <span class="text-[10px] text-gray-500 font-medium">${item.date}</span>
      <span class="font-semibold text-gray-700 dark:text-gray-300">${item.home} vs ${item.away}</span>
      <span class="font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">${item.score}</span>
    `;
    h2hContainer.appendChild(row);
  });

  // Last 5 Team A
  document.getElementById('last5TitleA').innerText = currentDataset.teamA.name;
  const last5ContainerA = document.getElementById('last5ListA');
  last5ContainerA.innerHTML = '';
  currentDataset.teamA.last5.forEach(m => {
    const row = document.createElement('div');
    const badgeColor = m.result === 'W' ? 'bg-emerald-500 text-white' : m.result === 'D' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white';
    row.className = 'flex items-center justify-between p-2 rounded-xl bg-white/40 dark:bg-white/5 border border-white/20';
    row.innerHTML = `
      <span class="text-gray-600 dark:text-gray-400 font-medium">${m.opponent}</span>
      <div class="flex items-center gap-1.5 font-bold">
        <span>${m.score}</span>
        <span class="w-4 h-4 rounded text-[9px] flex items-center justify-center ${badgeColor}">${m.result}</span>
      </div>
    `;
    last5ContainerA.appendChild(row);
  });

  // Last 5 Team B
  document.getElementById('last5TitleB').innerText = currentDataset.teamB.name;
  const last5ContainerB = document.getElementById('last5ListB');
  last5ContainerB.innerHTML = '';
  currentDataset.teamB.last5.forEach(m => {
    const row = document.createElement('div');
    const badgeColor = m.result === 'W' ? 'bg-emerald-500 text-white' : m.result === 'D' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white';
    row.className = 'flex items-center justify-between p-2 rounded-xl bg-white/40 dark:bg-white/5 border border-white/20';
    row.innerHTML = `
      <span class="text-gray-600 dark:text-gray-400 font-medium">${m.opponent}</span>
      <div class="flex items-center gap-1.5 font-bold">
        <span>${m.score}</span>
        <span class="w-4 h-4 rounded text-[9px] flex items-center justify-center ${badgeColor}">${m.result}</span>
      </div>
    `;
    last5ContainerB.appendChild(row);
  });
}

// SECTION 2: Radar Chart Initialization
function initRadarChart() {
  const ctx = document.getElementById('squadRadarChart').getContext('2d');
  const isDark = document.documentElement.classList.contains('dark');
  
  radarChartInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Attack', 'Midfield', 'Defence', 'Goalkeepers', 'Squad Depth', 'Rating'],
      datasets: [
        {
          label: currentDataset.teamA.name,
          data: [
            currentDataset.teamA.attack,
            currentDataset.teamA.midfield,
            currentDataset.teamA.defence,
            currentDataset.teamA.goalkeepers,
            currentDataset.teamA.squad,
            currentDataset.teamA.rating
          ],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.25)',
          borderWidth: 2.5,
          pointBackgroundColor: '#10b981'
        },
        {
          label: currentDataset.teamB.name,
          data: [
            currentDataset.teamB.attack,
            currentDataset.teamB.midfield,
            currentDataset.teamB.defence,
            currentDataset.teamB.goalkeepers,
            currentDataset.teamB.squad,
            currentDataset.teamB.rating
          ],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.25)',
          borderWidth: 2.5,
          pointBackgroundColor: '#3b82f6'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: { color: 'rgba(150, 150, 150, 0.2)' },
          grid: { color: 'rgba(150, 150, 150, 0.2)' },
          pointLabels: {
            font: { size: 11, family: '-apple-system', weight: 'bold' },
            color: isDark ? '#e5e7eb' : '#374151'
          },
          ticks: { display: false, stepSize: 20 },
          min: 50,
          max: 100
        }
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            boxWidth: 12,
            font: { family: '-apple-system', size: 12, weight: 'bold' }
          }
        }
      }
    }
  });
}

// SECTION 4: Goal Timing Distribution Rendering (Segmented Bar Timeline)
function renderGoalTimingDistribution() {
  const distA = currentDataset.teamA.goalsDist;
  const distB = currentDataset.teamB.goalsDist;
  
  const totalA = distA.reduce((a, b) => a + b, 0);
  const totalB = distB.reduce((a, b) => a + b, 0);

  document.getElementById('teamATotalGoalsCount').innerText = `Total: ${totalA} Goals`;
  document.getElementById('teamBTotalGoalsCount').innerText = `Total: ${totalB} Goals`;

  // Timeline Bars & Labels Containers
  const timelineA = document.getElementById('timelineTeamA');
  const labelsA = document.getElementById('labelsTeamA');
  const timelineB = document.getElementById('timelineTeamB');
  const labelsB = document.getElementById('labelsTeamB');

  timelineA.innerHTML = '';
  labelsA.innerHTML = '';
  timelineB.innerHTML = '';
  labelsB.innerHTML = '';

  // Build Team A Segments
  distA.forEach((count, i) => {
    const flexWeight = count;
    const seg = document.createElement('div');
    seg.className = 'timeline-segment rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm';
    seg.style.flex = `${flexWeight} 1 0%`;
    seg.style.backgroundColor = intervalColors[i];
    seg.title = `${intervalLabels[i]}: ${count} goals`;
    timelineA.appendChild(seg);

    const lbl = document.createElement('div');
    lbl.style.flex = `${flexWeight} 1 0%`;
    lbl.innerText = `${count}`;
    labelsA.appendChild(lbl);
  });

  // Build Team B Segments
  distB.forEach((count, i) => {
    const flexWeight = count;
    const seg = document.createElement('div');
    seg.className = 'timeline-segment rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm';
    seg.style.flex = `${flexWeight} 1 0%`;
    seg.style.backgroundColor = intervalColors[i];
    seg.title = `${intervalLabels[i]}: ${count} goals`;
    timelineB.appendChild(seg);

    const lbl = document.createElement('div');
    lbl.style.flex = `${flexWeight} 1 0%`;
    lbl.innerText = `${count}`;
    labelsB.appendChild(lbl);
  });
}

// SECTION 5: Independent Monte Carlo Engine Output
function renderMonteCarloResults() {
  const homeWin = 48.5;
  const draw = 26.2;
  const awayWin = 25.3;

  document.getElementById('mcProbHome').innerText = `${homeWin}%`;
  document.getElementById('mcProbDraw').innerText = `${draw}%`;
  document.getElementById('mcProbAway').innerText = `${awayWin}%`;

  document.getElementById('mcBarHome').style.width = `${homeWin}%`;
  document.getElementById('mcBarDraw').style.width = `${draw}%`;
  document.getElementById('mcBarAway').style.width = `${awayWin}%`;

  const topScores = [
    { score: '2 - 1', prob: '14.2%', teamWin: 'home' },
    { score: '1 - 1', prob: '12.8%', teamWin: 'draw' },
    { score: '2 - 0', prob: '10.5%', teamWin: 'home' },
    { score: '1 - 2', prob: '8.4%', teamWin: 'away' },
    { score: '3 - 1', prob: '6.7%', teamWin: 'home' },
  ];

  const listContainer = document.getElementById('mcTopScoresList');
  listContainer.innerHTML = '';

  topScores.forEach(item => {
    const row = document.createElement('div');
    row.className = 'flex items-center justify-between p-2 rounded-xl bg-white/40 dark:bg-white/5 border border-white/20';
    row.innerHTML = `
      <span class="font-bold tracking-wider">${item.score}</span>
      <span class="font-semibold px-2 py-0.5 rounded-full text-[10px] ${
        item.teamWin === 'home' ? 'bg-emerald-500/10 text-emerald-600' :
        item.teamWin === 'draw' ? 'bg-amber-500/10 text-amber-600' : 'bg-blue-500/10 text-blue-600'
      }">${item.prob} frequency</span>
    `;
    listContainer.appendChild(row);
  });
}

// SECTION 6: Statistical Selections (Pilihan Terbaik)
function renderStatisticalSelections() {
  const selections = [
    { market: '1X2', pick: 'Home Win (Team A)', risk: 'Low Risk', text: 'Statistical support high: 70% Home win rate in last 10 venue matches.' },
    { market: 'Draw No Bet (DNB)', pick: 'Team A (DNB)', risk: 'Low Risk', text: 'Team A unbeaten in 90% of home fixtures this season.' },
    { market: 'Double Chance', pick: '1X (Home or Draw)', risk: 'Low Risk', text: 'Very high historical consistency across past H2H matches.' },
    { market: 'Both Teams To Score (BTTS)', pick: 'Yes (BTTS - Yes)', risk: 'Low Risk', text: '80% of both teams home/away games yielded goals on both sides.' },
    { market: 'Total Goals', pick: 'Over 2.5 Goals', risk: 'Medium Risk', text: 'Combined xG average sits at 3.10 with high late-game distribution.' },
    { market: 'HT Total Goals', pick: 'Over 0.5 HT', risk: 'Low Risk', text: 'Both teams scored 78% of their goals before the 45+ minute interval.' },
    { market: 'Team Total Home', pick: 'Team A Over 1.5', risk: 'Medium Risk', text: 'Team A averaged 2.4 goals per home match in last sample.' },
    { market: 'Team Total Away', pick: 'Team B Under 1.5', risk: 'Medium Risk', text: 'Team B away goal output drops 32% against top 4 defenses.' },
    { market: 'Asian Handicap', pick: 'Team A -0.75', risk: 'Medium Risk', text: 'Simulated win margin favors Team A by 1.15 goals.' },
    { market: 'Total Corner', pick: 'Over 9.5 Corners', risk: 'Low Risk', text: 'Combined average corners per match equals 11.6.' },
    { market: 'Correct Score', pick: '2 - 1 / 3 - 1', risk: 'High Risk', text: 'Highest Monte Carlo frequency output with elevated variance.' },
  ];

  const grid = document.getElementById('marketSelectionsGrid');
  grid.innerHTML = '';

  selections.forEach(item => {
    const card = document.createElement('div');
    const badgeColor = 
      item.risk === 'Low Risk' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
      item.risk === 'Medium Risk' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
      'bg-rose-500/10 text-rose-600 border-rose-500/20';

    card.className = 'p-4 rounded-3xl bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/10 space-y-2 hover:border-blue-500/40 transition';
    card.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">${item.market}</span>
        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor}">${item.risk}</span>
      </div>
      <div class="text-sm font-bold text-gray-900 dark:text-gray-100">${item.pick}</div>
      <p class="text-xs text-gray-500 leading-relaxed">${item.text}</p>
    `;
    grid.appendChild(card);
  });
}

// Dynamic Form Interactivity Action
function handleCompare(e) {
  e.preventDefault();

  currentDataset = (currentDataset === mockDatasets.default) ? mockDatasets.alternate : mockDatasets.default;

  document.getElementById('teamANameDisplay').innerText = currentDataset.teamA.name;
  document.getElementById('teamBNameDisplay').innerText = currentDataset.teamB.name;

  radarChartInstance.data.datasets[0].label = currentDataset.teamA.name;
  radarChartInstance.data.datasets[0].data = [
    currentDataset.teamA.attack, currentDataset.teamA.midfield, currentDataset.teamA.defence,
    currentDataset.teamA.goalkeepers, currentDataset.teamA.squad, currentDataset.teamA.rating
  ];
  radarChartInstance.data.datasets[1].label = currentDataset.teamB.name;
  radarChartInstance.data.datasets[1].data = [
    currentDataset.teamB.attack, currentDataset.teamB.midfield, currentDataset.teamB.defence,
    currentDataset.teamB.goalkeepers, currentDataset.teamB.squad, currentDataset.teamB.rating
  ];
  radarChartInstance.update();

  renderHomeAwayContext();
  renderH2HandLast5();
  renderGoalTimingDistribution();
  renderMonteCarloResults();
  renderStatisticalSelections();

  scrollToSection('squadRadarChart');
}

// Helper Filter Trigger
function setDistributionFilter(type) {
  const btnAll = document.getElementById('btnDistAll');
  const btnHome = document.getElementById('btnDistHome');

  if(type === 'all') {
    btnAll.className = "px-3 py-1 rounded-full bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white";
    btnHome.className = "px-3 py-1 rounded-full text-gray-600 dark:text-gray-400 hover:text-gray-900";
  } else {
    btnHome.className = "px-3 py-1 rounded-full bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white";
    btnAll.className = "px-3 py-1 rounded-full text-gray-600 dark:text-gray-400 hover:text-gray-900";
  }
}

// Smooth Scrolling Helpers
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
