<template>
  <div class="mb-6 flex">
    <input
      v-model="localEmail"
      type="text"
      placeholder="Set alert email"
      class="flex-grow border border-gray-300 rounded-lg p-3 mr-4 text-lg"
    />
    <button @click="submit" class="bg-green-500 text-white px-6 py-3 rounded-lg text-lg">
      Set Email
    </button>
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from 'vue';

const props = defineProps<{ email: string }>();
const emit = defineEmits(['updated']);

const localEmail = ref('');

watchEffect(() => {
  localEmail.value = props.email || '';
});

const submit = () => {
  emit('updated', localEmail.value);
};
</script>
