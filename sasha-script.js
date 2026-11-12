document.addEventListener("DOMContentLoaded", () => {
  const backdrop = document.getElementById("modalBackdrop");
  const title = document.getElementById("modalTitle");
  const kicker = document.getElementById("modalKicker");
  const text = document.getElementById("modalText");
  const content = document.getElementById("modalContent");
  const count = document.getElementById("surpriseCount");
  const progress = document.getElementById("progressBar");
  const localSong = document.getElementById("localSong");
  const songButtons = [document.getElementById("playSong"), document.getElementById("playSongCard")];
  const discovered = new Set();
  let quizStep = 0;
  let musicPlaying = false;

  const surprises = {
    star: ["La première surprise", "Tu es notre plus belle étoile.", "Même quand tu ne le vois pas, tu rends les journées beaucoup plus lumineuses."],
    heart: ["Un petit rappel", "Tu mérites toute la douceur.", "Tu mérites toute la douceur, la joie et les belles choses qui arrivent. N'oublie jamais ça. ♡"],
    wish: ["Un vœu pour toi", "Un vœu pour cette nouvelle année", "Que cette nouvelle année t'offre des moments simples, des rires sincères et des rêves qui deviennent réalité."],
    memory: ["Un souvenir à créer", "Les plus beaux cadeaux", "Les meilleurs cadeaux ne tiennent pas dans une boîte : ce sont les moments qu'on partage et qu'on n'oublie jamais."]
  };

  function showModal(modalKicker, modalTitle, modalText, body = "") {
    kicker.textContent = modalKicker;
    title.textContent = modalTitle;
    text.textContent = modalText;
    content.innerHTML = body;
    backdrop.hidden = false;
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    backdrop.hidden = true;
    content.innerHTML = "";
    document.body.classList.remove("modal-open");
  }

  function updateProgress() {
    count.textContent = discovered.size;
    progress.style.width = `${Math.min(discovered.size / 5, 1) * 100}%`;
  }

  async function toggleMusic() {
    try {
      if (musicPlaying) {
        localSong.pause();
      } else {
        await localSong.play();
      }
      musicPlaying = !musicPlaying;
    } catch (error) {
      showModal("Lecture de la musique", "La chanson ne peut pas démarrer", "Vérifie que le fichier MP3 est bien dans le même dossier que la page.");
      return;
    }
    songButtons.forEach((button) => {
      button.classList.toggle("is-playing", musicPlaying);
      if (button.id === "playSong") {
        button.innerHTML = `<span class="play-icon">${musicPlaying ? "Ⅱ" : "▶"}</span> ${musicPlaying ? "Musique en cours" : "Écouter la chanson"}`;
      } else {
        button.innerHTML = `${musicPlaying ? "Arrêter la musique" : "Lancer la chanson"} <span>${musicPlaying ? "Ⅱ" : "▶"}</span>`;
      }
    });
  }

  songButtons.forEach((button) => button.addEventListener("click", toggleMusic));
  localSong.addEventListener("ended", () => {
    musicPlaying = false;
    songButtons.forEach((button) => {
      button.classList.remove("is-playing");
      if (button.id === "playSong") {
        button.innerHTML = '<span class="play-icon">▶</span> Écouter la chanson';
      } else {
        button.innerHTML = 'Lancer la chanson <span>▶</span>';
      }
    });
  });

  document.querySelectorAll("[data-surprise]").forEach((item) => {
    item.addEventListener("click", () => {
      const key = item.dataset.surprise;
      const [surpriseKicker, surpriseTitle, surpriseText] = surprises[key];
      discovered.add(key);
      updateProgress();
      item.classList.add("found");
      showModal(surpriseKicker, surpriseTitle, surpriseText);
    });
  });

  document.getElementById("startExperience").addEventListener("click", () => {
    document.getElementById("treeSection").scrollIntoView({ behavior: "smooth", block: "center" });
  });

  function renderQuiz() {
    const questions = [
      { question: "Comment profiter pleinement de cette expérience ?", answers: ["Prendre son temps", "Tout faire très vite", "Fermer les yeux"], correct: 0 },
      { question: "Qu’est-ce qui rend un Noël vraiment inoubliable ?", answers: ["Le plus grand cadeau", "Un moment partagé", "Une décoration parfaite"], correct: 1 },
      { question: "Quelle surprise mérite de rester près du cœur ?", answers: ["Un souvenir sincère", "Une chaussette de Noël", "Une liste de courses"], correct: 0 }
    ];
    const current = questions[quizStep];
    content.innerHTML = `<div class="quiz-header"><span>Question ${quizStep + 1} sur ${questions.length}</span><span>${Math.round((quizStep / questions.length) * 100)}%</span></div><div class="quiz-question">${current.question}</div><div class="quiz-options">${current.answers.map((answer, index) => `<button class="quiz-option" data-answer="${index}" type="button"><span class="option-letter">${String.fromCharCode(65 + index)}</span>${answer}</button>`).join("")}</div><p class="quiz-feedback" aria-live="polite"></p>`;
    const feedback = content.querySelector(".quiz-feedback");
    content.querySelectorAll(".quiz-option").forEach((option) => {
      option.addEventListener("click", () => {
        const isCorrect = Number(option.dataset.answer) === current.correct;
        option.classList.add(isCorrect ? "correct" : "wrong");
        if (!isCorrect) {
          feedback.textContent = "Pas tout à fait… essaie encore, la bonne réponse t’attend.";
          return;
        }
        feedback.textContent = "Très bon choix ✦";
        content.querySelectorAll(".quiz-option").forEach((answer) => {
          answer.disabled = true;
        });
        quizStep += 1;
        if (quizStep === questions.length) {
          discovered.add("quiz");
          updateProgress();
          setTimeout(() => showModal("Quiz terminé", "Bravo, tu as gagné !", "Ton message secret est maintenant déverrouillé. Va voir la dernière carte.", '<button class="primary-btn" id="quizDone" type="button">Continuer la découverte →</button>'), 350);
        } else {
          setTimeout(renderQuiz, 450);
        }
      });
    });
  }

  document.getElementById("openQuiz").addEventListener("click", () => {
    quizStep = 0;
    showModal("02 · Le quiz de Noël", "Question pour toi", "Une seule réponse est parfaite. Prêt ?", "");
    setTimeout(renderQuiz, 50);
  });

  document.getElementById("openMessage").addEventListener("click", () => {
    showModal("03 · Le mot doux", "Pour toi, Sasha", "Merci d'être cette personne rare qui apporte de la lumière autour d'elle. Je te souhaite un Noël rempli de chaleur, de rires et de petits bonheurs. Et surtout : n'oublie jamais à quel point tu comptes.", '<div class="modal-sparkle">♥</div>');
  });

  document.getElementById("closeModal").addEventListener("click", closeModal);
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !backdrop.hidden) closeModal();
  });
});
