# AI 8-Puzzle Problem Solver & Search Algorithm Visualizer

An interactive, responsive web application designed to solve the classic **8-Puzzle Problem** using Artificial Intelligence state-space search techniques. This project visually demonstrates state-space exploration, frontier progression, blank tile sliding mechanics, and performance analytics for uninformed and informed search algorithms.

---

## 📌 Project Overview

- **Course:** Artificial Intelligence
- **Assignment:** Digital Assignment (Case Study) — Interactive 8-Puzzle Problem Solver
- **Student Name:** [Your Name]
- **Registration Number:** [Your Registration Number]
- **Live Demo (GitHub Pages):** `https://<username>.github.io/<repository-name>/`

---

## 🚀 Features

### 1. Dual Puzzle Input Modes
- **Method 1 (Manual State Input):**
  - Enter custom 3x3 configurations for both **Initial State** and **Goal State** (numbers 1–8 and blank `_` / `0`).
  - Real-time input validation (no duplicates, valid digit check, grid completeness).
  - Inversion-based solvability parity validation between Initial and Goal states before running search.
  - Quick-load preset configurations (including the assignment case-study sample).
- **Method 2 (Random Solvable Generator):**
  - Generates guaranteed solvable configurations by performing random valid moves backwards from the goal state.

### 2. Search Algorithms Implemented
- **Uninformed Search:**
  - **Breadth-First Search (BFS):** Explores shallowest nodes first; optimal for uniform step costs.
  - **Depth-First Search (DFS):** Explores deepest nodes first with loop avoidance.
  - **Depth-Limited Search (DLS):** DFS bounded by a user-defined depth limit.
  - **Iterative Deepening Depth-Limited Search (IDDLS):** Combines the depth advantages of DFS with the completeness of BFS.
  - **Uniform Cost Search (UCS):** Explores lowest path cost $g(n)$.
- **Informed (Heuristic) Search:**
  - **Greedy Best-First Search (GBFS):** Guided strictly by $h(n)$.
  - **A\* Search:** Guided by evaluation function $f(n) = g(n) + h(n)$ (optimal & complete with admissible heuristic).

### 3. Heuristic Functions
- **Misplaced Tiles ($h_1$):** Counts tiles not in their target goal position (excluding blank).
- **Manhattan Distance ($h_2$):** Sum of absolute horizontal and vertical grid distances of tiles from their goal positions.

### 4. Interactive Step-by-Step Visualization & Controls
- Smooth animated sliding transitions for blank tile moves.
- Playback controls: **Run**, **Pause**, **Resume**, **Next Step**, **Previous Step**, **Reset**, and **Speed Adjustment** (0.25x to 4x).
- Visual breadcrumbs and successor state inspection tree.

### 5. Real-Time Search Process Monitoring
- Currently expanded node details with state matrix.
- Frontier (Open List) and Explored (Closed List) inspection.
- Node generation and expansion counters.
- Current depth, parent pointer, path cost $g(n)$, heuristic estimate $h(n)$, and total score $f(n)$.

### 6. Performance Analytics & Comparison
- Complete metrics breakdown upon solution:
  - Solution status (Found / Not Found)
  - Total moves (optimal path length)
  - Total nodes generated & expanded
  - Maximum search depth reached
  - Execution time in milliseconds
  - Approximate memory footprint
- Side-by-side **Comparison Table** benchmarking algorithms against the exact same puzzle instance.

### 7. Algorithm Documentation Guide
- Comprehensive reference covering working principles, pros/cons, time & space complexities, completeness, and optimality.

---

## 🛠️ Technologies Used

- **HTML5:** Semantic layout, accessible forms, and controls.
- **CSS3:** Modern dark-mode UI with glassmorphism, responsive grid layout, and CSS keyframe animations.
- **JavaScript (ES6+):** Pure vanilla JavaScript implementation with modular architecture (no external AI libraries used).
- **Bootstrap 5 (CDN):** Responsive grid system and utility classes.

---

## 📁 Repository Structure

```text
AI-8Puzzle-Visualizer/
│── index.html          # Main application page with UI & visualizer
│── css/
│   └── style.css       # Custom design system, glassmorphism & tile animations
│── js/
│   ├── puzzle.js       # Core 8-puzzle logic, moves & solvability checker
│   ├── search.js       # Search algorithms (BFS, DFS, DLS, IDDLS, UCS, GBFS, A*)
│   ├── visualizer.js   # Step playback engine, blank tile movement & stats updater
│   ├── comparison.js   # Multi-algorithm performance benchmark runner
│   └── app.js          # Controller, state management & UI event handlers
│── assets/             # Icons and SVGs
│── images/             # Visual screenshots and demo previews
│── README.md           # Documentation, rubric alignment & project guide
│── docs/
│   └── algorithms.md   # Theoretical analysis and complexity reference
```

---

## 💻 How to Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<username>/AI-8Puzzle-Visualizer.git
   cd AI-8Puzzle-Visualizer
   ```

2. **Open directly in your browser:**
   - Double-click `index.html` or open it in any modern browser (Chrome, Firefox, Safari, Edge).
   - Alternatively, use Python's built-in static server:
     ```bash
     python3 -m http.server 8000
     ```
     Then navigate to `http://localhost:8000`.

---

## 🌐 Deploying to GitHub Pages

1. Push this repository to GitHub.
2. Go to **Settings** > **Pages** in your GitHub repository.
3. Under **Branch**, select `main` and set the folder to `/ (root)`.
4. Click **Save**. Within 1–2 minutes, your project will be live at:
   `https://<username>.github.io/<repository-name>/`

---

## 📚 References

1. Russell, S., & Norvig, P. (2020). *Artificial Intelligence: A Modern Approach* (4th ed.). Pearson.
2. Korf, R. E. (1985). *Depth-first iterative-deepening: An optimal admissible tree search*. Artificial Intelligence, 27(1), 97-109.
3. Reinefeld, A. (1993). *Complete Solution of the Eight-Puzzle and the Benefit of Node Ordering in IDA\**. IJCAI.

---

## 📄 License
This project is open-source under the MIT License for academic purposes.
