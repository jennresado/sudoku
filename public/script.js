// initialize
document.addEventListener('DOMContentLoaded', init);

function init() {
    let puzzle = new Sudoku();
    puzzle.build();
}

class Sudoku {
    constructor() {
        this.size = 9;
        this.status = false;  // state of game
        this.board = [];
    }

    build() {
        /**
         * Builds the puzzle.
         */
        this.buildLayout();
        this.buildValues();
    }

    buildLayout() {
        /**
         * Builds the puzzle board UI.
         */
        
        let mainDiv = document.querySelector("#mainDiv");
        let table = document.createElement("div");

        table.id = "table";
        table.classList.add("container");

        for (let i = 0; i < this.size; i++) {
            let row = document.createElement("div");

            row.classList.add("row");

            for (let j = 0; j < this.size; j++) {
                let input = document.createElement("input");
                
                if (j == 0 || j == 3 || j == 6) {
                    input.classList.add("quadrantLeftBorder");
                } else if (j == 8) {
                    input.classList.add("quadrantRightBorder");
                }

                input.classList.add("col");
                input.type = "text";
                input.id = `board-${i}${j}`
                row.appendChild(input);
            }
            
            table.appendChild(row);
        }

        mainDiv.appendChild(table);
    }

    buildValues() {
        /**
         * Construct and assign the values of the Sudoku
         * puzzle to the UI.
         */

        let board = [];

        for (let i = 0; i < this.size; i++) {
            
        }        
    }

    getRandomInt() {
        /**
         * Return a random value from [1, 10) that is unique
         * to the row, column, and quadrant.
         */
        
         let min = Math.ceil(1);
         let max = Math.floor(10);

         return Math.floor(Math.random() * (max - min) + min);
    }
}