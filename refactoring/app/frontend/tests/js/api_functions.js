// Fetch all users from the backend
async function fetchUsers() {
    const response = await fetch('http://localhost:4200/users/');
    if (response.ok) {
        const users = await response.json();
        const usersList = document.getElementById("users");
        usersList.innerHTML = ''; // Clear existing list
        users.forEach(user => {
            const userItem = document.createElement('li');
            userItem.textContent = `${user.complete_name} (${user.status})`;
            usersList.appendChild(userItem);
        });
    } else {
        console.error('Error fetching users');
    }
}

// Handle the form submission for creating a new user
async function createUser(event) {
    event.preventDefault();

    const newUser = {
        numero_identificacao: document.getElementById('numero_identificacao').value,
        complete_name: document.getElementById('complete_name').value,
        date_nascimento: document.getElementById('date_nascimento').value,
        date_admissao: document.getElementById('date_admissao').value,
        role: document.getElementById('role').value,
        telephone_number: document.getElementById('telephone_number').value,
        observation: document.getElementById('observation').value,
        status: document.getElementById('status').value
    };

    const response = await fetch('http://localhost:4200/users/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
    });

    if (response.ok) {
        const result = await response.json();
        alert(result.message);
        fetchUsers();  // Refresh the user list
    } else {
        console.error('Error creating user');
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    fetchUsers(); // Fetch and display users when the page loads

    // Attach form submit event
    const form = document.getElementById('create-user-form');
    form.addEventListener('submit', createUser);
});
