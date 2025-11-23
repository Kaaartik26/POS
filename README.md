# POS
📄 Invoice Generator (Flask)

A simple and efficient Invoice Generator Web App built using Flask and ReportLab.
It allows you to scan product barcodes, add items to an invoice, delete items, and generate a clean downloadable PDF invoice.

🚀 Features

📱 Barcode Scanning Support
Add products using a barcode scanner or manual input.

➕ Add Items to Invoice
Each scan adds the corresponding item with auto-calculated price.

❌ Delete Items
Remove any item from the current invoice.

🧮 Quantity Multiplier
Add multiple units without needing to scan repeatedly.

🧾 PDF Invoice Generation
Generates a clean and structured invoice using ReportLab.

🧠 Session-based Storage
Items remain stored as long as the session is active.

🛠️ Tech Stack

Python 3

Flask

HTML / CSS / JavaScript

ReportLab (for PDF creation)

📦 Installation & Setup
1️⃣ Clone the repository
git clone https://github.com/your-username/your-repo.git
cd your-repo

2️⃣ Install dependencies
pip install -r requirements.txt

3️⃣ Run the Flask server
python app.py

4️⃣ Open in browser
http://127.0.0.1:5000/

📁 Project Structure
.
├── app.py
├── templates/
│   ├── invoice.html
│   └── index.html
├── static/
│   ├── scanner.js
│   └── style.css
├── products.json
├── requirements.txt
└── README.md

📝 How It Works

Scan a barcode → item is fetched from products.json.

Item is added to the session invoice list.

User can delete items or change quantity.

Clicking Generate Invoice creates a PDF using ReportLab.

PDF is downloaded automatically through Flask’s send_file().