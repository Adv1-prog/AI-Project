/**
 * Main Application Controller - Dedicated to Algorithm 1: Breadth-First Search (BFS)
 * Coordinates UI inputs, Method 1 & 2 puzzle generation, BFS search execution, and playback.
 */

document.addEventListener('DOMContentLoaded', () => {
  const searchEngine = new SearchEngine();

  // Default state initialization (Method 1 preset sample from assignment PDF)
  let initialBoard = [2, 8, 3, 1, 6, 4, 7, 0, 5];
  let goalBoard = [1, 2, 3, 8, 0, 4, 7, 6, 5];
  let currentSolutionResult = null;

  // Visualizer initialization
  const visualizer = new Visualizer({
    boardContainer: document.getElementById('main-puzzle-board'),
    onStepChange: handleVisualizerStepChange
  });

  // UI Elements
  const initialInputs = document.querySelectorAll('.initial-matrix-cell');
  const goalInputs = document.querySelectorAll('.goal-matrix-cell');
  
  const solvabilityBadge = document.getElementById('solvability-status-badge');
  const runBtn = document.getElementById('btn-run-search');
  const randomBtn = document.getElementById('btn-random-puzzle');
  const resetBtn = document.getElementById('btn-reset');
  const playBtn = document.getElementById('btn-play');
  const pauseBtn = document.getElementById('btn-pause');
  const nextBtn = document.getElementById('btn-next');
  const prevBtn = document.getElementById('btn-prev');
  const speedSlider = document.getElementById('speed-slider');
  const speedLabel = document.getElementById('speed-label');

  // Navigation tab switching
  setupNavigation();

  // Populate initial matrix inputs
  populateMatrixInputs(initialInputs, initialBoard);
  populateMatrixInputs(goalInputs, goalBoard);
  updateSolvabilityDisplay();
  visualizer.renderBoard(initialBoard);

  // Sync Input changes (Method 1: Manual State Entry)
  initialInputs.forEach((cell, idx) => {
    cell.addEventListener('input', () => {
      handleCellInput(cell, idx, initialInputs, 'initial');
    });
    cell.addEventListener('keydown', (e) => handleMatrixNav(e, idx, initialInputs));
  });

  goalInputs.forEach((cell, idx) => {
    cell.addEventListener('input', () => {
      handleCellInput(cell, idx, goalInputs, 'goal');
    });
    cell.addEventListener('keydown', (e) => handleMatrixNav(e, idx, goalInputs));
  });

  // Quick Preset Buttons
  document.getElementById('btn-preset-assignment')?.addEventListener('click', () => {
    initialBoard = [2, 8, 3, 1, 6, 4, 7, 0, 5];
    goalBoard = [1, 2, 3, 8, 0, 4, 7, 6, 5];
    populateMatrixInputs(initialInputs, initialBoard);
    populateMatrixInputs(goalInputs, goalBoard);
    updateSolvabilityDisplay();
    visualizer.renderBoard(initialBoard);
  });

  document.getElementById('btn-preset-standard')?.addEventListener('click', () => {
    initialBoard = [1, 2, 3, 4, 0, 5, 7, 8, 6];
    goalBoard = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    populateMatrixInputs(initialInputs, initialBoard);
    populateMatrixInputs(goalInputs, goalBoard);
    updateSolvabilityDisplay();
    visualizer.renderBoard(initialBoard);
  });

  // Method 2: Random Solvable Puzzle Generator
  randomBtn?.addEventListener('click', () => {
    const readGoal = getBoardFromInputs(goalInputs);
    const targetGoal = readGoal.valid ? readGoal.board : goalBoard;
    initialBoard = PuzzleUtil.generateRandomSolvable(targetGoal, 18);
    populateMatrixInputs(initialInputs, initialBoard);
    updateSolvabilityDisplay();
    visualizer.renderBoard(initialBoard);
  });

  // Run BFS Search Execution
  runBtn.addEventListener('click', async () => {
    const parseInitial = getBoardFromInputs(initialInputs);
    const parseGoal = getBoardFromInputs(goalInputs);

    if (!parseInitial.valid) {
      alert(`Invalid Initial State: ${parseInitial.error}`);
      return;
    }
    if (!parseGoal.valid) {
      alert(`Invalid Goal State: ${parseGoal.error}`);
      return;
    }

    initialBoard = parseInitial.board;
    goalBoard = parseGoal.board;

    const solvable = PuzzleUtil.isSolvable(initialBoard, goalBoard);
    if (!solvable) {
      alert('The current puzzle configuration is MATHEMATICALLY UNSOLVABLE!\nInitial state inversion parity differs from goal state parity.');
      return;
    }

    setSearchingState(true);

    try {
      const result = await searchEngine.solveBFS(initialBoard, goalBoard);
      currentSolutionResult = result;
      displaySolutionSummary(result);
      visualizer.loadSolution(result);

      if (result.found) {
        // Automatically start smooth playback on solution found
        visualizer.play();
      }
    } catch (err) {
      console.error('BFS Search failure:', err);
      alert('An error occurred during BFS search: ' + err.message);
    } finally {
      setSearchingState(false);
    }
  });

  // Visualizer Controls
  playBtn.addEventListener('click', () => visualizer.play());
  pauseBtn.addEventListener('click', () => visualizer.pause());
  nextBtn.addEventListener('click', () => visualizer.nextStep());
  prevBtn.addEventListener('click', () => visualizer.previousStep());
  resetBtn.addEventListener('click', () => visualizer.reset());

  speedSlider.addEventListener('input', () => {
    const val = parseFloat(speedSlider.value);
    speedLabel.textContent = `${val.toFixed(1)}x`;
    visualizer.setSpeed(val);
  });

  // Helper Functions
  function populateMatrixInputs(inputElements, board) {
    inputElements.forEach((input, i) => {
      input.value = board[i] === 0 ? '_' : board[i];
    });
  }

  function getBoardFromInputs(inputElements) {
    const rawValues = Array.from(inputElements).map(el => el.value);
    return PuzzleUtil.parseInput(rawValues);
  }

  function handleCellInput(cell, idx, inputList, type) {
    let val = cell.value.trim();
    if (val === '0') val = '_';
    cell.value = val;

    // Auto-advance cursor to next input cell
    if (val.length >= 1 && idx < inputList.length - 1) {
      inputList[idx + 1].focus();
      inputList[idx + 1].select();
    }

    const check = getBoardFromInputs(inputList);
    if (check.valid) {
      if (type === 'initial') {
        initialBoard = check.board;
        visualizer.renderBoard(initialBoard);
      } else {
        goalBoard = check.board;
      }
      updateSolvabilityDisplay();
    }
  }

  function handleMatrixNav(e, idx, inputList) {
    if (e.key === 'ArrowRight' && idx < inputList.length - 1) {
      inputList[idx + 1].focus();
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      inputList[idx - 1].focus();
    } else if (e.key === 'ArrowDown' && idx + 3 < inputList.length) {
      inputList[idx + 3].focus();
    } else if (e.key === 'ArrowUp' && idx - 3 >= 0) {
      inputList[idx - 3].focus();
    }
  }

  function updateSolvabilityDisplay() {
    if (!solvabilityBadge) return;
    const pInitial = getBoardFromInputs(initialInputs);
    const pGoal = getBoardFromInputs(goalInputs);

    if (!pInitial.valid || !pGoal.valid) {
      solvabilityBadge.className = 'solvability-badge solvable-no';
      solvabilityBadge.innerHTML = '<span>⚠️ Invalid Grid Values</span>';
      return;
    }

    const solvable = PuzzleUtil.isSolvable(pInitial.board, pGoal.board);
    const initialInv = PuzzleUtil.countInversions(pInitial.board);
    const goalInv = PuzzleUtil.countInversions(pGoal.board);

    if (solvable) {
      solvabilityBadge.className = 'solvability-badge solvable-yes';
      solvabilityBadge.innerHTML = `<span>✓ Solvable Configuration</span> <small class="ms-1 text-muted">(Inversions: Start ${initialInv}, Goal ${goalInv})</small>`;
      runBtn.disabled = false;
    } else {
      solvabilityBadge.className = 'solvability-badge solvable-no';
      solvabilityBadge.innerHTML = `<span>✕ Unsolvable Configuration</span> <small class="ms-1 text-muted">(Inversions parity mismatch)</small>`;
      runBtn.disabled = true;
    }
  }

  function setSearchingState(isSearching) {
    if (isSearching) {
      runBtn.disabled = true;
      runBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Searching with BFS...';
    } else {
      runBtn.disabled = false;
      runBtn.innerHTML = '<span>▶</span> Run BFS Search';
    }
  }

  function displaySolutionSummary(res) {
    const elFound = document.getElementById('sum-found');
    const elMoves = document.getElementById('sum-moves');
    const elGen = document.getElementById('sum-generated');
    const elExp = document.getElementById('sum-expanded');
    const elDepth = document.getElementById('sum-depth');
    const elTime = document.getElementById('sum-time');
    const elCost = document.getElementById('sum-cost');
    const elMem = document.getElementById('sum-memory');

    if (elFound) elFound.textContent = res.found ? 'Yes (Goal Reached)' : 'No (Cutoff/Exhausted)';
    if (elMoves) elMoves.textContent = res.found ? res.totalMoves : '-';
    if (elGen) elGen.textContent = res.nodesGenerated.toLocaleString();
    if (elExp) elExp.textContent = res.nodesExpanded.toLocaleString();
    if (elDepth) elDepth.textContent = res.maxDepth;
    if (elTime) elTime.textContent = `${res.executionTimeMs} ms`;
    if (elCost) elCost.textContent = res.pathCost;
    if (elMem) elMem.textContent = `~${res.memoryKB} KB (${res.memoryCategory})`;
  }

  function handleVisualizerStepChange(info) {
    const step = info.state;
    const searchStep = info.searchStep;

    // Update real-time process monitoring elements
    document.getElementById('rt-current-depth').textContent = step.depth;
    document.getElementById('rt-path-cost').textContent = step.cost;
    document.getElementById('rt-last-move').textContent = step.move || 'Start';

    if (searchStep) {
      document.getElementById('rt-nodes-gen').textContent = searchStep.nodesGenerated.toLocaleString();
      document.getElementById('rt-nodes-exp').textContent = searchStep.nodesExpanded.toLocaleString();
      document.getElementById('rt-frontier-count').textContent = searchStep.frontierCount;
      document.getElementById('rt-explored-count').textContent = searchStep.exploredCount;

      // Render successor preview cards
      renderSuccessorPreview(searchStep.generatedNodes);
    }
  }

  function renderSuccessorPreview(nodes) {
    const container = document.getElementById('successors-preview-container');
    if (!container) return;
    container.innerHTML = '';

    if (!nodes || nodes.length === 0) {
      container.innerHTML = '<span class="text-muted small">No successor generated</span>';
      return;
    }

    nodes.forEach(node => {
      const card = document.createElement('div');
      card.className = 'successor-card';
      card.innerHTML = `
        <span class="successor-badge">${node.move}</span>
        <div class="mini-grid">
          ${node.board.map(v => `<div class="mini-tile ${v === 0 ? 'blank' : ''}">${v === 0 ? '' : v}</div>`).join('')}
        </div>
        <span class="text-muted" style="font-size:0.7rem;">depth: ${node.depth}</span>
      `;
      container.appendChild(card);
    });
  }

  function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-pill-btn');
    const sections = document.querySelectorAll('.app-section');

    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        navButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        sections.forEach(sec => {
          if (sec.id === targetId) {
            sec.classList.remove('d-none');
          } else {
            sec.classList.add('d-none');
          }
        });
      });
    });
  }
});
