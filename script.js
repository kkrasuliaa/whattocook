// =====================================================
// GOOGLE APPS SCRIPT
// =====================================================

// 🔴 ВСТАВ СЮДИ URL СВОГО GOOGLE APPS SCRIPT

const API_URL =
  "https://script.google.com/macros/s/AKfycbwkl3fM_UidWHeuec2cxe2DllM7ZrRH-gjgjYrVmJLXyHSxsD3z1xlTq-SNlToe6WMl/exec";


// =====================================================
// TELEGRAM
// =====================================================

const params =
  new URLSearchParams(
    window.location.search
  );


const BOT_TOKEN =
  params.get("token");


const CHAT_ID =
  params.get("chat");


// =====================================================
// ДАНІ
// =====================================================

let recipes = [];


// =====================================================
// ЗАВАНТАЖЕННЯ РЕЦЕПТІВ
// =====================================================

async function loadRecipes() {

  const container =
    document.getElementById("recipes");


  container.innerHTML = `
    <p style="text-align:center;">
      Завантажую рецепти... 🍝
    </p>
  `;


  try {

    const response =
      await fetch(
        API_URL +
        "?t=" +
        Date.now()
      );


    if (!response.ok) {

      throw new Error(
        "Помилка завантаження"
      );

    }


    recipes =
      await response.json();


    renderRecipes();

  } catch (error) {

    console.error(error);


    container.innerHTML = `
      <p style="text-align:center;">
        Не вдалося завантажити рецепти 😢
      </p>
    `;

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

    container.innerHTML = `
      <p style="text-align:center;">
        Поки немає рецептів 🍽️
      </p>
    `;

    return;

  }


  recipes.forEach(
    (recipe, index) => {

      const card =
        document.createElement("div");


      card.className =
        "card";


      let videoHTML = "";


      // =============================================
      // Є VIDEO ID
      // =============================================

      if (recipe.video_id) {

        videoHTML = `

          <div class="tiktok-box">

            <blockquote
              class="tiktok-embed"

              cite="${escapeAttribute(
                recipe.tiktok
              )}"

              data-video-id="${
                recipe.video_id
              }"

              style="
                max-width: 605px;
                min-width: 325px;
              "
            >

              <section>

                <a
                  target="_blank"
                  href="${escapeAttribute(
                    recipe.tiktok
                  )}"
                >
                  Дивитися в TikTok
                </a>

              </section>

            </blockquote>

          </div>

        `;

      } else {

        videoHTML = `

          <div class="no-preview">

            <div>🎵</div>

            <span>
              Не вдалося завантажити TikTok
            </span>

          </div>

        `;

      }


      // =============================================
      // КАРТКА
      // =============================================

      card.innerHTML = `

        ${videoHTML}


        <div class="card-content">

          <h2>
            ${escapeHTML(recipe.name)}
          </h2>


          <div class="ingredients">

            🛒
            ${escapeHTML(
              recipe.ingredients
            )}

          </div>


          <div class="actions">

            <button
              class="want"
              onclick="wantRecipe(${index})"
            >
              ❤️ ХОЧУ
            </button>


            <button
              class="tiktok-button"
              onclick="openTikTok(${index})"
            >
              🎵 TikTok
            </button>

          </div>

        </div>

      `;


      container.appendChild(card);

    }
  );


  // =============================================
  // Запустити TikTok Embed
  // =============================================

  renderTikTokEmbeds();

}


// =====================================================
// TIKTOK EMBED
// =====================================================

function renderTikTokEmbeds() {

  // Якщо TikTok вже завантажив embed.js

  if (
    window.tiktok &&
    window.tiktok.embed &&
    window.tiktok.embed.lib
  ) {

    try {

      window.tiktok.embed.lib.render();

      return;

    } catch (error) {

      console.log(
        "TikTok render error:",
        error
      );

    }

  }


  // Якщо скрипт ще не встиг завантажитися —
  // пробуємо ще раз

  setTimeout(
    renderTikTokEmbeds,
    500
  );

}


// =====================================================
// ХОЧУ ❤️
// =====================================================

async function wantRecipe(index) {

  const recipe =
    recipes[index];


  if (!recipe) return;


  const message = `❤️ ХОЧУ ПРИГОТУВАТИ:

🍽️ ${recipe.name}

🛒 ПРОДУКТИ:
${recipe.ingredients}

🎵 TikTok:
${recipe.tiktok}`;


  await sendTelegram(message);


  alert(
    "Відправлено в Telegram ❤️"
  );

}


// =====================================================
// TELEGRAM
// =====================================================

async function sendTelegram(message) {

  if (
    !BOT_TOKEN ||
    !CHAT_ID
  ) {

    alert(
      "Telegram не налаштований.\n\n" +
      "У посиланні сайту повинні бути " +
      "token і chat."
    );

    return;

  }


  const url =
    "https://api.telegram.org/bot" +
    BOT_TOKEN +
    "/sendMessage";


  try {

    await fetch(

      url,

      {

        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({

          chat_id:
            CHAT_ID,

          text:
            message

        })

      }

    );

  } catch (error) {

    console.error(
      "Telegram error:",
      error
    );

  }

}


// =====================================================
// ВІДКРИТИ TIKTOK
// =====================================================

function openTikTok(index) {

  const recipe =
    recipes[index];


  if (!recipe) return;


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
// ДОДАТИ РЕЦЕПТ
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
      .getElementById(
        "newIngredients"
      )
      .value
      .trim();


  // =============================================
  // Перевірка
  // =============================================

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
      ".save-button"
    );


  button.disabled =
    true;


  button.textContent =
    "Додаю...";



  try {

    // =========================================
    // В Google Sheets
    // =========================================

    await fetch(

      API_URL,

      {

        method: "POST",

        mode: "no-cors",

        headers: {

          "Content-Type":
            "text/plain;charset=utf-8"

        },

        body:
          JSON.stringify({

            name:
              name,

            tiktok:
              tiktok,

            ingredients:
              ingredients

          })

        }

    );


    // Даємо Apps Script
    // записати рядок

    await wait(1500);


    // =========================================
    // Telegram
    // =========================================

    await sendTelegram(
`➕ НОВИЙ РЕЦЕПТ:

🍽️ ${name}

🛒 ${ingredients}

🎵 ${tiktok}`
    );


    // =========================================
    // Очистити форму
    // =========================================

    document
      .getElementById(
        "newName"
      )
      .value = "";


    document
      .getElementById(
        "newTikTok"
      )
      .value = "";


    document
      .getElementById(
        "newIngredients"
      )
      .value = "";


    hideAddForm();


    // =========================================
    // Оновити список
    // =========================================

    await loadRecipes();


    alert(
      "Рецепт додано ❤️"
    );


  } catch (error) {

    console.error(error);


    alert(
      "Не вдалося додати рецепт 😢"
    );


  } finally {

    button.disabled =
      false;


    button.textContent =
      "Додати ❤️";

  }

}


// =====================================================
// WAIT
// =====================================================

function wait(ms) {

  return new Promise(
    resolve =>
      setTimeout(
        resolve,
        ms
      )
  );

}


// =====================================================
// БЕЗПЕЧНИЙ HTML
// =====================================================

function escapeHTML(text) {

  return String(
    text || ""
  )

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


// =====================================================
// БЕЗПЕЧНИЙ ATTRIBUTE
// =====================================================

function escapeAttribute(text) {

  return escapeHTML(text);

}


// =====================================================
// СТАРТ
// =====================================================

loadRecipes();
