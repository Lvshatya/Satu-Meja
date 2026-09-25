

let selectedUser = null;


// ======================
// PILIH USER
// ======================

function selectUser(user) {

    if (user === "Tamu") {

        localStorage.removeItem("loggedIn");

        localStorage.setItem(
            "selectedUser",
            "Tamu"
        );

        window.location.href =
            "dashboard.html";

        return;
    }

    localStorage.setItem(
        "selectedUser",
        user
    );

    localStorage.removeItem(
        "loggedIn"
    );

    window.location.href =
        "login.html";
}


// ======================
// LOGIN
// ======================

const loginForm =
    document.getElementById("login-form");

if (loginForm) {

    const user =
        localStorage.getItem("selectedUser");

    const title =
        document.getElementById("login-title");

    title.textContent =
        `Hello, ${user}!`;

    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            const password =
                document.getElementById("password").value;

            const message =
                document.getElementById("login-message");

            const emailMap = {
                Ella: "elfishasatya@gmail.com",
                Arka: "naufalkenz@gmail.com"
            };

            const email = emailMap[user];

            if (!email) {
                message.textContent =
                    "User tidak ditemukan ♡";
                return;
            }

            const { error } =
                await supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });

            if (error) {

                message.textContent =
                    "Password salah ♡";

                return;
            }

            localStorage.setItem(
                "loggedIn",
                "true"
            );

            window.location.href =
                "dashboard.html";

        }
    );
}


// ======================
// KEMBALI
// ======================

function goBack() {

    window.location.href =
        "index.html";

}


// ======================
// DATA RESTORAN
// ======================

let savedRestaurants =
    JSON.parse(
        localStorage.getItem("restaurants")
    ) || [];

    
// ======================
// KOMPRES FOTO
// ======================

function compressImage(
    file,
    maxSize = 1000000
) {

    return new Promise(
        function(resolve, reject) {

            const reader =
                new FileReader();

            reader.onload =
                function(event) {

                    const image =
                        new Image();

                    image.onload =
                        function() {

                            let width =
                                image.width;

                            let height =
                                image.height;

                            const maxDimension =
                                1600;

                            if (
                                width >
                                maxDimension ||
                                height >
                                maxDimension
                            ) {

                                if (
                                    width >
                                    height
                                ) {

                                    height =
                                        height *
                                        (
                                            maxDimension /
                                            width
                                        );

                                    width =
                                        maxDimension;

                                } else {

                                    width =
                                        width *
                                        (
                                            maxDimension /
                                            height
                                        );

                                    height =
                                        maxDimension;

                                }

                            }

                            const canvas =
                                document.createElement(
                                    "canvas"
                                );

                            canvas.width =
                                width;

                            canvas.height =
                                height;

                            const context =
                                canvas.getContext(
                                    "2d"
                                );

                            context.drawImage(
                                image,
                                0,
                                0,
                                width,
                                height
                            );

                            let quality =
                                0.8;

                            function createImage() {

                                canvas.toBlob(
                                    function(blob) {

                                        if (!blob) {

                                            reject(
                                                new Error(
                                                    "Gagal mengompres foto."
                                                )
                                            );

                                            return;

                                        }

                                        if (
                                            blob.size <=
                                            maxSize ||
                                            quality <=
                                            0.3
                                        ) {

                                            const resultReader =
                                                new FileReader();

                                            resultReader.onload =
                                                function(e) {

                                                    resolve(
                                                        e.target.result
                                                    );

                                                };

                                            resultReader.readAsDataURL(
                                                blob
                                            );

                                            return;

                                        }

                                        quality -=
                                            0.1;

                                        createImage();

                                    },
                                    "image/jpeg",
                                    quality
                                );

                            }

                            createImage();

                        };

                    image.onerror =
                        function() {

                            reject(
                                new Error(
                                    "Foto tidak bisa dibaca."
                                )
                            );

                        };

                    image.src =
                        event.target.result;

                };

            reader.onerror =
                function() {

                    reject(
                        new Error(
                            "Gagal membaca foto."
                        )
                    );

                };

            reader.readAsDataURL(file);

        }
    );

}


// ======================
// HITUNG RATING
// ======================

function getRestaurantRating(
    restaurantName
) {

    const reviews =
        JSON.parse(
            localStorage.getItem("reviews")
        ) || [];

    const restaurantReviews =
        reviews.filter(
            function(review) {

                return (
                    review.restaurantName ===
                    restaurantName
                );

            }
        );

    if (
        restaurantReviews.length ===
        0
    ) {

        const restaurant =
            savedRestaurants.find(
                function(item) {

                    return (
                        item.name ===
                        restaurantName
                    );

                }
            );

        return restaurant
            ? restaurant.rating || 0
            : 0;

    }

    const total =
        restaurantReviews.reduce(
            function(sum, review) {

                return (
                    sum +
                    Number(review.rating)
                );

            },
            0
        );

    const average =
        total /
        restaurantReviews.length;

    return Number(
        average.toFixed(1)
    );

}


// ======================
// DASHBOARD
// ======================

const restaurantList =
    document.getElementById(
        "restaurant-list"
    );

if (restaurantList) {

    const user =
        localStorage.getItem(
            "selectedUser"
        );

    const welcomeTitle =
        document.getElementById(
            "welcome-title"
        );

    if (user === "Tamu") {

        welcomeTitle.textContent =
            "Hi there! ♡";

    } else {

        welcomeTitle.textContent =
            `Hai, ${user}! ♡`;

    }

    if (user !== "Ella") {

        document.getElementById(
            "owner-actions"
        ).style.display =
            "none";

    }

    const restaurantCount =
        document.getElementById(
            "restaurant-count"
        );


    function displayRestaurants(
        restaurantData
    ) {

        restaurantList.innerHTML =
            "";

        if (
            restaurantData.length ===
            0
        ) {

            restaurantList.innerHTML = `

                <div class="empty-result">

                    <p>
                        Tempatnya belum ada nih ♡
                    </p>

                    <span>
                        Coba cari nama atau lokasi lain.
                    </span>

                </div>

            `;

            if (restaurantCount) {

                restaurantCount.textContent =
                    "0 places";

            }

            return;

        }

        if (restaurantCount) {

            restaurantCount.textContent =
                `${restaurantData.length} places`;

        }

        restaurantData.forEach(
            function(restaurant) {

                const card =
                    document.createElement(
                        "div"
                    );

                card.className =
                    "restaurant-card";

                card.onclick =
                    function() {

                        localStorage.setItem(
                            "selectedRestaurant",
                            JSON.stringify(
                                restaurant
                            )
                        );

                        window.location.href =
                            "restaurant.html";

                    };

                const overallRating =
                    getRestaurantRating(
                        restaurant.name
                    );

                card.innerHTML = `

                    <img
                        class="restaurant-image"
                        src="${restaurant.image}"
                        alt="${restaurant.name}"
                    >

                    <div class="restaurant-info">

                        <h3 class="restaurant-name">
                            ${restaurant.name}
                        </h3>

                        <p class="restaurant-location">
                            📍 ${restaurant.location}
                        </p>

                        <p class="restaurant-rating">
                            ${
                                overallRating > 0
                                    ? `⭐ ${overallRating}`
                                    : "☆ Belum ada rating"
                            }
                        </p>

                    </div>

                `;

                restaurantList.appendChild(
                    card
                );

            }
        );

    }

    displayRestaurants(
        savedRestaurants
    );


    const searchInput =
        document.getElementById(
            "search-input"
        );

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            function() {

                const keyword =
                    searchInput.value
                        .toLowerCase()
                        .trim();

                const filteredRestaurants =
                    savedRestaurants.filter(
                        function(restaurant) {

                            return (
                                restaurant.name
                                    .toLowerCase()
                                    .includes(
                                        keyword
                                    )

                                ||

                                restaurant.location
                                    .toLowerCase()
                                    .includes(
                                        keyword
                                    )
                            );

                        }
                    );

                displayRestaurants(
                    filteredRestaurants
                );

            }
        );

    }

}


// ======================
// LOGOUT
// ======================

function logout() {

    localStorage.removeItem(
        "selectedUser"
    );

    localStorage.removeItem(
        "loggedIn"
    );

    localStorage.removeItem(
        "selectedRestaurant"
    );

    window.location.href =
        "index.html";

}


// ======================
// TAMBAH RESTORAN
// ======================

function addRestaurant() {

    const user =
        localStorage.getItem(
            "selectedUser"
        );

    if (user !== "Ella") {

        alert(
            "Kamu tidak memiliki akses untuk menambah restoran."
        );

        return;

    }

    window.location.href =
        "add-restaurant.html";

}


// ======================
// FORM TAMBAH RESTORAN
// ======================

const restaurantForm =
    document.getElementById(
        "restaurant-form"
    );

if (restaurantForm) {

    const user =
        localStorage.getItem(
            "selectedUser"
        );

    if (user !== "Ella") {

        alert(
            "Kamu tidak memiliki akses ke halaman ini."
        );

        window.location.href =
            "dashboard.html";

    }

    restaurantForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            const name =
                document.getElementById(
                    "restaurant-name"
                ).value.trim();

            const location =
                document.getElementById(
                    "restaurant-location"
                ).value.trim();

            const imageInput =
                document.getElementById(
                    "restaurant-image"
                );

            const duplicate =
                savedRestaurants.some(
                    function(restaurant) {

                        return (
                            restaurant.name
                                .toLowerCase()
                                ===
                            name.toLowerCase()
                        );

                    }
                );

            if (duplicate) {

                alert(
                    "Restoran dengan nama tersebut sudah ada ♡"
                );

                return;

            }

            async function saveRestaurant(
                imageData
            ) {

                const newRestaurant = {

                    name:
                        name,

                    location:
                        location,

                    rating:
                        0,

                    image:
                        imageData ||
                        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"

                };

                savedRestaurants.push(
                    newRestaurant
                );

                localStorage.setItem(
                    "restaurants",
                    JSON.stringify(
                        savedRestaurants
                    )
                );

                alert(
                    "Restoran berhasil ditambahkan ♡"
                );

                window.location.href =
                    "dashboard.html";

            }

            if (
                imageInput.files.length >
                0
            ) {

                try {

                    const file =
                        imageInput.files[0];

                    const compressedImage =
                        await compressImage(
                            file
                        );

                    await saveRestaurant(
                        compressedImage
                    );

                } catch (error) {

                    alert(
                        "Foto gagal diproses. Coba pilih foto lain ya ♡"
                    );

                }

            } else {

                await saveRestaurant(
                    null
                );

            }

        }
    );

}


// ======================
// RESTAURANT DETAIL
// ======================

const detailName =
    document.getElementById(
        "detail-name"
    );

if (detailName) {

    const restaurantData =
        localStorage.getItem(
            "selectedRestaurant"
        );

    if (restaurantData) {

        const restaurant =
            JSON.parse(
                restaurantData
            );

        document.getElementById(
            "detail-name"
        ).textContent =
            restaurant.name;

        document.getElementById(
            "detail-location"
        ).textContent =
            `📍 ${restaurant.location}`;

        const overallRating =
            getRestaurantRating(
                restaurant.name
            );

        document.getElementById(
            "detail-rating"
        ).textContent =
            overallRating > 0
                ? `⭐ ${overallRating}`
                : "☆ Belum ada rating";

        document.getElementById(
            "detail-image"
        ).src =
            restaurant.image;

    }

    const user =
        localStorage.getItem(
            "selectedUser"
        );

    if (user === "Tamu") {

        document.getElementById(
            "add-review-button"
        ).style.display =
            "none";

    }

    if (user !== "Ella") {

        document.getElementById(
            "restaurant-actions"
        ).style.display =
            "none";

    }

}


// ======================
// EDIT RESTORAN
// ======================

function editRestaurant() {

    const user =
        localStorage.getItem(
            "selectedUser"
        );

    if (user !== "Ella") {

        alert(
            "Kamu tidak memiliki akses untuk mengedit restoran."
        );

        return;

    }

    const restaurantData =
        localStorage.getItem(
            "selectedRestaurant"
        );

    if (!restaurantData) {

        alert(
            "Restoran tidak ditemukan."
        );

        return;

    }

    const restaurant =
        JSON.parse(
            restaurantData
        );

    const newName =
        prompt(
            "Edit nama restoran:",
            restaurant.name
        );

    if (
        newName ===
        null
    ) {

        return;

    }

    if (
        newName.trim() ===
        ""
    ) {

        alert(
            "Nama restoran tidak boleh kosong."
        );

        return;

    }

    const newLocation =
        prompt(
            "Edit lokasi restoran:",
            restaurant.location
        );

    if (
        newLocation ===
        null
    ) {

        return;

    }

    if (
        newLocation.trim() ===
        ""
    ) {

        alert(
            "Lokasi restoran tidak boleh kosong."
        );

        return;

    }

    const oldName =
        restaurant.name;

    const duplicate =
        savedRestaurants.some(
            function(item) {

                return (
                    item.name
                        .toLowerCase() ===
                    newName
                        .trim()
                        .toLowerCase()

                    &&

                    item.name !==
                    oldName
                );

            }
        );

    if (duplicate) {

        alert(
            "Nama restoran tersebut sudah digunakan."
        );

        return;

    }

    const restaurantIndex =
        savedRestaurants.findIndex(
            function(item) {

                return (
                    item.name ===
                    oldName
                );

            }
        );

    if (
        restaurantIndex ===
        -1
    ) {

        alert(
            "Restoran tidak ditemukan."
        );

        return;

    }

    savedRestaurants[
        restaurantIndex
    ].name =
        newName.trim();

    savedRestaurants[
        restaurantIndex
    ].location =
        newLocation.trim();

    localStorage.setItem(
        "restaurants",
        JSON.stringify(
            savedRestaurants
        )
    );

    const reviews =
        JSON.parse(
            localStorage.getItem(
                "reviews"
            )
        ) || [];

    reviews.forEach(
        function(review) {

            if (
                review.restaurantName ===
                oldName
            ) {

                review.restaurantName =
                    newName.trim();

            }

        }
    );

    localStorage.setItem(
        "reviews",
        JSON.stringify(
            reviews
        )
    );

    const updatedRestaurant =
        savedRestaurants[
            restaurantIndex
        ];

    localStorage.setItem(
        "selectedRestaurant",
        JSON.stringify(
            updatedRestaurant
        )
    );

    alert(
        "Restoran berhasil diperbarui ♡"
    );

    location.reload();

}


// ======================
// HAPUS RESTORAN
// ======================

function deleteRestaurant() {

    const user =
        localStorage.getItem(
            "selectedUser"
        );

    if (user !== "Ella") {

        alert(
            "Kamu tidak memiliki akses untuk menghapus restoran."
        );

        return;

    }

    const restaurantData =
        localStorage.getItem(
            "selectedRestaurant"
        );

    if (!restaurantData) {

        alert(
            "Restoran tidak ditemukan."
        );

        return;

    }

    const restaurant =
        JSON.parse(
            restaurantData
        );

    const confirmation =
        confirm(
            `Yakin mau menghapus "${restaurant.name}"?`
        );

    if (!confirmation) {

        return;

    }

    savedRestaurants =
        savedRestaurants.filter(
            function(item) {

                return (
                    item.name !==
                    restaurant.name
                );

            }
        );

    localStorage.setItem(
        "restaurants",
        JSON.stringify(
            savedRestaurants
        )
    );

    const reviews =
        JSON.parse(
            localStorage.getItem(
                "reviews"
            )
        ) || [];

    const updatedReviews =
        reviews.filter(
            function(review) {

                return (
                    review.restaurantName !==
                    restaurant.name
                );

            }
        );

    localStorage.setItem(
        "reviews",
        JSON.stringify(
            updatedReviews
        )
    );

    localStorage.removeItem(
        "selectedRestaurant"
    );

    alert(
        "Restoran berhasil dihapus."
    );

    window.location.href =
        "dashboard.html";

}


// ======================
// TAMBAH REVIEW
// ======================

let selectedRating = 0;


function addReview() {

    const user =
        localStorage.getItem(
            "selectedUser"
        );

    if (user === "Tamu") {

        alert(
            "Tamu hanya bisa melihat review ♡"
        );

        return;

    }

    window.location.href =
        "review.html";

}


// ======================
// PILIH BINTANG
// ======================

function setRating(rating) {

    selectedRating =
        rating;

    const stars =
        document.querySelectorAll(
            ".star-rating button"
        );

    stars.forEach(
        function(
            star,
            index
        ) {

            if (
                index <
                rating
            ) {

                star.textContent =
                    "★";

            } else {

                star.textContent =
                    "☆";

            }

        }
    );

    const ratingText =
        document.getElementById(
            "rating-text"
        );

    if (ratingText) {

        ratingText.textContent =
            `${rating} dari 5 bintang ♡`;

    }

}


// ======================
// PREVIEW FOTO
// ======================

const reviewPhotoInput =
    document.getElementById(
        "review-photo"
    );

const photoPreview =
    document.getElementById(
        "photo-preview"
    );


if (
    reviewPhotoInput &&
    photoPreview
) {

    reviewPhotoInput.addEventListener(
        "change",
        function() {

            photoPreview.innerHTML =
                "";

            const files =
                Array.from(
                    reviewPhotoInput.files
                );


            if (
                files.length >
                5
            ) {

                alert(
                    "Maksimal 5 foto ya ♡"
                );

                reviewPhotoInput.value =
                    "";

                return;

            }


            files.forEach(
                function(file) {

                    const reader =
                        new FileReader();

                    reader.onload =
                        function(event) {

                            const img =
                                document.createElement(
                                    "img"
                                );

                            img.src =
                                event.target.result;

                            photoPreview.appendChild(
                                img
                            );

                        };

                    reader.readAsDataURL(
                        file
                    );

                }
            );

        }
    );

}


// ======================
// REVIEW PAGE
// ======================

const reviewForm =
    document.getElementById(
        "review-form"
    );


if (reviewForm) {

    const user =
        localStorage.getItem(
            "selectedUser"
        );

    if (user === "Tamu") {

        alert(
            "Tamu hanya bisa melihat review ♡"
        );

        window.location.href =
            "restaurant.html";

    }

    const restaurantData =
        localStorage.getItem(
            "selectedRestaurant"
        );

    if (restaurantData) {

        const restaurant =
            JSON.parse(
                restaurantData
            );

        document.getElementById(
            "review-restaurant"
        ).textContent =
            restaurant.name;

    }


    reviewForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            if (
                selectedRating ===
                0
            ) {

                alert(
                    "Pilih rating dulu ya ♡"
                );

                return;

            }


            const reviewText =
                document.getElementById(
                    "review-text"
                ).value.trim();


            const photoInput =
                document.getElementById(
                    "review-photo"
                );


            const restaurant =
                JSON.parse(
                    localStorage.getItem(
                        "selectedRestaurant"
                    )
                );


            let reviews =
                JSON.parse(
                    localStorage.getItem(
                        "reviews"
                    )
                ) || [];


            async function saveReview(
                photosData
            ) {

                const newReview = {

                    id:
                        Date.now(),

                    restaurantName:
                        restaurant.name,

                    user:
                        user,

                    rating:
                        selectedRating,

                    text:
                        reviewText,

                    photos:
                        photosData

                };


                reviews.push(
                    newReview
                );


                localStorage.setItem(
                    "reviews",
                    JSON.stringify(
                        reviews
                    )
                );


                alert(
                    "Review berhasil disimpan ♡"
                );


                goBackToRestaurant();

            }


            const files =
                Array.from(
                    photoInput.files
                );


            if (
                files.length >
                5
            ) {

                alert(
                    "Maksimal 5 foto ya ♡"
                );

                return;

            }


            try {

                const compressedPhotos =
                    [];


                for (
                    const file
                    of files
                ) {

                    const compressedImage =
                        await compressImage(
                            file
                        );


                    compressedPhotos.push(
                        compressedImage
                    );

                }


                await saveReview(
                    compressedPhotos
                );


            } catch (error) {

                alert(
                    "Ada foto yang gagal diproses. Coba pilih foto lain ya ♡"
                );

            }

        }
    );

}


// ======================
// TAMPILKAN REVIEW
// ======================

const savedReviews =
    document.getElementById(
        "saved-reviews"
    );


if (savedReviews) {

    const restaurantData =
        localStorage.getItem(
            "selectedRestaurant"
        );

    if (restaurantData) {

        const restaurant =
            JSON.parse(
                restaurantData
            );

        const reviews =
            JSON.parse(
                localStorage.getItem(
                    "reviews"
                )
            ) || [];

        const currentUser =
            localStorage.getItem(
                "selectedUser"
            );

        const restaurantReviews =
            reviews.filter(
                function(review) {

                    return (
                        review.restaurantName ===
                        restaurant.name
                    );

                }
            );


        restaurantReviews.forEach(
            function(review) {

                const reviewCard =
                    document.createElement(
                        "div"
                    );

                reviewCard.className =
                    "review-card";

                const isOwner =
                    review.user ===
                    currentUser;


                let photos = [];

                if (
                    Array.isArray(
                        review.photos
                    )
                ) {

                    photos =
                        review.photos;

                } else if (
                    review.photo
                ) {

                    photos = [
                        review.photo
                    ];

                }


                let photoHTML =
                    "";


                if (
                    photos.length >
                    0
                ) {

                    photoHTML = `

                        <div class="review-photo-gallery">

                            ${
                                photos.map(
                                    function(photo) {

                                        return `

                                            <img
                                                src="${photo}"
                                                alt="Foto review"
                                            >

                                        `;

                                    }
                                ).join("")
                            }

                        </div>

                    `;

                }


                reviewCard.innerHTML = `

                    <div class="review-header">

                        <div>

                            <h3>
                                ${review.user} ♡
                            </h3>

                            <p class="review-stars">
                                ${
                                    "⭐".repeat(
                                        review.rating
                                    )
                                }
                            </p>

                        </div>

                    </div>


                    <p class="review-text">
                        ${review.text}
                    </p>


                    ${photoHTML}


                    ${
                        isOwner
                            ? `
                                <div class="review-actions">

                                    <button
                                        class="edit-review-button"
                                        onclick="editReview(${review.id})"
                                    >
                                        ✏️ Edit
                                    </button>

                                    <button
                                        class="delete-review-button"
                                        onclick="deleteReview(${review.id})"
                                    >
                                        🗑️ Hapus
                                    </button>

                                </div>
                              `
                            : ""
                    }

                `;


                savedReviews.appendChild(
                    reviewCard
                );


                // FOTO REVIEW BISA DIKLIK

                const galleryImages =
                    reviewCard.querySelectorAll(
                        ".review-photo-gallery img"
                    );

                galleryImages.forEach(
                    function(img, index) {

                        img.addEventListener(
                            "click",
                            function() {

                                openPhotoViewer(
                                    photos,
                                    index
                                );

                            }
                        );

                    }
                );

            }
        );


        // ======================
        // REVIEW DUMMY
        // ======================

        const hasEllaReview =
            restaurantReviews.some(
                function(review) {

                    return (
                        review.user ===
                        "Ella"
                    );

                }
            );


        const hasArkaReview =
            restaurantReviews.some(
                function(review) {

                    return (
                        review.user ===
                        "Arka"
                    );

                }
            );


        const placeholderCards =
            document.querySelectorAll(
                ".reviews-section > .review-card"
            );


        if (hasEllaReview) {

            placeholderCards.forEach(
                function(card) {

                    const title =
                        card.querySelector(
                            "h3"
                        );

                    if (
                        title &&
                        title.textContent
                            .includes("Ella")
                    ) {

                        card.style.display =
                            "none";

                    }

                }
            );

        }


        if (hasArkaReview) {

            placeholderCards.forEach(
                function(card) {

                    const title =
                        card.querySelector(
                            "h3"
                        );

                    if (
                        title &&
                        title.textContent
                            .includes("Arka")
                    ) {

                        card.style.display =
                            "none";

                    }

                }
            );

        }

    }

}


// ======================
// EDIT REVIEW
// ======================

function editReview(reviewId) {

    const reviews =
        JSON.parse(
            localStorage.getItem(
                "reviews"
            )
        ) || [];


    const currentUser =
        localStorage.getItem(
            "selectedUser"
        );


    const reviewIndex =
        reviews.findIndex(
            function(review) {

                return (
                    review.id ===
                    reviewId
                );

            }
        );


    if (
        reviewIndex ===
        -1
    ) {

        alert(
            "Review tidak ditemukan."
        );

        return;

    }


    const review =
        reviews[reviewIndex];


    if (
        review.user !==
        currentUser
    ) {

        alert(
            "Kamu hanya bisa mengedit review milikmu sendiri."
        );

        return;

    }


    const newText =
        prompt(
            "Edit review kamu:",
            review.text
        );


    if (
        newText ===
        null
    ) {

        return;

    }


    if (
        newText.trim() ===
        ""
    ) {

        alert(
            "Review tidak boleh kosong."
        );

        return;

    }


    review.text =
        newText;


    localStorage.setItem(
        "reviews",
        JSON.stringify(
            reviews
        )
    );


    location.reload();

}


// ======================
// HAPUS REVIEW
// ======================

function deleteReview(reviewId) {

    const reviews =
        JSON.parse(
            localStorage.getItem(
                "reviews"
            )
        ) || [];


    const currentUser =
        localStorage.getItem(
            "selectedUser"
        );


    const review =
        reviews.find(
            function(review) {

                return (
                    review.id ===
                    reviewId
                );

            }
        );


    if (!review) {

        alert(
            "Review tidak ditemukan."
        );

        return;

    }


    if (
        review.user !==
        currentUser
    ) {

        alert(
            "Kamu hanya bisa menghapus review milikmu sendiri."
        );

        return;

    }


    const confirmation =
        confirm(
            "Yakin mau menghapus review ini?"
        );


    if (!confirmation) {

        return;

    }


    const updatedReviews =
        reviews.filter(
            function(review) {

                return (
                    review.id !==
                    reviewId
                );

            }
        );


    localStorage.setItem(
        "reviews",
        JSON.stringify(
            updatedReviews
        )
    );


    location.reload();

}


// ======================
// KEMBALI KE RESTORAN
// ======================

function goBackToRestaurant() {

    window.location.href =
        "restaurant.html";

}


// ======================
// KEMBALI KE DASHBOARD
// ======================

function goToDashboard() {

    window.location.href =
        "dashboard.html";

}


// ======================
// PHOTO LIGHTBOX
// ======================

let currentPhotos = [];

let currentPhotoIndex = 0;


// ======================
// BUKA FOTO
// ======================

function openPhotoViewer(
    photos,
    index
) {

    currentPhotos =
        photos;

    currentPhotoIndex =
        index;


    const lightbox =
        document.getElementById(
            "photo-lightbox"
        );


    const image =
        document.getElementById(
            "lightbox-image"
        );


    const counter =
        document.getElementById(
            "lightbox-counter"
        );


    if (!lightbox || !image) {

        return;

    }


    image.src =
        currentPhotos[
            currentPhotoIndex
        ];


    counter.textContent =
        `${currentPhotoIndex + 1} / ${currentPhotos.length}`;


    const previousButton =
        document.getElementById(
            "lightbox-prev"
        );


    const nextButton =
        document.getElementById(
            "lightbox-next"
        );


    if (
        currentPhotos.length <=
        1
    ) {

        previousButton.style.display =
            "none";

        nextButton.style.display =
            "none";

    } else {

        previousButton.style.display =
            "block";

        nextButton.style.display =
            "block";

    }


    lightbox.classList.add(
        "active"
    );


    document.body.style.overflow =
        "hidden";

}


// ======================
// TUTUP FOTO
// ======================

function closePhotoViewer(
    event
) {

    if (
        event &&
        event.target &&
        (
            event.target.id ===
                "lightbox-image"

            ||

            event.target.classList.contains(
                "lightbox-nav"
            )
        )
    ) {

        return;

    }


    const lightbox =
        document.getElementById(
            "photo-lightbox"
        );


    if (!lightbox) {

        return;

    }


    lightbox.classList.remove(
        "active"
    );


    document.body.style.overflow =
        "";

}


// ======================
// FOTO SEBELUMNYA
// ======================

function previousPhoto(
    event
) {

    event.stopPropagation();


    if (
        currentPhotos.length <=
        1
    ) {

        return;

    }


    currentPhotoIndex--;


    if (
        currentPhotoIndex <
        0
    ) {

        currentPhotoIndex =
            currentPhotos.length - 1;

    }


    updateLightbox();

}


// ======================
// FOTO BERIKUTNYA
// ======================

function nextPhoto(
    event
) {

    event.stopPropagation();


    if (
        currentPhotos.length <=
        1
    ) {

        return;

    }


    currentPhotoIndex++;


    if (
        currentPhotoIndex >=
        currentPhotos.length
    ) {

        currentPhotoIndex =
            0;

    }


    updateLightbox();

}


// ======================
// UPDATE LIGHTBOX
// ======================

function updateLightbox() {

    const image =
        document.getElementById(
            "lightbox-image"
        );


    const counter =
        document.getElementById(
            "lightbox-counter"
        );


    if (!image) {

        return;

    }


    image.src =
        currentPhotos[
            currentPhotoIndex
        ];


    counter.textContent =
        `${currentPhotoIndex + 1} / ${currentPhotos.length}`;

}


// ======================
// KEYBOARD CONTROL
// ======================

document.addEventListener(
    "keydown",
    function(event) {

        const lightbox =
            document.getElementById(
                "photo-lightbox"
            );


        if (
            !lightbox ||
            !lightbox.classList.contains(
                "active"
            )
        ) {

            return;

        }


        if (
            event.key ===
            "Escape"
        ) {

            closePhotoViewer();

        }


        if (
            event.key ===
            "ArrowLeft"
        ) {

            previousPhoto(
                event
            );

        }


        if (
            event.key ===
            "ArrowRight"
        ) {

            nextPhoto(
                event
            );

        }

    }
);

/* =====================================================
   FOOD JOURNEY + STATISTICS
===================================================== */

function renderFoodJourney() {

    const restaurants =
        JSON.parse(
            localStorage.getItem("restaurants")
        ) || [];

    const reviews =
        JSON.parse(
            localStorage.getItem("reviews")
        ) || [];

    const placeCount =
        document.getElementById(
            "journey-place-count"
        );

    const reviewCount =
        document.getElementById(
            "journey-review-count"
        );

    const averageRating =
        document.getElementById(
            "journey-average-rating"
        );

    const journeyList =
        document.getElementById(
            "food-journey-list"
        );


    /* Kalau bukan halaman dashboard,
       jangan melakukan apa-apa */
    if (
        !placeCount ||
        !reviewCount ||
        !averageRating ||
        !journeyList
    ) {
        return;
    }


    /* =========================
       STATISTIK
    ========================= */

    placeCount.textContent =
        restaurants.length;

    reviewCount.textContent =
        reviews.length;


    if (reviews.length > 0) {

        const totalRating =
            reviews.reduce(
                function(total, review) {
                    return total +
                        Number(review.rating || 0);
                },
                0
            );

        const average =
            totalRating / reviews.length;

        averageRating.textContent =
            average.toFixed(1);

    } else {

        averageRating.textContent =
            "0.0";
    }


    /* =========================
       FOOD JOURNEY
    ========================= */

    if (reviews.length === 0) {

        journeyList.innerHTML = `
            <div class="journey-empty">
                <p>Belum ada cerita di sini ♡</p>
                <small>
                    Tambahkan review pertama kalian
                    untuk mulai food journey.
                </small>
            </div>
        `;

        return;
    }


    /* Review terbaru di atas */
    const sortedReviews =
        [...reviews].sort(
            function(a, b) {

                const dateA =
                    new Date(
                        a.date ||
                        a.createdAt ||
                        0
                    );

                const dateB =
                    new Date(
                        b.date ||
                        b.createdAt ||
                        0
                    );

                return dateB - dateA;
            }
        );


    journeyList.innerHTML =
        sortedReviews
            .map(
                function(review) {

                    const date =
                        new Date(
                            review.date ||
                            review.createdAt ||
                            Date.now()
                        );


                    const formattedDate =
                        date.toLocaleDateString(
                            "id-ID",
                            {
                                day: "numeric",
                                month: "long",
                                year: "numeric"
                            }
                        );


                    const stars =
                        "★".repeat(
                            Number(
                                review.rating || 0
                            )
                        );


                    const user =
                        review.user ||
                        review.reviewer ||
                        "Someone";


                    const restaurant =
                        review.restaurantName ||
                        "Restaurant";


                    const reviewText =
                        review.text ||
                        review.review ||
                        "Tidak ada cerita untuk review ini.";


                    return `
                        <div class="journey-item">

                            <div class="journey-date">
                                ${formattedDate}
                            </div>

                            <div class="journey-card">

                                <div class="journey-card-header">

                                    <div>
                                        <div class="journey-restaurant">
                                            ${restaurant}
                                        </div>

                                        <div class="journey-user">
                                            ${user}
                                        </div>
                                    </div>

                                    <div class="journey-rating">
                                        ${stars}
                                    </div>

                                </div>

                                <div class="journey-review">
                                    ${reviewText}
                                </div>

                            </div>

                        </div>
                    `;
                }
            )
            .join("");
}


/* Jalankan saat halaman selesai dimuat */
document.addEventListener(
    "DOMContentLoaded",
    function() {
        renderFoodJourney();
    }
);

/* =====================================================
   INTERACTIVE FOOD JOURNEY
===================================================== */

let currentJourneyFilter = "all";


function filterFoodJourney(filter, button) {

    currentJourneyFilter = filter;


    /* Ubah tombol aktif */

    const buttons =
        document.querySelectorAll(
            ".journey-filter button"
        );

    buttons.forEach(
        function(btn) {
            btn.classList.remove("active");
        }
    );

    if (button) {
        button.classList.add("active");
    }


    renderInteractiveFoodJourney();
}



function renderInteractiveFoodJourney() {

    const journeyList =
        document.getElementById(
            "food-journey-list"
        );


    if (!journeyList) {
        return;
    }


    const reviews =
        JSON.parse(
            localStorage.getItem("reviews")
        ) || [];


    /* Filter review */

    let filteredReviews =
        [...reviews];


    if (
        currentJourneyFilter !== "all"
    ) {

        filteredReviews =
            filteredReviews.filter(
                function(review) {

                    const user =
                        review.user ||
                        review.reviewer ||
                        "";

                    return (
                        user.toLowerCase() ===
                        currentJourneyFilter.toLowerCase()
                    );
                }
            );
    }


    /* Terbaru di atas */

    filteredReviews.sort(
        function(a, b) {

            const dateA =
                new Date(
                    a.date ||
                    a.createdAt ||
                    0
                );

            const dateB =
                new Date(
                    b.date ||
                    b.createdAt ||
                    0
                );

            return dateB - dateA;
        }
    );


    /* Tidak ada hasil */

    if (
        filteredReviews.length === 0
    ) {

        journeyList.innerHTML = `
            <div class="journey-empty">

                <p>
                    Belum ada cerita di sini ♡
                </p>

                <small>
                    Coba pilih filter lainnya.
                </small>

            </div>
        `;

        return;
    }


    /* Render journey */

    journeyList.innerHTML =
        filteredReviews
            .map(
                function(review) {

                    const date =
                        new Date(
                            review.date ||
                            review.createdAt ||
                            Date.now()
                        );


                    const formattedDate =
                        date.toLocaleDateString(
                            "id-ID",
                            {
                                day: "numeric",
                                month: "long",
                                year: "numeric"
                            }
                        );


                    const rating =
                        Number(
                            review.rating || 0
                        );


                    const stars =
                        "★".repeat(rating);


                    const user =
                        review.user ||
                        review.reviewer ||
                        "Someone";


                    const restaurant =
                        review.restaurantName ||
                        "Restaurant";


                    const reviewText =
                        review.text ||
                        review.review ||
                        "Tidak ada cerita untuk review ini.";


                    return `
                        <div
                            class="journey-item"
                        >

                            <div class="journey-date">
                                ${formattedDate}
                            </div>


                            <div
                                class="journey-card"
                                onclick="openJourneyRestaurant('${escapeJourneyText(restaurant)}')"
                            >

                                <div
                                    class="journey-card-header"
                                >

                                    <div>

                                        <div
                                            class="journey-restaurant"
                                        >
                                            ${restaurant}
                                        </div>


                                        <div
                                            class="journey-user"
                                        >
                                            ${user}
                                        </div>

                                    </div>


                                    <div
                                        class="journey-rating"
                                    >
                                        ${stars}
                                    </div>

                                </div>


                                <div
                                    class="journey-review"
                                >
                                    ${reviewText}
                                </div>

                            </div>

                        </div>
                    `;
                }
            )
            .join("");
}



function escapeJourneyText(text) {

    return String(text)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"');
}



function openJourneyRestaurant(
    restaurantName
) {

    const restaurants =
        JSON.parse(
            localStorage.getItem("restaurants")
        ) || [];


    const restaurant =
        restaurants.find(
            function(item) {

                return (
                    item.name ===
                    restaurantName
                );
            }
        );


    if (!restaurant) {

        alert(
            "Restoran ini sudah tidak tersedia."
        );

        return;
    }


    /*
       Simpan restoran yang dipilih
       supaya restaurant.html
       tahu restoran mana yang dibuka.
    */

    localStorage.setItem(
        "currentRestaurant",
        JSON.stringify(restaurant)
    );


    window.location.href =
        "restaurant.html";
}



/* Jalankan versi interaktif setelah
   halaman selesai dimuat */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        renderInteractiveFoodJourney();

    }
);

/* =====================================================
   OUR FAVORITE PLACES
===================================================== */

function renderFavoritePlaces() {

    const favoriteList =
        document.getElementById(
            "favorite-places-list"
        );

    const favoriteCount =
        document.getElementById(
            "favorite-place-count"
        );


    if (!favoriteList) {
        return;
    }


    const restaurants =
        JSON.parse(
            localStorage.getItem("restaurants")
        ) || [];


    const reviews =
        JSON.parse(
            localStorage.getItem("reviews")
        ) || [];


    /*
       Hitung rating masing-masing restoran
    */

    const restaurantData =
        restaurants.map(
            function(restaurant) {

                const restaurantReviews =
                    reviews.filter(
                        function(review) {

                            return (
                                review.restaurantName ===
                                restaurant.name
                            );
                        }
                    );


                let averageRating = 0;


                if (
                    restaurantReviews.length > 0
                ) {

                    const total =
                        restaurantReviews.reduce(
                            function(sum, review) {

                                return (
                                    sum +
                                    Number(
                                        review.rating || 0
                                    )
                                );

                            },
                            0
                        );


                    averageRating =
                        total /
                        restaurantReviews.length;
                }


                return {
                    restaurant: restaurant,
                    rating: averageRating,
                    reviewCount:
                        restaurantReviews.length
                };

            }
        );


    /*
       Urutkan dari rating tertinggi
    */

    restaurantData.sort(
        function(a, b) {

            if (
                b.rating !==
                a.rating
            ) {

                return (
                    b.rating -
                    a.rating
                );
            }


            return (
                b.reviewCount -
                a.reviewCount
            );

        }
    );


    /*
       Ambil maksimal 3 favorite
    */

    const favorites =
        restaurantData
            .filter(
                function(item) {

                    return (
                        item.reviewCount > 0
                    );

                }
            )
            .slice(0, 3);


    /*
       Update jumlah favorite
    */

    favoriteCount.textContent =
        favorites.length +
        (
            favorites.length === 1
                ? " place"
                : " places"
        );


    /*
       Kalau belum ada review
    */

    if (
        favorites.length === 0
    ) {

        favoriteList.innerHTML = `
            <div class="favorite-place-empty">

                <p>
                    Belum ada favorite place ♡
                </p>

                <small>
                    Kasih review dulu untuk mulai
                    menemukan tempat favorit kalian.
                </small>

            </div>
        `;

        return;
    }


    /*
       Render favorite cards
    */

    favoriteList.innerHTML =
        favorites
            .map(
                function(item, index) {

                    const restaurant =
                        item.restaurant;


                    const rating =
                        item.rating;


                    const reviewCount =
                        item.reviewCount;


                    const image =
                        restaurant.image ||
                        "https://via.placeholder.com/600x400?text=Satu+Meja";


                    const location =
                        restaurant.location ||
                        "Lokasi belum ditambahkan";


                    const stars =
                        "★".repeat(
                            Math.round(rating)
                        );


                    return `
                        <div
                            class="favorite-place-card"
                            onclick="openFavoritePlace('${escapeFavoriteText(restaurant.name)}')"
                        >

                            <img
                                class="favorite-place-image"
                                src="${image}"
                                alt="${restaurant.name}"
                            >


                            <div
                                class="favorite-place-content"
                            >

                                <div
                                    class="favorite-place-rank"
                                >
                                    FAVORITE #${index + 1}
                                </div>


                                <div
                                    class="favorite-place-name"
                                >
                                    ${restaurant.name}
                                </div>


                                <div
                                    class="favorite-place-location"
                                >
                                    ${location}
                                </div>


                                <div
                                    class="favorite-place-rating"
                                >

                                    <span
                                        class="favorite-place-stars"
                                    >
                                        ${stars}
                                    </span>

                                    <span
                                        class="favorite-place-score"
                                    >
                                        ${rating.toFixed(1)}
                                    </span>

                                </div>


                                <div
                                    class="favorite-place-reviews"
                                >
                                    ${reviewCount}
                                    ${reviewCount === 1 ? "review" : "reviews"}
                                </div>

                            </div>

                        </div>
                    `;

                }
            )
            .join("");
}



function escapeFavoriteText(text) {

    return String(text)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"');
}



function openFavoritePlace(
    restaurantName
) {

    const restaurants =
        JSON.parse(
            localStorage.getItem("restaurants")
        ) || [];


    const restaurant =
        restaurants.find(
            function(item) {

                return (
                    item.name ===
                    restaurantName
                );

            }
        );


    if (!restaurant) {

        alert(
            "Restoran ini sudah tidak tersedia."
        );

        return;
    }


    localStorage.setItem(
        "currentRestaurant",
        JSON.stringify(restaurant)
    );


    window.location.href =
        "restaurant.html";
}



/*
   Jalankan saat dashboard dibuka
*/

document.addEventListener(
    "DOMContentLoaded",
    function() {

        renderFavoritePlaces();

    }
);

/* =====================================================
   RANDOM LITTLE NOTES
===================================================== */

const littleNotes = [

    "Every meal becomes a little memory when we share the same table. ♡",

    "Another place, another little story.",

    "Good food tastes better with good company.",

    "Some of our favorite memories start with \"mau makan di mana?\"",

    "Same table, different stories, always us. ♡",

    "A little meal, a little laughter, a lot of memories.",

    "Here’s to all the places we haven’t tried yet.",

    "Maybe the food was good, but the company was better.",

    "Collecting places, flavors, and little moments together.",

    "One table, two people, countless memories.",

    "Let’s keep finding new places to call ours. ♡",

    "Another page in our little food diary.",

    "Some days are remembered by the places we ate.",

    "Good food, silly stories, happy memories.",

    "Our favorite places are the ones with a story.",

    "A new place today, another memory tomorrow.",

    "Saving little moments, one meal at a time. ♡",

    "Maybe someday we’ll look back at these and smile.",

    "Food tastes a little different when the moment means something.",

    "Here’s to more meals, more places, and more stories together. ♡"

];


function showRandomLittleNote() {

    const noteElement =
        document.getElementById(
            "little-note-text"
        );


    if (!noteElement) {
        return;
    }


    let randomIndex =
        Math.floor(
            Math.random() *
            littleNotes.length
        );


    const previousNote =
        localStorage.getItem(
            "lastLittleNote"
        );


    /*
       Jangan tampilkan note yang sama
       dua kali berturut-turut.
    */

    while (
        littleNotes.length > 1 &&
        littleNotes[randomIndex] ===
        previousNote
    ) {

        randomIndex =
            Math.floor(
                Math.random() *
                littleNotes.length
            );
    }


    const selectedNote =
        littleNotes[randomIndex];


    noteElement.textContent =
        selectedNote;


    localStorage.setItem(
        "lastLittleNote",
        selectedNote
    );
}


/*
   Tampilkan note random
   setiap dashboard dibuka.
*/

document.addEventListener(
    "DOMContentLoaded",
    function() {

        showRandomLittleNote();

    }
);

/* =====================================================
   LITTLE THINGS ABOUT US - STATISTICS
===================================================== */

function renderLittleThings() {

    const mostVisitedElement =
        document.getElementById(
            "most-visited-place"
        );

    const ellaCountElement =
        document.getElementById(
            "ella-review-count"
        );

    const arkaCountElement =
        document.getElementById(
            "arka-review-count"
        );

    const totalMemoryElement =
        document.getElementById(
            "total-memory-count"
        );


    if (
        !mostVisitedElement ||
        !ellaCountElement ||
        !arkaCountElement ||
        !totalMemoryElement
    ) {
        return;
    }


    const reviews =
        JSON.parse(
            localStorage.getItem("reviews")
        ) || [];


    /*
       Total memories
    */

    totalMemoryElement.textContent =
        reviews.length;


    /*
       Hitung review Ella
    */

    const ellaReviews =
        reviews.filter(
            function(review) {

                const user =
                    review.user ||
                    review.reviewer ||
                    "";

                return (
                    user.toLowerCase() ===
                    "ella"
                );

            }
        );


    ellaCountElement.textContent =
        ellaReviews.length;


    /*
       Hitung review Arka
    */

    const arkaReviews =
        reviews.filter(
            function(review) {

                const user =
                    review.user ||
                    review.reviewer ||
                    "";

                return (
                    user.toLowerCase() ===
                    "arka"
                );

            }
        );


    arkaCountElement.textContent =
        arkaReviews.length;


    /*
       Cari restoran yang paling sering
       direview.
    */

    const restaurantVisits = {};


    reviews.forEach(
        function(review) {

            const restaurant =
                review.restaurantName;


            if (!restaurant) {
                return;
            }


            if (
                !restaurantVisits[restaurant]
            ) {

                restaurantVisits[restaurant] =
                    0;
            }


            restaurantVisits[restaurant]++;
        }
    );


    const visitedPlaces =
        Object.entries(
            restaurantVisits
        );


    /*
       Belum ada review
    */

    if (
        visitedPlaces.length === 0
    ) {

        mostVisitedElement.textContent =
            "—";

        return;
    }


    /*
       Urutkan berdasarkan jumlah review
    */

    visitedPlaces.sort(
        function(a, b) {

            return b[1] - a[1];

        }
    );


    const mostVisited =
        visitedPlaces[0][0];


    mostVisitedElement.textContent =
        mostVisited;
}


/*
   Jalankan saat dashboard dibuka
*/

document.addEventListener(
    "DOMContentLoaded",
    function() {

        renderLittleThings();

    }
);