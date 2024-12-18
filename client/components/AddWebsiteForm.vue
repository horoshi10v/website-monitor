<template>
  <div class="mb-6 flex">
    <input
      v-model="url"
      type="text"
      placeholder="Enter website URL"
      class="flex-grow border border-gray-300 rounded-lg p-3 mr-4 text-lg"
    />
    <input
      v-model="interval"
      type="number"
      placeholder="Interval (minutes)"
      class="w-48 border border-gray-300 rounded-lg p-3 mr-4 text-lg"
    />
    <button @click="submit" class="bg-blue-500 text-white px-6 py-3 rounded-lg text-lg">
      Add
    </button>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const url = ref('');
const interval = ref(1);

const emit = defineEmits(['added']);

const submit = () => {
  if (url.value && interval.value > 0) {
    emit('added', url.value, interval.value);
    url.value = '';
    interval.value = 1;
  } else {
    alert('Please enter a valid URL and interval.');
  }
};
</script>
