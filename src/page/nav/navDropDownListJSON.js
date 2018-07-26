import {Switch,Route,HashRouter as Router ,Redirect} from 'react-router-dom';
import {store} from './../../store/index';
import {assemblyAction as an} from './../../utils/assemblyAction';

import TimeDistribution from "../timeDistribution/timeDistribution";

const navDropDownListJSON={
    tool:[
        {
            icon:'&#xe671;',
            text:'航线测算',
            type:'Sail',
            href:'##',
            fun:function () {
                window.open(`http://182.150.46.167:9990/hangyu_login?uuid=${store.getState().role.uuid}`)
            }
        },
        // {
        //     icon:'&#xe603;',
        //     text:'机场对比',
        //     type:'Airport',
        //     href:'##'
        // },
        {
            icon:'&#xe6fb;',
            text:'信息查询',
            type:'Information',
            href:'##',
            fun:function () {
                window.location.href = "#/informationQuery";
            }
        },
        {
            icon:'&#xe621;',
            text:'时刻分布',
            type:'Moment',
            href:'##',
            fun:function () {
                window.location.href = "#/timeDistribution";
            }
        }
    ],
    role:[
        {
            text:'航司',
            type:'roleSelect'
        },
        {
            text:'机场',
            type:'roleSelect'
        }
    ],
    user:[
        {
            icon:'&#xe610;',
            text:'个人中心',
            type:'Personal',
            href:'##',
            fun:function () {
                window.location.href = "#/userCenter";
            }
        },
        {
            icon:'&#xe611;',
            text:'设置',
            type:'Set',
            href:'##',
            fun:function () {
                window.location.href = "#/setting/false";
            }
        },
        {
            icon:'&#xe647;',
            text:'退出',
            type:'Quit',
            href:'##',
            fun:function () {
                store.dispatch(an('EMPTYDATA', ''));
                store.dispatch(an('ROLE', null));
                window.location.href = "#"
            }
        }
    ]

}
export default navDropDownListJSON;