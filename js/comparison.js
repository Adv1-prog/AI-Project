/**
 * Comparison Benchmark Engine
 * Benchmarks BFS, DFS, DLS, IDDLS, GBFS, and A* on the identical puzzle instance
 */

class ComparisonEngine {
  constructor(searchEngine) {
    this.engine = searchEngine || new SearchEngine({ maxNodesLimit: 25000 });
  }

  async runAllBenchmarks(initialBoard, goalBoard, options = {}, progressCallback = null) {
    const dlsLimit = options.dlsLimit || 12;
    const heuristic = options.heuristic || 'manhattan';

    const tasks = [
      { name: 'BFS', runner: () => this.engine.solveBFS(initialBoard, goalBoard, { recordSteps: false }) },
      { name: 'DFS', runner: () => this.engine.solveDFS(initialBoard, goalBoard, { depthCutoff: 30, recordSteps: false }) },
      { name: 'DLS', runner: () => this.engine.solveDLS(initialBoard, goalBoard, dlsLimit, { recordSteps: false }) },
      { name: 'IDDLS', runner: () => this.engine.solveIDDLS(initialBoard, goalBoard, { maxIterativeDepth: 18, recordSteps: false }) },
      { name: 'GBFS', runner: () => this.engine.solveGBFS(initialBoard, goalBoard, heuristic, { recordSteps: false }) },
      { name: 'A*', runner: () => this.engine.solveAStar(initialBoard, goalBoard, heuristic, { recordSteps: false }) }
    ];

    const results = [];

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      if (typeof progressCallback === 'function') {
        progressCallback({
          currentIndex: i,
          total: tasks.length,
          currentAlgorithm: task.name
        });
      }

      // Small yield to UI thread so progress updates render smoothly
      await new Promise(r => setTimeout(r, 40));

      try {
        const res = await task.runner();
        results.push({
          algorithm: task.name,
          found: res.found ? 'Yes' : 'No',
          nodesExpanded: res.nodesExpanded,
          nodesGenerated: res.nodesGenerated,
          moves: res.found ? res.totalMoves : '-',
          time: `${res.executionTimeMs} ms`,
          rawTime: res.executionTimeMs,
          memory: res.memoryCategory,
          memoryKB: res.memoryKB
        });
      } catch (err) {
        console.error(`Benchmark failed for ${task.name}:`, err);
        results.push({
          algorithm: task.name,
          found: 'Error',
          nodesExpanded: '-',
          nodesGenerated: '-',
          moves: '-',
          time: '-',
          memory: '-'
        });
      }
    }

    return results;
  }
}

window.ComparisonEngine = ComparisonEngine;
