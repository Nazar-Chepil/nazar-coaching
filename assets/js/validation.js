// =========================================================================
// 1. КЛІЄНТСЬКА ВАЛІДАЦІЯ ФОРМИ ТА КЕРУВАННЯ ПОПАПАМИ
// =========================================================================

const REGEX_PHONE = /^\+380\d{9}$/;
const REGEX_EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Елементи попапу запису на консультацію
const bookingModal = document.getElementById("bookingModal");
const closeBookingModalBtn = document.getElementById("closeBookingModalBtn");
const bookingServiceBadge = document.getElementById("bookingServiceBadge");
const openBookingButtons = document.querySelectorAll("[data-open-booking]");

// Елементи форми
const form = document.getElementById("feedbackForm");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const messageInput = document.getElementById("message");
const agreementInput = document.getElementById("agreement");

const usernameError = document.getElementById("usernameError");
const emailError = document.getElementById("emailError");
const phoneError = document.getElementById("phoneError");
const messageError = document.getElementById("messageError");
const agreementError = document.getElementById("agreementError");

const usernameSuccessIcon = document.getElementById("usernameSuccessIcon");
const emailSuccessIcon = document.getElementById("emailSuccessIcon");
const phoneSuccessIcon = document.getElementById("phoneSuccessIcon");

// Елементи модального вікна успішної валідації
const successModal = document.getElementById("successModal");
const closeModalBtn = document.getElementById("closeModalBtn");
let lastFocusedElement = null;

// --- Керування UI-станами полів ---

function showError(input, errorEl, message, successIcon = null) {
  input.classList.remove("border-[#2A2A2A]", "border-green-500");
  input.classList.add("border-red-500");
  input.setAttribute("aria-invalid", "true");

  errorEl.textContent = message;
  errorEl.classList.remove("hidden");

  if (successIcon) {
    successIcon.classList.add("hidden");
  }
}

function showSuccess(input, errorEl, successIcon = null) {
  input.classList.remove("border-[#2A2A2A]", "border-red-500");
  input.classList.add("border-green-500");
  input.setAttribute("aria-invalid", "false");

  errorEl.textContent = "";
  errorEl.classList.add("hidden");

  if (successIcon) {
    successIcon.classList.remove("hidden");
  }
}

function resetFieldState(input, errorEl, successIcon = null) {
  input.classList.remove("border-red-500", "border-green-500");
  input.classList.add("border-[#2A2A2A]");
  input.setAttribute("aria-invalid", "false");
  input.dataset.touched = "false";

  errorEl.textContent = "";
  errorEl.classList.add("hidden");

  if (successIcon) {
    successIcon.classList.add("hidden");
  }
}

function resetAllStates() {
  resetFieldState(usernameInput, usernameError, usernameSuccessIcon);
  resetFieldState(emailInput, emailError, emailSuccessIcon);
  resetFieldState(phoneInput, phoneError, phoneSuccessIcon);
  resetFieldState(messageInput, messageError);
  resetFieldState(agreementInput, agreementError);
}

// --- Ізольовані функції валідації ---

function validateName() {
  const value = usernameInput.value.trim();
  if (!value) {
    showError(
      usernameInput,
      usernameError,
      "Введіть ваше ім'я",
      usernameSuccessIcon,
    );
    return false;
  }
  if (value.length < 2) {
    showError(
      usernameInput,
      usernameError,
      "Ім'я повинно містити щонайменше 2 символи",
      usernameSuccessIcon,
    );
    return false;
  }
  showSuccess(usernameInput, usernameError, usernameSuccessIcon);
  return true;
}

function validateEmail() {
  const value = emailInput.value.trim();
  if (!value) {
    showError(
      emailInput,
      emailError,
      "Введіть електронну пошту",
      emailSuccessIcon,
    );
    return false;
  }
  if (!REGEX_EMAIL.test(value)) {
    showError(
      emailInput,
      emailError,
      "Введіть коректну електронну адресу (наприклад, name@gmail.com)",
      emailSuccessIcon,
    );
    return false;
  }
  showSuccess(emailInput, emailError, emailSuccessIcon);
  return true;
}

function validatePhone() {
  const value = phoneInput.value.trim();
  if (!value) {
    showError(
      phoneInput,
      phoneError,
      "Введіть номер телефону",
      phoneSuccessIcon,
    );
    return false;
  }
  if (!REGEX_PHONE.test(value)) {
    showError(
      phoneInput,
      phoneError,
      "Формат номера має бути строго +380XXXXXXXXX (без пробілів і дужок)",
      phoneSuccessIcon,
    );
    return false;
  }
  showSuccess(phoneInput, phoneError, phoneSuccessIcon);
  return true;
}

function validateMessage() {
  const value = messageInput.value.trim();
  if (!value) {
    showError(messageInput, messageError, "Опишіть вашу ціль або запитання");
    return false;
  }
  if (value.length < 10) {
    showError(
      messageInput,
      messageError,
      "Повідомлення має містити мінімум 10 символів",
    );
    return false;
  }
  showSuccess(messageInput, messageError);
  return true;
}

function validateAgreement() {
  if (!agreementInput.checked) {
    agreementInput.setAttribute("aria-invalid", "true");
    agreementError.textContent =
      "Необхідно погодитися з політикою конфіденційності";
    agreementError.classList.remove("hidden");
    return false;
  }
  agreementInput.setAttribute("aria-invalid", "false");
  agreementError.textContent = "";
  agreementError.classList.add("hidden");
  return true;
}

// --- Динамічна валідація (blur + input) ---

const textFields = [
  { input: usernameInput, validator: validateName },
  { input: emailInput, validator: validateEmail },
  { input: phoneInput, validator: validatePhone },
  { input: messageInput, validator: validateMessage },
];

textFields.forEach(({ input, validator }) => {
  input.addEventListener("blur", () => {
    input.dataset.touched = "true";
    validator();
  });

  input.addEventListener("input", () => {
    if (input.dataset.touched === "true") {
      validator();
    }
  });
});

agreementInput.addEventListener("change", () => {
  agreementInput.dataset.touched = "true";
  validateAgreement();
});

// --- Відкриття та закриття попапу з формою запису ---

function openBookingModal(serviceName = "Разова консультація") {
  lastFocusedElement = document.activeElement;
  if (bookingServiceBadge) {
    bookingServiceBadge.textContent = serviceName;
  }
  bookingModal.classList.remove("hidden");
  bookingModal.classList.add("flex");
  document.body.classList.add("overflow-hidden");
  usernameInput.focus();
}

function closeBookingModal(restoreFocus = true) {
  bookingModal.classList.add("hidden");
  bookingModal.classList.remove("flex");
  document.body.classList.remove("overflow-hidden");
  if (restoreFocus && lastFocusedElement) {
    lastFocusedElement.focus();
  }
}

openBookingButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const serviceName =
      btn.getAttribute("data-open-booking") || "Разова консультація";
    openBookingModal(serviceName);
  });
});

closeBookingModalBtn.addEventListener("click", () => closeBookingModal(true));

bookingModal.addEventListener("click", (event) => {
  if (event.target === bookingModal) {
    closeBookingModal(true);
  }
});

// --- Відкриття та закриття модального вікна успішної валідації ---

function openSuccessModal() {
  successModal.classList.remove("hidden");
  successModal.classList.add("flex");
  document.body.classList.add("overflow-hidden");
  closeModalBtn.focus();
}

function closeSuccessModal() {
  successModal.classList.add("hidden");
  successModal.classList.remove("flex");
  document.body.classList.remove("overflow-hidden");
  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
}

closeModalBtn.addEventListener("click", closeSuccessModal);

successModal.addEventListener("click", (event) => {
  if (event.target === successModal) {
    closeSuccessModal();
  }
});

// Закриття активного модального вікна клавішею Escape
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (!successModal.classList.contains("hidden")) {
      closeSuccessModal();
    } else if (!bookingModal.classList.contains("hidden")) {
      closeBookingModal(true);
    }
  }
});

// --- Обробка відправки форми (Submit) ---

form.addEventListener("submit", (event) => {
  event.preventDefault();

  textFields.forEach(({ input }) => {
    input.dataset.touched = "true";
  });
  agreementInput.dataset.touched = "true";

  const isFormValid = [
    validateName(),
    validateEmail(),
    validatePhone(),
    validateMessage(),
    validateAgreement(),
  ].every(Boolean);

  if (isFormValid) {
    form.reset();
    resetAllStates();
    closeBookingModal(false); // Закриваємо попап форми
    openSuccessModal(); // Відкриваємо модалку успіху
  }
});

// =========================================================================
// 2. ВІДНОВЛЕНИЙ КАЛЬКУЛЯТОР БЖУ (Mifflin-St Jeor)
// =========================================================================

const bjuForm = document.getElementById("bjuForm");
const bjuResult = document.getElementById("bjuResult");

if (bjuForm && bjuResult) {
  bjuForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const gender = bjuForm.querySelector('input[name="gender"]:checked').value;
    const age = parseFloat(document.getElementById("bjuAge").value);
    const weight = parseFloat(document.getElementById("bjuWeight").value);
    const height = parseFloat(document.getElementById("bjuHeight").value);
    const activity = parseFloat(document.getElementById("bjuActivity").value);
    const goal = document.getElementById("bjuGoal").value;

    if (!age || !weight || !height) return;

    // Базовий обмін речовин (BMR)
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    bmr += gender === "male" ? 5 : -161;

    // Загальні витрати енергії (TDEE)
    let calories = bmr * activity;

    if (goal === "cut") calories *= 0.85;
    if (goal === "bulk") calories *= 1.15;

    calories = Math.round(calories);
    const protein = Math.round(weight * 2.0);
    const fats = Math.round(weight * 0.9);
    const carbs = Math.max(
      0,
      Math.round((calories - (protein * 4 + fats * 9)) / 4),
    );

    document.getElementById("resCalories").textContent = `${calories} ккал`;
    document.getElementById("resProtein").textContent = `${protein} г`;
    document.getElementById("resFats").textContent = `${fats} г`;
    document.getElementById("resCarbs").textContent = `${carbs} г`;

    bjuResult.classList.remove("hidden");
  });
}
