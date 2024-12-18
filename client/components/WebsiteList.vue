<template>
  <div>
    <WebsiteItem
      v-for="(website, i) in websites"
      :key="website.url"
      :website="website"
      :index="i"
      :disabled="disabledCheckButtons[website.url] || false"
      :currentTime="currentTime"
      @manualCheck="$emit('manualCheck', website.url)"
      @deleteWebsite="$emit('deleteWebsite', website.url)"
      @updateInterval="$emit('updateInterval', website.url, $event)"
    />
  </div>
</template>

<script lang="ts" setup>
import WebsiteItem from './WebsiteItem.vue';
import { Website } from '~/types/website';

defineProps<{
  websites: Website[];
  disabledCheckButtons: Record<string, boolean>;
  currentTime: number;
}>();

defineEmits(['manualCheck', 'deleteWebsite', 'updateInterval']);
</script>
