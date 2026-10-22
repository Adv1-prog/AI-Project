# AI 8-Puzzle Problem Solver (Breadth-First Search)

An interactive, responsive web application designed to solve the classic **8-Puzzle Problem** using **Algorithm 1: Breadth-First Search (BFS)**. This project demonstrates state-space exploration, FIFO queue frontier management, blank tile sliding mechanics, and real-time performance analytics.

---

## 📌 Project Overview

- **Course:** Artificial Intelligence
- **Assignment:** Digital Assignment (Case Study) — Interactive 8-Puzzle Problem Solver
- **Assigned Algorithm:** **Algorithm 1: Breadth First Search (BFS)**
- **Student Name:** Advaith Sathishkumar
- **Registration Number:** [Your Registration Number]
- **Live Demo (GitHub Pages):** `https://Adv1-prog.github.io/AI-Project/`

---

## 🚀 Key Features

### 1. Dual Puzzle Input Modes
- **Method 1 (Manual State Input):**
  - Enter custom 3×3 configurations for both **Initial State** and **Goal State** (numbers 1–8 and blank `_` / `0`).
  - Real-time input validation (no duplicates, valid digit check, grid completeness).
  - Inversion parity solvability check between Initial and Goal states before running search.
  - Quick presets (including the sample configuration from Page 3).
- **Method 2 (Random Solvable Generator):**
  - Generates guaranteed solvable configurations by performing random valid moves backwards from the goal state.

### 2. Search Algorithm: Breadth-First Search (BFS)
- Level-by-level exploration of state-space tree using a First-In, First-Out (FIFO) queue.
- Guarantees the optimal (shortest) sequence of moves under uniform step cost ($c = 1$).
- Cycle and duplicate state detection using a closed set (`Set`).
- Early goal testing optimization on node generation.

### 3. Interactive Playback & Visual Controls
- Animated sliding blank tile moves.
- Controls: **Run**, **Pause**, **Resume**, **Next Step**, **Previous Step**, **Reset**, and **Speed Adjustment** ($0.25\times$ to $3.0\times$).

### 4. Real-Time Search Process Monitoring
- Currently expanded node details with state matrix.
- Frontier (FIFO Queue / Open List) size and Explored (Closed Set) size.
- Node generation and expansion counters.
- Current depth and path cost $g(n)$.
- Successor states preview cards.

### 5. Solution Summary Metrics
- Solution Status (Found / Not Found)
- Total Number of Moves
- Total Nodes Generated
- Total Nodes Expanded
- Maximum Search Depth Reached
- Execution Time in milliseconds
- Approximate Memory Footprint

### 6. Algorithm Documentation
- Detailed analysis covering working principle, advantages, limitations, time complexity $O(b^d)$, space complexity $O(b^d)$, completeness, and optimality.

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
│   ├── search.js       # Breadth-First Search (BFS) implementation
│   ├── visualizer.js   # Step playback engine, blank tile movement & stats updater
│   └── app.js          # Controller, state management & UI event handlers
│── package.json        # NPM scripts for local development
│── assets/             # Icons and SVGs
│── images/             # Visual screenshots and demo previews
│── README.md           # Documentation, rubric alignment & project guide
│── docs/
│   └── algorithms.md   # Theoretical analysis and complexity reference
```

---

## 💻 How to Run Locally

You can view the project locally using either of the following methods:

### Method A: Directly in the Browser
Simply open `index.html` in your browser (double-click the file or drag it into Chrome/Safari/Firefox).

### Method B: Using `npm run dev`
1. Open a terminal in the project directory:
   ```bash
   npm run dev
   ```
2. Open your browser and navigate to:
   ```text
   http://localhost:3000
   ```

### Method C: Using Python
```bash
python3 -m http.server 8000
```
Then visit `http://localhost:8000`.

---

## 🌐 Deploying to GitHub Pages

1. Push your repository to GitHub:
   ```bash
   git push origin main
   ```
2. In your GitHub repository, navigate to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select `Deploy from a branch`.
4. Choose Branch: `main`, Folder: `/ (root)`, and click **Save**.
5. Within 1–2 minutes, your live website will be available at:
   `https://Adv1-prog.github.io/AI-Project/`

---

## 📄 License
This project is open-source under the MIT License for academic purposes.
