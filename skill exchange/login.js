window.onload = function() {
    const form = document.getElementById('loginForm');
    const submitButton = document.getElementById('submitButton');
    const isRegister = submitButton.innerText === 'Register';

    // Ensure that the initial form submission is set to login
    if (isRegister) {
        form.onsubmit = handleRegister;
    } else {
        form.onsubmit = handleLogin;
    }

    // Register link click event to toggle between Login and Register
    document.getElementById('registerLink').onclick = function(event) {
        event.preventDefault();

        // Toggle between Register and Login modes
        const isRegister = submitButton.innerText === 'Register';
        if (isRegister) {
            submitButton.innerText = 'Login';
            form.onsubmit = handleLogin; // Set form to login handler
            hideRegisterFields(); // Hide registration fields
        } else {
            submitButton.innerText = 'Register';
            form.onsubmit = handleRegister; // Set form to register handler
            showRegisterFields(); // Show registration fields
        }
    };
};

function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!validateInputs(username, password)) return;

    // Sending login request to the server
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Login failed.');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            
            if (data.message === 'Login successful') {
               
                
                sessionStorage.setItem('userId', data.userId); // Store userId in sessionStorage
             window.location.href = 'userpages/userhome.html'; // Redirect on success
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert(error.message);
        });
}


function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const streetAddress = document.getElementById('streetAddress').value.trim();
    const city = document.getElementById('city').value.trim();
    const state = document.getElementById('state').value.trim();
    const postalCode = document.getElementById('postalCode').value.trim();

    if (!validateInputs(username, password, email, phone, streetAddress, city, state, postalCode)) return;

    // Sending register request to the server
    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username, password, email, phone, streetAddress, city, state, postalCode
        }),
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Registration failed.');
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.message === 'Registration successful') {
                alert('Registration successful! You can now log in.');
                document.getElementById('submitButton').innerText = 'Login';
                document.getElementById('loginForm').onsubmit = handleLogin; // Switch back to login form
                hideRegisterFields(); // Hide registration fields
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert(error.message);
        });
}

function validateInputs(...inputs) {
    for (const input of inputs) {
        if (!input) {
            alert('All fields are required.');
            return false;
        }
    }
    return true;
}

function showRegisterFields() {
    document.getElementById('emailField').style.display = 'block';
    document.getElementById('phoneField').style.display = 'block';
    document.getElementById('addressFields').style.display = 'block';
}

function hideRegisterFields() {
    document.getElementById('emailField').style.display = 'none';
    document.getElementById('phoneField').style.display = 'none';
    document.getElementById('addressFields').style.display = 'none';
}
document.getElementById('loginForm').addEventListener('submit', (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.redirect) {
                window.location.href = data.redirect; // Redirect to userhome.html
            } else {
                alert(data.message); // Show error message
            }
        })
        .catch(error => console.error('Error:', error));
});
