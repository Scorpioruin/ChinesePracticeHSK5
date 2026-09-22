// ==========================================
// CHINESE LEARNING WEBSITE
// HSK 5
// ==========================================


// ==========================================
// FILES THAT CURRENTLY EXIST
// ==========================================

const vocabularyLetters = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g"
];

const paragraphLetters = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g"
];


// ==========================================
// GLOBAL VARIABLES
// ==========================================

let vocabulary = [];

let paragraphs = [];

let currentLetter = "all";

let currentWords = [];

let currentWordIndex = 0;

let currentParagraphIndex = 0;

let examQuestions = [];

let examIndex = 0;

let examScore = 0;


// ==========================================
// PAGE NAVIGATION
// ==========================================

function showSection(sectionId) {

    document
        .querySelectorAll(".page-section")
        .forEach(section => {

            section.classList.remove(
                "active-section"
            );

        });


    const section =
        document.getElementById(sectionId);


    if (section) {

        section.classList.add(
            "active-section"
        );

    }


    document
        .querySelectorAll(".nav-btn")
        .forEach(button => {

            button.classList.remove(
                "active"
            );


            if (
                button.dataset.section
                === sectionId
            ) {

                button.classList.add(
                    "active"
                );

            }

        });


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// Navigation buttons and feature cards

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-section]"
            );


        if (!button) return;


        showSection(
            button.dataset.section
        );

    }
);


// ==========================================
// LOAD JSON FILE
// ==========================================

async function loadJSON(file) {

    const response =
        await fetch(
            file,
            {
                cache: "no-store"
            }
        );


    if (!response.ok) {

        throw new Error(
            `${file} → HTTP ${response.status}`
        );

    }


    const text =
        await response.text();


    if (!text.trim()) {

        throw new Error(
            `${file} is empty`
        );

    }


    try {

        const data =
            JSON.parse(text);


        if (!Array.isArray(data)) {

            throw new Error(
                "JSON root must be an array"
            );

        }


        return data;

    } catch (error) {

        throw new Error(
            `${file} → Invalid JSON: ${error.message}`
        );

    }

}


// ==========================================
// LOAD VOCABULARY
// ==========================================

async function loadVocabulary() {

    vocabulary = [];


    for (
        const letter
        of vocabularyLetters
    ) {

        const file =
            `./words/${letter}.json`;


        try {

            const data =
                await loadJSON(file);


            data.forEach(word => {

                vocabulary.push({

                    ...word,

                    letter:
                        letter.toUpperCase()

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


    if (
        vocabulary.length > 0
    ) {

        currentWords =
            vocabulary;

        showFlashcard(0);

    }

}


// ==========================================
// LOAD PARAGRAPHS
// ==========================================

async function loadParagraphs() {

    paragraphs = [];


    for (
        const letter
        of paragraphLetters
    ) {

        const file =
            `./paragraph/paragraph_${letter}.json`;


        try {

            const data =
                await loadJSON(file);


            data.forEach(paragraph => {

                paragraphs.push({

                    ...paragraph,

                    letter:
                        letter.toUpperCase()

                });

            });

        } catch (error) {

            console.error(error);

        }

    }


    console.log(
        `Paragraphs loaded: ${paragraphs.length}`
    );


    if (
        paragraphs.length > 0
    ) {

        showParagraph(0);

    }


    updateStatistics();

}


// ==========================================
// ALPHABET
// ==========================================

function setupAlphabet() {

    const alphabetList =
        document.getElementById(
            "alphabet-list"
        );


    if (!alphabetList) return;


    alphabetList.innerHTML = "";


    const alphabet =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");


    alphabet.forEach(letter => {

        const button =
            document.createElement(
                "button"
            );


        button.className =
            "alphabet-btn";


        button.textContent =
            letter;


        button.dataset.letter =
            letter.toLowerCase();


        const exists =
            vocabularyLetters.includes(
                letter.toLowerCase()
            );


        if (!exists) {

            button.disabled = true;

            button.classList.add(
                "disabled"
            );

        }


        alphabetList.appendChild(
            button
        );

    });

}


// ==========================================
// ALPHABET CLICK
// ==========================================

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".alphabet-btn"
            );


        if (!button) return;


        if (button.disabled) return;


        document
            .querySelectorAll(
                ".alphabet-btn"
            )
            .forEach(btn => {

                btn.classList.remove(
                    "active"
                );

            });


        button.classList.add(
            "active"
        );


        const letter =
            button.dataset.letter;


        currentLetter =
            letter;


        if (
            letter === "all"
        ) {

            displayWords(
                vocabulary
            );

        } else {

            const filtered =
                vocabulary.filter(
                    word =>
                        word.letter
                            .toLowerCase()
                        === letter
                );


            displayWords(
                filtered
            );

        }

    }
);


// ==========================================
// DISPLAY WORDS
// ==========================================

function displayWords(words) {

    const wordList =
        document.getElementById(
            "word-list"
        );


    if (!wordList) return;


    wordList.innerHTML = "";


    currentWords =
        words;


    if (
        words.length === 0
    ) {

        wordList.innerHTML = `

            <div class="empty-state">
                No vocabulary found.
            </div>

        `;

        return;

    }


    words.forEach(word => {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "word-card";


        card.innerHTML = `

            <div class="word-card-main">

                <h3>
                    ${escapeHTML(
                        word.words
                    )}
                </h3>

                <p class="word-pinyin">
                    ${escapeHTML(
                        word.Pinyin
                    )}
                </p>

                <p class="word-meaning">
                    ${escapeHTML(
                        word.Meaning
                    )}
                </p>

            </div>

            <div class="word-card-arrow">
                →
            </div>

        `;


        card.addEventListener(
            "click",
            () => {

                showWord(word);

            }
        );


        wordList.appendChild(
            card
        );

    });

}


// ==========================================
// SHOW WORD DETAIL
// ==========================================

function showWord(word) {

    const title =
        document.getElementById(
            "word-title"
        );


    const pinyin =
        document.getElementById(
            "word-pinyin"
        );


    const meaning =
        document.getElementById(
            "word-meaning"
        );


    const sentence =
        document.getElementById(
            "word-sentence"
        );


    if (title) {

        title.textContent =
            word.words;

    }


    if (pinyin) {

        pinyin.textContent =
            word.Pinyin;

    }


    if (meaning) {

        meaning.textContent =
            word.Meaning;

    }


    if (sentence) {

        sentence.textContent =
            word.Sentences;

    }


    const detail =
        document.getElementById(
            "word-detail"
        );


    if (detail) {

        detail.classList.remove(
            "hidden"
        );

    }


    const index =
        currentWords.findIndex(
            item =>
                item.id === word.id
        );


    if (index !== -1) {

        showFlashcard(index);

    }

}


// ==========================================
// CLOSE WORD DETAIL
// ==========================================

const closeWordDetail =
    document.getElementById(
        "close-word-detail"
    );


if (closeWordDetail) {

    closeWordDetail.addEventListener(
        "click",
        () => {

            const detail =
                document.getElementById(
                    "word-detail"
                );


            if (detail) {

                detail.classList.add(
                    "hidden"
                );

            }

        }
    );

}


// ==========================================
// SEARCH
// ==========================================

const searchInput =
    document.getElementById(
        "search-input"
    );


if (searchInput) {

    searchInput.addEventListener(
        "input",
        () => {

            const query =
                searchInput.value
                    .trim()
                    .toLowerCase();


            let wordsToSearch;


            if (
                currentLetter === "all"
            ) {

                wordsToSearch =
                    vocabulary;

            } else {

                wordsToSearch =
                    vocabulary.filter(
                        word =>
                            word.letter
                                .toLowerCase()
                            === currentLetter
                    );

            }


            if (!query) {

                displayWords(
                    wordsToSearch
                );

                return;

            }


            const results =
                wordsToSearch.filter(
                    word => {

                        return (

                            String(
                                word.words
                            )
                                .toLowerCase()
                                .includes(query)

                            ||

                            String(
                                word.Pinyin
                            )
                                .toLowerCase()
                                .includes(query)

                            ||

                            String(
                                word.Meaning
                            )
                                .toLowerCase()
                                .includes(query)

                        );

                    }
                );


            displayWords(
                results
            );

        }
    );

}


// ==========================================
// FLASHCARDS
// ==========================================

function showFlashcard(
    index = 0
) {

    if (
        !currentWords.length
    ) {

        return;

    }


    currentWordIndex =
        index;


    const word =
        currentWords[
            currentWordIndex
        ];


    const wordElement =
        document.getElementById(
            "flashcard-word"
        );


    const pinyinElement =
        document.getElementById(
            "flashcard-pinyin"
        );


    const meaningElement =
        document.getElementById(
            "flashcard-meaning"
        );


    const sentenceElement =
        document.getElementById(
            "flashcard-sentence"
        );


    if (wordElement) {

        wordElement.textContent =
            word.words;

    }


    if (pinyinElement) {

        pinyinElement.textContent =
            word.Pinyin;

    }


    if (meaningElement) {

        meaningElement.textContent =
            word.Meaning;

    }


    if (sentenceElement) {

        sentenceElement.textContent =
            word.Sentences;

    }


    const card =
        document.getElementById(
            "flashcard"
        );


    if (card) {

        card.classList.remove(
            "flipped"
        );

    }

}


// ==========================================
// FLASHCARD FLIP
// ==========================================

const flashcard =
    document.getElementById(
        "flashcard"
    );


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


// ==========================================
// NEXT WORD
// ==========================================

const nextWord =
    document.getElementById(
        "next-word"
    );


if (nextWord) {

    nextWord.addEventListener(
        "click",
        () => {

            if (
                !currentWords.length
            ) return;


            currentWordIndex++;


            if (
                currentWordIndex
                >= currentWords.length
            ) {

                currentWordIndex = 0;

            }


            showFlashcard(
                currentWordIndex
            );

        }
    );

}


// ==========================================
// PREVIOUS WORD
// ==========================================

const previousWord =
    document.getElementById(
        "previous-word"
    );


if (previousWord) {

    previousWord.addEventListener(
        "click",
        () => {

            if (
                !currentWords.length
            ) return;


            currentWordIndex--;


            if (
                currentWordIndex < 0
            ) {

                currentWordIndex =
                    currentWords.length - 1;

            }


            showFlashcard(
                currentWordIndex
            );

        }
    );

}


// ==========================================
// SHOW PARAGRAPH
// ==========================================

function showParagraph(index) {

    if (
        !paragraphs.length
    ) {

        return;

    }


    currentParagraphIndex =
        index;


    const paragraph =
        paragraphs[
            currentParagraphIndex
        ];


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


// ==========================================
// PARAGRAPH COUNTER
// ==========================================

function updateParagraphCounter() {

    const counter =
        document.getElementById(
            "paragraph-counter"
        );


    if (!counter) return;


    counter.textContent =
        `${currentParagraphIndex + 1} / ${paragraphs.length}`;

}


// ==========================================
// NEXT PARAGRAPH
// ==========================================

const nextParagraph =
    document.getElementById(
        "next-paragraph"
    );


if (nextParagraph) {

    nextParagraph.addEventListener(
        "click",
        () => {

            if (
                !paragraphs.length
            ) return;


            currentParagraphIndex++;


            if (
                currentParagraphIndex
                >= paragraphs.length
            ) {

                currentParagraphIndex = 0;

            }


            showParagraph(
                currentParagraphIndex
            );

        }
    );

}


// ==========================================
// PREVIOUS PARAGRAPH
// ==========================================

const previousParagraph =
    document.getElementById(
        "previous-paragraph"
    );


if (previousParagraph) {

    previousParagraph.addEventListener(
        "click",
        () => {

            if (
                !paragraphs.length
            ) return;


            currentParagraphIndex--;


            if (
                currentParagraphIndex < 0
            ) {

                currentParagraphIndex =
                    paragraphs.length - 1;

            }


            showParagraph(
                currentParagraphIndex
            );

        }
    );

}


// ==========================================
// PINYIN TOGGLE
// ==========================================

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


// ==========================================
// READING PROGRESS
// ==========================================

const readingProgress =
    document.getElementById(
        "reading-progress"
    );


window.addEventListener(
    "scroll",
    () => {

        if (
            !readingProgress
        ) return;


        const scrollTop =
            window.scrollY;


        const documentHeight =
            document.documentElement
                .scrollHeight
            - window.innerHeight;


        if (
            documentHeight <= 0
        ) {

            readingProgress.style.width =
                "0%";

            return;

        }


        const progress =
            (
                scrollTop /
                documentHeight
            ) * 100;


        readingProgress.style.width =
            `${Math.min(
                progress,
                100
            )}%`;

    }
);


// ==========================================
// STATISTICS
// ==========================================

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


// ==========================================
// HSK 5 COUNTDOWN
// ==========================================

function updateCountdown() {

    /*
        Exam:
        11 October 2026
        9:00 AM
        Thailand time = UTC+7
    */

    const examDate =
        new Date(
            "2026-10-11T09:00:00+07:00"
        );


    const now =
        new Date();


    const difference =
        examDate.getTime()
        - now.getTime();


    const days =
        document.getElementById(
            "countdown-days"
        );


    const hours =
        document.getElementById(
            "countdown-hours"
        );


    const minutes =
        document.getElementById(
            "countdown-minutes"
        );


    const seconds =
        document.getElementById(
            "countdown-seconds"
        );


    const message =
        document.getElementById(
            "countdown-message"
        );


    if (
        !days ||
        !hours ||
        !minutes ||
        !seconds
    ) {

        return;

    }


    if (
        difference <= 0
    ) {

        days.textContent =
            "0";

        hours.textContent =
            "00";

        minutes.textContent =
            "00";

        seconds.textContent =
            "00";


        if (message) {

            message.textContent =
                "Your HSK 5 exam time has arrived. 加油！";

        }


        return;

    }


    const totalSeconds =
        Math.floor(
            difference / 1000
        );


    const d =
        Math.floor(
            totalSeconds / 86400
        );


    const h =
        Math.floor(
            (
                totalSeconds % 86400
            ) / 3600
        );


    const m =
        Math.floor(
            (
                totalSeconds % 3600
            ) / 60
        );


    const s =
        totalSeconds % 60;


    days.textContent =
        d;


    hours.textContent =
        String(h).padStart(
            2,
            "0"
        );


    minutes.textContent =
        String(m).padStart(
            2,
            "0"
        );


    seconds.textContent =
        String(s).padStart(
            2,
            "0"
        );

}


// Start countdown

updateCountdown();


// Update every second

setInterval(
    updateCountdown,
    1000
);


// ==========================================
// EXAM
// ==========================================

const startExam =
    document.getElementById(
        "start-exam"
    );


if (startExam) {

    startExam.addEventListener(
        "click",
        startVocabularyExam
    );

}


// ==========================================
// START EXAM
// ==========================================

function startVocabularyExam() {

    if (
        vocabulary.length < 4
    ) {

        alert(
            "You need at least 4 vocabulary words to start the exam."
        );

        return;

    }


    examQuestions =
        shuffle(
            [...vocabulary]
        ).slice(
            0,
            Math.min(
                10,
                vocabulary.length
            )
        );


    examIndex = 0;

    examScore = 0;


    showExamQuestion();

}


// ==========================================
// SHOW EXAM QUESTION
// ==========================================

function showExamQuestion() {

    const container =
        document.getElementById(
            "exam-container"
        );


    if (!container) return;


    if (
        examIndex
        >= examQuestions.length
    ) {

        showExamResult();

        return;

    }


    const question =
        examQuestions[
            examIndex
        ];


    const otherWords =
        vocabulary.filter(
            word =>
                word.words
                !== question.words
        );


    const wrongAnswers =
        shuffle(
            [...otherWords]
        ).slice(
            0,
            3
        );


    const options =
        shuffle([
            question,
            ...wrongAnswers
        ]);


    container.innerHTML = `

        <div class="exam-question">

            <p class="section-label">
                QUESTION
                ${examIndex + 1}
                /
                ${examQuestions.length}
            </p>

            <div class="exam-word">
                ${escapeHTML(
                    question.words
                )}
            </div>

            <div class="exam-pinyin">
                ${escapeHTML(
                    question.Pinyin
                )}
            </div>

            <div class="exam-options">

                ${options.map(
                    option => `

                    <button
                        class="exam-option"
                        data-answer="${escapeHTML(
                            option.words
                        )}"
                    >
                        ${escapeHTML(
                            option.Meaning
                        )}
                    </button>

                `
                ).join("")}

            </div>

        </div>

    `;


    container
        .querySelectorAll(
            ".exam-option"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const answer =
                        button.dataset.answer;


                    if (
                        answer
                        === question.words
                    ) {

                        button.classList.add(
                            "correct"
                        );

                        examScore++;

                    } else {

                        button.classList.add(
                            "wrong"
                        );


                        const correct =
                            Array.from(
                                container.querySelectorAll(
                                    ".exam-option"
                                )
                            ).find(
                                btn =>
                                    btn.dataset.answer
                                    === question.words
                            );


                        if (correct) {

                            correct.classList.add(
                                "correct"
                            );

                        }

                    }


                    container
                        .querySelectorAll(
                            ".exam-option"
                        )
                        .forEach(
                            btn =>
                                btn.disabled =
                                    true
                        );


                    setTimeout(
                        () => {

                            examIndex++;

                            showExamQuestion();

                        },
                        900
                    );

                }
            );

        });

}


// ==========================================
// EXAM RESULT
// ==========================================

function showExamResult() {

    const container =
        document.getElementById(
            "exam-container"
        );


    if (!container) return;


    container.innerHTML = `

        <div class="exam-result">

            <p class="section-label">
                COMPLETE
            </p>

            <h3>
                Practice Complete
            </h3>

            <div class="exam-score">
                ${examScore}
                /
                ${examQuestions.length}
            </div>

            <p>
                Keep practicing. 加油！
            </p>

            <br>

            <button
                id="restart-exam"
                class="primary-btn"
            >
                Try Again
            </button>

        </div>

    `;


    const restart =
        document.getElementById(
            "restart-exam"
        );


    if (restart) {

        restart.addEventListener(
            "click",
            startVocabularyExam
        );

    }

}


// ==========================================
// SHUFFLE
// ==========================================

function shuffle(array) {

    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random()
                * (i + 1)
            );


        [
            array[i],
            array[j]
        ] =
        [
            array[j],
            array[i]
        ];

    }


    return array;

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ==========================================
// INITIALIZE WEBSITE
// ==========================================

async function initializeApp() {

    console.log(
        "Starting Chinese Learning website..."
    );


    await Promise.all([
        loadVocabulary(),
        loadParagraphs()
    ]);


    console.log(
        "Chinese Learning website ready."
    );

}


initializeApp();
