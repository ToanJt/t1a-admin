<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import Loading from '../components/Loading.vue';
import { collection, deleteDoc, doc, DocumentData, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../firebaseConfig';
import { ref as refStorage, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression';
import { toast } from 'vue3-toastify';
import randomString from 'random-string-generator'

const inputData = reactive({
    customerName: '',
    from: '',
    content1: '',
    content2: '',
    content3: '',
    avatar: '',
})
const inputDataEdit = reactive({
    customerName: '',
    from: '',
    content1: '',
    content2: '',
    content3: '',
    avatar: '',
})

const checkDataIsNotEmpty = reactive({
    customerName: true,
    from: true,
    content1: true,
    avatar: true,
})
const checkDataIsNotEmptyOfUpdate = reactive({
    customerName: true,
    from: true,
    content1: true,
    avatar: true,
})

const checkForm = () => {
    checkDataIsNotEmpty.customerName = checkDataIsNotEmpty.from = true;
    checkDataIsNotEmpty.avatar = checkDataIsNotEmpty.content1 = true;
    if (inputData.customerName && inputData.from && inputData.avatar && inputData.content1) {
        createNewFeedback();
    }
    if (!inputData.customerName)
        checkDataIsNotEmpty.customerName = false;
    if (!inputData.from)
        checkDataIsNotEmpty.from = false;
    if (!inputData.content1)
        checkDataIsNotEmpty.content1 = false;
    if (!inputData.avatar)
        checkDataIsNotEmpty.avatar = false;
}
const checkUpdateForm = () => {
    checkDataIsNotEmptyOfUpdate.customerName = checkDataIsNotEmptyOfUpdate.from = true;
    checkDataIsNotEmptyOfUpdate.avatar = checkDataIsNotEmptyOfUpdate.content1 = true;
    if (inputDataEdit.customerName && inputDataEdit.from && inputDataEdit.avatar && inputDataEdit.content1) {
        updateFeedback();
    }
    if (!inputDataEdit.customerName)
        checkDataIsNotEmptyOfUpdate.customerName = false;
    if (!inputDataEdit.from)
        checkDataIsNotEmptyOfUpdate.from = false;
    if (!inputDataEdit.content1)
        checkDataIsNotEmptyOfUpdate.content1 = false;
    if (!inputDataEdit.avatar)
        checkDataIsNotEmptyOfUpdate.avatar = false;
}


const isLoading = ref(false);
const loadingUpdate = ref(false);
const isActive = ref(false);
const tempTitle = ref('');
const feedbacks = ref<DocumentData[]>([]);

const onchange = async (photo: any) => {
    const avatar = photo.target.files[0];
    const compressedImage = await imageCompression(avatar, {
        maxWidthOrHeight: 720,
        maxSizeMB: 1,
        useWebWorker: true,
    })
    const storageRef = refStorage(storage, 'feedbacks/' + randomString());
    const blob = new Blob([compressedImage], { type: 'image/webp' })
    const upload = uploadBytesResumable(storageRef, blob);
    // Uploading...
    await upload.on("state_changed", () => {
        isLoading.value = true;
    })
    const snapshot = await upload;
    const url = await getDownloadURL(snapshot.ref);
    inputData.avatar = url;
    isLoading.value = false;
}
const onchangeUpdate = async (photo: any) => {
    const avatar = photo.target.files[0];
    const compressedImage = await imageCompression(avatar, {
        maxWidthOrHeight: 1920,
        maxSizeMB: 1,
        useWebWorker: true,
    })
    const storageRef = refStorage(storage, 'feedbacks/' + randomString());
    const blob = new Blob([compressedImage], { type: 'image/webp' })
    const upload = uploadBytesResumable(storageRef, blob);
    // Uploading...
    await upload.on("state_changed", () => {
        isLoading.value = true;
    })
    const snapshot = await upload;
    const url = await getDownloadURL(snapshot.ref);
    inputDataEdit.avatar = url;
    loadingUpdate.value = false;
}

const createNewFeedback = async () => {
    try {
        const newDoc = doc(collection(db, 'feedbacks/'));
        await setDoc(newDoc, inputData);
        feedbacks.value.push(inputData);
        clearData();
        getFeedbacksFunc();
        toast.success("Thêm feedback thành công !")
    } catch (error) {
        console.log("Failed to create customer feedback");
    }
}


const updateFeedback = async () => {
    try {
        const getFeedbacks = await getDocs(collection(db, "feedbacks"));
        getFeedbacks.forEach((feedback) => {
            if (feedback.data().customerName === tempTitle.value) {
                updateDoc(feedback.ref, {
                    customerName: inputDataEdit.customerName,
                    from: inputDataEdit.from,
                    content1: inputDataEdit.content1,
                    content2: inputDataEdit.content2,
                    content3: inputDataEdit.content3,
                    avatar: inputDataEdit.avatar,
                })
                toast.info("Cập nhật thành công !")
                return;
            }
        })
        isActive.value = false;
        getFeedbacksFunc();
    } catch (error) {
        console.log("failed to update background..." + error)
    }
}
const deleteFeedback = async (feedbackName: string) => {
    try {
        const getFeedbacks = await getDocs(collection(db, 'feedbacks'));
        getFeedbacks.forEach((feedback) => {
            if (feedback.data().customerName === feedbackName) {
                deleteDoc(doc(db, 'feedbacks', feedback.id));
                getFeedbacksFunc();
                return;
            }
        })
        toast.error("Xóa thành công !")
    } catch (error) {
        console.log("failed to delete feedback..." + error)
    }
}
const getFeedbacksFunc = async () => {
    const getFeedbacks = await getDocs(collection(db, 'feedbacks'));
    // Xoa het phan tu trong Feedbacks
    feedbacks.value.splice(0, feedbacks.value.length);
    getFeedbacks.forEach((feedback) => {
        const feedbackData = reactive({
            customerName: '',
            from: '',
            content1: '',
            content2: '',
            content3: '',
            avatar: '',
        })
        feedbackData.customerName = feedback.data().customerName;
        feedbackData.from = feedback.data().from;
        feedbackData.content1 = feedback.data().content1;
        feedbackData.content2 = feedback.data().content2;
        feedbackData.content3 = feedback.data().content3;
        feedbackData.avatar = feedback.data().avatar;
        feedbacks.value.push(feedbackData);
    })
}
const editForm = (data: DocumentData) => {
    isActive.value = !isActive.value;
    inputDataEdit.customerName = data.customerName;
    tempTitle.value = data.customerName;
    inputDataEdit.from = data.from;
    inputDataEdit.content1 = data.content1;
    inputDataEdit.content2 = data.content2;
    inputDataEdit.content3 = data.content3;
    inputDataEdit.avatar = data.avatar;
}

function clearData() {
    inputData.customerName = '';
    inputData.from = '';
    inputData.avatar = '';
    inputData.content1 = '';
    inputData.content2 = '';
    inputData.content3 = '';
}

onMounted(async () => {
    const getFeedbacks = await getDocs(collection(db, 'feedbacks'));
    getFeedbacks.forEach((feedback) => {
        feedbacks.value.push(feedback.data());
    })
})

</script>

<template>
    <div>
        <div class="border-b border-solid pb-4 mb-6">
            <h1 class="text-3xl font-bold">Feedback từ khách hàng</h1>
        </div>
        <form class=" w-full">
            <div class="grid grid-cols-2 gap-8 mb-8">
                <div class="col-span-1">
                    <div class=" shadowBox mb-8 bg-white p-6 rounded-md border border-solid">
                        <p class="text-xl font-semibold mb-5">Thêm feedback của khách hàng</p>
                        <div class="w-full mb-8 min-w-[200px]">
                            <label for="customer-name">Tên khách hàng</label>
                            <div class="relative flex items-center h-12">
                                <input v-model="inputData.customerName" type="text" id="customer-name"
                                    class="mt-2 w-full h-12 pl-3 pr-3 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                    placeholder="Title" />
                            </div>
                            <p v-if="!checkDataIsNotEmpty.customerName" class="text-red-500 text-[12px] mt-2">Vui lòng
                                nhập tên khách hàng !
                            </p>
                        </div>
                        <div class="w-full mb-8 min-w-[200px]">
                            <label for="from">Khách hàng đến từ:</label>
                            <div class="relative flex items-center h-12">
                                <input v-model="inputData.from" type="text" id="from"
                                    class="mt-2 w-full h-12 pl-3 pr-3 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                    placeholder="From" />
                            </div>
                            <p v-if="!checkDataIsNotEmpty.from" class="text-red-500 text-[12px] mt-2">Vui lòng
                                nhập khách hàng đến từ đâu !
                            </p>
                        </div>
                        <div class="w-full mb-8 min-w-[200px]">
                            <label for="content-1">Feedback 1:</label>
                            <div class="relative flex items-center h-12">
                                <input v-model="inputData.content1" type="text" id="content-1"
                                    class="mt-2 w-full h-12 pl-3 pr-3 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                    placeholder="Feedback" />
                            </div>
                            <p v-if="!checkDataIsNotEmpty.content1" class="text-red-500 text-[12px] mt-2">Vui lòng nhập
                                ít nhất một phản hồi của khách hàng !
                            </p>
                        </div>
                        <div class="w-full mb-8 min-w-[200px]">
                            <label for="content-2">Feedback 2 (tùy chọn):</label>
                            <div class="relative flex items-center h-12">
                                <input v-model="inputData.content2" type="text" id="content-2"
                                    class="mt-2 w-full h-12 pl-3 pr-3 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                    placeholder="Feedback" />
                            </div>
                        </div>
                        <div class="w-full mb-8 min-w-[200px]">
                            <label for="content-3">Feedback 3 (tùy chọn):</label>
                            <div class="relative flex items-center h-12">
                                <input v-model="inputData.content3" type="text" id="content-3"
                                    class="mt-2 w-full h-12 pl-3 pr-3 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                    placeholder="Feedback" />
                            </div>
                        </div>
                        <div class="w-full mb-8 min-w-[200px]">
                            <label for="avatar">Chọn ảnh đại diện</label>
                            <div class="relative flex items-center h-12">
                                <input type="file" ref="file" accept=".jpg, .jpeg, .png" id="avatar" @change="onchange"
                                    class="mt-2 w-full h-12 pl-3 pr-10 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow" />
                            </div>
                            <p v-if="!checkDataIsNotEmpty.avatar" class="text-red-500 text-[12px] mt-2">Vui lòng chọn
                                ảnh đại diện của khách hàng !
                            </p>
                        </div>
                        <Loading v-if="isLoading" class="mt-6"></Loading>
                        <img v-else class="rounded-md" :src="inputData.avatar" alt="">
                        <button @click="checkForm()"
                            class="flex items-center mt-5 rounded-md bg-gradient-to-tr from-slate-800 to-slate-700 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                            type="button">
                            Thêm Feedback
                        </button>
                    </div>
                </div>
                <div class="col-span-1">
                    <div class=" shadowBox mb-8 bg-white p-6 rounded-md border border-solid">
                        <p class="text-xl font-semibold mb-5">Danh sách feedback</p>
                        <div v-for="feedback in feedbacks"
                            class=" hover:bg-[#e6e6e6] py-4 px-4 cursor-pointer transition-all duration-500 memberBox mb-2 rounded-md">
                            <div class="flex justify-between">
                                <div class="flex items-center gap-2">
                                    <img class="h-20 w-20 rounded-md object-cover" :src="feedback.avatar" alt="">
                                    <div>
                                        <p class=" font-semibold">{{ feedback.customerName }}</p>
                                    </div>
                                </div>
                                <div class="flex gap-2 iconBox">
                                    <div @click="editForm(feedback)" class="flex justify-center items-center p-2">
                                        <i class="fa-regular fa-pen-to-square"></i>
                                    </div>
                                    <div @click="deleteFeedback(feedback.customerName)"
                                        class="flex justify-center items-center p-2">
                                        <i class=" fa-solid fa-trash"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div :class="{ 'hidden': !isActive }"
                        class=" transition-all duration-500 grid shadowBox gap-4 mb-8 bg-white p-6 rounded-md border border-solid">
                        <p class="text-xl font-semibold">Chỉnh sửa thông tin khách hàng</p>
                        <div>
                            <div class="w-full mb-6 min-w-[200px]">
                                <label for="customer-name">Nhập tên khách hàng</label>
                                <div class="relative flex items-center h-12">
                                    <input v-model="inputDataEdit.customerName" type="text" id="customer-name"
                                        class="mt-2 w-full h-12 pl-3 pr-10 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                        placeholder="Customer Name" />
                                </div>
                                <p v-if="!checkDataIsNotEmptyOfUpdate.customerName"
                                    class="text-red-500 text-[12px] mt-2">
                                    Vui lòng nhập tên khách hàng !
                                </p>
                            </div>
                            <div class="w-full mb-6 mt-6 min-w-[200px]">
                                <label for="content1">Khách hàng đến từ</label>
                                <div class="relative flex items-center h-12">
                                    <input v-model="inputDataEdit.from" type="text" id="content1"
                                        class="mt-2 w-full h-12 pl-3 pr-10 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                        placeholder="Content 1" />
                                </div>
                                <p v-if="!checkDataIsNotEmptyOfUpdate.from" class="text-red-500 text-[12px] mt-2">
                                    Vui lòng
                                    nhập khách hàng đến từ đâu !
                                </p>
                            </div>
                            <div class="w-full mb-6 mt-6 min-w-[200px]">
                                <label for="content1">Nội dung 1</label>
                                <div class="relative flex items-center h-12">
                                    <input v-model="inputDataEdit.content1" type="text" id="content1"
                                        class="mt-2 w-full h-12 pl-3 pr-10 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                        placeholder="Content 1" />
                                </div>
                                <p v-if="!checkDataIsNotEmptyOfUpdate.content1" class="text-red-500 text-[12px] mt-2">
                                    Vui lòng nhập
                                    ít nhất một phản hồi của khách hàng !
                                </p>
                            </div>
                            <div class="w-full mb-6 mt-6 min-w-[200px]">
                                <label for="content2">Nội dung 2 (Tùy chọn)</label>
                                <div class="relative flex items-center h-12">
                                    <input v-model="inputDataEdit.content2" type="text" id="content2"
                                        class="mt-2 w-full h-12 pl-3 pr-10 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                        placeholder="Content 2" />
                                </div>
                            </div>
                            <div class="w-full mb-6 mt-6 min-w-[200px]">
                                <label for="content3">Nội dung 3 (Tùy chọn)</label>
                                <div class="relative flex items-center h-12">
                                    <input v-model="inputDataEdit.content3" type="text" id="content3"
                                        class="mt-2 w-full h-12 pl-3 pr-10 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                        placeholder="Content 3" />
                                </div>
                            </div>
                            <div class="w-full mb-6 min-w-[200px]">
                                <label for="avatar">Chọn ảnh đại diện</label>
                                <div class="relative flex items-center h-12">
                                    <input type="file" ref="file" accept=".jpg, .jpeg, .png" id="avatar"
                                        @change="onchangeUpdate"
                                        class="mt-2 w-full h-12 pl-3 pr-10 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow" />
                                </div>
                                <p v-if="!checkDataIsNotEmptyOfUpdate.avatar" class="text-red-500 text-[12px] mt-2">Vui
                                    lòng
                                    chọn
                                    ảnh đại diện của khách hàng !
                                </p>
                            </div>
                            <Loading v-if="loadingUpdate"></Loading>
                            <img v-else class="rounded-md" :src="inputDataEdit.avatar" alt="">
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
        </form>
    </div>
</template>