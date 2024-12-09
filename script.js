document.addEventListener("DOMContentLoaded", () => {
    const stockList = document.getElementById("stock");
    const flavorSelect = document.getElementById("flavor");
    const cashboxDisplay = document.getElementById("cashbox");
    const modal = document.getElementById("modal");
    const closeModal = document.querySelector(".close");
    const flavorForm = document.getElementById("flavor-form");

    // Dados iniciais ou carregados do Local Storage
    const data = JSON.parse(localStorage.getItem("storeData")) || {
        flavors: [
            { name: "Coco", price: 2.0, stock: 20 },
            { name: "Morango", price: 2.5, stock: 15 },
            { name: "Chocolate", price: 3.0, stock: 10 },
        ],
        cashbox: 0,
    };

    // Salva os dados no Local Storage
    const saveData = () => localStorage.setItem("storeData", JSON.stringify(data));

    // Atualiza o estoque na interface
    const updateStockUI = () => {
        stockList.innerHTML = "";
        flavorSelect.innerHTML = "";
        data.flavors.forEach((flavor, index) => {
            stockList.innerHTML += `<li>${flavor.name}: <span>${flavor.stock}</span></li>`;
            flavorSelect.innerHTML += `<option value="${index}">${flavor.name} - R$${flavor.price.toFixed(2)}</option>`;
        });
    };

    // Atualiza o caixa na interface
    const updateCashboxUI = () => {
        cashboxDisplay.textContent = data.cashbox.toFixed(2);
    };

    // Adiciona/edita sabores
    flavorForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("new-flavor").value;
        const price = parseFloat(document.getElementById("price").value);
        const stock = parseInt(document.getElementById("stock-quantity").value, 10);

        const existingFlavor = data.flavors.find((flavor) => flavor.name === name);

        if (existingFlavor) {
            existingFlavor.price = price;
            existingFlavor.stock += stock;
        } else {
            data.flavors.push({ name, price, stock });
        }

        saveData();
        updateStockUI();
        modal.style.display = "none";
    });

    // Realizar venda
    document.getElementById("sale-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const flavorIndex = parseInt(flavorSelect.value, 10);
        const quantity = parseInt(document.getElementById("quantity").value, 10);
        const deliveryFee = parseFloat(document.getElementById("delivery").value) || 0;

        const selectedFlavor = data.flavors[flavorIndex];

        if (selectedFlavor.stock >= quantity) {
            selectedFlavor.stock -= quantity;
            data.cashbox += selectedFlavor.price * quantity + deliveryFee;
            saveData();
            updateStockUI();
            updateCashboxUI();
        } else {
            alert("Estoque insuficiente!");
        }
    });

    // Modal control
    document.getElementById("add-flavor").addEventListener("click", () => {
        modal.style.display = "flex";
    });

    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // Inicialização
    updateStockUI();
    updateCashboxUI();
});
