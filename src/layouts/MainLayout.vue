<script setup lang="ts">
import { ref } from 'vue';
import Navbar from '../components/Navbar.vue';

const isActive = ref(false);
function activeNavbar() {
    isActive.value = !isActive.value;
}

</script>

<template>
    <div class="w-full">
        <div class="flex">
            <div :class="{ 'hiddenNavbar': isActive }"
                class="navbar fixed overflow-hidden w-80 transition-all duration-500">
                <Navbar class=""></Navbar>
            </div>
            <div :class="{ 'margin-left0': isActive }" class="w-full ml-80 transition-all duration-500 p-10">
                <div class="pt-2 pb-6">
                    <div @click="activeNavbar()" class="h-10 w-10 cursor-pointer flex justify-start items-center">
                        <i class="text-2xl fa-solid fa-bars"></i>
                    </div>
                </div>
                <router-view></router-view>
            </div>
        </div>
    </div>
</template>

<style scoped>
.navbar {
    box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
}

.hiddenNavbar {
    width: 0;
}

.margin-left0 {
    margin-left: 0 !important;
}

.mainBox {
    width: calc(100% - 18rem);
}

.mainBoxFull {
    width: 100%;
}
</style>