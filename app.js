/* =========================================================
   CHINESE LEARNING WEBSITE
   HSK 5
========================================================= */


/* =========================================================
   JSON FILES
========================================================= */

const vocabularyLetters = [
  "a", "b", "c", "d", "e", "f", "g",
  "h", "i", "j", "k", "l", "m", "n",
  "o", "p", "q", "r", "s", "t", "u",
  "v", "w", "x", "y", "z"
];


const paragraphLetters = [
  "a", "b", "c", "d", "e", "f", "g",
  "h", "i", "j", "k", "l", "m", "n",
  "o", "p", "q", "r", "s", "t", "u",
  "v", "w", "x", "y", "z"
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
   HIGHLIGHT - LOAD
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

    highlights =
      Array.isArray(parsed)
        ? parsed
        : [];

  } catch (error) {

    console.error(
      "Could not load highlights:",
      error
    );

    highlights = [];

  }

}


/* =========================================================
   HIGHLIGHT - SAVE
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
   HIGHLIGHT - ID
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
   HIGHLIGHT - TEXT OFFSET
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
   HIGHLIGHT - GET ELEMENT
========================================================= */

function getHighlightableElement(node) {

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
   HIGHLIGHT - TOOLBAR
========================================================= */

function showHighlightToolbar(rect) {

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


/* =========================================================
   HIGHLIGHT - SELECTION
========================================================= */

function isValidSelection(range) {

  if (!range) {

    return false;

  }

  if (range.collapsed) {

    return false;

  }

  return Boolean(
    range.toString().trim()
  );

}


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

        showHighlightToolbar(
          range.getBoundingClientRect()
        );

      },
      10
    );

  }
);


/* =========================================================
   HIGHLIGHT - TARGET
========================================================= */

function getHighlightTarget(element) {

  if (!element) {

    return "";

  }

  return (
    element.dataset.highlightTarget ||
    ""
  );

}


/* =========================================================
   HIGHLIGHT - ADD
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

    hideHighlightToolbar();
    return;

  }

  const exists =
    highlights.some(
      highlight =>
        highlight.target === target &&
        highlight.start ===
          selection.start &&
        highlight.end ===
          selection.end
    );

  if (!exists) {

    highlights.push({

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

    });

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
   HIGHLIGHT - REMOVE
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

  saveHighlights();

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
   HIGHLIGHT - RENDER
========================================================= */

function renderHighlightsForElement(element) {

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

  const relevant =
    highlights
      .filter(
        highlight =>
          highlight.target === target
      )
      .sort(
        (a, b) =>
          a.start - b.start
      );

  if (!relevant.length) {

    return;

  }

  const text =
    element.textContent;

  element.innerHTML = "";

  let position = 0;

  relevant.forEach(
    highlight => {

      if (
        highlight.start < 0 ||
        highlight.end > text.length ||
        highlight.start >=
          highlight.end ||
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

      element.appendChild(mark);

      position =
        highlight.end;

    }
  );

  if (
    position < text.length
  ) {

    element.appendChild(
      document.createTextNode(
        text.substring(position)
      )
    );

  }

}


function rerenderHighlightableElement(element) {

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
   HIGHLIGHT - BUTTONS
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
   NAVIGATION
========================================================= */

function showSection(sectionId) {

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

  /*
    Load all vocabulary files in parallel.

    This is intentionally done with Promise.all so that one
    missing file does NOT block the other alphabet files.
  */

  const results = await Promise.all(
    vocabularyLetters.map(
      async letter => {

        const file =
          `./words/${letter}.json`;

        try {

          const data =
            await loadJSON(file);

          let list = data;

          /*
            Support both:

            [
              {...},
              {...}
            ]

            and:

            {
              words: [...]
            }
          */

          if (
            !Array.isArray(list) &&
            list &&
            typeof list === "object"
          ) {

            if (Array.isArray(list.words)) {
              list = list.words;
            } else if (Array.isArray(list.data)) {
              list = list.data;
            } else if (Array.isArray(list.vocabulary)) {
              list = list.vocabulary;
            }

          }

          if (!Array.isArray(list)) {

            throw new Error(
              `${file} → Vocabulary JSON must contain an array`
            );

          }

          return {
            letter,
            words: list
          };

        } catch (error) {

          console.warn(
            `Could not load ${file}:`,
            error.message
          );

          return {
            letter,
            words: []
          };

        }

      }
    )
  );


  /*
    Convert every vocabulary item into one consistent
    internal structure.

    The filename is the authoritative alphabet because the
    website stores vocabulary as words/a.json ... words/z.json.
  */

  results.forEach(
    result => {

      result.words.forEach(
        (word, index) => {

          if (
            !word ||
            typeof word !== "object"
          ) {

            return;

          }

          vocabulary.push({

            ...word,

            letter:
              result.letter.toUpperCase(),

            _index:
              index

          });

        }
      );

    }
  );


  /*
    Keep the vocabulary in alphabetical file order.
  */

  vocabulary.sort(
    (a, b) => {

      const letterA =
        String(a.letter || "");

      const letterB =
        String(b.letter || "");

      if (letterA !== letterB) {
        return letterA.localeCompare(letterB);
      }

      return String(
        getVocabularyWord(a)
      ).localeCompare(
        String(getVocabularyWord(b)),
        "zh-Hans"
      );

    }
  );


  console.log(
    `Vocabulary loaded: ${vocabulary.length} words`
  );


  /*
    Setup the alphabet even when there are zero words.
    This guarantees that the A-Z controls are visible.
  */

  setupAlphabet();


  displayWords(
    vocabulary
  );


  updateStatistics();

}


/* =========================================================
   VOCABULARY FIELD HELPERS
========================================================= */

function getVocabularyWord(word) {

  if (!word) {
    return "";
  }

  return (
    word.words ??
    word.word ??
    word.Word ??
    word.Chinese ??
    word.chinese ??
    word.term ??
    ""
  );

}


function getVocabularyPinyin(word) {

  if (!word) {
    return "";
  }

  return (
    word.Pinyin ??
    word.pinyin ??
    word.PINYIN ??
    ""
  );

}


function getVocabularyMeaning(word) {

  if (!word) {
    return "";
  }

  return (
    word.Meaning ??
    word.meaning ??
    word.English ??
    word.english ??
    word.translation ??
    ""
  );

}


/*
  Example sentence helper.

  Different vocabulary files may use slightly different
  field names. The website now supports all common variants
  instead of depending only on "Sentences".
*/

function getExampleSentence(word) {

  if (!word) {
    return "";
  }


  const possibleFields = [

    "Sentences",
    "Sentence",
    "sentence",
    "sentences",

    "ExampleSentence",
    "exampleSentence",
    "example_sentence",

    "Example",
    "example",

    "Examples",
    "examples"

  ];


  for (
    const field of possibleFields
  ) {

    const value =
      word[field];


    if (
      value === undefined ||
      value === null
    ) {

      continue;

    }


    if (Array.isArray(value)) {

      const text =
        value
          .map(item => String(item ?? "").trim())
          .filter(Boolean)
          .join(" ");


      if (text) {
        return text;
      }


      continue;

    }


    const text =
      String(value).trim();


    if (text) {
      return text;
    }

  }


  return "";

}


/* =========================================================
   ALPHABET FILTER
========================================================= */

function setupAlphabet() {

  let alphabetList =
    document.getElementById(
      "alphabet-list"
    );


  /*
    If the HTML is missing #alphabet-list for any reason,
    create it automatically instead of silently failing.
  */

  if (!alphabetList) {

    const wrapper =
      document.querySelector(
        ".alphabet-wrapper"
      );


    if (wrapper) {

      alphabetList =
        document.createElement(
          "div"
        );

      alphabetList.id =
        "alphabet-list";

      alphabetList.className =
        "alphabet-list";


      wrapper.appendChild(
        alphabetList
      );

    }

  }


  if (!alphabetList) {

    console.error(
      "Alphabet filter container #alphabet-list was not found."
    );

    return;

  }


  alphabetList.innerHTML =
    "";


  /*
    Make sure the wrapper is visible even if an older CSS file
    is still cached.
  */

  const wrapper =
    document.querySelector(
      ".alphabet-wrapper"
    );


  if (wrapper) {

    wrapper.style.display =
      "flex";

    wrapper.style.flexWrap =
      "wrap";

    wrapper.style.visibility =
      "visible";

    wrapper.style.opacity =
      "1";

  }


  alphabetList.style.display =
    "flex";

  alphabetList.style.flexWrap =
    "wrap";

  alphabetList.style.gap =
    "6px";

  alphabetList.style.width =
    "100%";

  alphabetList.style.visibility =
    "visible";

  alphabetList.style.opacity =
    "1";


  const allButton =
    document.querySelector(
      '.alphabet-btn[data-letter="all"]'
    );


  if (allButton) {

    allButton.classList.add(
      "active"
    );

    allButton.style.display =
      "inline-flex";

  }


  "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    .split("")
    .forEach(
      letter => {

        const button =
          document.createElement(
            "button"
          );


        button.type =
          "button";


        button.className =
          "alphabet-btn";


        button.textContent =
          letter;


        button.dataset.letter =
          letter.toLowerCase();


        /*
          A letter is enabled only if at least one loaded
          vocabulary item belongs to that file.
        */

        const exists =
          vocabulary.some(
            word =>
              String(
                word.letter || ""
              ).toLowerCase() ===
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


    currentLetter =
      (
        button.dataset.letter ||
        "all"
      ).toLowerCase();


    const query =
      document.getElementById(
        "search-input"
      )?.value
        ?.trim()
        ?.toLowerCase() ||
      "";


    filterAndDisplayVocabulary(
      query,
      currentLetter
    );

  }
);


/* =========================================================
   FILTER VOCABULARY
========================================================= */

function filterAndDisplayVocabulary(
  query = "",
  letter = currentLetter
) {

  let wordsToSearch =
    vocabulary;


  if (
    letter &&
    letter !== "all"
  ) {

    wordsToSearch =
      vocabulary.filter(
        word =>
          String(
            word.letter || ""
          ).toLowerCase() ===
          letter.toLowerCase()
      );

  }


  const normalizedQuery =
    String(query)
      .trim()
      .toLowerCase();


  if (!normalizedQuery) {

    displayWords(
      wordsToSearch
    );

    return;

  }


  const results =
    wordsToSearch.filter(
      word => {

        const chinese =
          String(
            getVocabularyWord(word)
          ).toLowerCase();


        const pinyin =
          String(
            getVocabularyPinyin(word)
          ).toLowerCase();


        const meaning =
          String(
            getVocabularyMeaning(word)
          ).toLowerCase();


        const sentence =
          String(
            getExampleSentence(word)
          ).toLowerCase();


        return (
          chinese.includes(
            normalizedQuery
          ) ||

          pinyin.includes(
            normalizedQuery
          ) ||

          meaning.includes(
            normalizedQuery
          ) ||

          sentence.includes(
            normalizedQuery
          )
        );

      }
    );


  displayWords(
    results
  );

}


/* =========================================================
   DISPLAY VOCABULARY
========================================================= */

function displayWords(words) {

  const wordList =
    document.getElementById(
      "word-list"
    );


  if (!wordList) {

    return;

  }


  wordList.innerHTML =
    "";


  currentWords =
    Array.isArray(words)
      ? words
      : [];


  if (!currentWords.length) {

    wordList.innerHTML =
      `
        <div class="empty-state">
          No vocabulary found.
        </div>
      `;


    return;

  }


  currentWords.forEach(
    word => {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "word-card";


      const chinese =
        getVocabularyWord(word);


      const pinyin =
        getVocabularyPinyin(word);


      const meaning =
        getVocabularyMeaning(word);


      card.innerHTML =
        `
          <div class="word-card-main">

            <h3>
              ${escapeHTML(chinese)}
            </h3>

            <p class="word-pinyin">
              ${escapeHTML(pinyin)}
            </p>

            <p class="word-meaning">
              ${escapeHTML(meaning)}
            </p>

          </div>

          <div class="word-card-arrow">
            →
          </div>
        `;


      card.addEventListener(
        "click",
        function () {

          showWord(
            word
          );

        }
      );


      wordList.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   WORD DETAIL
   INCLUDING EXAMPLE SENTENCE
========================================================= */

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


  const chinese =
    getVocabularyWord(
      word
    );


  const pinyinText =
    getVocabularyPinyin(
      word
    );


  const meaningText =
    getVocabularyMeaning(
      word
    );


  const sentenceText =
    getExampleSentence(
      word
    );


  if (title) {

    title.textContent =
      chinese || "—";

  }


  if (pinyin) {

    pinyin.textContent =
      pinyinText || "—";

  }


  if (meaning) {

    meaning.textContent =
      meaningText || "—";

  }


  if (sentence) {

    /*
      Always clear previous sentence first.
      This prevents the previous word's sentence from
      remaining in the modal.
    */

    sentence.innerHTML =
      "";


    sentence.textContent =
      sentenceText ||
      "No example sentence available.";


    sentence.dataset.highlightTarget =
      `word-${String(
        word.letter || "x"
      ).toLowerCase()}-${String(
        word.id ??
        word._index ??
        Date.now()
      )}-sentence`;

  }


  const detail =
    document.getElementById(
      "word-detail"
    );


  if (detail) {

    detail.classList.remove(
      "hidden"
    );


    detail.style.display =
      "flex";

  }


  setTimeout(
    function () {

      if (sentence) {

        /*
          Do not destroy the sentence if there are no
          saved highlights.
        */

        const target =
          sentence.dataset.highlightTarget;


        const hasHighlights =
          highlights.some(
            item =>
              item.target ===
              target
          );


        if (hasHighlights) {

          rerenderHighlightableElement(
            sentence
          );

        }

      }

    },
    0
  );

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


/* Close modal when clicking the dark background */

const wordDetailModal =
  document.getElementById(
    "word-detail"
  );


if (wordDetailModal) {

  wordDetailModal.addEventListener(
    "click",
    function (event) {

      if (
        event.target ===
        wordDetailModal
      ) {

        wordDetailModal.classList.add(
          "hidden"
        );

      }

    }
  );

}


/* Close modal with Escape */

document.addEventListener(
  "keydown",
  function (event) {

    if (
      event.key ===
      "Escape"
    ) {

      const detail =
        document.getElementById(
          "word-detail"
        );


      if (
        detail &&
        !detail.classList.contains(
          "hidden"
        )
      ) {

        detail.classList.add(
          "hidden"
        );

      }

    }

  }
);


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


      filterAndDisplayVocabulary(
        query,
        currentLetter
      );

    }
  );

}


/* =========================================================
   READING
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


  if (paragraphs.length) {

    showParagraph(0);

  }


  updateStatistics();

}


function showParagraph(index) {

  if (!paragraphs.length) {

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
      paragraph.title ||
      paragraph.Title ||
      "";

  }


  if (text) {

    text.innerHTML =
      "";

    text.textContent =
      paragraph.paragraph ||
      paragraph.Paragraph ||
      paragraph.text ||
      paragraph.Text ||
      "";

    text.dataset.highlightTarget =
      `paragraph-${paragraph.letter}-${paragraph.id}-paragraph`;

  }


  if (pinyin) {

    pinyin.innerHTML =
      "";

    pinyin.textContent =
      paragraph.Pinyin ||
      paragraph.pinyin ||
      "";

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

}


function updateParagraphCounter() {

  const counter =
    document.getElementById(
      "paragraph-counter"
    );


  if (!counter) {

    return;

  }


  counter.textContent =
    `${currentParagraphIndex + 1} / ${paragraphs.length}`;

}


const nextParagraph =
  document.getElementById(
    "next-paragraph"
  );


if (nextParagraph) {

  nextParagraph.addEventListener(
    "click",
    function () {

      if (!paragraphs.length) {

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

      if (!paragraphs.length) {

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


      togglePinyin.textContent =
        paragraphPinyin.classList.contains(
          "hidden"
        )
          ? "Show Pinyin"
          : "Hide Pinyin";

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
        window.scrollY /
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
   COLLOCATION
========================================================= */

let collocationSets = [];

let currentCollocationFileIndex =
  0;

let currentCollocationQuestionIndex =
  0;

let collocationSelected =
  new Set();

let collocationChecked =
  false;

let collocationScore =
  0;

let collocationAnswered =
  0;

const COLLOCATION_MAX_FILES =
  10;


/* =========================================================
   COLLOCATION FILE LIST
========================================================= */

function getCollocationFileList() {

  return Array.from(
    {
      length:
        COLLOCATION_MAX_FILES
    },
    (_, index) =>
      `./collocations/${index + 1}.json`
  );

}


/* =========================================================
   LOAD COLLOCATION FILES

   Missing files are ignored.
   Only existing JSON files appear.
========================================================= */

async function loadCollocations() {

  collocationSets = [];

  const files =
    getCollocationFileList();


  for (
    let i = 0;
    i < files.length;
    i++
  ) {

    try {

      const data =
        await loadJSON(
          files[i]
        );


      if (
        !Array.isArray(data)
      ) {

        throw new Error(
          `${files[i]} → Collocation JSON must be an array`
        );

      }


      collocationSets.push({

        fileNumber:
          i + 1,

        file:
          files[i],

        questions:
          data

      });


    } catch (error) {

      /*
        Missing 2.json, 3.json, etc.
        are completely ignored.
      */

      console.warn(
        `Collocation file not loaded: ${files[i]} → ${error.message}`
      );

    }

  }


  console.log(
    `Collocation files loaded: ${collocationSets.length}`
  );


  createCollocationInterface();

}


/* =========================================================
   CREATE COLLOCATION INTERFACE
========================================================= */

function createCollocationInterface() {

  let section =
    document.getElementById(
      "collocation"
    );


  if (!section) {

    section =
      document.createElement(
        "section"
      );

    section.id =
      "collocation";

    section.className =
      "page-section";


    const main =
      document.querySelector(
        "main"
      );


    if (main) {

      main.appendChild(
        section
      );

    }

  }


  if (!section) {

    return;

  }


  section.innerHTML =
    `
      <div class="section-inner collocation-wrapper">

        <div class="collocation-header">

          <p class="section-label">
            HSK 5 VOCABULARY
          </p>

          <h2>
            词语搭配
          </h2>

          <p>
            Choose all words that can naturally
            form a collocation with the main word.
          </p>

        </div>


        <div class="collocation-file-bar">

          <button
            id="collocation-file-prev"
            class="secondary-btn"
            type="button"
          >
            ← Previous Set
          </button>


          <div
            id="collocation-file-name"
          >
            Loading...
          </div>


          <button
            id="collocation-file-next"
            class="secondary-btn"
            type="button"
          >
            Next Set →
          </button>

        </div>


        <div
          id="collocation-content"
        ></div>

      </div>
    `;


  const nav =
    document.querySelector(
      "nav"
    );


  if (
    nav &&
    !nav.querySelector(
      '[data-section="collocation"]'
    )
  ) {

    const button =
      document.createElement(
        "button"
      );

    button.type =
      "button";

    button.className =
      "nav-btn";

    button.dataset.section =
      "collocation";

    button.textContent =
      "Collocation";

    nav.appendChild(
      button
    );

  }


  const previous =
    document.getElementById(
      "collocation-file-prev"
    );


  const next =
    document.getElementById(
      "collocation-file-next"
    );


  if (previous) {

    previous.addEventListener(
      "click",
      function () {

        if (
          !collocationSets.length
        ) {

          return;

        }


        currentCollocationFileIndex =
          (
            currentCollocationFileIndex -
            1 +
            collocationSets.length
          ) %
          collocationSets.length;


        currentCollocationQuestionIndex =
          0;

        collocationScore =
          0;

        collocationAnswered =
          0;

        renderCollocationQuestion();

      }
    );

  }


  if (next) {

    next.addEventListener(
      "click",
      function () {

        if (
          !collocationSets.length
        ) {

          return;

        }


        currentCollocationFileIndex =
          (
            currentCollocationFileIndex +
            1
          ) %
          collocationSets.length;


        currentCollocationQuestionIndex =
          0;

        collocationScore =
          0;

        collocationAnswered =
          0;

        renderCollocationQuestion();

      }
    );

  }


  renderCollocationQuestion();

}


/* =========================================================
   CURRENT COLLOCATION QUESTION
========================================================= */

function getCurrentCollocationQuestion() {

  const set =
    collocationSets[
      currentCollocationFileIndex
    ];


  if (
    !set ||
    !Array.isArray(
      set.questions
    ) ||
    !set.questions.length
  ) {

    return null;

  }


  return (
    set.questions[
      currentCollocationQuestionIndex
    ] ||
    null
  );

}


/* =========================================================
   RENDER COLLOCATION QUESTION
========================================================= */

function renderCollocationQuestion() {

  const content =
    document.getElementById(
      "collocation-content"
    );


  const fileName =
    document.getElementById(
      "collocation-file-name"
    );


  if (!content) {

    return;

  }


  collocationSelected =
    new Set();

  collocationChecked =
    false;


  /* NO FILES */

  if (
    !collocationSets.length
  ) {

    if (fileName) {

      fileName.textContent =
        "No collocation JSON files found";

    }


    content.innerHTML =
      `
        <div class="empty-state">

          No collocation files were found in
          <code>collocations/</code>.

        </div>
      `;

    return;

  }


  const set =
    collocationSets[
      currentCollocationFileIndex
    ];


  const question =
    getCurrentCollocationQuestion();


  if (!question) {

    content.innerHTML =
      `
        <div class="empty-state">
          This collocation file has no questions.
        </div>
      `;

    return;

  }


  if (fileName) {

    fileName.textContent =
      `Set ${set.fileNumber} · ${
        currentCollocationQuestionIndex + 1
      } / ${
        set.questions.length
      }`;

  }


  const choices =
    Array.isArray(
      question.choices
    )
      ? shuffle(
          [...question.choices]
        )
      : [];


  content.innerHTML =
    `
      <div class="collocation-card">


        <div class="collocation-progress">

          <span>
            Question
            ${
              currentCollocationQuestionIndex + 1
            }
            /
            ${
              set.questions.length
            }
          </span>


          <span>
            Score:
            ${collocationScore}
          </span>

        </div>


        <div
          class="collocation-main-word"
        >
          ${escapeHTML(
            question.word
          )}
        </div>


        <div
          class="collocation-meaning"
        >
          ${escapeHTML(
            question.meaning || ""
          )}
        </div>


        <p
          class="collocation-instruction"
        >
          Select all natural collocations:
        </p>


        <div
          id="collocation-choices"
          class="collocation-choices"
        >

          ${
            choices
              .map(
                (choice, index) =>
                  `
                    <button
                      type="button"
                      class="collocation-choice"
                      data-choice-index="${index}"
                      data-choice="${escapeHTML(
                        choice
                      )}"
                    >
                      ${escapeHTML(
                        choice
                      )}
                    </button>
                  `
              )
              .join("")
          }

        </div>


        <div
          id="collocation-result"
          class="collocation-result"
        ></div>


        <div
          class="collocation-actions"
        >

          <button
            id="collocation-check"
            class="primary-btn"
            type="button"
          >
            Check Answer
          </button>


          <button
            id="collocation-next"
            class="secondary-btn"
            type="button"
          >
            Next Question →
          </button>

        </div>


      </div>
    `;


  document
    .querySelectorAll(
      "#collocation .collocation-choice"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          function () {

            if (
              collocationChecked
            ) {

              return;

            }


            const index =
              Number(
                button.dataset.choiceIndex
              );


            if (
              collocationSelected.has(
                index
              )
            ) {

              collocationSelected.delete(
                index
              );

              button.classList.remove(
                "selected"
              );

            } else {

              collocationSelected.add(
                index
              );

              button.classList.add(
                "selected"
              );

            }

          }
        );

      }
    );


  const check =
    document.getElementById(
      "collocation-check"
    );


  if (check) {

    check.addEventListener(
      "click",
      checkCollocationAnswer
    );

  }


  const next =
    document.getElementById(
      "collocation-next"
    );


  if (next) {

    next.addEventListener(
      "click",
      nextCollocationQuestion
    );

  }

}


/* =========================================================
   CHECK COLLOCATION
========================================================= */

function checkCollocationAnswer() {

  if (
    collocationChecked
  ) {

    return;

  }


  const question =
    getCurrentCollocationQuestion();


  if (!question) {

    return;

  }


  const correct =
    new Set(
      (
        Array.isArray(
          question.correct
        )
          ? question.correct
          : []
      ).map(
        String
      )
    );


  const selected =
    new Set();


  document
    .querySelectorAll(
      "#collocation .collocation-choice"
    )
    .forEach(
      button => {

        const index =
          Number(
            button.dataset.choiceIndex
          );


        if (
          collocationSelected.has(
            index
          )
        ) {

          selected.add(
            String(
              button.dataset.choice
            )
          );

        }

      }
    );


  const exact =
    selected.size ===
      correct.size &&
    [...correct].every(
      word =>
        selected.has(word)
    );


  collocationChecked =
    true;


  collocationAnswered++;


  if (exact) {

    collocationScore++;

  }


  document
    .querySelectorAll(
      "#collocation .collocation-choice"
    )
    .forEach(
      button => {

        const choice =
          String(
            button.dataset.choice
          );


        const isCorrect =
          correct.has(choice);


        const isSelected =
          collocationSelected.has(
            Number(
              button.dataset.choiceIndex
            )
          );


        button.disabled =
          true;


        button.classList.remove(
          "selected"
        );


        if (isCorrect) {

          button.classList.add(
            "correct"
          );

        } else if (isSelected) {

          button.classList.add(
            "wrong"
          );

        }

      }
    );


  const result =
    document.getElementById(
      "collocation-result"
    );


  if (result) {

    if (exact) {

      result.innerHTML =
        `
          <strong>
            ✓ Correct!
          </strong>

          <span>
            All correct collocations selected.
          </span>
        `;

      result.classList.add(
        "correct-result"
      );

    } else {

      result.innerHTML =
        `
          <strong>
            ✗ Not quite.
          </strong>

          <span>
            Green choices are the correct
            collocations.
          </span>
        `;

      result.classList.add(
        "wrong-result"
      );

    }

  }

}


/* =========================================================
   NEXT COLLOCATION QUESTION
========================================================= */

function nextCollocationQuestion() {

  const set =
    collocationSets[
      currentCollocationFileIndex
    ];


  if (
    !set ||
    !set.questions.length
  ) {

    return;

  }


  currentCollocationQuestionIndex++;


  if (
    currentCollocationQuestionIndex >=
    set.questions.length
  ) {

    currentCollocationQuestionIndex =
      0;

  }


  renderCollocationQuestion();


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =========================================================
   COLLOCATION RUNTIME STYLES
========================================================= */

(function injectCollocationStyles() {

  if (
    document.getElementById(
      "collocation-runtime-styles"
    )
  ) {

    return;

  }


  const style =
    document.createElement(
      "style"
    );


  style.id =
    "collocation-runtime-styles";


  style.textContent =
    `

      .collocation-wrapper {
        max-width: 900px;
        margin: 0 auto;
        padding: 20px 0 60px;
      }


      .collocation-header {
        text-align: center;
        margin-bottom: 25px;
      }


      .collocation-file-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
        margin: 20px 0;
      }


      #collocation-file-name {
        font-weight: 700;
        text-align: center;
      }


      .collocation-card {
        background: var(
          --card-bg,
          #fff
        );

        border-radius: 20px;

        padding: 30px;

        box-shadow:
          0 10px 30px
          rgba(0,0,0,.08);
      }


      .collocation-progress {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        font-size: .9rem;
        opacity: .75;
        margin-bottom: 25px;
      }


      .collocation-main-word {
        text-align: center;

        font-size:
          clamp(
            2.2rem,
            7vw,
            4rem
          );

        font-weight: 800;

        margin-top: 10px;
      }


      .collocation-meaning {
        text-align: center;
        font-size: 1.05rem;
        opacity: .75;
        margin: 8px 0 30px;
      }


      .collocation-instruction {
        text-align: center;
        font-weight: 700;
        margin-bottom: 18px;
      }


      .collocation-choices {
        display: grid;

        grid-template-columns:
          repeat(
            auto-fit,
            minmax(140px, 1fr)
          );

        gap: 12px;
      }


      .collocation-choice {
        border:
          2px solid
          rgba(128,128,128,.25);

        background: transparent;

        border-radius: 12px;

        padding: 14px 12px;

        font-size: 1.05rem;

        cursor: pointer;

        transition: .2s;
      }


      .collocation-choice:hover {
        transform:
          translateY(-2px);
      }


      .collocation-choice.selected {
        border-color: #7c3aed;

        background:
          rgba(
            124,
            58,
            237,
            .12
          );
      }


      .collocation-choice.correct {
        border-color: #16a34a;

        background:
          rgba(
            22,
            163,
            74,
            .14
          );

        color: #15803d;
      }


      .collocation-choice.wrong {
        border-color: #dc2626;

        background:
          rgba(
            220,
            38,
            38,
            .12
          );

        color: #b91c1c;
      }


      .collocation-choice:disabled {
        cursor: default;
        transform: none;
      }


      .collocation-result {
        min-height: 55px;

        margin:
          22px 0 5px;

        padding: 14px;

        border-radius: 12px;

        text-align: center;

        display: flex;

        flex-direction: column;

        gap: 5px;
      }


      .collocation-result:empty {
        display: block;
      }


      .collocation-result.correct-result {
        background:
          rgba(
            22,
            163,
            74,
            .1
          );
      }


      .collocation-result.wrong-result {
        background:
          rgba(
            220,
            38,
            38,
            .08
          );
      }


      .collocation-actions {
        display: flex;

        justify-content: center;

        gap: 12px;

        flex-wrap: wrap;

        margin-top: 20px;
      }


      @media (max-width: 600px) {

        .collocation-file-bar {
          flex-direction: column;
        }

        .collocation-card {
          padding: 20px 15px;
        }

        .collocation-progress {
          font-size: .8rem;
        }

        .collocation-choices {
          grid-template-columns:
            repeat(
              2,
              1fr
            );
        }

        .collocation-choice {
          padding:
            12px 8px;
        }

      }

    `;


  document.head.appendChild(
    style
  );

})();


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


  examIndex =
    0;


  examScore =
    0;


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
        getVocabularyWord(word) !==
        getVocabularyWord(question)
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
            getVocabularyWord(question)
          )}
        </div>

        <div class="exam-pinyin">
          ${escapeHTML(
            getVocabularyPinyin(question)
          )}
        </div>

        <div class="exam-options">

          ${
            options
              .map(
                option =>
                  `
                    <button
                      class="exam-option"
                      data-answer="${escapeHTML(
                        getVocabularyWord(option)
                      )}"
                      type="button"
                    >
                      ${escapeHTML(
                        getVocabularyMeaning(option)
                      )}
                    </button>
                  `
              )
              .join("")
          }

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


            const correctAnswer =
              getVocabularyWord(
                question
              );


            if (
              answer ===
              correctAnswer
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
                    correctAnswer
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


  const percentage =
    Math.round(
      (
        examScore /
        examQuestions.length
      ) *
      100
    );


  let message =
    "Keep practicing! 加油！";


  if (percentage >= 90) {

    message =
      "Excellent work! 太棒了！";

  } else if (
    percentage >= 70
  ) {

    message =
      "Good job! Keep improving!";

  } else if (
    percentage >= 50
  ) {

    message =
      "You're making progress. Keep studying!";

  }


  container.innerHTML =
    `
      <div class="exam-result">

        <p class="section-label">
          RESULT
        </p>

        <h3>
          Exam Complete
        </h3>

        <div class="exam-score">
          ${examScore}
          /
          ${examQuestions.length}
        </div>

        <p>
          ${percentage}%
        </p>

        <p>
          ${message}
        </p>

        <button
          id="restart-exam"
          class="primary-btn"
          type="button"
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
   HSK 5 DRAG & DROP READING PRACTICE
========================================================= */

let dragDropPassages = [];

let dragDropPassageIndex =
  0;


/* =========================================================
   LOAD DRAG & DROP DATA
========================================================= */

async function loadDragDropPractice() {

  const file =
    "./HSK5_Vocabulary_DragDrop_25_Passages.json";


  try {

    const data =
      await loadJSON(file);


    if (
      Array.isArray(data)
    ) {

      dragDropPassages =
        data;

    } else if (
      data &&
      Array.isArray(
        data.passages
      )
    ) {

      dragDropPassages =
        data.passages;

    } else {

      throw new Error(
        "Invalid drag & drop JSON format."
      );

    }


    console.log(
      `Drag & Drop passages loaded: ${dragDropPassages.length}`
    );


    createDragDropSection();


  } catch (error) {

    console.warn(
      "Could not load HSK5 drag & drop practice:",
      error.message
    );

  }

}


/* =========================================================
   CREATE DRAG & DROP SECTION
========================================================= */

function createDragDropSection() {

  if (
    !dragDropPassages.length
  ) {

    return;

  }


  let section =
    document.getElementById(
      "hsk5-drag-drop-section"
    );


  if (!section) {

    section =
      document.createElement(
        "section"
      );

    section.id =
      "hsk5-drag-drop-section";

    section.className =
      "page-section";


    const main =
      document.querySelector(
        "main"
      );


    if (main) {

      main.appendChild(
        section
      );

    }

  }


  if (!section) {

    return;

  }


  section.innerHTML =
    `
      <div class="hsk5-drag-drop-wrapper">

        <div class="hsk5-drag-drop-header">

          <p class="section-label">
            HSK 5 READING
          </p>

          <h2>
            Vocabulary Drag & Drop
          </h2>

          <p>
            Drag the correct vocabulary words
            into the blanks.
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
            class="secondary-btn"
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


  const nav =
    document.querySelector(
      "nav"
    );


  if (
    nav &&
    !nav.querySelector(
      '[data-section="hsk5-drag-drop-section"]'
    )
  ) {

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
          dragDropPassageIndex <= 0
        ) {

          return;

        }


        dragDropPassageIndex--;


        renderDragDropPassage();

      }
    );

  }


  if (next) {

    next.addEventListener(
      "click",
      function () {

        if (
          dragDropPassageIndex >=
          dragDropPassages.length - 1
        ) {

          return;

        }


        dragDropPassageIndex++;


        renderDragDropPassage();

      }
    );

  }


  renderDragDropPassage();

}


/* =========================================================
   GET DRAG & DROP PASSAGE
========================================================= */

function getDragDropPassage() {

  return (
    dragDropPassages[
      dragDropPassageIndex
    ] ||
    null
  );

}


/* =========================================================
   RENDER DRAG & DROP PASSAGE
========================================================= */

function renderDragDropPassage() {

  const content =
    document.getElementById(
      "hsk5-drag-drop-content"
    );


  if (!content) {

    return;

  }


  const passage =
    getDragDropPassage();


  if (!passage) {

    content.innerHTML =
      `
        <div class="empty-state">
          No passage available.
        </div>
      `;

    return;

  }


  updateDragDropCounter();


  const title =
    passage.title ||
    passage.Title ||
    passage.name ||
    "";


  const words =
    Array.isArray(
      passage.words
    )
      ? passage.words
      : Array.isArray(
          passage.options
        )
        ? passage.options
        : [];


  const text =
    passage.text ||
    passage.Text ||
    passage.passage ||
    passage.Passage ||
    "";


  let passageHTML =
    escapeHTML(text);


  /*
    Support [1], [2], [3] style blanks.
  */

  passageHTML =
    passageHTML.replace(
      /\[(\d+)\]/g,
      function (
        match,
        number
      ) {

        return `
          <span
            class="hsk5-drag-drop-blank"
            data-blank="${number}"
            data-answer=""
          >
            ______
          </span>
        `;

      }
    );


  content.innerHTML =
    `
      <div class="hsk5-drag-drop-meta">

        <span>
          Passage
          ${dragDropPassageIndex + 1}
          /
          ${dragDropPassages.length}
        </span>

      </div>


      <h3 class="hsk5-drag-drop-title">
        ${escapeHTML(title)}
      </h3>


      <div class="hsk5-drag-drop-word-bank">

        <div class="hsk5-drag-drop-bank-title">
          Word Bank
        </div>

        <div
          class="hsk5-drag-drop-options"
          id="hsk5-drag-drop-options"
        >

          ${
            words
              .map(
                word =>
                  `
                    <button
                      type="button"
                      class="hsk5-drag-word"
                      draggable="true"
                      data-word="${escapeHTML(
                        word
                      )}"
                    >
                      ${escapeHTML(
                        word
                      )}
                    </button>
                  `
              )
              .join("")
          }

        </div>

      </div>


      <div
        class="hsk5-drag-drop-passage"
        id="hsk5-drag-drop-passage"
      >
        ${passageHTML}
      </div>


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


  setupDragDropEvents(
    passage
  );

}


/* =========================================================
   DRAG & DROP EVENTS
========================================================= */

function setupDragDropEvents(
  passage
) {

  const words =
    document.querySelectorAll(
      ".hsk5-drag-word"
    );


  const blanks =
    document.querySelectorAll(
      ".hsk5-drag-drop-blank"
    );


  let draggedWord =
    "";


  words.forEach(
    word => {

      word.addEventListener(
        "dragstart",
        function () {

          draggedWord =
            word.dataset.word || "";

        }
      );


      word.addEventListener(
        "click",
        function () {

          const emptyBlank =
            Array.from(
              blanks
            ).find(
              blank =>
                !blank.dataset.answer
            );


          if (
            emptyBlank &&
            draggedWord !==
              word.dataset.word
          ) {

            emptyBlank.dataset.answer =
              word.dataset.word;

            emptyBlank.textContent =
              word.dataset.word;

            emptyBlank.classList.add(
              "filled"
            );

          }

        }
      );

    }
  );


  blanks.forEach(
    blank => {

      blank.addEventListener(
        "dragover",
        function (event) {

          event.preventDefault();

        }
      );


      blank.addEventListener(
        "drop",
        function (event) {

          event.preventDefault();


          if (!draggedWord) {

            return;

          }


          blank.dataset.answer =
            draggedWord;


          blank.textContent =
            draggedWord;


          blank.classList.add(
            "filled"
          );

        }
      );


      blank.addEventListener(
        "click",
        function () {

          blank.dataset.answer =
            "";


          blank.textContent =
            "______";


          blank.classList.remove(
            "filled",
            "correct",
            "wrong"
          );

        }
      );

    }
  );


  const check =
    document.getElementById(
      "hsk5-drag-drop-check"
    );


  if (check) {

    check.addEventListener(
      "click",
      function () {

        checkDragDropAnswers(
          passage
        );

      }
    );

  }


  const reset =
    document.getElementById(
      "hsk5-drag-drop-reset"
    );


  if (reset) {

    reset.addEventListener(
      "click",
      function () {

        blanks.forEach(
          blank => {

            blank.dataset.answer =
              "";

            blank.textContent =
              "______";

            blank.classList.remove(
              "filled",
              "correct",
              "wrong"
            );

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
    );

  }

}


/* =========================================================
   CHECK DRAG & DROP
========================================================= */

function checkDragDropAnswers(
  passage
) {

  const blanks =
    document.querySelectorAll(
      ".hsk5-drag-drop-blank"
    );


  let correctCount =
    0;


  let total =
    blanks.length;


  const answers =
    passage.answers ||
    passage.Answers ||
    passage.correctAnswers ||
    passage.correct ||
    [];


  blanks.forEach(
    blank => {

      const number =
        Number(
          blank.dataset.blank
        );


      const userAnswer =
        String(
          blank.dataset.answer ||
          ""
        ).trim();


      let correctAnswer =
        "";


      if (
        Array.isArray(
          answers
        )
      ) {

        const item =
          answers[number - 1];


        if (
          typeof item ===
          "string"
        ) {

          correctAnswer =
            item;

        } else if (
          Array.isArray(item)
        ) {

          correctAnswer =
            item[0] ||
            "";

        }

      } else if (
        answers &&
        typeof answers ===
          "object"
      ) {

        correctAnswer =
          answers[number] ||
          answers[
            String(number)
          ] ||
          "";

      }


      if (
        userAnswer &&
        String(correctAnswer)
          .trim() ===
        userAnswer
      ) {

        blank.classList.add(
          "correct"
        );

        blank.classList.remove(
          "wrong"
        );

        correctCount++;

      } else {

        blank.classList.add(
          "wrong"
        );

        blank.classList.remove(
          "correct"
        );

      }

    }
  );


  const result =
    document.getElementById(
      "hsk5-drag-drop-result"
    );


  if (result) {

    result.innerHTML =
      `
        <strong>
          ${correctCount} / ${total}
        </strong>

        <span>
          ${
            correctCount === total
              ? "Excellent! All answers are correct."
              : "Review the red blanks and try again."
          }
        </span>
      `;

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
   INITIALIZATION
========================================================= */

async function initializeApp() {

  console.log(
    "Starting Chinese Learning website..."
  );


  /*
    Prepare the alphabet immediately.
    This means A-Z controls are visible even while the
    vocabulary JSON files are loading.
  */

  setupAlphabet();


  loadHighlights();


  try {

    await Promise.all(
      [
        loadVocabulary(),
        loadParagraphs()
      ]
    );

  } catch (error) {

    console.error(
      "Website initialization error:",
      error
    );

  }


  renderAllHighlights();


  console.log(
    "Chinese Learning website ready."
  );

}


initializeApp();


/* =========================================================
   DOM READY - DRAG & DROP
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    loadDragDropPractice();

  }
);


/* =========================================================
   DOM READY - COLLOCATION
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    loadCollocations();

  }
);


/* =========================================================
   ESCAPE HTML
========================================================= */

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


/* =========================================================
   SHUFFLE
========================================================= */

function shuffle(array) {

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
