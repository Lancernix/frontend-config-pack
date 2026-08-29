<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  title: string;
}

// script setup 写法：defineProps 是编译器宏，无需 import；直接解构是推荐写法（3.5+ 响应式 props 解构）
const { title } = defineProps<Props>();
const count = ref(0);
</script>

<template>
  <div class="demo">
    <h1>{{ title }}</h1>
    <button type="button" @click="count++">count: {{ count }}</button>
  </div>
</template>

<style scoped>
.demo {
  padding: 16px;
}
</style>
