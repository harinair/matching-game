
/**
 * Class Card handles all card related actions.
 */
class Card {
  /**
   * Constructor - creates a card for the given type
   * @param type the type of the card
   */
  constructor(type) {
    this.type = type;
  }

  /**
   * Generates the HTML to render this card.
   * @return {string} the HTML to render this card
   */
  toHtml() {
    return '<li class="card"><i class="fa fa-' + this.type + '"></i></li>';
  }

  /**
   * Checks if this card is of same type as another card. Returns true if
   * both the cards are of same type; otherwise returns false.
   *
   * @param card the card to compare this card to
   * @return {boolean} true if both are of same type
   */
  isEqual(card) {
    return this.type === card.type;
  }

  /**
   * Locks the card if jQuery DOM Element ref is available. Otherwise does nothing.
   */
  lock() {
    this.elem && this.elem.addClass('match').removeClass('open show');
  }

  /**
   * Hides the card if jQuery DOM ref is available. Otherwise does nothing.
   */
  hide() {
    setTimeout(() => {
      this.elem && this.elem.removeClass('open show');
    }, 800);
  }

  /**
   * Shows the card if jQuery DOM ref is available. Otherwise does nothing.
   */
  show() {
    setTimeout(() => {
      this.elem && this.elem.addClass('open show');
    }, 50);
  }

  /**
   * Creates a Card object for the jQuery DOM Element reference
   * @param cardElem the jQuery DOM Element reference
   * @return {Card} the card for the DOM element
   */
  static fromElem(cardElem) {
    const card = new Card(Card.determineType(cardElem));
    card.elem = cardElem;
    return card;
  }

  /**
   * Determines the type of the card for the given card jQuery DOM Element
   * @param cardElem the jQuery DOM Element
   * @return {string} the type of the card
   */
  static determineType(cardElem) {
    const className = cardElem.children().attr('class');
    return className.substr(6);
  }
}

/**
 * A deck contains methods to manipulate the deck. Deck in this game contains 16 cards, two of each type.
 */
class Deck {
  /**
   * Constructor - creates the deck and initializes with all 16 cards
   */
  constructor(cardTypes) {
    this.cardTypeCount = cardTypes.length;
    this.cards = [];
    cardTypes.forEach((cardType) => {
      this.cards.push(new Card(cardType));
      this.cards.push(new Card(cardType));
    })
  }

  /**
   * Gets the card type count
   */
  getCardTypeCount() {
    return this.cardTypeCount;
  }

  /**
   * Shuffles the deck
   */
  shuffle() {
    let currentIndex = this.cards.length, temporaryValue, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = this.cards[currentIndex];
      this.cards[currentIndex] = this.cards[randomIndex];
      this.cards[randomIndex] = temporaryValue;
    }
  }

  /**
   * Displays the deck in the page. First it will empty the content in the deck location in the page.
   */
  display() {
    this.shuffle();
    const deckElem = $('.deck');
    deckElem.empty();
    this.cards.forEach((card) => {
      deckElem.append(card.toHtml())
    })
  }
}

/**
 * A Class to handle the scoreboard of the game.
 */
class Scoreboard {
  /**
   * Creates the scoreboard.
   */
  constructor() {
    this.moves = 0;
    this.stars = 3;
    this.timeTaken = 0;
    this.timerId = null;
    this.finalScoreModal = $('#myModal');
  }

  /**
   * Marks the start of the game.
   */
  start() {
    if (this.timerId == null) {
      const startTime = Date.now();
      this.timerId = setInterval(() => {
        this.timeTaken = Math.floor((Date.now() - startTime) / 1000);
        this.updateTimeTaken();
      }, 1000);
    }
  }

  /**
   * Resets the score for starting a new game.
   */
  reset() {
    this.timerId && clearInterval(this.timerId);
    this.moves = 0;
    this.timerId = null;
    this.timeTaken = 0;
    this.stars = 0;
    this.updateScore();
    this.updateTimeTaken();
  }

  /**
   * Increments the move and update the score.
   */
  incrementMoves() {
    this.moves += 1;
    this.updateScore();
  }

  /**
   * Show final scores modal.
   */
  showFinalScores() {
    // stop timer
    this.timerId && clearInterval(this.timerId);
    this.timerId = null;
    this.finalScoreModal.toggle();
  }

  /**
   * Close the score modal.
   */
  closeFinalScores() {
    this.finalScoreModal.toggle();
  }

  /**
   * Update the scores in the page and hidden modal.
   */
  updateScore() {
    let newVal = 3;
    if (this.moves < 15) {
      newVal = 3;
    } else if (this.moves < 25) {
      newVal = 2;
    } else {
      newVal = 1;
    }
    if (this.stars !== newVal) {
      const starsElem = $('.stars');
      starsElem.empty();
      for (let i = 0 ; i < newVal; i++) {
        starsElem.append('<li><i class="fa fa-star"></i></li>');
      }
      this.stars = newVal;
    }
    $('.moves').text(this.moves);
  }

  /**
   * Updates the time taken in the page & modal.
   */
  updateTimeTaken() {
    $('.timeTaken').text(this.timeTaken);
  }

}

/**
 * The class to handle the Matching Game.
 */
class Game {
  /**
   * Creates the game with the give deck.
   * @param deck the deck to use.
   */
  constructor(deck) {
    this.deck = deck;
    this.matches = 0;
    this.scoreboard = new Scoreboard();
    this.openCards = [];

    // register the event handlers
    $('.close').on('click', this.handleScoreModalClose.bind(this));
    $('#noButton').on('click', this.handleScoreModalClose.bind(this));
    $('#yesButton').on('click', this.handlePlayAgain.bind(this));
  }

  start() {
    this.deck.display();
    $('.card').on('click', this.handleCardClick.bind(this));
    $('.restart').on('click', this.handleRestart.bind(this));
  }

  finish() {
    this.scoreboard.showFinalScores();
  }

  openCard(cardElem) {
    const card = Card.fromElem(cardElem);
    card.show();
    this.openCards.push(card);
  }

  isMatched() {
    return this.openCards.length > 1 && this.openCards[0].isEqual(this.openCards[1]);
  }

  lockMatched() {
    this.matches += 1;
    $('.card').off('click');
    this.openCards[0].lock();
    this.openCards[1].lock();
    $('.card').not('.match').on('click', this.handleCardClick.bind(this));
    if (this.matches >= this.deck.getCardTypeCount()) {
      this.finish();
    }
  }

  hideUnmatched() {
    (this.openCards.length > 1) && this.openCards.forEach(card => card.hide());
  }

  handleScoreModalClose() {
    this.scoreboard.closeFinalScores();
  }

  handlePlayAgain() {
    this.scoreboard.closeFinalScores();
    this.handleRestart();
  }

  handleCardClick(event) {
    const cardElem = $(event.target);
    if (cardElem.hasClass('open')) {
      // ignore - this is a open card
      return;
    }
    this.scoreboard.start();
    this.openCard(cardElem);
    if (this.openCards.length > 1) {
      if (this.isMatched()) {
        this.lockMatched();
      } else {
        this.hideUnmatched();
      }
      this.openCards = [];
      this.scoreboard.incrementMoves();
    }
  }

  handleRestart() {
    $('.card').off('click');
    this.scoreboard.reset();
    this.matches = 0;
    this.openCards = [];
    this.deck.display();
    $('.card').on('click', this.handleCardClick.bind(this));
  }
}

/*
 * Display the cards on the page
 *   - shuffle the list of cards using the provided "shuffle" method below
 *   - loop through each card and create its HTML
 *   - add each card's HTML to the page
 */

// Shuffle function from http://stackoverflow.com/a/2450976
// moved inside the deck

/*
 * set up the event listener for a card. If a card is clicked:
 *  - display the card's symbol (put this functionality in another function that you call from this one)
 *  - add the card to a *list* of "open" cards (put this functionality in another function that you call from this one)
 *  - if the list already has another card, check to see if the two cards match
 *    + if the cards do match, lock the cards in the open position (put this functionality in another function that you call from this one)
 *    + if the cards do not match, remove the cards from the list and hide the card's symbol (put this functionality in another function that you call from this one)
 *    + increment the move counter and display it on the page (put this functionality in another function that you call from this one)
 *    + if all cards have matched, display a message with the final score (put this functionality in another function that you call from this one)
 */

function main() {
  /**
   * Create a list that holds all of your unique card types
   */
  const cardTypes = [
    'anchor',
    'bicycle',
    'bolt',
    'bomb',
    'cube',
    'diamond',
    'leaf',
    'paper-plane'
  ];
  // create the game
  const game = new Game(new Deck(cardTypes));
  // now start it
  game.start();
}

main();

