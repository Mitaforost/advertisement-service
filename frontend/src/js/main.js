document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const userInfoDiv = document.getElementById("userInfo");
    const username = user.user.username;

    userInfoDiv.innerHTML = `<p>${username}</p>`;

    function loadAds() {
        fetch('http://127.0.0.1:5000/ads')
            .then(response => response.json())
            .then(data => {
                const adsList = document.querySelector('.ads__list');
                adsList.innerHTML = '';

                data.forEach(ad => {
                    const adItem = document.createElement('li');
                    adItem.innerHTML = `
                        <h3>${ad.title}</h3>
                        <p>${ad.description}</p>
                        <p><strong>Цена:</strong> ${ad.price} руб.</p>
                        <p><strong>Местоположение:</strong> ${ad.location}</p>
                    `;
                    adsList.appendChild(adItem);
                });
            })
            .catch(error => console.error('Ошибка при загрузке объявлений:', error));
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

    loadAds();
    loadStatistics();

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