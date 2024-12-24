import { QuestionarieData } from '@/types/QuestionaireTypes';
import axios from 'axios';

export const submitQuestionaire = async (data: QuestionarieData) => {
    try {
      const response = await axios.post(`http://localhost:8000/api/${data.source.toLowerCase()}/submit`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };