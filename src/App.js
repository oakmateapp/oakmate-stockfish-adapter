import { useState, useEffect, useRef } from "react";
import Stockfish from "./stockfish.js";
import { Chess } from "chess.js";

const ANALYSIS_TIMEOUT = 5000; // Timeout in milliseconds (adjustable)

function App() {
    const stockfish = useRef(null);
    const analysisTimeout = useRef(null);
    const currentResolve = useRef(null);
    const currentReject = useRef(null);
    const latestEval = useRef(null);
    const currentFen = useRef(null);
    const [evaluationsForMoves, setEvaluationsForMoves] = useState();

    const moveList = [
        "b3",
        "e5",
        "Bb2",
        "Nc6",
        "d4",
        "d6",
        "dxe5",
        "dxe5",
        "Qxd8+",
        "Nxd8",
        "Bxe5",
        "Nc6",
        "Bxc7",
        "Nf6",
        "e3",
        "Bb4+",
        "c3",
        "Bc5",
        "Bb5",
        "Bd7",
        "Nf3",
        "a6",
        "Bxc6",
        "Bxc6",
        "Ne5",
        "Rc8",
        "Nxc6",
        "Rxc7",
        "Nb4",
        "Bxb4",
        "cxb4",
        "Rc1+",
        "Ke2",
        "Rxh1",
        "h3",
        "O-O",
        "a3",
        "Nd5",
        "Kd2",
        "Rg1",
        "g4",
        "Rf1",
        "f4",
        "Rd8",
        "Ke2",
        "Rh1",
        "e4",
        "Nc3+",
        "Nxc3",
        "Rxa1",
        "Ke3",
        "Rxa3",
        "Ne2",
        "Rxb3+",
        "Kf2",
        "Rxb4",
        "e5",
        "Rd2",
        "Ke1",
        "Rbb2",
        "Nd4",
        "Rxd4",
    ];

    useEffect(() => {
        // Initialize Stockfish worker
        stockfish.current = new Worker(Stockfish);

        stockfish.current.onmessage = (e) => {
            const message = e.data;

            if (message.startsWith("info depth")) {
                const scoreMatch = message.match(/score (cp|mate) ([-+]?\d+)/);
                if (scoreMatch) {
                    const [_, type, value] = scoreMatch;
                    const game = new Chess(currentFen.current);

                    let adjustedValue = parseInt(value, 10);
                    if (game.turn() === "b") {
                        adjustedValue = -1 * adjustedValue;
                    }

                    if (type === "cp") {
                        const numericValue = adjustedValue / 100;
                        latestEval.current =
                            numericValue >= 0
                                ? `+${numericValue.toFixed(1)}`
                                : `${numericValue.toFixed(1)}`;
                    } else if (type === "mate") {
                        const moves = Math.abs(adjustedValue);
                        const winningSide =
                            adjustedValue > 0 ? "White" : "Black";
                        latestEval.current = `Mate in ${moves} (${winningSide} wins)`;
                    }
                }
            } else if (message.startsWith("bestmove")) {
                clearTimeout(analysisTimeout.current);
                if (currentResolve.current) {
                    currentResolve.current(latestEval.current);
                    currentResolve.current = null;
                }
            }
        };

        return () => {
            stockfish.current?.terminate();
            clearTimeout(analysisTimeout.current);
        };
    }, []);

    const generateFENArray = () => {
        const game = new Chess();
        return moveList
            .map((move) => {
                try {
                    game.move(move);
                    return game.fen();
                } catch (error) {
                    console.error(`Invalid move '${move}':`, error);
                    return null;
                }
            })
            .filter((fen) => fen !== null);
    };

    const getStockfishEvaluation = (fen) => {
        return new Promise((resolve, reject) => {
            currentFen.current = fen;
            latestEval.current = null;
            currentResolve.current = resolve;
            currentReject.current = reject;

            stockfish.current.postMessage("ucinewgame");
            stockfish.current.postMessage(`position fen ${fen}`);
            stockfish.current.postMessage("go depth 15");

            analysisTimeout.current = setTimeout(() => {
                stockfish.current.postMessage("stop");
                reject(new Error("Analysis timed out"));
                currentResolve.current = null;
            }, ANALYSIS_TIMEOUT);
        });
    };

    const handleClick = async () => {
        const fenArray = generateFENArray();
        const evaluations = [];

        for (const fen of fenArray) {
            try {
                const evaluation = await getStockfishEvaluation(fen);
                evaluations.push(evaluation);
                console.log(`FEN: ${fen} | Evaluation: ${evaluation}`);
            } catch (error) {
                evaluations.push("Error");
                console.error(`Evaluation failed for FEN: ${fen}`, error);
            }
        }

        setEvaluationsForMoves(evaluations);
        console.log("Final evaluations array:", evaluations);
    };

    return (
        <div
            style={{
                width: "100%",
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
            }}
        >
            <button onClick={handleClick}>
                Analyze Positions with Stockfish
            </button>

            {evaluationsForMoves && <div>{evaluationsForMoves}</div>}
        </div>
    );
}

export default App;
