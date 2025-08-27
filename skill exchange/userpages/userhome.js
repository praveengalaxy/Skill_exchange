document.addEventListener("DOMContentLoaded", function () {
    loadAvailableWorks();
});

// Fetch available works from the backend and display them
function loadAvailableWorks() {
    const availableWorksSection = document.getElementById("available-works");
    availableWorksSection.innerHTML = "<h2>Available Works</h2>"; // Reset section content

    fetch('/api/available-works')
        .then(response => response.json())
        .then(works => {
            if (works.length > 0) {
                works.forEach(work => {
                    const workBox = document.createElement("div");
                    workBox.classList.add("work-box");

                    // Build the work content including an Accept button
                    workBox.innerHTML = `
                        <strong>${work.title}</strong>
                        <p>${work.description}</p>
                        <p><strong>Price:</strong> $${work.price}</p>
                        <p><strong>Location:</strong> ${work.location}</p>
                        <p><strong>Status:</strong> ${work.status}</p> <!-- Add status for clarity -->
                        <button onclick="acceptWork(${work.work_id})">Accept</button>

                    `;
                    availableWorksSection.appendChild(workBox);
                });
            } else {
                const message = document.createElement("p");
                message.id = "no-works-message";
                message.textContent = "No works available at the moment.";
                availableWorksSection.appendChild(message);
            }
        })
        .catch(error => {
            console.error("Error fetching works:", error);
        });
}



// Function to call the acceptWork endpoint for a given work ID
function acceptWork(workId) {
    fetch('/acceptWork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Work accepted successfully!");
            // Refresh the available works list to remove the accepted work
            loadAvailableWorks();
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(error => {
        console.error("Error accepting work:", error);
    });
}


// (Optional popup functions if you need them)
function showPopup(work) {
    document.getElementById("popup-title").textContent = work.title;
    document.getElementById("popup-description").textContent = work.description;
    document.getElementById("popup-ordered-by").textContent = work.ordered_by;  // Ensure this column exists
    document.getElementById("popup-location").textContent = work.location;
    document.getElementById("popup").style.display = "flex";
}

function hidePopup() {
    document.getElementById("popup").style.display = "none";
}
