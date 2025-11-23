let lastScanned = null;
let scanLocked = false;
let items = {};  

// Handle successful scan
function onScanSuccess(decodedText) {
    if (scanLocked) return;
    scanLocked = true;

    if (decodedText === lastScanned) return;  
    lastScanned = decodedText;

    fetch("/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barcode: decodedText })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            addOrIncrementItem(data);
            alert("Item added: " + data.name);
        }

        setTimeout(() => {
            scanLocked = false;
        }, 300);
    });
}

// Add new item OR increment quantity
function addOrIncrementItem(product) {
    if (items[product.barcode]) {
        items[product.barcode].qty++;
        updateQtyInTable(product.barcode);
    } else {
        items[product.barcode] = {
            name: product.name,
            price: product.price,
            qty: 1
        };
        addRow(product);
    }
}

// Add new row to table
function addRow(product) {
    const tbody = document.querySelector("#invoiceTable tbody");

    const row = document.createElement("tr");
    row.setAttribute("data-barcode", product.barcode);

    row.innerHTML = `
        <td>${product.name}</td>
        <td class="qtyCell">1</td>
        <td>₹${product.price}</td>
        <td>
            <button class="deleteBtn" style="
                background:red;color:white;border:none;padding:5px 10px;
                cursor:pointer;border-radius:5px;">X</button>
        </td>
    `;

    tbody.appendChild(row);

    row.querySelector(".deleteBtn").onclick = () => {
        delete items[product.barcode];
        row.remove();
        deleteFromServer(product.barcode);
    };
}

// Update qty in existing row
function updateQtyInTable(barcode) {
    const row = document.querySelector(`tr[data-barcode="${barcode}"]`);
    row.querySelector(".qtyCell").innerText = items[barcode].qty;
}

// Notify server to delete item
function deleteFromServer(barcode) {
    fetch("/delete_item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barcode })
    });
}

// Generate Invoice button
document.getElementById("generateInvoice").onclick = () => {
    window.location.href = "/generate_invoice";
};


let html5QrcodeScanner = new Html5QrcodeScanner(
    "reader",
    { fps: 10, qrbox: 250 }
);
html5QrcodeScanner.render(onScanSuccess);
