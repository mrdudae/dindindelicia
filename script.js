document.addEventListener("DOMContentLoaded", () => {  
    const stockList = document.getElementById("stock");
    const flavorsList = document.getElementById("flavors-list");
    const totalStockEl = document.getElementById("total-stock");
    const totalStockValueEl = document.getElementById("total-stock-value");
    const totalValueEl = document.getElementById("total-value");
    const cashboxEl = document.getElementById("cashbox");
    const salesTodayEl = document.getElementById("sales-today");

    let stock = JSON.parse(localStorage.getItem("stock")) || [
        { flavor: "Morango", price: 2.5, quantity: 20 },
        { flavor: "Chocolate", price: 3.0, quantity: 15 },
    ];
    let cashbox = parseFloat(localStorage.getItem("cashbox")) || 0;
    let salesToday = parseFloat(localStorage.getItem("salesToday")) || 0;

    function updateStockDisplay() {
        stockList.innerHTML = "";
        let totalQuantity = 0;
        let totalValue = 0;

        stock.forEach(({ flavor, price, quantity }) => {
            const li = document.createElement("li");
            li.textContent = `${flavor} - R$ ${price.toFixed(2)} - ${quantity} unidades`;
            stockList.appendChild(li);
            totalQuantity += quantity;
            totalValue += price * quantity;
        });

        totalStockEl.textContent = totalQuantity;
        totalStockValueEl.textContent = totalValue.toFixed(2);

        // Save stock to localStorage
        localStorage.setItem("stock", JSON.stringify(stock));
    }

    function updateCashbox(amount) {
        cashbox += amount;
        cashboxEl.textContent = cashbox.toFixed(2);
        totalValueEl.textContent = cashbox.toFixed(2);

        // Save cashbox to localStorage
        localStorage.setItem("cashbox", cashbox);
    }

    function updateSalesToday(amount) {
        salesToday += amount;
        salesTodayEl.textContent = salesToday.toFixed(2);

        // Save salesToday to localStorage
        localStorage.setItem("salesToday", salesToday);
    }

    function addFlavorFields() {
        const div = document.createElement("div");
        div.classList.add("flavor-field");
        div.innerHTML = `
            <label>Sabor:</label>
            <select required>
                ${stock.map(({ flavor }) => `<option value="${flavor}">${flavor}</option>`).join("")}
            </select>
            <label>Quantidade:</label>
            <input type="number" min="1" required>
        `;
        flavorsList.appendChild(div);
    }

    document.getElementById("add-more-flavor").addEventListener("click", addFlavorFields);

    document.getElementById("sale-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const flavorFields = flavorsList.querySelectorAll(".flavor-field");
        let saleTotal = 0;

        flavorFields.forEach((field) => {
            const flavor = field.querySelector("select").value;
            const quantity = parseInt(field.querySelector("input").value);
            const item = stock.find((item) => item.flavor === flavor);

            if (item && item.quantity >= quantity) {
                item.quantity -= quantity;
                saleTotal += item.price * quantity;
            }
        });

        updateStockDisplay();
        updateCashbox(saleTotal);
        updateSalesToday(saleTotal);
    });

    document.getElementById("update-cashbox").addEventListener("click", () => {
        const entry = parseFloat(document.getElementById("cash-entry").value) || 0;
        const exit = parseFloat(document.getElementById("cash-exit").value) || 0;
        updateCashbox(entry - exit);
    });

    // Modal Logic
    const modal = document.getElementById("modal");
    const closeModal = document.querySelector(".close");

    document.getElementById("add-flavor").addEventListener("click", () => {
        modal.style.display = "flex";
    });

    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
    });

    document.getElementById("flavor-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const flavor = document.getElementById("new-flavor").value;
        const price = parseFloat(document.getElementById("price").value);
        const quantity = parseInt(document.getElementById("stock-quantity").value);

        stock.push({ flavor, price, quantity });
        updateStockDisplay();
        modal.style.display = "none";
    });

    // Initialize display
    updateStockDisplay();
    cashboxEl.textContent = cashbox.toFixed(2);
    totalValueEl.textContent = cashbox.toFixed(2);
    salesTodayEl.textContent = salesToday.toFixed(2);
});
