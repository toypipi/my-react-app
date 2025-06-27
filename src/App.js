import { computeHeadingLevel } from "@testing-library/dom";
import { useState } from "react";

// Square 组件：渲染一个单独的方块（按钮）
function Square({ value, onSquareClick, className }) {
  return (
    <button className={className} onClick={onSquareClick}>
      {value}
    </button>
  );
}

// Board 组件：渲染一个包含 9 个方块的棋盘
function Board({ xIsNext, squares, onPlay }) {
  // handleClick 函数：处理方块点击事件
  function handleClick(i) {
    // 如果游戏已结束（有赢家）或方块已被填充，则不执行任何操作
    const gameResult = calculateWinner(squares);
    if ((gameResult && gameResult.winner !== "Draw") || squares[i]) {
      return;
    }
    // 复制当前棋盘状态
    const nextSquares = squares.slice();
    // 根据当前玩家（X 或 O）设置方块的值
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    // 调用 onPlay 函数更新游戏状态
    onPlay(nextSquares);
  }

  // 计算赢家
  const gameResult = calculateWinner(squares);
  const winner = gameResult ? gameResult.winner : null;
  const winningSquares = gameResult ? gameResult.winningSquares : [];

  let status;
  // 根据是否有赢家设置游戏状态文本
  if (winner === "Draw") {
    status = "Result: Draw";
  } else if (winner) {
    status = "Winner: " + winner;
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  const renderSquare = (i) => {
    const isWinningSquare = winningSquares.includes(i);
    console.log(isWinningSquare);
    return (
      <Square
        key={i}
        value={squares[i]}
        onSquareClick={() => handleClick(i)}
        className={isWinningSquare ? "square winning-square" : "square"}
      />
    );
  };

  return (
    <>
      <div className="status">{status}</div>
      <div className="board-row">
        {renderSquare(0)}
        {renderSquare(1)}
        {renderSquare(2)}
      </div>
      <div className="board-row">
        {renderSquare(3)}
        {renderSquare(4)}
        {renderSquare(5)}
      </div>
      <div className="board-row">
        {renderSquare(6)}
        {renderSquare(7)}
        {renderSquare(8)}
      </div>
    </>
  );
}

// Game 组件：整个井字棋游戏的顶层组件
export default function Game() {
  // history 状态：存储所有历史步骤的数组
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  // xIsNext 状态：跟踪下一个玩家是否是 X
  const xIsNext = currentMove % 2 === 0;
  // currentSquares：获取当前棋盘状态（历史记录中的最后一个）
  const currentSquares = history[currentMove];

  // handlePlay 函数：处理游戏步骤的更新
  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      description = "Go to move #" + move;
    } else {
      description = "Go to game start";
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

// calculateWinner 函数：检查是否有赢家
function calculateWinner(squares) {
  // 定义所有可能的获胜组合
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  // 遍历所有获胜组合
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    // 检查当前组合中的方块是否相同且不为空
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      // 返回赢家和获胜方块的索引
      return { winner: squares[a], winningSquares: [a, b, c] }; // 返回赢家（X 或 O）和获胜方块的索引
    }
  }
  // 检查是否平局（所有方块都已填充且没有赢家）
  if (squares.every((square) => square !== null)) {
    return { winner: "Draw", winningSquares: [] };
  }
  return null; // 如果没有赢家，则返回 null
}
