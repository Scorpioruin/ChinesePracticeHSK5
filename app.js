/* =========================================================
   CHINESE LEARNING WEBSITE
   HSK 5
========================================================= */


/* =========================================================
   JSON FILES
========================================================= */

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


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let vocabulary = [];
let paragraphs = [];

let currentLetter = "all";

let currentWords = [];
let currentWordIndex = 0;

let currentParagraphIndex = 0;

let examQuestions = [];
let examIndex = 0;
let examScore = 0;


/* =========================================================
   HIGHLIGHT SYSTEM
========================================================= */

const HIGHLIGHT_STORAGE_KEY =
  "chineseHSK5Highlights";

let highlights = [];

let pendingSelection = null;


/* =========================================================
   LOAD HIGHLIGHTS FROM LOCAL STORAGE
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


/* =========================================================
   SAVE HIGHLIGHTS
========================================================= */

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


/* =========================================================
   CREATE UNIQUE HIGHLIGHT ID
========================================================= */

function createHighlightId() {

  return (
    Date.now().toString(36) +
    Math.random()
      .toString(36)
      .substring(2, 9)
  );

}


/* =========================================================
   GET TEXT OFFSET INSIDE ELEMENT
========================================================= */

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
   GET HIGHLIGHTABLE PARENT
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

  return element.closest(
    ".highlightable"
  );

}


/* =========================================================
   SHOW HIGHLIGHT TOOLBAR
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


/* =========================================================
   HIDE HIGHLIGHT TOOLBAR
========================================================= */

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


/* =========================================================
   CHECK WHETHER RANGE IS VALID
========================================================= */

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
   HANDLE TEXT SELECTION
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
   PREVENT TOOLBAR FROM DISAPPEARING TOO EARLY
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
   CREATE HIGHLIGHT TARGET KEY
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
   INITIAL RENDER OF ALL HIGHLIGHTS
========================================================= */

function renderAllHighlights() {

  document
    .querySelectorAll(
      ".highlightable"
    )
    .forEach(
      element =>
        renderHighlightsForElement(
          element
        )
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
   CLOSE TOOLBAR WHEN CLICKING ELSEWHERE
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


/* =========================================================
   NAVIGATION CLICK
========================================================= */

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

      /*
        Vocabulary files should contain
        an array.
      */

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

      /*
        Missing files are allowed.
        The website continues loading.
      */

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

      /*
        Paragraph files normally contain
        one object:

        {
          "title": "...",
          "paragraph": "...",
          "Pinyin": "..."
        }

        This loader also supports an array.
      */

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

      /*
        Missing paragraph files are allowed.
      */

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
   ALPHABET BUTTONS
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


/* =========================================================
   ALPHABET CLICK
========================================================= */

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
   DISPLAY VOCABULARY
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
   SHOW WORD DETAIL
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
   FLASHCARD
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


/* =========================================================
   FLASHCARD CLICK
========================================================= */

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


/* =========================================================
   NEXT WORD
========================================================= */

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


/* =========================================================
   PREVIOUS WORD
========================================================= */

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


/* =========================================================
   PARAGRAPH COUNTER
========================================================= */

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


/* =========================================================
   NEXT PARAGRAPH
========================================================= */

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


/* =========================================================
   PREVIOUS PARAGRAPH
========================================================= */

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
   PINYIN TOGGLE
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

  /*
    Thailand time:
    UTC +07:00

    Exam:
    11 October 2026
    9:00 AM
  */

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
   EXAM
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


/* =========================================================
   START EXAM
========================================================= */

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


/* =========================================================
   SHOW EXAM QUESTION
========================================================= */

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


/* =========================================================
   EXAM RESULT
========================================================= */

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

  /*
    Load saved highlights FIRST.
  */

  loadHighlights();

  /*
    Load vocabulary and paragraphs.
  */

  await Promise.all(
    [
      loadVocabulary(),
      loadParagraphs()
    ]
  );

  /*
    Render saved highlights.
  */

  renderAllHighlights();

  console.log(
    "Chinese Learning website ready."
  );

}


/* =========================================================
   START WEBSITE
========================================================= */

initializeApp();
