<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { getDownloadURL, ref as refStorage, uploadBytesResumable } from 'firebase/storage'
import { storage, db } from '../firebaseConfig';
import { collection, deleteDoc, doc, DocumentData, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import randomString from 'random-string-generator'
import imageCompression from 'browser-image-compression';
import Loading from '../components/Loading.vue';

const file = ref();
const isActiveTeam = ref(false);
const memberData = reactive({
    fullname: '',
    position: '',
    facebookLink: '',
    whatsappLink: '',
    avatar: '',
});
const memberEditData = reactive({
    id: '',
    fullname: '',
    position: '',
    facebookLink: '',
    whatsappLink: '',
    avatar: '',
});

function memberDataClear() {
    memberData.fullname = '';
    memberData.position = '';
    memberData.avatar = '';
    memberData.facebookLink = '';
    memberData.whatsappLink = '';
}
const membersList = ref<Array<DocumentData>>([])

const loading = ref(false);
const onchange = async (file: any) => {
    const avatar = file.target.files[0];
    const compressedImage = await imageCompression(avatar, {
        maxWidthOrHeight: 720,
        maxSizeMB: 1,
        useWebWorker: true,
    })
    const storageRef = refStorage(storage, 'members/' + randomString());
    const blob = new Blob([compressedImage], { type: 'image/webp' })
    const upload = uploadBytesResumable(storageRef, blob);
    // Uploading...
    upload.on("state_changed", () => {
        loading.value = true;
    })
    const snapshot = await upload;
    const url = await getDownloadURL(snapshot.ref);
    memberData.avatar = url;
    loading.value = false;
}

const loadingUpdate = ref(false);
const onchangeUpdate = async (file: any) => {
    const avatar = file.target.files[0];
    const compressedImage = await imageCompression(avatar, {
        maxWidthOrHeight: 720,
        maxSizeMB: 1,
        useWebWorker: true,
    })
    const storageRef = refStorage(storage, 'members/' + randomString());
    const blob = new Blob([compressedImage], { type: 'image/webp' })
    const upload = uploadBytesResumable(storageRef, blob);
    // Uploading...
    upload.on("state_changed", () => {
        loadingUpdate.value = true;
    })
    const snapshot = await upload;
    const url = await getDownloadURL(snapshot.ref);
    memberEditData.avatar = url;
    loadingUpdate.value = false;
}

const checkDataIsNotEmpty = reactive({
    fullname: true,
    position: true,
    avatar: true,
})
const checkDataIsNotEmptyOfUpdate = reactive({
    fullname: true,
    position: true,
    avatar: true,
})
const checkForm = () => {
    checkDataIsNotEmpty.fullname = checkDataIsNotEmpty.position = checkDataIsNotEmpty.avatar = true;
    if (!memberData.fullname)
        checkDataIsNotEmpty.fullname = false;
    if (!memberData.position)
        checkDataIsNotEmpty.position = false;
    if (!memberData.avatar)
        checkDataIsNotEmpty.avatar = false;
    if (memberData.fullname && memberData.position && memberData.avatar) {
        createMember();
        return;
    }
}
const checkFormUpdate = () => {
    checkDataIsNotEmptyOfUpdate.fullname = checkDataIsNotEmptyOfUpdate.position = checkDataIsNotEmptyOfUpdate.avatar = true;
    if (!memberEditData.fullname)
        checkDataIsNotEmptyOfUpdate.fullname = false;
    if (!memberEditData.position)
        checkDataIsNotEmptyOfUpdate.position = false;
    if (!memberEditData.avatar)
        checkDataIsNotEmptyOfUpdate.avatar = false;
    if (memberEditData.fullname && memberEditData.position && memberEditData.avatar) {
        updateMemberInfo();
        return;
    }
}

const createMember = async () => {
    try {
        const newMember = doc(collection(db, 'members'));
        await setDoc(newMember, memberData);
        const tempData = reactive({
            fullname: memberData.fullname,
            position: memberData.position,
            facebookLink: memberData.facebookLink,
            whatsappLink: memberData.whatsappLink,
            avatar: memberData.avatar,
        })
        membersList.value.push(tempData);
        toast.success("Thêm thành viên thành công !");
        getMembersList();
    } catch (error) {
        console.log("Failed to create new member..." + error);
    }
    memberDataClear();
}
async function updateMemberInfo() {
    try {
        const members = await getDocs(collection(db, "members"));
        members.forEach((member) => {
            if (member.id === memberEditData.id) {
                updateDoc(member.ref, {
                    fullname: memberEditData.fullname,
                    position: memberEditData.position,
                    facebookLink: memberEditData.facebookLink,
                    whatsappLink: memberEditData.whatsappLink,
                    avatar: memberEditData.avatar,
                })
                toast.info("Cập nhật thành công !")
                return;
            }
        })
        isActive.value = false;
        getMembersList();

    } catch (error) {
        console.log("failed to update member..." + error)
    }
}

async function deleteMember(memberId: string) {
    try {
        const members = await getDocs(collection(db, "members"));
        members.forEach((member) => {
            if (member.id === memberId) {
                deleteDoc(doc(db, 'members', member.id));
                getMembersList();
                toast.error("Đã xóa thành viên !")
                return;
            }
        })
    } catch (error) {
        console.log("failed to remove member..." + error)
    }
}

const getMembersList = async () => {
    const members = await getDocs(collection(db, 'members'));
    // Xoa het phan tu trong membersList
    membersList.value.splice(0, membersList.value.length);
    members.forEach((member) => {
        const memberInfo = reactive({
            id: '',
            fullname: '',
            position: '',
            facebookLink: '',
            whatsappLink: '',
            avatar: '',
        })
        memberInfo.id = member.id;
        memberInfo.fullname = member.data().fullname;
        memberInfo.position = member.data().position;
        memberInfo.facebookLink = member.data().facebookLink;
        memberInfo.whatsappLink = member.data().whatsappLink;
        memberInfo.avatar = member.data().avatar;
        membersList.value.push(memberInfo);
    })
}

// Handle Function

const isActive = ref(false);
const editForm = (data: DocumentData) => {
    isActive.value = !isActive.value;
    memberEditData.id = data.id;
    memberEditData.fullname = data.fullname;
    memberEditData.position = data.position;
    memberEditData.facebookLink = data.facebookLink;
    memberEditData.whatsappLink = data.whatsappLink;
    memberEditData.avatar = data.avatar;
}

const getActiveTeam = async () => {
    try {
        const docRef = await doc(db, 'actives', 'isActiveTeam');
        const data = await getDoc(docRef);
        if (data.exists()) {
            isActiveTeam.value = data.data().isactive;
        }
    } catch (error) {

    }
}

const activeTeam = async (param: boolean) => {
    try {
        const docRef = await doc(db, 'actives', 'isActiveTeam');
        const data = await getDoc(docRef);
        if (data.exists()) {
            try {
                await updateDoc(docRef, {
                    isactive: param
                })
                console.log("Document updated successfully!");
            } catch (error) {
                console.error("Error updating document: ", error);
            }

        } else {
            console.log("No such document!");
        }
    } catch (error) {
        console.error("Error + ", error)
    }

}

const hiddenTeam = () => {
    isActiveTeam.value = !isActiveTeam.value;
    activeTeam(isActiveTeam.value);
}

const loadingPage = ref(true);
onMounted(() => {
    getMembersList();
    getActiveTeam();
    loadingPage.value = false;
})


</script>

<template>
    <div class="">
        <div class="border-b border-solid pb-4 mb-6">
            <h1 class="text-3xl font-bold">About us</h1>
        </div>
        <div v-if="loadingPage" class="h-96 flex justify-center items-center">
            <Loading></Loading>
        </div>
        <form v-else class=" w-full">
            <div class="grid grid-cols-2 gap-8 mb-8">
                <div class="col-span-1">
                    <div class=" shadowBox mb-8 bg-white p-6 rounded-md border border-solid">
                        <p class="text-xl font-semibold mb-5">Thêm thành viên mới</p>
                        <div class="w-full mb-8 min-w-[200px]">
                            <label for="name">Họ tên</label>
                            <div class="relative flex items-center h-12">
                                <input v-model="memberData.fullname" type="text" id="name"
                                    class="mt-2 w-full h-12 pl-3 pr-10 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                    placeholder="Member name" />
                            </div>
                            <p v-if="!checkDataIsNotEmpty.fullname" class="text-red-500 text-[12px] mt-2">Vui lòng nhập
                                họ tên thành
                                viên
                            </p>
                        </div>
                        <div class="w-full mb-8 min-w-[200px]">
                            <label for="position">Chức vụ</label>
                            <div class="relative flex items-center h-12">
                                <input v-model="memberData.position" type="text" id="position"
                                    class="mt-2 w-full h-12 pl-3 pr-10 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                    placeholder="Member position" />
                            </div>
                            <p v-if="!checkDataIsNotEmpty.position" class="text-red-500 text-[12px] mt-2">Vui lòng chức
                                vụ thành viên
                            </p>
                        </div>

                        <div class="w-full mb-8 min-w-[200px]">
                            <label for="avatar">Chọn ảnh đại diện</label>
                            <div class="relative flex items-center h-12">
                                <input type="file" ref="file" accept=".jpg, .jpeg, .png" id="avatar" @change="onchange"
                                    class="mt-2 w-full h-12 pl-3 pr-10 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow" />

                            </div>
                            <p v-if="!checkDataIsNotEmpty.avatar" class="text-red-500 text-[12px] mt-2">Vui lòng chọn
                                ảnh đại diện
                            </p>
                        </div>
                        <Loading v-if="loading"></Loading>
                        <img v-else class="rounded-md" :src="memberData.avatar" alt="">
                        <button @click="checkForm()"
                            class="flex mt-5 items-center rounded-md bg-gradient-to-tr from-slate-800 to-slate-700 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                            type="button">
                            Thêm thành viên
                        </button>
                    </div>
                </div>
                <div class="col-span-1">
                    <div class=" shadowBox mb-8 bg-white p-6 rounded-md border border-solid">
                        <div class="mb-5">
                            <div class="flex gap-5">
                                <p class="text-xl font-semibold ">Danh sách thành viên</p>
                                <label class="switch">
                                    <input @click="hiddenTeam()" type="checkbox" :checked="isActiveTeam">
                                    <span class="slider round"></span>
                                </label>
                            </div>
                            <div>
                                <p v-if="isActiveTeam" class="text-[12px] text-blue-500">Đang hiển thị danh sách thành
                                    viên</p>
                                <p v-else class="text-[12px] text-red-500">Đã ẩn danh sách thành viên</p>
                            </div>
                        </div>

                        <div class=" hover:bg-[#e6e6e6] py-4 px-4 cursor-pointer transition-all duration-500 memberBox mb-2 rounded-md"
                            v-for="member in membersList">
                            <div class="flex justify-between">
                                <div class="flex items-center gap-2">
                                    <img class="h-12 w-12 object-cover rounded-full" :src="member.avatar" alt="">
                                    <div>
                                        <p class=" font-semibold">{{ member.fullname }}</p>
                                        <p class="text-sm">{{ member.position }}</p>
                                    </div>
                                </div>
                                <div class="flex gap-2 iconBox">
                                    <div @click="editForm(member)" class="flex justify-center items-center p-2">
                                        <i class="fa-regular fa-pen-to-square"></i>
                                    </div>
                                    <div @click="deleteMember(member.id)" class="flex justify-center items-center p-2">
                                        <i class=" fa-solid fa-trash"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div :class="{ 'hidden': !isActive }"
                        class=" transition-all duration-500 grid shadowBox gap-4 mb-8 bg-white p-6 rounded-md border border-solid">
                        <p class="text-xl font-semibold">Chỉnh sửa thông tin</p>
                        <div>
                            <div class="w-full mb-6 min-w-[200px]">
                                <label for="facebook">Nhập tên mới</label>
                                <div class="relative flex items-center h-12">
                                    <input v-model="memberEditData.fullname" type="text" id="facebook"
                                        class="mt-2 w-full h-12 pl-3 pr-10 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                        placeholder="New Fullname" />
                                </div>
                                <p v-if="!checkDataIsNotEmptyOfUpdate.fullname" class="text-red-500 text-[12px] mt-2">
                                    Vui lòng
                                    nhập
                                    họ tên thành
                                    viên
                                </p>
                            </div>
                            <div class="w-full mb-6 mt-6 min-w-[200px]">
                                <label for="facebook">Nhập chức vụ mới</label>
                                <div class="relative flex items-center h-12">
                                    <input v-model="memberEditData.position" type="text" id="facebook"
                                        class="mt-2 w-full h-12 pl-3 pr-10 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                        placeholder="New Position" />
                                </div>
                                <p v-if="!checkDataIsNotEmptyOfUpdate.position" class="text-red-500 text-[12px] mt-2">
                                    Vui lòng
                                    chức
                                    vụ thành viên
                                </p>
                            </div>
                            <div class="w-full mb-6 min-w-[200px]">
                                <label for="avatar">Chọn ảnh đại diện</label>
                                <div class="relative flex items-center h-12">
                                    <input type="file" ref="file" accept=".jpg, .jpeg, .png" id="avatar"
                                        @change="onchangeUpdate"
                                        class="mt-2 w-full h-12 pl-3 pr-10 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow" />

                                    <div class="absolute h-full flex items-center right-2.5 text-slate-600">
                                        <i class="fa-regular fa-copy"></i>
                                    </div>
                                </div>
                                <p v-if="!checkDataIsNotEmptyOfUpdate.avatar" class="text-red-500 text-[12px] mt-2">Vui
                                    lòng
                                    chọn
                                    ảnh đại diện
                                </p>
                            </div>
                            <Loading v-if="loadingUpdate"></Loading>
                            <img v-else class="rounded-md" :src="memberEditData.avatar" alt="">
                            <div class="flex gap-4 mt-6">
                                <button @click="checkFormUpdate()"
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

<style>
.memberBox {
    box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
}


.iconBox div:first-child:hover i {
    color: #3b82f6;
}

.iconBox div:hover i {
    color: #ef4444;
}

/* Button Toggle */
.switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;
}

.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    -webkit-transition: .4s;
    transition: .4s;
}

.slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    -webkit-transition: .4s;
    transition: .4s;
}

input:checked+.slider {
    background-color: #2196F3;
}

input:focus+.slider {
    box-shadow: 0 0 1px #2196F3;
}

input:checked+.slider:before {
    -webkit-transform: translateX(26px);
    -ms-transform: translateX(26px);
    transform: translateX(26px);
}

/* Rounded sliders */
.slider.round {
    border-radius: 34px;
}

.slider.round:before {
    border-radius: 50%;
}
</style>