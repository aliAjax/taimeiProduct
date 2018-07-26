import React, {Component} from 'react';
import styles from '../../static/css/components/payEarnestMoney.scss'
import Axios from "./../../utils/axiosInterceptors";
import { store } from '../../store/index'
import { Modal } from 'antd';
import emitter from "../../utils/events";
import Btn from "../button/btn";
import DealPwd from '../dealPwd/dealPwd';

export default class PayEarnestMoney extends Component {
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
        let employeeId = store.getState().role.id;
        let demandId = this.state.data.demandId;
        Axios({
            method: 'post',
            url: '/frezzIntentionMoney',
            params:{  // 一起发送的URL参数
                demandId: demandId,
                employeeId: employeeId
            },
            // data: JSON.stringify(demand),
            dataType:'json',
            headers: {
                'Content-type': 'application/json;charset=utf-8'
            }
        }).then((response)=>{
            if(response.data.opResult === '0') {
                emitter.emit("againMap");
                emitter.emit('renewItemDetailForm1');
                emitter.emit('renewWodefabu');
                this.success('发布成功！');
                this.props.close('1');
            }else {
                this.error(response.data.msg);
                this.props.close('2');
            }
        })
    }
    sureClickFn() {
        this.setState({
            showDealPwd: true,
        });
    }
    closeClickFn() {
        this.success('已保存至个人中心-我的发布，请及时支付意向金并发布需求');
        this.props.close();
        emitter.emit('renewItemDetailForm1');
    }
    dealCloseFn(i) {  // 交易密码关闭
        if(i == 1) {  // 1:验证成功-关闭，2：点击“取消”关闭
            this.sendSure();
        }else {
            this.closeClickFn();
        }
        emitter.emit('renewItemDetailForm1');
    }
    forgetPwd() {  // 忘记密码

    }
    componentDidMount() {
        this.setState({
            data: this.props.data
        })
    }
    render() {
        return (
            <div className={styles['earnest-wrapper']}>
                {this.state.showDealPwd
                    ? <DealPwd close={this.dealCloseFn.bind(this)}
                               forgetPwd={this.forgetPwd.bind(this)} />
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
