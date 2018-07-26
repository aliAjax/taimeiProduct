/* eslint-disable */

import {store} from "../../store/index";

/** 即时通讯
 *  @param {w} ws的地址
 *  @param {obj} 传入的tim...对象
 *  author Allan
 * */
export default class ChatSocket{
    constructor(w,obj){
        this.online(w);
        this.ws.onopen = () => {
            console.log('打开连接');
        };
        this.ws.onmessage = (data) => {
            let chat = JSON.parse(data.data),chatFlag;
            console.log(chat)
            switch (chat.type) {
                case "message" || "remind":
                    break;
                case "system":
            };
            if(chat.type === "isChat"){
                chatFlag = chat.chatFlag;
            }else if(chat.type === "system"){
                chatFlag = "x-t-null";
            }else{
                chatFlag = chat.data.chatFlag;
            };
            let selfId = store.getState().role.id;
            try{
                if (chat.type === "message" || chat.type === "remind") {
                    if(obj.state.chatData.hasOwnProperty(chatFlag)){
                        if (obj.state.chatData[chatFlag].chatRcord == null) {
                            obj.state.chatData[chatFlag].chatRcord = {
                                list: []
                            }
                        };
                        obj.state.chatData[chatFlag].chatRcord.list.splice(0, 0, chat.data);
                        if (chat.data.chatFlag != obj.state.setId) {
                            obj.state.chatData[chatFlag].noReadCount = 1;
                        }
                        // obj.state.chatData[chatFlag].modifyRcord.list.push(chat.data);
                    }else{
                        let a = chatFlag.split("-");
                        obj.openChat({
                            fromNameId:selfId,
                            toNameId:selfId === Number(a[0]) ?  Number(a[1]) : Number(a[0]),
                            responsePlanId:a[2]
                        },false);
                    }
                } else if (chat.type === "system") {
                    obj.state.chatData["x-t-null"].chatRcord.list.splice(0, 0, chat.data);
                    if ( obj.state.setId != "x-t-null") {
                        obj.state.chatData["x-t-null"].noReadCount = 1;
                    }
                }else if(chat.type === "isChat"){
                    if(!obj.state.chatData.hasOwnProperty(chatFlag)){
                        let a = chatFlag.split("-");
                        obj.openChat({
                            fromNameId:selfId,
                            toNameId:selfId === Number(a[0]) ? a[1] : a[0],
                            responsePlanId:a[2]
                        },false);
                    }else{
                        obj.state.chatData[chatFlag].isSendMessage =  chat.isSendMessage;
                    }
                };
                obj.setState(()=>({
                    chatData:obj.state.chatData
                }),function () {
                    obj.updateNum();
                })
            }catch (e){
                console.log(e)
            }
        };
        this.ws.onclose = () => {
            console.log('关闭连接');
        };
        this.ws.onerror = () => {
            console.log('error连接错误');
        };
    }
    online(w){
        if ('WebSocket' in window) {
            this.ws = new WebSocket(w);
        } else if ('MozWebSocket' in window) {
            this.ws = new MozWebSocket(w);
        } else {
            alert("not support");
        };
    }
}