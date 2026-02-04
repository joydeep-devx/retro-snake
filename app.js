// DOM references
const board = document.querySelector(".board");
const startScreen = document.querySelector(".start-overlay");
const endScreen = document.querySelector(".game-over-overlay");
const highScoreElement = document.querySelector("#high-score");
const scoreElement = document.querySelector("#score");
const timeElement = document.querySelector("#time");

//Game constants
const blockHeight = 30;
const blockWidth = 30;
const cols = Math.floor(board.clientWidth / blockWidth);
const rows = Math.floor(board.clientHeight / blockHeight);

// Game state variables
let gameStarted = false;
let gameloop = null;
let timeLoop = null;
let direction = 'down';
let gameOverState = false;
let score = 0;
let highScore = parseInt(localStorage.getItem("highScore")) || 0;
let time = "00:00";


//  initialize high score on load
highScoreElement.innerText = highScore;
timeElement.innerText = time;   
scoreElement.innerText = score;

// Data structures
const blocks = []; // grid
let snake = [{x : 10,y: 3},{ x: 11,y: 3}];// create the snake
let food = {x:Math.floor(Math.random()*cols) , y:Math.floor(Math.random()*rows)};// food 

// grid creation
for(let row=0;row<rows;row++){
    blocks[row] = [];
    for(let col=0;col<cols;col++){
        const block = document.createElement('div');
        block.classList.add("block");
        board.appendChild(block);
        blocks[row][col] = block;
    }
}

// Initial Render
// construct initial snake
snake.forEach(segment => {
    blocks[segment.y][segment.x].classList.add("snake-body");
});

// construct initial food
blocks[food.y][food.x].classList.add("food");

// to start the game
function startGame(){
    // prevent multiple intervals
    if(gameStarted){
        return;
    }
    gameStarted = true;
    gameOverState = false;
    // hide the start overlay
    startScreen.style.display = "none";
    // start the loop
    gameloop = setInterval(renderGame,250);
    // start the time countdown
    timeLoop = setInterval(updateTime,1000);
}
// to end the game 
function gameOver(){
    //stop movement
    clearInterval(gameloop);
    clearInterval(timeLoop);

    gameloop = null;
    timeLoop = null;
    
    gameOverState = true;
    gameStarted = false;

    // update final score
    document.getElementById("final-score").textContent = score;
    
    // show the game over overlay
    endScreen.style.display = "flex";
}
// restart game
function restartGame(){
    // reset game-over flag
    gameOverState = false;
    // reset direction
    direction = "down";
    endScreen.style.display = "none";
    resetSnake();
    resetFood();
    resetScore();
    startGame();
}
// render the snake
function renderGame() {
    const currentHead = snake[0];
    let newHead;

    // calculate new head
    if(direction === 'left'){ 
        newHead = {x :currentHead.x-1, y:currentHead.y};
    }
    else if(direction === 'right'){
        newHead = {x :currentHead.x+1, y:currentHead.y};
    }
    else if(direction === 'up'){
        newHead = {x :currentHead.x, y:currentHead.y-1};
    }
    else if(direction === 'down'){
        newHead = {x :currentHead.x, y:currentHead.y+1};
    }

    // wall collision
    if(newHead.x < 0 || newHead.x >= cols ||newHead.y < 0 ||newHead.y >= rows) {
        // alert("Game Over");
        gameOver();
        return;
    }

    // self collision
    if (snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
        gameOver();
        return;
    }

    // add new head
    snake.unshift(newHead);

    // draw new head (render)
    blocks[newHead.y][newHead.x].classList.add("snake-body");

    // food consume logic
    if (newHead.x === food.x && newHead.y === food.y) {
        // remove old food visually
        blocks[food.y][food.x].classList.remove("food");

        // spawn new food (make sure it doesn't spawn on snake later)
        food = {
            x: Math.floor(Math.random() * cols),
            y: Math.floor(Math.random() * rows)
        };
        //update scores
        updateScore();

        // draw new food
        blocks[food.y][food.x].classList.add("food");
    } else {
        // normal movement → remove tail
        const tail = snake.pop();
        blocks[tail.y][tail.x].classList.remove("snake-body");
    }
    
}
// reset the snake
function resetSnake(){
    // remove old snake from board
    snake.forEach(segment=>{
        blocks[segment.y][segment.x].classList.remove("snake-body");
    });

    snake = [{x : 10,y: 3},{ x: 11,y: 3}]; // reconstruct snake
    // draw the snake 
    snake.forEach(segment => {
        blocks[segment.y][segment.x].classList.add("snake-body");
    });

}
// reset the food
function resetFood(){
    blocks[food.y][food.x].classList.remove("food"); // erase the old food
    food = {x:Math.floor(Math.random()*cols) , y:Math.floor(Math.random()*rows)}; // reconstruct food
    blocks[food.y][food.x].classList.add("food"); // draw the food
}
// reset the score
function resetScore(){
    // set score
    score = 0; // change score
    scoreElement.innerText = `${score}`; // display the score
    time = "00:00"; // reset time
    timeElement.innerText = time;
}
//update the time
function updateTime(){
    let [min,sec] = time.split(":").map(Number);
    if(sec === 59){
        min ++;
        sec = 0;
    }else{
        sec += 1;
    }
    time = `${String(min).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
    timeElement.innerText = time;
}
//update the scores
function updateScore(){
    score += 10; // increment of score
    scoreElement.innerText = `${score}`; // display the new score
    // set high-score
    if(score > highScore){
        highScore = score; // update high-score
        localStorage.setItem("highScore",highScore.toString()); // set it in localStorage
        //highScore = parseInt(localStorage.getItem("highScore")); // get high-score from localStorage
        highScoreElement.innerText = `${highScore}`; // display highScore
    }

}
// game-controls
addEventListener('keydown',(event)=>{
    // start game
    if(event.code === "Space" && !gameOverState){
        startGame();
        return;
    }
    // restart game
    if(event.code === "Space" && gameOverState){
        console.log("RESTART");
        restartGame();
        return;
    }
    // ignore movement when not playing 
    if(!gameStarted){
        return;
    }
    // movement
    if (event.key === "ArrowLeft" && direction !== "right") direction = "left";
    else if (event.key === "ArrowRight" && direction !== "left") direction = "right";
    else if (event.key === "ArrowUp" && direction !== "down") direction = "up";
    else if (event.key === "ArrowDown" && direction !== "up") direction = "down";
})