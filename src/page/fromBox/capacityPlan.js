import React, { Component } from 'react';
import { store } from './../../store/index';

import style from './../../static/css/from/capacityPlan.scss';


export default class CapacityPlan extends Component {
	constructor(props) {
		super(props);
	}
	computeTime = (dptTime = null, arrvTime = null) => {
		if (dptTime && arrvTime) {
			let dptHours = dptTime.split(':')[0];
			let arrvHours = arrvTime.split(':')[0];
			let range = arrvHours.match(/^\+\d{2}/) ? true : false;//true:跨天,false:不跨天
			return range ? (24 - parseInt(dptHours) + parseInt(arrvHours)) : (parseInt(arrvHours) - parseInt(dptHours));
		} else {
			return '';
		}
	}
	areaTypeStr = (areaType, arrv, arrvNm, ) => {
		let typeStr = '', arrvStr = '';
		switch (Number(areaType)) {
			case 1: typeStr = "航点"; arrvStr = arrvNm; break;
			case 2: typeStr = "省份"; arrvStr = arrv; break;
			case 3: typeStr = "区域"; arrvStr = arrv; break;
			default: typeStr = ''; arrvStr = ''; break;
		}
		return { typeStr, arrvStr };
	}
	render() {
		let { dptTime, arrvTime, areaType, fixedSubsidyPrice, bottomSubsidyPrice, subsidypolicy, days, arrv, arrvNm, price } = this.props.scheme && this.props.scheme.length ? this.props.scheme[0] : {};

		let { typeStr, arrvStr } = this.areaTypeStr(areaType, arrv, arrvNm);

		return (
			<div className={style['capacity-detail']}>
				<div className={style['wireframe']}>
					<div className={style['circle']}>
						{this.computeTime(dptTime, arrvTime)}h
	                </div>
				</div>
				<div className={style['level-or-enter-time']}>
					<div>
						<span>出港时段</span>
						<span>
							{arrvTime && arrvTime.match(/^\+\d{2}/) ? (<span style={{ opacity: 0 }}>+</span>) : ''}
							{dptTime}时段</span>
					</div>
					<div>
						<span>进港时段</span>
						<span>{arrvTime}时段</span>
					</div>
				</div>
				<div className={style['quoted']}>
					<div>
						<span>报价</span>
						<div>
							{subsidypolicy == '0' ? '待议' : ''}
							{fixedSubsidyPrice ? ` 定补 ${fixedSubsidyPrice}万/班` : ''}
							{bottomSubsidyPrice ? ` 保底 ${bottomSubsidyPrice}万/时` : ''}
						</div>
					</div>
					<div>
						<span>意向{typeStr}</span>
						<div>
							<span>{arrvStr}</span>
						</div>
					</div>
				</div>
				<div className={style['schedule']}>
					<div>
						<span>班期:</span>
						<span>{days}</span>
					</div>
				</div>
			</div>
		)
	}
}