// author:wangli time:2018-06-17 content:运力发布表单-目标省份模块
import React, { Component } from "react";
import style from "../../static/css/targetArea/targetArea.scss";

export default class ProvinceSearch extends Component {
    constructor(props) {
        super(props);
        this.state = {
            regType: "",//匹配模式
            newList: [],//显示的下拉列表
            searchText: "",//正则匹配条件
            provinceList: [//省份数据
                { name: "北京市", eName: "bjs", spell: "beijingshi" },
                { name: "天津市", eName: "tjs", spell: "tianjinshi" },
                { name: "河北省", eName: "hbs", spell: "heibeisheng" },
                { name: "山西省", eName: "sxs", spell: "shanxisheng" },
                { name: "内蒙古", eName: "nmg", spell: "neimenggu" },
                { name: "辽宁省", eName: "lns", spell: "liaoningsheng" },
                { name: "吉林省", eName: "jls", spell: "jilinsheng" },
                { name: "黑龙江省", eName: "hljs", spell: "heilongjiangsheng" },
                { name: "上海市", eName: "shs", spell: "shanghaishi" },
                { name: "江苏省", eName: "jss", spell: "jiansusheng" },
                { name: "浙江省", eName: "zjs", spell: "zhejiangsheng" },
                { name: "安徽省", eName: "ahs", spell: "anhuisheng" },
                { name: "福建省", eName: "fjs", spell: "fujiansheng" },
                { name: "江西省", eName: "jxs", spell: "jiangxisheng" },
                { name: "山东省", eName: "sds", spell: "shandongsheng" },
                { name: "河南省", eName: "hns", spell: "henansheng" },
                { name: "湖北省", eName: "hbs", spell: "hubeisheng" },
                { name: "湖南省", eName: "hns", spell: "hunansheng" },
                { name: "广东省", eName: "gds", spell: "guangdongsheng" },
                { name: "广西", eName: "jx", spell: "jiangxi" },
                { name: "海南省", eName: "hns", spell: "hainansheng" },
                { name: "重庆市", eName: "cqs", spell: "chongqingshi" },
                { name: "四川省", eName: "scs", spell: "sichuansheng" },
                { name: "贵州省", eName: "gzs", spell: "guizhousheng" },
                { name: "云南省", eName: "yns", spell: "yunnansheng" },
                { name: "西藏", eName: "xz", spell: "xizang" },
                { name: "陕西省", eName: "sxs", spell: "shanxisheng" },
                { name: "甘肃省", eName: "gss", spell: "gansusheng" },
                { name: "青海省", eName: "qhs", spell: "qinghaisheng" },
                { name: "宁夏", eName: "nxs", spell: "ningxiasheng" },
                { name: "新疆", eName: "xj", spell: "xinjiang" },//以上是省份
            ]
        }
    }

    componentWillReceiveProps(nextProps) {
        let searchText = nextProps.searchText;
        let provinceList = this.state.provinceList;
        let newList = [];
        let regType = this.state.regType;
        if (searchText != "" || searchText != this.state.searchText) {//通过用户输入匹配出付合的省份
            searchText = searchText.toLocaleLowerCase();
            let provinceReg = new RegExp(searchText);
            for (let i = 0; i < provinceList.length; i++) {
                if (provinceReg.test(provinceList[i].name)) {
                    regType = "";
                    newList.push(provinceList[i])
                } else if (provinceReg.test(provinceList[i].eName)) {
                    regType = "eName";
                    newList.push(provinceList[i])
                } else if (provinceReg.test(provinceList[i].spell)) {
                    regType = "spell";
                    newList.push(provinceList[i])
                }
            };
        };
        this.setState({
            newList,
            regType,
            searchText
        })
    }

    componentWillMount() {
        let provinceList = this.state.provinceList;
        let searchText = this.props.searchText;
        let newList = [];
        let regType = this.state.regType;
        if (searchText != "" || searchText != this.state.searchText) {//通过用户输入匹配出付合的省份
            searchText = searchText.toLocaleLowerCase();
            let provinceReg = new RegExp(searchText);
            for (let i = 0; i < provinceList.length; i++) {
                if (provinceReg.test(provinceList[i].name)) {
                    regType = "";
                    newList.push(provinceList[i])
                } else if (provinceReg.test(provinceList[i].eName)) {
                    regType = "eName";
                    newList.push(provinceList[i])
                } else if (provinceReg.test(provinceList[i].spell)) {
                    regType = "spell";
                    newList.push(provinceList[i])
                }
            };
        };
        this.setState({
            newList,
            regType,
            searchText
        })
    }

    //返回父组件选择值
    click(data) {//data:选中的省份
        this.props.returnData(data)
    }

    //模糊匹配方法
    build() {

    }

    render() {
        let newList = this.state.newList;
        let regType = this.state.regType;
        let spellStyle, eNameStyle;
        if (regType == "eName") {
            spellStyle = style['noShow']
        } else if (regType == "spell") {
            eNameStyle = style['noShow']
        } else {
            spellStyle = style['noShow'];
            eNameStyle = style['noShow']
        };
        return (
            <div className="scroll" style={this.props.axis}>
                {
                    newList.map((item, index) => {
                        let styleSpan = "style='color: #3c78ff'";
                        let spell = item.spell.replace(this.state.searchText, "<span " + styleSpan + ">" + this.state.searchText + "</span>");
                        let eName = item.eName.replace(this.state.searchText, "<span " + styleSpan + ">" + this.state.searchText + "</span>");
                        return (
                            <div className={style['indexBox']} key={index} onClick={this.click.bind(this, item.name)}>
                                <div>{item.name}</div>
                                <div className={spellStyle} dangerouslySetInnerHTML={{ __html: spell }}></div>
                                <div className={eNameStyle} dangerouslySetInnerHTML={{ __html: eName }}></div>
                            </div>
                        )
                    })
                }
            </div>
        )
    }
}