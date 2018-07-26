// author:wangli time:2018-07-19 content:个人中心-账单模块
/* eslint-disable */
import React, { Component, Fragment } from 'react';
import Contract from '../../../components/Contract/contract';
import { Menu, Dropdown, Icon, Pagination, Button, Modal, message, Spin } from 'antd';
import { host as $host } from "./../../../utils/port";
import { store } from "../../../store/index";
import Axios from "./../../../utils/axiosInterceptors";
import BillsBox from "../../../components/bills/billsBox";
import style from "../../../static/css/bills/bills.scss";
import emitter from "../../../utils/events";

export default class Bills extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showSpin: true,
            accountsDueTotal: "",//"应收应付合计金额",
            arrearageTotal: "",//未收未付合计金额
            showDetailsList: [],//是否显示详情状态列表
            role: "",//角色类型
            shouldDoName: "",//根据角色类型判断显示 应付款或应收款
            demandTypeList: [],//需求类型列表
            demandName: "需求类型",//需求类型显示文字
            statusName: "状态",//状态显示文字
            billState: "",//状态参数
            demandType: "",//需求类型参数
            paginType: false,//分页条样式判断 true为有数据
            noDataType: false,
            /*
             item数据格式
            */
            itemPage: 1,//页码 必传
            itemPageNo: 8,//页大小
            itemTotal: 0,//总条数
            /*
             详情数据格式
            */
            page: 1,
            pageNo: 5,
            demandId: "",//需求ID
            total: 0,
            status: [
                { key: 2, name: "全部" },
                { key: 1, name: "未结清" },
                { key: 0, name: "已结清" },
            ],
            initData: [],
            tableType: false,//false 为不显示合同
            id: "",//合同id
            numText: "",//保证金提示
            downType: false,//是否支持下载 false为不能
            contractList: {
                jichangName: "",
                hangsiName: "",
                dptName: "",
                pstName: "",
                arrvName: "",
                dptCity: "",
                pstCity: "",
                arrvCity: "",
                dpt_time: "00:01,02:11",
                pst_time: "00:01,02:11",
                pst_time_back: "00:21,03:56",
                arrv_time: "00:01,02:11",
                days: "1/3",
                sailingTime: "2018.02.03,2018.2.4",
                quoteNumberUppercase: "",
                quote_type: "",
                quoted_price: "",
                fixed_subsidy_price: "",
                bottom_subsidy_price: "",
                quoteNumber: "",
                remark: "",
                airCrftTyp: "",
            },//合同数据列表
        }
    }

    componentWillMount() {  // 将要渲染
        let pathName=window.location.href.split("/");
        let demandData=pathName[(pathName.length)-1].split("=");
        if(demandData[0]=="demandId"){
            this.showWorkEvent(true,demandData[1])
        };
        //判断角色类型
        emitter.emit("openFrom", { openFrom: false, fromType: "" });
        let role = store.getState().role.role;
        let demandTypeList = this.state.demandTypeList;
        let initData = this.state.initData;
        let shouldDoName;
        if (role == 0) {
            demandTypeList = [
                { key: 5, name: "全部" },
                { key: 0, name: "航线需求" },
                { key: 1, name: "运力投放" },
                // {key:4,name:"委托运力需求"}
            ];
            shouldDoName = "收";
        } else {
            demandTypeList = [
                { key: 5, name: "全部" },
                { key: 0, name: "航线需求" },
                { key: 1, name: "运力投放" },
                // {key:3,name:"委托航线需求"}
            ];
            shouldDoName = "付";
        };
        this.setState({
            role,
            demandTypeList,
            shouldDoName,
            id:demandData[1]
        });
        Axios({
            method: 'post',
            url: '/findPersonalBillList',
            params: {
                page: this.state.itemPage,
                pageNo: this.state.itemPageNo
            },
            headers: {
                'Content-type': 'application/x-www-form-urlencoded'
            }
        }).then((response) => {
            let data = response.data;
            if (data.opResult == 0) {
                let showDetailsList = [];
                for (let i = 0; i < data.list.list.length; i++) {
                    showDetailsList.push({ id: data.list.list[i].demandId, type: false })
                };
                let noDataType=false;
                if(data.list.list.length==0){
                    noDataType=true;
                };
                let paginType = true;
                if (data.list.totalCount <= 8) {
                    paginType = false
                };
                this.setState({
                    initData: data.list.list,
                    itemTotal: data.list.totalCount,
                    accountsDueTotal: data.accountsDueTotal,
                    showDetailsList,
                    paginType,
                    noDataType,
                    arrearageTotal: data.arrearageTotal,
                    showSpin: false
                })
            } else {
                this.setState({
                    noDataType: true,
                    paginType: false,
                    accountsDueTotal: "-",
                    arrearageTotal: "-",
                    showSpin: false
                })
            }
        })
    }

    componentDidMount() {   // 加载渲染完成

    }
    componentWillReceiveProps(nextProps) {  // Props发生改变
    }
    componentWillUnmount() {  // 卸载组件

    }
    //子组件返回是否显示
    showDetailEvent(data, id) {
        let showDetailsList = this.state.showDetailsList;
        for (let i = 0; i < showDetailsList.length; i++) {
            if (showDetailsList[i].id == id) {
                showDetailsList[i].type = !showDetailsList[i].type;
            } else {
                showDetailsList[i].type = false
            }
        };
        this.setState({
            showDetailsList
        })
    }

    showWorkEvent(data,id){//data:子组件返回点击关闭合同事件 true为关闭 id:合同id
        let tableType=id==this.state.id?data:true;//根据返回的id和当前存储的id判断是否关闭合同组件
        this.setState({
            tableType,
            id
        })
    }

    // //点击获取合同数据
    // showWorkEvent(data, id) {//data:是否支持下载 id：合同id
    //     Axios({
    //         method: 'post',
    //         url: '/seeSailingAgreement',
    //         params: {
    //             id
    //         },
    //         headers: {
    //             'Content-type': 'application/x-www-form-urlencoded'
    //         }
    //     }).then((response) => {
    //         if (response.data.opResult == 3) {
    //             message.error('未查到相关交易记录，请联系客服');
    //         } else if (response.data.opResult == 4) {
    //             if (id == this.state.showId) {
    //                 this.setState({
    //                     tableType: data,
    //                     showId: id,
    //                     contractList: response.data,
    //                     numText: "保证金数据异常，请及时联系客服"
    //                 });
    //             } else {
    //                 this.setState({
    //                     tableType: true,
    //                     showId: id,
    //                     contractList: response.data,
    //                     numText: "保证金数据异常，请及时联系客服"
    //                 });
    //             };
    //         } else {
    //             if (id == this.state.showId) {
    //                 this.setState({
    //                     tableType: data,
    //                     showId: id,
    //                     contractList: response.data,
    //                     downType: true
    //                 });
    //             } else {
    //                 this.setState({
    //                     tableType: true,
    //                     showId: id,
    //                     contractList: response.data,
    //                     downType: true
    //                 });
    //             };
    //         };
    //     })
    // }

    //关闭详情显示模块
    closeDetail() {
        this.setState({
            tableType: false
        });
    }

    //需求类型下拉事件
    changeDemand(num) {
        let demandType = num;
        let demandName = this.state.demandName;
        switch (num) {
            case "5":
                demandName = "全部";
                demandType = "";
                break;
            case "0":
                demandName = "航线需求";
                break;
            case "1":
                demandName = "运力投放";
                break;
            case "3":
                demandName = "委托航线";
                break;
            case "4":
                demandName = "委托运力";
                break;
            default:
                break;
        }
        ;
        this.setState({
            demandType,
            demandName
        });
        Axios({
            method: 'post',
            url: '/findPersonalBillList',
            params: {
                page: 1,
                pageNo: this.state.itemPageNo,
                demandType,
                billState: this.state.billState
            },
            headers: {
                'Content-type': 'application/x-www-form-urlencoded'
            }
        }).then((response) => {
            let data = response.data;
            if (data.opResult == 0) {
                let showDetailsList = [];
                for (let i = 0; i < data.list.list.length; i++) {
                    showDetailsList.push({ id: data.list.list[i].demandId, type: false })
                };
                let noDataType=false;
                if(data.list.list.length==0){
                    noDataType=true;
                };
                let paginType = true;
                if (data.list.totalCount <= 8) {
                    paginType = false
                };
                this.setState({
                    initData: data.list.list,
                    itemTotal: data.list.totalCount,
                    accountsDueTotal: data.accountsDueTotal,
                    showDetailsList,
                    paginType,
                    arrearageTotal: data.arrearageTotal,
                    noDataType,
                    page: 1
                })
            }else if(data.opResult == 1){
                this.setState({
                    initData:[],
                    paginType: false,
                    noDataType: true,
                    page: 1
                })
            }else {
                this.setState({
                    initData:[],
                    paginType: false,
                    noDataType: true,
                });
            };
        })
    }

    //更改item分页事件
    changeItemPage(pageNumber) {
        this.setState({
            page: pageNumber
        });
        Axios({
            method: 'post',
            url: '/findPersonalBillList',
            params: {
                page: pageNumber,
                pageNo: this.state.itemPageNo,
                demandType: this.state.demandType,
                billState: this.state.billState
            },
            headers: {
                'Content-type': 'application/x-www-form-urlencoded'
            }
        }).then((response) => {
            let data = response.data;
            if (data.opResult == 0) {
                let showDetailsList = [];
                for (let i = 0; i < data.list.list.length; i++) {
                    showDetailsList.push({ id: data.list.list[i].demandId, type: false })
                };
                this.setState({
                    initData: data.list.list,
                    itemTotal: data.list.totalCount,
                    accountsDueTotal: data.accountsDueTotal,
                    showDetailsList
                });
            }
        })
    }

    //状态下拉事件
    changeStatus(num) {
        let statusName;
        switch (num) {
            case "2":
                statusName = "全部";
                num = "";
                break;
            case "1":
                statusName = "未结清";
                break;
            case "0":
                statusName = "已结清";
                break;
            default:
                break;
        }
        ;
        this.setState({
            billState: num,
            statusName
        });
        Axios({
            method: 'post',
            url: '/findPersonalBillList',
            params: {
                page: 1,
                pageNo: this.state.itemPageNo,
                demandType: this.state.demandType,
                billState: num
            },
            headers: {
                'Content-type': 'application/x-www-form-urlencoded'
            }
        }).then((response) => {
            let data = response.data;
            if (data.opResult == 0 && data.list.list.length != 0) {
                let showDetailsList = [];
                for (let i = 0; i < data.list.list.length; i++) {
                    showDetailsList.push({ id: data.list.list[i].demandId, type: false })
                };
                let noDataType=false;
                if(data.list.list.length==0){
                    noDataType=true;
                };
                let paginType = true;
                if (data.list.totalCount <= 8) {
                    paginType = false
                };
                this.setState({
                    initData: data.list.list,
                    itemTotal: data.list.totalCount,
                    accountsDueTotal: data.accountsDueTotal,
                    showDetailsList,
                    paginType,
                    arrearageTotal: data.arrearageTotal,
                    noDataType,
                    page: 1
                });
            } else {
                this.setState({
                    initData: [],
                    paginType: false,
                    noDataType: true,
                });
            };
        })
    }

    render() {
        //需求类型下拉
        let _this = this;
        const onClickType = function ({ key }) {
            _this.changeDemand(key)
        };
        const menuType = (
            <Menu onClick={onClickType}>
                {
                    this.state.demandTypeList.map((item, key) => {
                        return <Menu.Item key={item.key}><span>{item.name}</span></Menu.Item>
                    })
                }
            </Menu>
        );
        //状态类型下拉
        const onClick = function ({ key }) {
            _this.changeStatus(key)
        };
        const menu = (
            <Menu onClick={onClick}>
                {
                    this.state.status.map((item, key) => {
                        return <Menu.Item key={item.key}><span>{item.name}</span></Menu.Item>
                    })
                }
            </Menu>
        );
        //总金额格式更改
        let accountsDueTotal = this.state.accountsDueTotal;
        let arrearageTotal = this.state.arrearageTotal;
        let billNum = "";
        if (accountsDueTotal.length <= 3) {
            billNum = accountsDueTotal;
        } else {
            for (let i = 0; i < parseInt(accountsDueTotal / 3); i++) {
                billNum = "," + accountsDueTotal.slice(-3) + billNum;
                accountsDueTotal = accountsDueTotal.slice(0, accountsDueTotal.length - 3);
                if (accountsDueTotal.length <= 3) {
                    break;
                }
            };
            billNum = accountsDueTotal + billNum;
        };
        let willBillNum = "";
        if (arrearageTotal.length <= 3) {
            willBillNum = arrearageTotal;
        } else {
            for (let i = 0; i < parseInt(arrearageTotal / 3); i++) {
                willBillNum = "," + arrearageTotal.slice(-3) + willBillNum;
                arrearageTotal = arrearageTotal.slice(0, arrearageTotal.length - 3);
                if (arrearageTotal.length <= 3) {
                    break;
                }
            };
            willBillNum = arrearageTotal + willBillNum;
        };
        //是否有数据显示
        let paginText = style['noShow'];
        let noPagin = style['noShow'];
        if (this.state.paginType) {
            paginText = style['pagin'];
        } else if (this.state.noDataType) {
            noPagin = style['noPagin'];
        };
        return (
            <div className={`scroll ${style['box']}`}>
                {/*downType:在合同数据请求成功后设置能下载 showID：合同id  closeDetail:关闭合同事件   contractList:接口请求返回的合同数据  */}
                { this.state.tableType&&
                    <Contract
                        // downType={this.state.downType}
                        // showId={this.state.showId}
                        showId={this.state.id}
                        closeDetail={()=>this.closeDetail()}
                        // contractList={this.state.contractList}
                    />}
                <div className={style['showMoneyBox']}>
                    <div>
                        <div className={style['showMoneyTitle']}>应{this.state.shouldDoName}合计金额(元)</div>
                        <div className={style['moneyNum']}>{billNum}</div>
                    </div>
                    <div>
                        <div className={style['showMoneyTitle']}>未{this.state.shouldDoName}合计金额(元)</div>
                        <div className={style['moneyNum']}>{willBillNum}</div>
                    </div>
                </div>
                <div className={style['status-title']}>
                    <div className={style['billTime']}>账单更新时间</div>
                    <div className={style['demandType']}>
                        <Dropdown overlay={menuType} trigger={['click']}>
                            <a className="ant-dropdown-link" href="#" style={{ textDecoration: "none" }}>
                                {this.state.demandName} <Icon type="caret-down" />
                            </a>
                        </Dropdown>
                    </div>
                    <div className={style['issueTitle']}>发布标题</div>
                    <div className={style['shouldDo']}>应{this.state.shouldDoName}款</div>
                    <div className={style['allState']}>
                        <Dropdown overlay={menu} trigger={['click']}>
                            <a className="ant-dropdown-link" href="#" style={{ textDecoration: "none" }}>
                                {this.state.statusName} <Icon type="caret-down" />
                            </a>
                        </Dropdown>
                    </div>
                </div>
                <div style={{ maxHeight: 560, overflowX: "hidden", overflowY: "scroll" }}>
                    {
                        this.state.initData.map((item, index) => {
                            return <BillsBox key={index} tableType={this.state.tableType} showDetailType={this.state.showDetailsList[index].type} detailsId={this.state.showDetailsList[index].id} data={item} role={this.state.role} showDetailEvent={(data, id) => this.showDetailEvent(data, id)}
                                             showWorkEvent={(data, id) => this.showWorkEvent(data, id)}
                            />
                        })
                    }
                </div>
                <div className={style['pagination']}>
                    <div className={paginText}>
                        <Pagination showQuickJumper defaultPageSize={parseInt(this.state.itemPageNo)} current={parseInt(this.state.page)} onChange={this.changeItemPage.bind(this)} total={parseInt(this.state.itemTotal)} />
                    </div>
                    <div className={noPagin}>
                        <span>暂无账单</span>
                    </div>
                    {(!this.state.paginType && !this.state.noDataType) ? <div style={{ width: "100%", height: 20 }}></div> : ""}
                </div>
                {this.state.showSpin ? <Spin size="large" style={{ width: '100%', zIndex: 100 }} /> : ""}
            </div>
        )
    }
}