document.addEventListener("DOMContentLoaded", () => {  
    // Referências aos elementos do DOM
    const stockList = document.getElementById("stock");
    const flavorsList = document.getElementById("flavors-list");
    const totalStockEl = document.getElementById("total-stock");
    const totalStockValueEl = document.getElementById("total-stock-value");
    const totalValueEl = document.getElementById("total-value");
    const cashboxEl = document.getElementById("cashbox");
    const salesTodayEl = document.getElementById("sales-today");
    const salesWeeklyEl = document.getElementById("sales-week");
    const salesMonthlyEl = document.getElementById("sales-month");

    // Inicialização dos dados
    let stock = JSON.parse(localStorage.getItem("stock")) || [
        { flavor: "Morango", price: 2.5, quantity: 20 },
        { flavor: "Chocolate", price: 3.0, quantity: 15 },
    ];
    let cashbox = parseFloat(localStorage.getItem("cashbox")) || 0;
    let salesToday = parseFloat(localStorage.getItem("salesToday")) || 0;
    let salesWeekly = parseFloat(localStorage.getItem("salesWeekly")) || 0;
    let salesMonthly = parseFloat(localStorage.getItem("salesMonthly")) || 0;
    let saleItems = []; // Lista de itens vendidos

    // Atualiza o relatório de vendas
    function updateSalesReport(amount) {
        salesToday += amount;
        salesWeekly += amount;
        salesMonthly += amount;

        salesTodayEl.textContent = salesToday.toFixed(2);
        salesWeeklyEl.textContent = salesWeekly.toFixed(2);
        salesMonthlyEl.textContent = salesMonthly.toFixed(2);

        localStorage.setItem("salesToday", salesToday);
        localStorage.setItem("salesWeekly", salesWeekly);
        localStorage.setItem("salesMonthly", salesMonthly);
    }

    // Atualiza a exibição do estoque
    function updateStockDisplay() {
        stockList.innerHTML = ""; // Limpa a lista de exibição do estoque
        let totalQuantity = 0;
        let totalValue = 0;

        stock.forEach(({ flavor, price, quantity }) => {
            const li = document.createElement("li");
            li.textContent = `${flavor} - R$ ${price.toFixed(2)} - ${quantity} unidades`;

            // Adiciona botão de exclusão
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Excluir";
            deleteButton.classList.add("delete-btn");
            deleteButton.addEventListener("click", (e) => {
                e.stopPropagation();
                deleteStockItem(flavor);
            });

            li.appendChild(deleteButton); // Adiciona o botão ao item
            li.addEventListener("click", () => openEditStockModal(flavor)); // Abre o modal de edição
            stockList.appendChild(li);

            totalQuantity += quantity;
            totalValue += price * quantity;
        });

        totalStockEl.textContent = totalQuantity;
        totalStockValueEl.textContent = totalValue.toFixed(2);
        localStorage.setItem("stock", JSON.stringify(stock)); // Salva o estoque no localStorage
    }

    // Função para excluir um item
    function deleteStockItem(flavor) {
        const index = stock.findIndex(item => item.flavor === flavor);
        if (index !== -1) {
            stock.splice(index, 1); // Remove o item do estoque
            updateStockDisplay(); // Atualiza a lista de estoque
        }
    }

    // Atualiza o caixa
    function updateCashbox(amount) {
        cashbox += amount;
        cashboxEl.textContent = cashbox.toFixed(2);
        totalValueEl.textContent = cashbox.toFixed(2);
        localStorage.setItem("cashbox", cashbox); // Salva o caixa no localStorage
    }

    // Adiciona um item à venda
    function addSaleItem(flavor, price, quantity) {
        const item = stock.find(item => item.flavor === flavor);
        if (item && item.quantity >= quantity) {
            item.quantity -= quantity; // Atualiza o estoque
            updateStockDisplay();

            saleItems.push({ flavor, price, quantity });
            return price * quantity; // Retorna o valor do item vendido
        }
        return 0;
    }

    // Calcula o valor total do pedido (incluindo entrega)
    document.getElementById("sale-form").addEventListener("submit", (e) => {
        e.preventDefault();
        let totalSaleValue = 0;
        
        // Soma o valor dos itens vendidos
        saleItems.forEach(item => {
            totalSaleValue += item.price * item.quantity;
        });

        // Pega o valor da entrega e soma ao valor total do pedido
        const deliveryFee = parseFloat(document.getElementById("delivery-fee").value) || 0;
        const totalAmount = totalSaleValue + deliveryFee;

        // Atualiza o caixa com o total da venda
        updateCashbox(totalAmount);

        // Atualiza o relatório de vendas
        updateSalesReport(totalAmount);

        // Exibe a confirmação
        alert(`Pedido Confirmado! Total: R$ ${totalAmount.toFixed(2)}`);
        
        // Limpa os itens da venda
        saleItems = [];
    });

    // Ação de adicionar um sabor
    document.getElementById("add-flavor").addEventListener("click", () => {
        const modal = document.getElementById("modal");
        const newFlavorInput = document.getElementById("new-flavor");
        const priceInput = document.getElementById("price");
        const stockQuantityInput = document.getElementById("stock-quantity");

        modal.style.display = "flex";

        modal.querySelector(".close").addEventListener("click", () => {
            modal.style.display = "none";
        });

        document.getElementById("flavor-form").addEventListener("submit", (e) => {
            e.preventDefault();
            const newFlavor = newFlavorInput.value;
            const price = parseFloat(priceInput.value);
            const quantity = parseInt(stockQuantityInput.value);

            stock.push({ flavor: newFlavor, price, quantity });
            updateStockDisplay();
            modal.style.display = "none";
        });
    });

    // Função para adicionar sabores à venda
    document.getElementById("add-more-flavor").addEventListener("click", () => {
        const flavorSelect = document.createElement("select");
        flavorSelect.classList.add("flavor-select");

        stock.forEach(({ flavor }) => {
            const option = document.createElement("option");
            option.value = flavor;
            option.textContent = flavor;
            flavorSelect.appendChild(option);
        });

        const quantityInput = document.createElement("input");
        quantityInput.type = "number";
        quantityInput.min = 1;
        quantityInput.placeholder = "Quantidade";

        const addButton = document.createElement("button");
        addButton.textContent = "Adicionar";
        addButton.type = "button";

        addButton.addEventListener("click", () => {
            const flavor = flavorSelect.value;
            const quantity = parseInt(quantityInput.value);

            if (quantity > 0) {
                const price = stock.find(item => item.flavor === flavor).price;
                const saleValue = addSaleItem(flavor, price, quantity);

                if (saleValue > 0) {
                    alert(`Item Adicionado: ${flavor} - Quantidade: ${quantity} - Total: R$ ${saleValue.toFixed(2)}`);
                } else {
                    alert("Quantidade indisponível no estoque!");
                }
            }
        });

        const flavorItem = document.createElement("div");
        flavorItem.classList.add("flavor-item");
        flavorItem.appendChild(flavorSelect);
        flavorItem.appendChild(quantityInput);
        flavorItem.appendChild(addButton);

        flavorsList.appendChild(flavorItem);
    });

    // Função para abrir o modal de edição do estoque
    function openEditStockModal(flavor) {
        const item = stock.find(item => item.flavor === flavor);
        if (item) {
            const editModal = document.getElementById("edit-modal");
            const flavorInput = document.getElementById("edit-flavor");
            const priceInput = document.getElementById("edit-price");
            const quantityInput = document.getElementById("edit-quantity");

            flavorInput.value = item.flavor;
            priceInput.value = item.price;
            quantityInput.value = item.quantity;

            editModal.style.display = "flex";

            // Ação para salvar as alterações
            document.getElementById("edit-flavor-form").addEventListener("submit", (e) => {
                e.preventDefault();
                item.flavor = flavorInput.value;
                item.price = parseFloat(priceInput.value);
                item.quantity = parseInt(quantityInput.value);
                updateStockDisplay();
                editModal.style.display = "none";
            });

            // Fechar o modal
            editModal.querySelector(".close").addEventListener("click", () => {
                editModal.style.display = "none";
            });
        }
    }

    // Atualiza a exibição do estoque na carga inicial
    updateStockDisplay();
});
