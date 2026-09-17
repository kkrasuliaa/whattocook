// ======================================================
// 1. НАЛАШТУВАННЯ
// ======================================================

// Google Sheets CSV
// СЮДИ ВСТАВ ПОСИЛАННЯ НА ТВОЮ GOOGLE SHEET
const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/ТУТ_ID_ТАБЛИЦІ/export?format=csv&gid=0";


// ======================================================
// 2. TELEGRAM
// ======================================================

// БЕРЕМО З ПОСИЛАННЯ САЙТУ:
//
// https://твій-сайт.github.io/?token=123&chat=456
//
// Тобто нічого не треба писати тут.

const params = new URLSearchParams(window.location.search);

const BOT_TOKEN = params.get("token");
const CHAT_ID = params.get("chat");


// ======================================================
// 3. РЕЦЕПТИ
// ======================================================

let recipes = [];
let favoritesOnly = false;


// ======================================================
// 4. ЗАВАНТАЖЕННЯ РЕЦЕПТІВ
// ======================================================

async function loadRecipes() {

  try {

    const response = await fetch(SHEET_URL);

    const csv = await response.text();

    recipes = parseCSV(csv);

    renderRecipes();

  } catch (error) {

    console.error(error);

    document.getElementById("recipes").innerHTML =
      "<p>Не вдалося завантажити рецепти 😢</p>";
  }
}


// Простий CSV-парсер
function parseCSV(text) {

  const rows = text.trim().split("\n");

  const headers = rows[0]
    .split(",")
    .map(x => x.trim());

  return rows.slice(1).map(row => {

    const values = row.split(",");

    let recipe = {};

    headers.forEach((header, index) => {
      recipe[header] = values[index]
        ? values[index].trim()
        : "";
    });

    return recipe;

  });

}


// ======================================================
// 5. ПОКАЗ РЕЦЕПТІВ
// ======================================================

function renderRecipes() {

  const container = document.getElementById("recipes");

  container.innerHTML = "";

  let list = recipes;

  if (favoritesOnly) {

    list = recipes.filter(recipe =>
      localStorage.getItem("favorite_" + recipe.name) === "true"
    );

  }

  list.forEach(recipe => {

    const card = document.createElement("div");

    card.className = "card";

    card.innerHTML = `

      <img
        src="${recipe.image}"
        alt="${recipe.name}"
      >

      <div class="card-content">

        <h2>${recipe.name}</h2>

        <div class="ingredients">
          🛒 ${recipe.ingredients}
        </div>

        <div class="actions">

          <button
            class="want"
            onclick="wantRecipe('${escapeQuotes(recipe.name)}')"
          >
            ❤️ ХОЧУ
          </button>

          <button
            class="tiktok"
            onclick="openTikTok('${recipe.tiktok}')"
          >
            🎵 TikTok
          </button>

        </div>

        <br>

        <button
          onclick="rateRecipe('${escapeQuotes(recipe.name)}')"
        >
          ⭐ Оцінити
        </button>

      </div>
    `;

    container.appendChild(card);

  });

}


function escapeQuotes(text) {

  return text
    .replace(/'/g, "\\'")
    .replace(/"/g, '&quot;');

}


// ======================================================
// 6. ХОЧУ ❤️
// ======================================================

async function wantRecipe(name) {

  const recipe = recipes.find(r => r.name === name);

  if (!recipe) return;

  const ingredients = recipe.ingredients || "Інгредієнти не вказані";

  const message = `
❤️ ХОЧУ приготувати:

🍽️ ${name}

🛒 Продукти:
${ingredients}

🎵 TikTok:
${recipe.tiktok || "немає"}
`;

  // Запам'ятовуємо улюблене
  localStorage.setItem(
    "favorite_" + name,
    "true"
  );

  // Відправляємо Telegram
  await sendTelegram(message);

  alert("Відправлено ❤️");

}


// ======================================================
// 7. TELEGRAM
// ======================================================

async function sendTelegram(message) {

  if (!BOT_TOKEN || !CHAT_ID) {

    alert(
      "Telegram не налаштований.\n\n" +
      "Відкрий додаток через посилання з token і chat."
    );

    return;

  }

  const url =
    `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  try {

    await fetch(url, {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({

        chat_id: CHAT_ID,

        text: message

      })

    });

  } catch (error) {

    console.error("Telegram error:", error);

  }

}


// ======================================================
// 8. TIKTOK
// ======================================================

function openTikTok(url) {

  if (!url) {

    alert("Посилання на TikTok немає");

    return;

  }

  window.open(url, "_blank");

}


// ======================================================
// 9. ОЦІНКА
// ======================================================

function rateRecipe(name) {

  const rating = prompt(
    `Оціни "${name}" від 1 до 5 ⭐`
  );

  const number = Number(rating);

  if (
    number >= 1 &&
    number <= 5
  ) {

    localStorage.setItem(
      "rating_" + name,
      number
    );

    alert(`Оцінка ${number} ⭐ збережена`);

  }

}


// ======================================================
// 10. УЛЮБЛЕНІ
// ======================================================

function showFavorites() {

  favoritesOnly = !favoritesOnly;

  renderRecipes();

}


// ======================================================
// 11. ЗАПРОПОНУВАТИ
// ======================================================

function showAddForm() {

  document
    .getElementById("addForm")
    .classList.remove("hidden");

}

function hideAddForm() {

  document
    .getElementById("addForm")
    .classList.add("hidden");

}


// ======================================================
// 12. ДОДАТИ РЕЦЕПТ
// ======================================================

async function addRecipe() {

  const name =
    document.getElementById("newName").value.trim();

  const image =
    document.getElementById("newImage").value.trim();

  const tiktok =
    document.getElementById("newTikTok").value.trim();

  const ingredients =
    document.getElementById("newIngredients").value.trim();


  if (!name) {

    alert("Напиши назву страви");

    return;

  }


  const message = `
➕ НОВИЙ РЕЦЕПТ

🍽️ ${name}

🛒 Інгредієнти:
${ingredients}

🎵 TikTok:
${tiktok}

🖼️ Фото:
${image}
`;


  // Надсилаємо тобі пропозицію в Telegram
  await sendTelegram(message);


  alert(
    "Рецепт запропоновано ❤️\n\n" +
    "Він прийшов у Telegram."
  );


  hideAddForm();

}


// ======================================================
// СТАРТ
// ======================================================

loadRecipes();
