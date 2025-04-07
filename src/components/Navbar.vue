<template>
    <section class=" relative h-screen bg-white py-10">
        <div class="flex items-center">
            <h1 class="font-semibold px-8">T1A</h1>
            <div class="adminlogo flex bg-red-500 rounded-full px-2 text-[14px]">Administrator</div>
        </div>
        <div class="mt-12">
            <ul>
                <router-link to="/">
                    <div>
                        <i class="fa-solid fa-house"></i>
                        <li>Home</li>
                    </div>
                </router-link>
                <router-link to="/projects">
                    <div>
                        <i class="fa-solid fa-diagram-project"></i>
                        <li>Projects</li>
                    </div>
                </router-link>
                <router-link to="/about-us">
                    <div>
                        <i class="fa-solid fa-eject"></i>
                        <li>About</li>
                    </div>
                </router-link>
                <router-link to="/contact">
                    <div>
                        <i class="fa-solid fa-headset"></i>
                        <li>Contact</li>
                    </div>
                </router-link>
                <router-link to="/feedback">
                    <div>
                        <i class="fa-solid fa-comment"></i>
                        <li>Feedback</li>
                    </div>
                </router-link>
                <router-link to="/customer">
                    <div>
                        <i class="fa-solid fa-comment"></i>
                        <li>Customer</li>
                    </div>
                </router-link>
            </ul>
        </div>

        <div
            class="absolute bottom-0 right-0 left-0 border-t border-solid h-16 mx-4 flex justify-between items-center bg-white">
            <div class="flex">
                <div class="bg-blue-300 rounded-full mr-2">
                    <img class="h-10 w-10" src="../assets/images/admin.png" alt="">
                </div>
                <div>
                    <p class="text-sm">Trung Lê</p>
                    <p class="text-[12px]">Administrator</p>
                </div>
            </div>
            <div>
                <i class="fa-brands fa-windows"></i>
            </div>
        </div>
    </section>
</template>

<style scoped>
.router-link-exact-active,
.router-link-active li,
.router-link-active i {
    color: rgb(0, 164, 240);

    div {
        background: #e5f6fe;
    }
}

.adminlogo {
    color: white;
    background: #2980B9;
    background: -webkit-linear-gradient(to left, #FFFFFF, #6DD5FA, #2980B9);
    background: linear-gradient(to left, #FFFFFF, #6DD5FA, #2980B9);
}



ul div {
    display: flex;
    align-items: center;
    margin: 0.3rem 1rem;
    border-radius: 8px;
}

ul {
    div {
        font-size: 1rem;
        padding: 1rem 2rem;
        cursor: pointer;
    }

    li {
        margin-left: 1rem;

        i {
            font-size: 2rem;
        }
    }

    div:hover {
        background: #e6e6e6;
    }
}
</style>