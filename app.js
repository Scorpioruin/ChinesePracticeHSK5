const vocabularyLetters = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z"
];

const paragraphLetters = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z"
];

let vocabulary = [];
let paragraphs = [];

let currentLetter = "all";

let currentWords = [];
let currentWordIndex = 0;

let currentParagraphIndex = 0;

let examQuestions = [];
let examIndex = 0;
let examScore = 0;

const HIGHLIGHT_STORAGE_KEY =
  "chineseHSK5Highlights";

let highlights = [];
let pendingSelection = null;


/* =========================================================
   HIGHLIGHT SYSTEM
========================================================= */

function loadHighlights() {

  try {

    const saved =
      localStorage.getItem(
        HIGHLIGHT_STORAGE_KEY
      );

    if (!saved) {

      highlights = [];

      return;

    }

    const parsed =
      JSON.parse(saved);

    if (Array.isArray(parsed)) {

      highlights = parsed;

    } else {

      highlights = [];

    }

  } catch (error) {

    console.error(
      "Could not load highlights:",
      error
    );

    highlights = [];

  }

}


function saveHighlights() {

  try {

    localStorage.setItem(
      HIGHLIGHT_STORAGE_KEY,
      JSON.stringify(highlights)
    );

  } catch (error) {

    console.error(
      "Could not save highlights:",
      error
    );

  }

}


function createHighlightId() {

  return (
    Date.now().toString(36) +
    Math.random()
      .toString(36)
      .substring(2, 9)
  );

}


function getTextOffset(
  root,
  node,
  offset
) {

  const walker =
    document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT
    );

  let currentNode;
  let total = 0;

  while (
    currentNode =
      walker.nextNode()
  ) {

    if (
      currentNode === node
    ) {

      return total + offset;

    }

    total +=
      currentNode.nodeValue.length;

  }

  return total;

}


/* =========================================================
   GET HIGHLIGHTABLE ELEMENT

   IMPORTANT:
   Drag & Drop section is excluded completely.
========================================================= */

function getHighlightableElement(
  node
) {

  if (!node) {

    return null;

  }

  const element =
    node.nodeType === Node.TEXT_NODE
      ? node.parentElement
      : node;

  if (!element) {

    return null;

  }

  if (
    element.closest(
      "#hsk5-drag-drop-section"
    )
  ) {

    return null;

  }

  return element.closest(
    ".highlightable"
  );

}


/* =========================================================
   HIGHLIGHT TOOLBAR
========================================================= */

function showHighlightToolbar(
  rect
) {

  const toolbar =
    document.getElementById(
      "highlight-toolbar"
    );

  if (!toolbar) {

    return;

  }

  toolbar.classList.remove(
    "hidden"
  );

  const toolbarWidth =
    toolbar.offsetWidth;

  let left =
    rect.left +
    rect.width / 2;

  let top =
    rect.top;

  const halfWidth =
    toolbarWidth / 2;

  const minimum =
    halfWidth + 10;

  const maximum =
    window.innerWidth -
    halfWidth -
    10;

  left =
    Math.max(
      minimum,
      Math.min(
        left,
        maximum
      )
    );

  if (top < 80) {

    toolbar.style.transform =
      "translate(-50%, 10px)";

  } else {

    toolbar.style.transform =
      "translate(-50%, -100%)";

  }

  toolbar.style.left =
    `${left}px`;

  toolbar.style.top =
    `${top}px`;

}


function hideHighlightToolbar() {

  const toolbar =
    document.getElementById(
      "highlight-toolbar"
    );

  if (!toolbar) {

    return;

  }

  toolbar.classList.add(
    "hidden"
  );

  pendingSelection = null;

}


function isValidSelection(
  range
) {

  if (!range) {

    return false;

  }

  if (range.collapsed) {

    return false;

  }

  const selectedText =
    range.toString().trim();

  if (!selectedText) {

    return false;

  }

  return true;

}


/* =========================================================
   TEXT SELECTION
========================================================= */

document.addEventListener(
  "mouseup",
  function () {

    setTimeout(
      function () {

        const selection =
          window.getSelection();

        if (!selection) {

          return;

        }

        if (
          selection.rangeCount === 0
        ) {

          hideHighlightToolbar();

          return;

        }

        const range =
          selection.getRangeAt(0);

        if (
          !isValidSelection(range)
        ) {

          hideHighlightToolbar();

          return;

        }

        const startElement =
          getHighlightableElement(
            range.startContainer
          );

        const endElement =
          getHighlightableElement(
            range.endContainer
          );

        if (
          !startElement ||
          !endElement ||
          startElement !== endElement
        ) {

          hideHighlightToolbar();

          return;

        }

        const text =
          range.toString().trim();

        if (!text) {

          hideHighlightToolbar();

          return;

        }

        const startOffset =
          getTextOffset(
            startElement,
            range.startContainer,
            range.startOffset
          );

        const endOffset =
          getTextOffset(
            startElement,
            range.endContainer,
            range.endOffset
          );

        pendingSelection = {

          element:
            startElement,

          text:
            text,

          start:
            startOffset,

          end:
            endOffset

        };

        const rect =
          range.getBoundingClientRect();

        showHighlightToolbar(
          rect
        );

      },
      10
    );

  }
);


/* =========================================================
   TOOLBAR MOUSE HANDLING
========================================================= */

document.addEventListener(
  "mousedown",
  function (event) {

    const toolbar =
      document.getElementById(
        "highlight-toolbar"
      );

    if (
      toolbar &&
      toolbar.contains(event.target)
    ) {

      return;

    }

  }
);


/* =========================================================
   HIGHLIGHT TARGET
========================================================= */

function getHighlightTarget(
  element
) {

  return (
    element.dataset.highlightTarget ||
    ""
  );

}


/* =========================================================
   ADD HIGHLIGHT
========================================================= */

function addHighlight() {

  if (!pendingSelection) {

    return;

  }

  const selection =
    pendingSelection;

  const element =
    selection.element;

  if (
    element.closest(
      "#hsk5-drag-drop-section"
    )
  ) {

    hideHighlightToolbar();

    return;

  }

  const target =
    getHighlightTarget(element);

  if (!target) {

    console.warn(
      "Highlight target missing."
    );

    hideHighlightToolbar();

    return;

  }

  const newHighlight = {

    id:
      createHighlightId(),

    target:
      target,

    text:
      selection.text,

    start:
      selection.start,

    end:
      selection.end

  };

  const alreadyExists =
    highlights.some(
      highlight =>
        highlight.target === target &&
        highlight.start ===
          selection.start &&
        highlight.end ===
          selection.end
    );

  if (!alreadyExists) {

    highlights.push(
      newHighlight
    );

    saveHighlights();

  }

  renderHighlightsForElement(
    element
  );

  const browserSelection =
    window.getSelection();

  if (browserSelection) {

    browserSelection.removeAllRanges();

  }

  hideHighlightToolbar();

}


/* =========================================================
   REMOVE HIGHLIGHT
========================================================= */

function removeHighlight() {

  if (!pendingSelection) {

    return;

  }

  const selection =
    pendingSelection;

  const element =
    selection.element;

  if (
    element.closest(
      "#hsk5-drag-drop-section"
    )
  ) {

    hideHighlightToolbar();

    return;

  }

  const target =
    getHighlightTarget(element);

  const before =
    highlights.length;

  highlights =
    highlights.filter(
      highlight => {

        if (
          highlight.target !==
          target
        ) {

          return true;

        }

        const overlaps =
          highlight.start <
            selection.end &&
          highlight.end >
            selection.start;

        return !overlaps;

      }
    );

  if (
    highlights.length !== before
  ) {

    saveHighlights();

  }

  rerenderHighlightableElement(
    element
  );

  const browserSelection =
    window.getSelection();

  if (browserSelection) {

    browserSelection.removeAllRanges();

  }

  hideHighlightToolbar();

}


/* =========================================================
   RERENDER HIGHLIGHTABLE ELEMENT
========================================================= */

function rerenderHighlightableElement(
  element
) {

  if (!element) {

    return;

  }

  if (
    element.closest(
      "#hsk5-drag-drop-section"
    )
  ) {

    return;

  }

  const text =
    element.textContent;

  element.innerHTML = "";

  element.appendChild(
    document.createTextNode(text)
  );

  renderHighlightsForElement(
    element
  );

}


/* =========================================================
   RENDER HIGHLIGHTS
========================================================= */

function renderHighlightsForElement(
  element
) {

  if (!element) {

    return;

  }

  if (
    element.closest(
      "#hsk5-drag-drop-section"
    )
  ) {

    return;

  }

  const target =
    getHighlightTarget(element);

  if (!target) {

    return;

  }

  const relevantHighlights =
    highlights
      .filter(
        highlight =>
          highlight.target ===
          target
      )
      .sort(
        (a, b) =>
          a.start - b.start
      );

  if (
    relevantHighlights.length === 0
  ) {

    return;

  }

  const text =
    element.textContent;

  element.innerHTML = "";

  let position = 0;

  relevantHighlights.forEach(
    highlight => {

      if (
        highlight.start < 0 ||
        highlight.end > text.length ||
        highlight.start >=
          highlight.end
      ) {

        return;

      }

      if (
        highlight.start < position
      ) {

        return;

      }

      if (
        highlight.start > position
      ) {

        element.appendChild(
          document.createTextNode(
            text.substring(
              position,
              highlight.start
            )
          )
        );

      }

      const mark =
        document.createElement(
          "span"
        );

      mark.className =
        "highlight-mark";

      mark.dataset.highlightId =
        highlight.id;

      mark.textContent =
        text.substring(
          highlight.start,
          highlight.end
        );

      element.appendChild(
        mark
      );

      position =
        highlight.end;

    }
  );

  if (
    position < text.length
  ) {

    element.appendChild(
      document.createTextNode(
        text.substring(
          position
        )
      )
    );

  }

}


/* =========================================================
   RENDER ALL HIGHLIGHTS
========================================================= */

function renderAllHighlights() {

  document
    .querySelectorAll(
      ".highlightable"
    )
    .forEach(
      element => {

        if (
          element.closest(
            "#hsk5-drag-drop-section"
          )
        ) {

          return;

        }

        renderHighlightsForElement(
          element
        );

      }
    );

}


/* =========================================================
   HIGHLIGHT BUTTONS
========================================================= */

const highlightButton =
  document.getElementById(
    "highlight-selection"
  );

if (highlightButton) {

  highlightButton.addEventListener(
    "mousedown",
    function (event) {

      event.preventDefault();

    }
  );

  highlightButton.addEventListener(
    "click",
    addHighlight
  );

}


const removeHighlightButton =
  document.getElementById(
    "remove-highlight"
  );

if (removeHighlightButton) {

  removeHighlightButton.addEventListener(
    "mousedown",
    function (event) {

      event.preventDefault();

    }
  );

  removeHighlightButton.addEventListener(
    "click",
    removeHighlight
  );

}


/* =========================================================
   CLOSE TOOLBAR
========================================================= */

document.addEventListener(
  "click",
  function (event) {

    const toolbar =
      document.getElementById(
        "highlight-toolbar"
      );

    if (
      toolbar &&
      toolbar.contains(event.target)
    ) {

      return;

    }

    if (
      event.target.closest(
        ".highlightable"
      )
    ) {

      return;

    }

    hideHighlightToolbar();

  }
);


/* =========================================================
   NAVIGATION
========================================================= */

function showSection(
  sectionId
) {

  document
    .querySelectorAll(
      ".page-section"
    )
    .forEach(
      section =>
        section.classList.remove(
          "active-section"
        )
    );

  const section =
    document.getElementById(
      sectionId
    );

  if (section) {

    section.classList.add(
      "active-section"
    );

  }

  document
    .querySelectorAll(
      ".nav-btn"
    )
    .forEach(
      button => {

        button.classList.remove(
          "active"
        );

        if (
          button.dataset.section ===
          sectionId
        ) {

          button.classList.add(
            "active"
          );

        }

      }
    );

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  setTimeout(
    renderAllHighlights,
    100
  );

}


document.addEventListener(
  "click",
  function (event) {

    const button =
      event.target.closest(
        "[data-section]"
      );

    if (!button) {

      return;

    }

    showSection(
      button.dataset.section
    );

  }
);


/* =========================================================
   JSON LOADER
========================================================= */

async function loadJSON(
  file
) {

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

    return JSON.parse(text);

  } catch (error) {

    throw new Error(
      `${file} → Invalid JSON: ${error.message}`
    );

  }

}


/* =========================================================
   LOAD VOCABULARY
========================================================= */

async function loadVocabulary() {

  vocabulary = [];

  for (
    const letter of vocabularyLetters
  ) {

    const file =
      `./words/${letter}.json`;

    try {

      const data =
        await loadJSON(file);

      if (!Array.isArray(data)) {

        throw new Error(
          `${file} → Vocabulary JSON must be an array`
        );

      }

      data.forEach(
        word => {

          vocabulary.push({

            ...word,

            letter:
              letter.toUpperCase()

          });

        }
      );

    } catch (error) {

      console.warn(
        `Could not load ${file}:`,
        error.message
      );

    }

  }

  console.log(
    `Vocabulary loaded: ${vocabulary.length} words`
  );

  setupAlphabet();

  displayWords(
    vocabulary
  );

  updateStatistics();

  if (
    vocabulary.length > 0
  ) {

    currentWords =
      vocabulary;

    showFlashcard(0);

  }

}


/* =========================================================
   LOAD PARAGRAPHS
========================================================= */

async function loadParagraphs() {

  paragraphs = [];

  for (
    const letter of paragraphLetters
  ) {

    const file =
      `./paragraph/paragraph_${letter}.json`;

    try {

      const data =
        await loadJSON(file);

      if (Array.isArray(data)) {

        data.forEach(
          (paragraph, index) => {

            paragraphs.push({

              ...paragraph,

              id:
                paragraph.id ??
                index + 1,

              letter:
                letter.toUpperCase()

            });

          }
        );

      } else if (
        data &&
        typeof data === "object"
      ) {

        paragraphs.push({

          ...data,

          id:
            data.id ??
            1,

          letter:
            letter.toUpperCase()

        });

      } else {

        throw new Error(
          `${file} → Invalid paragraph format`
        );

      }

    } catch (error) {

      console.warn(
        `Could not load ${file}:`,
        error.message
      );

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


/* =========================================================
   ALPHABET
========================================================= */

function setupAlphabet() {

  const alphabetList =
    document.getElementById(
      "alphabet-list"
    );

  if (!alphabetList) {

    return;

  }

  alphabetList.innerHTML = "";

  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(
      ""
    );

  alphabet.forEach(
    letter => {

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

        button.disabled =
          true;

        button.classList.add(
          "disabled"
        );

      }

      alphabetList.appendChild(
        button
      );

    }
  );

}


document.addEventListener(
  "click",
  function (event) {

    const button =
      event.target.closest(
        ".alphabet-btn"
      );

    if (
      !button ||
      button.disabled
    ) {

      return;

    }

    document
      .querySelectorAll(
        ".alphabet-btn"
      )
      .forEach(
        btn =>
          btn.classList.remove(
            "active"
          )
      );

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

      displayWords(
        vocabulary.filter(
          word =>
            word.letter
              .toLowerCase() ===
            letter
        )
      );

    }

  }
);


/* =========================================================
   VOCABULARY DISPLAY
========================================================= */

function displayWords(
  words
) {

  const wordList =
    document.getElementById(
      "word-list"
    );

  if (!wordList) {

    return;

  }

  wordList.innerHTML = "";

  currentWords =
    words;

  if (
    words.length === 0
  ) {

    wordList.innerHTML =
      `
        <div class="empty-state">
          No vocabulary found.
        </div>
      `;

    return;

  }

  words.forEach(
    word => {

      const card =
        document.createElement(
          "div"
        );

      card.className =
        "word-card";

      card.innerHTML =
        `
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

      card.addEventListener(
        "click",
        function () {

          showWord(word);

        }
      );

      wordList.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   SHOW WORD
========================================================= */

function showWord(
  word
) {

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

    sentence.dataset.highlightTarget =
      `word-${word.letter}-${word.id}-sentence`;

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

  setTimeout(
    function () {

      if (sentence) {

        renderHighlightsForElement(
          sentence
        );

      }

    },
    0
  );

  const index =
    currentWords.findIndex(
      item =>
        item.id === word.id &&
        item.letter ===
          word.letter
    );

  if (index !== -1) {

    showFlashcard(index);

  }

}


/* =========================================================
   CLOSE WORD DETAIL
========================================================= */

const closeWordDetail =
  document.getElementById(
    "close-word-detail"
  );

if (closeWordDetail) {

  closeWordDetail.addEventListener(
    "click",
    function () {

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


/* =========================================================
   SEARCH
========================================================= */

const searchInput =
  document.getElementById(
    "search-input"
  );

if (searchInput) {

  searchInput.addEventListener(
    "input",
    function () {

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
                .toLowerCase() ===
              currentLetter
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
          word =>
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
            ||
            String(word.Sentences)
              .toLowerCase()
              .includes(query)
        );

      displayWords(
        results
      );

    }
  );

}


/* =========================================================
   FLASHCARDS
========================================================= */

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

  if (!word) {

    return;

  }

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


const flashcard =
  document.getElementById(
    "flashcard"
  );

if (flashcard) {

  flashcard.addEventListener(
    "click",
    function () {

      flashcard.classList.toggle(
        "flipped"
      );

    }
  );

}


const nextWord =
  document.getElementById(
    "next-word"
  );

if (nextWord) {

  nextWord.addEventListener(
    "click",
    function () {

      if (
        !currentWords.length
      ) {

        return;

      }

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


const previousWord =
  document.getElementById(
    "previous-word"
  );

if (previousWord) {

  previousWord.addEventListener(
    "click",
    function () {

      if (
        !currentWords.length
      ) {

        return;

      }

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


/* =========================================================
   READING
========================================================= */

function showParagraph(
  index
) {

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

  if (!paragraph) {

    return;

  }

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

    text.innerHTML = "";

    text.textContent =
      paragraph.paragraph;

    text.dataset.highlightTarget =
      `paragraph-${paragraph.letter}-${paragraph.id}-paragraph`;

  }

  if (pinyin) {

    pinyin.innerHTML = "";

    pinyin.textContent =
      paragraph.Pinyin;

    pinyin.dataset.highlightTarget =
      `paragraph-${paragraph.letter}-${paragraph.id}-pinyin`;

  }

  updateParagraphCounter();

  setTimeout(
    function () {

      if (text) {

        renderHighlightsForElement(
          text
        );

      }

      if (pinyin) {

        renderHighlightsForElement(
          pinyin
        );

      }

    },
    0
  );

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


function updateParagraphCounter() {

  const counter =
    document.getElementById(
      "paragraph-counter"
    );

  if (counter) {

    counter.textContent =
      `${currentParagraphIndex + 1} / ${paragraphs.length}`;

  }

}


const nextParagraph =
  document.getElementById(
    "next-paragraph"
  );

if (nextParagraph) {

  nextParagraph.addEventListener(
    "click",
    function () {

      if (
        !paragraphs.length
      ) {

        return;

      }

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


const previousParagraph =
  document.getElementById(
    "previous-paragraph"
  );

if (previousParagraph) {

  previousParagraph.addEventListener(
    "click",
    function () {

      if (
        !paragraphs.length
      ) {

        return;

      }

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


/* =========================================================
   PINYIN
========================================================= */

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
    function () {

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


/* =========================================================
   READING PROGRESS
========================================================= */

const readingProgress =
  document.getElementById(
    "reading-progress"
  );

window.addEventListener(
  "scroll",
  function () {

    if (!readingProgress) {

      return;

    }

    const scrollTop =
      window.scrollY;

    const documentHeight =
      document.documentElement
        .scrollHeight -
      window.innerHeight;

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
      ) *
      100;

    readingProgress.style.width =
      `${Math.min(
        progress,
        100
      )}%`;

  }
);


/* =========================================================
   STATISTICS
========================================================= */

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


/* =========================================================
   COUNTDOWN
========================================================= */

function updateCountdown() {

  const examDate =
    new Date(
      "2026-10-11T09:00:00+07:00"
    );

  const now =
    new Date();

  const difference =
    examDate.getTime() -
    now.getTime();

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


updateCountdown();

setInterval(
  updateCountdown,
  1000
);


/* =========================================================
   VOCABULARY EXAM
========================================================= */

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


function showExamQuestion() {

  const container =
    document.getElementById(
      "exam-container"
    );

  if (!container) {

    return;

  }

  if (
    examIndex >=
    examQuestions.length
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
        word.words !==
        question.words
    );

  const wrongAnswers =
    shuffle(
      [...otherWords]
    ).slice(
      0,
      3
    );

  const options =
    shuffle(
      [
        question,
        ...wrongAnswers
      ]
    );

  container.innerHTML =
    `
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

          ${options
            .map(
              option =>
                `
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
            )
            .join("")}

        </div>

      </div>
    `;

  container
    .querySelectorAll(
      ".exam-option"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          function () {

            const answer =
              button.dataset.answer;

            if (
              answer ===
              question.words
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
                    btn.dataset.answer ===
                    question.words
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
                  btn.disabled = true
              );

            setTimeout(
              function () {

                examIndex++;

                showExamQuestion();

              },
              900
            );

          }
        );

      }
    );

}


function showExamResult() {

  const container =
    document.getElementById(
      "exam-container"
    );

  if (!container) {

    return;

  }

  container.innerHTML =
    `
      <div class="exam-result">

        <p class="section-label">
          COMPLETE
        </p>

        <h3>
          Practice Complete
        </h3>

        <div class="exam-score">

          ${examScore} /
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


/* =========================================================
   SHUFFLE
========================================================= */

function shuffle(
  array
) {

  for (
    let i =
      array.length - 1;
    i > 0;
    i--
  ) {

    const j =
      Math.floor(
        Math.random() *
        (i + 1)
      );

    [
      array[i],
      array[j]
    ] = [
      array[j],
      array[i]
    ];

  }

  return array;

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
  value
) {

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


/* =========================================================
   INITIALIZE
========================================================= */

async function initializeApp() {

  console.log(
    "Starting Chinese Learning website..."
  );

  loadHighlights();

  await Promise.all(
    [
      loadVocabulary(),
      loadParagraphs()
    ]
  );

  renderAllHighlights();

  console.log(
    "Chinese Learning website ready."
  );

}


initializeApp();


/* =========================================================
   HSK 5 VOCABULARY DRAG & DROP
========================================================= */

let dragDropPassages = [];

let dragDropPassageIndex = 0;

let dragDropAnswers = {};

let dragDropScore = 0;

let dragDropStarted = false;

const DRAG_DROP_JSON_FILE =
  "./HSK5_Vocabulary_DragDrop_25_Passages.json";


/* =========================================================
   LOAD DRAG & DROP JSON
========================================================= */

async function loadDragDropPractice() {

  try {

    const response =
      await fetch(
        DRAG_DROP_JSON_FILE,
        {
          cache: "no-store"
        }
      );

    if (!response.ok) {

      throw new Error(
        `${DRAG_DROP_JSON_FILE} → HTTP ${response.status}`
      );

    }

    const data =
      await response.json();

    if (
      !data ||
      !Array.isArray(data.passages)
    ) {

      throw new Error(
        "Invalid HSK 5 drag-and-drop JSON format."
      );

    }

    dragDropPassages =
      data.passages;

    console.log(
      `HSK 5 Drag & Drop loaded: ${dragDropPassages.length} passages`
    );

    createDragDropInterface();

  } catch (error) {

    console.error(
      "Could not load HSK 5 Drag & Drop practice:",
      error
    );

  }

}


/* =========================================================
   CREATE DRAG & DROP INTERFACE
========================================================= */

function createDragDropInterface() {

  if (
    document.getElementById(
      "hsk5-drag-drop-section"
    )
  ) {

    return;

  }

  const section =
    document.createElement(
      "section"
    );

  section.id =
    "hsk5-drag-drop-section";

  section.className =
    "page-section";

  section.innerHTML =
    `
      <div class="section-inner hsk5-drag-drop-wrapper">

        <div class="hsk5-drag-drop-header">

          <p class="section-label">
            HSK 5 VOCABULARY PRACTICE
          </p>

          <h2>
            Drag & Drop Reading
          </h2>

          <p id="hsk5-drag-drop-description">
            Read the passage and drag the correct vocabulary
            into each blank.
          </p>

        </div>


        <div class="hsk5-drag-drop-controls">

          <button
            id="hsk5-drag-drop-prev"
            class="secondary-btn"
            type="button"
          >
            ← Previous
          </button>

          <div
            id="hsk5-drag-drop-counter"
            class="hsk5-drag-drop-counter"
          >
            1 / ${dragDropPassages.length}
          </div>

          <button
            id="hsk5-drag-drop-next"
            class="primary-btn"
            type="button"
          >
            Next →
          </button>

        </div>


        <div
          id="hsk5-drag-drop-content"
          class="hsk5-drag-drop-content"
        ></div>

      </div>
    `;

  const main =
    document.querySelector(
      "main"
    );

  if (main) {

    main.appendChild(
      section
    );

  } else {

    document.body.appendChild(
      section
    );

  }

  createDragDropNavigationButton();


  const previous =
    document.getElementById(
      "hsk5-drag-drop-prev"
    );

  const next =
    document.getElementById(
      "hsk5-drag-drop-next"
    );


  if (previous) {

    previous.addEventListener(
      "click",
      function () {

        if (
          dragDropPassageIndex > 0
        ) {

          dragDropPassageIndex--;

          dragDropAnswers = {};

          renderDragDropPassage();

          window.scrollTo({
            top: 0,
            behavior: "smooth"
          });

        }

      }
    );

  }


  if (next) {

    next.addEventListener(
      "click",
      function () {

        if (
          dragDropPassageIndex <
          dragDropPassages.length - 1
        ) {

          dragDropPassageIndex++;

          dragDropAnswers = {};

          renderDragDropPassage();

          window.scrollTo({
            top: 0,
            behavior: "smooth"
          });

        }

      }
    );

  }


  renderDragDropPassage();

}


/* =========================================================
   CREATE DRAG & DROP NAVIGATION BUTTON
========================================================= */

function createDragDropNavigationButton() {

  if (
    document.querySelector(
      '[data-section="hsk5-drag-drop-section"]'
    )
  ) {

    return;

  }

  const nav =
    document.querySelector(
      "nav"
    );

  if (!nav) {

    return;

  }

  const button =
    document.createElement(
      "button"
    );

  button.type =
    "button";

  button.className =
    "nav-btn";

  button.dataset.section =
    "hsk5-drag-drop-section";

  button.textContent =
    "Drag & Drop";

  nav.appendChild(
    button
  );

}


/* =========================================================
   RENDER CURRENT DRAG & DROP PASSAGE

   IMPORTANT:
   There is NO call to renderHighlightsForElement()
   here.

   The passage is deliberately independent from
   the normal Highlight system.
========================================================= */

function renderDragDropPassage() {

  const container =
    document.getElementById(
      "hsk5-drag-drop-content"
    );

  if (
    !container ||
    !dragDropPassages.length
  ) {

    return;

  }

  const passage =
    dragDropPassages[
      dragDropPassageIndex
    ];

  if (!passage) {

    return;

  }

  dragDropAnswers = {};


  const words =
    passage.questions.map(
      question =>
        question.answer
    );


  const shuffledWords =
    shuffle(
      [...words]
    );


  let passageHTML =
    escapeHTML(
      passage.passage
    );


  /* -------------------------------------------------------
     Replace every 【answer】 marker with a drop zone.
  ------------------------------------------------------- */

  passage.questions.forEach(
    question => {

      const escapedWord =
        escapeHTML(
          question.answer
        );

      const blank =
        `
          <span
            class="hsk5-drag-drop-blank"
            data-answer="${escapedWord}"
            data-question-id="${question.id}"
            id="dragdrop-blank-${question.id}"
            ondragover="allowHSK5DragDrop(event)"
            ondrop="dropHSK5Vocabulary(event)"
          >______</span>
        `;

      passageHTML =
        passageHTML.replace(
          `【${escapedWord}】`,
          blank
        );

    }
  );


  /* -------------------------------------------------------
     Fallback replacement.
  ------------------------------------------------------- */

  passage.questions.forEach(
    question => {

      const rawWord =
        question.answer;

      const escapedWord =
        escapeHTML(
          rawWord
        );

      if (
        passageHTML.includes(
          `【${escapedWord}】`
        )
      ) {

        const blank =
          `
            <span
              class="hsk5-drag-drop-blank"
              data-answer="${escapedWord}"
              data-question-id="${question.id}"
              id="dragdrop-blank-${question.id}"
              ondragover="allowHSK5DragDrop(event)"
              ondrop="dropHSK5Vocabulary(event)"
            >______</span>
          `;

        passageHTML =
          passageHTML.replace(
            `【${escapedWord}】`,
            blank
          );

      }

    }
  );


  /* -------------------------------------------------------
     Vocabulary word bank.
  ------------------------------------------------------- */

  const optionHTML =
    shuffledWords
      .map(
        word => {

          const escaped =
            escapeHTML(
              word
            );

          return `
            <div
              class="hsk5-drag-word"
              draggable="true"
              data-word="${escaped}"
              ondragstart="dragHSK5Vocabulary(event)"
            >
              ${escaped}
            </div>
          `;

        }
      )
      .join("");


  /* -------------------------------------------------------
     Render passage.
     
     IMPORTANT:
     Do NOT add "highlightable" here.
  ------------------------------------------------------- */

  container.innerHTML =
    `
      <div class="hsk5-drag-drop-meta">

        <span>
          Passage ${passage.id}
          /
          ${dragDropPassages.length}
        </span>

        <span>
          ${escapeHTML(
            passage.level || "HSK 5"
          )}
        </span>

        <span>
          ${
            passage.wordCountTarget ||
            passage.questions.length
          }
          vocabulary targets
        </span>

        <span>
          ${
            passage.estimatedReadingMinutes ||
            30
          }
          min
        </span>

      </div>


      <h3 class="hsk5-drag-drop-title">
        ${escapeHTML(
          passage.title
        )}
      </h3>


      <div
        class="hsk5-drag-drop-word-bank"
        id="hsk5-drag-drop-word-bank"
      >

        <div class="hsk5-drag-drop-bank-title">
          Vocabulary
        </div>

        <div class="hsk5-drag-drop-options">
          ${optionHTML}
        </div>

      </div>


      <article
        class="hsk5-drag-drop-passage"
        data-highlight-target="hsk5-drag-drop-passage-${passage.id}"
      >
        ${passageHTML}
      </article>


      <div class="hsk5-drag-drop-actions">

        <button
          id="hsk5-drag-drop-check"
          class="primary-btn"
          type="button"
        >
          Check Answers
        </button>

        <button
          id="hsk5-drag-drop-reset"
          class="secondary-btn"
          type="button"
        >
          Reset
        </button>

      </div>


      <div
        id="hsk5-drag-drop-result"
        class="hsk5-drag-drop-result"
      ></div>
    `;


  setupDragDropButtons();

  updateDragDropCounter();

}


/* =========================================================
   DRAG START
========================================================= */

function dragHSK5Vocabulary(
  event
) {

  const word =
    event.currentTarget.dataset.word;

  if (
    event.dataTransfer
  ) {

    event.dataTransfer.setData(
      "text/plain",
      word
    );

    event.dataTransfer.effectAllowed =
      "move";

  }

}


/* =========================================================
   DRAG OVER
========================================================= */

function allowHSK5DragDrop(
  event
) {

  event.preventDefault();

  if (
    event.dataTransfer
  ) {

    event.dataTransfer.dropEffect =
      "move";

  }

}


/* =========================================================
   DROP VOCABULARY
========================================================= */

function dropHSK5Vocabulary(
  event
) {

  event.preventDefault();

  const word =
    event.dataTransfer
      ? event.dataTransfer.getData(
          "text/plain"
        )
      : "";

  if (!word) {

    return;

  }

  const blank =
    event.currentTarget;

  blank.textContent =
    word;

  blank.classList.add(
    "filled"
  );

  blank.classList.remove(
    "correct",
    "wrong"
  );

  blank.dataset.selectedWord =
    word;

  dragDropAnswers[
    blank.dataset.questionId
  ] =
    word;

}


/* =========================================================
   CHECK DRAG & DROP ANSWERS
========================================================= */

function checkHSK5DragDropAnswers() {

  const passage =
    dragDropPassages[
      dragDropPassageIndex
    ];

  if (!passage) {

    return;

  }

  let correct = 0;

  let answered = 0;


  passage.questions.forEach(
    question => {

      const blank =
        document.getElementById(
          `dragdrop-blank-${question.id}`
        );

      if (!blank) {

        return;

      }

      const selected =
        blank.dataset.selectedWord ||
        "";


      if (selected) {

        answered++;

      }


      blank.classList.remove(
        "correct",
        "wrong"
      );


      if (
        selected ===
        question.answer
      ) {

        correct++;

        blank.classList.add(
          "correct"
        );

      } else if (selected) {

        blank.classList.add(
          "wrong"
        );

      }

    }
  );


  dragDropScore =
    correct;


  const result =
    document.getElementById(
      "hsk5-drag-drop-result"
    );


  if (result) {

    result.innerHTML =
      `
        <strong>
          ${correct} / ${passage.questions.length}
        </strong>

        <span>
          ${answered}
          answered
          ·
          ${
            passage.questions.length -
            answered
          }
          unanswered
        </span>
      `;

  }

}


/* =========================================================
   RESET DRAG & DROP
========================================================= */

function resetHSK5DragDrop() {

  dragDropAnswers = {};

  const passage =
    dragDropPassages[
      dragDropPassageIndex
    ];

  if (!passage) {

    return;

  }


  passage.questions.forEach(
    question => {

      const blank =
        document.getElementById(
          `dragdrop-blank-${question.id}`
        );

      if (!blank) {

        return;

      }

      blank.textContent =
        "______";

      blank.classList.remove(
        "filled",
        "correct",
        "wrong"
      );

      delete blank.dataset.selectedWord;

    }
  );


  const result =
    document.getElementById(
      "hsk5-drag-drop-result"
    );

  if (result) {

    result.innerHTML =
      "";

  }

}


/* =========================================================
   DRAG & DROP BUTTONS
========================================================= */

function setupDragDropButtons() {

  const check =
    document.getElementById(
      "hsk5-drag-drop-check"
    );

  const reset =
    document.getElementById(
      "hsk5-drag-drop-reset"
    );


  if (check) {

    check.addEventListener(
      "click",
      checkHSK5DragDropAnswers
    );

  }


  if (reset) {

    reset.addEventListener(
      "click",
      resetHSK5DragDrop
    );

  }

}


/* =========================================================
   DRAG & DROP COUNTER
========================================================= */

function updateDragDropCounter() {

  const counter =
    document.getElementById(
      "hsk5-drag-drop-counter"
    );

  if (!counter) {

    return;

  }

  counter.textContent =
    `${dragDropPassageIndex + 1} / ${dragDropPassages.length}`;


  const previous =
    document.getElementById(
      "hsk5-drag-drop-prev"
    );

  const next =
    document.getElementById(
      "hsk5-drag-drop-next"
    );


  if (previous) {

    previous.disabled =
      dragDropPassageIndex === 0;

  }


  if (next) {

    next.disabled =
      dragDropPassageIndex ===
      dragDropPassages.length - 1;

  }

}


/* =========================================================
   INITIALIZE DRAG & DROP
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    loadDragDropPractice();

  }
);
