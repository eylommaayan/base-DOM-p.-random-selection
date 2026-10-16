# base-DOM-p.-random-selection
חידון טריוויה אינטראקטיבי בנושא אבטחת סייבר, שנבנה באמצעות HTML, CSS ו-JavaScript (ללא ספריות חיצוניות). כולל בחירה אקראית של שאלות, סינון לפי קטגוריות ומשוב מיידי.




<img width="902" height="663" alt="image" src="https://github.com/user-attachments/assets/8eefddb7-bbb1-4d9a-bdcd-2ceb5939d94c" />


מדריך זה מפרק את עקרונות ה-JavaScript שיושמו בקוד החידון, תוך התמקדות באופן שבו מייצרים רנדומליות, מנהלים מצב (State), ומשנים את ה-DOM בזמן אמת.

---

## 1. המנוע של הרנדומליות: אובייקט `Math`

ב-JavaScript אין פונקציה מובנית כמו `randomChoice(array)`. כדי לבחור פריט אקראי, משלבים שתי מתודות עיקריות של האובייקט `Math`:

1. **`Math.random()`**: מחזיר מספר עשרוני (Float) בטווח שבין 0 (כולל) ל-1 (לא כולל).
2. **`Math.floor()`**: מעגל מספר כלפי מטה למספר השלם הקרוב ביותר.

### נוסחת הבחירה מתוך מערך

```javascript
const items = ['Firewall', 'IDS', 'SIEM', 'Proxy'];

// 1. Math.random() מייצר למשל: 0.72
// 2. נכפיל באורך המערך (4): 0.72 * 4 = 2.88
// 3. Math.floor() יעגל כלפי מטה: 2
const randomIndex = Math.floor(Math.random() * items.length);

// 4. ניגש לאיבר באינדקס 2: 'SIEM'
const chosenItem = items[randomIndex];

```

*מדוע מעגלים עם `Math.floor` ולא `Math.round`?*
אינדקסים במערך מתחילים מ-0 ומסתיימים ב-`length - 1`. שימוש ב-`Math.floor` מבטיח חלוקת הסתברות אחידה לחלוטין לכל אינדקס, ומונע קבלת אינדקס החורג מגבולות המערך (`items.length`).

---

## 2. ערבוב מערך (Shuffling)

בחידון, אם התשובה הנכונה תמיד תישאר במיקומה המקורי, השחקן יוכל לנחש לפי דפוס קבוע. לכן נדרש לערבב את המערך בכל שאלה מחדש.

### שיטת הערבוב המהירה (`sort` עם `Math.random`)

במשחק השתמשנו בשורה הבאה:

```javascript
formattedOptions.sort(() => Math.random() - 0.5);

```

* **איך זה עובד?** הפונקציה `Array.prototype.sort()` משווה זוגות איברים. אם פונקציית ההשוואה מחזירה ערך חיובי, האיבר הראשון זז קדימה; אם שלילי, הוא זז אחורה.
* **החישוב:** `Math.random()` מייצר ערך בין 0 ל-1. החסרת `0.5` גורמת לתוצאה להיות חיובית ב-50% מהמקרים ושלילית ב-50% מהמקרים, מה שמבלבל את סדר האיברים.

> **הערה מקצועית:** לחידונים פשוטים שיטה זו מספקת. באפליקציות הדורשות אקראיות סטטיסטית מדויקת (כמו משחקי קלפים), משתמשים באלגוריתם **Fisher-Yates (Knuth) Shuffle**:
> ```javascript
> function shuffle(array) {
>   for (let i = array.length - 1; i > 0; i--) {
>     const j = Math.floor(Math.random() * (i + 1));
>     [array[i], array[j]] = [array[j], array[i]]; // החלפת מיקומים
>   }
>   return array;
> }
> 
> ```
> 
> 

---

## 3. שמירת תקינות המידע באמצעות מיפוי (`map`)

כאשר מערבבים את רשימת התשובות, האינדקס המקורי של התשובה הנכונה אובד. כדי לפתור זאת, הפכנו מחרוזות פשוטות לאובייקטים המכילים "דגל" בוליאני (`isCorrect`):

```javascript
// נתונים מקוריים
const qData = {
  options: ["ACK", "SYN", "SYN-ACK", "FIN"],
  correct: 1 // SYN הוא הנכון
};

// הפיכת כל מחרוזת לאובייקט שומר-מצב לפני הערבוב
const formattedOptions = qData.options.map((text, idx) => ({
  text: text,
  isCorrect: idx === qData.correct
}));

/*
תוצאה:
[
  { text: "ACK", isCorrect: false },
  { text: "SYN", isCorrect: true },
  ...
]
*/

```

כעת, גם אם נערבב את `formattedOptions`, כל אובייקט "זוכר" בעצמו אם הוא מייצג את התשובה הנכונה או לא.

---

## 4. מניפולציה דינמית על ה-DOM

במקום לכתוב את כל התגיות מראש ב-HTML, יצרנו את כפתורי התשובות בזמן ריצה.

```javascript
function renderQuestion() {
  answersContainerEl.innerHTML = ''; // 1. איפוס תוכן ישן

  currentQuestion.options.forEach((opt) => {
    // 2. יצירת אלמנט חדש בזיכרון
    const btn = document.createElement('div');
    btn.classList.add('answer-option');
    btn.innerText = opt.text;

    // 3. הצמדת מאזין אירועים ייעודי לכל כפתור
    btn.addEventListener('click', () => handleAnswerClick(btn, opt));

    // 4. הזרקת האלמנט לתוך ה-DOM
    answersContainerEl.appendChild(btn);
  });
}

```

* **`document.createElement('div')`**: מייצר אלמנט בזיכרון הדפדפן מבלי להציגו עדיין.
* **Closure (סגור) ב-`addEventListener**`: הפרמטרים `btn` ו-`opt` נשמרים בתוך פונקציית החץ, כך שבעת הלחיצה הפונקציה `handleAnswerClick` יודעת בדיוק על איזה כפתור נלחץ ומהם הנתונים המשויכים אליו.

---

## 5. ניהול מצב (State Machine) ומניעת לחיצות כפולות

באפליקציות אינטראקטיביות, מניעת פעולות כפולות מצד המשתמש חיונית לתקינות הלוגיקה:

```javascript
let canAnswer = true;

function handleAnswerClick(selectedEl, optionData) {
  // אם המשתמש כבר ענה על השאלה הנוכחית - עצור מיד
  if (!canAnswer) return;
  
  // נעילת המצב
  canAnswer = false;

  // חסימת סגנון לחיצה מכל שאר הכפתורים
  const allOptions = document.querySelectorAll('.answer-option');
  allOptions.forEach(opt => opt.classList.add('disabled'));

  // בדיקת נכונות ושינוי מחלקות CSS
  if (optionData.isCorrect) {
    selectedEl.classList.add('correct');
  } else {
    selectedEl.classList.add('wrong');
  }
}

```

* המשתנה `canAnswer` משמש כ-**Flag** (דגל). ברגע שהמשתמש ביצע לחיצה אחת, הדגל הופך ל-`false`. כל לחיצה נוספת תיתקל ב-`return` מוקדם ולא תבצע שום שינוי עד לשאלה הבאה שבה הדגל יאותחל מחדש ל-`true`.
