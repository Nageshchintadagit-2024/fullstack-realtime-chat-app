import {create} from 'zustand'

import { axiosInstance } from '../lib/axios'

import toast from 'react-hot-toast'

import {useAuthStore} from './authStore.js'


export const useChatStore = create((set,get) => ({
    users:[],

    messages:[],

    selectedUser:null,

    isUsersLoading:false,

    isMessagesLoading:false,

    getUsers : async () => {
        set({isUsersLoading:true})
        try{
          const res = await axiosInstance.get("/messages/users")
          set({users:res.data})
        }
        catch(error){
          toast.error(error?.response?.data?.message || 'Something went wrong')
          console.log("Error in getusers frontend", error)
        }
        finally{
            set({isUsersLoading:false})
        }

    }, 
    getMessages : async(userId) => {
        set({isMessagesLoading:true})
        try{
         const res = await axiosInstance.get(`/messages/chat/${userId}`)
          set({messages:res.data})
        }
        catch(error){
        toast.error(error.response.data.message)
        console.log('Error in getMessages frontend', error)
        }
        finally{
            set({isMessagesLoading:false})
        }
    },

    sendMessage : async (messageData) => {
      const {selectedUser, messages} =get()
      try{
        const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData)
        set({messages:[...messages, res.data]})
      }
      catch(error){
        toast.error(error?.response?.data?.message || 'Something Went Wrong')
      }
    },

    setSelectedUser : (selectedUser) => {
      set({selectedUser})
    },

    subscribeToMessages : () => {
      const {selectedUser} = get()
      if (!selectedUser) return;
      const socket = useAuthStore.getState().socket
      socket.on('newMessage', (newMessage) => {

        const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id 

        if (!isMessageSentFromSelectedUser) return;

        set({messages:[...get().messages,newMessage]})
      })
    },
    unsubscribeFromMessages : () => {
      const socket = useAuthStore.getState().socket
      socket.off('newMessage');
    }




}))