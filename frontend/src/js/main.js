document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const userInfoDiv = document.getElementById("userInfo");
    const username = user.user.username;

    userInfoDiv.innerHTML = `<p>${username}</p>`;

    const categoryFilter = document.getElementById("categoryFilter");

    function loadCategories() {
        fetch('http://127.0.0.1:5000/categories')
            .then(response => response.json())
            .then(data => {
                data.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    categoryFilter.appendChild(option);
                });
            })
            .catch(error => console.error('Ошибка при загрузке категорий:', error));
    }

    function loadAds(categoryId = '') {
        const url = categoryId ? `http://127.0.0.1:5000/ads?category_id=${categoryId}` : 'http://127.0.0.1:5000/ads';
        fetch(url)
            .then(response => response.json())
            .then(data => {
                const adsList = document.querySelector('.ads__list');
                adsList.innerHTML = '';

                if (data.length === 0) {
                    adsList.innerHTML = '<p>В данной категории нет объявлений.</p>';
                    return;
                }

                fetch('http://127.0.0.1:5000/favorites')
                    .then(response => response.json())
                    .then(favorites => {
                        const userFavorites = favorites.filter(favorite => favorite.user_id === user.user.id);
                        const favoriteAdIds = userFavorites.map(favorite => favorite.ad_id);

                        data.forEach(ad => {
                            fetch(`http://127.0.0.1:5000/users/${ad.user_id}`)
                                .then(response => response.json())
                                .then(userData => {
                                    fetch(`http://127.0.0.1:5000/ad_images?ad_id=${ad.id}`)
                                        .then(response => response.json())
                                        .then(images => {
                                            const adImageUrls = images.map(image => image.image_url);
                                            const adItem = document.createElement('li');
                                            adItem.innerHTML = `
                                                <div class="ads__content">
                                                    <h3>${ad.title}</h3>
                                                    <p>${ad.description}</p>
                                                    <p><strong>Цена:</strong> ${ad.price} руб.</p>
                                                    <p><strong>Местоположение:</strong> ${ad.location}</p>
                                                    <p><strong>Автор:</strong> ${userData.username}</p>
                                                    <p><strong>Создано:</strong> ${new Date(ad.created_at).toLocaleString()}</p>
                                                    ${favoriteAdIds.includes(ad.id) ?
                                                '<p>Добавлено в избранное</p>' :
                                                `<button class="btn favorite-btn" data-id="${ad.id}">Добавить в избранное</button>`}
                                                </div>
                                                ${adImageUrls.length > 0 ? `<img src="${adImageUrls[0]}" alt="Изображение объявления" class="ad-image">` : '<p>Нет изображения</p>'}
                                            `;
                                            adsList.appendChild(adItem);

                                            const favButton = adItem.querySelector('.favorite-btn');
                                            if (favButton) {
                                                favButton.addEventListener('click', (event) => {
                                                    const adId = event.target.dataset.id;
                                                    addToFavorites(adId, event.target);
                                                });
                                            }
                                        })
                                        .catch(error => console.error('Ошибка при загрузке изображений:', error));
                                })
                                .catch(error => console.error('Ошибка при загрузке пользователя:', error));
                        });
                    })
                    .catch(error => console.error('Ошибка при загрузке избранных объявлений:', error));
            })
            .catch(error => console.error('Ошибка при загрузке объявлений:', error));
    }

    function addToFavorites(adId, button) {
        fetch('http://127.0.0.1:5000/favorites', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: user.user.id,
                ad_id: adId
            }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.message === "Favorite added!") {
                    // Обновляем статус кнопки после добавления в избранное
                    button.innerHTML = 'Добавлено в избранное';
                    button.disabled = true;
                } else {
                    alert("Объявление добавлено в избранное!");
                    loadAds();
                }
            })
            .catch(error => {
                console.error('Ошибка при добавлении в избранное:', error);
                alert("Ошибка при добавлении в избранное.");
            });
    }

    function loadStatistics() {
        fetch('http://127.0.0.1:5000/statistics')
            .then(response => response.json())
            .then(data => {
                const statisticsContent = document.querySelector('.statistics__content');
                statisticsContent.innerHTML = `
                    <p><strong>Количество пользователей:</strong> ${data.userCount}</p>
                    <p><strong>Количество объявлений:</strong> ${data.adCount}</p>
                    <p><strong>Количество сообщений:</strong> ${data.messageCount}</p>
                `;
            })
            .catch(error => console.error('Ошибка при загрузке статистики:', error));
    }

    loadCategories();
    loadAds();
    loadStatistics();

    categoryFilter.addEventListener('change', (event) => {
        loadAds(event.target.value);
    });

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
