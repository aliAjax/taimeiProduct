
import React, { Component } from 'react';
import { store } from './../../store/index';
import Axios from "./../../utils/axiosInterceptors";
import emitter from '../../utils/events';
import style from './../../static/css/demandList/roleDemand.scss';
import AirportDemand from './airportDemand';
import AirlineDemand from './airlineDemand';

let page = 1;
export default class RoleDemand extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pageCount: 0,
            data: null,
            queryNum: props.queryNum,
        }
    }
    getMyDemandData(page, fn) {
        let itia = store.getState().role.airlineretrievalcondition;
        if (itia) {
            Axios({
                method: 'post',
                url: 'getDemandsByCurrentCheckedAirportForEmployee',
                params: {
                    page: page
                }
            }).then((response) => {
                let data = response.data;
                if (data.opResult === '0') {
                    // 判断后再调用函数
                    if (data.list.list) {
                        fn(data.list.list, data.list.pageCount);
                    } else {
                        console.log('error roleDemand')
                    }
                }
            })
            .catch((error) => {
                console.log(error)
            })
        }
    }
    setDemandData(page) {
        this.getMyDemandData(page, (data, pageCount) => {
            this.setState((ag) => {
                let list = ag.data ? ag.data : [];
                let newData = list.concat(data);
                this.state.queryNum(newData.length)
                return {
                    pageCount: pageCount,
                    data: newData
                }
            })
        })
    }
    componentWillMount() {  // 将要渲染
        this.setDemandData(page)
    }
    handleRoleDemandScrollBottom = () => {
        if (page >= this.state.pageCount)
            return;
        page++;
        this.setDemandData(page);
    }
    componentDidMount() {   // 加载渲染完成
        let _this = this;
        this.demandItemClick = emitter.addEventListener('demandItemClick', (id) => {
        })
        this.scrollBottom = emitter.addEventListener('roleDemandScrollBottom', (id) => {
            _this.handleRoleDemandScrollBottom()
        })
    }
    componentWillUnmount() {  // 卸载组件时
        page = 1;
        // this.demandItemClick.remove();
        // this.scrollBottom.remove();
    }
    render() {
        let content = '';
        if (this.state.data) {
            content = store.getState().role.role === '1' ? <AirportDemand data={this.state.data} /> : <AirlineDemand data={this.state.data} />;
        }
        return (
            <div className={style['roleDemand']}>
                {content}
            </div>
        )
    }
}