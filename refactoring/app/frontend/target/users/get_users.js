






















let employees = {}; // Store all users here

async function fetchEmployees() {
    const response = await fetch('http://localhost:4200/api/users'); // Your API endpoint
    employees = await response.json();
}

function selectUser(userId) {
    const user = employees.find(emp => emp.id === userId);
    document.getElementById("username").value = user.name; // Example placeholder update
}
