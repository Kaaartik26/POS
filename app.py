from flask import Flask, render_template, request, jsonify, session, send_file
import json
from io import BytesIO

from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

app = Flask(__name__)
app.secret_key = "secret-key"

# ------------------------------------------------
# Load Product List (from products.json)
# ------------------------------------------------
with open("products.json", "r") as f:
    PRODUCTS = json.load(f)


# ------------------------------------------------
# Homepage
# ------------------------------------------------
@app.route("/")
def home():
    return render_template("invoice.html")


# ------------------------------------------------
# Lookup Barcode + Add or Increment Quantity
# ------------------------------------------------
@app.route("/lookup", methods=["POST"])
def lookup():
    barcode = request.json.get("barcode", "").strip()

    product = next((p for p in PRODUCTS if p["barcode"] == barcode), None)

    if not product:
        return jsonify({"error": f"Product not found for {barcode}"}), 404

    # Initialize invoice session
    if "invoice" not in session:
        session["invoice"] = []

    invoice = session["invoice"]

    # Check if barcode already exists → increase qty
    for item in invoice:
        if item["barcode"] == barcode:
            item["qty"] += 1
            session.modified = True
            return jsonify(item)

    # Otherwise add new item with qty = 1
    product_copy = {
        "name": product["name"],
        "price": product["price"],
        "barcode": product["barcode"],
        "qty": 1
    }

    invoice.append(product_copy)
    session.modified = True

    return jsonify(product_copy)


# ------------------------------------------------
# Delete Item from Invoice
# ------------------------------------------------
@app.route("/delete_item", methods=["POST"])
def delete_item():
    barcode = request.json.get("barcode")
    invoice = session.get("invoice", [])

    invoice = [item for item in invoice if item["barcode"] != barcode]

    session["invoice"] = invoice
    session.modified = True

    return jsonify({"status": "deleted"})


# ------------------------------------------------
# Generate Invoice PDF
# ------------------------------------------------
@app.route("/generate_invoice")
def generate_invoice():
    invoice_items = session.get("invoice", [])

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)

    styles = getSampleStyleSheet()
    elements = []

    # ----------- HEADER -----------
    title = Paragraph("<b><font size=16>ABC Supermart</font></b>", styles["Title"])
    address = Paragraph(
        "123 Market Road, City Center<br/>Contact: +91-9876543210",
        styles["Normal"]
    )

    elements.append(title)
    elements.append(address)
    elements.append(Spacer(1, 20))

    # ----------- TABLE -----------
    data = [["Item", "Qty", "Unit Price (₹)", "Total (₹)"]]

    total = 0
    for item in invoice_items:
        line_total = item["price"] * item["qty"]
        total += line_total

        data.append([
            item["name"],
            item["qty"],
            f"₹{item['price']}",
            f"₹{line_total}"
        ])

    data.append(["", "", "<b>Total</b>", f"<b>₹{total}</b>"])

    table = Table(data, colWidths=[200, 60, 100, 100])

    table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), colors.lightblue),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("ALIGN", (0,0), (-1,-1), "CENTER"),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),

        ("BACKGROUND", (0,1), (-1,-2), colors.whitesmoke),
        ("GRID", (0,0), (-1,-1), 1, colors.grey),

        ("FONTNAME", (2,-1), (2,-1), "Helvetica-Bold"),
        ("FONTNAME", (3,-1), (3,-1), "Helvetica-Bold"),
        ("BACKGROUND", (0,-1), (-1,-1), colors.lightgrey),
    ]))

    elements.append(table)

    elements.append(Spacer(1, 20))
    elements.append(Paragraph("Thank you for shopping with us!", styles["Normal"]))

    # Build PDF
    doc.build(elements)
    buffer.seek(0)

    session.clear()

    return send_file(buffer, as_attachment=True,
                     download_name="invoice.pdf",
                     mimetype="application/pdf")


# ------------------------------------------------
# Run App
# ------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True)
