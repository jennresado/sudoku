// initialize
document.addEventListener('DOMContentLoaded', init);

function init() {
    let mainDiv = document.querySelector("#mainDiv");
    let playBtn = document.querySelector("#play");
    let instructions = document.querySelector("#instructions");
    let puzzle = new Sudoku();
    puzzle.build();

    playBtn.addEventListener("click", function(){
        // Close instructions modal
        mainDiv.classList.remove("display");
        instructions.classList.add("display");
    })
}

class Sudoku {
    constructor() {
        this.size = 9;
        this.board = [];
        this.boardVals = [];
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
            this.boardVals[i] = [];

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
                this.boardVals[i].push(0);
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
                this.boardVals[this.i][this.j] = val;

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
         * Utilizes linear programming and constraint methods.
         * Methods are iterated until a solution is found.
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

        for (let i = 0; i < this.size; i ++) {
            for (let j = 0; j < this.size; j++) {
                // Randomly fill in board and leave some spaces empty
                let random = Math.floor(Math.random() * this.size);
                
                if (random < 6) {
                    this.board[i][j].value = this.boardVals[i][j];
                    this.board[i][j].readOnly = true;
                } else {
                    this.board[i][j].classList.add("guess");
                }

                let puzzleObj = this;
                this.bindInput(this.board[i][j], puzzleObj);
            }
        }
    }

    bindInput(el, puzzleObj) {
        /**
         * Game is won when the puzzle is solved.
         */

        el.addEventListener("change", function(err){
            let row = parseInt(el.id.charAt(6));
            let col = parseInt(el.id.charAt(7));
            let val = parseInt(el.value);

            // Update game state
            if (puzzleObj.boardVals[row][col] == val) {
                // If board is filled and puzzle is valid, player wins
                let status = true;
                let full = true;

                for (let i = 0; i < puzzleObj.size; i++) {
                    for (let j = 0; j < puzzleObj.size; j++) {
                        if (puzzleObj.board[i][j].value === null) {
                            full = false;
                            status = false;
                        } else if (puzzleObj.board[i][j].value != puzzleObj.boardVals[i][j]) {
                            status = false;
                        }
                    }
                }

                // Game is won, option to replay
                if (full == true && status == true) {
                    puzzleObj.replay(puzzleObj);
                }
            } 
        })
    }

    replay(puzzleObj) {
        /**
         * Game is won, give option to replay.
         */

        let yesBtn = document.querySelector("#yes");
        let noBtn = document.querySelector("#no");
        let messageModal = document.querySelector("#message");
        let mainDiv = document.querySelector("#mainDiv");

        // New game
        yesBtn.addEventListener("click", function(){
            mainDiv.removeChild(mainDiv.childNodes[0]);
            puzzleObj.build();
            messageModal.classList.add("display");
            mainDiv.classList.remove("display");
        });

        // Display finished game
        noBtn.addEventListener("click", function() {
            mainDiv.classList.remove("display");
            messageModal.classList.add("display");
        });

        // Display winning message modal
        mainDiv.classList.add("display");
        messageModal.classList.remove("display");
    }
}