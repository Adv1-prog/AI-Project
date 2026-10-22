/**
 * Search Algorithms Implementation for 8-Puzzle Problem
 * Dedicated to Algorithm 1: Breadth-First Search (BFS)
 */

class SearchEngine {
  constructor(options = {}) {
    // Maximum nodes limit to guard against browser thread freezes
    this.maxNodesLimit = options.maxNodesLimit || 45000;
  }

  /**
   * Breadth-First Search (BFS) - Algorithm 1
   * Explores state-space level by level using a FIFO Queue
   *
   * @param {Array<number>} initialBoard - 9-element array
   * @param {Array<number>} goalBoard - 9-element array
   * @param {Object} options
   * @returns {Object} Search outcome & telemetry
   */
  async solveBFS(initialBoard, goalBoard, options = {}) {
    const startTime = performance.now();
    const startNode = new PuzzleState(initialBoard);
    const goalNode = new PuzzleState(goalBoard);

    // Initial check: if already at goal state
    if (startNode.equals(goalNode)) {
      return this.buildResult(true, startNode, 1, 0, 0, performance.now() - startTime, [], 'BFS');
    }

    // FIFO Queue for Breadth-First Search frontier
    const frontier = [startNode];
    const frontierSet = new Set([startNode.id]);
    const explored = new Set();
    const searchSteps = [];
    const recordSteps = options.recordSteps !== false;
    const maxSteps = options.maxRecordedSteps || 1500;

    let nodesGenerated = 1;
    let nodesExpanded = 0;
    let maxDepth = 0;

    while (frontier.length > 0) {
      if (nodesExpanded >= this.maxNodesLimit) {
        break;
      }

      // Dequeue the shallowest node (FIFO)
      const current = frontier.shift();
      frontierSet.delete(current.id);
      explored.add(current.id);
      nodesExpanded++;

      if (current.depth > maxDepth) {
        maxDepth = current.depth;
      }

      // Check if current popped node matches goal
      if (current.equals(goalNode)) {
        const timeTaken = performance.now() - startTime;
        return this.buildResult(true, current, nodesGenerated, nodesExpanded, maxDepth, timeTaken, searchSteps, 'BFS');
      }

      // Generate valid successor states by sliding blank tile
      const successors = PuzzleUtil.getSuccessors(current);
      const generatedInThisStep = [];

      for (const succ of successors) {
        nodesGenerated++;
        if (succ.depth > maxDepth) {
          maxDepth = succ.depth;
        }

        // BFS cycle & duplicate check: not in explored and not already in frontier
        if (!explored.has(succ.id) && !frontierSet.has(succ.id)) {
          generatedInThisStep.push(succ);
          frontier.push(succ);
          frontierSet.add(succ.id);

          // Textbook BFS Early Goal Test (optimizes goal detection when node is generated)
          if (succ.equals(goalNode)) {
            nodesExpanded++;
            if (recordSteps && searchSteps.length < maxSteps) {
              searchSteps.push(
                this.createStepSnapshot(current, generatedInThisStep, frontier, explored, nodesGenerated, nodesExpanded)
              );
            }
            const timeTaken = performance.now() - startTime;
            return this.buildResult(true, succ, nodesGenerated, nodesExpanded, maxDepth, timeTaken, searchSteps, 'BFS');
          }
        }
      }

      if (recordSteps && searchSteps.length < maxSteps) {
        searchSteps.push(
          this.createStepSnapshot(current, generatedInThisStep, frontier, explored, nodesGenerated, nodesExpanded)
        );
      }
    }

    const timeTaken = performance.now() - startTime;
    return this.buildResult(false, null, nodesGenerated, nodesExpanded, maxDepth, timeTaken, searchSteps, 'BFS');
  }

  createStepSnapshot(current, generated, frontier, explored, nodesGenerated, nodesExpanded) {
    return {
      currentNode: {
        board: [...current.board],
        move: current.move,
        depth: current.depth,
        cost: current.cost,
        parentBoard: current.parent ? [...current.parent.board] : null
      },
      generatedNodes: generated.slice(0, 4).map(g => ({
        board: [...g.board],
        move: g.move,
        depth: g.depth,
        cost: g.cost
      })),
      frontierCount: frontier.length,
      frontierPreview: frontier.slice(0, 6).map(f => ({
        board: [...f.board],
        depth: f.depth,
        cost: f.cost
      })),
      exploredCount: explored.size,
      nodesGenerated,
      nodesExpanded
    };
  }

  buildResult(found, endNode, nodesGenerated, nodesExpanded, maxDepth, executionTime, searchSteps, algorithmName = 'BFS') {
    const solutionPath = found && endNode ? PuzzleUtil.extractPath(endNode) : [];
    // Approximate memory usage based on nodes stored in frontier and closed set
    const estimatedMemoryKB = Math.round((nodesGenerated * 128 + nodesExpanded * 96) / 1024);

    return {
      found,
      algorithmName,
      solutionNode: endNode,
      solutionPath,
      totalMoves: solutionPath.length > 0 ? solutionPath.length - 1 : 0,
      nodesGenerated,
      nodesExpanded,
      maxDepth,
      executionTimeMs: Number(executionTime.toFixed(2)),
      pathCost: solutionPath.length > 0 ? solutionPath[solutionPath.length - 1].cost : 0,
      memoryKB: estimatedMemoryKB,
      memoryCategory: estimatedMemoryKB > 2000 ? 'High' : (estimatedMemoryKB > 500 ? 'Medium' : 'Low'),
      searchSteps
    };
  }
}

window.SearchEngine = SearchEngine;
