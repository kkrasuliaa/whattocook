// =====================================================
// GOOGLE APPS SCRIPT
// =====================================================

// 🔴 ВСТАВ СЮДИ URL СВОГО GOOGLE APPS SCRIPT

const API_URL =
"https://script.google.com/macros/s/AKfycbw4VbZ5BNNO6hzX8FpwptsCaOeASl1oWrlrWAY4lUJXq4oizuAKVx2pCJ6DlmW0jdE0/exec"

// =====================================================
// TELEGRAM
// =====================================================

// URL сайту буде:
//
// https://твій-сайт.github.io/?token=ТОКЕН&chat=CHAT_ID

const params =
  new URLSearchParams(
    window.location.search
  );


const BOT_TOKEN =
  params.get("token");

const CHAT_ID =
  params.get("chat");


// =====================================================
// РЕЦЕПТИ
// =====================================================

let recipes = [];


// =====================================================
// ЗАВАНТАЖИТИ РЕЦЕПТИ
// =====================================================

async function loadRecipes() {

  const container =
    document.getElementById("recipes");

  container.innerHTML =
    `<p>Завантажую рецепти... 🍝</p>`;


  try {

    const response =
      await fetch(API_URL + "?t=" + Date.now());

    recipes =
      await response.json();

    renderRecipes();

  } catch (error) {

    console.error(error);

    container.innerHTML =
      `<p>Не вдалося завантажити рецепти 😢</p>`;

  }

}


// =====================================================
// ПОКАЗ РЕЦЕПТІВ
// =====================================================

function renderRecipes() {

  const container =
    document.getElementById("recipes");

  container.innerHTML = "";


  if (!recipes.length) {

    container.innerHTML =
      `<p>Поки немає рецептів 🍽️</p>`;

    return;

  }


  recipes.forEach((recipe, index) => {

    const card =
      document.createElement("div");

    card.className =
      "card";


    card.innerHTML = `

      <img
        src="${
          recipe.image ||
          "https://placehold.co/600x800?text=🍽️"
        }"
        alt="${escapeHTML(recipe.name)}"
      >


      <div class="card-content">

        <h2>
          ${escapeHTML(recipe.name)}
        </h2>


        <div class="ingredients">

          🛒
          ${escapeHTML(recipe.ingredients)}

        </div>


        <div class="actions">

          <button
            class="want"
            onclick="wantRecipe(${index})"
          >
            ❤️ ХОЧУ
          </button>


          <button
            class="tiktok"
            onclick="openTikTok(${index})"
          >
            🎵 TikTok
          </button>

        </div>

      </div>

    `;


    container.appendChild(card);

  });

}


// =====================================================
// ХОЧУ ❤️
// =====================================================

async function wantRecipe(index) {

  const recipe =
    recipes[index];

  if (!recipe) return;


  const message = `

❤️ ХОЧУ ПРИГОТУВАТИ:

🍽️ ${recipe.name}

🛒 ПРОДУКТИ:
${recipe.ingredients}

🎵 TikTok:
${recipe.tiktok || "немає"}

`;


  await sendTelegram(message);


  alert(
    "Відправлено в Telegram ❤️"
  );

}


// =====================================================
// TELEGRAM
// =====================================================

async function sendTelegram(message) {

  if (!BOT_TOKEN || !CHAT_ID) {

    alert(
      "Telegram не налаштований.\n\n" +
      "В URL повинні бути token і chat."
    );

    return;

  }


  const url =
    `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;


  try {

    await fetch(url, {

      method: "POST",

      headers: {
        "Content-Type":
          "application/json"
      },

      body: JSON.stringify({

        chat_id: CHAT_ID,

        text: message

      })

    });

  } catch (error) {

    console.error(
      "Telegram error:",
      error
    );

  }

}


// =====================================================
// TIKTOK
// =====================================================

function openTikTok(index) {

  const recipe =
    recipes[index];


  if (!recipe.tiktok) {

    alert(
      "Посилання на TikTok немає 😢"
    );

    return;

  }


  window.open(
    recipe.tiktok,
    "_blank"
  );

}


// =====================================================
// ФОРМА
// =====================================================

function showAddForm() {

  document
    .getElementById("addForm")
    .classList
    .remove("hidden");

}


function hideAddForm() {

  document
    .getElementById("addForm")
    .classList
    .add("hidden");

}


// =====================================================
// ДОДАТИ НОВИЙ РЕЦЕПТ
// =====================================================

async function addRecipe() {

  const name =
    document
      .getElementById("newName")
      .value
      .trim();


  const tiktok =
    document
      .getElementById("newTikTok")
      .value
      .trim();


  const ingredients =
    document
      .getElementById("newIngredients")
      .value
      .trim();


  // -----------------------------------------------
  // Перевірка
  // -----------------------------------------------

  if (!name) {

    alert(
      "Напиши назву страви 🍝"
    );

    return;

  }


  if (!tiktok) {

    alert(
      "Встав посилання на TikTok 🎵"
    );

    return;

  }


  if (!ingredients) {

    alert(
      "Напиши інгредієнти 🛒"
    );

    return;

  }


  const button =
    document.querySelector(
      "#addForm .form-buttons button"
    );


  button.disabled = true;

  button.textContent =
    "Додаю...";



  try {

    // ---------------------------------------------
    // Додаємо в Google Sheet
    // ---------------------------------------------

    await fetch(API_URL, {

      method: "POST",

      mode: "no-cors",

      headers: {

        "Content-Type":
          "text/plain;charset=utf-8"

      },

      body: JSON.stringify({

        name: name,

        tiktok: tiktok,

        ingredients: ingredients

      })

    });


    // ---------------------------------------------
    // Невелика пауза, щоб Google записав рядок
    // ---------------------------------------------

    await new Promise(
      resolve =>
        setTimeout(resolve, 800)
    );


    // ---------------------------------------------
    // Telegram
    // ---------------------------------------------

    await sendTelegram(`

➕ НОВИЙ РЕЦЕПТ:

🍽️ ${name}

🛒 ${ingredients}

🎵 ${tiktok}

    `);


    // ---------------------------------------------
    // Очистити форму
    // ---------------------------------------------

    document
      .getElementById("newName")
      .value = "";


    document
      .getElementById("newTikTok")
      .value = "";


    document
      .getElementById("newIngredients")
      .value = "";


    hideAddForm();


    // ---------------------------------------------
    // Заново завантажити рецепти
    // ---------------------------------------------

    await loadRecipes();


    alert(
      "Рецепт додано ❤️"
    );


  } catch (error) {

    console.error(error);

    alert(
      "Щось пішло не так 😢"
    );

  } finally {

    button.disabled = false;

    button.textContent =
      "Додати ❤️";

  }

}


// =====================================================
// ЗАХИСТ ТЕКСТУ
// =====================================================

function escapeHTML(text) {

  return String(text || "")

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");

}


// =====================================================
// СТАРТ
// =====================================================

loadRecipes();
