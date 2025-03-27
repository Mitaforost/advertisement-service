document.addEventListener('DOMContentLoaded', () => {
    const userList = document.getElementById('userList');
    const messageList = document.getElementById('messageList');
    const messageInput = document.getElementById('messageInput');
    const sendMessageButton = document.getElementById('sendMessageButton');

    let selectedUser = null;
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const currentUser = { id: user.user.id, username: user.user.username };
    const userInfoDiv = document.getElementById("userInfo");
    const username = currentUser.username;

    userInfoDiv.innerHTML = `<p>${username}</p>`;

    async function fetchUsers() {
        try {
            const response = await fetch('http://127.0.0.1:5000/users');
            const users = await response.json();
            displayUsers(users);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }

    function displayUsers(users) {
        userList.innerHTML = '';
        users.forEach(user => {
            const userItem = document.createElement('li');
            userItem.textContent = user.username;
            userItem.addEventListener('click', () => {
                selectedUser = user;
                fetchMessages(currentUser.id, selectedUser.id);
            });
            userList.appendChild(userItem);
        });
    }

    async function fetchMessages(userId, otherUserId) {
        try {
            const response = await fetch(`http://127.0.0.1:5000/messages/${userId}/${otherUserId}`);
            const messages = await response.json();
            displayMessages(messages);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    }

    function displayMessages(messages) {
        messageList.innerHTML = '';
        messages.forEach(message => {
            const messageItem = document.createElement('div');
            messageItem.classList.add('message');
            messageItem.classList.add(message.sender_id === currentUser.id ? 'me' : 'them');
            messageItem.textContent = `${message.sender_id === currentUser.id ? 'Вы' : selectedUser.username}: ${message.content}`;
            messageList.appendChild(messageItem);
        });
    }

    async function sendMessage() {
        const content = messageInput.value;
        if (!content || !selectedUser) return;

        const message = {
            sender_id: currentUser.id,
            receiver_id: selectedUser.id,
            content: content,
            ad_id: 1, // Замените на корректное значение
            sent_at: new Date().toISOString(), // Добавляем время отправки
            is_read: false // Сообщение по умолчанию не прочитано
        };

        try {
            const response = await fetch('http://127.0.0.1:5000/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(message)
            });
            if (!response.ok) {
                throw new Error('Error sending message');
            }
            const newMessage = await response.json();
            messageInput.value = '';
            fetchMessages(currentUser.id, selectedUser.id);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }

    sendMessageButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    fetchUsers();
    const logoutBtn = document.getElementById("logoutBtn");
    const logoutPopup = document.getElementById("logoutPopup");
    const confirmLogout = document.getElementById("confirmLogout");
    const cancelLogout = document.getElementById("cancelLogout");

    if (logoutBtn) {
        logoutBtn.style.display = "inline-block";
        logoutBtn.addEventListener("click", () => {
            logoutPopup.style.display = "flex";
        });

        confirmLogout.addEventListener("click", () => {
            localStorage.removeItem("user");
            window.location.href = "login.html";
        });

        cancelLogout.addEventListener("click", () => {
            logoutPopup.style.display = "none";
        });
    }
});
