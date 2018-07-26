import React, { Component } from 'react';
import classNames from 'classnames';
import { Steps } from 'antd';
import Axios from "./../../utils/axiosInterceptors";
import MesTip from './../../utils/messageTip';
import LoginInputText from './../../components/input/loginInputText';
import style from './../../static/css/loginAndRegister/loginMain.scss';
import stylerRed from './../../static/css/loginAndRegister/registered.scss';

const Step = Steps.Step;
export default class NewEmail extends  Component{
    constructor(props){
        super(props);
        this.state = {
            pas:this.props.email
        }
    }

    /**
     * 获取联系电话
     * */
    querDataLXFS(e){
        // e.target.value = e.target.value.replace(/\D/g,'');
        this.setState({
            pas: e.target.value
        });
    }
    /** 警告开始 **/
    /**
     * 联系方式输入框的警告信息
     * */
    tipInputPas(text){
        if(!this.hasOwnProperty('inputPas')){
            this.inputPas = new MesTip(this.refs.inputPas.refs.inputPas);
            this.inputPas.addNode();
        };
        this.inputPas.changeText(text);
    }


    returnPrev() {  // 返回上一步
        this.props.changeModel(10,'');
    }

    /** 警告结束 **/

    validationGS(){
        if(this.state.pas === ''){
            this.tipInputPas('请输入邮箱！');
        }else if(!(/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/.test(this.state.pas))) {
            this.tipInputPas('请输入正确邮箱！');
        }else {
            let email = this.state.pas;
            Axios({
                method: 'post',
                url: '/validEmail',
                params:{  // 一起发送的URL参数
                    email,
                    validType: 0
                },
                dataType:'json',
                headers: {
                    'Content-type': 'application/json;charset=utf-8'
                }
            }).then((response)=>{
                if(response.data.opResult== '0'){
                    this.props.changeModel(12,email);
                }else{
                    this.tipInputPas('*该邮箱已绑定!');
                }
            })
        }
    }
    componentDidMount() {

    }
    componentWillUnmount() {
        if(this.hasOwnProperty('inputPas')){
            this.inputPas.removeNode();
            delete this.inputPas;
        }
    }
    render(){
        return(
            <div className={classNames({[stylerRed['login-box']]:true,[style['login-h']]:true})} style={{height:"422px"}}>
                <Steps size="small" current={1} style={{display: 'flex', alignItems:'center', margin: '0 auto',paddingTop: '15px', width: '270px', height: '100px'}} >
                    <Step title="输入密码" />
                    <Step title="输入邮箱" />
                    <Step title="邮箱验证" />
                    <Step title="完成" />
                </Steps>
                <div className={stylerRed['box']} style={{height:"205px"}}>
                    <LoginInputText defaultValue={this.props.email} type={'text'} ref='inputPas' refId={'inputPas'} querData={this.querDataLXFS.bind(this)} className={style['input-margin']} maxLength={'50'} placeholder="请输入邮箱"/>
                </div>
                <div className={style['login-itme']} style={{justifyContent: 'flex-end', margin: '10px 0'}}>
                    <div className={style['forget-pas']}> </div>
                </div>
                <div className={stylerRed['stylerRed-btn']}>
                    <div className={classNames({"may-btn":true})} ref={'resetPwd'} onClick={this.validationGS.bind(this)}>下一步</div>
                    <div className={classNames({"may-btn-gary":true})} onClick={this.returnPrev.bind(this)}>返回上一步</div>
                </div>
                <div style={{textAlign:'center',height:'30px'}}>客服热线：028-65733800</div>
            </div>
        )
    }
}
