//Globals
let numPairs = 6; //Number of cards = numPairs * 2
let matchedPairs = 0;
let cardColors = [];
let cardDeck = [];
let lastClickedCardID = null;
let lastClickedCardPairID = null;
let ignoreClicks = false;
let currentScore = 0;


//Helper Functions
function buildGameDeck(timesToShuffle = 2) {
    //Build the compelte game deck and shuffly it
    buildColorCodes(numPairs);
    buildCardDeck(cardDeck);
    for (let i = 0; i < timesToShuffle; i++) {
        shuffleDeck(cardDeck);
    }
}
function buildColorCodes(amountOfCodesToMake = 6) {
    amountOfCodesToMake--;  //subtract one so it'll work in the loop below
    for (let i = 0; i <= amountOfCodesToMake; i++) {
        let r = Math.floor(Math.random() * 256); //Using floor will exclude 255 so we add one and use 256
        let g = Math.floor(Math.random() * 256);
        let b = Math.floor(Math.random() * 256);
        cardColors.push(`rgb(${r},${g},${b})`);
    }
}
function buildCardDeck() {
    let cardID = 0;
    let pairID = 0;
    cardColors.forEach(function(color) {
        cardDeck.push(
            {
                "cardColor": color,
                "cardID": cardID,
                "cardPairID": pairID
            }
        )
        cardID++;
        cardDeck.push(
            {
                "cardColor": color,
                "cardID": cardID,
                "cardPairID": pairID
            }
        )
        cardID++;
        pairID++;
    })
}
function shuffleDeck(deckOfCards) {
    for(let i = deckOfCards.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * i)
        const temp = deckOfCards[i]
        deckOfCards[i] = deckOfCards[j]
        deckOfCards[j] = temp
    }
}
function coverCards(cardOneID, cardTwoID) {
    document.querySelector(`div[data--i-d="${cardOneID}"]`).style.backgroundColor = "black";
    document.querySelector(`div[data--i-d="${cardTwoID}"]`).style.backgroundColor = "black";
    ignoreClicks = false;
}
function markCardsMatched(cardOneID, cardTwoID) {
    document.querySelector(`div[data--i-d="${cardOneID}"]`).dataset.pairMatched = "true";
    document.querySelector(`div[data--i-d="${cardTwoID}"]`).dataset.pairMatched = "true";
}
function updateCurrentScore() {
    document.querySelector("#currentScore").innerHTML = `Current Score: ${currentScore}`;
}
function updateBestScore() {
    storedScore = localStorage.bestScore;
    if (storedScore === undefined) {
        //New high score
        localStorage.bestScore = currentScore;
    }
    else if (currentScore < storedScore) {
        localStorage.bestScore = currentScore;
    }
}
function displayBestScore() {
    scoreElement = document.querySelector("#bestScore");
    storedScore = localStorage.bestScore;

    if (storedScore === undefined) {
        scoreElement.innerHTML = "No Best Score Yet";
    }
    else {
        scoreElement.innerHTML = `Best Score: ${storedScore}`;
    }
}
function dealCards() {     
    let gameArea = document.querySelector("#gameArea");
    cardDeck.forEach(function(card){
        let newCard = document.createElement("div");
        newCard.dataset.color = card.cardColor;
        newCard.dataset.ID = card.cardID;
        newCard.dataset.pairID = card.cardPairID;
        newCard.dataset.pairMatched = "false";
        newCard.classList.add("gameCard");
        newCard.style.backgroundColor = "black";
        gameArea.appendChild(newCard);
    });
}
function clearCards() {
    let gameCards = document.querySelectorAll(".gameCard");
    gameCards.forEach(function(card){
        card.remove();
    });
}
function startNewGame() {
    //Reset values so we can play again if we like
    matchedPairs = 0;
    cardColors = [];
    cardDeck = []
    currentScore = 0;

    //Clear game won message
    // document.querySelector("#gameStatus").innerHTML = "";

    //Update score displays
    updateCurrentScore();
    displayBestScore();
    checkIfGameWon();

    //Build the game deck
    buildGameDeck();

    //Clear the cards before we deal new ones
    clearCards();

    //Deal the cards
    dealCards();

    
    
}
function checkIfGameWon() {
    if (matchedPairs === numPairs) {
        //game is over
        document.querySelector("#gameStatus").innerText = "You Won!!";

        //Best Score Logic
        updateBestScore();
        displayBestScore();
    }
    else {
        document.querySelector("#gameStatus").innerHTML = "";
    }
}
//Event Listeners
document.addEventListener("DOMContentLoaded", function() {
    startNewGame();
});
document.querySelector("#newGameBtn").addEventListener("click", function(e) {
    startNewGame();
})
document.querySelector("#gameArea").addEventListener("click", function(e) {
    //If we need to ignore clicks simply return
    if (ignoreClicks) {  //ignoreClicks is reset in coverCards()
        return;
    }
    //First check if the use is clicking on an already matched card
    if (e.target.dataset.pairMatched === "false") {
        //Determine if this is the first of the two cards
        if (lastClickedCardID === null) {
            lastClickedCardID = e.target.dataset.ID;
            lastClickedCardPairID = e.target.dataset.pairID;
            e.target.style.backgroundColor = e.target.dataset.color;
        }
        else {
            //Make sure we're not just clicking the same square over and over
            if (e.target.dataset.ID !== lastClickedCardID) {
                e.target.style.backgroundColor = e.target.dataset.color;
                if (lastClickedCardPairID === e.target.dataset.pairID) {
                    //Found a match
                    markCardsMatched(e.target.dataset.ID, lastClickedCardID);
                    matchedPairs++;
                    lastClickedCardPairID = null;
                    lastClickedCardID = null;
                }
                else {
                    //No match, null out lastClicked Values
                    ignoreClicks = true;
                    setTimeout(coverCards, 1000, lastClickedCardID, e.target.dataset.ID);
                    lastClickedCardPairID = null;
                    lastClickedCardID = null;
                }
            }
        }
    }

    //Code below runs on any click that is not ignored
    
    //Update current score
    currentScore++;
    updateCurrentScore();

    //Check if we won
    checkIfGameWon();
});