
import {create} from 'zustand'
import { axiosInstance } from '../lib/axios'
import toast from "react-hot-toast";
import { io } from 'socket.io-client'

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/api"

export const useAuthStore = create((set,get) => ({
    authUser:null,

    isSigningUp:false,

    isLoggingIn:false,

    isCheckingAuth:true,

    isUpdatingProfile:false,

    onlineUsers:[],

    socket:null,



    checkAuth: async () => {
        try{
         const res = await axiosInstance.get("/auth/check")
         set({authUser:res.data})
         get().connectSocket()
        }
        catch(error){
          console.log('error in checking auth', error)
          set({authUser:null})
        
        }
        finally{
            set({isCheckingAuth:false})
        }
    },
    signup: async (data) => {
        set({ isSigningUp: true });
        try {
          const res = await axiosInstance.post("/auth/signup", data);
          set({ authUser: res.data });
          toast.success("Account created successfully");
          get().connectSocket()
          
        } catch (error) {
          toast.error(error.response.data.message);
        } finally {
          set({ isSigningUp: false });
        }
      },

      login : async(data) => {
        set({isLoggingIn:true})
        try{
          const res = await axiosInstance.post("/auth/login", data) 
          set({authUser:res.data})
          toast.success('logged in successfully')
          get().connectSocket()


        }
        catch(error){
          toast.error(error.response.data.message)
          console.log('error in login auth', error)
          
        }
        finally{
          set({isLoggingIn:false})
        }
      },

      logout : async() => {
        try{
          const res = await axiosInstance.post("/auth/logout")
          set({authUser:null})
          toast.success('logout successfully')
          get().disConnectSocket()
        }
        catch(error){
          console.log('error in logout controller')
          toast.error(error.response.data.message)
        }
      },
      updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
          const res = await axiosInstance.put("/auth/update-profile", data);
          set({ authUser: res.data });
          toast.success("Profile updated successfully");
        } catch (error) {
          console.log("error in update profile frontend:", error);
          const errorMsg = error?.response?.data?.message || "Something went wrong!";
          toast.error(errorMsg);
        } finally {
          set({ isUpdatingProfile: false });
        }
      },
      connectSocket:() => {
        const {authUser} = get()
        if (!authUser || get().socket?.connected) return;
        const socket = io(BASE_URL, {
          query:{
            userId:authUser._id
          }
        })
        socket.connect()
        set({socket:socket})
        socket.on('getOnlineUsers', (userIds) => {
          set({onlineUsers:userIds})
        })
      },
      disConnectSocket : () => {
        if (get().socket?.connected) get().socket.disconnect();
      },
}))