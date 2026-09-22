// ===============================
// Chinese Learning Website
// ===============================

// Files that currently exist
const vocabularyLetters = ["a", "b", "c", "d", "e", "f", "g"];
const paragraphLetters = ["a", "b", "c", "d", "e", "f", "g"];

let vocabulary = [];
let paragraphs = [];

let currentLetter = "all";
let currentWords = [];
let currentWordIndex = 0;
let currentParagraphIndex = 0;


// ===============================
// LOAD JSON
// ===============================

async function loadJSON(file) {
    const response = await fetch(file, {
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error(`${file} → HTTP ${response.status}`);
    }

    const text = await response.text();

    if (!text.trim()) {
        throw new Error(`${file} is empty`);
    }

    try {
        const data = JSON.parse(text);

        if (!Array.isArray(data)) {
            throw new Error("JSON must contain an array");
        }

        return data;

    } catch (error) {
        throw new Error(
            `${file} → Invalid JSON: ${error.message}`
        );
    }
}


// ===============================
// LOAD VOCABULARY
// ===============================

async function loadVocabulary() {

    vocabulary = [];

    for (const letter of vocabularyLetters) {

        const file = `./words/${letter}.json`;

        try {

            const data = await loadJSON(file);

            data.forEach(word => {

                vocabulary.push({
                    ...word,
                    letter: letter.toUpperCase()
                });

            });

        } catch (error) {

            console.error(error);
        }
    }

    console.log(
        `Vocabulary loaded: ${vocabulary.length} words`
    );

    setupAlphabet();

    displayWords(vocabulary);

    updateStatistics();
}


// ===============================
// LOAD PARAGRAPHS
// ===============================

async function loadParagraphs() {

    paragraphs = [];

    for (const letter of paragraphLetters) {

        const file =
            `./paragraph/paragraph_${letter}.json`;

        try {

            const data = await loadJSON(file);

            data.forEach(paragraph => {

                paragraphs.push({
                    ...paragraph,
                    letter: letter.toUpperCase()
                });

            });

        } catch (error) {

            console.error(error);
        }
    }

    console.log(
        `Paragraphs loaded: ${paragraphs.length}`
    );

    if (paragraphs.length > 0) {
        showParagraph(0);
    }

    updateStatistics();
}


// ===============================
// ALPHABET
// ===============================

function setupAlphabet() {

    const alphabetList =
        document.getElementById("alphabet-list");

    if (!alphabetList) return;

    alphabetList.innerHTML = "";

    const allButton =
        document.querySelector(
            '[data-letter="all"]'
        );

    if (allButton) {
        allButton.classList.add("active");
    }

    const alphabet =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    alphabet.forEach(letter => {

        const button =
            document.createElement("button");

        button.className = "alphabet-btn";

        button.textContent = letter;

        button.dataset.letter =
            letter.toLowerCase();

        // Disable letters that don't have JSON yet
        if (
            !vocabularyLetters.includes(
                letter.toLowerCase()
            )
        ) {
            button.disabled = true;
            button.classList.add("disabled");
        }

        alphabetList.appendChild(button);
    });
}


// ===============================
// ALPHABET CLICK
// ===============================

document.addEventListener("click", event => {

    const button =
        event.target.closest(".alphabet-btn");

    if (!button) return;

    if (button.disabled) return;

    document
        .querySelectorAll(".alphabet-btn")
        .forEach(btn => {
            btn.classList.remove("active");
        });

    button.classList.add("active");

    const letter =
        button.dataset.letter;

    currentLetter = letter;

    if (letter === "all") {

        displayWords(vocabulary);

    } else {

        const filtered =
            vocabulary.filter(word =>
                word.letter.toLowerCase() === letter
            );

        displayWords(filtered);
    }
});


// ===============================
// DISPLAY WORDS
// ===============================

function displayWords(words) {

    const wordList =
        document.getElementById("word-list");

    if (!wordList) return;

    wordList.innerHTML = "";

    currentWords = words;

    if (words.length === 0) {

        wordList.innerHTML = `
            <div class="empty-state">
                No vocabulary found.
            </div>
        `;

        return;
    }

    words.forEach(word => {

        const card =
            document.createElement("div");

        card.className = "word-card";

        card.innerHTML = `
            <div class="word-card-main">

                <h3>
                    ${escapeHTML(word.words)}
                </h3>

                <p class="word-pinyin">
                    ${escapeHTML(word.Pinyin)}
                </p>

                <p class="word-meaning">
                    ${escapeHTML(word.Meaning)}
                </p>

            </div>

            <div class="word-card-arrow">
                →
            </div>
        `;

        card.addEventListener("click", () => {
            showWord(word);
        });

        wordList.appendChild(card);
    });
}


// ===============================
// SHOW WORD
// ===============================

function showWord(word) {

    const wordTitle =
        document.getElementById("word-title");

    const wordPinyin =
        document.getElementById("word-pinyin");

    const wordMeaning =
        document.getElementById("word-meaning");

    const wordSentence =
        document.getElementById("word-sentence");

    if (wordTitle) {
        wordTitle.textContent =
            word.words;
    }

    if (wordPinyin) {
        wordPinyin.textContent =
            word.Pinyin;
    }

    if (wordMeaning) {
        wordMeaning.textContent =
            word.Meaning;
    }

    if (wordSentence) {
        wordSentence.textContent =
            word.Sentences;
    }

    const detail =
        document.getElementById("word-detail");

    if (detail) {
        detail.classList.remove("hidden");
    }

    // Prepare flashcard
    const index =
        currentWords.findIndex(
            item => item.id === word.id
        );

    if (index !== -1) {
        showFlashcard(index);
    }
}


// ===============================
// SEARCH
// ===============================

const searchInput =
    document.getElementById("search-input");

if (searchInput) {

    searchInput.addEventListener(
        "input",
        () => {

            const query =
                searchInput.value
                    .trim()
                    .toLowerCase();

            let wordsToSearch;

            if (currentLetter === "all") {

                wordsToSearch =
                    vocabulary;

            } else {

                wordsToSearch =
                    vocabulary.filter(word =>
                        word.letter.toLowerCase()
                        === currentLetter
                    );
            }

            if (!query) {

                displayWords(wordsToSearch);

                return;
            }

            const results =
                wordsToSearch.filter(word => {

                    return (

                        String(word.words)
                            .toLowerCase()
                            .includes(query)

                        ||

                        String(word.Pinyin)
                            .toLowerCase()
                            .includes(query)

                        ||

                        String(word.Meaning)
                            .toLowerCase()
                            .includes(query)

                    );
                });

            displayWords(results);
        }
    );
}


// ===============================
// FLASHCARD
// ===============================

function showFlashcard(index = 0) {

    if (!currentWords.length) return;

    currentWordIndex = index;

    const word =
        currentWords[currentWordIndex];

    const flashcardWord =
        document.getElementById(
            "flashcard-word"
        );

    const flashcardPinyin =
        document.getElementById(
            "flashcard-pinyin"
        );

    const flashcardMeaning =
        document.getElementById(
            "flashcard-meaning"
        );

    const flashcardSentence =
        document.getElementById(
            "flashcard-sentence"
        );

    if (flashcardWord) {
        flashcardWord.textContent =
            word.words;
    }

    if (flashcardPinyin) {
        flashcardPinyin.textContent =
            word.Pinyin;
    }

    if (flashcardMeaning) {
        flashcardMeaning.textContent =
            word.Meaning;
    }

    if (flashcardSentence) {
        flashcardSentence.textContent =
            word.Sentences;
    }

    const flashcard =
        document.getElementById("flashcard");

    if (flashcard) {
        flashcard.classList.remove("flipped");
    }
}


// ===============================
// FLASHCARD FLIP
// ===============================

const flashcard =
    document.getElementById("flashcard");

if (flashcard) {

    flashcard.addEventListener(
        "click",
        () => {

            flashcard.classList.toggle(
                "flipped"
            );

        }
    );
}


// ===============================
// NEXT WORD
// ===============================

const nextWord =
    document.getElementById("next-word");

if (nextWord) {

    nextWord.addEventListener(
        "click",
        () => {

            if (!currentWords.length) return;

            currentWordIndex++;

            if (
                currentWordIndex >=
                currentWords.length
            ) {
                currentWordIndex = 0;
            }

            showFlashcard(
                currentWordIndex
            );
        }
    );
}


// ===============================
// PREVIOUS WORD
// ===============================

const previousWord =
    document.getElementById(
        "previous-word"
    );

if (previousWord) {

    previousWord.addEventListener(
        "click",
        () => {

            if (!currentWords.length) return;

            currentWordIndex--;

            if (currentWordIndex < 0) {

                currentWordIndex =
                    currentWords.length - 1;
            }

            showFlashcard(
                currentWordIndex
            );
        }
    );
}


// ===============================
// SHOW PARAGRAPH
// ===============================

function showParagraph(index) {

    if (!paragraphs.length) return;

    currentParagraphIndex = index;

    const paragraph =
        paragraphs[index];

    const title =
        document.getElementById(
            "paragraph-title"
        );

    const text =
        document.getElementById(
            "paragraph-text"
        );

    const pinyin =
        document.getElementById(
            "paragraph-pinyin"
        );

    if (title) {
        title.textContent =
            paragraph.title;
    }

    if (text) {
        text.textContent =
            paragraph.paragraph;
    }

    if (pinyin) {
        pinyin.textContent =
            paragraph.Pinyin;
    }

    updateParagraphCounter();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ===============================
// PARAGRAPH COUNTER
// ===============================

function updateParagraphCounter() {

    const counter =
        document.getElementById(
            "paragraph-counter"
        );

    if (!counter) return;

    counter.textContent =
        `${currentParagraphIndex + 1} / ${paragraphs.length}`;
}


// ===============================
// NEXT PARAGRAPH
// ===============================

const nextParagraph =
    document.getElementById(
        "next-paragraph"
    );

if (nextParagraph) {

    nextParagraph.addEventListener(
        "click",
        () => {

            if (!paragraphs.length) return;

            currentParagraphIndex++;

            if (
                currentParagraphIndex >=
                paragraphs.length
            ) {
                currentParagraphIndex = 0;
            }

            showParagraph(
                currentParagraphIndex
            );
        }
    );
}


// ===============================
// PREVIOUS PARAGRAPH
// ===============================

const previousParagraph =
    document.getElementById(
        "previous-paragraph"
    );

if (previousParagraph) {

    previousParagraph.addEventListener(
        "click",
        () => {

            if (!paragraphs.length) return;

            currentParagraphIndex--;

            if (currentParagraphIndex < 0) {

                currentParagraphIndex =
                    paragraphs.length - 1;
            }

            showParagraph(
                currentParagraphIndex
            );
        }
    );
}


// ===============================
// PINYIN TOGGLE
// ===============================

const togglePinyin =
    document.getElementById(
        "toggle-pinyin"
    );

const paragraphPinyin =
    document.getElementById(
        "paragraph-pinyin"
    );

if (
    togglePinyin &&
    paragraphPinyin
) {

    togglePinyin.addEventListener(
        "click",
        () => {

            paragraphPinyin.classList.toggle(
                "hidden"
            );

            if (
                paragraphPinyin.classList.contains(
                    "hidden"
                )
            ) {

                togglePinyin.textContent =
                    "Show Pinyin";

            } else {

                togglePinyin.textContent =
                    "Hide Pinyin";
            }
        }
    );
}


// ===============================
// READING PROGRESS
// ===============================

const readingProgress =
    document.getElementById(
        "reading-progress"
    );

window.addEventListener(
    "scroll",
    () => {

        if (!readingProgress) return;

        const scrollTop =
            window.scrollY;

        const documentHeight =
            document.documentElement
                .scrollHeight
            - window.innerHeight;

        if (documentHeight <= 0) {

            readingProgress.style.width =
                "0%";

            return;
        }

        const progress =
            (scrollTop /
                documentHeight) *
            100;

        readingProgress.style.width =
            `${Math.min(progress, 100)}%`;
    }
);


// ===============================
// STATISTICS
// ===============================

function updateStatistics() {

    const totalWords =
        document.getElementById(
            "total-words"
        );

    const totalParagraphs =
        document.getElementById(
            "total-paragraphs"
        );

    if (totalWords) {
        totalWords.textContent =
            vocabulary.length;
    }

    if (totalParagraphs) {
        totalParagraphs.textContent =
            paragraphs.length;
    }
}


// ===============================
// HTML ESCAPE
// ===============================

function escapeHTML(value) {

    if (
        value === undefined ||
        value === null
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ===============================
// START APP
// ===============================

async function initializeApp() {

    console.log(
        "Starting Chinese Learning website..."
    );

    await loadVocabulary();

    await loadParagraphs();

    console.log(
        "Chinese Learning website ready."
    );
}

initializeApp();
