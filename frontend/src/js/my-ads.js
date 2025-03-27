document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const userInfoDiv = document.getElementById("userInfo");
    const username = user.user.username;

    userInfoDiv.innerHTML = `<p>${username}</p>`;

    const myAdsList = document.querySelector('.my-ads__list');
    const editAdSection = document.querySelector('.edit-ad');
    const editAdForm = document.getElementById("editAdForm");
    const editAdIdInput = document.getElementById("editAdId");
    const editTitleInput = document.getElementById("editTitle");
    const editDescriptionInput = document.getElementById("editDescription");
    const editCategorySelect = document.getElementById("editCategory");
    const editPriceInput = document.getElementById("editPrice");
    const editLocationInput = document.getElementById("editLocation");
    const editImageUrlInput = document.getElementById("editImageUrl");

    // Функция для загрузки категорий
    function loadCategories() {
        fetch('http://127.0.0.1:5000/categories')
            .then(response => response.json())
            .then(data => {
                editCategorySelect.innerHTML = '';
                data.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    editCategorySelect.appendChild(option);
                });
            })
            .catch(error => console.error('Ошибка при загрузке категорий:', error));
    }

    // Функция для загрузки объявлений пользователя
    function loadMyAds() {
        fetch('http://127.0.0.1:5000/ads')
            .then(response => response.json())
            .then(data => {
                myAdsList.innerHTML = '';
                const userAds = data.filter(ad => ad.user_id === user.user.id);
                userAds.forEach(ad => {
                    // Получение ссылок на изображения для объявления
                    fetch(`http://127.0.0.1:5000/ad_images?ad_id=${ad.id}`)
                        .then(response => response.json())
                        .then(images => {
                            const adImageUrls = images.map(image => image.image_url);

                            const adItem = document.createElement('li');
                            adItem.classList.add('ad-item');
                            adItem.innerHTML = `
                                <h3>${ad.title}</h3>
                                <p>${ad.description}</p>
                                <p><strong>Цена:</strong> ${ad.price} руб.</p>
                                <p><strong>Местоположение:</strong> ${ad.location}</p>
                                ${adImageUrls.length > 0 ? `<img src="${adImageUrls[0]}" alt="Изображение объявления" width="100">` : '<p>Нет изображения</p>'}
                                <button class="edit-ad btn" data-id="${ad.id}">Редактировать</button>
                                <button class="delete-ad btn" data-id="${ad.id}">Удалить</button>
                            `;
                            myAdsList.appendChild(adItem);

                            // Добавление обработчиков событий для кнопок редактирования и удаления
                            document.querySelectorAll('.edit-ad').forEach(button => {
                                button.addEventListener('click', (event) => {
                                    const adId = event.target.dataset.id;
                                    const ad = userAds.find(ad => ad.id == adId);
                                    showEditForm(ad, adImageUrls[0]);
                                });
                            });

                            document.querySelectorAll('.delete-ad').forEach(button => {
                                button.addEventListener('click', (event) => {
                                    const adId = event.target.dataset.id;
                                    deleteAd(adId);
                                });
                            });
                        })
                        .catch(error => console.error('Ошибка при загрузке изображений:', error));
                });
            })
            .catch(error => console.error('Ошибка при загрузке объявлений:', error));
    }

    // Функция для отображения формы редактирования
    function showEditForm(ad, imageUrl) {
        editAdIdInput.value = ad.id;
        editTitleInput.value = ad.title;
        editDescriptionInput.value = ad.description;
        editCategorySelect.value = ad.category_id;
        editPriceInput.value = ad.price;
        editLocationInput.value = ad.location;
        editImageUrlInput.value = imageUrl || ''; // Обработка undefined значения
        editAdSection.style.display = 'block';
    }

    // Функция для скрытия формы редактирования
    function hideEditForm() {
        editAdSection.style.display = 'none';
        editAdForm.reset();
    }

    // Функция для удаления объявления
    function deleteAd(adId) {
        fetch(`http://127.0.0.1:5000/ads/${adId}`, {
            method: 'DELETE',
        })
            .then(response => response.json())
            .then(data => {
                if (data.message === "Ad successfully deleted") {
                    alert("Объявление удалено.");
                    loadMyAds();
                } else {
                    alert("Ошибка при удалении объявления.");
                }
            })
            .catch(error => {
                console.error('Ошибка при удалении объявления:', error);
                alert("Ошибка при удалении объявления.");
            });
    }

    // Обработчик отправки формы редактирования объявления
    editAdForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const adId = editAdIdInput.value;
        const adData = {
            title: editTitleInput.value,
            description: editDescriptionInput.value,
            category_id: editCategorySelect.value,
            price: editPriceInput.value,
            location: editLocationInput.value,
            imageUrl: editImageUrlInput.value
        };

        fetch(`http://127.0.0.1:5000/ads/${adId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(adData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.id) {
                    alert("Объявление успешно обновлено!");
                    hideEditForm();
                    loadMyAds();
                } else {
                    alert("Ошибка при обновлении объявления.");
                }
            })
            .catch(error => {
                console.error('Ошибка при обновлении объявления:', error);
                alert("Ошибка при обновлении объявления.");
            });
    });

    // Загрузка категорий и объявлений при загрузке страницы
    loadCategories();
    loadMyAds();

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