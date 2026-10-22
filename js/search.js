/**
 * Search Algorithms Implementation for 8-Puzzle Problem
 * Implements: BFS, DFS, DLS, IDDLS, UCS, GBFS, A*
 */

class PriorityQueue {
  constructor(comparator = (a, b) => a.f - b.f) {
    this.elements = [];
    this.comparator = comparator;
  }

  enqueue(item) {
    this.elements.push(item);
    this.elements.sort(this.comparator);
  }

  dequeue() {
    return this.elements.shift();
  }

  isEmpty() {
    return this.elements.length === 0;
  }

  size() {
    return this.elements.length;
  }

  peek() {
    return this.elements[0];
  }

  toArray() {
    return [...this.elements];
  }
}

class SearchEngine {
  constructor(options = {}) {
    this.maxNodesLimit = options.maxNodesLimit || 35000;
  }

  getHeuristicFn(heuristicType, goalBoard) {
    if (heuristicType === 'misplaced') {
      return (board) => PuzzleUtil.hMisplaced(board, goalBoard);
    }
    // Default to Manhattan Distance
    return (board) => PuzzleUtil.hManhattan(board, goalBoard);
  }

  /**
   * Breadth-First Search (BFS) - Algorithm 1
   */
  async solveBFS(initialBoard, goalBoard, options = {}) {
    const startTime = performance.now();
    const startNode = new PuzzleState(initialBoard);
    const goalNode = new PuzzleState(goalBoard);

    if (startNode.equals(goalNode)) {
      return this.buildResult(true, startNode, 0, 1, 0, performance.now() - startTime, []);
    }

    const frontier = [startNode];
    const frontierSet = new Set([startNode.id]);
    const explored = new Set();
    const searchSteps = [];
    const recordSteps = options.recordSteps !== false;
    const maxSteps = options.maxRecordedSteps || 1200;

    let nodesGenerated = 1;
    let nodesExpanded = 0;
    let maxDepth = 0;

    while (frontier.length > 0) {
      if (nodesExpanded > this.maxNodesLimit) {
        break;
      }

      const current = frontier.shift();
      frontierSet.delete(current.id);
      explored.add(current.id);
      nodesExpanded++;

      if (current.depth > maxDepth) maxDepth = current.depth;

      // Check goal
      if (current.equals(goalNode)) {
        const timeTaken = performance.now() - startTime;
        return this.buildResult(true, current, nodesGenerated, nodesExpanded, maxDepth, timeTaken, searchSteps, 'BFS');
      }

      const successors = PuzzleUtil.getSuccessors(current);
      const generatedInThisStep = [];

      for (const succ of successors) {
        nodesGenerated++;
        if (succ.depth > maxDepth) maxDepth = succ.depth;

        if (!explored.has(succ.id) && !frontierSet.has(succ.id)) {
          generatedInThisStep.push(succ);
          frontier.push(succ);
          frontierSet.add(succ.id);

          // Early goal test for BFS (textbook optimization)
          if (succ.equals(goalNode)) {
            nodesExpanded++;
            if (recordSteps && searchSteps.length < maxSteps) {
              searchSteps.push(this.createStepSnapshot(current, generatedInThisStep, frontier, explored, nodesGenerated, nodesExpanded));
            }
            const timeTaken = performance.now() - startTime;
            return this.buildResult(true, succ, nodesGenerated, nodesExpanded, maxDepth, timeTaken, searchSteps, 'BFS');
          }
        }
      }

      if (recordSteps && searchSteps.length < maxSteps) {
        searchSteps.push(this.createStepSnapshot(current, generatedInThisStep, frontier, explored, nodesGenerated, nodesExpanded));
      }
    }

    const timeTaken = performance.now() - startTime;
    return this.buildResult(false, null, nodesGenerated, nodesExpanded, maxDepth, timeTaken, searchSteps, 'BFS');
  }

  /**
   * Depth-First Search (DFS) with cycle detection
   */
  async solveDFS(initialBoard, goalBoard, options = {}) {
    const startTime = performance.now();
    const startNode = new PuzzleState(initialBoard);
    const goalNode = new PuzzleState(goalBoard);
    const depthCutoff = options.depthCutoff || 40; // Avoid stack explosion in 8-puzzle graph

    const frontier = [startNode];
    const frontierSet = new Set([startNode.id]);
    const explored = new Set();
    const searchSteps = [];
    const recordSteps = options.recordSteps !== false;
    const maxSteps = options.maxRecordedSteps || 1200;

    let nodesGenerated = 1;
    let nodesExpanded = 0;
    let maxDepth = 0;

    while (frontier.length > 0) {
      if (nodesExpanded > this.maxNodesLimit) break;

      const current = frontier.pop();
      frontierSet.delete(current.id);
      explored.add(current.id);
      nodesExpanded++;

      if (current.depth > maxDepth) maxDepth = current.depth;

      if (current.equals(goalNode)) {
        const timeTaken = performance.now() - startTime;
        return this.buildResult(true, current, nodesGenerated, nodesExpanded, maxDepth, timeTaken, searchSteps, 'DFS');
      }

      const generatedInThisStep = [];
      if (current.depth < depthCutoff) {
        const successors = PuzzleUtil.getSuccessors(current);
        // Reverse successors for classic left-to-right exploration order when popped from stack
        for (let i = successors.length - 1; i >= 0; i--) {
          const succ = successors[i];
          nodesGenerated++;
          if (succ.depth > maxDepth) maxDepth = succ.depth;

          if (!explored.has(succ.id) && !frontierSet.has(succ.id)) {
            generatedInThisStep.push(succ);
            frontier.push(succ);
            frontierSet.add(succ.id);
          }
        }
      }

      if (recordSteps && searchSteps.length < maxSteps) {
        searchSteps.push(this.createStepSnapshot(current, generatedInThisStep, frontier, explored, nodesGenerated, nodesExpanded));
      }
    }

    const timeTaken = performance.now() - startTime;
    return this.buildResult(false, null, nodesGenerated, nodesExpanded, maxDepth, timeTaken, searchSteps, 'DFS');
  }

  /**
   * Depth-Limited Search (DLS)
   */
  async solveDLS(initialBoard, goalBoard, depthLimit = 15, options = {}) {
    const startTime = performance.now();
    const startNode = new PuzzleState(initialBoard);
    const goalNode = new PuzzleState(goalBoard);

    const frontier = [startNode];
    const explored = new Map(); // id -> lowest depth seen
    const searchSteps = [];
    const recordSteps = options.recordSteps !== false;
    const maxSteps = options.maxRecordedSteps || 1200;

    let nodesGenerated = 1;
    let nodesExpanded = 0;
    let maxDepth = 0;

    while (frontier.length > 0) {
      if (nodesExpanded > this.maxNodesLimit) break;

      const current = frontier.pop();
      explored.set(current.id, current.depth);
      nodesExpanded++;

      if (current.depth > maxDepth) maxDepth = current.depth;

      if (current.equals(goalNode)) {
        const timeTaken = performance.now() - startTime;
        return this.buildResult(true, current, nodesGenerated, nodesExpanded, maxDepth, timeTaken, searchSteps, 'DLS');
      }

      const generatedInThisStep = [];
      if (current.depth < depthLimit) {
        const successors = PuzzleUtil.getSuccessors(current);
        for (let i = successors.length - 1; i >= 0; i--) {
          const succ = successors[i];
          nodesGenerated++;
          if (succ.depth > maxDepth) maxDepth = succ.depth;

          const prevDepth = explored.get(succ.id);
          if (prevDepth === undefined || succ.depth < prevDepth) {
            generatedInThisStep.push(succ);
            frontier.push(succ);
          }
        }
      }

      if (recordSteps && searchSteps.length < maxSteps) {
        searchSteps.push(this.createStepSnapshot(current, generatedInThisStep, frontier, explored, nodesGenerated, nodesExpanded));
      }
    }

    const timeTaken = performance.now() - startTime;
    return this.buildResult(false, null, nodesGenerated, nodesExpanded, maxDepth, timeTaken, searchSteps, 'DLS');
  }

  /**
   * Iterative Deepening Depth-Limited Search (IDDLS)
   */
  async solveIDDLS(initialBoard, goalBoard, options = {}) {
    const startTime = performance.now();
    const maxLimit = options.maxIterativeDepth || 25;
    let totalGenerated = 0;
    let totalExpanded = 0;
    let globalMaxDepth = 0;
    const allSearchSteps = [];

    for (let limit = 0; limit <= maxLimit; limit++) {
      const res = await this.solveDLS(initialBoard, goalBoard, limit, {
        recordSteps: options.recordSteps !== false && limit <= 12,
        maxRecordedSteps: 300
      });

      totalGenerated += res.nodesGenerated;
      totalExpanded += res.nodesExpanded;
      if (res.maxDepth > globalMaxDepth) globalMaxDepth = res.maxDepth;

      if (res.searchSteps && res.searchSteps.length > 0) {
        allSearchSteps.push(...res.searchSteps);
      }

      if (res.found) {
        const timeTaken = performance.now() - startTime;
        return this.buildResult(true, res.solutionNode, totalGenerated, totalExpanded, globalMaxDepth, timeTaken, allSearchSteps, 'IDDLS');
      }
    }

    const timeTaken = performance.now() - startTime;
    return this.buildResult(false, null, totalGenerated, totalExpanded, globalMaxDepth, timeTaken, allSearchSteps, 'IDDLS');
  }

  /**
   * Uniform Cost Search (UCS)
   */
  async solveUCS(initialBoard, goalBoard, options = {}) {
    const startTime = performance.now();
    const startNode = new PuzzleState(initialBoard);
    const goalNode = new PuzzleState(goalBoard);

    // UCS uses path cost g(n) = cost
    const pq = new PriorityQueue((a, b) => a.cost - b.cost);
    pq.enqueue(startNode);

    const costSoFar = new Map([[startNode.id, 0]]);
    const explored = new Set();
    const searchSteps = [];
    const recordSteps = options.recordSteps !== false;
    const maxSteps = options.maxRecordedSteps || 1200;

    let nodesGenerated = 1;
    let nodesExpanded = 0;
    let maxDepth = 0;

    while (!pq.isEmpty()) {
      if (nodesExpanded > this.maxNodesLimit) break;

      const current = pq.dequeue();
      if (explored.has(current.id)) continue;
      explored.add(current.id);
      nodesExpanded++;

      if (current.depth > maxDepth) maxDepth = current.depth;

      if (current.equals(goalNode)) {
        const timeTaken = performance.now() - startTime;
        return this.buildResult(true, current, nodesGenerated, nodesExpanded, maxDepth, timeTaken, searchSteps, 'UCS');
      }

      const successors = PuzzleUtil.getSuccessors(current);
      const generatedInThisStep = [];

      for (const succ of successors) {
        nodesGenerated++;
        if (succ.depth > maxDepth) maxDepth = succ.depth;

        const currentKnownCost = costSoFar.get(succ.id);
        if (currentKnownCost === undefined || succ.cost < currentKnownCost) {
          costSoFar.set(succ.id, succ.cost);
          pq.enqueue(succ);
          generatedInThisStep.push(succ);
        }
      }

      if (recordSteps && searchSteps.length < maxSteps) {
        searchSteps.push(this.createStepSnapshot(current, generatedInThisStep, pq.toArray(), explored, nodesGenerated, nodesExpanded));
      }
    }

    const timeTaken = performance.now() - startTime;
    return this.buildResult(false, null, nodesGenerated, nodesExpanded, maxDepth, timeTaken, searchSteps, 'UCS');
  }

  /**
   * Greedy Best-First Search (GBFS)
   */
  async solveGBFS(initialBoard, goalBoard, heuristicType = 'manhattan', options = {}) {
    const startTime = performance.now();
    const startNode = new PuzzleState(initialBoard);
    const goalNode = new PuzzleState(goalBoard);
    const hFn = this.getHeuristicFn(heuristicType, goalBoard);

    startNode.h = hFn(startNode.board);
    startNode.f = startNode.h; // in GBFS, f(n) = h(n)

    const pq = new PriorityQueue((a, b) => a.f - b.f);
    pq.enqueue(startNode);

    const explored = new Set();
    const frontierMap = new Map([[startNode.id, startNode.f]]);
    const searchSteps = [];
    const recordSteps = options.recordSteps !== false;
    const maxSteps = options.maxRecordedSteps || 1200;

    let nodesGenerated = 1;
    let nodesExpanded = 0;
    let maxDepth = 0;

    while (!pq.isEmpty()) {
      if (nodesExpanded > this.maxNodesLimit) break;

      const current = pq.dequeue();
      frontierMap.delete(current.id);
      explored.add(current.id);
      nodesExpanded++;

      if (current.depth > maxDepth) maxDepth = current.depth;

      if (current.equals(goalNode)) {
        const timeTaken = performance.now() - startTime;
        return this.buildResult(true, current, nodesGenerated, nodesExpanded, maxDepth, timeTaken, searchSteps, `GBFS (${heuristicType})`);
      }

      const successors = PuzzleUtil.getSuccessors(current);
      const generatedInThisStep = [];

      for (const succ of successors) {
        nodesGenerated++;
        if (succ.depth > maxDepth) maxDepth = succ.depth;

        if (!explored.has(succ.id)) {
          succ.h = hFn(succ.board);
          succ.f = succ.h;

          const existingF = frontierMap.get(succ.id);
          if (existingF === undefined || succ.f < existingF) {
            frontierMap.set(succ.id, succ.f);
            pq.enqueue(succ);
            generatedInThisStep.push(succ);
          }
        }
      }

      if (recordSteps && searchSteps.length < maxSteps) {
        searchSteps.push(this.createStepSnapshot(current, generatedInThisStep, pq.toArray(), explored, nodesGenerated, nodesExpanded));
      }
    }

    const timeTaken = performance.now() - startTime;
    return this.buildResult(false, null, nodesGenerated, nodesExpanded, maxDepth, timeTaken, searchSteps, `GBFS (${heuristicType})`);
  }

  /**
   * A* Search
   */
  async solveAStar(initialBoard, goalBoard, heuristicType = 'manhattan', options = {}) {
    const startTime = performance.now();
    const startNode = new PuzzleState(initialBoard);
    const goalNode = new PuzzleState(goalBoard);
    const hFn = this.getHeuristicFn(heuristicType, goalBoard);

    startNode.h = hFn(startNode.board);
    startNode.f = startNode.cost + startNode.h; // f(n) = g(n) + h(n)

    const pq = new PriorityQueue((a, b) => a.f - b.f || a.h - b.h);
    pq.enqueue(startNode);

    const costSoFar = new Map([[startNode.id, startNode.cost]]);
    const explored = new Set();
    const searchSteps = [];
    const recordSteps = options.recordSteps !== false;
    const maxSteps = options.maxRecordedSteps || 1200;

    let nodesGenerated = 1;
    let nodesExpanded = 0;
    let maxDepth = 0;

    while (!pq.isEmpty()) {
      if (nodesExpanded > this.maxNodesLimit) break;

      const current = pq.dequeue();
      if (explored.has(current.id)) continue;
      explored.add(current.id);
      nodesExpanded++;

      if (current.depth > maxDepth) maxDepth = current.depth;

      if (current.equals(goalNode)) {
        const timeTaken = performance.now() - startTime;
        return this.buildResult(true, current, nodesGenerated, nodesExpanded, maxDepth, timeTaken, searchSteps, `A* (${heuristicType})`);
      }

      const successors = PuzzleUtil.getSuccessors(current);
      const generatedInThisStep = [];

      for (const succ of successors) {
        nodesGenerated++;
        if (succ.depth > maxDepth) maxDepth = succ.depth;

        const bestCost = costSoFar.get(succ.id);
        if (bestCost === undefined || succ.cost < bestCost) {
          costSoFar.set(succ.id, succ.cost);
          succ.h = hFn(succ.board);
          succ.f = succ.cost + succ.h;
          pq.enqueue(succ);
          generatedInThisStep.push(succ);
        }
      }

      if (recordSteps && searchSteps.length < maxSteps) {
        searchSteps.push(this.createStepSnapshot(current, generatedInThisStep, pq.toArray(), explored, nodesGenerated, nodesExpanded));
      }
    }

    const timeTaken = performance.now() - startTime;
    return this.buildResult(false, null, nodesGenerated, nodesExpanded, maxDepth, timeTaken, searchSteps, `A* (${heuristicType})`);
  }

  createStepSnapshot(current, generated, frontier, explored, nodesGenerated, nodesExpanded) {
    return {
      currentNode: {
        board: [...current.board],
        move: current.move,
        depth: current.depth,
        cost: current.cost,
        h: current.h,
        f: current.f,
        parentBoard: current.parent ? [...current.parent.board] : null
      },
      generatedNodes: generated.slice(0, 4).map(g => ({
        board: [...g.board],
        move: g.move,
        depth: g.depth,
        h: g.h,
        f: g.f
      })),
      frontierCount: Array.isArray(frontier) ? frontier.length : (frontier.size ? frontier.size : 0),
      frontierPreview: (Array.isArray(frontier) ? frontier : []).slice(0, 6).map(f => ({
        board: [...f.board],
        depth: f.depth,
        f: f.f || f.depth
      })),
      exploredCount: explored instanceof Set ? explored.size : (explored instanceof Map ? explored.size : 0),
      nodesGenerated,
      nodesExpanded
    };
  }

  buildResult(found, endNode, nodesGenerated, nodesExpanded, maxDepth, executionTime, searchSteps, algorithmName = 'Search') {
    const solutionPath = found && endNode ? PuzzleUtil.extractPath(endNode) : [];
    // Approximate memory usage based on nodes generated + overhead
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
