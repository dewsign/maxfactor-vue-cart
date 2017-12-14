<template>
    <a>
        <svg class="header__icon" xmlns="http://www.w3.org/2000/svg" width="22.1" height="21.8" viewBox="0 0 22.1 21.8" role="img" aria-label="Cart">
            <path d="M926.6,136.8v1c0,.2-.4,5.2-.6,6.3a3.6,3.6,0,0,1-3.3,2.9l-9.2,1.1v-1.9l9-1.1a1.7,1.7,0,0,0,1.7-1.3c.1-.7.3-3.2.5-5.1H911.2v9.7a1.1,1.1,0,0,0,1.2,1.1h12.6v1.9H912.4a3,3,0,0,1-3.1-3V137.8a1.4,1.4,0,0,0-1.4-1.3h-3.5v-1.9h3.5a3.3,3.3,0,0,1,3.1,2.3Zm-13.5,17.6a1.9,1.9,0,1,1-1.9-1.9A1.9,1.9,0,0,1,913.1,154.5Zm12,0a1.9,1.9,0,1,1-1.9-1.9A1.9,1.9,0,0,1,925.1,154.5Z" transform="translate(-904.4 -134.6)"/>
        </svg>
        <span>{{ getCount }}</span>
    </a>
</template>

<script>
    export default {
        props: [
            'count',
        ],
        computed: {
            getCount() {
                return this.count
            },
        },
    }
</script>
