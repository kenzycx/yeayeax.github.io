sessionStorage.removeItem("solvedWords");

const inputs = document.querySelector(".inputs");
const hintTag = document.querySelector(".hint span");
const guessLeft = document.querySelector(".guess-left span");
const wrongLetter = document.querySelector(".wrong-letter span");
const typingInput = document.querySelector(".typing-input");
const popupBox = document.querySelector(".popup-box");
const playNextBtn = document.querySelector(".play-next-btn");
const popupText = document.querySelector(".popup-content h2");

const errorAud = new Audio("sounds/laugh.mp3");
errorAud.preload = "auto";
const byeAud = new Audio("sounds/bye-bye.mp3");
byeAud.preload = "auto";

document.addEventListener("click", () => {
    errorAud.load();
    byeAud.load();
}, { once: true });

let word, maxGuesses, incorrectLetters = [];
const complimentsMaster = ["zo pro"];
let complimentsUsed = [];

function getSolvedWords() {
    const stored = sessionStorage.getItem("solvedWords");
    return stored ? JSON.parse(stored) : [];
}

function saveSolvedWord(wordToSave) {
    const solved = getSolvedWords();
    if (!solved.includes(wordToSave)) {
        solved.push(wordToSave);
        sessionStorage.setItem("solvedWords", JSON.stringify(solved));
    }
}

function getCompliment() {
    if (complimentsUsed.length === complimentsMaster.length) {
        complimentsUsed = [];
    }
    let remaining = complimentsMaster.filter(c => !complimentsUsed.includes(c));
    let choice = remaining[Math.floor(Math.random() * remaining.length)];
    complimentsUsed.push(choice);
    return choice;
}

function showPopup(text, buttonText, buttonHandler) {
    popupText.innerText = text;
    playNextBtn.innerText = buttonText;
    playNextBtn.onclick = () => {
        setTimeout(() => hidePopup(), 150);
        sessionStorage.removeItem("solvedWords");
        complimentsUsed = [];
        resetGame();
        buttonHandler();
    };
    popupBox.classList.add("show");
}

function hidePopup() {
    popupBox.classList.remove("show");
}

function resetGame() {
    incorrectLetters = [];
    maxGuesses = 0;
    inputs.innerHTML = "";
    typingInput.value = "";
    wrongLetter.innerText = "";
    guessLeft.innerText = "";
}

function randomWord() {
    const solvedWords = getSolvedWords();
    const availableWords = wordList.filter(item => !solvedWords.includes(item.word));

    if (availableWords.length === 0 && solvedWords.length > 0) {
        showPopup("zo pro", "Next Word", () => {
            sessionStorage.removeItem("solvedWords");
            complimentsUsed = [];
            resetGame();
            byeAud.currentTime = 0;
            const playPromise = byeAud.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    byeAud.onended = () => window.location.href = "different.html";
                }).catch(() => {
                    window.location.href = "different.html";
                });
            } else {
                window.location.href = "different.html";
            }
        });
        return;
    }

    let ranItem = availableWords[Math.floor(Math.random() * availableWords.length)];
    word = ranItem.word;
    maxGuesses = word.length >= 5 ? 8 : 6;
    incorrectLetters = [];

    hintTag.innerText = ranItem.hint;
    guessLeft.innerText = maxGuesses;
    wrongLetter.innerText = "";

    let html = "";
    for (let i = 0; i < word.length; i++) {
        html += `<input type="text" disabled>`;
    }
    inputs.innerHTML = html;

    hidePopup();
}

randomWord();

function checkWin() {
    return [...inputs.querySelectorAll("input")].every(i => i.value !== "");
}

function initGame(e) {
    let key = e.target.value.toLowerCase();
    if (!key.match(/^[A-Za-z]+$/)) return;
    typingInput.value = "";

    if (incorrectLetters.includes(key)) return;

    if (word.includes(key)) {
        for (let i = 0; i < word.length; i++) {
            if (word[i] === key) {
                inputs.querySelectorAll("input")[i].value = key;
            }
        }
    } else {
        maxGuesses--;
        incorrectLetters.push(key);
        wrongLetter.innerText = incorrectLetters.join(" ");
        guessLeft.innerText = maxGuesses;
        errorAud.currentTime = 0;
        errorAud.play().catch(() => {});
    }

    if (checkWin()) {
        saveSolvedWord(word);

        const solvedWords = getSolvedWords();
        const availableWords = wordList.filter(item => !solvedWords.includes(item.word));

        if (availableWords.length === 0) {
            showPopup("zo pro", "Next Word", () => {
                resetGame();
                byeAud.currentTime = 0;
                const playPromise = byeAud.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        byeAud.onended = () => window.location.href = "different.html";
                    }).catch(() => {
                        window.location.href = "different.html";
                    });
                } else {
                    window.location.href = "different.html";
                }
            });
        } else {
            showPopup(getCompliment(), "Next", () => {
                resetGame();
                randomWord();
            });
        }
    }

    if (maxGuesses < 1) {
        errorAud.currentTime = 0;
        errorAud.play().catch(() => {});
        showPopup("gg bro bawi next g", "Try Again", () => {
            resetGame();
            randomWord();
        });

        for (let i = 0; i < word.length; i++) {
            inputs.querySelectorAll("input")[i].value = word[i];
        }
    }

    guessLeft.innerText = maxGuesses;
}

typingInput.addEventListener("input", initGame);
inputs.addEventListener("click", () => typingInput.focus());
document.addEventListener("keydown", () => typingInput.focus());
