import React, { useState } from "react";
import wordsData from "./data/words.json";
import "./App.css";

function App() {
  // =========================
  // DATA
  // =========================

  const [words] = useState(wordsData);

  // =========================
  // PAGE
  // =========================

  const [page, setPage] = useState("home");

  // =========================
  // PRACTICE
  // =========================

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // =========================
  // FLASHCARD
  // =========================

  const [isFlipped, setIsFlipped] = useState(false);

  // =========================
  // EXAM
  // =========================

  const [examQuestions, setExamQuestions] = useState([]);
  const [examIndex, setExamIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [examScore, setExamScore] = useState(0);
  const [examFinished, setExamFinished] = useState(false);

  // =========================
  // CURRENT WORD
  // =========================

  const currentWord = words[currentIndex];

  // =========================
  // NAVIGATION
  // =========================

  const goHome = () => {
    setPage("home");
    setShowAnswer(false);
    setIsFlipped(false);
  };

  const goPractice = () => {
    setPage("practice");
    setCurrentIndex(0);
    setShowAnswer(false);
  };

  const goFlashcard = () => {
    setPage("flashcard");
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // =========================
  // NEXT WORD
  // =========================

  const nextWord = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setIsFlipped(false);
    } else {
      setCurrentIndex(0);
      setShowAnswer(false);
      setIsFlipped(false);
    }
  };

  const previousWord = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
      setIsFlipped(false);
    }
  };

  // =========================
  // SHUFFLE
  // =========================

  const shuffleWords = () => {
    const randomIndex = Math.floor(Math.random() * words.length);

    setCurrentIndex(randomIndex);
    setShowAnswer(false);
    setIsFlipped(false);
  };

  // =========================
  // EXAM
  // =========================

  const createExam = () => {
    const shuffled = [...words]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(10, words.length));

    const questions = shuffled.map((word) => {
      const wrongAnswers = words
        .filter((item) => item.id !== word.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((item) => item.Meaning);

      const answers = [...wrongAnswers, word.Meaning].sort(
        () => Math.random() - 0.5
      );

      return {
        word,
        answers,
      };
    });

    setExamQuestions(questions);
    setExamIndex(0);
    setSelectedAnswer(null);
    setExamScore(0);
    setExamFinished(false);
    setPage("exam");
  };

  const answerExam = (answer) => {
    if (selectedAnswer !== null) {
      return;
    }

    setSelectedAnswer(answer);

    const correctAnswer = examQuestions[examIndex].word.Meaning;

    if (answer === correctAnswer) {
      setExamScore((score) => score + 1);
    }
  };

  const nextExamQuestion = () => {
    if (examIndex < examQuestions.length - 1) {
      setExamIndex(examIndex + 1);
      setSelectedAnswer(null);
    } else {
      setExamFinished(true);
    }
  };

  // =========================
  // HOME
  // =========================

  if (page === "home") {
    return (
      <div className="app">
        <header className="header">
          <h1>新学中文</h1>
          <p>Chinese Vocabulary Learning</p>
        </header>

        <main className="container">

          <div className="welcome">
            <h2>中文生词学习</h2>

            <p>
              通过生词、例句、翻翻卡和考试来学习中文。
            </p>
          </div>

          <div className="stats">

            <div className="stat-card">
              <h3>{words.length}</h3>
              <p>生词</p>
            </div>

            <div className="stat-card">
              <h3>{words.length}</h3>
              <p>例句</p>
            </div>

            <div className="stat-card">
              <h3>4</h3>
              <p>学习模式</p>
            </div>

          </div>

          <div className="menu">

            <button onClick={goPractice}>
              📖 生词学习
            </button>

            <button onClick={goFlashcard}>
              🃏 翻翻卡
            </button>

            <button onClick={createExam}>
              📝 开始考试
            </button>

            <button onClick={shuffleWords}>
              🔀 随机生词
            </button>

          </div>

          <div className="word-preview">

            <h2>最近的生词</h2>

            {words.slice(0, 5).map((word) => (
              <div className="word-row" key={word.id}>

                <div>
                  <strong>{word.words}</strong>
                  <span>{word.Pinyin}</span>
                </div>

                <p>{word.Meaning}</p>

              </div>
            ))}

          </div>

        </main>
      </div>
    );
  }

  // =========================
  // PRACTICE
  // =========================

  if (page === "practice") {
    return (
      <div className="app">

        <header className="header">
          <button onClick={goHome}>← 返回</button>

          <h1>生词学习</h1>

          <p>
            {currentIndex + 1} / {words.length}
          </p>
        </header>

        <main className="container">

          <div className="word-card">

            <h2>{currentWord.words}</h2>

            <div className="pinyin">
              {currentWord.Pinyin}
            </div>

            {!showAnswer ? (

              <button
                className="primary-button"
                onClick={() => setShowAnswer(true)}
              >
                查看意思
              </button>

            ) : (

              <div className="answer">

                <h3>{currentWord.Meaning}</h3>

                <div className="sentence">

                  <h4>日常例句</h4>

                  <p>{currentWord.Sentences}</p>

                </div>

              </div>

            )}

          </div>

          <div className="navigation">

            <button
              onClick={previousWord}
              disabled={currentIndex === 0}
            >
              ← 上一个
            </button>

            <button onClick={shuffleWords}>
              🔀 随机
            </button>

            <button onClick={nextWord}>
              下一个 →
            </button>

          </div>

        </main>
      </div>
    );
  }

  // =========================
  // FLASHCARD
  // =========================

  if (page === "flashcard") {
    return (
      <div className="app">

        <header className="header">

          <button onClick={goHome}>
            ← 返回
          </button>

          <h1>翻翻卡</h1>

          <p>
            {currentIndex + 1} / {words.length}
          </p>

        </header>

        <main className="container">

          <div
            className="flashcard"
            onClick={() => setIsFlipped(!isFlipped)}
          >

            {!isFlipped ? (

              <div className="flashcard-front">

                <h2>{currentWord.words}</h2>

                <p>{currentWord.Pinyin}</p>

                <span>
                  点击查看意思
                </span>

              </div>

            ) : (

              <div className="flashcard-back">

                <h2>{currentWord.words}</h2>

                <p className="pinyin">
                  {currentWord.Pinyin}
                </p>

                <h3>{currentWord.Meaning}</h3>

                <div className="flashcard-sentence">
                  {currentWord.Sentences}
                </div>

              </div>

            )}

          </div>

          <div className="navigation">

            <button
              onClick={previousWord}
              disabled={currentIndex === 0}
            >
              ← 上一个
            </button>

            <button onClick={nextWord}>
              下一个 →
            </button>

          </div>

        </main>
      </div>
    );
  }

  // =========================
  // EXAM
  // =========================

  if (page === "exam") {

    if (examFinished) {

      return (
        <div className="app">

          <header className="header">
            <button onClick={goHome}>
              ← 返回
            </button>

            <h1>考试结果</h1>
          </header>

          <main className="container">

            <div className="result-card">

              <h2>考试完成！</h2>

              <div className="score">
                {examScore} / {examQuestions.length}
              </div>

              <p>
                正确率：
                {" "}
                {Math.round(
                  (examScore / examQuestions.length) * 100
                )}
                %
              </p>

              <button
                className="primary-button"
                onClick={createExam}
              >
                再考一次
              </button>

            </div>

          </main>

        </div>
      );
    }

    const question = examQuestions[examIndex];

    return (
      <div className="app">

        <header className="header">

          <button onClick={goHome}>
            ← 返回
          </button>

          <h1>中文考试</h1>

          <p>
            {examIndex + 1} / {examQuestions.length}
          </p>

        </header>

        <main className="container">

          <div className="exam-card">

            <h2>
              这个词是什么意思？
            </h2>

            <div className="exam-word">
              <strong>{question.word.words}</strong>

              <span>
                {question.word.Pinyin}
              </span>
            </div>

            <div className="answers">

              {question.answers.map((answer, index) => {

                const isCorrect =
                  answer === question.word.Meaning;

                const isSelected =
                  answer === selectedAnswer;

                let className = "answer-button";

                if (selectedAnswer !== null) {

                  if (isCorrect) {
                    className += " correct";
                  }

                  if (isSelected && !isCorrect) {
                    className += " wrong";
                  }
                }

                return (
                  <button
                    key={index}
                    className={className}
                    onClick={() => answerExam(answer)}
                  >
                    {answer}
                  </button>
                );
              })}

            </div>

            {selectedAnswer !== null && (

              <div className="exam-next">

                <div className="exam-sentence">
                  <strong>例句：</strong>

                  <p>
                    {question.word.Sentences}
                  </p>
                </div>

                <button
                  className="primary-button"
                  onClick={nextExamQuestion}
                >
                  {examIndex === examQuestions.length - 1
                    ? "查看结果"
                    : "下一题"}
                </button>

              </div>

            )}

          </div>

        </main>
      </div>
    );
  }

  return null;
}

export default App;
