import React, {Component} from 'react';
import styles from '../../static/css/components/payEarnestMoney.scss'
import Axios from "./../../utils/axiosInterceptors";
import { Modal } from 'antd';
import emitter from "../../utils/events";
import Btn from "../button/btn";
import DealPwd from '../dealPwd/dealPwd';

export default class PayEarnestMoneyChen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showDealPwd: false,
            noMsgCesuan: false,
            data: {}, // 从父组件获取的数据
        };
    }
    success(mes) {
        Modal.success({
            title: mes,
        });
    }
    error(mes) {
        Modal.error({
            title: mes,
        });
    }
    sendSure() {
        this.state.data.savatype = 2;  // 1-保存方案(会成为待支付)，2-正式提交，3-保存草稿，4-机场申请测算时先保存草稿
        Axios({
            method: 'post',
            url: '/responseAdd',
            /*params:{  // 一起发送的URL参数
                demandId: demandId,
                employeeId: employeeId
            },*/
            data: JSON.stringify(this.state.data),
            dataType:'json',
            headers: {
                'Content-type': 'application/json;charset=utf-8'
            }
        }).then((response)=>{
            if(response.data.opResult === '0') {
                emitter.emit("againMap");
                this.success('提交成功！');
                emitter.emit('renewDataFn');
                this.props.close('1');
            }else {
                this.props.close('2');
                this.error(response.data.msg);
            }
        })
    }
    sureClickFn() {
        this.setState({
            showDealPwd: true,
        });
    }
    dealCloseFn(i) {  // 交易密码关闭
        if(i == 1) {  // 1:验证成功-关闭，2：点击“取消”关闭
            this.sendSure();
        }else {
            this.closeClickFn();
        }
    }
    forgetPwd() {  // 忘记密码

    }
    closeClickFn() {
        this.state.data.savatype = 1;  // 1-保存方案(会成为待支付)，2-正式提交，3-保存草稿，4-机场申请测算时先保存草稿
        Axios({
            method: 'post',
            url: '/responseAdd',
            /*params:{  // 一起发送的URL参数
                demandId: demandId,
                employeeId: employeeId
            },*/
            data: JSON.stringify(this.state.data),
            dataType:'json',
            headers: {
                'Content-type': 'application/json;charset=utf-8'
            }
        }).then((response)=>{
            if(response.data.opResult === '0') {
                this.props.close('1');
                this.success('已为您保存方案，可在下次点击查看！');
            }else {
                this.error(response.data.msg);
                this.props.close('2');
            }
        })
    }
    componentDidMount() {
        this.setState({
            data: this.props.data
        })
    }
    render() {
        return (
            <div className={styles['earnest-wrapper']}>
                {
                    this.state.showDealPwd
                        ? <DealPwd close={this.dealCloseFn.bind(this)}
                                   forgetPwd={this.forgetPwd.bind(this)}/>
                        : <div className={styles['container']}>
                            <div className={styles['top']}>
                                <span>支付意向金</span>
                                <span className={`iconfont ${styles['close-icon']}`}
                                      onClick={this.closeClickFn.bind(this)}>&#xe62c;</span>
                            </div>
                            <div className={styles['content']}>
                                <div>
                                    <div>{this.state.data.title}</div>
                                    <div>意向金</div>
                                </div>
                                <div>-{this.state.data.intentionMoney}</div>
                            </div>
                            <div className={styles['buttons']}>
                                <div>
                                    <Btn text='确认'
                                         btnType="1"
                                         otherText="支付中"
                                         isDisable={this.state.noMsgCesuan}
                                         styleJson={{ width: "190px" }}
                                         onClick={()=> { this.sureClickFn()} } />
                                </div>
                                {/*<div className={'btn-b'} onClick={this.sureClickFn.bind(this)}>确认</div>*/}
                                <div className={'btn-w'} onClick={this.closeClickFn.bind(this)}>稍后再付</div>
                            </div>
                        </div>
                }
            </div>
        )
    }
}
