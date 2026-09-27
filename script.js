console.log("SCRIPT.JS BERHASIL JALAN");

let selectedUser = null;


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


    reviewsContainer.innerHTML =
        "";


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


        let photosHTML =
            "";


        if (
            review.review_photos &&
            review.review_photos.length > 0
        ) {

            const photoURLs = [];


            for (
                const photo of review.review_photos
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
                                src="${escapeHTML(photoURL)}"
                                class="review-photo"
                                alt="Foto review"
                                onclick="openReviewPhoto('${escapeFavoriteText(photoURL)}')"
                            >

                        `;

                    }
                );


                photosHTML += `
                    </div>
                `;

            }

        }


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

        `;


        reviewsContainer.appendChild(
            card
        );

    }

}


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


// =====================================================
// FOOD JOURNEY
// =====================================================

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
async function renderFoodJourney() {
    const placeCount = document.getElementById("journey-place-count");
    const reviewCount = document.getElementById("journey-review-count");
    const averageRating = document.getElementById("journey-average-rating");
    const journeyList = document.getElementById("food-journey-list");

    if (!placeCount || !reviewCount || !averageRating || !journeyList) {
        return;
    }

    if (!hasSupabaseClient()) {
        console.error("Supabase client tidak tersedia.");
        return;
    }

    try {
        // Ambil semua restoran
        const { data: restaurants, error: restaurantError } =
            await supabaseClient
                .from("restaurants")
                .select("id, name");

        if (restaurantError) {
            console.error(
                "Gagal mengambil restoran untuk Food Journey:",
                restaurantError
            );
            return;
        }

        // Ambil semua review + nama restoran
        const { data: reviews, error: reviewError } =
            await supabaseClient
                .from("reviews")
                .select(`
                    id,
                    restaurant_id,
                    user_name,
                    rating,
                    review_text,
                    created_at,
                    restaurants (
                        name
                    )
                `)
                .order("created_at", {
                    ascending: false
                });

        if (reviewError) {
            console.error(
                "Gagal mengambil review untuk Food Journey:",
                reviewError
            );
            return;
        }

        const restaurantData = restaurants || [];
        const reviewData = reviews || [];

        // Jumlah tempat
        placeCount.textContent = restaurantData.length;

        // Jumlah review
        reviewCount.textContent = reviewData.length;

        // Rata-rata rating
        if (reviewData.length > 0) {
            const totalRating = reviewData.reduce(
                function (total, review) {
                    return total + Number(review.rating || 0);
                },
                0
            );

            averageRating.textContent = (
                totalRating / reviewData.length
            ).toFixed(1);
        } else {
            averageRating.textContent = "0.0";
        }

        // Belum ada review
        if (reviewData.length === 0) {
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

        // Tampilkan review terbaru dulu
        journeyList.innerHTML = reviewData
            .map(function (review) {
                const date = new Date(
                    review.created_at || Date.now()
                );

                const formattedDate =
                    date.toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    });

                const stars = "★".repeat(
                    Number(review.rating || 0)
                );

                const user =
                    review.user_name ||
                    "Someone";

                const restaurant =
                    review.restaurants?.name ||
                    "Restaurant";

                const reviewText =
                    review.review_text ||
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
                                        ${escapeHTML(restaurant)}
                                    </div>

                                    <div class="journey-user">
                                        ${escapeHTML(user)}
                                    </div>

                                </div>

                                <div class="journey-rating">
                                    ${stars}
                                </div>

                            </div>

                            <div class="journey-review">
                                ${escapeHTML(reviewText)}
                            </div>

                        </div>

                    </div>
                `;
            })
            .join("");

    } catch (error) {
        console.error(
            "Error Food Journey:",
            error
        );
    }
}


// =====================================================
// FAVORITE PLACES
// =====================================================

async function renderFavoritePlaces() {
    const container = document.getElementById(
        "favorite-places-list"
    );

    if (!container) {
        return;
    }

    if (!hasSupabaseClient()) {
        console.error("Supabase client tidak tersedia.");
        return;
    }

    try {
        // Ambil restoran
        const { data: restaurants, error: restaurantError } =
            await supabaseClient
                .from("restaurants")
                .select(`
                    id,
                    name,
                    location,
                    image_url
                `);

        if (restaurantError) {
            console.error(
                "Gagal mengambil restoran untuk Favorite Places:",
                restaurantError
            );
            return;
        }

        // Ambil semua review
        const { data: reviews, error: reviewError } =
            await supabaseClient
                .from("reviews")
                .select(`
                    id,
                    restaurant_id,
                    rating
                `);

        if (reviewError) {
            console.error(
                "Gagal mengambil review untuk Favorite Places:",
                reviewError
            );
            return;
        }

        const restaurantData = restaurants || [];
        const reviewData = reviews || [];

        if (restaurantData.length === 0) {
            container.innerHTML = `
                <div class="favorite-empty">
                    <p>Belum ada tempat favorit ♡</p>

                    <small>
                        Tambahkan review untuk mulai
                        mengumpulkan tempat favorit.
                    </small>
                </div>
            `;
            return;
        }

        // Hitung rating setiap restoran
        const favoriteRestaurants = restaurantData
            .map(function (restaurant) {

                const restaurantReviews =
                    reviewData.filter(function (review) {
                        return (
                            review.restaurant_id ===
                            restaurant.id
                        );
                    });

                const reviewCount =
                    restaurantReviews.length;

                let averageRating = 0;

                if (reviewCount > 0) {
                    const total =
                        restaurantReviews.reduce(
                            function (sum, review) {
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
                        total / reviewCount;
                }

                return {
                    ...restaurant,
                    reviewCount,
                    averageRating
                };
            })

            // Hanya tampilkan restoran yang sudah punya review
            .filter(function (restaurant) {
                return restaurant.reviewCount > 0;
            })

            // Rating tertinggi dulu
            .sort(function (a, b) {

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
            })

            // Maksimal 3 restoran
            .slice(0, 3);

        if (favoriteRestaurants.length === 0) {
            container.innerHTML = `
                <div class="favorite-empty">
                    <p>Belum ada tempat favorit ♡</p>

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
                .map(function (restaurant) {

                    const rating =
                        restaurant.averageRating.toFixed(1);

                    const stars =
                        "★".repeat(
                            Math.round(
                                restaurant.averageRating
                            )
                        );

                    return `
                        <div class="favorite-card">

                            <div class="favorite-image-wrapper">

                                <img
                                    src="${
                                        restaurant.image_url ||
                                        "https://via.placeholder.com/500x350?text=Restaurant"
                                    }"
                                    alt="${escapeHTML(
                                        restaurant.name
                                    )}"
                                    class="favorite-image"
                                >

                            </div>

                            <div class="favorite-content">

                                <h3>
                                    ${escapeHTML(
                                        restaurant.name
                                    )}
                                </h3>

                                <p class="favorite-location">
                                    ${escapeHTML(
                                        restaurant.location ||
                                        "Lokasi tidak tersedia"
                                    )}
                                </p>

                                <div class="favorite-rating">

                                    <span>
                                        ${stars}
                                    </span>

                                    <strong>
                                        ${rating}
                                    </strong>

                                </div>

                                <div class="favorite-review-count">

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
                })
                .join("");

    } catch (error) {
        console.error(
            "Error Favorite Places:",
            error
        );
    }
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
        document.getElementById(
            "little-note-text"
        );


    if (!noteText) {

        return;

    }


    const lastNote =
        localStorage.getItem(
            "lastLittleNote"
        );


    let availableNotes =
        littleNotes.filter(
            function(note) {

                return (
                    note !==
                    lastNote
                );

            }
        );


    if (
        availableNotes.length === 0
    ) {

        availableNotes =
            littleNotes;

    }


    const randomIndex =
        Math.floor(
            Math.random() *
            availableNotes.length
        );


    const selectedNote =
        availableNotes[
            randomIndex
        ];


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
        !mostVisitedElement &&
        !ellaCountElement &&
        !arkaCountElement &&
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


    if (totalMemoryElement) {

        totalMemoryElement.textContent =
            reviews.length;

    }


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


    if (ellaCountElement) {

        ellaCountElement.textContent =
            ellaReviews.length;

    }


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


    if (arkaCountElement) {

        arkaCountElement.textContent =
            arkaReviews.length;

    }


    const restaurantVisits =
        {};


    reviews.forEach(
        function(review) {

            const restaurant =
                review.restaurantName;


            if (!restaurant) {

                return;

            }


            restaurantVisits[
                restaurant
            ] =
                (
                    restaurantVisits[
                        restaurant
                    ] || 0
                ) + 1;

        }
    );


    const visitedPlaces =
        Object.entries(
            restaurantVisits
        );


    if (
        visitedPlaces.length === 0
    ) {

        if (mostVisitedElement) {

            mostVisitedElement.textContent =
                "—";

        }

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


    if (mostVisitedElement) {

        mostVisitedElement.textContent =
            visitedPlaces[0][0];

    }

}


// =====================================================
// DASHBOARD DOM READY
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        await renderFoodJourney();

        await renderFavoritePlaces();

        showRandomLittleNote();

        renderLittleThings();

    }
);

// =====================================================
// HELPER ESCAPE HTML
// =====================================================

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeFavoriteText(text) {
    return String(text)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"');
}


// =====================================================
// BACK TO TOP
// =====================================================

function scrollToTop() {

    window.scrollTo({

        top:
            0,

        behavior:
            "smooth"

    });

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


            if (!hasSupabaseClient()) {

                message.textContent =
                    "Koneksi Supabase belum tersedia ♡";

                return;

            }


            const {
                error
            } =
                await supabaseClient
                    .auth
                    .updateUser({

                        password:
                            newPassword

                    });


            if (error) {

                console.error(
                    error
                );

                message.textContent =
                    "Gagal mengubah password ♡";

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
// FINAL SAFETY HELPERS
// =====================================================

function safeLogout() {

    logout();

}


function requireSupabase(
    message
) {

    if (hasSupabaseClient()) {

        return true;

    }


    alert(
        message ||
        "Koneksi Supabase belum tersedia ♡"
    );


    return false;

    }

}