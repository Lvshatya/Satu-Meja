console.log("SCRIPT.JS BERHASIL JALAN");

let selectedUser = null;

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =====================================================
// HELPER SUPABASE
// =====================================================

function hasSupabaseClient() {

    return (
        typeof window.supabaseClient !== "undefined" &&
        window.supabaseClient !== null
    );

}


async function getCurrentAuthUser() {

    if (!hasSupabaseClient()) {

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
            await window.supabaseClient
                .auth
                .getUser();


        if (error) {

            console.error(
                "Gagal mengambil user:",
                error
            );

            return null;

        }


        return data?.user || null;

    } catch (error) {

        console.error(
            "Supabase error:",
            error
        );

        return null;

    }

}


// =====================================================
// PILIH USER
// =====================================================

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


// =====================================================
// LOGIN
// =====================================================

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


            if (!hasSupabaseClient()) {

                message.textContent =
                    "Koneksi database belum tersedia ♡";

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


// =====================================================
// FORGOT PASSWORD
// =====================================================

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


            if (!hasSupabaseClient()) {

                message.textContent =
                    "Koneksi database belum tersedia ♡";

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

                console.error(
                    error
                );

                message.textContent =
                    "Gagal mengirim email reset password ♡";

                return;

            }


            message.textContent =
                "Email reset password sudah dikirim ♡";

        }
    );

}


// =====================================================
// LOAD RESTAURANTS
// =====================================================

async function loadRestaurants() {

    if (!hasSupabaseClient()) {

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


// =====================================================
// GET RESTAURANT RATING
// =====================================================

async function getRestaurantRating(
    restaurantId
) {

    if (!hasSupabaseClient()) {

        return 0;

    }


    const {
        data: reviews,
        error
    } =
        await supabaseClient
            .from("reviews")
            .select("rating")
            .eq(
                "restaurant_id",
                restaurantId
            );


    if (error) {

        console.error(
            "Gagal mengambil rating:",
            error
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
                        review.rating || 0
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


// =====================================================
// DASHBOARD
// =====================================================

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
            restaurants.length === 0
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
            const restaurant of restaurants
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
                    restaurant.id
                );


            card.innerHTML = `

                <img
                    class="restaurant-image"
                    src="${
                        restaurant.image_url ||
                        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"
                    }"
                    alt="${escapeHTML(
                        restaurant.name
                    )}"
                >

                <div class="restaurant-info">

                    <h3 class="restaurant-name">
                        ${escapeHTML(
                            restaurant.name
                        )}
                    </h3>

                    <p class="restaurant-location">
                        📍 ${
                            escapeHTML(
                                restaurant.location ||
                                "Lokasi belum ditambahkan"
                            )
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


// =====================================================
// LOAD RESTAURANT DETAIL
// =====================================================

async function loadRestaurantDetail(
    restaurantId
) {

    if (!hasSupabaseClient()) {

        console.error(
            "Supabase client tidak tersedia."
        );

        return;

    }


    console.log(
        "LOAD DETAIL RESTORAN:",
        restaurantId
    );


    const {
        data: restaurant,
        error
    } =
        await supabaseClient
            .from("restaurants")
            .select(
                "id, name, location, image_url"
            )
            .eq(
                "id",
                restaurantId
            )
            .single();


    if (
        error ||
        !restaurant
    ) {

        console.error(
            "Gagal mengambil detail restoran:",
            error
        );

        return;

    }


    console.log(
        "DETAIL RESTORAN:",
        restaurant
    );


    const detailName =
        document.getElementById(
            "detail-name"
        );


    if (detailName) {

        detailName.textContent =
            restaurant.name;

    }


    const detailLocation =
        document.getElementById(
            "detail-location"
        );


    if (detailLocation) {

        detailLocation.textContent =
            `📍 ${
                restaurant.location ||
                "Lokasi belum ditambahkan"
            }`;

    }


    const detailImage =
        document.getElementById(
            "detail-image"
        );


    if (detailImage) {

        detailImage.src =
            restaurant.image_url ||
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4";


        detailImage.alt =
            restaurant.name;

    }


    const detailRating =
        document.getElementById(
            "detail-rating"
        );


    if (detailRating) {

        const rating =
            await getRestaurantRating(
                restaurant.id
            );


        if (rating > 0) {

            detailRating.textContent =
                `⭐ ${rating}`;

        } else {

            detailRating.textContent =
                "☆ Belum ada rating";

        }

    }

}


// =====================================================
// LOAD RESTAURANT REVIEWS
// =====================================================

async function loadRestaurantReviews(
    restaurantId
) {

    console.log(
        "LOAD REVIEWS DIPANGGIL:",
        restaurantId
    );

    const reviewsContainer =
        document.getElementById(
            "saved-reviews"
        );

    if (!reviewsContainer) {
        console.error(
            "saved-reviews tidak ditemukan."
        );
        return;
    }

    if (!hasSupabaseClient()) {
        console.error(
            "Supabase belum tersedia."
        );
        return;
    }

    reviewsContainer.innerHTML =
        "<p>Memuat review...</p>";

    // ==============================
    // USER YANG SEDANG LOGIN
    // ==============================

    const {
        data: {
            user: authUser
        }
    } =
        await supabaseClient
            .auth
            .getUser();


    // ==============================
    // AMBIL REVIEW
    // ==============================

    const {
        data: reviews,
        error
    } =
        await supabaseClient
            .from("reviews")
            .select(`
                id,
                user_id,
                user_name,
                rating,
                review_text,
                created_at,
                review_photos (
                    id,
                    photo_url
                )
            `)
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

        reviewsContainer.innerHTML = `
            <div class="review-card">
                <p class="review-text">
                    Gagal memuat review.
                </p>
            </div>
        `;

        return;
    }


    console.log(
        "REVIEW YANG DITEMUKAN:",
        reviews
    );


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


    // ==============================
    // RENDER SETIAP REVIEW
    // ==============================

    for (
        const review of reviews
    ) {

        const card =
            document.createElement(
                "div"
            );

        card.className =
            "review-card";


        const rating =
            Number(
                review.rating || 0
            );

        const stars =
            "⭐".repeat(
                rating
            );


        const date =
            new Date(
                review.created_at
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


        // ==============================
        // FOTO REVIEW
        // ==============================

        let photosHTML = "";


        if (
            review.review_photos &&
            review.review_photos.length > 0
        ) {

            const photoURLs = [];


            for (
                const photo of
                review.review_photos
            ) {

                let photoURL =
                    photo.photo_url;


                if (
                    photoURL &&
                    !photoURL.startsWith(
                        "http"
                    )
                ) {

                    const {
                        data: signedData,
                        error: signedError
                    } =
                        await supabaseClient
                            .storage
                            .from(
                                "review-photos"
                            )
                            .createSignedUrl(
                                photoURL,
                                60 * 60 * 24
                            );


                    if (
                        signedError
                    ) {

                        console.error(
                            "Gagal membuat signed URL:",
                            signedError
                        );

                        continue;
                    }


                    photoURL =
                        signedData?.signedUrl;
                }


                if (photoURL) {

                    photoURLs.push(
                        photoURL
                    );

                }
            }


            if (
                photoURLs.length > 0
            ) {

                photosHTML = `
                    <div class="review-photos">
                `;


                photoURLs.forEach(
                    function(photoURL) {

                        photosHTML += `
                            <img
                                src="${escapeHTML(
                                    photoURL
                                )}"
                                class="review-photo"
                                alt="Foto review"
                                onclick="openReviewPhoto('${escapeFavoriteText(
                                    photoURL
                                )}')"
                            >
                        `;

                    }
                );


                photosHTML += `
                    </div>
                `;
            }
        }


        // ==============================
        // TOMBOL EDIT / HAPUS
        // HANYA UNTUK PEMILIK REVIEW
        // ==============================

        let reviewActions = "";


        if (
            authUser &&
            review.user_id ===
                authUser.id
        ) {

            reviewActions = `
                <div class="review-actions">

                    <button
                        type="button"
                        class="edit-review-button"
                        onclick="editReview('${review.id}')"
                    >
                        ✏️ Edit
                    </button>

                    <button
                        type="button"
                        class="delete-review-button"
                        onclick="deleteReview('${review.id}')"
                    >
                        🗑️ Hapus
                    </button>

                </div>
            `;
        }


        // ==============================
        // ISI CARD
        // ==============================

        card.innerHTML = `

            <div class="review-header">

                <div>

                    <h3>
                        ${escapeHTML(
                            review.user_name ||
                            "Someone"
                        )} ♡
                    </h3>

                    <p class="review-stars">
                        ${stars}
                    </p>

                </div>

            </div>


            <p class="review-text">
                ${escapeHTML(
                    review.review_text ||
                    ""
                )}
            </p>


            <p class="review-date">
                ${formattedDate}
            </p>


            ${photosHTML}


            ${reviewActions}

        `;


        reviewsContainer.appendChild(
            card
        );
    }
}


// =====================================================
// EDIT REVIEW
// =====================================================

window.editReview =
    async function(reviewId) {

        if (
            !hasSupabaseClient()
        ) {
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

            alert(
                "Kamu belum login ♡"
            );

            return;
        }


        // Ambil review
        const {
            data: review,
            error: reviewError
        } =
            await supabaseClient
                .from("reviews")
                .select(`
                    id,
                    user_id,
                    review_text
                `)
                .eq(
                    "id",
                    reviewId
                )
                .single();


        if (
            reviewError ||
            !review
        ) {

            console.error(
                reviewError
            );

            alert(
                "Review tidak ditemukan."
            );

            return;
        }


        // Pastikan pemilik review
        if (
            review.user_id !==
            authUser.id
        ) {

            alert(
                "Kamu hanya bisa mengedit review milikmu sendiri."
            );

            return;
        }


        const newText =
            prompt(
                "Edit review kamu:",
                review.review_text || ""
            );


        if (
            newText === null
        ) {
            return;
        }


        if (
            newText.trim() === ""
        ) {

            alert(
                "Review tidak boleh kosong."
            );

            return;
        }


        // Update Supabase
        const {
            error: updateError
        } =
            await supabaseClient
                .from("reviews")
                .update({
                    review_text:
                        newText.trim()
                })
                .eq(
                    "id",
                    reviewId
                )
                .eq(
                    "user_id",
                    authUser.id
                );


        if (updateError) {

            console.error(
                updateError
            );

            alert(
                "Review gagal diperbarui ♡"
            );

            return;
        }


        alert(
            "Review berhasil diperbarui ♡"
        );


        location.reload();
    };


// =====================================================
// HAPUS REVIEW
// =====================================================

window.deleteReview =
    async function(reviewId) {

        if (
            !hasSupabaseClient()
        ) {
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

            alert(
                "Kamu belum login ♡"
            );

            return;
        }


        // Ambil review
        const {
            data: review,
            error: reviewError
        } =
            await supabaseClient
                .from("reviews")
                .select(`
                    id,
                    user_id
                `)
                .eq(
                    "id",
                    reviewId
                )
                .single();


        if (
            reviewError ||
            !review
        ) {

            console.error(
                reviewError
            );

            alert(
                "Review tidak ditemukan."
            );

            return;
        }


        // Pastikan pemilik review
        if (
            review.user_id !==
            authUser.id
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


        if (
            !confirmation
        ) {
            return;
        }


        // ==============================
        // HAPUS FOTO DARI DATABASE
        // ==============================

        const {
            error: photoDeleteError
        } =
            await supabaseClient
                .from("review_photos")
                .delete()
                .eq(
                    "review_id",
                    reviewId
                );


        if (
            photoDeleteError
        ) {

            console.error(
                "Gagal menghapus foto review:",
                photoDeleteError
            );
        }


        // ==============================
        // HAPUS REVIEW
        // ==============================

        const {
            error: deleteError
        } =
            await supabaseClient
                .from("reviews")
                .delete()
                .eq(
                    "id",
                    reviewId
                )
                .eq(
                    "user_id",
                    authUser.id
                );


        if (deleteError) {

            console.error(
                deleteError
            );

            alert(
                "Review gagal dihapus ♡"
            );

            return;
        }


        alert(
            "Review berhasil dihapus ♡"
        );


        location.reload();
    };


// =====================================================
// RESTAURANT PAGE
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        const restaurantDetail =
            document.getElementById(
                "restaurant-detail"
            );


        if (!restaurantDetail) {

            return;

        }


        console.log(
            "Restaurant page loaded."
        );


        const restaurantId =
            localStorage.getItem(
                "selectedRestaurantId"
            );


        console.log(
            "SELECTED RESTAURANT ID:",
            restaurantId
        );


        if (!restaurantId) {

            console.error(
                "Restaurant ID tidak ditemukan."
            );

            return;

        }


        // LOAD DETAIL RESTORAN
        await loadRestaurantDetail(
            restaurantId
        );


        // LOAD REVIEW
        await loadRestaurantReviews(
            restaurantId
        );


        // TOMBOL TAMBAH REVIEW
        const addReviewButton =
            document.getElementById(
                "add-review-button"
            );


        if (addReviewButton) {

            addReviewButton.addEventListener(
                "click",
                function() {

                    const id =
                        localStorage.getItem(
                            "selectedRestaurantId"
                        );


                    if (!id) {

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


        // AKSES EDIT / HAPUS
        const actions =
            document.getElementById(
                "restaurant-actions"
            );


        if (actions) {

            const user =
                await getCurrentAuthUser();


            if (!user) {

                actions.style.display =
                    "none";

            } else {

                const {
                    data: profile,
                    error
                } =
                    await supabaseClient
                        .from("profiles")
                        .select("role")
                        .eq(
                            "id",
                            user.id
                        )
                        .single();


                if (
                    error ||
                    !profile ||
                    profile.role !== "ella"
                ) {

                    actions.style.display =
                        "none";

                }

            }

        }

    }
);


// =====================================================
// LOGOUT
// =====================================================

async function logout() {

    if (hasSupabaseClient()) {

        try {

            await supabaseClient
                .auth
                .signOut();

        } catch (error) {

            console.error(
                "Gagal logout:",
                error
            );

        }

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

    localStorage.removeItem(
        "currentRestaurant"
    );


    window.location.href =
        "index.html";

}


// =====================================================
// KE HALAMAN REVIEW
// =====================================================

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


// =====================================================
// TAMBAH RESTORAN
// =====================================================

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


// =====================================================
// FORM TAMBAH RESTORAN
// =====================================================

const restaurantForm =
    document.getElementById(
        "restaurant-form"
    );


if (restaurantForm) {

    async function checkRestaurantAccess() {

        if (!hasSupabaseClient()) {

            alert(
                "Koneksi database belum tersedia ♡"
            );

            return false;

        }


        const user =
            await getCurrentAuthUser();


        if (!user) {

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
                    user.id
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


            if (!hasSupabaseClient()) {

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


            // CEK DUPLIKAT
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
                existingRestaurants.length > 0
            ) {

                alert(
                    "Restoran dengan nama tersebut sudah ada ♡"
                );

                return;

            }


            let imageUrl =
                null;


            // UPLOAD FOTO
            if (
                imageInput &&
                imageInput.files &&
                imageInput.files.length > 0
            ) {

                const file =
                    imageInput.files[0];


                const extension =
                    file.name
                        .split(".")
                        .pop()
                        .toLowerCase();


                const fileName =
                    `${crypto.randomUUID()}.${extension}`;


                const {
                    error: uploadError
                } =
                    await supabaseClient
                        .storage
                        .from(
                            "restaurant-photos"
                        )
                        .upload(
                            fileName,
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
                    data: signedData,
                    error: signedError
                } =
                    await supabaseClient
                        .storage
                        .from(
                            "restaurant-photos"
                        )
                        .createSignedUrl(
                            fileName,
                            60 * 60 * 24 * 365
                        );


                if (!signedError) {

                    imageUrl =
                        signedData?.signedUrl ||
                        null;

                }

            }


            // SIMPAN RESTORAN
            const {
                data,
                error
            } =
                await supabaseClient
                    .from("restaurants")
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


// =====================================================
// EDIT RESTORAN
// =====================================================

async function editRestaurant() {

    if (!hasSupabaseClient()) {

        alert(
            "Koneksi database belum tersedia ♡"
        );

        return;

    }


    const user =
        await getCurrentAuthUser();


    if (!user) {

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
                user.id
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
        newName === null
    ) {

        return;

    }


    if (
        newName.trim() === ""
    ) {

        alert(
            "Nama restoran tidak boleh kosong."
        );

        return;

    }


    const newLocation =
        prompt(
            "Lokasi restoran:",
            restaurant.location || ""
        );


    if (
        newLocation === null
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


// =====================================================
// HAPUS RESTORAN
// =====================================================

async function deleteRestaurant() {

    if (!hasSupabaseClient()) {

        alert(
            "Koneksi database belum tersedia ♡"
        );

        return;

    }


    const user =
        await getCurrentAuthUser();


    if (!user) {

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
                user.id
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


// =====================================================
// TAMBAH RESTORAN - BACKUP
// =====================================================

function goToDashboard() {

    window.location.href =
        "dashboard.html";

}


// =====================================================
// FOTO / LIGHTBOX
// =====================================================

let currentPhotos = [];

let currentPhotoIndex = 0;


function openReviewPhoto(
    photoURL
) {

    currentPhotos = [
        photoURL
    ];

    currentPhotoIndex = 0;


    const lightbox =
        document.getElementById(
            "photo-lightbox"
        );


    if (!lightbox) {

        window.open(
            photoURL,
            "_blank"
        );

        return;

    }


    updateLightbox();


    lightbox.classList.add(
        "active"
    );


    document.body.style.overflow =
        "hidden";

}


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


function previousPhoto(
    event
) {

    if (event) {

        event.stopPropagation();

    }


    if (
        currentPhotos.length <= 1
    ) {

        return;

    }


    currentPhotoIndex--;


    if (
        currentPhotoIndex < 0
    ) {

        currentPhotoIndex =
            currentPhotos.length - 1;

    }


    updateLightbox();

}


function nextPhoto(
    event
) {

    if (event) {

        event.stopPropagation();

    }


    if (
        currentPhotos.length <= 1
    ) {

        return;

    }


    currentPhotoIndex++;


    if (
        currentPhotoIndex >=
        currentPhotos.length
    ) {

        currentPhotoIndex = 0;

    }


    updateLightbox();

}


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


    if (
        !currentPhotos[
            currentPhotoIndex
        ]
    ) {

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


// ========================================
// FOOD JOURNEY
// ========================================

let currentJourneyFilter = "all";

async function getFoodJourneyData() {
    if (!hasSupabaseClient()) {
        return [];
    }

    const { data, error } = await supabaseClient
        .from("reviews")
        .select(`
            id,
            user_name,
            rating,
            review_text,
            created_at,
            restaurant_id,
            restaurants (
                name,
                location,
                image_url
            )
        `)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Gagal mengambil Food Journey:", error);
        return [];
    }

    return data || [];
}

async function renderFoodJourney() {
    const container = document.getElementById("foodJourneyList");

    if (!container) {
        return;
    }

    const reviews = await getFoodJourneyData();

    renderJourneyList(reviews);
}

function renderJourneyList(reviews) {
    const container = document.getElementById("foodJourneyList");

    if (!container) {
        return;
    }

    let filteredReviews = reviews;

    if (currentJourneyFilter === "ella") {
        filteredReviews = reviews.filter(
            review => review.user_name?.toLowerCase() === "ella"
        );
    }

    if (currentJourneyFilter === "arka") {
        filteredReviews = reviews.filter(
            review => review.user_name?.toLowerCase() === "arka"
        );
    }

    if (filteredReviews.length === 0) {
        container.innerHTML = `
            <div class="journey-empty">
                <p>Belum ada cerita di sini ♡</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredReviews.map(review => {
        const restaurantName =
            review.restaurants?.name || "Restaurant";

        const location =
            review.restaurants?.location || "";

        const rating = Number(review.rating) || 0;

        const stars =
            "★".repeat(rating) +
            "☆".repeat(5 - rating);

        const date = review.created_at
            ? new Date(review.created_at).toLocaleDateString(
                "id-ID",
                {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            )
            : "";

        return `
            <div class="journey-item">

                <div class="journey-item-header">
                    <div>
                        <h3>${escapeHTML(restaurantName)}</h3>

                        ${
                            location
                                ? `<p>${escapeHTML(location)}</p>`
                                : ""
                        }
                    </div>

                    <span class="journey-user">
                        ${escapeHTML(review.user_name || "")}
                    </span>
                </div>

                <div class="journey-rating">
                    ${stars}
                </div>

                ${
                    review.review_text
                        ? `
                            <p class="journey-review">
                                ${escapeHTML(review.review_text)}
                            </p>
                        `
                        : ""
                }

                ${
                    date
                        ? `<span class="journey-date">${date}</span>`
                        : ""
                }

            </div>
        `;
    }).join("");
}


// FILTER FOOD JOURNEY

window.filterFoodJourney = async function(filter, button) {

    currentJourneyFilter = filter;

    document
        .querySelectorAll(".journey-filter-button")
        .forEach(btn => {
            btn.classList.remove("active");
        });

    if (button) {
        button.classList.add("active");
    }

    await renderFoodJourney();
};


// ========================================
// FAVORITE PLACES
// ========================================

window.renderFavoritePlaces = async function() {

    const container =
        document.getElementById("favoritePlacesList");

    if (!container) {
        return;
    }

    if (!hasSupabaseClient()) {
        container.innerHTML = `
            <div class="favorite-empty">
                <p>Supabase belum terhubung.</p>
            </div>
        `;
        return;
    }

    const { data: restaurants, error } =
        await supabaseClient
            .from("restaurants")
            .select(`
                id,
                name,
                location,
                image_url,
                reviews (
                    rating
                )
            `)
            .order("created_at", {
                ascending: false
            });

    if (error) {
        console.error(
            "Gagal mengambil Favorite Places:",
            error
        );

        container.innerHTML = `
            <div class="favorite-empty">
                <p>Gagal memuat favorite places.</p>
            </div>
        `;

        return;
    }

    if (!restaurants || restaurants.length === 0) {
        container.innerHTML = `
            <div class="favorite-empty">
                <p>Belum ada restaurant ♡</p>
            </div>
        `;

        return;
    }

    container.innerHTML = restaurants.map(restaurant => {

        const reviews = restaurant.reviews || [];

        const reviewCount = reviews.length;

        let averageRating = 0;

        if (reviewCount > 0) {
            averageRating =
                reviews.reduce(
                    (total, review) =>
                        total + Number(review.rating || 0),
                    0
                ) / reviewCount;
        }

        const stars =
            averageRating > 0
                ? "★".repeat(
                    Math.round(averageRating)
                )
                : "☆☆☆☆☆";

        return `
            <div class="favorite-card">

                <div class="favorite-image-wrapper">

                    <img
                        src="${
                            restaurant.image_url ||
                            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"
                        }"
                        alt="${escapeHTML(restaurant.name)}"
                        class="favorite-image"
                    >

                </div>

                <div class="favorite-content">

                    <h3>
                        ${escapeHTML(restaurant.name)}
                    </h3>

                    ${
                        restaurant.location
                            ? `
                                <p class="favorite-location">
                                    ${escapeHTML(
                                        restaurant.location
                                    )}
                                </p>
                            `
                            : ""
                    }

                    <div class="favorite-rating">

                        <span>
                            ${stars}
                        </span>

                        <span>
                            ${
                                averageRating > 0
                                    ? averageRating.toFixed(1)
                                    : "-"
                            }
                        </span>

                    </div>

                    <p class="favorite-review-count">
                        ${reviewCount}
                        ${
                            reviewCount === 1
                                ? " review"
                                : " reviews"
                        }
                    </p>

                </div>

            </div>
        `;

    }).join("");
};


// ========================================
// LITTLE NOTES
// ========================================

const littleNotes = [
    "Every meal becomes a little memory when we share the same table.",
    "Good food, good company, good memories.",
    "One table, two people, countless stories.",
    "Small moments, big memories.",
    "Another place, another memory to keep."
];

function showRandomLittleNote() {

    const noteElement =
        document.getElementById("littleNoteText");

    if (!noteElement) {
        return;
    }

    const randomIndex =
        Math.floor(
            Math.random() * littleNotes.length
        );

    noteElement.textContent =
        littleNotes[randomIndex];
}


// ========================================
// LITTLE THINGS ABOUT US
// ========================================

async function renderLittleThings() {

    const container =
        document.getElementById("littleThingsContent");

    if (!container) {
        return;
    }

    if (!hasSupabaseClient()) {
        return;
    }

    const { data: reviews, error } =
        await supabaseClient
            .from("reviews")
            .select(`
                id,
                user_name,
                restaurant_id,
                restaurants (
                    name
                )
            `);

    if (error) {
        console.error(
            "Gagal mengambil Little Things:",
            error
        );
        return;
    }

    const allReviews = reviews || [];

    const totalMemories =
        allReviews.length;

    const ellaReviews =
        allReviews.filter(
            review =>
                review.user_name?.toLowerCase() === "ella"
        ).length;

    const arkaReviews =
        allReviews.filter(
            review =>
                review.user_name?.toLowerCase() === "arka"
        ).length;


    // MOST VISITED

    const visitCount = {};

    allReviews.forEach(review => {

        const restaurantId =
            review.restaurant_id;

        if (!restaurantId) {
            return;
        }

        if (!visitCount[restaurantId]) {
            visitCount[restaurantId] = {
                name:
                    review.restaurants?.name ||
                    "Restaurant",
                count: 0
            };
        }

        visitCount[restaurantId].count++;

    });

    const mostVisited =
        Object.values(visitCount)
            .sort(
                (a, b) =>
                    b.count - a.count
            )
            .slice(0, 3);


    const mostVisitedHTML =
        mostVisited.length > 0
            ? mostVisited.map(place => `
                <div class="most-visited-card">

                    <h4>
                        ${escapeHTML(place.name)}
                    </h4>

                    <p>
                        ${place.count}
                        ${
                            place.count === 1
                                ? " visit"
                                : " visits"
                        }
                    </p>

                </div>
            `).join("")
            : `
                <p>
                    Belum ada restaurant yang dikunjungi.
                </p>
            `;


    container.innerHTML = `

        <div class="little-stat">

            <span class="little-stat-number">
                ${totalMemories}
            </span>

            <span class="little-stat-label">
                Memories
            </span>

        </div>


        <div class="little-stat">

            <span class="little-stat-number">
                ${ellaReviews}
            </span>

            <span class="little-stat-label">
                Ella's Reviews
            </span>

        </div>


        <div class="little-stat">

            <span class="little-stat-number">
                ${arkaReviews}
            </span>

            <span class="little-stat-label">
                Arka's Reviews
            </span>

        </div>


        <div class="most-visited-section">

            <h3>
                Most Visited
            </h3>

            <div class="most-visited-list">
                ${mostVisitedHTML}
            </div>

        </div>

    `;
}


// ========================================
// DASHBOARD LOAD
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        await renderFoodJourney();

        await window.renderFavoritePlaces();

        showRandomLittleNote();

        await renderLittleThings();

    }
);


// ========================================
// BACK TO TOP
// ========================================

const backToTopButton =
    document.getElementById("backToTop");

if (backToTopButton) {

    window.addEventListener(
        "scroll",
        function () {

            if (window.scrollY > 300) {
                backToTopButton.classList.add(
                    "show"
                );
            } else {
                backToTopButton.classList.remove(
                    "show"
                );
            }

        }
    );

    backToTopButton.addEventListener(
        "click",
        function () {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );

}


// ========================================
// RESET PASSWORD
// ========================================

async function resetPassword() {

    const email =
        prompt(
            "Masukkan email yang terdaftar:"
        );

    if (!email) {
        return;
    }

    if (!hasSupabaseClient()) {
        alert(
            "Supabase belum terhubung."
        );
        return;
    }

    const { error } =
        await supabaseClient.auth
            .resetPasswordForEmail(
                email,
                {
                    redirectTo:
                        window.location.origin +
                        "/reset-password.html"
                }
            );

    if (error) {
        alert(
            "Gagal mengirim email reset password."
        );

        console.error(error);
        return;
    }

    alert(
        "Email reset password sudah dikirim ♡"
    );
}


// ========================================
// SUPABASE SAFETY
// ========================================

function requireSupabase(message) {

    if (hasSupabaseClient()) {
        return true;
    }

    alert(
        message ||
        "Supabase belum terhubung."
    );

    return false;
}