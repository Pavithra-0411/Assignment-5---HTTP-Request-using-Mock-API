document.addEventListener('DOMContentLoaded',function(){
    const apiUrl = "https://66628f6b62966e20ef09079a.mockapi.io/empdir/Employeedirectory";
    const userTable = document.getElementById('userTable').getElementsByTagName('tbody')[0];
    const userFormContainer = document.getElementById('userFormContainer');
    const userForm = document.getElementById('userForm');
    const addBtn = document.getElementById('addBtn');
    const closeModal= document.getElementsByClassName('close')[0];
    const deleteModal= document.getElementById('deleteModal');
    const deleteModalClose= deleteModal.getElementsByClassName('close')[0];
    const deleteName = document.getElementById('deleteName');
    const confirmDeleteBtn = deleteModal.querySelector('.deleteBtn');
    const cancelDeleteBtn = deleteModal.querySelector('.cancelBtn');
    let deleteUserId = null;

    userTable.innerHTML = '';

    fetchUsers();

    addBtn.addEventListener('click',function() {
    openForm();
    });

    userForm.addEventListener('submit',function(e){
        e.preventDefault();
        const userId = document.getElementById('userId').value;
        const name = document.getElementById('name').value || 'N/A';
        const email = document.getElementById('email').value || 'N/A';
        const department = document.getElementById('department').value || 'N/A';
        const position = document.getElementById('position').value || 'N/A';

        if(userId)
        {
                updateUser(userId,{name, email, department, position });
        }
        else
        {
            addUser({name, email, department, position });
        }
    });

    closeModal.addEventListener('click', function(){
        closeForm();
    });

    deleteModalClose.addEventListener('click', function(){
        closeDeleteModal();
    });

    cancelDeleteBtn.addEventListener('click', function(){
        closeDeleteModal();
    });

    confirmDeleteBtn.addEventListener('click', function(){
        if(deleteUserId)
            {
                fetch(`${apiUrl}/${deleteUserId}`,{
                    method:'DELETE'
                })
                .then(response => response.json())
                .then(data=> {
                    fetchUsers();
                    closeDeleteModal();
                })
                .catch(error => console.error('Error deleting user',error));
            }
    });

    function fetchUsers(){
        fetch(apiUrl)
           .then(response => response.json())
           .then(data => {
            loadUsers(data);
           })
           .catch(error => console.error('Error fetching users:',error));
    }

    function loadUsers(users){
        userTable.innerHTML = '';
        users.forEach((user, index) => {
            let row = userTable.insertRow();
            row.setAttribute('data-id',user.id);
            row.innerHTML = `
                <td>${index + 1}</td> <!-- Serial Number -->
                <td class="editable" contenteditable="false">${user.name || 'N/A'}</td>
                <td class="editable" contenteditable="false">${user.email || 'N/A'}</td>
                <td class="editable" contenteditable="false">${user.department || 'N/A'}</td>
                <td class="editable" contenteditable="false">${user.position || 'N/A'}</td>
                <td>
                    <button class="editBtn">Edit</button>
                </td>
                <td>
                    <button class="deleteBtn">Delete</button>
                </td>
            `;

            row.querySelector('.editBtn').addEventListener('click', function() {
                editUser(row,user);
            });

            row.querySelector('.deleteBtn').addEventListener('click', function() {
               showDeleteModal(user.id, user.name);
            });
        });
    }

    function openForm(user = {}){
        userForm.reset();
        document.getElementById('userId').value = user.id || '';
        document.getElementById('name').value = user.name || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('department').value = user.department || '';
        document.getElementById('position').value = user.position || '';

        const tablePosition = document.getElementById('userTable').getBoundingClientRect();
        userFormContainer.style.left=tablePosition.left + 'px';
        userFormContainer.style.top = (tablePosition.bottom + 20) + 'px';
        userFormContainer.style.display ='block';
    }

    function closeForm(){
        userFormContainer.style.display ='none';
    }

    function showDeleteModal(userId, userName){
        deleteUserId = userId;
        deleteName.textContent = userName;
        deleteModal.style.display ='block';
    }

    function closeDeleteModal(){
        deleteModal.style.display ='none';
        deleteUserId = null;
        deleteName.textContent = '';
    }

    function addUser(user){
        fetch(apiUrl, {
            method : 'POST',
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })
           .then(response => response.json())
           .then(data => {
              fetchUsers();
              closeForm();
           })
           .catch(error => console.error('Error adding user:',error));
    }

    function updateUser(id,user){
        fetch(`${apiUrl}/${id}`,{
            method: 'PUT',
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })
            .then(response => response.json())
            .then(data =>{
                fetchUsers();
                closeForm();
            })
            .catch(error => console.error('Error updating user:',error));
    }

    function editUser(row, user){
        const nameCell = row.querySelector('td:nth-child(2)');
        const emailCell = row.querySelector('td:nth-child(3)');
        const departmentCell = row.querySelector('td:nth-child(4)');
        const positionCell = row.querySelector('td:nth-child(5)');

        nameCell.setAttribute('contenteditable', 'true');
        emailCell.setAttribute('contenteditable', 'true');
        departmentCell.setAttribute('contenteditable', 'true');
        positionCell.setAttribute('contenteditable', 'true');

        const editBtn = row.querySelector('.editBtn');
        editBtn.textContent = 'Save';
        editBtn.classList.add('saveBtn');
        editBtn.classList.remove('editBtn');

        const saveChanges = function() {
            const updatedUser = {
                name: nameCell.textContent || 'N/A',
                email: emailCell.textContent || 'N/A',
                department: departmentCell.textContent || 'N/A',
                position: positionCell.textContent || 'N/A'
            };
            updateUser(user.id, updatedUser);
            nameCell.setAttribute('contenteditable', 'false');
            emailCell.setAttribute('contenteditable', 'false');
            departmentCell.setAttribute('contenteditable', 'false');
            positionCell.setAttribute('contenteditable', 'false');
            editBtn.textContent = 'Edit';
            editBtn.classList.add('editBtn');
            editBtn.classList.remove('saveBtn');
            editBtn.removeEventListener('click', saveChanges);
        };
        editBtn.addEventListener('click', saveChanges);
    }
});