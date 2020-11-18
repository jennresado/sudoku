// initialize
document.addEventListener('DOMContentLoaded', init);

function init() {
    let puzzle = new Sudoku();
}

class Sudoku {
    constructor() {
        this.size = 9;
        this.status = false;  // state of game
        this.rows = [];  // holds state of each row
        this.columns = [];  // holds state of each column
        this.board = this.build();
    }

    build() {
        /**
         * Builds the puzzle board.
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
                // assign random value from 1 to 9 to row/column
                // value needs to be unique to row and column
                input.value = this.getRandomInt();
                row.appendChild(input);
            }
             
            table.appendChild(row);
        }

        mainDiv.appendChild(table);
    }

    getRandomInt() {
        /**
         * Return a random value from [1,10) that is unique
         * to the row, column, and quadrant.
         */
        
        let min = Math.ceil(1);
        let max = Math.floor(10); 

        return Math.floor(Math.random() * (max - min) + min);
    }
}