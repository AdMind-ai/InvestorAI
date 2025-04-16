import { data } from 'react-router-dom';
import { api } from './api';
import ResponseInterface from '../interfaces/responseInterface';

export const getProfiles = async () : Promise<ResponseInterface>=> {
  const response = await api.get("ayrshare/profiles/");
  if (response.status === 200){
    return {
        type: "success",
        data: response.data,
    }
  }
  else {
    return {
        type: "error",
        data: response.data,
    }
  }
};

export const postProfiles = async () : Promise<ResponseInterface>=> {
  const response = await api.post("ayrshare/profiles/");
  if (response.status === 201 || response.status === 200){
    return {
        type: "success",
        data: response.data,
    }
  }
  else {
    return {
        type: "error",
        data: response.data,
    }
  }
};

export const getProfileKey = async (id:int) : Promise<ResponseInterface>=> {
    const response = await api.get(`ayrshare/profilekey/${id}/`);	
    if (response.status === 200){
      return {
          type: "success",
          data: response.data,
      }
    }
    else {
      return {
          type: "error",
          data: response.data,
      }
    }
  };

  export const getProfilePosts= async (url:str) : Promise<ResponseInterface>=> {
    const response = await api.get(url);	//?status=scheduled
    if (response.status === 200){
      return {
          type: "success",
          data: response.data,
      }
    }
    else {
      return {
          type: "error",
          data: response.data,
      }
    }
  };


