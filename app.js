// ============================================================
// Chinese Learning Website
// app.js
// ============================================================

// ------------------------------------------------------------
// 1. JSON 文件列表
// ------------------------------------------------------------

const wordFiles = [
    "a.json",
    "b.json",
    "c.json",
    "d.json",
    "e.json",
    "f.json",
    "g.json",
    "h.json",
    "i.json",
    "j.json",
    "k.json",
    "l.json",
    "m.json",
    "n.json",
    "o.json",
    "p.json",
    "q.json",
    "r.json",
    "s.json",
    "t.json",
    "u.json",
    "v.json",
    "w.json",
    "x.json",
    "y.json",
    "z.json"
];

const paragraphFiles = [
    "paragraph_a.json",
    "paragraph_b.json",
    "paragraph_c.json",
    "paragraph_d.json",
    "paragraph_e.json",
    "paragraph_f.json",
    "paragraph_g.json",
    "paragraph_h.json",
    "paragraph_i.json",
    "paragraph_j.json",
    "paragraph_k.json",
    "paragraph_l.json",
    "paragraph_m.json",
    "paragraph_n.json",
    "paragraph_o.json",
    "paragraph_p.json",
    "paragraph_q.json",
    "paragraph_r.json",
    "paragraph_s.json",
    "paragraph_t.json",
    "paragraph_u.json",
    "paragraph_v.json",
    "paragraph_w.json",
    "paragraph_x.json",
    "paragraph_y.json",
    "paragraph_z.json"
];


// ------------------------------------------------------------
// 2. 网站数据
// ------------------------------------------------------------

let allWords = [];
let allParagraphs = [];

let currentFlashcardIndex = 0;
let currentFlashcardList = [];


// ------------------------------------------------------------
// 3. 页面初始化
// ------------------------------------------------------------

document.addEventListener("DOMContentLoaded", async () => {

    console.log("Chinese Learning Website Starting...");

    await loadAllData();

    setupNavigation();
    setupFlashcards();
    setupSearch();

    showPage("home");

});


// ------------------------------------------------------------
// 4. 读取所有 JSON
// ------------------------------------------------------------

async function loadAllData() {

    try {

        // Load vocabulary
        const wordResults = await Promise.all(
            wordFiles.map(file =>
                fetch(`words/${file}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Cannot load words/${file}`);
                        }

                        return response.json();
                    })
                    .catch(error => {
                        console.warn(error.message);
                        return [];
                    })
            )
        );

        allWords = wordResults.flat();

        // Load paragraphs
        const paragraphResults = await Promise.all(
            paragraphFiles.map(file =>
                fetch(`paragraph/${file}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Cannot load paragraph/${file}`);
                        }

                        return response.json();
                    })
                    .catch(error => {
                        console.warn(error.message);
                        return [];
                    })
            )
        );

        allParagraphs = paragraphResults.flat();

        console.log("Words loaded:", allWords.length);
        console.log("Paragraphs loaded:", allParagraphs.length);

        updateStatistics();

    } catch (error) {

        console.error("Data loading error:", error);

    }

}


// ------------------------------------------------------------
// 5. Navigation
// ------------------------------------------------------------

function setupNavigation() {

    const navButtons = document.querySelectorAll("[data-page]");

    navButtons.forEach(button => {

        button.addEventListener("click", () => {

            const page = button.dataset.page;

            showPage(page);

        });

    });

}


// ------------------------------------------------------------
// 6. 显示页面
// ------------------------------------------------------------

function showPage(pageName) {

    const pages = document.querySelectorAll(".page");

    pages.forEach(page => {
        page.style.display = "none";
    });


    const selectedPage = document.getElementById(pageName);

    if (selectedPage) {
        selectedPage.style.display = "block";
    }


    // 根据页面加载内容
    switch (pageName) {

        case "home":
            updateStatistics();
            break;

        case "vocabulary":
            renderVocabulary();
            break;

        case "flashcards":
            startFlashcards();
            break;

        case "paragraph":
            renderParagraphs();
            break;

        case "exam":
            startExam();
            break;

    }

}


// ------------------------------------------------------------
// 7. 首页统计
// ------------------------------------------------------------

function updateStatistics() {

    const wordCount = document.getElementById("word-count");
    const paragraphCount = document.getElementById("paragraph-count");

    if (wordCount) {
        wordCount.textContent = allWords.length;
    }

    if (paragraphCount) {
        paragraphCount.textContent = allParagraphs.length;
    }

}


// ------------------------------------------------------------
// 8. Vocabulary
// ------------------------------------------------------------

function renderVocabulary(words = allWords) {

    const container = document.getElementById("vocabulary-list");

    if (!container) return;

    container.innerHTML = "";


    if (words.length === 0) {

        container.innerHTML = `
            <p class="empty-message">
                No vocabulary found.
            </p>
        `;

        return;
    }


    words.forEach(word => {

        const card = document.createElement("div");

        card.className = "word-card";


        card.innerHTML = `
            <div class="word-number">
                #${word.id ?? ""}
            </div>

            <div class="word-chinese">
                ${escapeHTML(word.words ?? "")}
            </div>

            <div class="word-pinyin">
                ${escapeHTML(word.Pinyin ?? "")}
            </div>

            <div class="word-meaning">
                ${escapeHTML(word.Meaning ?? "")}
            </div>

            <div class="word-sentence">
                ${escapeHTML(word.Sentences ?? "")}
            </div>
        `;


        container.appendChild(card);

    });

}


// ------------------------------------------------------------
// 9. Search Vocabulary
// ------------------------------------------------------------

function setupSearch() {

    const searchInput = document.getElementById("search-input");

    if (!searchInput) return;


    searchInput.addEventListener("input", () => {

        const keyword = searchInput.value
            .trim()
            .toLowerCase();


        if (!keyword) {

            renderVocabulary(allWords);

            return;
        }


        const filteredWords = allWords.filter(word => {

            return (
                String(word.words ?? "")
                    .toLowerCase()
                    .includes(keyword)
                ||

                String(word.Pinyin ?? "")
                    .toLowerCase()
                    .includes(keyword)
                ||

                String(word.Meaning ?? "")
                    .toLowerCase()
                    .includes(keyword)
            );

        });


        renderVocabulary(filteredWords);

    });

}


// ------------------------------------------------------------
// 10. Flashcards
// ------------------------------------------------------------

function setupFlashcards() {

    const nextButton = document.getElementById("next-card");
    const previousButton = document.getElementById("previous-card");
    const flashcard = document.getElementById("flashcard");


    if (flashcard) {

        flashcard.addEventListener("click", () => {

            flashcard.classList.toggle("flipped");

        });

    }


    if (nextButton) {

        nextButton.addEventListener("click", () => {

            nextFlashcard();

        });

    }


    if (previousButton) {

        previousButton.addEventListener("click", () => {

            previousFlashcard();

        });

    }

}


// ------------------------------------------------------------
// 11. 开始 Flashcard
// ------------------------------------------------------------

function startFlashcards() {

    if (allWords.length === 0) return;


    currentFlashcardList = [...allWords];

    shuffleArray(currentFlashcardList);

    currentFlashcardIndex = 0;

    showFlashcard();

}


// ------------------------------------------------------------
// 12. 显示 Flashcard
// ------------------------------------------------------------

function showFlashcard() {

    const word = currentFlashcardList[currentFlashcardIndex];

    if (!word) return;


    const chinese = document.getElementById("flashcard-chinese");
    const pinyin = document.getElementById("flashcard-pinyin");
    const meaning = document.getElementById("flashcard-meaning");
    const sentence = document.getElementById("flashcard-sentence");
    const counter = document.getElementById("flashcard-counter");
    const flashcard = document.getElementById("flashcard");


    if (chinese) {
        chinese.textContent = word.words ?? "";
    }

    if (pinyin) {
        pinyin.textContent = word.Pinyin ?? "";
    }

    if (meaning) {
        meaning.textContent = word.Meaning ?? "";
    }

    if (sentence) {
        sentence.textContent = word.Sentences ?? "";
    }

    if (counter) {
        counter.textContent =
            `${currentFlashcardIndex + 1} / ${currentFlashcardList.length}`;
    }


    if (flashcard) {
        flashcard.classList.remove("flipped");
    }

}


// ------------------------------------------------------------
// 13. Next Flashcard
// ------------------------------------------------------------

function nextFlashcard() {

    if (currentFlashcardList.length === 0) return;


    currentFlashcardIndex++;


    if (currentFlashcardIndex >= currentFlashcardList.length) {
        currentFlashcardIndex = 0;
    }


    showFlashcard();

}


// ------------------------------------------------------------
// 14. Previous Flashcard
// ------------------------------------------------------------

function previousFlashcard() {

    if (currentFlashcardList.length === 0) return;


    currentFlashcardIndex--;


    if (currentFlashcardIndex < 0) {
        currentFlashcardIndex =
            currentFlashcardList.length - 1;
    }


    showFlashcard();

}


// ------------------------------------------------------------
// 15. Paragraph
// ------------------------------------------------------------

function renderParagraphs(paragraphs = allParagraphs) {

    const container = document.getElementById("paragraph-list");

    if (!container) return;


    container.innerHTML = "";


    if (paragraphs.length === 0) {

        container.innerHTML = `
            <p class="empty-message">
                No paragraphs found.
            </p>
        `;

        return;
    }


    paragraphs.forEach(paragraph => {

        const card = document.createElement("article");

        card.className = "paragraph-card";


        card.innerHTML = `
            <h3>
                ${escapeHTML(paragraph.title ?? "")}
            </h3>

            <div class="paragraph-chinese">
                ${escapeHTML(paragraph.paragraph ?? "")}
            </div>

            <div class="paragraph-pinyin">
                ${escapeHTML(paragraph.Pinyin ?? "")}
            </div>
        `;


        container.appendChild(card);

    });

}


// ------------------------------------------------------------
// 16. 简单 Exam 系统
// ------------------------------------------------------------

let examQuestions = [];
let currentExamIndex = 0;
let examScore = 0;


function startExam() {

    if (allWords.length < 1) return;


    examQuestions = [...allWords];

    shuffleArray(examQuestions);

    // 第一次先做 10 题
    examQuestions = examQuestions.slice(0, 10);

    currentExamIndex = 0;
    examScore = 0;

    showExamQuestion();

}


// ------------------------------------------------------------
// 17. 显示 Exam Question
// ------------------------------------------------------------

function showExamQuestion() {

    const question = examQuestions[currentExamIndex];

    if (!question) {

        finishExam();

        return;
    }


    const questionElement =
        document.getElementById("exam-question");

    const answerInput =
        document.getElementById("exam-answer");

    const progress =
        document.getElementById("exam-progress");


    if (questionElement) {

        questionElement.textContent =
            question.Meaning ?? "";

    }


    if (answerInput) {

        answerInput.value = "";

        answerInput.focus();

    }


    if (progress) {

        progress.textContent =
            `${currentExamIndex + 1} / ${examQuestions.length}`;

    }

}


// ------------------------------------------------------------
// 18. 检查答案
// ------------------------------------------------------------

function checkExamAnswer() {

    const answerInput =
        document.getElementById("exam-answer");

    if (!answerInput) return;


    const userAnswer =
        answerInput.value.trim();


    const correctAnswer =
        examQuestions[currentExamIndex].words;


    if (
        userAnswer === correctAnswer
    ) {

        examScore++;

    }


    currentExamIndex++;

    showExamQuestion();

}


// ------------------------------------------------------------
// 19. Exam 完成
// ------------------------------------------------------------

function finishExam() {

    const container =
        document.getElementById("exam-container");

    if (!container) return;


    container.innerHTML = `
        <div class="exam-result">

            <h2>Exam Finished</h2>

            <p>
                Score:
                <strong>
                    ${examScore} / ${examQuestions.length}
                </strong>
            </p>

            <button onclick="startExam()">
                Try Again
            </button>

        </div>
    `;

}


// ------------------------------------------------------------
// 20. Shuffle
// ------------------------------------------------------------

function shuffleArray(array) {

    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(Math.random() * (i + 1));


        [
            array[i],
            array[j]
        ] =
        [
            array[j],
            array[i]
        ];

    }

}


// ------------------------------------------------------------
// 21. HTML 安全处理
// ------------------------------------------------------------

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ------------------------------------------------------------
// 22. 给 HTML button 使用
// ------------------------------------------------------------

window.showPage = showPage;
window.startExam = startExam;
window.checkExamAnswer = checkExamAnswer;
