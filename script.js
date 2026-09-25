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

// FORGOT PASSWORD

// ======================

 

const forgotPasswordButton =

    document.getElementById("forgot-password-button");

 

if (forgotPasswordButton) {

 

    forgotPasswordButton.addEventListener(

        "click",

        async function() {

 

            const user =

                localStorage.getItem("selectedUser");

 

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

                await supabaseClient.auth.resetPasswordForEmail(

                    email,

                    {

                        redirectTo:

                            "http://localhost:5500/reset-password.html"

                    }

                );

 

            if (error) {

 

                message.textContent =

                    "Gagal mengirim email reset ♡";

 

                console.error(error);

 

                return;

            }

 

            message.textContent =

                "Email reset password sudah dikirim ♡";

 

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

// DATA RESTORAN - SUPABASE

// ======================

 

let savedRestaurants = [];

 

 

async function loadRestaurants() {

 

    const {

        data,

        error

    } = await supabaseClient

        .from("restaurants")

        .select("*")

        .order("created_at", {

            ascending: true

        });

 

    if (error) {

 

        console.error(

            "Gagal mengambil restoran:",

            error

        );

 

        return [];

 

    }

 

    savedRestaurants = data || [];

 

    return savedRestaurants;

}

 

 

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

 

async function getRestaurantRating(

    restaurantName

) {

 

    const {

        data: restaurant,

        error: restaurantError

    } = await supabaseClient

        .from("restaurants")

        .select("id")

        .eq("name", restaurantName)

        .single();

 

    if (restaurantError || !restaurant) {

        console.error(restaurantError);

        return 0;

    }

 

    const {

        data: reviews,

        error: reviewError

    } = await supabaseClient

        .from("reviews")

        .select("rating")

        .eq("restaurant_id", restaurant.id);

 

    if (reviewError) {

        console.error(reviewError);

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

        reviews.length;

 

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

 

 

    async function displayRestaurants(

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

                        Coba tambah restoran dulu.

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

 

 

        for (

            const restaurant

            of restaurantData

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

 

            let imageUrl =

                "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4";

 

            if (restaurant.image_url) {

                const {

                    data: signedImage,

                    error: imageError

                } = await supabaseClient

                    .storage

                    .from("restaurant-photos")

                    .createSignedUrl(

                        restaurant.image_url,

                        3600

                    );

 

                if (!imageError && signedImage) {

                    imageUrl = signedImage.signedUrl;

                }

            }

 

 

 

            card.innerHTML = `

 

                <img

                    class="restaurant-image"

                    src="${imageUrl}"

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

 

    }

 

 

    async function initializeDashboard() {

 

        const restaurants =

            await loadRestaurants();

 

        displayRestaurants(

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

 

    const {

        error

    } = await supabaseClient.auth.signOut();

 

    if (error) {

 

        console.error(error);

 

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

        "selectedRestaurantId"

    );

 

    window.location.href =

        "index.html";

 

}

 

// ======================

// TAMBAH RESTORAN

// ======================

async function addRestaurant() {

 

    const {

        data: {

            user: authUser

        }

    } = await supabaseClient.auth.getUser();

 

    if (!authUser) {

 

        alert(

            "Kamu belum login ♡"

        );

 

        window.location.href =

            "index.html";

 

        return;

 

    }

 

    const {

        data: profile,

        error

    } = await supabaseClient

        .from("profiles")

        .select("role")

        .eq("id", authUser.id)

        .single();

 

    if (

        error ||

        !profile ||

        profile.role !== "ella"

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

 

        const {

            data: {

                user: authUser

            }

        } = await supabaseClient.auth.getUser();

 

        if (!authUser) {

 

            window.location.href =

                "index.html";

 

            return false;

 

        }

 

        const {

            data: profile,

            error

        } = await supabaseClient

            .from("profiles")

            .select("role")

            .eq("id", authUser.id)

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

 

            // ======================

            // CEK DUPLIKAT

            // ======================

 

            const {

                data: existingRestaurants,

                error: duplicateError

            } = await supabaseClient

                .from("restaurants")

                .select("id, name")

                .ilike("name", name);

 

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

 

            // ======================

            // AMBIL USER LOGIN

            // ======================

 

            const {

                data: {

                    user: authUser

                }

            } =

                await supabaseClient.auth.getUser();

 

            if (!authUser) {

 

                alert(

                    "Sesi login sudah berakhir ♡"

                );

 

                return;

 

            }

 

            let imagePath = null;

 

            // ======================

            // UPLOAD FOTO

            // ======================

 

            if (

                imageInput.files.length > 0

            ) {

 

                try {

 

                    const file =

                        imageInput.files[0];

 

                    const compressedImage =

                        await compressImage(

                            file

                        );

 

                    const response =

                        await fetch(

                            compressedImage

                        );

 

                    const blob =

                        await response.blob();

 

                    const filePath =

                        `${authUser.id}/${crypto.randomUUID()}.jpg`;

 

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

                                blob,

                                {

                                    contentType:

                                        "image/jpeg",

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

 

                    imagePath =

                        filePath;

 

                } catch (error) {

 

                    console.error(

                        error

                    );

 

                    alert(

                        "Foto gagal diproses. Coba pilih foto lain ya ♡"

                    );

 

                    return;

 

                }

 

            }

 

            // ======================

            // SIMPAN RESTORAN

            // ======================

 

            const {

                error: insertError

            } =

                await supabaseClient

                    .from("restaurants")

                    .insert({

                        name:

                            name,

                        location:

                            location,

                        image_url:

                            imagePath

                    });

 

            if (insertError) {

 

                console.error(

                    insertError

                );

 

                // Kalau database gagal,

                // hapus foto yang tadi terlanjur diupload.

 

                if (imagePath) {

 

                    await supabaseClient

                        .storage

                        .from(

                            "restaurant-photos"

                        )

                        .remove([

                            imagePath

                        ]);

 

                }

 

                alert(

                    "Restoran gagal ditambahkan ♡"

                );

 

                return;

 

            }

 

            alert(

                "Restoran berhasil ditambahkan ♡"

            );

 

            window.location.href =

                "dashboard.html";

 

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

 

    async function loadRestaurantDetail() {

 

        const restaurantId =

            localStorage.getItem(

                "selectedRestaurantId"

            );

 

        if (!restaurantId) {

 

            window.location.href =

                "dashboard.html";

 

            return;

 

        }

 

 

        const {

            data: restaurant,

            error

        } = await supabaseClient

            .from("restaurants")

            .select("*")

            .eq("id", restaurantId)

            .single();

 

 

        if (

            error ||

            !restaurant

        ) {

 

            console.error(error);

 

            alert(

                "Restoran tidak ditemukan ♡"

            );

 

            window.location.href =

                "dashboard.html";

 

            return;

 

        }

 

 

        document.getElementById(

            "detail-name"

        ).textContent =

            restaurant.name;

 

 

        document.getElementById(

            "detail-location"

        ).textContent =

            `📍 ${restaurant.location}`;

 

 

        const overallRating =

            await getRestaurantRating(

                restaurant.name

            );

 

 

        document.getElementById(

            "detail-rating"

        ).textContent =

            overallRating > 0

                ? `⭐ ${overallRating}`

                : "☆ Belum ada rating";

 

 

        let imageUrl =

            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4";

 

 

        if (restaurant.image_url) {

 

            const {

                data: signedData,

                error: signedError

            } =

                await supabaseClient

                    .storage

                    .from("restaurant-photos")

                    .createSignedUrl(

                        restaurant.image_url,

                        3600

                    );

 

 

            if (

                !signedError &&

                signedData

            ) {

 

                imageUrl =

                    signedData.signedUrl;

 

            }

 

        }

 

 

        document.getElementById(

            "detail-image"

        ).src =

            imageUrl;

 

 

        const {

            data: {

                user: authUser

            }

        } =

            await supabaseClient.auth.getUser();

 

 

        if (!authUser) {

 

            document.getElementById(

                "add-review-button"

            ).style.display =

                "none";

 

            document.getElementById(

                "restaurant-actions"

            ).style.display =

                "none";

 

            return;

 

        }

 

 

        const {

            data: profile,

            error: profileError

        } =

            await supabaseClient

                .from("profiles")

                .select("role")

                .eq("id", authUser.id)

                .single();

 

 

        if (

            profileError ||

            !profile

        ) {

 

            document.getElementById(

                "add-review-button"

            ).style.display =

                "none";

 

            document.getElementById(

                "restaurant-actions"

            ).style.display =

                "none";

 

            return;

 

        }

 

 

        // Hanya Ella yang boleh

        // menambah / mengedit / menghapus restoran

 

        if (profile.role !== "ella") {

 

            document.getElementById(

                "restaurant-actions"

            ).style.display =

                "none";

 

        }

 

    }

 

 

    loadRestaurantDetail();

 

}

 

 

// ======================

// EDIT RESTORAN

// ======================

 

async function editRestaurant() {

 

    // Cek user yang sedang login

    const {

        data: {

            user: authUser

        }

    } =

        await supabaseClient.auth.getUser();

 

 

    if (!authUser) {

 

        alert(

            "Kamu belum login ♡"

        );

 

        window.location.href =

            "index.html";

 

        return;

 

    }

 

 

    // Cek role user

    const {

        data: profile,

        error: profileError

    } =

        await supabaseClient

            .from("profiles")

            .select("role")

            .eq("id", authUser.id)

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

 

 

    // Ambil ID restoran yang sedang dibuka

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

 

 

    // Ambil data restoran dari Supabase

    const {

        data: restaurant,

        error: restaurantError

    } =

        await supabaseClient

            .from("restaurants")

            .select("*")

            .eq("id", restaurantId)

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

 

 

    // Edit nama

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

 

 

    // Edit lokasi

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

 

 

    const cleanName =

        newName.trim();

 

    const cleanLocation =

        newLocation.trim();

 

 

    // Cek nama restoran duplikat

    const {

        data: duplicateRestaurants,

        error: duplicateError

    } =

        await supabaseClient

            .from("restaurants")

            .select("id, name")

            .ilike(

                "name",

                cleanName

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

 

 

    const duplicate =

        duplicateRestaurants.some(

            function(item) {

 

                return (

                    item.id !==

                    restaurantId

                );

 

            }

        );

 

 

    if (duplicate) {

 

        alert(

            "Nama restoran tersebut sudah digunakan."

        );

 

        return;

 

    }

 

 

    // Update restoran di Supabase

    const {

        error: updateError

    } =

        await supabaseClient

            .from("restaurants")

            .update({

                name: cleanName,

                location: cleanLocation

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

 

 

    location.reload();

 

}

 

 

// ======================

// HAPUS RESTORAN

// ======================

 

async function deleteRestaurant() {

 

    const {

        data: {

            user: authUser

        }

    } =

        await supabaseClient.auth.getUser();

 

 

    if (!authUser) {

 

        alert(

            "Kamu belum login ♡"

        );

 

        window.location.href =

            "index.html";

 

        return;

 

    }

 

 

    // Cek role

    const {

        data: profile,

        error: profileError

    } =

        await supabaseClient

            .from("profiles")

            .select("role")

            .eq("id", authUser.id)

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

 

 

    // Ambil ID restoran

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

 

 

    // Ambil data restoran

    const {

        data: restaurant,

        error: restaurantError

    } =

        await supabaseClient

            .from("restaurants")

            .select("*")

            .eq("id", restaurantId)

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

 

 

    // Hapus restoran

    // Review ikut terhapus karena

    // restaurant_id memiliki ON DELETE CASCADE

 

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

 

 

    alert(

        "Restoran berhasil dihapus."

    );

 

 

    window.location.href =

        "dashboard.html";

 

}

 

 

// ======================

// TAMBAH REVIEW

// ======================

 

async function addReview() {

 

    const {

        data: {

            user: authUser

        }

    } =

        await supabaseClient.auth.getUser();

 

 

    if (!authUser) {

 

        alert(

            "Kamu belum login ♡"

        );

 

        window.location.href =

            "index.html";

 

        return;

 

    }

 

 

    // Cek role

    const {

        data: profile,

        error

    } =

        await supabaseClient

            .from("profiles")

            .select("role")

            .eq("id", authUser.id)

            .single();

 

 

    if (

        error ||

        !profile

    ) {

 

        alert(

            "Profil user tidak ditemukan ♡"

        );

 

        return;

 

    }

 

 

    if (

        profile.role !== "ella" &&

        profile.role !== "arka"

    ) {

 

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

 

let selectedRating = 0;

 

 

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

 

    let currentUser = null;

    let currentProfile = null;

    let currentRestaurant = null;

 

 

    async function initializeReviewPage() {

 

        // ======================

        // CEK LOGIN

        // ======================

 

        const {

            data: {

                user: authUser

            }

        } =

            await supabaseClient.auth.getUser();

 

 

        if (!authUser) {

 

            window.location.href =

                "index.html";

 

            return;

 

        }

 

 

        currentUser =

            authUser;

 

 

        // ======================

        // AMBIL PROFILE

        // ======================

 

        const {

            data: profile,

            error: profileError

        } =

            await supabaseClient

                .from("profiles")

                .select("*")

                .eq("id", authUser.id)

                .single();

 

 

        if (

            profileError ||

            !profile

        ) {

 

            alert(

                "Profil user tidak ditemukan ♡"

            );

 

            window.location.href =

                "dashboard.html";

 

            return;

 

        }

 

 

        currentProfile =

            profile;

 

 

        // ======================

        // CEK AKSES

        // ======================

 

        if (

            profile.role !== "ella" &&

            profile.role !== "arka"

        ) {

 

            alert(

                "Tamu hanya bisa melihat review ♡"

            );

 

            window.location.href =

                "restaurant.html";

 

            return;

 

        }

 

 

        // ======================

        // AMBIL RESTORAN

        // ======================

 

        const restaurantId =

            localStorage.getItem(

                "selectedRestaurantId"

            );

 

 

        if (!restaurantId) {

 

            alert(

                "Restoran tidak ditemukan."

            );

 

            window.location.href =

                "dashboard.html";

 

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

 

            window.location.href =

                "dashboard.html";

 

            return;

 

        }

 

 

        currentRestaurant =

            restaurant;

 

 

        document.getElementById(

            "review-restaurant"

        ).textContent =

            restaurant.name;

 

    }

 

 

    initializeReviewPage();

 

 

    // ======================

    // SUBMIT REVIEW

    // ======================

 

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

 

 

            if (!reviewText) {

 

                alert(

                    "Tulis review dulu ya ♡"

                );

 

                return;

 

            }

 

 

            const photoInput =

                document.getElementById(

                    "review-photo"

                );

 

 

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

 

 

            if (

                !currentUser ||

                !currentProfile ||

                !currentRestaurant

            ) {

 

                alert(

                    "Data review belum siap. Coba refresh halaman ♡"

                );

 

                return;

 

            }

 

 

            try {

 

                // ======================

                // SIMPAN REVIEW

                // ======================

 

                const {

                    data: newReview,

                    error: reviewError

                } =

                    await supabaseClient

                        .from("reviews")

                        .insert({

                            restaurant_id:

                                currentRestaurant.id,

 

                            user_id:

                                currentUser.id,

 

                            user_name:

                                currentProfile.name,

 

                            rating:

                                selectedRating,

 

                            review_text:

                                reviewText

                        })

                        .select()

                        .single();

 

 

                if (reviewError) {

 

                    console.error(

                        reviewError

                    );

 

                    alert(

                        "Review gagal disimpan ♡"

                    );

 

                    return;

 

                }

 

 

                // ======================

                // UPLOAD FOTO

                // ======================

 

                for (

                    const file

                    of files

                ) {

 

                    const compressedImage =

                        await compressImage(

                            file

                        );

 

 

                    const response =

                        await fetch(

                            compressedImage

                        );

 

 

                    const blob =

                        await response.blob();

 

 

                    const filePath =

                        `${currentUser.id}/${newReview.id}/${crypto.randomUUID()}.jpg`;

 

 

                    const {

                        error: uploadError

                    } =

                        await supabaseClient

                            .storage

                            .from(

                                "review-photos"

                            )

                            .upload(

                                filePath,

                                blob,

                                {

                                    contentType:

                                        "image/jpeg",

 

                                    upsert:

                                        false

                                }

                            );

 

 

                    if (uploadError) {

 

                        console.error(

                            uploadError

                        );

 

                        continue;

 

                    }

 

 

                    // ======================

                    // SIMPAN PATH FOTO

                    // ======================

 

                    const {

                        error: photoError

                    } =

                        await supabaseClient

                            .from(

                                "review_photos"

                            )

                            .insert({

                                review_id:

                                    newReview.id,

 

                                photo_url:

                                    filePath

                            });

 

 

                    if (photoError) {

 

                        console.error(

                            photoError

                        );

 

                        // Kalau row foto gagal,

                        // hapus file dari Storage

 

                        await supabaseClient

                            .storage

                            .from(

                                "review-photos"

                            )

                            .remove([

                                filePath

                            ]);

 

                    }

 

                }

 

 

                alert(

                    "Review berhasil disimpan ♡"

                );

 

 

                // Kembali ke halaman restoran

                window.location.href =

                    "restaurant.html";

 

            } catch (error) {

 

                console.error(

                    error

                );

 

                alert(

                    "Ada yang gagal diproses. Coba lagi ya ♡"

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

 

    async function loadReviews() {

 

        const restaurantId =

            localStorage.getItem(

                "selectedRestaurantId"

            );

 

 

        if (!restaurantId) {

            return;

        }

 

 

        // ======================

        // CEK USER LOGIN

        // ======================

 

        const {

            data: {

                user: authUser

            }

        } =

            await supabaseClient.auth.getUser();

 

 

        // ======================

        // AMBIL REVIEW

        // ======================

 

        const {

            data: reviews,

            error: reviewError

        } =

            await supabaseClient

                .from("reviews")

                .select("*")

                .eq(

                    "restaurant_id",

                    restaurantId

                )

                .order(

                    "created_at",

                    {

                        ascending: true

                    }

                );

 

 

        if (reviewError) {

 

            console.error(

                reviewError

            );

 

            return;

 

        }

 

 

        // ======================

        // AMBIL PROFILE USER

        // ======================

 

        let currentUserName = null;

 

 

        if (authUser) {

 

            const {

                data: profile

            } =

                await supabaseClient

                    .from("profiles")

                    .select("name")

                    .eq(

                        "id",

                        authUser.id

                    )

                    .single();

 

 

            if (profile) {

 

                currentUserName =

                    profile.name;

 

            }

 

        }

 

 

        // ======================

        // TAMPILKAN REVIEW

        // ======================

 

        for (

            const review

            of reviews

        ) {

 

            const reviewCard =

                document.createElement(

                    "div"

                );

 

 

            reviewCard.className =

                "review-card";

 

 

            const isOwner =

                authUser &&

                review.user_id ===

                    authUser.id;

 

 

            // ======================

            // AMBIL FOTO REVIEW

            // ======================

 

            const {

                data: photoRows,

                error: photoError

            } =

                await supabaseClient

                    .from("review_photos")

                    .select("photo_url")

                    .eq(

                        "review_id",

                        review.id

                    );

 

 

            let photos = [];

 

 

            if (

                !photoError &&

                photoRows

            ) {

 

                for (

                    const photo

                    of photoRows

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

                                photo.photo_url,

                                3600

                            );

 

 

                    if (

                        !signedError &&

                        signedData

                    ) {

 

                        photos.push(

                            signedData.signedUrl

                        );

 

                    }

 

                }

 

            }

 

 

            // ======================

            // HTML FOTO

            // ======================

 

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

 

 

            // ======================

            // HTML REVIEW

            // ======================

 

            reviewCard.innerHTML = `

 

                <div class="review-header">

 

                    <div>

 

                        <h3>

                            ${review.user_name} ♡

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

                    ${review.review_text}

                </p>

 

 

                ${photoHTML}

 

 

                ${

                    isOwner

                        ? `

                            <div class="review-actions">

 

                                <button

                                    class="edit-review-button"

                                    onclick="editReview('${review.id}')"

                                >

                                    ✏️ Edit

                                </button>

 

                                <button

                                    class="delete-review-button"

                                    onclick="deleteReview('${review.id}')"

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

 

 

            // ======================

            // FOTO BISA DIKLIK

            // ======================

 

            const galleryImages =

                reviewCard.querySelectorAll(

                    ".review-photo-gallery img"

                );

 

 

            galleryImages.forEach(

                function(

                    img,

                    index

                ) {

 

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

 

 

        // ======================

        // HILANGKAN DUMMY ELLA

        // JIKA SUDAH ADA REVIEW

        // ======================

 

        const hasEllaReview =

            reviews.some(

                function(review) {

 

                    return (

                        review.user_name ===

                        "Ella"

                    );

 

                }

            );

 

 

        const hasArkaReview =

            reviews.some(

                function(review) {

 

                    return (

                        review.user_name ===

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

 

 

    loadReviews();

 

}

 

 

// ======================

// EDIT REVIEW

// ======================

 

async function editReview(reviewId) {

 

    // Cek user yang sedang login

    const {

        data: { user: authUser }

    } = await supabaseClient.auth.getUser();

 

    if (!authUser) {

        alert("Kamu belum login ♡");

        window.location.href = "index.html";

        return;

    }

 

 

    // Ambil review berdasarkan ID

    const {

        data: review,

        error: reviewError

    } = await supabaseClient

        .from("reviews")

        .select("*")

        .eq("id", reviewId)

        .single();

 

 

    if (reviewError || !review) {

 

        console.error(reviewError);

 

        alert(

            "Review tidak ditemukan."

        );

 

        return;

    }

 

 

    // Pastikan review milik user yang sedang login

    if (

        review.user_id !==

        authUser.id

    ) {

 

        alert(

            "Kamu hanya bisa mengedit review milikmu sendiri."

        );

 

        return;

    }

 

 

    // Minta teks review baru

    const newText =

        prompt(

            "Edit review kamu:",

            review.review_text

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

 

 

    // Update review di Supabase

    const {

        error: updateError

    } = await supabaseClient

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

 

}

 

 

// ======================

// HAPUS REVIEW

// ======================

 

async function deleteReview(reviewId) {

 

    // Cek user yang sedang login

    const {

        data: { user: authUser }

    } = await supabaseClient.auth.getUser();

 

    if (!authUser) {

        alert("Kamu belum login ♡");

        window.location.href = "index.html";

        return;

    }

 

 

    // Ambil review

    const {

        data: review,

        error: reviewError

    } = await supabaseClient

        .from("reviews")

        .select("*")

        .eq("id", reviewId)

        .single();

 

 

    if (reviewError || !review) {

 

        console.error(reviewError);

 

        alert(

            "Review tidak ditemukan."

        );

 

        return;

    }

 

 

    // Pastikan review milik user yang sedang login

    if (

        review.user_id !==

        authUser.id

    ) {

 

        alert(

            "Kamu hanya bisa menghapus review milikmu sendiri."

        );

 

        return;

    }

 

 

    // Konfirmasi

    const confirmation =

        confirm(

            "Yakin mau menghapus review ini?"

        );

 

 

    if (!confirmation) {

 

        return;

    }

 

 

    // Hapus foto review dari database

    const {

        data: photoRows,

        error: photoFetchError

    } = await supabaseClient

        .from("review_photos")

        .select("photo_url")

        .eq(

            "review_id",

            reviewId

        );

 

 

    if (photoFetchError) {

 

        console.error(

            photoFetchError

        );

    }

 

 

    // Hapus file foto dari Storage

    if (

        photoRows &&

        photoRows.length > 0

    ) {

 

        const photoPaths =

            photoRows

                .map(

                    function(photo) {

                        return photo.photo_url;

                    }

                )

                .filter(Boolean);

 

 

        if (

            photoPaths.length > 0

        ) {

 

            const {

                error: storageError

            } = await supabaseClient

                .storage

                .from("review-photos")

                .remove(

                    photoPaths

                );

 

 

            if (storageError) {

 

                console.error(

                    storageError

                );

            }

        }

    }

 

 

    // Hapus data foto dari database

    const {

        error: photoDeleteError

    } = await supabaseClient

        .from("review_photos")

        .delete()

        .eq(

            "review_id",

            reviewId

        );

 

 

    if (photoDeleteError) {

 

        console.error(

            photoDeleteError

        );

    }

 

 

    // Hapus review

    const {

        error: deleteError

    } = await supabaseClient

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

 

/* =====================================================

   INTERACTIVE FOOD JOURNEY

===================================================== */

 

let currentJourneyFilter = "all";

 

 

function filterFoodJourney(

    filter,

    button

) {

 

    currentJourneyFilter =

        filter;

 

 

    /* Ubah tombol aktif */

 

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

 

 

 

async function renderInteractiveFoodJourney() {

 

    const journeyList =

        document.getElementById(

            "food-journey-list"

        );

 

 

    if (!journeyList) {

        return;

    }

 

    const placeCount =

        document.getElementById("journey-place-count");

    const reviewCount =

        document.getElementById("journey-review-count");

    const averageRating =

        document.getElementById("journey-average-rating");

 

 

 

    /* =========================

       AMBIL REVIEWS SUPABASE

    ========================= */

 

    const {

        data: reviews,

        error: reviewError

    } = await supabaseClient

        .from("reviews")

        .select(`

            id,

            restaurant_id,

            user_name,

            rating,

            review_text,

            created_at

        `)

        .order("created_at", {

            ascending: false

        });

 

 

    if (reviewError) {

 

        console.error(

            "Gagal mengambil reviews:",

            reviewError

        );

 

        return;

    }

 

 

    /* =========================

       AMBIL RESTAURANTS

    ========================= */

 

    const {

        data: restaurants,

        error: restaurantError

    } = await supabaseClient

        .from("restaurants")

        .select("id, name");

 

 

    if (restaurantError) {

 

        console.error(

            "Gagal mengambil restaurants:",

            restaurantError

        );

 

        return;

    }

 

 

    if (placeCount) {

        placeCount.textContent = restaurants.length;

    }

 

    if (reviewCount) {

        reviewCount.textContent = reviews.length;

    }

 

    if (averageRating) {

        if (reviews.length === 0) {

            averageRating.textContent = "0.0";

        } else {

            const totalRating = reviews.reduce(

                function(total, review) {

                    return total + Number(review.rating || 0);

                },

                0

            );

            averageRating.textContent =

                (totalRating / reviews.length).toFixed(1);

        }

    }

 

    /* =========================

       GABUNGKAN DATA

    ========================= */

 

    let journeyReviews =

        reviews.map(function(review) {

 

            const restaurant =

                restaurants.find(

                    function(item) {

 

                        return (

                            item.id ===

                            review.restaurant_id

                        );

 

                    }

                );

 

 

            return {

                ...review,

 

                restaurantName:

                    restaurant

                        ? restaurant.name

                        : "Restaurant"

            };

 

        });

 

 

    /* =========================

       FILTER USER

    ========================= */

 

    if (

        currentJourneyFilter !==

        "all"

    ) {

 

        journeyReviews =

            journeyReviews.filter(

                function(review) {

 

                    const user =

                        review.user_name ||

                        "";

 

                    return (

                        user.toLowerCase() ===

                        currentJourneyFilter.toLowerCase()

                    );

 

                }

            );

 

    }

 

 

    /* =========================

       TIDAK ADA HASIL

    ========================= */

 

    if (

        journeyReviews.length === 0

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

 

 

    /* =========================

       RENDER JOURNEY

    ========================= */

 

    journeyList.innerHTML =

        journeyReviews

            .map(function(review) {

 

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

 

 

                const rating =

                    Number(

                        review.rating || 0

                    );

 

 

                const stars =

                    "★".repeat(rating);

 

 

                const user =

                    review.user_name ||

                    "Someone";

 

 

                const restaurant =

                    review.restaurantName ||

                    "Restaurant";

 

 

                const reviewText =

                    review.review_text ||

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

                            onclick="openJourneyRestaurant('${review.restaurant_id}')"

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

 

            })

            .join("");

}

 

 

 

async function openJourneyRestaurant(restaurantId) {

 

    if (!restaurantId) {

        alert("Restoran ini sudah tidak tersedia.");

        return;

    }

 

    const { data: restaurant, error } =

        await supabaseClient

            .from("restaurants")

            .select("id")

            .eq("id", restaurantId)

            .single();

 

    if (error || !restaurant) {

        console.error(error);

        alert("Restoran ini sudah tidak tersedia.");

        return;

    }

 

    localStorage.setItem(

        "selectedRestaurantId",

        restaurant.id

    );

 

    window.location.href = "restaurant.html";

}

 

 

/* Jalankan versi interaktif

   setelah halaman selesai dimuat */

 

document.addEventListener(

    "DOMContentLoaded",

    function() {

 

        renderInteractiveFoodJourney();

 

    }

);

 

/* =====================================================

   OUR FAVORITE PLACES

===================================================== */

 

async function renderFavoritePlaces() {

 

    const favoriteList =

        document.getElementById("favorite-places-list");

    const favoriteCount =

        document.getElementById("favorite-place-count");

 

    if (!favoriteList) return;

 

    const { data: restaurants, error: restaurantError } =

        await supabaseClient

            .from("restaurants")

            .select("id, name, location, image_url");

 

    if (restaurantError) {

        console.error("Gagal mengambil restaurants:", restaurantError);

        return;

    }

 

    const { data: reviews, error: reviewError } =

        await supabaseClient

            .from("reviews")

            .select("id, restaurant_id, rating");

 

    if (reviewError) {

        console.error("Gagal mengambil reviews:", reviewError);

        return;

    }

 

    const restaurantData = restaurants.map(function(restaurant) {

        const restaurantReviews = reviews.filter(function(review) {

            return review.restaurant_id === restaurant.id;

        });

 

        const total = restaurantReviews.reduce(

            function(sum, review) {

                return sum + Number(review.rating || 0);

            },

            0

        );

 

        return {

            restaurant: restaurant,

            rating: restaurantReviews.length > 0

                ? total / restaurantReviews.length

                : 0,

            reviewCount: restaurantReviews.length

        };

    });

 

    restaurantData.sort(function(a, b) {

        if (b.rating !== a.rating) return b.rating - a.rating;

        return b.reviewCount - a.reviewCount;

    });

 

    const favorites = restaurantData

        .filter(function(item) { return item.reviewCount > 0; })

        .slice(0, 3);

 

    if (favoriteCount) {

        favoriteCount.textContent =

            favorites.length +

            (favorites.length === 1 ? " place" : " places");

    }

 

    if (favorites.length === 0) {

        favoriteList.innerHTML = `

            <div class="favorite-place-empty">

                <p>Belum ada favorite place ♡</p>

                <small>Kasih review dulu untuk mulai menemukan tempat favorit kalian.</small>

            </div>

        `;

        return;

    }

 

    const favoriteCards = await Promise.all(

        favorites.map(async function(item, index) {

            const restaurant = item.restaurant;

            const location = restaurant.location || "Lokasi belum ditambahkan";

            let image = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4";

 

            if (restaurant.image_url) {

                const { data: signedImage, error: imageError } =

                    await supabaseClient

                        .storage

                        .from("restaurant-photos")

                        .createSignedUrl(restaurant.image_url, 3600);

                if (!imageError && signedImage) {

                    image = signedImage.signedUrl;

                }

            }

 

            const stars = "★".repeat(Math.round(item.rating));

 

            return `

                <div

                    class="favorite-place-card"

                    onclick="openFavoritePlace('${restaurant.id}')"

                >

                    <img class="favorite-place-image" src="${image}" alt="${restaurant.name}">

                    <div class="favorite-place-content">

                        <div class="favorite-place-rank">FAVORITE #${index + 1}</div>

                        <div class="favorite-place-name">${restaurant.name}</div>

                        <div class="favorite-place-location">${location}</div>

                        <div class="favorite-place-rating">

                            <span class="favorite-place-stars">${stars}</span>

                            <span class="favorite-place-score">${item.rating.toFixed(1)}</span>

                        </div>

                        <div class="favorite-place-reviews">

                            ${item.reviewCount} ${item.reviewCount === 1 ? "review" : "reviews"}

                        </div>

                    </div>

                </div>

            `;

        })

    );

 

    favoriteList.innerHTML = favoriteCards.join("");

}

 

 

async function openFavoritePlace(restaurantId) {

 

    if (!restaurantId) {

        alert("Restoran ini sudah tidak tersedia.");

        return;

    }

 

    const { data: restaurant, error } =

        await supabaseClient

            .from("restaurants")

            .select("id")

            .eq("id", restaurantId)

            .single();

 

    if (error || !restaurant) {

        console.error(error);

        alert("Restoran ini sudah tidak tersedia.");

        return;

    }

 

    localStorage.setItem(

        "selectedRestaurantId",

        restaurant.id

    );

 

    window.location.href = "restaurant.html";

}

 

 

/* Jalankan saat dashboard dibuka */

 

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

 

async function renderLittleThings() {

 

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

 

 

    /* =========================

       AMBIL REVIEWS SUPABASE

    ========================= */

 

    const {

        data: reviews,

        error: reviewError

    } = await supabaseClient

        .from("reviews")

        .select(`

            id,

            restaurant_id,

            user_name

        `);

 

 

    if (reviewError) {

 

        console.error(

            "Gagal mengambil reviews:",

            reviewError

        );

 

        return;

    }

 

 

    /* =========================

       TOTAL MEMORIES

    ========================= */

 

    totalMemoryElement.textContent =

        reviews.length;

 

 

    /* =========================

       REVIEW ELLA

    ========================= */

 

    const ellaReviews =

        reviews.filter(

            function(review) {

 

                const user =

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

 

 

    /* =========================

       REVIEW ARKA

    ========================= */

 

    const arkaReviews =

        reviews.filter(

            function(review) {

 

                const user =

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

 

 

    /* =========================

       CARI RESTAURANT

       PALING SERING DIREVIEW

    ========================= */

 

    const restaurantVisits = {};

 

 

    reviews.forEach(

        function(review) {

 

            const restaurantId =

                review.restaurant_id;

 

 

            if (!restaurantId) {

                return;

            }

 

 

            if (

                !restaurantVisits[

                    restaurantId

                ]

            ) {

 

                restaurantVisits[

                    restaurantId

                ] = 0;

 

            }

 

 

            restaurantVisits[

                restaurantId

            ]++;

 

        }

    );

 

 

    const visitedPlaces =

        Object.entries(

            restaurantVisits

        );

 

 

    /* =========================

       BELUM ADA REVIEW

    ========================= */

 

    if (

        visitedPlaces.length === 0

    ) {

 

        mostVisitedElement.textContent =

            "—";

 

        return;

    }

 

 

    /* =========================

       URUTKAN

    ========================= */

 

    visitedPlaces.sort(

        function(a, b) {

 

            return (

                b[1] -

                a[1]

            );

 

        }

    );

 

 

    const mostVisitedId =

        visitedPlaces[0][0];

 

 

    /* =========================

       AMBIL NAMA RESTAURANT

    ========================= */

 

    const {

        data: mostVisitedRestaurant,

        error: restaurantError

    } = await supabaseClient

        .from("restaurants")

        .select("name")

        .eq("id", mostVisitedId)

        .single();

 

 

    if (

        restaurantError ||

        !mostVisitedRestaurant

    ) {

 

        mostVisitedElement.textContent =

            "—";

 

        return;

    }

 

 

    mostVisitedElement.textContent =

        mostVisitedRestaurant.name;

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