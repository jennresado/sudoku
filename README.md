To run the Sudoku game
   1. Is already running on the flip3.engr.oregonstate.edu server
      a. Connect to flip3.engr.oregonstate.edu server
      b. go to http://flip3.engr.oregonstate.edu:3001

   OR

   2. $ node app.js
      a. The game is hosted on port: 3001
   
Game Rules
   1. The game Sudoku involves a grid of 81 squares. 

      The grid is divided into nine blocks, each containing nine squares.

      The rules of the game are simple: each of the nine blocks has to 
      contain all the numbers 1-9 within its squares. Each number can 
      only appear once in a row, column or box.
   
      The difficulty lies in that each vertical nine-square column, 
      or horizontal nine-square line across, within the larger square, 
      must also contain the numbers 1-9, without repetition or omission.
   
      Every puzzle has just one correct solution.

Game Instructions
   1. Enter a numerical value into a text field and hit enter to register the value.

Complexity Reference
   1. Yato and Seta (2003)
   2. Rodrigues Pereira et al. (2001), Nicolau and Ryan (2006)