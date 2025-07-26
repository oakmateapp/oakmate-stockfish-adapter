# 🧠 Oakmate Stockfish Adapter

This repository provides **GPLv3-compliant components** that enable communication between the Stockfish chess engine and Oakmate’s proprietary analysis tools. It ensures open-source license compliance while preserving the confidentiality of Oakmate’s intellectual property.

---

## 🔍 Purpose

-   Provide a clean and isolated code snipped used in Oakmate's proprietary code
-   Bundle the official **Stockfish 17 WASM binary** (as required by GPLv3)
-   Implement a **UCI protocol adapter** layer in JavaScript

---

## 📦 Components

| Component        | Description                   | License                                            |
| ---------------- | ----------------------------- | -------------------------------------------------- |
| `stockfish.wasm` | Official Stockfish 17 binary  | [GPLv3](https://www.gnu.org/licenses/gpl-3.0.html) |
| `app.js`         | UCI command bridge layer      | GPLv3                                              |
| Build Scripts    | Emscripten-based WASM tooling | GPLv3                                              |

---

## ⚠️ Important Notes

-   Oakmate's core UI/analysis logic is **NOT** included
-   This is **NOT** the full Oakmate Chrome Extension
-   Only GPL-required components are published here

---

## 🛠️ Usage Example

```js
// In Oakmate proprietary code we use :

const handleClick = async () => {
    const fenArray = generateFENArray(); // FENs from chess.com or Lichess moves
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

// Oakmate proprietary code then classify the moves based on the evaluation output.
```

---

## 🔧 Building Instructions

1. **Install dependencies**
    ```sh
    npm install
    ```
2. **Build the adapter (requires Emscripten)**
    ```sh
    npm run build
    ```

---

## 📜 License

**GNU General Public License v3.0** — See [LICENSE](LICENSE) for details.

> ⚠️ Note: This license applies only to the components in this repository.

---

## 🙏 Acknowledgments

-   🧩 Stockfish developers for their world-class chess engine
-   🛠️ Emscripten team for enabling WebAssembly builds
