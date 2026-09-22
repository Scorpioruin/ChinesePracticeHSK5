/* =========================================================
   新学中文
   Chinese Learning Website
   Plain HTML + CSS + JavaScript + JSON
========================================================= */


/* =========================================================
   DATA FILES
========================================================= */

const letters = "abcdefghijklmnopqrstuvwxyz".split("");

const wordFiles = letters.map(letter => `words/${letter}.json`);

const paragraphFiles = letters.map(
    letter => `paragraph/paragraph_${letter}.json`
);


/* =========================================================
   GLOBAL DATA
========================================================= */

let allWords = [];
let allParagraphs = [];

let currentLetter = "all";
let currentSearch = "";

let flashcardWords = [];
let currentFlashcardIndex = 0;

let showFlashcardPinyin = true;
let showFlashcardMeaning = true;

let currentParagraphIndex = 0;
let showParagraphPinyin = false;

let examQuestions = [];
let currentExamIndex = 0;
let examScore = 0;
let examAnswered = false;

let selectedExamCount = 10;


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    setupNavigation();

    setupAlphabet();

    setupVocabularySearch();

    setupFlashcards();

    setupParagraphControls();

    setupExam();

    loadAllData();

});


/* =========================================================
   LOAD ALL DATA
========================================================= */

async function loadAllData() {

    try {

        const wordResults = await Promise.all(
            wordFiles.map(file => loadJSON(file))
        );

        const paragraphResults = await Promise.all(
            paragraphFiles.map(file => loadJSON(file))
        );


        allWords = wordResults
            .filter(data => Array.isArray(data))
            .flat();


        allParagraphs = paragraphResults
            .filter(data => Array.isArray(data))
            .flat();


        updateStatistics();

        renderVocabulary();

        setupFlashcardData();

        renderParagraphList();

        if (allParagraphs.length > 0) {
            showParagraph(0);
        }

    } catch (error) {

        console.error("Data loading error:", error);

        showDataError();

    }

}


/* =========================================================
   LOAD JSON
========================================================= */

async function loadJSON(file) {

    const response = await fetch(file);

    if (!response.ok) {
        return [];
    }

    return await response.json();

}


/* =========================================================
   DATA ERROR
========================================================= */

function showDataError() {

    const vocabularyList =
        document.getElementById("vocabulary-list");

    if (vocabularyList) {

        vocabularyList.innerHTML = `
            <div class="empty-state">
                <h3>Unable to load vocabulary</h3>
                <p>
                    Please make sure you are running the website
                    with Live Server or another local server.
                </p>
            </div>
        `;

    }

}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

    document.querySelectorAll("[data-page]").forEach(button => {

        button.addEventListener("click", () => {

            const page = button.dataset.page;

            showPage(page);

        });

    });

}


function showPage(pageName) {

    document.querySelectorAll(".page").forEach(page => {

        page.classList.remove("active-page");

    });


    const targetPage =
        document.getElementById(pageName);

    if (targetPage) {

        targetPage.classList.add("active-page");

    }


    document.querySelectorAll(".nav-btn").forEach(button => {

        button.classList.remove("active");

        if (button.dataset.page === pageName) {

            button.classList.add("active");

        }

    });


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    if (pageName === "flashcards") {

        renderFlashcard();

    }

}


/* =========================================================
   STATISTICS
========================================================= */

function updateStatistics() {

    const wordCount =
        document.getElementById("word-count");

    const paragraphCount =
        document.getElementById("paragraph-count");


    if (wordCount) {

        wordCount.textContent =
            allWords.length;

    }


    if (paragraphCount) {

        paragraphCount.textContent =
            allParagraphs.length;

    }

}


/* =========================================================
   ALPHABET
========================================================= */

function setupAlphabet() {

    const container =
        document.getElementById("alphabet-list");

    if (!container) return;


    letters.forEach(letter => {

        const button =
            document.createElement("button");

        button.className = "alphabet-btn";

        button.dataset.letter = letter;

        button.textContent =
            letter.toUpperCase();


        button.addEventListener("click", () => {

            currentLetter = letter;

            updateAlphabetActive();

            renderVocabulary();

        });


        container.appendChild(button);

    });

}


function updateAlphabetActive() {

    document
        .querySelectorAll(".alphabet-btn")
        .forEach(button => {

            button.classList.remove("active");

            if (button.dataset.letter === currentLetter) {

                button.classList.add("active");

            }

        });

}


/* ALL button */

document.addEventListener("click", event => {

    if (
        event.target.classList.contains("alphabet-btn") &&
        event.target.dataset.letter === "all"
    ) {

        currentLetter = "all";

        updateAlphabetActive();

        renderVocabulary();

    }

});


/* =========================================================
   VOCABULARY SEARCH
========================================================= */

function setupVocabularySearch() {

    const searchInput =
        document.getElementById("search-input");

    const clearButton =
        document.getElementById("clear-search");


    if (searchInput) {

        searchInput.addEventListener("input", event => {

            currentSearch =
                event.target.value
                    .trim()
                    .toLowerCase();

            renderVocabulary();

        });

    }


    if (clearButton) {

        clearButton.addEventListener("click", () => {

            currentSearch = "";

            if (searchInput) {

                searchInput.value = "";

            }

            renderVocabulary();

        });

    }

}


/* =========================================================
   FILTER VOCABULARY
========================================================= */

function getFilteredWords() {

    return allWords.filter(word => {

        const chinese =
            String(word.words || "")
                .toLowerCase();

        const pinyin =
            String(word.Pinyin || "")
                .toLowerCase();

        const meaning =
            String(word.Meaning || "")
                .toLowerCase();


        const matchesSearch =
            !currentSearch ||
            chinese.includes(currentSearch) ||
            pinyin.includes(currentSearch) ||
            meaning.includes(currentSearch);


        const firstLetter =
            getPinyinFirstLetter(word.Pinyin);


        const matchesLetter =
            currentLetter === "all" ||
            firstLetter === currentLetter;


        return matchesSearch && matchesLetter;

    });

}


/* =========================================================
   GET PINYIN FIRST LETTER
========================================================= */

function getPinyinFirstLetter(pinyin) {

    if (!pinyin) return "";

    return pinyin
        .trim()
        .charAt(0)
        .toLowerCase();

}


/* =========================================================
   RENDER VOCABULARY
========================================================= */

function renderVocabulary() {

    const container =
        document.getElementById("vocabulary-list");

    const emptyState =
        document.getElementById("vocabulary-empty");

    const resultCount =
        document.getElementById("vocabulary-result-count");


    if (!container) return;


    const filteredWords =
        getFilteredWords();


    container.innerHTML = "";


    if (resultCount) {

        resultCount.textContent =
            `${filteredWords.length} word${filteredWords.length === 1 ? "" : "s"}`;

    }


    if (filteredWords.length === 0) {

        if (emptyState) {

            emptyState.classList.remove("hidden");

        }

        return;

    }


    if (emptyState) {

        emptyState.classList.add("hidden");

    }


    filteredWords.forEach((word, index) => {

        const card =
            document.createElement("div");

        card.className =
            "vocabulary-card";


        card.innerHTML = `
            <div class="word-number">
                #${index + 1}
            </div>

            <div class="word-chinese">
                ${escapeHTML(word.words)}
            </div>

            <div class="word-pinyin">
                ${escapeHTML(word.Pinyin)}
            </div>

            <div class="word-meaning">
                ${escapeHTML(word.Meaning)}
            </div>

            <div class="word-sentence">
                ${escapeHTML(word.Sentences)}
            </div>
        `;


        container.appendChild(card);

    });

}


/* =========================================================
   FLASHCARDS
========================================================= */

function setupFlashcardData() {

    flashcardWords =
        [...allWords];

    currentFlashcardIndex = 0;

    renderFlashcard();

}


function setupFlashcards() {

    const nextButton =
        document.getElementById("next-card");

    const previousButton =
        document.getElementById("previous-card");

    const togglePinyin =
        document.getElementById("flashcard-toggle-pinyin");

    const toggleMeaning =
        document.getElementById("flashcard-toggle-meaning");

    const shuffleButton =
        document.getElementById("shuffle-cards");


    if (nextButton) {

        nextButton.addEventListener("click", nextFlashcard);

    }


    if (previousButton) {

        previousButton.addEventListener(
            "click",
            previousFlashcard
        );

    }


    if (togglePinyin) {

        togglePinyin.addEventListener("click", () => {

            showFlashcardPinyin =
                !showFlashcardPinyin;

            togglePinyin.textContent =
                showFlashcardPinyin
                    ? "Hide Pinyin"
                    : "Show Pinyin";

            renderFlashcard();

        });

    }


    if (toggleMeaning) {

        toggleMeaning.addEventListener("click", () => {

            showFlashcardMeaning =
                !showFlashcardMeaning;

            toggleMeaning.textContent =
                showFlashcardMeaning
                    ? "Hide Meaning"
                    : "Show Meaning";

            renderFlashcard();

        });

    }


    if (shuffleButton) {

        shuffleButton.addEventListener("click", () => {

            flashcardWords =
                shuffleArray([...allWords]);

            currentFlashcardIndex = 0;

            renderFlashcard();

        });

    }

}


function renderFlashcard() {

    if (!flashcardWords.length) return;


    const word =
        flashcardWords[currentFlashcardIndex];


    const chinese =
        document.getElementById("flashcard-chinese");

    const pinyin =
        document.getElementById("flashcard-pinyin");

    const meaning =
        document.getElementById("flashcard-meaning");

    const sentence =
        document.getElementById("flashcard-sentence");

    const counter =
        document.getElementById("flashcard-counter");


    if (chinese) {

        chinese.textContent =
            word.words || "—";

    }


    if (pinyin) {

        pinyin.textContent =
            showFlashcardPinyin
                ? word.Pinyin || "—"
                : "••••••";

    }


    if (meaning) {

        meaning.textContent =
            showFlashcardMeaning
                ? word.Meaning || "—"
                : "••••••";

    }


    if (sentence) {

        sentence.textContent =
            word.Sentences || "—";

    }


    if (counter) {

        counter.textContent =
            `${currentFlashcardIndex + 1} / ${flashcardWords.length}`;

    }

}


function nextFlashcard() {

    if (!flashcardWords.length) return;


    currentFlashcardIndex++;

    if (
        currentFlashcardIndex >=
        flashcardWords.length
    ) {

        currentFlashcardIndex = 0;

    }


    renderFlashcard();

}


function previousFlashcard() {

    if (!flashcardWords.length) return;


    currentFlashcardIndex--;

    if (currentFlashcardIndex < 0) {

        currentFlashcardIndex =
            flashcardWords.length - 1;

    }


    renderFlashcard();

}


/* =========================================================
   PARAGRAPH LIST
========================================================= */

function renderParagraphList() {

    const container =
        document.getElementById("paragraph-list");


    if (!container) return;


    container.innerHTML = "";


    allParagraphs.forEach((paragraph, index) => {

        const button =
            document.createElement("button");

        button.className =
            "paragraph-item";


        button.dataset.index =
            index;


        button.innerHTML = `
            <span class="paragraph-item-number">
                Article ${index + 1}
            </span>

            <span class="paragraph-item-title">
                ${escapeHTML(paragraph.title)}
            </span>
        `;


        button.addEventListener("click", () => {

            showParagraph(index);

        });


        container.appendChild(button);

    });

}


/* =========================================================
   PARAGRAPH DISPLAY
========================================================= */

function showParagraph(index) {

    if (!allParagraphs.length) return;


    if (index < 0) {

        index =
            allParagraphs.length - 1;

    }


    if (index >= allParagraphs.length) {

        index = 0;

    }


    currentParagraphIndex =
        index;


    const paragraph =
        allParagraphs[index];


    const articleNumber =
        document.getElementById("article-number");

    const title =
        document.getElementById("article-title");

    const chinese =
        document.getElementById("article-chinese");

    const pinyin =
        document.getElementById("article-pinyin");


    if (articleNumber) {

        articleNumber.textContent =
            `ARTICLE ${index + 1} / ${allParagraphs.length}`;

    }


    if (title) {

        title.textContent =
            paragraph.title || "";

    }


    if (chinese) {

        chinese.textContent =
            paragraph.paragraph || "";

    }


    if (pinyin) {

        pinyin.textContent =
            paragraph.Pinyin || "";

        pinyin.classList.toggle(
            "hidden",
            !showParagraphPinyin
        );

    }


    updateParagraphListActive();

    resetReadingProgress();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   PARAGRAPH CONTROLS
========================================================= */

function setupParagraphControls() {

    const toggle =
        document.getElementById(
            "paragraph-pinyin-toggle"
        );

    const previous =
        document.getElementById(
            "paragraph-prev"
        );

    const next =
        document.getElementById(
            "paragraph-next"
        );


    if (toggle) {

        toggle.addEventListener("click", () => {

            showParagraphPinyin =
                !showParagraphPinyin;


            toggle.textContent =
                showParagraphPinyin
                    ? "Hide Pinyin"
                    : "Show Pinyin";


            const pinyin =
                document.getElementById(
                    "article-pinyin"
                );


            if (pinyin) {

                pinyin.classList.toggle(
                    "hidden",
                    !showParagraphPinyin
                );

            }

        });

    }


    if (previous) {

        previous.addEventListener("click", () => {

            showParagraph(
                currentParagraphIndex - 1
            );

        });

    }


    if (next) {

        next.addEventListener("click", () => {

            showParagraph(
                currentParagraphIndex + 1
            );

        });

    }


    const article =
        document.querySelector(".reading-article");


    if (article) {

        article.addEventListener(
            "scroll",
            updateReadingProgress
        );

    }


    window.addEventListener(
        "scroll",
        updateReadingProgress
    );

}


/* =========================================================
   ACTIVE PARAGRAPH
========================================================= */

function updateParagraphListActive() {

    document
        .querySelectorAll(".paragraph-item")
        .forEach(button => {

            button.classList.remove("active");

            if (
                Number(button.dataset.index) ===
                currentParagraphIndex
            ) {

                button.classList.add("active");

            }

        });

}


/* =========================================================
   READING PROGRESS
========================================================= */

function updateReadingProgress() {

    const article =
        document.querySelector(".reading-article");

    if (!article) return;


    const articleTop =
        article.getBoundingClientRect().top +
        window.scrollY;


    const articleHeight =
        article.scrollHeight;


    const viewport =
        window.innerHeight;


    const scrollPosition =
        window.scrollY -
        articleTop;


    const maxScroll =
        Math.max(
            articleHeight - viewport,
            1
        );


    let percentage =
        (scrollPosition / maxScroll) * 100;


    percentage =
        Math.max(
            0,
            Math.min(100, percentage)
        );


    const fill =
        document.getElementById(
            "reading-progress-fill"
        );

    const text =
        document.getElementById(
            "reading-progress-percent"
        );


    if (fill) {

        fill.style.width =
            `${percentage}%`;

    }


    if (text) {

        text.textContent =
            `${Math.round(percentage)}%`;

    }

}


function resetReadingProgress() {

    const fill =
        document.getElementById(
            "reading-progress-fill"
        );

    const text =
        document.getElementById(
            "reading-progress-percent"
        );


    if (fill) {

        fill.style.width = "0%";

    }


    if (text) {

        text.textContent = "0%";

    }

}


/* =========================================================
   EXAM
========================================================= */

function setupExam() {

    const startButton =
        document.getElementById("start-exam");

    const nextButton =
        document.getElementById("next-exam");


    if (startButton) {

        startButton.addEventListener(
            "click",
            startExam
        );

    }


    if (nextButton) {

        nextButton.addEventListener(
            "click",
            nextExamQuestion
        );

    }

}


/* =========================================================
   START EXAM
========================================================= */

function startExam() {

    if (allWords.length < 4) {

        alert("You need at least 4 vocabulary words.");

        return;

    }


    examScore = 0;

    currentExamIndex = 0;

    examAnswered = false;


    examQuestions =
        createExamQuestions(
            Math.min(
                selectedExamCount,
                allWords.length
            )
        );


    const result =
        document.getElementById("exam-result");

    if (result) {

        result.classList.add("hidden");

    }


    const startButton =
        document.getElementById("start-exam");

    if (startButton) {

        startButton.textContent =
            "Restart Exam";

    }


    const nextButton =
        document.getElementById("next-exam");

    if (nextButton) {

        nextButton.classList.add("hidden");

    }


    showExamQuestion();

}


/* =========================================================
   CREATE EXAM QUESTIONS
========================================================= */

function createExamQuestions(count) {

    const selectedWords =
        shuffleArray(
            [...allWords]
        ).slice(0, count);


    return selectedWords.map(word => {

        const wrongAnswers =
            shuffleArray(
                allWords.filter(
                    item =>
                        item.words !== word.words
                )
            ).slice(0, 3);


        const options =
            shuffleArray([
                word,
                ...wrongAnswers
            ]);


        return {
            word,
            options
        };

    });

}


/* =========================================================
   SHOW EXAM QUESTION
========================================================= */

function showExamQuestion() {

    if (
        !examQuestions.length ||
        currentExamIndex >= examQuestions.length
    ) {

        finishExam();

        return;

    }


    const question =
        examQuestions[currentExamIndex];


    const questionElement =
        document.getElementById(
            "exam-question"
        );

    const answerElement =
        document.getElementById(
            "exam-answer"
        );

    const progress =
        document.getElementById(
            "exam-progress"
        );

    const score =
        document.getElementById(
            "exam-score"
        );

    const nextButton =
        document.getElementById(
            "next-exam"
        );


    examAnswered = false;


    if (progress) {

        progress.textContent =
            `Question ${currentExamIndex + 1} / ${examQuestions.length}`;

    }


    if (score) {

        score.textContent =
            `Score: ${examScore}`;

    }


    if (questionElement) {

        questionElement.innerHTML = `
            What is the meaning of
            <strong>${escapeHTML(question.word.words)}</strong>?
        `;

    }


    if (answerElement) {

        answerElement.innerHTML = "";


        question.options.forEach(option => {

            const button =
                document.createElement("button");

            button.className =
                "exam-option";


            button.textContent =
                option.Meaning;


            button.addEventListener(
                "click",
                () => checkExamAnswer(
                    option,
                    button
                )
            );


            answerElement.appendChild(button);

        });

    }


    if (nextButton) {

        nextButton.classList.add("hidden");

    }

}


/* =========================================================
   CHECK EXAM ANSWER
========================================================= */

function checkExamAnswer(
    selectedOption,
    clickedButton
) {

    if (examAnswered) return;


    examAnswered = true;


    const question =
        examQuestions[currentExamIndex];


    const optionButtons =
        document.querySelectorAll(
            ".exam-option"
        );


    optionButtons.forEach(button => {

        const isCorrect =
            button.textContent ===
            question.word.Meaning;


        if (isCorrect) {

            button.classList.add("correct");

        }

    });


    if (
        selectedOption.words ===
        question.word.words
    ) {

        examScore++;

    } else {

        clickedButton.classList.add("wrong");

    }


    const score =
        document.getElementById(
            "exam-score"
        );


    if (score) {

        score.textContent =
            `Score: ${examScore}`;

    }


    const nextButton =
        document.getElementById(
            "next-exam"
        );


    if (nextButton) {

        nextButton.classList.remove("hidden");

    }

}


/* =========================================================
   NEXT EXAM QUESTION
========================================================= */

function nextExamQuestion() {

    currentExamIndex++;

    showExamQuestion();

}


/* =========================================================
   FINISH EXAM
========================================================= */

function finishExam() {

    const question =
        document.getElementById(
            "exam-question"
        );

    const answer =
        document.getElementById(
            "exam-answer"
        );

    const result =
        document.getElementById(
            "exam-result"
        );

    const nextButton =
        document.getElementById(
            "next-exam"
        );


    if (question) {

        question.textContent =
            "Exam Complete";

    }


    if (answer) {

        answer.innerHTML = "";

    }


    if (nextButton) {

        nextButton.classList.add("hidden");

    }


    if (result) {

        result.classList.remove("hidden");

        result.textContent =
            `You scored ${examScore} / ${examQuestions.length}`;

    }

}


/* =========================================================
   SHUFFLE
========================================================= */

function shuffleArray(array) {

    const result =
        [...array];


    for (
        let i = result.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );


        [
            result[i],
            result[j]
        ] = [
            result[j],
            result[i]
        ];

    }


    return result;

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    if (value === null || value === undefined) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.showPage = showPage;
window.startExam = startExam;
window.checkExamAnswer = checkExamAnswer;
