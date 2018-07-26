/* eslint-disable */

import React, { Component } from 'react';
import echarts from 'echarts';
import Axios from './../../utils/axiosInterceptors';
import {zs} from "./bmapResources";
import round from './../../static/img/map/yuan.png'
import {airMes} from './../../utils/airMes';
import emitter from '../../utils/events';
import './../../static/js/officialLibrary/bmap';
import style from './../../static/css/mapStyle/mapmodality.scss'
import {store} from "../../store";
import {routesData} from './../../utils/mapAssembly'



export default class Maps extends Component{
    constructor(props){
        super(props);
        this.state = {
            myChart:null,
            style:{},
            allDot:[],
            routeNetwork:[],
            option:{},
            tagType:true
        };
        this.ar = {
            data:{},
            instance:[]
        };
        this.lines = {a:6};
        this.colorList = [];
    }
    componentWillMount(){
    }
    componentDidMount() {
        this.setState({
            style:{
                width:document.body.clientWidth,
                height:document.body.clientHeight
            }
        });
        // let a = this.mapDidMount();
        this.mapDidMount();
    }
    componentWillUnmount(){
    }
    async mapDidMount(){
        await this.reData();
        let option = this.initData();
        this.setOption(option);
    }
    async reData(){
        return await new Promise((resolve, reject) => {
            let routeNetwork = new Promise(function (resolve, reject) {
                Axios({
                    method: 'post',
                    url: '/getAirlineNetwork',
                    headers: {
                        'Content-type': 'application/x-www-form-urlencoded'
                    }
                })
                    .then((response) => {
                        if(response.data.opResult === '0'){
                            window.localStorage.setItem("airlineNetwork",JSON.stringify(response.data.data));
                            resolve(response.data);
                        }
                    })
                    .catch((error) => {
                            console.log(error);
                        }
                    );
            });
            let allDemands = new Promise(function (resolve, reject) {
                Axios({
                    method: 'post',
                    url: '/getAllDemands',
                    headers: {
                        'Content-type': 'application/x-www-form-urlencoded'
                    }
                })
                    .then((response) => {
                        if(response.data.msg === '查询成功'){
                            let arr = [];
                            response.data.dataNew.forEach((val) => {
                                if (
                                    val.cityCoordinateJ != null &&
                                    val.cityCoordinateW != null &&
                                    val.dpt != null &&
                                    val.num != null
                                ) {
                                    arr.push(val)
                                }
                            });
                            resolve(arr);
                        }
                    })
                    .catch((error) => {
                            console.log(error);
                        }
                    );
            });
            Promise.all([routeNetwork,allDemands]).then((results)=>{
                this.setState(function (data) {
                    return{
                        routeNetwork:results[0],
                        allDot:results[1]
                    }
                },()=>{
                    resolve()
                });
            })
        })
    }
    initData(){
        let point= [],
            ar = {},
            waypoint = [] // 航点
        ;
        for(let key in this.state.routeNetwork.data){
            // this.state.routeNetwork.data[key]
            let er = [];
            let selAir = airMes(store.getState().airList,key);
            if(this.state.routeNetwork.data[key].hasOwnProperty("zf")){
                this.state.routeNetwork.data[key]["zf"].forEach((v)=>{
                    let ourAir = airMes(store.getState().airList,v);
                    er.push({
                        fromMes:selAir,
                        toMes:ourAir,
                        fromName:selAir.airlnCd,
                        toName:ourAir.airlnCd,
                        coords:[[selAir.cityCoordinateJ,selAir.cityCoordinateW],[ourAir.cityCoordinateJ,ourAir.cityCoordinateW]],
                        type:0, // 0,直飞、1，经停
                    })
                });
            }
            if(this.state.routeNetwork.data[key].hasOwnProperty("jt")){
                this.state.routeNetwork.data[key]["jt"].forEach((v)=>{
                    let lastOurAir = selAir;
                    v[0].forEach((jtData)=>{
                        lastOurAir = airMes(store.getState().airList,jtData);
                        er.push({
                            fromMes:selAir,
                            toMes:lastOurAir,
                            fromName:selAir.airlnCd,
                            toName:lastOurAir.airlnCd,
                            coords:[[selAir.cityCoordinateJ,selAir.cityCoordinateW],[lastOurAir.cityCoordinateJ,lastOurAir.cityCoordinateW]],
                            type:1, // 0,直飞、1，经停
                        });
                    });
                    let lastOurAirEnd = airMes(store.getState().airList,v[1]);
                    er.push(
                        {
                            fromMes:lastOurAir,
                            toMes:lastOurAirEnd,
                            fromName:lastOurAir.airlnCd,
                            toName:lastOurAirEnd.airlnCd,
                            coords:[[lastOurAir.cityCoordinateJ,lastOurAir.cityCoordinateW],[lastOurAirEnd.cityCoordinateJ,lastOurAirEnd.cityCoordinateW]],
                            type:1, // 0,直飞、1，经停
                        }
                    );
                });
            }
            ar[key] = er;
            waypoint.push(
                {
                    name: selAir.airlnCd,
                    value: [selAir.cityCoordinateJ,selAir.cityCoordinateW],
                    symbol: 'circle',
                    symbolSize: 10,
                    symbolOffset: [0, 0],
                    type:6,
                    mes:selAir
                }
            )
        }
        // 组装自己航线网图
        if(this.state.routeNetwork.list !== undefined){
            let er = [];
            this.state.routeNetwork.list.forEach((data)=>{
                let odata = data.split('-');
                let s1 = airMes(store.getState().airList,odata[0]);
                let s2 = airMes(store.getState().airList,odata[1]);
                er.push({
                    fromMes:s1,
                    toMes:s2,
                    fromName:s1.airlnCd,
                    toName:s2.airlnCd,
                    coords:[[s1.cityCoordinateJ,s1.cityCoordinateW],[s2.cityCoordinateJ,s2.cityCoordinateW]],
                    type:0, // 0,直飞、1，经停
                });
            });
            ar[store.getState().role.airlineretrievalcondition] = er;
        }
        this.ar.data = ar;
        store.getState().airList.forEach(data =>{
            point.push( {
                name: data.airlnCd,
                value: [data.cityCoordinateJ,data.cityCoordinateW],
                symbol: 'circle',
                symbolSize: 4,
                symbolOffset: [0, 0]
            })
        });
        let allPoint = {
                "name": "allPoint",
                "type": "scatter",
                "coordinateSystem": "bmap",
                "zlevel": 8,
                itemStyle:{
                    normal:{
                        color:"#336BEA"
                    }
                },
                hoverAnimation:false,
                cursor:"default",
                "data": point
            };
        let rs = routesData(this.state.allDot);
        this.rs = rs;
        let airD = airMes(store.getState().airList,store.getState().role.airlineretrievalcondition);
        let option = {
            "bmap": {
                "center": store.getState().role.role === '0' ? ["110.47", "32.40"] : [airD.cityCoordinateJ,airD.cityCoordinateW], //
                "zoom": 6,
                "color": "red",
                "roam": "true",
                "type": 'bmap',
                "mapStyle": zs
            },
            legend:{
                show:false,
                data: ['allPoint','pao','tags'],
                textStyle: {
                    color: '#fff'
                },
                selectedMode: 'multiple',
                selected:{
                    'pao-market':store.getState().role.viewMode === 0 ? true : false,  // 市场需求-气泡模式
                    'cutline-market':store.getState().role.viewMode === 0 ? false : true, // 市场需求-图例模式
                    'pao-release':false, // 我的发布-气泡模式
                    'cutline-release':false, // 我的发布-图例模式
                    'allPoint':false, // 所有航点
                    'waypoint':false
                }
            },
            "tooltip": {
                "show":false,
                "showDelay":0,
                "enterable":"true",
                "alwaysShowContent":"true",
                "triggerOn":"click",
                "trigger":"item"
            },
            "series": [
                {
                    'name': 'pao-market',  // 气泡模式
                    "type": "scatter",
                    "coordinateSystem": "bmap",
                    "data": rs[0],
                    "zlevel": 10,
                    "symbolSize": 120,
                    "label": {
                        "normal": {
                            "show": true,
                            color: 'white',
                            "formatter": function (v) {
                                return '';
                            },
                            offset: [0, -2]

                        },
                        "emphasis": {"show": false},
                    },
                    "itemStyle": {
                        normal:{
                            "color":"#fdbc22"
                        }
                    }
                },
                {
                    'name': 'cutline-market', // 图例模式
                    "type": "scatter",
                    "coordinateSystem": "bmap",
                    "data": rs[1],
                    "zlevel": 10,
                    "symbolSize": 50,
                    "label": {
                        "normal": {
                            "show": true,
                            color: 'white',
                            "formatter": function (v) {
                                return '';
                            },
                            offset: [0, -2]

                        },
                        "emphasis": {"show": false},
                    },
                    "itemStyle": {
                        normal:{
                            "color":"#fdbc22"
                        }

                    }
                },
                {
                    'name': 'pao-release',  // 气泡模式
                    "type": "scatter",
                    "coordinateSystem": "bmap",
                    "data": rs[2],
                    "zlevel": 10,
                    "symbolSize": 120,
                    "label": {
                        "normal": {
                            "show": true,
                            color: 'white',
                            "formatter": function (v) {
                                return '';
                            },
                            offset: [0, -2]
                        },
                        "emphasis": {"show": false},
                    },
                    "itemStyle": {
                        normal:{
                            "color":"#fdbc22"
                        }
                    }
                },
                {
                    'name': 'cutline-release', // 图例模式
                    "type": "scatter",
                    "coordinateSystem": "bmap",
                    "data": rs[3],
                    "zlevel": 10,
                    "symbolSize": 50,
                    "label": {
                        "normal": {
                            "show": true,
                            color: 'white',
                            "formatter": function (v) {
                                return '';
                            },
                            offset: [0, -2]

                        },
                        "emphasis": {"show": false},
                    },
                    "itemStyle": {
                        normal:{
                            "color":"#fdbc22"
                        }
                    }
                },
                {
                    "name": "waypoint",
                    "type": "scatter",
                    "coordinateSystem": "bmap",
                    "zlevel": 8,
                    itemStyle:{
                        normal:{
                            color:"#605E7C"
                        }
                    },
                    "label":{"normal":{"show":false,"position":"right","formatter":"{b}"},"emphasis":{"show":true}},
                    "data": waypoint
                },
                allPoint
            ]
        };
        return option;
    }
    setOption(option){
        let myChart =  echarts.init(this.refs.maps);
        myChart.setOption(option);
        this.map = myChart.getModel().getComponent('bmap').getBMap();
        emitter.addEventListener("marketRelease",(type = null)=>{
            if(type === null){
                type = this.state.tagType;
            }else{
                this.setState({
                    tagType:type
                },()=>{
                    emitter.emit("showLines",this.code);
                });
            };
            if(type){
                myChart.dispatchAction({
                    type: 'legendSelect',
                    name:store.getState().role.viewMode === 0 ? "pao-market" : "cutline-market"
                });
                myChart.dispatchAction({
                    type: 'legendUnSelect',
                    name:store.getState().role.viewMode === 0 ? "cutline-market" : "pao-market"
                });
                myChart.dispatchAction({
                    type: 'legendUnSelect',
                    name:"pao-release"
                });
                myChart.dispatchAction({
                    type: 'legendUnSelect',
                    name:"cutline-release"
                });
            }else{
                myChart.dispatchAction({
                    type: 'legendSelect',
                    name:store.getState().role.viewMode === 0 ? "pao-release" : "cutline-release"
                });
                myChart.dispatchAction({
                    type: 'legendUnSelect',
                    name:store.getState().role.viewMode === 0 ? "cutline-release" : "pao-release"
                });
                myChart.dispatchAction({
                    type: 'legendUnSelect',
                    name:"pao-market"
                });
                myChart.dispatchAction({
                    type: 'legendUnSelect',
                    name:"cutline-market"
                });
            };
        });
        emitter.addEventListener('showLines',(code = '')=>{
            try{
                this.ar.instance.forEach((item)=>{
                    this.map.removeOverlay(item);
                });
                this.code = code;
                if(code === ""){return};
                let selected = myChart.getOption().legend["0"].selected,rs = [],curveStyle = { strokeWeight:1, strokeOpacity:1};//strokeColor:"#a5baff"
                if(selected['cutline-market'] || selected['pao-market']){
                    rs = this.rs[0];
                }else if(selected['cutline-release'] || selected['pao-release']){
                    rs = this.rs[2];
                }
                let resList = rs.map((data)=>{
                    return data.mes.iata;
                });
                this.ar.data[code].forEach((data)=>{
                    // TODO 只做错误坐标打印
                    if(data.coords[0][0] == null || data.coords[0][1] == null ||  data.coords[1][0] == null ||  data.coords[1][1] == null){
                        console.log(data);
                    };
                    let from = new BMap.Point(data.coords[0][0],data.coords[0][1]);
                    let to = new BMap.Point(data.coords[1][0],data.coords[1][1]);
                    let curve = new BMapLib.CurveLine([from,to], Object.assign(curveStyle,{"strokeColor":data.type === 0 ? "#a5baff" : "#fdbc22"}));
                    this.ar.instance.push(curve);
                    this.map.addOverlay(curve);
                    let myIcon = new BMap.Icon(round, new BMap.Size(15, 15), {
                        imageSize:new BMap.Size(15, 15),
                    });
                    let labelStyle = {
                        fontSize : "12px",
                        border:"none",
                        color:"#605E7C",
                        backgroundColor:"transprant",
                        textShadow:"1px 1px 1px #ededed"
                    };
                    if(!resList.includes(data.fromMes.iata)){
                        resList.push(data.fromMes.iata);
                        let fromMarker=new BMap.Marker(from,{icon:myIcon});
                        this.map.addOverlay(fromMarker);
                        this.ar.instance.push(fromMarker);
                        let label = new BMap.Label(data.fromName,{position:from});
                        label.setStyle(labelStyle);
                        label.setOffset(new BMap.Size(10, 30));
                        this.map.addOverlay(label);
                        this.ar.instance.push(label);
                    };
                     if(!resList.includes(data.toMes.iata)){
                         resList.push(data.toMes.iata);
                         let toMarker=new BMap.Marker(to,{icon:myIcon});
                         this.map.addOverlay(toMarker);
                         this.ar.instance.push(toMarker);
                         let label = new BMap.Label(data.toName,{position:to});
                         label.setStyle(labelStyle);
                         label.setOffset(new BMap.Size(10, -10));
                         this.map.addOverlay(label);
                         this.ar.instance.push(label);
                    };
                });
            }catch (e) {
                console.log(e);
            }
        });
        emitter.addEventListener("changeHd",function (data) {
            let op;
            switch (data){
                case 0:
                    myChart.dispatchAction({
                        type: 'legendUnSelect',
                        name:'waypoint'
                    });
                    break;
                case 1:
                    myChart.dispatchAction({
                        type: 'legendSelect',
                        name:'waypoint'
                    });
                    op = myChart.getOption();
                    op.series[4].label.normal.show = false;
                    myChart.setOption(op);
                    break;
                case 2:
                    myChart.dispatchAction({
                        type: 'legendSelect',
                        name:'waypoint'
                    });
                    op =myChart.getOption();
                    op.series[4].label.normal.show = true;
                    myChart.setOption(op);
                    break;
            }
        });
        emitter.addEventListener("changeWindow",function () {
            myChart.resize();
        });
        emitter.addEventListener("addLines",({v,t} = {...b})=>{
            let airList = store.getState().airList,pots = [],lines;
            if(v !== null){
                lines = `${v.dpt}=${v.pst}=${v.arrv}`;
            }
            if(t){
                if(!this.lines.hasOwnProperty(lines)){
                    if (v.dpt != null && v.dpt != '') {
                        let jw = airMes(airList, v.dpt);
                        pots.push(new BMap.Point(jw.cityCoordinateJ, jw.cityCoordinateW))
                    }
                    if (v.pst != null && v.pst != '') {
                        let jw = airMes(airList, v.pst);
                        pots.push(new BMap.Point(jw.cityCoordinateJ, jw.cityCoordinateW))
                    }
                    if (v.arrv != null && v.arrv != '') {
                        let jw = airMes(airList, v.arrv);
                        pots.push(new BMap.Point(jw.cityCoordinateJ, jw.cityCoordinateW))
                    }
                    let color = ['#4077fc','#fbc137','#bbdc6e'];
                    let setColor = color[Math.floor(Math.random()*3)];
                    while (this.colorList.includes(setColor)){
                        setColor = color[Math.floor(Math.random()*3)];
                    }
                    let curve = new BMapLib.CurveLine(pots, {strokeColor: setColor, strokeWeight: 3, strokeOpacity: 1}); //创建弧线对象
                    this.map.addOverlay(curve); //添加到地图中
                    this.lines[lines] = {
                        curve,
                        setColor
                    };
                    this.colorList.push(setColor);
                }
            }else{
                if(v === null){
                    for(let i in this.lines){
                        this.map.removeOverlay(this.lines[i].curve);
                        delete this.lines[i];
                    }
                    this.colorList = [];
                }else{
                    try{
                        this.colorList.splice(this.colorList.indexOf(this.lines[lines].setColor),1);
                        this.map.removeOverlay(this.lines[lines].curve);
                        delete this.lines[lines];
                    }catch (e){

                    }

                }
            }
        });


        emitter.addEventListener("againMap",async()=>{
            await this.reData();
            let option = this.initData();
            let ops = myChart.getOption();
            ops.series = option.series;
            ops.legend[0].data = option.legend.data;
            for(let key in option.legend.selected){
                if(ops.legend[0].selected.hasOwnProperty(key)){
                    option.legend.selected[key] = ops.legend[0].selected[key];
                }
            }
            ops.legend[0].selected = option.legend.selected;
            myChart.setOption(ops,true);
            this.map = myChart.getModel().getComponent('bmap').getBMap();
            emitter.emit("showLines",this.code);
        });
        myChart.on('click', (a) => {
            switch(a.data.type){
                case 0:
                    emitter.emit("pushAirport",a.data.mes);
                    emitter.emit("resSearchData",a.data.mes);
                    break;
                case 1:
                    emitter.emit("pushAirport",a.data.mes);
                    emitter.emit("resSearchData",a.data.mes);
                    break;
                case 6:
                    emitter.emit('tipBox',a.data.mes.iata);
                    setTimeout(() => {  // 展开机场信息列表
                        let infMesBox = document.getElementById('inf-mes-box');
                        let caseBox = document.getElementById('root');
                        infMesBox.style.left = `${a.event.offsetX + 30}px`;
                        infMesBox.style.top = `${a.event.offsetY}px`;
                        infMesBox.style.display = 'block';
                        let lf = caseBox.clientWidth - infMesBox.clientWidth - 50;
                        if(a.event.offsetX > lf){
                            infMesBox.style.left = `${lf}px`;
                        };
                        let tp = caseBox.clientHeight - infMesBox.clientHeight - 100;
                        if(a.event.offsetY > tp){
                            infMesBox.style.top = `${tp}px`;
                        };
                    }, 50);
                    break;
            }
        });
        emitter.emit("showLines",store.getState().role.airlineretrievalcondition);
    }
    render(){
        return(
            <div id="maps" className={style['map-box-style']} ref={"maps"}>666</div>
        )
    }
}
