<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { db } from '../firebaseConfig'
import { getDocs, collection, DocumentData } from 'firebase/firestore'
import slugify from 'slugify';
import Loading from '../components/Loading.vue';
import type { ImageData } from '../types/imageData';
import { computed } from '@vue/reactivity';

const projects = ref<DocumentData[]>([]);
let filterBySize = ref('all');
let filterByType = ref('all');
let project360 = ref(false);
let filterByName = ref('');
const projectsFilter = computed(() => {
    return projects.value.filter((project) => {
        console.log(project);
        const sizeMatches = filterBySize.value === 'all' || project.size === filterBySize.value;
        const typeMatches = filterByType.value === 'all' || project.type === filterByType.value;
        const nameMatches = filterByName.value === '' || project.name.toLowerCase().startsWith(filterByName.value.toLowerCase());
        const is360Matches = !project360.value || project.is360 === project360.value;
        return sizeMatches && typeMatches && nameMatches && is360Matches;
    })
})

// Function to convert DocumentData to ImageData
const convertToImageData = (docData: DocumentData): ImageData => {
    return {
        name: docData.name || '',
        largeURL: docData.images[0] || '',
        thumbnailURL: docData.images[0] || '',
        widthOrigin: docData.widthOrigin || null,
        heightOrigin: docData.heightOrigin || null,
        description: docData.description || null,
        client: docData.client || null,
        year: docData.year || null,
        type: docData.type || null,
        size: docData.size || null,
        is360: docData.is360,
        link360: docData.link360 || null
    };
};

const router = useRouter();
const createProject = () => {
    router.push('/new-project')
}

const loadingPage = ref(true);
onMounted(async () => {
    const projectsFromFirebase = await getDocs(collection(db, 'projects'));
    projectsFromFirebase.forEach((project) => {
        console.log(project.data());
        projects.value.push(convertToImageData(project.data()));
    })
    loadingPage.value = false;
})

</script>

<template>
    <div>
        <h1 class="text-3xl font-bold">Projects Dashboard</h1>
        <div class="w-full flex items-center justify-between gap-2 relative mt-4">
            <div class="flex gap-2">
                <div class="relative min-w-[300px] ">
                    <input type="text" v-model="filterByName"
                        class="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-10 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                        placeholder="Nhập tên dự án cần tìm" />
                    <button
                        class="absolute right-1 top-1 rounded bg-slate-800 p-1.5 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                        type="button">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4">
                            <path fill-rule="evenodd"
                                d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                                clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
                <div class="w-full max-w-sm min-w-[200px]">
                    <div class="relative">
                        <select v-model="filterBySize"
                            class="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded pl-3 pr-8 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md appearance-none cursor-pointer">
                            <option value="all">All</option>
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                        </select>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.2"
                            stroke="currentColor" class="h-5 w-5 ml-1 absolute top-2.5 right-2.5 text-slate-700">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                        </svg>
                    </div>
                </div>
                <div class="w-full max-w-sm min-w-[200px]">
                    <div class="relative">
                        <select v-model="filterByType"
                            class="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded pl-3 pr-8 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md appearance-none cursor-pointer">
                            <option value="all">All</option>
                            <option value="full-project">Full Project</option>
                            <option value="exterior">Exterior</option>
                            <option value="interior">Interior</option>
                        </select>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.2"
                            stroke="currentColor" class="h-5 w-5 ml-1 absolute top-2.5 right-2.5 text-slate-700">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                        </svg>
                    </div>
                </div>
                <div class="ml-2 flex items-center gap-1">
                    <input v-model="project360" class="h-5 w-5 cursor-pointer" type="checkbox" name="" id="360">
                    <label class="cursor-pointer" for="360">360°</label>
                </div>
            </div>
            <button @click="createProject()"
                class="flex items-center rounded-md bg-slate-800 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                type="button">
                <p class="mr-1.5">+</p>
                Thêm dự án mới
            </button>
        </div>
        <div v-if="loadingPage" class="h-96 flex justify-center items-center">
            <Loading></Loading>
        </div>
        <div v-else class="mt-12 grid grid-cols-3 gap-6">
            <div v-for="project in projectsFilter"
                class="relative rounded-md project-image cursor-pointer overflow-hidden ">
                <router-link :to="{ name: 'update-project', params: { id: slugify(project.name) } }" class="relative ">
                    <img class=" transition-all duration-500 " :src="project.thumbnailURL"
                        :alt="project.description || undefined" />
                    <div
                        class="project-description transition-all duration-500  text-white p-6 bg-vr-light-gray-blur flex flex-col justify-center items-center absolute top-0 left-0 right-0 bottom-0">
                        <h1 class="text-2xl text-center mb-2">{{ project.name }}</h1>
                        <div class="flex justify-center w-full">
                            <p class="text-15 mx-2">Client: {{ project.client }}</p>
                            <div class="flex items-center">
                                <Icon icon="mdi:dot" width="1em" height="1em" style="color: white" />
                            </div>
                            <p class="text-15 mx-2">Year: {{ project.year
                                }}</p>
                            <div class="flex items-center">
                                <Icon icon="mdi:dot" width="1em" height="1em" style="color: white" />
                            </div>
                            <p class="text-15 mx-2">{{ project.type }}</p>
                        </div>
                    </div>
                </router-link>
            </div>
        </div>
    </div>
</template>

<style scoped>
.card-project:hover {
    transform: translateY(-8px);
}

.card-project:hover img {
    transform: scale(1.1)
}

.project-description {
    opacity: 0;
}

.project-image:hover .project-description {
    opacity: 1;
}

.project-image:hover img {
    transform: scale(1.1);
}

.activeOption {
    color: black;
    border-bottom: 1px solid black;
}

li {
    color: #727272;
    background-size: 200% 100%;
    background-position: -100%;
    display: inline-block;
    padding: 3px 0;
    position: relative;
    transition: all 0.3s ease-in-out;
}

li:before {
    content: '';
    background: black;
    display: block;
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 0;
    height: 1px;
    transition: all 0.3s ease-in-out;
}

li:hover {
    background-position: 0;
}

li:hover::before {
    width: 100%;
}
</style>