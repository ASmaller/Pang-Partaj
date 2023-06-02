var socket = io();

var form = document.getElementById('form');
var usernameElement = document.getElementById('username');
var roomCodeElement = document.getElementById('roomCode');
var scoreElement = document.getElementById('score');
var usernameParagraph = document.getElementById('usernameParagraph');
var roomCodeParagraph = document.getElementById('roomCodeParagraph');
var highscoreElement = document.getElementById('highscoreElement');
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

const player = {
  name: '',
  score: 0
};

let buttonPresses = 0;
let loops = 0;

//Animation related variables
//Animation increment in pixels, if changed, change ammounts of loops in if statements
let increment = 10;

let plungerStart = [(canvas.width / 6), (canvas.height / 1.5)];
let plungerSpecs = [plungerStart[0], plungerStart[1], 120, 140];  //x, y, length, height

let enemyPlungerStart = [(canvas.width / 1.5), (canvas.height / 1.6)];
let enemyPlungerSpecs = [enemyPlungerStart[0], enemyPlungerStart[1], (120 / 3), (140 / 3)];  //x, y, length, height

//Load player plunger
ctx.clearRect(0, 0, (canvas.width / 2), (canvas.height));
ctx.fillStyle = 'red';
ctx.fillRect(plungerSpecs[0], plungerSpecs[1], plungerSpecs[2], plungerSpecs[3]);
ctx.fillStyle = 'gray';
ctx.fillRect((plungerSpecs[0] + 5), (plungerSpecs[1] - 80), 110, 20);
ctx.fillRect((plungerSpecs[0] + 50), (plungerSpecs[1] - 80), 20, 80);

//Load enemy plunger
ctx.clearRect((canvas.width / 2), 0, canvas.width, canvas.height);
ctx.fillStyle = 'red';
ctx.fillRect(enemyPlungerSpecs[0], enemyPlungerSpecs[1], enemyPlungerSpecs[2], enemyPlungerSpecs[3]);
ctx.fillStyle = 'gray';
ctx.fillRect((enemyPlungerSpecs[0] + (5 / 3)), (enemyPlungerSpecs[1] - (80 / 3)), (110 / 3), (20 / 3));
ctx.fillRect((enemyPlungerSpecs[0] + (50 / 3)), (enemyPlungerSpecs[1] - (80 / 3)), (20 / 3), (80 / 3));

//Animates plunger
function plungerAnimation() {
  ctx.clearRect(0, 0, (canvas.width / 2), (canvas.height));
  ctx.fillStyle = 'red';
  ctx.fillRect(plungerSpecs[0], plungerSpecs[1], plungerSpecs[2], plungerSpecs[3]);
  ctx.fillStyle = 'gray';
  ctx.fillRect((plungerSpecs[0] + 5), (plungerSpecs[1] - 80), 110, 20);
  ctx.fillRect((plungerSpecs[0] + 50), (plungerSpecs[1] - 80), 20, 80);

  const id = setInterval(() => {
    loops++;
    if (loops < 5) {
      ctx.clearRect(plungerSpecs[0], (plungerSpecs[1] - 80), 120, 80);  //Clear previous draw
      ctx.fillRect((plungerSpecs[0] + 5), (plungerSpecs[1] - 80 + (increment * loops)), 110, 20); //Horizontal bar
      ctx.fillRect((plungerSpecs[0] + 50), (plungerSpecs[1] - 80 + (increment * loops)), 20, 80 - (increment * loops)); //Vertical pole
    } else if (loops >= 5) {
      ctx.clearRect(plungerSpecs[0], (plungerSpecs[1] - 80), 120, 80);
      ctx.fillRect((plungerSpecs[0] + 5), (plungerSpecs[1] - (increment * loops)), 110, 20);
      ctx.fillRect((plungerSpecs[0] + 50), (plungerSpecs[1] - (increment * loops)), 20, (40 + increment * (loops - 4)));
    }
    if (loops > 7) {
      clearInterval(id);
      loops = 0;
    }
  }, 20);
}

//Animates the enemy's plunger
function enemyPlungerAnimation() {
  const enemyID = setInterval(() => {
    loops++;
    if (loops < 5) {
      ctx.clearRect(enemyPlungerSpecs[0], (enemyPlungerSpecs[1] - (80 / 3)), (120 / 3), (80 / 3));  //Clear previous draw
      ctx.fillRect((enemyPlungerSpecs[0] + (5 / 3)), (enemyPlungerSpecs[1] - (80 / 3) + ((increment / 3) * loops)), (110 / 3), (20 / 3)); //Horizontal bar
      ctx.fillRect((enemyPlungerSpecs[0] + (50 / 3)), (enemyPlungerSpecs[1] - (80 / 3) + ((increment / 3) * loops)), (20 / 3), (80 / 3) - ((increment / 3) * loops)); //Vertical pole
    } else if (loops >= 5) {
      ctx.clearRect(enemyPlungerSpecs[0], (enemyPlungerSpecs[1] - (80 / 3)), (120 / 3), (80 / 3));
      ctx.fillRect((enemyPlungerSpecs[0] + (5 / 3)), (enemyPlungerSpecs[1] - ((increment / 3) * loops)), (110 / 3), (20 / 3));
      ctx.fillRect((enemyPlungerSpecs[0] + (50 / 3)), (enemyPlungerSpecs[1] - ((increment / 3) * loops)), (20 / 3), ((40 / 3) + (increment / 3) * (loops - 4)));
    }
    if (loops > 7) {
      clearInterval(enemyID);
      loops = 0;
    }
  }, 20);
}

function handleForm(event) { event.preventDefault(); }  //Hinder the button from reloading the page. (Can be replaced with the new "dialog" method for forms!)

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (roomCodeElement.value && usernameElement.value) {
    usernameParagraph.innerHTML = 'Username: ' + usernameElement.value;
    roomCodeParagraph.innerHTML = 'Room Code: ' + roomCodeElement.value;
    console.log('Username: ' + usernameElement.value)
    console.log('Room Code: ' + roomCodeElement.value);
    socket.emit('joinRoom', roomCodeElement.value, usernameElement.value);  //Sends a join request with the room code and username to the server.
    player.name = usernameElement.value;
    roomCodeElement.value = '';
    usernameElement.value = '';
  }
});

function buttonPressed() {
  plungerAnimation();
  buttonPresses = buttonPresses + 1;
  scoreElement.innerHTML = buttonPresses;
  player.score = buttonPresses;
  socket.emit('buttonPressed', usernameParagraph.innerText.replace('Username: ', ''), buttonPresses); //Sends the ammount of button presses to the server. (Should probably only send THAT the button has been pressed...) )(Also why did I use 'usernameParagraph.innerText.replace('Username: ', '')' when 'player.name' exists...)
  if (player.score > 99) {
    socket.emit('playerWon', player.name);  //Notifies the server that this socket has won, should definietly be moved to server side.
  }
}

socket.on('scoreRecieved', (playerName, points) => {  //Recieves score updates and animates the enemy's plunger.
  if (playerName != player.name) {  //This if statement could be replaced with "socket.to(socket.roomCode).emit" instead of "io.to(socket.roomCode).emit" on the server side I think.
    enemyPlungerAnimation();
  }
});

socket.on('leaderBoard', (playerName, points) => {  //Recieves the "leaderboard" (the player in the lead).
  highscoreElement.innerHTML = 'Current highscore: ' + points + '<br>Held by: ' + playerName;
  console.log('recieved score: ' + points + ', ID: ' + playerName);
});

socket.on('playerHasWon', () => { //Recieves a win from another socket.
  window.location.href = "https://www.youtube.com/watch?v=jEexefuB62c";
});