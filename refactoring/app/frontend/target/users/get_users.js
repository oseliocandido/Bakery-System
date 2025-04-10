export function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
}

export async function fetchEmployeesOnLoad() {
    const response = await fetch('http://localhost:4200/api/users');
    const employees = await response.json();

    const selectElement = document.getElementById("update-numero_identificacao");
    selectElement.innerHTML = ""; 

    employees.forEach(user => {
        const option = document.createElement("option");
        option.value = user.numero_identificacao;
        option.textContent = user.numero_identificacao;
        selectElement.appendChild(option);
    });

    if (employees.length > 0) {
        const user = employees[0];
        document.getElementById("update-name").value = user.complete_name;
        document.getElementById("update-dob").value = user.date_admissao.split('T')[0];
        document.getElementById("update-doa").value = user.date_nascimento.split('T')[0];
        document.getElementById("update-telephone").value = user.telephone_number;
        document.getElementById("update-observation").value = user.observation || "";
        document.getElementById("update-role").value = user.role;
        document.getElementById("update-status").value = user.status;
    }
}

export async function handleUserSelection() {
    const selectedId = document.getElementById("update-numero_identificacao").value;
    if (!selectedId) return;

    const user_response = await fetch(`http://localhost:4200/api/users/${selectedId}`);
    const user = await user_response.json();
    if (user) {
        document.getElementById("update-name").value = user.complete_name;
        document.getElementById("update-dob").value = user.date_admissao.split('T')[0];
        document.getElementById("update-doa").value = user.date_nascimento.split('T')[0];
        document.getElementById("update-telephone").value = user.telephone_number;
        document.getElementById("update-observation").value = user.observation || "";
        document.getElementById("update-role").value = user.role;
    }
}

export async function updateUser(event) {
    event.preventDefault();

    const selectedId = document.getElementById("update-numero_identificacao").value;
    if (!selectedId) {
        alert("Por favor, selecione um usuário para atualizar.");
        return;
    }

    const dateAdmissao = document.getElementById("update-dob").value;
    const dateNascimento = document.getElementById("update-doa").value;

    const updatedUser = {
        numero_identificacao: selectedId,
        complete_name: document.getElementById("update-name").value,
        role: document.getElementById("update-role").value,
        date_admissao: `${dateAdmissao}T00:00:00`,
        date_nascimento: `${dateNascimento}T00:00:00`,
        telephone_number: document.getElementById("update-telephone").value,
        observation: document.getElementById("update-observation").value,
        status: document.getElementById("update-status").value
    };

    try {
        const response = await fetch(`http://localhost:4200/api/users/${selectedId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedUser)
        });

        if (response.ok) {
            const notification = document.getElementById("notification");
            notification.textContent = `Funcionário "${updatedUser.complete_name}" atualizado com sucesso!`;
            notification.style.display = "block";

            setTimeout(() => {
                notification.style.display = "none";
            }, 3000);
        } else {
            alert("Erro ao atualizar usuário.");
        }
    } catch (error) {
        console.error("Erro ao atualizar usuário:", error);
        alert("Falha na atualização do usuário.");
    }
}
