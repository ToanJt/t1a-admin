<template>
    <div class="spinner-box">
        <div class="circle-border">
            <div class="circle-core"></div>
        </div>
    </div>
</template>

<style scoped>
/* Loading spinner */
.spinner-box {
    width: 300px;
    height: 10rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
}

.circle-border {
    width: 100px;
    height: 100px;
    padding: 3px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background: rgb(63, 249, 220);
    background: linear-gradient(0deg, rgba(63, 249, 220, 0.1) 33%, rgba(63, 249, 220, 1) 100%);
    animation: spin .8s linear 0s infinite;
}

.circle-core {
    width: 100%;
    height: 100%;
    background-color: white;
    border-radius: 50%;
}

/* KEYFRAMES */
@keyframes spin {
    from {
        transform: rotate(0);
    }

    to {
        transform: rotate(359deg);
    }
}
</style>