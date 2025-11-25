// START HTML5 QR SCANNER
const html5QrCode = new Html5Qrcode("reader");
let scanning = false;

// Initialize camera
function startScanner() {
    Html5Qrcode.getCameras().then(cameras => {
        if (cameras.length > 0) {
            html5QrCode.start(
                cameras[0].id,
                {
                    fps: 10,
                    qrbox: 250
                },
                onScanSuccess
            );
        }
    }).catch(err => console.error(err));
}

// handling sacnning 
function onScanSuccess(decodedText) {
    if (scanning) return; // prevent multiple simultaneous scans
    scanning = true;

    fetch("/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barcode: decodedText })
    })
    .then(res => res.json())
    .then(item => {
        if (item.error) {
            alert(item.error);
        } else {
            addToCart(item);
            alert("Item added: " + item.name); 
        }

        scanning = false;
    });
}


// Add or update cart item
function addToCart(item) {
    const tbody = document.getElementById("cartBody");

    // Check if item already exists
    let existing = document.querySelector(`tr[data-barcode="${item.barcode}"]`);

    if (existing) {
        let qtyCell = existing.querySelector(".qty");
        let totalCell = existing.querySelector(".lineTotal");

        let newQty = parseInt(qtyCell.textContent) + 1;
        qtyCell.textContent = newQty;
        totalCell.textContent = "₹" + (newQty * item.price).toFixed(2);

        updateTotal();
        return;
    }

    // Otherwise create a new row
    let tr = document.createElement("tr");
    tr.setAttribute("data-barcode", item.barcode);

    tr.innerHTML = `
        <td>${item.name}</td>
        <td class="qty">${item.qty}</td>
        <td>₹${item.price}</td>
        <td class="lineTotal">₹${(item.qty * item.price).toFixed(2)}</td>
        <td><button class="deleteBtn">🗑</button></td>
    `;

    tbody.appendChild(tr);

    updateTotal();
}

// Update total & toggle empty state
function updateTotal() {
    let rows = document.querySelectorAll("#cartBody tr");
    let total = 0;

    rows.forEach(row => {
        let totalCell = row.querySelector(".lineTotal");
        if (totalCell) {
            total += parseFloat(totalCell.textContent.replace("₹", "")) || 0;
        }
    });

    document.getElementById("totalAmount").textContent = "₹" + total.toFixed(2);

    document.getElementById("emptyCart").style.display =
        total > 0 ? "none" : "block";
}

// ----------------------
// DELETE ITEM
// ----------------------
document.getElementById("cartBody").addEventListener("click", function (e) {
    if (e.target.classList.contains("deleteBtn")) {
        let row = e.target.closest("tr");
        let barcode = row.dataset.barcode;

        fetch("/delete_item", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ barcode })
        })
            .then(() => {
                row.remove();
                updateTotal();
            });
    }
});

// GENERATE INVOICE
document.getElementById("generateInvoice").addEventListener("click", () => {
    window.location.href = "/generate_invoice";
});

startScanner();
