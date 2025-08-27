document.addEventListener("DOMContentLoaded", function () {
    fetchPendingWorks();
});

function fetchPendingWorks() {
    fetch("/api/getPendingWorks")
        .then(response => response.json())
        .then(data => {
            const pendingSection = document.getElementById("pending-works");
            pendingSection.innerHTML = "<h2>Pending Works</h2>"; // Clear previous content

            if (data.length === 0) {
                pendingSection.innerHTML += "<p>No pending works found.</p>";
                return;
            }

            data.forEach(work => {
                const workBox = document.createElement("div");
                workBox.classList.add("work-box");
                workBox.onclick = () => showPopup(work.title, work.description, work.orderedBy, work.location, work.phone);

                workBox.innerHTML = `
                    <strong>${work.title}</strong>
                    <p>${work.description} - Status: ${work.status}</p>
                    <button onclick="acceptWork(${work.work_id}, ${work.user_id})">Accept</button>
                `;
                pendingSection.appendChild(workBox);
            });
        })
        .catch(error => {
            console.error("Error fetching pending works:", error);
            const pendingSection = document.getElementById("pending-works");
            pendingSection.innerHTML = "<h2>Pending Works</h2><p>Failed to load pending works. Please try again later.</p>";
        });
}

function showPopup(title, description, orderedBy, location, phone) {
    document.getElementById("popup-title").textContent = title;
    document.getElementById("popup-description").textContent = description;
    document.getElementById("popup-ordered-by").textContent = `Ordered By: ${orderedBy}`;
    document.getElementById("popup-location").textContent = `Location: ${location}`;
    document.getElementById("popup-phone").textContent = `Phone: ${phone}`;
    document.getElementById("popup").classList.remove("hidden");
}

function hidePopup() {
    document.getElementById("popup").classList.add("hidden");
}