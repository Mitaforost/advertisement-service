document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const userInfoDiv = document.getElementById("userInfo");
    const username = user.user.username;

    userInfoDiv.innerHTML = `<p>${username}</p>`;

    function loadFavorites() {
        fetch(`http://127.0.0.1:5000/favorites`)
            .then(response => response.json())
            .then(favorites => {
                const adsList = document.querySelector('.ads__list');
                adsList.innerHTML = '';

                // Фильтрация избранных объявлений по user_id авторизованного пользователя
                const userFavorites = favorites.filter(favorite => favorite.user_id === user.user.id);

                if (userFavorites.length === 0) {
                    adsList.innerHTML = '<p>У вас пока нет избранных объявлений.</p>';
                    return;
                }

                const adPromises = userFavorites.map(favorite =>
                    fetch(`http://127.0.0.1:5000/ads/${favorite.ad_id}`)
                        .then(response => {
                            if (!response.ok) {
                                if (response.status === 404) {
                                    console.error(`Ad with ID ${favorite.ad_id} not found`);
                                    return null;
                                }
                                throw new Error('Network response was not ok');
                            }
                            return response.json();
                        })
                );

                Promise.all(adPromises)
                    .then(ads => {
                        ads.forEach(ad => {
                            if (!ad) return;
                            fetch(`http://127.0.0.1:5000/ad_images?ad_id=${ad.id}`)
                                .then(response => response.json())
                                .then(images => {
                                    if (!Array.isArray(images)) {
                                        throw new Error("Invalid image data");
                                    }
                                    const adImageUrls = images.map(image => image.image_url);
                                    const adItem = document.createElement('li');
                                    adItem.innerHTML = `
                                        <div class="ads__content">
                                            <h3>${ad.title}</h3>
                                            <p>${ad.description}</p>
                                            <p><strong>Цена:</strong> ${ad.price} руб.</p>
                                            <p><strong>Местоположение:</strong> ${ad.location}</p>
                                            <button class="btn remove-btn" data-id="${ad.id}">Удалить из избранного</button>
                                        </div>
                                        ${adImageUrls.length > 0 ? `<img src="${adImageUrls[0]}" alt="Изображение объявления" class="ad-image">` : '<p>Нет изображения</p>'}
                                    `;
                                    adsList.appendChild(adItem);

                                    // Добавление обработчика на кнопку удаления из избранного
                                    const favButton = adItem.querySelector('.remove-btn');
                                    if (favButton) {
                                        favButton.addEventListener('click', (event) => {
                                            const adId = event.target.closest('button').dataset.id;
                                            removeFromFavorites(adId);
                                        });
                                    } else {
                                        console.error('Кнопка не найдена в разметке объявления:', adItem);
                                    }
                                })
                                .catch(error => console.error('Ошибка при загрузке изображений:', error));
                        });
                    })
                    .catch(error => console.error('Ошибка при загрузке объявлений:', error));
            })
            .catch(error => console.error('Ошибка при загрузке избранных объявлений:', error));
    }

    function removeFromFavorites(adId) {
        fetch(`http://127.0.0.1:5000/favorites/${user.user.id}/${adId}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                if (data.message === "Favorite successfully deleted") {
                    alert("Объявление удалено из избранного!");
                    loadFavorites();
                } else {
                    alert("Ошибка при удалении из избранного.");
                }
            })
            .catch(error => {
                console.error('Ошибка при удалении из избранного:', error);
                alert("Ошибка при удалении из избранного.");
            });
    }

    loadFavorites();

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
