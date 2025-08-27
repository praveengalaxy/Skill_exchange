document.addEventListener("DOMContentLoaded", function () {
    fetchCompletedTransactions();
});

function fetchCompletedTransactions() {
    fetch("/api/getTransactions")
        .then(response => response.json())
        .then(data => {
            const transactionSection = document.getElementById("transaction-history");
            transactionSection.innerHTML = "<h2>Transaction History</h2>"; // Clear previous content

            if (data.length === 0) {
                transactionSection.innerHTML += "<p>No completed transactions found.</p>";
                return;
            }

            data.forEach(transaction => {
                const workBox = document.createElement("div");
                workBox.classList.add("work-box");
                workBox.onclick = () => showPopup(transaction.title, transaction.description, transaction.amount);

                workBox.innerHTML = `
                    <strong>${transaction.title}</strong>
                    <p>Description: ${transaction.description}</p>
                    <p>Amount: $${transaction.amount}</p>
                    <button>More</button>
                `;
                transactionSection.appendChild(workBox);
            });
        })
        .catch(error => {
            console.error("Error fetching transactions:", error);
            const transactionSection = document.getElementById("transaction-history");
            transactionSection.innerHTML = "<h2>Transaction History</h2><p>Failed to load transactions. Please try again later.</p>";
        });
}

function showPopup(title, description, amount) {
    document.getElementById("popup-title").textContent = title;
    document.getElementById("popup-description").textContent = description;
    document.getElementById("popup-amount").textContent = amount;
    document.getElementById("popup").classList.remove("hidden");
}

function hidePopup() {
    document.getElementById("popup").classList.add("hidden");
}
