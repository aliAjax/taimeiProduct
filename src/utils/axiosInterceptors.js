import Axios from 'axios';

let open = false;

Axios.defaults.method = "post";
Axios.interceptors.request.use( (config)=> {
    // 在发送请求之前做些什么
    return config;
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});
function pd(){
    if(!open){
        open = true;
        try {
            Axios({
                method: 'post',
                url: '/isLogin',
                headers: {
                    'Content-type': 'application/x-www-form-urlencoded'
                }
            })
                .then((response) => {
                    if(response){
                        if(response.data.opResult !== "0"){
                            alert("登录失效，即将跳转到登录界面");
                            sessionStorage.removeItem("role");
                            window.location.reload();
                        }else{
                            setTimeout(()=>{
                                open = false;
                            },2500);
                        }
                    }
                });
        }catch (e){

            console.log(e);
        }
    }
}
Axios.interceptors.response.use(
    data => {
        if(JSON.stringify(data.data).includes("<!DOCTYPE html>")){
            pd();
            return false;
        }
        return data;
    },
    error => {
        if(error.response.status === 403){
            pd();
        }
        return Promise.reject(error)
    }
);

export default Axios;