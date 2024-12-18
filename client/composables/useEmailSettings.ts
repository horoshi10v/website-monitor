import { ref } from 'vue';
import axios from 'axios';

export function useEmailSettings() {
  const API_URL = process.env.API_URL || 'http://localhost:3002';
  const emailTo = ref('');

  const fetchEmailTo = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/get-email`);
      emailTo.value = data.email || '';
    } catch (error) {
      console.error('Error fetching email:', error);
    }
  };

  const setEmailTo = async (email: string) => {
    try {
      await axios.post(`${API_URL}/set-email`, { email });
      emailTo.value = email;
    } catch (error) {
      console.error('Error setting email:', error);
    }
  };

  return { emailTo, fetchEmailTo, setEmailTo };
}
