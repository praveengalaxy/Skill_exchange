const userId = sessionStorage.getItem('userId');
if (!userId) {
    alert('User not logged in.');
    window.location.href = '../login.html'; // Redirect to login if not logged in
}

// Fetch and display current skills
function loadSkills() {
    fetch(`/getUserSkills?userId=${userId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch skills.');
            }
            return response.json();
        })
        .then(data => {
            const skillsList = document.getElementById('skills-list');
            skillsList.innerHTML = ''; // Clear existing list

            if (data.skills && data.skills.length > 0) {
                data.skills.forEach(skill => {
                    const skillItem = document.createElement('li');
                    skillItem.innerHTML = `
                        ${skill.skill_name} 
                        (Proficiency: ${skill.proficiency_level}, Experience: ${skill.years_of_experience} years)
                        <button class="delete-btn" onclick="deleteSkill(${skill.skill_id})">Delete</button>
                    `;
                    skillsList.appendChild(skillItem);
                });
            } else {
                skillsList.innerHTML = '<li>No skills added yet.</li>';
            }
        })
        .catch(error => {
            console.error('Error fetching skills:', error);
            alert('Error fetching skills. Please try again.');
        });
}

// Function to add a new skill
function addSkill() {
    console.log('User ID:', userId); // Debugging log
    const skillName = document.getElementById('skillName').value.trim();
    const proficiencyLevel = document.getElementById('proficiency').value.trim();
    const yearsOfExperience = parseInt(document.getElementById('yearsOfExperience').value.trim());

    if (!skillName || !proficiencyLevel || isNaN(yearsOfExperience)) {
        alert('Please fill in all fields.');
        return;
    }

    fetch('/addSkill', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userId: userId,
            skills: [{ name: skillName, proficiencyLevel: proficiencyLevel, yearsOfExperience: yearsOfExperience }]
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to add skill.');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert('Skill added successfully.');
                loadSkills(); // Reload skills list after adding
                document.getElementById('skillName').value = '';
                document.getElementById('proficiency').value = '';
                document.getElementById('yearsOfExperience').value = '';
            } else {
                alert(data.message || 'Error adding skill. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error adding skill:', error);
            alert('Error adding skill. Please try again.');
        });
}

// Function to delete a skill
function deleteSkill(skillId) {
    if (!confirm('Are you sure you want to delete this skill?')) return;

    fetch('/deleteSkill', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userId: userId,
            skillId: skillId
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete skill.');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert('Skill deleted successfully.');
               // loadSkills(); // Reload skills list after deleting
               window.location.reload();
            } else {
                alert(data.message || 'Error deleting skill. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error deleting skill:', error);
            alert('Error deleting skill. Please try again.');
        });
}

// Add event listener for the skill addition form
document.getElementById('addSkillForm').addEventListener('submit', function (event) {
    event.preventDefault();
    addSkill();
});

// Load skills when the page loads
window.onload = function () {
    loadSkills();
};
