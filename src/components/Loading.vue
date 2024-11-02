<script setup lang="ts">

</script>

<template>

    <div class="flex flex-col items-center">
        <div class="donut mb-4">
        </div>
        <p class=" -tracking-tighter">Loading...</p>
    </div>
</template>

<style scoped>
.donut {
    width: 8rem;
    height: 8rem;
    border-radius: 50%;
    border: 0.3rem solid;
    border-color: rgba(#39465f, 0.3);
    border-top-color: #a8b5ce;
    animation: 1.5s spin infinite linear;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>