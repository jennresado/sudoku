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
        this.i = 0;  // row index
        this.j = 0;  // col index
        this.rowVals = {};  // track unique values of rows
        this.colVals = {};  // track unique values of columns
        this.quadVals = {};  // track unique values of quadrants
    }

    build() {
        /**
         * Builds the puzzle.
         */

        this.buildLayout();
        this.buildValues();
        this.updateLayout();
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
            this.board[i] = [];

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
                input.id = `board-${i}${j}`;
                row.appendChild(input);
                this.board[i].push(input);
            }
            
            table.appendChild(row);
        }

        mainDiv.appendChild(table);
    }

    buildValues() {
        /**
         * Construct and assign the values of the Sudoku puzzle.
         */

        // Initialize tracking of rows, columns, and quadrants values
        this.setTracking()

        while (this.i < this.size && this.j < this.size) {
            // Retrieve quadrant number
            let quadIndex = this.getQuadrant();
            let val = this.getRandomInt(quadIndex);

            if (val == -1) {
                // Invalid pattern, recalculate values
                this.setTracking()
            } else {
                // Assign value
                this.board[this.i][this.j] = val;

                // Track unique values for rows, columns, and quadrants
                this.rowVals[this.i].push(val);
                this.colVals[this.j].push(val);
                this.quadVals[quadIndex].push(val);

                // Increment to next value
                if (this.j + 1 == this.size) {
                    this.i ++;
                    this.j = 0;
                } else {
                    this.j ++;
                }
            }
        }          
    }

    setTracking() {
        /**
         * Track unique values for rows, columns, and quadrants.
         */

        this.i = 0;
        this.j = 0;
        this.rowVals = [];
        this.colVals = [];
        this.quadVals = [];

        for (let i = 0; i < this.size; i++) {
            this.rowVals.push([]);
            this.colVals.push([]);
            this.quadVals.push([]);
        }
    }

    getRandomInt(quadIndex) {
        /**
         * Return a random value from values 1 through 9 that is unique
         * to the row, column, and quadrant.
         */
        
        let vals = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        let uniqueVals = [];
        
        // Filter vals for unique values
        for (let i = 0; i < vals.length; i++) {
            let uniqueRow = this.rowVals[this.i].includes(vals[i]);
            let uniqueCol = this.colVals[this.j].includes(vals[i]);
            let uniqueQuad = this.quadVals[quadIndex].includes(vals[i]);

            if (uniqueRow == false && uniqueCol== false && uniqueQuad == false) {
                uniqueVals.push(vals[i]);
            }
        }

        if (!uniqueVals.length) {
            // Invalid puzzle
            return -1
        } 

        let random = Math.floor(Math.random() * uniqueVals.length)

        return uniqueVals[random];
    }

    getQuadrant() {
        /**
         * Return the quadrant number.
         */

        if (0 <= this.i && this.i < 3) {
            if (0 <= this.j && this.j < 3) {
                return 0;
            } else if (3 <= this.j && this.j < 6) {
                return 1;
            } else {
                return 2;
            }
        } else if (3 <= this.i && this.i < 6) {
            if (0 <= this.j && this.j < 3) {
                return 3;
            } else if (3 <= this.j && this.j < 6) {
                return 4;
            } else {
                return 5;
            }
        } else {
            if (0 <= this.j && this.j < 3) {
                return 6;
            } else if (3 <= this.j && this.j < 6) {
                return 7;
            } else {
                return 8;
            }
        }
    }

    updateLayout() {
        /**
         * Assign the values of the Sudoku puzzle.
         */
    }
}