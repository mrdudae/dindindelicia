// Inicialização do armazenamento local
const storageKey = {
    stock: "stock-data",
    cashbox: "cashbox-value",
    sales: "sales-data",
};

// Recupera os dados do armazenamento local ou inicializa-os
const getLocalData = (key, defaultValue) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
};

const setLocalData = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

// Dados iniciais
let stock = getLocalData(storageKey.stock, []);
let cashbox = getLocalData(storageKey.cashbox, 0);
let salesData = getLocalData(storageKey.sales, { today: 0, week: 0, month: 0 });

// Atualizações de UI
const updateStockUI = () => {
    const stockList = document.getElementById("stock");
    const totalStock = document.getElementById("total-stock");
    const totalStockValue = document.getElementById("total-stock-value");

    stockList.innerHTML = "";
    let totalQuantity = 0;
    let totalValue = 0;

    stock.forEach((item, index) => {
        totalQuantity += item.quantity;
        totalValue += item.quantity * item.price;

        const li = document.createElement("li");
        li.innerHTML = `${item.flavor} - R$ ${item.price.toFixed(2)} (${item.quantity})`;
        
        const editBtn = document.createElement("button");
        editBtn.textContent = "Editar";
        editBtn.onclick = () => openEditStockModal(index);
        
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Excluir";
        deleteBtn.onclick = () => {
            stock.splice(index, 1);
            setLocalData(storageKey.stock, stock);
            updateStockUI();
        };

        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
        stockList.appendChild(li);
    });

    totalStock.textContent = totalQuantity;
    totalStockValue.textContent = totalValue.toFixed(2);
};

const updateCashboxUI = () => {
    document.getElementById("cashbox").textContent = cashbox.toFixed(2);
};

const updateSalesReportUI = () => {
    document.getElementById("sales-today").textContent = salesData.today.toFixed(2);
    document.getElementById("sales-week").textContent = salesData.week.toFixed(2);
    document.getElementById("sales-month").textContent = salesData.month.toFixed(2);
};

// Adiciona novo sabor ao estoque
const openFlavorModal = () => {
    document.getElementById("modal").style.display = "block";
};

document.getElementById("add-flavor").onclick = openFlavorModal;

document.getElementById("flavor-form").onsubmit = (e) => {
    e.preventDefault();
    const flavor = document.getElementById("new-flavor").value;
    const price = parseFloat(document.getElementById("price").value);
    const quantity = parseInt(document.getElementById("stock-quantity").value);

    stock.push({ flavor, price, quantity });
    setLocalData(storageKey.stock, stock);

    updateStockUI();
    document.getElementById("modal").style.display = "none";
};

// Edita um item do estoque
const openEditStockModal = (index) => {
    const item = stock[index];

    document.getElementById("edit-flavor").value = item.flavor;
    document.getElementById("edit-price").value = item.price;
    document.getElementById("edit-quantity").value = item.quantity;

    document.getElementById("edit-stock-modal").style.display = "block";

    document.getElementById("save-stock").onclick = () => {
        item.price = parseFloat(document.getElementById("edit-price").value);
        item.quantity = parseInt(document.getElementById("edit-quantity").value);

        setLocalData(storageKey.stock, stock);
        updateStockUI();
        document.getElementById("edit-stock-modal").style.display = "none";
    };
};

// Adiciona mais um campo de sabor na venda
const addFlavorField = () => {
    const flavorsList = document.getElementById("flavors-list");

    const flavorItem = document.createElement("div");
    flavorItem.classList.add("flavor-item");

    const flavorSelect = document.createElement("select");
    flavorSelect.classList.add("flavor-name");

    stock.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.flavor;
        option.textContent = item.flavor;
        flavorSelect.appendChild(option);
    });

    const quantityInput = document.createElement("input");
    quantityInput.type = "number";
    quantityInput.classList.add("flavor-quantity");
    quantityInput.placeholder = "Quantidade";
    quantityInput.min = "1";

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remover";
    removeBtn.onclick = () => {
        flavorItem.remove();
    };

    flavorItem.appendChild(flavorSelect);
    flavorItem.appendChild(quantityInput);
    flavorItem.appendChild(removeBtn);
    flavorsList.appendChild(flavorItem);
};

document.getElementById("add-more-flavor").onclick = addFlavorField;

// Mostra tela de confirmação antes de finalizar a venda
const showConfirmationModal = (total) => {
    const modal = document.getElementById("confirmation-modal");
    const totalDisplay = document.getElementById("confirmation-total");
    totalDisplay.textContent = `R$ ${total.toFixed(2)}`;
    modal.style.display = "block";

    document.getElementById("confirm-sale").onclick = () => {
        finalizeSale(total);
        modal.style.display = "none";
    };

    document.getElementById("cancel-sale").onclick = () => {
        modal.style.display = "none";
    };
};

// Finaliza a venda
const finalizeSale = (total) => {
    cashbox += total;
    salesData.today += total;

    setLocalData(storageKey.stock, stock);
    setLocalData(storageKey.cashbox, cashbox);
    setLocalData(storageKey.sales, salesData);

    updateStockUI();
    updateCashboxUI();
    updateSalesReportUI();

    document.getElementById("sale-form").reset();
    document.getElementById("flavors-list").innerHTML = "";
    addFlavorField();
};

// Realiza uma venda
const handleSale = (event) => {
    event.preventDefault();

    const flavorsList = document.querySelectorAll("#flavors-list .flavor-item");
    const deliveryFee = parseFloat(document.getElementById("delivery-fee").value) || 0;
    let saleTotal = deliveryFee;

    let validSale = true;

    flavorsList.forEach((flavorItem) => {
        const flavor = flavorItem.querySelector(".flavor-name").value;
        const quantity = parseInt(flavorItem.querySelector(".flavor-quantity").value);

        const stockItem = stock.find((item) => item.flavor === flavor);
        if (stockItem && stockItem.quantity >= quantity) {
            stockItem.quantity -= quantity;
            saleTotal += quantity * stockItem.price;
        } else {
            validSale = false;
            alert(`Estoque insuficiente para o sabor ${flavor}`);
        }
    });

    if (validSale) {
        showConfirmationModal(saleTotal);
    }
};

document.getElementById("sale-form").onsubmit = handleSale;

// Atualiza o caixa
const handleCashboxUpdate = () => {
    const entry = parseFloat(document.getElementById("cash-entry").value) || 0;
    const exit = parseFloat(document.getElementById("cash-exit").value) || 0;

    cashbox += entry - exit;

    setLocalData(storageKey.cashbox, cashbox);
    updateCashboxUI();
};

document.getElementById("update-cashbox").onclick = handleCashboxUpdate;

// Inicializa o sistema
updateStockUI();
updateCashboxUI();
updateSalesReportUI();
addFlavorField();

// Criação do modal de confirmação
document.body.insertAdjacentHTML("beforeend", `
    <div id="confirmation-modal" class="modal">
        <div class="modal-content">
            <h2>Confirmação de Venda</h2>
            <p>Valor Total: <span id="confirmation-total"></span></p>
            <button id="confirm-sale">Confirmar</button>
            <button id="cancel-sale">Cancelar</button>
        </div>
    </div>
`);
// Seleciona os elementos necessários
const modal = document.querySelector('.modal');
const closeBtn = document.querySelector('.close');

// Exibe o modal
function showModal() {
    modal.style.display = 'flex';
}

// Fecha o modal
function closeModal() {
    modal.style.display = 'none';
}

// Adiciona evento ao botão de fechar
closeBtn.addEventListener('click', closeModal);

// Opcional: Fecha o modal ao clicar fora do conteúdo
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        closeModal();
    }
});
