(() => {
  "use strict";

  // 1. КОНФІГУРАЦІЯ ОБМЕЖЕНЬ (Defensive Bounds)
  const INPUT_RULES = {
    age: {
      min: 14,
      max: 90,
      integerOnly: true,
      emptyMsg: "Вкажіть ваш вік.",
      rangeMsg: "Вік має бути від 14 до 90 років.",
      intMsg: "Введіть ціле число років.",
    },
    weight: {
      min: 35,
      max: 220,
      integerOnly: false,
      emptyMsg: "Вкажіть вашу вагу.",
      rangeMsg: "Вага має бути від 35 до 220 кг.",
      intMsg: "",
    },
    height: {
      min: 130,
      max: 230,
      integerOnly: true,
      emptyMsg: "Вкажіть ваш зріст.",
      rangeMsg: "Зріст має бути від 130 до 230 см.",
      intMsg: "Введіть ціле число в см.",
    },
  };

  // Білі списки для захисту від підміни значень через DevTools
  const ALLOWED_GENDERS = new Set(["male", "female"]);
  const ALLOWED_ACTIVITIES = new Set([1.2, 1.375, 1.55, 1.725]);
  const GOAL_FACTORS = {
    cut: 0.85,
    maintain: 1.0,
    bulk: 1.15,
  };

  // 2. ПОШУК DOM-ЕЛЕМЕНТІВ
  const dom = {
    form: document.getElementById("bjuForm"),
    genderRadios: document.querySelectorAll('input[name="gender"]'),
    age: document.getElementById("bjuAge"),
    weight: document.getElementById("bjuWeight"),
    height: document.getElementById("bjuHeight"),
    activity: document.getElementById("bjuActivity"),
    goal: document.getElementById("bjuGoal"),
    errGender: document.getElementById("bjuGenderError"),
    errAge: document.getElementById("bjuAgeError"),
    errWeight: document.getElementById("bjuWeightError"),
    errHeight: document.getElementById("bjuHeightError"),
    errActivity: document.getElementById("bjuActivityError"),
    errGoal: document.getElementById("bjuGoalError"),
    resCalories: document.getElementById("resCalories"),
    resProtein: document.getElementById("resProtein"),
    resFats: document.getElementById("resFats"),
    resCarbs: document.getElementById("resCarbs"),
    statusMsg: document.getElementById("bjuStatusMessage"),
  };

  // Fail-Safe перевірка: якщо якийсь елемент видалено з HTML — тихо виходимо без падіння
  const hasMissingNodes =
    !dom.form ||
    dom.genderRadios.length === 0 ||
    !dom.age ||
    !dom.weight ||
    !dom.height ||
    !dom.activity ||
    !dom.goal ||
    !dom.errGender ||
    !dom.errAge ||
    !dom.errWeight ||
    !dom.errHeight ||
    !dom.errActivity ||
    !dom.errGoal ||
    !dom.resCalories ||
    !dom.resProtein ||
    !dom.resFats ||
    !dom.resCarbs ||
    !dom.statusMsg;

  if (hasMissingNodes) {
    console.warn(
      "[BJU Calculator]: Один або кілька DOM-елементів не знайдено.",
    );
    return;
  }

  // 3. КЕРУВАННЯ UI-СТАНАМИ ПОМИЛОК
  function toggleInputError(inputEl, errorEl, message) {
    if (message) {
      inputEl.classList.remove(
        "border-brand-elevated",
        "focus:border-brand-terracotta",
      );
      inputEl.classList.add("border-red-500", "focus:border-red-500");
      inputEl.setAttribute("aria-invalid", "true");
      errorEl.textContent = message;
      errorEl.classList.remove("hidden");
    } else {
      inputEl.classList.remove("border-red-500", "focus:border-red-500");
      inputEl.classList.add(
        "border-brand-elevated",
        "focus:border-brand-terracotta",
      );
      inputEl.setAttribute("aria-invalid", "false");
      errorEl.textContent = "";
      errorEl.classList.add("hidden");
    }
  }

  function showBlockError(errorEl, message) {
    if (message) {
      errorEl.textContent = message;
      errorEl.classList.remove("hidden");
    } else {
      errorEl.textContent = "";
      errorEl.classList.add("hidden");
    }
  }

  // Скидання цифр у безпечний стан при некоректному введенні (захист від NaN / мінусів)
  function renderSafeFallback(warningText) {
    dom.resCalories.textContent = "0 ккал";
    dom.resProtein.textContent = "0 г";
    dom.resFats.textContent = "0 г";
    dom.resCarbs.textContent = "0 г";
    dom.statusMsg.textContent = warningText;
    dom.statusMsg.classList.remove("text-brand-muted");
    dom.statusMsg.classList.add("text-red-400");
  }

  // 4. ВАЛІДАЦІЯ КОЖНОГО ТИПУ ВХІДНИХ ДАНИХ
  function validateNumericInput(inputEl, errorEl, rule) {
    const rawValue = inputEl.value.trim();

    // Перевірка на порожній рядок (інакше Number("") дасть 0)
    if (rawValue === "") {
      toggleInputError(inputEl, errorEl, rule.emptyMsg);
      return null;
    }

    const parsed = Number(rawValue);

    // Перевірка на NaN та Infinity
    if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
      toggleInputError(inputEl, errorEl, "Введіть коректне число.");
      return null;
    }

    // Перевірка на ціле число (для віку та зросту)
    if (rule.integerOnly && !Number.isInteger(parsed)) {
      toggleInputError(inputEl, errorEl, rule.intMsg);
      return null;
    }

    // Перевірка меж [min; max] (відсікає від'ємні, нуль і надвеликі числа)
    if (parsed < rule.min || parsed > rule.max) {
      toggleInputError(inputEl, errorEl, rule.rangeMsg);
      return null;
    }

    toggleInputError(inputEl, errorEl, null);
    return parsed;
  }

  function getValidatedGender() {
    const checkedRadio = Array.from(dom.genderRadios).find(
      (radio) => radio.checked,
    );
    if (!checkedRadio || !ALLOWED_GENDERS.has(checkedRadio.value)) {
      showBlockError(dom.errGender, "Оберіть стать зі списку.");
      return null;
    }
    showBlockError(dom.errGender, null);
    return checkedRadio.value;
  }

  // 5. ОСНОВНА БІЗНЕС-ЛОГІКА РОЗРАХУНКУ
  function updateCalculator() {
    const gender = getValidatedGender();
    const age = validateNumericInput(dom.age, dom.errAge, INPUT_RULES.age);
    const weight = validateNumericInput(
      dom.weight,
      dom.errWeight,
      INPUT_RULES.weight,
    );
    const height = validateNumericInput(
      dom.height,
      dom.errHeight,
      INPUT_RULES.height,
    );

    const activity = Number(dom.activity.value);
    const isActivityValid = ALLOWED_ACTIVITIES.has(activity);
    toggleInputError(
      dom.activity,
      dom.errActivity,
      isActivityValid ? null : "Оберіть коректний рівень активності.",
    );

    const goal = dom.goal.value;
    const isGoalValid = Object.prototype.hasOwnProperty.call(
      GOAL_FACTORS,
      goal,
    );
    toggleInputError(
      dom.goal,
      dom.errGoal,
      isGoalValid ? null : "Оберіть коректну ціль.",
    );

    // Якщо хоча б одне поле невалідне — обчислення не виконуються
    if (
      gender === null ||
      age === null ||
      weight === null ||
      height === null ||
      !isActivityValid ||
      !isGoalValid
    ) {
      renderSafeFallback(
        "Виправте виділені червоним поля для розрахунку норми.",
      );
      return;
    }

    // Формула Міффліна — Сан-Жеора (Mifflin-St Jeor)
    const genderConstant = gender === "male" ? 5 : -161;
    const bmr = 10 * weight + 6.25 * height - 5 * age + genderConstant;
    const tdee = bmr * activity;
    const finalCalories = Math.max(1200, Math.round(tdee * GOAL_FACTORS[goal]));

    // Розрахунок макронутрієнтів (БЖВ)
    const proteinMultiplier = goal === "cut" ? 2.2 : 2.0;
    const protein = Math.round(weight * proteinMultiplier);
    const fats = Math.round(weight * 0.9);
    const remainingCalories = Math.max(
      160,
      finalCalories - (protein * 4 + fats * 9),
    );
    const carbs = Math.round(remainingCalories / 4);

    // Безпечне оновлення інтерфейсу через textContent
    dom.resCalories.textContent = `${finalCalories.toLocaleString("uk-UA")} ккал`;
    dom.resProtein.textContent = `${protein} г`;
    dom.resFats.textContent = `${fats} г`;
    dom.resCarbs.textContent = `${carbs} г`;

    dom.statusMsg.textContent =
      "Показники оновлюються автоматично під час зміни параметрів.";
    dom.statusMsg.classList.remove("text-red-400");
    dom.statusMsg.classList.add("text-brand-muted");
  }

  // 6. ПІДПИСКА НА ПОДІЇ (Live UX + захист від перезавантаження по submit)
  [dom.age, dom.weight, dom.height].forEach((inputEl) => {
    inputEl.addEventListener("input", updateCalculator);
  });

  [dom.activity, dom.goal].forEach((selectEl) => {
    selectEl.addEventListener("change", updateCalculator);
  });

  dom.genderRadios.forEach((radio) => {
    radio.addEventListener("change", updateCalculator);
  });

  dom.form.addEventListener("submit", (event) => {
    event.preventDefault();
    updateCalculator();
  });

  // Початковий розрахунок при відкритті сторінки
  updateCalculator();
})();
