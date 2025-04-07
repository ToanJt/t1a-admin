<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { collection, doc, DocumentData, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const customers = ref<DocumentData[]>([])
const sortOrder = ref('desc');

function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
}

function sendEmail(email: string) {
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`);
}

const newCustomers = computed(() => {
    const filtered = customers.value.filter(customer => !customer.isRead);

    return filtered.sort((a, b) => {
        const dateA = a.createAt?.toDate ? a.createAt.toDate() : new Date(a.createAt);
        const dateB = b.createAt?.toDate ? b.createAt.toDate() : new Date(b.createAt);

        return sortOrder.value === 'desc'
            ? dateB - dateA // Giảm dần (mới nhất trước)
            : dateA - dateB; // Tăng dần (cũ nhất trước)
    });
});
const readCustomers = computed(() =>
    customers.value.filter((customer) => customer.isRead == true)
);

async function readEmail(documentId: any) {
    const newStatus = true;
    try {
        const customerRef = doc(db, 'customers', documentId);
        await updateDoc(customerRef, {
            isRead: newStatus,
        });
        const index = customers.value.findIndex((c) => c.id === documentId);
        if (index !== -1) {
            customers.value[index].isRead = newStatus;
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật:', error);

    }
}

async function unReadEmail(documentId: any) {
    const newStatus = false;

    try {
        const customerRef = doc(db, 'customers', documentId);
        await updateDoc(customerRef, {
            isRead: newStatus,
        });
        const index = customers.value.findIndex((c) => c.id === documentId);
        if (index !== -1) {
            customers.value[index].isRead = newStatus;
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật:', error);

    }
}

function formatDate(date: any): string {
    if (!date) return '';

    // Chuyển đổi từ Firestore Timestamp hoặc string sang Date object
    const d = date.toDate ? date.toDate() : new Date(date);

    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes} | ${day} thg ${month}, ${year}`;
}

onMounted(async () => {
    const q = query(collection(db, "customers"), orderBy("createAt", "desc"));
    const querySnapshot = await getDocs(q);
    customers.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Đảm bảo createAt là Date object
        createAt: doc.data().createAt?.toDate() || new Date()
    }));
})

</script>

<template>
    <div>
        <div class="border-b border-solid pb-4 mb-6">
            <h1 class="text-3xl font-bold">Feedback từ khách hàng</h1>
        </div>
        <div class="grid grid-cols-2 gap-5">
            <div class="border-r-[1px] ">
                <p class="text-2xl text-black pb-5">Email mới</p>
                <div class="flex items-center mb-4">
                    <button @click="sortOrder = sortOrder === 'desc' ? 'asc' : 'desc'"
                        class="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                        <span>Sắp xếp:</span>
                        <span class="font-medium">
                            {{ sortOrder === 'desc' ? 'Mới nhất trước' : 'Cũ nhất trước' }}
                        </span>
                        <i class="fas"
                            :class="sortOrder === 'desc' ? 'fa-arrow-down-wide-short' : 'fa-arrow-up-wide-short'"></i>
                    </button>
                </div>
                <div v-for="(customer) in newCustomers" :key="customer.id" class="">
                    <div class="flex items-center justify-between p-5 mr-5 border-b-[1px]">
                        <div class="grid grid-cols-8 items-center gap-8">
                            <div class=" col-span-4 checkbox-wrapper-33">
                                <label class="checkbox">
                                    <input class="checkbox__trigger visuallyhidden" type="checkbox"
                                        @change.prevent="readEmail(customer.id)" :checked="false" />
                                    <span class="checkbox__symbol">
                                        <svg aria-hidden="true" class="icon-checkbox" width="28px" height="28px"
                                            viewBox="0 0 28 28" version="1" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M4 14l8 7L24 7"></path>
                                        </svg>
                                    </span>
                                    <p class="checkbox__textwrapper">{{ customer.email }}</p>
                                </label>
                            </div>
                            <p class="col-span-1 cursor-pointer hover:text-green-500"
                                @click="copyToClipboard(customer.email)"><i
                                    class="fa-solid fa-copy text-green-500"></i><span class="text-sm">
                                    Copy</span></p>
                            <p class="col-span-2 text-[12px]">{{ formatDate(customer.createAt) }}</p>
                            <p @click="sendEmail(customer.email)"
                                class="col-span-1 cursor-pointer hover:text-green-500">
                                <i class="fa-solid fa-paper-plane"></i>
                                <span class="text-sm"> Gửi</span>
                            </p>
                        </div>

                    </div>
                </div>
            </div>
            <div>
                <p class="text-2xl text-black pb-5">Email đã xem</p>
                <div v-for="(customer) in readCustomers" :key="customer.id" class="">
                    <div class="flex items-center justify-between py-5 border-b-[1px]">
                        <div class="grid grid-cols-8 items-center gap-8">
                            <div class=" col-span-5 checkbox-wrapper-33">
                                <label class="checkbox">
                                    <input class="checkbox__trigger visuallyhidden" type="checkbox" :checked="true"
                                        @change="unReadEmail(customer.id)" />
                                    <span class="checkbox__symbol">
                                        <svg aria-hidden="true" class="icon-checkbox" width="28px" height="28px"
                                            viewBox="0 0 28 28" version="1" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M4 14l8 7L24 7"></path>
                                        </svg>
                                    </span>
                                    <p class="checkbox__textwrapper">{{ customer.email }}</p>
                                </label>
                            </div>
                            <p class="col-span-1 cursor-pointer hover:text-green-500"
                                @click="copyToClipboard(customer.email)"><i
                                    class="fa-solid fa-copy text-green-500"></i><span class="text-sm">
                                    Copy</span></p>
                            <p class="col-span-2 text-[12px]">{{ formatDate(customer.createAt) }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>




<style>
.checkbox-wrapper-33 {
    --s-xsmall: 0.625em;
    --s-small: 1.2em;
    --border-width: 1px;
    --c-primary: #5F11E8;
    --c-primary-20-percent-opacity: rgb(95 17 232 / 20%);
    --c-primary-10-percent-opacity: rgb(95 17 232 / 10%);
    --t-base: 0.4s;
    --t-fast: 0.2s;
    --e-in: ease-in;
    --e-out: cubic-bezier(.11, .29, .18, .98);
}

.checkbox-wrapper-33 .visuallyhidden {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
}

.checkbox-wrapper-33 .checkbox {
    display: flex;
    align-items: center;
    justify-content: flex-start;
}

.checkbox-wrapper-33 .checkbox+.checkbox {
    margin-top: var(--s-small);
}

.checkbox-wrapper-33 .checkbox__symbol {
    display: inline-block;
    display: flex;
    margin-right: calc(var(--s-small) * 0.7);
    border: var(--border-width) solid var(--c-primary);
    position: relative;
    border-radius: 0.1em;
    width: 1.5em;
    height: 1.5em;
    transition: box-shadow var(--t-base) var(--e-out), background-color var(--t-base);
    box-shadow: 0 0 0 0 var(--c-primary-10-percent-opacity);
}

.checkbox-wrapper-33 .checkbox__symbol:after {
    content: "";
    position: absolute;
    top: 0.5em;
    left: 0.5em;
    width: 0.25em;
    height: 0.25em;
    background-color: var(--c-primary-20-percent-opacity);
    opacity: 0;
    border-radius: 3em;
    transform: scale(1);
    transform-origin: 50% 50%;
}

.checkbox-wrapper-33 .checkbox .icon-checkbox {
    width: 1em;
    height: 1em;
    margin: auto;
    fill: none;
    stroke-width: 3;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-miterlimit: 10;
    color: var(--c-primary);
    display: inline-block;
}

.checkbox-wrapper-33 .checkbox .icon-checkbox path {
    transition: stroke-dashoffset var(--t-fast) var(--e-in);
    stroke-dasharray: 30px, 31px;
    stroke-dashoffset: 31px;
}

.checkbox-wrapper-33 .checkbox__textwrapper {
    margin: 0;
}

.checkbox-wrapper-33 .checkbox__trigger:checked+.checkbox__symbol:after {
    -webkit-animation: ripple-33 1.5s var(--e-out);
    animation: ripple-33 1.5s var(--e-out);
}

.checkbox-wrapper-33 .checkbox__trigger:checked+.checkbox__symbol .icon-checkbox path {
    transition: stroke-dashoffset var(--t-base) var(--e-out);
    stroke-dashoffset: 0px;
}

.checkbox-wrapper-33 .checkbox__trigger:focus+.checkbox__symbol {
    box-shadow: 0 0 0 0.25em var(--c-primary-20-percent-opacity);
}

@-webkit-keyframes ripple-33 {
    from {
        transform: scale(0);
        opacity: 1;
    }

    to {
        opacity: 0;
        transform: scale(20);
    }
}

@keyframes ripple-33 {
    from {
        transform: scale(0);
        opacity: 1;
    }

    to {
        opacity: 0;
        transform: scale(20);
    }
}
</style>
