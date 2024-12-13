document.addEventListener("DOMContentLoaded", () => {
    // Referências aos elementos do DOM
    const stockList = document.getElementById("stock");
    const flavorsList = document.getElementById("flavors-list");
    const totalStockEl = document.getElementById("total-stock");
    const totalStockValueEl = document.getElementById("total-stock-value");
    const totalValueEl = document.getElementById("total-value");
    const cashboxEl = document.getElementById("cashbox");
    const salesTodayEl = document.getElementById("sales-today");

    // Inicialização dos dados do estoque, caixa e vendas do dia
    let stock = JSON.parse(localStorage.getItem("stock")) || [
        { flavor: "Morango", price: 2.5, quantity: 20 },
        { flavor: "Chocolate", price: 3.0, quantity: 15 },
    ];
    let cashbox = parseFloat(localStorage.getItem("cashbox")) || 0;
    let salesToday = parseFloat(localStorage.getItem("salesToday")) || 0;

    // Atualiza a exibição do estoque na interface
    function updateStockDisplay() {
        stockList.innerHTML = ""; // Limpa a lista de exibição do estoque
        let totalQuantity = 0;
        let totalValue = 0;

        stock.forEach(({ flavor, price, quantity }) => {
            // Cria e adiciona um item à lista de estoque
            const li = document.createElement("li");
            li.textContent = `${flavor} - R$ ${price.toFixed(2)} - ${quantity} unidades`;
            stockList.appendChild(li);

            totalQuantity += quantity; // Soma as quantidades
            totalValue += price * quantity; // Soma os valores
        });

        totalStockEl.textContent = totalQuantity; // Atualiza a quantidade total
        totalStockValueEl.textContent = totalValue.toFixed(2); // Atualiza o valor total

        // Salva o estoque atualizado no localStorage
        localStorage.setItem("stock", JSON.stringify(stock));
    }

    // Atualiza o valor do caixa
    function updateCashbox(amount) {
        cashbox += amount; // Adiciona o valor ao caixa
        cashboxEl.textContent = cashbox.toFixed(2); // Exibe o valor atualizado no caixa
        totalValueEl.textContent = cashbox.toFixed(2); // Atualiza o total exibido

        // Salva o caixa atualizado no localStorage
        localStorage.setItem("cashbox", cashbox);
    }

    // Atualiza o total de vendas do dia
    function updateSalesToday(amount) {
        salesToday += amount; // Soma o valor à venda do dia
        salesTodayEl.textContent = salesToday.toFixed(2); // Exibe o total atualizado

        // Salva as vendas do dia no localStorage
        localStorage.setItem("salesToday", salesToday);
    }

    // Adiciona campos dinâmicos para seleção de sabores e quantidade
    function addFlavorFields() {
        const div = document.createElement("div"); // Cria um novo contêiner para os campos
        div.classList.add("flavor-field");
        div.innerHTML = `
            <label>Sabor:</label>
            <select required>
                ${stock.map(({ flavor }) => `<option value="${flavor}">${flavor}</option>`).join("")}
            </select>
            <label>Quantidade:</label>
            <input type="number" min="1" required>
        `;
        flavorsList.appendChild(div); // Adiciona os campos ao formulário
    }

    // Evento para adicionar mais campos de sabores
    document.getElementById("add-more-flavor").addEventListener("click", addFlavorFields);

    // Lógica para processar a venda
    document.getElementById("sale-form").addEventListener("submit", (e) => {
        e.preventDefault(); // Previne o comportamento padrão do formulário

        // Recupera os campos dos sabores e a taxa de entrega
        const flavorFields = flavorsList.querySelectorAll(".flavor-field");
        const deliveryFee = parseFloat(document.getElementById("delivery-fee").value) || 0;

        let saleTotal = 0; // Inicializa o total da venda

        // Calcula o total dos sabores selecionados
        flavorFields.forEach((field) => {
            const flavor = field.querySelector("select").value;
            const quantity = parseInt(field.querySelector("input").value);
            const item = stock.find((item) => item.flavor === flavor);

            if (item && item.quantity >= quantity) {
                item.quantity -= quantity; // Reduz a quantidade no estoque
                saleTotal += item.price * quantity; // Soma o valor ao total da venda
            }
        });

        // Adiciona a taxa de entrega ao total da venda
        saleTotal += deliveryFee;

        if (saleTotal > 0) {
            updateStockDisplay(); // Atualiza a exibição do estoque
            updateCashbox(saleTotal); // Atualiza o caixa
            updateSalesToday(saleTotal); // Atualiza as vendas do dia
            alert(`Venda concluída! Total (com taxa): R$ ${saleTotal.toFixed(2)}`);
        } else {
            alert("Por favor, preencha os campos corretamente e tente novamente.");
        }
    });

    // Lógica para atualizar o caixa com entradas e saídas
    document.getElementById("update-cashbox").addEventListener("click", () => {
        const entry = parseFloat(document.getElementById("cash-entry").value) || 0;
        const exit = parseFloat(document.getElementById("cash-exit").value) || 0;
        updateCashbox(entry - exit); // Atualiza o caixa com a diferença
    });

    // Lógica para abrir e fechar o modal de adição de sabores
    const modal = document.getElementById("modal");
    const closeModal = document.querySelector(".close");

    document.getElementById("add-flavor").addEventListener("click", () => {
        modal.style.display = "flex"; // Exibe o modal
    });

    closeModal.addEventListener("click", () => {
        modal.style.display = "none"; // Esconde o modal
    });

    // Lógica para adicionar um novo sabor ao estoque
    document.getElementById("flavor-form").addEventListener("submit", (e) => {
        e.preventDefault(); // Previne o comportamento padrão do formulário

        const flavor = document.getElementById("new-flavor").value;
        const price = parseFloat(document.getElementById("price").value);
        const quantity = parseInt(document.getElementById("stock-quantity").value);

        stock.push({ flavor, price, quantity }); // Adiciona o novo sabor ao estoque
        updateStockDisplay(); // Atualiza a exibição do estoque
        modal.style.display = "none"; // Fecha o modal
    });

    // Inicializa as exibições com os dados salvos
    updateStockDisplay();
    cashboxEl.textContent = cashbox.toFixed(2);
    totalValueEl.textContent = cashbox.toFixed(2);
    salesTodayEl.textContent = salesToday.toFixed(2);
});
