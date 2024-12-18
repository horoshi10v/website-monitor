<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="bg-white shadow-lg rounded-lg p-8 w-full max-w-4xl">
      <h1 class="text-3xl font-bold text-center mb-6">
        Healthcheck Monitor
      </h1>
      <AddWebsiteForm @added="handleAddWebsite" />
      <SetEmailForm :email="emailTo" @updated="handleSetEmail" />
      <WebsiteList
        :websites="websites"
        :disabledCheckButtons="disabledCheckButtons"
        :currentTime="currentTime"
        @manualCheck="manualCheck"
        @deleteWebsite="deleteWebsite"
        @updateInterval="updateInterval"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from 'vue';
import AddWebsiteForm from '@/components/AddWebsiteForm.vue';
import SetEmailForm from '@/components/SetEmailForm.vue';
import WebsiteList from '@/components/WebsiteList.vue';
import { useWebsites } from '@/composables/useWebsites';
import { useEmailSettings } from '@/composables/useEmailSettings';

export default {
  components: {
    AddWebsiteForm,
    SetEmailForm,
    WebsiteList,
  },
  setup() {
    const {
      websites,
      disabledCheckButtons,
      fetchWebsites,
      addWebsite,
      deleteWebsite,
      manualCheck,
      saveUpdatedInterval,
      currentTime
    } = useWebsites();

    const { emailTo, fetchEmailTo, setEmailTo } = useEmailSettings();

    const timeIntervalId = ref<number | null>(null);

    const minNextCheck = computed(() => {
      let minDiff = Infinity;
      for (const site of websites.value) {
        if (!site.lastChecked) continue;
        const lastChecked = new Date(site.lastChecked).getTime();
        const nextCheck = lastChecked + site.interval * 60000;
        const diff = nextCheck - currentTime.value;
        if (diff < minDiff) {
          minDiff = diff;
        }
      }
      return minDiff;
    });

    const checkNextFetch = () => {
      if (minNextCheck.value <= 0) {
        fetchWebsites();
      }
    };

    onMounted(async () => {
      await fetchWebsites();
      await fetchEmailTo();
      timeIntervalId.value = window.setInterval(() => {
        currentTime.value = Date.now();
        checkNextFetch();
      }, 1000);
    });

    onBeforeUnmount(() => {
      if (timeIntervalId.value) clearInterval(timeIntervalId.value);
    });

    const handleAddWebsite = async (url: string, interval: number) => {
      await addWebsite(url, interval);
    };

    const handleSetEmail = async (email: string) => {
      await setEmailTo(email);
    };

    const updateInterval = async (url: string, interval: number) => {
      await saveUpdatedInterval(url, interval);
    };

    return {
      websites,
      disabledCheckButtons,
      emailTo,
      handleAddWebsite,
      handleSetEmail,
      manualCheck,
      deleteWebsite,
      updateInterval,
      currentTime,
    };
  },
};
</script>

<style>
body {
  margin: 0;
  font-family: 'Arial', sans-serif;
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
