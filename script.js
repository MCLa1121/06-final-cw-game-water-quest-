// =======================================================
// Water Match - charity: water Memory Game Prototype
// This file controls the game logic.
// It handles cards, score, timer, matching, win/lose, and reset.
// =======================================================


// =======================================================
// 1. Game settings
// =======================================================

// The player has 60 seconds to match all cards
const TIME_LIMIT = 60;

// There are 8 matching pairs in the game
const TOTAL_MATCHES = 8;


// =======================================================
// 2. Game state variables
// These values change while the game is running.
// =======================================================

// Tracks the player's score
let score = 0;

// Tracks how many pairs the player has matched
let matchesFound = 0;

// Tracks how much time is left
let timeLeft = TIME_LIMIT;

// Tracks whether the game is currently active
let gameActive = false;

// Stores the first card the player flips
let firstCard = null;

// Stores the second card the player flips
let secondCard = null;

// Stops the player from clicking more cards while the game checks a match
let lockBoard = false;

// Stores the timer interval
let timerInterval;


// =======================================================
// 3. Card data
// Each object represents one card type.
// We duplicate these later to create pairs.
// =======================================================

const cardTypes = [
  {
    name: "Jerry Can",
    type: "image",
    value: "img/water-can-transparent.png"
  },
  {
    name: "Clean Water",
    type: "emoji",
    value: "💧"
  },
  {
    name: "Well",
    type: "emoji",
    value: "🪣"
  },
  {
    name: "Community",
    type: "emoji",
    value: "🤝"
  },
  {
    name: "Globe",
    type: "emoji",
    value: "🌍"
  },
  {
    name: "Sparkle",
    type: "emoji",
    value: "✨"
  },
  {
    name: "Home",
    type: "emoji",
    value: "🏠"
  },
  {
    name: "Heart",
    type: "emoji",
    value: "💛"
  }
];


// =======================================================
// 4. Grab HTML elements
// These connect JavaScript to the HTML page.
// =======================================================

// Score display
const scoreDisplay = document.getElementById("score");

// Matches display
const matchesDisplay = document.getElementById("matches");

// Timer display
const timerDisplay = document.getElementById("timer");

// Message display
const messageDisplay = document.getElementById("message");

// Start button
const startButton = document.getElementById("start-game");

// Reset button
const resetButton = document.getElementById("reset-game");

// Memory card grid
const memoryGrid = document.getElementById("memory-grid");


// =======================================================
// 5. Show a message on the page
// The type changes the color of the message.
// =======================================================

function showMessage(text, type) {
  // Change message text
  messageDisplay.textContent = text;

  // Reset message class
  messageDisplay.className = "message";

  // Green message
  if (type === "success") {
    messageDisplay.classList.add("success");
  }

  // Red message
  else if (type === "danger") {
    messageDisplay.classList.add("danger");
  }
}


// =======================================================
// 6. Shuffle cards
// This randomizes the order of the cards.
// =======================================================

function shuffleCards(cards) {
  // Loop backward through the array
  for (let i = cards.length - 1; i > 0; i--) {
    // Pick a random index
    const randomIndex = Math.floor(Math.random() * (i + 1));

    // Swap the current card with the random card
    const temp = cards[i];
    cards[i] = cards[randomIndex];
    cards[randomIndex] = temp;
  }

  // Return the shuffled cards
  return cards;
}


// =======================================================
// 7. Create the card HTML
// This function builds one card.
// =======================================================

function createCard(cardInfo) {
  // Create a button for the card
  const card = document.createElement("button");

  // Add CSS class
  card.className = "card";

  // Store the card name in a data attribute
  // This helps us check if two cards match
  card.dataset.name = cardInfo.name;

  // Create the inside of the card
  const cardInner = document.createElement("div");
  cardInner.className = "card-inner";

  // Create the front side of the card
  const cardFront = document.createElement("div");
  cardFront.className = "card-front";
  cardFront.textContent = "?";

  // Create the back side of the card
  const cardBack = document.createElement("div");
  cardBack.className = "card-back";

  // If this card uses an image, create an img tag
  if (cardInfo.type === "image") {
    const img = document.createElement("img");
    img.src = cardInfo.value;
    img.alt = cardInfo.name;
    cardBack.appendChild(img);
  }

  // Otherwise, use an emoji
  else {
    cardBack.textContent = cardInfo.value;
  }

  // Put front and back inside the card inner
  cardInner.appendChild(cardFront);
  cardInner.appendChild(cardBack);

  // Put card inner inside the card button
  card.appendChild(cardInner);

  // When the player clicks a card, flip it
  card.addEventListener("click", function () {
    flipCard(card);
  });

  // Return the finished card
  return card;
}


// =======================================================
// 8. Create the board
// This duplicates the cards, shuffles them, and displays them.
// =======================================================

function createBoard() {
  // Clear the board first
  memoryGrid.innerHTML = "";

  // Make pairs by duplicating the cardTypes array
  const cardPairs = [...cardTypes, ...cardTypes];

  // Shuffle the paired cards
  const shuffledCards = shuffleCards(cardPairs);

  // Create and add each card to the grid
  shuffledCards.forEach(function (cardInfo) {
    const card = createCard(cardInfo);
    memoryGrid.appendChild(card);
  });
}


// =======================================================
// 9. Flip a card
// This runs when the player clicks a card.
// =======================================================

function flipCard(card) {
  // Do nothing if the game has not started
  if (!gameActive) {
    showMessage("Press Start before flipping cards.", "danger");
    return;
  }

  // Do nothing if board is locked
  if (lockBoard) return;

  // Do nothing if player clicks the same card twice
  if (card === firstCard) return;

  // Do nothing if card is already matched
  if (card.classList.contains("matched")) return;

  // Flip the card visually
  card.classList.add("flipped");

  // If this is the first card flipped, save it
  if (firstCard === null) {
    firstCard = card;
    return;
  }

  // Otherwise, this is the second card
  secondCard = card;

  // Lock the board while checking
  lockBoard = true;

  // Check whether the two cards match
  checkForMatch();
}


// =======================================================
// 10. Check for a match
// This compares the two flipped cards.
// =======================================================

function checkForMatch() {
  // Compare the data-name values
  const isMatch = firstCard.dataset.name === secondCard.dataset.name;

  // If they match, keep them flipped
  if (isMatch) {
    handleMatch();
  }

  // If they do not match, flip them back
  else {
    handleWrongMatch();
  }
}


// =======================================================
// 11. Handle a correct match
// =======================================================

function handleMatch() {
  // Mark both cards as matched
  firstCard.classList.add("matched");
  secondCard.classList.add("matched");

  // Add 2 points
  score += 2;

  // Add 1 to matches found
  matchesFound++;

  // Update score and matches on the screen
  scoreDisplay.textContent = score;
  matchesDisplay.textContent = matchesFound;

  // Show feedback
  showMessage("Match found! Clean water progress grows.", "success");

  // Reset selected cards
  resetSelectedCards();

  // Check if the player matched all pairs
  if (matchesFound === TOTAL_MATCHES) {
    endGame(true);
  }
}


// =======================================================
// 12. Handle a wrong match
// This is the LevelUp challenge: wrong match reduces score.
// =======================================================

function handleWrongMatch() {
  // Subtract 1 point, but do not go below 0
  score = Math.max(0, score - 1);

  // Update score on the screen
  scoreDisplay.textContent = score;

  // Show feedback
  showMessage("Not a match. Try again! -1 point.", "danger");

  // Wait a little before flipping the cards back
  setTimeout(function () {
    firstCard.classList.remove("flipped");
    secondCard.classList.remove("flipped");

    // Reset selected cards after they flip back
    resetSelectedCards();
  }, 800);
}


// =======================================================
// 13. Reset selected cards
// This clears firstCard and secondCard.
// =======================================================

function resetSelectedCards() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}


// =======================================================
// 14. Start the timer
// Counts down every second.
// =======================================================

function startTimer() {
  timerInterval = setInterval(function () {
    // Subtract one second
    timeLeft--;

    // Update timer display
    timerDisplay.textContent = timeLeft;

    // If time runs out, player loses
    if (timeLeft <= 0) {
      endGame(false);
    }
  }, 1000);
}


// =======================================================
// 15. Start the game
// =======================================================

function startGame() {
  // Prevent starting again while game is active
  if (gameActive) return;

  // Reset game values
  score = 0;
  matchesFound = 0;
  timeLeft = TIME_LIMIT;
  gameActive = true;

  // Reset selected cards
  firstCard = null;
  secondCard = null;
  lockBoard = false;

  // Update the screen
  scoreDisplay.textContent = score;
  matchesDisplay.textContent = matchesFound;
  timerDisplay.textContent = timeLeft;

  // Create a fresh board
  createBoard();

  // Update buttons
  startButton.disabled = true;
  startButton.textContent = "Game Running...";

  // Show starting message
  showMessage("Game started! Find the matching pairs.", "success");

  // Start countdown timer
  startTimer();
}


// =======================================================
// 16. End the game
// won is true if the player wins, false if player loses.
// =======================================================

function endGame(won) {
  // Stop game activity
  gameActive = false;

  // Stop the timer
  clearInterval(timerInterval);

  // Unlock the start button
  startButton.disabled = false;
  startButton.textContent = "Play Again";

  // If player won
  if (won) {
    showMessage("You matched every pair! Clean water mission complete!", "success");
    launchConfetti();
  }

  // If player lost
  else {
    showMessage("Time is up! Try again and match more pairs.", "danger");
  }
}


// =======================================================
// 17. Reset the game
// =======================================================

function resetGame() {
  // Stop game activity
  gameActive = false;

  // Stop timer
  clearInterval(timerInterval);

  // Reset values
  score = 0;
  matchesFound = 0;
  timeLeft = TIME_LIMIT;

  // Reset selected cards
  firstCard = null;
  secondCard = null;
  lockBoard = false;

  // Update screen
  scoreDisplay.textContent = score;
  matchesDisplay.textContent = matchesFound;
  timerDisplay.textContent = timeLeft;

  // Reset buttons
  startButton.disabled = false;
  startButton.textContent = "Start Game";

  // Create a new face-down board
  createBoard();

  // Show reset message
  showMessage("Game reset. Press Start to begin.", "");
}


// =======================================================
// 18. Confetti celebration
// This creates falling water drops when the player wins.
// =======================================================

function launchConfetti() {
  // Create 30 water drops
  for (let i = 0; i < 30; i++) {
    const confetti = document.createElement("div");

    // Add class for CSS animation
    confetti.className = "confetti";

    // Use a water drop emoji
    confetti.textContent = "💧";

    // Random left position
    confetti.style.left = Math.random() * 100 + "vw";

    // Random delay
    confetti.style.animationDelay = Math.random() * 1 + "s";

    // Add to page
    document.body.appendChild(confetti);

    // Remove after animation finishes
    setTimeout(function () {
      confetti.remove();
    }, 3000);
  }
}


// =======================================================
// 19. Set up page when it first loads
// =======================================================

// Create the board immediately
createBoard();

// Start button starts the game
startButton.addEventListener("click", startGame);

// Reset button resets the game
resetButton.addEventListener("click", resetGame);