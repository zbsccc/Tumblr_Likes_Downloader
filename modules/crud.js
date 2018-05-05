'use strict'
const { db } = require('../config.js');
const { fieldPrefix } = require('../config');

const crud = {
	create: async (table, data) => {
		let sql = `INSERT INTO ${table} SET ?`;
		return new Promise(async (resolve, reject) => {
			await db.query(sql, data, function(err, rows){
				if(rows){
					resolve(rows);
				}
				else{
					reject(err);
				}
			});
		});
	},

	select: async (table, conditions) => {
		let sql = '', Cols = '', Join = '', Where = '', Limit = '', Skip = '', Order = '', val = [];
		const getType = Object.prototype.toString;

		if(conditions){
			// 拼接COLS
			if(conditions.cols){
				// Cols = db.escapeId(conditions.cols);
				let c = conditions.cols;
				if(getType.call(c) == '[object String]'){
					Cols = c;
				}
				else{
					for(let i = 0; i < c.length; i++ ){
						if(getType.call(c[i]) == '[object String]'){
							Cols = Cols + db.escapeId(c[i]) + ', ';
						}
						else if(getType.call(c[i]) == '[object Array]'){
							let ci = c[i];
							Cols = Cols + db.escapeId(ci[0]) + ' AS ' + db.escapeId(ci[1]) + ', ';
						}
					}
					Cols = Cols.substring(0, Cols.length - 2) + ' ';
				}
			}
			else{
				Cols = ' * ';
			}

			// 拼接left join
			if(conditions.leftJoin){
				let LJoin = conditions.leftJoin;
				for(let i=0; i<LJoin.length; i++){
					Join = Join + ' LEFT JOIN ' + db.escapeId(LJoin[i].table) + ' ON ' + db.escapeId(LJoin[i].on[0]) + ' = ' + db.escapeId(LJoin[i].on[1]);
				}
			}
			// 拼接WHERE
			if(conditions.where){
				Where = ' WHERE ';
				for(let i in conditions.where){
					let k = i;
					let v = conditions.where[i];
					if(getType.call(v) == '[object Array]'){
						Where = Where + db.escapeId(k) + ' ' + v[0] + ' ? && ';
						val.push(v[1]);
					}
					else{
						Where = Where + db.escapeId(k) + ' = ? && ';
						val.push(v);
					}
					
				}
			}
			Where = Where.substring(0, (Where.length - 3)); // 去掉最后面的 &&

			// 拼接LIMIT
			if(conditions.limit){
				Limit = ' LIMIT ' + db.escape(conditions.limit);
			}

			// 拼接SKIP
			if(conditions.skip){
				Skip = ' OFFSET ' + db.escape(conditions.skip);
			}

			// 拼接ORDER BY
			if(conditions.order){
				if(typeof(conditions.order) == 'object'){
					let o = conditions.order;
					Order = ' ORDER BY ' + db.escapeId(o[0]) + ' ' + o[1];
				}
				else if(typeof(conditions.order) == 'string'){
					Order = ' ORDER BY ' + db.escapeId(conditions.order);
				}		
			}
		}
		else{
			Cols = ' * ';
		}

		sql = `SELECT ${Cols} FROM ${db.escapeId(table)} ${Join} ${Where} ${Order} ${Limit} ${Skip}`;

		// console.log(sql, val);

		return new Promise((resolve, reject) => {
			db.query(sql, val, function (err, rows) {
				if(rows){
					resolve(rows)
				}
				else{
					reject(err);
				}
			});
		});
	},

	selectSql: async (sql) => {
		return new Promise((resolve, reject) => {
			let a = db.query(sql, function (err, rows) {
				if(rows){
					resolve(rows)
				}
				else{
					reject(err);
				}
			});
			// console.log(a.sql)
		});
	},
	selectSql2: async (sql, val) => {
		return new Promise((resolve, reject) => {
			let a = db.query(sql, val, function (err, rows) {
				if(rows){
					resolve(rows)
				}
				else{
					reject(err);
				}
			});
			// console.log(a.sql)
		});
	},

	transLike: async (data) => {
		let where = '';
		let value = [];
		for(let item in data){
			if(data[item] != null && data[item] != undefined && data[item] != ''){
				where = where + db.escapeId(item) + ' LIKE ? && ';
				value.push(`%${data[item]}%`)
			}			
		}
		where = where.substring(0, where.length - 3);
		return { where ,value };
	},
	update: async (table, data, con) => {
		let sql = 'UPDATE ' + db.escapeId(table) + ' SET ';
		let val = [];
		let where = ' WHERE ';

		for(let i in data){
			sql = sql + db.escapeId(i) + ' = ?, ';
			val.push(data[i]);
		}

		sql = sql.substring(0, sql.length - 2) + ' ';

		for(let i in con){
			where = where + db.escapeId(i) + ' = ? && ';
			val.push(con[i]);
		}
		where = where.substring(0, where.length - 3);

		sql = sql + where;
		// console.log(sql, val)
		return new Promise(async (resolve, reject) => {
			await db.query(sql, val, function(err, rows){
				if(rows){
					resolve(1);
				}
				else{
					reject(err);
				}
			});
		});
	},


	updateSql: async (sql) => {
		return new Promise(async (resolve, reject) => {
			await db.query(sql, function(err, rows){
				if(rows){
					resolve(1);
				}
				else{
					reject(err);
				}
			});
		});
	}
}

const safe = async data => {
	let newData = {};
	for(let item in data){
		let k = (fieldPrefix + item);
		newData[k] = data[item];
	}
	return newData
}

const unsafe = async data => {
	let newData = {};
	for(let item in data){
		let k = item.slice(fieldPrefix.length);
		newData[k] = data[item]
	}
	return newData
}

module.exports = { crud, safe, unsafe };