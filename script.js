// =======================================================
// Water Match - Completed charity: water Memory Game
// This file controls the game logic.
// It handles difficulty, cards, score, timer, matching,
// milestone messages, win/lose states, reset, and confetti.
// =======================================================


// =======================================================
// 1. Game settings
// =======================================================

// There are 8 matching pairs in the game
const TOTAL_MATCHES = 8;

// This controls how long wrong cards stay visible before flipping back.
// Smaller number = faster response.
// 450ms is faster than the old 800ms, but still gives players time to see the cards.
const WRONG_MATCH_DELAY = 450;

// Difficulty settings.
// Each difficulty changes the time limit and wrong-match penalty.
const difficultySettings = {
  easy: {
    label: "Easy",
    timeLimit: 90,
    penalty: 0,
    description: "Easy Mode: 90 seconds and no penalty for wrong matches."
  },

  normal: {
    label: "Normal",
    timeLimit: 60,
    penalty: 1,
    description: "Normal Mode: 60 seconds and -1 point for wrong matches."
  },

  hard: {
    label: "Hard",
    timeLimit: 45,
    penalty: 2,
    description: "Hard Mode: 45 seconds and -2 points for wrong matches."
  }
};

// The game starts on Easy Mode
let currentDifficulty = "easy";


// =======================================================
// 2. Game state variables
// These values change while the game is running.
// =======================================================

// Tracks the player's score
let score = 0;

// Tracks how many pairs the player has matched
let matchesFound = 0;

// Tracks how much time is left
let timeLeft = difficultySettings[currentDifficulty].timeLimit;

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
// 4. Milestone messages
// This is the Project 6 LevelUp.
// The game checks these as the player finds matches.
// =======================================================

const milestoneMessages = [
  {
    matchesNeeded: 2,
    text: "Milestone: 2 pairs matched! Your water mission is underway.",
    shown: false
  },
  {
    matchesNeeded: 4,
    text: "Halfway there! You have matched 4 clean-water pairs.",
    shown: false
  },
  {
    matchesNeeded: 6,
    text: "Almost done! Just a few more matches to complete the mission.",
    shown: false
  },
  {
    matchesNeeded: 8,
    text: "Mission complete! You matched every pair.",
    shown: false
  }
];


// =======================================================
// 5. Grab HTML elements
// These connect JavaScript to the HTML page.
// =======================================================

// Score display
const scoreDisplay = document.getElementById("score");

// Matches display
const matchesDisplay = document.getElementById("matches");

// Timer display
const timerDisplay = document.getElementById("timer");

// Main message display
const messageDisplay = document.getElementById("message");

// Milestone message display
const milestoneDisplay = document.getElementById("milestone-message");

// Start button
const startButton = document.getElementById("start-game");

// Reset button
const resetButton = document.getElementById("reset-game");

// Memory card grid
const memoryGrid = document.getElementById("memory-grid");

// Difficulty description text
const difficultyDescription = document.getElementById("difficulty-description");

// Hint text under the buttons
const hintDisplay = document.getElementById("hint");

// Mission log list
const missionList = document.getElementById("mission-list");

// Difficulty buttons
const difficultyButtons = document.querySelectorAll(".difficulty-btn");


// =======================================================
// 6. Show a message on the page
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
// 7. Add a new mission log item
// This creates a new <li> element and adds it to the page.
// =======================================================

function addMissionLog(text) {
  // Create a new list item
  const newLog = document.createElement("li");

  // Set the text
  newLog.textContent = text;

  // Add the newest message to the top of the list
  missionList.prepend(newLog);

  // Keep the log from getting too long
  if (missionList.children.length > 6) {
    missionList.removeChild(missionList.lastElementChild);
  }
}


// =======================================================
// 8. Reset all milestone messages
// This lets milestones appear again in a new game.
// =======================================================

function resetMilestones() {
  milestoneMessages.forEach(function (milestone) {
    milestone.shown = false;
  });

  milestoneDisplay.textContent = "Match clean-water symbols to complete the mission.";
}


// =======================================================
// 9. Check milestone progress
// Uses the milestoneMessages array and conditionals.
// =======================================================

function checkMilestones() {
  milestoneMessages.forEach(function (milestone) {
    // If the player reached this milestone and it has not shown yet
    if (matchesFound >= milestone.matchesNeeded && milestone.shown === false) {
      // Show milestone text
      milestoneDisplay.textContent = milestone.text;

      // Mark it as shown so it does not repeat
      milestone.shown = true;

      // Add it to the mission log
      addMissionLog(milestone.text);
    }
  });
}


// =======================================================
// 10. Update difficulty information on the screen
// =======================================================

function updateDifficultyDisplay() {
  const settings = difficultySettings[currentDifficulty];

  // Update timer to match selected mode
  timeLeft = settings.timeLimit;
  timerDisplay.textContent = timeLeft;

  // Update description text
  difficultyDescription.textContent = settings.description;

  // Update hint text based on penalty
  if (settings.penalty === 0) {
    hintDisplay.textContent = "Match = +2 points. Wrong match = no penalty on Easy Mode.";
  } else {
    hintDisplay.textContent = "Match = +2 points. Wrong match = -" + settings.penalty + " point(s).";
  }

  // Update selected button style
  difficultyButtons.forEach(function (button) {
    if (button.dataset.difficulty === currentDifficulty) {
      button.classList.add("selected");
    } else {
      button.classList.remove("selected");
    }
  });
}


// =======================================================
// 11. Select difficulty
// This runs when the player clicks Easy, Normal, or Hard.
// =======================================================

function selectDifficulty(difficulty) {
  // Do not allow difficulty changes while the game is active
  if (gameActive) {
    showMessage("Reset the game before changing difficulty.", "danger");
    return;
  }

  // Change current difficulty
  currentDifficulty = difficulty;

  // Update the screen
  updateDifficultyDisplay();

  // Add to mission log
  addMissionLog("Difficulty selected: " + difficultySettings[currentDifficulty].label + " Mode.");
}


// =======================================================
// 12. Shuffle cards
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
// 13. Create the card HTML
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
// 14. Create the board
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
// 15. Flip a card
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

  // Flip the card visually right away
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
// 16. Check for a match
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
// 17. Handle a correct match
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

  // Show feedback immediately
  showMessage("Match found! Clean water progress grows.", "success");

  // Add a new DOM item to the mission log
  addMissionLog("Matched a clean-water pair. Score is now " + score + ".");

  // Check milestone messages
  checkMilestones();

  // Reset selected cards
  resetSelectedCards();

  // Check if the player matched all pairs
  if (matchesFound === TOTAL_MATCHES) {
    endGame(true);
  }
}


// =======================================================
// 18. Handle a wrong match
// This is a challenge feature: wrong match can reduce score.
// =======================================================

function handleWrongMatch() {
  // Get the current difficulty settings
  const settings = difficultySettings[currentDifficulty];

  // Subtract points based on difficulty, but do not go below 0
  score = Math.max(0, score - settings.penalty);

  // Update score on the screen immediately
  scoreDisplay.textContent = score;

  // Create the right feedback message
  if (settings.penalty === 0) {
    showMessage("Not a match. No penalty on Easy Mode.", "danger");
    addMissionLog("Wrong match, but Easy Mode has no penalty.");
  } else {
    showMessage("Not a match. Try again! -" + settings.penalty + " point(s).", "danger");
    addMissionLog("Wrong match. Lost " + settings.penalty + " point(s).");
  }

  // Wait briefly before flipping the cards back.
  // This is shorter than before, so the game feels faster.
  setTimeout(function () {
    firstCard.classList.remove("flipped");
    secondCard.classList.remove("flipped");

    // Reset selected cards after they flip back
    resetSelectedCards();
  }, WRONG_MATCH_DELAY);
}


// =======================================================
// 19. Reset selected cards
// This clears firstCard and secondCard.
// =======================================================

function resetSelectedCards() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}


// =======================================================
// 20. Start the timer
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
// 21. Start the game
// =======================================================

function startGame() {
  // Prevent starting again while game is active
  if (gameActive) return;

  // Get selected difficulty settings
  const settings = difficultySettings[currentDifficulty];

  // Reset game values
  score = 0;
  matchesFound = 0;
  timeLeft = settings.timeLimit;
  gameActive = true;

  // Reset selected cards
  firstCard = null;
  secondCard = null;
  lockBoard = false;

  // Reset milestone messages
  resetMilestones();

  // Update the screen
  scoreDisplay.textContent = score;
  matchesDisplay.textContent = matchesFound;
  timerDisplay.textContent = timeLeft;

  // Clear mission log and add starting message
  missionList.innerHTML = "";
  addMissionLog("Game started on " + settings.label + " Mode.");

  // Create a fresh board
  createBoard();

  // Update buttons
  startButton.disabled = true;
  startButton.textContent = "Game Running...";

  // Disable difficulty buttons while playing
  difficultyButtons.forEach(function (button) {
    button.disabled = true;
  });

  // Show starting message
  showMessage("Game started! Find the matching pairs.", "success");

  // Start countdown timer
  startTimer();
}


// =======================================================
// 22. End the game
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

  // Re-enable difficulty buttons
  difficultyButtons.forEach(function (button) {
    button.disabled = false;
  });

  // If player won
  if (won) {
    showMessage("You matched every pair! Clean water mission complete!", "success");
    milestoneDisplay.textContent = "You completed the full Water Match mission.";
    addMissionLog("Win! All pairs matched with a final score of " + score + ".");
    launchConfetti();
  }

  // If player lost
  else {
    showMessage("Time is up! Try again and match more pairs.", "danger");
    milestoneDisplay.textContent = "The mission is not over. Reset and try again.";
    addMissionLog("Time ran out. Final score: " + score + ".");
  }
}


// =======================================================
// 23. Reset the game
// =======================================================

function resetGame() {
  // Stop game activity
  gameActive = false;

  // Stop timer
  clearInterval(timerInterval);

  // Get selected difficulty settings
  const settings = difficultySettings[currentDifficulty];

  // Reset values
  score = 0;
  matchesFound = 0;
  timeLeft = settings.timeLimit;

  // Reset selected cards
  firstCard = null;
  secondCard = null;
  lockBoard = false;

  // Reset milestone messages
  resetMilestones();

  // Update screen
  scoreDisplay.textContent = score;
  matchesDisplay.textContent = matchesFound;
  timerDisplay.textContent = timeLeft;

  // Reset buttons
  startButton.disabled = false;
  startButton.textContent = "Start Game";

  // Re-enable difficulty buttons
  difficultyButtons.forEach(function (button) {
    button.disabled = false;
  });

  // Create a new face-down board
  createBoard();

  // Reset mission log
  missionList.innerHTML = "";
  addMissionLog("Game reset. Current mode: " + settings.label + ".");

  // Show reset message
  showMessage("Game reset. Press Start to begin.", "");
}


// =======================================================
// 24. Confetti celebration
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
// 25. Set up page when it first loads
// =======================================================

// Create the board immediately
createBoard();

// Show the default difficulty information
updateDifficultyDisplay();

// Start button starts the game
startButton.addEventListener("click", startGame);

// Reset button resets the game
resetButton.addEventListener("click", resetGame);

// Difficulty buttons change the mode
difficultyButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    selectDifficulty(button.dataset.difficulty);
  });
});