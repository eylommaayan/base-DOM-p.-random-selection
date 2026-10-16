// ==========================================
// 1. מאגר השאלות והתשובות (DATA)
// ==========================================
const quizData = {
  networking: [
    {
      question:
        "באיזה שלב בלחיצת היד המשולשת (3-Way Handshake) של TCP שולח הלקוח את הבקשה הראשונה?",
      options: ["ACK", "SYN", "SYN-ACK", "FIN"],
      correct: 1,
    },
    {
      question:
        "איזה פרוטוקול אחראי על תרגום כתובת IP לכתובת פיזית (MAC Address)?",
      options: ["DNS", "DHCP", "ARP", "ICMP"],
      correct: 2,
    },
    {
      question: "איזה פורט ברירת מחדל משמש לתקשורת HTTPS מוצפנת?",
      options: ["80", "8080", "22", "443"],
      correct: 3,
    },
  ],
  webSecurity: [
    {
      question: "מהי הדרך היעילה והמוחלטת ביותר למניעת מתקפות SQL Injection?",
      options: [
        "חסימת כתובות IP חשודות ב-Firewall",
        "שימוש ב-Parameterized Queries (Prepared Statements)",
        "הצפנת כל מסד הנתונים עם AES-256",
        "בדיקת אורך הסיסמה של המשתמש",
      ],
      correct: 1,
    },
    {
      question:
        "איזה דגל עוגייה (Cookie Flag) מונע מסקריפטים של JS לגשת לערך העוגייה ולהגן מ-XSS?",
      options: ["Secure", "SameSite", "HttpOnly", "Domain"],
      correct: 2,
    },
    {
      question: "מה מטרתו של מנגנון CSRF Token?",
      options: [
        "להבטיח שהבקשה נשלחה בכוונה תחילה על ידי המשתמש המורשה מהאפליקציה",
        "לפענח תעבורת רשת מוצפנת",
        "למנוע מתקפת Brute Force על דף ההתחברות",
        "להאיץ את זמני הטעינה של הדפדפן",
      ],
      correct: 0,
    },
  ],
  soc: [
    {
      question: "מה המשמעות של התרעת 'False Positive' במערכת SIEM?",
      options: [
        "התקפה מסוכנת שהתרחשה אך המערכת התעלמה ממנה לחלוטין",
        "התרעה שהופעלה על פעילות לגיטימית ותקינה שאינה התקפה",
        "התקפה שנחסמה בהצלחה על ידי ה-Firewall",
        "מתקפה שלא זוהתה עד לשלב זליגת המידע",
      ],
      correct: 1,
    },
    {
      question:
        "איזה כלי מיועד לניתוח מעמיק של תעבורת רשת ולכידת מנות (Packets)?",
      options: ["Wireshark", "Burp Suite", "Nessus", "Metasploit"],
      correct: 0,
    },
  ],
  os: [
    {
      question: "מה המשמעות של הרשאת SUID (SetUID) בקובץ בינארי בלינוקס?",
      options: [
        "הקובץ מוצפן וניתן לפתיחה רק על ידי root",
        "הקובץ רץ בהרשאות המשתמש שהפעיל אותו",
        "הקובץ רץ תמיד עם הרשאות הבעלים שלו (בד''כ root)",
        "הקובץ נמחק אוטומטית לאחר ההרצה",
      ],
      correct: 2,
    },
    {
      question:
        "איזה שירות ב-Windows אחראי על ניהול אימות משתמשים ו-Kerberos בסביבת Domain?",
      options: [
        "Active Directory",
        "DNS Cache",
        "Windows Defender",
        "IIS Server",
      ],
      correct: 0,
    },
  ],
};

// ==========================================
// 2. לוגיקת המשחק
// ==========================================
let currentCategory = "networking";
let currentQuestion = null;
let canAnswer = true;

const questionTextEl = document.getElementById("question-text");
const answersContainerEl = document.getElementById("answers-container");
const categoryBadgeEl = document.getElementById("category-badge");
const feedbackEl = document.getElementById("feedback-text");
const nextBtn = document.getElementById("next-btn");

function selectCategory(categoryKey) {
  currentCategory = categoryKey;

  // עדכון הדגשת כפתור קטגוריה
  document.querySelectorAll(".cat-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  event.target.classList.add("active");

  categoryBadgeEl.innerText = event.target.innerText;
  loadNextQuestion();
}

function loadNextQuestion() {
  canAnswer = true;
  feedbackEl.innerText = "";
  nextBtn.style.display = "none";

  const questionsList = quizData[currentCategory];
  // בחירת שאלה אקראית מהקטגוריה
  const randomIndex = Math.floor(Math.random() * questionsList.length);
  const qData = questionsList[randomIndex];

  // הכנת מערך תשובות עם שמירת האינדקס המקורי כדי שנדע מה נכון
  const formattedOptions = qData.options.map((text, idx) => ({
    text: text,
    isCorrect: idx === qData.correct,
  }));

  // ערבוב התשובות בצורה רנדומלית בכל סיבוב
  formattedOptions.sort(() => Math.random() - 0.5);

  currentQuestion = {
    question: qData.question,
    options: formattedOptions,
  };

  renderQuestion();
}

function renderQuestion() {
  questionTextEl.innerText = currentQuestion.question;
  answersContainerEl.innerHTML = "";

  currentQuestion.options.forEach((opt) => {
    const btn = document.createElement("div");
    btn.classList.add("answer-option");
    btn.innerText = opt.text;

    btn.addEventListener("click", () => handleAnswerClick(btn, opt));
    answersContainerEl.appendChild(btn);
  });
}

function handleAnswerClick(selectedEl, optionData) {
  if (!canAnswer) return;
  canAnswer = false;

  // חסימת לחיצה נוספת על שאר האפשרויות
  const allOptions = document.querySelectorAll(".answer-option");
  allOptions.forEach((opt) => opt.classList.add("disabled"));

  if (optionData.isCorrect) {
    // גבול ירוק זוהר לתשובה הנכונה
    selectedEl.classList.add("correct");
    feedbackEl.style.color = "#00ff88";
    feedbackEl.innerText = "✓ מעולה! תשובה נכונה.";
  } else {
    // גבול אדום לתשובה השגויה
    selectedEl.classList.add("wrong");
    feedbackEl.style.color = "#ff4d4d";
    feedbackEl.innerText = "✗ שגיאה! זו אינה התשובה הנכונה.";

    // איתור והדגשת התשובה הנכונה בירוק
    currentQuestion.options.forEach((opt, index) => {
      if (opt.isCorrect) {
        allOptions[index].classList.add("correct");
      }
    });
  }

  nextBtn.style.display = "inline-block";
}

// טעינה ראשונית בהפעלת העמוד
loadNextQuestion();
