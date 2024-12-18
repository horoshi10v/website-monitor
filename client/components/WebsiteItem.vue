<template>
  <div class="flex flex-col py-3 border-b last:border-b-0">
    <div class="flex justify-between items-center">
      <div class="flex items-center">
        <div class="text-lg font-bold mr-3">{{ index + 1 }}.</div>
        <div
          v-if="website.status?.includes('Up')"
          class="w-4 h-4 rounded-full bg-green-500 mr-2"
          title="Up"
        ></div>
        <div
          v-else-if="website.status?.includes('Down')"
          class="w-4 h-4 rounded-full bg-red-500 mr-2"
          title="Down"
        ></div>
        <div
          v-else-if="website.status?.includes('Error')"
          class="w-4 h-4 rounded-full bg-yellow-500 mr-2"
          title="Error"
        ></div>
        <span class="text-lg font-medium break-all mr-3">{{ website.url }}</span>
      </div>
      <div class="flex items-center">
        <button
          :disabled="disabled"
          @click="$emit('manualCheck')"
          class="text-blue-500 font-semibold text-lg mr-4 disabled:opacity-50"
        >
          Check
        </button>
        <button
          @click="$emit('deleteWebsite')"
          class="text-red-500 font-semibold text-lg"
        >
          Delete
        </button>
      </div>
    </div>

    <div class="text-sm text-gray-700 mt-2">
      Status: {{ website.status || '...' }}
    </div>

    <div class="text-sm text-gray-500 mt-2">
      Last Checked: {{ formatDate(website.lastChecked) }}
    </div>

    <div class="text-sm text-gray-500 mt-2 flex items-center">
      <span class="mr-2">Next Check In: {{ getNextCheckIn(website.lastChecked, website.interval, currentTime) }}</span>
      <button @click="toggleEditInterval" class="text-blue-500 text-xs">
        Edit Interval
      </button>
    </div>

    <div v-if="editingInterval" class="flex items-center mt-2">
      <input
        type="number"
        v-model="localIntervalValue"
        placeholder="Interval (minutes)"
        class="border border-gray-300 rounded-lg p-2 text-sm mr-4 w-24"
      />
      <button @click="saveInterval" class="text-blue-500 text-xs">
        Save
      </button>
      <button @click="cancelEditInterval" class="text-gray-500 text-xs ml-2">
        Cancel
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useTimeFormatting } from '@/composables/useTimeFormatting';
import { Website } from '~/types/website';

const props = defineProps<{
  website: Website;
  disabled: boolean;
  index: number;
  currentTime: number;
}>();

const emit = defineEmits(['manualCheck', 'deleteWebsite', 'updateInterval']);

const editingInterval = ref(false);
const localIntervalValue = ref(0);

const toggleEditInterval = () => {
  editingInterval.value = !editingInterval.value;
  if (editingInterval.value) {
    localIntervalValue.value = props.website.interval;
  }
};

const cancelEditInterval = () => {
  editingInterval.value = false;
};

const saveInterval = () => {
  emit('updateInterval', localIntervalValue.value);
  editingInterval.value = false;
};

const { formatDate, getNextCheckIn } = useTimeFormatting();
</script>
