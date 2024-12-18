import { ref } from 'vue';
import axios from 'axios';
import {Website} from "~/types/website";

export function useWebsites() {
  const API_URL = process.env.API_URL || 'http://localhost:3002/';
  const websites = ref<Website[]>([]);
  const disabledCheckButtons = ref<Record<string, boolean>>({});
  const currentTime = ref(Date.now());

  const fetchWebsites = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/list`);
      websites.value = data;
    } catch (error) {
      console.error('Error fetching websites:', error);
    }
  };

  const addWebsite = async (url: string, interval: number) => {
    try {
      await axios.post(`${API_URL}/add`, { url, interval });
      await fetchWebsites();
    } catch (error) {
      console.error('Error adding website:', error);
    }
  };

  const deleteWebsite = async (url: string) => {
    try {
      await axios.post(`${API_URL}/delete`, { url });
      await fetchWebsites();
    } catch (error) {
      console.error('Error deleting website:', error);
    }
  };

  const manualCheck = async (url: string) => {
    disabledCheckButtons.value[url] = true;
    try {
      await axios.post(`${API_URL}/check-one`, { url });
      await fetchWebsites();
    } catch (error) {
      console.error('Error checking website:', error);
    } finally {
      disabledCheckButtons.value[url] = false;
    }
  };

  const saveUpdatedInterval = async (url: string, interval: number) => {
    try {
      await axios.post(`${API_URL}/update-interval`, { url, interval });
      await fetchWebsites();
    } catch (error) {
      console.error('Error updating interval:', error);
    }
  };

  return {
    websites,
    disabledCheckButtons,
    fetchWebsites,
    addWebsite,
    deleteWebsite,
    manualCheck,
    saveUpdatedInterval,
    currentTime,
  };
}
