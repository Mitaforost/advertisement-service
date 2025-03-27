document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const userInfoDiv = document.getElementById("userInfo");
    const username = user.user.username;

    userInfoDiv.innerHTML = `<p>${username}</p>`;
    const createAdForm = document.getElementById("createAdForm");

    const categorySelect = document.getElementById("category");

    // Функция для загрузки категорий
    function loadCategories() {
        fetch('http://127.0.0.1:5000/categories')
            .then(response => response.json())
            .then(data => {
                categorySelect.innerHTML = '';
                data.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    categorySelect.appendChild(option);
                });
            })
            .catch(error => console.error('Ошибка при загрузке категорий:', error));
    }

    createAdForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
            window.location.href = "login.html";
            return;
        }

        const formData = new FormData(createAdForm);
        const adData = {
            user_id: user.user.id,
            title: formData.get("title"),
            description: formData.get("description"),
            category_id: formData.get("category"),
            price: formData.get("price"),
            location: formData.get("location"),
            imageUrl: formData.get("imageUrl") // Добавим ссылку на изображение в объект данных
        };

        fetch('http://127.0.0.1:5000/ads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(adData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.id) {
                    alert("Объявление успешно создано!");
                    createAdForm.reset(); // Очистка формы
                } else {
                    alert("Ошибка при создании объявления.");
                }
            })
            .catch(error => {
                console.error('Ошибка при создании объявления:', error);
                alert("Ошибка при создании объявления.");
            });
    });

    // Загрузка категорий при загрузке страницы
    loadCategories();

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