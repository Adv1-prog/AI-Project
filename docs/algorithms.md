# 8-Puzzle Search Algorithms: Theoretical Reference & Analysis

This document provides in-depth technical documentation for the state-space search algorithms implemented in the **AI 8-Puzzle Problem Solver**.

---

## 1. Problem Formulation

The **8-Puzzle** consists of a $3 \times 3$ grid containing 8 numbered square tiles ($1$ to $8$) and one empty slot (blank tile, represented by `_` or `0`). A tile adjacent to the blank space can slide into it. The objective is to reach a designated goal state from a given initial state in the minimum number of steps.

### State-Space Representation
- **State:** A permutation of $\{0, 1, 2, 3, 4, 5, 6, 7, 8\}$ arranged in a $3 \times 3$ matrix.
- **Initial State:** User-defined or randomly generated valid permutation.
- **Goal State:** User-defined target configuration (default: $1, 2, 3, 8, 0, 4, 7, 6, 5$ or $1, 2, 3, 4, 5, 6, 7, 8, 0$).
- **Actions:** Slide the blank tile $\{\text{Up}, \text{Down}, \text{Left}, \text{Right}\}$ if within grid boundaries.
- **Path Cost:** Each move costs $c = 1$. Total path cost $g(n)$ equals the number of moves.

### Solvability Check (Inversion Count)
An 8-puzzle configuration is solvable if and only if the parity of inversions in the initial state matches the parity of inversions in the goal state.
An inversion is any pair of tiles $(a, b)$ such that $a > b$ and $a$ appears before $b$ in row-major order (ignoring the blank tile).
- If $\text{inversions}(\text{initial}) \equiv \text{inversions}(\text{goal}) \pmod 2$, the goal is reachable.
- Otherwise, no sequence of valid moves can reach the goal.

---

## 2. Algorithm Comparison Summary

| Algorithm | Type | Complete? | Optimal? | Time Complexity | Space Complexity | Best Use Case |
|---|---|---|---|---|---|---|
| **Breadth-First Search (BFS)** | Uninformed | Yes | Yes (unit cost) | $O(b^d)$ | $O(b^d)$ | Shallow solutions, guaranteed shortest path |
| **Depth-First Search (DFS)** | Uninformed | No (in infinite state space / without cycle check) | No | $O(b^m)$ | $O(bm)$ | Memory constrained, when all paths lead to solutions |
| **Depth-Limited Search (DLS)** | Uninformed | Yes (if $d \le \text{limit}$) | No | $O(b^l)$ | $O(bl)$ | Depth-bounded search spaces |
| **Iterative Deepening (IDDLS)** | Uninformed | Yes | Yes (unit cost) | $O(b^d)$ | $O(bd)$ | Uninformed search with minimal memory footprint |
| **Uniform Cost Search (UCS)** | Uninformed | Yes | Yes | $O(b^{1 + \lfloor C^* / \epsilon \rfloor})$ | $O(b^{1 + \lfloor C^* / \epsilon \rfloor})$ | Variable step costs |
| **Greedy Best-First Search (GBFS)** | Informed | No (can get stuck in loops) | No | $O(b^m)$ worst case | $O(b^m)$ | Fast heuristic exploration, non-optimal paths |
| **A\* Search** | Informed | Yes | Yes (with admissible $h$) | $O(b^d)$ | $O(b^d)$ | Optimal, guided heuristic search |

*Notation: $b$ = branching factor ($\approx 3$), $d$ = goal depth, $m$ = maximum tree depth, $l$ = depth limit.*

---

## 3. Detailed Algorithm Descriptions

### 1. Breadth-First Search (BFS)
- **Principle:** Explores all nodes at depth $k$ before proceeding to depth $k + 1$ using a FIFO queue.
- **Advantages:** Guaranteed to find the shallowest goal node; complete on finite graphs.
- **Limitations:** Exponential memory growth; stores all generated frontier nodes in RAM.

### 2. Depth-First Search (DFS)
- **Principle:** Traverses as deep as possible along each branch using a LIFO stack before backtracking.
- **Advantages:** Extremely modest memory footprint ($O(bm)$).
- **Limitations:** Can explore unbounded suboptimal branches or loop indefinitely if cycles are present.

### 3. Depth-Limited Search (DLS)
- **Principle:** DFS restricted to a predetermined cutoff depth $l$.
- **Advantages:** Prevents runaway execution and infinite depth trapping.
- **Limitations:** Incomplete if goal depth $d > l$; non-optimal if $l > d$.

### 4. Iterative Deepening DFS (IDDLS)
- **Principle:** Incrementally invokes DLS for depths $0, 1, 2, \dots$ until the goal is discovered.
- **Advantages:** Combines BFS optimality/completeness with DFS linear space efficiency $O(bd)$.
- **Limitations:** Re-generates upper-level nodes across iterations (overhead is modest: $\approx \frac{b}{b - 1}$).

### 5. Greedy Best-First Search (GBFS)
- **Principle:** Prioritizes node expansion based strictly on $f(n) = h(n)$, expanding nodes estimated to be closest to the goal.
- **Advantages:** Rapidly reaches solutions when heuristic gradients are strong.
- **Limitations:** Highly susceptible to local minima and plateauing; non-optimal.

### 6. A\* Search
- **Principle:** Evaluates nodes via $f(n) = g(n) + h(n)$, combining actual accumulated cost $g(n)$ with optimistic remaining estimate $h(n)$.
- **Advantages:** Optimally efficient among all search algorithms using the same heuristic; guaranteed optimal if $h(n)$ is admissible.
- **Limitations:** High memory requirements for large depth limits (all explored and frontier nodes stored).

---

## 4. Heuristic Functions

### Heuristic 1: Misplaced Tiles ($h_1$)
$$h_1(n) = \sum_{i=1}^8 \mathbb{I}(\text{pos}_n(i) \neq \text{pos}_{\text{goal}}(i))$$
- **Admissibility:** Yes. Each misplaced tile must move at least once.
- **Consistency:** Yes. One move can correct at most one misplaced tile ($h_1(n) \le c(n, a, n') + h_1(n')$).

### Heuristic 2: Manhattan Distance ($h_2$)
$$h_2(n) = \sum_{i=1}^8 \left( |x_i - x_i^*| + |y_i - y_i^*| \right)$$
- **Admissibility:** Yes. Represents the minimum number of single-step moves ignoring obstacles.
- **Dominance:** For all states $n$, $h_2(n) \ge h_1(n)$. Therefore, A\* using Manhattan distance expands fewer or equal nodes than A\* using Misplaced Tiles.
