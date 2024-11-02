<script setup lang="ts">
import { collection, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'
import { onMounted, reactive, ref } from 'vue';
import Loading from '../components/Loading.vue';
import { toast } from 'vue3-toastify';

const contact = reactive({
    facebookLink: '',
    whatsappLink: '',
    instagramLink: '',
    fiverrLink: '',
    locationEmbed: '',
    address: '',
    emailAddress: '',
    phone: '',
    slogan: '',
})

const checkDataIsNotEmpty = reactive({
    facebookLink: true,
    whatsappLink: true,
    instagramLink: true,
    locationEmbed: true,
    address: true,
    emailAddress: true,
    phone: true,
})

const checkForm = () => {
    checkDataIsNotEmpty.facebookLink = checkDataIsNotEmpty.whatsappLink = checkDataIsNotEmpty.instagramLink;
    checkDataIsNotEmpty.locationEmbed = checkDataIsNotEmpty.address = checkDataIsNotEmpty.emailAddress = checkDataIsNotEmpty.phone = true;
    if (contact.facebookLink && contact.whatsappLink
        && contact.instagramLink && contact.locationEmbed
        && contact.address && contact.emailAddress && contact.phone) {
        updateContact();
    }
    if (!contact.facebookLink)
        checkDataIsNotEmpty.facebookLink = false;
    if (!contact.whatsappLink)
        checkDataIsNotEmpty.whatsappLink = false;
    if (!contact.instagramLink)
        checkDataIsNotEmpty.instagramLink = false;
    if (!contact.locationEmbed)
        checkDataIsNotEmpty.locationEmbed = false;
    if (!contact.address)
        checkDataIsNotEmpty.address = false;
    if (!contact.emailAddress)
        checkDataIsNotEmpty.emailAddress = false;
    if (!contact.phone)
        checkDataIsNotEmpty.phone = false;
}

function convertEmbedToSrc(embedLink: string) {
    const endSrc = ref(0);
    if (embedLink[0] == '<') {
        for (let i = 13; i < embedLink.length; i++) {
            if (embedLink[i] == `"`) {
                endSrc.value = i;
                break;
            }
        }
    } else {
        return embedLink;
    }
    return (embedLink.substring(13, endSrc.value));
}

async function updateContact() {
    contact.locationEmbed = convertEmbedToSrc(contact.locationEmbed);
    try {
        const contactCollection = await getDocs(collection(db, 'contacts'));
        contactCollection.forEach((item) => {
            updateDoc(item.ref, {
                facebook: contact.facebookLink,
                instagram: contact.instagramLink,
                whatsapp: contact.whatsappLink,
                fiverr: contact.fiverrLink,
                location: contact.locationEmbed,
                address: contact.address,
                email: contact.emailAddress,
                phone: contact.phone,
                slogan: contact.slogan
            })
            toast.info("Cập nhật thành công !")
            return;
        })
    } catch (error) {
        console.log("Failed " + error)
    }
}

const loadingPage = ref(true);
onMounted(async () => {
    try {
        const contactCollection = await getDocs(collection(db, 'contacts'));
        contactCollection.forEach((item) => {
            contact.facebookLink = item.data().facebook;
            contact.whatsappLink = item.data().whatsapp;
            contact.instagramLink = item.data().instagram;
            contact.fiverrLink = item.data().fiverr;
            contact.locationEmbed = item.data().location;
            contact.address = item.data().address;
            contact.emailAddress = item.data().email;
            contact.phone = item.data().phone;
            contact.slogan = item.data().slogan;
            return;
        })
    } catch (error) {
        console.log("Failed " + error)
    }
    loadingPage.value = false;
})

</script>

<template>
    <div class="">
        <div class="border-b border-solid pb-4 mb-6">
            <h1 class="text-3xl font-bold">Quản lý Contact</h1>
        </div>
        <div v-if="loadingPage" class="h-96 flex justify-center items-center">
            <Loading></Loading>
        </div>
        <form v-else class=" w-full">
            <div class="grid grid-cols-2 gap-8 mb-8">
                <div class="col-span-1">
                    <div class=" shadowBox mb-8 bg-white p-6 rounded-md border border-solid">
                        <div class="w-full mb-8 min-w-[200px]">
                            <label for="facebook"><i class="fa-brands fa-facebook"></i> Facebook</label>
                            <div class="relative flex items-center h-12">
                                <input v-model="contact.facebookLink" type="text" id="facebook"
                                    class="mt-2 w-full h-12 pl-3 pr-10 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                    placeholder="Facebook address" />

                            </div>
                            <p v-if="!checkDataIsNotEmpty.facebookLink" class="text-red-500 text-[12px] mt-2">Địa chỉ
                                Facebook không được để trống !
                            </p>
                        </div>
                        <div class="w-full mb-8 min-w-[200px]">
                            <label for="whatsapp"><i class="fa-brands fa-whatsapp"></i> Whatsapp</label>
                            <div class="relative flex items-center h-12">
                                <input v-model="contact.whatsappLink" type="text" id="whatsapp"
                                    class="mt-2 w-full h-12 pl-3 pr-10 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                    placeholder="Whatsapp address" />


                            </div>
                            <p v-if="!checkDataIsNotEmpty.whatsappLink" class="text-red-500 text-[12px] mt-2">Địa chỉ
                                Whatsapp không được để trống !
                            </p>
                        </div>
                        <div class="w-full mb-8 min-w-[200px]">
                            <label for="instagram"><i class="fa-brands fa-instagram"></i> Instagram</label>
                            <div class="relative flex items-center h-12">
                                <input v-model="contact.instagramLink" type="text" id="instagram"
                                    class="mt-2 w-full h-12 pl-3 pr-10 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                    placeholder="Instagram address" />
                            </div>
                            <p v-if="!checkDataIsNotEmpty.instagramLink" class="text-red-500 text-[12px] mt-2">Địa chỉ
                                Instagram không được để trống !
                            </p>
                        </div>

                        <div class="w-full mb-8 min-w-[200px]">
                            <label for="location"> <i class="fa-solid fa-map-location-dot"></i> Vị trí</label>
                            <div class="relative flex items-center h-12">
                                <input v-model="contact.locationEmbed" type="text" id="location"
                                    class="mt-2 w-full h-12 pl-3 pr-10 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                    placeholder="Location embed in map" />
                            </div>
                            <p v-if="!checkDataIsNotEmpty.locationEmbed" class="text-red-500 text-[12px] mt-2">Vui lòng
                                cung cấp vị trí embed trên Google Map !
                            </p>
                        </div>
                    </div>
                </div>
                <div class="col-span-1">
                    <div class=" shadowBox mb-8 bg-white p-6 rounded-md border border-solid">
                        <div class="w-full mb-8 min-w-[200px]">
                            <label for="address"><i class="fa-solid fa-location-dot"></i> Địa chỉ</label>
                            <div class="relative flex items-center h-12">
                                <input v-model="contact.address" type="text" id="address"
                                    class="mt-2 w-full h-12 pl-3 pr-10 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                    placeholder="Address" />
                            </div>
                            <p v-if="!checkDataIsNotEmpty.address" class="text-red-500 text-[12px] mt-2">Vui lòng cung
                                cấp địa chỉ !
                            </p>
                        </div>
                        <div class="w-full mb-8 min-w-[200px]">
                            <label for="email"><i class="fa-solid fa-at"></i> Email</label>
                            <div class="relative flex items-center h-12">
                                <input v-model="contact.emailAddress" type="email" id="email"
                                    class="mt-2 w-full h-12 pl-3 pr-10 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                    placeholder="Email address" />
                            </div>
                            <p v-if="!checkDataIsNotEmpty.emailAddress" class="text-red-500 text-[12px] mt-2">Vui lòng
                                nhập email !
                            </p>
                        </div>
                        <div class="w-full mb-8 min-w-[200px]">
                            <label for="phone"><i class="fa-solid fa-phone"></i> Số điện thoại</label>
                            <div class="relative flex items-center h-12">
                                <input v-model="contact.phone" type="number" id="phone"
                                    class="mt-2 w-full h-12 pl-3 pr-10 py-2 bg-transparent placeholder:text-slate-400 text-slate-600 text-sm border border-slate-200 rounded-md transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                    placeholder="Phone number" />
                            </div>
                            <p v-if="!checkDataIsNotEmpty.phone" class="text-red-500 text-[12px] mt-2">Vui lòng nhập số
                                điện thoại !
                            </p>
                        </div>

                    </div>

                    <div class=" shadowBox flex gap-4 mb-8 bg-white p-6 rounded-md border border-solid">
                        <button @click="checkForm()"
                            class="flex items-center rounded-md bg-gradient-to-tr from-slate-800 to-slate-700 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                            type="button">
                            Cập nhật
                        </button>
                    </div>
                </div>
            </div>
        </form>
    </div>
</template>

<style>
.shadowBox {
    box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
}
</style>