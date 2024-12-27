import { QuestionarieData } from '@/types/QuestionaireTypes';
import axios from 'axios';

export const submitQuestionaire = async (data: QuestionarieData) => {
  try {
    const response = await axios.post(`http://localhost:8000/api/submit/${data.source.toLowerCase()}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};