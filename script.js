let selectedUser = null;


// ======================
// PILIH USER
// ======================

function selectUser(user) {

    if (user === "Tamu") {

        localStorage.removeItem(
            "loggedIn"
        );

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
    document.getElementById(
        "login-form"
    );


if (loginForm) {

    const user =
        localStorage.getItem(
            "selectedUser"
        );

    const title =
        document.getElementById(
            "login-title"
        );

    if (title) {

        title.textContent =
            `Hello, ${user}!`;

    }


    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const password =
                document.getElementById(
                    "password"
                ).value;


            const message =
                document.getElementById(
                    "login-message"
                );


            const emailMap = {

                Ella:
                    "elfishasatya@gmail.com",

                Arka:
                    "naufalkenz@gmail.com"

            };


            const email =
                emailMap[user];


            if (!email) {

                message.textContent =
                    "User tidak ditemukan ♡";

                return;

            }


            if (
                typeof supabaseClient ===
                "undefined"
            ) {

                message.textContent =
                    "Koneksi database belum tersedia ♡";

                console.error(
                    "supabaseClient tidak ditemukan."
                );

                return;

            }


            const {
                error
            } =
                await supabaseClient
                    .auth
                    .signInWithPassword({

                        email:
                            email,

                        password:
                            password

                    });


            if (error) {

                message.textContent =
                    "Password salah ♡";

                console.error(
                    error
                );

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
// FORGOT PASSWORD
// ======================

const forgotPasswordButton =
    document.getElementById(
        "forgot-password-button"
    );


if (forgotPasswordButton) {

    forgotPasswordButton.addEventListener(
        "click",
        async function() {

            const user =
                localStorage.getItem(
                    "selectedUser"
                );


            const message =
                document.getElementById(
                    "login-message"
                );


            const emailMap = {

                Ella:
                    "elfishasatya@gmail.com",

                Arka:
                    "naufalkenz@gmail.com"

            };


            const email =
                emailMap[user];


            if (!email) {

                message.textContent =
                    "User tidak ditemukan ♡";

                return;

            }


            if (
                typeof supabaseClient ===
                "undefined"
            ) {

                message.textContent =
                    "Koneksi database belum tersedia ♡";

                console.error(
                    "supabaseClient tidak ditemukan."
                );

                return;

            }


            const {
                error
            } =
                await supabaseClient
                    .auth
                    .resetPasswordForEmail(

                        email,

                        {
                            redirectTo:
                                "http://localhost:5500/reset-password.html"
                        }

                    );


            if (error) {

                message.textContent =
                    "Gagal mengirim email reset password ♡";

                console.error(
                    error
                );

                return;

            }


            message.textContent =
                "Email reset password sudah dikirim ♡";

        }
    );

}




// ======================
// HELPER SUPABASE
// ======================

function hasSupabaseClient() {

    if (
        typeof supabaseClient ===
        "undefined"
    ) {

        console.error(
            "supabaseClient tidak ditemukan. Pastikan supabase.js dimuat sebelum script.js."
        );

        return false;

    }


    return true;

}


// ======================
// LOAD RESTAURANTS
// ======================

async function loadRestaurants() {

    if (
        !hasSupabaseClient()
    ) {

        return [];

    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("restaurants")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Gagal mengambil restoran:",
            error
        );

        return [];

    }


    return data || [];

}


// ======================
// GET RESTAURANT RATING
// ======================

async function getRestaurantRating(
    restaurantName
) {

    if (
        !hasSupabaseClient()
    ) {

        return 0;

    }


    const {
        data: restaurant,
        error: restaurantError
    } =
        await supabaseClient
            .from("restaurants")
            .select("id")
            .eq(
                "name",
                restaurantName
            )
            .single();


    if (
        restaurantError ||
        !restaurant
    ) {

        console.error(
            restaurantError
        );

        return 0;

    }


    const {
        data: reviews,
        error: reviewError
    } =
        await supabaseClient
            .from("reviews")
            .select("rating")
            .eq(
                "restaurant_id",
                restaurant.id
            );


    if (reviewError) {

        console.error(
            reviewError
        );

        return 0;

    }


    if (
        !reviews ||
        reviews.length === 0
    ) {

        return 0;

    }


    const total =
        reviews.reduce(
            function(
                sum,
                review
            ) {

                return (
                    sum +
                    Number(
                        review.rating
                    )
                );

            },
            0
        );


    return Number(
        (
            total /
            reviews.length
        ).toFixed(1)
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

    async function displayRestaurants(
        restaurants
    ) {

        restaurantList.innerHTML =
            "";


        const restaurantCount =
            document.getElementById(
                "restaurant-count"
            );


        if (restaurantCount) {

            restaurantCount.textContent =
                `${restaurants.length} places`;

        }


        if (
            restaurants.length ===
            0
        ) {

            restaurantList.innerHTML = `

                <div class="empty-state">

                    <p>
                        Belum ada restoran ♡
                    </p>

                    <small>
                        Tambahkan restoran pertama
                        untuk memulai.
                    </small>

                </div>

            `;

            return;

        }


        for (
            const restaurant of
            restaurants
        ) {

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


                    localStorage.setItem(
                        "selectedRestaurantId",
                        restaurant.id
                    );


                    window.location.href =
                        "restaurant.html";

                };


            const overallRating =
                await getRestaurantRating(
                    restaurant.name
                );


            card.innerHTML = `

                <img
                    class="restaurant-image"
                    src="${
                        restaurant.image_url ||
                        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"
                    }"
                    alt="${restaurant.name}"
                >

                <div class="restaurant-info">

                    <h3 class="restaurant-name">
                        ${restaurant.name}
                    </h3>

                    <p class="restaurant-location">
                        📍 ${
                            restaurant.location ||
                            "Lokasi belum ditambahkan"
                        }
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

    }

// ======================
// LOAD RESTAURANT REVIEWS
// ======================

async function loadRestaurantReviews(
    restaurantId
) {

    const reviewsContainer =
        document.getElementById(
            "saved-reviews"
        );

    if (!reviewsContainer) {
        return;
    }


    if (!hasSupabaseClient()) {
        return;
    }


    reviewsContainer.innerHTML =
        "<p>Memuat review...</p>";


    const {
        data: reviews,
        error
    } =
        await supabaseClient
            .from("reviews")
            .select(
                `
                id,
                user_name,
                rating,
                review_text,
                created_at,
                review_photos (
                    id,
                    photo_url
                )
                `
            )
            .eq(
                "restaurant_id",
                restaurantId
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Gagal mengambil review:",
            error
        );

        reviewsContainer.innerHTML =
            "<p>Gagal memuat review.</p>";

        return;

    }


    if (
        !reviews ||
        reviews.length === 0
    ) {

        reviewsContainer.innerHTML = `
            <div class="review-card">

                <p class="review-text">
                    Belum ada review untuk restoran ini.
                </p>

            </div>
        `;

        return;

    }


    reviewsContainer.innerHTML = "";


    reviews.forEach(
        function(review) {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "review-card";


            // ======================
            // STARS
            // ======================

            const rating =
                Number(
                    review.rating
                );


            const stars =
                "⭐".repeat(
                    rating
                );


            // ======================
            // DATE
            // ======================

            const date =
                new Date(
                    review.created_at
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


            // ======================
            // PHOTOS
            // ======================

            let photosHTML = "";


            if (
                review.review_photos &&
                review.review_photos.length > 0
            ) {

                photosHTML =
                    `
                    <div class="review-photos">
                    `;

                review.review_photos.forEach(
                    function(photo) {

                        photosHTML += `
                            <img
                                src="${photo.photo_url}"
                                class="review-photo"
                                alt="Foto review"
                            >
                        `;

                    }
                );


                photosHTML +=
                    `
                    </div>
                    `;

            }


            // ======================
            // CARD
            // ======================

            card.innerHTML = `

                <div class="review-header">

                    <div>

                        <h3>
                            ${review.user_name} ♡
                        </h3>

                        <p class="review-stars">
                            ${stars}
                        </p>

                    </div>

                </div>


                <p class="review-text">
                    ${review.review_text}
                </p>


                <p class="review-date">
                    ${formattedDate}
                </p>


                ${photosHTML}

            `;


            reviewsContainer.appendChild(
                card
            );

        }
    );

}

    async function initializeDashboard() {

        const restaurants =
            await loadRestaurants();


        await displayRestaurants(
            restaurants
        );

    }


    initializeDashboard();


    const searchInput =
        document.getElementById(
            "search-input"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            async function() {

                const keyword =
                    searchInput.value
                        .toLowerCase()
                        .trim();


                const restaurants =
                    await loadRestaurants();


                const filteredRestaurants =
                    restaurants.filter(
                        function(
                            restaurant
                        ) {

                            return (

                                (
                                    restaurant.name ||
                                    ""
                                )
                                    .toLowerCase()
                                    .includes(
                                        keyword
                                    )

                                ||

                                (
                                    restaurant.location ||
                                    ""
                                )
                                    .toLowerCase()
                                    .includes(
                                        keyword
                                    )

                            );

                        }
                    );


                await displayRestaurants(
                    filteredRestaurants
                );

            }
        );

    }

}


// ======================
// LOGOUT
// ======================

async function logout() {

    if (
        !hasSupabaseClient()
    ) {

        window.location.href =
            "index.html";

        return;

    }


    const {
        error
    } =
        await supabaseClient
            .auth
            .signOut();


    if (error) {

        console.error(
            error
        );

        alert(
            "Gagal logout. Coba lagi ya ♡"
        );

        return;

    }


    localStorage.removeItem(
        "selectedUser"
    );

    localStorage.removeItem(
        "loggedIn"
    );

    localStorage.removeItem(
        "selectedRestaurant"
    );

    localStorage.removeItem(
        "selectedRestaurantId"
    );


    window.location.href =
        "index.html";

}

// =========================
// KE HALAMAN REVIEW
// =========================

function goToReview() {

    const restaurantId =
        localStorage.getItem(
            "selectedRestaurantId"
        );

    if (!restaurantId) {

        alert(
            "Restoran belum dipilih."
        );

        return;

    }

    window.location.href =
        "review.html";
}

// ======================
// TAMBAH RESTORAN
// ======================
// PENTING:
// Fungsi ini HANYA untuk pindah
// ke halaman add-restaurant.
// Jangan dibuat async Supabase.

function addRestaurant() {

    const user =
        localStorage.getItem(
            "selectedUser"
        );


    if (
        user !== "Ella"
    ) {

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

    async function checkRestaurantAccess() {

        if (
            !hasSupabaseClient()
        ) {

            alert(
                "Koneksi database belum tersedia ♡"
            );

            return false;

        }


        const {
            data: {
                user: authUser
            }
        } =
            await supabaseClient
                .auth
                .getUser();


        if (!authUser) {

            window.location.href =
                "index.html";

            return false;

        }


        const {
            data: profile,
            error
        } =
            await supabaseClient
                .from("profiles")
                .select("role")
                .eq(
                    "id",
                    authUser.id
                )
                .single();


        if (
            error ||
            !profile ||
            profile.role !== "ella"
        ) {

            alert(
                "Kamu tidak memiliki akses ke halaman ini."
            );

            window.location.href =
                "dashboard.html";

            return false;

        }


        return true;

    }


    checkRestaurantAccess();


    restaurantForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            if (
                !hasSupabaseClient()
            ) {

                alert(
                    "Koneksi database belum tersedia ♡"
                );

                return;

            }


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


            if (!name) {

                alert(
                    "Nama restoran wajib diisi."
                );

                return;

            }


            // Cek restoran dengan nama sama
            const {
                data: existingRestaurants,
                error: duplicateError
            } =
                await supabaseClient
                    .from("restaurants")
                    .select("id, name")
                    .ilike(
                        "name",
                        name
                    );


            if (duplicateError) {

                console.error(
                    duplicateError
                );

                alert(
                    "Gagal mengecek nama restoran ♡"
                );

                return;

            }


            if (
                existingRestaurants &&
                existingRestaurants.length >
                0
            ) {

                alert(
                    "Restoran dengan nama tersebut sudah ada ♡"
                );

                return;

            }


            let imageUrl = null;


            // ======================
            // UPLOAD FOTO
            // ======================

            if (
                imageInput &&
                imageInput.files &&
                imageInput.files.length >
                0
            ) {

                const file =
                    imageInput.files[0];


                const fileExtension =
                    file.name
                        .split(".")
                        .pop()
                        .toLowerCase();


                const fileName =
                    `${crypto.randomUUID()}.${fileExtension}`;


                const filePath =
                    `${fileName}`;


                const {
                    error: uploadError
                } =
                    await supabaseClient
                        .storage
                        .from(
                            "restaurant-photos"
                        )
                        .upload(
                            filePath,
                            file,
                            {
                                upsert:
                                    false
                            }
                        );


                if (uploadError) {

                    console.error(
                        uploadError
                    );

                    alert(
                        "Foto restoran gagal diupload ♡"
                    );

                    return;

                }


                const {
                    data: signedUrlData,
                    error: signedUrlError
                } =
                    await supabaseClient
                        .storage
                        .from(
                            "restaurant-photos"
                        )
                        .createSignedUrl(
                            filePath,
                            60 * 60 * 24 * 365
                        );


                if (
                    signedUrlError
                ) {

                    console.error(
                        signedUrlError
                    );

                } else {

                    imageUrl =
                        signedUrlData
                            ?.signedUrl ||
                        null;

                }

            }


            // ======================
            // SIMPAN RESTORAN
            // ======================

            const {
                data,
                error
            } =
                await supabaseClient
                    .from(
                        "restaurants"
                    )
                    .insert([
                        {
                            name:
                                name,

                            location:
                                location,

                            image_url:
                                imageUrl
                        }
                    ])
                    .select()
                    .single();


            if (error) {

                console.error(
                    error
                );

                alert(
                    "Restoran gagal disimpan ♡"
                );

                return;

            }


            localStorage.setItem(
                "selectedRestaurant",
                JSON.stringify(
                    data
                )
            );


            localStorage.setItem(
                "selectedRestaurantId",
                data.id
            );


            alert(
                "Restoran berhasil ditambahkan ♡"
            );


            window.location.href =
                "dashboard.html";

        }
    );

}


// ======================
// EDIT RESTORAN
// ======================

async function editRestaurant() {

    if (
        !hasSupabaseClient()
    ) {

        alert(
            "Koneksi database belum tersedia ♡"
        );

        return;

    }


    const {
        data: {
            user: authUser
        }
    } =
        await supabaseClient
            .auth
            .getUser();


    if (!authUser) {

        window.location.href =
            "index.html";

        return;

    }


    const {
        data: profile,
        error: profileError
    } =
        await supabaseClient
            .from("profiles")
            .select("role")
            .eq(
                "id",
                authUser.id
            )
            .single();


    if (
        profileError ||
        !profile ||
        profile.role !== "ella"
    ) {

        alert(
            "Kamu tidak memiliki akses untuk mengedit restoran."
        );

        return;

    }


    const restaurantId =
        localStorage.getItem(
            "selectedRestaurantId"
        );


    if (!restaurantId) {

        alert(
            "Restoran tidak ditemukan."
        );

        return;

    }


    const {
        data: restaurant,
        error: restaurantError
    } =
        await supabaseClient
            .from("restaurants")
            .select("*")
            .eq(
                "id",
                restaurantId
            )
            .single();


    if (
        restaurantError ||
        !restaurant
    ) {

        console.error(
            restaurantError
        );

        alert(
            "Restoran tidak ditemukan."
        );

        return;

    }


    const newName =
        prompt(
            "Nama restoran:",
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
            "Lokasi restoran:",
            restaurant.location ||
            ""
        );


    if (
        newLocation ===
        null
    ) {

        return;

    }


    const {
        error: updateError
    } =
        await supabaseClient
            .from("restaurants")
            .update({

                name:
                    newName.trim(),

                location:
                    newLocation.trim()

            })
            .eq(
                "id",
                restaurantId
            );


    if (updateError) {

        console.error(
            updateError
        );

        alert(
            "Restoran gagal diperbarui ♡"
        );

        return;

    }


    alert(
        "Restoran berhasil diperbarui ♡"
    );


    window.location.href =
        "restaurant.html";

}


// ======================
// HAPUS RESTORAN
// ======================

async function deleteRestaurant() {

    if (
        !hasSupabaseClient()
    ) {

        alert(
            "Koneksi database belum tersedia ♡"
        );

        return;

    }


    const {
        data: {
            user: authUser
        }
    } =
        await supabaseClient
            .auth
            .getUser();


    if (!authUser) {

        window.location.href =
            "index.html";

        return;

    }


    const {
        data: profile,
        error: profileError
    } =
        await supabaseClient
            .from("profiles")
            .select("role")
            .eq(
                "id",
                authUser.id
            )
            .single();


    if (
        profileError ||
        !profile ||
        profile.role !== "ella"
    ) {

        alert(
            "Kamu tidak memiliki akses untuk menghapus restoran."
        );

        return;

    }


    const restaurantId =
        localStorage.getItem(
            "selectedRestaurantId"
        );


    if (!restaurantId) {

        alert(
            "Restoran tidak ditemukan."
        );

        return;

    }


    const {
        data: restaurant,
        error: restaurantError
    } =
        await supabaseClient
            .from("restaurants")
            .select("*")
            .eq(
                "id",
                restaurantId
            )
            .single();


    if (
        restaurantError ||
        !restaurant
    ) {

        console.error(
            restaurantError
        );

        alert(
            "Restoran tidak ditemukan."
        );

        return;

    }


    const confirmation =
        confirm(
            `Yakin mau menghapus "${restaurant.name}"?`
        );


    if (!confirmation) {

        return;

    }


    const {
        error: deleteError
    } =
        await supabaseClient
            .from("restaurants")
            .delete()
            .eq(
                "id",
                restaurantId
            );


    if (deleteError) {

        console.error(
            deleteError
        );

        alert(
            "Restoran gagal dihapus ♡"
        );

        return;

    }


    localStorage.removeItem(
        "selectedRestaurantId"
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


    if (counter) {

        counter.textContent =
            `${currentPhotoIndex + 1} / ${currentPhotos.length}`;

    }

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
            localStorage.getItem(
                "restaurants"
            )
        ) || [];


    const reviews =
        JSON.parse(
            localStorage.getItem(
                "reviews"
            )
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


    if (
        reviews.length > 0
    ) {

        const totalRating =
            reviews.reduce(
                function(
                    total,
                    review
                ) {

                    return (
                        total +
                        Number(
                            review.rating ||
                            0
                        )
                    );

                },
                0
            );


        const average =
            totalRating /
            reviews.length;


        averageRating.textContent =
            average.toFixed(1);

    } else {

        averageRating.textContent =
            "0.0";

    }


    /* =========================
       FOOD JOURNEY
    ========================= */

    if (
        reviews.length === 0
    ) {

        journeyList.innerHTML = `

            <div class="journey-empty">

                <p>
                    Belum ada cerita di sini ♡
                </p>

                <small>
                    Tambahkan review pertama kalian
                    untuk mulai food journey.
                </small>

            </div>

        `;

        return;

    }


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


                return (
                    dateB -
                    dateA
                );

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
                                day:
                                    "numeric",

                                month:
                                    "long",

                                year:
                                    "numeric"
                            }
                        );


                    const stars =
                        "★".repeat(
                            Number(
                                review.rating ||
                                0
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


// Jalankan saat halaman selesai dimuat

document.addEventListener(
    "DOMContentLoaded",
    function() {

        renderFoodJourney();

    }
);


/* =====================================================
   INTERACTIVE FOOD JOURNEY
===================================================== */

let currentJourneyFilter =
    "all";


function filterFoodJourney(
    filter,
    button
) {

    currentJourneyFilter =
        filter;


    const buttons =
        document.querySelectorAll(
            ".journey-filter button"
        );


    buttons.forEach(
        function(btn) {

            btn.classList.remove(
                "active"
            );

        }
    );


    if (button) {

        button.classList.add(
            "active"
        );

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
            localStorage.getItem(
                "reviews"
            )
        ) || [];


    let filteredReviews =
        [...reviews];


    if (
        currentJourneyFilter !==
        "all"
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
                        currentJourneyFilter
                            .toLowerCase()
                    );

                }
            );

    }


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


            return (
                dateB -
                dateA
            );

        }
    );


    if (
        filteredReviews.length ===
        0
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
                                day:
                                    "numeric",

                                month:
                                    "long",

                                year:
                                    "numeric"
                            }
                        );


                    const rating =
                        Number(
                            review.rating ||
                            0
                        );


                    const stars =
                        "★".repeat(
                            rating
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

                        <div
                            class="journey-item"
                        >

                            <div
                                class="journey-date"
                            >
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


function escapeJourneyText(
    text
) {

    return String(text)
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        )
        .replace(
            /"/g,
            '\\"'
        );

}


function openJourneyRestaurant(
    restaurantName
) {

    const restaurants =
        JSON.parse(
            localStorage.getItem(
                "restaurants"
            )
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
        JSON.stringify(
            restaurant
        )
    );


    window.location.href =
        "restaurant.html";

}

// =====================================================
// FAVORITE PLACES
// =====================================================

function renderFavoritePlaces() {

    const container =
        document.getElementById(
            "favorite-places-list"
        );

    if (!container) {
        return;
    }


    const restaurants =
        JSON.parse(
            localStorage.getItem(
                "restaurants"
            )
        ) || [];


    const reviews =
        JSON.parse(
            localStorage.getItem(
                "reviews"
            )
        ) || [];


    if (
        restaurants.length === 0
    ) {

        container.innerHTML = `

            <div class="favorite-empty">

                <p>
                    Belum ada tempat favorit ♡
                </p>

                <small>
                    Tambahkan review untuk mulai
                    mengumpulkan tempat favorit.
                </small>

            </div>

        `;

        return;

    }


    /*
       Hitung rating dan jumlah review
       setiap restoran
    */

    const favoriteRestaurants =
        restaurants
            .map(
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


                    const reviewCount =
                        restaurantReviews.length;


                    let averageRating = 0;


                    if (
                        reviewCount > 0
                    ) {

                        const total =
                            restaurantReviews.reduce(
                                function(
                                    sum,
                                    review
                                ) {

                                    return (
                                        sum +
                                        Number(
                                            review.rating ||
                                            0
                                        )
                                    );

                                },
                                0
                            );


                        averageRating =
                            total /
                            reviewCount;

                    }


                    return {

                        ...restaurant,

                        reviewCount:
                            reviewCount,

                        averageRating:
                            averageRating

                    };

                }
            )
            .filter(
                function(restaurant) {

                    return (
                        restaurant.reviewCount >
                        0
                    );

                }
            )
            .sort(
                function(a, b) {

                    /*
                       Rating lebih tinggi
                       diprioritaskan.

                       Kalau sama,
                       jumlah review lebih banyak.
                    */

                    if (
                        b.averageRating !==
                        a.averageRating
                    ) {

                        return (
                            b.averageRating -
                            a.averageRating
                        );

                    }


                    return (
                        b.reviewCount -
                        a.reviewCount
                    );

                }
            )
            .slice(
                0,
                3
            );


    if (
        favoriteRestaurants.length === 0
    ) {

        container.innerHTML = `

            <div class="favorite-empty">

                <p>
                    Belum ada tempat favorit ♡
                </p>

                <small>
                    Tambahkan review untuk melihat
                    tempat favorit kalian.
                </small>

            </div>

        `;

        return;

    }


    container.innerHTML =
        favoriteRestaurants
            .map(
                function(restaurant) {

                    const rating =
                        restaurant.averageRating
                            .toFixed(1);


                    const stars =
                        "★".repeat(
                            Math.round(
                                restaurant.averageRating
                            )
                        );


                    return `

                        <div
                            class="favorite-card"
                            onclick="openFavoriteRestaurant('${escapeFavoriteText(restaurant.name)}')"
                        >

                            <div
                                class="favorite-image-wrapper"
                            >

                                <img
                                    src="${
                                        restaurant.image ||
                                        restaurant.image_url ||
                                        "https://via.placeholder.com/500x350?text=Restaurant"
                                    }"
                                    alt="${escapeHTML(
                                        restaurant.name
                                    )}"
                                    class="favorite-image"
                                >

                            </div>


                            <div
                                class="favorite-content"
                            >

                                <h3>
                                    ${escapeHTML(
                                        restaurant.name
                                    )}
                                </h3>


                                <p
                                    class="favorite-location"
                                >
                                    ${
                                        escapeHTML(
                                            restaurant.location ||
                                            "Lokasi tidak tersedia"
                                        )
                                    }
                                </p>


                                <div
                                    class="favorite-rating"
                                >

                                    <span>
                                        ${stars}
                                    </span>

                                    <strong>
                                        ${rating}
                                    </strong>

                                </div>


                                <div
                                    class="favorite-review-count"
                                >
                                    ${restaurant.reviewCount}
                                    ${
                                        restaurant.reviewCount === 1
                                            ? "review"
                                            : "reviews"
                                    }
                                </div>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


function escapeFavoriteText(
    text
) {

    return String(text)
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        )
        .replace(
            /"/g,
            '\\"'
        );

}


function openFavoriteRestaurant(
    restaurantName
) {

    const restaurants =
        JSON.parse(
            localStorage.getItem(
                "restaurants"
            )
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
        JSON.stringify(
            restaurant
        )
    );


    window.location.href =
        "restaurant.html";

}


// =====================================================
// LITTLE NOTES
// =====================================================

const littleNotes = [
    "Meals always taste better together ♡",
    "One table, countless stories.",
    "Every place holds a story of its own.",
    "May there always be new places for us to discover.",
    "Food first, memories forever.",
    "Sometimes, a meal becomes a memory.",
    "From one place to another.",
    "May this little list keep growing.",
    "Small moments can become the sweetest memories.",
    "One review, one little story.",
    "Different places, the same memories.",
    "Some meals become memories.",
    "It was never just about the food.",
    "May we always find good food and new stories.",
    "A little food diary of us.",
    "Keeping our little stories here ♡",
    "Every table has a story.",
    "Eat, talk, and keep the memories.",
    "Another place, another memory.",
    "For all the little stories we have shared."
];

function showRandomLittleNote() {

    const noteText =
        document.getElementById("little-note-text");

    if (!noteText) {
        return;
    }

    let lastNote =
        localStorage.getItem("lastLittleNote");

    let availableNotes =
        littleNotes.filter(function(note) {
            return note !== lastNote;
        });

    if (availableNotes.length === 0) {
        availableNotes = littleNotes;
    }

    const randomIndex =
        Math.floor(
            Math.random() * availableNotes.length
        );

    const selectedNote =
        availableNotes[randomIndex];

    noteText.textContent =
        selectedNote;

    localStorage.setItem(
        "lastLittleNote",
        selectedNote
    );
}


// =====================================================
// LITTLE THINGS ABOUT US
// =====================================================

function renderLittleThings() {

    const mostVisited =
        document.getElementById(
            "most-visited-value"
        );


    const ellaReviews =
        document.getElementById(
            "ella-reviews-value"
        );


    const arkaReviews =
        document.getElementById(
            "arka-reviews-value"
        );


    const totalMemories =
        document.getElementById(
            "total-memories-value"
        );


    if (
        !mostVisited &&
        !ellaReviews &&
        !arkaReviews &&
        !totalMemories
    ) {

        return;

    }


    const restaurants =
        JSON.parse(
            localStorage.getItem(
                "restaurants"
            )
        ) || [];


    const reviews =
        JSON.parse(
            localStorage.getItem(
                "reviews"
            )
        ) || [];


    // =========================
    // MOST VISITED
    // =========================

    const visitCount = {};


    reviews.forEach(
        function(review) {

            const name =
                review.restaurantName;


            if (!name) {
                return;
            }


            visitCount[name] =
                (
                    visitCount[name] ||
                    0
                ) + 1;

        }
    );


    let mostVisitedName =
        "-";


    let highestVisit =
        0;


    Object.keys(
        visitCount
    ).forEach(
        function(name) {

            if (
                visitCount[name] >
                highestVisit
            ) {

                highestVisit =
                    visitCount[name];

                mostVisitedName =
                    name;

            }

        }
    );


    if (mostVisited) {

        mostVisited.textContent =
            mostVisitedName;

    }


    // =========================
    // ELLA REVIEWS
    // =========================

    const ellaCount =
        reviews.filter(
            function(review) {

                const user =
                    review.user ||
                    review.reviewer ||
                    review.user_name ||
                    "";


                return (
                    user.toLowerCase() ===
                    "ella"
                );

            }
        ).length;


    if (ellaReviews) {

        ellaReviews.textContent =
            ellaCount;

    }


    // =========================
    // ARKA REVIEWS
    // =========================

    const arkaCount =
        reviews.filter(
            function(review) {

                const user =
                    review.user ||
                    review.reviewer ||
                    review.user_name ||
                    "";


                return (
                    user.toLowerCase() ===
                    "arka"
                );

            }
        ).length;


    if (arkaReviews) {

        arkaReviews.textContent =
            arkaCount;

    }


    // =========================
    // TOTAL MEMORIES
    // =========================

    if (totalMemories) {

        totalMemories.textContent =
            reviews.length;

    }

}


// =====================================================
// DASHBOARD EXTRA FEATURES
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        renderFavoritePlaces();

        showRandomLittleNote();

        renderLittleThings();

    }
);


// =====================================================
// REFRESH DATA SETELAH PERUBAHAN
// =====================================================

function refreshDashboardSections() {

    renderFavoritePlaces();

    showRandomLittleNote();

    renderLittleThings();

    renderFoodJourney();

}


// =====================================================
// HELPER ESCAPE HTML
// =====================================================

function escapeHTML(
    value
) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================================
// BACK TO TOP
// =====================================================

function scrollToTop() {

    window.scrollTo(
        {
            top: 0,
            behavior: "smooth"
        }
    );

}


// =====================================================
// GENERIC PAGE CHECK
// =====================================================

function isDashboardPage() {

    return Boolean(
        document.getElementById(
            "food-journey-list"
        )
    );

}


function isRestaurantPage() {

    return Boolean(
        document.getElementById(
            "restaurant-detail"
        )
    );

}


function isReviewPage() {

    return Boolean(
        document.getElementById(
            "review-form"
        )
    );

}

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
            localStorage.getItem(
                "reviews"
            )
        ) || [];


    // =========================
    // TOTAL MEMORIES
    // =========================

    totalMemoryElement.textContent =
        reviews.length;


    // =========================
    // REVIEW ELLA
    // =========================

    const ellaReviews =
        reviews.filter(
            function(review) {

                const user =
                    review.user ||
                    review.reviewer ||
                    review.user_name ||
                    "";


                return (
                    user.toLowerCase() ===
                    "ella"
                );

            }
        );


    ellaCountElement.textContent =
        ellaReviews.length;


    // =========================
    // REVIEW ARKA
    // =========================

    const arkaReviews =
        reviews.filter(
            function(review) {

                const user =
                    review.user ||
                    review.reviewer ||
                    review.user_name ||
                    "";


                return (
                    user.toLowerCase() ===
                    "arka"
                );

            }
        );


    arkaCountElement.textContent =
        arkaReviews.length;


    // =========================
    // MOST VISITED
    // =========================

    const restaurantVisits =
        {};


    reviews.forEach(
        function(review) {

            const restaurant =
                review.restaurantName;


            if (!restaurant) {

                return;

            }


            if (
                !restaurantVisits[
                    restaurant
                ]
            ) {

                restaurantVisits[
                    restaurant
                ] = 0;

            }


            restaurantVisits[
                restaurant
            ]++;

        }
    );


    const visitedPlaces =
        Object.entries(
            restaurantVisits
        );


    if (
        visitedPlaces.length ===
        0
    ) {

        mostVisitedElement.textContent =
            "—";

        return;

    }


    visitedPlaces.sort(
        function(a, b) {

            return (
                b[1] -
                a[1]
            );

        }
    );


    const mostVisited =
        visitedPlaces[0][0];


    mostVisitedElement.textContent =
        mostVisited;

}


// Jalankan saat dashboard dibuka

document.addEventListener(
    "DOMContentLoaded",
    function() {

        renderLittleThings();

    }
);


// =====================================================
// RESET PASSWORD
// =====================================================

const resetPasswordForm =
    document.getElementById(
        "reset-password-form"
    );


if (resetPasswordForm) {

    resetPasswordForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const newPassword =
                document.getElementById(
                    "new-password"
                ).value;


            const confirmPassword =
                document.getElementById(
                    "confirm-password"
                ).value;


            const message =
                document.getElementById(
                    "reset-message"
                );


            if (
                newPassword !==
                confirmPassword
            ) {

                message.textContent =
                    "Password tidak sama ♡";

                return;

            }


            /*
               Pastikan Supabase tersedia
               sebelum mencoba update password.
            */

            if (
                typeof supabaseClient ===
                "undefined"
            ) {

                message.textContent =
                    "Koneksi Supabase belum tersedia ♡";

                console.error(
                    "supabaseClient tidak ditemukan."
                );

                return;

            }


            const { error } =
                await supabaseClient.auth.updateUser(
                    {
                        password:
                            newPassword
                    }
                );


            if (error) {

                message.textContent =
                    "Gagal mengubah password ♡";

                console.error(
                    error
                );

                return;

            }


            message.textContent =
                "Password berhasil diubah ♡";


            setTimeout(
                function() {

                    window.location.href =
                        "index.html";

                },
                1500
            );

        }
    );

}



// =====================================================
// SAFE SUPABASE CHECK
// =====================================================

function hasSupabaseClient() {

    return (
        typeof window.supabaseClient !==
        "undefined" &&
        window.supabaseClient !==
        null
    );

}


// =====================================================
// SAFE GET CURRENT USER
// =====================================================

async function getCurrentAuthUser() {

    if (
        !hasSupabaseClient()
    ) {

        console.warn(
            "Supabase client tidak tersedia."
        );

        return null;

    }


    try {

        const {
            data,
            error
        } =
            await window.supabaseClient.auth.getUser();


        if (error) {

            console.error(
                "Gagal mengambil user:",
                error
            );

            return null;

        }


        return (
            data &&
            data.user
        )
            ? data.user
            : null;

    } catch (error) {

        console.error(
            "Supabase error:",
            error
        );

        return null;

    }

}


// =====================================================
// SAFE LOGOUT
// =====================================================

async function safeLogout() {

    if (
        hasSupabaseClient()
    ) {

        try {

            await window.supabaseClient.auth.signOut();

        } catch (error) {

            console.error(
                "Gagal logout dari Supabase:",
                error
            );

        }

    }


    localStorage.removeItem(
        "loggedIn"
    );

    localStorage.removeItem(
        "selectedUser"
    );

    localStorage.removeItem(
        "currentRestaurant"
    );


    window.location.href =
        "index.html";

}


// =====================================================
// PROTECT SUPABASE ACTION
// =====================================================

function requireSupabase(
    message
) {

    if (
        hasSupabaseClient()
    ) {

        return true;

    }


    alert(
        message ||
        "Koneksi Supabase belum tersedia ♡"
    );


    console.error(
        "window.supabaseClient tidak ditemukan."
    );


    return false;

}


// =====================================================
// FINAL PAGE INITIALIZATION
// =====================================================

document.addEventListener(
"DOMContentLoaded",
function () {


    /*
       Dashboard
    */

    if (
        document.getElementById(
            "food-journey-list"
        )
    ) {

        renderFoodJourney();

        renderInteractiveFoodJourney();

        renderFavoritePlaces();

        showRandomLittleNote();

        renderLittleThings();

    }


    /*
       Halaman restaurant
    */

    // ======================
// RESTAURANT PAGE
// ======================

if (
    document.getElementById(
        "restaurant-detail"
    )
) {

    console.log(
        "Restaurant page loaded."
    );


    // ======================
    // GET SELECTED RESTAURANT
    // ======================

    const restaurantId =
        localStorage.getItem(
            "selectedRestaurantId"
        );


    if (!restaurantId) {

        console.error(
            "Restaurant ID tidak ditemukan."
        );

    } else {

        // ======================
        // LOAD REVIEWS
        // ======================

        loadRestaurantReviews(
            restaurantId
        );

    }

    // =========================
    // ADD REVIEW BUTTON
    // =========================

    const addReviewButton =
        document.getElementById(
            "add-review-button"
        );


    if (addReviewButton) {

        addReviewButton.addEventListener(
            "click",
            function () {

                const restaurantId =
                    localStorage.getItem(
                        "selectedRestaurantId"
                    );


                if (!restaurantId) {

                    alert(
                        "Restoran belum dipilih."
                    );

                    return;

                }


                window.location.href =
                    "review.html";

            }
        );

    }

}

    /*
       Halaman Review
    */

    if (
        document.getElementById(
            "review-form"
        )
    ) {

        console.log(
            "Review page loaded."
        );


        const reviewForm =
            document.getElementById(
                "review-form"
            );


        const reviewText =
            document.getElementById(
                "review-text"
            );


        const photoInput =
            document.getElementById(
                "review-photo"
            );


        // =========================
        // SUBMIT REVIEW
        // =========================

        reviewForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                console.log(
                    "Submit review..."
                );


                // =========================
                // CEK SUPABASE
                // =========================

                if (
                    typeof supabaseClient ===
                    "undefined"
                ) {

                    alert(
                        "Koneksi database belum tersedia ♡"
                    );

                    return;

                }


                // =========================
                // CEK RATING
                // =========================

                const rating =
                    window.selectedRating || 0;


                if (
                    rating === 0
                ) {

                    alert(
                        "Jangan lupa kasih rating dulu ♡"
                    );

                    return;

                }


                // =========================
                // CEK REVIEW
                // =========================

                const text =
                    reviewText.value.trim();


                if (!text) {

                    alert(
                        "Tulis review kamu dulu ya ♡"
                    );

                    return;

                }


                // =========================
                // USER LOGIN
                // =========================

                const {
                    data: {
                        user
                    },
                    error: userError
                } =
                    await supabaseClient
                        .auth
                        .getUser();


                if (
                    userError ||
                    !user
                ) {

                    console.error(
                        "User tidak ditemukan:",
                        userError
                    );

                    alert(
                        "Kamu harus login terlebih dahulu."
                    );

                    return;

                }


                // =========================
                // CARI RESTORAN
                // =========================

                const restaurantId =
                    localStorage.getItem(
                        "selectedRestaurantId"
                    );


                if (!restaurantId) {

                    alert(
                        "Restoran belum dipilih."
                    );

                    console.error(
                        "selectedRestaurantId tidak ditemukan."
                    );

                    return;

                }


                // =========================
                // AMBIL PROFILE
                // =========================

                const {
                    data: profile,
                    error: profileError
                } =
                    await supabaseClient
                        .from("profiles")
                        .select("name")
                        .eq(
                            "id",
                            user.id
                        )
                        .single();


                if (
                    profileError ||
                    !profile
                ) {

                    console.error(
                        "Profile error:",
                        profileError
                    );

                    alert(
                        "Data profile tidak ditemukan."
                    );

                    return;

                }


                // =========================
                // SIMPAN REVIEW
                // =========================

                const {
                    data: review,
                    error: reviewError
                } =
                    await supabaseClient
                        .from("reviews")
                        .insert({

                            restaurant_id:
                                restaurantId,

                            user_id:
                                user.id,

                            user_name:
                                profile.name,

                            rating:
                                rating,

                            review_text:
                                text

                        })
                        .select()
                        .single();


                if (
                    reviewError
                ) {

                    console.error(
                        "Gagal menyimpan review:",
                        reviewError
                    );

                    alert(
                        "Review gagal disimpan ♡"
                    );

                    return;

                }


                console.log(
                    "Review berhasil disimpan:",
                    review
                );


                // =========================
                // SIMPAN FOTO
                // =========================

                if (
                    photoInput &&
                    photoInput.files.length > 0
                ) {

                    const files =
                        Array.from(
                            photoInput.files
                        ).slice(
                            0,
                            5
                        );


                    for (
                        const file of files
                    ) {

                        try {

                            let compressed =
                                file;


                            // Compress kalau fungsi tersedia
                            if (
                                typeof compressImage ===
                                "function"
                            ) {

                                compressed =
                                    await compressImage(
                                        file
                                    );

                            }


                            const fileName =
                                user.id +
                                "/" +
                                Date.now() +
                                "-" +
                                Math.random()
                                    .toString(36)
                                    .substring(
                                        2,
                                        8
                                    ) +
                                ".jpg";


                            // =========================
                            // UPLOAD FOTO
                            // =========================

                            const {
                                error:
                                    uploadError
                            } =
                                await supabaseClient
                                    .storage
                                    .from(
                                        "review-photos"
                                    )
                                    .upload(
                                        fileName,
                                        compressed,
                                        {
                                            contentType:
                                                "image/jpeg"
                                        }
                                    );


                            if (
                                uploadError
                            ) {

                                console.error(
                                    "Foto gagal diupload:",
                                    uploadError
                                );

                                continue;

                            }


                            // =========================
                            // SIMPAN DATA FOTO
                            // =========================

                            const {
                                error:
                                    photoError
                            } =
                                await supabaseClient
                                    .from(
                                        "review_photos"
                                    )
                                    .insert({

                                        review_id:
                                            review.id,

                                        photo_url:
                                            fileName

                                    });


                            if (
                                photoError
                            ) {

                                console.error(
                                    "Data foto gagal disimpan:",
                                    photoError
                                );

                            }

                        } catch (
                            error
                        ) {

                            console.error(
                                "Error foto:",
                                error
                            );

                        }

                    }

                }


                // =========================
                // SELESAI
                // =========================

                alert(
                    "Review berhasil disimpan ♡"
                );


                window.location.href =
                    "restaurant.html";

            }
        );

    }


}); 
