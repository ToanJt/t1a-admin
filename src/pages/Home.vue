<script setup lang="ts">
import { collection, deleteDoc, doc, DocumentData, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { onMounted, reactive, ref } from 'vue';
import { db, storage } from '../firebaseConfig';
import { getDownloadURL, ref as refStorage, uploadBytesResumable } from 'firebase/storage';
import imageCompression from 'browser-image-compression';
import Loading from '../components/Loading.vue';
import { toast } from 'vue3-toastify';

const inputData = reactive({
    title: '',
    content1: '',
    content2: '',
    content3: '',
    image: '',
})
const inputDataEdit = reactive({
    title: '',
    content1: '',
    content2: '',
    content3: '',
    image: '',
})
const checkDataIsNotEmpty = reactive({
    title: true,
    content1: true,
    content2: true,
    content3: true,
    image: true
})
const checkDataIsNotEmptyOfUpdate = reactive({
    title: true,
    content1: true,
    content2: true,
    content3: true,
    image: true
})

const backgrounds = ref<DocumentData[]>([]);
const isLoading = ref(false);
const isActive = ref(false);
const tempTitle = ref('');
const loadingUpdate = ref(false);

const checkForm = () => {
    checkDataIsNotEmpty.title = checkDataIsNotEmpty.content1 = checkDataIsNotEmpty.content2 = true
    checkDataIsNotEmpty.content3 = checkDataIsNotEmpty.image = true;
    if (inputData.title && inputData.content1 && inputData.content2 && inputData.content3 && inputData.image) {
        addProjectForBackground();
        toast.success("Thêm background thành công !");
    }
    else {
        if (!inputData.title)
            checkDataIsNotEmpty.title = false;
        if (!inputData.content1)
            checkDataIsNotEmpty.content1 = false;
        if (!inputData.content2)
            checkDataIsNotEmpty.content2 = false;
        if (!inputData.content3)
            checkDataIsNotEmpty.content3 = false;
        if (!inputData.image)
            checkDataIsNotEmpty.image = false;
    }
}
const checkUpdateForm = () => {
    checkDataIsNotEmptyOfUpdate.title = checkDataIsNotEmptyOfUpdate.content1 = checkDataIsNotEmptyOfUpdate.content2 = true
    checkDataIsNotEmptyOfUpdate.content3 = checkDataIsNotEmptyOfUpdate.image = true;
    if (inputDataEdit.title && inputDataEdit.content1 && inputDataEdit.content2 && inputDataEdit.content3 && inputDataEdit.image) {
        updateBackground();
        toast.info("Cập nhật thành công !");
    }
    else {
        if (!inputDataEdit.title)
            checkDataIsNotEmptyOfUpdate.title = false;
        if (!inputDataEdit.content1)
            checkDataIsNotEmptyOfUpdate.content1 = false;
        if (!inputDataEdit.content2)
            checkDataIsNotEmptyOfUpdate.content2 = false;
        if (!inputDataEdit.content3)
            checkDataIsNotEmptyOfUpdate.content3 = false;
        if (!inputDataEdit.image)
            checkDataIsNotEmptyOfUpdate.image = false;
    }
}

const onchange = async (photo: any) => {
    const image = photo.target.files[0];
    const compressedImage = await imageCompression(image, {
        maxWidthOrHeight: 1920,
        maxSizeMB: 1,
        useWebWorker: true,
    })
    const storageRef = refStorage(storage, 'backgrounds/' + image.name);
    const blob = new Blob([compressedImage], { type: 'image/webp' })
    const upload = uploadBytesResumable(storageRef, blob);
    // Uploading...
    upload.on("state_changed", () => {
        isLoading.value = true;
    })
    const snapshot = await upload;
    const url = await getDownloadURL(snapshot.ref);
    inputData.image = url;
    isLoading.value = false;
}

const onchangeUpdate = async (file: any) => {
    const image = file.target.files[0];
    const compressedImage = await imageCompression(image, {
        maxWidthOrHeight: 1920,
        maxSizeMB: 1,
        useWebWorker: true,
    })
    const storageRef = refStorage(storage, 'backgrounds/' + image.name);
    const blob = new Blob([compressedImage], { type: 'image/webp' })
    const upload = uploadBytesResumable(storageRef, blob);
    // Uploading...
    upload.on("state_changed", () => {
        isLoading.value = true;
    })
    const snapshot = await upload;
    const url = await getDownloadURL(snapshot.ref);
    inputDataEdit.image = url;
    loadingUpdate.value = false;
}

const addProjectForBackground = async () => {
    try {
        const newDoc = doc(collection(db, 'backgrounds/'));
        await setDoc(newDoc, inputData);
        backgrounds.value.push(inputData);
    } catch (error) {
        console.log("Failed to create project for background " + error);
    }
}
const updateBackground = async () => {
    try {
        const getBackgroundsList = await getDocs(collection(db, "backgrounds"));
        getBackgroundsList.forEach((background) => {
            if (background.data().title === tempTitle.value) {
                updateDoc(background.ref, {
                    title: inputDataEdit.title,
                    content1: inputDataEdit.content1,
                    content2: inputDataEdit.content2,
                    content3: inputDataEdit.content3,
                    image: inputDataEdit.image,
                })
            }
        })
        isActive.value = false;
        getBackgrounds();
    } catch (error) {
        console.log("failed to update background..." + error)
    }
}
const deleteBackground = async (backgroundTitle: string) => {
    try {
        const getBackgroundsList = await getDocs(collection(db, 'backgrounds'));
        getBackgroundsList.forEach((background) => {
            if (background.data().title === backgroundTitle) {
                deleteDoc(doc(db, 'backgrounds', background.id));
                getBackgrounds();
                return;
            }
        })
        toast.error("Xóa background thành công !")
    } catch (error) {
        console.log("failed to delete background..." + error)
    }
}
const editForm = (data: DocumentData) => {
    isActive.value = !isActive.value;
    inputDataEdit.title = data.title;
    tempTitle.value = data.title;
    inputDataEdit.content1 = data.content1;
    inputDataEdit.content2 = data.content2;
    inputDataEdit.content3 = data.content3;
    inputDataEdit.image = data.image;
}
const getBackgrounds = async () => {
    const getBackgroundsList = await getDocs(collection(db, 'backgrounds'));
    backgrounds.value.splice(0, backgrounds.value.length);
    getBackgroundsList.forEach((background) => {
        const backgroundData = reactive({
            title: '',
            content1: '',
            content2: '',
            content3: '',
            image: '',
        })
        backgroundData.title = background.data().title;
        backgroundData.content1 = background.data().content1;
        backgroundData.content2 = background.data().content2;
        backgroundData.content3 = background.data().content3;
        backgroundData.image = background.data().image;
        backgrounds.value.push(backgroundData);
    })
}

const closeForm = () => {
    isActive.value = false;
}
const stopPropagation = (Event: MouseEvent) => {
    Event.stopPropagation();
}

onMounted(async () => {
    const getBackgrounds = await getDocs(collection(db, 'backgrounds'));
    getBackgrounds.forEach((doc) => {
        backgrounds.value.push(doc.data());
    })
})

</script>

<template>
    <div>
        <div class="border-b border-solid pb-4 mb-6">
            <h1 class="text-3xl font-bold">Home Dashboard</h1>
        </div>
        <form class=" w-full">
            <div class="grid grid-cols-2 gap-8 mb-8">
                <div class="col-span-1">
                    <div class=" shadowBox mb-8 bg-white p-6 rounded-md border border-solid">
                        <p class="text-xl font-semibold mb-5">Thêm dự án làm Background</p>
                        <div class="w-full mb-8 min-w-[200px]">
                            <label for="facebook">Tiêu đề</label>
                            <div class="relative flex items-center h-12">
                                <input v-model="inputData.title" type="text" id="facebook"
                                    class="mt-2 w-full h-12 pl-3 pr-3 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                    placeholder="Title" />
                            </div>
                            <p v-if="!checkDataIsNotEmpty.title" class="text-red-500 text-[12px] mt-2">Vui lòng nhập
                                tiêu
                                đề của background !
                            </p>
                        </div>
                        <div class="w-full mb-8 min-w-[200px]">
                            <label for="content-1">Nội dung 1:</label>
                            <div class="relative flex items-center">
                                <textarea rows="2" v-model="inputData.content1" type="text" id="content-1"
                                    class="mt-2 w-full pl-3 pr-3 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                    placeholder="Content" />
                            </div>
                            <p v-if="!checkDataIsNotEmpty.content1" class="text-red-500 text-[12px] mt-2">Vui lòng nhập
                                nội dung
                                dự án !
                            </p>
                        </div>
                        <div class="w-full mb-8 min-w-[200px]">
                            <label for="content-2">Nội dung 2:</label>
                            <div class="relative flex items-center">
                                <textarea rows="2" v-model="inputData.content2" type="text" id="content-2"
                                    class="mt-2 w-full pl-3 pr-3 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                    placeholder="Content" />
                            </div>
                            <p v-if="!checkDataIsNotEmpty.content2" class="text-red-500 text-[12px] mt-2">Vui lòng nhập
                                nội dung
                                dự án !
                            </p>
                        </div>
                        <div class="w-full mb-8 min-w-[200px]">
                            <label for="content-3">Nội dung 3:</label>
                            <div class="relative flex items-center">
                                <textarea rows="2" v-model="inputData.content3" type="text" id="content-3"
                                    class="mt-2 w-full pl-3 pr-3 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                    placeholder="Content" />
                            </div>
                            <p v-if="!checkDataIsNotEmpty.content3" class="text-red-500 text-[12px] mt-2">Vui lòng nhập
                                nội dung
                                dự án !
                            </p>
                        </div>
                        <div class="w-full mb-8 min-w-[200px]">
                            <label for="avatar">Chọn ảnh background</label>
                            <div class="relative flex items-center h-12">
                                <input type="file" ref="file" accept=".jpg, .jpeg, .png" id="avatar" @change="onchange"
                                    class="mt-2 w-full h-12 pl-3 pr-10 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow" />

                                <div class="absolute h-full flex items-center right-2.5 text-slate-600">
                                    <i class="fa-regular fa-copy"></i>
                                </div>
                            </div>
                            <p v-if="!checkDataIsNotEmpty.image" class="text-red-500 text-[12px] mt-2">Vui lòng chọn
                                background
                                dự án !
                            </p>
                        </div>
                        <Loading v-if="isLoading" class="mt-6"></Loading>
                        <img v-else class="rounded-md" :src="inputData.image" alt="">
                        <button @click="checkForm()"
                            class="flex items-center mt-5 rounded-md bg-gradient-to-tr from-slate-800 to-slate-700 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                            type="button">
                            Thêm dự án
                        </button>
                    </div>
                </div>
                <div class="col-span-1">
                    <div class=" shadowBox mb-8 bg-white p-6 rounded-md border border-solid">
                        <p class="text-xl font-semibold mb-5">Danh sách dự án làm Background</p>
                        <div v-for="background in backgrounds"
                            class=" hover:bg-[#e6e6e6] py-4 px-4 cursor-pointer transition-all duration-500 memberBox mb-2 rounded-md">
                            <div class="flex justify-between">
                                <div class="flex items-center gap-2">
                                    <img class="h-20 w-20 rounded-md object-cover" :src="background.image" alt="">
                                    <div>
                                        <p class=" font-semibold">{{ background.title }}</p>
                                    </div>
                                </div>
                                <div class="flex gap-2 iconBox">
                                    <div @click="editForm(background)" class="flex justify-center items-center p-2">
                                        <i class="fa-regular fa-pen-to-square"></i>
                                    </div>
                                    <div @click="deleteBackground(background.title)"
                                        class="flex justify-center items-center p-2">
                                        <i class=" fa-solid fa-trash"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </form>
        <div :class="{ 'hidden': !isActive }" @click="closeForm()"
            class="fixed flex justify-center bg-black-rgba  py-20 top-0 right-0 left-0 bottom-0">
            <div @click="stopPropagation"
                class="relative w-2/3 h-full overflow-y-scroll transition-all duration-500 grid shadowBox gap-4 mb-8 bg-white rounded-md border border-solid">
                <div class="flex justify-between sticky z-50 top-0 left-0 right-0 p-5 bg-white border-b">
                    <p class="text-xl font-semibold">Chỉnh sửa
                        thông
                        tin
                    </p>

                    <i @click="closeForm()" class="text-red-500 cursor-pointer text-xl fa-solid fa-xmark"></i>
                </div>
                <div class=" px-20 py-5">
                    <div class="w-full mb-6 min-w-[200px]">
                        <label class="" for="title">Nhập tiêu đề mới</label>
                        <div class="relative flex items-center h-12">
                            <input v-model="inputDataEdit.title" type="text" id="title"
                                class="mt-2 w-full h-12 pl-3 pr-10 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                placeholder="Title" />
                        </div>
                        <p v-if="!checkDataIsNotEmptyOfUpdate.title" class="text-red-500 text-[12px] mt-2">Vui
                            lòng nhập
                            tiêu
                            đề của background !
                        </p>
                    </div>
                    <div class="w-full mb-6 mt-6 min-w-[200px]">
                        <label class="" for="content1">Nội dung 1</label>
                        <div class="relative flex items-center">
                            <textarea rows="2" v-model="inputDataEdit.content1" type="text" id="content1"
                                class="mt-2 w-full pl-3 pr-10 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                placeholder="Content 1"></textarea>

                        </div>
                        <p v-if="!checkDataIsNotEmptyOfUpdate.content1" class="text-red-500 text-[12px] mt-2">
                            Vui lòng
                            nhập
                            nội dung
                            dự án !
                        </p>
                    </div>
                    <div class="w-full mb-6 mt-6 min-w-[200px]">
                        <label class="" for="content2">Nội dung 2</label>
                        <div class="relative flex items-center">
                            <textarea rows="2" v-model="inputDataEdit.content2" type="text" id="content2"
                                class="mt-2 w-full pl-3 pr-10 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                placeholder="Content 2" />
                        </div>
                        <p v-if="!checkDataIsNotEmptyOfUpdate.content2" class="text-red-500 text-[12px] mt-2">
                            Vui lòng
                            nhập
                            nội dung
                            dự án !
                        </p>
                    </div>
                    <div class="w-full mb-6 mt-6 min-w-[200px]">
                        <label class="" for="content3">Nội dung 3</label>
                        <div class="relative flex items-center">
                            <textarea rows="2" v-model="inputDataEdit.content3" type="text" id="content3"
                                class="mt-2 w-full pl-3 pr-10 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                placeholder="Content 3" />
                        </div>
                        <p v-if="!checkDataIsNotEmptyOfUpdate.content3" class="text-red-500 text-[12px] mt-2">
                            Vui lòng
                            nhập
                            nội dung
                            dự án !
                        </p>
                    </div>
                    <div class="w-full mb-6 min-w-[200px]">
                        <label class="" for="avatar">Chọn ảnh đại diện</label>
                        <div class="relative flex items-center h-12">
                            <input type="file" ref="file" accept=".jpg, .jpeg, .png" id="avatar"
                                @change="onchangeUpdate"
                                class="mt-2 w-full h-12 pl-3 pr-10 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow" />

                            <div class="absolute h-full flex items-center right-2.5 text-slate-600">
                                <i class="fa-regular fa-copy"></i>
                            </div>
                        </div>
                        <p v-if="!checkDataIsNotEmptyOfUpdate.image" class="text-red-500 text-[12px] mt-2">Vui
                            lòng chọn
                            background
                            dự án !
                        </p>
                    </div>
                    <Loading v-if="loadingUpdate"></Loading>
                    <img v-else class="rounded-md" :src="inputDataEdit.image" alt="">
                    <div class="flex gap-4 mt-6">
                        <button @click="checkUpdateForm()"
                            class="flex items-center rounded-md bg-gradient-to-tr from-slate-800 to-slate-700 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                            type="button">
                            Cập nhật
                        </button>
                        <button @click="editForm({})"
                            class="flex items-center rounded-md border border-slate-300 py-2 px-4 text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-white hover:bg-slate-800 hover:border-slate-800 focus:text-white focus:bg-slate-800 focus:border-slate-800 active:border-slate-800 active:text-white active:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                            type="button">
                            Quay lại
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
