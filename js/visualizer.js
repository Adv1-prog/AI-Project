/**
 * Interactive Visualizer & Playback Engine
 * Handles board rendering, blank tile animations, search process stats, and interactive controls
 */

class Visualizer {
  constructor(options = {}) {
    this.boardContainer = options.boardContainer || document.getElementById('puzzle-board');
    this.solutionPath = [];
    this.searchSteps = [];
    this.currentPathIndex = 0;
    this.currentSearchStepIndex = 0;
    this.isPlaying = false;
    this.playTimer = null;
    this.speed = 1.0; // Multiplier
    this.baseDelay = 600; // ms per step at 1x
    this.viewMode = 'solution'; // 'solution' or 'search'

    this.onStepChange = options.onStepChange || null;
  }

  setSpeed(multiplier) {
    this.speed = Math.max(0.2, Math.min(5.0, multiplier));
    if (this.isPlaying) {
      this.pause();
      this.play();
    }
  }

  get currentDelay() {
    return Math.max(80, Math.round(this.baseDelay / this.speed));
  }

  loadSolution(solutionResult) {
    this.reset();
    this.result = solutionResult;
    this.solutionPath = solutionResult.solutionPath || [];
    this.searchSteps = solutionResult.searchSteps || [];
    this.currentPathIndex = 0;
    this.currentSearchStepIndex = 0;

    if (this.solutionPath.length > 0) {
      this.renderBoard(this.solutionPath[0].board);
    }
  }

  /**
   * Render 3x3 interactive board with animated tile positions
   */
  renderBoard(board, targetContainer = this.boardContainer, options = {}) {
    if (!targetContainer) return;
    targetContainer.innerHTML = '';
    targetContainer.className = 'puzzle-grid-wrapper';

    const grid = document.createElement('div');
    grid.className = 'puzzle-grid';

    for (let i = 0; i < 9; i++) {
      const val = board[i];
      const tile = document.createElement('div');
      tile.className = val === 0 ? 'puzzle-tile blank-tile' : 'puzzle-tile number-tile';
      tile.dataset.value = val;
      tile.dataset.index = i;

      if (val === 0) {
        tile.innerHTML = '<span class="blank-indicator">_</span>';
      } else {
        tile.innerHTML = `<span class="tile-number">${val}</span>`;
      }

      // Optional highlight if tile matches goal
      if (options.goalBoard && val !== 0 && val === options.goalBoard[i]) {
        tile.classList.add('tile-in-position');
      }

      grid.appendChild(tile);
    }

    targetContainer.appendChild(grid);
  }

  /**
   * Play solution steps sequentially
   */
  play() {
    if (this.solutionPath.length === 0) return;
    this.isPlaying = true;
    this.updateControlsUI();

    const step = () => {
      if (!this.isPlaying) return;

      if (this.currentPathIndex < this.solutionPath.length - 1) {
        this.nextStep();
        this.playTimer = setTimeout(step, this.currentDelay);
      } else {
        this.pause();
      }
    };

    this.playTimer = setTimeout(step, this.currentDelay);
  }

  pause() {
    this.isPlaying = false;
    if (this.playTimer) {
      clearTimeout(this.playTimer);
      this.playTimer = null;
    }
    this.updateControlsUI();
  }

  nextStep() {
    if (this.currentPathIndex < this.solutionPath.length - 1) {
      this.currentPathIndex++;
      this.updateView();
    }
  }

  previousStep() {
    if (this.currentPathIndex > 0) {
      this.currentPathIndex--;
      this.updateView();
    }
  }

  jumpToStep(index) {
    if (index >= 0 && index < this.solutionPath.length) {
      this.currentPathIndex = index;
      this.updateView();
    }
  }

  reset() {
    this.pause();
    this.currentPathIndex = 0;
    this.currentSearchStepIndex = 0;
    if (this.solutionPath.length > 0) {
      this.updateView();
    }
  }

  updateView() {
    if (this.solutionPath.length === 0) return;
    const currentState = this.solutionPath[this.currentPathIndex];
    this.renderBoard(currentState.board);

    // Call external step change listener for stats display
    if (typeof this.onStepChange === 'function') {
      this.onStepChange({
        index: this.currentPathIndex,
        total: this.solutionPath.length,
        state: currentState,
        move: currentState.move,
        searchStep: this.searchSteps[Math.min(this.currentPathIndex, this.searchSteps.length - 1)] || null
      });
    }

    this.updateControlsUI();
  }

  updateControlsUI() {
    const playBtn = document.getElementById('btn-play');
    const pauseBtn = document.getElementById('btn-pause');
    const nextBtn = document.getElementById('btn-next');
    const prevBtn = document.getElementById('btn-prev');
    const stepBadge = document.getElementById('step-counter-badge');

    if (playBtn) playBtn.disabled = this.isPlaying || this.currentPathIndex >= this.solutionPath.length - 1;
    if (pauseBtn) pauseBtn.disabled = !this.isPlaying;
    if (nextBtn) nextBtn.disabled = this.currentPathIndex >= this.solutionPath.length - 1;
    if (prevBtn) prevBtn.disabled = this.currentPathIndex <= 0;

    if (stepBadge) {
      stepBadge.textContent = this.solutionPath.length > 0 
        ? `Step ${this.currentPathIndex} of ${this.solutionPath.length - 1}`
        : 'Ready';
    }
  }
}

window.Visualizer = Visualizer;
