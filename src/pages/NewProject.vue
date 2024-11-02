<script setup lang="ts">
import { reactive, ref } from 'vue';
import { createProject } from '../composable/userStorage'
import { storage } from '../firebaseConfig';
import { getDownloadURL, ref as refStorage, uploadBytesResumable } from 'firebase/storage';
import { useRouter } from 'vue-router';
import randomString from 'random-string-generator'
import Loading from '../components/Loading.vue';
import imageCompression from 'browser-image-compression';
import { toast } from 'vue3-toastify';

const router = useRouter();

const projectData = reactive({
    name: '',
    description: '',
    client: '',
    year: 2024,
    type: 'full-project',
    size: 'small',
    is360: false,
    link360: '',
    images: Array<string>()
})
const checkDataIsNotEmpty = reactive({
    name: true,
    description: true,
    client: true,
    year: true,
    link360: true,
    images: true
})

const clearData = () => {
    projectData.name = '';
    projectData.description = '';
    projectData.client = '';
    projectData.is360 = false;
    projectData.link360 = '';
    projectData.images.splice(0, projectData.images.length);
    showFile.value.splice(0, showFile.value.length);
}

const checkForm = () => {
    checkDataIsNotEmpty.name = checkDataIsNotEmpty.client = checkDataIsNotEmpty.description = true
    checkDataIsNotEmpty.year = checkDataIsNotEmpty.images = checkDataIsNotEmpty.link360 = true;
    if (projectData.name && projectData.client
        && projectData.description && projectData.year
        && projectData.images.length > 0
        && ((projectData.is360 && projectData.link360) || !projectData.is360)) {
        createProject(projectData);
        toast.success("Thêm dự án thành công !");
        clearData();
    }
    else {
        if (!projectData.name)
            checkDataIsNotEmpty.name = false;
        if (!projectData.client)
            checkDataIsNotEmpty.client = false;
        if (!projectData.description)
            checkDataIsNotEmpty.description = false;
        if (!projectData.year)
            projectData.year = 2024;
        if (projectData.images.length < 1)
            checkDataIsNotEmpty.images = false;
        if (projectData.is360 && !projectData.link360)
            checkDataIsNotEmpty.link360 = false;
    }
}

const file = ref();
const fileData = ref<String[]>([]);
const showFile = ref<string[]>([]);
const isLoading = ref(false);
const onchange = async () => {
    isLoading.value = true;
    for (let i = 0; i < file.value.files.length; i++) {
        fileData.value.push(file.value.files[i]);
        const image = file.value.files[i];
        const compressedImage = await imageCompression(image, {
            maxWidthOrHeight: 1920,
            maxSizeMB: 1,
            useWebWorker: true,
        })
        uploadToFirebase(compressedImage, randomString())
    }
}

const uploadToFirebase = async (optimizedImageBuffer: any, imageName: string) => {
    const storageRef = refStorage(storage, 'images/' + imageName);
    const blob = new Blob([optimizedImageBuffer], { type: 'image/webp' })
    const upload = uploadBytesResumable(storageRef, blob);
    const snapshot = await upload;
    const url = await getDownloadURL(snapshot.ref);
    isLoading.value = false;
    showFile.value.push(URL.createObjectURL(blob));
    projectData.images.push(url);
}


const deleteImg = (index: number) => {
    try {
        showFile.value.splice(index, 1);
        projectData.images.length -= 1;
    } catch (error) {
        console.log("Remove image failed !")
    }
}

const prevPage = () => {
    router.back();
}

</script>

<template>
    <div class="">
        <div class="border-b border-solid pb-4 mb-6">
            <h1 class="text-3xl font-bold">Thêm dự án mới</h1>
        </div>
        <form class=" w-full">
            <div class="grid grid-cols-2 gap-8 mb-8">
                <div class="col-span-1">
                    <div class=" shadowBox mb-8 bg-white p-6 rounded-md border border-solid">
                        <div class="w-full mb-8 min-w-[200px]">
                            <label for="project-name">Tên dự án</label>
                            <div class="relative flex items-center h-12">
                                <input v-model="projectData.name" type="text" id="project-name"
                                    class="mt-2 w-full h-12 pl-3 pr-10 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                    placeholder="Nhập tên dự án..." />
                            </div>
                            <p v-if="!checkDataIsNotEmpty.name" class="text-red-500 text-[12px] mt-2">Vui lòng nhập tên
                                dự án !
                            </p>
                        </div>
                        <div class="flex gap-4 mb-5">
                            <div class="w-full max-w-sm min-w-[200px]">
                                <label for="project-type">Kiểu dự án</label>
                                <div class="relative mt-2">
                                    <select v-model="projectData.type" id="project-type"
                                        class="w-full h-12 bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded pl-3 pr-8 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md appearance-none cursor-pointer">
                                        <option value="full-project">Full Project</option>
                                        <option value="exterior">Exterior</option>
                                        <option value="interior">Interior</option>
                                    </select>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                        stroke-width="1.2" stroke="currentColor"
                                        class="h-5 w-5 ml-1 absolute top-2.5 right-2.5 text-slate-700">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                                    </svg>
                                </div>
                            </div>
                            <div class="w-full max-w-sm min-w-[200px]">
                                <label for="project-size">Kích thước</label>
                                <div class="relative mt-2">
                                    <select v-model="projectData.size" id="project-size"
                                        class="w-full h-12 bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded pl-3 pr-8 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md appearance-none cursor-pointer">
                                        <option value="small">Small</option>
                                        <option value="medium">Medium</option>
                                        <option value="large">Large</option>
                                    </select>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                        stroke-width="1.2" stroke="currentColor"
                                        class="h-5 w-5 ml-1 absolute top-2.5 right-2.5 text-slate-700">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center gap-1">
                            <input v-model="projectData.is360" class="h-5 w-5 cursor-pointer" type="checkbox" name=""
                                id="360">
                            <label class="cursor-pointer" for="360">Đây là dự án 360°</label>
                        </div>
                        <div v-if="projectData.is360" class="relative flex items-center h-12">
                            <input v-model="projectData.link360" type="text" id="project-name"
                                class="mt-2 w-full h-12 pl-3 pr-10 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                placeholder="Vui lòng dán đường dẫn hình ảnh 360° của dự án..." />
                        </div>
                        <p v-if="!checkDataIsNotEmpty.link360" class="text-red-500 text-[12px] mt-2">Vui lòng nhập link
                            hình ảnh 360° của
                            dự án !
                        </p>
                        <div v-if="projectData.is360" class="flex items-center mt-5 gap-2 text-[10px]">
                            <p>Có thể render 360° ở trang sau: </p>
                            <a class="py-1 px-2 rounded-full bg-blue-500 text-white" href="https://momento360.com/#"
                                target="_blank">momento360</a>
                        </div>
                        <div class="w-full my-8 min-w-[200px]">
                            <label for="project-year">Năm</label>
                            <div class="relative flex items-center h-12">
                                <input v-model="projectData.year" type="number" id="project-year"
                                    class="mt-2 w-full h-12 pl-3 pr-10 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                    placeholder="Nhập năm dự án..." />
                            </div>
                        </div>
                        <div class="w-full mb-8 min-w-[200px]">
                            <label for="project-client">Khách hàng</label>
                            <div class="relative flex items-center h-12">
                                <input v-model="projectData.client" type="text" id="project-client"
                                    class="mt-2 w-full h-12 pl-3 pr-10 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                    placeholder="Nhập tên khách hàng..." />
                            </div>
                            <p v-if="!checkDataIsNotEmpty.client" class="text-red-500 text-[12px] mt-2">Vui lòng nhập
                                tên
                                khách hàng !
                            </p>
                        </div>
                    </div>
                    <div class="w-full bg-white p-6 rounded-md border border-solid">
                        <label for="project-description">Mô tả của dự án</label>
                        <div class="relative flex items-center">
                            <textarea v-model="projectData.description" spellcheck="false"
                                placeholder="Nhập mô tả cho dự án của bạn..." cols="1" rows="10" name=""
                                id="project-description"
                                class="mt-2 w-full px-3 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"></textarea>
                        </div>
                        <p v-if="!checkDataIsNotEmpty.description" class="text-red-500 text-[12px] mt-2">Vui lòng nhập
                            mô tả
                            dự án !
                        </p>
                    </div>
                </div>
                <div class="col-span-1  shadowBox bg-white p-6 rounded-md border border-solid">
                    <h1 class="text-xl font-bold mb-4">Hình ảnh của dự án</h1>

                    <div class="grid grid-cols-2 gap-6">
                        <div class="relative img-box" v-for="(img, index) in showFile">
                            <img :src="img" alt="">
                            <div
                                class="absolute flex items-center justify-center top-0 left-0 right-0 bottom-0 bg-vr-light-gray-blur">
                                <i @click="deleteImg(index)"
                                    class="hover:text-red-500 cursor-pointer text-xl text-white fa-solid fa-trash"></i>
                            </div>
                        </div>
                        <Loading v-if="isLoading"></Loading>
                        <div
                            class="col-span-1 relative flex justify-center items-center w-full h-40 border-2 border-dashed">
                            <p class="text-8xl">+</p>
                            <input class="absolute cursor-pointer opacity-0 top-0 left-0 right-0 bottom-0" type="file"
                                ref="file" id="fileInput" @input="onchange" multiple accept=".jpg, .jpeg, .png">
                        </div>
                    </div>
                    <p v-if="!checkDataIsNotEmpty.images" class="text-red-500 text-[12px] mt-2">Vui lòng tải ít nhất 1
                        ảnh cho dự án !
                    </p>
                </div>
            </div>
            <div class="flex gap-4 shadowBox mb-8 bg-white p-6 rounded-md border border-solid">
                <button @click.prevent="checkForm()"
                    class="flex items-center rounded-md bg-gradient-to-tr from-slate-800 to-slate-700 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                    type="button">
                    Thêm dự án
                </button>
                <button @click="prevPage()"
                    class="flex items-center rounded-md border border-slate-300 py-2 px-4 text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-white hover:bg-slate-800 hover:border-slate-800 focus:text-white focus:bg-slate-800 focus:border-slate-800 active:border-slate-800 active:text-white active:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                    type="button">
                    Quay lại
                </button>
            </div>
        </form>
    </div>
</template>

<style scoped>
.shadowBox {
    box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
}

.img-box div {
    opacity: 0;
}

.img-box:hover div {
    opacity: 1;
}
</style>