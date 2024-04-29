# Covey.Town Frontend App

Please see the `README.md` in the repository base for information about this project.

This frontend is created using the [create react app](https://create-react-app.dev) toolchain. You
can start a development server by running `npm start`. To create a production build, run
`npm run build`.

Manual Testing for Frontend Features:

Interacting with our Battleship Area:
Our Battleship Area is located at the top right of the starting room the user is in once they enter Covey.Town. To interact with the area, walk up to the table and click space-bar. The user will notice that prior to pressing spacebar, there will be a popup by the table that describes our table. 

Next, after pressing the spacebar, the user will notice that a React UI appears on the screen, with our setup page. The steps to play the game are as follows:

Setup:
Click on an image of a ship with the orientation desired in the sidebar
Then, immediately after, click on a square on the board that you want the ship to be placed at (NOTE: You will not be able to reset the ships after placing them) 
Repeat steps 1 and 2 for each of the five ships on the sidebar
When no more ships remain, press the READY button, and the game will start

Gameplay (normal Battleship rules):
Each turn, you will be able to press a cell on a board that represents your opponents board, with all the ships hidden
Then, you will have to submit your move
If the guessed cell contains one of their ships, the cell will be marked as so
If the guessed cell does not contain one of their ships, the cell will also be marked as so
This will repeat between the two players until the game is over when one player’s ships are all discovered
You will know if it is your turn by the text in the upper left hand corner
You can exit the game at any point by leaving the interactable area and closing the UI