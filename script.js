class ColorGame {
  constructor() {
    this.score = 0;
    this.highScore = 0;
    this.timeLeft = 15;
    this.isPlaying = false;
    this.streak = 0;
    this.bestStreak = 0;
    this.totalGuesses = 0;
    this.correctGuesses = 0;
    this.difficulty = "easy";
    this.timer = null;
    this.targetColor = null;

    // Define difficulty settings
    this.difficultySettings = {
      easy: {
        time: 15,
        timeBonus: 3,
        timePenalty: 1,
        colors: [
          "#FF0000",
          "#00FF00",
          "#0000FF",
          "#FFFF00",
          "#FF00FF",
          "#00FFFF",
          "#FFA500",
          "#800080",
          "#008000",
          "#FF69B4",
          "#4B0082",
          "#FF4500",
        ],
      },
      medium: {
        time: 10,
        timeBonus: 2,
        timePenalty: 2,
        colors: [
          "#FF6B6B",
          "#4ECDC4",
          "#45B7D1",
          "#96CEB4",
          "#FFEEAD",
          "#D4A5A5",
          "#9B59B6",
          "#3498DB",
          "#E74C3C",
          "#2ECC71",
          "#F1C40F",
          "#1ABC9C",
        ],
      },
      hard: {
        time: 7,
        timeBonus: 2,
        timePenalty: 3,
        colors: [
          "#264653",
          "#2A9D8F",
          "#E9C46A",
          "#F4A261",
          "#E76F51",
          "#277DA1",
          "#577590",
          "#4D908E",
          "#43AA8B",
          "#90BE6D",
          "#F9C74F",
          "#F8961E",
        ],
      },
    };

    this.initializeElements();
    this.initializeEventListeners();
    this.startNewGame();
  }

  initializeElements() {
    this.colorBox = document.querySelector('[data-testid="colorBox"]');
    this.optionsGrid = document.querySelector('[data-testid="colorOptions"]');
    this.scoreDisplay = document.querySelector('[data-testid="score"]');
    this.highScoreDisplay = document.getElementById("highScore");
    this.timerDisplay = document.getElementById("timer");
    this.statusDisplay = document.querySelector('[data-testid="gameStatus"]');
    this.streakDisplay = document.getElementById("streakDisplay");
    this.streakCount = document.getElementById("streakCount");
    this.gameOverScreen = document.getElementById("gameOverScreen");
    this.difficultySelect = document.getElementById("difficulty");
  }

  initializeEventListeners() {
    document
      .querySelector('[data-testid="newGameButton"]')
      .addEventListener("click", () => {
        this.resetGame();
        this.startNewGame();
      });
    document.getElementById("playAgain").addEventListener("click", () => {
      this.resetGame();
      this.startNewGame();
    });
    this.difficultySelect.addEventListener("change", (e) => {
      this.difficulty = e.target.value;
      this.resetGame();
      this.startNewGame();
    });
  }

  startNewGame() {
    this.isPlaying = true;
    this.generateNewRound();
    this.startTimer();
  }

  generateNewRound() {
    // Generate target color
    this.targetColor = this.getRandomColor();
    this.colorBox.style.backgroundColor = this.targetColor;

    // Generate options
    let options = [this.targetColor];
    while (options.length < 6) {
      const newColor = this.getRandomColor();
      if (!options.includes(newColor)) {
        options.push(newColor);
      }
    }

    // Shuffle options
    options = options.sort(() => Math.random() - 0.5);

    // Clear existing options
    this.optionsGrid.innerHTML = "";

    // Create new option buttons
    options.forEach((color) => {
      const button = document.createElement("button");
      button.className = "color-option";
      button.style.backgroundColor = color;
      button.setAttribute("data-testid", "colorOption");
      button.addEventListener("click", () => this.handleGuess(color));
      this.optionsGrid.appendChild(button);
    });
  }

  startTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.timer = setInterval(() => {
      this.timeLeft--;
      this.timerDisplay.textContent = `${this.timeLeft}s`;

      if (this.timeLeft <= 0) {
        this.gameOver();
      }
    }, 1000);
  }

  gameOver() {
    this.isPlaying = false;
    clearInterval(this.timer);
    this.timer = null;

    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.highScoreDisplay.textContent = this.highScore;
    }

    // Update game over screen
    document.getElementById("finalScore").textContent = this.score;
    document.getElementById("finalHighScore").textContent = this.highScore;
    document.getElementById("accuracy").textContent = `${Math.round(
      (this.correctGuesses / this.totalGuesses) * 100 || 0
    )}%`;
    document.getElementById("bestStreak").textContent = this.bestStreak;

    this.gameOverScreen.classList.add("show");
  }

  getRandomColor() {
    const colors = this.colors[this.difficulty];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  resetGame() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    const settings = this.difficultySettings[this.difficulty];
    this.timeLeft = settings.time;
    this.score = 0;
    this.streak = 0;
    this.totalGuesses = 0;
    this.correctGuesses = 0;
    this.isPlaying = false;

    this.scoreDisplay.textContent = "0";
    this.timerDisplay.textContent = `${this.timeLeft}s`;
    this.streakDisplay.style.display = "none";
    this.statusDisplay.className = "status";
    this.gameOverScreen.classList.remove("show");
    this.statusDisplay.textContent = "";

    // Update difficulty display
    const difficultyInfo = document.createElement("div");
    difficultyInfo.className = "status show success";
    difficultyInfo.textContent = `${this.difficulty.toUpperCase()} MODE - Time: ${
      settings.time
    }s, Bonus: +${settings.timeBonus}s, Penalty: -${settings.timePenalty}s`;
    this.statusDisplay.replaceWith(difficultyInfo);
    this.statusDisplay = difficultyInfo;

    setTimeout(() => {
      this.statusDisplay.className = "status";
    }, 2000);
  }

  handleGuess(color) {
    if (!this.isPlaying) return;

    const settings = this.difficultySettings[this.difficulty];
    this.totalGuesses++;
    const isCorrect = color === this.targetColor;

    if (isCorrect) {
      this.correctGuesses++;
      this.score++;
      this.scoreDisplay.textContent = this.score;
      this.timeLeft = Math.min(
        this.timeLeft + settings.timeBonus,
        settings.time
      );
      this.updateStreak(true);
    } else {
      this.timeLeft = Math.max(this.timeLeft - settings.timePenalty, 0);
      this.updateStreak(false);
    }

    this.showStatus(isCorrect);

    setTimeout(() => {
      if (this.isPlaying) {
        this.generateNewRound();
      }
    }, 1000);
  }

  showStatus(isCorrect) {
    const settings = this.difficultySettings[this.difficulty];
    this.statusDisplay.textContent = isCorrect
      ? `Amazing! +${settings.timeBonus} seconds bonus!`
      : `Oops! -${settings.timePenalty} seconds penalty!`;
    this.statusDisplay.className = `status show ${
      isCorrect ? "success" : "error"
    }`;
    setTimeout(() => {
      this.statusDisplay.className = "status";
    }, 1500);
  }

  getRandomColor() {
    const colors = this.difficultySettings[this.difficulty].colors;
    return colors[Math.floor(Math.random() * colors.length)];
  }

  updateStreak(isCorrect) {
    if (isCorrect) {
      this.streak++;
      if (this.streak > this.bestStreak) {
        this.bestStreak = this.streak;
      }
      if (this.streak >= 2) {
        this.streakDisplay.style.display = "block";
        this.streakCount.textContent = this.streak;
        this.createConfetti();
      }
    } else {
      this.streak = 0;
      this.streakDisplay.style.display = "none";
    }
  }

  showStatus(isCorrect) {
    this.statusDisplay.textContent = isCorrect
      ? "Amazing! +2 seconds bonus!"
      : "Oops! -2 seconds penalty!";
    this.statusDisplay.className = `status show ${
      isCorrect ? "success" : "error"
    }`;
    setTimeout(() => {
      this.statusDisplay.className = "status";
    }, 1500);
  }

  createConfetti() {
    for (let i = 0; i < 20; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti";
      confetti.style.left = Math.random() * 100 + "vw";
      confetti.style.backgroundColor = this.getRandomColor();
      confetti.style.animationDelay = Math.random() * 2 + "s";
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 2000);
    }
  }
}

// Initialize game
window.addEventListener("DOMContentLoaded", () => {
  new ColorGame();
});
