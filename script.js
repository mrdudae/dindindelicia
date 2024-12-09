// Elementos de login
const loginScreen = document.getElementById("login-screen");
const appScreen = document.getElementById("app-screen");
const loginForm = document.getElementById("login-form");
const logoutButton = document.getElementById("logout-button");

// Elementos de estoque
const addItemForm = document.getElementById("add-item-form");
const stockList = document.getElementById("stock-list");

let currentUser = null;
let usersData = JSON.parse(localStorage.getItem("usersData")) || {};

// Função para mostrar a tela correta
function showScreen() {
    if (currentUser) {
        loginScreen.style.display = "none";
        appScreen.style.display = "block";
        loadUserStock();
    } else {
        loginScreen.style.display = "block";
        appScreen.style.display = "none";
    }
}

// Função para carregar o estoque do usuário
function loadUserStock() {
    stockList.innerHTML = "";
    const userStock = usersData[currentUser]?.stock || [];
    userStock.forEach((item, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${item.name}</span>
            <div>
                <button class="decrease" onclick="updateQuantity(${index}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity(${index}, 1)">+</button>
            </div>
        `;
        stockList.appendChild(li);
    });
}

// Função para salvar o estoque no localStorage
function saveUserStock() {
    usersData[currentUser].stock = usersData[currentUser].stock || [];
    localStorage.setItem("usersData", JSON.stringify(usersData));
}

// Função para atualizar a quantidade de um item
function updateQuantity(index, change) {
    const userStock = usersData[currentUser]?.stock || [];
    userStock[index].quantity = Math.max(0, userStock[index].quantity + change);
    saveUserStock();
    loadUserStock();
}

// Função para adicionar um novo item
addItemForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const itemName = document.getElementById("new-item-name").value.trim();
    if (!itemName) return;

    const userStock = usersData[currentUser].stock || [];
    userStock.push({ name: itemName, quantity: 0 });
    saveUserStock();
    addItemForm.reset();
    loadUserStock();
});

// Login
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    if (!username) return;

    currentUser = username;
    if (!usersData[currentUser]) {
        usersData[currentUser] = { stock: [] };
    }
    showScreen();
});

// Logout
logoutButton.addEventListener("click", () => {
    currentUser = null;
    showScreen();
});

// Inicializar
showScreen();