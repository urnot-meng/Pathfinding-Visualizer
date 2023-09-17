import React, { Component } from "react";
import Node from "./Node/Node";
import { Navbar, Nav, Dropdown, NavItem, NavLink } from "react-bootstrap";
import {
  dijkstra,
  BFS,
  DFS,
  AStar,
  getShortestPath,
  primMaze,
} from "../Algorithm/pathfindingAlgorithms";
import "./PathfindingVisualizer.css";
import instruct_gif from "./instruct.gif";

export default class PathFindingVisualizer extends Component {
  constructor() {
    super();
    this.state = {
      grid: [],
      FR: 7,
      FC: 31,
      mouseIsPressed: false,
      changingStart: false,
      changingFinish: false,
      visualized: false,
      rendering: false,
      numRow: 17,
      numCol: 37,
      SR: 7,
      SC: 5,
      speed: "medium",
      delays: { slow: 17, medium: 7, fast: 3 },
      currentAlgorithm: -1,
      algorithms: ["BFS", "Dijkstra", "A*", "DFS"],
      pathfindingAlgorithms: [BFS, dijkstra, AStar, DFS],
      showModal: true,
    };
    this.visualizePathfinding = this.visualizePathfinding.bind(this);
    this.clearVisualizer = this.clearVisualizer.bind(this);
    this.setAlgorithm = this.setAlgorithm.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
  }

  setAlgorithm(algoId) {
    this.setState({ currentAlgorithm: algoId });
  }

  isRendering() {
    return this.state.rendering;
  }

  hideModal = () => {
    this.setState({ showModal: false });
  };

  componentDidMount() {
    const grid = this.initializeGrid(false);
    this.setState({
      grid: grid,
      currentAlgorithm: -1,
    });
  }

  initializeGrid(clearWall) {
    const grid = [];
    for (let row = 0; row < this.state.numRow; row++) {
      const currentRow = [];
      for (let col = 0; col < this.state.numCol; col++) {
        let isW = false;
        const element = document.getElementById(`node-${row}-${col}`);
        if (
          element &&
          (element.className === "node node-path" ||
            element.className === "node node-visited")
        ) {
          element.className = "node";
        }
        if (!clearWall && element && element.className === "node node-wall") {
          isW = true;
        }
        currentRow.push(this.createNode(row, col, isW));
      }
      grid.push(currentRow);
    }
    return grid;
  }

  createNode(row, col, isW) {
    return {
      col,
      row,
      isStart: row === this.state.SR && col === this.state.SC,
      isFinish: row === this.state.FR && col === this.state.FC,
      distance: Infinity,
      heuristic: Infinity,
      isVisited: false,
      isWall: isW,
      previousNode: null,
    };
  }

  handleMouseDown(row, col) {
    if (this.state.rendering) return;
    if (row === this.state.SR && col === this.state.SC) {
      this.setState({ changingStart: true });
    } else if (row === this.state.FR && col === this.state.FC) {
      this.setState({ changingFinish: true });
    } else if (!this.state.rendering) {
      this.updateGridWithWall(this.state.grid, row, col);
      this.setState({ mouseIsPressed: true });
      this.clearVisitedAndPath();
    }
  }

  handleMouseEnter(row, col) {
    if (this.state.rendering) return;
    const currentNode = this.state.grid[row][col];

    // Deep clone the grid
    const newGrid = this.state.grid.map((r) => r.map((cell) => ({ ...cell })));
    const updates = {};

    if (this.state.mouseIsPressed) {
      this.updateGridWithWall(newGrid, row, col);
      this.setState({ grid: newGrid, mouseIsPressed: true });
    } else if (
      this.state.changingStart &&
      !(row === this.state.FR && col === this.state.FC) &&
      !currentNode.isWall
    ) {
      newGrid[this.state.SR][this.state.SC].isStart = false;
      newGrid[row][col].isStart = true;

      updates.grid = newGrid;
      updates.SR = row;
      updates.SC = col;
      this.clearVisitedAndPath();
    } else if (
      this.state.changingFinish &&
      !(row === this.state.SR && col === this.state.SC) &&
      !currentNode.isWall
    ) {
      newGrid[this.state.FR][this.state.FC].isFinish = false;
      newGrid[row][col].isFinish = true;

      updates.grid = newGrid;
      updates.FR = row;
      updates.FC = col;
      this.clearVisitedAndPath();
    }
    this.setState(updates);
  }

  handleMouseUp() {
    this.setState({
      changingStart: false,
      changingFinish: false,
      mouseIsPressed: false,
    });
  }

  updateGridWithWall(grid, row, col) {
    const node = grid[row][col];

    if (!node.isStart && !node.isFinish) {
      const newNode = {
        ...node,
        isWall: !node.isWall,
      };
      grid[row][col] = newNode;
    }
  }

  visualizePathfinding() {
    if (this.state.currentAlgorithm === -1) return;
    if (this.state.rendering) return;

    this.setState({ visualized: true, rendering: true });
    let g = this.initializeGrid(false);
    this.setState({
      grid: g,
    });
    const grid = this.state.grid;
    const start = grid[this.state.SR][this.state.SC];
    const finish = grid[this.state.FR][this.state.FC];
    const visitedInOrder = this.state.pathfindingAlgorithms[
      this.state.currentAlgorithm
    ](grid, start, finish);
    const shortedPath = getShortestPath(finish);
    for (let i = 0; i < visitedInOrder.length; i++) {
      setTimeout(() => {
        const node = visitedInOrder[i];
        if (!node.isStart && !node.isFinish)
          document.getElementById(`node-${node.row}-${node.col}`).className =
            "node node-visited";
      }, this.state.delays[this.state.speed] * i);
    }

    for (let i = 0; i < shortedPath.length; i++) {
      setTimeout(() => {
        const node = shortedPath[i];
        if (!node.isStart && !node.isFinish)
          document.getElementById(`node-${node.row}-${node.col}`).className =
            "node node-path";
      }, this.state.delays[this.state.speed] * visitedInOrder.length + 50 * i);
    }
    setTimeout(() => {
      this.setState({ rendering: false });
    }, this.state.delays[this.state.speed] * visitedInOrder.length + 50 * shortedPath.length);
  }

  clearVisualizer() {
    if (!this.state.rendering)
      this.setState({ grid: this.initializeGrid(true), visualized: false });
  }

  clearVisitedAndPath() {
    for (let row = 0; row < this.state.numRow; row++) {
      for (let col = 0; col < this.state.numCol; col++) {
        let n = document.getElementById(`node-${row}-${col}`);
        console.log(n);
        if (
          n &&
          (n.className === "node node-visited" ||
            n.className === "node node-path")
        ) {
          n.className = "node";
        }
      }
    }
  }

  setSpeed(speed) {
    this.setState({ speed: speed });
  }

  render() {
    const grid = this.state.grid;

    return (
      <>
        {this.state.showModal && (
          <div className="modal-backdrop">
            <div className="modal-content">
              <h3>How to use?</h3>
              <img
                className="card-img-top img-thumbnail"
                style={{ marginBottom: "5px" }}
                src={instruct_gif}
                alt="Card image cap"
              />
              <button
                className="btn btn-outline-success my-2 my-sm-0 close-button"
                type="submit"
                onClick={this.hideModal}
              >
                Close
              </button>
            </div>
          </div>
        )}
        <Navbar bg="light" expand="lg" collapseOnSelect>
          <Navbar.Brand href="#">Pathfinding Visualizer</Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />

          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="mr-auto">
              {/* Dropdown for Algorithm Selection */}
              <Dropdown as={NavItem}>
                <Dropdown.Toggle as={NavLink} variant="secondary">
                  {this.state.currentAlgorithm === -1
                    ? "Select an Algorithm"
                    : this.state.algorithms[this.state.currentAlgorithm]}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {this.state.algorithms.map((algorithm, algoId) => (
                    <Dropdown.Item
                      key={algoId}
                      onClick={() => this.setAlgorithm(algoId)}
                    >
                      {algorithm}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>

              <Nav.Link onClick={this.clearVisualizer}>Reset</Nav.Link>

              {/* Dropdown for Speed Selection */}
              <Dropdown as={NavItem}>
                <Dropdown.Toggle as={NavLink} variant="outline-dark">
                  Speed: {this.state.speed}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {["slow", "medium", "fast"].map((speed) => (
                    <Dropdown.Item
                      key={speed}
                      onClick={() => this.setSpeed(speed)}
                    >
                      {speed}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>

              {/* Button to Generate Maze */}
              <Nav.Link
                onClick={() => {
                  primMaze(this.state.grid);
                  const newGrid = this.state.grid.map((row) => row.slice());
                  if (newGrid[this.state.SR][this.state.SC].isWall) {
                    newGrid[this.state.SR][this.state.SC].isWall = false;
                  }
                  if (newGrid[this.state.FR][this.state.FC].isWall) {
                    newGrid[this.state.FR][this.state.FC].isWall = false;
                  }

                  this.setState({ grid: newGrid, finish: false });
                  this.clearVisitedAndPath();
                }}
                disabled={this.state.rendering}
              >
                Generate Maze
              </Nav.Link>

              <Nav.Link
                className="visualize-btn"
                onClick={this.visualizePathfinding}
              >
                Visualize
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>

        {/* The grid */}
        <table
          className="grid-container"
          onMouseLeave={() => this.handleMouseUp()}
        >
          <tbody className="grid">
            {grid.map((row, rowId) => (
              <tr className="row" key={rowId}>
                {row.map((node, nodeId) => (
                  <Node
                    key={nodeId}
                    {...node}
                    mouseIsPressed={this.state.mouseIsPressed}
                    onMouseDown={this.handleMouseDown}
                    onMouseEnter={this.handleMouseEnter}
                    onMouseUp={this.handleMouseUp}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  }
}
